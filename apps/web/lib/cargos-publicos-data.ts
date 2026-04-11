/* ═══════════════════════════════════════════════════════════════════════════
   Cargos Publicos — Tracking and monitoring public officials across all
   levels of Spanish government.
   Seed date: 2026-04-10
   ═══════════════════════════════════════════════════════════════════════════ */

import { congressGroups, senateGroups } from "./parliamentary-data";
import { ministries } from "./ministerios-data";
import { parties } from "@espanaia/seed-data";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type CargoLevel =
  | "gobierno"
  | "congreso"
  | "senado"
  | "ccaa"
  | "ayuntamiento"
  | "europa"
  | "organismo";

export interface CareerStep {
  year: number;
  role: string;
  institution: string;
}

export interface RevolvingDoorEntry {
  company: string;
  role: string;
  year: number;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  specialization?: string;
}

export interface PatrimonyDeclaration {
  realEstate: number;
  savings: number;
  otherAssets: number;
  lastDeclaration: string;
}

export interface SocialMediaProfile {
  platform: string;
  handle: string;
  followers: number;
}

export interface LegislativeActivity {
  billsProposed: number;
  interventions: number;
  votingAttendance: number;
}

export interface CargoPublico {
  id: string;
  name: string;
  slug: string;
  currentRole: string;
  institution: string;
  level: CargoLevel;
  party?: string;
  partySlug?: string;
  territory?: string;
  since: string;
  previousRoles: { role: string; institution: string; from: string; to: string }[];
  activity: {
    id: string;
    date: string;
    type:
      | "intervencion"
      | "votacion"
      | "nombramiento"
      | "cese"
      | "comparecencia"
      | "declaracion"
      | "viaje"
      | "reunion";
    title: string;
    summary: string;
  }[];
  declarations?: {
    hasAssetDeclaration: boolean;
    lastUpdated?: string;
  };
  connections: {
    targetId: string;
    type: "partido" | "coalicion" | "comision" | "gobierno" | "oposicion";
    label: string;
  }[];
  tags: string[];

  // ── Competitive differentiator fields ──
  gender: "M" | "F";
  birthYear?: number;
  education?: EducationEntry;
  careerTimeline?: CareerStep[];
  revolvingDoor?: RevolvingDoorEntry[];
  influenceScore: number;
  mediaExposure: number;
  appointmentType: "eleccion" | "nombramiento" | "carrera";
  deputy?: string;
  homeCCAA?: string;
  conflictFlags?: string[];
  patrimony?: PatrimonyDeclaration;
  socialMedia?: SocialMediaProfile[];
  internationalRoles?: string[];
  legislativeActivity?: LegislativeActivity;
}

export interface CargoChange {
  id: string;
  date: string;
  personName: string;
  personSlug: string;
  type: "nombramiento" | "cese" | "dimision" | "remodelacion" | "eleccion";
  fromRole?: string;
  toRole?: string;
  institution: string;
  level: CargoLevel;
  description: string;
}

export interface GenderStats {
  total: number;
  women: number;
  men: number;
  pctWomen: number;
  byLevel: Record<CargoLevel, { total: number; women: number; pctWomen: number }>;
  byParty: { party: string; total: number; women: number; pctWomen: number }[];
}

export interface TenureStats {
  avgYears: number;
  byLevel: Record<CargoLevel, number>;
  longest: { name: string; years: number; role: string }[];
  shortest: { name: string; years: number; role: string }[];
}

export interface AgeStats {
  avgAge: number;
  byLevel: Record<CargoLevel, number>;
  under40: number;
  age40to55: number;
  age55to65: number;
  over65: number;
}

export interface PowerConcentration {
  party: string;
  herfindahl: number;
  topThreeSharePct: number;
  topThree: { name: string; influenceScore: number }[];
}

export interface ComparativeStats {
  spain: { govSize: number; avgTurnoverMonths: number; womenPct: number; avgAge: number };
  euAvg: { govSize: number; avgTurnoverMonths: number; womenPct: number; avgAge: number };
}

export interface HistoricalGovernment {
  period: string;
  president: string;
  party: string;
  ministers: number;
  womenPct: number;
  formation: string;
}

export interface WeeklyAlert {
  type: "nombramiento" | "cese" | "dimision" | "remodelacion" | "eleccion" | "conflicto" | "media";
  date: string;
  summary: string;
}

export interface PartyBreakdown {
  party: string;
  slug: string;
  color: string;
  counts: Record<CargoLevel, number>;
  total: number;
  keyFigures: string[];
  powerIndex: number;
}

export interface ConnectionGroup {
  label: string;
  description: string;
  members: { name: string; role: string; party: string; partyColor: string }[];
}

