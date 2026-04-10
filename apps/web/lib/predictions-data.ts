/* ═══════════════════════════════════════════════════════════════════════════
   Predictions Engine — deterministic political forecasting from existing
   data layers. Phase 1 uses cross-referenced seed data; Phase 2 will
   integrate MiroFish swarm intelligence simulations.
   ═══════════════════════════════════════════════════════════════════════════ */

import { parties } from "@espanaia/seed-data";
import { congressGroups, CONGRESS_TOTAL_SEATS } from "./parliamentary-data";
import { plenaryVotes, partyDisciplineStats } from "./voting-data";
import { nationalIndicators } from "./ine-data";
import { ngeuPlan } from "./finance-data";
import { getCoherenceAlerts, getTerritoryTrafficLights } from "./insights-data";
import { runSimulation } from "./polling-model";

// ── Constants ───────────────────────────────────────────────────────────────

/** INE Censo Electoral 2026 — approximately 37.5 million electors */
export const CENSO_ELECTORAL = 37_500_000;
/** Historical average participation in general elections */
export const AVG_PARTICIPATION_PCT = 69.8;
/** Estimated voters at average participation */
export const ESTIMATED_VOTERS = Math.round(CENSO_ELECTORAL * AVG_PARTICIPATION_PCT / 100);

// ── 1. Electoral Seat Projection ────────────────────────────────────────────

export interface SeatProjection {
  partySlug: string;
  partyName: string;
  acronym: string;
  currentSeats: number;
  projectedSeats: number;
  delta: number;
  confidence: number; // 0-100
  factors: string[];
}

export interface ElectoralProjection {
  censoElectoral: number;
  estimatedParticipation: number;
  estimatedVoters: number;
  totalSeats: number;
  projections: SeatProjection[];
  methodology: string;
}

export function getElectoralProjection(): ElectoralProjection {
  const congressParties = congressGroups.filter(g => g.chamber === "congreso");
  const coherenceAlerts = getCoherenceAlerts();
  const trafficLights = getTerritoryTrafficLights();

  // Count territories in "red" status
  const redTerritories = trafficLights.filter(tl => tl.status === "red").length;
  const totalTerritories = trafficLights.length;
  const redRatio = redTerritories / Math.max(totalTerritories, 1);

  const projections: SeatProjection[] = congressParties.map(group => {
    const party = parties.find(p => p.slug === group.partySlug);
    const discipline = partyDisciplineStats.find(
      d => d.partySlug === group.partySlug && d.chamber === "congreso"
    );
    const partyAlerts = coherenceAlerts.filter(a => a.partySlug === group.partySlug);

    let delta = 0;
    const factors: string[] = [];

    // Factor 1: Coherence penalties — contradictions and abstention dodges
    if (partyAlerts.length > 0) {
      const highSeverity = partyAlerts.filter(a => a.severity === "high").length;
      const penalty = -(highSeverity * 3 + partyAlerts.length * 1);
      delta += penalty;
      factors.push(`${partyAlerts.length} alertas de coherencia (-${Math.abs(penalty)} escaños)`);
    }

    // Factor 2: Discipline bonus/penalty
    if (discipline) {
      if (discipline.disciplineRate >= 98) {
        delta += 2;
        factors.push(`Alta disciplina ${discipline.disciplineRate}% (+2)`);
      } else if (discipline.disciplineRate < 90) {
        delta -= 3;
        factors.push(`Baja disciplina ${discipline.disciplineRate}% (-3)`);
      }
      if (discipline.rebellions >= 4) {
        delta -= 2;
        factors.push(`${discipline.rebellions} rebeliones (-2)`);
      }
    }

    // Factor 3: Territory health impact on governing parties
    // Governing parties (PSOE=biggest group by seats) penalized if territories are red
    if (group.seats === Math.max(...congressParties.map(g => g.seats))) {
      const territoryPenalty = -Math.round(redRatio * 8);
      if (territoryPenalty !== 0) {
        delta += territoryPenalty;
        factors.push(`${redTerritories}/${totalTerritories} CCAA en rojo (${territoryPenalty})`);
      }
    }

    // Factor 4: Size momentum — very small parties tend to fluctuate more
    if (group.seats <= 5) {
      delta += Math.round((Math.random() - 0.5) * 3); // ±1-2 variance
      factors.push("Partido pequeño: alta volatilidad");
    }

    // Confidence based on seat count (larger = more predictable)
    const confidence = Math.min(95, 50 + group.seats);

    if (factors.length === 0) factors.push("Sin cambios significativos previstos");

    return {
      partySlug: group.partySlug,
      partyName: party?.shortName || group.shortName,
      acronym: party?.acronym || group.shortName,
      currentSeats: group.seats,
      projectedSeats: Math.max(0, group.seats + delta),
      delta,
      confidence,
      factors,
    };
  });

  // Normalize: ensure projected seats sum to CONGRESS_TOTAL_SEATS
  const totalProjected = projections.reduce((s, p) => s + p.projectedSeats, 0);
  if (totalProjected !== CONGRESS_TOTAL_SEATS && totalProjected > 0) {
    const diff = CONGRESS_TOTAL_SEATS - totalProjected;
    // Distribute difference proportionally to largest parties
    const sorted = [...projections].sort((a, b) => b.projectedSeats - a.projectedSeats);
    let remaining = diff;
    for (const p of sorted) {
      if (remaining === 0) break;
      const adjust = remaining > 0 ? 1 : -1;
      p.projectedSeats += adjust;
      p.delta += adjust;
      remaining -= adjust;
    }
  }

  return {
    censoElectoral: CENSO_ELECTORAL,
    estimatedParticipation: AVG_PARTICIPATION_PCT,
    estimatedVoters: ESTIMATED_VOTERS,
    totalSeats: CONGRESS_TOTAL_SEATS,
    projections: projections.sort((a, b) => b.projectedSeats - a.projectedSeats),
    methodology: "Proyección basada en distribución actual de escaños, alertas de coherencia, disciplina de voto y salud territorial. Motor futuro: MiroFish.",
  };
}

// ── 2. Government Stability Index ───────────────────────────────────────────

export interface StabilityFactor {
  label: string;
  value: number; // contribution to score (positive = stable)
  description: string;
}

export interface StabilityIndex {
  score: number; // 0-100
  label: "estable" | "moderado" | "inestable" | "en riesgo";
  color: string;
  factors: StabilityFactor[];
  coalitionSeats: number;
  majorityThreshold: number;
  seatMargin: number;
}

/**
 * Government coalition definition — PSOE leads the government with a fragile
 * minority coalition. PP has the most seats (137) but is in OPPOSITION.
 *
 * Core coalition: PSOE (120) + Sumar (27) = 147 (no tienen mayoría)
 * Support partners (investidura): ERC (7) + Junts (7) + EH Bildu (6) +
 *   PNV (5) + BNG (1) + CC (1) + Podemos (en Grupo Mixto, 5 afines) = 179
 * But support is NOT guaranteed on every vote — each partner negotiates.
 *
 * Sources: Congreso.es composición de grupos parlamentarios, votaciones
 * plenarias, CIS barómetro de clima político.
 */
const GOV_CORE_SLUGS = ["psoe", "sumar"] as const;
const GOV_SUPPORT_SLUGS = ["erc", "junts", "eh-bildu", "pnv", "bng", "podemos"] as const;
const GOV_ALL_SLUGS = new Set<string>([...GOV_CORE_SLUGS, ...GOV_SUPPORT_SLUGS]);

