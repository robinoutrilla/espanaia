/* ═══════════════════════════════════════════════════════════════════════════
   Polling-based Electoral Model — D'Hondt seat allocation using demoscopic
   data (CIS, Sigma Dos, Simple Lógica, etc.) cross-referenced with
   constituency-level distribution.

   This module provides:
   1. Latest polling averages by party (vote share %)
   2. D'Hondt seat allocation with constituency dispersion model
   3. Parameterizable simulation (adjust participation, vote shares)
   ═══════════════════════════════════════════════════════════════════════════ */

import { CONGRESS_TOTAL_SEATS } from "./parliamentary-data";

// ── Polling Data (aggregate of recent polls, Apr 2026) ─────────────────

export interface PartyPolling {
  slug: string;
  name: string;
  acronym: string;
  /** Vote share % from polling average */
  voteSharePct: number;
  /** Current seats in Congress */
  currentSeats: number;
  /** Color for UI */
  color: string;
  /**
   * Constituency concentration factor (0-1).
   * 1.0 = all votes concentrated in few constituencies (regional parties)
   * Low values = votes spread thinly across all 52 constituencies.
   * Small national parties with spread votes waste most of them below
   * the 3% per-constituency threshold.
   */
  concentration: number;
}

/**
 * Aggregate polling averages — based on CIS barometer, Sigma Dos,
 * Simple Lógica, Electomania, and GAD3 (Mar-Apr 2026 cycle).
 *
 * These reflect the latest demoscopic consensus. The sum of major parties
 * is ~92-95%, remainder goes to "Otros" (regional/local parties).
 *
 * Concentration factors model the constituency-level vote distribution:
 * - Regional parties (ERC, Junts, EH Bildu, PNV, BNG, CC) concentrate
 *   100% of their votes in 2-8 constituencies → high efficiency
 * - Large national parties (PP, PSOE) are present everywhere → high efficiency
 *   because they pass the threshold in almost all constituencies
 * - VOX at ~12% passes threshold in most constituencies → decent efficiency
 * - Small national parties (Sumar ~3.1%, Podemos ~3.8%) spread votes across
 *   52 constituencies, failing the 3% threshold in most → very low efficiency
 *   (they only win seats in a handful of large urban constituencies like
 *   Madrid, Barcelona, Valencia where their absolute numbers are enough)
 */
export const pollingData: PartyPolling[] = [
  { slug: "pp",         name: "Partido Popular",            acronym: "PP",     voteSharePct: 33.8, currentSeats: 137, color: "#0066CC",  concentration: 0.95 },
  { slug: "psoe",       name: "PSOE",                       acronym: "PSOE",   voteSharePct: 28.5, currentSeats: 120, color: "#E30613",  concentration: 0.93 },
  { slug: "vox",        name: "VOX",                        acronym: "VOX",    voteSharePct: 12.4, currentSeats: 33,  color: "#63BE21",  concentration: 0.75 },
  { slug: "sumar",      name: "Sumar",                      acronym: "SUMAR",  voteSharePct: 3.1,  currentSeats: 27,  color: "#E6007E",  concentration: 0.18 },
  { slug: "podemos",    name: "Podemos",                    acronym: "POD",    voteSharePct: 3.8,  currentSeats: 5,   color: "#6B2D6B",  concentration: 0.22 },
  { slug: "erc",        name: "Esquerra Republicana",       acronym: "ERC",    voteSharePct: 1.8,  currentSeats: 7,   color: "#FFB81C",  concentration: 1.0 },
  { slug: "junts",      name: "Junts per Catalunya",        acronym: "JxCat",  voteSharePct: 2.0,  currentSeats: 7,   color: "#00B1C7",  concentration: 1.0 },
  { slug: "eh-bildu",   name: "EH Bildu",                   acronym: "EHB",    voteSharePct: 1.6,  currentSeats: 6,   color: "#A1C738",  concentration: 1.0 },
  { slug: "pnv",        name: "Partido Nacionalista Vasco", acronym: "PNV",    voteSharePct: 1.3,  currentSeats: 5,   color: "#DC002E",  concentration: 1.0 },
  { slug: "coalicion-canaria", name: "Coalición Canaria",   acronym: "CC",     voteSharePct: 0.6,  currentSeats: 1,   color: "#FFD700",  concentration: 1.0 },
  { slug: "bng",        name: "BNG",                        acronym: "BNG",    voteSharePct: 0.8,  currentSeats: 1,   color: "#76B6E4",  concentration: 1.0 },
  { slug: "upn",        name: "UPN",                        acronym: "UPN",    voteSharePct: 0.4,  currentSeats: 1,   color: "#003366",  concentration: 1.0 },
];

/** Remainder goes to small parties and blank votes */
export const OTROS_PCT = 100 - pollingData.reduce((s, p) => s + p.voteSharePct, 0);

// ── D'Hondt Allocation with Constituency Model ───────────────────────

/**
 * Effective vote share after constituency dispersion penalty.
 *
 * Spain's 52 constituencies with 3% threshold per constituency means that
 * a national party at 3.1% average has ~3.1% in each constituency. In small
 * constituencies (2-5 seats), 3.1% is far from winning a seat. Even in large
 * ones (Madrid 37, Barcelona 32), they need to surpass 3% AND beat the
 * quotient of larger parties.
 *
 * The concentration factor models this: parties with low concentration
 * see most of their votes "wasted" below constituency thresholds.
 *
 * Effective share = voteSharePct × concentration
 * (This is a simplification of the full 52-constituency model)
 */
