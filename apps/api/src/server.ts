import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  fetchAuxiliaryDataset,
  fetchBoeSummary,
  fetchBormeSummary,
  fetchCongressOpenDataSnapshot,
  fetchSenateOpenDataSnapshot,
} from "@espanaia/official-connectors";
import type { AuxiliaryDatasetId, PoliticalCensusSnapshot } from "@espanaia/shared-types";
import {
  boeItems,
  budgetSnapshots,
  getBoeItemsForParty,
  getBoeItemsForTerritory,
  getBudgetByTerritory,
  getBudgetSummary,
  getInitiativesForParty,
  getInitiativesForPolitician,
  getInitiativesForTerritory,
  getPartyBySlug,
  getPartyPoliticians,
  getPoliticianBySlug,
  getSignalsForParty,
  getSignalsForPolitician,
  getTerritoryBySlug,
  getTerritoryParties,
  getTerritoryPoliticians,
  getTerritoryTimeline,
  officialConnectors,
  parliamentaryInitiatives,
  parties,
  politicians,
  searchEntities,
  seedGeneratedAt,
  territories,
} from "@espanaia/seed-data";
import { buildPoliticalCensusSnapshot } from "./lib/political-census.js";
import { listSnapshots, readLatestSnapshot, writeSnapshot } from "./lib/storage.js";
import { pool, initSchema, getTableCount, getIngestionSummary } from "./lib/db.js";
import {
  ingestBoe,
  ingestBorme,
  ingestCongressDeputies,
  ingestCongressInitiatives,
  ingestSenateMembersSnapshot,
  ingestEurostat,
  ingestEUMEPs,
  ingestGobierno,
  ingestDatosGob,
  ingestCNMC,
  ingestTC,
  ingestAEAT,
  ingestBdE,
  ingestSEPE,
  ingestAll,
  ingestCongresoIntervenciones,
  ingestSenadoDiarios,
  ingestTransparencia,
  ingestAIReF,
  ingestCDTI,
  ingestSegSocial,
  ingestElecciones,
} from "./lib/ingest.js";
import { startScheduler, getSchedulerStatus } from "./lib/scheduler.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

const auxiliaryDatasets: AuxiliaryDatasetId[] = [
  "materias",
  "ambitos",
  "estados-consolidacion",
  "departamentos",
  "rangos",
  "relaciones-anteriores",
  "relaciones-posteriores",
];

function todayAsOfficialDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");
}

function snapshotTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function resolvePoliticalCensusSnapshot(refresh = false) {
  if (!refresh) {
    const latestSnapshot = await readLatestSnapshot<PoliticalCensusSnapshot>("political-census");

    if (latestSnapshot?.payload) {
      return {
        snapshot: latestSnapshot.payload,
        storedAt: latestSnapshot.filePath,
      };
    }
  }

  const snapshot = await buildPoliticalCensusSnapshot();
  const storedAt = await writeSnapshot(
    "political-census",
    `political-census-${snapshotTimestamp()}.json`,
    snapshot,
  );

  return {
    snapshot,
    storedAt,
  };
}

app.get("/health", async () => ({
  status: "ok",
  generatedAt: seedGeneratedAt,
  connectors: officialConnectors.length,
}));

app.get("/v1/search", async (request) => {
  const query = (request.query as { q?: string } | undefined)?.q ?? "";

  return {
    generatedAt: seedGeneratedAt,
    query,
    results: searchEntities(query),
  };
});

app.get("/v1/connectors", async () => ({
  generatedAt: seedGeneratedAt,
  items: officialConnectors,
}));

app.get("/v1/territories", async () => ({
  generatedAt: seedGeneratedAt,
  total: territories.length,
  items: territories,
}));

app.get("/v1/territories/:slug", async (request, reply) => {
  const slug = (request.params as { slug: string }).slug;
  const territory = getTerritoryBySlug(slug);

  if (!territory) {
    return reply.code(404).send({ message: `Territory ${slug} not found.` });
  }

  return {
    generatedAt: seedGeneratedAt,
    territory,
    timeline: getTerritoryTimeline(slug),
    parties: getTerritoryParties(slug),
    politicians: getTerritoryPoliticians(slug),
    budget: getBudgetByTerritory(slug),
    boeItems: getBoeItemsForTerritory(slug),
    initiatives: getInitiativesForTerritory(slug),
  };
});

app.get("/v1/territories/:slug/timeline", async (request, reply) => {
  const slug = (request.params as { slug: string }).slug;
  const territory = getTerritoryBySlug(slug);

  if (!territory) {
    return reply.code(404).send({ message: `Territory ${slug} not found.` });
  }

  return {
    generatedAt: seedGeneratedAt,
    territory: slug,
    items: getTerritoryTimeline(slug),
  };
});

