/* ═══════════════════════════════════════════════════════════════════════════
   Congreso — Intervenciones parlamentarias (Diarios de Sesiones + Vídeos)
   Uses the internal filtrarListado API that returns JSON with speaker info,
   diario PDF references, and video MP4 download/streaming URLs.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace } from "./utils.js";

const INTERVENCIONES_URL =
  "https://www.congreso.es/es/busqueda-de-intervenciones?p_p_id=intervenciones&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=filtrarListado&p_p_cacheability=cacheLevelPage";

interface RawIntervention {
  fecha?: string;
  legislatura?: string;
  orador?: string;
  cargo_orador?: string;
  pdia?: string;
  edia?: string;
  doc?: string;
  sesion?: {
    nombre_sesion?: string;
    idsesion?: string;
    fase1?: string;
    videos_fase?: {
      enlace_descarga?: string;
      enlace_emision?: string;
      legislatura?: string;
      organo?: string;
      secuencia?: string;
    };
  };
  iniciativa?: {
    objeto_iniciativa?: string;
    organo?: string;
    cini?: string;
  };
  video_intervencion?: {
    enlace_descarga02?: string;
    enlace_emision02?: string;
    inicio01?: string;
    fin01?: string;
    id01?: string;
  };
}

interface IntervencionesResponse {
  legislatura?: string;
  paginaActual?: number;
  intervenciones_encontradas?: string;
  lista_intervenciones?: Record<string, RawIntervention>;
}

export interface CongresoIntervencion {
  id: string;
  fecha: string;
  legislatura: string;
  orador: string;
  cargoOrador?: string;
  sesionNombre?: string;
  sesionNumero?: string;
  fase?: string;
  organo?: string;
  objetoIniciativa?: string;
  diarioPdfPath?: string;
  diarioPagina?: string;
  videoDescargaUrl?: string;
  videoEmisionUrl?: string;
  videoInicio?: string;
  videoFin?: string;
}

export interface CongresoIntervencionesSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  legislatura: string;
  totalFound: number;
  page: number;
  intervenciones: CongresoIntervencion[];
}

function parseDate(raw?: string): string {
  if (!raw || raw.length !== 8) return raw ?? "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function extractPage(edia?: string): string | undefined {
  if (!edia) return undefined;
  const match = edia.match(/Página\s*(\d+)/i);
  return match?.[1];
}

/**
 * Fetch a page of parliamentary interventions from Congreso.
 * Each intervention includes speaker info, diario PDF reference, and video URLs.
 * @param legislatura Legislature number (e.g. "15")
 * @param page Page number (1-indexed)
 * @param pageSize Results per page (max 50)
 */
export async function fetchCongresoIntervenciones(
  legislatura = "15",
  page = 1,
  pageSize = 50,
): Promise<CongresoIntervencionesSnapshot> {
  const body = new URLSearchParams({
    _intervenciones_legislatura: legislatura,
    _intervenciones_paginaActual: String(page),
    _intervenciones_filasPorPagina: String(pageSize),
  });

  const response = await fetch(INTERVENCIONES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; EspanaIA/0.1)",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Congreso intervenciones failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as IntervencionesResponse;
  const totalFound = Number(data.intervenciones_encontradas ?? "0");
  const lista = data.lista_intervenciones ?? {};

  const intervenciones: CongresoIntervencion[] = Object.values(lista).map((raw) => {
    const fecha = parseDate(raw.fecha);
    const orador = cleanWhitespace(raw.orador) ?? "Desconocido";
    const pdfPath = raw.pdia?.split("#")?.[0];

    return {
      id: `interv-${legislatura}-${raw.doc ?? fecha}-${orador.slice(0, 20)}`,
      fecha,
      legislatura: raw.legislatura ?? legislatura,
      orador,
      cargoOrador: raw.cargo_orador,
      sesionNombre: raw.sesion?.nombre_sesion,
      sesionNumero: raw.sesion?.idsesion,
      fase: raw.sesion?.fase1,
      organo: raw.iniciativa?.organo ?? raw.sesion?.videos_fase?.organo,
      objetoIniciativa: cleanWhitespace(raw.iniciativa?.objeto_iniciativa),
      diarioPdfPath: pdfPath ? `https://www.congreso.es/public_oficiales/L${legislatura}/${pdfPath}` : undefined,
      diarioPagina: extractPage(raw.edia),
      videoDescargaUrl: raw.video_intervencion?.enlace_descarga02 ?? raw.sesion?.videos_fase?.enlace_descarga,
      videoEmisionUrl: raw.video_intervencion?.enlace_emision02 ?? raw.sesion?.videos_fase?.enlace_emision,
      videoInicio: raw.video_intervencion?.inicio01,
      videoFin: raw.video_intervencion?.fin01,
    };
  });

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: INTERVENCIONES_URL,
    legislatura: data.legislatura ?? legislatura,
    totalFound,
    page,
    intervenciones,
  };
}