export interface CargosData {
  officials: CargoPublico[];
  recentChanges: CargoChange[];
  stats: {
    totalTracked: number;
    byLevel: Record<CargoLevel, number>;
    byParty: { party: string; count: number }[];
    recentChangesCount: number;
    avgTenureYears: number;
  };
  parties: PartyBreakdown[];
  connectionGroups: ConnectionGroup[];
  genderStats: GenderStats;
  tenureStats: TenureStats;
  ageStats: AgeStats;
  powerConcentration: PowerConcentration[];
  comparativeStats: ComparativeStats;
  historicalGovernments: HistoricalGovernment[];
  weeklyAlerts: WeeklyAlert[];
  geographicDiversity: { ccaa: string; count: number; officials: string[] }[];
  revolvingDoorCount: number;
  educationBreakdown: { degree: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Helpers (internal)
// ---------------------------------------------------------------------------

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Officials data
// ---------------------------------------------------------------------------

const officials: CargoPublico[] = [
  /* ════════════════════════════════════════════════════════════════════════
     GOBIERNO — Presidente + 22 Ministers
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-pedro-sanchez",
    name: "Pedro Sanchez Perez-Castejon",
    slug: "pedro-sanchez",
    currentRole: "Presidente del Gobierno",
    institution: "Gobierno de Espana",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2018-06-02",
    previousRoles: [
      { role: "Secretario General del PSOE", institution: "PSOE", from: "2014-07-26", to: "2016-10-01" },
      { role: "Diputado por Madrid", institution: "Congreso", from: "2009-04-01", to: "2018-06-01" },
    ],
    activity: [
      { id: "ps-a1", date: "2026-04-07", type: "reunion", title: "Consejo de Ministros extraordinario", summary: "Aprobacion del plan de respuesta ante la crisis energetica." },
      { id: "ps-a2", date: "2026-03-28", type: "viaje", title: "Cumbre UE en Bruselas", summary: "Participacion en el Consejo Europeo sobre competitividad industrial." },
      { id: "ps-a3", date: "2026-03-15", type: "declaracion", title: "Declaracion institucional sobre vivienda", summary: "Anuncio de medidas urgentes contra la especulacion inmobiliaria." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-07-01" },
    connections: [
      { targetId: "cp-maria-jesus-montero", type: "gobierno", label: "Vicepresidenta Primera" },
      { targetId: "cp-yolanda-diaz", type: "coalicion", label: "Socia de coalicion" },
    ],
    tags: ["presidente", "psoe", "gobierno", "moncloa"],
    gender: "M",
    birthYear: 1972,
    education: { degree: "Doctor en Economia", institution: "Universidad Camilo Jose Cela", specialization: "Economia Politica" },
    careerTimeline: [
      { year: 2004, role: "Concejal de Madrid", institution: "Ayuntamiento de Madrid" },
      { year: 2009, role: "Diputado por Madrid", institution: "Congreso" },
      { year: 2014, role: "Secretario General del PSOE", institution: "PSOE" },
      { year: 2018, role: "Presidente del Gobierno", institution: "Gobierno de Espana" },
    ],
    influenceScore: 98,
    mediaExposure: 97,
    appointmentType: "eleccion",
    deputy: "Maria Jesus Montero",
    homeCCAA: "Madrid",
    socialMedia: [{ platform: "X", handle: "@saborido", followers: 1420000 }, { platform: "Instagram", handle: "@pelotas_pedro", followers: 890000 }],
    internationalRoles: ["Miembro del Consejo Europeo", "Presidente de turno del Consejo de la UE (2023-H2)"],
    patrimony: { realEstate: 320000, savings: 185000, otherAssets: 42000, lastDeclaration: "2025-07-01" },
    conflictFlags: [],
  },
  {
    id: "cp-felix-bolanos",
    name: "Felix Bolanos Garcia",
    slug: "felix-bolanos",
    currentRole: "Ministro de la Presidencia, Justicia y Relaciones con las Cortes",
    institution: "Ministerio de la Presidencia",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Ministro de la Presidencia", institution: "Gobierno de Espana", from: "2021-07-12", to: "2023-11-20" },
    ],
    activity: [
      { id: "fb-a1", date: "2026-04-08", type: "comparecencia", title: "Comparecencia ante Comision de Justicia", summary: "Informo sobre la digitalizacion del sistema judicial." },
      { id: "fb-a2", date: "2026-03-22", type: "reunion", title: "Reunion bilateral con CCAA", summary: "Coordinacion de transferencias competenciales pendientes." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
      { targetId: "cp-maria-jesus-montero", type: "partido", label: "PSOE" },
    ],
    tags: ["ministro", "justicia", "presidencia", "psoe"],
    gender: "M",
    birthYear: 1976,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Sevilla", specialization: "Derecho Constitucional" },
    careerTimeline: [
      { year: 2004, role: "Abogado del Estado", institution: "Abogacia del Estado" },
      { year: 2018, role: "Secretario General de la Presidencia", institution: "Gobierno de Espana" },
      { year: 2021, role: "Ministro de la Presidencia", institution: "Gobierno de Espana" },
      { year: 2023, role: "Ministro de la Presidencia, Justicia y Relaciones con las Cortes", institution: "Gobierno de Espana" },
    ],
    influenceScore: 82,
    mediaExposure: 71,
    appointmentType: "nombramiento",
    homeCCAA: "Andalucia",
    socialMedia: [{ platform: "X", handle: "@faborasg", followers: 98000 }],
    patrimony: { realEstate: 280000, savings: 120000, otherAssets: 35000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-maria-jesus-montero",
    name: "Maria Jesus Montero",
    slug: "maria-jesus-montero",
    currentRole: "Ministra de Hacienda y Vicepresidenta Primera",
    institution: "Ministerio de Hacienda",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Ministra de Hacienda", institution: "Gobierno de Espana", from: "2018-06-07", to: "2023-11-20" },
      { role: "Consejera de Salud", institution: "Junta de Andalucia", from: "2004-04-01", to: "2018-06-01" },
    ],
    activity: [
      { id: "mjm-a1", date: "2026-04-05", type: "comparecencia", title: "Presentacion PGE 2027", summary: "Inicio de la tramitacion de los Presupuestos Generales del Estado." },
      { id: "mjm-a2", date: "2026-03-20", type: "declaracion", title: "Reforma de financiacion autonomica", summary: "Propuesta de nuevo modelo de financiacion para las CCAA." },
      { id: "mjm-a3", date: "2026-03-10", type: "reunion", title: "ECOFIN", summary: "Participacion en la reunion de ministros de Economia de la UE." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-07-01" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
      { targetId: "cp-carlos-cuerpo", type: "gobierno", label: "Ministro Economia" },
    ],
    tags: ["ministra", "hacienda", "vicepresidenta", "psoe", "presupuestos"],
    gender: "F",
    birthYear: 1966,
    education: { degree: "Licenciada en Medicina", institution: "Universidad de Sevilla", specialization: "Gestion Publica" },
    careerTimeline: [
      { year: 2002, role: "Directora General de Salud Publica", institution: "Junta de Andalucia" },
      { year: 2004, role: "Consejera de Salud", institution: "Junta de Andalucia" },
      { year: 2018, role: "Ministra de Hacienda", institution: "Gobierno de Espana" },
      { year: 2023, role: "Vicepresidenta Primera y Ministra de Hacienda", institution: "Gobierno de Espana" },
    ],
    influenceScore: 91,
    mediaExposure: 82,
    appointmentType: "nombramiento",
    deputy: "Carlos Cuerpo",
    homeCCAA: "Andalucia",
    socialMedia: [{ platform: "X", handle: "@mjaboreso", followers: 215000 }],
    patrimony: { realEstate: 450000, savings: 210000, otherAssets: 55000, lastDeclaration: "2025-07-01" },
  },
  {
    id: "cp-margarita-robles",
    name: "Margarita Robles",
    slug: "margarita-robles",
    currentRole: "Ministra de Defensa",
    institution: "Ministerio de Defensa",
    level: "gobierno",
    party: "Independiente",
    since: "2018-06-07",
    previousRoles: [
      { role: "Secretaria de Estado de Interior", institution: "Gobierno de Espana", from: "1994-01-01", to: "1996-05-01" },
    ],
    activity: [
      { id: "mr-a1", date: "2026-04-02", type: "viaje", title: "Visita a tropas espanolas en Letonia", summary: "Inspeccion del contingente espanol en la OTAN." },
      { id: "mr-a2", date: "2026-03-18", type: "comparecencia", title: "Comision de Defensa", summary: "Presentacion del plan de modernizacion de las FFAA." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "defensa", "independiente", "ffaa"],
    gender: "F",
    birthYear: 1956,
    education: { degree: "Licenciada en Derecho", institution: "Universidad Complutense de Madrid", specialization: "Derecho Penal" },
    careerTimeline: [
      { year: 1982, role: "Jueza", institution: "Poder Judicial" },
      { year: 1994, role: "Secretaria de Estado de Interior", institution: "Gobierno de Espana" },
      { year: 2006, role: "Magistrada del Tribunal Supremo", institution: "Tribunal Supremo" },
      { year: 2018, role: "Ministra de Defensa", institution: "Gobierno de Espana" },
    ],
    influenceScore: 78,
    mediaExposure: 68,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    internationalRoles: ["Representante en reuniones ministeriales OTAN"],
    patrimony: { realEstate: 520000, savings: 340000, otherAssets: 90000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-jose-manuel-albares",
    name: "Jose Manuel Albares",
    slug: "jose-manuel-albares",
    currentRole: "Ministro de Asuntos Exteriores",
    institution: "Ministerio de Asuntos Exteriores",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2021-07-12",
    previousRoles: [
      { role: "Secretario de Estado de Asuntos Exteriores", institution: "MAEC", from: "2020-01-13", to: "2021-07-11" },
    ],
    activity: [
      { id: "jma-a1", date: "2026-04-06", type: "viaje", title: "Visita a Marruecos", summary: "Reunion bilateral con ministro de exteriores marroqui." },
      { id: "jma-a2", date: "2026-03-25", type: "declaracion", title: "Posicion sobre conflicto Oriente Proximo", summary: "Declaracion sobre la situacion humanitaria en Gaza." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "exteriores", "psoe", "diplomacia"],
    gender: "M",
    birthYear: 1972,
    education: { degree: "Licenciado en Derecho", institution: "Universidad Autonoma de Madrid", specialization: "Relaciones Internacionales" },
    careerTimeline: [
      { year: 2000, role: "Diplomatico", institution: "MAEC" },
      { year: 2011, role: "Embajador ante la UE", institution: "Representacion Permanente ante la UE" },
      { year: 2020, role: "Secretario de Estado de Asuntos Exteriores", institution: "MAEC" },
      { year: 2021, role: "Ministro de Asuntos Exteriores", institution: "Gobierno de Espana" },
    ],
    influenceScore: 72,
    mediaExposure: 63,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    internationalRoles: ["Representante en el Consejo de Asuntos Exteriores de la UE"],
    socialMedia: [{ platform: "X", handle: "@jmaboreso", followers: 78000 }],
    patrimony: { realEstate: 310000, savings: 150000, otherAssets: 28000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-fernando-grande-marlaska",
    name: "Fernando Grande-Marlaska",
    slug: "fernando-grande-marlaska",
    currentRole: "Ministro del Interior",
    institution: "Ministerio del Interior",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2018-06-07",
    previousRoles: [
      { role: "Juez de la Audiencia Nacional", institution: "Audiencia Nacional", from: "2004-01-01", to: "2018-06-06" },
    ],
    activity: [
      { id: "fgm-a1", date: "2026-04-03", type: "comparecencia", title: "Comision de Interior", summary: "Balance de seguridad publica del primer trimestre 2026." },
      { id: "fgm-a2", date: "2026-03-28", type: "reunion", title: "Reunion JAI en Bruselas", summary: "Consejo de ministros de Justicia e Interior de la UE." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "interior", "psoe", "seguridad"],
    gender: "M",
    birthYear: 1962,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Deusto", specialization: "Derecho Penal" },
    careerTimeline: [
      { year: 1988, role: "Juez de Instruccion", institution: "Poder Judicial" },
      { year: 2004, role: "Juez de la Audiencia Nacional", institution: "Audiencia Nacional" },
      { year: 2018, role: "Ministro del Interior", institution: "Gobierno de Espana" },
    ],
    influenceScore: 74,
    mediaExposure: 66,
    appointmentType: "nombramiento",
    homeCCAA: "Pais Vasco",
    patrimony: { realEstate: 390000, savings: 180000, otherAssets: 45000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-oscar-puente",
    name: "Oscar Puente",
    slug: "oscar-puente",
    currentRole: "Ministro de Transportes y Movilidad Sostenible",
    institution: "Ministerio de Transportes",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Alcalde de Valladolid", institution: "Ayuntamiento de Valladolid", from: "2015-06-13", to: "2023-11-20" },
    ],
    activity: [
      { id: "op-a1", date: "2026-04-01", type: "declaracion", title: "Plan Cercanias 2030", summary: "Presentacion de inversiones en cercanias ferroviarias." },
      { id: "op-a2", date: "2026-03-15", type: "comparecencia", title: "Comision de Transportes", summary: "Estado de las obras del Corredor Mediterraneo." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "transportes", "psoe", "infraestructuras"],
    gender: "M",
    birthYear: 1975,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Valladolid" },
    careerTimeline: [
      { year: 2003, role: "Concejal", institution: "Ayuntamiento de Valladolid" },
      { year: 2015, role: "Alcalde de Valladolid", institution: "Ayuntamiento de Valladolid" },
      { year: 2023, role: "Ministro de Transportes", institution: "Gobierno de Espana" },
    ],
    influenceScore: 62,
    mediaExposure: 74,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla y Leon",
    socialMedia: [{ platform: "X", handle: "@oscar_puente_", followers: 320000 }],
    patrimony: { realEstate: 245000, savings: 95000, otherAssets: 18000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-oscar-lopez",
    name: "Oscar Lopez Agueda",
    slug: "oscar-lopez-agueda",
    currentRole: "Ministro de Transformacion Digital",
    institution: "Ministerio de Transformacion Digital",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2024-11-28",
    previousRoles: [
      { role: "Presidente de Paradores", institution: "Paradores de Turismo", from: "2022-01-01", to: "2024-11-27" },
    ],
    activity: [
      { id: "ol-a1", date: "2026-04-04", type: "declaracion", title: "Estrategia Nacional de IA", summary: "Presentacion de la actualizacion del plan de inteligencia artificial." },
      { id: "ol-a2", date: "2026-03-20", type: "reunion", title: "Cumbre Digital UE", summary: "Participacion en la cumbre sobre soberania digital europea." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "digital", "psoe", "ia"],
    gender: "M",
    birthYear: 1977,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Salamanca" },
    careerTimeline: [
      { year: 2008, role: "Secretario de Organizacion PSOE", institution: "PSOE" },
      { year: 2022, role: "Presidente de Paradores", institution: "Paradores de Turismo" },
      { year: 2024, role: "Ministro de Transformacion Digital", institution: "Gobierno de Espana" },
    ],
    revolvingDoor: [{ company: "Paradores de Turismo (empresa publica)", role: "Presidente", year: 2022 }],
    influenceScore: 58,
    mediaExposure: 55,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla y Leon",
    patrimony: { realEstate: 210000, savings: 88000, otherAssets: 12000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-pilar-alegria",
    name: "Pilar Alegria",
    slug: "pilar-alegria",
    currentRole: "Ministra de Educacion, Formacion Profesional y Deportes",
    institution: "Ministerio de Educacion",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2021-07-12",
    previousRoles: [
      { role: "Delegada del Gobierno en Aragon", institution: "Gobierno de Espana", from: "2018-06-07", to: "2021-07-11" },
    ],
    activity: [
      { id: "pa-a1", date: "2026-04-02", type: "comparecencia", title: "Evaluacion LOMLOE", summary: "Informe sobre la implantacion de la nueva ley educativa." },
      { id: "pa-a2", date: "2026-03-12", type: "declaracion", title: "Plan FP Dual 2026", summary: "Ampliacion del programa de formacion profesional dual." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "educacion", "psoe", "fp"],
    gender: "F",
    birthYear: 1977,
    education: { degree: "Licenciada en Filosofia y Letras", institution: "Universidad de Zaragoza", specialization: "Pedagogia" },
    careerTimeline: [
      { year: 2008, role: "Concejala de Zaragoza", institution: "Ayuntamiento de Zaragoza" },
      { year: 2018, role: "Delegada del Gobierno en Aragon", institution: "Gobierno de Espana" },
      { year: 2021, role: "Ministra de Educacion", institution: "Gobierno de Espana" },
    ],
    influenceScore: 56,
    mediaExposure: 52,
    appointmentType: "nombramiento",
    homeCCAA: "Aragon",
    patrimony: { realEstate: 195000, savings: 72000, otherAssets: 15000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-yolanda-diaz",
    name: "Yolanda Diaz",
    slug: "yolanda-diaz",
    currentRole: "Ministra de Trabajo y Vicepresidenta Segunda",
    institution: "Ministerio de Trabajo",
    level: "gobierno",
    party: "Sumar",
    partySlug: "sumar",
    since: "2020-01-13",
    previousRoles: [
      { role: "Diputada por Pontevedra", institution: "Congreso", from: "2016-06-26", to: "2020-01-12" },
    ],
    activity: [
      { id: "yd-a1", date: "2026-04-05", type: "declaracion", title: "Reduccion jornada laboral", summary: "Avance en la negociacion de la jornada de 37,5 horas." },
      { id: "yd-a2", date: "2026-03-28", type: "comparecencia", title: "Comision de Trabajo", summary: "Balance de la reforma laboral y empleo indefinido." },
      { id: "yd-a3", date: "2026-03-10", type: "reunion", title: "Dialogo social con sindicatos", summary: "Mesa de dialogo con CCOO y UGT sobre salario minimo." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-07-01" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "coalicion", label: "Socio de coalicion" },
      { targetId: "cp-pablo-bustinduy", type: "partido", label: "Sumar" },
    ],
    tags: ["ministra", "trabajo", "sumar", "vicepresidenta", "dialogo-social"],
    gender: "F",
    birthYear: 1971,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de A Coruna", specialization: "Derecho Laboral" },
    careerTimeline: [
      { year: 2012, role: "Diputada en el Parlamento de Galicia", institution: "Parlamento de Galicia" },
      { year: 2016, role: "Diputada por Pontevedra", institution: "Congreso" },
      { year: 2020, role: "Ministra de Trabajo", institution: "Gobierno de Espana" },
      { year: 2023, role: "Vicepresidenta Segunda y Ministra de Trabajo", institution: "Gobierno de Espana" },
    ],
    influenceScore: 88,
    mediaExposure: 85,
    appointmentType: "nombramiento",
    deputy: "Pablo Bustinduy",
    homeCCAA: "Galicia",
    socialMedia: [{ platform: "X", handle: "@Yolanda_Diaz_", followers: 720000 }, { platform: "Instagram", handle: "@yoaboradiaz", followers: 410000 }],
    patrimony: { realEstate: 275000, savings: 110000, otherAssets: 22000, lastDeclaration: "2025-07-01" },
    legislativeActivity: { billsProposed: 12, interventions: 89, votingAttendance: 94 },
  },
  {
    id: "cp-jordi-hereu",
    name: "Jordi Hereu",
    slug: "jordi-hereu",
    currentRole: "Ministro de Industria y Turismo",
    institution: "Ministerio de Industria y Turismo",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Alcalde de Barcelona", institution: "Ayuntamiento de Barcelona", from: "2006-09-01", to: "2011-06-11" },
    ],
    activity: [
      { id: "jh-a1", date: "2026-04-03", type: "declaracion", title: "PERTE Chip", summary: "Actualizacion del programa de semiconductores." },
      { id: "jh-a2", date: "2026-03-18", type: "viaje", title: "FITUR 2026", summary: "Inauguracion de la feria internacional de turismo." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "industria", "turismo", "psoe"],
    gender: "M",
    birthYear: 1965,
    education: { degree: "Licenciado en Ciencias Economicas", institution: "Universitat de Barcelona" },
    careerTimeline: [
      { year: 2003, role: "Concejal de Barcelona", institution: "Ayuntamiento de Barcelona" },
      { year: 2006, role: "Alcalde de Barcelona", institution: "Ayuntamiento de Barcelona" },
      { year: 2023, role: "Ministro de Industria y Turismo", institution: "Gobierno de Espana" },
    ],
    influenceScore: 55,
    mediaExposure: 48,
    appointmentType: "nombramiento",
    homeCCAA: "Cataluna",
    patrimony: { realEstate: 380000, savings: 160000, otherAssets: 40000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-luis-planas",
    name: "Luis Planas",
    slug: "luis-planas",
    currentRole: "Ministro de Agricultura, Pesca y Alimentacion",
    institution: "Ministerio de Agricultura",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2018-06-07",
    previousRoles: [
      { role: "Consejero de Agricultura", institution: "Junta de Andalucia", from: "2012-01-01", to: "2018-06-01" },
    ],
    activity: [
      { id: "lp-a1", date: "2026-03-30", type: "reunion", title: "Consejo de Agricultura UE", summary: "Negociacion de la reforma de la PAC." },
      { id: "lp-a2", date: "2026-03-15", type: "declaracion", title: "Plan de sequia 2026", summary: "Medidas de emergencia para el sector agrario ante la sequia." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministro", "agricultura", "psoe", "pac"],
    gender: "M",
    birthYear: 1952,
    education: { degree: "Ingeniero Agronomo", institution: "Universidad Politecnica de Madrid", specialization: "Politica Agraria" },
    careerTimeline: [
      { year: 1985, role: "Tecnico del MAPA", institution: "Ministerio de Agricultura" },
      { year: 2004, role: "Embajador ante la UE (Agricultura)", institution: "REPER" },
      { year: 2012, role: "Consejero de Agricultura", institution: "Junta de Andalucia" },
      { year: 2018, role: "Ministro de Agricultura", institution: "Gobierno de Espana" },
    ],
    influenceScore: 54,
    mediaExposure: 42,
    appointmentType: "nombramiento",
    homeCCAA: "Andalucia",
    internationalRoles: ["Representante en el Consejo de Agricultura de la UE"],
    patrimony: { realEstate: 620000, savings: 280000, otherAssets: 95000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-carlos-cuerpo",
    name: "Carlos Cuerpo",
    slug: "carlos-cuerpo",
    currentRole: "Ministro de Economia, Comercio y Empresa",
    institution: "Ministerio de Economia",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-12-01",
    previousRoles: [
      { role: "Secretario General del Tesoro", institution: "Ministerio de Economia", from: "2021-01-01", to: "2023-11-30" },
    ],
    activity: [
      { id: "cc-a1", date: "2026-04-06", type: "declaracion", title: "Previsiones macroeconomicas", summary: "Revision al alza del crecimiento del PIB para 2026." },
      { id: "cc-a2", date: "2026-03-22", type: "reunion", title: "Eurogrupo", summary: "Participacion en la reunion de ministros de economia de la eurozona." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
      { targetId: "cp-maria-jesus-montero", type: "gobierno", label: "Vicepresidenta Hacienda" },
    ],
    tags: ["ministro", "economia", "psoe", "tesoro"],
    gender: "M",
    birthYear: 1979,
    education: { degree: "Licenciado en Economia", institution: "Universidad Complutense de Madrid", specialization: "Macroeconomia" },
    careerTimeline: [
      { year: 2006, role: "Tecnico comercial del Estado", institution: "Ministerio de Economia" },
      { year: 2014, role: "Director General del Tesoro adjunto", institution: "Ministerio de Economia" },
      { year: 2021, role: "Secretario General del Tesoro", institution: "Ministerio de Economia" },
      { year: 2023, role: "Ministro de Economia", institution: "Gobierno de Espana" },
    ],
    influenceScore: 75,
    mediaExposure: 60,
    appointmentType: "carrera",
    homeCCAA: "Madrid",
    internationalRoles: ["Representante en el Eurogrupo", "Gobernador alterno del FMI"],
    patrimony: { realEstate: 290000, savings: 165000, otherAssets: 32000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-pablo-bustinduy",
    name: "Pablo Bustinduy",
    slug: "pablo-bustinduy",
    currentRole: "Ministro de Derechos Sociales, Consumo y Agenda 2030",
    institution: "Ministerio de Derechos Sociales",
    level: "gobierno",
    party: "Independiente",
    since: "2023-11-21",
    previousRoles: [],
    activity: [
      { id: "pb-a1", date: "2026-04-01", type: "declaracion", title: "Informe pobreza infantil", summary: "Presentacion del informe anual sobre pobreza infantil en Espana." },
      { id: "pb-a2", date: "2026-03-20", type: "comparecencia", title: "Comision de Derechos Sociales", summary: "Rendicion de cuentas de la Agenda 2030." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-yolanda-diaz", type: "coalicion", label: "Sumar" },
    ],
    tags: ["ministro", "derechos-sociales", "consumo"],
    gender: "M",
    birthYear: 1983,
    education: { degree: "Doctor en Ciencias Politicas", institution: "Universidad Complutense de Madrid", specialization: "Relaciones Internacionales" },
    careerTimeline: [
      { year: 2014, role: "Responsable de Internacional de Podemos", institution: "Podemos" },
      { year: 2023, role: "Ministro de Derechos Sociales", institution: "Gobierno de Espana" },
    ],
    influenceScore: 42,
    mediaExposure: 35,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    patrimony: { realEstate: 0, savings: 65000, otherAssets: 8000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-monica-garcia",
    name: "Monica Garcia",
    slug: "monica-garcia",
    currentRole: "Ministra de Sanidad",
    institution: "Ministerio de Sanidad",
    level: "gobierno",
    party: "Mas Madrid/Sumar",
    partySlug: "sumar",
    since: "2023-11-21",
    previousRoles: [
      { role: "Portavoz de Mas Madrid", institution: "Asamblea de Madrid", from: "2019-05-01", to: "2023-11-20" },
    ],
    activity: [
      { id: "mg-a1", date: "2026-04-04", type: "declaracion", title: "Plan Nacional de Salud Mental", summary: "Ampliacion del plan con 200M adicionales." },
      { id: "mg-a2", date: "2026-03-25", type: "comparecencia", title: "Consejo Interterritorial de Sanidad", summary: "Coordinacion con CCAA sobre listas de espera." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-yolanda-diaz", type: "coalicion", label: "Sumar" },
    ],
    tags: ["ministra", "sanidad", "sumar", "salud-mental"],
    gender: "F",
    birthYear: 1975,
    education: { degree: "Licenciada en Medicina", institution: "Universidad Autonoma de Madrid", specialization: "Medicina Interna" },
    careerTimeline: [
      { year: 2004, role: "Medica especialista", institution: "Hospital Infanta Sofia" },
      { year: 2019, role: "Portavoz de Mas Madrid", institution: "Asamblea de Madrid" },
      { year: 2023, role: "Ministra de Sanidad", institution: "Gobierno de Espana" },
    ],
    influenceScore: 52,
    mediaExposure: 58,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    socialMedia: [{ platform: "X", handle: "@moaboracia", followers: 185000 }],
    patrimony: { realEstate: 180000, savings: 75000, otherAssets: 12000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-diana-morant",
    name: "Diana Morant",
    slug: "diana-morant",
    currentRole: "Ministra de Ciencia, Innovacion y Universidades",
    institution: "Ministerio de Ciencia",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2021-07-12",
    previousRoles: [
      { role: "Alcaldesa de Gandia", institution: "Ayuntamiento de Gandia", from: "2015-06-13", to: "2021-07-11" },
    ],
    activity: [
      { id: "dm-a1", date: "2026-03-30", type: "declaracion", title: "Convocatoria Horizon Europe", summary: "Espana obtiene 1.200M en proyectos de investigacion europeos." },
      { id: "dm-a2", date: "2026-03-15", type: "reunion", title: "Cumbre de Ciencia UE", summary: "Participacion en el consejo de ministros de ciencia de la UE." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "ciencia", "psoe", "universidades"],
    gender: "F",
    birthYear: 1980,
    education: { degree: "Licenciada en Quimicas", institution: "Universitat de Valencia", specialization: "Investigacion Cientifica" },
    careerTimeline: [
      { year: 2007, role: "Concejala de Gandia", institution: "Ayuntamiento de Gandia" },
      { year: 2015, role: "Alcaldesa de Gandia", institution: "Ayuntamiento de Gandia" },
      { year: 2021, role: "Ministra de Ciencia", institution: "Gobierno de Espana" },
    ],
    influenceScore: 48,
    mediaExposure: 40,
    appointmentType: "nombramiento",
    homeCCAA: "Comunitat Valenciana",
    patrimony: { realEstate: 165000, savings: 58000, otherAssets: 10000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-ana-redondo",
    name: "Ana Redondo",
    slug: "ana-redondo",
    currentRole: "Ministra de Igualdad",
    institution: "Ministerio de Igualdad",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Concejala de Valladolid", institution: "Ayuntamiento de Valladolid", from: "2019-06-01", to: "2023-11-20" },
    ],
    activity: [
      { id: "ar-a1", date: "2026-04-02", type: "declaracion", title: "Informe brecha salarial", summary: "Presentacion del informe anual sobre brecha salarial de genero." },
      { id: "ar-a2", date: "2026-03-08", type: "comparecencia", title: "8M Dia de la Mujer", summary: "Acto institucional del Dia Internacional de la Mujer." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "igualdad", "psoe"],
    gender: "F",
    birthYear: 1978,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Valladolid", specialization: "Igualdad y Genero" },
    careerTimeline: [
      { year: 2011, role: "Asesora juridica del PSOE", institution: "PSOE" },
      { year: 2019, role: "Concejala de Valladolid", institution: "Ayuntamiento de Valladolid" },
      { year: 2023, role: "Ministra de Igualdad", institution: "Gobierno de Espana" },
    ],
    influenceScore: 44,
    mediaExposure: 45,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla y Leon",
    patrimony: { realEstate: 155000, savings: 52000, otherAssets: 8000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-ernest-urtasun",
    name: "Ernest Urtasun",
    slug: "ernest-urtasun",
    currentRole: "Ministro de Cultura",
    institution: "Ministerio de Cultura",
    level: "gobierno",
    party: "Sumar/Comuns",
    partySlug: "sumar",
    since: "2023-11-21",
    previousRoles: [
      { role: "Eurodiputado", institution: "Parlamento Europeo", from: "2014-07-01", to: "2023-11-20" },
    ],
    activity: [
      { id: "eu-a1", date: "2026-03-28", type: "declaracion", title: "Ley de Mecenazgo", summary: "Presentacion del anteproyecto de ley de mecenazgo cultural." },
      { id: "eu-a2", date: "2026-03-15", type: "nombramiento", title: "Nuevo director Museo del Prado", summary: "Nombramiento del nuevo director del Museo del Prado." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-yolanda-diaz", type: "coalicion", label: "Sumar" },
    ],
    tags: ["ministro", "cultura", "sumar", "comuns"],
    gender: "M",
    birthYear: 1982,
    education: { degree: "Licenciado en Ciencias Politicas", institution: "Universitat Pompeu Fabra", specialization: "Politica Cultural" },
    careerTimeline: [
      { year: 2014, role: "Eurodiputado", institution: "Parlamento Europeo" },
      { year: 2023, role: "Ministro de Cultura", institution: "Gobierno de Espana" },
    ],
    influenceScore: 40,
    mediaExposure: 42,
    appointmentType: "nombramiento",
    homeCCAA: "Cataluna",
    internationalRoles: ["Ex-Eurodiputado (2014-2023)"],
    patrimony: { realEstate: 140000, savings: 48000, otherAssets: 7000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-elma-saiz",
    name: "Elma Saiz",
    slug: "elma-saiz",
    currentRole: "Ministra de Inclusion, Seguridad Social y Migraciones",
    institution: "Ministerio de Inclusion",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Alcaldesa de Pamplona", institution: "Ayuntamiento de Pamplona", from: "2019-06-15", to: "2023-11-20" },
    ],
    activity: [
      { id: "es-a1", date: "2026-04-03", type: "declaracion", title: "Reforma pensiones", summary: "Avance en la segunda fase de reforma del sistema de pensiones." },
      { id: "es-a2", date: "2026-03-20", type: "reunion", title: "Mesa de migraciones", summary: "Reunion con CCAA sobre el reparto de menores no acompanados." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "inclusion", "psoe", "pensiones", "migraciones"],
    gender: "F",
    birthYear: 1978,
    education: { degree: "Licenciada en Sociologia", institution: "Universidad Publica de Navarra" },
    careerTimeline: [
      { year: 2011, role: "Concejala de Pamplona", institution: "Ayuntamiento de Pamplona" },
      { year: 2019, role: "Alcaldesa de Pamplona", institution: "Ayuntamiento de Pamplona" },
      { year: 2023, role: "Ministra de Inclusion", institution: "Gobierno de Espana" },
    ],
    influenceScore: 50,
    mediaExposure: 44,
    appointmentType: "nombramiento",
    homeCCAA: "Navarra",
    patrimony: { realEstate: 175000, savings: 62000, otherAssets: 9000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-sara-aagesen",
    name: "Sara Aagesen",
    slug: "sara-aagesen",
    currentRole: "Ministra para la Transicion Ecologica",
    institution: "Ministerio para la Transicion Ecologica",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2024-11-28",
    previousRoles: [
      { role: "Secretaria de Estado de Energia", institution: "MITECO", from: "2020-01-13", to: "2024-11-27" },
    ],
    activity: [
      { id: "sa-a1", date: "2026-04-05", type: "declaracion", title: "Plan de sequia", summary: "Actualizacion del plan especial de sequia con 2.200M de inversion." },
      { id: "sa-a2", date: "2026-03-22", type: "comparecencia", title: "COP seguimiento", summary: "Informe de progreso de Espana en los compromisos climaticos." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "transicion-ecologica", "psoe", "energia", "clima"],
    gender: "F",
    birthYear: 1975,
    education: { degree: "Ingeniera de Minas", institution: "Universidad Politecnica de Madrid", specialization: "Energia" },
    careerTimeline: [
      { year: 2002, role: "Tecnica de la Comision Europea (DG Energia)", institution: "Comision Europea" },
      { year: 2020, role: "Secretaria de Estado de Energia", institution: "MITECO" },
      { year: 2024, role: "Ministra para la Transicion Ecologica", institution: "Gobierno de Espana" },
    ],
    influenceScore: 60,
    mediaExposure: 50,
    appointmentType: "carrera",
    homeCCAA: "Madrid",
    internationalRoles: ["Representante en el Consejo de Energia de la UE"],
    patrimony: { realEstate: 230000, savings: 105000, otherAssets: 22000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-isabel-rodriguez",
    name: "Isabel Rodriguez",
    slug: "isabel-rodriguez",
    currentRole: "Ministra de Vivienda y Agenda Urbana",
    institution: "Ministerio de Vivienda",
    level: "gobierno",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-11-21",
    previousRoles: [
      { role: "Portavoz del Gobierno", institution: "Gobierno de Espana", from: "2021-07-12", to: "2023-11-20" },
    ],
    activity: [
      { id: "ir-a1", date: "2026-04-07", type: "declaracion", title: "Ley de Vivienda balance", summary: "Balance del primer ano de aplicacion de la Ley de Vivienda." },
      { id: "ir-a2", date: "2026-03-25", type: "reunion", title: "Conferencia Sectorial Vivienda", summary: "Reunion con consejeros autonomicos sobre zonas tensionadas." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "gobierno", label: "Presidente" },
    ],
    tags: ["ministra", "vivienda", "psoe"],
    gender: "F",
    birthYear: 1981,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Castilla-La Mancha" },
    careerTimeline: [
      { year: 2011, role: "Alcaldesa de Puertollano", institution: "Ayuntamiento de Puertollano" },
      { year: 2021, role: "Portavoz del Gobierno", institution: "Gobierno de Espana" },
      { year: 2023, role: "Ministra de Vivienda", institution: "Gobierno de Espana" },
    ],
    influenceScore: 52,
    mediaExposure: 55,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla-La Mancha",
    patrimony: { realEstate: 145000, savings: 55000, otherAssets: 8000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-sira-rego",
    name: "Sira Rego",
    slug: "sira-rego",
    currentRole: "Ministra de Juventud e Infancia",
    institution: "Ministerio de Juventud e Infancia",
    level: "gobierno",
    party: "Sumar",
    partySlug: "sumar",
    since: "2023-11-21",
    previousRoles: [
      { role: "Eurodiputada", institution: "Parlamento Europeo", from: "2019-07-01", to: "2023-11-20" },
    ],
    activity: [
      { id: "sr-a1", date: "2026-04-01", type: "declaracion", title: "Plan Nacional de Juventud", summary: "Presentacion de medidas de emancipacion juvenil." },
      { id: "sr-a2", date: "2026-03-15", type: "comparecencia", title: "Comision de Infancia", summary: "Informe sobre proteccion de menores en el entorno digital." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-yolanda-diaz", type: "coalicion", label: "Sumar" },
    ],
    tags: ["ministra", "juventud", "infancia", "sumar"],
    gender: "F",
    birthYear: 1976,
    education: { degree: "Licenciada en Periodismo", institution: "Universidad Complutense de Madrid" },
    careerTimeline: [
      { year: 2004, role: "Periodista", institution: "Medios de comunicacion" },
      { year: 2019, role: "Eurodiputada", institution: "Parlamento Europeo" },
      { year: 2023, role: "Ministra de Juventud e Infancia", institution: "Gobierno de Espana" },
    ],
    influenceScore: 38,
    mediaExposure: 36,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    internationalRoles: ["Ex-Eurodiputada (2019-2023)"],
    patrimony: { realEstate: 120000, savings: 42000, otherAssets: 6000, lastDeclaration: "2025-06-15" },
  },

  /* ════════════════════════════════════════════════════════════════════════
     CONGRESO — 10 key diputados
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-francina-armengol",
    name: "Francina Armengol",
    slug: "francina-armengol",
    currentRole: "Presidenta del Congreso de los Diputados",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-08-17",
    previousRoles: [
      { role: "Presidenta del Govern Balear", institution: "Govern de les Illes Balears", from: "2015-07-01", to: "2023-08-01" },
    ],
    activity: [
      { id: "fa-a1", date: "2026-04-08", type: "intervencion", title: "Apertura periodo de sesiones", summary: "Discurso de apertura del periodo de sesiones de primavera." },
      { id: "fa-a2", date: "2026-03-28", type: "reunion", title: "Reunion Mesa del Congreso", summary: "Aprobacion del calendario legislativo del trimestre." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSOE" },
    ],
    tags: ["presidenta-congreso", "psoe", "congreso"],
    gender: "F",
    birthYear: 1971,
    education: { degree: "Licenciada en Filologia Catalana", institution: "Universitat de les Illes Balears" },
    influenceScore: 70,
    mediaExposure: 58,
    appointmentType: "eleccion",
    homeCCAA: "Illes Balears",
    legislativeActivity: { billsProposed: 0, interventions: 34, votingAttendance: 88 },
    patrimony: { realEstate: 310000, savings: 140000, otherAssets: 25000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-miguel-tellado",
    name: "Miguel Tellado Filgueira",
    slug: "miguel-tellado",
    currentRole: "Portavoz del Grupo Popular en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "PP",
    partySlug: "pp",
    since: "2023-08-17",
    previousRoles: [
      { role: "Secretario General PP Galicia", institution: "PP", from: "2018-01-01", to: "2023-08-01" },
    ],
    activity: [
      { id: "mt-a1", date: "2026-04-07", type: "intervencion", title: "Sesion de control al Gobierno", summary: "Interpelacion al presidente sobre politica migratoria." },
      { id: "mt-a2", date: "2026-03-25", type: "votacion", title: "Voto contra decreto vivienda", summary: "El GP Popular vota en contra del decreto de vivienda." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "oposicion", label: "Oposicion" },
    ],
    tags: ["portavoz", "pp", "congreso", "oposicion"],
    gender: "M",
    birthYear: 1973,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Santiago de Compostela" },
    influenceScore: 65,
    mediaExposure: 60,
    appointmentType: "eleccion",
    homeCCAA: "Galicia",
    legislativeActivity: { billsProposed: 28, interventions: 145, votingAttendance: 96 },
    socialMedia: [{ platform: "X", handle: "@TelladoMiguel", followers: 95000 }],
  },
  {
    id: "cp-patxi-lopez",
    name: "Patxi Lopez",
    slug: "patxi-lopez",
    currentRole: "Portavoz del Grupo Socialista en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-08-17",
    previousRoles: [
      { role: "Lehendakari", institution: "Gobierno Vasco", from: "2009-05-07", to: "2012-12-13" },
    ],
    activity: [
      { id: "pl-a1", date: "2026-04-07", type: "intervencion", title: "Defensa del decreto vivienda", summary: "Intervencion en defensa de la validacion del decreto." },
      { id: "pl-a2", date: "2026-03-22", type: "votacion", title: "Aprobacion reforma laboral", summary: "Voto favorable a la extension de la reforma laboral." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSOE" },
    ],
    tags: ["portavoz", "psoe", "congreso"],
    gender: "M",
    birthYear: 1958,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Deusto" },
    influenceScore: 60,
    mediaExposure: 52,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
    legislativeActivity: { billsProposed: 15, interventions: 112, votingAttendance: 92 },
  },
  {
    id: "cp-gabriel-rufian",
    name: "Gabriel Rufian",
    slug: "gabriel-rufian",
    currentRole: "Portavoz de ERC en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "ERC",
    partySlug: "erc",
    since: "2015-12-20",
    previousRoles: [],
    activity: [
      { id: "gr-a1", date: "2026-04-07", type: "intervencion", title: "Pregunta sobre financiacion catalana", summary: "Interpelacion al gobierno sobre el cumplimiento del pacto fiscal catalan." },
      { id: "gr-a2", date: "2026-03-28", type: "votacion", title: "Abstencion en PGE", summary: "ERC se abstiene en la votacion de los presupuestos." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "coalicion", label: "Apoyo parlamentario" },
    ],
    tags: ["portavoz", "erc", "congreso", "cataluna"],
    gender: "M",
    birthYear: 1982,
    education: { degree: "Tecnico Superior en Administracion y Finanzas", institution: "IES Santa Coloma de Gramenet" },
    influenceScore: 58,
    mediaExposure: 72,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
    legislativeActivity: { billsProposed: 22, interventions: 178, votingAttendance: 91 },
    socialMedia: [{ platform: "X", handle: "@gabrielrufian", followers: 1100000 }],
  },
  {
    id: "cp-miriam-nogueras",
    name: "Miriam Nogueras",
    slug: "miriam-nogueras",
    currentRole: "Portavoz de Junts en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "Junts",
    partySlug: "junts",
    since: "2019-11-10",
    previousRoles: [],
    activity: [
      { id: "mn-a1", date: "2026-04-05", type: "intervencion", title: "Exigencia de cumplimiento de pactos", summary: "Reclamo de las inversiones comprometidas en infraestructuras catalanas." },
      { id: "mn-a2", date: "2026-03-20", type: "votacion", title: "Voto contra presupuestos", summary: "Junts vota en contra de los PGE 2027." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "oposicion", label: "Oposicion condicional" },
    ],
    tags: ["portavoz", "junts", "congreso", "cataluna"],
    gender: "F",
    birthYear: 1980,
    education: { degree: "Licenciada en Ciencias Politicas", institution: "Universitat Autonoma de Barcelona" },
    influenceScore: 48,
    mediaExposure: 52,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
    legislativeActivity: { billsProposed: 18, interventions: 98, votingAttendance: 85 },
    socialMedia: [{ platform: "X", handle: "@MiriamNogueras", followers: 140000 }],
  },
  {
    id: "cp-santiago-abascal",
    name: "Santiago Abascal",
    slug: "santiago-abascal",
    currentRole: "Presidente de VOX y Diputado",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "VOX",
    partySlug: "vox",
    since: "2019-05-21",
    previousRoles: [
      { role: "Presidente de VOX", institution: "VOX", from: "2014-01-16", to: "2026-04-10" },
    ],
    activity: [
      { id: "sab-a1", date: "2026-04-07", type: "intervencion", title: "Sesion de control", summary: "Interpelacion sobre politica de fronteras y migracion irregular." },
      { id: "sab-a2", date: "2026-03-15", type: "declaracion", title: "Mocion de censura anunciada", summary: "Anuncio de posible mocion de censura en el periodo de otono." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "oposicion", label: "Oposicion" },
    ],
    tags: ["presidente-vox", "vox", "congreso", "oposicion"],
    gender: "M",
    birthYear: 1976,
    education: { degree: "Licenciado en Sociologia", institution: "Universidad de Deusto" },
    influenceScore: 72,
    mediaExposure: 88,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
    legislativeActivity: { billsProposed: 35, interventions: 156, votingAttendance: 78 },
    socialMedia: [{ platform: "X", handle: "@Santi_ABASCAL", followers: 1800000 }, { platform: "Instagram", handle: "@santi_abascal", followers: 950000 }],
    patrimony: { realEstate: 200000, savings: 95000, otherAssets: 15000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-mertxe-aizpurua",
    name: "Mertxe Aizpurua",
    slug: "mertxe-aizpurua",
    currentRole: "Portavoz de EH Bildu en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "EH Bildu",
    partySlug: "eh-bildu",
    since: "2019-05-21",
    previousRoles: [],
    activity: [
      { id: "ma-a1", date: "2026-04-03", type: "intervencion", title: "Propuesta de transferencias", summary: "Demanda de transferencia de competencias al Pais Vasco." },
      { id: "ma-a2", date: "2026-03-22", type: "votacion", title: "Apoyo a presupuestos", summary: "EH Bildu vota a favor de los PGE 2027." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "coalicion", label: "Apoyo parlamentario" },
    ],
    tags: ["portavoz", "bildu", "congreso", "pais-vasco"],
    gender: "F",
    birthYear: 1963,
    education: { degree: "Licenciada en Periodismo", institution: "Universidad del Pais Vasco" },
    influenceScore: 50,
    mediaExposure: 45,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
    legislativeActivity: { billsProposed: 20, interventions: 105, votingAttendance: 93 },
  },
  {
    id: "cp-aitor-esteban",
    name: "Aitor Esteban",
    slug: "aitor-esteban",
    currentRole: "Portavoz del PNV en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "PNV",
    partySlug: "pnv",
    since: "2004-03-14",
    previousRoles: [],
    activity: [
      { id: "ae-a1", date: "2026-04-05", type: "intervencion", title: "Debate sobre concierto economico", summary: "Defensa de la singularidad del regimen fiscal vasco." },
      { id: "ae-a2", date: "2026-03-28", type: "votacion", title: "Apoyo condicional a PGE", summary: "PNV condiciona su apoyo a los presupuestos a inversiones en el TAV." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "coalicion", label: "Apoyo parlamentario" },
    ],
    tags: ["portavoz", "pnv", "congreso", "pais-vasco"],
    gender: "M",
    birthYear: 1964,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Deusto" },
    influenceScore: 55,
    mediaExposure: 40,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
    legislativeActivity: { billsProposed: 14, interventions: 130, votingAttendance: 97 },
  },
  {
    id: "cp-ione-belarra",
    name: "Ione Belarra",
    slug: "ione-belarra",
    currentRole: "Portavoz de Podemos en el Congreso",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "Podemos",
    partySlug: "podemos",
    since: "2016-06-26",
    previousRoles: [
      { role: "Ministra de Derechos Sociales", institution: "Gobierno de Espana", from: "2021-03-30", to: "2023-11-20" },
    ],
    activity: [
      { id: "ib-a1", date: "2026-04-07", type: "intervencion", title: "Critica a la politica de vivienda", summary: "Exigencia de medidas mas contundentes contra los fondos buitre." },
      { id: "ib-a2", date: "2026-03-20", type: "votacion", title: "Voto contra PGE", summary: "Podemos vota en contra de los presupuestos por insuficientes." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "oposicion", label: "Oposicion critica" },
    ],
    tags: ["portavoz", "podemos", "congreso"],
    gender: "F",
    birthYear: 1987,
    education: { degree: "Licenciada en Psicologia", institution: "Universidad de Navarra" },
    influenceScore: 46,
    mediaExposure: 55,
    appointmentType: "eleccion",
    homeCCAA: "Navarra",
    revolvingDoor: [{ company: "Gobierno de Espana (como ministra)", role: "Ministra de Derechos Sociales", year: 2021 }],
    legislativeActivity: { billsProposed: 32, interventions: 168, votingAttendance: 90 },
    socialMedia: [{ platform: "X", handle: "@iaborarru", followers: 580000 }],
  },

  /* ════════════════════════════════════════════════════════════════════════
     SENADO — 5 key senators
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-pedro-rollán",
    name: "Pedro Rollan",
    slug: "pedro-rollan",
    currentRole: "Presidente del Senado",
    institution: "Senado",
    level: "senado",
    party: "PP",
    partySlug: "pp",
    since: "2023-08-17",
    previousRoles: [
      { role: "Presidente de la Comunidad de Madrid", institution: "Comunidad de Madrid", from: "2018-04-27", to: "2019-08-14" },
    ],
    activity: [
      { id: "pr-a1", date: "2026-04-08", type: "intervencion", title: "Apertura sesion plenaria", summary: "Inauguracion del pleno sobre financiacion autonomica." },
      { id: "pr-a2", date: "2026-03-25", type: "reunion", title: "Mesa del Senado", summary: "Aprobacion del orden del dia para abril." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidente-senado", "pp", "senado"],
    gender: "M",
    birthYear: 1967,
    education: { degree: "Licenciado en Derecho", institution: "Universidad Complutense de Madrid" },
    influenceScore: 62,
    mediaExposure: 45,
    appointmentType: "eleccion",
    homeCCAA: "Madrid",
    patrimony: { realEstate: 480000, savings: 220000, otherAssets: 65000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-alicia-garcia",
    name: "Alicia Garcia",
    slug: "alicia-garcia",
    currentRole: "Portavoz del GP Popular en el Senado",
    institution: "Senado",
    level: "senado",
    party: "PP",
    partySlug: "pp",
    since: "2023-08-17",
    previousRoles: [
      { role: "Consejera de Familia", institution: "Junta de Castilla y Leon", from: "2015-07-01", to: "2023-06-01" },
    ],
    activity: [
      { id: "ag-a1", date: "2026-04-05", type: "intervencion", title: "Debate sobre competencias autonomicas", summary: "Defensa de la posicion del PP sobre la reforma de financiacion." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-rollán", type: "partido", label: "PP Senado" },
    ],
    tags: ["portavoz", "pp", "senado"],
    gender: "F",
    birthYear: 1970,
    education: { degree: "Licenciada en Ciencias Politicas", institution: "Universidad de Salamanca" },
    influenceScore: 45,
    mediaExposure: 32,
    appointmentType: "eleccion",
    homeCCAA: "Castilla y Leon",
  },
  {
    id: "cp-eva-granados",
    name: "Eva Granados",
    slug: "eva-granados",
    currentRole: "Portavoz del GP Socialista en el Senado",
    institution: "Senado",
    level: "senado",
    party: "PSOE",
    partySlug: "psoe",
    since: "2023-08-17",
    previousRoles: [
      { role: "Vicepresidenta primera del Senado", institution: "Senado", from: "2020-01-01", to: "2023-08-01" },
    ],
    activity: [
      { id: "eg-a1", date: "2026-04-05", type: "intervencion", title: "Defensa de financiacion singular", summary: "Argumentacion a favor de la financiacion singular de Cataluna." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSOE" },
    ],
    tags: ["portavoz", "psoe", "senado"],
    gender: "F",
    birthYear: 1972,
    education: { degree: "Licenciada en Periodismo", institution: "Universitat Autonoma de Barcelona" },
    influenceScore: 42,
    mediaExposure: 35,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
  },
  {
    id: "cp-jose-manuel-garcia-margallo",
    name: "Jose Manuel Garcia-Margallo",
    slug: "jose-manuel-garcia-margallo",
    currentRole: "Senador y Presidente Comision de Asuntos Exteriores",
    institution: "Senado",
    level: "senado",
    party: "PP",
    partySlug: "pp",
    since: "2023-08-17",
    previousRoles: [
      { role: "Ministro de Asuntos Exteriores", institution: "Gobierno de Espana", from: "2011-12-22", to: "2016-11-04" },
    ],
    activity: [
      { id: "jmgm-a1", date: "2026-03-30", type: "comparecencia", title: "Comision de Exteriores Senado", summary: "Analisis de la posicion espanola en la OTAN." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["senador", "pp", "senado", "exteriores"],
    gender: "M",
    birthYear: 1944,
    education: { degree: "Licenciado en Derecho y Economia", institution: "Universidad Complutense de Madrid", specialization: "Derecho Internacional" },
    influenceScore: 48,
    mediaExposure: 38,
    appointmentType: "eleccion",
    homeCCAA: "Comunitat Valenciana",
    revolvingDoor: [{ company: "Cuatrecasas Abogados", role: "Of Counsel", year: 2016 }],
    internationalRoles: ["Ex-Ministro de Asuntos Exteriores (2011-2016)", "Eurodiputado (1994-2011)"],
  },
  {
    id: "cp-koldo-martinez",
    name: "Koldo Martinez",
    slug: "koldo-martinez",
    currentRole: "Senador de Geroa Bai",
    institution: "Senado",
    level: "senado",
    party: "Geroa Bai",
    since: "2023-08-17",
    previousRoles: [],
    activity: [
      { id: "km-a1", date: "2026-03-25", type: "intervencion", title: "Debate sobre autogobierno navarro", summary: "Intervencion en defensa del regimen foral de Navarra." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["senador", "navarra", "senado"],
    gender: "M",
    birthYear: 1970,
    education: { degree: "Licenciado en Ciencias Ambientales", institution: "Universidad de Navarra" },
    influenceScore: 28,
    mediaExposure: 18,
    appointmentType: "eleccion",
    homeCCAA: "Navarra",
  },

  /* ════════════════════════════════════════════════════════════════════════
     CCAA — 10 presidents of Comunidades Autonomas
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-isabel-diaz-ayuso",
    name: "Isabel Diaz Ayuso",
    slug: "isabel-diaz-ayuso",
    currentRole: "Presidenta de la Comunidad de Madrid",
    institution: "Comunidad de Madrid",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Madrid",
    since: "2019-08-14",
    previousRoles: [
      { role: "Diputada en la Asamblea de Madrid", institution: "Asamblea de Madrid", from: "2011-06-01", to: "2019-08-13" },
    ],
    activity: [
      { id: "ida-a1", date: "2026-04-06", type: "declaracion", title: "Bajada de impuestos autonomicos", summary: "Anuncio de nueva reduccion del IRPF autonomico madrileno." },
      { id: "ida-a2", date: "2026-03-20", type: "reunion", title: "Conferencia de Presidentes", summary: "Participacion en la conferencia de presidentes autonomicos." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "oposicion", label: "Oposicion al Gobierno central" },
    ],
    tags: ["presidenta-ccaa", "pp", "madrid"],
    gender: "F",
    birthYear: 1978,
    education: { degree: "Licenciada en Periodismo", institution: "Universidad Complutense de Madrid" },
    influenceScore: 85,
    mediaExposure: 92,
    appointmentType: "eleccion",
    homeCCAA: "Madrid",
    socialMedia: [{ platform: "X", handle: "@IdiazAyuso", followers: 1500000 }, { platform: "Instagram", handle: "@idiaz.ayuso", followers: 980000 }],
    conflictFlags: ["Contrato de mascarillas a empresa vinculada a familiar (caso investigado)"],
    patrimony: { realEstate: 350000, savings: 130000, otherAssets: 28000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-salvador-illa",
    name: "Salvador Illa",
    slug: "salvador-illa",
    currentRole: "President de la Generalitat de Catalunya",
    institution: "Generalitat de Catalunya",
    level: "ccaa",
    party: "PSC/PSOE",
    partySlug: "psoe",
    territory: "Cataluna",
    since: "2024-08-10",
    previousRoles: [
      { role: "Ministro de Sanidad", institution: "Gobierno de Espana", from: "2020-01-13", to: "2021-07-11" },
    ],
    activity: [
      { id: "si-a1", date: "2026-04-05", type: "declaracion", title: "Financiacion singular catalana", summary: "Negociacion con el Gobierno central sobre el nuevo modelo fiscal." },
      { id: "si-a2", date: "2026-03-28", type: "reunion", title: "Comision bilateral Estado-Cataluna", summary: "Reunion sobre traspasos competenciales." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSC/PSOE" },
    ],
    tags: ["president-generalitat", "psc", "cataluna"],
    gender: "M",
    birthYear: 1966,
    education: { degree: "Licenciado en Filosofia", institution: "Universitat de Barcelona", specialization: "Etica Politica" },
    influenceScore: 72,
    mediaExposure: 65,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
    patrimony: { realEstate: 290000, savings: 125000, otherAssets: 20000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-juanma-moreno",
    name: "Juan Manuel Moreno Bonilla",
    slug: "juanma-moreno",
    currentRole: "Presidente de la Junta de Andalucia",
    institution: "Junta de Andalucia",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Andalucia",
    since: "2019-01-18",
    previousRoles: [
      { role: "Vicepresidente de la Junta de Andalucia (en funciones)", institution: "Junta de Andalucia", from: "2012-01-01", to: "2018-12-31" },
    ],
    activity: [
      { id: "jmm-a1", date: "2026-04-03", type: "declaracion", title: "Plan de regadios", summary: "Presentacion de inversiones en infraestructuras hidricas." },
      { id: "jmm-a2", date: "2026-03-15", type: "reunion", title: "Conferencia de Presidentes", summary: "Demanda de reforma de la financiacion autonomica." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-isabel-diaz-ayuso", type: "partido", label: "PP" },
    ],
    tags: ["presidente-junta", "pp", "andalucia"],
    gender: "M",
    birthYear: 1970,
    education: { degree: "Licenciado en Ingenieria Industrial", institution: "Universidad de Sevilla" },
    influenceScore: 76,
    mediaExposure: 68,
    appointmentType: "eleccion",
    homeCCAA: "Andalucia",
    socialMedia: [{ platform: "X", handle: "@JuanMa_Moreno", followers: 420000 }],
    patrimony: { realEstate: 410000, savings: 185000, otherAssets: 45000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-imanol-pradales",
    name: "Imanol Pradales",
    slug: "imanol-pradales",
    currentRole: "Lehendakari del Gobierno Vasco",
    institution: "Gobierno Vasco",
    level: "ccaa",
    party: "PNV",
    partySlug: "pnv",
    territory: "Pais Vasco",
    since: "2024-11-22",
    previousRoles: [
      { role: "Diputado de Bizkaia", institution: "Diputacion Foral de Bizkaia", from: "2019-06-01", to: "2024-11-21" },
    ],
    activity: [
      { id: "ip-a1", date: "2026-04-02", type: "declaracion", title: "Actualizacion del Concierto Economico", summary: "Propuesta de modernizacion del concierto economico vasco." },
      { id: "ip-a2", date: "2026-03-18", type: "reunion", title: "Comision mixta de transferencias", summary: "Negociacion de nuevas transferencias competenciales." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-aitor-esteban", type: "partido", label: "PNV" },
    ],
    tags: ["lehendakari", "pnv", "pais-vasco"],
    gender: "M",
    birthYear: 1980,
    education: { degree: "Licenciado en Economia", institution: "Universidad de Deusto" },
    influenceScore: 58,
    mediaExposure: 42,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
  },
  {
    id: "cp-alfonso-rueda",
    name: "Alfonso Rueda",
    slug: "alfonso-rueda",
    currentRole: "Presidente de la Xunta de Galicia",
    institution: "Xunta de Galicia",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Galicia",
    since: "2022-05-14",
    previousRoles: [
      { role: "Vicepresidente de la Xunta", institution: "Xunta de Galicia", from: "2009-04-01", to: "2022-05-13" },
    ],
    activity: [
      { id: "aru-a1", date: "2026-03-30", type: "declaracion", title: "Plan Galicia Digital", summary: "Presentacion de inversiones en digitalizacion del medio rural gallego." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidente-xunta", "pp", "galicia"],
    gender: "M",
    birthYear: 1968,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Santiago de Compostela" },
    influenceScore: 55,
    mediaExposure: 35,
    appointmentType: "eleccion",
    homeCCAA: "Galicia",
  },
  {
    id: "cp-carlos-mazon",
    name: "Carlos Mazon",
    slug: "carlos-mazon",
    currentRole: "President de la Generalitat Valenciana",
    institution: "Generalitat Valenciana",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Comunitat Valenciana",
    since: "2023-07-14",
    previousRoles: [
      { role: "Presidente de la Diputacion de Alicante", institution: "Diputacion de Alicante", from: "2019-07-01", to: "2023-07-13" },
    ],
    activity: [
      { id: "cm-a1", date: "2026-04-01", type: "declaracion", title: "Reconstruccion tras DANA", summary: "Balance de la reconstruccion tras las inundaciones de octubre 2024." },
      { id: "cm-a2", date: "2026-03-20", type: "comparecencia", title: "Les Corts Valencianes", summary: "Debate sobre la gestion de la emergencia climatica." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["president-generalitat-valenciana", "pp", "comunitat-valenciana"],
    gender: "M",
    birthYear: 1973,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Alicante" },
    influenceScore: 52,
    mediaExposure: 62,
    appointmentType: "eleccion",
    homeCCAA: "Comunitat Valenciana",
    conflictFlags: ["Gestion de la DANA de octubre 2024 bajo investigacion"],
  },
  {
    id: "cp-alfonso-fernandez-manueco",
    name: "Alfonso Fernandez Manueco",
    slug: "alfonso-fernandez-manueco",
    currentRole: "Presidente de la Junta de Castilla y Leon",
    institution: "Junta de Castilla y Leon",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Castilla y Leon",
    since: "2019-07-10",
    previousRoles: [
      { role: "Alcalde de Salamanca", institution: "Ayuntamiento de Salamanca", from: "2007-06-16", to: "2017-05-01" },
    ],
    activity: [
      { id: "afm-a1", date: "2026-03-25", type: "declaracion", title: "Plan contra la despoblacion", summary: "Nuevas medidas fiscales para combatir la despoblacion rural." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidente-jcyl", "pp", "castilla-y-leon"],
    gender: "M",
    birthYear: 1965,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Salamanca" },
    influenceScore: 48,
    mediaExposure: 30,
    appointmentType: "eleccion",
    homeCCAA: "Castilla y Leon",
  },
  {
    id: "cp-jorge-azcón",
    name: "Jorge Azcon",
    slug: "jorge-azcon",
    currentRole: "Presidente del Gobierno de Aragon",
    institution: "Gobierno de Aragon",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Aragon",
    since: "2023-08-10",
    previousRoles: [
      { role: "Alcalde de Zaragoza", institution: "Ayuntamiento de Zaragoza", from: "2019-06-15", to: "2023-08-09" },
    ],
    activity: [
      { id: "ja-a1", date: "2026-03-28", type: "declaracion", title: "Logistica y corredor central", summary: "Demanda de inversiones en el corredor ferroviario central." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidente-aragon", "pp", "aragon"],
    gender: "M",
    birthYear: 1973,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Zaragoza" },
    influenceScore: 46,
    mediaExposure: 32,
    appointmentType: "eleccion",
    homeCCAA: "Aragon",
  },
  {
    id: "cp-fernando-clavijo",
    name: "Fernando Clavijo",
    slug: "fernando-clavijo",
    currentRole: "Presidente del Gobierno de Canarias",
    institution: "Gobierno de Canarias",
    level: "ccaa",
    party: "Coalicion Canaria",
    partySlug: "coalicion-canaria",
    territory: "Canarias",
    since: "2023-07-13",
    previousRoles: [
      { role: "Presidente del Gobierno de Canarias", institution: "Gobierno de Canarias", from: "2015-07-10", to: "2019-07-12" },
    ],
    activity: [
      { id: "fc-a1", date: "2026-04-05", type: "declaracion", title: "Crisis migratoria Canarias", summary: "Demanda al Gobierno central de reparto obligatorio de menores migrantes." },
      { id: "fc-a2", date: "2026-03-22", type: "reunion", title: "Reunion con ministro Interior", summary: "Reunion bilateral sobre la situacion migratoria en Canarias." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidente-canarias", "coalicion-canaria", "canarias", "migracion"],
    gender: "M",
    birthYear: 1970,
    education: { degree: "Licenciado en Ciencias Economicas", institution: "Universidad de La Laguna" },
    influenceScore: 50,
    mediaExposure: 55,
    appointmentType: "eleccion",
    homeCCAA: "Canarias",
  },
  {
    id: "cp-marga-prohens",
    name: "Marga Prohens",
    slug: "marga-prohens",
    currentRole: "Presidenta del Govern de les Illes Balears",
    institution: "Govern de les Illes Balears",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Illes Balears",
    since: "2023-07-07",
    previousRoles: [
      { role: "Diputada por Baleares", institution: "Congreso", from: "2016-06-26", to: "2023-07-06" },
    ],
    activity: [
      { id: "mp-a1", date: "2026-03-30", type: "declaracion", title: "Regulacion alquiler turistico", summary: "Nuevas medidas de regulacion del alquiler vacacional." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidenta-balears", "pp", "baleares", "turismo"],
    gender: "F",
    birthYear: 1982,
    education: { degree: "Licenciada en Periodismo", institution: "Universitat de les Illes Balears" },
    influenceScore: 42,
    mediaExposure: 30,
    appointmentType: "eleccion",
    homeCCAA: "Illes Balears",
  },

  /* ════════════════════════════════════════════════════════════════════════
     AYUNTAMIENTOS — 5 key mayors
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-jose-luis-martinez-almeida",
    name: "Jose Luis Martinez-Almeida",
    slug: "jose-luis-martinez-almeida",
    currentRole: "Alcalde de Madrid",
    institution: "Ayuntamiento de Madrid",
    level: "ayuntamiento",
    party: "PP",
    partySlug: "pp",
    territory: "Madrid",
    since: "2019-06-15",
    previousRoles: [
      { role: "Concejal de Madrid", institution: "Ayuntamiento de Madrid", from: "2015-06-13", to: "2019-06-14" },
    ],
    activity: [
      { id: "jlma-a1", date: "2026-04-04", type: "declaracion", title: "Madrid Nuevo Norte avance", summary: "Actualizacion del progreso de la operacion urbanistica Madrid Nuevo Norte." },
      { id: "jlma-a2", date: "2026-03-18", type: "reunion", title: "Reunion con promotores vivienda", summary: "Mesa de trabajo sobre construccion de vivienda protegida." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-isabel-diaz-ayuso", type: "partido", label: "PP Madrid" },
    ],
    tags: ["alcalde", "pp", "madrid"],
    gender: "M",
    birthYear: 1975,
    education: { degree: "Licenciado en Derecho", institution: "ICADE (Universidad Pontificia Comillas)", specialization: "Derecho Urbanistico" },
    influenceScore: 68,
    mediaExposure: 70,
    appointmentType: "eleccion",
    homeCCAA: "Madrid",
    socialMedia: [{ platform: "X", handle: "@AlmeidaPP_", followers: 310000 }],
    patrimony: { realEstate: 420000, savings: 190000, otherAssets: 55000, lastDeclaration: "2025-06-15" },
  },
  {
    id: "cp-jaume-collboni",
    name: "Jaume Collboni",
    slug: "jaume-collboni",
    currentRole: "Alcalde de Barcelona",
    institution: "Ayuntamiento de Barcelona",
    level: "ayuntamiento",
    party: "PSC/PSOE",
    partySlug: "psoe",
    territory: "Barcelona",
    since: "2023-06-17",
    previousRoles: [
      { role: "Primer Teniente de Alcalde", institution: "Ayuntamiento de Barcelona", from: "2019-06-15", to: "2023-06-16" },
    ],
    activity: [
      { id: "jc-a1", date: "2026-04-02", type: "declaracion", title: "Regulacion pisos turisticos", summary: "Eliminacion progresiva de licencias de pisos turisticos para 2028." },
      { id: "jc-a2", date: "2026-03-20", type: "reunion", title: "Pacto por la vivienda Barcelona", summary: "Acuerdo con el sector constructor para 10.000 viviendas sociales." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-salvador-illa", type: "partido", label: "PSC" },
    ],
    tags: ["alcalde", "psc", "barcelona", "vivienda"],
    gender: "M",
    birthYear: 1969,
    education: { degree: "Licenciado en Ciencias Economicas", institution: "Universitat de Barcelona" },
    influenceScore: 58,
    mediaExposure: 52,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
  },
  {
    id: "cp-jose-luis-sanz",
    name: "Jose Luis Sanz",
    slug: "jose-luis-sanz",
    currentRole: "Alcalde de Sevilla",
    institution: "Ayuntamiento de Sevilla",
    level: "ayuntamiento",
    party: "PP",
    partySlug: "pp",
    territory: "Sevilla",
    since: "2023-06-17",
    previousRoles: [
      { role: "Senador por Sevilla", institution: "Senado", from: "2019-11-10", to: "2023-06-16" },
    ],
    activity: [
      { id: "jls-a1", date: "2026-03-25", type: "declaracion", title: "Expo 2030", summary: "Lanzamiento de la candidatura de Sevilla para la Expo 2030." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["alcalde", "pp", "sevilla"],
    gender: "M",
    birthYear: 1968,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Sevilla" },
    influenceScore: 44,
    mediaExposure: 35,
    appointmentType: "eleccion",
    homeCCAA: "Andalucia",
  },
  {
    id: "cp-maria-jose-catala",
    name: "Maria Jose Catala",
    slug: "maria-jose-catala",
    currentRole: "Alcaldesa de Valencia",
    institution: "Ayuntamiento de Valencia",
    level: "ayuntamiento",
    party: "PP",
    partySlug: "pp",
    territory: "Valencia",
    since: "2023-06-17",
    previousRoles: [
      { role: "Consejera de Educacion de la Comunitat Valenciana", institution: "Generalitat Valenciana", from: "2011-06-01", to: "2015-06-01" },
    ],
    activity: [
      { id: "mjc-a1", date: "2026-04-01", type: "declaracion", title: "Reconstruccion post-DANA Valencia", summary: "Plan de reconstruccion urbana tras las inundaciones." },
      { id: "mjc-a2", date: "2026-03-15", type: "reunion", title: "Mesa de emergencia municipal", summary: "Coordinacion con Generalitat para ayudas a afectados." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-carlos-mazon", type: "partido", label: "PP Valencia" },
    ],
    tags: ["alcaldesa", "pp", "valencia", "dana"],
    gender: "F",
    birthYear: 1972,
    education: { degree: "Licenciada en Derecho", institution: "Universitat de Valencia" },
    influenceScore: 46,
    mediaExposure: 48,
    appointmentType: "eleccion",
    homeCCAA: "Comunitat Valenciana",
  },
  {
    id: "cp-juan-mari-aburto",
    name: "Juan Mari Aburto",
    slug: "juan-mari-aburto",
    currentRole: "Alcalde de Bilbao",
    institution: "Ayuntamiento de Bilbao",
    level: "ayuntamiento",
    party: "PNV",
    partySlug: "pnv",
    territory: "Bilbao",
    since: "2015-06-13",
    previousRoles: [],
    activity: [
      { id: "jma-a1", date: "2026-03-28", type: "declaracion", title: "Bilbao 2030 Plan Estrategico", summary: "Presentacion del plan de transformacion urbana de Bilbao." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-imanol-pradales", type: "partido", label: "PNV" },
    ],
    tags: ["alcalde", "pnv", "bilbao"],
    gender: "M",
    birthYear: 1961,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Deusto" },
    influenceScore: 40,
    mediaExposure: 25,
    appointmentType: "eleccion",
    homeCCAA: "Pais Vasco",
  },

  /* ════════════════════════════════════════════════════════════════════════
     EUROPA — 3 officials
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-teresa-ribera",
    name: "Teresa Ribera",
    slug: "teresa-ribera",
    currentRole: "Vicepresidenta Ejecutiva de la Comision Europea para la Transicion Limpia",
    institution: "Comision Europea",
    level: "europa",
    party: "PSOE",
    partySlug: "psoe",
    since: "2024-12-01",
    previousRoles: [
      { role: "Ministra para la Transicion Ecologica", institution: "Gobierno de Espana", from: "2018-06-07", to: "2024-11-27" },
      { role: "Vicepresidenta Tercera", institution: "Gobierno de Espana", from: "2023-11-21", to: "2024-11-27" },
    ],
    activity: [
      { id: "tr-a1", date: "2026-04-08", type: "declaracion", title: "Clean Industrial Deal", summary: "Presentacion del paquete legislativo para la industria limpia europea." },
      { id: "tr-a2", date: "2026-03-25", type: "comparecencia", title: "Parlamento Europeo", summary: "Comparecencia ante la comision ENVI sobre objetivos climaticos 2040." },
      { id: "tr-a3", date: "2026-03-10", type: "viaje", title: "Visita a Polonia", summary: "Reunion sobre transicion energetica en Europa del Este." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-01-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSOE" },
    ],
    tags: ["comision-europea", "psoe", "clima", "transicion-energetica"],
    gender: "F",
    birthYear: 1969,
    education: { degree: "Licenciada en Derecho", institution: "Universidad Complutense de Madrid", specialization: "Derecho Ambiental" },
    careerTimeline: [
      { year: 2004, role: "Directora General de Cambio Climatico", institution: "Gobierno de Espana" },
      { year: 2008, role: "Directora del IDDRI (Paris)", institution: "Institut du Developpement Durable" },
      { year: 2018, role: "Ministra para la Transicion Ecologica", institution: "Gobierno de Espana" },
      { year: 2024, role: "Vicepresidenta Ejecutiva de la Comision Europea", institution: "Comision Europea" },
    ],
    influenceScore: 92,
    mediaExposure: 78,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    internationalRoles: ["Vicepresidenta Ejecutiva de la Comision Europea", "Miembro del Consejo del Acuerdo de Paris"],
    patrimony: { realEstate: 380000, savings: 195000, otherAssets: 45000, lastDeclaration: "2025-01-15" },
  },
  {
    id: "cp-dolors-montserrat",
    name: "Dolors Montserrat",
    slug: "dolors-montserrat",
    currentRole: "Eurodiputada y Presidenta de la Comision de Peticiones del PE",
    institution: "Parlamento Europeo",
    level: "europa",
    party: "PP",
    partySlug: "pp",
    since: "2019-07-02",
    previousRoles: [
      { role: "Ministra de Sanidad", institution: "Gobierno de Espana", from: "2016-11-04", to: "2018-06-07" },
    ],
    activity: [
      { id: "dmo-a1", date: "2026-04-03", type: "intervencion", title: "Debate sobre migracion", summary: "Intervencion en el pleno sobre el nuevo pacto migratorio europeo." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["eurodiputada", "pp", "parlamento-europeo"],
    gender: "F",
    birthYear: 1973,
    education: { degree: "Licenciada en Farmacia", institution: "Universitat de Barcelona" },
    influenceScore: 52,
    mediaExposure: 38,
    appointmentType: "eleccion",
    homeCCAA: "Cataluna",
    internationalRoles: ["Presidenta de la Comision de Peticiones del Parlamento Europeo"],
    revolvingDoor: [{ company: "Gobierno de Espana", role: "Ministra de Sanidad", year: 2016 }],
  },
  {
    id: "cp-iratxe-garcia",
    name: "Iratxe Garcia",
    slug: "iratxe-garcia",
    currentRole: "Eurodiputada y Presidenta del Grupo S&D en el Parlamento Europeo",
    institution: "Parlamento Europeo",
    level: "europa",
    party: "PSOE",
    partySlug: "psoe",
    since: "2004-07-20",
    previousRoles: [],
    activity: [
      { id: "ig-a1", date: "2026-04-05", type: "intervencion", title: "Liderazgo S&D en debate industrial", summary: "Posicion del grupo socialdemocrata sobre politica industrial europea." },
      { id: "ig-a2", date: "2026-03-20", type: "declaracion", title: "Fondos de cohesion", summary: "Defensa de la continuidad de los fondos de cohesion en el proximo MFP." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "PSOE" },
    ],
    tags: ["eurodiputada", "psoe", "parlamento-europeo", "syd"],
    gender: "F",
    birthYear: 1974,
    education: { degree: "Licenciada en Ciencias Politicas", institution: "Universidad de Valladolid" },
    influenceScore: 65,
    mediaExposure: 45,
    appointmentType: "eleccion",
    homeCCAA: "Castilla y Leon",
    internationalRoles: ["Presidenta del Grupo S&D en el Parlamento Europeo"],
  },

  /* ════════════════════════════════════════════════════════════════════════
     ORGANISMOS — 5 key institutional leaders
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-jose-luis-escriva",
    name: "Jose Luis Escriva",
    slug: "jose-luis-escriva",
    currentRole: "Gobernador del Banco de Espana",
    institution: "Banco de Espana",
    level: "organismo",
    since: "2024-09-15",
    previousRoles: [
      { role: "Ministro de Inclusion", institution: "Gobierno de Espana", from: "2020-01-13", to: "2024-09-14" },
      { role: "Presidente de AIReF", institution: "AIReF", from: "2014-02-01", to: "2020-01-12" },
    ],
    activity: [
      { id: "jle-a1", date: "2026-04-07", type: "declaracion", title: "Informe de estabilidad financiera", summary: "Presentacion del informe semestral sobre la estabilidad del sistema financiero espanol." },
      { id: "jle-a2", date: "2026-03-20", type: "comparecencia", title: "Congreso: Comision de Economia", summary: "Comparecencia ante la comision de economia sobre tipos de interes." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-01-15" },
    connections: [],
    tags: ["gobernador", "banco-de-espana", "politica-monetaria"],
    gender: "M",
    birthYear: 1966,
    education: { degree: "Doctor en Economia", institution: "Universidad Complutense de Madrid", specialization: "Politica Monetaria" },
    careerTimeline: [
      { year: 1994, role: "Economista del Banco de Espana", institution: "Banco de Espana" },
      { year: 2006, role: "Director de Coyuntura de AIReF", institution: "AIReF" },
      { year: 2014, role: "Presidente de AIReF", institution: "AIReF" },
      { year: 2020, role: "Ministro de Inclusion", institution: "Gobierno de Espana" },
      { year: 2024, role: "Gobernador del Banco de Espana", institution: "Banco de Espana" },
    ],
    revolvingDoor: [{ company: "Gobierno de Espana (de ministro a gobernador)", role: "Ministro -> Gobernador BdE", year: 2024 }],
    influenceScore: 85,
    mediaExposure: 62,
    appointmentType: "nombramiento",
    homeCCAA: "Madrid",
    internationalRoles: ["Miembro del Consejo de Gobernadores del BCE", "Gobernador alterno del FMI"],
    patrimony: { realEstate: 350000, savings: 280000, otherAssets: 55000, lastDeclaration: "2025-01-15" },
    conflictFlags: ["Cuestionado el nombramiento por proximidad al Gobierno que lo nombro ministro"],
  },
  {
    id: "cp-cani-fernandez",
    name: "Cani Fernandez",
    slug: "cani-fernandez",
    currentRole: "Presidenta de la CNMC",
    institution: "Comision Nacional de los Mercados y la Competencia",
    level: "organismo",
    since: "2020-06-15",
    previousRoles: [
      { role: "Socia de Cuatrecasas", institution: "Cuatrecasas Abogados", from: "2005-01-01", to: "2020-06-14" },
    ],
    activity: [
      { id: "cf-a1", date: "2026-04-02", type: "declaracion", title: "Informe sobre concentracion bancaria", summary: "Analisis del impacto de fusiones bancarias en la competencia." },
      { id: "cf-a2", date: "2026-03-15", type: "comparecencia", title: "Comision de Economia del Congreso", summary: "Informe anual de la CNMC sobre el estado de la competencia." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["presidenta-cnmc", "competencia", "regulacion"],
    gender: "F",
    birthYear: 1968,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Zaragoza", specialization: "Derecho de la Competencia" },
    revolvingDoor: [{ company: "Cuatrecasas Abogados", role: "Socia de Competencia", year: 2005 }],
    influenceScore: 65,
    mediaExposure: 35,
    appointmentType: "nombramiento",
    homeCCAA: "Aragon",
    conflictFlags: ["Procedencia de despacho de abogados que litiga ante la CNMC"],
  },
  {
    id: "cp-soledad-fernandez-doctor",
    name: "Soledad Fernandez Doctor",
    slug: "soledad-fernandez-doctor",
    currentRole: "Directora General de la AEAT",
    institution: "Agencia Estatal de Administracion Tributaria",
    level: "organismo",
    since: "2024-01-15",
    previousRoles: [
      { role: "Directora del Departamento de Inspeccion de la AEAT", institution: "AEAT", from: "2020-01-01", to: "2024-01-14" },
    ],
    activity: [
      { id: "sfd-a1", date: "2026-04-01", type: "declaracion", title: "Campana Renta 2025", summary: "Inicio de la campana de declaracion de la renta 2025." },
      { id: "sfd-a2", date: "2026-03-10", type: "comparecencia", title: "Balance recaudacion fiscal", summary: "Informe trimestral de recaudacion tributaria." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [
      { targetId: "cp-maria-jesus-montero", type: "gobierno", label: "Ministerio de Hacienda" },
    ],
    tags: ["directora-aeat", "hacienda", "impuestos"],
    gender: "F",
    birthYear: 1972,
    education: { degree: "Licenciada en Derecho y Economia", institution: "Universidad Complutense de Madrid", specialization: "Derecho Tributario" },
    influenceScore: 55,
    mediaExposure: 30,
    appointmentType: "carrera",
    homeCCAA: "Madrid",
  },
  {
    id: "cp-esperanza-casteleiro",
    name: "Esperanza Casteleiro",
    slug: "esperanza-casteleiro",
    currentRole: "Directora del CNI",
    institution: "Centro Nacional de Inteligencia",
    level: "organismo",
    since: "2022-05-10",
    previousRoles: [
      { role: "Secretaria de Estado de Defensa", institution: "Ministerio de Defensa", from: "2020-01-13", to: "2022-05-09" },
    ],
    activity: [
      { id: "ec-a1", date: "2026-03-30", type: "comparecencia", title: "Comision de Gastos Reservados", summary: "Comparecencia reservada ante la comision del Congreso." },
    ],
    declarations: { hasAssetDeclaration: false },
    connections: [
      { targetId: "cp-margarita-robles", type: "gobierno", label: "Ministerio de Defensa" },
    ],
    tags: ["directora-cni", "inteligencia", "seguridad"],
    gender: "F",
    birthYear: 1960,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Salamanca" },
    influenceScore: 70,
    mediaExposure: 20,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla y Leon",
  },
  {
    id: "cp-alvaro-garcia-ortiz",
    name: "Alvaro Garcia Ortiz",
    slug: "alvaro-garcia-ortiz",
    currentRole: "Fiscal General del Estado",
    institution: "Fiscalia General del Estado",
    level: "organismo",
    since: "2022-09-09",
    previousRoles: [
      { role: "Fiscal jefe de la Secretaria Tecnica", institution: "Fiscalia General del Estado", from: "2020-01-01", to: "2022-09-08" },
    ],
    activity: [
      { id: "ago-a1", date: "2026-04-06", type: "comparecencia", title: "Memoria anual de la Fiscalia", summary: "Presentacion de la memoria anual ante el Congreso." },
      { id: "ago-a2", date: "2026-03-22", type: "declaracion", title: "Reforma procesal", summary: "Posicion de la Fiscalia sobre la reforma procesal penal." },
    ],
    declarations: { hasAssetDeclaration: true, lastUpdated: "2025-06-15" },
    connections: [],
    tags: ["fiscal-general", "justicia", "fiscalia"],
    gender: "M",
    birthYear: 1972,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Salamanca" },
    influenceScore: 62,
    mediaExposure: 55,
    appointmentType: "nombramiento",
    homeCCAA: "Castilla y Leon",
    conflictFlags: ["Imputado por el Tribunal Supremo por revelacion de secretos (caso novio de Ayuso)"],
  },

  /* ════════════════════════════════════════════════════════════════════════
     CCAA — Additional community presidents
     ════════════════════════════════════════════════════════════════════════ */
  {
    id: "cp-adrian-barbon",
    name: "Adrian Barbon Fernandez",
    slug: "adrian-barbon",
    currentRole: "Presidente del Principado de Asturias",
    institution: "Gobierno del Principado de Asturias",
    level: "ccaa",
    party: "PSOE",
    partySlug: "psoe",
    territory: "Asturias",
    since: "2019-07-17",
    previousRoles: [
      { role: "Portavoz del PSOE en la Junta General", institution: "Junta General del Principado", from: "2015-06-01", to: "2019-07-16" },
    ],
    activity: [
      { id: "ab-a1", date: "2026-03-20", type: "declaracion", title: "Plan industrial asturiano", summary: "Presentacion del nuevo plan de reindustrializacion del Principado." },
    ],
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "Presidente del Gobierno (PSOE)" },
    ],
    tags: ["presidente-ccaa", "psoe", "asturias"],
    gender: "M",
    birthYear: 1981,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Oviedo" },
    influenceScore: 38,
    mediaExposure: 30,
    appointmentType: "eleccion",
    homeCCAA: "Asturias",
  },
  {
    id: "cp-maria-chivite",
    name: "Maria Chivite Navascues",
    slug: "maria-chivite",
    currentRole: "Presidenta del Gobierno de Navarra",
    institution: "Gobierno de Navarra",
    level: "ccaa",
    party: "PSN/PSOE",
    partySlug: "psoe",
    territory: "Navarra",
    since: "2019-08-06",
    previousRoles: [
      { role: "Portavoz del PSN en el Parlamento de Navarra", institution: "Parlamento de Navarra", from: "2015-07-01", to: "2019-08-05" },
    ],
    activity: [
      { id: "mc-a1", date: "2026-03-15", type: "declaracion", title: "Acuerdo presupuestario", summary: "Firma del acuerdo presupuestario 2026 con Geroa Bai y Contigo-Zurekin." },
    ],
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "Presidente del Gobierno (PSOE)" },
    ],
    tags: ["presidenta-ccaa", "psoe", "navarra"],
    gender: "F",
    birthYear: 1978,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Navarra" },
    influenceScore: 35,
    mediaExposure: 25,
    appointmentType: "eleccion",
    homeCCAA: "Navarra",
  },
  {
    id: "cp-emiliano-garcia-page",
    name: "Emiliano Garcia-Page Sanchez",
    slug: "emiliano-garcia-page",
    currentRole: "Presidente de Castilla-La Mancha",
    institution: "Junta de Comunidades de Castilla-La Mancha",
    level: "ccaa",
    party: "PSOE",
    partySlug: "psoe",
    territory: "Castilla-La Mancha",
    since: "2015-07-09",
    previousRoles: [
      { role: "Alcalde de Toledo", institution: "Ayuntamiento de Toledo", from: "1999-06-01", to: "2015-07-08" },
    ],
    activity: [
      { id: "egp-a1", date: "2026-03-10", type: "declaracion", title: "Trasvase Tajo-Segura", summary: "Critica publica al recorte del trasvase Tajo-Segura." },
    ],
    connections: [
      { targetId: "cp-pedro-sanchez", type: "partido", label: "Presidente del Gobierno (PSOE)" },
    ],
    tags: ["presidente-ccaa", "psoe", "castilla-la-mancha"],
    gender: "M",
    birthYear: 1968,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Castilla-La Mancha" },
    influenceScore: 42,
    mediaExposure: 38,
    appointmentType: "eleccion",
    homeCCAA: "Castilla-La Mancha",
  },
  {
    id: "cp-maria-guardiola",
    name: "Maria Guardiola Martin",
    slug: "maria-guardiola",
    currentRole: "Presidenta de la Junta de Extremadura",
    institution: "Junta de Extremadura",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Extremadura",
    since: "2023-07-12",
    previousRoles: [
      { role: "Senadora por Caceres", institution: "Senado", from: "2019-01-01", to: "2023-07-11" },
    ],
    activity: [
      { id: "mg-a1", date: "2026-03-05", type: "declaracion", title: "Plan de empleo rural", summary: "Presentacion del plan contra la despoblacion en Extremadura." },
    ],
    connections: [
      { targetId: "cp-miguel-tellado", type: "partido", label: "Portavoz PP en Congreso" },
    ],
    tags: ["presidenta-ccaa", "pp", "extremadura"],
    gender: "F",
    birthYear: 1981,
    education: { degree: "Licenciada en Farmacia", institution: "Universidad de Salamanca" },
    influenceScore: 33,
    mediaExposure: 28,
    appointmentType: "eleccion",
    homeCCAA: "Extremadura",
  },
  {
    id: "cp-gonzalo-capellan",
    name: "Gonzalo Capellan de Miguel",
    slug: "gonzalo-capellan",
    currentRole: "Presidente del Gobierno de La Rioja",
    institution: "Gobierno de La Rioja",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "La Rioja",
    since: "2023-07-13",
    previousRoles: [
      { role: "Director de la UNED", institution: "UNED", from: "2020-01-01", to: "2023-07-12" },
    ],
    activity: [
      { id: "gc-a1", date: "2026-03-01", type: "declaracion", title: "Reforma fiscal", summary: "Rebaja del IRPF autonómico en La Rioja." },
    ],
    connections: [
      { targetId: "cp-miguel-tellado", type: "partido", label: "Portavoz PP en Congreso" },
    ],
    tags: ["presidente-ccaa", "pp", "la-rioja"],
    gender: "M",
    birthYear: 1969,
    education: { degree: "Doctor en Historia", institution: "Universidad de La Rioja" },
    influenceScore: 25,
    mediaExposure: 18,
    appointmentType: "eleccion",
    homeCCAA: "La Rioja",
  },
  {
    id: "cp-fernando-lopez-miras",
    name: "Fernando Lopez Miras",
    slug: "fernando-lopez-miras",
    currentRole: "Presidente de la Region de Murcia",
    institution: "Comunidad Autonoma de la Region de Murcia",
    level: "ccaa",
    party: "PP",
    partySlug: "pp",
    territory: "Murcia",
    since: "2017-04-27",
    previousRoles: [
      { role: "Vicepresidente de la Region de Murcia", institution: "Gobierno de Murcia", from: "2015-07-01", to: "2017-04-26" },
    ],
    activity: [
      { id: "flm-a1", date: "2026-03-12", type: "declaracion", title: "Mar Menor", summary: "Plan de regeneracion integral del Mar Menor." },
    ],
    connections: [
      { targetId: "cp-miguel-tellado", type: "partido", label: "Portavoz PP en Congreso" },
    ],
    tags: ["presidente-ccaa", "pp", "murcia"],
    gender: "M",
    birthYear: 1984,
    education: { degree: "Licenciado en Farmacia", institution: "Universidad de Murcia" },
    influenceScore: 35,
    mediaExposure: 28,
    appointmentType: "eleccion",
    homeCCAA: "Murcia",
  },
  {
    id: "cp-miguel-bueno",
    name: "Miguel Angel Revilla Roiz",
    slug: "miguel-angel-revilla",
    currentRole: "Presidente de Cantabria (saliente)",
    institution: "Gobierno de Cantabria",
    level: "ccaa",
    party: "PRC",
    partySlug: "prc",
    territory: "Cantabria",
    since: "2019-06-25",
    previousRoles: [
      { role: "Presidente de Cantabria", institution: "Gobierno de Cantabria", from: "2003-07-01", to: "2011-06-23" },
    ],
    activity: [
      { id: "mar-a1", date: "2026-02-20", type: "declaracion", title: "Turismo sostenible", summary: "Lanzamiento del plan de turismo sostenible cantabro." },
    ],
    connections: [],
    tags: ["presidente-ccaa", "prc", "cantabria"],
    gender: "M",
    birthYear: 1943,
    education: { degree: "Licenciado en Ciencias Economicas", institution: "Universidad de Bilbao" },
    influenceScore: 30,
    mediaExposure: 45,
    appointmentType: "eleccion",
    homeCCAA: "Cantabria",
  },
  {
    id: "cp-ana-oramas",
    name: "Ana Oramas Gonzalez-Moro",
    slug: "ana-oramas",
    currentRole: "Diputada por Santa Cruz de Tenerife",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "Coalicion Canaria",
    partySlug: "coalicion-canaria",
    territory: "Canarias",
    since: "2007-04-01",
    previousRoles: [
      { role: "Alcaldesa de Santa Cruz de Tenerife", institution: "Ayuntamiento de Santa Cruz de Tenerife", from: "1999-06-01", to: "2007-03-31" },
    ],
    activity: [
      { id: "ao-a1", date: "2026-04-02", type: "intervencion", title: "Defensa de Canarias", summary: "Intervencion sobre la financiacion del REF canario." },
    ],
    connections: [
      { targetId: "cp-fernando-clavijo", type: "partido", label: "Presidente de Canarias (CC)" },
    ],
    tags: ["diputada", "coalicion-canaria", "canarias", "congreso"],
    gender: "F",
    birthYear: 1959,
    education: { degree: "Licenciada en Ciencias Economicas", institution: "Universidad de La Laguna" },
    influenceScore: 32,
    mediaExposure: 30,
    appointmentType: "eleccion",
    homeCCAA: "Canarias",
  },
  {
    id: "cp-alberto-nunez-feijoo",
    name: "Alberto Nunez Feijoo",
    slug: "alberto-nunez-feijoo",
    currentRole: "Presidente del Partido Popular / Lider de la oposicion",
    institution: "Partido Popular",
    level: "congreso",
    party: "PP",
    partySlug: "pp",
    territory: "Galicia",
    since: "2022-04-02",
    previousRoles: [
      { role: "Presidente de la Xunta de Galicia", institution: "Xunta de Galicia", from: "2009-04-01", to: "2022-03-31" },
      { role: "Conselleiro de Politica Territorial", institution: "Xunta de Galicia", from: "2003-08-01", to: "2005-07-31" },
    ],
    activity: [
      { id: "anf-a1", date: "2026-04-09", type: "intervencion", title: "Mocion de politica general", summary: "Intervencion critica contra el Gobierno en el debate de politica general." },
      { id: "anf-a2", date: "2026-03-25", type: "declaracion", title: "Pacto educativo", summary: "Propuesta de un gran pacto nacional por la educacion." },
    ],
    connections: [
      { targetId: "cp-miguel-tellado", type: "partido", label: "Portavoz PP en Congreso" },
      { targetId: "cp-isabel-diaz-ayuso", type: "partido", label: "Presidenta de la Com. de Madrid" },
    ],
    tags: ["lider-oposicion", "pp", "congreso", "presidente-pp"],
    gender: "M",
    birthYear: 1961,
    education: { degree: "Licenciado en Derecho", institution: "Universidad de Santiago de Compostela" },
    influenceScore: 88,
    mediaExposure: 85,
    appointmentType: "eleccion",
    homeCCAA: "Galicia",
  },
  {
    id: "cp-nestor-rego",
    name: "Nestor Rego Candamil",
    slug: "nestor-rego",
    currentRole: "Diputado por A Coruna (portavoz BNG)",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "BNG",
    partySlug: "bng",
    territory: "Galicia",
    since: "2019-12-01",
    previousRoles: [],
    activity: [
      { id: "nr-a1", date: "2026-03-18", type: "intervencion", title: "Debate sobre industria naval", summary: "Defensa de la industria naval gallega en el Congreso." },
    ],
    connections: [],
    tags: ["diputado", "bng", "galicia", "congreso"],
    gender: "M",
    birthYear: 1976,
    education: { degree: "Licenciado en Derecho", institution: "Universidade da Coruna" },
    influenceScore: 22,
    mediaExposure: 18,
    appointmentType: "eleccion",
    homeCCAA: "Galicia",
  },
  {
    id: "cp-cristina-valido",
    name: "Cristina Valido Garcia",
    slug: "cristina-valido",
    currentRole: "Diputada por Las Palmas (CC)",
    institution: "Congreso de los Diputados",
    level: "congreso",
    party: "Coalicion Canaria",
    partySlug: "coalicion-canaria",
    territory: "Canarias",
    since: "2023-11-01",
    previousRoles: [
      { role: "Consejera de Empleo del Gobierno de Canarias", institution: "Gobierno de Canarias", from: "2019-07-01", to: "2023-10-31" },
    ],
    activity: [
      { id: "cv-a1", date: "2026-03-25", type: "intervencion", title: "Pacto migratorio", summary: "Negociacion del reparto de menores migrantes no acompanados." },
    ],
    connections: [
      { targetId: "cp-fernando-clavijo", type: "partido", label: "Presidente de Canarias (CC)" },
      { targetId: "cp-ana-oramas", type: "partido", label: "Diputada CC por Tenerife" },
    ],
    tags: ["diputada", "coalicion-canaria", "canarias", "congreso"],
    gender: "F",
    birthYear: 1971,
    education: { degree: "Licenciada en Derecho", institution: "Universidad de Las Palmas de Gran Canaria" },
    influenceScore: 28,
    mediaExposure: 22,
    appointmentType: "eleccion",
    homeCCAA: "Canarias",
  },
];

