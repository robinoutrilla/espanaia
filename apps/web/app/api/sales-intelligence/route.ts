import { buildSalesIntelData } from "../../../lib/sales-intelligence-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    const raw = buildSalesIntelData();
    // Transform to page-expected shape
    const signals = raw.signals.map((s) => ({
      id: s.id,
      title: s.title,
      buyer: s.buyer,
      territory: s.territory,
      estimatedValue: s.estimatedValueM,
      stage: s.stage,
      confidence: s.confidence,
      signalType: s.signalType,
      sourceTags: s.sourceSignals,
      expectedDate: s.expectedDate ?? s.detectedDate,
      sector: s.sector,
      // Competitive differentiators
      winProbability: s.winProbability,
      knownCompetitors: s.knownCompetitors,
      incumbent: s.incumbent,
      renewalDate: s.renewalDate,
      priceBenchmark: s.priceBenchmark,
      oversightPolitician: s.oversightPolitician,
      frameworkAgreement: s.frameworkAgreement,
      subcontractingAllowed: s.subcontractingAllowed,
      subcontractPct: s.subcontractPct,
      earlyWarningDays: s.earlyWarningDays,
      decisionMaker: s.decisionMaker,
      protestRisk: s.protestRisk,
      modifications: s.modifications,
    }));
    const buyers = raw.buyers.map((b) => ({
      id: b.slug,
      name: b.name,
      type: b.type,
      annualProcurementM: b.annualProcurementM,
      activeSignals: b.activeSignals,
      topSectors: b.topSectors,
      spendingTrend: b.spendingTrend === "growing" ? "up" : b.spendingTrend === "declining" ? "down" : "stable",
      avgContractSizeM: parseFloat(b.avgContractSize.split("-")[0]) || 0,
      historicalAwards: b.historicalAwards,
      budgetCycleMonth: b.budgetCycleMonth,
      transparencyScore: b.transparencyScore,
    }));
    const sectors = raw.stats.bySector.map((s) => ({
      sector: s.sector,
      signalCount: s.count,
      totalValueM: s.valueM,
      avgValueM: s.count > 0 ? Math.round((s.valueM / s.count) * 10) / 10 : 0,
      marketShare: s.marketShare,
    }));
    return Response.json({
      signals,
      buyers,
      sectors,
      stats: {
        totalSignals: raw.stats.totalSignals,
        totalValueM: raw.stats.totalEstimatedValueM,
        preLicitacion: raw.stats.byStage["pre-licitacion"],
        licitacionAbierta: raw.stats.byStage["licitacion-abierta"],
        revenueForecast: raw.stats.revenueForecast,
        pipelineVelocity: raw.stats.pipelineVelocity,
        geographicConcentration: raw.stats.geographicConcentration,
      },
    });
  } catch (err) {
    console.error("Sales Intelligence API error:", err);
    return Response.json({ error: "Error loading sales intelligence data" }, { status: 500 });
  }
}
