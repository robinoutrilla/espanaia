/* ═══════════════════════════════════════════════════════════════════════════
   Banco de España — Series Temporales (API REST)
   Fetches macroeconomic time series via the public statistics API.
   ═══════════════════════════════════════════════════════════════════════════ */

import { fetchJson } from "./utils.js";

// BdE uses a SDMX-compatible JSON REST API
const BDE_API_BASE = "https://www.bde.es/webbe/es/estadisticas/compartidas/datos/api-rest";
// Alternative: direct CSV endpoints
const BDE_SERIES_BASE = "https://www.bde.es/webbe/en/estadisticas/compartir/datos/csv";

export interface BdESerie {
  serieId: string;
  label: string;
  frequency: string;
  unit: string;
  observations: Array<{
    period: string;
    value: number | null;
  }>;
}

export interface BdESnapshot {
  fetchedAt: string;
  series: BdESerie[];
}

/** Key BdE series for Spain — identifiers from the BdE statistics portal */
const KEY_SERIES = [
  { id: "BE_1_1.1", label: "Tipos de interés oficiales del BCE", frequency: "monthly", unit: "%" },
  { id: "BE_1_2.1", label: "Euríbor a 12 meses", frequency: "monthly", unit: "%" },
  { id: "BE_3_1.1", label: "PIB España (tasa interanual)", frequency: "quarterly", unit: "% var." },
  { id: "BE_3_2.1", label: "IPC España (tasa interanual)", frequency: "monthly", unit: "% var." },
] as const;

/**
 * Fetches key economic series from Banco de España.
 * Falls back gracefully if the API changes or is unavailable.
 */
export async function fetchBdESnapshot(): Promise<BdESnapshot> {
  const series: BdESerie[] = [];

  for (const serie of KEY_SERIES) {
    try {
      // Try the SDMX JSON endpoint
      const url = `https://www.bde.es/wbe/es/estadisticas/recursos/api/rest/series/${serie.id}?format=json&limit=24`;
      const response = await fetchJson<Record<string, unknown>>(url, {
        headers: { Accept: "application/json" },
      });

      const observations: Array<{ period: string; value: number | null }> = [];

      // Parse SDMX-style response
      const dataSets = (response as { dataSets?: Array<{ observations?: Record<string, unknown[]> }> }).dataSets;
      const dims = (response as { structure?: { dimensions?: { observation?: Array<{ values?: Array<{ id?: string }> }> } } })
        .structure?.dimensions?.observation;

      if (dataSets?.[0]?.observations && dims?.[0]?.values) {
        const timePeriods = dims[0].values;
        for (const [key, obsData] of Object.entries(dataSets[0].observations)) {
          const idx = Number(key);
          const period = timePeriods[idx]?.id ?? key;
          const value = Array.isArray(obsData) && typeof obsData[0] === "number" ? obsData[0] : null;
          observations.push({ period, value });
        }
      }

      series.push({
        serieId: serie.id,
        label: serie.label,
        frequency: serie.frequency,
        unit: serie.unit,
        observations,
      });
    } catch {
      // Individual series failure shouldn't block the rest
      series.push({
        serieId: serie.id,
        label: serie.label,
        frequency: serie.frequency,
        unit: serie.unit,
        observations: [],
      });
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    series,
  };
}
