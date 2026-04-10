/* ═══════════════════════════════════════════════════════════════════════════
   Sales Intelligence — B2B institutional procurement detection.
   Identifies which administrations will spend, contract, or change
   priorities, enabling proactive sales positioning.
   ═══════════════════════════════════════════════════════════════════════════ */

import { publicContracts, contractsSummary } from "./contracts-data";
import { stateSpending2026, territoryFiscalProfiles } from "./finance-data";
import { ministries } from "./ministerios-data";

// ── Signal & Stage Types ───────────────────────────────────────────────────

export type SignalType =
  | "presupuesto-aprobado"
  | "licitacion-inminente"
  | "plan-estrategico"
  | "convenio-marco"
  | "ampliacion-contrato"
  | "nueva-partida"
  | "boe-autorizacion"
  | "comparecencia-gasto";

export type OpportunityStage =
  | "deteccion"
  | "pre-licitacion"
  | "licitacion-abierta"
  | "adjudicacion"
  | "ejecucion";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface ProcurementSignal {
  id: string;
  title: string;
  signalType: SignalType;
  stage: OpportunityStage;
  estimatedValueM: number;
  confidence: number; // 0-100
  detectedDate: string;
  expectedDate?: string;
  buyer: string;
  buyerType: "ministerio" | "ccaa" | "ayuntamiento" | "organismo" | "empresa-publica";
  territory: string;
  sector: string;
  description: string;
  sourceSignals: string[];
  relatedContracts?: string[];
  tags: string[];
  // ── Competitive differentiators ──
  winProbability: number; // 1: AI-estimated win chance 0-100
  knownCompetitors: string[]; // 2: known competitors for this opportunity
  incumbent?: string; // 5: current incumbent for renewals
  renewalDate?: string; // 6: contract renewal calendar
  priceBenchmark?: { avgM: number; minM: number; maxM: number }; // 7: price benchmark
  oversightPolitician?: string; // 8: political influence map
  frameworkAgreement?: { name: string; endsDate: string }; // 9: acuerdo marco tracker
  subcontractingAllowed: boolean; // 10: subcontracting detection
  subcontractPct?: number;
  earlyWarningDays: number; // 13: early warning score
  decisionMaker?: { role: string; department: string }; // 14: decision maker info
  protestRisk: "bajo" | "medio" | "alto"; // 15: protest/impugnación risk
  modifications: number; // 18: contract modification tracker
}

export interface InstitutionalBuyer {
  slug: string;
  name: string;
  type: string;
  annualProcurementM: number;
  activeSignals: number;
  topSectors: string[];
  spendingTrend: "growing" | "stable" | "declining";
  avgContractSize: string;
  keyContacts?: string[];
  // ── Competitive differentiators ──
  historicalAwards: { year: number; count: number; totalM: number }[]; // 3: historical award patterns
  budgetCycleMonth: number[]; // 4: budget cycle predictions
  transparencyScore: number; // 17: procurement transparency score (0-100)
}

export interface SectorAnalytics {
  sector: string;
  count: number;
  valueM: number;
  // 12: market share estimation
  marketShare: { provider: string; sharePct: number }[];
}

export interface PipelineVelocity {
  stage: OpportunityStage;
  avgDaysInStage: number;
  avgDaysToAward: number;
}

export interface SalesIntelData {
  signals: ProcurementSignal[];
  buyers: InstitutionalBuyer[];
  stats: {
    totalSignals: number;
    totalEstimatedValueM: number;
    byStage: Record<OpportunityStage, number>;
    bySector: SectorAnalytics[];
    topBuyers: { name: string; signals: number; valueM: number }[];
    // 16: revenue forecast
    revenueForecast: { stage: string; weightedValueM: number; probability: number }[];
    // 20: deal velocity
    pipelineVelocity: PipelineVelocity[];
    // 11: geographic concentration
    geographicConcentration: { territory: string; count: number; valueM: number }[];
  };
}

// ── Procurement Signals ────────────────────────────────────────────────────

