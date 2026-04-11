/* ═══════════════════════════════════════════════════════════════════════════
   Public Signal Engine — Early warning detection for political,
   regulatory, budgetary, and crisis signals. Finds precursor signals
   before they become BOE publications, tenders, or policy changes.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Types ─────────────────────────────────────────────────────────────────

export type SignalStrength = "debil" | "media" | "fuerte";
export type SignalStatus = "activa" | "confirmada" | "descartada" | "materializada";
export type SectorId = "energia" | "tecnologia" | "sanidad" | "finanzas" | "defensa" | "educacion";
export type SourceCategory = "parlamentario" | "boe-previo" | "prensa" | "redes-sociales" | "eurostat" | "lobby" | "comparecencia" | "presupuesto";

export interface Signal {
  id: string;
  title: string;
  description: string;
  strength: SignalStrength;
  status: SignalStatus;
  confidence: number; // 0-100
  sector: SectorId;
  territory: string;
  detectedDate: string;
  timeHorizon: string; // "15-30 dias", "30-60 dias", etc.
  estimatedDate?: string;
  sources: SignalSource[];
  correlatedSignals: string[];
  tags: string[];
  methodology: string;
  historicalAccuracy?: number;
}

export interface SignalSource {
  type: SourceCategory;
  name: string;
  url?: string;
  date: string;
  reliability: number; // 0-100
}

export interface SectorProfile {
  id: SectorId;
  label: string;
  description: string;
  activeSignals: number;
  strongSignals: number;
  avgConfidence: number;
  topRisk: string;
  recentTrend: "creciente" | "estable" | "decreciente";
  signalVelocity: number; // signals per month
}

export interface AccuracyRecord {
  month: string;
  predicted: number;
  confirmed: number;
  accuracy: number;
}

export interface SignalCorrelation {
  signalA: string;
  signalB: string;
  correlationStrength: number; // 0-1
  explanation: string;
}

export interface AlertConfig {
  id: string;
  label: string;
  sectors: SectorId[];
  territories: string[];
  minStrength: SignalStrength;
  minConfidence: number;
  active: boolean;
}

export interface ConfidenceBreakdown {
  signalId: string;
  factors: { label: string; weight: number; score: number }[];
  totalScore: number;
  methodology: string;
}

export interface SignalEngineData {
  signals: Signal[];
  sectors: SectorProfile[];
  accuracyHistory: AccuracyRecord[];
  correlations: SignalCorrelation[];
  alertConfigs: AlertConfig[];
  confidenceBreakdowns: ConfidenceBreakdown[];
  stats: {
    totalSignals: number;
    activeSignals: number;
    strongSignals: number;
    avgConfidence: number;
    historicalAccuracy: number;
    sectorsMonitored: number;
  };
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const signals: Signal[] = [
  {
    id: "sig-001", title: "Reforma Ley de IA inminente", description: "Multiples senales indican que el Gobierno prepara un proyecto de ley de IA para antes del verano. Comparecencias ministeriales, filtración a prensa, y movimiento en la Comision de Transformacion Digital.",
    strength: "fuerte", status: "activa", confidence: 87, sector: "tecnologia", territory: "Nacional",
    detectedDate: "2026-04-03", timeHorizon: "30-60 dias", estimatedDate: "2026-06-01",
    sources: [
      { type: "comparecencia", name: "Comparecencia Ministra Transformacion Digital", date: "2026-04-01", reliability: 90 },
      { type: "prensa", name: "El Pais - Filtración borrador ley IA", date: "2026-04-02", reliability: 75 },
      { type: "parlamentario", name: "Pregunta parlamentaria Comision TD", date: "2026-03-28", reliability: 85 },
    ],
    correlatedSignals: ["sig-005"], tags: ["ia", "regulacion", "tecnologia"], methodology: "Triangulación fuentes parlamentarias + prensa + actividad ministerial",
    historicalAccuracy: 82,
  },
  {
    id: "sig-002", title: "Licitacion macro de ciberseguridad", description: "El CCN-CERT ha publicado una consulta previa de mercado para ciberseguridad cloud por 200M. Patron coincide con licitacion en 60-90 dias.",
    strength: "fuerte", status: "activa", confidence: 79, sector: "tecnologia", territory: "Nacional",
    detectedDate: "2026-03-28", timeHorizon: "60-90 dias", estimatedDate: "2026-06-15",
    sources: [
      { type: "boe-previo", name: "Consulta previa mercado CCN-CERT", date: "2026-03-25", reliability: 95 },
      { type: "presupuesto", name: "Partida 28.18 PGE 2026", date: "2026-01-15", reliability: 80 },
    ],
    correlatedSignals: ["sig-001"], tags: ["ciberseguridad", "licitacion", "ccn"], methodology: "Deteccion consulta previa + analisis partida presupuestaria", historicalAccuracy: 88,
  },
  {
    id: "sig-003", title: "Subida precio electricidad mayorista", description: "Indicadores de futuros energeticos y tension geopolitica apuntan a subida >15% en pool electrico para mayo-junio.",
    strength: "media", status: "activa", confidence: 65, sector: "energia", territory: "Nacional",
    detectedDate: "2026-04-05", timeHorizon: "15-30 dias",
    sources: [
      { type: "eurostat", name: "Futuros MIBEL Q2 2026", date: "2026-04-04", reliability: 85 },
      { type: "prensa", name: "Bloomberg - Gas natural sube 12%", date: "2026-04-03", reliability: 70 },
    ],
    correlatedSignals: ["sig-008"], tags: ["electricidad", "energia", "precios"], methodology: "Analisis futuros MIBEL + correlacion precios gas natural",
  },
  {
    id: "sig-004", title: "Cambio en financiacion autonomica", description: "Senal debil: reunion bilateral Gobierno-Generalitat y declaraciones de portavoces de PNV sobre revision del modelo de financiacion.",
    strength: "debil", status: "activa", confidence: 42, sector: "finanzas", territory: "Multi-CCAA",
    detectedDate: "2026-04-08", timeHorizon: "90-180 dias",
    sources: [
      { type: "prensa", name: "La Vanguardia - Reunion bilateral", date: "2026-04-07", reliability: 60 },
      { type: "parlamentario", name: "Declaraciones portavoz PNV Congreso", date: "2026-04-06", reliability: 55 },
      { type: "redes-sociales", name: "Trending #FinanciacionAutonomica", date: "2026-04-08", reliability: 35 },
    ],
    correlatedSignals: [], tags: ["financiacion", "ccaa", "territorial"], methodology: "Analisis de discurso parlamentario + seguimiento prensa territorial",
  },
  {
    id: "sig-005", title: "Fondo europeo de chips: convocatoria espanola", description: "La CE aprobara el paquete Chips Act 2.0 en mayo. Espana prepara convocatoria nacional con 500M del PERTE Chip.",
    strength: "fuerte", status: "activa", confidence: 83, sector: "tecnologia", territory: "Nacional",
    detectedDate: "2026-03-20", timeHorizon: "30-60 dias", estimatedDate: "2026-05-20",
    sources: [
      { type: "eurostat", name: "Comunicacion CE Chips Act 2.0", date: "2026-03-18", reliability: 90 },
      { type: "comparecencia", name: "Secretario Estado Digitalizacion", date: "2026-03-19", reliability: 85 },
      { type: "presupuesto", name: "PERTE Chip partida 2026", date: "2026-01-15", reliability: 80 },
    ],
    correlatedSignals: ["sig-001", "sig-002"], tags: ["chips", "semiconductores", "perte"], methodology: "Seguimiento legislativo UE + analisis PERTE", historicalAccuracy: 91,
  },
  {
    id: "sig-006", title: "Regulacion publicidad comida chatarra", description: "El Ministerio de Consumo reactiva el anteproyecto de regulacion publicitaria de alimentos no saludables dirigida a menores.",
    strength: "media", status: "activa", confidence: 58, sector: "sanidad", territory: "Nacional",
    detectedDate: "2026-04-01", timeHorizon: "60-120 dias",
    sources: [
      { type: "comparecencia", name: "Ministro de Consumo en Comision", date: "2026-03-30", reliability: 80 },
      { type: "lobby", name: "Movimiento FIAB contra regulacion", date: "2026-04-01", reliability: 65 },
    ],
    correlatedSignals: [], tags: ["consumo", "publicidad", "salud"], methodology: "Deteccion de actividad lobby + seguimiento comisiones parlamentarias",
  },
  {
    id: "sig-007", title: "Presupuesto defensa: partida extraordinaria", description: "Senal de incremento presupuestario extraordinario en defensa tras cumbre OTAN Vilnius. Patron de gasto acelerado.",
    strength: "media", status: "activa", confidence: 71, sector: "defensa", territory: "Nacional",
    detectedDate: "2026-04-02", timeHorizon: "30-60 dias",
    sources: [
      { type: "presupuesto", name: "Credito extraordinario BOE previsto", date: "2026-04-01", reliability: 75 },
      { type: "comparecencia", name: "Ministra Defensa Comision Defensa", date: "2026-03-29", reliability: 80 },
      { type: "prensa", name: "EFE - Espana acelera gasto OTAN", date: "2026-04-02", reliability: 70 },
    ],
    correlatedSignals: [], tags: ["defensa", "otan", "presupuesto"], methodology: "Analisis patron creditos extraordinarios + actividad parlamentaria",
  },
  {
    id: "sig-008", title: "Proroga tope gas: decision en mayo", description: "La excepcion iberica (tope al gas) expira en junio. Senales contradictorias sobre renovacion: Gobierno a favor, Bruselas en contra.",
    strength: "fuerte", status: "activa", confidence: 76, sector: "energia", territory: "Nacional",
    detectedDate: "2026-04-06", timeHorizon: "30-45 dias", estimatedDate: "2026-05-15",
    sources: [
      { type: "parlamentario", name: "Debate en Pleno sobre energia", date: "2026-04-04", reliability: 85 },
      { type: "eurostat", name: "Informe CE sobre excepcion iberica", date: "2026-04-01", reliability: 90 },
      { type: "prensa", name: "Cinco Dias - Tope gas en el aire", date: "2026-04-05", reliability: 65 },
    ],
    correlatedSignals: ["sig-003"], tags: ["gas", "excepcion-iberica", "energia"], methodology: "Seguimiento legislativo UE + analisis debate parlamentario", historicalAccuracy: 85,
  },
  {
    id: "sig-009", title: "Convocatoria MIR extraordinaria", description: "El Ministerio de Sanidad estudia una convocatoria MIR extraordinaria para cubrir deficit en atencion primaria rural.",
    strength: "debil", status: "activa", confidence: 38, sector: "sanidad", territory: "Multi-CCAA",
    detectedDate: "2026-04-09", timeHorizon: "90-180 dias",
    sources: [
      { type: "comparecencia", name: "Consejeros Sanidad CCAA", date: "2026-04-08", reliability: 55 },
      { type: "redes-sociales", name: "Hashtag #MIRRural trending", date: "2026-04-09", reliability: 30 },
    ],
    correlatedSignals: [], tags: ["sanidad", "mir", "atencion-primaria"], methodology: "Analisis de demanda CCAA + seguimiento redes sociales",
  },
  {
    id: "sig-010", title: "Reforma Ley de Universidades", description: "Senal media de reforma LOSU tras informe del Consejo de Estado con observaciones criticas sobre gobernanza universitaria.",
    strength: "media", status: "activa", confidence: 55, sector: "educacion", territory: "Nacional",
    detectedDate: "2026-04-04", timeHorizon: "60-120 dias",
    sources: [
      { type: "parlamentario", name: "Informe Consejo Estado LOSU", date: "2026-04-02", reliability: 85 },
      { type: "prensa", name: "El Mundo - Universidades piden cambios", date: "2026-04-03", reliability: 60 },
    ],
    correlatedSignals: [], tags: ["universidades", "educacion", "losu"], methodology: "Deteccion informe oficial + analisis reaccion sectorial",
  },
  {
    id: "sig-011", title: "Impuesto sobre grandes fortunas: permanente", description: "Senal fuerte de que el impuesto temporal a grandes fortunas se convertira en permanente. Anuncio previsto para PGE 2027.",
    strength: "fuerte", status: "activa", confidence: 81, sector: "finanzas", territory: "Nacional",
    detectedDate: "2026-04-07", timeHorizon: "60-90 dias", estimatedDate: "2026-07-01",
    sources: [
      { type: "comparecencia", name: "Ministra Hacienda en Congreso", date: "2026-04-05", reliability: 90 },
      { type: "parlamentario", name: "Enmienda Sumar PGE", date: "2026-04-06", reliability: 80 },
      { type: "prensa", name: "Expansion - Grandes fortunas permanente", date: "2026-04-07", reliability: 70 },
    ],
    correlatedSignals: [], tags: ["impuestos", "fortunas", "fiscal"], methodology: "Triangulacion parlamentaria + declaraciones ministeriales", historicalAccuracy: 78,
  },
  {
    id: "sig-012", title: "Nueva base militar OTAN en Rota", description: "Negociaciones avanzadas para ampliar la base de Rota con un nuevo muelle para submarinos nucleares aliados.",
    strength: "debil", status: "activa", confidence: 45, sector: "defensa", territory: "Andalucia",
    detectedDate: "2026-04-10", timeHorizon: "120-180 dias",
    sources: [
      { type: "prensa", name: "ABC - Ampliacion base Rota", date: "2026-04-09", reliability: 55 },
      { type: "lobby", name: "Reunion SHAPE con Defensa Espana", date: "2026-04-08", reliability: 50 },
    ],
    correlatedSignals: ["sig-007"], tags: ["rota", "otan", "defensa"], methodology: "Seguimiento prensa especializada + deteccion reuniones diplomaticas",
  },
  {
    id: "sig-013", title: "Tasa Google: revision al alza", description: "El Ministerio de Hacienda estudia duplicar la tasa Google (del 3% al 6%) aprovechando la directiva Pillar Two de la OCDE.",
    strength: "media", status: "activa", confidence: 52, sector: "tecnologia", territory: "Nacional",
    detectedDate: "2026-04-06", timeHorizon: "90-120 dias",
    sources: [
      { type: "parlamentario", name: "Pregunta escrita Grupo Mixto", date: "2026-04-04", reliability: 70 },
      { type: "eurostat", name: "Directiva Pillar Two OCDE/UE", date: "2026-03-15", reliability: 85 },
    ],
    correlatedSignals: ["sig-011"], tags: ["tasa-google", "fiscal", "digital"], methodology: "Analisis cruzado OCDE + actividad parlamentaria",
  },
  {
    id: "sig-014", title: "Plan Nacional Hidrogeno Verde acelerado", description: "Senal de aceleracion del Plan H2 tras reunion de la ministra con CEO de Repsol, Iberdrola y Cepsa.",
    strength: "media", status: "activa", confidence: 62, sector: "energia", territory: "Nacional",
    detectedDate: "2026-04-05", timeHorizon: "30-60 dias",
    sources: [
      { type: "comparecencia", name: "Reunion ministra con CEOs energia", date: "2026-04-03", reliability: 75 },
      { type: "presupuesto", name: "Partida H2 PERTE Renovable 2026", date: "2026-01-15", reliability: 80 },
    ],
    correlatedSignals: ["sig-003", "sig-008"], tags: ["hidrogeno", "renovable", "perte"], methodology: "Deteccion reunion ministerial + analisis PERTE", historicalAccuracy: 74,
  },
  {
    id: "sig-015", title: "Ley de Familias: ampliacion permisos", description: "Senal de ampliacion de permisos parentales en la futura Ley de Familias. Sumar condiciona su apoyo presupuestario.",
    strength: "debil", status: "activa", confidence: 40, sector: "sanidad", territory: "Nacional",
    detectedDate: "2026-04-09", timeHorizon: "90-180 dias",
    sources: [
      { type: "parlamentario", name: "Proposicion no de ley Sumar", date: "2026-04-08", reliability: 65 },
      { type: "redes-sociales", name: "Campana #PermisosYa", date: "2026-04-09", reliability: 30 },
      { type: "prensa", name: "20 Minutos - Sumar exige permisos", date: "2026-04-08", reliability: 55 },
    ],
    correlatedSignals: [], tags: ["familias", "permisos", "conciliacion"], methodology: "Seguimiento proposiciones no de ley + analisis coalicion",
  },
];

const sectors: SectorProfile[] = [
  { id: "energia", label: "Energia", description: "Mercado electrico, renovables, transicion energetica, hidrocarburos", activeSignals: 4, strongSignals: 1, avgConfidence: 68, topRisk: "Subida precios pool electrico", recentTrend: "creciente", signalVelocity: 6.2 },
  { id: "tecnologia", label: "Tecnologia", description: "IA, ciberseguridad, semiconductores, plataformas digitales", activeSignals: 4, strongSignals: 3, avgConfidence: 75, topRisk: "Regulacion IA restrictiva", recentTrend: "creciente", signalVelocity: 8.1 },
  { id: "sanidad", label: "Sanidad", description: "Farmaceutica, atencion primaria, salud publica, regulacion alimentaria", activeSignals: 3, strongSignals: 0, avgConfidence: 45, topRisk: "Deficit atencion primaria rural", recentTrend: "estable", signalVelocity: 3.4 },
  { id: "finanzas", label: "Finanzas", description: "Fiscalidad, banca, seguros, financiacion autonomica", activeSignals: 2, strongSignals: 1, avgConfidence: 62, topRisk: "Impuesto fortunas permanente", recentTrend: "creciente", signalVelocity: 4.5 },
  { id: "defensa", label: "Defensa", description: "Gasto militar, OTAN, industria armamentistica, bases", activeSignals: 2, strongSignals: 0, avgConfidence: 58, topRisk: "Incremento presupuestario no planificado", recentTrend: "creciente", signalVelocity: 3.0 },
  { id: "educacion", label: "Educacion", description: "Universidades, FP, becas, investigacion", activeSignals: 1, strongSignals: 0, avgConfidence: 55, topRisk: "Reforma gobernanza universitaria", recentTrend: "estable", signalVelocity: 1.8 },
];

const accuracyHistory: AccuracyRecord[] = [
  { month: "2025-10", predicted: 12, confirmed: 9, accuracy: 75 },
  { month: "2025-11", predicted: 15, confirmed: 12, accuracy: 80 },
  { month: "2025-12", predicted: 10, confirmed: 8, accuracy: 80 },
  { month: "2026-01", predicted: 18, confirmed: 15, accuracy: 83 },
  { month: "2026-02", predicted: 14, confirmed: 12, accuracy: 86 },
  { month: "2026-03", predicted: 20, confirmed: 17, accuracy: 85 },
];

const correlations: SignalCorrelation[] = [
  { signalA: "sig-001", signalB: "sig-005", correlationStrength: 0.82, explanation: "Ambas senales estan vinculadas al impulso digital del Gobierno: la ley de IA y el Chips Act comparten contexto regulatorio y presupuestario." },
  { signalA: "sig-003", signalB: "sig-008", correlationStrength: 0.76, explanation: "La subida del precio electrico esta directamente correlacionada con la decision sobre la excepcion iberica al tope del gas." },
  { signalA: "sig-001", signalB: "sig-002", correlationStrength: 0.65, explanation: "La regulacion de IA y la licitacion de ciberseguridad comparten el marco del PERTE de digitalizacion." },
  { signalA: "sig-007", signalB: "sig-012", correlationStrength: 0.71, explanation: "El incremento presupuestario en defensa y la ampliacion de Rota son consecuencia directa de los compromisos OTAN." },
  { signalA: "sig-011", signalB: "sig-013", correlationStrength: 0.58, explanation: "Ambas senales fiscales comparten el objetivo de incrementar recaudacion sobre grandes empresas y fortunas." },
  { signalA: "sig-003", signalB: "sig-014", correlationStrength: 0.54, explanation: "La subida de precios energeticos acelera las inversiones en hidrogeno verde como alternativa." },
];

const alertConfigs: AlertConfig[] = [
  { id: "ac-001", label: "Tecnologia critica", sectors: ["tecnologia"], territories: ["Nacional"], minStrength: "media", minConfidence: 60, active: true },
  { id: "ac-002", label: "Energia y precios", sectors: ["energia"], territories: ["Nacional"], minStrength: "debil", minConfidence: 40, active: true },
  { id: "ac-003", label: "Fiscalidad", sectors: ["finanzas"], territories: ["Nacional", "Multi-CCAA"], minStrength: "media", minConfidence: 50, active: true },
  { id: "ac-004", label: "Defensa y OTAN", sectors: ["defensa"], territories: ["Nacional", "Andalucia"], minStrength: "debil", minConfidence: 30, active: false },
];

const confidenceBreakdowns: ConfidenceBreakdown[] = [
  {
    signalId: "sig-001", totalScore: 87,
    methodology: "Modelo bayesiano con 4 factores: fiabilidad de fuentes, convergencia de senales, patron historico, y proximidad temporal.",
    factors: [
      { label: "Fiabilidad fuentes", weight: 30, score: 85 },
      { label: "Convergencia senales", weight: 25, score: 92 },
      { label: "Patron historico", weight: 25, score: 82 },
      { label: "Proximidad temporal", weight: 20, score: 88 },
    ],
  },
  {
    signalId: "sig-004", totalScore: 42,
    methodology: "Modelo bayesiano con 4 factores: fiabilidad de fuentes, convergencia de senales, patron historico, y proximidad temporal.",
    factors: [
      { label: "Fiabilidad fuentes", weight: 30, score: 50 },
      { label: "Convergencia senales", weight: 25, score: 35 },
      { label: "Patron historico", weight: 25, score: 40 },
      { label: "Proximidad temporal", weight: 20, score: 42 },
    ],
  },
  {
    signalId: "sig-008", totalScore: 76,
    methodology: "Modelo bayesiano con 4 factores: fiabilidad de fuentes, convergencia de senales, patron historico, y proximidad temporal.",
    factors: [
      { label: "Fiabilidad fuentes", weight: 30, score: 80 },
      { label: "Convergencia senales", weight: 25, score: 78 },
      { label: "Patron historico", weight: 25, score: 85 },
      { label: "Proximidad temporal", weight: 20, score: 55 },
    ],
  },
];

// ── Builder ───────────────────────────────────────────────────────────────

export function buildSignalEngineData(): SignalEngineData {
  const activeSignals = signals.filter((s) => s.status === "activa");
  const strongSignals = activeSignals.filter((s) => s.strength === "fuerte");
  const avgConf = activeSignals.length > 0 ? Math.round(activeSignals.reduce((sum, s) => sum + s.confidence, 0) / activeSignals.length) : 0;
  const accAvg = accuracyHistory.length > 0 ? Math.round(accuracyHistory.reduce((sum, a) => sum + a.accuracy, 0) / accuracyHistory.length) : 0;

  return {
    signals,
    sectors,
    accuracyHistory,
    correlations,
    alertConfigs,
    confidenceBreakdowns,
    stats: {
      totalSignals: signals.length,
      activeSignals: activeSignals.length,
      strongSignals: strongSignals.length,
      avgConfidence: avgConf,
      historicalAccuracy: accAvg,
      sectorsMonitored: sectors.length,
    },
  };
}
