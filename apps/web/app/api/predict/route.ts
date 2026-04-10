/**
 * /api/predict — Bridge to MiroFish local backend (port 5001).
 *
 * Collects political seed data from our existing data layers and sends
 * it to MiroFish for LLM-enhanced predictions. Falls back to the
 * deterministic engine if MiroFish is unavailable.
 */

import { NextResponse } from "next/server";
import { congressGroups, CONGRESS_TOTAL_SEATS } from "../../../lib/parliamentary-data";
import { plenaryVotes, partyDisciplineStats } from "../../../lib/voting-data";
import { nationalIndicators } from "../../../lib/ine-data";
import { getCoherenceAlerts } from "../../../lib/insights-data";
import { parties } from "@espanaia/seed-data";

const MIROFISH_URL = process.env.MIROFISH_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

async function callMirofish(endpoint: string, body: unknown) {
  const res = await fetch(`${MIROFISH_URL}/api/predict/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`MiroFish ${endpoint}: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "MiroFish error");
  return json.data;
}

function buildSeedData() {
  const congressParties = congressGroups
    .filter((g) => g.chamber === "congreso")
    .map((g) => {
      const party = parties.find((p) => p.slug === g.partySlug);
      const discipline = partyDisciplineStats.find(
        (d) => d.partySlug === g.partySlug && d.chamber === "congreso"
      );
      return {
        slug: g.partySlug,
        acronym: party?.acronym || g.shortName,
        name: party?.shortName || g.shortName,
        seats: g.seats,
        disciplineRate: discipline?.disciplineRate ?? null,
        rebellions: discipline?.rebellions ?? 0,
      };
    });

  const alerts = getCoherenceAlerts().map((a) => ({
    party: a.partySlug,
    type: a.type,
    severity: a.severity,
    title: a.voteTitle,
  }));

  const votingPatterns = plenaryVotes.slice(0, 20).map((v) => ({
    title: v.title,
    category: v.category,
    result: v.result,
    breakdown: v.partyBreakdown.map((pb) => ({
      party: pb.partySlug,
      position: pb.position,
      total: pb.total,
    })),
  }));

  return {
    censoElectoral: 37_500_000,
    estimatedParticipation: 69.8,
    totalSeats: CONGRESS_TOTAL_SEATS,
    parties: congressParties,
    coherenceAlerts: alerts,
    votingPatterns,
    economicIndicators: {
      gdpPerCapita: nationalIndicators.gdpPerCapita,
      gdpGrowthPct: nationalIndicators.gdpGrowthPct,
      unemploymentRate: nationalIndicators.unemploymentRate,
      youthUnemploymentRate: nationalIndicators.youthUnemploymentRate,
      cpiAnnual: nationalIndicators.cpiAnnual,
      averageSalary: nationalIndicators.averageSalary,
      povertyRiskRate: nationalIndicators.povertyRiskRate,
    },
  };
}

export async function GET() {
  const seed = buildSeedData();

  try {
    // Call MiroFish endpoints in parallel
    const [electoral, stability, votes] = await Promise.all([
      callMirofish("electoral", seed),
      callMirofish("stability", {
        coalition: seed.parties,
        discipline: seed.parties.map((p) => ({
          party: p.acronym,
          rate: p.disciplineRate,
        })),
        coherenceAlerts: seed.coherenceAlerts,
        recentVotes: seed.votingPatterns.slice(0, 10),
      }),
      callMirofish("votes", {
        historicalVotes: seed.votingPatterns,
        categories: [
          { id: "decreto-ley", label: "Decretos-ley" },
          { id: "ley-ordinaria", label: "Leyes ordinarias" },
          { id: "ley-organica", label: "Leyes orgánicas" },
          { id: "proposicion-no-de-ley", label: "Proposiciones no de ley" },
        ],
      }),
    ]);

    return NextResponse.json({
      source: "mirofish",
      electoral,
      stability,
      votes,
    });
  } catch (err) {
    // MiroFish unavailable — return fallback indicator
    return NextResponse.json(
      {
        source: "deterministic",
        error: err instanceof Error ? err.message : "MiroFish unavailable",
        message: "Using deterministic engine. Start MiroFish for AI predictions.",
      },
      { status: 200 }
    );
  }
}
