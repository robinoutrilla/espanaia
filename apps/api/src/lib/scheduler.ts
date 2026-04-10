/* ═══════════════════════════════════════════════════════════════════════════
   Lightweight cron scheduler using setInterval (no extra dependency).
   Runs ingestion jobs at configured intervals.
   ═══════════════════════════════════════════════════════════════════════════ */

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
  ingestCongresoIntervenciones,
  ingestSenadoDiarios,
  ingestTransparencia,
  ingestAIReF,
  ingestCDTI,
  ingestSegSocial,
  ingestElecciones,
} from "./ingest.js";

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

interface ScheduledJob {
  name: string;
  intervalMs: number;
  fn: () => Promise<unknown>;
  timer?: ReturnType<typeof setInterval>;
  lastRun?: string;
  lastResult?: string;
}

const ONE_HOUR = 60 * 60 * 1000;

const jobs: ScheduledJob[] = [
  {
    name: "boe-daily",
    intervalMs: 24 * ONE_HOUR,
    fn: () => ingestBoe(todayAsOfficialDate()),
  },
  {
    name: "borme-daily",
    intervalMs: 24 * ONE_HOUR,
    fn: () => ingestBorme(todayAsOfficialDate()),
  },
  {
    name: "congreso-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: async () => {
      await ingestCongressDeputies();
      await ingestCongressInitiatives();
    },
  },
  {
    name: "senado-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestSenateMembersSnapshot(),
  },
  {
    name: "eurostat-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestEurostat(),
  },
  {
    name: "europarlamento-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestEUMEPs(),
  },
  {
    name: "gobierno-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestGobierno(),
  },
  {
    name: "datos-gob-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestDatosGob(),
  },
  {
    name: "cnmc-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestCNMC(),
  },
  {
    name: "tc-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestTC(),
  },
  {
    name: "aeat-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestAEAT(),
  },
  {
    name: "bde-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestBdE(),
  },
  {
    name: "sepe-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestSEPE(),
  },
  {
    name: "airef-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestAIReF(),
  },
  {
    name: "cdti-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestCDTI(),
  },
  {
    name: "seg-social-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestSegSocial(),
  },
  {
    name: "transparencia-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestTransparencia(),
  },
  {
    name: "congreso-intervenciones-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestCongresoIntervenciones(),
  },
  {
    name: "senado-diarios-weekly",
    intervalMs: 7 * 24 * ONE_HOUR,
    fn: () => ingestSenadoDiarios(),
  },
  {
    name: "elecciones-monthly",
    intervalMs: 30 * 24 * ONE_HOUR,
    fn: () => ingestElecciones(),
  },
];

async function runJob(job: ScheduledJob) {
  console.log(`[scheduler] Starting job: ${job.name}`);
  const start = Date.now();

  try {
    await job.fn();
    const elapsed = Date.now() - start;
    job.lastRun = new Date().toISOString();
    job.lastResult = `ok (${elapsed}ms)`;
    console.log(`[scheduler] ${job.name} completed in ${elapsed}ms`);
  } catch (err) {
    job.lastRun = new Date().toISOString();
    job.lastResult = `error: ${(err as Error).message}`;
    console.error(`[scheduler] ${job.name} failed:`, (err as Error).message);
  }
}

export function startScheduler() {
  if (process.env.DISABLE_SCHEDULER === "1") {
    console.log("[scheduler] Disabled via DISABLE_SCHEDULER=1");
    return;
  }

  console.log(`[scheduler] Starting ${jobs.length} scheduled jobs`);

  for (const job of jobs) {
    // Run first ingestion after a short delay to not block startup
    const initialDelay = 10_000 + Math.random() * 5_000;
    setTimeout(() => runJob(job), initialDelay);

    // Then schedule periodic runs
    job.timer = setInterval(() => runJob(job), job.intervalMs);
    console.log(`[scheduler]   ${job.name}: every ${Math.round(job.intervalMs / ONE_HOUR)}h`);
  }
}

export function stopScheduler() {
  for (const job of jobs) {
    if (job.timer) {
      clearInterval(job.timer);
      job.timer = undefined;
    }
  }
  console.log("[scheduler] All jobs stopped");
}

export function getSchedulerStatus() {
  return jobs.map((j) => ({
    name: j.name,
    intervalHours: Math.round(j.intervalMs / ONE_HOUR),
    lastRun: j.lastRun ?? null,
    lastResult: j.lastResult ?? null,
  }));
}
