/* ═══════════════════════════════════════════════════════════════════════════
   Public contracts & subsidies — PLACSP / BOE Sección III / Hacienda.
   Based on Plataforma de Contratación del Sector Público (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

export type ContractType = "obras" | "servicios" | "suministros" | "concesion" | "mixto";
export type ContractStatus = "adjudicado" | "en-licitacion" | "desierto" | "resuelto";
export type SubsidyStatus = "concedida" | "en-tramite" | "justificada";

export interface PublicContract {
  id: string;
  title: string;
  summary: string;
  contractType: ContractType;
  status: ContractStatus;
  entity: string; // awarding entity
  ministry?: string;
  amountM: number;
  awardDate: string;
  contractor?: string;
  duration?: string;
  territorySlugs: string[];
  tags: string[];
  sourceUrl: string;
  boeRef?: string;
}

export interface PublicSubsidy {
  id: string;
  title: string;
  summary: string;
  status: SubsidyStatus;
  grantingBody: string;
  amountM: number;
  beneficiaryType: "ccaa" | "municipio" | "empresa" | "asociacion" | "universidad" | "ciudadano";
  publicationDate: string;
  territorySlugs: string[];
  tags: string[];
  sourceUrl: string;
}

export const contractTypeLabels: Record<ContractType, string> = {
  obras: "Obras",
  servicios: "Servicios",
  suministros: "Suministros",
  concesion: "Concesión",
  mixto: "Mixto",
};

export const contractTypeColors: Record<ContractType, string> = {
  obras: "#c8102e",
  servicios: "#003da5",
  suministros: "#009b3a",
  concesion: "#f1bf00",
  mixto: "#6b4c9a",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  adjudicado: "Adjudicado",
  "en-licitacion": "En licitación",
  desierto: "Desierto",
  resuelto: "Resuelto",
};

/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC CONTRACTS — major contracts (>5M€)
   ══════════════════════════════════════════════════════════════════════════ */

