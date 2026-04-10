/* ═══════════════════════════════════════════════════════════════════════════
   Portal de Transparencia — Resoluciones de derecho de acceso
   Scrapes FOI (Freedom of Information) resolutions: both denied and granted.
   Source: transparencia.gob.es
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchText } from "./utils.js";

const BASE_URL = "https://transparencia.gob.es";

/** Denial cause codes per Art. 14.1 Ley 19/2013 */
const DENIAL_CAUSES: Record<string, string> = {
  a: "Seguridad nacional",
  b: "Defensa",
  c: "Relaciones exteriores",
  d: "Seguridad pública",
  e: "Prevención/investigación/sanción penal/administrativa/disciplinaria",
  f: "Igualdad de partes en procesos judiciales",
  g: "Funciones administrativas de vigilancia/inspección/control",
  h: "Intereses económicos y comerciales",
  i: "Política económica y monetaria",
  j: "Secreto profesional y propiedad intelectual",
  k: "Garantía de confidencialidad en toma de decisiones",
  l: "Protección del medio ambiente",
};

export interface TransparenciaResolucion {
  id: string;
  tipo: "denegacion" | "estimacion";
  ministerio: string;
  asunto: string;
  fecha: string;
  referencia?: string;
  causasDenegacion?: string[];
  resultado?: string;
}

export interface TransparenciaSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalResoluciones: number;
  resoluciones: TransparenciaResolucion[];
}

function parseTableRows(html: string): string[][] {
  const rows: string[][] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
      const text = cellMatch[1].replace(/<[^>]+>/g, "").trim();
      cells.push(text);
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

function parseDenegaciones(html: string, year: string): TransparenciaResolucion[] {
  const rows = parseTableRows(html);
  const resoluciones: TransparenciaResolucion[] = [];
  const causeKeys = Object.keys(DENIAL_CAUSES);

  for (const cells of rows) {
    // Skip header rows
    if (cells[0]?.toLowerCase().includes("ministerio") || cells[0]?.toLowerCase().includes("causas")) continue;
    if (cells.length < 3) continue;

    const ministerio = cleanWhitespace(cells[0]) ?? "";
    const asunto = cleanWhitespace(cells[1]) ?? "";
    const fecha = cleanWhitespace(cells[2]) ?? "";

    if (!ministerio || !asunto || !fecha) continue;
    // Skip if this looks like a sub-header
    if (fecha.length < 6) continue;

    // Collect denial causes (X marks in columns after fecha)
    const causas: string[] = [];
    for (let i = 3; i < cells.length - 1 && i - 3 < causeKeys.length; i++) {
      if (cells[i]?.trim().toUpperCase() === "X") {
        const key = causeKeys[i - 3];
        if (key) causas.push(key);
      }
    }

    // Last column is typically the reference number
    const referencia = cleanWhitespace(cells[cells.length - 1]);

    const id = referencia
      ? `transp-den-${referencia}`
      : `transp-den-${year}-${resoluciones.length}`;

    resoluciones.push({
      id,
      tipo: "denegacion",
      ministerio,
      asunto,
      fecha,
      referencia: referencia || undefined,
      causasDenegacion: causas.length > 0 ? causas : undefined,
    });
  }

  return resoluciones;
}

function parseEstimaciones(html: string): TransparenciaResolucion[] {
  const rows = parseTableRows(html);
  const resoluciones: TransparenciaResolucion[] = [];

  for (const cells of rows) {
    // Skip header rows
    if (cells.length < 4) continue;
    const firstCell = cells[0]?.toLowerCase() ?? "";
    if (firstCell.includes("nº") || firstCell.includes("referencia") || firstCell.includes("orden")) continue;

    // Format: Nº | Referencia | UIT/Ministerio | Fecha | Resultado | Asunto
    const referencia = cleanWhitespace(cells[1]) ?? "";
    const ministerio = cleanWhitespace(cells[2]) ?? "";
    const fecha = cleanWhitespace(cells[3]) ?? "";
    const resultado = cleanWhitespace(cells[4]) ?? "";
    const asunto = cleanWhitespace(cells[5]) ?? cleanWhitespace(cells[4]) ?? "";

    if (!ministerio || !fecha) continue;
    if (fecha.length < 6) continue;

    const id = referencia
      ? `transp-est-${referencia}`
      : `transp-est-${resoluciones.length}`;

    resoluciones.push({
      id,
      tipo: "estimacion",
      ministerio,
      asunto: asunto || resultado,
      fecha,
      referencia: referencia || undefined,
      resultado: resultado || undefined,
    });
  }

  return resoluciones;
}

/**
 * Fetch FOI denial resolutions for a given year.
 */
export async function fetchDenegaciones(year: string): Promise<TransparenciaResolucion[]> {
  const suffix = year === "2014" ? "" : year;
  const url = `${BASE_URL}/derecho-acceso/resoluciones-denegatorias/resolucionesdenegatorias${suffix}`;

  try {
    const html = await fetchText(url);
    return parseDenegaciones(html, year);
  } catch {
    return [];
  }
}

/**
 * Fetch FOI granted resolutions (all years, single page).
 */
export async function fetchEstimaciones(): Promise<TransparenciaResolucion[]> {
  const url = `${BASE_URL}/derecho-acceso/resoluciones-estimatorias`;
  try {
    const html = await fetchText(url);
    return parseEstimaciones(html);
  } catch {
    return [];
  }
}

/**
 * Fetch all transparency FOI resolutions (denied + granted) for recent years.
 * @param years Array of years to scrape denials for (default: 2024-2025)
 */
export async function fetchTransparenciaResoluciones(
  years = ["2024", "2025"],
): Promise<TransparenciaSnapshot> {
  const sourceUrl = `${BASE_URL}/derecho-acceso/resoluciones-denegatorias`;
  const allResoluciones: TransparenciaResolucion[] = [];

  // Fetch denied resolutions for each year
  for (const year of years) {
    const denegaciones = await fetchDenegaciones(year);
    allResoluciones.push(...denegaciones);
  }

  // Fetch granted resolutions
  const estimaciones = await fetchEstimaciones();
  allResoluciones.push(...estimaciones);

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    totalResoluciones: allResoluciones.length,
    resoluciones: allResoluciones,
  };
}
