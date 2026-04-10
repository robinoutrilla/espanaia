import type { BoeIngestionItem, IngestionRunResult } from "@espanaia/shared-types";
import { arrayify, cleanWhitespace, fetchJson } from "./utils.js";

const BOE_API_BASE_URL = "https://www.boe.es/datosabiertos/api/boe/dias";

interface RawPdfLink {
  texto?: string;
}

interface RawBoeItem {
  identificador?: string;
  titulo?: string;
  url_html?: string;
  url_xml?: string;
  url_pdf?: RawPdfLink;
}

interface RawBoeEpigraph {
  nombre?: string;
  item?: RawBoeItem | RawBoeItem[];
  epigrafe?: RawBoeEpigraph | RawBoeEpigraph[];
}

interface RawBoeText {
  item?: RawBoeItem | RawBoeItem[];
  epigrafe?: RawBoeEpigraph | RawBoeEpigraph[];
}

interface RawBoeDepartment {
  codigo?: string;
  nombre?: string;
  item?: RawBoeItem | RawBoeItem[];
  epigrafe?: RawBoeEpigraph | RawBoeEpigraph[];
  texto?: RawBoeText;
}

interface RawBoeSection {
  codigo?: string;
  nombre?: string;
  item?: RawBoeItem | RawBoeItem[];
  epigrafe?: RawBoeEpigraph | RawBoeEpigraph[];
  texto?: RawBoeText;
  departamento?: RawBoeDepartment | RawBoeDepartment[];
}

interface RawBoeDiary {
  numero?: string;
  seccion?: RawBoeSection | RawBoeSection[];
}

interface RawBoeResponse {
  data?: {
    sumario?: {
      metadatos?: {
        fecha_publicacion?: string;
      };
      diario?: RawBoeDiary | RawBoeDiary[];
    };
  };
}

interface BoeContext {
  gazetteNumber: string;
  publicationDate: string;
  sectionCode: string;
  sectionName: string;
  departmentName?: string;
  epigraphName?: string;
}

function pushItems(items: RawBoeItem | RawBoeItem[] | undefined, context: BoeContext, records: BoeIngestionItem[]) {
  for (const item of arrayify(items)) {
    if (!item.identificador || !item.titulo) {
      continue;
    }

    records.push({
      id: item.identificador,
      publicationDate: context.publicationDate,
      gazetteNumber: context.gazetteNumber,
      sectionCode: context.sectionCode,
      sectionName: context.sectionName,
      departmentName: context.departmentName,
      epigraphName: context.epigraphName,
      title: cleanWhitespace(item.titulo) ?? item.titulo,
      htmlUrl: item.url_html,
      pdfUrl: item.url_pdf?.texto,
      xmlUrl: item.url_xml,
    });
  }
}

function collectEpigraphs(
  epigraphs: RawBoeEpigraph | RawBoeEpigraph[] | undefined,
  context: BoeContext,
  records: BoeIngestionItem[],
) {
  for (const epigraph of arrayify(epigraphs)) {
    const nextContext: BoeContext = {
      ...context,
      epigraphName: cleanWhitespace(epigraph.nombre) ?? context.epigraphName,
    };

    pushItems(epigraph.item, nextContext, records);
    collectEpigraphs(epigraph.epigrafe, nextContext, records);
  }
}

function collectText(text: RawBoeText | undefined, context: BoeContext, records: BoeIngestionItem[]) {
  if (!text) {
    return;
  }

  pushItems(text.item, context, records);
  collectEpigraphs(text.epigrafe, context, records);
}

function collectDepartments(
  departments: RawBoeDepartment | RawBoeDepartment[] | undefined,
  context: BoeContext,
  records: BoeIngestionItem[],
) {
  for (const department of arrayify(departments)) {
    const nextContext: BoeContext = {
      ...context,
      departmentName: cleanWhitespace(department.nombre) ?? context.departmentName,
    };

    pushItems(department.item, nextContext, records);
    collectEpigraphs(department.epigrafe, nextContext, records);
    collectText(department.texto, nextContext, records);
  }
}

function collectSections(
  sections: RawBoeSection | RawBoeSection[] | undefined,
  gazetteNumber: string,
  publicationDate: string,
) {
  const records: BoeIngestionItem[] = [];

  for (const section of arrayify(sections)) {
    const context: BoeContext = {
      gazetteNumber,
      publicationDate,
      sectionCode: section.codigo ?? "unknown",
      sectionName: cleanWhitespace(section.nombre) ?? "Sin sección",
    };

    pushItems(section.item, context, records);
    collectEpigraphs(section.epigrafe, context, records);
    collectText(section.texto, context, records);
    collectDepartments(section.departamento, context, records);
  }

  return records;
}

export async function fetchBoeSummary(date: string): Promise<IngestionRunResult<BoeIngestionItem>> {
  const sourceUrl = `${BOE_API_BASE_URL}/${date}`;
  const payload = await fetchJson<RawBoeResponse>(sourceUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  const publicationDate = payload.data?.sumario?.metadatos?.fecha_publicacion ?? date;
  const diaries = arrayify(payload.data?.sumario?.diario);
  const records = diaries.flatMap((diary) =>
    collectSections(diary.seccion, diary.numero ?? "unknown", publicationDate),
  );

  return {
    connectorId: "connector-boe-sumario",
    requestedAt: new Date().toISOString(),
    sourceUrl,
    recordCount: records.length,
    records,
  };
}
