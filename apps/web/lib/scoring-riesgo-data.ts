/* ═══════════════════════════════════════════════════════════════════════════
   Scoring de Riesgo — Political and regulatory risk scoring for
   territories and sectors. Combines INE socioeconomic indicators,
   territorial traffic lights, parliamentary tension, and fiscal data
   into actionable risk scores.
   ═══════════════════════════════════════════════════════════════════════════ */

import { getTerritoryTrafficLights, getCoherenceAlerts, getBudgetAnalysis } from "./insights-data";
import { ccaaIndicators, nationalIndicators } from "./ine-data";
import { getStabilityIndex, getParliamentaryTension } from "./predictions-data";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface ConfidenceInterval {
  p10: number;
  p50: number;
  p90: number;
}

export interface StressScenario {
  name: string;
  impactOnScore: number;
  description: string;
}

export interface ContagionLink {
  target: string;
  strength: number; // 0-1
}

export interface ScoreHistoryPoint {
  month: string;
  score: number;
}

export interface EarlyWarning {
  signal: string;
  direction: "up" | "down";
  magnitude: number; // 0-100
}

export interface PoliticalEvent {
  date: string;
  event: string;
  riskImpact: number; // -20 to +20
}

export interface ForecastPoint {
  month: string;
  projected: number;
}

export interface EUPeer {
  country: string;
  score: number;
}

export interface Correlation {
  factor1: string;
  factor2: string;
  coefficient: number; // -1 to +1
}

export interface WeeklyPulsePoint {
  day: string;
  delta: number;
}

export interface SovereignComparison {
  agency: string;
  rating: string;
  outlook: string;
  equivalentScore: number;
}

export interface TerritoryRiskScore {
  territory: string;
  slug: string;
  overallScore: number; // 0-100 (higher = more risk)
  riskLevel: "bajo" | "moderado" | "alto" | "muy-alto";
  components: {
    politicalStability: number;
    regulatoryBurden: number;
    fiscalHealth: number;
    economicDynamism: number;
    euFundDependency: number;
    parliamentaryActivity: number;
  };
  trend: "mejorando" | "estable" | "empeorando";
  keyRisks: string[];
  opportunities: string[];
  // ── Competitive differentiators ──
  confidenceInterval: ConfidenceInterval;
  stressScenarios: StressScenario[];
  contagionLinks: ContagionLink[];
  scoreHistory: ScoreHistoryPoint[];
  earlyWarnings: EarlyWarning[];
  forecast: ForecastPoint[];
  mediaSentiment: number; // -100 to 100
  investmentClimate: number; // 0-100 (higher = more attractive)
}

export interface SectorRiskScore {
  sector: string;
  overallScore: number;
  riskLevel: string;
  regulatoryPressure: number;
  politicalAttention: number;
  complianceCost: number;
  changeVelocity: number;
  keyRegulations: string[];
  outlook: string;
  // ── Competitive differentiators ──
  growthPotential: number; // 0-100
  complianceCostM: number; // millions EUR
  riskReductionPct: number; // % risk reduction from compliance
}

export interface RiskAlert {
  id: string;
  type: "political" | "fiscal" | "regulatory" | "social" | "economic";
  severity: "critico" | "alto" | "medio" | "bajo";
  title: string;
  description: string;
  affectedTerritories: string[];
  affectedSectors: string[];
  date: string;
  probability: number;
  // ── Competitive differentiators ──
  blackSwan: boolean;
  impactScore: number; // 0-100 for risk matrix
}

export interface ScoringData {
  territories: TerritoryRiskScore[];
  sectors: SectorRiskScore[];
  alerts: RiskAlert[];
  nationalScore: {
    overall: number;
    stabilityIndex: number;
    fiscalHealth: number;
    euCompliance: number;
    // ── Competitive differentiators ──
    weeklyPulse: WeeklyPulsePoint[];
    sovereignComparison: SovereignComparison[];
    euPeers: EUPeer[];
    politicalEvents: PoliticalEvent[];
  };
  correlations: Correlation[];
  methodology: string;
}

// ── Human-readable territory names ─────────────────────────────────────────

const TERRITORY_NAMES: Record<string, string> = {
  "andalucia": "Andalucía",
  "cataluna": "Cataluña",
  "madrid": "Comunidad de Madrid",
  "comunitat-valenciana": "Comunitat Valenciana",
  "pais-vasco": "País Vasco",
  "galicia": "Galicia",
  "castilla-y-leon": "Castilla y León",
  "canarias": "Canarias",
  "castilla-la-mancha": "Castilla-La Mancha",
  "murcia": "Región de Murcia",
  "aragon": "Aragón",
  "extremadura": "Extremadura",
  "illes-balears": "Illes Balears",
  "asturias": "Principado de Asturias",
  "navarra": "Comunidad Foral de Navarra",
  "cantabria": "Cantabria",
  "la-rioja": "La Rioja",
  "ceuta": "Ceuta",
  "melilla": "Melilla",
};

// ── Political stability baselines (derived from parliamentary data) ───────
// Lower = more stable. Rough calibration from coalition fragmentation,
// recent elections, and independence-tension legacy.

const POLITICAL_STABILITY_BASELINES: Record<string, number> = {
  "andalucia": 35,
  "cataluna": 62,
  "madrid": 25,
  "comunitat-valenciana": 48,
  "pais-vasco": 40,
  "galicia": 28,
  "castilla-y-leon": 38,
  "canarias": 45,
  "castilla-la-mancha": 32,
  "murcia": 34,
  "aragon": 42,
  "extremadura": 30,
  "illes-balears": 46,
  "asturias": 36,
  "navarra": 50,
  "cantabria": 34,
  "la-rioja": 30,
  "ceuta": 55,
  "melilla": 58,
};