app.get("/v1/parties", async () => ({
  generatedAt: seedGeneratedAt,
  total: parties.length,
  items: parties,
}));

app.get("/v1/parties/:slug", async (request, reply) => {
  const slug = (request.params as { slug: string }).slug;
  const party = getPartyBySlug(slug);

  if (!party) {
    return reply.code(404).send({ message: `Party ${slug} not found.` });
  }

  return {
    generatedAt: seedGeneratedAt,
    party,
    politicians: getPartyPoliticians(slug),
    signals: getSignalsForParty(slug),
    boeItems: getBoeItemsForParty(slug),
    initiatives: getInitiativesForParty(slug),
  };
});

app.get("/v1/politicians", async () => ({
  generatedAt: seedGeneratedAt,
  total: politicians.length,
  items: politicians,
}));

app.get("/v1/politicians/:slug", async (request, reply) => {
  const slug = (request.params as { slug: string }).slug;
  const politician = getPoliticianBySlug(slug);

  if (!politician) {
    return reply.code(404).send({ message: `Politician ${slug} not found.` });
  }

  return {
    generatedAt: seedGeneratedAt,
    politician,
    party: getPartyBySlug(politician.currentPartySlug),
    territory: getTerritoryBySlug(politician.territorySlug),
    signals: getSignalsForPolitician(slug),
    initiatives: getInitiativesForPolitician(slug),
  };
});

app.get("/v1/political-census", async (request) => {
  const refresh = ["1", "true", "yes"].includes(
    ((request.query as { refresh?: string } | undefined)?.refresh ?? "").toLowerCase(),
  );
  const { snapshot, storedAt } = await resolvePoliticalCensusSnapshot(refresh);

  return {
    ...snapshot,
    storedAt,
  };
});

app.get("/v1/political-census/layers", async (request) => {
  const refresh = ["1", "true", "yes"].includes(
    ((request.query as { refresh?: string } | undefined)?.refresh ?? "").toLowerCase(),
  );
  const { snapshot, storedAt } = await resolvePoliticalCensusSnapshot(refresh);

  return {
    generatedAt: snapshot.generatedAt,
    storedAt,
    total: snapshot.layers.length,
    items: snapshot.layers,
  };
});

app.get("/v1/political-census/:slug", async (request, reply) => {
  const slug = (request.params as { slug: string }).slug;
  const { snapshot, storedAt } = await resolvePoliticalCensusSnapshot(false);
  const profile = snapshot.items.find((item) => item.slug === slug);

  if (!profile) {
    return reply.code(404).send({ message: `Political profile ${slug} not found.` });
  }

  return {
    generatedAt: snapshot.generatedAt,
    storedAt,
    profile,
    layers: snapshot.layers,
  };
});

app.get("/v1/boe/latest", async () => ({
  generatedAt: seedGeneratedAt,
  total: boeItems.length,
  items: boeItems,
}));

app.get("/v1/borme/sumario/:date", async (request) => {
  const date = (request.params as { date: string }).date;
  return fetchBormeSummary(date);
});

app.get("/v1/datos-auxiliares/:dataset", async (request, reply) => {
  const dataset = (request.params as { dataset: string }).dataset as AuxiliaryDatasetId;

  if (!auxiliaryDatasets.includes(dataset)) {
    return reply.code(404).send({ message: `Auxiliary dataset ${dataset} not supported.` });
  }

  return fetchAuxiliaryDataset(dataset);
});

app.get("/v1/budgets/summary", async () => ({
  generatedAt: seedGeneratedAt,
  summary: getBudgetSummary(),
  items: budgetSnapshots,
}));

app.get("/v1/parliamentary-initiatives", async () => ({
  generatedAt: seedGeneratedAt,
  total: parliamentaryInitiatives.length,
  items: parliamentaryInitiatives,
}));

app.get("/v1/ingest/snapshots", async () => ({
  generatedAt: seedGeneratedAt,
  items: await listSnapshots(),
}));

/* ── DB-backed ingestion routes ── */

app.post("/v1/ingest/boe/run", async (request) => {
  const requestedDate = (request.body as { date?: string } | undefined)?.date ?? todayAsOfficialDate();
  const result = await ingestBoe(requestedDate);
  return { status: "ok", connector: "boe", date: requestedDate, ...result };
});

app.post("/v1/ingest/borme/run", async (request) => {
  const requestedDate = (request.body as { date?: string } | undefined)?.date ?? todayAsOfficialDate();
  const result = await ingestBorme(requestedDate);
  return { status: "ok", connector: "borme", date: requestedDate, ...result };
});

