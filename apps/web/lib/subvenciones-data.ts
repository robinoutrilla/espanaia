/* ═══════════════════════════════════════════════════════════════════════════
   Subvenciones & fondos públicos — Convocatorias, programas y ejecución.
   Fuentes: BDNS, PRTR, CDTI, FEDER/FSE+, Horizon Europe, BEI (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------------------
// Types & interfaces
// ---------------------------------------------------------------------------

export type ConvocatoriaStatus = "abierta" | "en-evaluacion" | "resuelta" | "cerrada" | "proxima";
export type FundSource = "ngeu" | "pge" | "feder" | "fse-plus" | "cdti" | "ccaa" | "local" | "horizon-europe" | "bei";
export type BeneficiaryType = "pyme" | "gran-empresa" | "autonomo" | "universidad" | "ong" | "ayuntamiento" | "ccaa" | "consorcio";
export type CompetitionLevel = "bajo" | "medio" | "alto" | "muy-alto";
export type ApplicationComplexity = "simple" | "moderada" | "compleja";
export type ExecutionRisk = "bajo" | "medio" | "alto";

export interface EligibilityProfile {
  entityTypes: BeneficiaryType[];
  sectors: string[];
  territories: string[];
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

export interface Convocatoria {
  id: string;
  title: string;
  organism: string;
  fundSource: FundSource;
  status: ConvocatoriaStatus;
  budgetM: number;
  executedM?: number;
  beneficiaryTypes: BeneficiaryType[];
  sectors: string[];
  territory: string;
  openDate: string;
  closeDate?: string;
  resolutionDate?: string;
  description: string;
  requirements: string[];
  maxAmountPerBeneficiary?: string;
  cofinancingPct?: number;
  applicationUrl?: string;
  bdnsCode?: string;
  tags: string[];
  /* ── 20 Competitive differentiators ── */
  eligibilityProfile?: EligibilityProfile;
  successRate?: number;
  applicantCount?: number;
  competitionLevel?: CompetitionLevel;
  applicationComplexity?: ApplicationComplexity;
  avgResolutionDays?: number;
  impactMultiplier?: number;
  executionRisk?: ExecutionRisk;
  riskFactors?: string[];
  compatibleGrants?: string[];
  relatedProcurement?: string[];
  prtComponent?: string;
  maxCumulation?: string;
}

export interface ProgramMilestone {
  label: string;
  status: "done" | "pending" | "risk";
  date: string;
}

export interface FundProgram {
  id: string;
  name: string;
  source: FundSource;
  totalBudgetM: number;
  executedM: number;
  executionPct: number;
  activeConvocatorias: number;
  description: string;
  managingBody: string;
  sectors: string[];
  timeline: { year: number; allocatedM: number; executedM: number }[];
  /* ── Differentiators ── */
  milestones?: ProgramMilestone[];
  executionRisk?: ExecutionRisk;
  riskFactors?: string[];
}

export interface TerritorySubsidyProfile {
  territory: string;
  totalReceivedM: number;
  perCapita: number;
  topSectors: { sector: string; amountM: number }[];
  activeConvocatorias: number;
  ngeuExecutionPct: number;
  /* ── Differentiators ── */
  equityIndex?: number; // 0-100 fairness score
}

export interface EuComparisonEntry {
  country: string;
  absorptionPct: number;
  totalAllocatedM: number;
}

export interface ForecastEntry {
  title: string;
  organism: string;
  expectedMonth: string;
  estimatedBudgetM: number;
  fundSource: FundSource;
  sectors: string[];
  confidence: "alta" | "media" | "baja";
}

export interface BeneficiaryAnalytic {
  type: BeneficiaryType;
  label: string;
  count: number;
  totalBudgetM: number;
  avgGrantM: number;
}

export interface SeasonalPattern {
  month: number;
  count: number;
}

export interface SubvencionesData {
  convocatorias: Convocatoria[];
  programs: FundProgram[];
  territoryProfiles: TerritorySubsidyProfile[];
  stats: {
    totalConvocatorias: number;
    openNow: number;
    totalBudgetM: number;
    totalExecutedM: number;
    executionRate: number;
    bySource: Record<FundSource, { count: number; budgetM: number }>;
    bySector: { sector: string; count: number; budgetM: number }[];
    seasonalPattern: SeasonalPattern[];
  };
  /* ── Differentiator data ── */
  euComparison: EuComparisonEntry[];
  forecast: ForecastEntry[];
  beneficiaryAnalytics: BeneficiaryAnalytic[];
}

// ---------------------------------------------------------------------------
// Convocatorias (35-45 entries)
// ---------------------------------------------------------------------------

