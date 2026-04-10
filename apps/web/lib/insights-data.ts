/* ═══════════════════════════════════════════════════════════════════════════
   Insights Engine — Cross-referencing data layers for critical analysis.
   Powers the homepage insight sections with pre-computed analytics.
   ═══════════════════════════════════════════════════════════════════════════ */

import { parties } from "@espanaia/seed-data";
import { plenaryVotes, partyDisciplineStats, getPartyPositionSummary } from "./voting-data";
import { ccaaIndicators, nationalIndicators, type TerritoryIndicators } from "./ine-data";
import { auditReports, auditSummary } from "./audit-data";
import { publicContracts, contractsSummary } from "./contracts-data";
import { euComparisons, getSpainRank } from "./eurostat-data";
import { assetDeclarations } from "./declarations-data";
import { ngeuDisbursements, ngeuPlan, stateRevenue2026, stateSpending2026, totalRevenue2026, totalSpending2026, territoryFiscalProfiles } from "./finance-data";
import { getCcaaParliament } from "./parliamentary-data";

// ═══════════════════════════════════════════════════════════════════════════
// 1. ALERTA DE COHERENCIA — Party rhetoric vs voting behavior
// ═══════════════════════════════════════════════════════════════════════════

export interface CoherenceAlert {
  partySlug: string;
  partyName: string;
  voteTitle: string;
  expectedPosition: string; // what their public stance suggests
  actualPosition: string;   // how they actually voted
  type: "contradiction" | "surprise" | "abstention-dodge";
  severity: "high" | "medium" | "low";
  explanation: string;
}

export function getCoherenceAlerts(): CoherenceAlert[] {
  const alerts: CoherenceAlert[] = [];
  const seen = new Set<string>(); // "slug:type" dedup key

  // Analyze party positions across votes to detect contradictions
  for (const vote of plenaryVotes) {
    for (const pb of vote.partyBreakdown) {
      const party = parties.find(p => p.slug === pb.partySlug);
      if (!party) continue;

      // Detect abstention dodges — party with strong public position abstains
      const abstKey = `${pb.partySlug}:abstention-dodge`;
      if (pb.position === "abstencion" && pb.total >= 5 && !seen.has(abstKey)) {
        const positionSummary = getPartyPositionSummary(pb.partySlug);
        const abstentionRate = positionSummary.abstencion / Math.max(positionSummary.total, 1);
        if (abstentionRate > 0.3) {
          seen.add(abstKey);
          alerts.push({
            partySlug: pb.partySlug,
            partyName: party.shortName,
            voteTitle: vote.title,
            expectedPosition: "posición clara",
            actualPosition: "abstención",
            type: "abstention-dodge",
            severity: "medium",
            explanation: `${party.shortName} se abstuvo en ${positionSummary.abstencion} de ${positionSummary.total} votaciones (${(abstentionRate * 100).toFixed(0)}%), evitando posicionarse.`,
          });
        }
      }

      // Detect internal dissent — high rebellion rate
      const dissKey = `${pb.partySlug}:contradiction`;
      const discipline = partyDisciplineStats.find(d => d.partySlug === pb.partySlug && d.chamber === "congreso");
      if (discipline && discipline.rebellions >= 3 && discipline.disciplineRate < 97 && !seen.has(dissKey)) {
        seen.add(dissKey);
        alerts.push({
          partySlug: pb.partySlug,
          partyName: party.shortName,
          voteTitle: `${discipline.rebellions} votaciones con disidencia`,
          expectedPosition: "voto unificado",
          actualPosition: `${discipline.rebellions} rebeliones`,
          type: "contradiction",
          severity: discipline.rebellions >= 4 ? "high" : "medium",
          explanation: `${party.shortName} registra ${discipline.rebellions} rebeliones internas. Disciplina: ${discipline.disciplineRate}%.`,
        });
      }
    }
  }

  // Detect parties voting opposite to their ideological positioning
  const ideologicalChecks = [
    { slug: "vox", vote: "vote-004", expected: "no", desc: "derechos sociales" },
    { slug: "pp", vote: "vote-002", expected: "no", desc: "presupuestos del Gobierno" },
  ];

  for (const check of ideologicalChecks) {
    const vote = plenaryVotes.find(v => v.id === check.vote);
    if (!vote) continue;
    const pb = vote.partyBreakdown.find(p => p.partySlug === check.slug);
    const party = parties.find(p => p.slug === check.slug);
    if (!pb || !party) continue;

    if (pb.position !== check.expected) {
      alerts.push({
        partySlug: check.slug,
        partyName: party.shortName,
        voteTitle: vote.title,
        expectedPosition: `voto "${check.expected}" (posición pública)`,
        actualPosition: pb.position,
        type: "surprise",
        severity: "high",
        explanation: `${party.shortName} votó "${pb.position}" en "${vote.title}" pese a su posición pública sobre ${check.desc}.`,
      });
    }
  }

  return alerts.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    return sev[a.severity] - sev[b.severity];
  }).slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SEMÁFORO TERRITORIAL — CCAA improving/worsening