function effectiveShare(pct: number, concentration: number): number {
  return pct * concentration;
}

/**
 * National-level D'Hondt allocation using effective (concentration-adjusted)
 * vote shares. This produces results much closer to real constituency-level
 * outcomes than raw national D'Hondt.
 *
 * @param shares — party vote shares with concentration factors
 * @param totalSeats — seats to allocate (350)
 * @param threshold — minimum effective % to enter allocation
 */
export function allocateDHondt(
  shares: { slug: string; pct: number; concentration: number }[],
  totalSeats: number = CONGRESS_TOTAL_SEATS,
  threshold: number = 0.3,
): Map<string, number> {
  // Compute effective shares
  const effective = shares.map((s) => ({
    slug: s.slug,
    effectivePct: effectiveShare(s.pct, s.concentration),
  }));

  // Filter parties above effective threshold
  const eligible = effective.filter((s) => s.effectivePct >= threshold);
  const seats = new Map<string, number>();
  for (const s of eligible) seats.set(s.slug, 0);

  // D'Hondt: allocate seats one by one to the party with highest quotient
  for (let i = 0; i < totalSeats; i++) {
    let bestSlug = "";
    let bestQuotient = -1;
    for (const s of eligible) {
      const currentSeats = seats.get(s.slug) || 0;
      const quotient = s.effectivePct / (currentSeats + 1);
      if (quotient > bestQuotient) {
        bestQuotient = quotient;
        bestSlug = s.slug;
      }
    }
    if (bestSlug) {
      seats.set(bestSlug, (seats.get(bestSlug) || 0) + 1);
    }
  }

  return seats;
}

/**
 * Apply final constituency correction — regional parties get a small
 * additional bonus for overrepresentation in their territories.
 */
const REGIONAL_ADJUSTMENT: Record<string, number> = {
  "erc": 2,
  "junts": 2,
  "eh-bildu": 1,
  "pnv": 1,
  "bng": 0,
  "coalicion-canaria": 0,
  "upn": 0,
};

export interface SimulationResult {
  parties: {
    slug: string;
    name: string;
    acronym: string;
    color: string;
    currentSeats: number;
    projectedSeats: number;
    delta: number;
    voteSharePct: number;
    effectiveSharePct: number;
    concentration: number;
    estimatedVotes: number;
  }[];
  totalSeats: number;
  participationPct: number;
  totalVoters: number;
  censoElectoral: number;
  methodology: string;
}

/**
 * Run a full simulation with optional user overrides.
 */
export function runSimulation(overrides?: {
  participationPct?: number;
  voteShareOverrides?: Record<string, number>; // slug → adjusted pct
}): SimulationResult {
  const CENSO = 37_500_000;
  const participationPct = overrides?.participationPct ?? 69.8;
  const totalVoters = Math.round(CENSO * participationPct / 100);

  // Build shares with overrides and concentration factors
  const shares = pollingData.map((p) => ({
    slug: p.slug,
    pct: overrides?.voteShareOverrides?.[p.slug] ?? p.voteSharePct,
    concentration: p.concentration,
  }));

  // Run D'Hondt with constituency dispersion model
  const rawSeats = allocateDHondt(shares, CONGRESS_TOTAL_SEATS);

  // Apply regional adjustment
  for (const [slug, adj] of Object.entries(REGIONAL_ADJUSTMENT)) {
    const current = rawSeats.get(slug) || 0;
    rawSeats.set(slug, current + adj);
  }

  // Re-normalize to exactly 350
  const totalAllocated = [...rawSeats.values()].reduce((s, v) => s + v, 0);
  if (totalAllocated !== CONGRESS_TOTAL_SEATS) {
    const diff = CONGRESS_TOTAL_SEATS - totalAllocated;
    // Adjust largest parties proportionally
    const sorted = [...rawSeats.entries()].sort((a, b) => b[1] - a[1]);
    let remaining = diff;
    for (const [slug] of sorted) {
      if (remaining === 0) break;
      const adjust = remaining > 0 ? 1 : -1;
      rawSeats.set(slug, (rawSeats.get(slug) || 0) + adjust);
      remaining -= adjust;
    }
  }

  const parties = pollingData.map((p) => {
    const adjustedPct = overrides?.voteShareOverrides?.[p.slug] ?? p.voteSharePct;
    const projectedSeats = rawSeats.get(p.slug) || 0;
    return {
      slug: p.slug,
      name: p.name,
      acronym: p.acronym,
      color: p.color,
      currentSeats: p.currentSeats,
      projectedSeats,
      delta: projectedSeats - p.currentSeats,
      voteSharePct: adjustedPct,
      effectiveSharePct: Math.round(effectiveShare(adjustedPct, p.concentration) * 100) / 100,
      concentration: p.concentration,
      estimatedVotes: Math.round(totalVoters * adjustedPct / 100),
    };
  });

  return {
    parties: parties.sort((a, b) => b.projectedSeats - a.projectedSeats),
    totalSeats: CONGRESS_TOTAL_SEATS,
    participationPct,
    totalVoters,
    censoElectoral: CENSO,
    methodology: "D'Hondt con modelo de dispersión por circunscripción. Factor de concentración territorial aplicado. Datos demoscópicos: media CIS/Sigma Dos/GAD3 (abril 2026).",
  };
}
