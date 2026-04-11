/* ═══════════════════════════════════════════════════════════════════════════
   Political Twin — Gemelos digitales de instituciones, CCAA, partidos y
   cargos públicos. Modela comportamiento institucional y genera patrones
   de decisión, tensiones, alianzas, contradicciones y predicciones.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Interfaces ─────────────────────────────────────────────────────────────

export type EntityType = "ccaa" | "ministerio" | "partido" | "cargo";

export interface NarrativeTopic {
  topic: string;
  mentions: number;
  trend: "creciente" | "estable" | "decreciente";
  sentiment: number; // -100 to 100
  sparkline: number[];
}

export interface DecisionPattern {
  id: string;
  entityId: string;
  description: string;
  category: "legislativo" | "presupuestario" | "comunicación" | "alianza" | "veto";
  frequency: "semanal" | "mensual" | "trimestral" | "anual";
  confidence: number; // 0-100
  examples: string[];
  lastOccurrence: string;
  timingPattern?: string;
}

export interface AllianceFriction {
  id: string;
  entityA: string;
  entityB: string;
  type: "alianza" | "fricción";
  strength: number; // 0-100
  topics: string[];
  recentEvents: string[];
  trend: "fortaleciendo" | "estable" | "debilitando";
}

export interface Contradiction {
  id: string;
  entityId: string;
  title: string;
  said: string;
  did: string;
  date: string;
  severity: "alta" | "media" | "baja";
  source: string;
}

export interface Prediction {
  id: string;
  entityId: string;
  description: string;
  probability: number; // 0-100
  timeframe: string;
  basis: string[];
  impact: "alto" | "medio" | "bajo";
  category: "legislativo" | "electoral" | "presupuestario" | "diplomático" | "social";
}

export interface InstitutionalMemoryEvent {
  date: string;
  title: string;
  description: string;
  impact: "alto" | "medio" | "bajo";
}

export interface BehavioralAlert {
  id: string;
  entityId: string;
  type: "cambio-narrativa" | "nueva-alianza" | "ruptura" | "contradicción" | "anomalía";
  title: string;
  description: string;
  date: string;
  severity: "critico" | "alto" | "medio" | "bajo";
}

export interface EntityTwin {
  id: string;
  name: string;
  type: EntityType;
  slug: string;
  description: string;
  /* Behavioral profile */
  priorities: string[];
  legislativeRhythm: string;
  narrativeLines: string[];
  ideologicalPosition: number; // -100 (izq) to 100 (der)
  cohesionIndex: number; // 0-100
  activityScore: number; // 0-100
  transparencyScore: number; // 0-100
  /* Narrative analysis */
  narrativeTopics: NarrativeTopic[];
  /* Institutional memory */
  keyEvents: InstitutionalMemoryEvent[];
  /* Stats */
  totalDecisions: number;
  contradictionCount: number;
  predictionAccuracy: number; // 0-100 historical accuracy
}