const convocatorias: Convocatoria[] = [
  // ── NGEU / PRTR ──────────────────────────────────────────────────────────
  {
    id: "conv-001",
    title: "PERTE Chip — Línea de ayudas a diseño de semiconductores",
    organism: "Ministerio de Industria y Turismo",
    fundSource: "ngeu",
    status: "abierta",
    budgetM: 2400,
    executedM: 860,
    beneficiaryTypes: ["gran-empresa", "pyme", "consorcio"],
    sectors: ["semiconductores", "microelectrónica"],
    territory: "nacional",
    openDate: "2025-11-15",
    closeDate: "2026-06-30",
    description: "Subvenciones a proyectos de diseño, fabricación y ensamblaje de chips en territorio español, en el marco del PERTE Chip.",
    requirements: ["Sede social en España", "Inversión mínima 5M EUR", "Creación de empleo cualificado"],
    maxAmountPerBeneficiary: "200M EUR",
    cofinancingPct: 40,
    applicationUrl: "https://www.mintur.gob.es/perte-chip",
    bdnsCode: "BDNS-718432",
    tags: ["PERTE", "chips", "industria", "PRTR"],
    eligibilityProfile: { entityTypes: ["gran-empresa", "pyme", "consorcio"], sectors: ["semiconductores", "microelectrónica", "electrónica"], territories: ["nacional"], minEmployees: 50 },
    successRate: 28,
    applicantCount: 145,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 180,
    impactMultiplier: 4.2,
    executionRisk: "medio",
    riskFactors: ["Cadena de suministro global incierta", "Dependencia de proveedores asiáticos"],
    compatibleGrants: ["conv-006", "conv-019"],
    relatedProcurement: ["Licitación MINTUR equipamiento fab semiconductores 2026"],
    prtComponent: "C12 — Política industrial",
    maxCumulation: "Acumulable con deducciones fiscales I+D hasta 80% del coste total",
  },
  {
    id: "conv-002",
    title: "PERTE VEC — Cadena de valor del vehículo eléctrico",
    organism: "Ministerio de Industria y Turismo",
    fundSource: "ngeu",
    status: "en-evaluacion",
    budgetM: 1800,
    executedM: 1240,
    beneficiaryTypes: ["gran-empresa", "pyme", "consorcio"],
    sectors: ["automoción", "baterías", "electromovilidad"],
    territory: "nacional",
    openDate: "2025-06-01",
    closeDate: "2025-12-15",
    resolutionDate: "2026-05-15",
    description: "Tercera convocatoria del PERTE VEC para proyectos de baterías, motores eléctricos y vehículos conectados.",
    requirements: ["Consorcio de al menos 3 empresas", "Inversión mínima 10M EUR", "Componente de I+D obligatorio"],
    maxAmountPerBeneficiary: "150M EUR",
    cofinancingPct: 35,
    bdnsCode: "BDNS-704218",
    tags: ["PERTE", "VEC", "automoción", "baterías"],
    eligibilityProfile: { entityTypes: ["gran-empresa", "pyme", "consorcio"], sectors: ["automoción", "baterías"], territories: ["nacional"], minEmployees: 20 },
    successRate: 35,
    applicantCount: 98,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 150,
    impactMultiplier: 3.8,
    executionRisk: "bajo",
    riskFactors: ["Volatilidad precio materias primas baterías"],
    compatibleGrants: ["conv-001", "conv-034"],
    relatedProcurement: ["Contrato IDAE auditoría plantas baterías"],
    prtComponent: "C12 — Política industrial",
    maxCumulation: "Acumulable con FEDER hasta límite de intensidad de ayuda regional",
  },
  {
    id: "conv-003",
    title: "PERTE Agroalimentario — Transformación digital del sector",
    organism: "Ministerio de Agricultura, Pesca y Alimentación",
    fundSource: "ngeu",
    status: "resuelta",
    budgetM: 1000,
    executedM: 920,
    beneficiaryTypes: ["pyme", "gran-empresa", "consorcio"],
    sectors: ["agroalimentario", "digitalización"],
    territory: "nacional",
    openDate: "2025-03-01",
    closeDate: "2025-09-30",
    resolutionDate: "2026-02-10",
    description: "Ayudas para la digitalización, automatización y sostenibilidad de la cadena agroalimentaria.",
    requirements: ["Empresa del sector agroalimentario", "Plan de digitalización aprobado"],
    maxAmountPerBeneficiary: "40M EUR",
    cofinancingPct: 30,
    bdnsCode: "BDNS-698741",
    tags: ["PERTE", "agroalimentario", "digitalización"],
    successRate: 42,
    applicantCount: 210,
    competitionLevel: "alto",
    applicationComplexity: "moderada",
    avgResolutionDays: 130,
    impactMultiplier: 2.9,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-006"],
    prtComponent: "C3 — Transformación ambiental y digital del sistema agroalimentario",
    maxCumulation: "No acumulable con otras ayudas PRTR para el mismo gasto elegible",
  },
  {
    id: "conv-004",
    title: "Kit Digital Fase 3 — Segmentos I y II ampliación",
    organism: "Red.es / Ministerio de Transformación Digital",
    fundSource: "ngeu",
    status: "abierta",
    budgetM: 500,
    executedM: 180,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["digitalización", "comercio", "servicios"],
    territory: "nacional",
    openDate: "2026-01-15",
    closeDate: "2026-09-30",
    description: "Bonos digitales de hasta 12.000 EUR para pymes (10-49 empleados) y autónomos: web, e-commerce, ciberseguridad, IA.",
    requirements: ["Alta en el censo de empresarios", "Antigüedad mínima 6 meses"],
    maxAmountPerBeneficiary: "12.000 EUR",
    applicationUrl: "https://www.acelerapyme.gob.es/kit-digital",
    bdnsCode: "BDNS-726105",
    tags: ["Kit Digital", "pymes", "digitalización", "PRTR"],
    eligibilityProfile: { entityTypes: ["pyme", "autonomo"], sectors: ["digitalización", "comercio", "servicios"], territories: ["nacional"], minEmployees: 0, maxEmployees: 49 },
    successRate: 78,
    applicantCount: 48000,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 45,
    impactMultiplier: 2.1,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-022", "conv-023"],
    prtComponent: "C13 — Impulso a la pyme",
    maxCumulation: "Acumulable con ayudas autonómicas de digitalización si no cubren mismo concepto",
  },
  {
    id: "conv-005",
    title: "Rehabilitación energética de edificios residenciales (PREE 5000)",
    organism: "IDAE / Ministerio de Transición Ecológica",
    fundSource: "ngeu",
    status: "abierta",
    budgetM: 1200,
    executedM: 640,
    beneficiaryTypes: ["ayuntamiento", "ccaa", "consorcio"],
    sectors: ["rehabilitación", "eficiencia energética", "vivienda"],
    territory: "nacional",
    openDate: "2025-09-01",
    closeDate: "2026-12-31",
    description: "Subvenciones para aislamiento térmico, renovación de instalaciones térmicas y mejora de envolvente en edificios residenciales.",
    requirements: ["Edificio anterior a 2007", "Ahorro energético mínimo del 30%"],
    maxAmountPerBeneficiary: "Hasta 80% del coste elegible",
    cofinancingPct: 20,
    bdnsCode: "BDNS-721890",
    tags: ["rehabilitación", "energía", "vivienda", "PRTR"],
    eligibilityProfile: { entityTypes: ["ayuntamiento", "ccaa", "consorcio"], sectors: ["rehabilitación", "eficiencia energética"], territories: ["nacional"] },
    successRate: 62,
    applicantCount: 3200,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 90,
    impactMultiplier: 3.5,
    executionRisk: "medio",
    riskFactors: ["Complejidad burocrática comunidades de propietarios", "Escasez de empresas instaladoras certificadas"],
    compatibleGrants: ["conv-031"],
    relatedProcurement: ["Licitación MITECO asistencia técnica rehabilitación energética"],
    prtComponent: "C2 — Plan de rehabilitación de vivienda y regeneración urbana",
    maxCumulation: "Acumulable con deducciones IRPF por rehabilitación energética",
  },
  {
    id: "conv-006",
    title: "I+D+i empresarial — Componente 17 PRTR",
    organism: "Ministerio de Ciencia, Innovación y Universidades",
    fundSource: "ngeu",
    status: "en-evaluacion",
    budgetM: 800,
    executedM: 320,
    beneficiaryTypes: ["pyme", "gran-empresa", "universidad", "consorcio"],
    sectors: ["I+D", "innovación", "tecnología"],
    territory: "nacional",
    openDate: "2025-10-01",
    closeDate: "2026-02-28",
    resolutionDate: "2026-07-15",
    description: "Ayudas a proyectos de investigación industrial y desarrollo experimental en áreas estratégicas.",
    requirements: ["Proyecto con TRL 4-7", "Colaboración público-privada valorada"],
    maxAmountPerBeneficiary: "8M EUR",
    cofinancingPct: 50,
    bdnsCode: "BDNS-715204",
    tags: ["I+D", "innovación", "PRTR"],
    eligibilityProfile: { entityTypes: ["pyme", "gran-empresa", "universidad", "consorcio"], sectors: ["I+D", "innovación", "tecnología"], territories: ["nacional"], minEmployees: 5 },
    successRate: 31,
    applicantCount: 420,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 135,
    impactMultiplier: 5.1,
    executionRisk: "medio",
    riskFactors: ["Riesgo tecnológico inherente a I+D", "Posible retraso en hitos PRTR"],
    compatibleGrants: ["conv-001", "conv-019", "conv-020"],
    relatedProcurement: ["Contrato evaluación independiente proyectos I+D PRTR"],
    prtComponent: "C17 — Reforma institucional y fortalecimiento del sistema nacional de ciencia",
    maxCumulation: "Acumulable con deducciones fiscales I+D+i del art. 35 LIS",
  },
  {
    id: "conv-007",
    title: "Hidrógeno verde — Cadena de valor H2",
    organism: "IDAE / Ministerio de Transición Ecológica",
    fundSource: "ngeu",
    status: "resuelta",
    budgetM: 600,
    executedM: 580,
    beneficiaryTypes: ["gran-empresa", "consorcio"],
    sectors: ["hidrógeno", "energía renovable", "industria"],
    territory: "nacional",
    openDate: "2025-01-15",
    closeDate: "2025-07-31",
    resolutionDate: "2025-12-20",
    description: "Ayudas a electrolizadores, infraestructura de transporte y proyectos de consumo industrial de hidrógeno renovable.",
    requirements: ["Capacidad mínima electrolizador 5 MW", "Estudio de viabilidad completo"],
    maxAmountPerBeneficiary: "100M EUR",
    bdnsCode: "BDNS-697320",
    tags: ["hidrógeno", "energía", "PRTR"],
    successRate: 22,
    applicantCount: 64,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 145,
    impactMultiplier: 6.3,
    executionRisk: "medio",
    riskFactors: ["Tecnología emergente con riesgo de escala", "Normativa regulatoria aún en desarrollo"],
    compatibleGrants: ["conv-031"],
    prtComponent: "C8 — Infraestructuras eléctricas, redes de hidrógeno renovable",
    maxCumulation: "No acumulable con otras ayudas PRTR para la misma inversión",
  },

  // ── PGE ──────────────────────────────────────────────────────────────────
  {
    id: "conv-008",
    title: "Subvenciones a la creación y producción cinematográfica 2026",
    organism: "ICAA / Ministerio de Cultura",
    fundSource: "pge",
    status: "abierta",
    budgetM: 120,
    executedM: 45,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["cultura", "cine", "audiovisual"],
    territory: "nacional",
    openDate: "2026-02-01",
    closeDate: "2026-07-15",
    description: "Ayudas a la producción de largometrajes, cortometrajes, documentales y series de animación.",
    requirements: ["Empresa productora inscrita en ICAA", "Guion finalizado"],
    maxAmountPerBeneficiary: "1.5M EUR",
    bdnsCode: "BDNS-728901",
    tags: ["cultura", "cine", "audiovisual"],
    successRate: 55,
    applicantCount: 380,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 120,
    impactMultiplier: 2.4,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-041"],
    maxCumulation: "Acumulable con incentivos fiscales a la producción audiovisual",
  },
  {
    id: "conv-009",
    title: "Plan de empleo joven — Garantía Juvenil Plus",
    organism: "SEPE / Ministerio de Trabajo",
    fundSource: "pge",
    status: "abierta",
    budgetM: 350,
    executedM: 120,
    beneficiaryTypes: ["pyme", "autonomo", "ong"],
    sectors: ["empleo", "formación", "juventud"],
    territory: "nacional",
    openDate: "2026-01-10",
    closeDate: "2026-10-31",
    description: "Incentivos a la contratación indefinida de jóvenes menores de 30 años inscritos en Garantía Juvenil.",
    requirements: ["Contrato indefinido", "Jornada mínima 50%", "Beneficiario inscrito en Garantía Juvenil"],
    maxAmountPerBeneficiary: "18.000 EUR por contrato",
    bdnsCode: "BDNS-727450",
    tags: ["empleo", "juventud", "contratación"],
    eligibilityProfile: { entityTypes: ["pyme", "autonomo", "ong"], sectors: ["empleo", "formación"], territories: ["nacional"], minEmployees: 0 },
    successRate: 82,
    applicantCount: 15200,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 60,
    impactMultiplier: 1.8,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-014", "conv-037"],
    relatedProcurement: ["Contrato SEPE plataforma gestión Garantía Juvenil"],
    maxCumulation: "Acumulable con bonificaciones a la Seguridad Social hasta límite del 100% del coste salarial",
  },
  {
    id: "conv-010",
    title: "Fondo de cooperación municipal — Autonomía local",
    organism: "Ministerio de Política Territorial",
    fundSource: "pge",
    status: "resuelta",
    budgetM: 280,
    executedM: 280,
    beneficiaryTypes: ["ayuntamiento"],
    sectors: ["administración local", "servicios públicos"],
    territory: "nacional",
    openDate: "2025-11-01",
    closeDate: "2026-01-31",
    resolutionDate: "2026-03-15",
    description: "Transferencias incondicionadas a municipios de menos de 20.000 habitantes para refuerzo de servicios básicos.",
    requirements: ["Municipio < 20.000 hab.", "Cuenta general aprobada"],
    bdnsCode: "BDNS-719804",
    tags: ["autonomía local", "municipios", "servicios públicos"],
    successRate: 95,
    applicantCount: 6800,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 75,
    impactMultiplier: 1.5,
    executionRisk: "bajo",
    riskFactors: [],
    maxCumulation: "No acumulable con transferencias corrientes del mismo concepto PGE",
  },
  {
    id: "conv-011",
    title: "Subvenciones a entidades del Tercer Sector social",
    organism: "Ministerio de Derechos Sociales",
    fundSource: "pge",
    status: "en-evaluacion",
    budgetM: 95,
    beneficiaryTypes: ["ong"],
    sectors: ["inclusión social", "discapacidad", "mayores"],
    territory: "nacional",
    openDate: "2026-01-20",
    closeDate: "2026-04-15",
    resolutionDate: "2026-06-30",
    description: "Financiación de programas de interés social ejecutados por ONG de ámbito estatal.",
    requirements: ["Declaración de utilidad pública", "Ámbito de actuación estatal"],
    maxAmountPerBeneficiary: "3M EUR",
    bdnsCode: "BDNS-726830",
    tags: ["ONG", "inclusión", "servicios sociales"],
    successRate: 48,
    applicantCount: 320,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 70,
    impactMultiplier: 2.2,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-016"],
    maxCumulation: "Acumulable con subvenciones autonómicas siempre que no supere el 100% del coste del programa",
  },
  {
    id: "conv-012",
    title: "Ayudas a librerías independientes 2026",
    organism: "Ministerio de Cultura",
    fundSource: "pge",
    status: "proxima",
    budgetM: 12,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["cultura", "librería", "comercio"],
    territory: "nacional",
    openDate: "2026-05-01",
    description: "Modernización de librerías: digitalización del catálogo, reforma de locales y actividades culturales.",
    requirements: ["Librería con al menos 2 años de antigüedad", "Actividad cultural acreditada"],
    maxAmountPerBeneficiary: "30.000 EUR",
    tags: ["cultura", "librerías", "comercio"],
    successRate: 68,
    applicantCount: 420,
    competitionLevel: "medio",
    applicationComplexity: "simple",
    avgResolutionDays: 90,
    impactMultiplier: 1.9,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-004", "conv-041"],
    maxCumulation: "Acumulable con ayudas municipales a comercio de proximidad",
  },

  // ── FEDER / FSE+ ────────────────────────────────────────────────────────
  {
    id: "conv-013",
    title: "FEDER Andalucía — Programa operativo de innovación empresarial",
    organism: "Junta de Andalucía / FEDER",
    fundSource: "feder",
    status: "abierta",
    budgetM: 320,
    executedM: 110,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["innovación", "industria", "tecnología"],
    territory: "Andalucía",
    openDate: "2025-12-01",
    closeDate: "2026-08-31",
    description: "Cofinanciación FEDER para proyectos de innovación en procesos y productos en empresas andaluzas.",
    requirements: ["Sede en Andalucía", "Proyecto de innovación con viabilidad técnica"],
    maxAmountPerBeneficiary: "5M EUR",
    cofinancingPct: 50,
    bdnsCode: "BDNS-722130",
    tags: ["FEDER", "innovación", "Andalucía"],
    eligibilityProfile: { entityTypes: ["pyme", "gran-empresa"], sectors: ["innovación", "industria"], territories: ["Andalucía"], minEmployees: 10 },
    successRate: 44,
    applicantCount: 580,
    competitionLevel: "alto",
    applicationComplexity: "moderada",
    avgResolutionDays: 110,
    impactMultiplier: 3.2,
    executionRisk: "medio",
    riskFactors: ["Capacidad de absorción de fondos FEDER en la región"],
    compatibleGrants: ["conv-024"],
    relatedProcurement: ["Contrato evaluación ex-ante PO FEDER Andalucía"],
    maxCumulation: "Acumulable con ayudas autonómicas hasta intensidad máxima del mapa de ayudas regionales",
  },
  {
    id: "conv-014",
    title: "FSE+ Empleo y formación — Comunitat Valenciana",
    organism: "Labora (Servef) / FSE+",
    fundSource: "fse-plus",
    status: "abierta",
    budgetM: 180,
    executedM: 52,
    beneficiaryTypes: ["pyme", "ong", "ayuntamiento"],
    sectors: ["empleo", "formación profesional"],
    territory: "Comunitat Valenciana",
    openDate: "2026-01-01",
    closeDate: "2026-09-30",
    description: "Programas de formación y recualificación profesional cofinanciados por FSE+ para desempleados y trabajadores en ERTE.",
    requirements: ["Entidad acreditada para impartir formación", "Programa vinculado a necesidades del territorio"],
    cofinancingPct: 60,
    bdnsCode: "BDNS-725410",
    tags: ["FSE+", "empleo", "formación", "Valencia"],
    eligibilityProfile: { entityTypes: ["pyme", "ong", "ayuntamiento"], sectors: ["empleo", "formación"], territories: ["Comunitat Valenciana"] },
    successRate: 58,
    applicantCount: 340,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 95,
    impactMultiplier: 2.6,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-009", "conv-037"],
    maxCumulation: "Acumulable con ayudas Labora autonómicas para formación",
  },
  {
    id: "conv-015",
    title: "FEDER Galicia — Transición energética industrial",
    organism: "Xunta de Galicia / FEDER",
    fundSource: "feder",
    status: "en-evaluacion",
    budgetM: 150,
    executedM: 40,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["energía", "industria", "descarbonización"],
    territory: "Galicia",
    openDate: "2025-09-15",
    closeDate: "2026-03-15",
    resolutionDate: "2026-06-30",
    description: "Inversiones en descarbonización y eficiencia energética en el tejido industrial gallego.",
    requirements: ["Empresa industrial con sede en Galicia", "Reducción emisiones mínima 20%"],
    maxAmountPerBeneficiary: "3M EUR",
    cofinancingPct: 50,
    bdnsCode: "BDNS-718790",
    tags: ["FEDER", "energía", "Galicia", "industria"],
    successRate: 38,
    applicantCount: 210,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 105,
    impactMultiplier: 3.8,
    executionRisk: "medio",
    riskFactors: ["Complejidad técnica de la descarbonización industrial"],
    compatibleGrants: ["conv-031", "conv-032"],
    maxCumulation: "Acumulable con deducciones medioambientales hasta 70% del coste elegible",
  },
  {
    id: "conv-016",
    title: "FSE+ Inclusión social — Programa operativo nacional",
    organism: "Ministerio de Derechos Sociales / FSE+",
    fundSource: "fse-plus",
    status: "resuelta",
    budgetM: 240,
    executedM: 220,
    beneficiaryTypes: ["ong", "ayuntamiento", "ccaa"],
    sectors: ["inclusión social", "empleo vulnerable"],
    territory: "nacional",
    openDate: "2025-04-01",
    closeDate: "2025-10-31",
    resolutionDate: "2026-01-20",
    description: "Apoyo a itinerarios de inserción sociolaboral para personas en riesgo de exclusión.",
    requirements: ["Entidad con experiencia en inclusión", "Cobertura territorial justificada"],
    cofinancingPct: 60,
    bdnsCode: "BDNS-710320",
    tags: ["FSE+", "inclusión", "empleo"],
    successRate: 52,
    applicantCount: 450,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 80,
    impactMultiplier: 2.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-011"],
    maxCumulation: "Acumulable con subvenciones PGE Tercer Sector si distinto programa",
  },
  {
    id: "conv-017",
    title: "FEDER Castilla y León — Economía circular y residuos",
    organism: "Junta de Castilla y León / FEDER",
    fundSource: "feder",
    status: "proxima",
    budgetM: 85,
    beneficiaryTypes: ["pyme", "ayuntamiento"],
    sectors: ["economía circular", "residuos", "medioambiente"],
    territory: "Castilla y León",
    openDate: "2026-06-01",
    description: "Inversiones en infraestructura de reciclaje, valorización de residuos y simbiosis industrial.",
    requirements: ["Proyecto en territorio de Castilla y León", "Estudio de impacto ambiental"],
    cofinancingPct: 50,
    tags: ["FEDER", "economía circular", "Castilla y León"],
    successRate: 50,
    applicantCount: 120,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 100,
    impactMultiplier: 2.8,
    executionRisk: "medio",
    riskFactors: ["Escasa experiencia del tejido empresarial local en economía circular"],
    compatibleGrants: ["conv-015"],
    maxCumulation: "Acumulable con ayudas medioambientales JCyL",
  },

  // ── CDTI ─────────────────────────────────────────────────────────────────
  {
    id: "conv-018",
    title: "Neotec 2026 — Ayudas a startups tecnológicas",
    organism: "CDTI",
    fundSource: "cdti",
    status: "abierta",
    budgetM: 50,
    executedM: 15,
    beneficiaryTypes: ["pyme"],
    sectors: ["startups", "tecnología", "I+D"],
    territory: "nacional",
    openDate: "2026-02-15",
    closeDate: "2026-06-15",
    description: "Subvenciones a fondo perdido para startups innovadoras de base tecnológica con menos de 6 años.",
    requirements: ["Empresa < 6 años", "Modelo de negocio basado en tecnología propia", "Plan de empresa sólido"],
    maxAmountPerBeneficiary: "325.000 EUR",
    applicationUrl: "https://www.cdti.es/neotec",
    bdnsCode: "BDNS-727890",
    tags: ["Neotec", "startups", "innovación"],
    eligibilityProfile: { entityTypes: ["pyme"], sectors: ["startups", "tecnología"], territories: ["nacional"], maxEmployees: 50, maxRevenue: 10 },
    successRate: 25,
    applicantCount: 680,
    competitionLevel: "muy-alto",
    applicationComplexity: "moderada",
    avgResolutionDays: 120,
    impactMultiplier: 7.2,
    executionRisk: "alto",
    riskFactors: ["Alta tasa de mortalidad de startups", "Riesgo tecnológico elevado"],
    compatibleGrants: ["conv-042", "conv-030"],
    maxCumulation: "Acumulable con EIC Accelerator si conceptos distintos",
  },
  {
    id: "conv-019",
    title: "Proyectos de I+D — Convocatoria CDTI 2026",
    organism: "CDTI",
    fundSource: "cdti",
    status: "abierta",
    budgetM: 420,
    executedM: 95,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["I+D", "tecnología", "industria"],
    territory: "nacional",
    openDate: "2026-01-01",
    closeDate: "2026-12-31",
    description: "Financiación parcialmente reembolsable para proyectos de desarrollo tecnológico e innovación.",
    requirements: ["Departamento de I+D propio", "Proyecto con riesgo tecnológico"],
    maxAmountPerBeneficiary: "10M EUR",
    applicationUrl: "https://www.cdti.es/proyectos-id",
    bdnsCode: "BDNS-726001",
    tags: ["CDTI", "I+D", "tecnología"],
    eligibilityProfile: { entityTypes: ["pyme", "gran-empresa"], sectors: ["I+D", "tecnología"], territories: ["nacional"], minEmployees: 5 },
    successRate: 40,
    applicantCount: 1200,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 90,
    impactMultiplier: 4.5,
    executionRisk: "medio",
    riskFactors: ["Riesgo tecnológico inherente"],
    compatibleGrants: ["conv-006", "conv-018"],
    maxCumulation: "Acumulable con deducciones fiscales I+D+i hasta 80% coste proyecto",
  },
  {
    id: "conv-020",
    title: "Centros tecnológicos Cervera — Transferencia de conocimiento",
    organism: "CDTI",
    fundSource: "cdti",
    status: "en-evaluacion",
    budgetM: 75,
    executedM: 30,
    beneficiaryTypes: ["consorcio", "universidad"],
    sectors: ["I+D", "transferencia tecnológica"],
    territory: "nacional",
    openDate: "2025-11-01",
    closeDate: "2026-03-31",
    resolutionDate: "2026-08-01",
    description: "Apoyo a centros tecnológicos para actividades de I+D alineadas con prioridades industriales.",
    requirements: ["Centro tecnológico acreditado", "Línea de investigación en tecnología prioritaria"],
    maxAmountPerBeneficiary: "3M EUR",
    bdnsCode: "BDNS-720115",
    tags: ["Cervera", "centros tecnológicos", "transferencia"],
    successRate: 35,
    applicantCount: 85,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 120,
    impactMultiplier: 3.9,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-019"],
    maxCumulation: "No acumulable con otras ayudas CDTI para la misma línea de investigación",
  },
  {
    id: "conv-021",
    title: "Misiones CDTI — Grandes retos empresariales",
    organism: "CDTI",
    fundSource: "cdti",
    status: "resuelta",
    budgetM: 190,
    executedM: 185,
    beneficiaryTypes: ["gran-empresa", "pyme", "consorcio"],
    sectors: ["I+D", "salud", "energía", "agrotech"],
    territory: "nacional",
    openDate: "2025-05-01",
    closeDate: "2025-11-30",
    resolutionDate: "2026-03-01",
    description: "Proyectos colaborativos de gran tamaño que abordan retos de salud, energía, agrotech y movilidad.",
    requirements: ["Consorcio liderado por gran empresa", "Presupuesto mínimo 5M EUR", "Al menos 2 pymes"],
    bdnsCode: "BDNS-708440",
    tags: ["Misiones", "CDTI", "I+D colaborativo"],
    successRate: 30,
    applicantCount: 52,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 150,
    impactMultiplier: 5.8,
    executionRisk: "medio",
    riskFactors: ["Complejidad de coordinación consorcial"],
    compatibleGrants: ["conv-006", "conv-019"],
    maxCumulation: "No acumulable con otras Misiones CDTI para el mismo consorcio",
  },

  // ── CCAA ─────────────────────────────────────────────────────────────────
  {
    id: "conv-022",
    title: "Madrid Innova — Ayudas a la innovación empresarial",
    organism: "Comunidad de Madrid",
    fundSource: "ccaa",
    status: "abierta",
    budgetM: 60,
    executedM: 18,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["innovación", "tecnología", "industria"],
    territory: "Comunidad de Madrid",
    openDate: "2026-03-01",
    closeDate: "2026-09-30",
    description: "Apoyo a proyectos de innovación tecnológica y digitalización de pymes madrileñas.",
    requirements: ["Sede en la Comunidad de Madrid", "Proyecto innovador con plan de negocio"],
    maxAmountPerBeneficiary: "200.000 EUR",
    applicationUrl: "https://www.comunidad.madrid/innova",
    tags: ["Madrid", "innovación", "pymes"],
    eligibilityProfile: { entityTypes: ["pyme", "autonomo"], sectors: ["innovación", "tecnología"], territories: ["Comunidad de Madrid"], maxEmployees: 250 },
    successRate: 52,
    applicantCount: 920,
    competitionLevel: "medio",
    applicationComplexity: "simple",
    avgResolutionDays: 75,
    impactMultiplier: 2.5,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-004", "conv-019"],
    maxCumulation: "Acumulable con Kit Digital y CDTI hasta intensidad máxima de minimis",
  },
  {
    id: "conv-023",
    title: "ACCIÓ — Nuclis d'innovació tecnològica",
    organism: "ACCIÓ / Generalitat de Catalunya",
    fundSource: "ccaa",
    status: "abierta",
    budgetM: 45,
    executedM: 12,
    beneficiaryTypes: ["pyme", "gran-empresa", "consorcio"],
    sectors: ["I+D", "industria 4.0", "sostenibilidad"],
    territory: "Cataluña",
    openDate: "2026-02-15",
    closeDate: "2026-07-31",
    description: "Ayudas a agrupaciones empresariales para proyectos de I+D colaborativo en tecnologías habilitadoras.",
    requirements: ["Consorcio con al menos 2 empresas catalanas", "Componente de I+D significativo"],
    maxAmountPerBeneficiary: "500.000 EUR",
    cofinancingPct: 50,
    tags: ["Cataluña", "ACCIÓ", "I+D", "industria"],
    successRate: 38,
    applicantCount: 260,
    competitionLevel: "alto",
    applicationComplexity: "moderada",
    avgResolutionDays: 100,
    impactMultiplier: 3.4,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-019", "conv-006"],
    maxCumulation: "Acumulable con ayudas CDTI si distinto concepto de gasto",
  },
  {
    id: "conv-024",
    title: "Incentivos a la inversión industrial en Andalucía",
    organism: "Junta de Andalucía / TRADE",
    fundSource: "ccaa",
    status: "abierta",
    budgetM: 110,
    executedM: 30,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["industria", "empleo", "inversión"],
    territory: "Andalucía",
    openDate: "2026-01-15",
    closeDate: "2026-11-30",
    description: "Subvenciones a la creación o ampliación de establecimientos industriales que generen empleo estable.",
    requirements: ["Inversión mínima 200.000 EUR", "Creación de al menos 3 puestos de trabajo"],
    maxAmountPerBeneficiary: "5M EUR",
    cofinancingPct: 30,
    tags: ["Andalucía", "industria", "empleo"],
    eligibilityProfile: { entityTypes: ["pyme", "gran-empresa"], sectors: ["industria", "empleo"], territories: ["Andalucía"], minEmployees: 3 },
    successRate: 60,
    applicantCount: 410,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 85,
    impactMultiplier: 2.8,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-013"],
    maxCumulation: "Acumulable con incentivos TRADE hasta intensidad máxima regional",
  },
  {
    id: "conv-025",
    title: "Programa Bind 4.0 — Startups industriales País Vasco",
    organism: "SPRI / Gobierno Vasco",
    fundSource: "ccaa",
    status: "cerrada",
    budgetM: 20,
    executedM: 20,
    beneficiaryTypes: ["pyme"],
    sectors: ["industria 4.0", "startups", "innovación"],
    territory: "País Vasco",
    openDate: "2025-09-01",
    closeDate: "2026-01-31",
    resolutionDate: "2026-03-20",
    description: "Aceleración de startups industriales con acceso a plantas piloto y corporaciones vascas.",
    requirements: ["Startup tecnológica", "Solución aplicable a industria"],
    maxAmountPerBeneficiary: "40.000 EUR",
    tags: ["País Vasco", "Bind 4.0", "startups", "industria"],
    successRate: 20,
    applicantCount: 350,
    competitionLevel: "muy-alto",
    applicationComplexity: "moderada",
    avgResolutionDays: 50,
    impactMultiplier: 6.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-018", "conv-042"],
    maxCumulation: "Acumulable con Neotec y EIC Accelerator",
  },
  {
    id: "conv-026",
    title: "Subvenciones a la internacionalización — CCAA Aragón",
    organism: "Aragón Exterior (AREX)",
    fundSource: "ccaa",
    status: "proxima",
    budgetM: 15,
    beneficiaryTypes: ["pyme"],
    sectors: ["comercio exterior", "internacionalización"],
    territory: "Aragón",
    openDate: "2026-05-15",
    description: "Apoyo a la participación de pymes aragonesas en ferias internacionales y misiones comerciales.",
    requirements: ["Pyme con sede en Aragón", "Plan de internacionalización"],
    maxAmountPerBeneficiary: "50.000 EUR",
    tags: ["Aragón", "internacionalización", "pymes"],
    successRate: 70,
    applicantCount: 85,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 60,
    impactMultiplier: 2.2,
    executionRisk: "bajo",
    riskFactors: [],
    maxCumulation: "Acumulable con ayudas ICEX hasta el 100% del coste de la acción",
  },

  // ── Horizon Europe ───────────────────────────────────────────────────────
  {
    id: "conv-027",
    title: "ERC Starting Grants 2026",
    organism: "European Research Council",
    fundSource: "horizon-europe",
    status: "abierta",
    budgetM: 820,
    beneficiaryTypes: ["universidad", "consorcio"],
    sectors: ["investigación básica", "ciencia"],
    territory: "nacional",
    openDate: "2026-01-09",
    closeDate: "2026-10-15",
    description: "Becas de excelencia para investigadores con 2-7 años de experiencia postdoctoral. Presupuesto total UE; España aspira a captar ~6%.",
    requirements: ["PhD + 2-7 años experiencia", "Propuesta de investigación frontier", "Institución de acogida en UE"],
    maxAmountPerBeneficiary: "1.5M EUR",
    applicationUrl: "https://erc.europa.eu/apply-grant/starting-grant",
    tags: ["ERC", "investigación", "Horizon Europe"],
    successRate: 12,
    applicantCount: 4200,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 240,
    impactMultiplier: 8.5,
    executionRisk: "bajo",
    riskFactors: [],
    maxCumulation: "No acumulable con otras becas ERC; compatible con fondos nacionales complementarios",
  },
  {
    id: "conv-028",
    title: "Digital Europe Programme — AI & cybersecurity",
    organism: "Comisión Europea / HaDEA",
    fundSource: "horizon-europe",
    status: "abierta",
    budgetM: 290,
    beneficiaryTypes: ["pyme", "gran-empresa", "universidad", "consorcio"],
    sectors: ["inteligencia artificial", "ciberseguridad", "datos"],
    territory: "nacional",
    openDate: "2026-02-01",
    closeDate: "2026-09-15",
    description: "Convocatorias de capacitación en IA, HPC, ciberseguridad y espacios europeos de datos. Presupuesto UE; participación española esperada.",
    requirements: ["Consorcio transnacional", "Al menos 3 Estados miembros"],
    cofinancingPct: 50,
    applicationUrl: "https://digital-strategy.ec.europa.eu/en/activities/digital-programme",
    tags: ["Digital Europe", "IA", "ciberseguridad"],
    successRate: 18,
    applicantCount: 1800,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 200,
    impactMultiplier: 4.8,
    executionRisk: "medio",
    riskFactors: ["Complejidad de formación de consorcios transnacionales"],
    compatibleGrants: ["conv-006", "conv-019"],
    maxCumulation: "No acumulable con otras ayudas UE para los mismos costes",
  },
  {
    id: "conv-029",
    title: "ERC Consolidator Grants 2026",
    organism: "European Research Council",
    fundSource: "horizon-europe",
    status: "en-evaluacion",
    budgetM: 780,
    beneficiaryTypes: ["universidad"],
    sectors: ["investigación", "ciencia"],
    territory: "nacional",
    openDate: "2025-10-01",
    closeDate: "2026-02-12",
    resolutionDate: "2026-11-15",
    description: "Becas para investigadores consolidados (7-12 años post-PhD). Presupuesto total UE.",
    requirements: ["PhD + 7-12 años experiencia", "Track record significativo"],
    maxAmountPerBeneficiary: "2M EUR",
    tags: ["ERC", "investigación", "Horizon Europe"],
    successRate: 14,
    applicantCount: 3100,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 270,
    impactMultiplier: 9.0,
    executionRisk: "bajo",
    riskFactors: [],
    maxCumulation: "No acumulable con ERC Starting Grant",
  },
  {
    id: "conv-030",
    title: "EIC Accelerator — Deeptech startups",
    organism: "European Innovation Council",
    fundSource: "horizon-europe",
    status: "abierta",
    budgetM: 400,
    beneficiaryTypes: ["pyme"],
    sectors: ["deeptech", "startups", "innovación disruptiva"],
    territory: "nacional",
    openDate: "2026-01-15",
    closeDate: "2026-10-01",
    description: "Financiación blended (subvención + equity) para startups y pymes con innovaciones disruptivas.",
    requirements: ["Pyme europea", "Innovación con TRL 5-8", "Potencial de escala"],
    maxAmountPerBeneficiary: "2.5M EUR subvención + 15M EUR equity",
    applicationUrl: "https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en",
    tags: ["EIC", "deeptech", "startups", "Horizon Europe"],
    eligibilityProfile: { entityTypes: ["pyme"], sectors: ["deeptech", "innovación disruptiva"], territories: ["nacional"], maxEmployees: 250 },
    successRate: 8,
    applicantCount: 2800,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 180,
    impactMultiplier: 12.0,
    executionRisk: "alto",
    riskFactors: ["Innovación disruptiva con alto riesgo de mercado", "Proceso de evaluación muy competitivo"],
    compatibleGrants: ["conv-018", "conv-042"],
    maxCumulation: "No acumulable con otras ayudas UE para los mismos costes; equity no es acumulable",
  },

  // ── BEI / InvestEU ───────────────────────────────────────────────────────
  {
    id: "conv-031",
    title: "InvestEU — Línea de garantía para infraestructura sostenible",
    organism: "Banco Europeo de Inversiones (BEI)",
    fundSource: "bei",
    status: "abierta",
    budgetM: 1500,
    executedM: 420,
    beneficiaryTypes: ["gran-empresa", "ayuntamiento", "ccaa"],
    sectors: ["infraestructura", "energía renovable", "transporte"],
    territory: "nacional",
    openDate: "2025-07-01",
    closeDate: "2027-06-30",
    description: "Garantías y préstamos en condiciones favorables para proyectos de infraestructura verde y digital.",
    requirements: ["Proyecto de inversión > 25M EUR", "Evaluación de impacto ambiental"],
    applicationUrl: "https://www.eib.org/investeu",
    tags: ["InvestEU", "BEI", "infraestructura", "verde"],
    successRate: 45,
    applicantCount: 180,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 160,
    impactMultiplier: 5.5,
    executionRisk: "medio",
    riskFactors: ["Proyectos de largo plazo con riesgo de ejecución"],
    compatibleGrants: ["conv-005", "conv-015"],
    maxCumulation: "Préstamos BEI acumulables con subvenciones hasta el 90% del coste total",
  },
  {
    id: "conv-032",
    title: "BEI Crédito verde — Financiación de renovables para pymes",
    organism: "Banco Europeo de Inversiones (BEI) vía ICO",
    fundSource: "bei",
    status: "abierta",
    budgetM: 800,
    executedM: 210,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["energía renovable", "eficiencia energética"],
    territory: "nacional",
    openDate: "2026-01-01",
    closeDate: "2026-12-31",
    description: "Líneas de crédito intermediadas por ICO con condiciones preferentes para inversión en renovables y eficiencia.",
    requirements: ["Pyme o autónomo", "Proyecto de energía renovable o eficiencia"],
    maxAmountPerBeneficiary: "12.5M EUR",
    applicationUrl: "https://www.ico.es/lineas-bei",
    tags: ["BEI", "ICO", "renovables", "crédito verde"],
    eligibilityProfile: { entityTypes: ["pyme", "autonomo"], sectors: ["energía renovable", "eficiencia energética"], territories: ["nacional"], maxEmployees: 250 },
    successRate: 72,
    applicantCount: 4500,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 30,
    impactMultiplier: 3.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-005", "conv-034"],
    maxCumulation: "Acumulable con subvenciones IDAE hasta el 80% del coste de la instalación",
  },
  {
    id: "conv-033",
    title: "InvestEU — Ventana de innovación e investigación",
    organism: "Banco Europeo de Inversiones (BEI)",
    fundSource: "bei",
    status: "en-evaluacion",
    budgetM: 600,
    executedM: 150,
    beneficiaryTypes: ["pyme", "gran-empresa", "universidad"],
    sectors: ["I+D", "innovación", "tecnología"],
    territory: "nacional",
    openDate: "2025-10-01",
    closeDate: "2026-04-30",
    resolutionDate: "2026-09-01",
    description: "Financiación para scale-ups tecnológicas y proyectos de investigación con alto potencial de mercado.",
    requirements: ["Empresa innovadora con tracción comercial", "Plan de crecimiento viable"],
    tags: ["InvestEU", "BEI", "innovación", "scale-ups"],
    successRate: 35,
    applicantCount: 240,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 150,
    impactMultiplier: 6.2,
    executionRisk: "medio",
    riskFactors: ["Riesgo de mercado para scale-ups tecnológicas"],
    compatibleGrants: ["conv-019", "conv-042"],
    maxCumulation: "Financiación BEI combinable con equity privado sin límite",
  },

  // ── Más NGEU / PGE / CCAA extras ────────────────────────────────────────
  {
    id: "conv-034",
    title: "Plan Moves IV — Puntos de recarga vehículo eléctrico",
    organism: "IDAE / Ministerio de Transición Ecológica",
    fundSource: "ngeu",
    status: "abierta",
    budgetM: 200,
    executedM: 65,
    beneficiaryTypes: ["pyme", "gran-empresa", "ayuntamiento"],
    sectors: ["movilidad eléctrica", "infraestructura"],
    territory: "nacional",
    openDate: "2026-02-01",
    closeDate: "2026-11-30",
    description: "Subvenciones para la instalación de infraestructura de recarga de vehículos eléctricos.",
    requirements: ["Punto de recarga de acceso público", "Potencia mínima 50 kW para carga rápida"],
    maxAmountPerBeneficiary: "Hasta 80% del coste",
    bdnsCode: "BDNS-727610",
    tags: ["Moves", "recarga", "vehículo eléctrico", "PRTR"],
    eligibilityProfile: { entityTypes: ["pyme", "gran-empresa", "ayuntamiento"], sectors: ["movilidad eléctrica"], territories: ["nacional"] },
    successRate: 65,
    applicantCount: 2100,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 80,
    impactMultiplier: 3.2,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-002", "conv-032"],
    prtComponent: "C1 — Plan de choque de movilidad sostenible, segura y conectada",
    maxCumulation: "Acumulable con incentivos autonómicos hasta 80% del coste de instalación",
  },
  {
    id: "conv-035",
    title: "Programa de digitalización de la Justicia",
    organism: "Ministerio de Justicia",
    fundSource: "ngeu",
    status: "cerrada",
    budgetM: 310,
    executedM: 295,
    beneficiaryTypes: ["gran-empresa", "consorcio"],
    sectors: ["justicia", "digitalización"],
    territory: "nacional",
    openDate: "2024-10-01",
    closeDate: "2025-06-30",
    resolutionDate: "2025-10-15",
    description: "Modernización de sistemas de gestión procesal, expediente judicial electrónico y videoconferencia judicial.",
    requirements: ["Experiencia en proyectos de administración de justicia", "Certificación de seguridad"],
    bdnsCode: "BDNS-694210",
    tags: ["justicia", "digitalización", "PRTR"],
    successRate: 50,
    applicantCount: 42,
    competitionLevel: "alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 105,
    impactMultiplier: 2.5,
    executionRisk: "bajo",
    riskFactors: [],
    prtComponent: "C11 — Modernización de la Administración de Justicia",
    maxCumulation: "No acumulable con otros contratos PRTR del mismo componente",
  },
  {
    id: "conv-036",
    title: "Subvenciones al turismo sostenible — Plan de Sostenibilidad",
    organism: "Turespaña / Ministerio de Industria",
    fundSource: "pge",
    status: "abierta",
    budgetM: 140,
    executedM: 35,
    beneficiaryTypes: ["ayuntamiento", "pyme"],
    sectors: ["turismo", "sostenibilidad"],
    territory: "nacional",
    openDate: "2026-03-01",
    closeDate: "2026-10-15",
    description: "Planes de sostenibilidad turística en destinos: movilidad, accesibilidad, eficiencia energética y patrimonio.",
    requirements: ["Destino turístico con Plan de Sostenibilidad aprobado"],
    maxAmountPerBeneficiary: "3M EUR por destino",
    bdnsCode: "BDNS-729100",
    tags: ["turismo", "sostenibilidad", "destinos"],
    successRate: 55,
    applicantCount: 620,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 100,
    impactMultiplier: 2.8,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-005"],
    maxCumulation: "Acumulable con fondos FEDER turismo si distintos conceptos de gasto",
  },
  {
    id: "conv-037",
    title: "Ayudas a la FP Dual — Empresas colaboradoras",
    organism: "Ministerio de Educación, FP y Deportes",
    fundSource: "fse-plus",
    status: "proxima",
    budgetM: 90,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["formación profesional", "empleo"],
    territory: "nacional",
    openDate: "2026-06-01",
    description: "Compensaciones a empresas que acogen alumnos de FP Dual: tutoría, equipamiento y seguimiento.",
    requirements: ["Convenio con centro de FP", "Tutor de empresa designado"],
    maxAmountPerBeneficiary: "5.000 EUR por alumno",
    tags: ["FP Dual", "formación", "empleo", "FSE+"],
    successRate: 75,
    applicantCount: 3800,
    competitionLevel: "bajo",
    applicationComplexity: "simple",
    avgResolutionDays: 60,
    impactMultiplier: 2.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-009", "conv-014"],
    maxCumulation: "Acumulable con bonificaciones a la Seguridad Social por contratación de alumnos",
  },
  {
    id: "conv-038",
    title: "Canarias ZEC — Incentivos fiscales y ayudas a inversión",
    organism: "Gobierno de Canarias / ZEC",
    fundSource: "ccaa",
    status: "abierta",
    budgetM: 40,
    executedM: 8,
    beneficiaryTypes: ["pyme", "gran-empresa"],
    sectors: ["inversión", "tecnología", "servicios"],
    territory: "Canarias",
    openDate: "2026-01-01",
    closeDate: "2026-12-31",
    description: "Ayudas complementarias a los beneficios fiscales de la ZEC para nuevas implantaciones empresariales.",
    requirements: ["Empresa nueva en ZEC", "Creación mínima 5 empleos"],
    maxAmountPerBeneficiary: "500.000 EUR",
    tags: ["Canarias", "ZEC", "inversión", "fiscal"],
    successRate: 80,
    applicantCount: 120,
    competitionLevel: "bajo",
    applicationComplexity: "moderada",
    avgResolutionDays: 45,
    impactMultiplier: 3.5,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-004"],
    maxCumulation: "Acumulable con beneficios fiscales ZEC hasta el límite de la normativa RIC",
  },
  {
    id: "conv-039",
    title: "FEDER Extremadura — Conectividad digital rural",
    organism: "Junta de Extremadura / FEDER",
    fundSource: "feder",
    status: "resuelta",
    budgetM: 65,
    executedM: 60,
    beneficiaryTypes: ["ayuntamiento", "consorcio"],
    sectors: ["telecomunicaciones", "rural", "digitalización"],
    territory: "Extremadura",
    openDate: "2025-06-01",
    closeDate: "2025-12-31",
    resolutionDate: "2026-03-10",
    description: "Despliegue de fibra óptica y conectividad 5G en municipios rurales de Extremadura con menos de 5.000 hab.",
    requirements: ["Municipio < 5.000 hab.", "Proyecto de despliegue con operador"],
    cofinancingPct: 70,
    bdnsCode: "BDNS-712450",
    tags: ["FEDER", "rural", "conectividad", "Extremadura"],
    successRate: 85,
    applicantCount: 95,
    competitionLevel: "bajo",
    applicationComplexity: "moderada",
    avgResolutionDays: 70,
    impactMultiplier: 4.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-031"],
    maxCumulation: "Acumulable con ayudas UNICO Demanda Rural",
  },
  {
    id: "conv-040",
    title: "Programa RETECH — Recualificación tecnológica",
    organism: "SEPE / Ministerio de Trabajo",
    fundSource: "ngeu",
    status: "en-evaluacion",
    budgetM: 160,
    executedM: 60,
    beneficiaryTypes: ["pyme", "ong", "universidad"],
    sectors: ["formación", "reskilling", "tecnología"],
    territory: "nacional",
    openDate: "2025-12-01",
    closeDate: "2026-04-30",
    resolutionDate: "2026-08-15",
    description: "Cursos de recualificación en IA, ciberseguridad, cloud computing y datos para trabajadores en activo.",
    requirements: ["Entidad formadora acreditada", "Contenido alineado con competencias digitales"],
    bdnsCode: "BDNS-723890",
    tags: ["reskilling", "formación", "tecnología", "PRTR"],
    successRate: 48,
    applicantCount: 290,
    competitionLevel: "medio",
    applicationComplexity: "moderada",
    avgResolutionDays: 105,
    impactMultiplier: 2.4,
    executionRisk: "medio",
    riskFactors: ["Dificultad para alcanzar tasas de inserción comprometidas"],
    compatibleGrants: ["conv-014", "conv-037"],
    prtComponent: "C20 — Plan estratégico de impulso de la FP y C19 — Competencias digitales",
    maxCumulation: "Acumulable con ayudas Fundae para formación de demanda",
  },
  {
    id: "conv-041",
    title: "Ayudas a la creación de empresas culturales y creativas",
    organism: "Ministerio de Cultura",
    fundSource: "pge",
    status: "proxima",
    budgetM: 25,
    beneficiaryTypes: ["pyme", "autonomo"],
    sectors: ["cultura", "industrias creativas"],
    territory: "nacional",
    openDate: "2026-06-15",
    description: "Subvenciones para nuevos proyectos empresariales en artes visuales, música, diseño, videojuegos y patrimonio.",
    requirements: ["Empresa < 3 años", "Plan de negocio cultural"],
    maxAmountPerBeneficiary: "60.000 EUR",
    tags: ["cultura", "industrias creativas", "emprendimiento"],
    successRate: 45,
    applicantCount: 520,
    competitionLevel: "medio",
    applicationComplexity: "simple",
    avgResolutionDays: 90,
    impactMultiplier: 2.0,
    executionRisk: "bajo",
    riskFactors: [],
    compatibleGrants: ["conv-008", "conv-012"],
    maxCumulation: "Acumulable con ayudas de minimis hasta 300.000 EUR en 3 ejercicios",
  },
  {
    id: "conv-042",
    title: "Programa INNVIERTE — Coinversión pública en startups",
    organism: "CDTI",
    fundSource: "cdti",
    status: "abierta",
    budgetM: 130,
    executedM: 42,
    beneficiaryTypes: ["pyme"],
    sectors: ["startups", "deep tech", "biotecnología"],
    territory: "nacional",
    openDate: "2026-01-01",
    closeDate: "2026-12-31",
    description: "Coinversión de CDTI junto a fondos privados en startups tecnológicas españolas en fases seed y Series A.",
    requirements: ["Startup con inversión privada comprometida", "Base tecnológica demostrada"],
    maxAmountPerBeneficiary: "5M EUR",
    applicationUrl: "https://www.cdti.es/innvierte",
    tags: ["CDTI", "INNVIERTE", "startups", "venture"],
    eligibilityProfile: { entityTypes: ["pyme"], sectors: ["startups", "deep tech", "biotecnología"], territories: ["nacional"], maxEmployees: 50 },
    successRate: 15,
    applicantCount: 450,
    competitionLevel: "muy-alto",
    applicationComplexity: "compleja",
    avgResolutionDays: 90,
    impactMultiplier: 8.0,
    executionRisk: "alto",
    riskFactors: ["Riesgo de no alcanzar ronda de financiación privada", "Alta mortalidad startups early-stage"],
    compatibleGrants: ["conv-018", "conv-030"],
    maxCumulation: "Coinversión CDTI no acumulable con otras ayudas públicas en la misma ronda",
  },
];

