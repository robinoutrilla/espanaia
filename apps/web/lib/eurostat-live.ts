/* ═══════════════════════════════════════════════════════════════════════════
   Eurostat Live Fetcher — macroeconomic data for Spain vs EU from the
   Eurostat JSON Statistics API.

   API docs: https://wikis.ec.europa.eu/display/EUROSTATHELP/API+Statistics
   Base: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
   Free, no auth required.
   ═══════════════════════════════════════════════════════════════════════════ */

const EUROSTAT_BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

// ── Dataset definitions ─────────────────────────────────────────────────────

interface EurostatQuery {
  id: string;
  name: string;
  dataset: string;
  params: Record<string, string>;
  unit: string;
  category: "fiscal" | "empleo" | "precios" | "pib" | "social";
  countries: string[];  // geo codes to compare
}

const EU_COUNTRIES = ["ES", "DE", "FR", "IT", "PT", "EU27_2020"];

const QUERIES: EurostatQuery[] = [
  {
    id: "gov-debt",
    name: "Deuda pública (% PIB)",
    dataset: "gov_10dd_edpt1",
    params: { na_item: "GD", unit: "PC_GDP", sector: "S13", sinceTimePeriod: "2018" },
    unit: "% PIB",
    category: "fiscal",
    countries: EU_COUNTRIES,
  },
  {
    id: "gov-deficit",
    name: "Déficit público (% PIB)",
    dataset: "gov_10dd_edpt1",
    params: { na_item: "B9", unit: "PC_GDP", sector: "S13", sinceTimePeriod: "2018" },
    unit: "% PIB",
    category: "fiscal",
    countries: EU_COUNTRIES,
  },
  {
    id: "gdp-growth",
    name: "Crecimiento PIB (% anual)",
    dataset: "nama_10_gdp",
    params: { na_item: "B1GQ", unit: "CLV_PCH_PRE", sinceTimePeriod: "2018" },
    unit: "%",
    category: "pib",
    countries: EU_COUNTRIES,
  },
  {
    id: "gdp-per-capita",
    name: "PIB per cápita (PPS, EU=100)",
    dataset: "nama_10_pc",
    params: { na_item: "B1GQ", unit: "PC_EU27_2020_MEUR_CP" , sinceTimePeriod: "2018" },
    unit: "EU=100",
    category: "pib",
    countries: EU_COUNTRIES,
  },
  {
    id: "unemployment",
    name: "Tasa de desempleo (%)",
    dataset: "une_rt_a",
    params: { sex: "T", age: "TOTAL", unit: "PC_ACT", sinceTimePeriod: "2018" },
    unit: "%",
    category: "empleo",
    countries: EU_COUNTRIES,
  },
  {
    id: "youth-unemployment",
    name: "Desempleo juvenil (<25, %)",
    dataset: "une_rt_a",
    params: { sex: "T", age: "Y_LT25", unit: "PC_ACT", sinceTimePeriod: "2018" },
    unit: "%",
    category: "empleo",
    countries: EU_COUNTRIES,
  },
  {
    id: "inflation",
    name: "Inflación HICP (% anual)",
    dataset: "prc_hicp_aind",
    params: { coicop: "CP00", unit: "RCH_A_AVG", sinceTimePeriod: "2018" },
    unit: "%",
    category: "precios",
    countries: EU_COUNTRIES,
  },
  {
    id: "poverty-risk",
    name: "Riesgo de pobreza (%)",
    dataset: "ilc_li02",
    params: { indic_il: "LI_R_MD60", unit: "PC", sex: "T", age: "TOTAL", sinceTimePeriod: "2018" },
    unit: "%",
    category: "social",
    countries: EU_COUNTRIES,
  },
  {
    id: "gini",
    name: "Índice Gini",
    dataset: "ilc_di12",
    params: { sinceTimePeriod: "2018" },
    unit: "índice",
    category: "social",
    countries: EU_COUNTRIES,
  },
];

// ── Types ───────────────────────────────────────────────────────────────────

export interface EurostatDataPoint {
  country: string;
  countryName: string;
  period: string;
  value: number;
}

export interface EurostatIndicator {
  id: string;
  name: string;
  unit: string;
  category: string;
  data: EurostatDataPoint[];
  spainLatest: number | null;
  euLatest: number | null;
  spainRank: number | null;   // 1 = best among compared countries
  fetchedAt: string;
}

export interface EurostatSnapshot {
  indicators: EurostatIndicator[];
  fetchedAt: string;
  source: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  ES: "España", DE: "Alemania", FR: "Francia", IT: "Italia",
  PT: "Portugal", EU27_2020: "UE-27", NL: "Países Bajos",
  BE: "Bélgica", AT: "Austria", GR: "Grecia", PL: "Polonia",
};

// ── Cache ───────────────────────────────────────────────────────────────────

