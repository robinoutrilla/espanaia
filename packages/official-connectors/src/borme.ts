import type {
  AuxiliaryCatalogItem,
  AuxiliaryDatasetId,
  BormeIngestionItem,
  IngestionRunResult,
} from "@espanaia/shared-types";
import { arrayify, cleanWhitespace, fetchJson } from "./utils.js";

const BORME_API_BASE_URL = "https://www.boe.es/datosabiertos/api/borme/sumario";
const AUXILIARY_DATA_API_BASE_URL = "https://www.boe.es/datosabiertos/api/datos-auxiliares";

interface RawPdfLink {
  szBytes?: string;
  szKBytes?: string;
  pagina_inicial?: string;
  pagina_final?: string;
  texto?: string;
}

interface RawBormeItem {
  identificador?: string;
  titulo?: string;
  url_pdf?: RawPdfLink;
  url_html?: string;
  url_xml?: string;
}

interface RawBormeApartado {
  codigo?: string;
  nombre?: string;
  item?: RawBormeItem | RawBormeItem[];
}

interface RawBormeSection {
  codigo?: string;
  nombre?: string;
  item?: RawBormeItem | RawBormeItem[];
  apartado?: RawBormeApartado | RawBormeApartado[];
}

interface RawBormeDiary {
  numero?: string;
  seccion?: RawBormeSection | RawBormeSection[];
}

interface RawBormeResponse {
  data?: {
    sumario?: {
      metadatos?: {
        publicacion?: string;
        fecha_publicacion?: string;
      };
      diario?: RawBormeDiary | RawBormeDiary[];
    };
  };
}

interface RawAuxiliaryDataResponse {
  data?: Record<string, string>;
}

interface BormeContext {
  publicationDate: string;
  diaryNumber: string;
  sectionCode: string;
  sectionName: string;
  apartadoCode?: string;
  apartadoName?: string;
}

function toOptionalNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function pushItems(
  items: RawBormeItem | RawBormeItem[] | undefined,
  context: BormeContext,
  records: BormeIngestionItem[],
) {
  for (const item of arrayify(items)) {
    if (!item.identificador || !item.titulo || !item.url_pdf?.texto) {
      continue;
    }

    records.push({
      id: item.identificador,
      publicationDate: context.publicationDate,
      diaryNumber: context.diaryNumber,
      sectionCode: context.sectionCode,
      sectionName: context.sectionName,
      apartadoCode: context.apartadoCode,
      apartadoName: context.apartadoName,
      title: cleanWhitespace(item.titulo) ?? item.titulo,
      pdfUrl: item.url_pdf.texto,
      pdfSizeBytes: toOptionalNumber(item.url_pdf.szBytes),
      pdfSizeKBytes: toOptionalNumber(item.url_pdf.szKBytes),
      pageStart: toOptionalNumber(item.url_pdf.pagina_inicial),
      pageEnd: toOptionalNumber(item.url_pdf.pagina_final),
      htmlUrl: item.url_html,
      xmlUrl: item.url_xml,
    });
  }
}

function collectSections(
  sections: RawBormeSection | RawBormeSection[] | undefined,
  diaryNumber: string,
  publicationDate: string,
) {
  const records: BormeIngestionItem[] = [];

  for (const section of arrayify(sections)) {
    const sectionContext: BormeContext = {
      publicationDate,
      diaryNumber,
      sectionCode: section.codigo ?? "unknown",
      sectionName: cleanWhitespace(section.nombre) ?? "Sin sección",
    };

    pushItems(section.item, sectionContext, records);

    for (const apartado of arrayify(section.apartado)) {
      pushItems(
        apartado.item,
        {
          ...sectionContext,
          apartadoCode: apartado.codigo,
          apartadoName: cleanWhitespace(apartado.nombre) ?? apartado.nombre,
        },
        records,
      );
    }
  }

  return records;
}

export async function fetchBormeSummary(date: string): Promise<IngestionRunResult<BormeIngestionItem>> {
  const sourceUrl = `${BORME_API_BASE_URL}/${date}`;
  const payload = await fetchJson<RawBormeResponse>(sourceUrl, {
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
    connectorId: "connector-borme-sumario",
    requestedAt: new Date().toISOString(),
    sourceUrl,
    recordCount: records.length,
    records,
  };
}

export async function fetchAuxiliaryDataset(dataset: AuxiliaryDatasetId) {
  const sourceUrl = `${AUXILIARY_DATA_API_BASE_URL}/${dataset}`;
  const payload = await fetchJson<RawAuxiliaryDataResponse>(sourceUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  const items: AuxiliaryCatalogItem[] = Object.entries(payload.data ?? {})
    .map(([id, label]) => ({
      id,
      label: cleanWhitespace(label) ?? label,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "es"));

  return {
    dataset,
    requestedAt: new Date().toISOString(),
    sourceUrl,
    total: items.length,
    items,
  };
}
