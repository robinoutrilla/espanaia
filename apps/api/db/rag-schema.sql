/* ────────────────────────────────────────────────────────────────────────────
 * RAG (Retrieval-Augmented Generation) schema extensions for EspañaIA
 *
 * Requires: pgvector extension for embedding storage + similarity search.
 * This schema enables:
 *   1. Semantic search over BOE, BORME, initiatives, signals
 *   2. Question-answering grounded in official Spanish sources
 *   3. Cross-entity discovery (find related politicians/territories by context)
 *   4. Conversational research with traceable citations
 * ──────────────────────────────────────────────────────────────────────────── */

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Document chunks for embedding ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,         -- 'articles', 'official_bulletin_items', 'parliamentary_initiatives', etc.
  source_record_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  token_count INTEGER,
  embedding vector(1536),             -- OpenAI ada-002 or compatible dimension
  metadata JSONB DEFAULT '{}',        -- territory_slugs, party_slugs, fiscal_year, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_source ON document_chunks(source_table, source_record_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Conversation sessions ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rag_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  locale TEXT DEFAULT 'es-ES',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Conversation turns ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rag_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES rag_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',       -- Array of { chunk_id, source_url, excerpt }
  model_id TEXT,
  token_count_prompt INTEGER,
  token_count_completion INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_turns_session ON rag_turns(session_id, created_at);

-- ── Saved research queries ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  query_text TEXT NOT NULL,
  filters JSONB DEFAULT '{}',         -- { territories: [], parties: [], date_range: {} }
  result_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Feedback on RAG results (for quality improvement) ────────────────────

CREATE TABLE IF NOT EXISTS rag_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id UUID NOT NULL REFERENCES rag_turns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
