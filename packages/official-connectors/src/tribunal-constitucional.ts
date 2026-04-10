/* ═══════════════════════════════════════════════════════════════════════════
   Tribunal Constitucional — Jurisprudencia
   Scrapes recent sentencias from the public search portal (HJ).
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchText, slugify, stripMarkup } from "./utils.js";

const TC_SEARCH_URL = "https://hj.tribunalconstitucional.es/es/Resolucion/List";
const TC_BASE_URL = "https://hj.tribunalconstitucional.es";

export interface TCResolucion {
  id: string;
  tipo: string;       // "STC", "ATC", "PTC"
  numero: string;     // e.g. "123/2024"
  fecha?: string;
  resumen?: string;
  url: string;
}

export interface TCSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  resoluciones: TCResolucion[];
}

/**
 * Fetches recent resoluciones from the Tribunal Constitucional.
 * Uses the public HJ (Hoja de Jurisprudencia) search.
 */
export async function fetchTCResoluciones(): Promise<TCSnapshot> {
  // Fetch the main listing page
  let html: string;
  try {
    html = await fetchText(TC_SEARCH_URL);
  } catch {
    // The TC site sometimes redirects; try the alternative URL
    try {
      html = await fetchText(`${TC_BASE_URL}/es-ES/Resolucion/Index`);
    } catch {
      return {
        fetchedAt: new Date().toISOString(),
        sourceUrl: TC_SEARCH_URL,
        resoluciones: [],
      };
    }
  }

  const resoluciones: TCResolucion[] = [];

  // Pattern: TC lists resolutions as links like /es/Resolucion/Show/12345
  // with accompanying text showing type + number + date
  const resPattern =
    /<a[^>]*href="(\/es[^"]*(?:Resolucion|Show)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(resPattern)) {
    const path = match[1];
    const text = stripMarkup(match[2]);

    if (!text || text.length < 3) continue;

    // Parse type and number: "STC 123/2024" or "Auto 45/2024"
    const typeMatch = text.match(/(STC|ATC|PTC|Sentencia|Auto|Providencia)\s*(\d+\/\d{4})/i);
    const tipo = typeMatch?.[1]?.toUpperCase()?.replace("SENTENCIA", "STC").replace("AUTO", "ATC").replace("PROVIDENCIA", "PTC") ?? "STC";
    const numero = typeMatch?.[2] ?? text.slice(0, 20);

    // Parse date
    const dateMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    const fecha = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : undefined;

    const id = slugify(`${tipo}-${numero}`);
    const url = path.startsWith("http") ? path : `${TC_BASE_URL}${path}`;

    resoluciones.push({
      id,
      tipo,
      numero,
      fecha,
      resumen: text.length > 30 ? text : undefined,
      url,
    });
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const deduped = resoluciones.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: TC_SEARCH_URL,
    resoluciones: deduped,
  };
}
