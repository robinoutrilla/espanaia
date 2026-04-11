/* ═══════════════════════════════════════════════════════════════════════════
   BOE Store — persists daily BOE items to a JSONL archive for RAG.
   Each line is a JSON object with full OfficialBulletinItem data.
   Supports backfill (day-by-day fetch going backwards) and RAG search.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, appendFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { OfficialBulletinItem } from "@espanaia/shared-types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "boe-archive.jsonl");
const META_PATH = join(DATA_DIR, "boe-backfill-meta.json");

interface BackfillMeta {
  oldestDateFetched: string;   // YYYYMMDD — how far back we've gone
  newestDateFetched: string;   // YYYYMMDD — most recent fetch
  totalItems: number;
  datesCompleted: string[];    // All YYYYMMDD dates successfully fetched
  lastBackfillAt: string;      // ISO timestamp
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadMeta(): BackfillMeta {
  ensureDir();
  if (!existsSync(META_PATH)) {
    return {
      oldestDateFetched: "",
      newestDateFetched: "",
      totalItems: 0,
      datesCompleted: [],
      lastBackfillAt: "",
    };
  }
  try {
    return JSON.parse(readFileSync(META_PATH, "utf-8"));
  } catch {
    return { oldestDateFetched: "", newestDateFetched: "", totalItems: 0, datesCompleted: [], lastBackfillAt: "" };
  }
}

function saveMeta(meta: BackfillMeta) {
  ensureDir();
  writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(yyyymmdd: string): Date {
  return new Date(
    parseInt(yyyymmdd.slice(0, 4)),
    parseInt(yyyymmdd.slice(4, 6)) - 1,
    parseInt(yyyymmdd.slice(6, 8))
  );
}

// ── Persist BOE items ───────────────────────────────────────────────────────

/** Append BOE items for a given date to the JSONL archive */
export function persistBoeItems(items: OfficialBulletinItem[], boeDate: string): number {
  ensureDir();

  // Load existing IDs for dedup
  const existingIds = new Set<string>();
  if (existsSync(STORE_PATH)) {
    const lines = readFileSync(STORE_PATH, "utf-8").split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        existingIds.add(obj.id);
      } catch { /* skip */ }
    }
  }

  let added = 0;
  for (const item of items) {
    if (existingIds.has(item.id)) continue;
    appendFileSync(STORE_PATH, JSON.stringify(item) + "\n");
    existingIds.add(item.id);
    added++;
  }

  // Update meta
  const meta = loadMeta();
  if (!meta.oldestDateFetched || boeDate < meta.oldestDateFetched) {
    meta.oldestDateFetched = boeDate;
  }
  if (!meta.newestDateFetched || boeDate > meta.newestDateFetched) {
    meta.newestDateFetched = boeDate;
  }
  if (!meta.datesCompleted.includes(boeDate)) {
    meta.datesCompleted.push(boeDate);
    meta.datesCompleted.sort();
  }
  meta.totalItems += added;
  meta.lastBackfillAt = new Date().toISOString();
  saveMeta(meta);

  return added;
}

// ── Read archive for RAG ────────────────────────────────────────────────────

export interface BoeSearchOptions {
  query?: string;
  territory?: string;
  ministry?: string;
  category?: string;
  since?: string;       // ISO date
  limit?: number;
  minImpact?: number;
}

/** Search the BOE archive for RAG context */
export function searchBoeArchive(options: BoeSearchOptions = {}): OfficialBulletinItem[] {
  ensureDir();
  if (!existsSync(STORE_PATH)) return [];

  const lines = readFileSync(STORE_PATH, "utf-8").split("\n").filter(Boolean);
  let items: OfficialBulletinItem[] = [];

  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch { /* skip */ }
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());

  // Apply filters
  if (options.since) {
    const sinceTs = new Date(options.since).getTime();
    items = items.filter(i => new Date(i.publicationDate).getTime() >= sinceTs);
  }

  if (options.minImpact) {
    items = items.filter(i => i.impactScore >= options.minImpact!);
  }

  if (options.territory) {
    const t = options.territory.toLowerCase();
    items = items.filter(i => i.affectedTerritories.some(at => at.toLowerCase() === t));
  }

  if (options.ministry) {
    const m = options.ministry.toLowerCase();
    items = items.filter(i => i.ministryOrBody.toLowerCase().includes(m));
  }

  if (options.category) {
    const c = options.category.toLowerCase();
    items = items.filter(i => i.category.toLowerCase().includes(c));
  }

  if (options.query) {
    const words = options.query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    items = items.filter(i => {
      const text = `${i.title} ${i.summary} ${i.ministryOrBody} ${i.category}`.toLowerCase();
      return words.some(w => text.includes(w));
    });
  }

  return items.slice(0, options.limit ?? 50);
}

/** Get archive statistics */
export function getBoeArchiveStats(): BackfillMeta & { archiveExists: boolean } {
  const meta = loadMeta();
  return { ...meta, archiveExists: existsSync(STORE_PATH) };
}

// ── Backfill engine ─────────────────────────────────────────────────────────

interface BackfillResult {
  date: string;
  itemsFetched: number;
  itemsStored: number;
  skipped: boolean;
  error?: string;
}

/**
 * Backfill BOE data going backwards from a start date.
 * Fetches `days` number of days, skipping already-fetched dates.
 * Returns results for each day attempted.
 */
