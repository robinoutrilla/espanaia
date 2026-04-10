/* ═══════════════════════════════════════════════════════════════════════════
   CNMC — Comisión Nacional de los Mercados y la Competencia
   Fetches resoluciones and expedientes from the public search.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchText, slugify, stripMarkup } from "./utils.js";

const CNMC_SEARCH_URL = "https://www.cnmc.es/buscador?f%5B0%5D=type%3Aexpediente";

export interface CNMCResolucion {
  id: string;
  title: string;
  expediente?: string;
  date?: string;
  sector?: string;
  type?: string;
  url?: string;
}

export interface CNMCSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  resoluciones: CNMCResolucion[];
}

/**
 * Fetches recent CNMC resoluciones from the public website.
 * Since CNMC doesn't have a clean JSON API, we scrape the HTML.
 */
export async function fetchCNMCResoluciones(): Promise<CNMCSnapshot> {
  const html = await fetchText(CNMC_SEARCH_URL);
  const resoluciones: CNMCResolucion[] = [];

  // Extract resolution entries from the page
  // CNMC renders results as article/div blocks with title, date, expediente
  const blockPattern =
    /<(?:article|div|li)[^>]*class="[^"]*(?:views-row|resultado|expediente)[^"]*"[^>]*>([\s\S]*?)<\/(?:article|div|li)>/gi;

  for (const blockMatch of html.matchAll(blockPattern)) {
    const block = blockMatch[1];

    // Extract title and link
    const linkMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    const title = stripMarkup(linkMatch?.[2]);
    const url = linkMatch?.[1];

    if (!title || title.length < 5) continue;

    // Extract date
    const dateMatch = block.match(/(\d{2}\/\d{2}\/\d{4})/);
    const date = dateMatch?.[1];

    // Extract expediente number
    const expMatch = block.match(/(?:expediente|exp\.?|N\/REF)[:\s]*([A-Z0-9\/\-]+)/i);
    const expediente = cleanWhitespace(expMatch?.[1]);

    const id = slugify(expediente ?? title.slice(0, 60));

    resoluciones.push({
      id,
      title,
      expediente,
      date,
      url: url?.startsWith("http") ? url : url ? `https://www.cnmc.es${url}` : undefined,
    });
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: CNMC_SEARCH_URL,
    resoluciones,
  };
}
