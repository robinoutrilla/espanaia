/* ═══════════════════════════════════════════════════════════════════════════
   /api/terminal — Aggregated data feed for the Terminal dashboard.
   Combines RSS, budget, agenda, entity stats, and 10 intelligence modules.
   ═══════════════════════════════════════════════════════════════════════════ */

import { getTrending } from "../../../lib/rss-trending";
import { stateRevenue2026, stateSpending2026, totalRevenue2026, totalSpending2026, ngeuPlan } from "../../../lib/finance-data";
import { getUpcomingEvents } from "../../../lib/agenda-data";
import { publicContracts } from "../../../lib/contracts-data";
import { auditReports } from "../../../lib/audit-data";
import { officialConnectors, politicians, parties, territories } from "@espanaia/seed-data";

// ── NEW: Insights engine ──
import {
  getCoherenceAlerts,
  getTerritoryTrafficLights,
  getPublicMoneyRisk,
  getEuGaps,
  getTransparencyTracker,
  getNgeuTracker,
  getPowerConcentration,
  getBudgetAnalysis,
} from "../../../lib/insights-data";

// ── NEW: Polling & predictions ──
import { runSimulation, pollingData } from "../../../lib/polling-model";
import { getElectoralProjection, getStabilityIndex, getVotePredictions } from "../../../lib/predictions-data";

// ── NEW: EU legislation compliance ──
import { euLegislation, infringementProcedures, transpositionSummary, infringementSummary } from "../../../lib/eurlex-data";

// ── NEW: Territory indicators ──
import { ccaaIndicators, nationalIndicators } from "../../../lib/ine-data";

// ── NEW: Parliamentary data ──
import { congressGroups, CONGRESS_TOTAL_SEATS } from "../../../lib/parliamentary-data";

