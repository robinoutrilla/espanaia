/* ═══════════════════════════════════════════════════════════════════════════
   CDTI — Centro para el Desarrollo Tecnológico e Industrial
   The main cdti.es site is behind Incapsula WAF, blocking automated access.
   This connector provides a structured catalog of known CDTI programs and
   funding lines with their metadata.
   ═══════════════════════════════════════════════════════════════════════════ */

import { slugify } from "./utils.js";

export interface CDTIProgram {
  id: string;
  name: string;
  category: "financiacion" | "perte" | "cooperacion" | "innovacion";
  description: string;
  url: string;
  status: "activo" | "cerrado" | "permanente";
}

export interface CDTISnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalPrograms: number;
  programs: CDTIProgram[];
  note: string;
}

/** Known CDTI programs and funding lines */
const CDTI_PROGRAMS: Omit<CDTIProgram, "id">[] = [
  { name: "Proyectos de I+D", category: "financiacion", description: "Financiación de proyectos de investigación industrial y desarrollo experimental.", url: "https://www.cdti.es/ayudas/proyectos-de-id", status: "permanente" },
  { name: "Línea Directa de Innovación", category: "innovacion", description: "Apoyo a la incorporación de tecnologías innovadoras en empresas.", url: "https://www.cdti.es/ayudas/linea-directa-de-innovacion", status: "permanente" },
  { name: "Proyectos de Transferencia Cervera", category: "innovacion", description: "Transferencia de tecnología desde Centros Tecnológicos de Excelencia Cervera.", url: "https://www.cdti.es/ayudas/cervera", status: "activo" },
  { name: "PERTE Chip — Microelectrónica y Semiconductores", category: "perte", description: "Proyecto estratégico para la cadena de valor de semiconductores en España.", url: "https://www.cdti.es/ayudas/perte-chip", status: "activo" },
  { name: "PERTE Agroalimentario", category: "perte", description: "Transformación de la cadena agroalimentaria y economía circular.", url: "https://www.cdti.es/ayudas/perte-agroalimentario", status: "activo" },
  { name: "PERTE Aeroespacial", category: "perte", description: "Desarrollo de la industria aeroespacial española y acceso al espacio.", url: "https://www.cdti.es/ayudas/perte-aeroespacial", status: "activo" },
  { name: "PERTE Salud de Vanguardia", category: "perte", description: "Medicina personalizada, terapias avanzadas y salud digital.", url: "https://www.cdti.es/ayudas/perte-salud", status: "activo" },
  { name: "PERTE Nueva Economía de la Lengua", category: "perte", description: "Tecnologías del lenguaje, IA y procesamiento del español.", url: "https://www.cdti.es/ayudas/perte-lengua", status: "activo" },
  { name: "Misiones Ciencia e Innovación", category: "financiacion", description: "Grandes proyectos colaborativos público-privados en áreas estratégicas.", url: "https://www.cdti.es/ayudas/misiones", status: "activo" },
  { name: "Programa Eureka", category: "cooperacion", description: "Cooperación tecnológica internacional: Eurostars, Clusters, Network Projects.", url: "https://www.cdti.es/ayudas/eureka", status: "permanente" },
  { name: "Programa Bilateral de Cooperación Tecnológica", category: "cooperacion", description: "Acuerdos bilaterales I+D con Japón, Corea, China, India, Canadá, etc.", url: "https://www.cdti.es/ayudas/bilaterales", status: "permanente" },
  { name: "NEOTEC — Creación de Empresas de Base Tecnológica", category: "innovacion", description: "Subvenciones para nuevas empresas de base tecnológica (startups deep-tech).", url: "https://www.cdti.es/ayudas/neotec", status: "activo" },
  { name: "Programa Horizonte Europa — Sello de Excelencia", category: "cooperacion", description: "Cofinanciación de proyectos con Sello de Excelencia de Horizonte Europa.", url: "https://www.cdti.es/ayudas/horizonte-europa", status: "activo" },
  { name: "Programa INNVIERTE", category: "financiacion", description: "Capital riesgo público para empresas innovadoras en fases tempranas.", url: "https://www.cdti.es/ayudas/innvierte", status: "permanente" },
  { name: "Línea de Innovación Global", category: "cooperacion", description: "Apoyo a la internacionalización tecnológica de empresas españolas.", url: "https://www.cdti.es/ayudas/innovacion-global", status: "permanente" },
];

/**
 * Returns the CDTI program catalog.
 * Note: cdti.es blocks automated access (Incapsula WAF).
 * This provides structured metadata about known programs.
 */
export async function fetchCDTIData(): Promise<CDTISnapshot> {
  const programs: CDTIProgram[] = CDTI_PROGRAMS.map((p) => ({
    id: `cdti-${slugify(p.name).slice(0, 60)}`,
    ...p,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: "https://www.cdti.es/ayudas",
    totalPrograms: programs.length,
    programs,
    note: "cdti.es behind Incapsula WAF — catalog based on known programs. Live scraping requires headless browser.",
  };
}
