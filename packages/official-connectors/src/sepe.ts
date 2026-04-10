/* ═══════════════════════════════════════════════════════════════════════════
   SEPE — Servicio Público de Empleo Estatal
   Fetches unemployment data from datos.gob.es (SEPE publishes there).
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchJson } from "./utils.js";

// SEPE publishes unemployment data on datos.gob.es as open data
const SEPE_DATOS_GOB_URL =
  "https://datos.gob.es/apidata/catalog/dataset/ea0010587-evolucion-de-paro-registrado-por-provincias-y-comunidades-autonomas.json";

export interface SEPERecord {
  id: string;
  title: string;
  description?: string;
  modified?: string;
  distributions: Array<{
    format: string;
    url: string;
  }>;
}

export interface SEPESnapshot {
  fetchedAt: string;
  sourceUrl: string;
  datasets: SEPERecord[];
}

/**
 * Fetches SEPE unemployment dataset metadata from datos.gob.es.
 * The actual CSV data can be downloaded from the distribution URLs.
 */
export async function fetchSEPEDatasets(): Promise<SEPESnapshot> {
  try {
    const response = await fetchJson<Record<string, unknown>>(SEPE_DATOS_GOB_URL);
    const result = (response as { result?: Record<string, unknown> }).result ?? {};
    const items = (result.items ?? result) as Record<string, unknown>[];

    const datasets: SEPERecord[] = [];

    if (Array.isArray(items)) {
      for (const item of items) {
        const about = (item._about ?? "") as string;
        const id = about.split("/").pop() ?? "sepe-paro";
        const titleArr = item.title as Array<{ _value?: string; _lang?: string }> | undefined;
        const title = titleArr?.find((t) => t._lang === "es")?._value ?? "Paro registrado SEPE";

        const distributions: Array<{ format: string; url: string }> = [];
        const dists = Array.isArray(item.distribution) ? item.distribution : item.distribution ? [item.distribution] : [];
        for (const dist of dists as Array<Record<string, unknown>>) {
          const format = ((dist.format ?? "") as string).split("/").pop() ?? "unknown";
          const url = (dist.accessURL ?? dist._about ?? "") as string;
          if (url) distributions.push({ format, url });
        }

        datasets.push({
          id,
          title: cleanWhitespace(title) ?? title,
          description: cleanWhitespace(
            (titleArr?.find((t) => t._lang === "es")?._value) ?? undefined,
          ),
          modified: item.modified as string | undefined,
          distributions,
        });
      }
    }

    return {
      fetchedAt: new Date().toISOString(),
      sourceUrl: SEPE_DATOS_GOB_URL,
      datasets,
    };
  } catch {
    return {
      fetchedAt: new Date().toISOString(),
      sourceUrl: SEPE_DATOS_GOB_URL,
      datasets: [],
    };
  }
}
