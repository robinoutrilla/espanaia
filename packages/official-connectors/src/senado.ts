import type {
  IngestionRunResult,
  SenateGroupRecord,
  SenateMemberRecord,
} from "@espanaia/shared-types";
import {
  absoluteUrl,
  cleanWhitespace,
  extractXmlAttribute,
  extractXmlBlocks,
  extractXmlValue,
  fetchText,
  normalizePersonMatchKey,
  parseSpanishDate,
  slugify,
  toSpanishTitleCase,
} from "./utils.js";

const SENATE_BASE_URL = "https://www.senado.es";
const SENATE_CURRENT_COMPOSITION_URL = "https://www.senado.es/web/ficopendataservlet?tipoFich=20";
const SENATE_GROUPS_URL = (legislature: string) =>
  `https://www.senado.es/web/ficopendataservlet?tipoFich=4&legis=${encodeURIComponent(legislature)}`;
const SENATE_GROUP_DETAIL_URL = (groupCode: string) =>
  `https://www.senado.es/web/composicionorganizacion/gruposparlamentarios/composiciongruposparlamentarios/fichaGrupoParlamentario/index.html?id=${encodeURIComponent(groupCode)}`;

interface SenateSeatDraft {
  seatNumber: number;
  legislature: string;
  fullName: string;
  shortName: string;
  firstNames: string;
  lastNames: string;
  politicalPartyCode: string;
  sourceType: "electo" | "designado";
  appointedAt?: string;
  gender?: string;
  community?: string;
  constituency?: string;
}

interface SenateGroupMemberEntry {
  matchKey: string;
  parliamentaryGroup: string;
  parliamentaryGroupCode?: string;
  profileUrl: string;
}

interface SenatePartyLookupEntry {
  name: string;
}

export interface SenateFeedDiscovery {
  currentCompositionUrl: string;
  groupsUrl: string;
}

function firstWord(value: string) {
  return value.split(/\s+/)[0] ?? value;
}

function buildShortName(firstNames: string, lastNames: string) {
  return cleanWhitespace(`${firstWord(firstNames)} ${firstWord(lastNames)}`) ?? cleanWhitespace(`${firstNames} ${lastNames}`) ?? firstNames;
}

function parseSeatDrafts(xml: string) {
  const legislature = extractXmlAttribute(xml, "legislatura") ?? "Actual";

  return extractXmlBlocks(xml, "escaño").flatMap((seatBlock) => {
    const seatNumber = Number(extractXmlValue(seatBlock, "número"));
    const firstNames = toSpanishTitleCase(extractXmlValue(seatBlock, "nombre"));
    const lastNames = toSpanishTitleCase(extractXmlValue(seatBlock, "apellidos"));
    const politicalPartyCode = cleanWhitespace(extractXmlValue(seatBlock, "partido_político"));

    if (!seatNumber || !firstNames || !lastNames || !politicalPartyCode) {
      return [];
    }

    const fullName = cleanWhitespace(`${firstNames} ${lastNames}`) ?? `${firstNames} ${lastNames}`;
    const sourceType = extractXmlValue(seatBlock, "procedencia")?.toLowerCase() === "designado" ? "designado" : "electo";

    return [
      {
        seatNumber,
        legislature,
        fullName,
        shortName: buildShortName(firstNames, lastNames),
        firstNames,
        lastNames,
        politicalPartyCode,
        sourceType,
        appointedAt: parseSpanishDate(extractXmlValue(seatBlock, "fecha_designación")),
        gender: toSpanishTitleCase(extractXmlValue(seatBlock, "sexo")),
        community: toSpanishTitleCase(extractXmlValue(seatBlock, "comunidad_autónoma")),
        constituency: toSpanishTitleCase(extractXmlValue(seatBlock, "circunscripción")),
      } satisfies SenateSeatDraft,
    ];
  });
}

function parseGroupRecords(xml: string, legislature: string) {
  const partyNameByCode = new Map<string, SenatePartyLookupEntry>();
  const records = extractXmlBlocks(xml, "Grupo").flatMap((groupBlock) => {
    const headerBlock = extractXmlBlocks(groupBlock, "datosCabecera")[0];

    if (!headerBlock) {
      return [];
    }

    const partyBlocks = extractXmlBlocks(groupBlock, "partido");
    const partyCodes: string[] = [];
    const partyNames: string[] = [];

    for (const partyBlock of partyBlocks) {
      const partyCode = cleanWhitespace(extractXmlValue(partyBlock, "partidoSiglas") ?? extractXmlValue(partyBlock, "partidoCod"));
      const partyName = cleanWhitespace(extractXmlValue(partyBlock, "partidoNombre"));

      if (!partyCode || !partyName) {
        continue;
      }

      partyCodes.push(partyCode);
      partyNames.push(partyName);

      if (!partyNameByCode.has(partyCode)) {
        partyNameByCode.set(partyCode, { name: partyName });
      }
    }

    const name = cleanWhitespace(extractXmlValue(headerBlock, "nombre"));
    const acronym = cleanWhitespace(extractXmlValue(headerBlock, "siglas"));
    const code = cleanWhitespace(extractXmlValue(headerBlock, "codigo"));

    if (!name || !acronym || !code) {
      return [];
    }

    return [
      {
        code,
        legislature,
        name,
        acronym,
        totalMembers: Number(extractXmlValue(headerBlock, "total") ?? 0),
        totalElectedMembers: Number(extractXmlValue(headerBlock, "totalElectos") ?? 0),
        totalAppointedMembers: Number(extractXmlValue(headerBlock, "totalDesignados") ?? 0),
        partyCodes,
        partyNames,
      } satisfies SenateGroupRecord,
    ];
  });

  return {
    records,
    partyNameByCode,
  };
}