app.post("/v1/ingest/congreso/run", async () => {
  const deputies = await ingestCongressDeputies();
  const initiatives = await ingestCongressInitiatives();
  return { status: "ok", connector: "congreso", deputies, initiatives };
});

app.post("/v1/ingest/senado/run", async () => {
  const result = await ingestSenateMembersSnapshot();
  return { status: "ok", connector: "senado", ...result };
});

app.post("/v1/ingest/eurostat/run", async () => {
  const result = await ingestEurostat();
  return { status: "ok", connector: "eurostat", ...result };
});

app.post("/v1/ingest/europarlamento/run", async () => {
  const result = await ingestEUMEPs();
  return { status: "ok", connector: "europarlamento", ...result };
});

app.post("/v1/ingest/gobierno/run", async () => {
  const result = await ingestGobierno();
  return { status: "ok", connector: "gobierno", ...result };
});

app.post("/v1/ingest/datos-gob/run", async () => {
  const result = await ingestDatosGob();
  return { status: "ok", connector: "datos-gob", ...result };
});

app.post("/v1/ingest/cnmc/run", async () => {
  const result = await ingestCNMC();
  return { status: "ok", connector: "cnmc", ...result };
});

app.post("/v1/ingest/tc/run", async () => {
  const result = await ingestTC();
  return { status: "ok", connector: "tc", ...result };
});

app.post("/v1/ingest/aeat/run", async () => {
  const result = await ingestAEAT();
  return { status: "ok", connector: "aeat", ...result };
});

app.post("/v1/ingest/bde/run", async () => {
  const result = await ingestBdE();
  return { status: "ok", connector: "bde", ...result };
});

app.post("/v1/ingest/sepe/run", async () => {
  const result = await ingestSEPE();
  return { status: "ok", connector: "sepe", ...result };
});

app.post("/v1/ingest/airef/run", async () => {
  const result = await ingestAIReF();
  return { status: "ok", connector: "airef", ...result };
});

app.post("/v1/ingest/cdti/run", async () => {
  const result = await ingestCDTI();
  return { status: "ok", connector: "cdti", ...result };
});

app.post("/v1/ingest/seg-social/run", async () => {
  const result = await ingestSegSocial();
  return { status: "ok", connector: "seg-social", ...result };
});

app.post("/v1/ingest/transparencia/run", async () => {
  const result = await ingestTransparencia();
  return { status: "ok", connector: "transparencia", ...result };
});

app.post("/v1/ingest/congreso-intervenciones/run", async () => {
  const result = await ingestCongresoIntervenciones();
  return { status: "ok", connector: "congreso-intervenciones", ...result };
});

app.post("/v1/ingest/senado-diarios/run", async () => {
  const result = await ingestSenadoDiarios();
  return { status: "ok", connector: "senado-diarios", ...result };
});

app.post("/v1/ingest/elecciones/run", async () => {
  const result = await ingestElecciones();
  return { status: "ok", connector: "elecciones", ...result };
});

app.post("/v1/ingest/all/run", async (request) => {
  const requestedDate = (request.body as { date?: string } | undefined)?.date ?? todayAsOfficialDate();
  const results = await ingestAll(requestedDate);
  return { status: "ok", results };
});

app.post("/v1/ingest/political-census/run", async () => {
  const { snapshot, storedAt } = await resolvePoliticalCensusSnapshot(true);
  return { ...snapshot, storedAt };
});

/* ── DB query routes — real data ── */

