/* ═══════════════════════════════════════════════════════════════════════════
   Parlamento Europeo — Eurodiputados españoles
   Uses the official data.europarl.europa.eu REST API.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchJson, slugify } from "./utils.js";

const EP_API_BASE = "https://data.europarl.europa.eu/api/v2";

interface RawMEP {
  id?: string;
  identifier?: string;
  label?: string;
  familyName?: string;
  givenName?: string;
  sortLabel?: string;
}

interface RawMEPDetail {
  id?: string;
  identifier?: string;
  label?: string;
  familyName?: string;
  givenName?: string;
  citizenship?: string | { id?: string };
  hasMandate?: Array<{
    role?: string | { prefLabel?: { es?: string } };
    organization?: { prefLabel?: { es?: string; en?: string } };
    startDate?: string;
    endDate?: string;
  }>;
  hasMembership?: Array<{
    memberDuring?: { startDate?: string; endDate?: string };
    organization?: { id?: string; prefLabel?: { es?: string; en?: string } };
  }>;
}

export interface EuroMEP {
  slug: string;
  epId: string;
  fullName: string;
  familyName: string;
  givenName: string;
  country: string;
  politicalGroup?: string;
  nationalParty?: string;
  profileUrl: string;
}

export interface EuroMEPSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  meps: EuroMEP[];
}

export async function fetchSpanishMEPs(): Promise<EuroMEPSnapshot> {
  const sourceUrl = `${EP_API_BASE}/meps?country-of-representation=ES&format=application%2Fld%2Bjson`;
  const response = await fetchJson<{ data?: RawMEP[] }>(sourceUrl, {
    headers: { Accept: "application/ld+json" },
  });

  const rawMeps = response.data ?? [];
  const meps: EuroMEP[] = [];

  for (const raw of rawMeps) {
    const id = raw.identifier ?? raw.id?.split("/").pop() ?? "";
    const givenName = cleanWhitespace(raw.givenName) ?? "";
    const familyName = cleanWhitespace(raw.familyName) ?? "";
    const fullName = cleanWhitespace(raw.label) ?? `${givenName} ${familyName}`;

    if (!id || !fullName || fullName.length < 3) continue;

    meps.push({
      slug: slugify(fullName),
      epId: id,
      fullName,
      familyName,
      givenName,
      country: "ES",
      profileUrl: `https://www.europarl.europa.eu/meps/es/${id}`,
    });
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl,
    meps,
  };
}

/**
 * Fetch details for a single MEP (political group, national party).
 * Useful for enrichment but slower — one call per MEP.
 */
export async function fetchMEPDetail(epId: string): Promise<RawMEPDetail | null> {
  try {
    const url = `${EP_API_BASE}/meps/${epId}?format=application%2Fld%2Bjson`;
    return await fetchJson<RawMEPDetail>(url, {
      headers: { Accept: "application/ld+json" },
    });
  } catch {
    return null;
  }
}
