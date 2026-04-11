/* ═══════════════════════════════════════════════════════════════════════════
   INE Live Fetcher — pulls real-time data from the Spanish National
   Statistics Institute (INE) JSON API.

   API docs: https://www.ine.es/dyngs/DataLab/manual.html
   Base URL: https://servicios.ine.es/wstempus/js/ES/

   Free, no auth required, no rate limit documented.
   ═══════════════════════════════════════════════════════════════════════════ */

const INE_BASE = "https://servicios.ine.es/wstempus/js/ES";

// ── Key indicator tables ────────────────────────────────────────────────────

interface IneTableDef {
  id: string;
  tableId: string;    // INE table number
  name: string;
  category: "empleo" | "precios" | "pib" | "vivienda" | "demografia" | "industria";
  unit: string;
  nult: number;       // Number of latest periods to fetch
}

const INDICATORS: IneTableDef[] = [
  // Employment
  { id: "tasa-paro", tableId: "4247", name: "Tasa de paro (EPA)", category: "empleo", unit: "%", nult: 8 },
  { id: "ocupados", tableId: "4076", name: "Ocupados (EPA)", category: "empleo", unit: "miles", nult: 8 },

  // Prices
  { id: "ipc-general", tableId: "25171", name: "IPC General", category: "precios", unit: "índice", nult: 12 },
  { id: "ipc-variacion", tableId: "25172", name: "IPC Variación anual", category: "precios", unit: "%", nult: 12 },

  // GDP
  { id: "pib-trimestral", tableId: "30679", name: "PIB Trimestral", category: "pib", unit: "M€", nult: 8 },

  // Housing
  { id: "ipv", tableId: "25171", name: "Índice de Precios de Vivienda", category: "vivienda", unit: "índice", nult: 8 },

  // Demographics
  { id: "poblacion", tableId: "56934", name: "Población residente", category: "demografia", unit: "personas", nult: 4 },

  // Industry
  { id: "ipi", tableId: "25165", name: "Índice de Producción Industrial", category: "industria", unit: "índice", nult: 12 },
];

// ── Types ───────────────────────────────────────────────────────────────────

interface IneRawSeries {
  COD: string;
  Nombre: string;
  FK_Unidad: number;
  FK_Escala: number;
  Data: { Fecha: number; FK_TipoDato: number; FK_Periodo: number; Anyo: number; Valor: number | null; Secreto: boolean }[];
}

export interface IneDataPoint {
  date: string;      // ISO date
  year: number;
  period: number;    // month or quarter
  value: number;
}

export interface IneIndicator {
  id: string;
  name: string;
  category: string;
  unit: string;
  seriesName: string;
  latestValue: number | null;
  latestDate: string;
  trend: "up" | "down" | "stable";
  changePercent: number | null;
  data: IneDataPoint[];
  fetchedAt: string;
}

export interface IneSnapshot {
  indicators: IneIndicator[];
  fetchedAt: string;
  source: string;
}

// ── Cache ───────────────────────────────────────────────────────────────────

let cache: { data: IneSnapshot; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (INE updates monthly/quarterly)

// ── Fetcher ─────────────────────────────────────────────────────────────────

function ineTimestampToDate(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

function computeTrend(data: IneDataPoint[]): { trend: "up" | "down" | "stable"; changePercent: number | null } {
  if (data.length < 2) return { trend: "stable", changePercent: null };
  const latest = data[0].value;
  const previous = data[1].value;
  if (previous === 0) return { trend: "stable", changePercent: null };
  const change = ((latest - previous) / Math.abs(previous)) * 100;
  const trend = change > 0.5 ? "up" : change < -0.5 ? "down" : "stable";
  return { trend, changePercent: Math.round(change * 100) / 100 };
}

async function fetchIndicator(def: IneTableDef): Promise<IneIndicator | null> {
  try {
    const url = `${INE_BASE}/DATOS_TABLA/${def.tableId}?nult=${def.nult}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const series: IneRawSeries[] = await res.json();
    if (!series.length) return null;

    // Take first national-level series (usually "Total Nacional")
    const main = series.find(s =>
      s.Nombre.toLowerCase().includes("total nacional") ||
      s.Nombre.toLowerCase().includes("nacional")
    ) ?? series[0];

    const dataPoints: IneDataPoint[] = main.Data
      .filter(d => d.Valor !== null && !d.Secreto)
      .map(d => ({
        date: ineTimestampToDate(d.Fecha),
        year: d.Anyo,
        period: d.FK_Periodo,
        value: d.Valor!,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!dataPoints.length) return null;

    const { trend, changePercent } = computeTrend(dataPoints);

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      unit: def.unit,
      seriesName: main.Nombre,
      latestValue: dataPoints[0].value,
      latestDate: dataPoints[0].date,
      trend,
      changePercent,
      data: dataPoints,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Fetch all key indicators from INE */
export async function getIneIndicators(): Promise<IneSnapshot> {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const results = await Promise.all(INDICATORS.map(fetchIndicator));
  const indicators = results.filter((r): r is IneIndicator => r !== null);

  const snapshot: IneSnapshot = {
    indicators,
    fetchedAt: new Date().toISOString(),
    source: "INE — Instituto Nacional de Estadística (servicios.ine.es)",
  };

  cache = { data: snapshot, timestamp: Date.now() };
  return snapshot;
}

/** Get a single indicator by ID */
export async function getIneIndicator(id: string): Promise<IneIndicator | null> {
  const snapshot = await getIneIndicators();
  return snapshot.indicators.find(i => i.id === id) ?? null;
}

/** Get indicators by category */
export async function getIneByCategory(category: string): Promise<IneIndicator[]> {
  const snapshot = await getIneIndicators();
  return snapshot.indicators.filter(i => i.category === category);
}

/** Get a summary for RAG context (async) */
export async function getIneSummaryForRAG(): Promise<string[]> {
  const snapshot = await getIneIndicators();
  return snapshot.indicators.map(ind => {
    const trendEmoji = ind.trend === "up" ? "↑" : ind.trend === "down" ? "↓" : "→";
    const change = ind.changePercent !== null ? ` (${ind.changePercent > 0 ? "+" : ""}${ind.changePercent}%)` : "";
    return `[INE ${ind.name}] Último dato: ${ind.latestValue} ${ind.unit} (${ind.latestDate}). ` +
      `Tendencia: ${trendEmoji}${change}. Serie: ${ind.seriesName}.`;
  });
}

/**
 * Sync version: returns cached INE context for RAG agents.
 * Returns empty array if cache is cold (async fetch needed first via /api/ine).
 */
export function getIneSummarySync(): string[] {
  if (!cache) return [];
  return cache.data.indicators.map(ind => {
    const trendEmoji = ind.trend === "up" ? "↑" : ind.trend === "down" ? "↓" : "→";
    const change = ind.changePercent !== null ? ` (${ind.changePercent > 0 ? "+" : ""}${ind.changePercent}%)` : "";
    return `[INE Live — ${ind.name}] Último dato: ${ind.latestValue} ${ind.unit} (${ind.latestDate}). ` +
      `Tendencia: ${trendEmoji}${change}. Serie: ${ind.seriesName}.`;
  });
}
