import {
  fetchCongressDeputies,
  fetchSenateOpenDataSnapshot,
} from "@espanaia/official-connectors";
import type {
  CongressDeputyRecord,
  OfficialPoliticalProfile,
  PoliticalCensusLayer,
  PoliticalCensusSnapshot,
  SenateMemberRecord,
} from "@espanaia/shared-types";

function cleanWhitespace(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toSpanishTitleCase(value?: string | null) {
  const cleaned = cleanWhitespace(value);

  if (!cleaned) {
    return undefined;
  }

  const titleCased = cleaned
    .toLocaleLowerCase("es-ES")
    .replace(/(^|[\s\-/'’(])([\p{L}])/gu, (_, prefix: string, letter: string) => {
      return `${prefix}${letter.toLocaleUpperCase("es-ES")}`;
    });

  return titleCased.replace(
    /\b(De|Del|La|Las|Los|Y|I|Da|Das|Do|Dos|Van|Von)\b/g,
    (word) => word.toLocaleLowerCase("es-ES"),
  );
}

function normalizeCongressName(fullName: string) {
  const cleaned = cleanWhitespace(fullName) ?? fullName;
  const [lastNames, firstNames] = cleaned.split(",").map((segment) => cleanWhitespace(segment) ?? "");

  if (!firstNames) {
    return {
      fullName: toSpanishTitleCase(cleaned) ?? cleaned,
      firstNames: toSpanishTitleCase(cleaned.split(/\s+/).slice(0, -1).join(" ")) ?? cleaned,
      lastNames: toSpanishTitleCase(cleaned.split(/\s+/).slice(-1).join(" ")) ?? cleaned,
    };
  }

  const normalizedFullName = cleanWhitespace(`${firstNames} ${lastNames}`) ?? cleaned;

  return {
    fullName: toSpanishTitleCase(normalizedFullName) ?? normalizedFullName,
    firstNames: toSpanishTitleCase(firstNames) ?? firstNames,
    lastNames: toSpanishTitleCase(lastNames) ?? lastNames,
  };
}

function firstWord(value: string) {
  return value.split(/\s+/)[0] ?? value;
}

function buildShortName(firstNames: string, lastNames: string) {
  return cleanWhitespace(`${firstWord(firstNames)} ${firstWord(lastNames)}`) ?? cleanWhitespace(`${firstNames} ${lastNames}`) ?? firstNames;
}

function congressProfile(record: CongressDeputyRecord, sourceDatasetUrl: string): OfficialPoliticalProfile {
  const normalizedName = normalizeCongressName(record.fullName);
  const roleSummary = `Miembro del Congreso por ${record.constituency} en ${record.parliamentaryGroup}.`;

  return {
    id: `congreso-${slugify(normalizedName.fullName)}`,
    slug: slugify(normalizedName.fullName),
    fullName: normalizedName.fullName,
    shortName: buildShortName(normalizedName.firstNames, normalizedName.lastNames),
    chamber: "congreso",
    chamberLabel: "Congreso de los Diputados",
    legislature: "XV",
    territoryLabel: record.constituency,
    constituency: record.constituency,
    appointmentType: "Electo",
    currentPartyName: record.electoralFormation,
    parliamentaryGroup: record.parliamentaryGroup,
    currentRoleSummary: roleSummary,
    biography: record.biography,
    startedAt: record.startedAt,
    swornAt: record.swornAt,
    sourceOfTruthUrl: sourceDatasetUrl,
    sourceDatasetUrl,
  };
}

function senateProfile(record: SenateMemberRecord, sourceDatasetUrl: string): OfficialPoliticalProfile {
  const territoryLabel = record.sourceType === "designado" ? record.community ?? "Designación autonómica" : record.constituency ?? "Circunscripción pendiente";
  const appointmentType = record.sourceType === "designado" ? "Designado" : "Electo";
  const roleSummary =
    record.sourceType === "designado"
      ? `Miembro del Senado designado por ${record.community ?? "su asamblea autonómica"} en ${record.parliamentaryGroup}.`
      : `Miembro del Senado por ${record.constituency ?? "su circunscripción"} en ${record.parliamentaryGroup}.`;

  return {
    id: `senado-${record.seatNumber}`,
    slug: record.slug,
    fullName: record.fullName,
    shortName: record.shortName,
    chamber: "senado",
    chamberLabel: "Senado de España",
    legislature: record.legislature,
    territoryLabel,
    constituency: record.constituency,
    appointmentType,
    representationLabel: record.representationLabel,
    currentPartyName: record.politicalPartyName,
    currentPartyCode: record.politicalPartyCode,
    parliamentaryGroup: record.parliamentaryGroup,
    parliamentaryGroupCode: record.parliamentaryGroupCode,
    currentRoleSummary: roleSummary,
    biography:
      `Perfil parlamentario indexado desde la composición oficial del Senado. ${record.representationLabel}`,
    startedAt: record.appointedAt,
    sourceOfTruthUrl: record.profileUrl ?? sourceDatasetUrl,
    sourceDatasetUrl,
  };
}

function liveLayer(
  id: PoliticalCensusLayer["id"],
  name: string,
  scope: string,
  recordCount: number,
  note: string,
  sourceUrls: string[],
): PoliticalCensusLayer {
  return {
    id,
    name,
    status: "live",
    scope,
    recordCount,
    note,
    sourceUrls,
  };
}

function degradedLayer(
  id: PoliticalCensusLayer["id"],
  name: string,
  scope: string,
  note: string,
  sourceUrls: string[],
): PoliticalCensusLayer {
  return {
    id,
    name,
    status: "degraded",
    scope,
    recordCount: 0,
    note,
    sourceUrls,
  };
}

function plannedLayer(id: PoliticalCensusLayer["id"], name: string, scope: string, note: string): PoliticalCensusLayer {
  return {
    id,
    name,
    status: "planned",
    scope,
    recordCount: 0,
    note,
    sourceUrls: [],
  };
}

export async function buildPoliticalCensusSnapshot(): Promise<PoliticalCensusSnapshot> {
  const [congressResult, senateResult] = await Promise.allSettled([
    fetchCongressDeputies(),
    fetchSenateOpenDataSnapshot(),
  ]);

  const items: OfficialPoliticalProfile[] = [];
  const layers: PoliticalCensusLayer[] = [];

  if (congressResult.status === "fulfilled") {
    items.push(
      ...congressResult.value.records.map((record) => congressProfile(record, congressResult.value.sourceUrl)),
    );
    layers.push(
      liveLayer(
        "congreso",
        "Congreso",
        "Diputados en activo",
        congressResult.value.recordCount,
        `${congressResult.value.recordCount} diputados activos descubiertos desde open data oficial del Congreso.`,
        [congressResult.value.sourceUrl],
      ),
    );
  } else {
    layers.push(
      degradedLayer(
        "congreso",
        "Congreso",
        "Diputados en activo",
        "La última resolución del open data del Congreso falló en esta ejecución.",
        ["https://www.congreso.es/es/opendata/diputados"],
      ),
    );
  }

  if (senateResult.status === "fulfilled") {
    items.push(
      ...senateResult.value.members.records.map((record) => senateProfile(record, senateResult.value.members.sourceUrl)),
    );
    layers.push(
      liveLayer(
        "senado",
        "Senado",
        "Senadores en activo",
        senateResult.value.members.recordCount,
        `${senateResult.value.members.recordCount} senadores activos resueltos desde composición oficial, grupos y ficha parlamentaria.`,
        [senateResult.value.members.sourceUrl, senateResult.value.groups.sourceUrl],
      ),
    );
  } else {
    layers.push(
      degradedLayer(
        "senado",
        "Senado",
        "Senadores en activo",
        "La resolución del censo actual del Senado falló en esta ejecución.",
        ["https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html"],
      ),
    );
  }

  layers.push(
    plannedLayer(
      "autonomico",
      "Parlamentos autonómicos",
      "Diputados y procuradores autonómicos",
      "Siguiente fase de ingestión: cámaras autonómicas con conectores por parlamento y legislatura.",
    ),
  );
  layers.push(
    plannedLayer(
      "local",
      "Administración local",
      "Alcaldías, concejalías y diputaciones",
      "Fase posterior: censo local por capas para ayuntamientos, diputaciones y entidades supramunicipales.",
    ),
  );

  if (items.length === 0) {
    throw new Error("No se pudo construir el censo político oficial desde Congreso ni Senado.");
  }

  return {
    generatedAt: new Date().toISOString(),
    total: items.length,
    layers,
    items: items.sort((left, right) => left.fullName.localeCompare(right.fullName, "es")),
  };
}