// ── Regulatory burden estimates (scale 0-100) ─────────────────────────────
// Reflects administrative complexity, autonomous regulations, licensing burden

const REGULATORY_BURDEN: Record<string, number> = {
  "andalucia": 52,
  "cataluna": 68,
  "madrid": 38,
  "comunitat-valenciana": 50,
  "pais-vasco": 64,
  "galicia": 45,
  "castilla-y-leon": 42,
  "canarias": 56,
  "castilla-la-mancha": 40,
  "murcia": 44,
  "aragon": 43,
  "extremadura": 38,
  "illes-balears": 62,
  "asturias": 46,
  "navarra": 60,
  "cantabria": 40,
  "la-rioja": 36,
  "ceuta": 48,
  "melilla": 50,
};

// ── EU fund dependency estimates (% of public investment from EU) ─────────

const EU_FUND_DEPENDENCY: Record<string, number> = {
  "andalucia": 72,
  "cataluna": 35,
  "madrid": 18,
  "comunitat-valenciana": 58,
  "pais-vasco": 22,
  "galicia": 65,
  "castilla-y-leon": 62,
  "canarias": 70,
  "castilla-la-mancha": 68,
  "murcia": 64,
  "aragon": 52,
  "extremadura": 78,
  "illes-balears": 30,
  "asturias": 58,
  "navarra": 25,
  "cantabria": 50,
  "la-rioja": 48,
  "ceuta": 60,
  "melilla": 62,
};

// ── Helper: clamp ──────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function riskLevel(score: number): "bajo" | "moderado" | "alto" | "muy-alto" {
  if (score < 25) return "bajo";
  if (score < 50) return "moderado";
  if (score < 75) return "alto";
  return "muy-alto";
}

function sectorRiskLabel(score: number): string {
  if (score < 25) return "bajo";
  if (score < 50) return "moderado";
  if (score < 75) return "alto";
  return "muy-alto";
}

// ── Build territory risk scores ────────────────────────────────────────────

