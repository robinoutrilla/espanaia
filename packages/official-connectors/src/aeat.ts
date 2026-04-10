/* ═══════════════════════════════════════════════════════════════════════════
   AEAT — Agencia Estatal de Administración Tributaria (datos abiertos)
   Fetches tax statistics dataset metadata from datos.gob.es.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchJson } from "./utils.js";

// AEAT publishes tax statistics on datos.gob.es
const AEAT_CATALOG_URL =
  "https://datos.gob.es/apidata/catalog/dataset.json?_pageSize=50&publisher.prefLabel=Agencia%20Estatal%20de%20Administraci%C3%B3n%20Tributaria";

export interface AEATDataset {
  id: string;
  title: string;
  description?: string;
  modified?: string;
  theme?: string[];
  url: string;
}

export interface AEATSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalResults: number;
  datasets: AEATDataset[];
}

export async function fetchAEATDatasets(): Promise<AEATSnapshot> {
  try {
    const response = await fetchJson<Record<string, unknown>>(AEAT_CATALOG_URL);
    const result = (response as { result?: { items?: Array<Record<string, unknown>>; totalResults?: number } }).result;
    const items = result?.items ?? [];

    const datasets: AEATDataset[] = items
      .map((item) => {
        const about = (item._about ?? "") as string;
        const id = about.split("/").pop() ?? about;
        const titleArr = item.title as Array<{ _value?: string; _lang?: string }> | undefined;
        const title = titleArr?.find((t) => t._lang === "es")?._value;
        if (!title) return null;

        const descArr = item.description as Array<{ _value?: string; _lang?: string }> | undefined;
        const description = descArr?.find((t) => t._lang === "es")?._value;

        return {
          id,
          title: cleanWhitespace(title) ?? title,
          description: cleanWhitespace(description),
          modified: item.modified as string | undefined,
          url: about.startsWith("http") ? about : `https://datos.gob.es/catalogo/${id}`,
        } satisfies AEATDataset;
      })
      .filter((d) => d !== null) as AEATDataset[];

    return {
      fetchedAt: new Date().toISOString(),
      sourceUrl: AEAT_CATALOG_URL,
      totalResults: result?.totalResults ?? datasets.length,
      datasets,
    };
  } catch {
    return {
      fetchedAt: new Date().toISOString(),
      sourceUrl: AEAT_CATALOG_URL,
      totalResults: 0,
      datasets: [],
    };
  }
}