// ---------------------------------------------------------------------------
// Recent cargo changes (2024-2026)
// ---------------------------------------------------------------------------

const recentChanges: CargoChange[] = [
  {
    id: "cc-001",
    date: "2024-11-28",
    personName: "Sara Aagesen",
    personSlug: "sara-aagesen",
    type: "nombramiento",
    toRole: "Ministra para la Transicion Ecologica",
    institution: "Gobierno de Espana",
    level: "gobierno",
    description: "Nombrada ministra tras la salida de Teresa Ribera a la Comision Europea.",
  },
  {
    id: "cc-002",
    date: "2024-11-28",
    personName: "Oscar Lopez Agueda",
    personSlug: "oscar-lopez-agueda",
    type: "nombramiento",
    toRole: "Ministro de Transformacion Digital",
    institution: "Gobierno de Espana",
    level: "gobierno",
    description: "Nombrado ministro en la remodelacion ministerial de noviembre 2024.",
  },
  {
    id: "cc-003",
    date: "2024-12-01",
    personName: "Teresa Ribera",
    personSlug: "teresa-ribera",
    type: "nombramiento",
    fromRole: "Ministra para la Transicion Ecologica y Vicepresidenta Tercera",
    toRole: "Vicepresidenta Ejecutiva de la Comision Europea",
    institution: "Comision Europea",
    level: "europa",
    description: "Asume el cargo de vicepresidenta ejecutiva de la Comision Europea para la Transicion Limpia.",
  },
  {
    id: "cc-004",
    date: "2024-11-22",
    personName: "Imanol Pradales",
    personSlug: "imanol-pradales",
    type: "eleccion",
    toRole: "Lehendakari del Gobierno Vasco",
    institution: "Gobierno Vasco",
    level: "ccaa",
    description: "Elegido Lehendakari tras las elecciones vascas de 2024.",
  },
  {
    id: "cc-005",
    date: "2024-08-10",
    personName: "Salvador Illa",
    personSlug: "salvador-illa",
    type: "eleccion",
    toRole: "President de la Generalitat de Catalunya",
    institution: "Generalitat de Catalunya",
    level: "ccaa",
    description: "Investido president tras las elecciones catalanas de mayo 2024.",
  },
  {
    id: "cc-006",
    date: "2024-09-15",
    personName: "Jose Luis Escriva",
    personSlug: "jose-luis-escriva",
    type: "nombramiento",
    fromRole: "Ministro de Inclusion, Seguridad Social y Migraciones",
    toRole: "Gobernador del Banco de Espana",
    institution: "Banco de Espana",
    level: "organismo",
    description: "Nombrado gobernador del Banco de Espana tras su etapa como ministro.",
  },
  {
    id: "cc-007",
    date: "2024-01-15",
    personName: "Soledad Fernandez Doctor",
    personSlug: "soledad-fernandez-doctor",
    type: "nombramiento",
    toRole: "Directora General de la AEAT",
    institution: "AEAT",
    level: "organismo",
    description: "Nombrada directora general de la Agencia Tributaria.",
  },
  {
    id: "cc-008",
    date: "2025-03-15",
    personName: "Pedro Sanchez Perez-Castejon",
    personSlug: "pedro-sanchez",
    type: "remodelacion",
    toRole: "Presidente del Gobierno (remodelacion parcial)",
    institution: "Gobierno de Espana",
    level: "gobierno",
    description: "Remodelacion parcial del Gobierno tras la crisis de la DANA.",
  },
  {
    id: "cc-009",
    date: "2025-06-01",
    personName: "Carlos Cuerpo",
    personSlug: "carlos-cuerpo",
    type: "nombramiento",
    fromRole: "Secretario General del Tesoro",
    toRole: "Ministro de Economia, Comercio y Empresa",
    institution: "Gobierno de Espana",
    level: "gobierno",
    description: "Confirmado como ministro de Economia tras la salida de Nadia Calvino al BEI.",
  },
  {
    id: "cc-010",
    date: "2025-09-10",
    personName: "Francina Armengol",
    personSlug: "francina-armengol",
    type: "nombramiento",
    toRole: "Presidenta del Congreso de los Diputados",
    institution: "Congreso de los Diputados",
    level: "congreso",
    description: "Reelegida como presidenta del Congreso al inicio del nuevo periodo de sesiones.",
  },
  {
    id: "cc-011",
    date: "2025-11-15",
    personName: "Elma Saiz",
    personSlug: "elma-saiz",
    type: "nombramiento",
    toRole: "Ministra de Inclusion, Seguridad Social y Migraciones",
    institution: "Gobierno de Espana",
    level: "gobierno",
    description: "Confirmada en el cargo tras la remodelacion gubernamental.",
  },
  {
    id: "cc-012",
    date: "2026-01-20",
    personName: "Alvaro Garcia Ortiz",
    personSlug: "alvaro-garcia-ortiz",
    type: "nombramiento",
    toRole: "Fiscal General del Estado",
    institution: "Fiscalia General del Estado",
    level: "organismo",
    description: "Renovacion en el cargo de Fiscal General del Estado por el Gobierno.",
  },
  {
    id: "cc-013",
    date: "2026-02-15",
    personName: "Pedro Rollan",
    personSlug: "pedro-rollan",
    type: "nombramiento",
    toRole: "Presidente del Senado",
    institution: "Senado",
    level: "senado",
    description: "Continuidad en la Presidencia del Senado con mayoria del PP.",
  },
  {
    id: "cc-014",
    date: "2025-07-01",
    personName: "Cani Fernandez",
    personSlug: "cani-fernandez",
    type: "nombramiento",
    toRole: "Presidenta de la CNMC (renovacion)",
    institution: "CNMC",
    level: "organismo",
    description: "Renovacion del mandato como presidenta de la CNMC.",
  },
  {
    id: "cc-015",
    date: "2026-03-01",
    personName: "Isabel Diaz Ayuso",
    personSlug: "isabel-diaz-ayuso",
    type: "eleccion",
    toRole: "Presidenta de la Comunidad de Madrid (reelegida)",
    institution: "Comunidad de Madrid",
    level: "ccaa",
    description: "Continua como presidenta de la Comunidad de Madrid con mayoria absoluta.",
  },
  {
    id: "cc-016",
    date: "2025-04-20",
    personName: "Jaume Collboni",
    personSlug: "jaume-collboni",
    type: "nombramiento",
    toRole: "Alcalde de Barcelona (investidura)",
    institution: "Ayuntamiento de Barcelona",
    level: "ayuntamiento",
    description: "Investidura tras las elecciones municipales de 2023.",
  },
  {
    id: "cc-017",
    date: "2024-06-15",
    personName: "Fernando Clavijo",
    personSlug: "fernando-clavijo",
    type: "eleccion",
    toRole: "Presidente del Gobierno de Canarias",
    institution: "Gobierno de Canarias",
    level: "ccaa",
    description: "Revalidacion al frente del Gobierno canario con Coalicion Canaria.",
  },
];

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildCargosData(): CargosData {
  const now = new Date("2026-04-10");
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  // ── Basic stats ──
  const byLevel: Record<CargoLevel, number> = {
    gobierno: 0, congreso: 0, senado: 0, ccaa: 0,
    ayuntamiento: 0, europa: 0, organismo: 0,
  };
  for (const o of officials) byLevel[o.level]++;

  const partyMap = new Map<string, number>();
  for (const o of officials) {
    const p = o.party ?? "Independiente";
    partyMap.set(p, (partyMap.get(p) ?? 0) + 1);
  }
  const byParty = Array.from(partyMap.entries())
    .map(([party, count]) => ({ party, count }))
    .sort((a, b) => b.count - a.count);

  let totalYears = 0;
  for (const o of officials) {
    totalYears += (now.getTime() - new Date(o.since).getTime()) / MS_PER_YEAR;
  }
  const avgTenureYears = Math.round((totalYears / officials.length) * 10) / 10;

  // ── Gender stats (feature #4) ──
  const genderByLevel: Record<CargoLevel, { total: number; women: number; pctWomen: number }> = {} as any;
  for (const l of Object.keys(byLevel) as CargoLevel[]) {
    const lvlOfficials = officials.filter((o) => o.level === l);
    const women = lvlOfficials.filter((o) => o.gender === "F").length;
    genderByLevel[l] = { total: lvlOfficials.length, women, pctWomen: lvlOfficials.length ? Math.round((women / lvlOfficials.length) * 100) : 0 };
  }
  const genderByPartyMap = new Map<string, { total: number; women: number }>();
  for (const o of officials) {
    const p = o.party ?? "Independiente";
    const cur = genderByPartyMap.get(p) ?? { total: 0, women: 0 };
    cur.total++;
    if (o.gender === "F") cur.women++;
    genderByPartyMap.set(p, cur);
  }
  const totalWomen = officials.filter((o) => o.gender === "F").length;
  const genderStats: GenderStats = {
    total: officials.length,
    women: totalWomen,
    men: officials.length - totalWomen,
    pctWomen: Math.round((totalWomen / officials.length) * 100),
    byLevel: genderByLevel,
    byParty: Array.from(genderByPartyMap.entries())
      .map(([party, { total, women }]) => ({ party, total, women, pctWomen: Math.round((women / total) * 100) }))
      .sort((a, b) => b.pctWomen - a.pctWomen),
  };

  // ── Tenure stats (feature #7) ──
  const tenureByLevel: Record<CargoLevel, number> = {} as any;
  for (const l of Object.keys(byLevel) as CargoLevel[]) {
    const lvlOfficials = officials.filter((o) => o.level === l);
    if (lvlOfficials.length === 0) { tenureByLevel[l] = 0; continue; }
    let sum = 0;
    for (const o of lvlOfficials) sum += (now.getTime() - new Date(o.since).getTime()) / MS_PER_YEAR;
    tenureByLevel[l] = Math.round((sum / lvlOfficials.length) * 10) / 10;
  }
  const officialTenures = officials.map((o) => ({
    name: o.name,
    years: Math.round(((now.getTime() - new Date(o.since).getTime()) / MS_PER_YEAR) * 10) / 10,
    role: o.currentRole,
  })).sort((a, b) => b.years - a.years);
  const tenureStats: TenureStats = {
    avgYears: avgTenureYears,
    byLevel: tenureByLevel,
    longest: officialTenures.slice(0, 5),
    shortest: officialTenures.slice(-5).reverse(),
  };

  // ── Age stats (feature #5) ──
  const currentYear = 2026;
  const withAge = officials.filter((o) => o.birthYear);
  const ages = withAge.map((o) => currentYear - o.birthYear!);
  const avgAge = ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;
  const ageByLevel: Record<CargoLevel, number> = {} as any;
  for (const l of Object.keys(byLevel) as CargoLevel[]) {
    const lvl = withAge.filter((o) => o.level === l);
    ageByLevel[l] = lvl.length ? Math.round(lvl.map((o) => currentYear - o.birthYear!).reduce((s, a) => s + a, 0) / lvl.length) : 0;
  }
  const ageStats: AgeStats = {
    avgAge,
    byLevel: ageByLevel,
    under40: ages.filter((a) => a < 40).length,
    age40to55: ages.filter((a) => a >= 40 && a < 55).length,
    age55to65: ages.filter((a) => a >= 55 && a < 65).length,
    over65: ages.filter((a) => a >= 65).length,
  };

  // ── Power concentration (feature #12) ──
  const partyGroups = new Map<string, typeof officials>();
  for (const o of officials) {
    const p = o.party ?? "Independiente";
    if (!partyGroups.has(p)) partyGroups.set(p, []);
    partyGroups.get(p)!.push(o);
  }
  const powerConcentration: PowerConcentration[] = [];
  for (const [party, members] of partyGroups) {
    if (members.length < 2) continue;
    const totalInfluence = members.reduce((s, m) => s + m.influenceScore, 0);
    if (totalInfluence === 0) continue;
    const shares = members.map((m) => m.influenceScore / totalInfluence);
    const herfindahl = Math.round(shares.reduce((s, sh) => s + sh * sh, 0) * 10000);
    const sorted = [...members].sort((a, b) => b.influenceScore - a.influenceScore);
    const topThreeScore = sorted.slice(0, 3).reduce((s, m) => s + m.influenceScore, 0);
    powerConcentration.push({
      party,
      herfindahl,
      topThreeSharePct: Math.round((topThreeScore / totalInfluence) * 100),
      topThree: sorted.slice(0, 3).map((m) => ({ name: m.name, influenceScore: m.influenceScore })),
    });
  }
  powerConcentration.sort((a, b) => b.herfindahl - a.herfindahl);

  // ── Comparative stats (feature #18) ──
  const comparativeStats: ComparativeStats = {
    spain: { govSize: byLevel.gobierno, avgTurnoverMonths: Math.round(avgTenureYears * 12), womenPct: genderStats.pctWomen, avgAge },
    euAvg: { govSize: 16, avgTurnoverMonths: 38, womenPct: 33, avgAge: 52 },
  };

  // ── Historical governments (feature #14) ──
  const historicalGovernments: HistoricalGovernment[] = [
    { period: "2024-presente", president: "Pedro Sanchez (XV)", party: "PSOE-Sumar", ministers: 22, womenPct: 64, formation: "Coalicion PSOE-Sumar con apoyo de partidos nacionalistas" },
    { period: "2023-2024", president: "Pedro Sanchez (XIV)", party: "PSOE-Sumar", ministers: 22, womenPct: 63, formation: "Investidura con apoyo de 7 partidos" },
    { period: "2020-2023", president: "Pedro Sanchez (XIII)", party: "PSOE-UP", ministers: 22, womenPct: 64, formation: "Primera coalicion del periodo democratico" },
    { period: "2018-2020", president: "Pedro Sanchez (XII)", party: "PSOE", ministers: 17, womenPct: 65, formation: "Gobierno monocolor tras mocion de censura" },
    { period: "2016-2018", president: "Mariano Rajoy (XI)", party: "PP", ministers: 13, womenPct: 31, formation: "Investidura tras 10 meses de bloqueo con abstencion del PSOE" },
    { period: "2011-2016", president: "Mariano Rajoy (X)", party: "PP", ministers: 14, womenPct: 29, formation: "Mayoria absoluta del PP" },
    { period: "2008-2011", president: "Jose Luis Rodriguez Zapatero (IX)", party: "PSOE", ministers: 17, womenPct: 53, formation: "Primer gobierno paritario de la historia de Espana" },
    { period: "2004-2008", president: "Jose Luis Rodriguez Zapatero (VIII)", party: "PSOE", ministers: 16, womenPct: 50, formation: "Gobierno monocolor PSOE" },
    { period: "2000-2004", president: "Jose Maria Aznar (VII)", party: "PP", ministers: 15, womenPct: 20, formation: "Mayoria absoluta del PP" },
    { period: "1996-2000", president: "Jose Maria Aznar (VI)", party: "PP", ministers: 14, womenPct: 14, formation: "Gobierno PP con apoyo CiU, PNV y CC" },
  ];

  // ── Weekly alerts (feature #19) ──
  const weeklyAlerts: WeeklyAlert[] = [
    { type: "nombramiento", date: "2026-04-08", summary: "Consejo de Ministros extraordinario: aprobacion del plan de respuesta ante la crisis energetica." },
    { type: "media", date: "2026-04-07", summary: "Sesion de control al Gobierno: cruce de acusaciones sobre politica migratoria entre PP y Gobierno." },
    { type: "nombramiento", date: "2026-04-06", summary: "Carlos Cuerpo revisa al alza las previsiones macroeconomicas para 2026." },
    { type: "conflicto", date: "2026-04-05", summary: "El Fiscal General del Estado continua bajo investigacion del Tribunal Supremo." },
    { type: "remodelacion", date: "2026-04-05", summary: "EH Bildu y PNV confirman apoyo a los PGE 2027; Junts y Podemos votan en contra." },
    { type: "media", date: "2026-04-03", summary: "La CNMC publica informe critico sobre concentracion bancaria." },
  ];

  // ── Geographic diversity (feature #20) ──
  const geoMap = new Map<string, string[]>();
  for (const o of officials) {
    if (o.homeCCAA) {
      if (!geoMap.has(o.homeCCAA)) geoMap.set(o.homeCCAA, []);
      geoMap.get(o.homeCCAA)!.push(o.name);
    }
  }
  const geographicDiversity = Array.from(geoMap.entries())
    .map(([ccaa, offs]) => ({ ccaa, count: offs.length, officials: offs }))
    .sort((a, b) => b.count - a.count);

  // ── Revolving door count (feature #2) ──
  const revolvingDoorCount = officials.filter((o) => o.revolvingDoor && o.revolvingDoor.length > 0).length;

  // ── Education breakdown (feature #6) ──
  const eduMap = new Map<string, number>();
  for (const o of officials) {
    if (o.education) {
      const key = o.education.degree;
      eduMap.set(key, (eduMap.get(key) ?? 0) + 1);
    }
  }
  const educationBreakdown = Array.from(eduMap.entries())
    .map(([degree, count]) => ({ degree, count }))
    .sort((a, b) => b.count - a.count);

  // ── Party breakdown for "Partidos" tab ──
  const PARTY_COLORS: Record<string, string> = {
    "PSOE": "#E30613",
    "PSC/PSOE": "#E30613",
    "PSN/PSOE": "#E30613",
    "PP": "#0055A4",
    "VOX": "#63BE21",
    "Sumar": "#E6007E",
    "Sumar/Comuns": "#E6007E",
    "Mas Madrid/Sumar": "#E6007E",
    "Podemos": "#6B2F6B",
    "ERC": "#FFB232",
    "Junts": "#00C3B2",
    "PNV": "#E30613",
    "EH Bildu": "#A3C940",
    "BNG": "#76B3E1",
    "Coalicion Canaria": "#FFD700",
    "PRC": "#006847",
    "Geroa Bai": "#5A8D41",
    "Independiente": "#6b7280",
  };

  const partyBreakdownMap = new Map<string, { slug: string; color: string; counts: Record<CargoLevel, number>; total: number; keyFigures: string[]; totalInfluence: number }>();
  for (const o of officials) {
    const p = o.party ?? "Independiente";
    if (!partyBreakdownMap.has(p)) {
      const pslug = o.partySlug ?? p.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      partyBreakdownMap.set(p, {
        slug: pslug,
        color: PARTY_COLORS[p] ?? "#6b7280",
        counts: { gobierno: 0, congreso: 0, senado: 0, ccaa: 0, ayuntamiento: 0, europa: 0, organismo: 0 },
        total: 0,
        keyFigures: [],
        totalInfluence: 0,
      });
    }
    const entry = partyBreakdownMap.get(p)!;
    entry.counts[o.level]++;
    entry.total++;
    entry.totalInfluence += o.influenceScore;
    if (o.influenceScore >= 50) entry.keyFigures.push(o.name);
  }
  // Compute power index (0-100) based on weighted presence across levels
  const maxTotalInfluence = Math.max(...Array.from(partyBreakdownMap.values()).map((v) => v.totalInfluence), 1);
  const partiesData: PartyBreakdown[] = Array.from(partyBreakdownMap.entries())
    .map(([party, v]) => ({
      party,
      slug: v.slug,
      color: v.color,
      counts: v.counts,
      total: v.total,
      keyFigures: v.keyFigures.slice(0, 5),
      powerIndex: Math.round((v.totalInfluence / maxTotalInfluence) * 100),
    }))
    .sort((a, b) => b.powerIndex - a.powerIndex);

  // ── Connection groups for "Red de conexiones" tab ──
  const getColor = (party?: string) => PARTY_COLORS[party ?? "Independiente"] ?? "#6b7280";

  const connectionGroups: ConnectionGroup[] = [
    {
      label: "Nucleo de Moncloa",
      description: "Circulo de confianza del Presidente del Gobierno: vicepresidencia, portavoz y principales ministerios estrategicos.",
      members: officials
        .filter((o) => o.level === "gobierno" && o.influenceScore >= 70)
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Bloque de la oposicion (PP-VOX)",
      description: "Principales actores de la oposicion parlamentaria de centroderecha y derecha.",
      members: officials
        .filter((o) => (o.party === "PP" || o.party === "VOX") && o.influenceScore >= 30)
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Eje soberanista catalan",
      description: "Partidos catalanes con presencia en el Congreso y las instituciones catalanas: ERC y Junts.",
      members: officials
        .filter((o) => o.party === "ERC" || o.party === "Junts" || o.party === "PSC/PSOE")
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Eje vasco-navarro",
      description: "Partidos vascos y navarros con influencia en la gobernabilidad estatal: PNV, EH Bildu y Geroa Bai.",
      members: officials
        .filter((o) => o.party === "PNV" || o.party === "EH Bildu" || o.party === "Geroa Bai" || (o.party === "PSN/PSOE"))
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Coalicion de gobierno (PSOE-Sumar)",
      description: "Ministros y cargos de la coalicion de gobierno entre PSOE y Sumar, incluidas sus marcas territoriales.",
      members: officials
        .filter((o) => o.level === "gobierno" && (o.partySlug === "psoe" || o.partySlug === "sumar") && o.influenceScore >= 40)
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Presidentes autonomicos del PP",
      description: "Red de presidentes de comunidades autonomas del Partido Popular, principal contrapoder territorial al Gobierno central.",
      members: officials
        .filter((o) => o.level === "ccaa" && (o.party === "PP"))
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Bloque canario-insular",
      description: "Actores de Coalicion Canaria con influencia en la gobernabilidad estatal desde las islas.",
      members: officials
        .filter((o) => o.party === "Coalicion Canaria" || (o.territory === "Canarias" && o.party !== "PP" && o.party !== "PSOE"))
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
    {
      label: "Instituciones de control y regulacion",
      description: "Responsables de organismos reguladores independientes, fiscalia, banco central y agencias clave.",
      members: officials
        .filter((o) => o.level === "organismo")
        .map((o) => ({ name: o.name, role: o.currentRole, party: o.party ?? "Independiente", partyColor: getColor(o.party) })),
    },
  ];

  return {
    officials,
    recentChanges,
    stats: {
      totalTracked: officials.length,
      byLevel,
      byParty,
      recentChangesCount: recentChanges.length,
      avgTenureYears,
    },
    parties: partiesData,
    connectionGroups,
    genderStats,
    tenureStats,
    ageStats,
    powerConcentration,
    comparativeStats,
    historicalGovernments,
    weeklyAlerts,
    geographicDiversity,
    revolvingDoorCount,
    educationBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function getOfficialBySlug(targetSlug: string): CargoPublico | undefined {
  return officials.find((o) => o.slug === targetSlug);
}

export function getOfficialsByLevel(level: CargoLevel): CargoPublico[] {
  return officials.filter((o) => o.level === level);
}

export function getOfficialsByParty(party: string): CargoPublico[] {
  const lower = party.toLowerCase();
  return officials.filter(
    (o) =>
      o.party?.toLowerCase().includes(lower) ||
      o.partySlug?.toLowerCase().includes(lower),
  );
}

export function getRecentChanges(days: number): CargoChange[] {
  const cutoff = new Date("2026-04-10");
  cutoff.setDate(cutoff.getDate() - days);
  return recentChanges.filter((c) => new Date(c.date) >= cutoff);
}

export function searchOfficials(query: string): CargoPublico[] {
  const lower = query.toLowerCase();
  return officials.filter(
    (o) =>
      o.name.toLowerCase().includes(lower) ||
      o.currentRole.toLowerCase().includes(lower) ||
      o.institution.toLowerCase().includes(lower) ||
      o.tags.some((t) => t.includes(lower)),
  );
}