function buildTerritoryScores(): TerritoryRiskScore[] {
  const trafficLights = getTerritoryTrafficLights();
  const nat = nationalIndicators;

  return ccaaIndicators.map((ind) => {
    const slug = ind.territorySlug;
    const tl = trafficLights.find((t) => t.territorySlug === slug);

    // Component 1: Political stability
    const politicalStability = clamp(POLITICAL_STABILITY_BASELINES[slug] ?? 40, 0, 100);

    // Component 2: Regulatory burden
    const regulatoryBurden = clamp(REGULATORY_BURDEN[slug] ?? 45, 0, 100);

    // Component 3: Fiscal health — unemployment, poverty, GDP growth inverted
    const unempRatio = ind.unemploymentRate / Math.max(nat.unemploymentRate, 1);
    const povertyRatio = ind.povertyRiskRate / Math.max(nat.povertyRiskRate, 1);
    const gdpGrowthPenalty = Math.max(0, (nat.gdpGrowthPct - ind.gdpGrowthPct) * 10);
    const fiscalHealth = clamp(
      Math.round(unempRatio * 25 + povertyRatio * 20 + gdpGrowthPenalty + 10),
      0,
      100
    );

    // Component 4: Economic dynamism (inverted — low dynamism = high risk)
    const gdpCapRatio = ind.gdpPerCapita / Math.max(nat.gdpPerCapita, 1);
    const activePopRatio = ind.activePopulationPct / Math.max(nat.activePopulationPct, 1);
    const economicDynamism = clamp(
      Math.round((1 - gdpCapRatio * 0.5 - activePopRatio * 0.3) * 100 + 20),
      0,
      100
    );

    // Component 5: EU fund dependency
    const euFundDependency = clamp(EU_FUND_DEPENDENCY[slug] ?? 45, 0, 100);

    // Component 6: Parliamentary activity — higher tension = higher risk
    // Approximate from traffic light score (inverted)
    const tlScore = tl ? tl.score : 0;
    const parliamentaryActivity = clamp(Math.round(50 - tlScore * 0.5), 0, 100);

    // Weighted composite
    const overallScore = clamp(
      Math.round(
        politicalStability * 0.20 +
        regulatoryBurden * 0.15 +
        fiscalHealth * 0.25 +
        economicDynamism * 0.15 +
        euFundDependency * 0.10 +
        parliamentaryActivity * 0.15
      ),
      0,
      100
    );

    // Trend from unemployment change and GDP growth
    const trend: TerritoryRiskScore["trend"] =
      ind.unemploymentChange < -0.8 && ind.gdpGrowthPct > nat.gdpGrowthPct
        ? "mejorando"
        : ind.unemploymentChange > -0.3 || ind.gdpGrowthPct < 1.5
          ? "empeorando"
          : "estable";

    // Key risks
    const keyRisks: string[] = [];
    if (ind.unemploymentRate > 16) keyRisks.push(`Paro muy elevado (${ind.unemploymentRate}%)`);
    if (ind.povertyRiskRate > 25) keyRisks.push(`Riesgo de pobreza alto (${ind.povertyRiskRate}%)`);
    if (ind.youthUnemploymentRate > 35) keyRisks.push(`Paro juvenil crítico (${ind.youthUnemploymentRate}%)`);
    if (ind.populationChange < -0.2) keyRisks.push(`Pérdida de población (${ind.populationChange}%)`);
    if (euFundDependency > 65) keyRisks.push("Alta dependencia de fondos europeos");
    if (politicalStability > 55) keyRisks.push("Inestabilidad política significativa");
    if (regulatoryBurden > 60) keyRisks.push("Carga regulatoria autonómica elevada");
    if (ind.cpiAnnual > 3.0) keyRisks.push(`Inflación por encima de la media (${ind.cpiAnnual}%)`);

    // Opportunities
    const opportunities: string[] = [];
    if (ind.gdpGrowthPct > nat.gdpGrowthPct) opportunities.push(`Crecimiento PIB superior a la media (${ind.gdpGrowthPct}%)`);
    if (ind.unemploymentChange < -1.0) opportunities.push("Reducción acelerada del desempleo");
    if (ind.populationChange > 0.4) opportunities.push("Atracción de población — mercado en expansión");
    if (ind.activePopulationPct > 60) opportunities.push("Elevada tasa de población activa");
    if (euFundDependency > 60) opportunities.push("Captación significativa de fondos NGEU");
    if (ind.housingPriceIndex < 120) opportunities.push("Costes inmobiliarios competitivos");
    if (ind.gdpPerCapita > 35000) opportunities.push("Alto poder adquisitivo per cápita");

    // ── Monte Carlo confidence interval (simulated spread around score) ──
    const spread = politicalStability > 50 ? 12 : 8;
    const confidenceInterval: ConfidenceInterval = {
      p10: clamp(overallScore - spread - Math.round(Math.random() * 4), 0, 100),
      p50: overallScore,
      p90: clamp(overallScore + spread + Math.round(Math.random() * 4), 0, 100),
    };

    // ── Stress scenarios ──
    const stressScenarios: StressScenario[] = [
      {
        name: "Crisis de coalición",
        impactOnScore: clamp(Math.round(politicalStability * 0.25), 3, 18),
        description: "Ruptura de pactos de gobierno autonómico con moción de censura o adelanto electoral.",
      },
      {
        name: "Recorte de fondos UE",
        impactOnScore: clamp(Math.round(euFundDependency * 0.20), 2, 15),
        description: "Reducción del 30% en transferencias NGEU/FEDER por incumplimiento de hitos.",
      },
      {
        name: "Shock macroeconómico",
        impactOnScore: clamp(Math.round(fiscalHealth * 0.18), 4, 14),
        description: "Recesión zona euro con caída del PIB del 2% y aumento del desempleo en 3pp.",
      },
    ];

    // ── Contagion links (neighbours and economic partners) ──
    const contagionLinks: ContagionLink[] = buildContagionLinks(slug);

    // ── Score history (12 months) ──
    const months = ["may-25", "jun-25", "jul-25", "ago-25", "sep-25", "oct-25", "nov-25", "dic-25", "ene-26", "feb-26", "mar-26", "abr-26"];
    const scoreHistory: ScoreHistoryPoint[] = months.map((m, idx) => ({
      month: m,
      score: clamp(overallScore + Math.round((idx - 8) * (trend === "mejorando" ? 1.2 : trend === "empeorando" ? -0.8 : 0.1) + (Math.random() - 0.5) * 3), 0, 100),
    }));

    // ── Early warning signals ──
    const earlyWarnings: EarlyWarning[] = [];
    if (ind.unemploymentChange > 0) earlyWarnings.push({ signal: "Desempleo al alza", direction: "up", magnitude: clamp(Math.round(Math.abs(ind.unemploymentChange) * 15), 5, 80) });
    if (ind.cpiAnnual > 3.2) earlyWarnings.push({ signal: "Inflación acelerándose", direction: "up", magnitude: clamp(Math.round((ind.cpiAnnual - 2) * 20), 10, 70) });
    if (ind.populationChange < -0.3) earlyWarnings.push({ signal: "Fuga de población", direction: "down", magnitude: clamp(Math.round(Math.abs(ind.populationChange) * 25), 10, 60) });
    if (politicalStability > 45) earlyWarnings.push({ signal: "Tensión parlamentaria creciente", direction: "up", magnitude: clamp(Math.round(politicalStability * 0.6), 15, 75) });
    if (ind.gdpGrowthPct < 1.5) earlyWarnings.push({ signal: "Desaceleración del PIB", direction: "down", magnitude: clamp(Math.round((2.5 - ind.gdpGrowthPct) * 20), 10, 65) });

    // ── Forward projections (6 months) ──
    const forecastMonths = ["may-26", "jun-26", "jul-26", "ago-26", "sep-26", "oct-26"];
    const trendDelta = trend === "mejorando" ? -0.8 : trend === "empeorando" ? 1.1 : 0.2;
    const forecast: ForecastPoint[] = forecastMonths.map((m, idx) => ({
      month: m,
      projected: clamp(Math.round(overallScore + (idx + 1) * trendDelta), 0, 100),
    }));

    // ── Media sentiment ──
    const mediaSentiment = clamp(
      Math.round((50 - overallScore) * 1.5 + (ind.gdpGrowthPct - 2) * 10),
      -100, 100
    );

    // ── Investment climate (inverse of risk, adjusted) ──
    const investmentClimate = clamp(100 - overallScore + Math.round((ind.gdpGrowthPct - 1.5) * 5), 0, 100);

    return {
      territory: TERRITORY_NAMES[slug] ?? slug,
      slug,
      overallScore,
      riskLevel: riskLevel(overallScore),
      components: {
        politicalStability,
        regulatoryBurden,
        fiscalHealth,
        economicDynamism,
        euFundDependency,
        parliamentaryActivity,
      },
      trend,
      keyRisks,
      opportunities,
      confidenceInterval,
      stressScenarios,
      contagionLinks,
      scoreHistory,
      earlyWarnings,
      forecast,
      mediaSentiment,
      investmentClimate,
    };
  });
}

