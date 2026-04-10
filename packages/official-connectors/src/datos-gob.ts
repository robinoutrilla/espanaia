/* ═══════════════════════════════════════════════════════════════════════════
   datos.gob.es — Portal de Datos Abiertos de España (CKAN API)
   Fetches the catalog of open datasets.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchJson } from "./utils.js";

const DATOS_GOB_API = "https://datos.gob.es/apidata/catalog/dataset.json";

interface RawDatosGobItem {
  _about?: string;
  title?: Array<{ _value?: string; _lang?: string }> | string;
  description?: Array<{ _value?: string; _lang?: string }> | string;
  theme?: Array<{ _about?: string }> | { _about?: string };
  publisher?: { _about?: string; label?: Array<{ _value?: string }> };
  accrualPeriodicity?: string;
  modified?: string;
  issued?: string;
  keyword?: string[];
}

interface DatosGobResponse {
  result?: {
    items?: RawDatosGobItem[];
    totalResults?: number;
    itemsPerPage?: number;
    startIndex?: number;
    next?: string;
  };
}

export interface DatosGobDataset {
  id: string;
  title: string;
  description?: string;
  publisher?: string;
  theme?: string[];
  frequency?: string;
  modified?: string;
  issued?: string;
  keywords?: string[];
  url: string;
}

export interface DatosGobSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalResults: number;
  datasets: DatosGobDataset[];
}

function extractLangValue(field: Array<{ _value?: string; _lang?: string }> | string | undefined, lang = "es"): string | undefined {
  if (typeof field === "string") return cleanWhitespace(field);
  if (!Array.isArray(field)) return undefined;
  const match = field.find((f) => f._lang === lang) ?? field[0];
  return cleanWhitespace(match?._value);
}

/**
 * Fetch datasets from datos.gob.es catalog.
 * @param pageSize Number of datasets per page (max 50)
 * @param page Page number (0-indexed)
 */
export async function fetchDatosGobCatalog(
  pageSize = 50,
  page = 0,
): Promise<DatosGobSnapshot> {
  const sourceUrl = `${DATOS_GOB_API}?_pageSize=${pageSize}&_page=${page}`;
  const response = await fetchJson<DatosGobResponse>(sourceUrl);
  const items = response.result?.items ?? [];

  const datasets: DatosGobDataset[] = items
    .map((item) => {
      const about = item._about ?? "";
      const id = about.split("/").pop() ?? about;
      const title = extractLangValue(item.title);
      if (!title) return null;

      const themes: string[] = [];
      const rawThemes = Array.isArray(item.theme) ? item.theme : item.theme ? [item.theme] : [];
      for (const t of rawThemes) {
        const themeId = t._about?.split("/").pop();
        if (themeId) themes.push(themeId);
      }

      return {
        id,
        title,
        description: extractLangValue(item.description),
        publisher: extractLangValue(item.publisher?.label),
        theme: themes.length > 0 ? themes : undefined,
        frequency: typeof item.accrualPeriodicity === "string" ? item.accrualPeriodicity.split("/").pop() : undefined,
        modified: item.modified,
        issued: item.issued,
        keywords: item.keyword,
        url: about.startsWith("http") ? about : `https://datos.gob.es/catalogo/${id}`,
      } satisfies DatosGobDataset;
    })
    .filter((d) => d !== null) as DatosGobDataset[];

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    totalResults: response.result?.totalResults ?? datasets.length,
    datasets,
  };
}