let cache: { data: EurostatSnapshot; timestamp: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours (Eurostat updates rarely)

// ── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchQuery(query: EurostatQuery): Promise<EurostatIndicator | null> {
  try {
    const geoParam = query.countries.join("&geo=");
    const extraParams = Object.entries(query.params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const url = `${EUROSTAT_BASE}/${query.dataset}?geo=${geoParam}&${extraParams}&lang=EN`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 21600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const values = json.value ?? {};
    const dims = json.dimension ?? {};

    // Build dimension indices
    const geoIdx = dims.geo?.category?.index ?? {};
    const timeIdx = dims.time?.category?.index ?? {};
    const geoLabels = dims.geo?.category?.label ?? {};
    const timeLabels = Object.keys(timeIdx);

    // Calculate sizes for index mapping
    const dimIds = json.id ?? [];
    const dimSizes = json.size ?? [];
    const dimMap: Record<string, { index: Record<string, number>; size: number }> = {};
    for (let i = 0; i < dimIds.length; i++) {
      const dimId = dimIds[i];
      dimMap[dimId] = {
        index: dims[dimId]?.category?.index ?? {},
        size: dimSizes[i] ?? 1,
      };
    }

    // Parse data points
    const data: EurostatDataPoint[] = [];
    for (const [flatIdx, value] of Object.entries(values)) {
      if (value === null) continue;

      // Reverse flat index to dimension indices
      let remainder = parseInt(flatIdx);
      const indices: Record<string, number> = {};

      for (let i = dimIds.length - 1; i >= 0; i--) {
        const dimId = dimIds[i];
        const size = dimMap[dimId].size;
        indices[dimId] = remainder % size;
        remainder = Math.floor(remainder / size);
      }

      // Find geo and time from indices
      const geoCode = Object.entries(geoIdx).find(([, idx]) => idx === indices.geo)?.[0];
      const timePeriod = Object.entries(timeIdx).find(([, idx]) => idx === indices.time)?.[0];

      if (geoCode && timePeriod) {
        data.push({
          country: geoCode,
          countryName: COUNTRY_NAMES[geoCode] ?? geoLabels[geoCode] ?? geoCode,
          period: timePeriod,
          value: value as number,
        });
      }
    }

    // Sort by period desc, then country
    data.sort((a, b) => b.period.localeCompare(a.period) || a.country.localeCompare(b.country));

    // Get latest values for Spain and EU
    const latestPeriod = timeLabels.sort().pop() ?? "";
    const spainLatest = data.find(d => d.country === "ES" && d.period === latestPeriod)?.value ?? null;
    const euLatest = data.find(d => d.country === "EU27_2020" && d.period === latestPeriod)?.value ?? null;

    // Rank Spain among countries for latest period (lower unemployment = better, higher GDP = better)
    const latestByCountry = data
      .filter(d => d.period === latestPeriod && d.country !== "EU27_2020")
      .sort((a, b) => {
        // For negative indicators (unemployment, debt, poverty), lower is better
        const negativeIndicators = ["unemployment", "youth-unemployment", "gov-debt", "poverty-risk", "gini"];
        if (negativeIndicators.includes(query.id)) return a.value - b.value;
        return b.value - a.value;
      });
    const spainRank = latestByCountry.findIndex(d => d.country === "ES") + 1;

    return {
      id: query.id,
      name: query.name,
      unit: query.unit,
      category: query.category,
      data,
      spainLatest,
      euLatest,
      spainRank: spainRank > 0 ? spainRank : null,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Fetch all Eurostat indicators for Spain vs EU */
export async function getEurostatSnapshot(): Promise<EurostatSnapshot> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const results = await Promise.all(QUERIES.map(fetchQuery));
  const indicators = results.filter((r): r is EurostatIndicator => r !== null);

  const snapshot: EurostatSnapshot = {
    indicators,
    fetchedAt: new Date().toISOString(),
    source: "Eurostat — Oficina Estadística de la UE (ec.europa.eu/eurostat)",
  };

  cache = { data: snapshot, timestamp: Date.now() };
  return snapshot;
}

/** Get single indicator */
export async function getEurostatIndicator(id: string): Promise<EurostatIndicator | null> {
  const snapshot = await getEurostatSnapshot();
  return snapshot.indicators.find(i => i.id === id) ?? null;
}

/** Sync cache access for RAG */
export function getEurostatSummarySync(): string[] {
  if (!cache) return [];
  return cache.data.indicators.map(ind => {
    const esVal = ind.spainLatest !== null ? `España: ${ind.spainLatest}${ind.unit === "%" ? "%" : " " + ind.unit}` : "España: N/D";
    const euVal = ind.euLatest !== null ? `UE-27: ${ind.euLatest}${ind.unit === "%" ? "%" : " " + ind.unit}` : "";
    const rank = ind.spainRank ? ` (posición ${ind.spainRank}/5 entre pares)` : "";
    return `[Eurostat — ${ind.name}] ${esVal}. ${euVal}${rank}. Fuente: Eurostat.`;
  });
}