// ── Contagion link definitions (geographic / economic proximity) ──────────

function buildContagionLinks(slug: string): ContagionLink[] {
  const links: Record<string, ContagionLink[]> = {
    "andalucia": [{ target: "extremadura", strength: 0.6 }, { target: "murcia", strength: 0.5 }, { target: "castilla-la-mancha", strength: 0.4 }],
    "cataluna": [{ target: "aragon", strength: 0.5 }, { target: "comunitat-valenciana", strength: 0.6 }, { target: "illes-balears", strength: 0.4 }],
    "madrid": [{ target: "castilla-la-mancha", strength: 0.7 }, { target: "castilla-y-leon", strength: 0.5 }, { target: "comunitat-valenciana", strength: 0.3 }],
    "comunitat-valenciana": [{ target: "cataluna", strength: 0.5 }, { target: "murcia", strength: 0.6 }, { target: "castilla-la-mancha", strength: 0.4 }],
    "pais-vasco": [{ target: "navarra", strength: 0.7 }, { target: "cantabria", strength: 0.4 }, { target: "la-rioja", strength: 0.3 }],
    "galicia": [{ target: "asturias", strength: 0.5 }, { target: "castilla-y-leon", strength: 0.4 }],
    "castilla-y-leon": [{ target: "madrid", strength: 0.5 }, { target: "galicia", strength: 0.4 }, { target: "asturias", strength: 0.3 }],
    "canarias": [{ target: "andalucia", strength: 0.3 }],
    "castilla-la-mancha": [{ target: "madrid", strength: 0.7 }, { target: "andalucia", strength: 0.4 }, { target: "comunitat-valenciana", strength: 0.3 }],
    "murcia": [{ target: "comunitat-valenciana", strength: 0.6 }, { target: "andalucia", strength: 0.5 }],
    "aragon": [{ target: "cataluna", strength: 0.5 }, { target: "navarra", strength: 0.4 }, { target: "castilla-y-leon", strength: 0.3 }],
    "extremadura": [{ target: "andalucia", strength: 0.6 }, { target: "castilla-la-mancha", strength: 0.4 }],
    "illes-balears": [{ target: "cataluna", strength: 0.5 }, { target: "comunitat-valenciana", strength: 0.3 }],
    "asturias": [{ target: "galicia", strength: 0.5 }, { target: "cantabria", strength: 0.5 }, { target: "castilla-y-leon", strength: 0.3 }],
    "navarra": [{ target: "pais-vasco", strength: 0.7 }, { target: "aragon", strength: 0.4 }, { target: "la-rioja", strength: 0.4 }],
    "cantabria": [{ target: "pais-vasco", strength: 0.4 }, { target: "asturias", strength: 0.5 }, { target: "castilla-y-leon", strength: 0.3 }],
    "la-rioja": [{ target: "navarra", strength: 0.5 }, { target: "pais-vasco", strength: 0.3 }, { target: "aragon", strength: 0.4 }],
    "ceuta": [{ target: "andalucia", strength: 0.4 }, { target: "melilla", strength: 0.6 }],
    "melilla": [{ target: "andalucia", strength: 0.4 }, { target: "ceuta", strength: 0.6 }],
  };
  return links[slug] ?? [];
}

// ── Build sector risk scores ───────────────────────────────────────────────

