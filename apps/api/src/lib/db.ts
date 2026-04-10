/* ═══════════════════════════════════════════════════════════════════════════
   PostgreSQL connection pool + schema initialization.
   Uses the `pg` driver (already a dependency).
   ═══════════════════════════════════════════════════════════════════════════ */

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/espanaia",
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

export { pool };

/* ── Schema ────────────────────────────────────────────────────────────── */

const SCHEMA_SQL = `
-- Ingestion runs — one row per connector execution
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id              SERIAL PRIMARY KEY,
  connector_id    TEXT NOT NULL,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_url      TEXT,
  record_count    INTEGER NOT NULL DEFAULT 0,
  duration_ms     INTEGER,
  status          TEXT NOT NULL DEFAULT 'ok',
  error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_connector ON ingestion_runs(connector_id);
CREATE INDEX IF NOT EXISTS idx_runs_requested ON ingestion_runs(requested_at DESC);

-- BOE items
CREATE TABLE IF NOT EXISTS boe_items (
  id                TEXT PRIMARY KEY,
  run_id            INTEGER REFERENCES ingestion_runs(id),
  publication_date  TEXT NOT NULL,
  gazette_number    TEXT,
  section_code      TEXT,
  section_name      TEXT,
  department_name   TEXT,
  epigraph_name     TEXT,
  title             TEXT NOT NULL,
  html_url          TEXT,
  pdf_url           TEXT,
  xml_url           TEXT,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boe_date ON boe_items(publication_date);
CREATE INDEX IF NOT EXISTS idx_boe_section ON boe_items(section_code);

-- BORME items
CREATE TABLE IF NOT EXISTS borme_items (
  id                TEXT PRIMARY KEY,
  run_id            INTEGER REFERENCES ingestion_runs(id),
  publication_date  TEXT NOT NULL,
  section_code      TEXT,
  section_name      TEXT,
  department_name   TEXT,
  title             TEXT NOT NULL,
  pdf_url           TEXT,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_borme_date ON borme_items(publication_date);

-- Congress deputies
CREATE TABLE IF NOT EXISTS congress_deputies (
  slug                TEXT PRIMARY KEY,
  run_id              INTEGER REFERENCES ingestion_runs(id),
  full_name           TEXT NOT NULL,
  constituency        TEXT,
  electoral_formation TEXT,
  parliamentary_group TEXT,
  sworn_at            TEXT,
  started_at          TEXT,
  biography           TEXT,
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Congress initiatives
CREATE TABLE IF NOT EXISTS congress_initiatives (
  id                  TEXT PRIMARY KEY,
  run_id              INTEGER REFERENCES ingestion_runs(id),
  legislature         TEXT,
  initiative_type     TEXT,
  dossier_number      TEXT,
  object              TEXT NOT NULL,
  author              TEXT,
  status              TEXT,
  result              TEXT,
  commission          TEXT,
  qualification_date  TEXT,
  filed_at            TEXT,
  publications        TEXT[],
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Senate members
CREATE TABLE IF NOT EXISTS senate_members (
  slug                    TEXT PRIMARY KEY,
  run_id                  INTEGER REFERENCES ingestion_runs(id),
  seat_number             INTEGER,
  legislature             TEXT,
  full_name               TEXT NOT NULL,
  short_name              TEXT,
  first_names             TEXT,
  last_names              TEXT,
  political_party_code    TEXT,
  political_party_name    TEXT,
  parliamentary_group     TEXT,
  parliamentary_group_code TEXT,
  source_type             TEXT,
  representation_label    TEXT,
  constituency            TEXT,
  community               TEXT,
  appointed_at            TEXT,
  gender                  TEXT,
  profile_url             TEXT,
  ingested_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eurostat indicators
CREATE TABLE IF NOT EXISTS eurostat_indicators (
  id              SERIAL PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  indicator       TEXT NOT NULL,
  indicator_label TEXT,
  time_period     TEXT NOT NULL,
  value           DOUBLE PRECISION,
  unit            TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(indicator, time_period)
);

CREATE INDEX IF NOT EXISTS idx_eurostat_indicator ON eurostat_indicators(indicator);

-- EU Parliament MEPs
CREATE TABLE IF NOT EXISTS eu_meps (
  slug            TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  ep_id           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  family_name     TEXT,
  given_name      TEXT,
  country         TEXT DEFAULT 'ES',
  political_group TEXT,
  national_party  TEXT,
  profile_url     TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gobierno de España
CREATE TABLE IF NOT EXISTS gobierno_members (
  slug            TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  ministry        TEXT,
  image_url       TEXT,
  profile_url     TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- datos.gob.es catalog
CREATE TABLE IF NOT EXISTS datos_gob_datasets (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  title           TEXT NOT NULL,
  description     TEXT,
  publisher       TEXT,
  theme           TEXT[],
  frequency       TEXT,
  modified        TEXT,
  url             TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TC resoluciones
CREATE TABLE IF NOT EXISTS tc_resoluciones (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  tipo            TEXT,
  numero          TEXT,
  fecha           TEXT,
  resumen         TEXT,
  url             TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CNMC resoluciones
CREATE TABLE IF NOT EXISTS cnmc_resoluciones (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  title           TEXT NOT NULL,
  expediente      TEXT,
  date            TEXT,
  sector          TEXT,
  url             TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AEAT datasets
CREATE TABLE IF NOT EXISTS aeat_datasets (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  title           TEXT NOT NULL,
  description     TEXT,
  modified        TEXT,
  url             TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BdE series
CREATE TABLE IF NOT EXISTS bde_series (
  id              SERIAL PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  serie_id        TEXT NOT NULL,
  label           TEXT,
  frequency       TEXT,
  unit            TEXT,
  period          TEXT NOT NULL,
  value           DOUBLE PRECISION,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(serie_id, period)
);

-- SEPE datasets
CREATE TABLE IF NOT EXISTS sepe_datasets (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  title           TEXT NOT NULL,
  description     TEXT,
  modified        TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AIReF publications (informes, opiniones, estudios)
CREATE TABLE IF NOT EXISTS airef_publications (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  title           TEXT NOT NULL,
  date            TEXT,
  link            TEXT,
  description     TEXT,
  categories      TEXT[],
  creator         TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_airef_date ON airef_publications(date);

-- CDTI programs
CREATE TABLE IF NOT EXISTS cdti_programs (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  name            TEXT NOT NULL,
  category        TEXT,
  description     TEXT,
  url             TEXT,
  status          TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seguridad Social statistics sections
CREATE TABLE IF NOT EXISTS seg_social_sections (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT,
  description     TEXT,
  url             TEXT,
  sub_section_count INTEGER DEFAULT 0,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transparencia — resoluciones de derecho de acceso (FOI)
CREATE TABLE IF NOT EXISTS transparencia_resoluciones (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  tipo            TEXT NOT NULL,
  ministerio      TEXT NOT NULL,
  asunto          TEXT NOT NULL,
  fecha           TEXT,
  referencia      TEXT,
  causas_denegacion TEXT[],
  resultado       TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transp_tipo ON transparencia_resoluciones(tipo);
CREATE INDEX IF NOT EXISTS idx_transp_fecha ON transparencia_resoluciones(fecha);

-- Congreso intervenciones (Diario de Sesiones + Congreso TV videos)
CREATE TABLE IF NOT EXISTS congreso_intervenciones (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  fecha           TEXT NOT NULL,
  legislatura     TEXT,
  orador          TEXT NOT NULL,
  cargo_orador    TEXT,
  sesion_nombre   TEXT,
  sesion_numero   TEXT,
  fase            TEXT,
  organo          TEXT,
  objeto_iniciativa TEXT,
  diario_pdf_url  TEXT,
  diario_pagina   TEXT,
  video_descarga_url TEXT,
  video_emision_url  TEXT,
  video_inicio    TEXT,
  video_fin       TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_congreso_interv_fecha ON congreso_intervenciones(fecha);
CREATE INDEX IF NOT EXISTS idx_congreso_interv_orador ON congreso_intervenciones(orador);

-- Senado Diarios de Sesiones
CREATE TABLE IF NOT EXISTS senado_diarios (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  legislatura     TEXT NOT NULL,
  numero          INTEGER NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'pleno',
  pdf_url         TEXT NOT NULL,
  size_bytes      INTEGER,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_senado_diarios_leg ON senado_diarios(legislatura);

-- Elecciones — election metadata (one row per election)
CREATE TABLE IF NOT EXISTS elecciones_meta (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  eleccion        TEXT NOT NULL,
  fecha           TEXT NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'congreso',
  censo           INTEGER,
  votantes        INTEGER,
  participacion   DOUBLE PRECISION,
  votos_validos   INTEGER,
  votos_nulos     INTEGER,
  votos_blanco    INTEGER,
  escanos_totales INTEGER,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_elecciones_meta_fecha ON elecciones_meta(fecha);

-- Elecciones — party results per election
CREATE TABLE IF NOT EXISTS elecciones_resultados (
  id              TEXT PRIMARY KEY,
  run_id          INTEGER REFERENCES ingestion_runs(id),
  eleccion        TEXT NOT NULL,
  fecha           TEXT NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'congreso',
  partido         TEXT NOT NULL,
  siglas          TEXT NOT NULL,
  votos           INTEGER,
  porcentaje      DOUBLE PRECISION,
  escanos         INTEGER,
  candidato_cabeza TEXT,
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_elecciones_res_fecha ON elecciones_resultados(fecha);
CREATE INDEX IF NOT EXISTS idx_elecciones_res_siglas ON elecciones_resultados(siglas);

-- Ingestion stats view (for the dashboard)
CREATE OR REPLACE VIEW ingestion_summary AS
SELECT
  connector_id,
  COUNT(*) AS total_runs,
  MAX(requested_at) AS last_run,
  SUM(record_count) AS total_records,
  AVG(duration_ms)::INTEGER AS avg_duration_ms
FROM ingestion_runs
WHERE status = 'ok'
GROUP BY connector_id;
`;

export async function initSchema() {
  try {
    await pool.query(SCHEMA_SQL);
    console.log("[db] Schema initialized successfully");
  } catch (err) {
    console.error("[db] Schema init failed:", (err as Error).message);
    throw err;
  }
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

export async function getTableCount(table: string): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*)::INTEGER AS count FROM ${table}`);
  return result.rows[0]?.count ?? 0;
}

export async function getLastIngestion(connectorId: string) {
  const result = await pool.query(
    `SELECT requested_at, record_count, duration_ms FROM ingestion_runs
     WHERE connector_id = $1 AND status = 'ok'
     ORDER BY requested_at DESC LIMIT 1`,
    [connectorId],
  );
  return result.rows[0] ?? null;
}

export async function getIngestionSummary() {
  const result = await pool.query(`SELECT * FROM ingestion_summary ORDER BY connector_id`);
  return result.rows;
}
