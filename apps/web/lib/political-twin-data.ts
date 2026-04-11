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
  // ── 13 CCAAs adicionales ────────────────────────────────────────────────
  {
    id: "gal", name: "Xunta de Galicia", type: "ccaa", slug: "galicia",
    description: "Gobierno autonómico de Galicia. Tradición de estabilidad institucional, foco en pesca, demografía y conexión atlántica.",
    priorities: ["Sector pesquero", "Lucha contra despoblación", "Infraestructuras", "Industria naval"],
    legislativeRhythm: "Actividad moderada, mayoría absoluta reduce conflicto",
    narrativeLines: ["Galicia verde", "Atlántico como oportunidad", "Equilibrio territorial"],
    ideologicalPosition: 30, cohesionIndex: 88, activityScore: 65, transparencyScore: 60,
    narrativeTopics: [
      { topic: "Pesca", mentions: 245, trend: "creciente", sentiment: -20, sparkline: [30, 35, 38, 42, 48, 52, 58] },
      { topic: "Despoblación", mentions: 189, trend: "creciente", sentiment: -35, sparkline: [25, 30, 35, 40, 45, 50, 55] },
    ],
    keyEvents: [
      { date: "2024-02-18", title: "Elecciones gallegas", description: "Renovación de mayoría absoluta PP Galicia", impact: "alto" },
    ],
    totalDecisions: 756, contradictionCount: 8, predictionAccuracy: 74,
  },
  {
    id: "val", name: "Generalitat Valenciana", type: "ccaa", slug: "comunitat-valenciana",
    description: "Gobierno autonómico de la Comunitat Valenciana. Agenda marcada por reconstrucción post-DANA y financiación.",
    priorities: ["Reconstrucción DANA", "Financiación autonómica", "Turismo sostenible", "Agua"],
    legislativeRhythm: "Alta actividad por emergencia DANA, legislación extraordinaria",
    narrativeLines: ["Reconstrucción", "Infrafinanciación", "Resiliencia valenciana"],
    ideologicalPosition: 25, cohesionIndex: 72, activityScore: 85, transparencyScore: 62,
    narrativeTopics: [
      { topic: "DANA", mentions: 520, trend: "decreciente", sentiment: -50, sparkline: [95, 85, 75, 65, 55, 48, 42] },
      { topic: "Financiación", mentions: 310, trend: "creciente", sentiment: -40, sparkline: [35, 40, 45, 52, 58, 62, 68] },
    ],
    keyEvents: [
      { date: "2024-10-29", title: "DANA catastrófica", description: "Inundaciones con más de 200 víctimas mortales", impact: "alto" },
    ],
    totalDecisions: 1045, contradictionCount: 15, predictionAccuracy: 62,
  },
  {
    id: "cyl", name: "Junta de Castilla y León", type: "ccaa", slug: "castilla-y-leon",
    description: "Gobierno autonómico de Castilla y León. Agenda dominada por despoblación y sector agrario.",
    priorities: ["Reto demográfico", "Agricultura y ganadería", "Servicios rurales", "Energía"],
    legislativeRhythm: "Actividad moderada, coalición PP-Vox (rota) condiciona agenda",
    narrativeLines: ["España vaciada", "Soberanía alimentaria", "Vertebración territorial"],
    ideologicalPosition: 40, cohesionIndex: 65, activityScore: 62, transparencyScore: 55,
    narrativeTopics: [
      { topic: "Despoblación", mentions: 345, trend: "creciente", sentiment: -45, sparkline: [40, 45, 50, 55, 60, 65, 70] },
      { topic: "Agricultura", mentions: 234, trend: "estable", sentiment: 10, sparkline: [38, 37, 39, 38, 40, 38, 39] },
    ],
    keyEvents: [
      { date: "2024-07-10", title: "Ruptura coalición", description: "Vox abandona la coalición de gobierno", impact: "alto" },
    ],
    totalDecisions: 680, contradictionCount: 14, predictionAccuracy: 60,
  },
  {
    id: "clm", name: "Junta de Castilla-La Mancha", type: "ccaa", slug: "castilla-la-mancha",
    description: "Gobierno autonómico de CLM. Foco en agua, energías renovables y agroindustria.",
    priorities: ["Gestión del agua", "Energías renovables", "Agroindustria", "Despoblación"],
    legislativeRhythm: "Estable, mayoría absoluta socialista permite agenda propia",
    narrativeLines: ["Agua como derecho", "Hub renovable de España", "Industria agroalimentaria"],
    ideologicalPosition: -20, cohesionIndex: 82, activityScore: 68, transparencyScore: 60,
    narrativeTopics: [
      { topic: "Trasvase Tajo-Segura", mentions: 287, trend: "creciente", sentiment: -55, sparkline: [35, 42, 48, 55, 62, 68, 75] },
      { topic: "Renovables", mentions: 198, trend: "creciente", sentiment: 30, sparkline: [25, 30, 35, 38, 42, 45, 50] },
    ],
    keyEvents: [
      { date: "2025-05-28", title: "Reelección Page", description: "Tercera mayoría absoluta consecutiva", impact: "medio" },
    ],
    totalDecisions: 620, contradictionCount: 10, predictionAccuracy: 66,
  },
  {
    id: "ara", name: "Gobierno de Aragón", type: "ccaa", slug: "aragon",
    description: "Gobierno autonómico de Aragón. Equilibrio entre desarrollo industrial (Zaragoza) y despoblación (Teruel/Huesca).",
    priorities: ["Teruel existe", "Logística e industria", "Pirineo sostenible", "Energía"],
    legislativeRhythm: "Actividad moderada, coalición PP-Vox condiciona agenda",
    narrativeLines: ["Aragón conectado", "Teruel existe", "Corredor del Ebro"],
    ideologicalPosition: 30, cohesionIndex: 60, activityScore: 58, transparencyScore: 58,
    narrativeTopics: [
      { topic: "Despoblación Teruel", mentions: 178, trend: "creciente", sentiment: -40, sparkline: [22, 28, 32, 38, 42, 48, 52] },
      { topic: "Logística", mentions: 145, trend: "estable", sentiment: 20, sparkline: [22, 23, 22, 24, 23, 22, 23] },
    ],
    keyEvents: [
      { date: "2023-05-28", title: "Cambio de gobierno", description: "PP gana gobierno con apoyo de VOX y PAR", impact: "alto" },
    ],
    totalDecisions: 520, contradictionCount: 9, predictionAccuracy: 63,
  },
  {
    id: "can", name: "Gobierno de Canarias", type: "ccaa", slug: "canarias",
    description: "Gobierno autonómico de Canarias. Retos de insularidad, crisis migratoria y modelo turístico.",
    priorities: ["Crisis migratoria", "Turismo sostenible", "Vivienda", "Conectividad interinsular"],
    legislativeRhythm: "Alta actividad por emergencia migratoria, decretos-ley frecuentes",
    narrativeLines: ["Canarias desbordada", "REF y autogobierno", "Sostenibilidad turística"],
    ideologicalPosition: 10, cohesionIndex: 70, activityScore: 78, transparencyScore: 65,
    narrativeTopics: [
      { topic: "Migración", mentions: 456, trend: "creciente", sentiment: -55, sparkline: [40, 50, 58, 65, 72, 80, 88] },
      { topic: "Turismo", mentions: 310, trend: "estable", sentiment: 15, sparkline: [50, 48, 52, 50, 49, 51, 50] },
    ],
    keyEvents: [
      { date: "2025-08-15", title: "Crisis menores migrantes", description: "Saturación centros de acogida, petición de reparto estatal", impact: "alto" },
    ],
    totalDecisions: 780, contradictionCount: 11, predictionAccuracy: 67,
  },
  {
    id: "bal", name: "Govern de les Illes Balears", type: "ccaa", slug: "illes-balears",
    description: "Gobierno autonómico de Baleares. Agenda turística, vivienda y sostenibilidad.",
    priorities: ["Regulación alquiler turístico", "Vivienda asequible", "Economía circular", "Agua"],
    legislativeRhythm: "Ciclos marcados por temporada turística, actividad en invierno",
    narrativeLines: ["Baleares sostenible", "Vivienda para residentes", "Desestacionalización"],
    ideologicalPosition: 25, cohesionIndex: 68, activityScore: 65, transparencyScore: 62,
    narrativeTopics: [
      { topic: "Alquiler turístico", mentions: 289, trend: "creciente", sentiment: -35, sparkline: [30, 38, 45, 52, 58, 65, 72] },
      { topic: "Vivienda", mentions: 234, trend: "creciente", sentiment: -45, sparkline: [35, 42, 48, 55, 62, 68, 75] },
    ],
    keyEvents: [
      { date: "2025-06-01", title: "Moratoria turística", description: "Aprobación de moratoria de nuevas plazas turísticas", impact: "alto" },
    ],
    totalDecisions: 490, contradictionCount: 8, predictionAccuracy: 65,
  },
  {
    id: "ext", name: "Junta de Extremadura", type: "ccaa", slug: "extremadura",
    description: "Gobierno autonómico de Extremadura. Foco en energía, convergencia y despoblación.",
    priorities: ["Central Almaraz", "Energías renovables", "Convergencia económica", "Despoblación"],
    legislativeRhythm: "Actividad moderada-baja, estabilidad institucional",
    narrativeLines: ["Extremadura verde", "Transición justa", "Hub renovable"],
    ideologicalPosition: 25, cohesionIndex: 75, activityScore: 55, transparencyScore: 58,
    narrativeTopics: [
      { topic: "Almaraz", mentions: 178, trend: "creciente", sentiment: -30, sparkline: [20, 25, 30, 38, 45, 52, 58] },
      { topic: "Renovables", mentions: 210, trend: "creciente", sentiment: 35, sparkline: [28, 32, 38, 42, 48, 52, 58] },
    ],
    keyEvents: [
      { date: "2023-05-28", title: "Cambio de gobierno", description: "PP gana la presidencia tras 28 años de gobierno socialista", impact: "alto" },
    ],
    totalDecisions: 420, contradictionCount: 6, predictionAccuracy: 70,
  },
  {
    id: "mur", name: "Gobierno de la Región de Murcia", type: "ccaa", slug: "murcia",
    description: "Gobierno autonómico de Murcia. Agenda hídrica, agroindustria y Mar Menor.",
    priorities: ["Mar Menor", "Trasvase Tajo-Segura", "Agroindustria", "Empleo"],
    legislativeRhythm: "Actividad marcada por emergencias medioambientales (Mar Menor)",
    narrativeLines: ["Agua para Murcia", "Huerta de Europa", "Salvar el Mar Menor"],
    ideologicalPosition: 35, cohesionIndex: 72, activityScore: 70, transparencyScore: 52,
    narrativeTopics: [
      { topic: "Mar Menor", mentions: 345, trend: "creciente", sentiment: -60, sparkline: [40, 48, 55, 62, 68, 75, 82] },
      { topic: "Agua/Trasvase", mentions: 278, trend: "creciente", sentiment: -50, sparkline: [35, 42, 48, 55, 60, 68, 72] },
    ],
    keyEvents: [
      { date: "2025-09-10", title: "Anoxia Mar Menor", description: "Nuevo episodio de mortandad masiva de peces", impact: "alto" },
    ],
    totalDecisions: 580, contradictionCount: 12, predictionAccuracy: 58,
  },
  {
    id: "ast", name: "Principado de Asturias", type: "ccaa", slug: "asturias",
    description: "Gobierno autonómico de Asturias. Reconversión industrial, envejecimiento y transición justa.",
    priorities: ["Transición justa minería", "Reindustrialización", "Sanidad", "Demografía"],
    legislativeRhythm: "Actividad estable, gobierno en minoría negociado",
    narrativeLines: ["Asturias industrial", "Transición justa", "Envejecimiento activo"],
    ideologicalPosition: -25, cohesionIndex: 68, activityScore: 60, transparencyScore: 65,
    narrativeTopics: [
      { topic: "Reconversión industrial", mentions: 198, trend: "creciente", sentiment: -20, sparkline: [25, 28, 32, 38, 42, 45, 50] },
      { topic: "Envejecimiento", mentions: 167, trend: "creciente", sentiment: -40, sparkline: [30, 35, 38, 42, 48, 52, 55] },
    ],
    keyEvents: [
      { date: "2025-03-15", title: "Plan transición cuencas", description: "Aprobación plan de reconversión de cuencas mineras", impact: "medio" },
    ],
    totalDecisions: 410, contradictionCount: 7, predictionAccuracy: 69,
  },
  {
    id: "cnt", name: "Gobierno de Cantabria", type: "ccaa", slug: "cantabria",
    description: "Gobierno autonómico de Cantabria. Equilibrio turismo-industria, patrimonio natural.",
    priorities: ["Turismo sostenible", "Industria", "Patrimonio natural", "Conectividad"],
    legislativeRhythm: "Baja actividad legislativa, gobierno estable",
    narrativeLines: ["Cantabria infinita", "Equilibrio verde", "Calidad de vida"],
    ideologicalPosition: 30, cohesionIndex: 78, activityScore: 50, transparencyScore: 62,
    narrativeTopics: [
      { topic: "Turismo", mentions: 134, trend: "estable", sentiment: 25, sparkline: [22, 23, 22, 24, 23, 22, 23] },
      { topic: "Industria", mentions: 98, trend: "estable", sentiment: 10, sparkline: [15, 16, 15, 14, 16, 15, 15] },
    ],
    keyEvents: [
      { date: "2023-05-28", title: "Elecciones autonómicas", description: "PP recupera la presidencia con apoyo de PRC", impact: "medio" },
    ],
    totalDecisions: 320, contradictionCount: 4, predictionAccuracy: 72,
  },
  {
    id: "nav", name: "Gobierno de Navarra", type: "ccaa", slug: "navarra",
    description: "Gobierno autonómico de Navarra. Régimen foral, industria avanzada y renovables.",
    priorities: ["Convenio económico", "Automoción (VW)", "Energía eólica", "Euskera"],
    legislativeRhythm: "Actividad estable, compleja aritmética parlamentaria",
    narrativeLines: ["Navarra foral", "Industria verde", "Bienestar social"],
    ideologicalPosition: -15, cohesionIndex: 62, activityScore: 68, transparencyScore: 72,
    narrativeTopics: [
      { topic: "Convenio económico", mentions: 145, trend: "estable", sentiment: 35, sparkline: [22, 23, 22, 24, 23, 22, 23] },
      { topic: "Automoción", mentions: 120, trend: "decreciente", sentiment: -15, sparkline: [28, 25, 22, 20, 18, 16, 15] },
    ],
    keyEvents: [
      { date: "2023-06-17", title: "Gobierno de coalición", description: "Gobierno PSN con apoyo de Geroa Bai y Contigo/Zurekin", impact: "medio" },
    ],
    totalDecisions: 480, contradictionCount: 5, predictionAccuracy: 75,
  },
  {
    id: "rio", name: "Gobierno de La Rioja", type: "ccaa", slug: "la-rioja",
    description: "Gobierno autonómico de La Rioja. La CCAA más pequeña, centrada en vino, agroalimentación y calidad de vida.",
    priorities: ["DOC Rioja", "Agroalimentación", "Despoblación Sierra", "Turismo enológico"],
    legislativeRhythm: "Baja actividad legislativa, CCAA pequeña con agenda acotada",
    narrativeLines: ["Rioja con denominación", "Calidad de vida", "Sierra viva"],
    ideologicalPosition: 20, cohesionIndex: 82, activityScore: 45, transparencyScore: 65,
    narrativeTopics: [
      { topic: "Vino y DOC", mentions: 189, trend: "estable", sentiment: 30, sparkline: [30, 29, 31, 30, 28, 31, 30] },
      { topic: "Despoblación", mentions: 98, trend: "creciente", sentiment: -35, sparkline: [12, 15, 18, 22, 25, 28, 32] },
    ],
    keyEvents: [
      { date: "2023-05-28", title: "Elecciones autonómicas", description: "PP gana gobierno con mayoría simple", impact: "medio" },
    ],
    totalDecisions: 280, contradictionCount: 3, predictionAccuracy: 73,
  },
  // ── 4 partidos adicionales ──────────────────────────────────────────────
  {
    id: "vox", name: "VOX", type: "partido", slug: "vox",
    description: "Partido de derecha radical. Agenda identitaria, anti-inmigración y soberanista.",
    priorities: ["Control de inmigración", "Unidad territorial", "Bajada impuestos", "Soberanía nacional"],
    legislativeRhythm: "Oposición activa, proposiciones no de ley frecuentes, bajo consenso",
    narrativeLines: ["España primero", "Contra la agenda 2030", "Inmigración ilegal"],
    ideologicalPosition: 70, cohesionIndex: 85, activityScore: 82, transparencyScore: 40,
    narrativeTopics: [
      { topic: "Inmigración", mentions: 567, trend: "creciente", sentiment: -65, sparkline: [50, 58, 65, 72, 78, 85, 92] },
      { topic: "Unidad España", mentions: 345, trend: "estable", sentiment: -50, sparkline: [55, 53, 56, 54, 55, 53, 55] },
      { topic: "Anti-agenda 2030", mentions: 234, trend: "decreciente", sentiment: -40, sparkline: [45, 42, 38, 35, 32, 30, 28] },
    ],
    keyEvents: [
      { date: "2024-07-10", title: "Salida de gobiernos CCAA", description: "VOX abandona coaliciones autonómicas por acogida de menores migrantes", impact: "alto" },
    ],
    totalDecisions: 1234, contradictionCount: 22, predictionAccuracy: 55,
  },
  {
    id: "sumar", name: "Sumar", type: "partido", slug: "sumar",
    description: "Coalición de izquierdas. Socio de gobierno, agenda social y verde.",
    priorities: ["Reducción jornada laboral", "Vivienda", "Transición ecológica", "Feminismo"],
    legislativeRhythm: "Actividad alta como socio de coalición, foco en proposiciones propias",
    narrativeLines: ["Justicia social", "Jornada de 37.5h", "Vivienda digna"],
    ideologicalPosition: -50, cohesionIndex: 55, activityScore: 75, transparencyScore: 65,
    narrativeTopics: [
      { topic: "Jornada laboral", mentions: 389, trend: "creciente", sentiment: 25, sparkline: [40, 48, 55, 62, 68, 72, 78] },
      { topic: "Vivienda", mentions: 298, trend: "creciente", sentiment: -30, sparkline: [35, 42, 48, 55, 60, 65, 70] },
    ],
    keyEvents: [
      { date: "2023-06-15", title: "Fundación Sumar", description: "Creación de la plataforma electoral de izquierdas", impact: "alto" },
    ],
    totalDecisions: 890, contradictionCount: 16, predictionAccuracy: 58,
  },
  {
    id: "erc", name: "ERC", type: "partido", slug: "erc",
    description: "Esquerra Republicana de Catalunya. Independentismo pragmático, socio clave del gobierno.",
    priorities: ["Independencia", "Financiación singular", "Justicia social", "Lengua catalana"],
    legislativeRhythm: "Socio parlamentario selectivo, voto caso a caso",
    narrativeLines: ["República catalana", "Financiación justa", "Pragmatismo soberanista"],
    ideologicalPosition: -35, cohesionIndex: 60, activityScore: 70, transparencyScore: 58,
    narrativeTopics: [
      { topic: "Financiación", mentions: 287, trend: "creciente", sentiment: -30, sparkline: [35, 40, 48, 52, 58, 62, 68] },
      { topic: "Amnistía", mentions: 234, trend: "decreciente", sentiment: 15, sparkline: [55, 48, 42, 38, 32, 28, 25] },
    ],
    keyEvents: [
      { date: "2024-05-12", title: "Cambio de liderazgo", description: "Nuevo líder tras crisis interna y resultados electorales", impact: "alto" },
    ],
    totalDecisions: 1120, contradictionCount: 18, predictionAccuracy: 62,
  },
  {
    id: "pnv", name: "PNV", type: "partido", slug: "pnv",
    description: "Partido Nacionalista Vasco. Centrismo vasco, socio histórico de gobernabilidad.",
    priorities: ["Concierto económico", "Autogobierno", "Industria vasca", "Moderación"],
    legislativeRhythm: "Socio leal de gobierno a cambio de transferencias, voto predecible",
    narrativeLines: ["Estabilidad vasca", "Pacto y diálogo", "Modelo foral"],
    ideologicalPosition: 5, cohesionIndex: 92, activityScore: 65, transparencyScore: 70,
    narrativeTopics: [
      { topic: "Concierto", mentions: 178, trend: "estable", sentiment: 40, sparkline: [28, 27, 29, 28, 27, 29, 28] },
      { topic: "Transferencias", mentions: 145, trend: "creciente", sentiment: 20, sparkline: [20, 22, 25, 28, 30, 32, 35] },
    ],
    keyEvents: [
      { date: "2024-04-21", title: "Elecciones vascas", description: "PNV pierde Lehendakaritza por primera vez en 12 años ante EH Bildu", impact: "alto" },
    ],
    totalDecisions: 980, contradictionCount: 8, predictionAccuracy: 78,
  },
  // ── 3 ministerios adicionales ───────────────────────────────────────────
  {
    id: "min-int", name: "Ministerio del Interior", type: "ministerio", slug: "ministerio-interior",
    description: "Seguridad pública, policía, guardia civil, instituciones penitenciarias y extranjería.",
    priorities: ["Seguridad ciudadana", "Inmigración y fronteras", "Ciberseguridad", "Tráfico"],
    legislativeRhythm: "Actividad constante, decretos de seguridad, órdenes ministeriales frecuentes",
    narrativeLines: ["España segura", "Fronteras ordenadas", "Policía de proximidad"],
    ideologicalPosition: 0, cohesionIndex: 80, activityScore: 85, transparencyScore: 45,
    narrativeTopics: [
      { topic: "Inmigración", mentions: 398, trend: "creciente", sentiment: -35, sparkline: [40, 48, 55, 62, 68, 72, 78] },
      { topic: "Ciberseguridad", mentions: 210, trend: "creciente", sentiment: -10, sparkline: [25, 30, 35, 38, 42, 45, 50] },
    ],
    keyEvents: [
      { date: "2025-08-20", title: "Crisis Canarias", description: "Despliegue especial por oleada migratoria", impact: "alto" },
    ],
    totalDecisions: 1320, contradictionCount: 12, predictionAccuracy: 68,
  },
  {
    id: "min-san", name: "Ministerio de Sanidad", type: "ministerio", slug: "ministerio-sanidad",
    description: "Coordinación sanitaria interterritorial, farmacia, salud pública.",
    priorities: ["Atención primaria", "Salud mental", "Interoperabilidad SNS", "Farmacia"],
    legislativeRhythm: "Actividad vinculada al Consejo Interterritorial y alertas sanitarias",
    narrativeLines: ["Sanidad universal", "Prevención", "España unida en salud"],
    ideologicalPosition: -10, cohesionIndex: 72, activityScore: 70, transparencyScore: 68,
    narrativeTopics: [
      { topic: "Atención primaria", mentions: 310, trend: "creciente", sentiment: -35, sparkline: [35, 40, 45, 52, 58, 62, 68] },
      { topic: "Salud mental", mentions: 234, trend: "creciente", sentiment: -25, sparkline: [25, 30, 35, 40, 45, 50, 55] },
    ],
    keyEvents: [
      { date: "2025-05-15", title: "Plan atención primaria", description: "Aprobación del plan de refuerzo con 6.000M euros", impact: "alto" },
    ],
    totalDecisions: 890, contradictionCount: 10, predictionAccuracy: 66,
  },
  {
    id: "min-def", name: "Ministerio de Defensa", type: "ministerio", slug: "ministerio-defensa",
    description: "Política de defensa, fuerzas armadas, industria militar y compromisos OTAN.",
    priorities: ["Gasto OTAN 2%", "Modernización FFAA", "Industria defensa", "Misiones internacionales"],
    legislativeRhythm: "Actividad planificada, ciclos de adquisiciones largas",
    narrativeLines: ["España aliada fiable", "Defensa como inversión", "Soberanía estratégica"],
    ideologicalPosition: 10, cohesionIndex: 88, activityScore: 60, transparencyScore: 42,
    narrativeTopics: [
      { topic: "OTAN", mentions: 267, trend: "creciente", sentiment: 15, sparkline: [30, 35, 38, 42, 48, 52, 55] },
      { topic: "Industria defensa", mentions: 178, trend: "creciente", sentiment: 20, sparkline: [22, 25, 30, 35, 38, 42, 45] },
    ],
    keyEvents: [
      { date: "2025-07-10", title: "Cumbre OTAN", description: "Compromiso de España de alcanzar 2% PIB en defensa para 2029", impact: "alto" },
    ],
    totalDecisions: 560, contradictionCount: 5, predictionAccuracy: 72,
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
  // ── Patrones nuevas entidades ───────────────────────────────────────────
  { id: "dp-16", entityId: "gal", description: "Defensa del sector pesquero ante regulación UE en foros europeos", category: "comunicación", frequency: "trimestral", confidence: 82, examples: ["Rechazo cuotas atún 2025", "Lobby cofradías Bruselas"], lastOccurrence: "2025-10-20" },
  { id: "dp-17", entityId: "val", description: "Decretos-ley de emergencia vinculados a reconstrucción DANA", category: "legislativo", frequency: "mensual", confidence: 90, examples: ["DL ayudas vivienda", "DL exención tributos", "DL empleo DANA"], lastOccurrence: "2026-01-15" },
  { id: "dp-18", entityId: "can", description: "Peticiones urgentes al Estado por crisis migratoria con escenificación mediática", category: "comunicación", frequency: "mensual", confidence: 85, examples: ["Carta al presidente", "Rueda prensa puertos", "Conferencia sectorial"], lastOccurrence: "2025-12-10" },
  { id: "dp-19", entityId: "mur", description: "Bandazos entre protección Mar Menor y apoyo a agroindustria local", category: "legislativo", frequency: "trimestral", confidence: 72, examples: ["Ley Mar Menor 2020", "Moratoria regadío 2024", "Excepciones nitratos 2025"], lastOccurrence: "2025-11-01" },
  { id: "dp-20", entityId: "vox", description: "Proposiciones no de ley sobre inmigración antes de cada ciclo informativo", category: "comunicación", frequency: "semanal", confidence: 92, examples: ["PNL expulsión 2024", "PNL Canarias 2025", "PNL valla Ceuta"], lastOccurrence: "2026-01-20" },
  { id: "dp-21", entityId: "sumar", description: "Amenaza de desmarque en votaciones para presionar concesiones sociales", category: "alianza", frequency: "mensual", confidence: 78, examples: ["Presión jornada laboral", "Condiciones ley familias", "Voto diferenciado vivienda"], lastOccurrence: "2025-12-15" },
  { id: "dp-22", entityId: "erc", description: "Exigencias de agenda catalana a cambio de votos en Congreso", category: "alianza", frequency: "mensual", confidence: 88, examples: ["Traspaso Cercanías", "Financiación singular", "Inmersión lingüística"], lastOccurrence: "2026-01-08" },
  { id: "dp-23", entityId: "pnv", description: "Negociación discreta de transferencias a cambio de apoyo presupuestario", category: "presupuestario", frequency: "anual", confidence: 90, examples: ["Transferencia tráfico", "Competencia puertos", "Seguridad Social"], lastOccurrence: "2025-12-20" },
  { id: "dp-24", entityId: "min-int", description: "Operaciones policiales mediáticas en vísperas de debates sobre inmigración", category: "comunicación", frequency: "mensual", confidence: 70, examples: ["Operación Frontex refuerzo", "Detención redes tráfico", "Desmantelamiento campamentos"], lastOccurrence: "2026-01-05" },
  { id: "dp-25", entityId: "ext", description: "Reivindicación de infraestructuras pendientes (AVE, autovía) en cada visita institucional", category: "comunicación", frequency: "trimestral", confidence: 85, examples: ["Demanda AVE Extremadura", "Autovía Cáceres-Badajoz", "Tren Lusitania"], lastOccurrence: "2025-11-15" },
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
  // ── Alianzas/fricciones nuevas entidades ────────────────────────────────
  { id: "af-11", entityA: "vox", entityB: "pp", type: "fricción", strength: 55, topics: ["Inmigración", "Gobierno CCAA", "Pactos"], recentEvents: ["Ruptura coaliciones 2024", "Competencia electoral derecha"], trend: "debilitando" },
  { id: "af-12", entityA: "sumar", entityB: "psoe", type: "alianza", strength: 60, topics: ["Jornada laboral", "Vivienda", "Fiscalidad"], recentEvents: ["Tensión jornada 37.5h", "Acuerdo ley familias"], trend: "debilitando" },
  { id: "af-13", entityA: "erc", entityB: "psoe", type: "alianza", strength: 45, topics: ["Financiación", "Amnistía", "Transferencias"], recentEvents: ["Acuerdo financiación singular", "Tensión calendario"], trend: "debilitando" },
  { id: "af-14", entityA: "pnv", entityB: "psoe", type: "alianza", strength: 80, topics: ["PGE", "Transferencias", "Industria"], recentEvents: ["Apoyo PGE 2026", "Acuerdo tráfico"], trend: "estable" },
  { id: "af-15", entityA: "val", entityB: "min-trans", type: "fricción", strength: 65, topics: ["Reconstrucción DANA", "Cercanías Valencia", "Corredor mediterráneo"], recentEvents: ["Demanda fondos reconstrucción", "Retrasos AVE Valencia"], trend: "fortaleciendo" },
  { id: "af-16", entityA: "can", entityB: "min-int", type: "fricción", strength: 72, topics: ["Migración", "Menores no acompañados", "Reparto territorial"], recentEvents: ["Crisis centros acogida", "Petición estado emergencia"], trend: "fortaleciendo" },
  { id: "af-17", entityA: "clm", entityB: "mur", type: "fricción", strength: 80, topics: ["Trasvase Tajo-Segura", "Agua", "Regadío"], recentEvents: ["Disputa caudales mínimos", "Recurso ante TC"], trend: "fortaleciendo" },
  { id: "af-18", entityA: "gal", entityB: "pp", type: "alianza", strength: 88, topics: ["Coordinación CCAA PP", "Pesca", "Despoblación"], recentEvents: ["Frente común agua", "Coordinación PGE"], trend: "estable" },
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
  { id: "c-9", entityId: "vox", title: "Defensa de la España rural", said: "VOX defiende el campo español y a los agricultores frente a Bruselas (2023)", did: "Abandono de gobiernos autonómicos donde gestionaban Consejerías de Agricultura", date: "2024-07-10", severity: "alta", source: "BOE / Declaraciones electorales" },
  { id: "c-10", entityId: "sumar", title: "Vivienda como prioridad absoluta", said: "No descansaremos hasta garantizar el derecho a la vivienda digna", did: "Votación favorable a PGE 2026 sin partida adicional de vivienda exigida", date: "2025-12-20", severity: "media", source: "Diario sesiones / Programa electoral" },
  { id: "c-11", entityId: "val", title: "Transparencia en gestión DANA", said: "Toda la información sobre la DANA será pública y accesible en tiempo real", did: "Retrasos de 3 meses en publicar informe de fallecidos y daños reales", date: "2025-02-15", severity: "alta", source: "Portal transparencia GVA / Medios" },
  { id: "c-12", entityId: "can", title: "Plan integral de migración", said: "Presentaremos un plan integral de gestión migratoria en 30 días (agosto 2025)", did: "Plan presentado 5 meses después con medidas parciales y sin dotación presupuestaria", date: "2026-01-20", severity: "media", source: "Ruedas de prensa / BOC" },
  { id: "c-13", entityId: "mur", title: "Protección del Mar Menor", said: "El Mar Menor es prioridad absoluta de este gobierno (toma posesión)", did: "Aprobación de excepciones de riego para 8.000 hectáreas en la cuenca del Mar Menor", date: "2025-09-15", severity: "alta", source: "BORM / Declaraciones institucionales" },
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
  { id: "p-11", entityId: "vox", description: "Pérdida de representación en próximas elecciones autonómicas", probability: 55, timeframe: "12-18 meses", basis: ["Caída encuestas", "Salida de gobiernos", "Fragmentación derecha"], impact: "alto", category: "electoral" },
  { id: "p-12", entityId: "sumar", description: "Crisis interna y posible refundación o fusión con Podemos", probability: 40, timeframe: "6-12 meses", basis: ["Baja representación", "Competencia con Podemos", "Desgaste coalición"], impact: "alto", category: "electoral" },
  { id: "p-13", entityId: "erc", description: "Cambio de estrategia hacia autonomismo pragmático abandonando independentismo a corto plazo", probability: 50, timeframe: "12-24 meses", basis: ["Cambio liderazgo", "Fatiga independentista", "Oportunidad gestión"], impact: "alto", category: "legislativo" },
  { id: "p-14", entityId: "val", description: "Solicitud de régimen fiscal especial post-DANA similar al canario", probability: 25, timeframe: "12-24 meses", basis: ["Precedente REF Canarias", "Daños DANA", "Presión empresarial"], impact: "alto", category: "presupuestario" },
  { id: "p-15", entityId: "can", description: "Declaración de emergencia migratoria y solicitud de intervención UE", probability: 70, timeframe: "3-6 meses", basis: ["Saturación centros", "Precedente Lampedusa", "Presión insular"], impact: "alto", category: "social" },
  { id: "p-16", entityId: "min-def", description: "España alcanza el 2% PIB en gasto de defensa antes de 2029", probability: 35, timeframe: "24+ meses", basis: ["Compromiso OTAN", "Presión aliados", "Inercia presupuestaria"], impact: "alto", category: "presupuestario" },
  { id: "p-17", entityId: "gal", description: "Plan de choque demográfico con incentivos fiscales y laborales", probability: 65, timeframe: "6-12 meses", basis: ["Envejecimiento acelerado", "Presión social", "Experiencias europeas"], impact: "medio", category: "legislativo" },
];

