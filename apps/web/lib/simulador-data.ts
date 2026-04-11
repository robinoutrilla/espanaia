/* ═══════════════════════════════════════════════════════════════════════════
   Simulador de España — Policy simulation engine.
   Test what would happen if you change a law, budget, policy, or
   territorial priority. "SimCity" for institutions + policy intelligence.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Types ─────────────────────────────────────────────────────────────────

export type ScenarioCategory = "presupuesto" | "ley" | "politica-publica" | "regulacion" | "territorial" | "europa";
export type ImpactLevel = "critico" | "alto" | "medio" | "bajo";
export type ActorStance = "beneficiado" | "perjudicado" | "neutro";
export type RiskLevel = "muy-alto" | "alto" | "medio" | "bajo";

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  variables: SimVariable[];
  createdDate: string;
  author: string;
  isPredefined: boolean;
  tags: string[];
}

export interface SimVariable {
  id: string;
  label: string;
  currentValue: number;
  simulatedValue: number;
  unit: string;
  min: number;
  max: number;
}

export interface ImpactResult {
  id: string;
  scenarioId: string;
  territory: string;
  territorySlug: string;
  impactLevel: ImpactLevel;
  impactScore: number; // -100 to +100
  affectedPopulation: number;
  budgetDelta: number; // millions €
  riskLevel: RiskLevel;
  opportunities: string[];
  risks: string[];
  cascadeEffects: CascadeEffect[];
  actors: ActorImpact[];
}

export interface CascadeEffect {
  order: number; // 1st, 2nd, 3rd order
  description: string;
  timeframe: string;
  probability: number;
}

export interface ActorImpact {
  name: string;
  type: "partido" | "ministerio" | "ccaa" | "sindicato" | "patronal" | "ong" | "ue";
  stance: ActorStance;
  influence: number; // 0-100
  reason: string;
}

export interface PredefinedScenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  complexity: "basica" | "intermedia" | "avanzada";
  estimatedTime: string;
  variables: SimVariable[];
  tags: string[];
  historicalPrecedent?: string;
}

export interface RegulatoryChain {
  id: string;
  scenarioId: string;
  steps: { order: number; regulation: string; status: string; dependency: string; timeframe: string }[];
}

export interface RiskOpportunityMatrix {
  scenarioId: string;
  items: { label: string; type: "riesgo" | "oportunidad"; probability: number; impact: number; sector: string }[];
}

export interface HistoricalComparison {
  id: string;
  title: string;
  year: number;
  description: string;
  outcome: string;
  similarityScore: number;
}

export interface SimuladorData {
  scenarios: SimulationScenario[];
  predefined: PredefinedScenario[];
  impactResults: ImpactResult[];
  regulatoryChains: RegulatoryChain[];
  riskMatrices: RiskOpportunityMatrix[];
  historicalComparisons: HistoricalComparison[];
  stats: {
    totalScenarios: number;
    predefinedCount: number;
    territoriesAnalyzed: number;
    actorsTracked: number;
    avgImpactScore: number;
    lastUpdated: string;
  };
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const scenarios: SimulationScenario[] = [
  {
    id: "sim-001", title: "Recorte NGEU 15%", description: "Simula una reducción del 15% en los fondos Next Generation EU asignados a España, incluyendo retrasos en desembolsos.",
    category: "europa", variables: [
      { id: "v1", label: "Fondos NGEU (M€)", currentValue: 163000, simulatedValue: 138550, unit: "M€", min: 100000, max: 200000 },
      { id: "v2", label: "Retraso desembolso (meses)", currentValue: 0, simulatedValue: 6, unit: "meses", min: 0, max: 24 },
    ],
    createdDate: "2026-04-01", author: "Sistema", isPredefined: true, tags: ["europa", "fondos", "ngeu"],
  },
  {
    id: "sim-002", title: "Reforma fiscal: IVA reducido al 8%", description: "Impacto de bajar el IVA reducido del 10% al 8% en productos básicos.",
    category: "presupuesto", variables: [
      { id: "v3", label: "Tipo IVA reducido (%)", currentValue: 10, simulatedValue: 8, unit: "%", min: 4, max: 15 },
      { id: "v4", label: "Recaudación perdida (M€)", currentValue: 0, simulatedValue: 4200, unit: "M€", min: 0, max: 10000 },
    ],
    createdDate: "2026-03-28", author: "Sistema", isPredefined: true, tags: ["fiscal", "iva", "consumo"],
  },
  {
    id: "sim-003", title: "Ley de Vivienda: tope alquiler 2%", description: "Simulación del impacto de limitar incrementos de alquiler al 2% anual en zonas tensionadas.",
    category: "ley", variables: [
      { id: "v5", label: "Tope incremento alquiler (%)", currentValue: 3, simulatedValue: 2, unit: "%", min: 0, max: 10 },
      { id: "v6", label: "Zonas tensionadas afectadas", currentValue: 140, simulatedValue: 210, unit: "municipios", min: 50, max: 500 },
    ],
    createdDate: "2026-03-20", author: "Analista", isPredefined: false, tags: ["vivienda", "alquiler", "urbanismo"],
  },
  {
    id: "sim-004", title: "Inversión defensa al 2% PIB", description: "España alcanza el compromiso OTAN del 2% del PIB en gasto militar.",
    category: "presupuesto", variables: [
      { id: "v7", label: "Gasto defensa (% PIB)", currentValue: 1.28, simulatedValue: 2.0, unit: "%", min: 0.5, max: 3 },
      { id: "v8", label: "Incremento presupuestario (M€)", currentValue: 0, simulatedValue: 10500, unit: "M€", min: 0, max: 20000 },
    ],
    createdDate: "2026-03-15", author: "Sistema", isPredefined: true, tags: ["defensa", "otan", "presupuesto"],
  },
  {
    id: "sim-005", title: "Descentralización sanitaria", description: "Transferencia de competencias sanitarias adicionales a CCAA con modelo de financiación propio.",
    category: "territorial", variables: [
      { id: "v9", label: "Competencias transferidas", currentValue: 0, simulatedValue: 5, unit: "áreas", min: 0, max: 10 },
      { id: "v10", label: "Presupuesto descentralizado (M€)", currentValue: 0, simulatedValue: 8200, unit: "M€", min: 0, max: 15000 },
    ],
    createdDate: "2026-03-10", author: "Analista", isPredefined: false, tags: ["sanidad", "ccaa", "descentralización"],
  },
  {
    id: "sim-006", title: "Transición energética acelerada", description: "Eliminar carbón en 2027, duplicar inversión renovable, cerrar nuclear en 2030.",
    category: "politica-publica", variables: [
      { id: "v11", label: "Cierre centrales carbón", currentValue: 2028, simulatedValue: 2027, unit: "año", min: 2026, max: 2035 },
      { id: "v12", label: "Inversión renovable (M€/año)", currentValue: 6000, simulatedValue: 12000, unit: "M€", min: 3000, max: 20000 },
    ],
    createdDate: "2026-03-05", author: "Sistema", isPredefined: true, tags: ["energía", "renovable", "clima"],
  },
];

const predefined: PredefinedScenario[] = [
  { id: "pre-001", title: "Recorte NGEU 15%", description: "Reducción fondos europeos", category: "europa", complexity: "avanzada", estimatedTime: "15 min", variables: scenarios[0].variables, tags: ["europa"], historicalPrecedent: "Crisis deuda 2012" },
  { id: "pre-002", title: "Bajada IVA reducido", description: "IVA al 8% en productos básicos", category: "presupuesto", complexity: "intermedia", estimatedTime: "10 min", variables: scenarios[1].variables, tags: ["fiscal"] },
  { id: "pre-003", title: "Tope alquileres", description: "Límite 2% anual zonas tensionadas", category: "ley", complexity: "intermedia", estimatedTime: "10 min", variables: scenarios[2].variables, tags: ["vivienda"] },
  { id: "pre-004", title: "Gasto defensa 2% PIB", description: "Cumplir compromiso OTAN", category: "presupuesto", complexity: "avanzada", estimatedTime: "15 min", variables: scenarios[3].variables, tags: ["defensa"] },
  { id: "pre-005", title: "Subida salario mínimo 10%", description: "SMI a 1.320€/mes", category: "politica-publica", complexity: "basica", estimatedTime: "5 min", variables: [{ id: "vp1", label: "SMI (€/mes)", currentValue: 1200, simulatedValue: 1320, unit: "€", min: 1000, max: 1500 }], tags: ["empleo"] },
  { id: "pre-006", title: "Reforma pensiones", description: "Retrasar jubilación a 67 real", category: "ley", complexity: "avanzada", estimatedTime: "20 min", variables: [{ id: "vp2", label: "Edad jubilación efectiva", currentValue: 64.2, simulatedValue: 67, unit: "años", min: 62, max: 70 }], tags: ["pensiones"] },
  { id: "pre-007", title: "Cierre nuclear 2030", description: "Todas las centrales nucleares cerradas en 2030", category: "politica-publica", complexity: "avanzada", estimatedTime: "15 min", variables: [{ id: "vp3", label: "Centrales activas", currentValue: 5, simulatedValue: 0, unit: "centrales", min: 0, max: 7 }], tags: ["energía"] },
  { id: "pre-008", title: "Amnistía fiscal", description: "Regularización de capitales en el exterior", category: "presupuesto", complexity: "intermedia", estimatedTime: "10 min", variables: [{ id: "vp4", label: "Capital regularizado (M€)", currentValue: 0, simulatedValue: 25000, unit: "M€", min: 0, max: 50000 }], tags: ["fiscal"] },
  { id: "pre-009", title: "Ley de IA", description: "Regulación integral de IA en sector público y privado", category: "regulacion", complexity: "avanzada", estimatedTime: "15 min", variables: [{ id: "vp5", label: "Empresas afectadas", currentValue: 0, simulatedValue: 45000, unit: "empresas", min: 0, max: 100000 }], tags: ["tecnología"] },
  { id: "pre-010", title: "Cupo vasco ampliado", description: "Revisión del cupo vasco con incremento del 20%", category: "territorial", complexity: "avanzada", estimatedTime: "20 min", variables: [{ id: "vp6", label: "Cupo (M€/año)", currentValue: 1500, simulatedValue: 1800, unit: "M€", min: 1000, max: 2500 }], tags: ["territorial", "financiación"] },
];

const impactResults: ImpactResult[] = [
  {
    id: "ir-001", scenarioId: "sim-001", territory: "Andalucía", territorySlug: "andalucia", impactLevel: "critico", impactScore: -72,
    affectedPopulation: 8500000, budgetDelta: -3400, riskLevel: "muy-alto",
    opportunities: ["Reasignación hacia proyectos más estratégicos", "Mayor eficiencia en absorción"],
    risks: ["Paralización de obras PRTR", "Pérdida de empleo en construcción", "Brecha digital rural se amplía"],
    cascadeEffects: [
      { order: 1, description: "Paralización inmediata de licitaciones NGEU en curso", timeframe: "0-3 meses", probability: 95 },
      { order: 2, description: "Despidos en constructoras y consultoras dependientes", timeframe: "3-6 meses", probability: 80 },
      { order: 3, description: "Revisión del plan de digitalización autonómico", timeframe: "6-12 meses", probability: 65 },
    ],
    actors: [
      { name: "Junta de Andalucía", type: "ccaa", stance: "perjudicado", influence: 85, reason: "Mayor receptor absoluto de fondos NGEU" },
      { name: "PSOE-A", type: "partido", stance: "perjudicado", influence: 60, reason: "Debilita narrativa de gestión" },
      { name: "PP-A", type: "partido", stance: "perjudicado", influence: 70, reason: "Gobierna la CCAA afectada" },
      { name: "CEOE-Andalucía", type: "patronal", stance: "perjudicado", influence: 55, reason: "Contratos en riesgo" },
    ],
  },
  {
    id: "ir-002", scenarioId: "sim-001", territory: "Cataluña", territorySlug: "cataluna", impactLevel: "alto", impactScore: -58,
    affectedPopulation: 7800000, budgetDelta: -2800, riskLevel: "alto",
    opportunities: ["Acelerar proyectos privados alternativos", "Atraer inversión directa"],
    risks: ["Retraso transición industrial", "Impacto en pymes tecnológicas"],
    cascadeEffects: [
      { order: 1, description: "Recalibrar prioridades de inversión autonómica", timeframe: "0-3 meses", probability: 90 },
      { order: 2, description: "Negociación bilateral con Madrid por compensaciones", timeframe: "3-9 meses", probability: 70 },
    ],
    actors: [
      { name: "Generalitat de Catalunya", type: "ccaa", stance: "perjudicado", influence: 80, reason: "Segundo receptor de fondos" },
      { name: "Foment del Treball", type: "patronal", stance: "perjudicado", influence: 50, reason: "Inversiones comprometidas" },
    ],
  },
  {
    id: "ir-003", scenarioId: "sim-002", territory: "España (nacional)", territorySlug: "nacional", impactLevel: "medio", impactScore: 35,
    affectedPopulation: 48000000, budgetDelta: -4200, riskLevel: "medio",
    opportunities: ["Mayor consumo hogares", "Alivio inflación percibida", "Impulso pequeño comercio"],
    risks: ["Agujero recaudatorio", "Incumplimiento objetivo déficit", "Presión Bruselas"],
    cascadeEffects: [
      { order: 1, description: "Incremento inmediato del consumo privado", timeframe: "0-3 meses", probability: 85 },
      { order: 2, description: "Revisión del cuadro macroeconómico", timeframe: "3-6 meses", probability: 75 },
      { order: 3, description: "Posible procedimiento de déficit excesivo UE", timeframe: "12-18 meses", probability: 45 },
    ],
    actors: [
      { name: "Ministerio de Hacienda", type: "ministerio", stance: "perjudicado", influence: 95, reason: "Menor recaudación" },
      { name: "CCOO/UGT", type: "sindicato", stance: "beneficiado", influence: 60, reason: "Mejora poder adquisitivo" },
      { name: "CEOE", type: "patronal", stance: "beneficiado", influence: 70, reason: "Mayor demanda interna" },
      { name: "Comisión Europea", type: "ue", stance: "perjudicado", influence: 80, reason: "Riesgo disciplina fiscal" },
    ],
  },
  {
    id: "ir-004", scenarioId: "sim-003", territory: "Madrid", territorySlug: "madrid", impactLevel: "critico", impactScore: -45,
    affectedPopulation: 6800000, budgetDelta: -180, riskLevel: "alto",
    opportunities: ["Estabilización precios alquiler", "Mayor acceso vivienda joven"],
    risks: ["Reducción oferta alquiler", "Desplazamiento inversión a compra", "Mercado negro"],
    cascadeEffects: [
      { order: 1, description: "Congelación oferta en zonas tensionadas", timeframe: "0-6 meses", probability: 80 },
      { order: 2, description: "Migración de inversores a alquiler turístico", timeframe: "6-12 meses", probability: 65 },
    ],
    actors: [
      { name: "Comunidad de Madrid", type: "ccaa", stance: "perjudicado", influence: 85, reason: "Opuesta a intervención precios" },
      { name: "Idealista/Fotocasa", type: "patronal", stance: "perjudicado", influence: 40, reason: "Menos operaciones" },
      { name: "Sindicato Inquilinos", type: "sindicato", stance: "beneficiado", influence: 35, reason: "Logro histórico" },
    ],
  },
  {
    id: "ir-005", scenarioId: "sim-004", territory: "España (nacional)", territorySlug: "nacional", impactLevel: "alto", impactScore: 20,
    affectedPopulation: 48000000, budgetDelta: -10500, riskLevel: "alto",
    opportunities: ["Industria defensa fortalecida", "Empleos cualificados", "Soberanía tecnológica"],
    risks: ["Recortes en gasto social", "Oposición ciudadana", "Desequilibrio presupuestario"],
    cascadeEffects: [
      { order: 1, description: "Licitaciones defensa masivas en 6 meses", timeframe: "0-6 meses", probability: 90 },
      { order: 2, description: "Recorte compensatorio en otras partidas", timeframe: "6-12 meses", probability: 75 },
      { order: 3, description: "Tensión social por priorización militar", timeframe: "12-24 meses", probability: 55 },
    ],
    actors: [
      { name: "Ministerio de Defensa", type: "ministerio", stance: "beneficiado", influence: 90, reason: "Presupuesto multiplicado" },
      { name: "Indra/Navantia", type: "patronal", stance: "beneficiado", influence: 65, reason: "Contratos millonarios" },
      { name: "Podemos/Sumar", type: "partido", stance: "perjudicado", influence: 40, reason: "Oposición ideológica" },
      { name: "OTAN", type: "ue", stance: "beneficiado", influence: 70, reason: "Cumplimiento compromiso" },
    ],
  },
  {
    id: "ir-006", scenarioId: "sim-005", territory: "País Vasco", territorySlug: "pais-vasco", impactLevel: "medio", impactScore: -25,
    affectedPopulation: 2200000, budgetDelta: -1200, riskLevel: "medio",
    opportunities: ["Mayor coordinación sanitaria", "Eficiencia en compras centralizadas"],
    risks: ["Burocracia duplicada", "Conflicto competencial"],
    cascadeEffects: [
      { order: 1, description: "Negociación competencial de 12 meses", timeframe: "0-12 meses", probability: 85 },
      { order: 2, description: "Recursos ante el TC por invasión competencial", timeframe: "6-18 meses", probability: 50 },
    ],
    actors: [
      { name: "Gobierno Vasco", type: "ccaa", stance: "perjudicado", influence: 80, reason: "Pierde control competencial" },
      { name: "PNV", type: "partido", stance: "perjudicado", influence: 75, reason: "Defiende autogobierno" },
    ],
  },
  {
    id: "ir-007", scenarioId: "sim-006", territory: "Asturias", territorySlug: "asturias", impactLevel: "critico", impactScore: -80,
    affectedPopulation: 1010000, budgetDelta: -450, riskLevel: "muy-alto",
    opportunities: ["Fondos transición justa", "Reconversión energética"],
    risks: ["Desempleo masivo en minería", "Despoblación acelerada", "Crisis social"],
    cascadeEffects: [
      { order: 1, description: "Cierre acelerado de centrales térmicas", timeframe: "0-6 meses", probability: 95 },
      { order: 2, description: "Pérdida de 3.000 empleos directos", timeframe: "6-12 meses", probability: 85 },
      { order: 3, description: "Éxodo poblacional hacia Madrid y País Vasco", timeframe: "12-36 meses", probability: 60 },
    ],
    actors: [
      { name: "Principado de Asturias", type: "ccaa", stance: "perjudicado", influence: 70, reason: "Dependencia energética fósil" },
      { name: "SOMA-UGT", type: "sindicato", stance: "perjudicado", influence: 55, reason: "Empleos en riesgo" },
    ],
  },
  {
    id: "ir-008", scenarioId: "sim-006", territory: "Castilla y León", territorySlug: "castilla-y-leon", impactLevel: "alto", impactScore: 55,
    affectedPopulation: 2380000, budgetDelta: 1800, riskLevel: "bajo",
    opportunities: ["Líder eólica y solar", "Empleo verde rural", "Atracción de inversión"],
    risks: ["Impacto paisajístico", "Resistencia local"],
    cascadeEffects: [
      { order: 1, description: "Boom de parques eólicos y fotovoltaicos", timeframe: "0-12 meses", probability: 90 },
      { order: 2, description: "Creación de 5.000 empleos verdes", timeframe: "12-24 meses", probability: 70 },
    ],
    actors: [
      { name: "Junta de CyL", type: "ccaa", stance: "beneficiado", influence: 75, reason: "Territorio con mayor potencial renovable" },
      { name: "Iberdrola", type: "patronal", stance: "beneficiado", influence: 80, reason: "Líder renovable en España" },
    ],
  },
  // ── Impact results para CCAAs adicionales ─────────────────────────────
  {
    id: "ir-009", scenarioId: "sim-001", territory: "Comunitat Valenciana", territorySlug: "comunitat-valenciana", impactLevel: "critico", impactScore: -68,
    affectedPopulation: 5200000, budgetDelta: -2200, riskLevel: "muy-alto",
    opportunities: ["Priorizar reconstrucción DANA con fondos propios"],
    risks: ["Paralización reconstrucción post-DANA", "Pérdida de empleo en infraestructuras", "Retrasos en Corredor Mediterráneo"],
    cascadeEffects: [
      { order: 1, description: "Recorte fondos reconstrucción DANA", timeframe: "0-3 meses", probability: 90 },
      { order: 2, description: "Tensión social en municipios afectados", timeframe: "3-6 meses", probability: 80 },
    ],
    actors: [
      { name: "Generalitat Valenciana", type: "ccaa", stance: "perjudicado", influence: 80, reason: "Doble crisis: DANA + recorte NGEU" },
      { name: "CEOE-Valencia", type: "patronal", stance: "perjudicado", influence: 55, reason: "Sector constructor paralizado" },
    ],
  },
  {
    id: "ir-010", scenarioId: "sim-001", territory: "Galicia", territorySlug: "galicia", impactLevel: "alto", impactScore: -48,
    affectedPopulation: 2700000, budgetDelta: -950, riskLevel: "alto",
    opportunities: ["Reorientar inversión hacia sector pesquero y naval"],
    risks: ["Retraso en conectividad digital rural", "Impacto en programas contra despoblación"],
    cascadeEffects: [
      { order: 1, description: "Recalibrar Plan de digitalización rural", timeframe: "0-6 meses", probability: 85 },
      { order: 2, description: "Presión sobre PGE para compensación", timeframe: "6-12 meses", probability: 65 },
    ],
    actors: [
      { name: "Xunta de Galicia", type: "ccaa", stance: "perjudicado", influence: 75, reason: "Fondos comprometidos para despoblación" },
    ],
  },
  {
    id: "ir-011", scenarioId: "sim-003", territory: "Cataluña", territorySlug: "cataluna", impactLevel: "critico", impactScore: -50,
    affectedPopulation: 7800000, budgetDelta: -220, riskLevel: "alto",
    opportunities: ["Estabilización precios Barcelona", "Mayor acceso vivienda para jóvenes"],
    risks: ["Fuga de inversores hacia Madrid", "Reducción oferta en Barcelona", "Alquileres de temporada como vía de escape"],
    cascadeEffects: [
      { order: 1, description: "Reducción del 15% de nuevos contratos en Barcelona", timeframe: "0-6 meses", probability: 75 },
      { order: 2, description: "Aumento alquileres de temporada (fraude de ley)", timeframe: "6-12 meses", probability: 70 },
    ],
    actors: [
      { name: "Generalitat de Catalunya", type: "ccaa", stance: "beneficiado", influence: 75, reason: "Aplica regulación de precios" },
      { name: "Sindicat de Llogaters", type: "sindicato", stance: "beneficiado", influence: 40, reason: "Logro regulatorio" },
    ],
  },
  {
    id: "ir-012", scenarioId: "sim-002", territory: "Canarias", territorySlug: "canarias", impactLevel: "medio", impactScore: 25,
    affectedPopulation: 2200000, budgetDelta: -180, riskLevel: "bajo",
    opportunities: ["Impacto menor por IGIC (no IVA)", "Mayor consumo turístico"],
    risks: ["Competencia fiscal con Península", "Efecto limitado en precios reales"],
    cascadeEffects: [
      { order: 1, description: "Armonización parcial IGIC-IVA reducido", timeframe: "3-6 meses", probability: 55 },
    ],
    actors: [
      { name: "Gobierno de Canarias", type: "ccaa", stance: "neutro", influence: 65, reason: "Régimen fiscal propio (IGIC)" },
    ],
  },
  {
    id: "ir-013", scenarioId: "sim-005", territory: "Navarra", territorySlug: "navarra", impactLevel: "medio", impactScore: -30,
    affectedPopulation: 660000, budgetDelta: -400, riskLevel: "medio",
    opportunities: ["Coordinación sanitaria con País Vasco", "Eficiencia en compras conjuntas"],
    risks: ["Conflicto competencial por Convenio", "Pérdida de autonomía sanitaria"],
    cascadeEffects: [
      { order: 1, description: "Recurso foral ante posible invasión competencial", timeframe: "0-6 meses", probability: 70 },
    ],
    actors: [
      { name: "Gobierno de Navarra", type: "ccaa", stance: "perjudicado", influence: 70, reason: "Régimen foral amenazado" },
      { name: "Geroa Bai", type: "partido", stance: "perjudicado", influence: 45, reason: "Defensa del autogobierno" },
    ],
  },
  {
    id: "ir-014", scenarioId: "sim-006", territory: "Extremadura", territorySlug: "extremadura", impactLevel: "critico", impactScore: -65,
    affectedPopulation: 1060000, budgetDelta: -380, riskLevel: "muy-alto",
    opportunities: ["Hub fotovoltaico nacional", "Fondos transición justa para Almaraz"],
    risks: ["Cierre Almaraz: 1.200 empleos directos perdidos", "Déficit energético temporal"],
    cascadeEffects: [
      { order: 1, description: "Plan social para trabajadores de Almaraz", timeframe: "0-6 meses", probability: 90 },
      { order: 2, description: "Aceleración de proyectos fotovoltaicos", timeframe: "6-18 meses", probability: 80 },
    ],
    actors: [
      { name: "Junta de Extremadura", type: "ccaa", stance: "perjudicado", influence: 70, reason: "Almaraz es principal contribuyente fiscal" },
      { name: "CCOO Extremadura", type: "sindicato", stance: "perjudicado", influence: 50, reason: "Empleos nucleares en riesgo" },
    ],
  },
  {
    id: "ir-015", scenarioId: "sim-003", territory: "Illes Balears", territorySlug: "illes-balears", impactLevel: "alto", impactScore: -40,
    affectedPopulation: 1200000, budgetDelta: -80, riskLevel: "alto",
    opportunities: ["Vivienda más accesible para trabajadores turísticos", "Desestacionalización del alquiler"],
    risks: ["Colapso oferta ante presión turística", "Fuga hacia alquiler vacacional"],
    cascadeEffects: [
      { order: 1, description: "Retirada del 20% de oferta de alquiler residencial", timeframe: "0-6 meses", probability: 70 },
      { order: 2, description: "Crisis de mano de obra turística por falta de vivienda", timeframe: "6-12 meses", probability: 60 },
    ],
    actors: [
      { name: "Govern Balear", type: "ccaa", stance: "perjudicado", influence: 65, reason: "Mercado más tensionado de España" },
    ],
  },
  {
    id: "ir-016", scenarioId: "sim-001", territory: "Aragón", territorySlug: "aragon", impactLevel: "alto", impactScore: -42,
    affectedPopulation: 1330000, budgetDelta: -580, riskLevel: "alto",
    opportunities: ["Foco en proyectos logísticos con financiación propia"],
    risks: ["Retraso plataforma logística PLAZA", "Impacto en plan Teruel Existe"],
    cascadeEffects: [
      { order: 1, description: "Renegociación prioridades con Bruselas", timeframe: "0-6 meses", probability: 75 },
    ],
    actors: [
      { name: "Gobierno de Aragón", type: "ccaa", stance: "perjudicado", influence: 65, reason: "Fondos comprometidos para Teruel" },
    ],
  },
  {
    id: "ir-017", scenarioId: "sim-006", territory: "Castilla-La Mancha", territorySlug: "castilla-la-mancha", impactLevel: "medio", impactScore: 45,
    affectedPopulation: 2050000, budgetDelta: 1200, riskLevel: "bajo",
    opportunities: ["2ª región con más potencia fotovoltaica", "Empleo verde en zonas rurales", "Comunidades energéticas"],
    risks: ["Impacto paisajístico en La Mancha", "Resistencia de ayuntamientos"],
    cascadeEffects: [
      { order: 1, description: "Boom de parques solares en La Mancha", timeframe: "0-12 meses", probability: 85 },
      { order: 2, description: "Creación de 3.000 empleos en renovables", timeframe: "12-24 meses", probability: 70 },
    ],
    actors: [
      { name: "JCCM", type: "ccaa", stance: "beneficiado", influence: 70, reason: "Hub renovable con sol y territorio" },
    ],
  },
  {
    id: "ir-018", scenarioId: "sim-001", territory: "Murcia", territorySlug: "murcia", impactLevel: "alto", impactScore: -52,
    affectedPopulation: 1530000, budgetDelta: -620, riskLevel: "alto",
    opportunities: ["Reasignación hacia proyecto Mar Menor"],
    risks: ["Retraso en desaladoras comprometidas", "Impacto en agroindustria"],
    cascadeEffects: [
      { order: 1, description: "Paralización obras desaladoras NGEU", timeframe: "0-3 meses", probability: 85 },
      { order: 2, description: "Crisis hídrica agravada", timeframe: "6-12 meses", probability: 60 },
    ],
    actors: [
      { name: "CARM", type: "ccaa", stance: "perjudicado", influence: 65, reason: "Dependencia de fondos para agua" },
    ],
  },
  {
    id: "ir-019", scenarioId: "sim-001", territory: "Cantabria", territorySlug: "cantabria", impactLevel: "medio", impactScore: -35,
    affectedPopulation: 585000, budgetDelta: -280, riskLevel: "medio",
    opportunities: ["Menor dependencia relativa de NGEU"],
    risks: ["Retraso en proyectos de conectividad", "Impacto en turismo sostenible"],
    cascadeEffects: [
      { order: 1, description: "Reprogramación de inversiones turísticas", timeframe: "3-6 meses", probability: 65 },
    ],
    actors: [
      { name: "Gobierno de Cantabria", type: "ccaa", stance: "perjudicado", influence: 55, reason: "Fondos turismo comprometidos" },
    ],
  },
  {
    id: "ir-020", scenarioId: "sim-001", territory: "La Rioja", territorySlug: "la-rioja", impactLevel: "medio", impactScore: -30,
    affectedPopulation: 320000, budgetDelta: -120, riskLevel: "medio",
    opportunities: ["Sector vitivinícola poco dependiente de NGEU"],
    risks: ["Retraso digitalización bodegas", "Impacto en programa despoblación Sierra"],
    cascadeEffects: [
      { order: 1, description: "Ajuste del plan de digitalización agroalimentaria", timeframe: "3-6 meses", probability: 60 },
    ],
    actors: [
      { name: "Gobierno de La Rioja", type: "ccaa", stance: "perjudicado", influence: 50, reason: "CCAA pequeña con menos margen" },
    ],
  },
];

const regulatoryChains: RegulatoryChain[] = [
  {
    id: "rc-001", scenarioId: "sim-002",
    steps: [
      { order: 1, regulation: "Anteproyecto de Ley de reforma IVA", status: "borrador", dependency: "-", timeframe: "1-2 meses" },
      { order: 2, regulation: "Dictamen Consejo de Estado", status: "pendiente", dependency: "Anteproyecto aprobado", timeframe: "2-3 meses" },
      { order: 3, regulation: "Tramitación parlamentaria", status: "pendiente", dependency: "Dictamen favorable", timeframe: "4-8 meses" },
      { order: 4, regulation: "Publicación BOE", status: "pendiente", dependency: "Aprobación Congreso+Senado", timeframe: "8-10 meses" },
      { order: 5, regulation: "Entrada en vigor", status: "pendiente", dependency: "Publicación BOE", timeframe: "10-12 meses" },
    ],
  },
  {
    id: "rc-002", scenarioId: "sim-003",
    steps: [
      { order: 1, regulation: "Decreto zonas tensionadas actualizado", status: "en-tramite", dependency: "-", timeframe: "1 mes" },
      { order: 2, regulation: "Orden ministerial de índice de referencia", status: "borrador", dependency: "Decreto aprobado", timeframe: "2-3 meses" },
      { order: 3, regulation: "Adaptación CCAA al nuevo tope", status: "pendiente", dependency: "Orden publicada", timeframe: "3-6 meses" },
      { order: 4, regulation: "Régimen sancionador en vigor", status: "pendiente", dependency: "Adaptación CCAA", timeframe: "6-9 meses" },
    ],
  },
];

const riskMatrices: RiskOpportunityMatrix[] = [
  {
    scenarioId: "sim-001",
    items: [
      { label: "Paralización obras PRTR", type: "riesgo", probability: 85, impact: 90, sector: "construcción" },
      { label: "Brecha digital rural", type: "riesgo", probability: 70, impact: 75, sector: "tecnología" },
      { label: "Pérdida empleo temporal", type: "riesgo", probability: 65, impact: 80, sector: "empleo" },
      { label: "Reasignación estratégica", type: "oportunidad", probability: 50, impact: 60, sector: "planificación" },
      { label: "Mayor eficiencia absorción", type: "oportunidad", probability: 45, impact: 55, sector: "administración" },
      { label: "Tensión con Bruselas", type: "riesgo", probability: 60, impact: 70, sector: "diplomacia" },
      { label: "Aceleración colaboración público-privada", type: "oportunidad", probability: 40, impact: 65, sector: "inversión" },
    ],
  },
  {
    scenarioId: "sim-006",
    items: [
      { label: "Desempleo sector fósil", type: "riesgo", probability: 90, impact: 85, sector: "empleo" },
      { label: "Boom inversión renovable", type: "oportunidad", probability: 85, impact: 90, sector: "energía" },
      { label: "Crisis territorial minera", type: "riesgo", probability: 75, impact: 70, sector: "territorio" },
      { label: "Liderazgo UE en transición", type: "oportunidad", probability: 60, impact: 80, sector: "diplomacia" },
      { label: "Blackouts temporales", type: "riesgo", probability: 30, impact: 95, sector: "energía" },
      { label: "Exportación tecnología verde", type: "oportunidad", probability: 55, impact: 70, sector: "industria" },
    ],
  },
];

const historicalComparisons: HistoricalComparison[] = [
  { id: "hc-001", title: "Recortes austeridad 2012", year: 2012, description: "Recortes presupuestarios del gobierno Rajoy tras la crisis de deuda soberana.", outcome: "PIB cayó 2.9%, desempleo al 26%, rescate bancario de 41.000M€.", similarityScore: 72 },
  { id: "hc-002", title: "Reforma laboral 2012", year: 2012, description: "Flexibilización del despido y negociación colectiva.", outcome: "Devaluación salarial, aumento temporalidad, reducción costes laborales 15%.", similarityScore: 45 },
  { id: "hc-003", title: "Burbuja inmobiliaria 2008", year: 2008, description: "Colapso del sector constructor tras exceso de oferta.", outcome: "3M empleos destruidos en construcción, crisis bancaria, cajas intervenidas.", similarityScore: 38 },
  { id: "hc-004", title: "Entrada en el euro 1999", year: 1999, description: "Adopción de la moneda única y pérdida de política monetaria propia.", outcome: "Boom económico inicial, pérdida competitividad, divergencia con norte Europa.", similarityScore: 55 },
  { id: "hc-005", title: "Reconversión industrial 1984", year: 1984, description: "Reestructuración de la industria pesada española.", outcome: "300.000 empleos perdidos, huelga general, modernización a largo plazo.", similarityScore: 65 },
  { id: "hc-006", title: "Fondos de cohesión 1986-2006", year: 1986, description: "20 años de fondos europeos que transformaron infraestructuras españolas.", outcome: "Autovías, AVE, universidades. PIB per cápita del 70% al 90% media UE.", similarityScore: 80 },
];

// ── Builder ───────────────────────────────────────────────────────────────

export function buildSimuladorData(): SimuladorData {
  return {
    scenarios,
    predefined,
    impactResults,
    regulatoryChains,
    riskMatrices,
    historicalComparisons,
    stats: {
      totalScenarios: scenarios.length,
      predefinedCount: predefined.length,
      territoriesAnalyzed: [...new Set(impactResults.map((r) => r.territorySlug))].length,
      actorsTracked: impactResults.reduce((sum, r) => sum + r.actors.length, 0),
      avgImpactScore: Math.round(impactResults.reduce((sum, r) => sum + Math.abs(r.impactScore), 0) / impactResults.length),
      lastUpdated: "2026-04-11",
    },
  };
}