function parseGroupMemberEntries(html: string, group: SenateGroupRecord) {
  const memberPattern =
    /<a href="([^"]*fichasenador\/index\.html[^"]*)" title="Ficha de ([^"]+)" class="col-1[^"]*">/g;
  const entries: SenateGroupMemberEntry[] = [];

  for (const match of html.matchAll(memberPattern)) {
    const profilePath = match[1];
    const displayedName = cleanWhitespace(match[2]);

    if (!profilePath || !displayedName) {
      continue;
    }

    entries.push({
      matchKey: normalizePersonMatchKey(displayedName),
      parliamentaryGroup: group.name,
      parliamentaryGroupCode: group.acronym,
      profileUrl: absoluteUrl(profilePath, SENATE_BASE_URL),
    });
  }

  return entries;
}

async function fetchGroupMemberLookup(groups: SenateGroupRecord[]) {
  const pages = await Promise.all(
    groups.map(async (group) => ({
      group,
      html: await fetchText(SENATE_GROUP_DETAIL_URL(group.code)),
    })),
  );

  const lookup = new Map<string, SenateGroupMemberEntry>();

  for (const page of pages) {
    for (const entry of parseGroupMemberEntries(page.html, page.group)) {
      if (!lookup.has(entry.matchKey)) {
        lookup.set(entry.matchKey, entry);
      }
    }
  }

  return lookup;
}

function finalizeSenateMemberRecord(
  seat: SenateSeatDraft,
  groupMemberLookup: Map<string, SenateGroupMemberEntry>,
  partyNameByCode: Map<string, SenatePartyLookupEntry>,
): SenateMemberRecord {
  const lookupEntry = groupMemberLookup.get(normalizePersonMatchKey(seat.fullName));
  const territoryLabel = seat.sourceType === "designado" ? seat.community : seat.constituency;

  return {
    slug: slugify(seat.fullName),
    seatNumber: seat.seatNumber,
    legislature: seat.legislature,
    fullName: seat.fullName,
    shortName: seat.shortName,
    firstNames: seat.firstNames,
    lastNames: seat.lastNames,
    politicalPartyCode: seat.politicalPartyCode,
    politicalPartyName: partyNameByCode.get(seat.politicalPartyCode)?.name ?? seat.politicalPartyCode,
    parliamentaryGroup: lookupEntry?.parliamentaryGroup ?? "Grupo parlamentario pendiente de resolver",
    parliamentaryGroupCode: lookupEntry?.parliamentaryGroupCode,
    sourceType: seat.sourceType,
    representationLabel:
      seat.sourceType === "designado"
        ? `Designado: ${territoryLabel ?? "Procedencia no resuelta"}`
        : `Electo: ${territoryLabel ?? "Circunscripción no resuelta"}`,
    constituency: seat.constituency,
    community: seat.community,
    appointedAt: seat.appointedAt,
    gender: seat.gender,
    profileUrl: lookupEntry?.profileUrl,
  };
}

export async function fetchSenateGroups(legislature = "15"): Promise<IngestionRunResult<SenateGroupRecord>> {
  const sourceUrl = SENATE_GROUPS_URL(legislature);
  const xml = await fetchText(sourceUrl);
  const { records } = parseGroupRecords(xml, legislature);

  return {
    connectorId: "connector-senado-grupos",
    requestedAt: new Date().toISOString(),
    sourceUrl,
    recordCount: records.length,
    records,
  };
}

export async function fetchSenateCurrentComposition(): Promise<IngestionRunResult<SenateMemberRecord>> {
  const compositionXml = await fetchText(SENATE_CURRENT_COMPOSITION_URL);
  const seatDrafts = parseSeatDrafts(compositionXml);
  const legislature = seatDrafts[0]?.legislature ?? extractXmlAttribute(compositionXml, "legislatura") ?? "15";
  const groupsXml = await fetchText(SENATE_GROUPS_URL(legislature));
  const { partyNameByCode, records: groupRecords } = parseGroupRecords(groupsXml, legislature);
  const groupMemberLookup = await fetchGroupMemberLookup(groupRecords);
  const records = seatDrafts.map((seat) => finalizeSenateMemberRecord(seat, groupMemberLookup, partyNameByCode));

  return {
    connectorId: "connector-senado-composicion",
    requestedAt: new Date().toISOString(),
    sourceUrl: SENATE_CURRENT_COMPOSITION_URL,
    recordCount: records.length,
    records,
  };
}

export async function fetchSenateOpenDataSnapshot() {
  const members = await fetchSenateCurrentComposition();
  const groups = await fetchSenateGroups(members.records[0]?.legislature ?? "15");

  return {
    discovery: {
      currentCompositionUrl: SENATE_CURRENT_COMPOSITION_URL,
      groupsUrl: groups.sourceUrl,
    } satisfies SenateFeedDiscovery,
    members,
    groups,
  };
}