const alerts: BehavioralAlert[] = [
  { id: "ba-1", entityId: "psoe", type: "cambio-narrativa", title: "Giro en discurso sobre inmigración", description: "Aumento del 40% en menciones a 'inmigración ordenada' y 'control de flujos' en las últimas 4 semanas", date: "2025-12-10", severity: "alto" },
  { id: "ba-2", entityId: "cat", type: "ruptura", title: "Distanciamiento de socio parlamentario", description: "ERC reduce un 60% sus votos favorables a propuestas de la Generalitat en el Parlament", date: "2025-12-08", severity: "critico" },
  { id: "ba-3", entityId: "pp", type: "nueva-alianza", title: "Acercamiento a partidos regionalistas", description: "Reuniones bilaterales con CC, PAR y UPN para construir bloque territorial alternativo", date: "2025-12-05", severity: "medio" },
  { id: "ba-4", entityId: "min-eco", type: "anomalía", title: "Revisión macroeconómica inusual", description: "Tercera revisión del cuadro macro en 6 meses, patrón sin precedentes desde 2012", date: "2025-12-01", severity: "alto" },
  { id: "ba-5", entityId: "mad", type: "contradicción", title: "Incremento de gasto en partida recortada", description: "Partida de gasto social aumentada un 12% tras declaraciones de austeridad necesaria", date: "2025-11-28", severity: "medio" },
  { id: "ba-6", entityId: "and", type: "cambio-narrativa", title: "Nuevo énfasis en política hídrica", description: "Triplicadas las menciones a sequía y gestión del agua en comunicados oficiales", date: "2025-11-25", severity: "bajo" },
  { id: "ba-7", entityId: "vox", type: "ruptura", title: "Disidencia interna sobre inmigración", description: "Tres diputados de VOX votan diferente al grupo en moción sobre menores migrantes", date: "2026-01-15", severity: "alto" },
  { id: "ba-8", entityId: "val", type: "anomalía", title: "Aceleración inusual de gasto post-DANA", description: "Ejecución del 85% del presupuesto de reconstrucción en 3 meses, patrón atípico", date: "2026-01-10", severity: "medio" },
  { id: "ba-9", entityId: "can", type: "cambio-narrativa", title: "Giro hacia el discurso de emergencia migratoria", description: "Presidente canario multiplica por 5 las apariciones mediáticas sobre migración", date: "2025-12-20", severity: "critico" },
  { id: "ba-10", entityId: "sumar", type: "ruptura", title: "Distanciamiento del PSOE en vivienda", description: "Sumar presenta proposición de ley propia de vivienda sin consensuar con PSOE", date: "2026-01-05", severity: "alto" },
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