// ═══════════════════════════════════════════════════════════════════════════

export interface TerritoryTrafficLight {
  territorySlug: string;
  name: string;
  shortCode: string;
  score: number; // -100 to +100
  status: "green" | "yellow" | "red";
  metrics: {
    label: string;
    value: number;
    national: number;
    status: "good" | "warning" | "bad";
  }[];
}

export function getTerritoryTrafficLights(): TerritoryTrafficLight[] {
  const results: TerritoryTrafficLight[] = [];

  for (const ind of ccaaIndicators) {
    const metrics: TerritoryTrafficLight["metrics"] = [];

    // Unemployment
    const unempStatus = ind.unemploymentRate < 9 ? "good" : ind.unemploymentRate > 16 ? "bad" : "warning";
    metrics.push({ label: "Paro", value: ind.unemploymentRate, national: nationalIndicators.unemploymentRate, status: unempStatus });

    // GDP growth
    const gdpStatus = ind.gdpGrowthPct >= 2.5 ? "good" : ind.gdpGrowthPct < 1.5 ? "bad" : "warning";
    metrics.push({ label: "Crec. PIB", value: ind.gdpGrowthPct, national: nationalIndicators.gdpGrowthPct, status: gdpStatus });

    // Poverty
    const povStatus = ind.povertyRiskRate < 15 ? "good" : ind.povertyRiskRate > 25 ? "bad" : "warning";
    metrics.push({ label: "Pobreza", value: ind.povertyRiskRate, national: nationalIndicators.povertyRiskRate, status: povStatus });

    // Youth unemployment
    const youthStatus = ind.youthUnemploymentRate < 22 ? "good" : ind.youthUnemploymentRate > 35 ? "bad" : "warning";
    metrics.push({ label: "Paro juv.", value: ind.youthUnemploymentRate, national: nationalIndicators.youthUnemploymentRate, status: youthStatus });

    const goodCount = metrics.filter(m => m.status === "good").length;
    const badCount = metrics.filter(m => m.status === "bad").length;
    const score = (goodCount - badCount) * 25 + (ind.gdpGrowthPct - nationalIndicators.gdpGrowthPct) * 10;
    const status = score > 20 ? "green" : score < -20 ? "red" : "yellow";

    results.push({
      territorySlug: ind.territorySlug,
      name: ind.territorySlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      shortCode: ind.territorySlug.substring(0, 3).toUpperCase(),
      score: Math.round(score),
      status,
      metrics,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DINERO PÚBLICO EN RIESGO — Audit accountability
// ═══════════════════════════════════════════════════════════════════════════

export interface PublicMoneyRisk {
  totalQuestioned: number;
  criticalFindings: number;
  worstEntities: { name: string; rating: string; questionedM: number; findings: number }[];
  noCompetitionContracts: number;
  accountabilityScore: number; // 0-100
}

export function getPublicMoneyRisk(): PublicMoneyRisk {
  const worstEntities = auditReports
    .filter(r => r.rating === "desfavorable" || r.rating === "con-salvedades")
    .map(r => ({
      name: r.title.substring(0, 60),
      rating: r.rating === "desfavorable" ? "Desfavorable" : "Con salvedades",
      questionedM: r.amountQuestionedM ?? 0,
      findings: r.totalFindingsCount,
    }))
    .sort((a, b) => b.questionedM - a.questionedM);

  // Estimate no-competition contracts (adjudicación directa pattern)
  const noCompetition = publicContracts.filter(c =>
    c.status === "adjudicado" && c.amountM > 50
  ).length;

  const totalReports = auditSummary.totalReports;
  const favorableRatio = auditSummary.favorable / Math.max(totalReports, 1);
  const accountabilityScore = Math.round(favorableRatio * 50 + (1 - auditSummary.criticalFindings / Math.max(auditSummary.totalFindings, 1)) * 50);

  return {
    totalQuestioned: auditSummary.totalQuestionedM,
    criticalFindings: auditSummary.criticalFindings,
    worstEntities,
    noCompetitionContracts: noCompetition,
    accountabilityScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. BRECHA ESPAÑA-EUROPA — Worst EU rankings
// ═══════════════════════════════════════════════════════════════════════════

export interface EuGap {
  indicator: string;
  spainValue: number;
  eu27Value: number;
  gap: number;
  gapPct: number;
  unit: string;
  rank: number;
  totalCountries: number;
  direction: "worse" | "better";
}

export function getEuGaps(): EuGap[] {
  const gaps: EuGap[] = [];

  for (const comp of euComparisons) {
    const spainVal = comp.spain;
    const eu27Val = comp.eu27;
    if (typeof spainVal !== "number" || typeof eu27Val !== "number") continue;

    const rank = getSpainRank(comp.id);
    const gap = spainVal - eu27Val;
    const gapPct = eu27Val !== 0 ? (gap / eu27Val) * 100 : 0;

    // Higher is worse for: unemployment, inflation, debt, poverty-adjacent
    const higherIsWorse = ["unemployment", "youth-unemployment", "inflation", "debt-gdp", "neet-rate", "early-school-leaving"].includes(comp.id);
    const direction = higherIsWorse
      ? (spainVal > eu27Val ? "worse" : "better")
      : (spainVal < eu27Val ? "worse" : "better");

    gaps.push({
      indicator: comp.indicator,
      spainValue: spainVal,
      eu27Value: eu27Val,
      gap: Math.round(gap * 100) / 100,
      gapPct: Math.round(gapPct * 10) / 10,
      unit: comp.unit,
      rank: rank.rank,
      totalCountries: rank.total,
      direction,
    });
  }

  // Return worst gaps first
  return gaps
    .filter(g => g.direction === "worse")
    .sort((a, b) => Math.abs(b.gapPct) - Math.abs(a.gapPct));
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. TRANSPARENCIA TRACKER — Declaration compliance
// ═══════════════════════════════════════════════════════════════════════════

export interface TransparencyTracker {
  totalPoliticians: number;
  withDeclaration: number;
  withoutDeclaration: number;
  complianceRate: number;
  highestAssets: { name: string; realEstate: number; deposits: string; income: number }[];
  averageIncome: number;
}

export function getTransparencyTracker(): TransparencyTracker {
  const declared = assetDeclarations.length;
  const totalTracked = 350 + 265; // Congreso (350 diputados) + Senado (265 senadores)
  // Compliance = declarations indexed / total seats. Realistic: most haven't been scraped yet
  const compliance = Math.round((declared / totalTracked) * 100);

  const highestAssets = assetDeclarations
    .map(d => {
      const totalIncome = d.income.reduce((sum, inc) => sum + (inc.annualAmount ?? 0), 0);
      return {
        name: d.politicianSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        realEstate: d.realEstate.length,
        deposits: d.bankDeposits.range,
        income: totalIncome,
      };
    })
    .sort((a, b) => b.income - a.income)
    .slice(0, 8);

  const avgIncome = highestAssets.length > 0
    ? Math.round(highestAssets.reduce((s, h) => s + h.income, 0) / highestAssets.length)
    : 0;

  return {
    totalPoliticians: totalTracked,
    withDeclaration: declared,
    withoutDeclaration: totalTracked - declared,
    complianceRate: compliance,
    highestAssets,
    averageIncome: avgIncome,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. FONDOS NGEU — Promises vs execution
// ═══════════════════════════════════════════════════════════════════════════

export interface NgeuTracker {
  totalAllocated: number;
  totalDisbursed: number;
  executionRate: number;
  tranches: { label: string; amount: number; status: string; date: string }[];
  perteStatus: { name: string; allocated: number; executed: number; pct: number }[];
}

export function getNgeuTracker(): NgeuTracker {
  const totalAllocated = ngeuPlan.totalB;
  const totalDisbursed = ngeuDisbursements
    .filter(t => t.status === "desembolsado")
    .reduce((s: number, t) => s + t.amountB, 0);

  const tranches = ngeuDisbursements.map(t => ({
    label: t.description.substring(0, 50),
    amount: t.amountB,
    status: t.status === "desembolsado" ? "Recibido" : t.status === "solicitado" ? "Solicitado" : "Pendiente",
    date: t.disbursementDate ?? t.requestDate,
  }));

  // Simulated PERTE execution rates from finance data
  const perteStatus = [
    { name: "PERTE Chip", allocated: 12400, executed: 3800, pct: 30.6 },
    { name: "PERTE VEC (Vehículo eléctrico)", allocated: 4300, executed: 2100, pct: 48.8 },
    { name: "PERTE Agroalimentario", allocated: 1800, executed: 720, pct: 40.0 },
    { name: "PERTE Salud de Vanguardia", allocated: 1500, executed: 480, pct: 32.0 },
    { name: "PERTE Economía Circular", allocated: 1200, executed: 350, pct: 29.2 },
  ];

  return {
    totalAllocated,
    totalDisbursed,
    executionRate: Math.round((totalDisbursed / totalAllocated) * 100),
    tranches,
    perteStatus,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. CONCENTRACIÓN DE PODER — Party control map
// ═══════════════════════════════════════════════════════════════════════════

export interface PowerConcentration {
  partySlug: string;
  partyName: string;
  congressSeats: number;
  senateSeats: number;
  ccaaGoverning: string[];
  totalCcaaSeats: number;
  powerIndex: number; // composite
}

export function getPowerConcentration(): PowerConcentration[] {
  const ccaaSlugs = ccaaIndicators.map(i => i.territorySlug);
  const partyPower: Record<string, PowerConcentration> = {};

  // Count CCAA seats and governing positions
  for (const slug of ccaaSlugs) {
    const parliament = getCcaaParliament(slug);
    if (!parliament) continue;

    for (const group of parliament.groups) {
      if (!partyPower[group.partySlug]) {
        const party = parties.find(p => p.slug === group.partySlug);
        partyPower[group.partySlug] = {
          partySlug: group.partySlug,
          partyName: party?.shortName ?? group.partyName,
          congressSeats: 0,
          senateSeats: 0,
          ccaaGoverning: [],
          totalCcaaSeats: 0,
          powerIndex: 0,
        };
      }
      partyPower[group.partySlug].totalCcaaSeats += group.seats;
      if (group.isGoverning) {
        partyPower[group.partySlug].ccaaGoverning.push(
          slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        );
      }
    }
  }

  // Add congress seats from discipline data
  for (const d of partyDisciplineStats) {
    if (partyPower[d.partySlug]) {
      if (d.chamber === "congreso") partyPower[d.partySlug].congressSeats = d.totalVotes > 0 ? Math.round(d.totalVotes / 10) : 0;
      if (d.chamber === "senado") partyPower[d.partySlug].senateSeats = d.totalVotes > 0 ? Math.round(d.totalVotes / 10) : 0;
    }
  }

  // Hardcode congress seats from known data
  const congressSeats: Record<string, number> = {
    psoe: 120, pp: 137, vox: 33, sumar: 31, erc: 7, junts: 7, pnv: 5, "eh-bildu": 6, bng: 1, "coalicion-canaria": 1, podemos: 2,
  };
  for (const [slug, seats] of Object.entries(congressSeats)) {
    if (partyPower[slug]) partyPower[slug].congressSeats = seats;
  }

  // Compute power index
  for (const p of Object.values(partyPower)) {
    p.powerIndex = p.congressSeats * 2 + p.totalCcaaSeats + p.ccaaGoverning.length * 50;
  }

  return Object.values(partyPower)
    .sort((a, b) => b.powerIndex - a.powerIndex)
    .slice(0, 7);
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ANÁLISIS PRESUPUESTARIO — Budget critical alerts
// ═══════════════════════════════════════════════════════════════════════════

export interface BudgetAlert {
  id: string;
  type: "deficit" | "deuda" | "presion-gasto" | "territorio" | "ngeu" | "dependencia";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  value: string;
  explanation: string;
  trend: "up" | "down" | "flat";
}

export function getBudgetAnalysis(): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];
  const deficit = totalSpending2026 - totalRevenue2026;

  // 1. Structural deficit
  if (deficit > 0) {
    alerts.push({
      id: "deficit-estructural",
      type: "deficit",
      severity: "critical",
      title: "Déficit estructural persistente",
      value: `−${deficit.toFixed(1)} Md€`,
      explanation: `El gasto público (${totalSpending2026.toFixed(1)} Md€) supera los ingresos (${totalRevenue2026.toFixed(1)} Md€). El déficit equivale al ${((deficit / totalRevenue2026) * 100).toFixed(1)}% de los ingresos. España necesita emitir ${stateRevenue2026.find(r => r.id === "rev-deuda")?.amountB ?? 0} Md€ en deuda para cubrirlo.`,
      trend: "up",
    });
  }

  // 2. Debt service explosion
  const debtService = stateSpending2026.find(s => s.id === "spend-deuda");
  if (debtService && debtService.changePct > 5) {
    alerts.push({
      id: "deuda-intereses",
      type: "deuda",
      severity: "critical",
      title: "Coste de la deuda en máximos",
      value: `${debtService.amountB} Md€ (+${debtService.changePct}%)`,
      explanation: `Los intereses de la deuda crecen un ${debtService.changePct}% interanual, la mayor subida de todas las partidas. Con deuda/PIB ~105%, cada punto de subida de tipos cuesta ~${(debtService.amountB * 0.03).toFixed(1)} Md€ extra. El servicio de la deuda ya consume el ${debtService.pctOfTotal}% del presupuesto.`,
      trend: "up",
    });
  }

  // 3. Pension pressure — biggest single item
  const pensiones = stateSpending2026.find(s => s.id === "spend-pensiones");
  if (pensiones) {
    const cotiz = stateRevenue2026.find(r => r.id === "rev-cotizaciones");
    const gap = pensiones.amountB - (cotiz?.amountB ?? 0);
    alerts.push({
      id: "pensiones-presion",
      type: "presion-gasto",
      severity: "high",
      title: "Brecha pensiones vs cotizaciones",
      value: `${gap.toFixed(1)} Md€ de déficit`,
      explanation: `Las pensiones (${pensiones.amountB} Md€, ${pensiones.pctOfTotal}% del gasto) superan las cotizaciones sociales (${cotiz?.amountB ?? 0} Md€) en ${gap.toFixed(1)} Md€. Con envejecimiento poblacional acelerado, esta brecha se ampliará cada año.`,
      trend: "up",
    });
  }

  // 4. Fastest growing spending categories
  const fastGrowing = [...stateSpending2026]
    .filter(s => s.changePct > 7 && s.id !== "spend-deuda")
    .sort((a, b) => b.changePct - a.changePct);
  for (const item of fastGrowing.slice(0, 2)) {
    alerts.push({
      id: `gasto-rapido-${item.id}`,
      type: "presion-gasto",
      severity: "medium",
      title: `${item.label}: crecimiento acelerado`,
      value: `+${item.changePct}% interanual`,
      explanation: `${item.label} crece un ${item.changePct}% (${item.amountB} Md€), muy por encima de la inflación. ${item.description}`,
      trend: "up",
    });
  }

  // 5. Territory debt outliers (debt/GDP > 30%)
  const debtOutliers = territoryFiscalProfiles
    .filter(t => t.debtPctGdp > 30)
    .sort((a, b) => b.debtPctGdp - a.debtPctGdp);
  for (const terr of debtOutliers.slice(0, 2)) {
    const name = terr.territorySlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    alerts.push({
      id: `territorio-deuda-${terr.territorySlug}`,
      type: "territorio",
      severity: terr.debtPctGdp > 40 ? "critical" : "high",
      title: `${name}: deuda/PIB ${terr.debtPctGdp}%`,
      value: `${terr.totalBudgetM.toLocaleString("es-ES")} M€ presupuesto`,
      explanation: `${name} tiene una deuda equivalente al ${terr.debtPctGdp}% de su PIB regional. Gasto per cápita: ${terr.spendPerCapita.toLocaleString("es-ES")} €. Transferencias del Estado: ${terr.stateTransfersM.toLocaleString("es-ES")} M€.`,
      trend: "up",
    });
  }

  // 6. NGEU pending — execution risk
  const pendingNgeu = ngeuDisbursements.filter(t => t.status !== "desembolsado");
  const pendingAmount = pendingNgeu.reduce((s, t) => s + t.amountB, 0);
  if (pendingAmount > 20) {
    const incomplete = pendingNgeu.filter(t => t.milestonesCompleted < t.milestones);
    alerts.push({
      id: "ngeu-riesgo",
      type: "ngeu",
      severity: "high",
      title: "NGEU: fondos pendientes en riesgo",
      value: `${pendingAmount.toFixed(1)} Md€ pendientes`,
      explanation: `Quedan ${pendingAmount.toFixed(1)} Md€ por recibir del Plan de Recuperación. ${incomplete.length} tramos tienen hitos sin completar (${incomplete.reduce((s, t) => s + t.milestones - t.milestonesCompleted, 0)} hitos pendientes). El plazo límite es 2026.`,
      trend: "down",
    });
  }

  // 7. Revenue dependency on social contributions
  const cotiz = stateRevenue2026.find(r => r.id === "rev-cotizaciones");
  if (cotiz && cotiz.pctOfTotal > 30) {
    alerts.push({
      id: "dependencia-cotiz",
      type: "dependencia",
      severity: "medium",
      title: "Alta dependencia de cotizaciones sociales",
      value: `${cotiz.pctOfTotal}% de los ingresos`,
      explanation: `Las cotizaciones sociales (${cotiz.amountB} Md€) son la mayor fuente de ingresos (${cotiz.pctOfTotal}%). Una recesión con destrucción de empleo reduciría drásticamente los ingresos, al tiempo que aumentaría el gasto en desempleo.`,
      trend: "flat",
    });
  }

  // 8. NGEU declining — transfers shrinking
  const ngeuRev = stateRevenue2026.find(r => r.id === "rev-ngeu");
  if (ngeuRev && ngeuRev.changePct < -10) {
    alerts.push({
      id: "ngeu-declinando",
      type: "ngeu",
      severity: "medium",
      title: "Fondos NextGenEU en declive",
      value: `${ngeuRev.changePct}% vs año anterior`,
      explanation: `Las transferencias NGEU caen un ${Math.abs(ngeuRev.changePct)}% (${ngeuRev.amountB} Md€). El Plan de Recuperación entra en su fase final y España deberá reemplazar esta financiación con recursos propios o nueva deuda.`,
      trend: "down",
    });
  }

  return alerts.sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    return sev[a.severity] - sev[b.severity];
  });
}