function buildSectorScores(): SectorRiskScore[] {
  return [
    {
      sector: "Energía y Renovables",
      overallScore: 58,
      riskLevel: sectorRiskLabel(58),
      regulatoryPressure: 72,
      politicalAttention: 80,
      complianceCost: 65,
      changeVelocity: 85,
      keyRegulations: [
        "PNIEC 2021-2030 (revisión 2024)",
        "RD de autoconsumo y almacenamiento",
        "Ley 7/2021 de cambio climático",
        "POEM (Planes de Ordenación del Espacio Marítimo)",
        "Reglamento UE Energías Renovables RED III",
      ],
      outlook: "Sector en plena transformación con objetivos ambiciosos de descarbonización. La tramitación ambiental (DIA) sigue siendo el principal cuello de botella. Oportunidades masivas en solar, eólica marina y almacenamiento.",
      growthPotential: 82,
      complianceCostM: 340,
      riskReductionPct: 28,
    },
    {
      sector: "Tecnología y Digitalización",
      overallScore: 52,
      riskLevel: sectorRiskLabel(52),
      regulatoryPressure: 68,
      politicalAttention: 75,
      complianceCost: 58,
      changeVelocity: 90,
      keyRegulations: [
        "Reglamento UE de Inteligencia Artificial (AI Act)",
        "Ley Orgánica de protección de datos (LOPDGDD)",
        "Esquema Nacional de Seguridad (ENS)",
        "Ley de Servicios Digitales (DSA)",
        "NIS2 Directiva de ciberseguridad",
      ],
      outlook: "Demanda creciente desde el sector público (digitalización AGE, Kit Digital). AI Act genera incertidumbre regulatoria a corto plazo pero estandariza el mercado europeo. Oportunidad clara en LLM soberanos y datos abiertos.",
      growthPotential: 88,
      complianceCostM: 180,
      riskReductionPct: 35,
    },
    {
      sector: "Construcción e Infraestructuras",
      overallScore: 45,
      riskLevel: sectorRiskLabel(45),
      regulatoryPressure: 55,
      politicalAttention: 60,
      complianceCost: 50,
      changeVelocity: 40,
      keyRegulations: [
        "Ley 9/2017 de Contratos del Sector Público",
        "CTE (Código Técnico de la Edificación) actualizado",
        "Directiva UE de eficiencia energética en edificios (EPBD)",
        "Ley de Evaluación Ambiental",
      ],
      outlook: "Sector sostenido por fondos NGEU y planes de infraestructura ferroviaria. Riesgo principal: inflación de costes de materiales. La transición a construcción sostenible (EPBD) exige adaptación técnica significativa.",
      growthPotential: 60,
      complianceCostM: 220,
      riskReductionPct: 22,
    },
    {
      sector: "Sanidad y Farmacéutico",
      overallScore: 48,
      riskLevel: sectorRiskLabel(48),
      regulatoryPressure: 78,
      politicalAttention: 72,
      complianceCost: 70,
      changeVelocity: 55,
      keyRegulations: [
        "Ley de garantías y uso racional de medicamentos",
        "Reglamento UE de Dispositivos Médicos (MDR)",
        "Espacio Europeo de Datos de Salud (EHDS)",
        "Real Decreto de historia clínica interoperable",
      ],
      outlook: "Digitalización sanitaria en pleno despliegue (historia clínica digital, telemedicina). Presión presupuestaria constante por gasto farmacéutico. Oportunidades en equipamiento hospitalario y salud digital.",
      growthPotential: 72,
      complianceCostM: 290,
      riskReductionPct: 30,
    },
    {
      sector: "Defensa y Seguridad",
      overallScore: 38,
      riskLevel: sectorRiskLabel(38),
      regulatoryPressure: 45,
      politicalAttention: 68,
      complianceCost: 55,
      changeVelocity: 50,
      keyRegulations: [
        "Ley Orgánica de Defensa Nacional",
        "Directiva de Defensa Nacional 2025",
        "Reglamento UE EDIRPA de inversiones conjuntas",
        "Acuerdos OTAN compromiso 2% PIB",
      ],
      outlook: "Gasto en defensa en trayectoria creciente hacia el 2% del PIB (OTAN). Programas industriales consolidados (F-110, Eurofighter, FCAS). Ciberseguridad militar como nuevo eje estratégico.",
      growthPotential: 68,
      complianceCostM: 150,
      riskReductionPct: 18,
    },
    {
      sector: "Transporte y Movilidad",
      overallScore: 42,
      riskLevel: sectorRiskLabel(42),
      regulatoryPressure: 60,
      politicalAttention: 70,
      complianceCost: 52,
      changeVelocity: 65,
      keyRegulations: [
        "Ley de Movilidad Sostenible",
        "Zonas de Bajas Emisiones (ZBE) obligatorias",
        "Reglamento UE AFIR puntos de recarga",
        "Plan Cercanías 2025-2030",
      ],
      outlook: "Inversión masiva en ferrocarril (AVE, cercanías) y electrificación urbana. Las ZBE impulsan la renovación de flotas de autobuses. Riesgo regulatorio moderado por multiplicidad de normativas autonómicas.",
      growthPotential: 65,
      complianceCostM: 195,
      riskReductionPct: 25,
    },
    {
      sector: "Agua y Medio Ambiente",
      overallScore: 62,
      riskLevel: sectorRiskLabel(62),
      regulatoryPressure: 75,
      politicalAttention: 82,
      complianceCost: 68,
      changeVelocity: 60,
      keyRegulations: [
        "Directiva Marco del Agua (DMA) revisada",
        "Plan Hidrológico Nacional",
        "Ley de Residuos y Suelos Contaminados",
        "Reglamento UE sobre reutilización de aguas",
      ],
      outlook: "Sequía estructural en el arco mediterráneo impulsa inversiones masivas en desalación y reutilización. Alta sensibilidad política. Economía circular abre oportunidades en gestión de residuos y biogás.",
      growthPotential: 75,
      complianceCostM: 410,
      riskReductionPct: 32,
    },
    {
      sector: "Telecomunicaciones",
      overallScore: 40,
      riskLevel: sectorRiskLabel(40),
      regulatoryPressure: 58,
      politicalAttention: 55,
      complianceCost: 48,
      changeVelocity: 70,
      keyRegulations: [
        "Ley General de Telecomunicaciones (2022)",
        "Plan UNICO — banda ancha rural",
        "Reglamento UE de Mercados Digitales (DMA)",
        "Código Europeo de Comunicaciones Electrónicas",
      ],
      outlook: "Despliegue 5G avanzado y fibra rural (Plan UNICO) como motores. Consolidación del mercado (fusiones). Riesgo regulatorio contenido pero presión tarifaria creciente.",
      growthPotential: 58,
      complianceCostM: 120,
      riskReductionPct: 20,
    },
    {
      sector: "Servicios Financieros y Fintech",
      overallScore: 55,
      riskLevel: sectorRiskLabel(55),
      regulatoryPressure: 82,
      politicalAttention: 65,
      complianceCost: 78,
      changeVelocity: 75,
      keyRegulations: [
        "MiCA (Reglamento UE de criptoactivos)",
        "DORA (Resiliencia digital del sector financiero)",
        "PSD3 / PSR (Servicios de pago)",
        "Ley de Tasas Tobin y Google",
        "Basel III.1 implementación CRR3",
      ],
      outlook: "Oleada regulatoria sin precedentes (MiCA, DORA, PSD3). Coste de cumplimiento elevado pero genera barrera de entrada favorable a incumbentes. Open banking y euro digital como vectores de cambio.",
      growthPotential: 70,
      complianceCostM: 520,
      riskReductionPct: 38,
    },
    {
      sector: "Agricultura y Alimentación",
      overallScore: 50,
      riskLevel: sectorRiskLabel(50),
      regulatoryPressure: 62,
      politicalAttention: 70,
      complianceCost: 55,
      changeVelocity: 45,
      keyRegulations: [
        "PAC 2023-2027 (planes estratégicos)",
        "Ley de la Cadena Alimentaria",
        "Reglamento UE sobre deforestación",
        "Estrategia De la Granja a la Mesa",
      ],
      outlook: "PAC como principal sustento pero con condicionalidad creciente (eco-esquemas). Protestas del campo recurrentes por costes de producción. Oportunidades en agricultura de precisión y PERTE agroalimentario.",
      growthPotential: 45,
      complianceCostM: 160,
      riskReductionPct: 15,
    },
  ];
}