// ---------------------------------------------------------------------------
// Fund programs (8-10)
// ---------------------------------------------------------------------------

const programs: FundProgram[] = [
  {
    id: "prog-ngeu",
    name: "NextGenerationEU — Plan de Recuperación",
    source: "ngeu",
    totalBudgetM: 163200,
    executedM: 86600,
    executionPct: 53.1,
    activeConvocatorias: 0, // computed below
    description: "Mecanismo de Recuperación y Resiliencia: 80.000M EUR en subvenciones y 83.200M EUR en préstamos para 30 componentes de reforma e inversión.",
    managingBody: "Secretaría General de Fondos Europeos",
    sectors: ["digitalización", "transición verde", "industria", "salud", "vivienda", "I+D"],
    timeline: [
      { year: 2021, allocatedM: 27000, executedM: 9000 },
      { year: 2022, allocatedM: 34000, executedM: 22000 },
      { year: 2023, allocatedM: 38000, executedM: 28000 },
      { year: 2024, allocatedM: 42000, executedM: 32200 },
      { year: 2025, allocatedM: 50000, executedM: 39400 },
      { year: 2026, allocatedM: 163200, executedM: 86600 },
    ],
    milestones: [
      { label: "1er desembolso UE (13.000M)", status: "done", date: "2021-12-31" },
      { label: "2o desembolso (12.000M)", status: "done", date: "2022-06-30" },
      { label: "3er desembolso (6.000M)", status: "done", date: "2022-12-31" },
      { label: "4o desembolso (10.000M)", status: "done", date: "2023-11-30" },
      { label: "5o desembolso adenda (10.000M)", status: "done", date: "2024-07-15" },
      { label: "6o desembolso (7.200M)", status: "done", date: "2025-04-30" },
      { label: "7o desembolso — solicitud cursada", status: "pending", date: "2026-03-31" },
      { label: "Cierre y liquidación PRTR", status: "risk", date: "2026-12-31" },
    ],
    executionRisk: "medio",
    riskFactors: ["Plazo ajustado para completar hitos reformistas antes del cierre", "Capacidad de absorción de CC.AA."],
  },
  {
    id: "prog-feder",
    name: "FEDER 2021-2027 — España",
    source: "feder",
    totalBudgetM: 24100,
    executedM: 10850,
    executionPct: 45.0,
    activeConvocatorias: 0,
    description: "Fondo Europeo de Desarrollo Regional: innovación, digitalización, pymes, economía verde y conectividad territorial.",
    managingBody: "DG Fondos Europeos / CCAA",
    sectors: ["innovación", "pymes", "energía", "conectividad", "economía circular"],
    timeline: [
      { year: 2021, allocatedM: 3200, executedM: 800 },
      { year: 2022, allocatedM: 6500, executedM: 2400 },
      { year: 2023, allocatedM: 10800, executedM: 4800 },
      { year: 2024, allocatedM: 15200, executedM: 7200 },
      { year: 2025, allocatedM: 19500, executedM: 9400 },
      { year: 2026, allocatedM: 24100, executedM: 10850 },
    ],
    milestones: [
      { label: "Aprobación Acuerdo de Asociación", status: "done", date: "2022-07-15" },
      { label: "Designación autoridades de gestión PO", status: "done", date: "2023-03-01" },
      { label: "50% certificación de gasto", status: "pending", date: "2026-06-30" },
      { label: "Cierre 2021-2027 y N+3", status: "risk", date: "2030-12-31" },
    ],
    executionRisk: "medio",
    riskFactors: ["Retrasos en certificación de gasto por CC.AA.", "Riesgo N+2 en algunos PO regionales"],
  },
  {
    id: "prog-fse",
    name: "FSE+ 2021-2027 — España",
    source: "fse-plus",
    totalBudgetM: 10800,
    executedM: 5200,
    executionPct: 48.1,
    activeConvocatorias: 0,
    description: "Fondo Social Europeo Plus: empleo, formación profesional, inclusión social, igualdad y competencias digitales.",
    managingBody: "UAFSE / Ministerio de Trabajo",
    sectors: ["empleo", "formación", "inclusión social", "igualdad"],
    timeline: [
      { year: 2021, allocatedM: 1400, executedM: 350 },
      { year: 2022, allocatedM: 2900, executedM: 1200 },
      { year: 2023, allocatedM: 4800, executedM: 2300 },
      { year: 2024, allocatedM: 6800, executedM: 3400 },
      { year: 2025, allocatedM: 8700, executedM: 4500 },
      { year: 2026, allocatedM: 10800, executedM: 5200 },
    ],
    milestones: [
      { label: "Acuerdo de Asociación aprobado", status: "done", date: "2022-07-15" },
      { label: "PO Empleo y formación operativo", status: "done", date: "2023-01-15" },
      { label: "Revisión intermedia MFP", status: "pending", date: "2026-06-30" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
  {
    id: "prog-cdti",
    name: "CDTI — Financiación de la innovación",
    source: "cdti",
    totalBudgetM: 2400,
    executedM: 1150,
    executionPct: 47.9,
    activeConvocatorias: 0,
    description: "Centro para el Desarrollo Tecnológico e Industrial: préstamos, subvenciones y capital para I+D+i empresarial.",
    managingBody: "CDTI E.P.",
    sectors: ["I+D", "startups", "industria", "biotecnología", "TIC"],
    timeline: [
      { year: 2021, allocatedM: 300, executedM: 210 },
      { year: 2022, allocatedM: 340, executedM: 250 },
      { year: 2023, allocatedM: 380, executedM: 290 },
      { year: 2024, allocatedM: 420, executedM: 340 },
      { year: 2025, allocatedM: 460, executedM: 380 },
      { year: 2026, allocatedM: 500, executedM: 420 },
    ],
    milestones: [
      { label: "Aprobación plan estratégico CDTI 2025-2028", status: "done", date: "2025-01-15" },
      { label: "Lanzamiento ventanilla Neotec 2026", status: "done", date: "2026-02-15" },
      { label: "Evaluación Misiones 2026", status: "pending", date: "2026-09-01" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
  {
    id: "prog-horizon",
    name: "Horizon Europe — Participación española",
    source: "horizon-europe",
    totalBudgetM: 4200,
    executedM: 2100,
    executionPct: 50.0,
    activeConvocatorias: 0,
    description: "Retorno español del programa marco de investigación e innovación de la UE (95.500M EUR totales).",
    managingBody: "Ministerio de Ciencia / CDTI / AEI",
    sectors: ["investigación", "innovación", "salud", "clima", "digital", "espacio"],
    timeline: [
      { year: 2021, allocatedM: 450, executedM: 200 },
      { year: 2022, allocatedM: 600, executedM: 380 },
      { year: 2023, allocatedM: 750, executedM: 520 },
      { year: 2024, allocatedM: 850, executedM: 640 },
      { year: 2025, allocatedM: 900, executedM: 710 },
      { year: 2026, allocatedM: 650, executedM: 350 },
    ],
    milestones: [
      { label: "Strategic Plan 2025-2027 aprobado", status: "done", date: "2024-03-15" },
      { label: "Cluster 2 Health calls cerradas", status: "done", date: "2025-09-30" },
      { label: "Evaluación intermedia Horizon Europe", status: "pending", date: "2026-10-01" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
  {
    id: "prog-bei",
    name: "BEI / InvestEU — Operaciones en España",
    source: "bei",
    totalBudgetM: 8500,
    executedM: 4200,
    executionPct: 49.4,
    activeConvocatorias: 0,
    description: "Préstamos, garantías e inversiones del Banco Europeo de Inversiones y el programa InvestEU en proyectos españoles.",
    managingBody: "BEI / ICO / COFIDES",
    sectors: ["infraestructura", "energía", "innovación", "transporte", "pymes"],
    timeline: [
      { year: 2021, allocatedM: 1200, executedM: 600 },
      { year: 2022, allocatedM: 1400, executedM: 820 },
      { year: 2023, allocatedM: 1600, executedM: 950 },
      { year: 2024, allocatedM: 1800, executedM: 1100 },
      { year: 2025, allocatedM: 1500, executedM: 930 },
      { year: 2026, allocatedM: 1000, executedM: 400 },
    ],
    milestones: [
      { label: "Ventana infraestructura sostenible operativa", status: "done", date: "2022-01-01" },
      { label: "Ventana innovación e investigación activa", status: "done", date: "2023-06-01" },
      { label: "Revisión intermedia InvestEU", status: "pending", date: "2026-12-31" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
  {
    id: "prog-pge",
    name: "Presupuestos Generales del Estado — Subvenciones",
    source: "pge",
    totalBudgetM: 12800,
    executedM: 6900,
    executionPct: 53.9,
    activeConvocatorias: 0,
    description: "Subvenciones nominativas y competitivas con cargo a los PGE: cultura, empleo, turismo, cooperación local y servicios sociales.",
    managingBody: "Ministerios sectoriales",
    sectors: ["cultura", "empleo", "turismo", "servicios sociales", "administración local"],
    timeline: [
      { year: 2021, allocatedM: 9500, executedM: 7200 },
      { year: 2022, allocatedM: 10200, executedM: 7800 },
      { year: 2023, allocatedM: 10800, executedM: 8100 },
      { year: 2024, allocatedM: 11400, executedM: 8600 },
      { year: 2025, allocatedM: 12100, executedM: 9200 },
      { year: 2026, allocatedM: 12800, executedM: 6900 },
    ],
    milestones: [
      { label: "PGE 2026 aprobados", status: "done", date: "2025-12-30" },
      { label: "Convocatorias Q1 publicadas", status: "done", date: "2026-03-31" },
      { label: "Ejecución 75% créditos", status: "pending", date: "2026-09-30" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
  {
    id: "prog-ccaa",
    name: "Programas autonómicos agregados",
    source: "ccaa",
    totalBudgetM: 5600,
    executedM: 2800,
    executionPct: 50.0,
    activeConvocatorias: 0,
    description: "Convocatorias propias de las Comunidades Autónomas: innovación, industria, empleo y emprendimiento.",
    managingBody: "17 CC.AA.",
    sectors: ["innovación", "industria", "empleo", "emprendimiento", "turismo"],
    timeline: [
      { year: 2021, allocatedM: 4200, executedM: 3100 },
      { year: 2022, allocatedM: 4500, executedM: 3400 },
      { year: 2023, allocatedM: 4900, executedM: 3700 },
      { year: 2024, allocatedM: 5200, executedM: 4000 },
      { year: 2025, allocatedM: 5400, executedM: 4200 },
      { year: 2026, allocatedM: 5600, executedM: 2800 },
    ],
    milestones: [
      { label: "Presupuestos autonómicos 2026 aprobados", status: "done", date: "2026-01-15" },
      { label: "Convocatorias innovación Q2 abiertas", status: "pending", date: "2026-06-30" },
    ],
    executionRisk: "bajo",
    riskFactors: [],
  },
];

// ---------------------------------------------------------------------------
// Territory subsidy profiles
// ---------------------------------------------------------------------------

const territoryProfiles: TerritorySubsidyProfile[] = [
  {
    territory: "Andalucía",
    totalReceivedM: 8420,
    perCapita: 986,
    topSectors: [
      { sector: "agricultura", amountM: 2200 },
      { sector: "industria", amountM: 1800 },
      { sector: "infraestructura", amountM: 1600 },
    ],
    activeConvocatorias: 6,
    ngeuExecutionPct: 48.2,
    equityIndex: 72,
  },
  {
    territory: "Cataluña",
    totalReceivedM: 6800,
    perCapita: 870,
    topSectors: [
      { sector: "I+D", amountM: 2100 },
      { sector: "industria", amountM: 1900 },
      { sector: "digitalización", amountM: 1200 },
    ],
    activeConvocatorias: 5,
    ngeuExecutionPct: 55.1,
    equityIndex: 65,
  },
  {
    territory: "Comunidad de Madrid",
    totalReceivedM: 5900,
    perCapita: 860,
    topSectors: [
      { sector: "digitalización", amountM: 1800 },
      { sector: "I+D", amountM: 1600 },
      { sector: "empleo", amountM: 1100 },
    ],
    activeConvocatorias: 4,
    ngeuExecutionPct: 58.4,
    equityIndex: 58,
  },
  {
    territory: "Comunitat Valenciana",
    totalReceivedM: 4300,
    perCapita: 850,
    topSectors: [
      { sector: "industria", amountM: 1200 },
      { sector: "turismo", amountM: 900 },
      { sector: "formación", amountM: 800 },
    ],
    activeConvocatorias: 4,
    ngeuExecutionPct: 46.8,
    equityIndex: 68,
  },
  {
    territory: "Galicia",
    totalReceivedM: 2900,
    perCapita: 1070,
    topSectors: [
      { sector: "industria", amountM: 800 },
      { sector: "energía", amountM: 700 },
      { sector: "pesca", amountM: 500 },
    ],
    activeConvocatorias: 3,
    ngeuExecutionPct: 44.5,
    equityIndex: 78,
  },
  {
    territory: "País Vasco",
    totalReceivedM: 2100,
    perCapita: 960,
    topSectors: [
      { sector: "industria 4.0", amountM: 800 },
      { sector: "I+D", amountM: 600 },
      { sector: "energía", amountM: 400 },
    ],
    activeConvocatorias: 2,
    ngeuExecutionPct: 61.2,
    equityIndex: 55,
  },
  {
    territory: "Castilla y León",
    totalReceivedM: 2600,
    perCapita: 1090,
    topSectors: [
      { sector: "agricultura", amountM: 900 },
      { sector: "economía circular", amountM: 500 },
      { sector: "conectividad rural", amountM: 450 },
    ],
    activeConvocatorias: 3,
    ngeuExecutionPct: 42.1,
    equityIndex: 82,
  },
  {
    territory: "Canarias",
    totalReceivedM: 1800,
    perCapita: 830,
    topSectors: [
      { sector: "turismo", amountM: 600 },
      { sector: "energía renovable", amountM: 450 },
      { sector: "digitalización", amountM: 350 },
    ],
    activeConvocatorias: 2,
    ngeuExecutionPct: 39.8,
    equityIndex: 74,
  },
  {
    territory: "Aragón",
    totalReceivedM: 1400,
    perCapita: 1050,
    topSectors: [
      { sector: "automoción", amountM: 450 },
      { sector: "logística", amountM: 350 },
      { sector: "agroalimentario", amountM: 300 },
    ],
    activeConvocatorias: 2,
    ngeuExecutionPct: 51.6,
    equityIndex: 76,
  },
  {
    territory: "Extremadura",
    totalReceivedM: 1200,
    perCapita: 1130,
    topSectors: [
      { sector: "agricultura", amountM: 420 },
      { sector: "conectividad rural", amountM: 320 },
      { sector: "energía renovable", amountM: 280 },
    ],
    activeConvocatorias: 2,
    ngeuExecutionPct: 40.3,
    equityIndex: 85,
  },
  {
    territory: "Asturias",
    totalReceivedM: 2500,
    perCapita: 2450,
    topSectors: [
      { sector: "industria", amountM: 900 },
      { sector: "transición justa", amountM: 850 },
      { sector: "sanidad", amountM: 450 },
    ],
    activeConvocatorias: 18,
    ngeuExecutionPct: 58.0,
    equityIndex: 72,
  },
  {
    territory: "Illes Balears",
    totalReceivedM: 2800,
    perCapita: 2250,
    topSectors: [
      { sector: "turismo sostenible", amountM: 1100 },
      { sector: "vivienda", amountM: 900 },
      { sector: "energía", amountM: 500 },
    ],
    activeConvocatorias: 15,
    ngeuExecutionPct: 52.0,
    equityIndex: 65,
  },
  {
    territory: "Cantabria",
    totalReceivedM: 1600,
    perCapita: 2750,
    topSectors: [
      { sector: "industria", amountM: 550 },
      { sector: "turismo", amountM: 500 },
      { sector: "I+D", amountM: 350 },
    ],
    activeConvocatorias: 12,
    ngeuExecutionPct: 60.0,
    equityIndex: 74,
  },
  {
    territory: "Castilla-La Mancha",
    totalReceivedM: 5200,
    perCapita: 2500,
    topSectors: [
      { sector: "agricultura", amountM: 1800 },
      { sector: "energía renovable", amountM: 1700 },
      { sector: "agua", amountM: 1000 },
    ],
    activeConvocatorias: 22,
    ngeuExecutionPct: 55.0,
    equityIndex: 71,
  },
  {
    territory: "La Rioja",
    totalReceivedM: 900,
    perCapita: 2800,
    topSectors: [
      { sector: "agroalimentación", amountM: 350 },
      { sector: "vino", amountM: 280 },
      { sector: "digitalización", amountM: 170 },
    ],
    activeConvocatorias: 10,
    ngeuExecutionPct: 62.0,
    equityIndex: 76,
  },
  {
    territory: "Murcia",
    totalReceivedM: 3500,
    perCapita: 2300,
    topSectors: [
      { sector: "agricultura", amountM: 1300 },
      { sector: "agua", amountM: 1100 },
      { sector: "turismo", amountM: 700 },
    ],
    activeConvocatorias: 20,
    ngeuExecutionPct: 50.0,
    equityIndex: 66,
  },
  {
    territory: "Navarra",
    totalReceivedM: 2100,
    perCapita: 3200,
    topSectors: [
      { sector: "automoción", amountM: 750 },
      { sector: "renovables", amountM: 700 },
      { sector: "I+D", amountM: 400 },
    ],
    activeConvocatorias: 16,
    ngeuExecutionPct: 68.0,
    equityIndex: 82,
  },
];

// ---------------------------------------------------------------------------
// Computed stats builder
// ---------------------------------------------------------------------------

function computeStats(
  convs: Convocatoria[],
): SubvencionesData["stats"] {
  const totalConvocatorias = convs.length;
  const openNow = convs.filter((c) => c.status === "abierta").length;
  const totalBudgetM = convs.reduce((s, c) => s + c.budgetM, 0);
  const totalExecutedM = convs.reduce((s, c) => s + (c.executedM ?? 0), 0);
  const executionRate = totalBudgetM > 0 ? Math.round((totalExecutedM / totalBudgetM) * 1000) / 10 : 0;

  const sources: FundSource[] = ["ngeu", "pge", "feder", "fse-plus", "cdti", "ccaa", "local", "horizon-europe", "bei"];
  const bySource = {} as Record<FundSource, { count: number; budgetM: number }>;
  for (const src of sources) {
    const matching = convs.filter((c) => c.fundSource === src);
    bySource[src] = {
      count: matching.length,
      budgetM: matching.reduce((s, c) => s + c.budgetM, 0),
    };
  }

  const sectorMap = new Map<string, { count: number; budgetM: number }>();
  for (const c of convs) {
    for (const sec of c.sectors) {
      const prev = sectorMap.get(sec) ?? { count: 0, budgetM: 0 };
      sectorMap.set(sec, { count: prev.count + 1, budgetM: prev.budgetM + c.budgetM });
    }
  }
  const bySector = Array.from(sectorMap.entries())
    .map(([sector, data]) => ({ sector, ...data }))
    .sort((a, b) => b.budgetM - a.budgetM);

  // Seasonal pattern: count how many convocatorias open in each month
  const monthCounts = new Map<number, number>();
  for (const c of convs) {
    const m = new Date(c.openDate).getMonth() + 1;
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const seasonalPattern: SeasonalPattern[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: monthCounts.get(i + 1) ?? 0,
  }));

  return { totalConvocatorias, openNow, totalBudgetM, totalExecutedM, executionRate, bySource, bySector, seasonalPattern };
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// EU comparison data (Feature #5)
// ---------------------------------------------------------------------------

const euComparison: EuComparisonEntry[] = [
  { country: "España", absorptionPct: 53.1, totalAllocatedM: 163200 },
  { country: "Italia", absorptionPct: 42.8, totalAllocatedM: 191500 },
  { country: "Francia", absorptionPct: 61.2, totalAllocatedM: 40300 },
  { country: "Alemania", absorptionPct: 55.4, totalAllocatedM: 25600 },
  { country: "Portugal", absorptionPct: 48.6, totalAllocatedM: 16600 },
  { country: "Grecia", absorptionPct: 58.9, totalAllocatedM: 30500 },
  { country: "Polonia", absorptionPct: 38.2, totalAllocatedM: 35400 },
  { country: "Media UE", absorptionPct: 49.7, totalAllocatedM: 723800 },
];

// ---------------------------------------------------------------------------
// Forecast — predicted future convocatorias (Feature #13)
// ---------------------------------------------------------------------------

const forecast: ForecastEntry[] = [
  { title: "PERTE Economía Social — Nueva convocatoria", organism: "Ministerio de Trabajo", expectedMonth: "2026-07", estimatedBudgetM: 180, fundSource: "ngeu", sectors: ["economía social", "cooperativas"], confidence: "alta" },
  { title: "Kit Digital Fase 4 — Extensión IA", organism: "Red.es", expectedMonth: "2026-09", estimatedBudgetM: 300, fundSource: "ngeu", sectors: ["digitalización", "IA"], confidence: "alta" },
  { title: "FEDER Murcia — Agua y desalinización", organism: "Comunidad de Murcia / FEDER", expectedMonth: "2026-08", estimatedBudgetM: 120, fundSource: "feder", sectors: ["agua", "medioambiente"], confidence: "media" },
  { title: "Plan Nacional de Competencias Digitales 2027", organism: "Ministerio de Transformación Digital", expectedMonth: "2026-11", estimatedBudgetM: 250, fundSource: "ngeu", sectors: ["formación", "competencias digitales"], confidence: "media" },
  { title: "EIC Pathfinder Open — Convocatoria 2027", organism: "European Innovation Council", expectedMonth: "2027-01", estimatedBudgetM: 350, fundSource: "horizon-europe", sectors: ["investigación", "deeptech"], confidence: "alta" },
  { title: "Misiones Ciencia e Innovación 2027", organism: "AEI / Ministerio de Ciencia", expectedMonth: "2027-02", estimatedBudgetM: 200, fundSource: "pge", sectors: ["I+D", "ciencia"], confidence: "media" },
  { title: "PERTE Naval — Construcción naval verde", organism: "Ministerio de Industria y Turismo", expectedMonth: "2026-10", estimatedBudgetM: 450, fundSource: "ngeu", sectors: ["naval", "transición verde"], confidence: "baja" },
  { title: "Programa estatal vivienda asequible 2027", organism: "Ministerio de Vivienda", expectedMonth: "2027-01", estimatedBudgetM: 600, fundSource: "pge", sectors: ["vivienda", "alquiler social"], confidence: "media" },
];

// ---------------------------------------------------------------------------
// Beneficiary analytics (Feature #14)
// ---------------------------------------------------------------------------

function computeBeneficiaryAnalytics(convs: Convocatoria[]): BeneficiaryAnalytic[] {
  const labelMap: Record<BeneficiaryType, string> = {
    pyme: "PYME",
    "gran-empresa": "Gran empresa",
    autonomo: "Autónomo",
    universidad: "Universidad/Centro investigación",
    ong: "ONG / Tercer sector",
    ayuntamiento: "Ayuntamiento",
    ccaa: "Comunidad Autónoma",
    consorcio: "Consorcio",
  };
  const types: BeneficiaryType[] = ["pyme", "gran-empresa", "autonomo", "universidad", "ong", "ayuntamiento", "ccaa", "consorcio"];
  return types.map((t) => {
    const matching = convs.filter((c) => c.beneficiaryTypes.includes(t));
    const totalBudgetM = matching.reduce((s, c) => s + c.budgetM, 0);
    return {
      type: t,
      label: labelMap[t],
      count: matching.length,
      totalBudgetM,
      avgGrantM: matching.length > 0 ? Math.round((totalBudgetM / matching.length) * 10) / 10 : 0,
    };
  }).sort((a, b) => b.count - a.count);
}

export function buildSubvencionesData(): SubvencionesData {
  // Set active convocatoria counts on programs
  const progs = programs.map((p) => ({
    ...p,
    activeConvocatorias: convocatorias.filter(
      (c) => c.fundSource === p.source && (c.status === "abierta" || c.status === "en-evaluacion"),
    ).length,
  }));

  return {
    convocatorias,
    programs: progs,
    territoryProfiles,
    stats: computeStats(convocatorias),
    euComparison,
    forecast,
    beneficiaryAnalytics: computeBeneficiaryAnalytics(convocatorias),
  };
}

// ---------------------------------------------------------------------------
// Helper / query functions
// ---------------------------------------------------------------------------

export function getOpenConvocatorias(): Convocatoria[] {
  return convocatorias.filter((c) => c.status === "abierta");
}

export function getConvocatoriasBySector(sector: string): Convocatoria[] {
  const lower = sector.toLowerCase();
  return convocatorias.filter((c) =>
    c.sectors.some((s) => s.toLowerCase().includes(lower)),
  );
}

export function getConvocatoriasByTerritory(territory: string): Convocatoria[] {
  const lower = territory.toLowerCase();
  return convocatorias.filter((c) => c.territory.toLowerCase().includes(lower));
}

export function getConvocatoriasBySource(source: FundSource): Convocatoria[] {
  return convocatorias.filter((c) => c.fundSource === source);
}

export function getFundProgram(id: string): FundProgram | undefined {
  return programs.find((p) => p.id === id);
}

export function getUpcomingDeadlines(days: number): Convocatoria[] {
  const now = new Date();
  const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return convocatorias.filter((c) => {
    if (!c.closeDate) return false;
    const close = new Date(c.closeDate);
    return close >= now && close <= limit && c.status === "abierta";
  });
}
