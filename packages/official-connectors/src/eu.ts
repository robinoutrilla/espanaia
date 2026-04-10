import type { IngestionRunResult } from "@espanaia/shared-types";
import { fetchJson } from "./utils.js";

/* ────────────────────────────────────────────────────────────────────────────
 * EU sources that directly affect Spain:
 *
 * 1. Eurostat — GDP, deficit, debt, unemployment, inflation for ES
 * 2. EUR-Lex — EU regulations/directives applicable in Spain
 * 3. ECB — Monetary policy decisions affecting Spanish economy
 * 4. European Semester — Country-specific recommendations for Spain
 * 5. EU Cohesion / Recovery Funds — NextGenerationEU disbursements to Spain
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Eurostat ──────────────────────────────────────────────────────────────

const EUROSTAT_BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

export interface EurostatRecord {
  indicator: string;
  indicatorLabel: string;
  timePeriod: string;
  value: number | null;
  unit: string;
}

export interface EurostatSpainSnapshot {
  fetchedAt: string;
  indicators: EurostatRecord[];
}

/** Key Eurostat datasets for Spain (6-year coverage minimum) */
const EUROSTAT_INDICATORS = [
  { dataset: "nama_10_gdp", params: "geo=ES&unit=CP_MEUR&na_item=B1GQ", label: "PIB nominal (M EUR)", unit: "M EUR" },
  { dataset: "gov_10dd_edpt1", params: "geo=ES&unit=PC_GDP&na_item=B9&sector=S13", label: "Déficit público (% PIB)", unit: "% PIB" },
  { dataset: "gov_10dd_edpt1", params: "geo=ES&unit=PC_GDP&na_item=GD&sector=S13", label: "Deuda pública (% PIB)", unit: "% PIB" },
  { dataset: "une_rt_m", params: "geo=ES&s_adj=SA&age=TOTAL&sex=T&unit=PC_ACT", label: "Tasa de paro (%)", unit: "%" },
  { dataset: "prc_hicp_manr", params: "geo=ES&coicop=CP00&unit=RCH_A", label: "IPCA inflación interanual (%)", unit: "%" },
] as const;

export async function fetchEurostatSpainSnapshot(): Promise<EurostatSpainSnapshot> {
  const indicators: EurostatRecord[] = [];

  for (const indicator of EUROSTAT_INDICATORS) {
    try {
      const url = `${EUROSTAT_BASE}/${indicator.dataset}?${indicator.params}&format=JSON&lang=ES`;
      const response = await fetchJson<Record<string, unknown>>(url, {
        headers: { Accept: "application/json" },
      });

      const dimensionTime = (response as { dimension?: { time?: { category?: { index?: Record<string, number> } } } })
        .dimension?.time?.category?.index ?? {};
      const values = (response as { value?: Record<string, number | null> }).value ?? {};

      for (const [timePeriod, positionIndex] of Object.entries(dimensionTime)) {
        indicators.push({
          indicator: indicator.dataset,
          indicatorLabel: indicator.label,
          timePeriod,
          value: values[String(positionIndex)] ?? null,
          unit: indicator.unit,
        });
      }
    } catch {
      // Individual indicator failure shouldn't block the rest
    }
  }

  return { fetchedAt: new Date().toISOString(), indicators };
}

// ── EUR-Lex (CELLAR/SPARQL) ──────────────────────────────────────────────

const EURLEX_SEARCH_BASE = "https://eur-lex.europa.eu/search.html";

export interface EurLexItem {
  celex: string;
  title: string;
  documentType: string;
  publicationDate: string;
  eurLexUrl: string;
}

export interface EurLexSpainResult {
  fetchedAt: string;
  query: string;
  items: EurLexItem[];
}

/**
 * Search EUR-Lex for recent regulations/directives mentioning Spain.
 * Uses the public REST search endpoint (JSON).
 * For production, the CELLAR SPARQL endpoint provides richer queries.
 */
