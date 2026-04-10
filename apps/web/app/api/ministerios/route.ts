/* ═══════════════════════════════════════════════════════════════════════════
   /api/ministerios — Complete government ministry data including structure,
   budgets, personnel, official sources, and performance metrics.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  ministries,
  getGovernmentStructureSummary,
  getTotalGovernmentBudget,
  getMinistryBySources,
} from "../../../lib/ministerios-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const summary = getGovernmentStructureSummary();
    const budget = getTotalGovernmentBudget();
    const sourceStatus = getMinistryBySources();

    // Build compact list for grid view (without heavy arrays)
    const grid = ministries.map((m) => ({
      slug: m.slug,
      name: m.name,
      shortName: m.shortName,
      acronym: m.acronym,
      ministerName: m.minister.name,
      ministerParty: m.minister.party ?? "independiente",
      vicePresident: m.vicePresident ?? false,
      vpOrder: m.vpOrder,
      webUrl: m.webUrl,
      colorAccent: m.colorAccent,
      description: m.description,
      keyAreas: m.keyAreas,
      employeeCount: m.employeeCount,
      budgetTotalM: m.budget.totalM,
      budgetChangePct: m.budget.changePct,
      budgetPctOfPGE: m.budget.pctOfPGE,
      organismoCount: m.organismos.length,
      sourceCount: m.officialSources.length,
      activeSourceCount: m.officialSources.filter((s) => s.status === "activo").length,
      metricCount: m.metrics.length,
      activityCount: m.recentActivity.length,
      tags: m.tags,
    }));

    // Full detail objects
    const detail = Object.fromEntries(
      ministries.map((m) => [m.slug, m])
    );

    return Response.json({
      grid,
      detail,
      summary,
      budget,
      sourceStatus: sourceStatus.map((s) => ({
        slug: s.ministry.slug,
        name: s.ministry.shortName,
        sourceCount: s.sourceCount,
        activeCount: s.activeCount,
      })),
      meta: {
        totalMinistries: ministries.length,
        seedDate: "2026-04-10",
        dataSource: "La Moncloa, BOE, PGE 2026, datos.gob.es, portales ministeriales",
      },
    });
  } catch (err) {
    console.error("Ministerios API error:", err);
    return Response.json({ error: "Error loading ministerios data" }, { status: 500 });
  }
}