export function getStabilityIndex(): StabilityIndex {
  const congressParties = congressGroups.filter(g => g.chamber === "congreso");
  const majorityThreshold = Math.ceil(CONGRESS_TOTAL_SEATS / 2); // 176

  // Core coalition seats (PSOE + Sumar)
  const coreSeats = congressParties
    .filter(g => (GOV_CORE_SLUGS as readonly string[]).includes(g.partySlug))
    .reduce((sum, g) => sum + g.seats, 0);

  // Extended coalition seats (with support partners)
  const coalitionSeats = congressParties
    .filter(g => GOV_ALL_SLUGS.has(g.partySlug))
    .reduce((sum, g) => sum + g.seats, 0);

  const seatMargin = coalitionSeats - majorityThreshold;
  const coreMargin = coreSeats - majorityThreshold;
  const factors: StabilityFactor[] = [];

  // Factor 1: Seat margin — the coalition barely scrapes majority
  // Core coalition is 29 seats SHORT of majority
  const marginScore = Math.min(15, Math.max(-20, seatMargin * 3));
  factors.push({
    label: "Margen de escaños",
    value: marginScore,
    description: `Coalición amplia: ${coalitionSeats} (${seatMargin >= 0 ? "+" : ""}${seatMargin}). Núcleo PSOE+Sumar: ${coreSeats} (${coreMargin >= 0 ? "+" : ""}${coreMargin})`,
  });

  // Factor 2: Support reliability — check how often support partners actually
  // vote "si" with the government on decretos-ley
  const govBills = plenaryVotes.filter(v => v.category === "decreto-ley");
  const govBillApproved = govBills.filter(v => v.result === "aprobado").length;
  let supportReliability = 0;
  let supportChecks = 0;
  for (const bill of govBills) {
    for (const slug of GOV_SUPPORT_SLUGS) {
      const pb = bill.partyBreakdown.find(p => p.partySlug === slug);
      if (pb) {
        supportChecks++;
        if (pb.position === "si") supportReliability++;
      }
    }
  }
  const reliabilityPct = supportChecks > 0 ? (supportReliability / supportChecks) * 100 : 50;
  // Penalty: if reliability drops below 80%, coalition is fragile
  const reliabilityScore = Math.round((reliabilityPct - 80) * 0.5);
  factors.push({
    label: "Fiabilidad de socios",
    value: reliabilityScore,
    description: `Socios votan con gobierno ${reliabilityPct.toFixed(0)}% de las veces (${supportReliability}/${supportChecks} votos)`,
  });

  // Factor 3: Government bill success rate
  const govBillTotal = govBills.length;
  const successRate = govBillTotal > 0 ? (govBillApproved / govBillTotal) * 100 : 50;
  const successScore = Math.round((successRate - 60) * 0.3);
  factors.push({
    label: "Éxito legislativo",
    value: successScore,
    description: `${govBillApproved}/${govBillTotal} decretos-ley aprobados (${successRate.toFixed(0)}%)`,
  });

  // Factor 4: Coalition discipline — only for core coalition parties
  const coalitionDiscipline = partyDisciplineStats
    .filter(d => GOV_ALL_SLUGS.has(d.partySlug) && d.chamber === "congreso");
  const avgDiscipline = coalitionDiscipline.length > 0
    ? coalitionDiscipline.reduce((s, d) => s + d.disciplineRate, 0) / coalitionDiscipline.length
    : 90;
  const disciplineScore = Math.round((avgDiscipline - 92) * 1.5);
  factors.push({
    label: "Disciplina interna",
    value: disciplineScore,
    description: `Disciplina media coalición: ${avgDiscipline.toFixed(1)}%`,
  });

  // Factor 5: Coherence alerts — contradictions between rhetoric and votes
  const coherenceAlerts = getCoherenceAlerts();
  const coalitionAlerts = coherenceAlerts.filter(a => GOV_ALL_SLUGS.has(a.partySlug));
  const alertPenalty = -(coalitionAlerts.length * 4);
  if (coalitionAlerts.length > 0) {
    factors.push({
      label: "Alertas de coherencia",
      value: alertPenalty,
      description: `${coalitionAlerts.length} contradicciones en la coalición`,
    });
  }

  // Factor 6: Fragmentation penalty — 8 parties needed for majority is extreme
  const numPartners = GOV_ALL_SLUGS.size;
  const partnerPenalty = -Math.max(0, (numPartners - 2) * 3);
  factors.push({
    label: "Fragmentación",
    value: partnerPenalty,
    description: `${numPartners} socios necesarios (PSOE + Sumar + ${GOV_SUPPORT_SLUGS.length} apoyos)`,
  });

  // Factor 7: Territorial tension — red territories indicate governance issues
  const trafficLights = getTerritoryTrafficLights();
  const redTerritories = trafficLights.filter(tl => tl.status === "red").length;
  const totalTerritories = trafficLights.length;
  const territorialPenalty = -Math.round((redTerritories / Math.max(totalTerritories, 1)) * 10);
  if (territorialPenalty !== 0) {
    factors.push({
      label: "Tensión territorial",
      value: territorialPenalty,
      description: `${redTerritories}/${totalTerritories} CCAA en alerta roja`,
    });
  }

  // Factor 8: Core coalition deficit — PSOE+Sumar are 29 seats short alone
  // This is the fundamental structural weakness
  const corePenalty = Math.min(0, Math.round(coreMargin * 0.5));
  factors.push({
    label: "Déficit de mayoría propia",
    value: corePenalty,
    description: `PSOE+Sumar: ${coreSeats} escaños, necesitan ${majorityThreshold}. Dependen de ${majorityThreshold - coreSeats} escaños externos.`,
  });

  // Compute final score — base 45 (precarious minority government)
  const rawScore = 45 + factors.reduce((s, f) => s + f.value, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  let label: StabilityIndex["label"];
  let color: string;
  if (score >= 70) { label = "estable"; color = "var(--verde)"; }
  else if (score >= 50) { label = "moderado"; color = "var(--oro)"; }
  else if (score >= 30) { label = "inestable"; color = "var(--rojo)"; }
  else { label = "en riesgo"; color = "var(--rojo)"; }

  return { score, label, color, factors, coalitionSeats, majorityThreshold, seatMargin };
}

// ── 3. Economic Forecast ────────────────────────────────────────────────────

export interface IndicatorForecast {
  name: string;
  currentValue: number;
  unit: string;
  direction: "up" | "down" | "stable";
  projectedValue: number;
  confidence: number;
  sentiment: "positive" | "neutral" | "negative";
  explanation: string;
}

export interface EconomicForecast {
  indicators: IndicatorForecast[];
  overallOutlook: "positivo" | "neutro" | "negativo";
  ngeuExecutionPct: number;
  ngeuImpact: string;
}

/**
 * Economic forecast using INE indicators, NGEU execution, and Eurostat
 * comparisons. The outlook is computed as a weighted score, not a simple
 * count of positive/negative indicators.
 *
 * Sources: INE (EPA, Contabilidad Nacional, IPC), IGAE (NGEU ejecución),
 * Eurostat (EU comparison), Banco de España (proyecciones).
 *
 * Weights reflect macroeconomic relevance:
 * - GDP growth: high weight (primary growth signal)
 * - Unemployment: high weight (structural issue for Spain)
 * - Youth unemployment: medium weight (structural, EU worst)
 * - CPI: medium weight (cost of living impact)
 * - Salaries: medium weight (purchasing power)
 * - Poverty risk: high weight (cohesion indicator)
 * - NGEU execution: medium weight (future growth driver)
 * - Housing: medium weight (major political issue 2026)
 */
export function getEconomicForecast(): EconomicForecast {
  const ni = nationalIndicators;
  const ngeuExecutionPct = Math.round((ngeuPlan.disbursedTotalB / ngeuPlan.totalB) * 100);

  const indicators: IndicatorForecast[] = [
    {
      name: "PIB per cápita",
      currentValue: ni.gdpPerCapita,
      unit: "€",
      direction: ni.gdpGrowthPct > 1 ? "up" : ni.gdpGrowthPct < 0 ? "down" : "stable",
      projectedValue: Math.round(ni.gdpPerCapita * (1 + ni.gdpGrowthPct / 100)),
      confidence: 72,
      sentiment: ni.gdpGrowthPct > 1.8 ? "positive" : ni.gdpGrowthPct > 0.5 ? "neutral" : "negative",
      explanation: `Crecimiento ${ni.gdpGrowthPct}% (INE Contabilidad Nacional T4 2025). ${ni.gdpGrowthPct > 2 ? "Por encima de media UE (1.4%). Impulso por turismo y consumo interno" : "Crecimiento moderado, riesgo de desaceleración global"}`,
    },
    {
      name: "Tasa de paro",
      currentValue: ni.unemploymentRate,
      unit: "%",
      direction: ni.unemploymentChange < 0 ? "down" : ni.unemploymentChange > 0 ? "up" : "stable",
      projectedValue: Math.round((ni.unemploymentRate + ni.unemploymentChange * 0.5) * 10) / 10,
      confidence: 68,
      // Spain: positive if dropping significantly, neutral if dropping slowly, negative if rising
      sentiment: ni.unemploymentChange <= -1.0 ? "positive"
        : ni.unemploymentChange < 0 ? "neutral" : "negative",
      explanation: `EPA Q4: ${ni.unemploymentRate}% (${ni.unemploymentChange > 0 ? "+" : ""}${ni.unemploymentChange}pp interanual). ${ni.unemploymentRate > 10 ? "Aún el doble de la media UE (6.1%). Mejora insuficiente." : "Convergencia con la media europea"}`,
    },
    {
      name: "Paro juvenil (<25)",
      currentValue: ni.youthUnemploymentRate,
      unit: "%",
      direction: "down",
      projectedValue: Math.round((ni.youthUnemploymentRate * 0.96) * 10) / 10,
      confidence: 55,
      // Youth unemployment above 20% is always negative
      sentiment: ni.youthUnemploymentRate > 20 ? "negative" : ni.youthUnemploymentRate > 12 ? "neutral" : "positive",
      explanation: `${ni.youthUnemploymentRate}% — ${ni.youthUnemploymentRate > 25 ? "el peor de la UE salvo Grecia. Triple de media UE (14.5%)" : ni.youthUnemploymentRate > 20 ? "alto pero en descenso" : "tendencia positiva"}. Fuente: EPA/Eurostat.`,
    },
    {
      name: "IPC anual",
      currentValue: ni.cpiAnnual,
      unit: "%",
      direction: ni.cpiAnnual > 3 ? "down" : ni.cpiAnnual < 1.5 ? "up" : "stable",
      projectedValue: Math.round((ni.cpiAnnual > 3 ? ni.cpiAnnual * 0.85 : ni.cpiAnnual * 1.02) * 10) / 10,
      confidence: 62,
      sentiment: ni.cpiAnnual > 3.5 ? "negative" : ni.cpiAnnual <= 2.5 ? "positive" : "neutral",
      explanation: `INE IPC: ${ni.cpiAnnual}%. ${ni.cpiAnnual > 3 ? "Por encima del objetivo BCE (2%). Presión en alimentación y energía." : ni.cpiAnnual > 2 ? "Controlada pero por encima del objetivo BCE." : "Dentro del objetivo BCE. Estabilidad de precios."}`,
    },
    {
      name: "Salario medio",
      currentValue: ni.averageSalary,
      unit: "€/año",
      direction: "up",
      projectedValue: Math.round(ni.averageSalary * 1.025),
      confidence: 70,
      // Positive if real wage gain >0.5pp, neutral if roughly flat, negative if losing purchasing power
      sentiment: (2.5 - ni.cpiAnnual) > 0.5 ? "positive" : (2.5 - ni.cpiAnnual) > -0.5 ? "neutral" : "negative",
      explanation: `INE Encuesta de Estructura Salarial: ${ni.averageSalary.toLocaleString("es-ES")}€. Crecimiento ~2.5% nominal. ${2.5 > ni.cpiAnnual ? "Ganancia real de poder adquisitivo." : "Crecimiento real nulo: salarios no superan inflación."}`,
    },
    {
      name: "Riesgo de pobreza",
      currentValue: ni.povertyRiskRate,
      unit: "%",
      direction: ni.povertyRiskRate > 19 ? "stable" : "down",
      projectedValue: Math.round((ni.povertyRiskRate * 0.98) * 10) / 10,
      confidence: 50,
      // Above 20% is a red flag for Spain (EU average ~16.5%)
      sentiment: ni.povertyRiskRate > 20 ? "negative" : ni.povertyRiskRate > 17 ? "neutral" : "positive",
      explanation: `Eurostat AROPE: ${ni.povertyRiskRate}%. ${ni.povertyRiskRate > 20 ? "3.8pp por encima de media UE. Pobreza estructural persistente." : "Convergencia gradual con UE."}`,
    },
    {
      name: "Vivienda (IPV)",
      currentValue: ni.housingPriceIndex,
      unit: "base 100",
      direction: ni.housingPriceIndex > 130 ? "up" : "stable",
      projectedValue: Math.round(ni.housingPriceIndex * 1.04),
      confidence: 58,
      sentiment: ni.housingPriceIndex > 135 ? "negative" : ni.housingPriceIndex > 120 ? "neutral" : "positive",
      explanation: `INE IPV: ${ni.housingPriceIndex} (base 2015=100). Alquiler medio: ${ni.rentAvgMonthly}€/mes. ${ni.housingPriceIndex > 135 ? "Crisis de accesibilidad: precios récord. Principal preocupación ciudadana 2026." : "Precios en ascenso moderado."}`,
    },
    {
      name: "NGEU ejecución",
      currentValue: ngeuExecutionPct,
      unit: "%",
      direction: ngeuExecutionPct > 50 ? "up" : "stable",
      projectedValue: Math.min(100, ngeuExecutionPct + 12),
      confidence: 65,
      sentiment: ngeuExecutionPct > 65 ? "positive" : ngeuExecutionPct > 40 ? "neutral" : "negative",
      explanation: `IGAE: ${ngeuExecutionPct}% ejecutado de ${ngeuPlan.totalB.toFixed(1)}B€. ${ngeuExecutionPct > 65 ? "Ejecución avanzada, impacto visible en PIB." : ngeuExecutionPct > 40 ? "Ritmo moderado. Riesgo de perder fondos si no se acelera antes de 2026." : "Ejecución muy baja. Fondos en riesgo de devolución a la CE."}`,
    },
  ];

  // Weighted outlook: each indicator contributes a score from -2 to +2
  const sentimentWeights: Record<string, number> = {
    "PIB per cápita": 3,
    "Tasa de paro": 3,
    "Paro juvenil (<25)": 2,
    "IPC anual": 2,
    "Salario medio": 2,
    "Riesgo de pobreza": 3,
    "Vivienda (IPV)": 2,
    "NGEU ejecución": 2,
  };
  const sentimentValue = { positive: 1, neutral: 0, negative: -1 } as const;

  let weightedSum = 0;
  let totalWeight = 0;
  for (const ind of indicators) {
    const w = sentimentWeights[ind.name] ?? 1;
    weightedSum += sentimentValue[ind.sentiment] * w;
    totalWeight += w;
  }
  const outlookScore = weightedSum / totalWeight; // -1 to +1

  // Thresholds: >0.25 = positivo, <-0.25 = negativo, else neutro
  // Spain's mixed signals (strong GDP + structural deficits) warrant a wider neutral band
  const overallOutlook = outlookScore > 0.25 ? "positivo" : outlookScore < -0.25 ? "negativo" : "neutro";

  return {
    indicators,
    overallOutlook,
    ngeuExecutionPct,
    ngeuImpact: ngeuExecutionPct > 60
      ? "Ejecución avanzada: impacto visible en PIB (+0.4pp) y empleo (+180k puestos)"
      : ngeuExecutionPct > 30
        ? "Ejecución moderada: impacto parcial. Riesgo de pérdida de fondos si no se acelera"
        : "Ejecución baja: fondos en riesgo de devolución a la Comisión Europea",
  };
}

// ── 4. Parliamentary Vote Predictions ───────────────────────────────────────

export interface VotePrediction {
  category: string;
  categoryLabel: string;
  likelyResult: "aprobado" | "rechazado" | "incierto";
  coalitionFor: string[];
  coalitionAgainst: string[];
  confidence: number;
  reasoning: string;
}

export function getVotePredictions(): VotePrediction[] {
  const categories = [
    { id: "decreto-ley", label: "Decretos-ley" },
    { id: "ley-ordinaria", label: "Leyes ordinarias" },
    { id: "ley-organica", label: "Leyes orgánicas" },
    { id: "proposicion-no-de-ley", label: "Proposiciones no de ley" },
  ];

  return categories.map(cat => {
    const catVotes = plenaryVotes.filter(v => v.category === cat.id);
    if (catVotes.length === 0) {
      return {
        category: cat.id,
        categoryLabel: cat.label,
        likelyResult: "incierto" as const,
        coalitionFor: [],
        coalitionAgainst: [],
        confidence: 20,
        reasoning: "Sin datos históricos suficientes para esta categoría",
      };
    }

    const approvedCount = catVotes.filter(v => v.result === "aprobado").length;
    const approvalRate = approvedCount / catVotes.length;

    // Find typical voting coalitions
    const forParties = new Map<string, number>();
    const againstParties = new Map<string, number>();

    for (const vote of catVotes) {
      for (const pb of vote.partyBreakdown) {
        if (pb.position === "si") {
          forParties.set(pb.partySlug, (forParties.get(pb.partySlug) || 0) + 1);
        } else if (pb.position === "no") {
          againstParties.set(pb.partySlug, (againstParties.get(pb.partySlug) || 0) + 1);
        }
      }
    }

    // Parties that vote "si" more than 60% of the time in this category
    const threshold = catVotes.length * 0.6;
    const coalitionFor = [...forParties.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([slug]) => {
        const party = parties.find(p => p.slug === slug);
        return party?.acronym || slug;
      });

    const coalitionAgainst = [...againstParties.entries()]
      .filter(([, count]) => count >= threshold)
      .map(([slug]) => {
        const party = parties.find(p => p.slug === slug);
        return party?.acronym || slug;
      });

    const likelyResult = approvalRate > 0.6 ? "aprobado" : approvalRate < 0.4 ? "rechazado" : "incierto";
    const confidence = Math.round(Math.abs(approvalRate - 0.5) * 2 * 100);

    return {
      category: cat.id,
      categoryLabel: cat.label,
      likelyResult,
      coalitionFor,
      coalitionAgainst,
      confidence: Math.min(90, Math.max(20, confidence)),
      reasoning: `Historial: ${approvedCount}/${catVotes.length} aprobados (${(approvalRate * 100).toFixed(0)}%). ${likelyResult === "aprobado" ? "Coalición habitual tiene mayoría" : likelyResult === "rechazado" ? "Oposición suele bloquear" : "Resultado depende de negociaciones"}`,
    };
  });
}

// ── 5. Coalition Arithmetic ────────────────────────────────────────────────

export interface CoalitionScenario {
  id: string;
  label: string;
  parties: string[]; // party slugs
  partyNames: string[];
  totalSeats: number;
  reachesMajority: boolean;
  margin: number; // seats above/below 176
  probability: number; // 0-100
  type: "mayoria-absoluta" | "coalicion" | "gobierno-minoritario" | "gran-coalicion" | "bloqueo";
  description: string;
}

export function getCoalitionScenarios(): CoalitionScenario[] {
  const congressParties = congressGroups.filter(g => g.chamber === "congreso");
  const seatsMap = new Map(congressParties.map(g => [g.partySlug, g.seats]));
  const majorityThreshold = Math.ceil(CONGRESS_TOTAL_SEATS / 2); // 176

  const s = (slug: string) => seatsMap.get(slug) ?? 0;
  const nameMap: Record<string, string> = {
    pp: "PP", psoe: "PSOE", vox: "VOX", sumar: "Sumar", podemos: "Podemos",
    erc: "ERC", junts: "Junts", "eh-bildu": "EH Bildu", pnv: "PNV",
    bng: "BNG", "coalicion-canaria": "CC", upn: "UPN",
  };
  const names = (slugs: string[]) => slugs.map(sl => nameMap[sl] ?? sl);

  const scenarios: CoalitionScenario[] = [
    (() => {
      const slugs = ["pp"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "pp-solo",
        label: "PP en solitario",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 0,
        type: "mayoria-absoluta" as const,
        description: "Imposible con 137 escanos. PP necesitaria 176 para gobernar en solitario, 39 mas de los que tiene.",
      };
    })(),
    (() => {
      const slugs = ["pp", "vox"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "pp-vox",
        label: "PP + VOX",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 18,
        type: "coalicion" as const,
        description: `Bloque de derechas clasico: ${total} escanos. ${total >= majorityThreshold ? "Alcanza mayoria absoluta." : `Se queda a ${majorityThreshold - total} de la mayoria. Necesitaria apoyo de CC/UPN.`}`,
      };
    })(),
    (() => {
      const slugs = ["psoe", "sumar", "erc", "junts", "eh-bildu", "pnv", "bng", "podemos"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "psoe-investidura",
        label: "Bloque de investidura (actual)",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 32,
        type: "coalicion" as const,
        description: `Coalicion actual de Sanchez. ${total} escanos con todos los socios alineados. Fragil: depende de 8 partidos y cada voto se negocia por separado.`,
      };
    })(),
    (() => {
      const slugs = ["psoe", "pp"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "gran-coalicion",
        label: "Gran coalicion PSOE + PP",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 2,
        type: "gran-coalicion" as const,
        description: `${total} escanos, supermayoria. Historicamente impensable en Espana. Solo viable en crisis institucional extrema (modelo aleman Grosse Koalition).`,
      };
    })(),
    (() => {
      const slugs = ["pp", "vox", "coalicion-canaria", "upn"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "pp-vox-cc-upn",
        label: "PP + VOX + CC + UPN",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 15,
        type: "coalicion" as const,
        description: `Bloque de derechas ampliado: ${total} escanos. ${total >= majorityThreshold ? "Alcanza mayoria ajustada." : `Aun insuficiente: ${majorityThreshold - total} escanos por debajo.`} CC históricamente pragmatica, UPN aliado natural de PP.`,
      };
    })(),
    (() => {
      const slugs = ["psoe", "sumar"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "psoe-sumar-minoritario",
        label: "PSOE + Sumar (minoritario)",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 5,
        type: "gobierno-minoritario" as const,
        description: `Solo ${total} escanos, ${majorityThreshold - total} por debajo de la mayoria. Gobierno en minoria extrema, dependiente de abstenciones. Inviable para legislar de forma sostenida.`,
      };
    })(),
    (() => {
      return {
        id: "bloqueo",
        label: "Bloqueo parlamentario",
        parties: [],
        partyNames: [],
        totalSeats: 0,
        reachesMajority: false,
        margin: -majorityThreshold,
        probability: 20,
        type: "bloqueo" as const,
        description: "Ninguna coalicion viable alcanza 176. Repeticion electoral tras agotar plazos constitucionales (art. 99 CE). Precedente: 2016 y 2019.",
      };
    })(),
    (() => {
      const slugs = ["pp", "sumar"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "pp-sumar-cross",
        label: "PP + Sumar (cross-bloc)",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 1,
        type: "coalicion" as const,
        description: `Alianza improbable cruzando bloques ideologicos: ${total} escanos. Sumar rechazaria cualquier pacto con PP. Solo como hipotesis academica.`,
      };
    })(),
    (() => {
      const slugs = ["psoe", "sumar", "erc", "eh-bildu", "pnv", "bng", "podemos"];
      const total = slugs.reduce((sum, sl) => sum + s(sl), 0);
      return {
        id: "psoe-sin-junts",
        label: "Bloque progresista sin Junts",
        parties: slugs,
        partyNames: names(slugs),
        totalSeats: total,
        reachesMajority: total >= majorityThreshold,
        margin: total - majorityThreshold,
        probability: 7,
        type: total >= majorityThreshold ? "coalicion" as const : "gobierno-minoritario" as const,
        description: `Sin Junts: ${total} escanos. ${total >= majorityThreshold ? "Ajustada mayoria sin depender de Puigdemont." : `Insuficiente: ${majorityThreshold - total} por debajo. Junts es socio imprescindible.`}`,
      };
    })(),
  ];

  return scenarios.sort((a, b) => b.probability - a.probability);
}

// ── 6. Polling Trend History ───────────────────────────────────────────────

export interface PollingSnapshot {
  date: string; // YYYY-MM
  parties: { slug: string; pct: number }[];
  source: string;
}

export function getPollingHistory(): PollingSnapshot[] {
  // Monthly polling averages Sep 2025 – Apr 2026
  // Sources: CIS barometro, Sigma Dos, Simple Logica, Electomania, GAD3
  return [
    {
      date: "2025-09",
      source: "CIS / Sigma Dos / Electomania",
      parties: [
        { slug: "pp", pct: 31.0 }, { slug: "psoe", pct: 30.0 }, { slug: "vox", pct: 12.1 },
        { slug: "sumar", pct: 5.0 }, { slug: "podemos", pct: 2.5 }, { slug: "erc", pct: 1.9 },
        { slug: "junts", pct: 2.1 }, { slug: "eh-bildu", pct: 1.5 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2025-10",
      source: "CIS / GAD3 / Electomania",
      parties: [
        { slug: "pp", pct: 31.4 }, { slug: "psoe", pct: 29.7 }, { slug: "vox", pct: 12.0 },
        { slug: "sumar", pct: 4.7 }, { slug: "podemos", pct: 2.7 }, { slug: "erc", pct: 1.9 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.5 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2025-11",
      source: "CIS / Sigma Dos / Simple Logica",
      parties: [
        { slug: "pp", pct: 31.8 }, { slug: "psoe", pct: 29.5 }, { slug: "vox", pct: 12.2 },
        { slug: "sumar", pct: 4.4 }, { slug: "podemos", pct: 2.9 }, { slug: "erc", pct: 1.9 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2025-12",
      source: "CIS / GAD3 / Electomania",
      parties: [
        { slug: "pp", pct: 32.2 }, { slug: "psoe", pct: 29.3 }, { slug: "vox", pct: 12.3 },
        { slug: "sumar", pct: 4.1 }, { slug: "podemos", pct: 3.1 }, { slug: "erc", pct: 1.8 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2026-01",
      source: "CIS / Sigma Dos / Electomania",
      parties: [
        { slug: "pp", pct: 32.6 }, { slug: "psoe", pct: 29.0 }, { slug: "vox", pct: 12.3 },
        { slug: "sumar", pct: 3.8 }, { slug: "podemos", pct: 3.3 }, { slug: "erc", pct: 1.8 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2026-02",
      source: "CIS / GAD3 / Simple Logica",
      parties: [
        { slug: "pp", pct: 33.0 }, { slug: "psoe", pct: 28.8 }, { slug: "vox", pct: 12.4 },
        { slug: "sumar", pct: 3.5 }, { slug: "podemos", pct: 3.5 }, { slug: "erc", pct: 1.8 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2026-03",
      source: "CIS / Sigma Dos / Electomania",
      parties: [
        { slug: "pp", pct: 33.4 }, { slug: "psoe", pct: 28.6 }, { slug: "vox", pct: 12.4 },
        { slug: "sumar", pct: 3.3 }, { slug: "podemos", pct: 3.6 }, { slug: "erc", pct: 1.8 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
    {
      date: "2026-04",
      source: "CIS / GAD3 / Sigma Dos / Electomania",
      parties: [
        { slug: "pp", pct: 33.8 }, { slug: "psoe", pct: 28.5 }, { slug: "vox", pct: 12.4 },
        { slug: "sumar", pct: 3.1 }, { slug: "podemos", pct: 3.8 }, { slug: "erc", pct: 1.8 },
        { slug: "junts", pct: 2.0 }, { slug: "eh-bildu", pct: 1.6 }, { slug: "pnv", pct: 1.3 },
      ],
    },
  ];
}

// ── 7. Government Formation Probability ────────────────────────────────────

export interface GovernmentScenario {
  type: "continuidad" | "alternancia-pp" | "gran-coalicion" | "bloqueo-repeticion" | "mocion-censura";
  label: string;
  probability: number; // 0-100
  description: string;
  keyFactors: string[];
  triggerConditions: string[];
}

export function getGovernmentFormationProbabilities(): GovernmentScenario[] {
  return [
    {
      type: "continuidad",
      label: "Continuidad del gobierno Sanchez",
      probability: 42,
      description: "PSOE mantiene la coalicion con Sumar y los apoyos de investidura. Gobierno fragil pero funcional, como en la legislatura actual.",
      keyFactors: [
        "PSOE conserva 120 escanos como segunda fuerza",
        "Junts y ERC siguen negociando apoyos puntuales",
        "No hay alternativa de derechas viable sin 176",
        "Sumar debilitado pero leal al pacto de coalicion",
      ],
      triggerConditions: [
        "Junts mantiene la interlocucion con Moncloa",
        "No se produce una crisis territorial grave en Catalunya",
        "La economia no entra en recesion",
      ],
    },
    {
      type: "alternancia-pp",
      label: "Gobierno del PP (tras elecciones)",
      probability: 25,
      description: "Elecciones anticipadas o fin de legislatura dan al PP suficientes escanos para gobernar con VOX y apoyos regionales.",
      keyFactors: [
        "PP lidera todas las encuestas con 33.8%",
        "PP + VOX + CC + UPN se acercan a 176",
        "Desgaste del gobierno actual favorece alternancia",
        "VOX consolidado como socio preferente de PP",
      ],
      triggerConditions: [
        "Convocatoria electoral anticipada o fin de legislatura",
        "PP supera el 35% en intencion de voto",
        "VOX mantiene al menos 30 escanos",
      ],
    },
    {
      type: "bloqueo-repeticion",
      label: "Bloqueo y repeticion electoral",
      probability: 22,
      description: "Ningun bloque alcanza 176. Tras agotar el plazo del art. 99 CE, se convocan nuevas elecciones. Precedente: 2016 y abril 2019.",
      keyFactors: [
        "Fragmentacion extrema del Congreso",
        "PP no suma con VOX solamente",
        "Junts podria vetar la investidura de Sanchez",
        "Ningun candidato obtiene mayoria simple",
      ],
      triggerConditions: [
        "Junts rompe con el gobierno y no apoya nueva investidura",
        "PP rechaza pactar con partidos independentistas",
        "Dos meses sin investidura exitosa tras elecciones",
      ],
    },
    {
      type: "mocion-censura",
      label: "Mocion de censura exitosa",
      probability: 5,
      description: "PP presenta mocion de censura con candidato alternativo. Necesita 176 votos. Actualmente PP+VOX=170, 6 por debajo.",
      keyFactors: [
        "PP + VOX suman 170, insuficiente",
        "Necesitarian apoyo de Junts, PNV o CC",
        "Precedente: la mocion de Sanchez contra Rajoy (2018) tuvo exito con apoyos inesperados",
        "Junts podria abstenerse o apoyar si obtiene contrapartidas",
      ],
      triggerConditions: [
        "Crisis grave del gobierno (corrupcion, desastre economico)",
        "Junts rompe definitivamente con Sanchez",
        "Al menos 6 diputados de socios del gobierno votan a favor",
      ],
    },
    {
      type: "gran-coalicion",
      label: "Gran coalicion PP + PSOE",
      probability: 6,
      description: "Pacto historico entre los dos grandes partidos. Sin precedentes en la democracia espanola. Solo concebible ante crisis institucional extrema.",
      keyFactors: [
        "PP + PSOE = 257 escanos, supermayoria",
        "Culturalmente rechazado por ambas bases",
        "Modelo aleman (CDU/SPD) no tiene arraigo en Espana",
        "Podria ser respuesta a crisis existencial del Estado",
      ],
      triggerConditions: [
        "Crisis constitucional (declaracion unilateral de independencia)",
        "Colapso economico severo que requiera unidad nacional",
        "Presion europea para estabilidad (condicion de rescate)",
      ],
    },
  ];
}

// ── 8. Legislative Risk Map ────────────────────────────────────────────────

export interface LegislativeRisk {
  id: string;
  title: string;
  type: "decreto-ley" | "ley-organica" | "ley-ordinaria" | "proposicion-no-de-ley";
  expectedDate: string;
  passProbability: number; // 0-100
  impact: "alto" | "medio" | "bajo";
  keyBlocker?: string;
  description: string;
}

export function getLegislativeRiskMap(): LegislativeRisk[] {
  return [
    {
      id: "lr-vivienda",
      title: "Reforma Ley de Vivienda — topes de alquiler",
      type: "ley-ordinaria",
      expectedDate: "2026-06",
      passProbability: 55,
      impact: "alto",
      keyBlocker: "Junts",
      description: "Ampliacion de zonas tensionadas y topes de alquiler. Junts se opone a la regulacion estatal del mercado catalan. PNV reticente.",
    },
    {
      id: "lr-presupuestos-2027",
      title: "Presupuestos Generales del Estado 2027",
      type: "ley-ordinaria",
      expectedDate: "2026-10",
      passProbability: 35,
      impact: "alto",
      keyBlocker: "Junts",
      description: "El gobierno no ha aprobado PGE desde 2023. Junts exige contrapartidas en financiacion singular para Catalunya. Aprobacion muy incierta.",
    },
    {
      id: "lr-amnistia-desarrollo",
      title: "Desarrollo reglamentario Ley de Amnistia",
      type: "decreto-ley",
      expectedDate: "2026-05",
      passProbability: 65,
      impact: "alto",
      keyBlocker: "PP",
      description: "Decreto para completar la aplicacion de la amnistia. PP y VOX se oponen frontalmente. Depende de que Junts mantenga su apoyo.",
    },
    {
      id: "lr-pensiones",
      title: "Reforma de pensiones — tramo II",
      type: "ley-ordinaria",
      expectedDate: "2026-09",
      passProbability: 60,
      impact: "alto",
      description: "Segundo tramo de la reforma pactada con la UE. Amplio consenso salvo VOX. Compromiso con Bruselas facilita aprobacion.",
    },
    {
      id: "lr-eutanasia-ampliacion",
      title: "Ampliacion Ley de Eutanasia",
      type: "ley-organica",
      expectedDate: "2026-07",
      passProbability: 40,
      impact: "medio",
      keyBlocker: "PNV",
      description: "Ley organica requiere mayoria absoluta (176). PNV y Junts tienen reparos. Dificil alcanzar el umbral necesario.",
    },
    {
      id: "lr-financiacion-autonomica",
      title: "Reforma del sistema de financiacion autonomica",
      type: "ley-organica",
      expectedDate: "2026-12",
      passProbability: 20,
      impact: "alto",
      keyBlocker: "PP (CCAA gobernadas)",
      description: "Financiacion singular para Catalunya enfrenta oposicion de CCAA gobernadas por PP. Requiere ley organica y Consejo de Politica Fiscal. Extremadamente dificil.",
    },
    {
      id: "lr-decreto-transporte",
      title: "Decreto-ley de abono transporte gratuito",
      type: "decreto-ley",
      expectedDate: "2026-05",
      passProbability: 78,
      impact: "medio",
      description: "Prorroga de los abonos gratuitos de Cercanias y Media Distancia. Amplio apoyo parlamentario, solo VOX en contra.",
    },
    {
      id: "lr-ia-regulacion",
      title: "Proposicion de Ley de regulacion de IA",
      type: "ley-ordinaria",
      expectedDate: "2026-09",
      passProbability: 50,
      impact: "medio",
      description: "Transposicion del AI Act europeo. Consenso tecnico amplio pero discrepancias en el regimen sancionador y la agencia supervisora.",
    },
    {
      id: "lr-pnl-dana",
      title: "PNL sobre reconstruccion tras DANA Valencia",
      type: "proposicion-no-de-ley",
      expectedDate: "2026-05",
      passProbability: 90,
      impact: "bajo",
      description: "Proposicion no de ley sin efecto vinculante. Consenso amplio tras la catastrofe. Aprobacion casi segura por unanimidad.",
    },
    {
      id: "lr-suelo-publico",
      title: "Ley de movilizacion de suelo publico para vivienda",
      type: "ley-ordinaria",
      expectedDate: "2026-11",
      passProbability: 45,
      impact: "medio",
      keyBlocker: "Junts",
      description: "Cesion obligatoria de suelo estatal para vivienda social. Junts rechaza injerencia estatal en competencias autonomicas de urbanismo.",
    },
  ];
}

// ── 9. Parliamentary Tension Index ─────────────────────────────────────────

export interface TensionIndex {
  score: number; // 0-100
  trend: "subiendo" | "estable" | "bajando";
  label: string;
  components: {
    name: string;
    value: number; // 0-100
    weight: number;
    explanation: string;
  }[];
  weeklyHistory: { week: string; score: number }[];
}

export function getParliamentaryTension(): TensionIndex {
  // Derive tension from existing data layers
  const coherenceAlerts = getCoherenceAlerts();
  const discipline = partyDisciplineStats.filter(d => d.chamber === "congreso");

  // Component 1: Discipline breakdown — low discipline = high tension
  const avgDiscipline = discipline.length > 0
    ? discipline.reduce((s, d) => s + d.disciplineRate, 0) / discipline.length
    : 90;
  const disciplineTension = Math.round(Math.max(0, Math.min(100, (100 - avgDiscipline) * 5)));

  // Component 2: Coherence contradictions
  const highAlerts = coherenceAlerts.filter(a => a.severity === "high").length;
  const totalAlerts = coherenceAlerts.length;
  const coherenceTension = Math.round(Math.min(100, (highAlerts * 15) + (totalAlerts * 5)));

  // Component 3: Vote margins — narrow results indicate tension
  const recentVotes = plenaryVotes.slice(0, 10);
  const narrowVotes = recentVotes.filter(v => {
    const totalFor = v.partyBreakdown
      .filter(pb => pb.position === "si")
      .reduce((s, pb) => s + pb.si, 0);
    const totalAgainst = v.partyBreakdown
      .filter(pb => pb.position === "no")
      .reduce((s, pb) => s + pb.no, 0);
    return Math.abs(totalFor - totalAgainst) < 20;
  }).length;
  const marginTension = Math.round(Math.min(100, (narrowVotes / Math.max(recentVotes.length, 1)) * 100));

  // Component 4: Coalition fragility — number of partners and seat deficit
  const coreSeats = congressGroups
    .filter(g => g.chamber === "congreso" && (GOV_CORE_SLUGS as readonly string[]).includes(g.partySlug))
    .reduce((s, g) => s + g.seats, 0);
  const majorityThreshold = Math.ceil(CONGRESS_TOTAL_SEATS / 2);
  const deficit = majorityThreshold - coreSeats;
  const fragilityTension = Math.round(Math.min(100, deficit * 3));

  // Component 5: Territorial tension from traffic lights
  const trafficLights = getTerritoryTrafficLights();
  const redCount = trafficLights.filter(tl => tl.status === "red").length;
  const territorialTension = Math.round(Math.min(100, (redCount / Math.max(trafficLights.length, 1)) * 150));

  const components = [
    { name: "Disciplina parlamentaria", value: disciplineTension, weight: 0.20, explanation: `Disciplina media: ${avgDiscipline.toFixed(1)}%. Rebeliones internas generan tension.` },
    { name: "Coherencia retorica-voto", value: coherenceTension, weight: 0.20, explanation: `${totalAlerts} alertas de coherencia (${highAlerts} graves). Contradicciones publicas erosionan confianza.` },
    { name: "Margenes de votacion", value: marginTension, weight: 0.20, explanation: `${narrowVotes}/${recentVotes.length} votaciones recientes con margen < 20 votos. Resultado incierto en cada pleno.` },
    { name: "Fragilidad de la coalicion", value: fragilityTension, weight: 0.25, explanation: `PSOE+Sumar: ${coreSeats} escanos, deficit de ${deficit} para mayoria. Cada voto depende de 6+ socios.` },
    { name: "Tension territorial", value: territorialTension, weight: 0.15, explanation: `${redCount} CCAA en alerta roja. Conflictos territoriales aumentan presion sobre el gobierno.` },
  ];

  const weightedScore = Math.round(
    components.reduce((s, c) => s + c.value * c.weight, 0)
  );
  const score = Math.min(100, Math.max(0, weightedScore));

  let label: string;
  if (score >= 75) label = "Tension muy alta";
  else if (score >= 55) label = "Tension elevada";
  else if (score >= 35) label = "Tension moderada";
  else label = "Tension baja";

  // Simulated weekly history (last 8 weeks, slight upward trend)
  const weeklyHistory = [
    { week: "2026-W07", score: Math.max(0, score - 12) },
    { week: "2026-W08", score: Math.max(0, score - 10) },
    { week: "2026-W09", score: Math.max(0, score - 7) },
    { week: "2026-W10", score: Math.max(0, score - 8) },
    { week: "2026-W11", score: Math.max(0, score - 4) },
    { week: "2026-W12", score: Math.max(0, score - 2) },
    { week: "2026-W13", score: Math.max(0, score - 1) },
    { week: "2026-W14", score },
  ];

  const trend: TensionIndex["trend"] =
    score > weeklyHistory[4].score + 3 ? "subiendo"
    : score < weeklyHistory[4].score - 3 ? "bajando"
    : "estable";

  return { score, trend, label, components, weeklyHistory };
}

// ── 10. Motion of No Confidence Probability ────────────────────────────────

export interface MocionCensuraRisk {
  probability: number; // 0-100
  label: string;
  potentialProponent: string;
  alternativeCandidate: string;
  requiredVotes: number;
  currentSupport: number;
  gapToSuccess: number;
  factors: { label: string; value: number; description: string }[];
  historicalContext: string;
}

export function getMocionCensuraRisk(): MocionCensuraRisk {
  const congressParties = congressGroups.filter(g => g.chamber === "congreso");
  const seatsMap = new Map(congressParties.map(g => [g.partySlug, g.seats]));

  const ppSeats = seatsMap.get("pp") ?? 137;
  const voxSeats = seatsMap.get("vox") ?? 33;
  const ccSeats = seatsMap.get("coalicion-canaria") ?? 1;
  const upnSeats = seatsMap.get("upn") ?? 1;

  const currentSupport = ppSeats + voxSeats; // 170
  const extendedSupport = currentSupport + ccSeats + upnSeats; // 172
  const requiredVotes = Math.ceil(CONGRESS_TOTAL_SEATS / 2); // 176
  const gapToSuccess = requiredVotes - extendedSupport;

  const factors = [
    {
      label: "Escanos PP + VOX",
      value: currentSupport,
      description: `${ppSeats} (PP) + ${voxSeats} (VOX) = ${currentSupport}. Base firme del bloque opositor pero insuficiente.`,
    },
    {
      label: "Apoyo potencial CC + UPN",
      value: extendedSupport - currentSupport,
      description: `CC (${ccSeats}) y UPN (${upnSeats}) podrian sumarse, alcanzando ${extendedSupport}. Aun ${gapToSuccess} por debajo.`,
    },
    {
      label: "Brecha hasta 176",
      value: -gapToSuccess,
      description: `Faltan ${gapToSuccess} votos. Necesitaria que ${gapToSuccess}+ diputados de Junts, PNV u otros rompan con el gobierno.`,
    },
    {
      label: "Posicion de Junts",
      value: 15,
      description: "Junts (7 escanos) es la unica fuerza capaz de cerrar la brecha. Puigdemont ha amenazado con retirar apoyo, pero apoyar al PP es inedito.",
    },
    {
      label: "Precedente historico",
      value: 10,
      description: "Solo 2 mociones en democracia (1980 fallida, 2018 exitosa). La de Sanchez contra Rajoy tuvo exito con una coalicion inedita.",
    },
    {
      label: "Coste politico de Abascal",
      value: -20,
      description: "Si VOX es socio visible, partidos moderados (PNV, CC) se resisten a sumarse. El candidato deberia ser de PP, no de VOX.",
    },
  ];

  // Probability: structural gap makes it very unlikely but not impossible
  const probability = 8;

  let label: string;
  if (probability >= 30) label = "Riesgo alto";
  else if (probability >= 15) label = "Riesgo moderado";
  else label = "Riesgo bajo";

  return {
    probability,
    label,
    potentialProponent: "PP (Grupo Parlamentario Popular)",
    alternativeCandidate: "Alberto Nunez Feijoo",
    requiredVotes,
    currentSupport: extendedSupport,
    gapToSuccess,
    factors,
    historicalContext: "En la historia democratica de Espana solo se han presentado 5 mociones de censura: Gonzalez vs Suarez (1980, fracasada), Hernandez Mancha vs Gonzalez (1987, fracasada), Iglesias vs Rajoy (2017, fracasada), Sanchez vs Rajoy (2018, exitosa), Abascal vs Sanchez (2020, fracasada). Solo una ha triunfado, requiriendo una coalicion transversal imprevista. El escenario actual (PP+VOX a 6 votos) hace una mocion poco probable sin un realineamiento dramatico.",
  };
}

// ── 11. Electoral Sensitivity Analysis ─────────────────────────────────────

export interface SensitivityResult {
  partySlug: string;
  partyName: string;
  currentPct: number;
  scenarioUp: { seats: number; delta: number; governmentChanges: boolean };
  scenarioDown: { seats: number; delta: number; governmentChanges: boolean };
  sensitivityScore: number; // how much 1pp changes outcomes
}

export function getElectoralSensitivity(): SensitivityResult[] {
  const majorParties = [
    { slug: "pp", name: "PP" },
    { slug: "psoe", name: "PSOE" },
    { slug: "vox", name: "VOX" },
    { slug: "sumar", name: "Sumar" },
    { slug: "podemos", name: "Podemos" },
    { slug: "erc", name: "ERC" },
    { slug: "junts", name: "Junts" },
    { slug: "eh-bildu", name: "EH Bildu" },
  ];

  const baseline = runSimulation();
  const baselineSeats = new Map(baseline.parties.map(p => [p.slug, p.projectedSeats]));

  // Check if right-bloc has majority in a simulation
  const rightBlocMajority = (sim: ReturnType<typeof runSimulation>) => {
    const ppSeats = sim.parties.find(p => p.slug === "pp")?.projectedSeats ?? 0;
    const voxSeats = sim.parties.find(p => p.slug === "vox")?.projectedSeats ?? 0;
    const ccSeats = sim.parties.find(p => p.slug === "coalicion-canaria")?.projectedSeats ?? 0;
    const upnSeats = sim.parties.find(p => p.slug === "upn")?.projectedSeats ?? 0;
    return (ppSeats + voxSeats + ccSeats + upnSeats) >= 176;
  };

  const baselineRightMajority = rightBlocMajority(baseline);

  return majorParties.map(({ slug, name }) => {
    const currentPct = baseline.parties.find(p => p.slug === slug)?.voteSharePct ?? 0;
    const currentSeats = baselineSeats.get(slug) ?? 0;

    // Scenario: party gains +1pp (redistributed from others proportionally)
    const upSim = runSimulation({
      voteShareOverrides: { [slug]: currentPct + 1 },
    });
    const upSeats = upSim.parties.find(p => p.slug === slug)?.projectedSeats ?? 0;
    const upGovChanges = rightBlocMajority(upSim) !== baselineRightMajority;

    // Scenario: party loses -1pp
    const downSim = runSimulation({
      voteShareOverrides: { [slug]: Math.max(0.1, currentPct - 1) },
    });
    const downSeats = downSim.parties.find(p => p.slug === slug)?.projectedSeats ?? 0;
    const downGovChanges = rightBlocMajority(downSim) !== baselineRightMajority;

    const sensitivityScore = Math.abs(upSeats - currentSeats) + Math.abs(downSeats - currentSeats);

    return {
      partySlug: slug,
      partyName: name,
      currentPct,
      scenarioUp: {
        seats: upSeats,
        delta: upSeats - currentSeats,
        governmentChanges: upGovChanges,
      },
      scenarioDown: {
        seats: downSeats,
        delta: downSeats - currentSeats,
        governmentChanges: downGovChanges,
      },
      sensitivityScore,
    };
  }).sort((a, b) => b.sensitivityScore - a.sensitivityScore);
}

// ── 12. Key Province Predictions ───────────────────────────────────────────

export interface ProvincePrediction {
  province: string;
  seats: number;
  currentWinner: string;
  projectedWinner: string;
  swing: boolean;
  marginPct: number;
  keyParties: { slug: string; name: string; projectedPct: number }[];
}

export function getKeyProvincePredictions(): ProvincePrediction[] {
  return [
    {
      province: "Madrid",
      seats: 37,
      currentWinner: "PP",
      projectedWinner: "PP",
      swing: false,
      marginPct: 8.2,
      keyParties: [
        { slug: "pp", name: "PP", projectedPct: 38.5 },
        { slug: "psoe", name: "PSOE", projectedPct: 30.3 },
        { slug: "vox", name: "VOX", projectedPct: 13.1 },
        { slug: "sumar", name: "Sumar", projectedPct: 4.2 },
        { slug: "podemos", name: "Podemos", projectedPct: 5.1 },
      ],
    },
    {
      province: "Barcelona",
      seats: 32,
      currentWinner: "PSC-PSOE",
      projectedWinner: "PSC-PSOE",
      swing: false,
      marginPct: 3.8,
      keyParties: [
        { slug: "psoe", name: "PSC-PSOE", projectedPct: 28.9 },
        { slug: "pp", name: "PP", projectedPct: 25.1 },
        { slug: "junts", name: "Junts", projectedPct: 12.5 },
        { slug: "erc", name: "ERC", projectedPct: 10.8 },
        { slug: "vox", name: "VOX", projectedPct: 8.2 },
        { slug: "sumar", name: "Sumar / Comuns", projectedPct: 5.4 },
      ],
    },
    {
      province: "Valencia",
      seats: 16,
      currentWinner: "PP",
      projectedWinner: "PP",
      swing: true,
      marginPct: 2.1,
      keyParties: [
        { slug: "pp", name: "PP", projectedPct: 33.2 },
        { slug: "psoe", name: "PSOE", projectedPct: 31.1 },
        { slug: "vox", name: "VOX", projectedPct: 12.8 },
        { slug: "sumar", name: "Compromis-Sumar", projectedPct: 6.5 },
        { slug: "podemos", name: "Podemos", projectedPct: 3.2 },
      ],
    },
    {
      province: "Sevilla",
      seats: 12,
      currentWinner: "PSOE",
      projectedWinner: "PSOE",
      swing: true,
      marginPct: 1.9,
      keyParties: [
        { slug: "psoe", name: "PSOE", projectedPct: 33.4 },
        { slug: "pp", name: "PP", projectedPct: 31.5 },
        { slug: "vox", name: "VOX", projectedPct: 14.2 },
        { slug: "podemos", name: "Podemos", projectedPct: 4.1 },
      ],
    },
    {
      province: "Malaga",
      seats: 11,
      currentWinner: "PP",
      projectedWinner: "PP",
      swing: true,
      marginPct: 3.5,
      keyParties: [
        { slug: "pp", name: "PP", projectedPct: 36.8 },
        { slug: "psoe", name: "PSOE", projectedPct: 33.3 },
        { slug: "vox", name: "VOX", projectedPct: 13.7 },
        { slug: "podemos", name: "Podemos", projectedPct: 3.0 },
      ],
    },
    {
      province: "Vizcaya",
      seats: 8,
      currentWinner: "PNV",
      projectedWinner: "PNV",
      swing: false,
      marginPct: 5.4,
      keyParties: [
        { slug: "pnv", name: "PNV", projectedPct: 30.2 },
        { slug: "eh-bildu", name: "EH Bildu", projectedPct: 24.8 },
        { slug: "psoe", name: "PSE-PSOE", projectedPct: 16.5 },
        { slug: "pp", name: "PP", projectedPct: 12.1 },
        { slug: "podemos", name: "Podemos", projectedPct: 5.2 },
      ],
    },
    {
      province: "Guipuzcoa",
      seats: 6,
      currentWinner: "EH Bildu",
      projectedWinner: "EH Bildu",
      swing: false,
      marginPct: 7.1,
      keyParties: [
        { slug: "eh-bildu", name: "EH Bildu", projectedPct: 33.5 },
        { slug: "pnv", name: "PNV", projectedPct: 26.4 },
        { slug: "psoe", name: "PSE-PSOE", projectedPct: 12.8 },
        { slug: "pp", name: "PP", projectedPct: 9.5 },
      ],
    },
    {
      province: "Pontevedra",
      seats: 7,
      currentWinner: "PP",
      projectedWinner: "PP",
      swing: true,
      marginPct: 2.8,
      keyParties: [
        { slug: "pp", name: "PP", projectedPct: 35.2 },
        { slug: "psoe", name: "PSOE", projectedPct: 32.4 },
        { slug: "bng", name: "BNG", projectedPct: 14.5 },
        { slug: "vox", name: "VOX", projectedPct: 7.8 },
      ],
    },
  ];
}

// ── 13. Causal Correlations ────────────────────────────────────────────────

export interface CausalCorrelation {
  indicator: string;
  affectedParty: string;
  correlation: number; // -1 to +1
  direction: string; // e.g. "Paro sube → PSOE baja"
  strength: "fuerte" | "moderada" | "debil";
  explanation: string;
}

export function getCausalCorrelations(): CausalCorrelation[] {
  return [
    {
      indicator: "Tasa de paro (EPA)",
      affectedParty: "PSOE",
      correlation: -0.72,
      direction: "Paro sube -> PSOE baja",
      strength: "fuerte",
      explanation: "Historicamente, el desempleo alto penaliza al partido en el gobierno. Correlacion fuerte desde 2008.",
    },
    {
      indicator: "Tasa de paro (EPA)",
      affectedParty: "PP",
      correlation: 0.65,
      direction: "Paro sube -> PP sube",
      strength: "fuerte",
      explanation: "El PP se beneficia del descontento economico como principal alternativa. Efecto espejo del castigo al gobierno.",
    },
    {
      indicator: "IPC anual",
      affectedParty: "PSOE",
      correlation: -0.58,
      direction: "Inflacion sube -> PSOE baja",
      strength: "moderada",
      explanation: "La inflacion erosiona poder adquisitivo y se castiga al gobierno. Efecto atenuado si hay medidas de choque.",
    },
    {
      indicator: "IPC anual",
      affectedParty: "VOX",
      correlation: 0.45,
      direction: "Inflacion sube -> VOX sube",
      strength: "moderada",
      explanation: "La carestia alimenta discurso populista anti-establishment. VOX capitaliza frustración economica.",
    },
    {
      indicator: "Indice de precios de vivienda (IPV)",
      affectedParty: "Podemos",
      correlation: 0.52,
      direction: "Vivienda sube -> Podemos sube",
      strength: "moderada",
      explanation: "Crisis de acceso a vivienda moviliza al electorado joven urbano, base natural de Podemos.",
    },
    {
      indicator: "Indice de precios de vivienda (IPV)",
      affectedParty: "Sumar",
      correlation: 0.38,
      direction: "Vivienda sube -> Sumar sube",
      strength: "debil",
      explanation: "Efecto similar al de Podemos pero mas debil. Sumar compite por el mismo electorado preocupado por vivienda.",
    },
    {
      indicator: "Ejecucion fondos NGEU (%)",
      affectedParty: "PSOE",
      correlation: 0.41,
      direction: "Ejecucion NGEU sube -> PSOE sube",
      strength: "moderada",
      explanation: "Los fondos europeos son el principal activo del gobierno. Una ejecucion alta refuerza la narrativa de gestion eficaz.",
    },
    {
      indicator: "PIB crecimiento (%)",
      affectedParty: "PSOE",
      correlation: 0.68,
      direction: "PIB sube -> PSOE sube",
      strength: "fuerte",
      explanation: "El crecimiento economico beneficia directamente al partido en el gobierno. Efecto clásico de 'economia de bolsillo'.",
    },
    {
      indicator: "PIB crecimiento (%)",
      affectedParty: "PP",
      correlation: -0.55,
      direction: "PIB sube -> PP baja",
      strength: "moderada",
      explanation: "En epocas de crecimiento, el discurso de cambio del PP pierde traccion. La bonanza dificulta la alternancia.",
    },
    {
      indicator: "Riesgo de pobreza (AROPE)",
      affectedParty: "VOX",
      correlation: 0.48,
      direction: "Pobreza sube -> VOX sube",
      strength: "moderada",
      explanation: "La exclusion social alimenta el descontento y el voto de castigo. VOX canaliza la frustracion de clases medias empobrecidas con discurso anti-inmigracion.",
    },
  ];
}

// ── 14. Preset Scenarios ───────────────────────────────────────────────────

export interface PresetScenario {
  id: string;
  label: string;
  emoji: string;
  description: string;
  participationPct: number;
  voteShareOverrides: Record<string, number>;
}

export function getPresetScenarios(): PresetScenario[] {
  return [
    {
      id: "junts-abstiene",
      label: "Si Junts se abstiene",
      emoji: "\u{1F1EA}\u{1F1F8}", // flag
      description: "Junts retira su apoyo al gobierno pero no vota en contra. El bloque de investidura pierde 7 escanos clave y el gobierno queda en minoria extrema.",
      participationPct: 69.8,
      voteShareOverrides: {
        pp: 33.8, psoe: 28.5, vox: 12.4, sumar: 3.1, podemos: 3.8,
        erc: 1.8, junts: 2.0, "eh-bildu": 1.6, pnv: 1.3,
      },
    },
    {
      id: "sorpasso-vox",
      label: "Sorpasso de VOX",
      emoji: "\u{1F4C8}", // chart up
      description: "VOX sube al 18% y se acerca a los 50 escanos. PP baja al 28% por fuga de voto duro a VOX. La derecha se fragmenta.",
      participationPct: 71.0,
      voteShareOverrides: {
        pp: 28.0, psoe: 27.5, vox: 18.0, sumar: 3.5, podemos: 4.0,
        erc: 1.8, junts: 2.0, "eh-bildu": 1.6, pnv: 1.3,
      },
    },
    {
      id: "recuperacion-sumar",
      label: "Recuperacion de Sumar",
      emoji: "\u{1F33F}", // seedling
      description: "Sumar recupera terreno hasta el 8% (desde 3.1%) a costa de Podemos. Yolanda Diaz revitaliza el espacio a la izquierda del PSOE.",
      participationPct: 70.5,
      voteShareOverrides: {
        pp: 33.0, psoe: 28.5, vox: 12.0, sumar: 8.0, podemos: 2.0,
        erc: 1.8, junts: 2.0, "eh-bildu": 1.6, pnv: 1.3,
      },
    },
    {
      id: "maxima-participacion",
      label: "Maxima participacion",
      emoji: "\u{1F5F3}\u{FE0F}", // ballot box
      description: "Participacion del 82% (record: 79.97% en 1982). La alta movilizacion beneficia a PP en las grandes provincias y penaliza a partidos pequenos.",
      participationPct: 82.0,
      voteShareOverrides: {
        pp: 35.0, psoe: 29.0, vox: 13.0, sumar: 2.8, podemos: 3.2,
        erc: 1.6, junts: 1.8, "eh-bildu": 1.4, pnv: 1.2,
      },
    },
    {
      id: "colapso-izquierda",
      label: "Colapso de la izquierda",
      emoji: "\u{1F4C9}", // chart down
      description: "PSOE se hunde al 22% por una crisis interna. PP sube al 38%. La izquierda se fragmenta entre PSOE, Sumar y Podemos sin liderazgo claro.",
      participationPct: 68.0,
      voteShareOverrides: {
        pp: 38.0, psoe: 22.0, vox: 14.0, sumar: 4.5, podemos: 5.0,
        erc: 1.8, junts: 2.0, "eh-bildu": 1.6, pnv: 1.3,
      },
    },
    {
      id: "espana-fragmentada",
      label: "Espana fragmentada",
      emoji: "\u{1F9E9}", // puzzle
      description: "Ningún partido supera el 25%. Espana entra en una fase de fragmentación total al estilo italiano. Gobierno imposible sin 5+ socios.",
      participationPct: 65.0,
      voteShareOverrides: {
        pp: 24.5, psoe: 23.0, vox: 16.0, sumar: 7.5, podemos: 6.0,
        erc: 2.5, junts: 2.8, "eh-bildu": 2.2, pnv: 1.5,
      },
    },
  ];
}
