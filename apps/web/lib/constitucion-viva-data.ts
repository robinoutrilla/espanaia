/* ═══════════════════════════════════════════════════════════════════════════
   Constitución Viva — Real-time impact of public decisions on citizens,
   businesses, and territories.
   Seed date: 2026-04-11
   ═══════════════════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ProfileType =
  | "autonomo"
  | "pyme"
  | "ciudadano"
  | "gran-empresa"
  | "estudiante"
  | "jubilado";

export type CCAA =
  | "madrid"
  | "cataluna"
  | "andalucia"
  | "pais-vasco"
  | "valencia"
  | "galicia";

export type ChangeCategory =
  | "fiscal"
  | "laboral"
  | "subvencion"
  | "obligacion"
  | "derecho"
  | "medioambiental";

export type ChangePhase =
  | "propuesta"
  | "debate"
  | "aprobado"
  | "implementacion"
  | "vigente";

export type ImpactLevel = "alto" | "medio" | "bajo";

export interface CVProfile {
  id: string;
  type: ProfileType;
  label: string;
  location: CCAA;
  description: string;
  icon: string;
}

export interface CVChange {
  id: string;
  title: string;
  summary: string;
  category: ChangeCategory;
  phase: ChangePhase;
  date: string;
  effectiveDate?: string;
  impactScore: number; // 0–100
  impactLevel: ImpactLevel;
  affectedProfiles: ProfileType[];
  affectedCCAA: CCAA[];
  keyPoints: string[];
  source: string;
  deadlineDate?: string;
}

export interface CVDebate {
  id: string;
  title: string;
  chamber: "congreso" | "senado" | "comision";
  date: string;
  status: "programado" | "en-curso" | "finalizado";
  relatedChanges: string[];
  affectedProfiles: ProfileType[];
  summary: string;
  speakers: { name: string; party: string; position: string }[];
}

export interface CVOpportunity {
  id: string;
  title: string;
  description: string;
  type: "subvencion" | "programa" | "deduccion" | "bonificacion" | "formacion";
  amount?: string;
  deadline: string;
  eligibleProfiles: ProfileType[];
  eligibleCCAA: CCAA[];
  url: string;
  requirements: string[];
}

export interface CVRight {
  id: string;
  article: number;
  title: string;
  description: string;
  status: "vigente" | "modificado" | "amenazado";
  affectedProfiles: ProfileType[];
  recentChanges?: string;
}

export interface CVTerritorialComparison {
  id: string;
  metric: string;
  unit: string;
  description: string;
  values: Record<CCAA, number>;
  bestCCAA: CCAA;
  worstCCAA: CCAA;
}

export interface CVNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "deadline" | "cambio" | "oportunidad" | "debate";
  urgent: boolean;
  relatedId: string;
  affectedProfiles: ProfileType[];
}

export interface CVTimelineEvent {
  id: string;
  changeId: string;
  date: string;
  phase: ChangePhase;
  description: string;
}

export interface CVStats {
  totalChanges: number;
  activeChanges: number;
  upcomingDeadlines: number;
  opportunitiesOpen: number;
  debatesThisWeek: number;
  averageImpact: number;
}

export interface CVData {
  profiles: CVProfile[];
  changes: CVChange[];
  debates: CVDebate[];
  opportunities: CVOpportunity[];
  rights: CVRight[];
  territorial: CVTerritorialComparison[];
  notifications: CVNotification[];
  timeline: CVTimelineEvent[];
  stats: CVStats;
}

// ---------------------------------------------------------------------------
// Mock Data — Profiles
// ---------------------------------------------------------------------------

const profiles: CVProfile[] = [
  {
    id: "prof-autonomo-mad",
    type: "autonomo",
    label: "Autónomo Madrid",
    location: "madrid",
    description: "Profesional autónomo dado de alta en la Comunidad de Madrid",
    icon: "💼",
  },
  {
    id: "prof-pyme-bcn",
    type: "pyme",
    label: "PYME Barcelona",
    location: "cataluna",
    description: "Pequeña o mediana empresa con sede en Cataluña",
    icon: "🏢",
  },
  {
    id: "prof-ciudadano-sev",
    type: "ciudadano",
    label: "Ciudadano Sevilla",
    location: "andalucia",
    description: "Ciudadano residente en Andalucía",
    icon: "👤",
  },
  {
    id: "prof-empresa-bil",
    type: "gran-empresa",
    label: "Gran Empresa Bilbao",
    location: "pais-vasco",
    description: "Gran empresa con sede en el País Vasco",
    icon: "🏭",
  },
  {
    id: "prof-estudiante-val",
    type: "estudiante",
    label: "Estudiante Valencia",
    location: "valencia",
    description: "Estudiante universitario en la Comunidad Valenciana",
    icon: "🎓",
  },
  {
    id: "prof-jubilado-gal",
    type: "jubilado",
    label: "Jubilado Galicia",
    location: "galicia",
    description: "Persona jubilada residente en Galicia",
    icon: "🏖️",
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Changes (12 items)
// ---------------------------------------------------------------------------

const changes: CVChange[] = [
  {
    id: "chg-001",
    title: "Nueva cuota de autónomos por tramos de ingresos",
    summary: "Reforma del sistema de cotización de autónomos con cuotas progresivas según ingresos reales.",
    category: "fiscal",
    phase: "vigente",
    date: "2026-01-15",
    effectiveDate: "2026-07-01",
    impactScore: 85,
    impactLevel: "alto",
    affectedProfiles: ["autonomo", "pyme"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Cuotas entre 200€ y 590€ según tramo de ingresos",
      "13 tramos de cotización progresivos",
      "Derecho a cambiar de tramo cada 2 meses",
    ],
    source: "BOE-2026-1234",
  },
  {
    id: "chg-002",
    title: "Ampliación del permiso de paternidad a 20 semanas",
    summary: "Proyecto de ley para ampliar el permiso de paternidad de 16 a 20 semanas.",
    category: "laboral",
    phase: "debate",
    date: "2026-03-20",
    impactScore: 72,
    impactLevel: "alto",
    affectedProfiles: ["ciudadano", "autonomo", "pyme"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "4 semanas adicionales obligatorias",
      "Aplicable a ambos progenitores",
      "Coste asumido por la Seguridad Social",
    ],
    source: "Congreso-PL-2026-089",
  },
  {
    id: "chg-003",
    title: "Deducción del 25% en IRPF por eficiencia energética",
    summary: "Nueva deducción fiscal para inversiones en eficiencia energética en vivienda habitual.",
    category: "fiscal",
    phase: "aprobado",
    date: "2026-02-10",
    effectiveDate: "2026-06-01",
    impactScore: 58,
    impactLevel: "medio",
    affectedProfiles: ["ciudadano", "autonomo"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Deducción máxima de 5.000€ por ejercicio",
      "Incluye paneles solares, aislamiento y climatización",
      "Requiere certificado energético previo y posterior",
    ],
    source: "BOE-2026-2345",
  },
  {
    id: "chg-004",
    title: "Obligación de facturación electrónica para PYMEs",
    summary: "Todas las empresas de menos de 50 empleados deberán emitir facturas electrónicas.",
    category: "obligacion",
    phase: "implementacion",
    date: "2025-12-01",
    effectiveDate: "2026-09-01",
    deadlineDate: "2026-09-01",
    impactScore: 78,
    impactLevel: "alto",
    affectedProfiles: ["pyme", "autonomo"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Obligatorio para operaciones B2B",
      "Sistema Verifactu de la AEAT como plataforma oficial",
      "Multas de hasta 10.000€ por incumplimiento",
    ],
    source: "BOE-2025-9876",
  },
  {
    id: "chg-005",
    title: "Subvención Kit Digital Ampliado 2026",
    summary: "Ampliación del programa Kit Digital con nuevas categorías y mayores importes.",
    category: "subvencion",
    phase: "vigente",
    date: "2026-01-01",
    effectiveDate: "2026-01-01",
    deadlineDate: "2026-12-31",
    impactScore: 65,
    impactLevel: "medio",
    affectedProfiles: ["pyme", "autonomo"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Hasta 29.000€ para empresas de 10–49 empleados",
      "Incluye IA, ciberseguridad avanzada y analítica",
      "Solicitud a través de Acelera Pyme",
    ],
    source: "BOE-2026-0123",
  },
  {
    id: "chg-006",
    title: "Reducción del IVA al 4% en productos de higiene femenina",
    summary: "Rebaja fiscal permanente del IVA en productos de higiene femenina.",
    category: "fiscal",
    phase: "vigente",
    date: "2026-01-01",
    impactScore: 42,
    impactLevel: "bajo",
    affectedProfiles: ["ciudadano", "estudiante"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Reducción del 10% al 4%",
      "Aplicable a compresas, tampones y copas menstruales",
      "Ahorro estimado de 70€ anuales",
    ],
    source: "BOE-2025-8765",
  },
  {
    id: "chg-007",
    title: "Nuevo complemento de pensiones para mayores de 75",
    summary: "Complemento adicional de 150€/mes para pensionistas mayores de 75 años con pensiones mínimas.",
    category: "derecho",
    phase: "aprobado",
    date: "2026-03-01",
    effectiveDate: "2026-07-01",
    impactScore: 88,
    impactLevel: "alto",
    affectedProfiles: ["jubilado"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Complemento de 150€ mensuales",
      "Para pensiones contributivas por debajo de 1.000€",
      "Solicitud automática, sin papeleo adicional",
    ],
    source: "BOE-2026-3456",
  },
  {
    id: "chg-008",
    title: "Ley de inteligencia artificial y transparencia algorítmica",
    summary: "Obligaciones de transparencia para empresas que usen IA en decisiones que afecten a personas.",
    category: "obligacion",
    phase: "debate",
    date: "2026-04-01",
    impactScore: 71,
    impactLevel: "alto",
    affectedProfiles: ["pyme", "gran-empresa"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Registro obligatorio de algoritmos de alto riesgo",
      "Derecho a explicación de decisiones automatizadas",
      "Auditorías de sesgo algorítmico anuales",
    ],
    source: "Congreso-PL-2026-112",
  },
  {
    id: "chg-009",
    title: "Bonificación del 100% en cuotas para autónomos menores de 30",
    summary: "Exención total de la cuota de autónomos durante los primeros 24 meses para menores de 30 años.",
    category: "subvencion",
    phase: "propuesta",
    date: "2026-04-05",
    impactScore: 90,
    impactLevel: "alto",
    affectedProfiles: ["autonomo", "estudiante"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "0€ de cuota durante 24 meses",
      "Extensible a 36 meses en zonas rurales",
      "Compatible con tarifa plana posterior",
    ],
    source: "Proposición-2026-045",
  },
  {
    id: "chg-010",
    title: "Reducción de la jornada laboral a 37,5 horas semanales",
    summary: "Reforma laboral para reducir la jornada máxima legal de 40 a 37,5 horas semanales.",
    category: "laboral",
    phase: "debate",
    date: "2026-03-15",
    impactScore: 82,
    impactLevel: "alto",
    affectedProfiles: ["ciudadano", "pyme", "gran-empresa"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Reducción sin reducción salarial",
      "Registro digital de jornada obligatorio",
      "Inspecciones reforzadas de cumplimiento",
    ],
    source: "Congreso-PL-2026-098",
  },
  {
    id: "chg-011",
    title: "Nuevo impuesto sobre envases plásticos no reutilizables",
    summary: "Impuesto de 0,45€/kg sobre envases plásticos no reutilizables para empresas productoras.",
    category: "medioambiental",
    phase: "vigente",
    date: "2026-01-01",
    impactScore: 55,
    impactLevel: "medio",
    affectedProfiles: ["pyme", "gran-empresa"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "0,45€ por kilogramo de plástico no reciclado",
      "Declaración trimestral ante la AEAT",
      "Exención para envases de medicamentos",
    ],
    source: "BOE-2025-7654",
  },
  {
    id: "chg-012",
    title: "Becas universitarias: aumento del umbral de renta",
    summary: "Elevación del umbral de renta familiar para acceder a becas universitarias del MEC.",
    category: "derecho",
    phase: "aprobado",
    date: "2026-03-25",
    effectiveDate: "2026-09-01",
    impactScore: 68,
    impactLevel: "medio",
    affectedProfiles: ["estudiante", "ciudadano"],
    affectedCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    keyPoints: [
      "Umbral elevado un 10% respecto al curso anterior",
      "Nueva beca de transporte para zonas rurales",
      "Eliminación de la nota mínima para beca de matrícula",
    ],
    source: "BOE-2026-4567",
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Debates (8 items)
// ---------------------------------------------------------------------------

const debates: CVDebate[] = [
  {
    id: "deb-001",
    title: "Debate sobre la reducción de jornada laboral",
    chamber: "congreso",
    date: "2026-04-15",
    status: "programado",
    relatedChanges: ["chg-010"],
    affectedProfiles: ["ciudadano", "pyme", "gran-empresa"],
    summary: "Sesión plenaria para debatir la propuesta de reducción de la jornada laboral máxima a 37,5 horas semanales.",
    speakers: [
      { name: "Yolanda Díaz", party: "Sumar", position: "A favor" },
      { name: "Cuca Gamarra", party: "PP", position: "En contra" },
      { name: "Aitor Esteban", party: "PNV", position: "Condicionado" },
    ],
  },
  {
    id: "deb-002",
    title: "Comisión de Economía: facturación electrónica",
    chamber: "comision",
    date: "2026-04-10",
    status: "finalizado",
    relatedChanges: ["chg-004"],
    affectedProfiles: ["pyme", "autonomo"],
    summary: "Revisión del calendario de implantación de la facturación electrónica obligatoria para PYMEs.",
    speakers: [
      { name: "Carlos Body", party: "PSOE", position: "A favor" },
      { name: "Mario Garcés", party: "PP", position: "Aplazamiento" },
    ],
  },
  {
    id: "deb-003",
    title: "Debate de pensiones: complemento para mayores de 75",
    chamber: "congreso",
    date: "2026-04-08",
    status: "finalizado",
    relatedChanges: ["chg-007"],
    affectedProfiles: ["jubilado"],
    summary: "Aprobación del complemento de 150€ para pensionistas mayores de 75 con pensiones mínimas.",
    speakers: [
      { name: "Elma Saiz", party: "PSOE", position: "A favor" },
      { name: "Juan Bravo", party: "PP", position: "Insuficiente" },
    ],
  },
  {
    id: "deb-004",
    title: "Senado: Ley de inteligencia artificial",
    chamber: "senado",
    date: "2026-04-18",
    status: "programado",
    relatedChanges: ["chg-008"],
    affectedProfiles: ["pyme", "gran-empresa"],
    summary: "Debate en el Senado sobre las obligaciones de transparencia algorítmica para empresas.",
    speakers: [
      { name: "Ander Gil", party: "PSE-EE", position: "A favor" },
      { name: "Javier Maroto", party: "PP", position: "Enmiendas" },
    ],
  },
  {
    id: "deb-005",
    title: "Comisión de Hacienda: cuotas de autónomos",
    chamber: "comision",
    date: "2026-04-12",
    status: "programado",
    relatedChanges: ["chg-001", "chg-009"],
    affectedProfiles: ["autonomo"],
    summary: "Evaluación del impacto del nuevo sistema de cuotas por tramos y propuesta de bonificación para jóvenes.",
    speakers: [
      { name: "María Jesús Montero", party: "PSOE", position: "Defensa" },
      { name: "Carolina España", party: "PP", position: "Crítica" },
    ],
  },
  {
    id: "deb-006",
    title: "Debate sobre becas universitarias",
    chamber: "congreso",
    date: "2026-04-09",
    status: "finalizado",
    relatedChanges: ["chg-012"],
    affectedProfiles: ["estudiante", "ciudadano"],
    summary: "Aprobación de la elevación del umbral de renta para becas universitarias.",
    speakers: [
      { name: "Pilar Alegría", party: "PSOE", position: "A favor" },
      { name: "Sandra Moneo", party: "PP", position: "Matices" },
    ],
  },
  {
    id: "deb-007",
    title: "Comisión de Transición Ecológica: impuesto plásticos",
    chamber: "comision",
    date: "2026-04-14",
    status: "programado",
    relatedChanges: ["chg-011"],
    affectedProfiles: ["pyme", "gran-empresa"],
    summary: "Revisión de la recaudación y efectividad del impuesto sobre envases plásticos.",
    speakers: [
      { name: "Teresa Ribera", party: "PSOE", position: "Positiva" },
      { name: "Borja Sémper", party: "PP", position: "Revisión" },
    ],
  },
  {
    id: "deb-008",
    title: "Debate sobre ampliación del permiso de paternidad",
    chamber: "congreso",
    date: "2026-04-22",
    status: "programado",
    relatedChanges: ["chg-002"],
    affectedProfiles: ["ciudadano", "autonomo", "pyme"],
    summary: "Primera lectura del proyecto de ley para ampliar el permiso de paternidad a 20 semanas.",
    speakers: [
      { name: "Yolanda Díaz", party: "Sumar", position: "A favor" },
      { name: "Edurne Uriarte", party: "PP", position: "En contra" },
      { name: "Mertxe Aizpurua", party: "EH Bildu", position: "A favor" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Opportunities (5+ items)
// ---------------------------------------------------------------------------

const opportunities: CVOpportunity[] = [
  {
    id: "opp-001",
    title: "Kit Digital Ampliado 2026",
    description: "Subvención para la digitalización de pequeñas empresas y autónomos.",
    type: "subvencion",
    amount: "Hasta 29.000€",
    deadline: "2026-12-31",
    eligibleProfiles: ["pyme", "autonomo"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://acelerapyme.es",
    requirements: ["Alta en el censo de empresarios", "Antigüedad mínima de 6 meses", "No superar los 49 empleados"],
  },
  {
    id: "opp-002",
    title: "Bono Alquiler Joven 2026",
    description: "Ayuda de 250€/mes para jóvenes menores de 35 años en alquiler.",
    type: "programa",
    amount: "250€/mes durante 24 meses",
    deadline: "2026-09-30",
    eligibleProfiles: ["estudiante", "ciudadano"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "valencia"],
    url: "https://www.mitma.gob.es",
    requirements: ["Menor de 35 años", "Ingresos inferiores a 24.318€ anuales", "Contrato de alquiler vigente"],
  },
  {
    id: "opp-003",
    title: "Programa MOVES III: movilidad sostenible",
    description: "Ayudas para la compra de vehículos eléctricos e instalación de puntos de recarga.",
    type: "subvencion",
    amount: "Hasta 9.000€",
    deadline: "2026-06-30",
    eligibleProfiles: ["ciudadano", "autonomo", "pyme"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://www.idae.es",
    requirements: ["Achatarramiento de vehículo de más de 7 años", "Vehículo eléctrico o PHEV", "Renta inferior a 45.000€"],
  },
  {
    id: "opp-004",
    title: "Deducción IRPF por eficiencia energética",
    description: "Deducción del 20-60% en la declaración de la renta por mejoras de eficiencia energética.",
    type: "deduccion",
    amount: "Hasta 5.000€ de deducción",
    deadline: "2026-12-31",
    eligibleProfiles: ["ciudadano", "autonomo"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://www.aeat.es",
    requirements: ["Vivienda habitual", "Certificado energético antes y después", "Facturas de profesionales autorizados"],
  },
  {
    id: "opp-005",
    title: "Bonificación cuota autónomos menores de 30",
    description: "Bonificación del 100% de la cuota de autónomos durante 24 meses para jóvenes emprendedores.",
    type: "bonificacion",
    amount: "100% de la cuota (hasta 294€/mes)",
    deadline: "2026-12-31",
    eligibleProfiles: ["autonomo", "estudiante"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://www.seg-social.es",
    requirements: ["Menor de 30 años", "Primera alta como autónomo", "No haber sido autónomo en los 2 años anteriores"],
  },
  {
    id: "opp-006",
    title: "Formación digital para mayores de 65",
    description: "Programa gratuito de alfabetización digital para personas mayores.",
    type: "formacion",
    deadline: "2026-11-30",
    eligibleProfiles: ["jubilado"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://www.red.es",
    requirements: ["Mayor de 65 años", "Empadronado en municipio participante"],
  },
  {
    id: "opp-007",
    title: "Becas Erasmus+ ampliadas",
    description: "Aumento de la dotación Erasmus+ para estudiantes españoles con complemento de coste de vida.",
    type: "subvencion",
    amount: "Hasta 600€/mes",
    deadline: "2026-05-15",
    eligibleProfiles: ["estudiante"],
    eligibleCCAA: ["madrid", "cataluna", "andalucia", "pais-vasco", "valencia", "galicia"],
    url: "https://www.sepie.es",
    requirements: ["Estudiante universitario matriculado", "Media mínima de 6.0", "Nivel B2 de idioma de destino"],
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Rights & Obligations
// ---------------------------------------------------------------------------

const rights: CVRight[] = [
  {
    id: "right-001",
    article: 35,
    title: "Derecho al trabajo",
    description: "Todos los españoles tienen el deber de trabajar y el derecho al trabajo, a la libre elección de profesión u oficio.",
    status: "modificado",
    affectedProfiles: ["ciudadano", "autonomo", "pyme", "estudiante"],
    recentChanges: "Debate sobre reducción de jornada a 37,5h afecta la regulación del derecho al trabajo.",
  },
  {
    id: "right-002",
    article: 31,
    title: "Obligación de contribuir al sostenimiento de los gastos públicos",
    description: "Todos contribuirán al sostenimiento de los gastos públicos de acuerdo con su capacidad económica.",
    status: "vigente",
    affectedProfiles: ["ciudadano", "autonomo", "pyme", "gran-empresa", "jubilado"],
  },
  {
    id: "right-003",
    article: 27,
    title: "Derecho a la educación",
    description: "Todos tienen el derecho a la educación. Se reconoce la libertad de enseñanza.",
    status: "modificado",
    affectedProfiles: ["estudiante", "ciudadano"],
    recentChanges: "Ampliación del umbral de becas universitarias mejora el acceso efectivo a este derecho.",
  },
  {
    id: "right-004",
    article: 43,
    title: "Derecho a la protección de la salud",
    description: "Se reconoce el derecho a la protección de la salud. Compete a los poderes públicos organizar y tutelar la salud pública.",
    status: "vigente",
    affectedProfiles: ["ciudadano", "jubilado", "estudiante"],
  },
  {
    id: "right-005",
    article: 47,
    title: "Derecho a la vivienda digna",
    description: "Todos los españoles tienen derecho a disfrutar de una vivienda digna y adecuada.",
    status: "amenazado",
    affectedProfiles: ["ciudadano", "estudiante"],
    recentChanges: "Tensión en el mercado inmobiliario. Bono Alquiler Joven como medida paliativa.",
  },
  {
    id: "right-006",
    article: 50,
    title: "Protección de la tercera edad",
    description: "Los poderes públicos garantizarán la suficiencia económica de los ciudadanos durante la tercera edad.",
    status: "modificado",
    affectedProfiles: ["jubilado"],
    recentChanges: "Nuevo complemento de 150€ para pensiones mínimas de mayores de 75.",
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Territorial Comparisons
// ---------------------------------------------------------------------------

const territorial: CVTerritorialComparison[] = [
  {
    id: "ter-001",
    metric: "Tipo IRPF marginal máximo autonómico",
    unit: "%",
    description: "Tipo impositivo marginal máximo del tramo autonómico del IRPF",
    values: { madrid: 20.5, cataluna: 25.5, andalucia: 22.5, "pais-vasco": 49.0, valencia: 24.0, galicia: 22.5 },
    bestCCAA: "madrid",
    worstCCAA: "pais-vasco",
  },
  {
    id: "ter-002",
    metric: "Impuesto de Sucesiones (bonificación)",
    unit: "% bonificación",
    description: "Porcentaje de bonificación en el Impuesto de Sucesiones para herederos directos",
    values: { madrid: 99, cataluna: 50, andalucia: 99, "pais-vasco": 95, valencia: 99, galicia: 75 },
    bestCCAA: "madrid",
    worstCCAA: "cataluna",
  },
  {
    id: "ter-003",
    metric: "Cuota media de autónomos efectiva",
    unit: "€/mes",
    description: "Cuota media real pagada por autónomos tras deducciones autonómicas",
    values: { madrid: 280, cataluna: 310, andalucia: 260, "pais-vasco": 295, valencia: 270, galicia: 255 },
    bestCCAA: "galicia",
    worstCCAA: "cataluna",
  },
  {
    id: "ter-004",
    metric: "Tiempo medio para abrir una empresa",
    unit: "días",
    description: "Días laborables necesarios para completar el proceso de constitución de una empresa",
    values: { madrid: 7, cataluna: 9, andalucia: 12, "pais-vasco": 6, valencia: 10, galicia: 11 },
    bestCCAA: "pais-vasco",
    worstCCAA: "andalucia",
  },
  {
    id: "ter-005",
    metric: "Subvenciones autonómicas disponibles para PYMEs",
    unit: "programas",
    description: "Número de programas de subvenciones activos para pequeñas y medianas empresas",
    values: { madrid: 23, cataluna: 31, andalucia: 28, "pais-vasco": 35, valencia: 22, galicia: 19 },
    bestCCAA: "pais-vasco",
    worstCCAA: "galicia",
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Notifications
// ---------------------------------------------------------------------------

const notifications: CVNotification[] = [
  {
    id: "not-001",
    title: "Plazo facturación electrónica",
    description: "Quedan 143 días para la entrada en vigor de la facturación electrónica obligatoria.",
    date: "2026-09-01",
    type: "deadline",
    urgent: true,
    relatedId: "chg-004",
    affectedProfiles: ["pyme", "autonomo"],
  },
  {
    id: "not-002",
    title: "Debate jornada laboral",
    description: "Sesión plenaria sobre la reducción de jornada el 15 de abril.",
    date: "2026-04-15",
    type: "debate",
    urgent: false,
    relatedId: "deb-001",
    affectedProfiles: ["ciudadano", "pyme", "gran-empresa"],
  },
  {
    id: "not-003",
    title: "Cierre solicitudes Bono Alquiler Joven",
    description: "Último mes para solicitar el Bono Alquiler Joven 2026.",
    date: "2026-09-30",
    type: "oportunidad",
    urgent: false,
    relatedId: "opp-002",
    affectedProfiles: ["estudiante", "ciudadano"],
  },
  {
    id: "not-004",
    title: "Nuevas cuotas autónomos en vigor",
    description: "El 1 de julio entran en vigor las nuevas cuotas de autónomos por tramos.",
    date: "2026-07-01",
    type: "cambio",
    urgent: true,
    relatedId: "chg-001",
    affectedProfiles: ["autonomo"],
  },
  {
    id: "not-005",
    title: "Cierre solicitudes MOVES III",
    description: "Último plazo para solicitar ayudas MOVES III de movilidad sostenible.",
    date: "2026-06-30",
    type: "oportunidad",
    urgent: true,
    relatedId: "opp-003",
    affectedProfiles: ["ciudadano", "autonomo", "pyme"],
  },
  {
    id: "not-006",
    title: "Erasmus+ fecha límite",
    description: "Cierre de solicitudes Erasmus+ con dotación ampliada.",
    date: "2026-05-15",
    type: "oportunidad",
    urgent: true,
    relatedId: "opp-007",
    affectedProfiles: ["estudiante"],
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Timeline Events
// ---------------------------------------------------------------------------

const timeline: CVTimelineEvent[] = [
  { id: "tl-001", changeId: "chg-010", date: "2026-02-15", phase: "propuesta", description: "Presentación de la proposición de ley por el Ministerio de Trabajo." },
  { id: "tl-002", changeId: "chg-010", date: "2026-03-01", phase: "debate", description: "Inicio del debate en la Comisión de Trabajo del Congreso." },
  { id: "tl-003", changeId: "chg-010", date: "2026-03-15", phase: "debate", description: "Período de enmiendas abierto. 47 enmiendas presentadas." },
  { id: "tl-004", changeId: "chg-004", date: "2025-06-01", phase: "propuesta", description: "Publicación del anteproyecto de ley de facturación electrónica." },
  { id: "tl-005", changeId: "chg-004", date: "2025-09-15", phase: "debate", description: "Debate y aprobación en el Congreso con enmiendas." },
  { id: "tl-006", changeId: "chg-004", date: "2025-12-01", phase: "aprobado", description: "Publicación en el BOE. Entrada en vigor el 1 de septiembre de 2026." },
  { id: "tl-007", changeId: "chg-004", date: "2026-03-01", phase: "implementacion", description: "Inicio del período de adaptación. AEAT publica guías técnicas." },
  { id: "tl-008", changeId: "chg-007", date: "2026-01-20", phase: "propuesta", description: "Propuesta del complemento de pensiones por el Ministerio de Inclusión." },
  { id: "tl-009", changeId: "chg-007", date: "2026-02-15", phase: "debate", description: "Debate en la Comisión del Pacto de Toledo." },
  { id: "tl-010", changeId: "chg-007", date: "2026-03-01", phase: "aprobado", description: "Aprobación definitiva. Entrada en vigor el 1 de julio." },
  { id: "tl-011", changeId: "chg-009", date: "2026-04-05", phase: "propuesta", description: "Registro de la proposición de ley en el Congreso." },
  { id: "tl-012", changeId: "chg-002", date: "2026-02-10", phase: "propuesta", description: "Anteproyecto de ley presentado por el Ministerio de Trabajo." },
  { id: "tl-013", changeId: "chg-002", date: "2026-03-20", phase: "debate", description: "Inicio del debate en sesión plenaria del Congreso." },
];

// ---------------------------------------------------------------------------
// Build Function
// ---------------------------------------------------------------------------

export function buildConstitucionVivaData(): CVData {
  const activeChanges = changes.filter(
    (c) => c.phase !== "vigente"
  ).length;

  const upcomingDeadlines = changes.filter(
    (c) => c.deadlineDate && new Date(c.deadlineDate) > new Date("2026-04-11")
  ).length;

  const opportunitiesOpen = opportunities.filter(
    (o) => new Date(o.deadline) > new Date("2026-04-11")
  ).length;

  const debatesThisWeek = debates.filter((d) => {
    const dd = new Date(d.date);
    const now = new Date("2026-04-11");
    const weekEnd = new Date("2026-04-18");
    return dd >= now && dd <= weekEnd;
  }).length;

  const avgImpact = Math.round(
    changes.reduce((sum, c) => sum + c.impactScore, 0) / changes.length
  );

  return {
    profiles,
    changes,
    debates,
    opportunities,
    rights,
    territorial,
    notifications,
    timeline,
    stats: {
      totalChanges: changes.length,
      activeChanges,
      upcomingDeadlines,
      opportunitiesOpen,
      debatesThisWeek,
      averageImpact: avgImpact,
    },
  };
}