const signals: ProcurementSignal[] = [
  // Transportes — AVE & estaciones
  {
    id: "sig-001",
    title: "Licitación tramo AVE Almería–Murcia",
    signalType: "licitacion-inminente",
    stage: "pre-licitacion",
    estimatedValueM: 1120,
    confidence: 82,
    detectedDate: "2026-03-18",
    expectedDate: "2026-06-15",
    buyer: "ADIF Alta Velocidad",
    buyerType: "empresa-publica",
    territory: "andalucia",
    sector: "infraestructura-ferroviaria",
    description: "Plataforma de vía y obras de fábrica del corredor mediterráneo. Incluye 4 viaductos y 1 túnel de 6 km.",
    sourceSignals: ["PGE 2026 partida 14.501", "Comparecencia ministra 2026-02-20", "BOE autorización trazado"],
    relatedContracts: ["ct-001"],
    tags: ["AVE", "corredor-mediterraneo", "obra-civil"],
    winProbability: 45,
    knownCompetitors: ["Acciona", "FCC", "Sacyr", "Ferrovial"],
    incumbent: "Acciona Infraestructuras",
    priceBenchmark: { avgM: 980, minM: 750, maxM: 1300 },
    oversightPolitician: "Ministra de Transportes",
    frameworkAgreement: { name: "Acuerdo Marco Corredor Mediterráneo 2024-2028", endsDate: "2028-12-31" },
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 23,
    decisionMaker: { role: "Director General de Planificación", department: "ADIF Alta Velocidad" },
    protestRisk: "medio",
    modifications: 0,
  },
  {
    id: "sig-002",
    title: "Modernización integral estaciones Cercanías Madrid",
    signalType: "plan-estrategico",
    stage: "deteccion",
    estimatedValueM: 340,
    confidence: 68,
    detectedDate: "2026-03-25",
    expectedDate: "2026-09-01",
    buyer: "Renfe Operadora / ADIF",
    buyerType: "empresa-publica",
    territory: "madrid",
    sector: "infraestructura-ferroviaria",
    description: "Accesibilidad, digitalización de información al viajero, nueva señalética y mejora de vestíbulos en 28 estaciones.",
    sourceSignals: ["Plan Cercanías 2025-2030", "Informe Defensor del Pueblo 2025"],
    relatedContracts: ["ct-003"],
    tags: ["cercanías", "accesibilidad", "digitalización"],
    winProbability: 35,
    knownCompetitors: ["Indra", "Siemens Mobility", "Thales"],
    priceBenchmark: { avgM: 300, minM: 200, maxM: 450 },
    oversightPolitician: "Ministra de Transportes",
    subcontractingAllowed: true,
    subcontractPct: 40,
    earlyWarningDays: 6,
    decisionMaker: { role: "Subdirector de Estaciones", department: "Renfe Operadora" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // Interior — flota policial y vigilancia
  {
    id: "sig-003",
    title: "Renovación flota vehículos Policía Nacional y Guardia Civil",
    signalType: "presupuesto-aprobado",
    stage: "licitacion-abierta",
    estimatedValueM: 185,
    confidence: 91,
    detectedDate: "2026-02-10",
    expectedDate: "2026-05-20",
    buyer: "Ministerio del Interior",
    buyerType: "ministerio",
    territory: "espana",
    sector: "seguridad",
    description: "Adquisición de 2.400 vehículos patrulla (incluidos 600 híbridos) y 180 furgones de intervención.",
    sourceSignals: ["PGE 2026 sección 16", "BOE autorización gasto 2026-01-28"],
    tags: ["flota", "policía", "vehículos", "movilidad-sostenible"],
    winProbability: 62,
    knownCompetitors: ["Toyota España", "Stellantis", "Hyundai"],
    incumbent: "Stellantis (Peugeot)",
    renewalDate: "2026-09-30",
    priceBenchmark: { avgM: 170, minM: 140, maxM: 220 },
    oversightPolitician: "Ministro del Interior",
    subcontractingAllowed: false,
    earlyWarningDays: 59,
    decisionMaker: { role: "Subdirector General de Gestión Económica", department: "Ministerio del Interior" },
    protestRisk: "bajo",
    modifications: 1,
  },
  {
    id: "sig-004",
    title: "Sistema integrado de videovigilancia fronteras sur y este",
    signalType: "convenio-marco",
    stage: "pre-licitacion",
    estimatedValueM: 92,
    confidence: 76,
    detectedDate: "2026-03-05",
    expectedDate: "2026-07-01",
    buyer: "Ministerio del Interior",
    buyerType: "ministerio",
    territory: "espana",
    sector: "seguridad",
    description: "Red de cámaras térmicas, sensores radar y centro de mando unificado para SIVE 2.0 en costas sur y fronteras con Marruecos.",
    sourceSignals: ["Convenio Frontex 2026", "Acuerdo Consejo de Ministros 2026-02-14"],
    tags: ["vigilancia", "fronteras", "SIVE", "seguridad"],
    winProbability: 55,
    knownCompetitors: ["Indra", "Thales", "Leonardo"],
    incumbent: "Indra Sistemas",
    renewalDate: "2027-03-31",
    priceBenchmark: { avgM: 85, minM: 60, maxM: 120 },
    oversightPolitician: "Ministro del Interior",
    frameworkAgreement: { name: "Convenio Frontex Vigilancia Marítima", endsDate: "2028-06-30" },
    subcontractingAllowed: true,
    subcontractPct: 20,
    earlyWarningDays: 26,
    decisionMaker: { role: "Director General de la Policía", department: "Ministerio del Interior" },
    protestRisk: "medio",
    modifications: 2,
  },

  // Defensa — naval y ciberseguridad
  {
    id: "sig-005",
    title: "Programa F-110: fragatas de nueva generación",
    signalType: "ampliacion-contrato",
    stage: "ejecucion",
    estimatedValueM: 4320,
    confidence: 95,
    detectedDate: "2026-01-15",
    buyer: "Ministerio de Defensa / Navantia",
    buyerType: "ministerio",
    territory: "andalucia",
    sector: "defensa-naval",
    description: "Construcción de 5 fragatas F-110 en astilleros de San Fernando. Fase actual: corte de chapa de la unidad 3.",
    sourceSignals: ["Contrato vigente Navantia", "PGE Defensa programa 464A"],
    tags: ["fragatas", "Navantia", "naval", "F-110"],
    winProbability: 92,
    knownCompetitors: ["Navantia (adjudicatario)", "BAE Systems (subcontratista)"],
    incumbent: "Navantia",
    priceBenchmark: { avgM: 4000, minM: 3500, maxM: 5000 },
    oversightPolitician: "Ministra de Defensa",
    subcontractingAllowed: true,
    subcontractPct: 35,
    earlyWarningDays: 85,
    decisionMaker: { role: "Director General de Armamento (DGAM)", department: "Ministerio de Defensa" },
    protestRisk: "bajo",
    modifications: 3,
  },
  {
    id: "sig-006",
    title: "Centro de Operaciones de Ciberseguridad de las FAS",
    signalType: "nueva-partida",
    stage: "pre-licitacion",
    estimatedValueM: 68,
    confidence: 74,
    detectedDate: "2026-03-12",
    expectedDate: "2026-08-01",
    buyer: "Mando Conjunto del Ciberespacio (MCCE)",
    buyerType: "organismo",
    territory: "madrid",
    sector: "ciberseguridad",
    description: "SOC militar 24x7, plataforma threat-hunting y capacidad ofensiva ciber. Interoperabilidad OTAN.",
    sourceSignals: ["PGE 2026 nueva partida 14D", "Directiva de Defensa Nacional 2025"],
    tags: ["ciberseguridad", "defensa", "OTAN", "ciber"],
    winProbability: 48,
    knownCompetitors: ["Indra", "Telefónica Tech", "S2 Grupo", "GMV"],
    priceBenchmark: { avgM: 60, minM: 40, maxM: 90 },
    oversightPolitician: "Ministra de Defensa",
    subcontractingAllowed: true,
    subcontractPct: 25,
    earlyWarningDays: 29,
    decisionMaker: { role: "Jefe del MCCE", department: "Estado Mayor de la Defensa" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // Transformación Digital — plataforma datos y conectividad
  {
    id: "sig-007",
    title: "Plataforma Nacional de Datos Abiertos (PNDA) v3",
    signalType: "plan-estrategico",
    stage: "licitacion-abierta",
    estimatedValueM: 56,
    confidence: 85,
    detectedDate: "2026-02-22",
    expectedDate: "2026-05-15",
    buyer: "SGAD / Ministerio de Transformación Digital",
    buyerType: "organismo",
    territory: "espana",
    sector: "tecnología",
    description: "Nuevo portal datos.gob.es con API federada, catálogo de datasets con IA y cuadro de mando de reutilización.",
    sourceSignals: ["Estrategia de Datos 2026-2028", "Informe ejecución NGEU componente 11"],
    relatedContracts: ["ct-008"],
    tags: ["datos-abiertos", "API", "IA", "digitalización"],
    winProbability: 58,
    knownCompetitors: ["Everis/NTT", "Deloitte", "Atos"],
    incumbent: "Everis (NTT Data)",
    renewalDate: "2026-12-31",
    priceBenchmark: { avgM: 50, minM: 35, maxM: 70 },
    oversightPolitician: "Secretario de Estado de Digitalización",
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 37,
    decisionMaker: { role: "Director de SGAD", department: "Ministerio de Transformación Digital" },
    protestRisk: "bajo",
    modifications: 1,
  },
  {
    id: "sig-008",
    title: "Extensión de banda ancha rural — Plan UNICO II",
    signalType: "boe-autorizacion",
    stage: "licitacion-abierta",
    estimatedValueM: 520,
    confidence: 88,
    detectedDate: "2026-03-01",
    expectedDate: "2026-04-30",
    buyer: "Ministerio de Transformación Digital",
    buyerType: "ministerio",
    territory: "espana",
    sector: "telecomunicaciones",
    description: "Despliegue de fibra óptica en 4.200 municipios de menos de 5.000 habitantes. Objetivo: 100% cobertura 100 Mbps.",
    sourceSignals: ["BOE 2026-02-28 autorización UNICO II", "NGEU componente 15"],
    tags: ["banda-ancha", "rural", "fibra", "NGEU"],
    winProbability: 40,
    knownCompetitors: ["Telefónica", "MásMóvil", "Orange", "Adamo"],
    incumbent: "Telefónica de España",
    priceBenchmark: { avgM: 480, minM: 350, maxM: 600 },
    oversightPolitician: "Ministro de Transformación Digital",
    subcontractingAllowed: true,
    subcontractPct: 50,
    earlyWarningDays: 40,
    decisionMaker: { role: "Secretario de Estado de Telecomunicaciones", department: "Ministerio de Transformación Digital" },
    protestRisk: "alto",
    modifications: 0,
  },

  // Sanidad — equipamiento y historia clínica
  {
    id: "sig-009",
    title: "Renovación equipamiento de diagnóstico por imagen (TAC/RM)",
    signalType: "presupuesto-aprobado",
    stage: "pre-licitacion",
    estimatedValueM: 280,
    confidence: 79,
    detectedDate: "2026-03-10",
    expectedDate: "2026-06-30",
    buyer: "Ministerio de Sanidad / INGESA",
    buyerType: "ministerio",
    territory: "espana",
    sector: "sanidad",
    description: "Sustitución de 120 TAC y 65 RM en hospitales del SNS con antigüedad > 10 años. Acuerdo marco multiproveedor.",
    sourceSignals: ["PGE 2026 sección 26", "Plan de Renovación Tecnológica del SNS"],
    relatedContracts: ["ct-006"],
    tags: ["equipamiento", "diagnóstico", "hospital", "tecnología-sanitaria"],
    winProbability: 52,
    knownCompetitors: ["Siemens Healthineers", "GE Healthcare", "Philips", "Canon Medical"],
    incumbent: "Siemens Healthineers",
    renewalDate: "2026-12-15",
    priceBenchmark: { avgM: 260, minM: 200, maxM: 350 },
    oversightPolitician: "Ministra de Sanidad",
    frameworkAgreement: { name: "Acuerdo Marco INGESA Equipamiento 2023-2027", endsDate: "2027-06-30" },
    subcontractingAllowed: false,
    earlyWarningDays: 21,
    decisionMaker: { role: "Director General INGESA", department: "Ministerio de Sanidad" },
    protestRisk: "medio",
    modifications: 0,
  },
  {
    id: "sig-010",
    title: "Historia Clínica Digital interoperable — fase II",
    signalType: "ampliacion-contrato",
    stage: "ejecucion",
    estimatedValueM: 74,
    confidence: 90,
    detectedDate: "2026-01-20",
    buyer: "Ministerio de Sanidad",
    buyerType: "ministerio",
    territory: "espana",
    sector: "sanidad-digital",
    description: "Extensión del contrato de historia clínica unificada a 8 CCAA restantes. Interoperabilidad HL7 FHIR.",
    sourceSignals: ["Contrato ct-006 cláusula de ampliación", "Acuerdo CISNS 2026-01-15"],
    relatedContracts: ["ct-006"],
    tags: ["historia-clínica", "interoperabilidad", "salud-digital"],
    winProbability: 78,
    knownCompetitors: ["Deloitte", "Accenture", "Indra"],
    incumbent: "Deloitte Consulting",
    priceBenchmark: { avgM: 68, minM: 50, maxM: 95 },
    oversightPolitician: "Ministra de Sanidad",
    subcontractingAllowed: true,
    subcontractPct: 20,
    earlyWarningDays: 71,
    decisionMaker: { role: "Subdirector General de TI Sanitarias", department: "Ministerio de Sanidad" },
    protestRisk: "bajo",
    modifications: 2,
  },

  // CCAA — Madrid metro
  {
    id: "sig-011",
    title: "Extensión Línea 11 Metro de Madrid (Valdebebas–Conde de Casal)",
    signalType: "licitacion-inminente",
    stage: "pre-licitacion",
    estimatedValueM: 1850,
    confidence: 72,
    detectedDate: "2026-03-20",
    expectedDate: "2026-10-01",
    buyer: "Comunidad de Madrid / Metro de Madrid",
    buyerType: "ccaa",
    territory: "madrid",
    sector: "transporte-urbano",
    description: "11,2 km de túnel, 8 nuevas estaciones. Conexión noreste de Madrid con el centro. Estudio informativo aprobado.",
    sourceSignals: ["Presupuestos CAM 2026", "Comparecencia consejero Transportes"],
    tags: ["metro", "Madrid", "transporte", "obra-civil"],
    winProbability: 38,
    knownCompetitors: ["FCC", "Dragados", "Acciona", "OHL"],
    priceBenchmark: { avgM: 1600, minM: 1200, maxM: 2200 },
    oversightPolitician: "Consejero de Transportes CAM",
    subcontractingAllowed: true,
    subcontractPct: 35,
    earlyWarningDays: 11,
    decisionMaker: { role: "Consejero Delegado", department: "Metro de Madrid" },
    protestRisk: "alto",
    modifications: 0,
  },
  {
    id: "sig-012",
    title: "Remodelación de la Puerta del Sol y entorno peatonal",
    signalType: "presupuesto-aprobado",
    stage: "licitacion-abierta",
    estimatedValueM: 86,
    confidence: 83,
    detectedDate: "2026-02-15",
    expectedDate: "2026-05-01",
    buyer: "Ayuntamiento de Madrid",
    buyerType: "ayuntamiento",
    territory: "madrid",
    sector: "urbanismo",
    description: "Peatonalización completa, nueva pavimentación, iluminación LED, mobiliario urbano y drenaje sostenible.",
    sourceSignals: ["Presupuesto municipal Madrid 2026", "Acuerdo pleno 2026-01-30"],
    tags: ["peatonalización", "urbanismo", "smart-city"],
    winProbability: 60,
    knownCompetitors: ["Dragados", "SANJOSE", "Ferrovial"],
    priceBenchmark: { avgM: 80, minM: 55, maxM: 110 },
    oversightPolitician: "Alcalde de Madrid",
    subcontractingAllowed: true,
    subcontractPct: 25,
    earlyWarningDays: 54,
    decisionMaker: { role: "Concejal de Obras y Equipamientos", department: "Ayuntamiento de Madrid" },
    protestRisk: "medio",
    modifications: 0,
  },

  // CCAA — Cataluña infraestructura hídrica
  {
    id: "sig-013",
    title: "Plan de emergencia hídrica del Ter — desaladora y reutilización",
    signalType: "plan-estrategico",
    stage: "deteccion",
    estimatedValueM: 420,
    confidence: 65,
    detectedDate: "2026-03-28",
    expectedDate: "2027-01-15",
    buyer: "Agència Catalana de l'Aigua (ACA)",
    buyerType: "ccaa",
    territory: "cataluna",
    sector: "agua",
    description: "Nueva desaladora del Besòs (60 hm3/año), ampliación EDAR del Prat para reutilización y conexión con el sistema Ter-Llobregat.",
    sourceSignals: ["Decreto sequía Generalitat 2026-03", "Plan Hidrológico de cuenca"],
    relatedContracts: ["ct-004"],
    tags: ["agua", "desalación", "sequía", "reutilización"],
    winProbability: 30,
    knownCompetitors: ["Acciona Agua", "Sacyr Agua", "Veolia", "SUEZ"],
    priceBenchmark: { avgM: 380, minM: 280, maxM: 500 },
    oversightPolitician: "Conseller de Territori (Generalitat)",
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 3,
    decisionMaker: { role: "Director de la ACA", department: "Agència Catalana de l'Aigua" },
    protestRisk: "medio",
    modifications: 0,
  },
  {
    id: "sig-014",
    title: "Modernización del Port de Barcelona — muelle energético",
    signalType: "convenio-marco",
    stage: "pre-licitacion",
    estimatedValueM: 310,
    confidence: 71,
    detectedDate: "2026-03-15",
    expectedDate: "2026-09-01",
    buyer: "Autoritat Portuària de Barcelona",
    buyerType: "organismo",
    territory: "cataluna",
    sector: "infraestructura-portuaria",
    description: "Electrificación de muelles, instalación de OPS (cold ironing) y hub de hidrógeno verde para transporte marítimo.",
    sourceSignals: ["Plan Estratégico del Puerto 2025-2030", "Convenio MiTMA-APB"],
    tags: ["puerto", "hidrógeno", "electrificación", "sostenibilidad"],
    winProbability: 42,
    knownCompetitors: ["Iberdrola", "Acciona Energía", "Sacyr"],
    priceBenchmark: { avgM: 290, minM: 220, maxM: 380 },
    oversightPolitician: "Ministro de Transportes (tutela puertos)",
    frameworkAgreement: { name: "Convenio MiTMA-APB Electrificación Portuaria", endsDate: "2029-12-31" },
    subcontractingAllowed: true,
    subcontractPct: 40,
    earlyWarningDays: 16,
    decisionMaker: { role: "Director General", department: "Autoritat Portuària de Barcelona" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // CCAA — Andalucía parques solares
  {
    id: "sig-015",
    title: "Macro-parques solares fotovoltaicos zona Guadix–Baza",
    signalType: "boe-autorizacion",
    stage: "licitacion-abierta",
    estimatedValueM: 640,
    confidence: 86,
    detectedDate: "2026-02-28",
    expectedDate: "2026-04-15",
    buyer: "Junta de Andalucía / Agencia Andaluza de la Energía",
    buyerType: "ccaa",
    territory: "andalucia",
    sector: "energía-renovable",
    description: "3 plantas fotovoltaicas de 400 MW total con almacenamiento en baterías (200 MWh). DIA favorable.",
    sourceSignals: ["BOE autorización instalación", "DIA favorable 2026-01-20", "PNIEC objetivo solar 2026"],
    tags: ["solar", "fotovoltaica", "baterías", "renovable"],
    winProbability: 50,
    knownCompetitors: ["Iberdrola", "Endesa", "Naturgy", "Grenergy"],
    priceBenchmark: { avgM: 580, minM: 450, maxM: 750 },
    oversightPolitician: "Consejero de Industria (Junta Andalucía)",
    subcontractingAllowed: true,
    subcontractPct: 45,
    earlyWarningDays: 41,
    decisionMaker: { role: "Director Agencia Andaluza de la Energía", department: "Junta de Andalucía" },
    protestRisk: "medio",
    modifications: 0,
  },
  {
    id: "sig-016",
    title: "Hospital de alta resolución de la Costa del Sol oriental",
    signalType: "nueva-partida",
    stage: "deteccion",
    estimatedValueM: 165,
    confidence: 62,
    detectedDate: "2026-04-02",
    expectedDate: "2027-03-01",
    buyer: "Servicio Andaluz de Salud (SAS)",
    buyerType: "ccaa",
    territory: "andalucia",
    sector: "sanidad",
    description: "Nuevo centro hospitalario de 250 camas en la comarca de Axarquía. Presupuesto autonómico reservado.",
    sourceSignals: ["Presupuestos Junta Andalucía 2026", "Comparecencia consejero Salud"],
    relatedContracts: ["ct-010"],
    tags: ["hospital", "sanidad", "infraestructura"],
    winProbability: 28,
    knownCompetitors: ["FCC", "Sacyr", "Acciona", "SANJOSE"],
    priceBenchmark: { avgM: 150, minM: 110, maxM: 200 },
    oversightPolitician: "Consejero de Salud (Junta Andalucía)",
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 0,
    decisionMaker: { role: "Director Gerente SAS", department: "Servicio Andaluz de Salud" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // Ayuntamientos — smart city
  {
    id: "sig-017",
    title: "Barcelona Superilles Digitals — sensórica y gestión urbana",
    signalType: "plan-estrategico",
    stage: "licitacion-abierta",
    estimatedValueM: 48,
    confidence: 80,
    detectedDate: "2026-03-08",
    expectedDate: "2026-05-10",
    buyer: "Ajuntament de Barcelona",
    buyerType: "ayuntamiento",
    territory: "cataluna",
    sector: "smart-city",
    description: "Red de 15.000 sensores IoT para calidad del aire, ruido, tráfico y riego. Plataforma CityOS actualizada.",
    sourceSignals: ["Presupuesto BCN 2026", "Plan Digital Barcelona 2025-2028"],
    tags: ["smart-city", "IoT", "sensores", "urbanismo"],
    winProbability: 55,
    knownCompetitors: ["Cellnex", "Worldsensing", "Cisco"],
    incumbent: "Worldsensing",
    renewalDate: "2027-01-31",
    priceBenchmark: { avgM: 42, minM: 30, maxM: 60 },
    oversightPolitician: "Teniente de alcalde de Ecología Urbana",
    subcontractingAllowed: true,
    subcontractPct: 35,
    earlyWarningDays: 33,
    decisionMaker: { role: "Gerente de Ecología Urbana", department: "Ajuntament de Barcelona" },
    protestRisk: "bajo",
    modifications: 1,
  },
  {
    id: "sig-018",
    title: "Plataforma smart city Valencia — gemelo digital",
    signalType: "nueva-partida",
    stage: "deteccion",
    estimatedValueM: 32,
    confidence: 63,
    detectedDate: "2026-04-01",
    expectedDate: "2026-11-01",
    buyer: "Ajuntament de València",
    buyerType: "ayuntamiento",
    territory: "comunitat-valenciana",
    sector: "smart-city",
    description: "Gemelo digital de la ciudad para simulación de movilidad, inundaciones y planificación urbana.",
    sourceSignals: ["MOU con universidad + empresa tech", "Plan SmartVLC 2026"],
    tags: ["smart-city", "gemelo-digital", "simulación"],
    winProbability: 33,
    knownCompetitors: ["Indra", "Deloitte", "Bentley Systems"],
    priceBenchmark: { avgM: 28, minM: 18, maxM: 45 },
    oversightPolitician: "Concejal de Innovación (València)",
    subcontractingAllowed: true,
    subcontractPct: 40,
    earlyWarningDays: 0,
    decisionMaker: { role: "Director de Smart City", department: "Ajuntament de València" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // Ayuntamientos — gestión residuos
  {
    id: "sig-019",
    title: "Nuevo contrato integral de recogida de residuos — Sevilla",
    signalType: "licitacion-inminente",
    stage: "pre-licitacion",
    estimatedValueM: 420,
    confidence: 88,
    detectedDate: "2026-03-22",
    expectedDate: "2026-06-01",
    buyer: "Ayuntamiento de Sevilla / LIPASAM",
    buyerType: "ayuntamiento",
    territory: "andalucia",
    sector: "gestión-residuos",
    description: "Contrato a 10 años para recogida, limpieza viaria y gestión de puntos limpios. Incluye flota 100% eléctrica.",
    sourceSignals: ["Fin contrato vigente 2026-12-31", "Pliego borrador publicado"],
    tags: ["residuos", "limpieza", "flota-eléctrica", "concesión"],
    winProbability: 65,
    knownCompetitors: ["FCC Medio Ambiente", "Urbaser", "Valoriza (Sacyr)"],
    incumbent: "LIPASAM (empresa municipal)",
    renewalDate: "2026-12-31",
    priceBenchmark: { avgM: 400, minM: 320, maxM: 500 },
    oversightPolitician: "Alcalde de Sevilla",
    subcontractingAllowed: true,
    subcontractPct: 15,
    earlyWarningDays: 9,
    decisionMaker: { role: "Director Gerente LIPASAM", department: "Ayuntamiento de Sevilla" },
    protestRisk: "alto",
    modifications: 0,
  },
  {
    id: "sig-020",
    title: "Planta de compostaje y biogás — área metropolitana de Bilbao",
    signalType: "presupuesto-aprobado",
    stage: "licitacion-abierta",
    estimatedValueM: 78,
    confidence: 84,
    detectedDate: "2026-02-18",
    expectedDate: "2026-05-15",
    buyer: "Consorcio de Aguas Bilbao Bizkaia",
    buyerType: "organismo",
    territory: "pais-vasco",
    sector: "gestión-residuos",
    description: "Planta de tratamiento de biorresiduos (80.000 t/año) con generación de biogás para inyección en red.",
    sourceSignals: ["Presupuestos Diputación Bizkaia 2026", "Plan de Residuos Euskadi"],
    tags: ["residuos", "biogás", "economía-circular"],
    winProbability: 58,
    knownCompetitors: ["FCC", "Urbaser", "Cespa"],
    priceBenchmark: { avgM: 70, minM: 50, maxM: 95 },
    oversightPolitician: "Diputado General de Bizkaia",
    subcontractingAllowed: true,
    subcontractPct: 20,
    earlyWarningDays: 51,
    decisionMaker: { role: "Director del Consorcio", department: "Consorcio de Aguas Bilbao Bizkaia" },
    protestRisk: "bajo",
    modifications: 0,
  },

  // Ayuntamientos — autobuses eléctricos
  {
    id: "sig-021",
    title: "Flota de 250 autobuses eléctricos — EMT Madrid",
    signalType: "comparecencia-gasto",
    stage: "adjudicacion",
    estimatedValueM: 210,
    confidence: 93,
    detectedDate: "2026-01-28",
    buyer: "EMT Madrid (Empresa Municipal de Transportes)",
    buyerType: "empresa-publica",
    territory: "madrid",
    sector: "transporte-urbano",
    description: "Suministro de 250 autobuses articulados eléctricos (18 m). Incluye 5 electrolineras en cocheras municipales.",
    sourceSignals: ["Acuerdo junta EMT 2026-01-25", "Pliego publicado PLACSP"],
    tags: ["autobús-eléctrico", "EMT", "transporte", "ZBE"],
    winProbability: 72,
    knownCompetitors: ["BYD", "Irizar", "Solaris", "Mercedes-Benz eCitaro"],
    incumbent: "Irizar (lote anterior)",
    priceBenchmark: { avgM: 190, minM: 150, maxM: 250 },
    oversightPolitician: "Alcalde de Madrid",
    subcontractingAllowed: false,
    earlyWarningDays: 72,
    decisionMaker: { role: "Director Gerente EMT", department: "EMT Madrid" },
    protestRisk: "bajo",
    modifications: 1,
  },
  {
    id: "sig-022",
    title: "Renovación flota autobuses TMB Barcelona",
    signalType: "licitacion-inminente",
    stage: "pre-licitacion",
    estimatedValueM: 175,
    confidence: 78,
    detectedDate: "2026-03-14",
    expectedDate: "2026-07-01",
    buyer: "Transports Metropolitans de Barcelona (TMB)",
    buyerType: "empresa-publica",
    territory: "cataluna",
    sector: "transporte-urbano",
    description: "200 autobuses eléctricos e hidrógeno para completar la descarbonización de la flota antes de 2030.",
    sourceSignals: ["Plan de Transición Energética TMB", "Subvención NGEU movilidad"],
    tags: ["autobús-eléctrico", "hidrógeno", "transporte"],
    winProbability: 40,
    knownCompetitors: ["BYD", "Irizar", "Solaris", "CaetanoBus"],
    priceBenchmark: { avgM: 160, minM: 120, maxM: 210 },
    oversightPolitician: "Presidente de l'ATM (Barcelona)",
    subcontractingAllowed: false,
    earlyWarningDays: 17,
    decisionMaker: { role: "Director General TMB", department: "Transports Metropolitans de Barcelona" },
    protestRisk: "medio",
    modifications: 0,
  },

  // Más señales ministeriales
  {
    id: "sig-023",
    title: "Programa de Inteligencia Artificial para la AGE",
    signalType: "plan-estrategico",
    stage: "deteccion",
    estimatedValueM: 145,
    confidence: 70,
    detectedDate: "2026-04-05",
    expectedDate: "2027-01-01",
    buyer: "SEDIA / Ministerio de Transformación Digital",
    buyerType: "organismo",
    territory: "espana",
    sector: "tecnología",
    description: "Despliegue de modelos LLM soberanos, sandbox regulatorio IA y formación a 50.000 funcionarios.",
    sourceSignals: ["Estrategia Nacional IA 2026", "Discurso presidente SEDIA en MWC"],
    tags: ["IA", "LLM", "digitalización", "formación"],
    winProbability: 35,
    knownCompetitors: ["Indra", "Telefónica Tech", "IBM", "Microsoft"],
    priceBenchmark: { avgM: 130, minM: 90, maxM: 180 },
    oversightPolitician: "Secretario de Estado de Digitalización e IA",
    subcontractingAllowed: true,
    subcontractPct: 35,
    earlyWarningDays: 0,
    decisionMaker: { role: "Director de SEDIA", department: "Ministerio de Transformación Digital" },
    protestRisk: "medio",
    modifications: 0,
  },
  {
    id: "sig-024",
    title: "Convenio marco mantenimiento carreteras estatales 2026-2030",
    signalType: "convenio-marco",
    stage: "licitacion-abierta",
    estimatedValueM: 890,
    confidence: 87,
    detectedDate: "2026-02-05",
    expectedDate: "2026-04-20",
    buyer: "Ministerio de Transportes / DG Carreteras",
    buyerType: "ministerio",
    territory: "espana",
    sector: "infraestructura-viaria",
    description: "Conservación y explotación de 26.000 km de la Red de Carreteras del Estado. 12 lotes territoriales.",
    sourceSignals: ["Fin convenio vigente 2026-06-30", "Pliego borrador en consulta pública"],
    tags: ["carreteras", "mantenimiento", "conservación"],
    winProbability: 48,
    knownCompetitors: ["FCC", "Sacyr", "Acciona", "Ferrovial", "COMSA"],
    incumbent: "Varias UTE (12 lotes)",
    renewalDate: "2026-06-30",
    priceBenchmark: { avgM: 820, minM: 650, maxM: 1000 },
    oversightPolitician: "Ministra de Transportes",
    frameworkAgreement: { name: "Convenio Marco Conservación RCE 2020-2026", endsDate: "2026-06-30" },
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 64,
    decisionMaker: { role: "Director General de Carreteras", department: "Ministerio de Transportes" },
    protestRisk: "alto",
    modifications: 4,
  },
  {
    id: "sig-025",
    title: "Sistema Nacional de Alerta Temprana ante catástrofes (ES-Alert v2)",
    signalType: "boe-autorizacion",
    stage: "pre-licitacion",
    estimatedValueM: 42,
    confidence: 81,
    detectedDate: "2026-03-30",
    expectedDate: "2026-06-15",
    buyer: "Dirección General de Protección Civil",
    buyerType: "organismo",
    territory: "espana",
    sector: "seguridad",
    description: "Mejora de ES-Alert: integración con AEMET, geolocalización precisa y canal multilingüe. Post-DANA.",
    sourceSignals: ["BOE autorización 2026-03-28", "Informe post-DANA 2024 recomendaciones"],
    tags: ["protección-civil", "alertas", "DANA", "emergencias"],
    winProbability: 60,
    knownCompetitors: ["Everbridge", "Telefónica", "Indra"],
    incumbent: "Telefónica (ES-Alert v1)",
    renewalDate: "2027-06-30",
    priceBenchmark: { avgM: 38, minM: 25, maxM: 55 },
    oversightPolitician: "Ministro del Interior",
    subcontractingAllowed: true,
    subcontractPct: 25,
    earlyWarningDays: 1,
    decisionMaker: { role: "Director General de Protección Civil", department: "Ministerio del Interior" },
    protestRisk: "bajo",
    modifications: 0,
  },
  {
    id: "sig-026",
    title: "Parque eólico marino flotante Tramuntana (Cataluña)",
    signalType: "nueva-partida",
    stage: "deteccion",
    estimatedValueM: 780,
    confidence: 58,
    detectedDate: "2026-04-08",
    expectedDate: "2027-06-01",
    buyer: "Ministerio para la Transición Ecológica",
    buyerType: "ministerio",
    territory: "cataluna",
    sector: "energía-renovable",
    description: "Primer parque eólico flotante a gran escala en el Mediterráneo. 500 MW. POEM aprobado, pendiente DIA.",
    sourceSignals: ["POEM 2023 zona apta aprobada", "PNIEC 2030 objetivo eólico marino"],
    tags: ["eólica-marina", "renovable", "flotante", "energía"],
    winProbability: 22,
    knownCompetitors: ["Iberdrola", "Naturgy", "Ocean Winds (EDPR+Engie)", "BlueFloat"],
    priceBenchmark: { avgM: 700, minM: 550, maxM: 900 },
    oversightPolitician: "Vicepresidenta tercera (Transición Ecológica)",
    subcontractingAllowed: true,
    subcontractPct: 40,
    earlyWarningDays: 0,
    decisionMaker: { role: "Director General de Política Energética", department: "MITECO" },
    protestRisk: "alto",
    modifications: 0,
  },
  {
    id: "sig-027",
    title: "Plataforma de contratación electrónica unificada CCAA",
    signalType: "convenio-marco",
    stage: "deteccion",
    estimatedValueM: 38,
    confidence: 66,
    detectedDate: "2026-04-03",
    expectedDate: "2026-12-01",
    buyer: "Ministerio de Hacienda / IGAE",
    buyerType: "ministerio",
    territory: "espana",
    sector: "tecnología",
    description: "Interconexión de las plataformas de contratación autonómicas con PLACSP. Estándar eForms UE.",
    sourceSignals: ["Directiva UE 2024/XXXX transposición", "Acuerdo CPFF 2026-03"],
    tags: ["e-procurement", "contratación", "digitalización"],
    winProbability: 45,
    knownCompetitors: ["Pixelware", "Vortal", "Jaggaer"],
    incumbent: "Pixelware (PLACSP actual)",
    renewalDate: "2027-12-31",
    priceBenchmark: { avgM: 34, minM: 22, maxM: 50 },
    oversightPolitician: "Ministra de Hacienda",
    subcontractingAllowed: true,
    subcontractPct: 30,
    earlyWarningDays: 0,
    decisionMaker: { role: "Interventor General (IGAE)", department: "Ministerio de Hacienda" },
    protestRisk: "bajo",
    modifications: 0,
  },
  {
    id: "sig-028",
    title: "Red de puntos de recarga ultra-rápida en corredores nacionales",
    signalType: "presupuesto-aprobado",
    stage: "licitacion-abierta",
    estimatedValueM: 195,
    confidence: 85,
    detectedDate: "2026-02-12",
    expectedDate: "2026-04-25",
    buyer: "IDAE / Ministerio para la Transición Ecológica",
    buyerType: "organismo",
    territory: "espana",
    sector: "movilidad-eléctrica",
    description: "800 puntos de recarga ultra-rápida (>150 kW) en autopistas y autovías. Fondos Plan MOVES infraestructura.",
    sourceSignals: ["PGE 2026 IDAE", "AFIR Reglamento UE cumplimiento"],
    tags: ["recarga", "vehículo-eléctrico", "infraestructura"],
    winProbability: 55,
    knownCompetitors: ["Iberdrola", "Repsol", "Endesa X", "IONITY"],
    priceBenchmark: { avgM: 180, minM: 140, maxM: 230 },
    oversightPolitician: "Vicepresidenta tercera (Transición Ecológica)",
    subcontractingAllowed: true,
    subcontractPct: 35,
    earlyWarningDays: 57,
    decisionMaker: { role: "Director General IDAE", department: "IDAE / MITECO" },
    protestRisk: "medio",
    modifications: 0,
  },
];

// ── Institutional Buyers ───────────────────────────────────────────────────

const buyers: InstitutionalBuyer[] = [
  {
    slug: "min-transportes",
    name: "Ministerio de Transportes y Movilidad Sostenible",
    type: "ministerio",
    annualProcurementM: 8400,
    activeSignals: 4,
    topSectors: ["infraestructura-ferroviaria", "infraestructura-viaria", "transporte-urbano"],
    spendingTrend: "growing",
    avgContractSize: "120-500 M€",
    keyContacts: ["Ministra de Transportes", "Secretario de Estado de Transportes", "Presidente ADIF"],
    historicalAwards: [
      { year: 2023, count: 312, totalM: 6800 },
      { year: 2024, count: 345, totalM: 7500 },
      { year: 2025, count: 368, totalM: 8100 },
    ],
    budgetCycleMonth: [1, 3, 6, 9],
    transparencyScore: 78,
  },
  {
    slug: "min-interior",
    name: "Ministerio del Interior",
    type: "ministerio",
    annualProcurementM: 2100,
    activeSignals: 3,
    topSectors: ["seguridad", "tecnología", "flota-vehículos"],
    spendingTrend: "growing",
    avgContractSize: "40-150 M€",
    keyContacts: ["Ministro del Interior", "DG Policía", "DG Guardia Civil"],
    historicalAwards: [
      { year: 2023, count: 189, totalM: 1800 },
      { year: 2024, count: 201, totalM: 1950 },
      { year: 2025, count: 215, totalM: 2050 },
    ],
    budgetCycleMonth: [2, 5, 10],
    transparencyScore: 65,
  },
  {
    slug: "min-defensa",
    name: "Ministerio de Defensa",
    type: "ministerio",
    annualProcurementM: 4800,
    activeSignals: 2,
    topSectors: ["defensa-naval", "ciberseguridad", "aeronáutica"],
    spendingTrend: "growing",
    avgContractSize: "200-1000 M€",
    keyContacts: ["Ministra de Defensa", "SEDEF", "DGAM"],
    historicalAwards: [
      { year: 2023, count: 142, totalM: 4200 },
      { year: 2024, count: 155, totalM: 4500 },
      { year: 2025, count: 160, totalM: 4700 },
    ],
    budgetCycleMonth: [1, 4, 7],
    transparencyScore: 52,
  },
  {
    slug: "min-digital",
    name: "Ministerio de Transformación Digital",
    type: "ministerio",
    annualProcurementM: 3200,
    activeSignals: 4,
    topSectors: ["tecnología", "telecomunicaciones", "IA"],
    spendingTrend: "growing",
    avgContractSize: "30-200 M€",
    keyContacts: ["Ministro de Transformación Digital", "Secretario de Estado de Digitalización"],
    historicalAwards: [
      { year: 2023, count: 265, totalM: 2800 },
      { year: 2024, count: 298, totalM: 3100 },
      { year: 2025, count: 310, totalM: 3200 },
    ],
    budgetCycleMonth: [2, 6, 9, 11],
    transparencyScore: 85,
  },
  {
    slug: "min-sanidad",
    name: "Ministerio de Sanidad",
    type: "ministerio",
    annualProcurementM: 1600,
    activeSignals: 2,
    topSectors: ["sanidad", "sanidad-digital", "equipamiento"],
    spendingTrend: "stable",
    avgContractSize: "20-100 M€",
    keyContacts: ["Ministra de Sanidad", "DG Salud Pública"],
    historicalAwards: [
      { year: 2023, count: 178, totalM: 1400 },
      { year: 2024, count: 185, totalM: 1500 },
      { year: 2025, count: 192, totalM: 1580 },
    ],
    budgetCycleMonth: [3, 6, 10],
    transparencyScore: 82,
  },
  {
    slug: "min-transicion",
    name: "Ministerio para la Transición Ecológica",
    type: "ministerio",
    annualProcurementM: 2800,
    activeSignals: 3,
    topSectors: ["energía-renovable", "agua", "movilidad-eléctrica"],
    spendingTrend: "growing",
    avgContractSize: "50-300 M€",
    keyContacts: ["Vicepresidenta tercera", "Secretaria de Estado de Medio Ambiente"],
    historicalAwards: [
      { year: 2023, count: 220, totalM: 2400 },
      { year: 2024, count: 245, totalM: 2650 },
      { year: 2025, count: 260, totalM: 2800 },
    ],
    budgetCycleMonth: [1, 4, 7, 10],
    transparencyScore: 80,
  },
  {
    slug: "min-hacienda",
    name: "Ministerio de Hacienda",
    type: "ministerio",
    annualProcurementM: 980,
    activeSignals: 1,
    topSectors: ["tecnología", "fiscalización", "e-procurement"],
    spendingTrend: "stable",
    avgContractSize: "15-80 M€",
    historicalAwards: [
      { year: 2023, count: 310, totalM: 880 },
      { year: 2024, count: 320, totalM: 920 },
      { year: 2025, count: 335, totalM: 960 },
    ],
    budgetCycleMonth: [1, 6, 10],
    transparencyScore: 88,
  },
  {
    slug: "ccaa-madrid",
    name: "Comunidad de Madrid",
    type: "ccaa",
    annualProcurementM: 6200,
    activeSignals: 2,
    topSectors: ["transporte-urbano", "sanidad", "infraestructura"],
    spendingTrend: "growing",
    avgContractSize: "50-400 M€",
    keyContacts: ["Presidenta CAM", "Consejero de Transportes"],
    historicalAwards: [
      { year: 2023, count: 420, totalM: 5600 },
      { year: 2024, count: 445, totalM: 5900 },
      { year: 2025, count: 460, totalM: 6100 },
    ],
    budgetCycleMonth: [2, 5, 9, 11],
    transparencyScore: 72,
  },
  {
    slug: "ccaa-cataluna",
    name: "Generalitat de Catalunya",
    type: "ccaa",
    annualProcurementM: 5800,
    activeSignals: 3,
    topSectors: ["agua", "infraestructura-portuaria", "smart-city"],
    spendingTrend: "stable",
    avgContractSize: "40-300 M€",
    keyContacts: ["President de la Generalitat", "Conseller Territori"],
    historicalAwards: [
      { year: 2023, count: 390, totalM: 5200 },
      { year: 2024, count: 405, totalM: 5500 },
      { year: 2025, count: 415, totalM: 5700 },
    ],
    budgetCycleMonth: [1, 4, 7, 10],
    transparencyScore: 75,
  },
  {
    slug: "ccaa-andalucia",
    name: "Junta de Andalucía",
    type: "ccaa",
    annualProcurementM: 5400,
    activeSignals: 3,
    topSectors: ["energía-renovable", "sanidad", "infraestructura"],
    spendingTrend: "growing",
    avgContractSize: "30-250 M€",
    keyContacts: ["Presidente Junta", "Consejero de Hacienda"],
    historicalAwards: [
      { year: 2023, count: 350, totalM: 4800 },
      { year: 2024, count: 380, totalM: 5100 },
      { year: 2025, count: 395, totalM: 5300 },
    ],
    budgetCycleMonth: [2, 5, 9],
    transparencyScore: 70,
  },
  {
    slug: "ccaa-pais-vasco",
    name: "Gobierno Vasco / Eusko Jaurlaritza",
    type: "ccaa",
    annualProcurementM: 3100,
    activeSignals: 1,
    topSectors: ["gestión-residuos", "industria", "innovación"],
    spendingTrend: "stable",
    avgContractSize: "20-150 M€",
    historicalAwards: [
      { year: 2023, count: 280, totalM: 2800 },
      { year: 2024, count: 295, totalM: 3000 },
      { year: 2025, count: 305, totalM: 3050 },
    ],
    budgetCycleMonth: [3, 6, 10],
    transparencyScore: 83,
  },
  {
    slug: "ccaa-valencia",
    name: "Generalitat Valenciana",
    type: "ccaa",
    annualProcurementM: 4200,
    activeSignals: 1,
    topSectors: ["smart-city", "agua", "transporte"],
    spendingTrend: "stable",
    avgContractSize: "25-200 M€",
    historicalAwards: [
      { year: 2023, count: 310, totalM: 3800 },
      { year: 2024, count: 325, totalM: 4000 },
      { year: 2025, count: 340, totalM: 4150 },
    ],
    budgetCycleMonth: [2, 6, 9],
    transparencyScore: 68,
  },
  {
    slug: "ayto-madrid",
    name: "Ayuntamiento de Madrid",
    type: "ayuntamiento",
    annualProcurementM: 4800,
    activeSignals: 2,
    topSectors: ["urbanismo", "transporte-urbano", "smart-city"],
    spendingTrend: "growing",
    avgContractSize: "30-200 M€",
    keyContacts: ["Alcalde de Madrid", "Concejal de Urbanismo"],
    historicalAwards: [
      { year: 2023, count: 520, totalM: 4300 },
      { year: 2024, count: 550, totalM: 4600 },
      { year: 2025, count: 570, totalM: 4750 },
    ],
    budgetCycleMonth: [1, 4, 7, 10],
    transparencyScore: 76,
  },
  {
    slug: "ayto-barcelona",
    name: "Ajuntament de Barcelona",
    type: "ayuntamiento",
    annualProcurementM: 3600,
    activeSignals: 1,
    topSectors: ["smart-city", "movilidad", "urbanismo"],
    spendingTrend: "stable",
    avgContractSize: "20-150 M€",
    keyContacts: ["Alcalde de Barcelona", "Teniente de alcalde de Ecología"],
    historicalAwards: [
      { year: 2023, count: 380, totalM: 3200 },
      { year: 2024, count: 395, totalM: 3400 },
      { year: 2025, count: 410, totalM: 3550 },
    ],
    budgetCycleMonth: [2, 5, 9, 11],
    transparencyScore: 81,
  },
  {
    slug: "ayto-sevilla",
    name: "Ayuntamiento de Sevilla",
    type: "ayuntamiento",
    annualProcurementM: 1200,
    activeSignals: 1,
    topSectors: ["gestión-residuos", "urbanismo", "movilidad"],
    spendingTrend: "stable",
    avgContractSize: "15-80 M€",
    historicalAwards: [
      { year: 2023, count: 210, totalM: 1050 },
      { year: 2024, count: 225, totalM: 1120 },
      { year: 2025, count: 235, totalM: 1180 },
    ],
    budgetCycleMonth: [3, 6, 10],
    transparencyScore: 71,
  },
  {
    slug: "ayto-valencia",
    name: "Ajuntament de València",
    type: "ayuntamiento",
    annualProcurementM: 1100,
    activeSignals: 1,
    topSectors: ["smart-city", "movilidad", "urbanismo"],
    spendingTrend: "growing",
    avgContractSize: "10-60 M€",
    historicalAwards: [
      { year: 2023, count: 185, totalM: 980 },
      { year: 2024, count: 198, totalM: 1050 },
      { year: 2025, count: 210, totalM: 1080 },
    ],
    budgetCycleMonth: [2, 5, 9],
    transparencyScore: 74,
  },
  {
    slug: "emt-madrid",
    name: "EMT Madrid (Empresa Municipal de Transportes)",
    type: "empresa-publica",
    annualProcurementM: 680,
    activeSignals: 1,
    topSectors: ["transporte-urbano", "flota-eléctrica"],
    spendingTrend: "growing",
    avgContractSize: "50-200 M€",
    historicalAwards: [
      { year: 2023, count: 45, totalM: 580 },
      { year: 2024, count: 52, totalM: 640 },
      { year: 2025, count: 58, totalM: 670 },
    ],
    budgetCycleMonth: [1, 6, 10],
    transparencyScore: 69,
  },
  {
    slug: "adif",
    name: "ADIF Alta Velocidad",
    type: "empresa-publica",
    annualProcurementM: 5200,
    activeSignals: 2,
    topSectors: ["infraestructura-ferroviaria", "obra-civil", "señalización"],
    spendingTrend: "growing",
    avgContractSize: "100-800 M€",
    keyContacts: ["Presidente ADIF", "DG Construcción"],
    historicalAwards: [
      { year: 2023, count: 185, totalM: 4600 },
      { year: 2024, count: 198, totalM: 4900 },
      { year: 2025, count: 210, totalM: 5100 },
    ],
    budgetCycleMonth: [1, 3, 6, 9],
    transparencyScore: 77,
  },
];

// ── Builder Function ───────────────────────────────────────────────────────

// Market share data by sector (feature 12)
const sectorMarketShare: Record<string, { provider: string; sharePct: number }[]> = {
  "infraestructura-ferroviaria": [
    { provider: "Acciona", sharePct: 22 }, { provider: "FCC", sharePct: 18 }, { provider: "Sacyr", sharePct: 15 }, { provider: "Ferrovial", sharePct: 14 },
  ],
  "seguridad": [
    { provider: "Indra", sharePct: 28 }, { provider: "Thales", sharePct: 18 }, { provider: "Leonardo", sharePct: 12 },
  ],
  "defensa-naval": [
    { provider: "Navantia", sharePct: 65 }, { provider: "BAE Systems", sharePct: 10 },
  ],
  "ciberseguridad": [
    { provider: "Indra", sharePct: 24 }, { provider: "Telefónica Tech", sharePct: 20 }, { provider: "S2 Grupo", sharePct: 15 }, { provider: "GMV", sharePct: 12 },
  ],
  "tecnología": [
    { provider: "Indra", sharePct: 20 }, { provider: "Everis/NTT", sharePct: 16 }, { provider: "Accenture", sharePct: 14 }, { provider: "Deloitte", sharePct: 12 },
  ],
  "telecomunicaciones": [
    { provider: "Telefónica", sharePct: 35 }, { provider: "Orange", sharePct: 20 }, { provider: "MásMóvil", sharePct: 15 },
  ],
  "sanidad": [
    { provider: "Siemens Healthineers", sharePct: 25 }, { provider: "GE Healthcare", sharePct: 20 }, { provider: "Philips", sharePct: 18 },
  ],
  "sanidad-digital": [
    { provider: "Deloitte", sharePct: 22 }, { provider: "Accenture", sharePct: 18 }, { provider: "Indra", sharePct: 15 },
  ],
  "transporte-urbano": [
    { provider: "FCC", sharePct: 18 }, { provider: "Acciona", sharePct: 15 }, { provider: "Irizar", sharePct: 14 }, { provider: "BYD", sharePct: 12 },
  ],
  "urbanismo": [
    { provider: "Dragados", sharePct: 20 }, { provider: "FCC", sharePct: 18 }, { provider: "Ferrovial", sharePct: 15 },
  ],
  "agua": [
    { provider: "Acciona Agua", sharePct: 22 }, { provider: "SUEZ", sharePct: 18 }, { provider: "Veolia", sharePct: 16 }, { provider: "Sacyr Agua", sharePct: 14 },
  ],
  "infraestructura-portuaria": [
    { provider: "Acciona", sharePct: 20 }, { provider: "Sacyr", sharePct: 16 }, { provider: "Dragados", sharePct: 14 },
  ],
  "energía-renovable": [
    { provider: "Iberdrola", sharePct: 28 }, { provider: "Endesa", sharePct: 18 }, { provider: "Naturgy", sharePct: 14 }, { provider: "Acciona Energía", sharePct: 12 },
  ],
  "smart-city": [
    { provider: "Indra", sharePct: 22 }, { provider: "Cellnex", sharePct: 16 }, { provider: "Worldsensing", sharePct: 12 }, { provider: "Cisco", sharePct: 10 },
  ],
  "gestión-residuos": [
    { provider: "FCC Medio Ambiente", sharePct: 30 }, { provider: "Urbaser", sharePct: 22 }, { provider: "Valoriza (Sacyr)", sharePct: 15 },
  ],
  "infraestructura-viaria": [
    { provider: "FCC", sharePct: 20 }, { provider: "Sacyr", sharePct: 17 }, { provider: "Acciona", sharePct: 15 }, { provider: "Ferrovial", sharePct: 14 },
  ],
  "movilidad-eléctrica": [
    { provider: "Iberdrola", sharePct: 25 }, { provider: "Repsol", sharePct: 20 }, { provider: "Endesa X", sharePct: 18 }, { provider: "IONITY", sharePct: 10 },
  ],
};

function computeStats(sigs: ProcurementSignal[], bys: InstitutionalBuyer[]): SalesIntelData["stats"] {
  const byStage: Record<OpportunityStage, number> = {
    deteccion: 0,
    "pre-licitacion": 0,
    "licitacion-abierta": 0,
    adjudicacion: 0,
    ejecucion: 0,
  };
  for (const s of sigs) byStage[s.stage]++;

  const sectorMap = new Map<string, { count: number; valueM: number }>();
  for (const s of sigs) {
    const prev = sectorMap.get(s.sector) ?? { count: 0, valueM: 0 };
    sectorMap.set(s.sector, { count: prev.count + 1, valueM: prev.valueM + s.estimatedValueM });
  }
  const bySector: SectorAnalytics[] = Array.from(sectorMap.entries())
    .map(([sector, v]) => ({
      sector,
      ...v,
      marketShare: sectorMarketShare[sector] ?? [],
    }))
    .sort((a, b) => b.valueM - a.valueM);

  const buyerMap = new Map<string, { signals: number; valueM: number }>();
  for (const s of sigs) {
    const prev = buyerMap.get(s.buyer) ?? { signals: 0, valueM: 0 };
    buyerMap.set(s.buyer, { signals: prev.signals + 1, valueM: prev.valueM + s.estimatedValueM });
  }
  const topBuyers = Array.from(buyerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.valueM - a.valueM)
    .slice(0, 10);

  // Feature 16: Revenue forecast — weighted pipeline by stage probability
  const stageProbability: Record<string, number> = {
    deteccion: 0.10,
    "pre-licitacion": 0.25,
    "licitacion-abierta": 0.50,
    adjudicacion: 0.80,
    ejecucion: 0.95,
  };
  const revenueForecast = (["deteccion", "pre-licitacion", "licitacion-abierta", "adjudicacion", "ejecucion"] as OpportunityStage[]).map((stage) => {
    const stageSignals = sigs.filter((s) => s.stage === stage);
    const totalValue = stageSignals.reduce((sum, s) => sum + s.estimatedValueM, 0);
    const prob = stageProbability[stage] ?? 0;
    return { stage, weightedValueM: Math.round(totalValue * prob * 10) / 10, probability: prob };
  });

  // Feature 20: Pipeline velocity — avg days per stage
  const pipelineVelocity: PipelineVelocity[] = [
    { stage: "deteccion", avgDaysInStage: 45, avgDaysToAward: 280 },
    { stage: "pre-licitacion", avgDaysInStage: 60, avgDaysToAward: 235 },
    { stage: "licitacion-abierta", avgDaysInStage: 90, avgDaysToAward: 175 },
    { stage: "adjudicacion", avgDaysInStage: 30, avgDaysToAward: 85 },
    { stage: "ejecucion", avgDaysInStage: 55, avgDaysToAward: 0 },
  ];

  // Feature 11: Geographic concentration
  const geoMap = new Map<string, { count: number; valueM: number }>();
  for (const s of sigs) {
    const prev = geoMap.get(s.territory) ?? { count: 0, valueM: 0 };
    geoMap.set(s.territory, { count: prev.count + 1, valueM: prev.valueM + s.estimatedValueM });
  }
  const geographicConcentration = Array.from(geoMap.entries())
    .map(([territory, v]) => ({ territory, ...v }))
    .sort((a, b) => b.valueM - a.valueM);

  return {
    totalSignals: sigs.length,
    totalEstimatedValueM: sigs.reduce((s, sig) => s + sig.estimatedValueM, 0),
    byStage,
    bySector,
    topBuyers,
    revenueForecast,
    pipelineVelocity,
    geographicConcentration,
  };
}

export function buildSalesIntelData(): SalesIntelData {
  return {
    signals,
    buyers,
    stats: computeStats(signals, buyers),
  };
}

// ── Helper / Query Functions ───────────────────────────────────────────────

export function getSignalsByStage(stage: OpportunityStage): ProcurementSignal[] {
  return signals.filter((s) => s.stage === stage);
}

export function getSignalsBySector(sector: string): ProcurementSignal[] {
  return signals.filter((s) => s.sector === sector);
}

export function getSignalsByBuyer(buyer: string): ProcurementSignal[] {
  const lower = buyer.toLowerCase();
  return signals.filter((s) => s.buyer.toLowerCase().includes(lower));
}

export function getHighValueSignals(minValueM: number): ProcurementSignal[] {
  return signals.filter((s) => s.estimatedValueM >= minValueM).sort((a, b) => b.estimatedValueM - a.estimatedValueM);
}

export function getBuyerProfile(slug: string): InstitutionalBuyer | undefined {
  return buyers.find((b) => b.slug === slug);
}