export interface PoliticalTwinData {
  entities: EntityTwin[];
  decisionPatterns: DecisionPattern[];
  alliances: AllianceFriction[];
  contradictions: Contradiction[];
  predictions: Prediction[];
  alerts: BehavioralAlert[];
  stats: {
    totalEntities: number;
    activePatterns: number;
    allianceCount: number;
    frictionCount: number;
    contradictionCount: number;
    pendingPredictions: number;
    avgPredictionAccuracy: number;
    activeAlerts: number;
  };
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const entities: EntityTwin[] = [
  {
    id: "cat",
    name: "Generalitat de Catalunya",
    type: "ccaa",
    slug: "cataluna",
    description: "Gobierno autonómico de Cataluña. Foco en competencias transferidas, financiación y agenda identitaria.",
    priorities: ["Financiación autonómica", "Política lingüística", "Infraestructuras", "Innovación tecnológica"],
    legislativeRhythm: "Alta actividad normativa, ciclos vinculados al calendario político estatal",
    narrativeLines: ["Déficit fiscal", "Singularidad institucional", "Corredor mediterráneo"],
    ideologicalPosition: -15,
    cohesionIndex: 62,
    activityScore: 88,
    transparencyScore: 74,
    narrativeTopics: [
      { topic: "Financiación", mentions: 342, trend: "creciente", sentiment: -35, sparkline: [40, 45, 50, 55, 65, 70, 80] },
      { topic: "Lengua catalana", mentions: 198, trend: "estable", sentiment: 20, sparkline: [30, 28, 32, 30, 29, 31, 30] },
      { topic: "Infraestructuras", mentions: 156, trend: "creciente", sentiment: -20, sparkline: [20, 22, 25, 30, 35, 38, 42] },
    ],
    keyEvents: [
      { date: "2017-10-01", title: "Referéndum 1-O", description: "Referéndum de autodeterminación no reconocido por el Estado", impact: "alto" },
      { date: "2024-05-15", title: "Nuevo Estatut debate", description: "Propuesta de reforma del Estatut de Autonomía", impact: "medio" },
    ],
    totalDecisions: 1247,
    contradictionCount: 18,
    predictionAccuracy: 72,
  },
  {
    id: "and",
    name: "Junta de Andalucía",
    type: "ccaa",
    slug: "andalucia",
    description: "Gobierno autonómico de Andalucía. Agenda centrada en convergencia económica, empleo y fondos europeos.",
    priorities: ["Empleo juvenil", "Fondos europeos", "Turismo sostenible", "Agricultura"],
    legislativeRhythm: "Actividad moderada con picos presupuestarios",
    narrativeLines: ["Convergencia económica", "Modernización agraria", "Turismo de calidad"],
    ideologicalPosition: 25,
    cohesionIndex: 78,
    activityScore: 71,
    transparencyScore: 65,
    narrativeTopics: [
      { topic: "Empleo", mentions: 289, trend: "creciente", sentiment: -15, sparkline: [35, 38, 42, 45, 50, 55, 60] },
      { topic: "Fondos UE", mentions: 210, trend: "estable", sentiment: 30, sparkline: [40, 42, 40, 38, 41, 39, 42] },
      { topic: "Turismo", mentions: 178, trend: "creciente", sentiment: 25, sparkline: [25, 28, 30, 35, 38, 40, 45] },
    ],
    keyEvents: [
      { date: "2018-12-02", title: "Cambio de gobierno", description: "Primera alternancia tras 36 años de gobierno socialista", impact: "alto" },
      { date: "2025-03-10", title: "Plan de empleo verde", description: "Aprobación del plan de transición verde con fondos NextGen", impact: "medio" },
    ],
    totalDecisions: 983,
    contradictionCount: 12,
    predictionAccuracy: 68,
  },
  {
    id: "mad",
    name: "Comunidad de Madrid",
    type: "ccaa",
    slug: "madrid",
    description: "Gobierno autonómico de Madrid. Modelo de baja fiscalidad y atracción de inversión.",
    priorities: ["Competitividad fiscal", "Atracción de inversión", "Sanidad", "Transporte"],
    legislativeRhythm: "Actividad legislativa selectiva, foco en decretos y órdenes",
    narrativeLines: ["Libertad económica", "Capital de inversión", "Modelo fiscal propio"],
    ideologicalPosition: 40,
    cohesionIndex: 85,
    activityScore: 76,
    transparencyScore: 58,
    narrativeTopics: [
      { topic: "Fiscalidad", mentions: 312, trend: "estable", sentiment: 35, sparkline: [50, 48, 52, 50, 49, 51, 50] },
      { topic: "Inversión extranjera", mentions: 187, trend: "creciente", sentiment: 40, sparkline: [30, 35, 38, 42, 45, 48, 52] },
      { topic: "Sanidad", mentions: 234, trend: "creciente", sentiment: -25, sparkline: [35, 40, 45, 50, 55, 58, 62] },
    ],
    keyEvents: [
      { date: "2021-05-04", title: "Elecciones anticipadas", description: "Mayoría absoluta tras moción de censura fallida", impact: "alto" },
      { date: "2025-09-20", title: "Hub tecnológico europeo", description: "Madrid seleccionada como sede del hub de IA europeo", impact: "medio" },
    ],
    totalDecisions: 1089,
    contradictionCount: 22,
    predictionAccuracy: 65,
  },
  {
    id: "pv",
    name: "Gobierno Vasco",
    type: "ccaa",
    slug: "pais-vasco",
    description: "Gobierno autonómico del País Vasco. Régimen foral propio y modelo industrial avanzado.",
    priorities: ["Concierto económico", "Industria 4.0", "Euskera", "Innovación"],
    legislativeRhythm: "Actividad constante y predecible, alta estabilidad institucional",
    narrativeLines: ["Autogobierno", "Excelencia industrial", "Modelo vasco"],
    ideologicalPosition: -10,
    cohesionIndex: 90,
    activityScore: 82,
    transparencyScore: 80,
    narrativeTopics: [
      { topic: "Concierto económico", mentions: 156, trend: "estable", sentiment: 40, sparkline: [25, 24, 26, 25, 24, 25, 26] },
      { topic: "Industria", mentions: 245, trend: "creciente", sentiment: 35, sparkline: [35, 38, 40, 42, 45, 48, 50] },
      { topic: "Euskera", mentions: 134, trend: "estable", sentiment: 15, sparkline: [20, 21, 20, 22, 21, 20, 21] },
    ],
    keyEvents: [
      { date: "2023-11-12", title: "Renovación del Concierto", description: "Acuerdo quinquenal de actualización del Concierto Económico", impact: "alto" },
    ],
    totalDecisions: 876,
    contradictionCount: 6,
    predictionAccuracy: 81,
  },
  {
    id: "min-eco",
    name: "Ministerio de Economía",
    type: "ministerio",
    slug: "ministerio-economia",
    description: "Responsable de política económica, regulación financiera y planificación presupuestaria estatal.",
    priorities: ["Estabilidad presupuestaria", "Reforma fiscal", "Digitalización económica", "Fondos NextGen"],
    legislativeRhythm: "Picos en ciclo presupuestario (sep-dic), actividad regulatoria constante",
    narrativeLines: ["Recuperación económica", "Disciplina fiscal", "Transición digital"],
    ideologicalPosition: -5,
    cohesionIndex: 75,
    activityScore: 92,
    transparencyScore: 70,
    narrativeTopics: [
      { topic: "PGE", mentions: 456, trend: "creciente", sentiment: -10, sparkline: [50, 55, 58, 62, 68, 72, 78] },
      { topic: "NextGen", mentions: 334, trend: "estable", sentiment: 20, sparkline: [55, 54, 56, 55, 53, 55, 54] },
      { topic: "Inflación", mentions: 278, trend: "decreciente", sentiment: -30, sparkline: [60, 55, 50, 45, 40, 35, 30] },
    ],
    keyEvents: [
      { date: "2023-01-15", title: "Plan de estabilidad", description: "Envío del plan de estabilidad a Bruselas con senda de déficit", impact: "alto" },
      { date: "2025-06-01", title: "Reforma fiscal verde", description: "Propuesta de fiscalidad medioambiental integral", impact: "medio" },
    ],
    totalDecisions: 1534,
    contradictionCount: 15,
    predictionAccuracy: 70,
  },
  {
    id: "min-trans",
    name: "Ministerio de Transportes",
    type: "ministerio",
    slug: "ministerio-transportes",
    description: "Gestión de infraestructuras, movilidad y agenda urbana.",
    priorities: ["Corredor mediterráneo", "Movilidad sostenible", "Vivienda", "Digitalización del transporte"],
    legislativeRhythm: "Actividad vinculada a licitaciones y fondos europeos",
    narrativeLines: ["Infraestructura verde", "España conectada", "Derecho a la vivienda"],
    ideologicalPosition: -10,
    cohesionIndex: 68,
    activityScore: 74,
    transparencyScore: 62,
    narrativeTopics: [
      { topic: "Corredor mediterráneo", mentions: 198, trend: "creciente", sentiment: -15, sparkline: [25, 28, 32, 35, 40, 45, 50] },
      { topic: "Vivienda", mentions: 345, trend: "creciente", sentiment: -40, sparkline: [40, 48, 55, 62, 68, 75, 82] },
      { topic: "AVE", mentions: 167, trend: "estable", sentiment: 10, sparkline: [28, 27, 29, 28, 30, 28, 29] },
    ],
    keyEvents: [
      { date: "2024-02-20", title: "Ley de Vivienda", description: "Entrada en vigor de la nueva regulación de alquileres", impact: "alto" },
    ],
    totalDecisions: 987,
    contradictionCount: 19,
    predictionAccuracy: 63,
  },
  {
    id: "psoe",
    name: "PSOE",
    type: "partido",
    slug: "psoe",
    description: "Partido Socialista Obrero Español. Partido de gobierno, agenda socialdemócrata con coalición.",
    priorities: ["Escudo social", "Transición ecológica", "Igualdad", "Europeísmo"],
    legislativeRhythm: "Altísima actividad parlamentaria, dependencia de pactos",
    narrativeLines: ["España avanza", "Justicia social", "Alianza progresista"],
    ideologicalPosition: -30,
    cohesionIndex: 70,
    activityScore: 95,
    transparencyScore: 55,
    narrativeTopics: [
      { topic: "Escudo social", mentions: 387, trend: "estable", sentiment: 15, sparkline: [60, 58, 62, 60, 59, 61, 60] },
      { topic: "Coalición", mentions: 456, trend: "creciente", sentiment: -20, sparkline: [45, 50, 55, 60, 65, 68, 72] },
      { topic: "Europa", mentions: 234, trend: "estable", sentiment: 25, sparkline: [35, 36, 35, 34, 36, 35, 36] },
    ],
    keyEvents: [
      { date: "2023-11-16", title: "Investidura", description: "Investidura con apoyo de partidos nacionalistas y ley de amnistía", impact: "alto" },
      { date: "2025-01-20", title: "Congreso federal", description: "40º Congreso con renovación de liderazgo territorial", impact: "medio" },
    ],
    totalDecisions: 2134,
    contradictionCount: 34,
    predictionAccuracy: 66,
  },
  {
    id: "pp",
    name: "PP",
    type: "partido",
    slug: "pp",
    description: "Partido Popular. Principal partido de oposición, agenda liberal-conservadora.",
    priorities: ["Bajada de impuestos", "Seguridad", "Unidad territorial", "Emprendimiento"],
    legislativeRhythm: "Actividad de oposición intensa, foco en control al gobierno",
    narrativeLines: ["Alternativa de gobierno", "España unida", "Economía de libertad"],
    ideologicalPosition: 35,
    cohesionIndex: 80,
    activityScore: 88,
    transparencyScore: 52,
    narrativeTopics: [
      { topic: "Fiscalidad", mentions: 345, trend: "creciente", sentiment: -25, sparkline: [40, 45, 48, 52, 55, 58, 62] },
      { topic: "Inmigración", mentions: 267, trend: "creciente", sentiment: -35, sparkline: [30, 35, 40, 48, 55, 60, 65] },
      { topic: "Amnistía", mentions: 389, trend: "decreciente", sentiment: -60, sparkline: [80, 75, 65, 55, 48, 40, 35] },
    ],
    keyEvents: [
      { date: "2022-04-02", title: "Congreso de Sevilla", description: "Elección de nuevo líder y refundación estratégica", impact: "alto" },
      { date: "2025-05-28", title: "Elecciones municipales", description: "Victoria amplia en capitales de provincia", impact: "alto" },
    ],
    totalDecisions: 1876,
    contradictionCount: 28,
    predictionAccuracy: 64,
  },
];

const decisionPatterns: DecisionPattern[] = [
  { id: "dp-1", entityId: "cat", description: "Recursos de inconstitucionalidad contra leyes estatales en materia competencial", category: "legislativo", frequency: "trimestral", confidence: 85, examples: ["Recurso Ley de Educación", "Recurso Ley de Vivienda"], lastOccurrence: "2025-11-10", timingPattern: "30-60 días tras publicación en BOE" },
  { id: "dp-2", entityId: "cat", description: "Comunicados institucionales en fechas simbólicas (11-S, 1-O)", category: "comunicación", frequency: "anual", confidence: 95, examples: ["Discurso Diada 2024", "Acto 1-O 2024"], lastOccurrence: "2025-09-11", timingPattern: "Septiembre-Octubre" },
  { id: "dp-3", entityId: "and", description: "Paquetes de simplificación administrativa antes de periodos electorales", category: "legislativo", frequency: "anual", confidence: 72, examples: ["Decreto simplificación 2024", "Ley de agilización inversiones"], lastOccurrence: "2025-06-15" },
  { id: "dp-4", entityId: "mad", description: "Bajadas fiscales selectivas en IRPF autonómico coincidiendo con PGE estatales", category: "presupuestario", frequency: "anual", confidence: 88, examples: ["Deflactación IRPF 2024", "Bonificación sucesiones 2025"], lastOccurrence: "2025-10-01", timingPattern: "Octubre-Noviembre" },
  { id: "dp-5", entityId: "mad", description: "Oposición sistemática a regulación estatal de vivienda", category: "veto", frequency: "trimestral", confidence: 90, examples: ["Recurso Ley de Vivienda", "No aplicación zonas tensionadas"], lastOccurrence: "2025-12-05" },
  { id: "dp-6", entityId: "pv", description: "Renovación consensuada del Concierto Económico con mínima polémica", category: "presupuestario", frequency: "anual", confidence: 82, examples: ["Acuerdo cupo 2024", "Revisión metodológica 2025"], lastOccurrence: "2025-07-20" },
  { id: "dp-7", entityId: "min-eco", description: "Revisión al alza de previsiones de crecimiento en vísperas de debates presupuestarios", category: "comunicación", frequency: "trimestral", confidence: 78, examples: ["Revisión PIB Q3 2024", "Actualización cuadro macro 2025"], lastOccurrence: "2025-09-15", timingPattern: "Septiembre y Abril" },
  { id: "dp-8", entityId: "min-eco", description: "Envío de planes a Bruselas justo antes de fechas límite", category: "legislativo", frequency: "anual", confidence: 85, examples: ["Plan estabilidad 2024", "Plan fiscal-estructural 2025"], lastOccurrence: "2025-04-28", timingPattern: "Última semana antes del deadline" },
  { id: "dp-9", entityId: "min-trans", description: "Anuncios de infraestructuras en territorios con tensión electoral", category: "comunicación", frequency: "mensual", confidence: 70, examples: ["AVE Extremadura anuncio 2024", "Cercanías Valencia 2025"], lastOccurrence: "2025-11-20" },
  { id: "dp-10", entityId: "psoe", description: "Activación del 'escudo social' ante subidas de precios o crisis", category: "legislativo", frequency: "trimestral", confidence: 88, examples: ["Tope gas 2022", "Cheque alimentario 2024", "Bono transporte 2025"], lastOccurrence: "2025-10-30" },
  { id: "dp-11", entityId: "psoe", description: "Acuerdos de última hora con socios parlamentarios mediante concesiones sectoriales", category: "alianza", frequency: "mensual", confidence: 82, examples: ["Pacto PNV presupuestos", "Acuerdo ERC transferencias"], lastOccurrence: "2025-12-18" },
  { id: "dp-12", entityId: "pp", description: "Interposición de recursos ante el TC contra legislación del gobierno", category: "legislativo", frequency: "mensual", confidence: 90, examples: ["Recurso amnistía", "Recurso Ley de Vivienda", "Recurso reforma laboral"], lastOccurrence: "2025-11-25" },
  { id: "dp-13", entityId: "pp", description: "Coordinación de gobiernos autonómicos del PP para acciones conjuntas", category: "alianza", frequency: "trimestral", confidence: 85, examples: ["Frente fiscal CCAA PP", "Posición común agua", "Bloque anti-financiación singular"], lastOccurrence: "2025-10-15" },
  { id: "dp-14", entityId: "and", description: "Aprobación de planes de empleo juvenil en ciclos de 6 meses", category: "legislativo", frequency: "trimestral", confidence: 75, examples: ["Plan primer empleo 2024", "Beca-salario 2025"], lastOccurrence: "2025-09-01", timingPattern: "Marzo y Septiembre" },
  { id: "dp-15", entityId: "pv", description: "Posicionamiento diferenciado en política industrial europea", category: "comunicación", frequency: "trimestral", confidence: 80, examples: ["Agenda Industria País Vasco 2030", "Cumbre industrial Bilbao"], lastOccurrence: "2025-11-05" },
];

const alliances: AllianceFriction[] = [
  { id: "af-1", entityA: "psoe", entityB: "cat", type: "alianza", strength: 65, topics: ["Financiación", "Amnistía", "Transferencias"], recentEvents: ["Acuerdo financiación singular", "Apoyo investidura"], trend: "debilitando" },
  { id: "af-2", entityA: "psoe", entityB: "pv", type: "alianza", strength: 78, topics: ["Presupuestos", "Concierto", "Industria"], recentEvents: ["Pacto PGE 2025", "Acuerdo transferencias"], trend: "estable" },
  { id: "af-3", entityA: "pp", entityB: "mad", type: "alianza", strength: 92, topics: ["Fiscalidad", "Modelo territorial", "Sanidad"], recentEvents: ["Frente fiscal conjunto", "Defensa modelo Madrid"], trend: "fortaleciendo" },
  { id: "af-4", entityA: "pp", entityB: "and", type: "alianza", strength: 85, topics: ["Agua", "Financiación", "Empleo"], recentEvents: ["Posición común trasvases", "Coordinación CCAA"], trend: "estable" },
  { id: "af-5", entityA: "cat", entityB: "mad", type: "fricción", strength: 75, topics: ["Financiación", "Modelo territorial", "Capitalidad"], recentEvents: ["Debate financiación singular", "Competencia por inversiones"], trend: "estable" },
  { id: "af-6", entityA: "psoe", entityB: "pp", type: "fricción", strength: 88, topics: ["Amnistía", "Política territorial", "Fiscalidad", "Inmigración"], recentEvents: ["Bloqueo CGPJ", "Debate amnistía", "Moción de censura verbal"], trend: "fortaleciendo" },
  { id: "af-7", entityA: "min-eco", entityB: "cat", type: "fricción", strength: 55, topics: ["Financiación singular", "Déficit fiscal"], recentEvents: ["Negociación cupo catalán", "Disputa cifras"], trend: "debilitando" },
  { id: "af-8", entityA: "min-trans", entityB: "cat", type: "alianza", strength: 60, topics: ["Corredor mediterráneo", "Cercanías"], recentEvents: ["Acuerdo inversiones AVE", "Plan cercanías Barcelona"], trend: "fortaleciendo" },
  { id: "af-9", entityA: "pv", entityB: "cat", type: "alianza", strength: 50, topics: ["Autogobierno", "Modelo foral/singular"], recentEvents: ["Declaración conjunta financiación"], trend: "estable" },
  { id: "af-10", entityA: "min-eco", entityB: "pp", type: "fricción", strength: 70, topics: ["PGE", "Senda de déficit", "Política fiscal"], recentEvents: ["Rechazo presupuestos", "Crítica a previsiones macro"], trend: "estable" },
];

const contradictions: Contradiction[] = [
  { id: "c-1", entityId: "psoe", title: "Promesa de no pactar con independentistas", said: "No habrá referéndum ni independencia, no pactaremos con quienes quieren romper España (2019)", did: "Aprobación de ley de amnistía con votos independentistas para investidura (2023)", date: "2023-11-16", severity: "alta", source: "Debate de investidura / Declaraciones electorales" },
  { id: "c-2", entityId: "pp", title: "Rechazo a subir impuestos", said: "Nunca subiremos impuestos, los bajaremos siempre (Congreso Sevilla 2022)", did: "Subida de tasas y cánones en CCAA gobernadas por PP para cuadrar presupuestos", date: "2025-03-15", severity: "media", source: "BOE autonómicos / Declaraciones públicas" },
  { id: "c-3", entityId: "mad", title: "Defensa de la sanidad pública", said: "La sanidad pública madrileña es la mejor de España (múltiples declaraciones)", did: "Reducción del 8% del presupuesto sanitario per cápita en términos reales (2020-2025)", date: "2025-01-10", severity: "alta", source: "Presupuestos CAM / Informes FADSP" },
  { id: "c-4", entityId: "cat", title: "Diálogo como única vía", said: "Apostamos por el diálogo y la negociación como única vía (Declaración de 2024)", did: "Boicot a la Conferencia de Presidentes y bloqueo de comisiones bilaterales", date: "2025-06-20", severity: "media", source: "Actas conferencias / Declaraciones institucionales" },
  { id: "c-5", entityId: "min-eco", title: "Cumplimiento de senda de déficit", said: "España cumplirá estrictamente la senda de estabilidad comprometida con Bruselas", did: "Desviación del 0.4% sobre el objetivo de déficit en 2024", date: "2025-04-01", severity: "media", source: "Eurostat / Declaraciones ministeriales" },
  { id: "c-6", entityId: "min-trans", title: "Plazos del Corredor Mediterráneo", said: "El Corredor Mediterráneo estará operativo en 2025 (declaraciones 2021)", did: "Ejecución del 34% del trazado a cierre de 2025, nuevo horizonte 2030", date: "2025-12-01", severity: "alta", source: "Informes ADIF / Ruedas de prensa" },
  { id: "c-7", entityId: "psoe", title: "Transparencia total en contratación", said: "Seremos el gobierno más transparente de la historia de España", did: "Aumento del 23% en contratos de emergencia sin publicidad en 2024-2025", date: "2025-08-15", severity: "media", source: "Portal de transparencia / Tribunal de Cuentas" },
  { id: "c-8", entityId: "pp", title: "Defensa del agua para todos", said: "Garantizaremos el agua como derecho, el trasvase es irrenunciable", did: "Voto favorable a recorte del trasvase Tajo-Segura en el Senado para pactar con socios", date: "2025-10-05", severity: "alta", source: "Diario de sesiones Senado / Mítines electorales" },
];

const predictions: Prediction[] = [
  { id: "p-1", entityId: "psoe", description: "Convocatoria de cuestión de confianza antes de fin de legislatura", probability: 25, timeframe: "12-18 meses", basis: ["Desgaste parlamentario", "Pérdida de socios", "Precedentes históricos"], impact: "alto", category: "electoral" },
  { id: "p-2", entityId: "pp", description: "Presentación de moción de censura constructiva", probability: 15, timeframe: "6-12 meses", basis: ["Fragmentación parlamento", "Falta de mayoría alternativa"], impact: "alto", category: "electoral" },
  { id: "p-3", entityId: "cat", description: "Solicitud formal de referéndum pactado de autogobierno", probability: 35, timeframe: "12-24 meses", basis: ["Calendario electoral catalán", "Presión de base social", "Precedente escocés"], impact: "alto", category: "legislativo" },
  { id: "p-4", entityId: "min-eco", description: "Aprobación de nueva reforma fiscal con impuesto a grandes fortunas permanente", probability: 65, timeframe: "6-9 meses", basis: ["Compromiso con Bruselas", "Presión presupuestaria", "Agenda de coalición"], impact: "alto", category: "presupuestario" },
  { id: "p-5", entityId: "and", description: "Convocatoria anticipada de elecciones autonómicas", probability: 40, timeframe: "9-15 meses", basis: ["Encuestas favorables", "Ventana electoral pre-generales", "Desgaste de oposición"], impact: "medio", category: "electoral" },
  { id: "p-6", entityId: "mad", description: "Ampliación de bonificaciones fiscales a nuevos sectores tecnológicos", probability: 80, timeframe: "3-6 meses", basis: ["Patrón histórico de bajadas", "Competencia con Barcelona", "Hub IA"], impact: "medio", category: "presupuestario" },
  { id: "p-7", entityId: "pv", description: "Acuerdo bilateral con el Estado para transferencia de competencias de tráfico", probability: 55, timeframe: "6-12 meses", basis: ["Negociación en curso", "Precedente de Ertzaintza", "Apoyo PNV a PGE"], impact: "bajo", category: "legislativo" },
  { id: "p-8", entityId: "min-trans", description: "Renegociación de plazos del Corredor Mediterráneo con nuevo cronograma 2030", probability: 90, timeframe: "1-3 meses", basis: ["Desfase actual", "Presión territorial", "Fondos comprometidos"], impact: "alto", category: "legislativo" },
  { id: "p-9", entityId: "psoe", description: "Acuerdo con PP para renovación del CGPJ", probability: 45, timeframe: "3-6 meses", basis: ["Presión UE", "Coste reputacional", "Precedentes de desbloqueo"], impact: "alto", category: "legislativo" },
  { id: "p-10", entityId: "pp", description: "Giro hacia el centro en política migratoria tras tensiones internas", probability: 30, timeframe: "6-12 meses", basis: ["Presión de barones moderados", "Ejemplo europeo", "Coste electoral en urbano"], impact: "medio", category: "social" },
];

const alerts: BehavioralAlert[] = [
  { id: "ba-1", entityId: "psoe", type: "cambio-narrativa", title: "Giro en discurso sobre inmigración", description: "Aumento del 40% en menciones a 'inmigración ordenada' y 'control de flujos' en las últimas 4 semanas", date: "2025-12-10", severity: "alto" },
  { id: "ba-2", entityId: "cat", type: "ruptura", title: "Distanciamiento de socio parlamentario", description: "ERC reduce un 60% sus votos favorables a propuestas de la Generalitat en el Parlament", date: "2025-12-08", severity: "critico" },
  { id: "ba-3", entityId: "pp", type: "nueva-alianza", title: "Acercamiento a partidos regionalistas", description: "Reuniones bilaterales con CC, PAR y UPN para construir bloque territorial alternativo", date: "2025-12-05", severity: "medio" },
  { id: "ba-4", entityId: "min-eco", type: "anomalía", title: "Revisión macroeconómica inusual", description: "Tercera revisión del cuadro macro en 6 meses, patrón sin precedentes desde 2012", date: "2025-12-01", severity: "alto" },
  { id: "ba-5", entityId: "mad", type: "contradicción", title: "Incremento de gasto en partida recortada", description: "Partida de gasto social aumentada un 12% tras declaraciones de austeridad necesaria", date: "2025-11-28", severity: "medio" },
  { id: "ba-6", entityId: "and", type: "cambio-narrativa", title: "Nuevo énfasis en política hídrica", description: "Triplicadas las menciones a sequía y gestión del agua en comunicados oficiales", date: "2025-11-25", severity: "bajo" },
];

// ── Builder functions ─────────────────────────────────────────────────────

export function buildPoliticalTwinData(): PoliticalTwinData {
  const allianceCount = alliances.filter((a) => a.type === "alianza").length;
  const frictionCount = alliances.filter((a) => a.type === "fricción").length;
  const avgAccuracy = Math.round(entities.reduce((s, e) => s + e.predictionAccuracy, 0) / entities.length);

  return {
    entities,
    decisionPatterns,
    alliances,
    contradictions,
    predictions,
    alerts,
    stats: {
      totalEntities: entities.length,
      activePatterns: decisionPatterns.length,
      allianceCount,
      frictionCount,
      contradictionCount: contradictions.length,
      pendingPredictions: predictions.length,
      avgPredictionAccuracy: avgAccuracy,
      activeAlerts: alerts.length,
    },
  };
}

export function getEntityTwin(id: string): EntityTwin | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntityPatterns(entityId: string): DecisionPattern[] {
  return decisionPatterns.filter((p) => p.entityId === entityId);
}

export function getEntityAlliances(entityId: string): AllianceFriction[] {
  return alliances.filter((a) => a.entityA === entityId || a.entityB === entityId);
}

export function getEntityContradictions(entityId: string): Contradiction[] {
  return contradictions.filter((c) => c.entityId === entityId);
}

export function getEntityPredictions(entityId: string): Prediction[] {
  return predictions.filter((p) => p.entityId === entityId);
}

export function getEntityAlerts(entityId: string): BehavioralAlert[] {
  return alerts.filter((a) => a.entityId === entityId);
}