app.get("/v1/db/boe", async (request) => {
  const limit = Number((request.query as { limit?: string })?.limit ?? "50");
  const result = await pool.query(
    `SELECT * FROM boe_items ORDER BY publication_date DESC, ingested_at DESC LIMIT $1`,
    [limit],
  );
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/congress/deputies", async () => {
  const result = await pool.query(`SELECT * FROM congress_deputies ORDER BY full_name`);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/congress/initiatives", async (request) => {
  const limit = Number((request.query as { limit?: string })?.limit ?? "50");
  const result = await pool.query(
    `SELECT * FROM congress_initiatives ORDER BY filed_at DESC NULLS LAST LIMIT $1`,
    [limit],
  );
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/senate/members", async () => {
  const result = await pool.query(`SELECT * FROM senate_members ORDER BY seat_number`);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/eurostat", async () => {
  const result = await pool.query(
    `SELECT * FROM eurostat_indicators ORDER BY indicator, time_period DESC`,
  );
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/airef", async (request) => {
  const limit = Number((request.query as { limit?: string })?.limit ?? "50");
  const result = await pool.query(`SELECT * FROM airef_publications ORDER BY date DESC NULLS LAST LIMIT $1`, [limit]);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/cdti", async () => {
  const result = await pool.query(`SELECT * FROM cdti_programs ORDER BY name`);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/seg-social", async () => {
  const result = await pool.query(`SELECT * FROM seg_social_sections ORDER BY code`);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/transparencia", async (request) => {
  const limit = Number((request.query as { limit?: string })?.limit ?? "50");
  const tipo = (request.query as { tipo?: string })?.tipo;
  const where = tipo ? `WHERE tipo = '${tipo === "denegacion" ? "denegacion" : "estimacion"}'` : "";
  const result = await pool.query(
    `SELECT * FROM transparencia_resoluciones ${where} ORDER BY fecha DESC NULLS LAST LIMIT $1`,
    [limit],
  );
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/congreso/intervenciones", async (request) => {
  const limit = Number((request.query as { limit?: string })?.limit ?? "50");
  const result = await pool.query(
    `SELECT * FROM congreso_intervenciones ORDER BY fecha DESC, ingested_at DESC LIMIT $1`,
    [limit],
  );
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/senado/diarios", async () => {
  const result = await pool.query(`SELECT * FROM senado_diarios ORDER BY numero DESC`);
  return { total: result.rowCount, items: result.rows };
});

app.get("/v1/db/elecciones", async (request) => {
  const eleccion = (request.query as { eleccion?: string })?.eleccion;
  const where = eleccion ? `WHERE eleccion = $1` : "";
  const params = eleccion ? [eleccion] : [];
  const [metaRes, resRes] = await Promise.all([
    pool.query(`SELECT * FROM elecciones_meta ${where} ORDER BY fecha DESC`, params),
    pool.query(`SELECT * FROM elecciones_resultados ${where} ORDER BY fecha DESC, escanos DESC`, params),
  ]);
  return { meta: { total: metaRes.rowCount, items: metaRes.rows }, resultados: { total: resRes.rowCount, items: resRes.rows } };
});

/* ── Ingestion status dashboard ── */

app.get("/v1/ingest/status", async () => {
  const [boe, borme, deputies, initiatives, senate, eurostat, euMeps, gobierno, datosGob, cnmc, tc, aeat, bde, sepe, airef, cdti, segSocial, transparencia, congresoInterv, senadoDiarios, eleccionesMeta, eleccionesRes, summary] = await Promise.all([
    getTableCount("boe_items"),
    getTableCount("borme_items"),
    getTableCount("congress_deputies"),
    getTableCount("congress_initiatives"),
    getTableCount("senate_members"),
    getTableCount("eurostat_indicators"),
    getTableCount("eu_meps"),
    getTableCount("gobierno_members"),
    getTableCount("datos_gob_datasets"),
    getTableCount("cnmc_resoluciones"),
    getTableCount("tc_resoluciones"),
    getTableCount("aeat_datasets"),
    getTableCount("bde_series"),
    getTableCount("sepe_datasets"),
    getTableCount("airef_publications"),
    getTableCount("cdti_programs"),
    getTableCount("seg_social_sections"),
    getTableCount("transparencia_resoluciones"),
    getTableCount("congreso_intervenciones"),
    getTableCount("senado_diarios"),
    getTableCount("elecciones_meta"),
    getTableCount("elecciones_resultados"),
    getIngestionSummary(),
  ]);

  return {
    tables: { boe, borme, deputies, initiatives, senate, eurostat, euMeps, gobierno, datosGob, cnmc, tc, aeat, bde, sepe, airef, cdti, segSocial, transparencia, congresoInterv, senadoDiarios, eleccionesMeta, eleccionesRes },
    totalDocuments: boe + borme + deputies + initiatives + senate + eurostat + euMeps + gobierno + datosGob + cnmc + tc + aeat + bde + sepe + airef + cdti + segSocial + transparencia + congresoInterv + senadoDiarios + eleccionesMeta + eleccionesRes,
    runs: summary,
    scheduler: getSchedulerStatus(),
  };
});

/* ── Startup ── */

const port = Number(process.env.PORT ?? 4000);

// Initialize DB schema, then start server + scheduler
let dbAvailable = false;
try {
  await initSchema();
  dbAvailable = true;
  console.log("[startup] Database schema ready");
} catch (err) {
  console.warn("[startup] Database not available — running in seed-only mode:", (err as Error).message);
  console.warn("[startup] Set DATABASE_URL to enable persistence. Using seed data only.");
}

app.listen({ port, host: "0.0.0.0" }).then(() => {
  if (dbAvailable) {
    startScheduler();
  } else {
    console.log("[startup] Scheduler skipped (no database)");
  }
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
