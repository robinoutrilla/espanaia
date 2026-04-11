/* ═══════════════════════════════════════════════════════════════════════════
   BOE Live Fetcher — pulls the daily summary from the BOE Open Data API
   and transforms it into OfficialBulletinItem format.

   API docs: https://www.boe.es/datosabiertos/
   Endpoint: GET /api/boe/sumario/{YYYYMMDD}
   Accept: application/json

   Cache: in-memory 1-hour TTL (BOE publishes once per day ~7:30 AM CET)
   ═══════════════════════════════════════════════════════════════════════════ */

import type { OfficialBulletinItem } from "@espanaia/shared-types";

// ── Types for BOE API response ─────────────────────────────────────────────

interface BoeApiItem {
  identificador: string;
  control?: string;
  titulo: string;
  url_pdf?: { texto: string; szKBytes?: string; pagina_inicial?: string; pagina_final?: string };
  url_html?: string;
  url_xml?: string;
}

interface BoeApiEpigrafe {
  nombre?: string;
  item: BoeApiItem | BoeApiItem[];
}

interface BoeApiDepartamento {
  codigo: string;
  nombre: string;
  epigrafe: BoeApiEpigrafe | BoeApiEpigrafe[];
}

interface BoeApiSeccion {
  codigo: string;
  nombre: string;
  departamento: BoeApiDepartamento | BoeApiDepartamento[];
}

interface BoeApiDiario {
  numero: string;
  sumario_diario: { identificador: string };
  seccion: BoeApiSeccion | BoeApiSeccion[];
}

interface BoeApiResponse {
  status: { code: string; text: string };
  data: {
    sumario?: {
      metadatos: { publicacion: string; fecha_publicacion: string };
      diario: BoeApiDiario | BoeApiDiario[];
    };
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/** Map BOE section codes to readable categories */
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

/** Simple impact score based on section — disposiciones generales are most impactful */
function sectionImpact(sectionCode: string): number {
  switch (sectionCode) {
    case "1": return 85; // Disposiciones generales — leyes, decretos
    case "T": return 80; // Tribunal Constitucional
    case "3": return 60; // Otras disposiciones — subvenciones, convenios
    case "2": case "2A": return 40; // Nombramientos
    case "2B": return 35; // Oposiciones
    case "4": return 50; // Justicia
    case "5": case "5A": case "5B": return 25; // Anuncios
    default: return 30;
  }
}

/** Detect affected territories from title text */
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

// ── Cache ───────────────────────────────────────────────────────────────────

interface CacheEntry {
  items: OfficialBulletinItem[];
  fetchedAt: string;
  boeDate: string;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ── Main fetcher ────────────────────────────────────────────────────────────

function formatBoeDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Fetch BOE items for a specific date (YYYYMMDD format) */
async function fetchBoeForDate(dateStr: string): Promise<OfficialBulletinItem[]> {
  const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${dateStr}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const json: BoeApiResponse = await res.json();
  if (json.status.code !== "200" || !json.data.sumario) return [];

  const items: OfficialBulletinItem[] = [];
  const pubDate = json.data.sumario.metadatos.fecha_publicacion;
  const isoDate = `${pubDate.slice(0, 4)}-${pubDate.slice(4, 6)}-${pubDate.slice(6, 8)}`;

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

  // Sort by impact score descending
  items.sort((a, b) => b.impactScore - a.impactScore);

  return items;
}

/**
 * Get latest BOE items. Tries today first, then yesterday (BOE doesn't publish on weekends).
 * Returns up to `limit` items sorted by impact.
 */
export async function getLatestBoe(limit = 30): Promise<{
  items: OfficialBulletinItem[];
  fetchedAt: string;
  boeDate: string;
  total: number;
}> {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return {
      items: cache.items.slice(0, limit),
      fetchedAt: cache.fetchedAt,
      boeDate: cache.boeDate,
      total: cache.items.length,
    };
  }

  // Try today and past 3 days (covers weekends + holidays)
  const now = new Date();
  let items: OfficialBulletinItem[] = [];
  let boeDate = "";

  for (let daysBack = 0; daysBack <= 3; daysBack++) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysBack);
    const dateStr = formatBoeDate(d);

    try {
      items = await fetchBoeForDate(dateStr);
      if (items.length > 0) {
        boeDate = dateStr;
        break;
      }
    } catch {
      continue;
    }
  }

  const fetchedAt = new Date().toISOString();

  // Update cache
  if (items.length > 0) {
    cache = { items, fetchedAt, boeDate, timestamp: Date.now() };
  }

  return { items: items.slice(0, limit), fetchedAt, boeDate, total: items.length };
}

/** Get BOE items filtered for a specific territory */
export async function getBoeForTerritory(territorySlug: string, limit = 10): Promise<OfficialBulletinItem[]> {
  const { items } = await getLatestBoe(200);
  return items.filter(i => i.affectedTerritories.includes(territorySlug)).slice(0, limit);
}

/** Get statistics about today's BOE */
export async function getBoeStats(): Promise<{
  totalDisposiciones: number;
  boeDate: string;
  topMinistries: { name: string; count: number }[];
  sectionBreakdown: { section: string; count: number }[];
}> {
  const { items, boeDate } = await getLatestBoe(500);

  const ministryCount: Record<string, number> = {};
  const sectionCount: Record<string, number> = {};

  for (const item of items) {
    ministryCount[item.ministryOrBody] = (ministryCount[item.ministryOrBody] ?? 0) + 1;
    sectionCount[item.category] = (sectionCount[item.category] ?? 0) + 1;
  }

  const topMinistries = Object.entries(ministryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const sectionBreakdown = Object.entries(sectionCount)
    .sort((a, b) => b[1] - a[1])
    .map(([section, count]) => ({ section, count }));

  return { totalDisposiciones: items.length, boeDate, topMinistries, sectionBreakdown };
}