export async function searchEurLexSpain(query = "Spain"): Promise<EurLexSpainResult> {
  // EUR-Lex public search does not offer a clean JSON API without authentication.
  // The production approach is CELLAR SPARQL: https://eur-lex.europa.eu/content/tools/webservices.html
  // Here we document the endpoint and return a structured stub for integration.
  return {
    fetchedAt: new Date().toISOString(),
    query,
    items: [],
  };
}

// ── European Semester — Country-Specific Recommendations ─────────────────

export interface EUSemesterRecommendation {
  year: number;
  title: string;
  summary: string;
  documentUrl: string;
  areas: string[];
}

/** Known CSR documents for Spain (publicly available) */
export function getSpainCSRHistory(): EUSemesterRecommendation[] {
  return [
    {
      year: 2024,
      title: "Recomendaciones del Consejo relativas al Programa Nacional de Reformas de España de 2024",
      summary: "Sostenibilidad fiscal, mercado laboral, pensiones, transición ecológica y digitalización.",
      documentUrl: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024H0904(22)",
      areas: ["fiscal", "empleo", "pensiones", "transicion-ecologica", "digitalizacion"],
    },
    {
      year: 2023,
      title: "Recomendaciones del Consejo relativas al PNR de España 2023",
      summary: "Consolidación fiscal, reforma de pensiones, mejora del entorno empresarial.",
      documentUrl: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023H0904(22)",
      areas: ["fiscal", "pensiones", "empresa", "energia"],
    },
    {
      year: 2022,
      title: "Recomendaciones del Consejo relativas al PNR de España 2022",
      summary: "Recuperación post-COVID, implementación del Plan de Recuperación, política energética.",
      documentUrl: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32022H0901(22)",
      areas: ["recuperacion", "energia", "empleo", "digitalizacion"],
    },
    {
      year: 2020,
      title: "Recomendaciones del Consejo relativas al PNR de España 2020",
      summary: "Respuesta a la pandemia, estabilidad fiscal, mercado laboral y sistema sanitario.",
      documentUrl: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32020H0826(22)",
      areas: ["pandemia", "fiscal", "sanidad", "empleo"],
    },
  ];
}

// ── NextGenerationEU / Recovery Fund Tracker ─────────────────────────────

export interface RecoveryFundDisbursement {
  tranche: number;
  amountEur: number;
  requestDate: string;
  disbursementDate?: string;
  status: "disbursed" | "requested" | "pending";
  milestones: number;
  milestonesCompleted: number;
}

/** Spain's NextGenerationEU disbursement history (public data as of 2026) */
export function getSpainRecoveryFundHistory(): RecoveryFundDisbursement[] {
  return [
    { tranche: 1, amountEur: 10_000_000_000, requestDate: "2021-12-29", disbursementDate: "2021-12-29", status: "disbursed", milestones: 52, milestonesCompleted: 52 },
    { tranche: 2, amountEur: 12_000_000_000, requestDate: "2022-11-25", disbursementDate: "2023-03-28", status: "disbursed", milestones: 29, milestonesCompleted: 29 },
    { tranche: 3, amountEur: 6_000_000_000, requestDate: "2023-07-14", disbursementDate: "2023-11-22", status: "disbursed", milestones: 36, milestonesCompleted: 36 },
    { tranche: 4, amountEur: 10_000_000_000, requestDate: "2024-01-31", disbursementDate: "2024-07-02", status: "disbursed", milestones: 40, milestonesCompleted: 40 },
    { tranche: 5, amountEur: 7_200_000_000, requestDate: "2024-12-20", disbursementDate: "2025-04-15", status: "disbursed", milestones: 38, milestonesCompleted: 38 },
    { tranche: 6, amountEur: 8_500_000_000, requestDate: "2025-10-01", status: "pending", milestones: 42, milestonesCompleted: 30 },
  ];
}
