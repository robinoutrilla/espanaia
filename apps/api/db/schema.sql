CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  short_code TEXT NOT NULL,
  seat TEXT,
  strategic_focus TEXT,
  source_of_truth_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  official_website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  slug TEXT UNIQUE NOT NULL,
  official_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  acronym TEXT,
  scope_type TEXT NOT NULL,
  ideology TEXT,
  official_website TEXT,
  registry_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS politicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  current_party_id UUID REFERENCES parties(id),
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  birth_date DATE,
  constituency TEXT,
  current_role_summary TEXT,
  parliamentary_group TEXT,
  source_of_truth_url TEXT,
  confidence_score NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS politician_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS office_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  role_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS politician_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  office_role_id UUID NOT NULL REFERENCES office_roles(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  format TEXT,
  discovery_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  external_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  published_at TIMESTAMPTZ,
  canonical_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  raw_text_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS official_bulletin_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  external_id TEXT UNIQUE,
  publication_date DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  document_url TEXT NOT NULL,
  html_url TEXT,
  xml_url TEXT,
  category TEXT,
  ministry_or_body TEXT,
  impact_score NUMERIC(5,2),
  raw_text_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  source_id UUID REFERENCES sources(id),
  fiscal_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  document_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_document_id UUID NOT NULL REFERENCES budget_documents(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES territories(id),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  program TEXT,
  section TEXT,
  amount_initial NUMERIC(16,2),
  amount_modified NUMERIC(16,2),
  amount_committed NUMERIC(16,2),
  amount_obligated NUMERIC(16,2),
  amount_paid NUMERIC(16,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parliamentary_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  external_id TEXT UNIQUE,
  dossier_number TEXT NOT NULL,
  legislature TEXT,
  initiative_type TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  commission TEXT,
  status TEXT,
  result TEXT,
  source_url TEXT,
  filed_at DATE,
  qualification_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entity_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  source_table TEXT NOT NULL,
  source_record_id UUID NOT NULL,
  mention_role TEXT,
  confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES territories(id),
  party_id UUID REFERENCES parties(id),
  politician_id UUID REFERENCES politicians(id),
  topic TEXT,
  alert_type TEXT NOT NULL,
  threshold NUMERIC(8,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  locale TEXT DEFAULT 'es-ES',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES territories(id),
  party_id UUID REFERENCES parties(id),
  politician_id UUID REFERENCES politicians(id),
  topic TEXT,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  connector_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  item_count INTEGER,
  error_message TEXT,
  snapshot_path TEXT
);

CREATE TABLE IF NOT EXISTS crawl_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  endpoint_id UUID REFERENCES source_endpoints(id),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  storage_ref TEXT NOT NULL,
  checksum TEXT,
  content_type TEXT,
  http_status INTEGER
);

CREATE INDEX IF NOT EXISTS idx_parties_territory_id ON parties(territory_id);
CREATE INDEX IF NOT EXISTS idx_politicians_territory_id ON politicians(territory_id);
CREATE INDEX IF NOT EXISTS idx_politicians_current_party_id ON politicians(current_party_id);
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_bulletin_publication_date ON official_bulletin_items(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget_document_id ON budget_lines(budget_document_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON parliamentary_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_entity_mentions_lookup ON entity_mentions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_connector_id ON ingestion_jobs(connector_id, requested_at DESC);