export const publicContracts: PublicContract[] = [
  {
    id: "ct-001",
    title: "Construcción del tramo AVE Murcia–Cartagena",
    summary: "Plataforma ferroviaria de alta velocidad, 68 km de vía incluyendo 3 viaductos y 2 túneles.",
    contractType: "obras",
    status: "adjudicado",
    entity: "ADIF Alta Velocidad",
    ministry: "Transportes y Movilidad Sostenible",
    amountM: 842.6,
    awardDate: "2026-03-15",
    contractor: "UTE Sacyr-Acciona",
    duration: "48 meses",
    territorySlugs: ["murcia"],
    tags: ["infraestructura", "AVE", "ferrocarril"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-002",
    title: "Modernización del sistema informático de la Agencia Tributaria",
    summary: "Migración a cloud, nuevo motor antifraude con IA y actualización de la sede electrónica.",
    contractType: "servicios",
    status: "adjudicado",
    entity: "Agencia Tributaria (AEAT)",
    ministry: "Hacienda",
    amountM: 186.4,
    awardDate: "2026-02-28",
    contractor: "Indra Sistemas",
    duration: "36 meses",
    territorySlugs: ["espana", "madrid"],
    tags: ["digitalización", "hacienda", "IA"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-003",
    title: "Suministro de 52 trenes de Cercanías para Renfe",
    summary: "Nuevas unidades eléctricas para las redes de cercanías de Madrid, Barcelona y Valencia.",
    contractType: "suministros",
    status: "adjudicado",
    entity: "Renfe Operadora",
    ministry: "Transportes y Movilidad Sostenible",
    amountM: 624.8,
    awardDate: "2026-01-20",
    contractor: "CAF (Construcciones y Auxiliar de Ferrocarriles)",
    duration: "60 meses",
    territorySlugs: ["madrid", "cataluna", "comunitat-valenciana"],
    tags: ["transporte", "cercanías", "trenes"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-004",
    title: "Construcción de 3 desaladoras en el arco mediterráneo",
    summary: "Plantas desaladoras en Almería, Murcia y Alicante — Plan Hidrológico Nacional de emergencia.",
    contractType: "obras",
    status: "en-licitacion",
    entity: "Acuamed",
    ministry: "Transición Ecológica",
    amountM: 520.0,
    awardDate: "2026-04-30",
    territorySlugs: ["andalucia", "murcia", "comunitat-valenciana"],
    tags: ["agua", "desalación", "sequía"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-005",
    title: "Concesión de la autopista AP-9 Galicia tras reversión",
    summary: "Nueva concesión con peaje blando de la autopista del Atlántico tras fin de concesión de Audasa.",
    contractType: "concesion",
    status: "en-licitacion",
    entity: "Ministerio de Transportes",
    ministry: "Transportes y Movilidad Sostenible",
    amountM: 1240.0,
    awardDate: "2026-06-15",
    duration: "25 años",
    territorySlugs: ["galicia"],
    tags: ["autopista", "concesión", "peaje"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-006",
    title: "Plataforma digital del Sistema Nacional de Salud",
    summary: "Historia clínica digital unificada, receta electrónica interoperable y portal del paciente.",
    contractType: "servicios",
    status: "adjudicado",
    entity: "Ministerio de Sanidad",
    ministry: "Sanidad",
    amountM: 148.2,
    awardDate: "2026-03-08",
    contractor: "Deloitte Consulting + Telefónica Tech",
    duration: "48 meses",
    territorySlugs: ["espana"],
    tags: ["sanidad", "digitalización", "salud"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-007",
    title: "Rehabilitación energética de 12.000 viviendas sociales",
    summary: "Aislamiento térmico, paneles solares y aerotermia en viviendas públicas. Fondos NGEU componente 2.",
    contractType: "obras",
    status: "adjudicado",
    entity: "SEPES (Entidad Pública Empresarial del Suelo)",
    ministry: "Vivienda",
    amountM: 380.0,
    awardDate: "2026-02-14",
    contractor: "UTE FCC-Ferrovial",
    duration: "36 meses",
    territorySlugs: ["andalucia", "madrid", "cataluna", "comunitat-valenciana"],
    tags: ["vivienda", "rehabilitación", "NGEU", "energía"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-008",
    title: "Centro de datos soberano para la AGE",
    summary: "Construcción y operación de un centro de datos de nivel TIER IV para la Administración General del Estado.",
    contractType: "mixto",
    status: "en-licitacion",
    entity: "SGAD (Secretaría General de Administración Digital)",
    ministry: "Transformación Digital",
    amountM: 420.0,
    awardDate: "2026-05-30",
    duration: "15 años",
    territorySlugs: ["espana", "madrid"],
    tags: ["datos", "soberanía digital", "cloud"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-009",
    title: "Servicio de vigilancia y ciberseguridad del CNI",
    summary: "Contrato marco de monitorización SOC 24x7, respuesta a incidentes y auditoría de infraestructuras críticas.",
    contractType: "servicios",
    status: "adjudicado",
    entity: "Centro Nacional de Inteligencia (CNI)",
    ministry: "Presidencia",
    amountM: 92.4,
    awardDate: "2026-01-10",
    contractor: "S2 Grupo + GMV",
    duration: "48 meses",
    territorySlugs: ["espana"],
    tags: ["ciberseguridad", "defensa", "infraestructura crítica"],
    sourceUrl: "https://contrataciondelestado.es",
  },
  {
    id: "ct-010",
    title: "Construcción del Hospital Universitario de Málaga Norte",
    summary: "Nuevo complejo hospitalario con 800 camas, urgencias, UCI y centro de investigación oncológica.",
    contractType: "obras",
    status: "adjudicado",
    entity: "Servicio Andaluz de Salud (SAS)",
    amountM: 486.0,
    awardDate: "2026-03-22",
    contractor: "UTE Dragados-OHL",
    duration: "42 meses",
    territorySlugs: ["andalucia"],
    tags: ["sanidad", "hospital", "infraestructura"],
    sourceUrl: "https://contrataciondelestado.es",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC SUBSIDIES — major grant programs
   ══════════════════════════════════════════════════════════════════════════ */

export const publicSubsidies: PublicSubsidy[] = [
  {
    id: "sub-001",
    title: "Programa PERTE Chip: Semiconductores y microelectrónica",
    summary: "Ayudas directas a la industria de semiconductores en España. Incluye instalación de fábricas y centros de diseño.",
    status: "concedida",
    grantingBody: "Ministerio de Industria",
    amountM: 12400,
    beneficiaryType: "empresa",
    publicationDate: "2026-01-15",
    territorySlugs: ["espana", "cataluna", "aragon", "madrid"],
    tags: ["PERTE", "chips", "industria"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-002",
    title: "Kit Digital ampliado: ayudas a pymes y autónomos",
    summary: "Bonos de hasta 12.000€ para digitalización: web, e-commerce, ciberseguridad, IA, ERP.",
    status: "concedida",
    grantingBody: "Red.es / Ministerio de Transformación Digital",
    amountM: 3200,
    beneficiaryType: "empresa",
    publicationDate: "2026-02-10",
    territorySlugs: ["espana"],
    tags: ["digitalización", "pymes", "NGEU"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-003",
    title: "Plan Moves IV: incentivos al vehículo eléctrico",
    summary: "Subvenciones hasta 9.000€ para compra de vehículos eléctricos y puntos de recarga.",
    status: "concedida",
    grantingBody: "IDAE / Ministerio de Transición Ecológica",
    amountM: 800,
    beneficiaryType: "ciudadano",
    publicationDate: "2026-01-28",
    territorySlugs: ["espana"],
    tags: ["vehículo eléctrico", "movilidad", "clima"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-004",
    title: "Transferencias a CCAA — sistema de financiación autonómica",
    summary: "Liquidación del sistema de financiación: entregas a cuenta y fondo de suficiencia para 2026.",
    status: "concedida",
    grantingBody: "Ministerio de Hacienda",
    amountM: 128400,
    beneficiaryType: "ccaa",
    publicationDate: "2026-03-01",
    territorySlugs: ["espana", "andalucia", "cataluna", "comunitat-valenciana", "madrid", "galicia"],
    tags: ["financiación autonómica", "transferencias"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-005",
    title: "Convocatoria de becas FPU y FPI 2026",
    summary: "Becas de formación de profesorado universitario (FPU) e investigación (FPI): 2.400 nuevas plazas.",
    status: "en-tramite",
    grantingBody: "Ministerio de Ciencia, Innovación y Universidades",
    amountM: 186,
    beneficiaryType: "universidad",
    publicationDate: "2026-03-15",
    territorySlugs: ["espana"],
    tags: ["educación", "investigación", "becas"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-006",
    title: "PERTE de economía circular: residuos y reciclaje",
    summary: "Ayudas a plantas de reciclaje, gestión de residuos textiles y plásticos, y economía circular industrial.",
    status: "concedida",
    grantingBody: "Ministerio de Transición Ecológica",
    amountM: 1200,
    beneficiaryType: "empresa",
    publicationDate: "2026-02-20",
    territorySlugs: ["espana", "cataluna", "pais-vasco", "comunitat-valenciana"],
    tags: ["PERTE", "economía circular", "medioambiente"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-007",
    title: "Plan de impulso a la vivienda en alquiler asequible",
    summary: "Transferencias a CCAA y municipios para construcción de vivienda pública en alquiler a precio regulado.",
    status: "concedida",
    grantingBody: "Ministerio de Vivienda",
    amountM: 2800,
    beneficiaryType: "ccaa",
    publicationDate: "2026-03-08",
    territorySlugs: ["espana", "madrid", "cataluna", "illes-balears", "canarias"],
    tags: ["vivienda", "alquiler", "vivienda pública"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-008",
    title: "Fondos PAC 2026 — Ayudas directas a agricultores",
    summary: "Pagos directos de la PAC (Política Agrícola Común) a agricultores y ganaderos españoles.",
    status: "concedida",
    grantingBody: "FEGA / Ministerio de Agricultura",
    amountM: 5400,
    beneficiaryType: "empresa",
    publicationDate: "2026-01-05",
    territorySlugs: ["espana", "castilla-y-leon", "castilla-la-mancha", "andalucia", "extremadura", "aragon"],
    tags: ["PAC", "agricultura", "UE"],
    sourceUrl: "https://www.boe.es",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   AGGREGATE STATS
   ══════════════════════════════════════════════════════════════════════════ */

export const contractsSummary = {
  totalContractsTracked: publicContracts.length,
  totalValueM: publicContracts.reduce((s, c) => s + c.amountM, 0),
  adjudicados: publicContracts.filter((c) => c.status === "adjudicado").length,
  enLicitacion: publicContracts.filter((c) => c.status === "en-licitacion").length,
  byType: Object.fromEntries(
    (["obras", "servicios", "suministros", "concesion", "mixto"] as ContractType[]).map((t) => [
      t,
      { count: publicContracts.filter((c) => c.contractType === t).length, totalM: publicContracts.filter((c) => c.contractType === t).reduce((s, c) => s + c.amountM, 0) },
    ])
  ),
};

export const subsidiesSummary = {
  totalSubsidies: publicSubsidies.length,
  totalValueM: publicSubsidies.reduce((s, sub) => s + sub.amountM, 0),
};

/* ══════════════════════════════════════════════════════════════════════════
   QUERY FUNCTIONS
   ══════════════════════════════════════════════════════════════════════════ */

export function getContractsForTerritory(slug: string): PublicContract[] {
  return publicContracts.filter((c) => c.territorySlugs.includes(slug));
}

export function getSubsidiesForTerritory(slug: string): PublicSubsidy[] {
  return publicSubsidies.filter((s) => s.territorySlugs.includes(slug));
}

export function getContractsByType(type: ContractType): PublicContract[] {
  return publicContracts.filter((c) => c.contractType === type);
}
