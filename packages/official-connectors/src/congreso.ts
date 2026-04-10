import type {
  CongressDeputyRecord,
  CongressInitiativeRecord,
  IngestionRunResult,
} from "@espanaia/shared-types";
import {
  absoluteUrl,
  cleanWhitespace,
  extractRequiredMatch,
  fetchJson,
  fetchText,
  parseSpanishDate,
  slugify,
  splitUrls,
} from "./utils.js";

const CONGRESS_BASE_URL = "https://www.congreso.es";
const CONGRESS_INITIATIVES_PAGE_URL = "https://www.congreso.es/es/opendata/iniciativas";
const CONGRESS_DEPUTIES_PAGE_URL = "https://www.congreso.es/es/opendata/diputados";

interface RawCongressDeputy {
  NOMBRE?: string;
  CIRCUNSCRIPCION?: string;
  FORMACIONELECTORAL?: string;
  FECHACONDICIONPLENA?: string;
  FECHAALTA?: string;
  GRUPOPARLAMENTARIO?: string;
  BIOGRAFIA?: string;
}

interface RawCongressInitiative {
  LEGISLATURA?: string;
  TIPO?: string;
  NUMEXPEDIENTE?: string;
  OBJETO?: string;
  AUTOR?: string;
  SITUACIONACTUAL?: string;
  RESULTADOTRAMITACION?: string;
  COMISIONCOMPETENTE?: string;
  FECHAPRESENTACION?: string;
  FECHACALIFICACION?: string;
  ENLACESBOCG?: string;
}

export interface CongressFeedDiscovery {
  approvedInitiativesUrl: string;
  projectsOfLawUrl: string;
  propositionsOfLawUrl: string;
  activeDeputiesUrl: string;
}

function normalizeInitiativeId(dossierNumber: string) {
  return `initiative-${dossierNumber.replace(/[^0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

export async function discoverCongressFeedUrls(): Promise<CongressFeedDiscovery> {
  const [initiativesHtml, deputiesHtml] = await Promise.all([
    fetchText(CONGRESS_INITIATIVES_PAGE_URL),
    fetchText(CONGRESS_DEPUTIES_PAGE_URL),
  ]);

  return {
    approvedInitiativesUrl: absoluteUrl(
      extractRequiredMatch(
        "approved initiatives feed",
        initiativesHtml,
        /href="(\/webpublica\/opendata\/iniciativas\/IniciativasLegislativasAprobadas__\d+\.json)"/,
      ),
      CONGRESS_BASE_URL,
    ),
    projectsOfLawUrl: absoluteUrl(
      extractRequiredMatch(
        "projects of law feed",
        initiativesHtml,
        /href="(\/webpublica\/opendata\/iniciativas\/ProyectosDeLey__\d+\.json)"/,
      ),
      CONGRESS_BASE_URL,
    ),
    propositionsOfLawUrl: absoluteUrl(
      extractRequiredMatch(
        "propositions of law feed",
        initiativesHtml,
        /href="(\/webpublica\/opendata\/iniciativas\/ProposicionesDeLey__\d+\.json)"/,
      ),
      CONGRESS_BASE_URL,
    ),
    activeDeputiesUrl: absoluteUrl(
      extractRequiredMatch(
        "active deputies feed",
        deputiesHtml,
        /href="(\/webpublica\/opendata\/diputados\/DiputadosActivos__\d+\.json)"/,
      ),
      CONGRESS_BASE_URL,
    ),
  };
}

function normalizeDeputy(record: RawCongressDeputy): CongressDeputyRecord | null {
  if (!record.NOMBRE) {
    return null;
  }

  return {
    slug: slugify(record.NOMBRE),
    fullName: cleanWhitespace(record.NOMBRE) ?? record.NOMBRE,
    constituency: cleanWhitespace(record.CIRCUNSCRIPCION) ?? "Desconocida",
    electoralFormation: cleanWhitespace(record.FORMACIONELECTORAL) ?? "Desconocida",
    parliamentaryGroup: cleanWhitespace(record.GRUPOPARLAMENTARIO) ?? "Desconocido",
    swornAt: parseSpanishDate(record.FECHACONDICIONPLENA),
    startedAt: parseSpanishDate(record.FECHAALTA),
    biography: cleanWhitespace(record.BIOGRAFIA),
  };
}

function normalizeInitiative(record: RawCongressInitiative): CongressInitiativeRecord | null {
  if (!record.NUMEXPEDIENTE || !record.OBJETO || !record.TIPO) {
    return null;
  }

  return {
    id: normalizeInitiativeId(record.NUMEXPEDIENTE),
    legislature: cleanWhitespace(record.LEGISLATURA) ?? "Legislatura desconocida",
    initiativeType: cleanWhitespace(record.TIPO) ?? record.TIPO,
    dossierNumber: record.NUMEXPEDIENTE,
    object: cleanWhitespace(record.OBJETO) ?? record.OBJETO,
    author: cleanWhitespace(record.AUTOR) ?? "Desconocido",
    status: cleanWhitespace(record.SITUACIONACTUAL) ?? "Sin estado",
    result: cleanWhitespace(record.RESULTADOTRAMITACION),
    commission: cleanWhitespace(record.COMISIONCOMPETENTE),
    qualificationDate: parseSpanishDate(record.FECHACALIFICACION),
    filedAt: parseSpanishDate(record.FECHAPRESENTACION),
    publications: splitUrls(record.ENLACESBOCG),
  };
}

export async function fetchCongressDeputies(
  sourceUrl?: string,
): Promise<IngestionRunResult<CongressDeputyRecord>> {
  const discovery = sourceUrl ? null : await discoverCongressFeedUrls();
  const resolvedSourceUrl = sourceUrl ?? discovery?.activeDeputiesUrl ?? CONGRESS_DEPUTIES_PAGE_URL;
  const payload = await fetchJson<RawCongressDeputy[]>(resolvedSourceUrl);
  const records = payload.map(normalizeDeputy).filter((record): record is CongressDeputyRecord => Boolean(record));

  return {
    connectorId: "connector-congreso-diputados",
    requestedAt: new Date().toISOString(),
    sourceUrl: resolvedSourceUrl,
    recordCount: records.length,
    records,
  };
}

export async function fetchCongressProjectsOfLaw(
  sourceUrl?: string,
): Promise<IngestionRunResult<CongressInitiativeRecord>> {
  const discovery = sourceUrl ? null : await discoverCongressFeedUrls();
  const resolvedSourceUrl = sourceUrl ?? discovery?.projectsOfLawUrl ?? CONGRESS_INITIATIVES_PAGE_URL;
  const payload = await fetchJson<RawCongressInitiative[]>(resolvedSourceUrl);
  const records = payload
    .map(normalizeInitiative)
    .filter((record): record is CongressInitiativeRecord => Boolean(record));

  return {
    connectorId: "connector-congreso-iniciativas",
    requestedAt: new Date().toISOString(),
    sourceUrl: resolvedSourceUrl,
    recordCount: records.length,
    records,
  };
}

export async function fetchCongressOpenDataSnapshot() {
  const discovery = await discoverCongressFeedUrls();
  const [deputies, projectsOfLaw] = await Promise.all([
    fetchCongressDeputies(discovery.activeDeputiesUrl),
    fetchCongressProjectsOfLaw(discovery.projectsOfLawUrl),
  ]);

  return {
    discovery,
    deputies,
    projectsOfLaw,
  };
}
