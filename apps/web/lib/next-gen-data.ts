/* ═══════════════════════════════════════════════════════════════════════════
   España Next Gen — Gamified civic education platform for youth.
   Turns Spain and the EU into an interactive civic videogame experience.
   Missions, budget negotiation, law building, crisis management.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Types ─────────────────────────────────────────────────────────────────

export type MissionDifficulty = "facil" | "media" | "dificil" | "experto";
export type MissionCategory = "presupuesto" | "legislacion" | "crisis" | "comparativa" | "europa" | "municipal" | "negociacion" | "medioambiente";
export type AchievementTier = "bronce" | "plata" | "oro" | "diamante";
export type ChallengeStatus = "disponible" | "en-progreso" | "completado" | "bloqueado";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  xpReward: number;
  estimatedMinutes: number;
  objectives: string[];
  unlockLevel: number;
  completionRate: number; // % users who completed
  tags: string[];
}

export interface Challenge {
  id: string;
  missionId: string;
  title: string;
  description: string;
  status: ChallengeStatus;
  steps: ChallengeStep[];
  rewards: { xp: number; badge?: string };
}

export interface ChallengeStep {
  order: number;
  instruction: string;
  type: "decision" | "input" | "quiz" | "negotiation" | "comparison";
  completed: boolean;
}

export interface TikTokFact {
  id: string;
  title: string;
  content: string;
  category: string;
  emoji: string;
  source: string;
  shareCount: number;
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  xpRequired: number;
  unlockedBy: string;
  rarity: number; // % of users who have it
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  achievements: number;
  streak: number;
  territory: string;
}

export interface CCAComparison {
  slug: string;
  name: string;
  population: number;
  gdpPerCapita: number;
  unemployment: number;
  educationSpend: number;
  healthSpend: number;
  happinessIndex: number;
}

export interface AIExplanation {
  id: string;
  topic: string;
  simpleExplanation: string;
  analogy: string;
  keyFact: string;
  difficulty: "basico" | "intermedio" | "avanzado";
}

export interface ProgressTracker {
  totalXP: number;
  level: number;
  nextLevelXP: number;
  missionsCompleted: number;
  totalMissions: number;
  streak: number;
  badges: string[];
  rank: string;
}

export interface ClassroomSession {
  id: string;
  title: string;
  teacher: string;
  students: number;
  activeMission: string;
  avgProgress: number;
  topScore: number;
}

export interface NextGenData {
  missions: Mission[];
  challenges: Challenge[];
  facts: TikTokFact[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  ccaaComparison: CCAComparison[];
  aiExplanations: AIExplanation[];
  classrooms: ClassroomSession[];
  progress: ProgressTracker;
  stats: {
    totalMissions: number;
    totalChallenges: number;
    totalFacts: number;
    activeUsers: number;
    avgLevel: number;
    classroomsActive: number;
  };
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const missions: Mission[] = [
  {
    id: "m-001", title: "Negocia los Presupuestos Generales", description: "Eres el Ministro de Hacienda. Distribuye 500.000M entre ministerios, CCAA y deuda. Contentar a todos es imposible: elige prioridades.",
    category: "presupuesto", difficulty: "dificil", xpReward: 500, estimatedMinutes: 25,
    objectives: ["Asignar presupuesto a 12 ministerios", "No superar el techo de gasto", "Cumplir compromiso UE de deficit <3%", "Lograr aprobación parlamentaria"],
    unlockLevel: 1, completionRate: 34, tags: ["presupuesto", "negociacion", "hacienda"],
  },
  {
    id: "m-002", title: "Construye tu primera ley", description: "Desde la proposicion de ley hasta el BOE. Redacta, negocia enmiendas, supera el Senado y publícala.",
    category: "legislacion", difficulty: "media", xpReward: 350, estimatedMinutes: 20,
    objectives: ["Redactar el texto articulado", "Superar comision parlamentaria", "Negociar enmiendas con 3 partidos", "Aprobacion en pleno"],
    unlockLevel: 2, completionRate: 52, tags: ["legislacion", "congreso", "proceso"],
  },
  {
    id: "m-003", title: "Crisis: DANA en Valencia", description: "Una DANA devastadora golpea Valencia. Gestiona la emergencia: recursos, comunicacion, fondos de ayuda y reconstruccion.",
    category: "crisis", difficulty: "experto", xpReward: 750, estimatedMinutes: 30,
    objectives: ["Activar protocolo de emergencia", "Coordinar con CCAA y Gobierno central", "Gestionar comunicacion publica", "Asignar fondos de reconstruccion"],
    unlockLevel: 5, completionRate: 18, tags: ["crisis", "emergencia", "coordinacion"],
  },
  {
    id: "m-004", title: "Compara las 17 CCAA", description: "Analiza que CCAA lidera en educacion, sanidad, empleo y bienestar. Descubre las desigualdades territoriales.",
    category: "comparativa", difficulty: "facil", xpReward: 200, estimatedMinutes: 10,
    objectives: ["Comparar 5 indicadores clave", "Identificar la CCAA con mejor sanidad", "Encontrar la mayor desigualdad", "Proponer una medida correctora"],
    unlockLevel: 1, completionRate: 71, tags: ["ccaa", "datos", "desigualdad"],
  },
  {
    id: "m-005", title: "Negociacion con la UE", description: "Espana necesita mas fondos NGEU. Negocia en Bruselas con 26 paises, la Comision y el Parlamento Europeo.",
    category: "europa", difficulty: "experto", xpReward: 800, estimatedMinutes: 35,
    objectives: ["Preparar posicion negociadora", "Formar alianzas con paises del sur", "Superar veto de paises frugales", "Lograr aprobacion del paquete"],
    unlockLevel: 8, completionRate: 12, tags: ["europa", "ngeu", "diplomacia"],
  },
  {
    id: "m-006", title: "Alcalde por un dia", description: "Gobierna un municipio de 50.000 habitantes. Presupuesto limitado, demandas infinitas, elecciones en 4 anos.",
    category: "municipal", difficulty: "facil", xpReward: 250, estimatedMinutes: 15,
    objectives: ["Aprobar presupuesto municipal", "Resolver 3 demandas ciudadanas", "Inaugurar una obra publica", "Mantener el indice de aprobacion >50%"],
    unlockLevel: 1, completionRate: 65, tags: ["municipal", "presupuesto", "gobierno-local"],
  },
  {
    id: "m-007", title: "Pacto de coalicion", description: "Ningun partido tiene mayoria. Negocia un pacto de coalicion con programas incompatibles y lineas rojas.",
    category: "negociacion", difficulty: "dificil", xpReward: 600, estimatedMinutes: 25,
    objectives: ["Identificar puntos en comun", "Ceder en 2 lineas rojas", "Lograr acuerdo programatico", "Presentar gobierno conjunto"],
    unlockLevel: 4, completionRate: 28, tags: ["coalicion", "negociacion", "partidos"],
  },
  {
    id: "m-008", title: "Plan clima 2030", description: "Disena el plan de transicion energetica de Espana. Equilibra empleo, industria, medio ambiente y coste social.",
    category: "medioambiente", difficulty: "dificil", xpReward: 550, estimatedMinutes: 25,
    objectives: ["Fijar mix energetico 2030", "Calcular empleos verdes creados vs destruidos", "Cumplir objetivos Paris", "Lograr consenso social"],
    unlockLevel: 3, completionRate: 31, tags: ["clima", "energia", "transicion"],
  },
];

const challenges: Challenge[] = [
  {
    id: "ch-001", missionId: "m-001", title: "Ronda 1: Techo de gasto", description: "Decide el techo de gasto total antes de repartir.",
    status: "disponible", rewards: { xp: 100, badge: "Economista novato" },
    steps: [
      { order: 1, instruction: "Analiza los ingresos previstos", type: "quiz", completed: false },
      { order: 2, instruction: "Decide el techo de gasto (% PIB)", type: "decision", completed: false },
      { order: 3, instruction: "Justifica ante el Congreso", type: "negotiation", completed: false },
    ],
  },
  {
    id: "ch-002", missionId: "m-001", title: "Ronda 2: Reparto ministerial", description: "Distribuye el presupuesto entre 12 ministerios.",
    status: "bloqueado", rewards: { xp: 150 },
    steps: [
      { order: 1, instruction: "Prioriza los ministerios clave", type: "decision", completed: false },
      { order: 2, instruction: "Asigna cantidades a cada partida", type: "input", completed: false },
      { order: 3, instruction: "Negocia recortes con ministerios insatisfechos", type: "negotiation", completed: false },
    ],
  },
  {
    id: "ch-003", missionId: "m-002", title: "Redaccion del texto", description: "Escribe los articulos principales de tu ley.",
    status: "disponible", rewards: { xp: 100, badge: "Legislador" },
    steps: [
      { order: 1, instruction: "Elige el ambito de la ley", type: "decision", completed: false },
      { order: 2, instruction: "Redacta 3 articulos clave", type: "input", completed: false },
    ],
  },
  {
    id: "ch-004", missionId: "m-003", title: "Primeras 24 horas", description: "Gestiona las primeras horas de la emergencia.",
    status: "disponible", rewards: { xp: 200, badge: "Gestor de crisis" },
    steps: [
      { order: 1, instruction: "Activa la UME", type: "decision", completed: false },
      { order: 2, instruction: "Coordina con delegacion del gobierno", type: "negotiation", completed: false },
      { order: 3, instruction: "Comunica a la poblacion", type: "decision", completed: false },
      { order: 4, instruction: "Solicita fondos de emergencia", type: "input", completed: false },
    ],
  },
  {
    id: "ch-005", missionId: "m-004", title: "Ranking de CCAA", description: "Ordena las CCAA por diferentes indicadores.",
    status: "disponible", rewards: { xp: 80 },
    steps: [
      { order: 1, instruction: "Compara PIB per capita", type: "comparison", completed: false },
      { order: 2, instruction: "Compara gasto educativo", type: "comparison", completed: false },
      { order: 3, instruction: "Identifica patrones", type: "quiz", completed: false },
    ],
  },
  {
    id: "ch-006", missionId: "m-006", title: "Presupuesto municipal", description: "Aprueba el presupuesto de tu ayuntamiento.",
    status: "disponible", rewards: { xp: 80, badge: "Alcalde novato" },
    steps: [
      { order: 1, instruction: "Revisa ingresos por IBI, tasas y transferencias", type: "quiz", completed: false },
      { order: 2, instruction: "Distribuye entre servicios publicos", type: "input", completed: false },
    ],
  },
];

const facts: TikTokFact[] = [
  { id: "f-001", title: "El Congreso tiene 350 escanos", content: "El Congreso de los Diputados tiene 350 escanos distribuidos por circunscripciones provinciales. Madrid tiene 37 y Soria solo 2.", category: "instituciones", emoji: "🏛️", source: "Constitucion Art. 68", shareCount: 12400, tags: ["congreso", "escanos"] },
  { id: "f-002", title: "Espana tiene 17 CCAA + 2 ciudades autonomas", content: "Cada CCAA tiene su propio parlamento, presidente y competencias. Ceuta y Melilla son ciudades autonomas con un Estatuto diferente.", category: "territorial", emoji: "🗺️", source: "Constitucion Art. 143", shareCount: 9800, tags: ["ccaa", "autonomias"] },
  { id: "f-003", title: "Los PGE: 500.000M anuales", content: "Los Presupuestos Generales del Estado mueven mas de 500.000 millones de euros al ano. La mayor partida es Seguridad Social (pensiones).", category: "presupuesto", emoji: "💰", source: "Ministerio Hacienda 2026", shareCount: 15200, tags: ["presupuesto", "pge"] },
  { id: "f-004", title: "El BOE: donde las leyes cobran vida", content: "El Boletin Oficial del Estado publica mas de 30.000 disposiciones al ano. Una ley no existe hasta que se publica en el BOE.", category: "legislacion", emoji: "📜", source: "Agencia Estatal BOE", shareCount: 7300, tags: ["boe", "leyes"] },
  { id: "f-005", title: "Espana en la UE: voto ponderado", content: "Espana tiene 59 escanos en el Parlamento Europeo (de 720). Es el 4o pais con mas representacion, tras Alemania, Francia e Italia.", category: "europa", emoji: "🇪🇺", source: "Parlamento Europeo", shareCount: 8900, tags: ["europa", "parlamento"] },
  { id: "f-006", title: "El deficit: la regla del 3%", content: "La UE establece que ningun pais puede tener un deficit publico superior al 3% del PIB. Espana lo supero durante la crisis (hasta 11% en 2009).", category: "economia", emoji: "📉", source: "Pacto Estabilidad y Crecimiento", shareCount: 6400, tags: ["deficit", "ue", "economia"] },
  { id: "f-007", title: "Mocion de censura constructiva", content: "En Espana, para echar al presidente necesitas una mocion de censura constructiva: debes proponer un candidato alternativo. Solo se ha aprobado una vez (2018, Sanchez a Rajoy).", category: "instituciones", emoji: "⚡", source: "Constitucion Art. 113", shareCount: 18500, tags: ["mocion", "gobierno"] },
  { id: "f-008", title: "Rey reina pero no gobierna", content: "El Rey es Jefe del Estado pero no tiene poder ejecutivo. Su funcion es arbitral y representativa. No puede aprobar leyes ni gobernar.", category: "instituciones", emoji: "👑", source: "Constitucion Titulo II", shareCount: 14200, tags: ["corona", "monarquia"] },
  { id: "f-009", title: "Impuestos: la mitad de tu sueldo", content: "La presion fiscal en Espana es del 38% del PIB, por debajo de la media UE (41%). El IRPF puede llegar al 47% para rentas altas.", category: "economia", emoji: "🧾", source: "AEAT / Eurostat", shareCount: 11000, tags: ["impuestos", "irpf", "fiscal"] },
  { id: "f-010", title: "Los fondos NGEU: 163.000M", content: "Espana recibe 163.000 millones de los fondos Next Generation EU para digitalizar, descarbonizar y modernizar la economia. Es el 2o mayor receptor.", category: "europa", emoji: "💶", source: "Plan de Recuperacion", shareCount: 13600, tags: ["ngeu", "fondos", "europa"] },
];

const achievements: Achievement[] = [
  { id: "a-001", title: "Primer voto", description: "Completa tu primera mision", tier: "bronce", icon: "🗳️", xpRequired: 0, unlockedBy: "Completar cualquier mision", rarity: 85 },
  { id: "a-002", title: "Economista novato", description: "Aprueba un presupuesto sin deficit excesivo", tier: "bronce", icon: "📊", xpRequired: 100, unlockedBy: "ch-001", rarity: 60 },
  { id: "a-003", title: "Legislador", description: "Crea y aprueba tu primera ley", tier: "plata", icon: "📜", xpRequired: 350, unlockedBy: "m-002", rarity: 45 },
  { id: "a-004", title: "Gestor de crisis", description: "Supera una emergencia nacional", tier: "oro", icon: "🚨", xpRequired: 750, unlockedBy: "m-003", rarity: 15 },
  { id: "a-005", title: "Diplomatico europeo", description: "Negocia con exito en Bruselas", tier: "diamante", icon: "🌍", xpRequired: 1500, unlockedBy: "m-005", rarity: 8 },
  { id: "a-006", title: "Alcalde popular", description: "Mantiene aprobacion >70% como alcalde", tier: "plata", icon: "🏘️", xpRequired: 250, unlockedBy: "m-006", rarity: 38 },
  { id: "a-007", title: "Racha de 7 dias", description: "Juega 7 dias consecutivos", tier: "bronce", icon: "🔥", xpRequired: 0, unlockedBy: "7-day-streak", rarity: 42 },
  { id: "a-008", title: "Maestro constitucional", description: "Responde 50 preguntas de la Constitucion", tier: "oro", icon: "📕", xpRequired: 1000, unlockedBy: "50-quiz-constitutional", rarity: 12 },
  { id: "a-009", title: "Negociador nato", description: "Cierra 5 pactos con exito", tier: "oro", icon: "🤝", xpRequired: 1200, unlockedBy: "5-negotiations-won", rarity: 20 },
  { id: "a-010", title: "Ciudadano informado", description: "Lee las 10 fichas TikTok", tier: "bronce", icon: "📱", xpRequired: 50, unlockedBy: "read-all-facts", rarity: 55 },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "PoliticaPro_23", xp: 8420, level: 15, achievements: 18, streak: 45, territory: "Madrid" },
  { rank: 2, username: "CivicNerd", xp: 7850, level: 14, achievements: 16, streak: 32, territory: "Barcelona" },
  { rank: 3, username: "EuropaFan", xp: 7200, level: 13, achievements: 15, streak: 28, territory: "Valencia" },
  { rank: 4, username: "LeyBuilder", xp: 6900, level: 12, achievements: 14, streak: 21, territory: "Sevilla" },
  { rank: 5, username: "Presupuestista", xp: 6350, level: 11, achievements: 12, streak: 19, territory: "Bilbao" },
  { rank: 6, username: "AlcaldeDigital", xp: 5800, level: 10, achievements: 11, streak: 15, territory: "Zaragoza" },
  { rank: 7, username: "CrisisManager", xp: 5400, level: 10, achievements: 10, streak: 12, territory: "Malaga" },
  { rank: 8, username: "ConstitFan", xp: 4900, level: 9, achievements: 9, streak: 10, territory: "A Coruna" },
  { rank: 9, username: "VerdePlaneta", xp: 4500, level: 8, achievements: 8, streak: 8, territory: "Murcia" },
  { rank: 10, username: "DemocraciaYa", xp: 4100, level: 8, achievements: 7, streak: 6, territory: "Valladolid" },
];

const ccaaComparison: CCAComparison[] = [
  { slug: "madrid", name: "Madrid", population: 6800000, gdpPerCapita: 38500, unemployment: 9.2, educationSpend: 4800, healthSpend: 1650, happinessIndex: 7.2 },
  { slug: "cataluna", name: "Cataluna", population: 7800000, gdpPerCapita: 33200, unemployment: 10.1, educationSpend: 4500, healthSpend: 1580, happinessIndex: 7.0 },
  { slug: "andalucia", name: "Andalucia", population: 8500000, gdpPerCapita: 20100, unemployment: 21.4, educationSpend: 3200, healthSpend: 1320, happinessIndex: 6.5 },
  { slug: "pais-vasco", name: "Pais Vasco", population: 2200000, gdpPerCapita: 36800, unemployment: 8.5, educationSpend: 5200, healthSpend: 1780, happinessIndex: 7.4 },
  { slug: "valencia", name: "C. Valenciana", population: 5200000, gdpPerCapita: 23400, unemployment: 14.3, educationSpend: 3600, healthSpend: 1400, happinessIndex: 6.8 },
  { slug: "galicia", name: "Galicia", population: 2700000, gdpPerCapita: 24100, unemployment: 11.8, educationSpend: 3800, healthSpend: 1450, happinessIndex: 6.9 },
  { slug: "navarra", name: "Navarra", population: 660000, gdpPerCapita: 34500, unemployment: 9.0, educationSpend: 5100, healthSpend: 1720, happinessIndex: 7.3 },
  { slug: "extremadura", name: "Extremadura", population: 1060000, gdpPerCapita: 18200, unemployment: 22.1, educationSpend: 3000, healthSpend: 1280, happinessIndex: 6.3 },
];

const aiExplanations: AIExplanation[] = [
  { id: "ai-001", topic: "Que son los Presupuestos Generales del Estado", simpleExplanation: "Imagina que Espana es una casa. Los PGE son el plan de cuanto dinero entra (impuestos) y en que se gasta (sanidad, educacion, pensiones). Se decide cada ano.", analogy: "Es como tu presupuesto mensual, pero a escala de 48 millones de personas.", keyFact: "La mayor partida es pensiones: 190.000M anuales.", difficulty: "basico" },
  { id: "ai-002", topic: "Como se aprueba una ley", simpleExplanation: "Una ley nace como propuesta, se debate en comision, se vota en el Congreso, pasa al Senado, y se publica en el BOE. Si hay cambios, vuelve al Congreso.", analogy: "Es como un trabajo de grupo donde todos deben revisar, enmendar y aprobar antes de entregarlo.", keyFact: "El Congreso puede aprobar una ley en 2 meses o tardar mas de 2 anos.", difficulty: "basico" },
  { id: "ai-003", topic: "Que es la UE y como afecta a Espana", simpleExplanation: "La Union Europea es un club de 27 paises que comparten reglas, moneda (euro) y toman decisiones juntos sobre comercio, medio ambiente, seguridad y economia.", analogy: "Es como una comunidad de vecinos: cada piso (pais) es independiente pero hay reglas comunes para el edificio.", keyFact: "El 60% de la legislacion que afecta a tu dia a dia viene de la UE.", difficulty: "intermedio" },
  { id: "ai-004", topic: "Que es una mocion de censura", simpleExplanation: "Es el mecanismo para echar al presidente del gobierno sin esperar a elecciones. Necesitas mayoria absoluta (176 votos) y proponer un candidato alternativo.", analogy: "Es como un golpe de estado democratico: legal, con reglas, y con alternativa.", keyFact: "Solo ha triunfado una vez: 2018, Sanchez sustituyo a Rajoy.", difficulty: "intermedio" },
  { id: "ai-005", topic: "Que son los fondos NGEU", simpleExplanation: "Despues del COVID, la UE creo un fondo de 800.000M para recuperar la economia. Espana recibe 163.000M en subvenciones y prestamos para digitalizar y descarbonizar.", analogy: "Es como si tu comunidad de vecinos pidiera un prestamo colectivo para renovar todo el edificio.", keyFact: "Espana es el 2o mayor receptor tras Italia.", difficulty: "avanzado" },
];

const classrooms: ClassroomSession[] = [
  { id: "cl-001", title: "4o ESO - IES Cervantes (Madrid)", teacher: "Prof. Garcia", students: 28, activeMission: "m-004", avgProgress: 65, topScore: 420 },
  { id: "cl-002", title: "1o Bach - Col. Montserrat (Barcelona)", teacher: "Prof. Vila", students: 32, activeMission: "m-001", avgProgress: 42, topScore: 380 },
  { id: "cl-003", title: "3o ESO - IES Guadalquivir (Sevilla)", teacher: "Prof. Romero", students: 25, activeMission: "m-006", avgProgress: 78, topScore: 290 },
];

const progress: ProgressTracker = {
  totalXP: 1250, level: 5, nextLevelXP: 1500, missionsCompleted: 3, totalMissions: missions.length,
  streak: 7, badges: ["Primer voto", "Economista novato", "Racha de 7 dias"], rank: "Ciudadano activo",
};

// ── Builder ───────────────────────────────────────────────────────────────

export function buildNextGenData(): NextGenData {
  return {
    missions,
    challenges,
    facts,
    achievements,
    leaderboard,
    ccaaComparison,
    aiExplanations,
    classrooms,
    progress,
    stats: {
      totalMissions: missions.length,
      totalChallenges: challenges.length,
      totalFacts: facts.length,
      activeUsers: 14320,
      avgLevel: 6,
      classroomsActive: classrooms.length,
    },
  };
}
