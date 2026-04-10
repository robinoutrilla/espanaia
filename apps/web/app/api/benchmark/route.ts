/* ═══════════════════════════════════════════════════════════════════════════
   /api/benchmark — Comparative analytics for CCAA and Ayuntamientos.
   Normalises INE, Hacienda, contracts and fiscal data into a single
   payload optimised for ranking tables, radar charts, and side-by-side
   comparisons.
   ═══════════════════════════════════════════════════════════════════════════ */

import { territories } from "@espanaia/seed-data";
import { ccaaIndicators, nationalIndicators, indicatorLabels, indicatorUnits, getRanking } from "../../../lib/ine-data";
import { territoryFiscalProfiles, ayuntamientoBudgets, diputacionBudgets } from "../../../lib/finance-data";
import { publicContracts, publicSubsidies, getContractsForTerritory, getSubsidiesForTerritory } from "../../../lib/contracts-data";
import { getTerritoryTrafficLights } from "../../../lib/insights-data";
import { euComparisons } from "../../../lib/eurostat-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* helper: spending-category normalisation across CCAA budgets */
const SPENDING_CATEGORIES = [
  "Sanidad", "Educación", "Servicios Sociales", "Infraestructuras",
  "Deuda Pública", "Empleo y Formación", "Administración General",
  "Medio Ambiente", "Vivienda", "I+D+i", "Cultura y Deporte",
] as const;

function normaliseSpending(items: { label: string; pctOfBudget: number; amountM: number }[]) {
  return SPENDING_CATEGORIES.map((cat) => {
    const match = items.find((i) =>
      i.label.toLowerCase().includes(cat.toLowerCase().split(" ")[0]) ||
      cat.toLowerCase().split(" ").some((w) => i.label.toLowerCase().includes(w))
    );
    return { category: cat, pctOfBudget: match?.pctOfBudget ?? 0, amountM: match?.amountM ?? 0 };
  });
}

