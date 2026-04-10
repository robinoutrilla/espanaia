/* ═══════════════════════════════════════════════════════════════════════════
   Seguridad Social — Statistics index & metadata
   The seg-social.es site is JS-rendered, so we can't scrape data tables.
   Instead, this connector indexes the available statistics sections and
   their sub-categories, creating a structured catalog of what's available.
   ═══════════════════════════════════════════════════════════════════════════ */

import { fetchText, cleanWhitespace, slugify } from "./utils.js";

const BASE = "https://www.seg-social.es";
const STATS_URL = `${BASE}/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas`;

/** Known statistics sections and their codes */
const KNOWN_SECTIONS: Array<{
  code: string;
  name: string;
  category: string;
  description: string;
}> = [
  { code: "EST8", name: "Pensiones y pensionistas del Sistema de la Seguridad Social", category: "pensiones", description: "Datos sobre pensiones contributivas, clases y regímenes." },
  { code: "EST20", name: "Afiliación de trabajadores al Sistema de la Seguridad Social", category: "afiliacion", description: "Afiliados en alta laboral por régimen, sector y territorio." },
  { code: "EST211", name: "Afiliación media de trabajadores", category: "afiliacion", description: "Afiliación media mensual por régimen y comunidad autónoma." },
  { code: "EST23", name: "Empresas inscritas en la Seguridad Social", category: "empresas", description: "Empresas y centros de cotización por tamaño y sector." },
  { code: "EST231", name: "Empresas inscritas por tamaño de empresa", category: "empresas", description: "Distribución de empresas según número de trabajadores." },
  { code: "EST45", name: "Prestaciones económicas del Sistema", category: "prestaciones", description: "Incapacidad temporal, maternidad, paternidad, riesgo embarazo." },
  { code: "EST50", name: "Presupuestos y liquidaciones", category: "presupuesto", description: "Ingresos, gastos y liquidación presupuestaria del sistema." },
  { code: "EST66", name: "Recaudación del Sistema de Seguridad Social", category: "recaudacion", description: "Recaudación líquida por régimen y territorio." },
  { code: "1421", name: "Otras estadísticas", category: "general", description: "Boletines de estadísticas laborales, notas de coyuntura." },
];

export interface SegSocialStatSection {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  url: string;
  subSections: Array<{ code: string; name: string; url: string }>;
}

export interface SegSocialSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalSections: number;
  sections: SegSocialStatSection[];
}

/**
 * Fetch the Seg Social statistics index, enriching known sections
 * with any sub-sections discovered from the live page.
 */
export async function fetchSegSocialStats(): Promise<SegSocialSnapshot> {
  const sections: SegSocialStatSection[] = [];

  // For each known section, try to fetch sub-sections from the page
  for (const section of KNOWN_SECTIONS) {
    const sectionUrl = `${STATS_URL}/${section.code}`;
    const subSections: Array<{ code: string; name: string; url: string }> = [];

    try {
      const html = await fetchText(sectionUrl);

      // Extract links to sub-sections (EST + number pattern)
      const linkPattern = /href="([^"]*\/Estadisticas\/[^"]*\/([A-Z]*\d+)[^"]*)"/gi;
      let match: RegExpExecArray | null;
      const seenCodes = new Set<string>();

      while ((match = linkPattern.exec(html)) !== null) {
        const subUrl = match[1];
        const subCode = match[2];
        if (subCode && subCode !== section.code && !seenCodes.has(subCode)) {
          seenCodes.add(subCode);
          // Try to get the link text
          const linkTextPattern = new RegExp(
            `href="[^"]*${subCode}[^"]*"[^>]*>([^<]+)`,
          );
          const textMatch = html.match(linkTextPattern);
          const name = cleanWhitespace(textMatch?.[1]) ?? subCode;
          subSections.push({
            code: subCode,
            name,
            url: subUrl.startsWith("http") ? subUrl : `${BASE}${subUrl}`,
          });
        }
      }
    } catch {
      // Page might not load (JS-rendered), but we still record the section
    }

    sections.push({
      id: `segsocial-${slugify(section.code)}`,
      code: section.code,
      name: section.name,
      category: section.category,
      description: section.description,
      url: sectionUrl,
      subSections,
    });
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: STATS_URL,
    totalSections: sections.length,
    sections,
  };
}