export async function backfillBoe(options: {
  days?: number;       // How many days back to go (default 30)
  startFrom?: string;  // YYYYMMDD to start from (default: yesterday)
  concurrency?: number; // Parallel fetches (default 2, max 5)
}): Promise<{
  results: BackfillResult[];
  totalNew: number;
  meta: BackfillMeta;
}> {
  const { days = 30, concurrency = 2 } = options;
  const meta = loadMeta();

  // Determine start date
  let startDate: Date;
  if (options.startFrom) {
    startDate = parseDate(options.startFrom);
  } else if (meta.oldestDateFetched) {
    // Continue from one day before the oldest we have
    startDate = parseDate(meta.oldestDateFetched);
    startDate.setDate(startDate.getDate() - 1);
  } else {
    // Start from yesterday
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
  }

  const results: BackfillResult[] = [];
  let totalNew = 0;

  // Generate date list going backwards
  const datesToFetch: string[] = [];
  const cursor = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const dateStr = formatDate(cursor);
    if (!meta.datesCompleted.includes(dateStr)) {
      datesToFetch.push(dateStr);
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  // Fetch in batches with concurrency limit
  const batchSize = Math.min(Math.max(concurrency, 1), 5);

  for (let i = 0; i < datesToFetch.length; i += batchSize) {
    const batch = datesToFetch.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (dateStr): Promise<BackfillResult> => {
        try {
          const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${dateStr}`;
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(15_000),
          });

          if (!res.ok) {
            // 404 = no BOE for this date (weekend/holiday)
            if (res.status === 404) {
              // Mark as completed so we don't retry
              const m = loadMeta();
              if (!m.datesCompleted.includes(dateStr)) {
                m.datesCompleted.push(dateStr);
                saveMeta(m);
              }
              return { date: dateStr, itemsFetched: 0, itemsStored: 0, skipped: true };
            }
            return { date: dateStr, itemsFetched: 0, itemsStored: 0, skipped: false, error: `HTTP ${res.status}` };
          }

          const json = await res.json();
          if (json.status?.code !== "200" || !json.data?.sumario) {
            // No data for this date
            const m = loadMeta();
            if (!m.datesCompleted.includes(dateStr)) {
              m.datesCompleted.push(dateStr);
              saveMeta(m);
            }
            return { date: dateStr, itemsFetched: 0, itemsStored: 0, skipped: true };
          }

          // Parse items (reuse logic from boe-live)
          const items = parseBoeResponse(json, dateStr);
          const stored = persistBoeItems(items, dateStr);

          return { date: dateStr, itemsFetched: items.length, itemsStored: stored, skipped: false };
        } catch (err) {
          return {
            date: dateStr,
            itemsFetched: 0,
            itemsStored: 0,
            skipped: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      })
    );

    for (const r of batchResults) {
      results.push(r);
      totalNew += r.itemsStored;
    }
  }

  return { results, totalNew, meta: loadMeta() };
}

// ── BOE response parser (shared logic) ──────────────────────────────────────

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

const SECTION_LABELS: Record<string, string> = {
  "1": "Disposiciones generales",
  "2": "Autoridades y personal",
  "2A": "Nombramientos",
  "2B": "Oposiciones y concursos",
  "3": "Otras disposiciones",
  "4": "Administración de Justicia",
  "5": "Anuncios",
  "5A": "Licitaciones públicas",
  "5B": "Otros anuncios",
  "T": "Tribunal Constitucional",
};

function sectionImpact(code: string): number {
  switch (code) {
    case "1": return 85;
    case "T": return 80;
    case "3": return 60;
    case "2": case "2A": return 40;
    case "2B": return 35;
    case "4": return 50;
    case "5": case "5A": case "5B": return 25;
    default: return 30;
  }
}

function detectTerritories(title: string): string[] {
  const territories: string[] = [];
  const lower = title.toLowerCase();
  const map: Record<string, string> = {
    "andaluc": "andalucia", "aragón": "aragon", "aragon": "aragon",
    "asturias": "asturias", "balears": "illes-balears", "baleares": "illes-balears",
    "canarias": "canarias", "cantabria": "cantabria",
    "castilla y león": "castilla-y-leon", "castilla-la mancha": "castilla-la-mancha",
    "cataluña": "cataluna", "catalunya": "cataluna",
    "extremadura": "extremadura", "galicia": "galicia",
    "madrid": "madrid", "murcia": "murcia",
    "navarra": "navarra", "país vasco": "pais-vasco", "euskadi": "pais-vasco",
    "rioja": "la-rioja", "valencia": "comunitat-valenciana",
    "ceuta": "ceuta", "melilla": "melilla",
  };
  for (const [keyword, slug] of Object.entries(map)) {
    if (lower.includes(keyword) && !territories.includes(slug)) {
      territories.push(slug);
    }
  }
  return territories;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBoeResponse(json: any, dateStr: string): OfficialBulletinItem[] {
  const items: OfficialBulletinItem[] = [];
  const isoDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

  for (const diario of toArray(json.data.sumario.diario)) {
    for (const seccion of toArray(diario.seccion)) {
      const sectionCode = seccion.codigo;
      const sectionName = SECTION_LABELS[sectionCode] ?? seccion.nombre;

      for (const dept of toArray(seccion.departamento ?? [])) {
        for (const epi of toArray(dept.epigrafe ?? [])) {
          if (!epi.item) continue;
          for (const item of toArray(epi.item)) {
            if (!item?.identificador || !item?.titulo) continue;
            items.push({
              id: item.identificador.toLowerCase(),
              title: item.titulo,
              summary: `${sectionName} — ${dept.nombre}${epi.nombre ? ` — ${epi.nombre}` : ""}`,
              publicationDate: isoDate,
              documentUrl: item.url_html ?? item.url_pdf?.texto ?? `https://www.boe.es/diario_boe/txt.php?id=${item.identificador}`,
              category: sectionName,
              ministryOrBody: dept.nombre,
              impactScore: sectionImpact(sectionCode),
              affectedTerritories: detectTerritories(item.titulo),
            });
          }
        }
      }
    }
  }

  items.sort((a, b) => b.impactScore - a.impactScore);
  return items;
}