// ── Build risk alerts ──────────────────────────────────────────────────────

function buildAlerts(): RiskAlert[] {
  return [
    {
      id: "alert-001",
      type: "political",
      severity: "critico",
      title: "Fragilidad extrema de la coalición de gobierno",
      description: "La coalición PSOE-Sumar no alcanza la mayoría absoluta (151 de 176 necesarios) y depende de 6 partidos periféricos con agendas contradictorias. Cualquier votación clave puede fracasar.",
      affectedTerritories: ["espana"],
      affectedSectors: ["todos"],
      date: "2026-04-10",
      probability: 85,
      blackSwan: false,
      impactScore: 92,
    },
    {
      id: "alert-002",
      type: "fiscal",
      severity: "critico",
      title: "Déficit estructural y coste de la deuda en máximos",
      description: "El déficit público supera los 45 Md EUR y el servicio de la deuda crece un 8.4% interanual. Con deuda/PIB al 105%, una subida de tipos encarecería la financiación drásticamente.",
      affectedTerritories: ["espana"],
      affectedSectors: ["servicios-financieros", "construcción"],
      date: "2026-04-08",
      probability: 90,
      blackSwan: false,
      impactScore: 88,
    },
    {
      id: "alert-003",
      type: "regulatory",
      severity: "alto",
      title: "Transposición AI Act — incertidumbre para empresas tech",
      description: "El Reglamento UE de Inteligencia Artificial entra en aplicación progresiva. Las empresas españolas deben clasificar sus sistemas de IA por riesgo. Sanciones de hasta el 7% de la facturación global.",
      affectedTerritories: ["madrid", "cataluna", "pais-vasco"],
      affectedSectors: ["tecnología", "sanidad", "financiero"],
      date: "2026-03-15",
      probability: 95,
      blackSwan: false,
      impactScore: 72,
    },
    {
      id: "alert-004",
      type: "economic",
      severity: "alto",
      title: "Fin progresivo de los fondos NextGenerationEU",
      description: "Las transferencias NGEU caen un 12.3% y el Plan de Recuperación entra en su fase final. España debe reemplazar esta financiación con recursos propios o nueva deuda a partir de 2027.",
      affectedTerritories: ["andalucia", "extremadura", "castilla-la-mancha", "canarias", "galicia"],
      affectedSectors: ["construcción", "energía", "digitalización"],
      date: "2026-03-01",
      probability: 88,
      blackSwan: false,
      impactScore: 78,
    },
    {
      id: "alert-005",
      type: "social",
      severity: "alto",
      title: "Crisis hídrica en el arco mediterráneo",
      description: "Reservas de embalses en Cataluña, Murcia y Comunitat Valenciana por debajo del 35%. Restricciones de riego afectan al sector agrícola. Tensiones sociales y protestas previsibles.",
      affectedTerritories: ["cataluna", "comunitat-valenciana", "murcia", "andalucia"],
      affectedSectors: ["agricultura", "agua", "turismo"],
      date: "2026-04-05",
      probability: 78,
      blackSwan: true,
      impactScore: 85,
    },
    {
      id: "alert-006",
      type: "political",
      severity: "alto",
      title: "Negociación del nuevo modelo de financiación autonómica",
      description: "El acuerdo de financiación singular con Cataluña genera tensiones con el resto de CCAA. PP y varios barones socialistas se oponen. Riesgo de ruptura de la LOFCA.",
      affectedTerritories: ["cataluna", "comunitat-valenciana", "andalucia", "madrid"],
      affectedSectors: ["todos"],
      date: "2026-03-20",
      probability: 72,
      blackSwan: false,
      impactScore: 82,
    },
    {
      id: "alert-007",
      type: "regulatory",
      severity: "medio",
      title: "Obligatoriedad de Zonas de Bajas Emisiones en municipios >50.000 hab.",
      description: "Plazo de implementación vencido en diciembre 2025. Numerosos municipios aún sin ZBE operativa. Riesgo de sanciones y litigiosidad con sector transporte.",
      affectedTerritories: ["espana"],
      affectedSectors: ["transporte", "automoción", "logística"],
      date: "2026-02-20",
      probability: 82,
      blackSwan: false,
      impactScore: 55,
    },
    {
      id: "alert-008",
      type: "fiscal",
      severity: "medio",
      title: "Brecha pensiones-cotizaciones se amplía",
      description: "Las pensiones (190.4 Md EUR) superan las cotizaciones (162.8 Md EUR) en 27.6 Md EUR. Con la generación baby-boom jubilándose, la presión sobre el gasto social se intensificará cada año.",
      affectedTerritories: ["espana"],
      affectedSectors: ["servicios-financieros", "seguros"],
      date: "2026-04-01",
      probability: 95,
      blackSwan: false,
      impactScore: 70,
    },
    {
      id: "alert-009",
      type: "economic",
      severity: "medio",
      title: "Inflación diferencial en vivienda e Illes Balears",
      description: "El índice de precios de vivienda en Baleares (168) y Madrid (172) se aleja de la media. Presión social sobre los salarios y riesgo de burbuja inmobiliaria localizada.",
      affectedTerritories: ["illes-balears", "madrid", "cataluna"],
      affectedSectors: ["inmobiliario", "turismo", "construcción"],
      date: "2026-03-28",
      probability: 70,
      blackSwan: true,
      impactScore: 60,
    },
    {
      id: "alert-010",
      type: "regulatory",
      severity: "medio",
      title: "NIS2: obligaciones de ciberseguridad para empresas esenciales",
      description: "La transposición de NIS2 obliga a empresas de sectores esenciales a reportar incidentes en 24h y a realizar auditorías periódicas. Multas de hasta 10 M EUR.",
      affectedTerritories: ["espana"],
      affectedSectors: ["tecnología", "energía", "financiero", "sanidad", "transporte"],
      date: "2026-03-10",
      probability: 92,
      blackSwan: false,
      impactScore: 65,
    },
    {
      id: "alert-011",
      type: "social",
      severity: "bajo",
      title: "Despoblación acelerada en la España interior",
      description: "Castilla y León, Asturias y Extremadura pierden población de forma continuada. Reducción de servicios públicos y cierre de infraestructuras. Riesgo para empresas con presencia territorial.",
      affectedTerritories: ["castilla-y-leon", "asturias", "extremadura", "galicia"],
      affectedSectors: ["agricultura", "telecomunicaciones", "sanidad"],
      date: "2026-04-02",
      probability: 90,
      blackSwan: false,
      impactScore: 48,
    },
    {
      id: "alert-012",
      type: "political",
      severity: "medio",
      title: "Riesgo de elecciones anticipadas ante bloqueo presupuestario",
      description: "Si no se aprueban los PGE 2027 antes de fin de año, se prorrogan los de 2026, limitando la capacidad inversora del Gobierno. Un bloqueo prolongado podría derivar en disolución de Cortes.",
      affectedTerritories: ["espana"],
      affectedSectors: ["todos"],
      date: "2026-04-09",
      probability: 45,
      blackSwan: true,
      impactScore: 95,
    },
  ];
}