export async function GET() {
  try {
    // ── CCAA benchmark cards ──
    const ccaaList = territories.filter(
      (t) => t.kind === "autonomous-community" || t.kind === "autonomous-city"
    );

    const trafficLights = getTerritoryTrafficLights();

    const ccaaBenchmark = ccaaList.map((t) => {
      const ind = ccaaIndicators.find((i) => i.territorySlug === t.slug);
      const fiscal = territoryFiscalProfiles.find((f: any) => f.territorySlug === t.slug);
      const health = trafficLights.find((h) => h.territorySlug === t.slug);
      const contracts = getContractsForTerritory(t.slug);
      const subsidies = getSubsidiesForTerritory(t.slug);

      return {
        slug: t.slug,
        name: t.name,
        shortCode: t.shortCode,
        // Economy
        population: ind?.population ?? 0,
        populationChange: ind?.populationChange ?? 0,
        gdpM: ind?.gdpM ?? 0,
        gdpPerCapita: ind?.gdpPerCapita ?? 0,
        gdpGrowthPct: ind?.gdpGrowthPct ?? 0,
        unemploymentRate: ind?.unemploymentRate ?? 0,
        youthUnemploymentRate: ind?.youthUnemploymentRate ?? 0,
        averageSalary: ind?.averageSalary ?? 0,
        cpiAnnual: ind?.cpiAnnual ?? 0,
        // Social
        povertyRiskRate: ind?.povertyRiskRate ?? 0,
        giniIndex: ind?.giniIndex ?? 0,
        lifeExpectancy: ind?.lifeExpectancy ?? 0,
        birthRate: ind?.birthRate ?? 0,
        medianAge: ind?.medianAge ?? 0,
        activePopulationPct: ind?.activePopulationPct ?? 0,
        // Housing
        housingPriceIndex: ind?.housingPriceIndex ?? 0,
        rentAvgMonthly: ind?.rentAvgMonthly ?? 0,
        // Fiscal
        totalBudgetM: fiscal?.totalBudgetM ?? 0,
        spendPerCapita: fiscal?.spendPerCapita ?? 0,
        debtPctGdp: fiscal?.debtPctGdp ?? 0,
        stateTransfersM: fiscal?.stateTransfersM ?? 0,
        euFundsReceivedM: fiscal?.euFundsReceivedM ?? 0,
        spendingBreakdown: fiscal ? normaliseSpending(fiscal.mainSpending ?? []) : [],
        // Health score
        healthScore: health?.score ?? 0,
        healthStatus: health?.status ?? "yellow",
        // Contracts
        contractCount: contracts.length,
        contractValueM: Math.round(contracts.reduce((s, c) => s + c.amountM, 0) * 10) / 10,
        subsidyCount: subsidies.length,
      };
    }).sort((a, b) => b.population - a.population);

    // ── Ayuntamiento benchmark cards ──
    const aytosBenchmark = ayuntamientoBudgets.map((a: any) => ({
      slug: a.slug,
      name: a.name,
      province: a.province,
      ccaaSlug: a.ccaaSlug,
      population: a.population,
      totalBudgetM: a.totalBudgetM,
      budgetPerCapita: a.population > 0 ? Math.round((a.totalBudgetM * 1_000_000) / a.population) : 0,
      revenueM: a.revenueM,
      spendingM: a.spendingM,
      debtM: a.debtM,
      debtPerCapita: a.debtPerCapita,
      employeeCount: a.employeeCount,
      employeesPerThousand: a.population > 0 ? Math.round((a.employeeCount / a.population) * 1000 * 10) / 10 : 0,
      ibiRecaudacionM: a.ibiRecaudacionM,
      stateTransfersM: a.stateTransfersM,
      ownRevenueM: a.ownRevenueM,
      ownRevenuePct: a.revenueM > 0 ? Math.round((a.ownRevenueM / a.revenueM) * 100 * 10) / 10 : 0,
      investmentM: a.investmentM,
      investmentPct: a.totalBudgetM > 0 ? Math.round((a.investmentM / a.totalBudgetM) * 100 * 10) / 10 : 0,
      spendingBreakdown: (a.mainSpending ?? []).map((s: any) => ({
        category: s.label,
        pctOfBudget: s.pctOfBudget,
        amountM: s.amountM,
      })),
      isCapital: a.isCapital,
      fiscalYear: a.fiscalYear,
    })).sort((a: any, b: any) => b.population - a.population);

    // ── Rankings (top & bottom by key indicators) ──
    const rankingFields = [
      { field: "gdpPerCapita", label: "PIB per cápita", order: "desc" as const, higherBetter: true },
      { field: "unemploymentRate", label: "Tasa de paro", order: "asc" as const, higherBetter: false },
      { field: "youthUnemploymentRate", label: "Paro juvenil", order: "asc" as const, higherBetter: false },
      { field: "gdpGrowthPct", label: "Crecimiento PIB", order: "desc" as const, higherBetter: true },
      { field: "averageSalary", label: "Salario medio", order: "desc" as const, higherBetter: true },
      { field: "povertyRiskRate", label: "Riesgo pobreza", order: "asc" as const, higherBetter: false },
      { field: "rentAvgMonthly", label: "Alquiler medio", order: "asc" as const, higherBetter: false },
      { field: "lifeExpectancy", label: "Esperanza de vida", order: "desc" as const, higherBetter: true },
    ];

    const rankings = rankingFields.map((r) => {
      const ranked = getRanking(r.field as any, r.order);
      return {
        field: r.field,
        label: r.label,
        higherBetter: r.higherBetter,
        unit: indicatorUnits[r.field] ?? "",
        ranking: ranked.map((t: any) => ({
          slug: t.territorySlug,
          name: ccaaList.find((c) => c.slug === t.territorySlug)?.name ?? t.territorySlug,
          value: t[r.field],
          rank: t.rank,
        })),
      };
    });

    // ── National reference ──
    const national = {
      population: nationalIndicators.population,
      gdpPerCapita: nationalIndicators.gdpPerCapita,
      gdpGrowthPct: nationalIndicators.gdpGrowthPct,
      unemploymentRate: nationalIndicators.unemploymentRate,
      youthUnemploymentRate: nationalIndicators.youthUnemploymentRate,
      averageSalary: nationalIndicators.averageSalary,
      povertyRiskRate: nationalIndicators.povertyRiskRate,
      rentAvgMonthly: nationalIndicators.rentAvgMonthly,
      lifeExpectancy: nationalIndicators.lifeExpectancy,
    };

    // ── EU comparison context ──
    const euContext = euComparisons
      .filter((c: any) => ["economia", "empleo", "social", "deuda"].includes(c.category))
      .slice(0, 15)
      .map((c: any) => ({
        indicator: c.indicator,
        unit: c.unit,
        spain: c.spain,
        eu27: c.eu27,
        germany: c.germany,
        france: c.france,
        italy: c.italy,
        portugal: c.portugal,
        higherIsBetter: c.higherIsBetter,
      }));

    // ── Metadata ──
    const meta = {
      indicatorLabels,
      indicatorUnits,
      spendingCategories: SPENDING_CATEGORIES,
      totalCcaa: ccaaBenchmark.length,
      totalAyuntamientos: aytosBenchmark.length,
      fiscalYear: 2026,
      dataSource: "INE, Ministerio de Hacienda, datos.gob.es, Eurostat",
    };

    return Response.json({
      ccaa: ccaaBenchmark,
      ayuntamientos: aytosBenchmark,
      rankings,
      national,
      euContext,
      meta,
    });
  } catch (err) {
    console.error("Benchmark API error:", err);
    return Response.json({ error: "Error loading benchmark data" }, { status: 500 });
  }
}
