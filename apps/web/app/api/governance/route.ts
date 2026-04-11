/**
 * /api/governance — Bridge to MiroFish for IAPÑ governance plan generation.
 *
 * Sends the full governance plan data to MiroFish for LLM-enhanced
 * policy proposals. Falls back to deterministic data if MiroFish is offline.
 */

import { NextResponse } from "next/server";
import { getGovernancePlan } from "../../../lib/ian-governance";
import { nationalIndicators } from "../../../lib/ine-data";

const MIROFISH_URL = process.env.MIROFISH_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

export async function GET() {
  const plan = getGovernancePlan();

  try {
    const res = await fetch(`${MIROFISH_URL}/api/predict/governance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnosis: plan.diagnosis,
        budget: plan.budget,
        territorial: plan.territorial,
        legislativeAgenda: plan.legislativeAgenda,
        electoralStrategy: plan.electoralStrategy,
        newsContext: plan.recentNewsContext,
        economicIndicators: {
          gdpPerCapita: nationalIndicators.gdpPerCapita,
          gdpGrowthPct: nationalIndicators.gdpGrowthPct,
          unemploymentRate: nationalIndicators.unemploymentRate,
          youthUnemploymentRate: nationalIndicators.youthUnemploymentRate,
          cpiAnnual: nationalIndicators.cpiAnnual,
          povertyRiskRate: nationalIndicators.povertyRiskRate,
        },
      }),
      signal: AbortSignal.timeout(60_000), // LLM may take longer
    });

    if (!res.ok) throw new Error(`MiroFish governance: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "MiroFish error");

    return NextResponse.json({
      source: "mirofish",
      plan,
      aiPolicies: json.data,
    });
  } catch {
    return NextResponse.json({
      source: "deterministic",
      plan,
      aiPolicies: null,
    });
  }
}