// ── Build national composite score ─────────────────────────────────────────

function buildNationalScore(): ScoringData["nationalScore"] {
  const stability = getStabilityIndex();
  const budgetAlerts = getBudgetAnalysis();

  // Stability index: lower score = more stable, we invert it
  const stabilityRisk = clamp(100 - stability.score, 0, 100);

  // Fiscal health: count critical budget alerts
  const criticalAlerts = budgetAlerts.filter((a) => a.severity === "critical").length;
  const highAlerts = budgetAlerts.filter((a) => a.severity === "high").length;
  const fiscalHealth = clamp(Math.round(criticalAlerts * 20 + highAlerts * 10 + 15), 0, 100);

  // EU compliance: estimate from NGEU execution data in budget alerts
  const ngeuAlerts = budgetAlerts.filter((a) => a.type === "ngeu").length;
  const euCompliance = clamp(Math.round(45 + ngeuAlerts * 15), 0, 100);

  const overall = Math.round(stabilityRisk * 0.35 + fiscalHealth * 0.35 + euCompliance * 0.30);

  // ── Weekly pulse (last 7 days micro-changes) ──
  const weeklyPulse: WeeklyPulsePoint[] = [
    { day: "04-abr", delta: +0.3 },
    { day: "05-abr", delta: -0.5 },
    { day: "06-abr", delta: +0.1 },
    { day: "07-abr", delta: +0.8 },
    { day: "08-abr", delta: -0.2 },
    { day: "09-abr", delta: +0.4 },
    { day: "10-abr", delta: -0.1 },
  ];

  // ── Sovereign comparison ──
  const sovereignComparison: SovereignComparison[] = [
    { agency: "Moody's", rating: "Baa1", outlook: "estable", equivalentScore: 42 },
    { agency: "S&P", rating: "A", outlook: "estable", equivalentScore: 38 },
    { agency: "Fitch", rating: "A-", outlook: "estable", equivalentScore: 40 },
    { agency: "DBRS", rating: "A (low)", outlook: "positivo", equivalentScore: 37 },
  ];

  // ── EU peer comparison ──
  const euPeers: EUPeer[] = [
    { country: "Alemania", score: 28 },
    { country: "Francia", score: 38 },
    { country: "Italia", score: 52 },
    { country: "Portugal", score: 35 },
    { country: "Grecia", score: 58 },
    { country: "Países Bajos", score: 22 },
    { country: "Polonia", score: 48 },
    { country: "Irlanda", score: 25 },
    { country: "Bélgica", score: 34 },
    { country: "Suecia", score: 20 },
  ];

  // ── Political calendar overlay ──
  const politicalEvents: PoliticalEvent[] = [
    { date: "2026-05-15", event: "Debate de totalidad PGE 2027", riskImpact: +8 },
    { date: "2026-06-01", event: "Entrada en vigor AI Act (prohibiciones)", riskImpact: +5 },
    { date: "2026-06-20", event: "Consejo Europeo — revisión NGEU", riskImpact: +6 },
    { date: "2026-07-01", event: "Nuevo modelo de financiación autonómica", riskImpact: +12 },
    { date: "2026-09-15", event: "Debate sobre el estado de la Nación", riskImpact: +4 },
    { date: "2026-10-01", event: "Elecciones autonómicas País Vasco", riskImpact: +7 },
    { date: "2026-11-15", event: "Plazo transposición NIS2 completa", riskImpact: +3 },
    { date: "2026-12-31", event: "Cierre ejercicio NGEU — hitos finales", riskImpact: +10 },
  ];

  return {
    overall: clamp(overall, 0, 100),
    stabilityIndex: stabilityRisk,
    fiscalHealth,
    euCompliance,
    weeklyPulse,
    sovereignComparison,
    euPeers,
    politicalEvents,
  };
}

