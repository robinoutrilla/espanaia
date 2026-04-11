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

  // ── Subvenciones autonómicas de Andalucía ──────────────────────────────
  {
    id: "sub-and-001",
    title: "Programa de Empleo y Garantía de Rentas — Subsidio Agrario (Andalucía/Extremadura)",
    summary: "Subsidio por desempleo para trabajadores eventuales agrarios en Andalucía y Extremadura. Prestación de 430 euros/mes durante 6 meses. Requisito: haber cotizado al menos 35 jornadas reales en los 12 meses anteriores. Afecta a más de 700.000 trabajadores del campo.",
    status: "concedida",
    grantingBody: "SEPE / Junta de Andalucía",
    amountM: 1200,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-15",
    territorySlugs: ["andalucia", "extremadura"],
    tags: ["subsidio agrario", "empleo", "renta agraria", "PER", "eventuales agrarios", "jornaleros"],
    sourceUrl: "https://www.juntadeandalucia.es",
  },
  {
    id: "sub-and-002",
    title: "Renta Mínima de Inserción Social en Andalucía (RMISA)",
    summary: "Prestación económica mensual para familias y personas en situación de pobreza o exclusión social en Andalucía. Cuantía base: 604 euros/mes para unidad familiar de un miembro, con complementos por hijos y discapacidad. Complementa al IMV estatal.",
    status: "concedida",
    grantingBody: "Consejería de Inclusión Social, Juventud, Familias e Igualdad",
    amountM: 340,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-03-01",
    territorySlugs: ["andalucia"],
    tags: ["renta mínima", "exclusión social", "pobreza", "inserción", "protección social"],
    sourceUrl: "https://www.juntadeandalucia.es/organismos/inclusionsocialjuventudfamiliaseigualdad.html",
  },
  {
    id: "sub-and-003",
    title: "Bono Social Térmico — Andalucía",
    summary: "Ayuda directa para compensar el gasto en calefacción, agua caliente y cocina de hogares vulnerables. Entre 25 y 123,94 euros anuales según zona climática y grado de vulnerabilidad. Andalucía concentra el 20% de los beneficiarios nacionales.",
    status: "concedida",
    grantingBody: "Ministerio Transición Ecológica / Junta de Andalucía",
    amountM: 90,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-10",
    territorySlugs: ["andalucia", "espana"],
    tags: ["bono social", "energía", "vulnerabilidad", "calefacción", "pobreza energética"],
    sourceUrl: "https://www.boe.es",
  },
  {
    id: "sub-and-004",
    title: "Programa de Ayudas al Alquiler de Vivienda Habitual — Andalucía",
    summary: "Subvención de hasta el 50% de la renta mensual (máximo 300 euros/mes) para familias con ingresos inferiores a 3 veces el IPREM. Incluye complemento para menores de 35 años, familias numerosas y víctimas de violencia de género. Presupuesto autonómico de 50M euros.",
    status: "concedida",
    grantingBody: "Consejería de Fomento, Articulación del Territorio y Vivienda",
    amountM: 50,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-04-01",
    territorySlugs: ["andalucia"],
    tags: ["vivienda", "alquiler", "ayuda", "jóvenes", "familias"],
    sourceUrl: "https://www.juntadeandalucia.es/organismos/faborarticulacionterritorioyvivienda.html",
  },
  {
    id: "sub-and-005",
    title: "Incentivos a la Contratación Estable en Andalucía",
    summary: "Bonificaciones de entre 4.750 y 7.500 euros por contrato indefinido para empresas andaluzas que contraten a desempleados menores de 30 años, mayores de 45, mujeres en sectores subrepresentados o personas con discapacidad. Financiado con fondos FSE+.",
    status: "concedida",
    grantingBody: "Consejería de Empleo, Empresa y Trabajo Autónomo",
    amountM: 180,
    beneficiaryType: "empresa",
    publicationDate: "2025-02-15",
    territorySlugs: ["andalucia"],
    tags: ["empleo", "contratación", "bonificación", "jóvenes", "discapacidad", "mujeres", "incentivo"],
    sourceUrl: "https://www.juntadeandalucia.es/organismos/empleoempresaytrabajoautonomo.html",
  },
  {
    id: "sub-and-006",
    title: "Subvenciones a Autónomos y Honorarios Profesionales — Andalucía",
    summary: "Línea de ayudas para trabajadores autónomos y profesionales que facturen honorarios en Andalucía. Incluye: tarifa plana autonómica de 60 euros/mes durante 24 meses para nuevos autónomos, bonificación del 100% de cuota para autónomos con discapacidad, y subvención de hasta 5.000 euros para gastos de establecimiento. Cubre honorarios de asesores, abogados y profesionales liberales que inicien actividad.",
    status: "concedida",
    grantingBody: "Consejería de Empleo, Empresa y Trabajo Autónomo",
    amountM: 95,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-20",
    territorySlugs: ["andalucia"],
    tags: ["autónomos", "honorarios", "tarifa plana", "profesionales liberales", "alta autónomos", "cuota", "bonificación"],
    sourceUrl: "https://www.juntadeandalucia.es/organismos/empleoempresaytrabajoautonomo.html",
  },
  {
    id: "sub-and-007",
    title: "Programa Andaluz de Formación y Empleo — Garantía Juvenil+",
    summary: "Formación con compromiso de contratación para jóvenes entre 16 y 30 años inscritos en Garantía Juvenil. Incluye beca-salario de 600 euros/mes durante la formación. Sectores prioritarios: tecnología, turismo, agroindustria, energías renovables. 15.000 plazas anuales.",
    status: "concedida",
    grantingBody: "SAE (Servicio Andaluz de Empleo)",
    amountM: 120,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-03-15",
    territorySlugs: ["andalucia"],
    tags: ["formación", "empleo juvenil", "garantía juvenil", "beca", "jóvenes", "FP"],
    sourceUrl: "https://www.juntadeandalucia.es/servicioandaluzdeempleo.html",
  },
  {
    id: "sub-and-008",
    title: "Ayudas a la Dependencia y Cuidados — Andalucía",
    summary: "Prestaciones económicas para personas en situación de dependencia reconocida (Grado I, II, III). Incluye: prestación vinculada al servicio (300-750 euros/mes), prestación para cuidados familiares (153-387 euros/mes), y asistencia personal (300-833 euros/mes). Andalucía tiene 280.000 beneficiarios, la CCAA con más dependientes de España.",
    status: "concedida",
    grantingBody: "Agencia de Servicios Sociales y Dependencia de Andalucía",
    amountM: 2100,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-05",
    territorySlugs: ["andalucia"],
    tags: ["dependencia", "cuidados", "discapacidad", "mayores", "asistencia", "ley dependencia"],
    sourceUrl: "https://www.juntadeandalucia.es/agenciaserviciossocialesydependencia.html",
  },

  // ── Subvenciones autonómicas de otras CCAA principales ─────────────────
  {
    id: "sub-cat-001",
    title: "Renta Garantizada de Ciudadanía — Cataluña",
    summary: "Prestación económica para personas y familias en situación de pobreza en Cataluña. Cuantía base de 695 euros/mes con complementos por hijos. 150.000 beneficiarios. Complementa al IMV.",
    status: "concedida",
    grantingBody: "Generalitat de Catalunya — Departament de Drets Socials",
    amountM: 580,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-10",
    territorySlugs: ["cataluna"],
    tags: ["renta garantizada", "pobreza", "exclusión", "protección social"],
    sourceUrl: "https://web.gencat.cat",
  },
  {
    id: "sub-mad-001",
    title: "Renta Mínima de Inserción — Comunidad de Madrid",
    summary: "Prestación mensual para personas sin recursos en Madrid. Base de 400-700 euros/mes según unidad familiar. Compatible con empleo a tiempo parcial. 45.000 beneficiarios.",
    status: "concedida",
    grantingBody: "Comunidad de Madrid — Consejería de Familia",
    amountM: 280,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-02-01",
    territorySlugs: ["madrid"],
    tags: ["renta mínima", "inserción", "exclusión social", "pobreza"],
    sourceUrl: "https://www.comunidad.madrid",
  },
  {
    id: "sub-val-001",
    title: "Renta Valenciana de Inclusión — Comunitat Valenciana",
    summary: "Prestación económica de la Generalitat Valenciana para garantizar ingresos mínimos. Entre 428 y 843 euros/mes. Incluye itinerario de inserción sociolaboral. 85.000 beneficiarios.",
    status: "concedida",
    grantingBody: "Generalitat Valenciana — Conselleria de Servicios Sociales",
    amountM: 310,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-15",
    territorySlugs: ["comunitat-valenciana"],
    tags: ["renta inclusión", "pobreza", "inserción", "protección social"],
    sourceUrl: "https://www.gva.es",
  },
  {
    id: "sub-pv-001",
    title: "Renta de Garantía de Ingresos (RGI) — País Vasco",
    summary: "Prestación periódica de naturaleza económica para atender necesidades básicas. La más generosa de España: 784 euros/mes para persona sola, hasta 1.068 euros para familias. 55.000 hogares beneficiarios. Complementada con PCV (Prestación Complementaria de Vivienda).",
    status: "concedida",
    grantingBody: "Gobierno Vasco — Departamento de Igualdad, Justicia y Políticas Sociales",
    amountM: 480,
    beneficiaryType: "ciudadano",
    publicationDate: "2025-01-10",
    territorySlugs: ["pais-vasco"],
    tags: ["RGI", "renta garantía", "pobreza", "protección social", "Lanbide"],
    sourceUrl: "https://www.euskadi.eus",
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