const GOV_CORE_SLUGS = ["psoe", "sumar"];
const GOV_SUPPORT_SLUGS = ["erc", "junts", "eh-bildu", "pnv", "bng", "podemos"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const trending = await getTrending(40);

    const upcomingEvents = getUpcomingEvents(15);
    const agenda = upcomingEvents.map((ev) => ({
      date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
        new Date(ev.date + "T00:00:00")
      ),
      title: ev.title.substring(0, 80),
      type: ev.eventType,
      status: ev.status,
      institution: ev.institution,
    }));

    const deficit = totalSpending2026 - totalRevenue2026;
    const ngeuPending = ngeuPlan.pendingB;

    // ── 1. Coherence Alerts ──
    const coherenceAlerts = getCoherenceAlerts().map((a) => ({
      party: a.partyName,
      partySlug: a.partySlug,
      voteTitle: a.voteTitle,
      expected: a.expectedPosition,
      actual: a.actualPosition,
      type: a.type,
      severity: a.severity,
      explanation: a.explanation,
    }));

    // ── 2. Territory Traffic Lights ──
    const territoryHealth = getTerritoryTrafficLights().map((t) => ({
      slug: t.territorySlug,
      name: t.name,
      score: t.score,
      status: t.status,
      metrics: t.metrics,
    }));

    // ── 3. Contract Concentration ──
    const contractorCounts: Record<string, { name: string; count: number; totalM: number; contracts: string[] }> = {};
    for (const c of publicContracts) {
      if (!c.contractor) continue;
      if (!contractorCounts[c.contractor]) {
        contractorCounts[c.contractor] = { name: c.contractor, count: 0, totalM: 0, contracts: [] };
      }
      contractorCounts[c.contractor].count++;
      contractorCounts[c.contractor].totalM += c.amountM;
      contractorCounts[c.contractor].contracts.push(c.title.substring(0, 60));
    }
    const contractConcentration = Object.values(contractorCounts)
      .sort((a, b) => b.totalM - a.totalM)
      .slice(0, 10)
      .map((c) => ({ ...c, totalM: Math.round(c.totalM * 10) / 10 }));

    // ── 4. EU Compliance ──
    const pendingTranspositions = euLegislation
      .filter((l: any) => l.transpositionStatus === "retrasada" || l.transpositionStatus === "incumplimiento")
      .map((l: any) => ({
        title: l.title.substring(0, 80),
        type: l.type,
        sector: l.sector,
        status: l.transpositionStatus,
        deadline: l.transpositionDeadline ?? null,
      }));
    const activeInfringements = infringementProcedures.map((p: any) => ({
      subject: p.subject.substring(0, 80),
      stage: p.stage,
      date: p.date,
      description: p.description?.substring(0, 120) ?? "",
    }));

    // ── 5. Revenue-Spending Flow ──
    const revenueFlow = stateRevenue2026.map((r) => ({
      id: r.id,
      label: r.label.substring(0, 40),
      amountB: r.amountB,
      pctOfTotal: r.pctOfTotal,
    }));
    const spendingFlow = stateSpending2026.map((s) => ({
      id: s.id,
      label: s.label.substring(0, 40),
      amountB: s.amountB,
      pctOfTotal: s.pctOfTotal,
    }));

    // ── 6. Coalition Calculator ──
    const simulation = runSimulation();
    const coalitionCalc = {
      parties: simulation.parties.map((p) => ({
        slug: p.slug,
        acronym: p.acronym,
        color: p.color,
        currentSeats: p.currentSeats,
        projectedSeats: p.projectedSeats,
        delta: p.delta,
        voteSharePct: p.voteSharePct,
      })),
      totalSeats: simulation.totalSeats,
      majority: Math.ceil(simulation.totalSeats / 2) + 1,
      govCoalition: {
        label: "PSOE + Sumar + apoyos",
        slugs: [...GOV_CORE_SLUGS, ...GOV_SUPPORT_SLUGS],
      },
    };

    // ── 7. EU Gaps ──
    const euGaps = getEuGaps().slice(0, 8).map((g) => ({
      indicator: g.indicator,
      spain: g.spainValue,
      eu27: g.eu27Value,
      gap: g.gap,
      gapPct: g.gapPct,
      unit: g.unit,
      rank: g.rank,
      total: g.totalCountries,
    }));

    // ── 8. Power Concentration ──
    const powerMap = getPowerConcentration().map((p) => ({
      party: p.partyName,
      partySlug: p.partySlug,
      congress: p.congressSeats,
      senate: p.senateSeats,
      ccaaGoverning: p.ccaaGoverning,
      ccaaSeats: p.totalCcaaSeats,
      powerIndex: p.powerIndex,
    }));

    // ── 9. Transparency ──
    const transparency = getTransparencyTracker();

    // ── 10. Budget Alerts ──
    const budgetAlerts = getBudgetAnalysis().map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      title: a.title,
      value: a.value,
      explanation: a.explanation,
      trend: a.trend,
    }));

    // ── NGEU Tracker ──
    const ngeuTracker = getNgeuTracker();

    // ── Public Money Risk ──
    const moneyRisk = getPublicMoneyRisk();

    // ── Stability Index ──
    const stability = getStabilityIndex();

    // ── Vote Predictions ──
    const votePredictions = getVotePredictions().map((v: any) => ({
      category: v.category,
      result: v.likelyResult,
      confidence: v.confidence,
      reasoning: v.reasoning?.substring(0, 120) ?? "",
    }));

    return Response.json({
      trending,
      budgetSummary: {
        revenue: stateRevenue2026.map((r) => ({
          label: r.label.substring(0, 40),
          amountB: r.amountB,
          pctOfTotal: r.pctOfTotal,
          changePct: r.changePct,
          trend: r.trend,
        })),
        spending: stateSpending2026.map((s) => ({
          label: s.label.substring(0, 40),
          amountB: s.amountB,
          pctOfTotal: s.pctOfTotal,
          changePct: s.changePct,
          trend: s.trend,
        })),
        totalRevenue: totalRevenue2026,
        totalSpending: totalSpending2026,
        deficit,
        ngeuPending,
      },
      agenda,
      stats: {
        politicians: politicians.length,
        parties: parties.length,
        territories: territories.filter((t) => t.kind !== "state").length,
        sources: officialConnectors.length,
        contracts: publicContracts.length,
        auditReports: auditReports.length,
      },
      // ── 10 new intelligence modules ──
      coherenceAlerts,
      territoryHealth,
      contractConcentration,
      euCompliance: {
        pendingTranspositions,
        activeInfringements,
        summary: transpositionSummary,
        infringementSummary,
      },
      revenueSpendingFlow: { revenue: revenueFlow, spending: spendingFlow, totalRevenue: totalRevenue2026, totalSpending: totalSpending2026 },
      coalitionCalc,
      euGaps,
      powerMap,
      transparency: {
        totalPoliticians: transparency.totalPoliticians,
        withDeclaration: transparency.withDeclaration,
        complianceRate: transparency.complianceRate,
        highestAssets: transparency.highestAssets.slice(0, 6),
        averageIncome: transparency.averageIncome,
      },
      budgetAlerts,
      ngeuTracker: {
        allocated: ngeuTracker.totalAllocated,
        disbursed: ngeuTracker.totalDisbursed,
        executionRate: ngeuTracker.executionRate,
        perteStatus: ngeuTracker.perteStatus,
      },
      moneyRisk: {
        totalQuestioned: moneyRisk.totalQuestioned,
        criticalFindings: moneyRisk.criticalFindings,
        accountabilityScore: moneyRisk.accountabilityScore,
        worstEntities: moneyRisk.worstEntities.slice(0, 5),
      },
      stability: {
        score: stability.score,
        label: stability.label,
        factors: stability.factors?.slice(0, 5) ?? [],
        coalitionSeats: stability.coalitionSeats,
        majority: stability.majorityThreshold,
        margin: stability.seatMargin,
      },
      votePredictions,
    });
  } catch (err) {
    console.error("Terminal API error:", err);
    return Response.json({ error: "Error loading terminal data" }, { status: 500 });
  }
}