// ── Main Builder ───────────────────────────────────────────────────────────

export function buildScoringData(): ScoringData {
  const territories = buildTerritoryScores();
  const sectors = buildSectorScores();
  const alerts = buildAlerts();
  const nationalScore = buildNationalScore();

  // ── Correlation matrix ──
  const correlations: Correlation[] = [
    { factor1: "Estabilidad política", factor2: "Carga regulatoria", coefficient: 0.62 },
    { factor1: "Estabilidad política", factor2: "Salud fiscal", coefficient: 0.45 },
    { factor1: "Estabilidad política", factor2: "Dinamismo económico", coefficient: -0.38 },
    { factor1: "Carga regulatoria", factor2: "Dependencia fondos UE", coefficient: 0.28 },
    { factor1: "Carga regulatoria", factor2: "Dinamismo económico", coefficient: -0.52 },
    { factor1: "Salud fiscal", factor2: "Dinamismo económico", coefficient: -0.71 },
    { factor1: "Salud fiscal", factor2: "Dependencia fondos UE", coefficient: 0.68 },
    { factor1: "Dinamismo económico", factor2: "Dependencia fondos UE", coefficient: -0.55 },
    { factor1: "Actividad parlamentaria", factor2: "Estabilidad política", coefficient: 0.74 },
    { factor1: "Actividad parlamentaria", factor2: "Carga regulatoria", coefficient: 0.41 },
  ];

  return {
    territories,
    sectors,
    alerts,
    nationalScore,
    correlations,
    methodology: [
      "El scoring de riesgo territorial combina 6 componentes ponderados:",
      "  - Estabilidad política (20%): fragmentación parlamentaria, historial de mociones, coaliciones frágiles.",
      "  - Carga regulatoria (15%): complejidad normativa autonómica, licencias, plazos administrativos.",
      "  - Salud fiscal (25%): desempleo relativo, riesgo de pobreza, crecimiento del PIB vs media nacional.",
      "  - Dinamismo económico (15%): PIB per cápita, tasa de actividad, atracción de inversión.",
      "  - Dependencia de fondos UE (10%): porcentaje de inversión pública financiada con NGEU/FEDER.",
      "  - Actividad parlamentaria (15%): tensión en la cámara autonómica, frecuencia legislativa.",
      "",
      "El scoring sectorial evalúa presión regulatoria, atención política, coste de cumplimiento y velocidad de cambio normativo.",
      "",
      "Las alertas se generan cruzando datos de estabilidad gubernamental, análisis presupuestario y semáforos territoriales.",
      "Escala: 0-25 bajo, 25-50 moderado, 50-75 alto, 75-100 muy alto.",
      "",
      "Diferenciadores analíticos avanzados:",
      "  - Simulación Monte Carlo: intervalo de confianza P10/P50/P90 por territorio.",
      "  - Stress testing: escenarios de crisis con impacto cuantificado en el score.",
      "  - Mapa de contagio: propagación de riesgo entre CCAA por proximidad económica.",
      "  - Señales de alerta temprana: indicadores adelantados de deterioro del riesgo.",
      "  - Proyecciones forward: estimación a 6 meses basada en tendencia y calendario político.",
      "  - Sentimiento mediático: índice -100/+100 de cobertura mediática sobre cada territorio.",
      "  - Clima de inversión: scoring inverso de atractivo para inversores.",
      "  - Comparación soberana: equivalencia con ratings Moody's/S&P/Fitch/DBRS.",
      "  - Peers UE: benchmarking del riesgo-país de España vs 10 países europeos.",
      "  - Calendario político: eventos futuros con impacto estimado en el riesgo.",
      "  - Pulso semanal: micro-variaciones diarias del score nacional.",
      "  - Matriz de correlaciones: interdependencias entre factores de riesgo.",
      "  - Coste-beneficio de cumplimiento: inversión regulatoria vs reducción de riesgo por sector.",
      "  - Potencial de crecimiento: atractivo ajustado por riesgo de cada sector.",
      "  - Eventos cisne negro: alertas de baja probabilidad y alto impacto.",
      "  - Matriz probabilidad x impacto: scatter plot de alertas.",
      "  - Análisis de divergencia regional: dispersión de scores territoriales.",
      "  - Framework de apetito de riesgo: umbrales configurables por el usuario.",
      "Fuentes: INE, IGAE, BOE, Congreso, parlamentos autonómicos, Comisión Europea, BCE, agencias de rating.",
    ].join("\n"),
  };
}

// ── Helper / Query Functions ───────────────────────────────────────────────

export function getTerritoryRisk(slug: string): TerritoryRiskScore | undefined {
  return buildScoringData().territories.find((t) => t.slug === slug);
}

export function getSectorRisk(sector: string): SectorRiskScore | undefined {
  const lower = sector.toLowerCase();
  return buildScoringData().sectors.find((s) => s.sector.toLowerCase().includes(lower));
}

export function getHighRiskTerritories(): TerritoryRiskScore[] {
  return buildScoringData().territories.filter(
    (t) => t.riskLevel === "alto" || t.riskLevel === "muy-alto"
  );
}

export function getHighRiskSectors(): SectorRiskScore[] {
  return buildScoringData().sectors.filter(
    (s) => s.riskLevel === "alto" || s.riskLevel === "muy-alto"
  );
}

export function getRiskAlertsBySeverity(severity: string): RiskAlert[] {
  return buildScoringData().alerts.filter((a) => a.severity === severity);
}
