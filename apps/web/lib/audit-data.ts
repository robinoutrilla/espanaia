/* ═══════════════════════════════════════════════════════════════════════════
   Tribunal de Cuentas — audit reports and findings.
   Based on published fiscalización reports from tcu.es (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

export type AuditRating = "favorable" | "con-salvedades" | "desfavorable" | "sin-opinion";
export type FindingSeverity = "critica" | "alta" | "media" | "baja";
export type AuditedEntityType = "ministerio" | "ccaa" | "empresa-publica" | "partido" | "universidad" | "organismo-autonomo" | "ayuntamiento" | "diputacion" | "mancomunidad";

export interface AuditReport {
  id: string;
  title: string;
  summary: string;
  auditedEntity: string;
  entityType: AuditedEntityType;
  fiscalYear: number;
  publicationDate: string;
  rating: AuditRating;
  totalFindingsCount: number;
  criticalFindings: number;
  amountQuestionedM?: number;
  keyFindings: string[];
  recommendations: string[];
  territorySlugs: string[];
  tags: string[];
  sourceUrl: string;
}

export const ratingLabels: Record<AuditRating, string> = {
  favorable: "Favorable",
  "con-salvedades": "Con salvedades",
  desfavorable: "Desfavorable",
  "sin-opinion": "Sin opinión",
};

export const ratingColors: Record<AuditRating, string> = {
  favorable: "#009b3a",
  "con-salvedades": "#f1bf00",
  desfavorable: "#c8102e",
  "sin-opinion": "#8e8e9a",
};

export const severityLabels: Record<FindingSeverity, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const entityTypeLabels: Record<AuditedEntityType, string> = {
  ministerio: "Ministerio",
  ccaa: "Comunidad Autónoma",
  "empresa-publica": "Empresa pública",
  partido: "Partido político",
  universidad: "Universidad",
  "organismo-autonomo": "Organismo autónomo",
  ayuntamiento: "Ayuntamiento",
  diputacion: "Diputación provincial",
  mancomunidad: "Mancomunidad",
};

/* ══════════════════════════════════════════════════════════════════════════
   AUDIT REPORTS
   ══════════════════════════════════════════════════════════════════════════ */

export const auditReports: AuditReport[] = [
  {
    id: "audit-001",
    title: "Fiscalización de la gestión de los fondos NextGenerationEU en España (2021-2024)",
    summary: "Examen de la ejecución del Plan de Recuperación, Transformación y Resiliencia. Abarca gobernanza, control interno, ejecución y cumplimiento de hitos.",
    auditedEntity: "Ministerio de Hacienda / Secretaría General de Fondos Europeos",
    entityType: "ministerio",
    fiscalYear: 2024,
    publicationDate: "2025-12-18",
    rating: "con-salvedades",
    totalFindingsCount: 28,
    criticalFindings: 3,
    amountQuestionedM: 1840,
    keyFindings: [
      "Retrasos significativos en la ejecución de 12 componentes del PRTR",
      "Deficiencias en el sistema de control interno para prevención del fraude",
      "Falta de trazabilidad completa en subcontratación de proyectos NGEU",
      "Concentración del 68% de los fondos en 3 CCAA (Andalucía, Cataluña, Madrid)",
    ],
    recommendations: [
      "Reforzar la Unidad de Seguimiento del PRTR con personal adicional",
      "Implantar sistema de alerta temprana para hitos con riesgo de incumplimiento",
      "Mejorar la trazabilidad de pagos a subcontratistas en proyectos NGEU",
    ],
    territorySlugs: ["espana"],
    tags: ["NGEU", "fondos europeos", "PRTR", "control"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-002",
    title: "Informe de fiscalización de la Cuenta General del Estado 2024",
    summary: "Auditoría anual de la Cuenta General del Estado. Revisión de ingresos, gastos, endeudamiento y patrimonio de la AGE.",
    auditedEntity: "Administración General del Estado",
    entityType: "ministerio",
    fiscalYear: 2024,
    publicationDate: "2025-11-28",
    rating: "con-salvedades",
    totalFindingsCount: 42,
    criticalFindings: 5,
    amountQuestionedM: 3200,
    keyFindings: [
      "Déficit presupuestario superior al previsto en 0.4 puntos del PIB",
      "Incremento no presupuestado de compromisos plurianuales de gasto",
      "Insuficiente provisión para sentencias judiciales pendientes contra el Estado",
      "Desviaciones en contratos de obras públicas por sobrecostes del 18% medio",
      "Retrasos en la liquidación del sistema de financiación autonómica",
    ],
    recommendations: [
      "Mejorar la estimación de ingresos tributarios con modelos actualizados",
      "Provisionar adecuadamente las contingencias judiciales",
      "Reforzar la supervisión de contratos con cláusulas de revisión de precios",
    ],
    territorySlugs: ["espana"],
    tags: ["cuenta general", "presupuestos", "déficit"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-003",
    title: "Fiscalización de la contratación pública de emergencia durante la DANA 2024",
    summary: "Revisión de los contratos de emergencia adjudicados tras la DANA en la Comunitat Valenciana. Evaluación de proporcionalidad, transparencia y ejecución.",
    auditedEntity: "Generalitat Valenciana / Ministerio del Interior",
    entityType: "ccaa",
    fiscalYear: 2024,
    publicationDate: "2026-02-14",
    rating: "con-salvedades",
    totalFindingsCount: 18,
    criticalFindings: 2,
    amountQuestionedM: 420,
    keyFindings: [
      "Contratos de emergencia por 2.800 M€ sin los controles habituales de fiscalización previa",
      "Falta de justificación de precios en el 34% de los contratos de obras urgentes",
      "Duplicidades de pagos entre la administración central y autonómica",
    ],
    recommendations: [
      "Establecer un protocolo de control simplificado pero efectivo para emergencias",
      "Crear un registro centralizado de contratos de emergencia accesible en tiempo real",
    ],
    territorySlugs: ["comunitat-valenciana"],
    tags: ["DANA", "emergencia", "contratación", "Valencia"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-004",
    title: "Fiscalización del gasto sanitario del Servicio Andaluz de Salud (SAS)",
    summary: "Análisis del gasto sanitario, listas de espera, contratación de personal y suministros farmacéuticos.",
    auditedEntity: "Servicio Andaluz de Salud (SAS)",
    entityType: "ccaa",
    fiscalYear: 2024,
    publicationDate: "2025-10-22",
    rating: "con-salvedades",
    totalFindingsCount: 22,
    criticalFindings: 2,
    amountQuestionedM: 186,
    keyFindings: [
      "Listas de espera quirúrgicas superiores a la media nacional en un 28%",
      "Contratos de suministro farmacéutico sin procedimiento competitivo adecuado",
      "Personal interino superior al 40% en atención primaria",
    ],
    recommendations: [
      "Plan de choque para reducir listas de espera quirúrgicas",
      "Centralizar la contratación farmacéutica con criterios de competencia",
      "Estabilizar las plantillas de personal sanitario",
    ],
    territorySlugs: ["andalucia"],
    tags: ["sanidad", "listas de espera", "gasto sanitario"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-005",
    title: "Fiscalización de RENFE Operadora, S.M.E.",
    summary: "Auditoría operativa y financiera de Renfe: costes del servicio, puntualidad, inversiones y obligaciones de servicio público.",
    auditedEntity: "RENFE Operadora",
    entityType: "empresa-publica",
    fiscalYear: 2024,
    publicationDate: "2025-09-15",
    rating: "con-salvedades",
    totalFindingsCount: 16,
    criticalFindings: 1,
    amountQuestionedM: 240,
    keyFindings: [
      "Retrasos medios de Cercanías Madrid superiores a los estándares comprometidos",
      "Inversión en material rodante inferior al plan aprobado en un 22%",
      "Costes de mantenimiento de la flota AVE un 15% superiores a la media europea comparable",
    ],
    recommendations: [
      "Acelerar la recepción de trenes contratados a CAF y Alstom",
      "Revisar el modelo de mantenimiento integral de la flota",
    ],
    territorySlugs: ["espana", "madrid"],
    tags: ["Renfe", "transporte", "cercanías", "AVE"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-006",
    title: "Fiscalización de las cuentas de los partidos políticos, ejercicio 2024",
    summary: "Examen anual de la contabilidad, financiación y gastos electorales de todos los partidos con representación parlamentaria.",
    auditedEntity: "Partidos políticos con representación",
    entityType: "partido",
    fiscalYear: 2024,
    publicationDate: "2026-03-28",
    rating: "con-salvedades",
    totalFindingsCount: 34,
    criticalFindings: 4,
    keyFindings: [
      "3 partidos presentaron la contabilidad fuera de plazo",
      "Deficiencias en la justificación de gastos electorales en 2 formaciones",
      "Donaciones no identificadas adecuadamente en 1 partido",
      "Préstamos bancarios con condiciones no de mercado en 2 casos",
    ],
    recommendations: [
      "Reforzar los mecanismos de control interno de las tesorerías de los partidos",
      "Mejorar la transparencia en la publicación de cuentas online",
      "Digitalizar completamente el proceso de rendición de cuentas al TCu",
    ],
    territorySlugs: ["espana"],
    tags: ["partidos", "financiación", "transparencia"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-007",
    title: "Fiscalización del Plan de Vivienda Estatal 2022-2025",
    summary: "Evaluación de la ejecución del plan estatal de vivienda: bono alquiler joven, rehabilitación y vivienda pública.",
    auditedEntity: "Ministerio de Vivienda / CCAA",
    entityType: "ministerio",
    fiscalYear: 2024,
    publicationDate: "2026-01-20",
    rating: "desfavorable",
    totalFindingsCount: 24,
    criticalFindings: 6,
    amountQuestionedM: 340,
    keyFindings: [
      "Solo el 42% de los fondos del bono alquiler joven fueron efectivamente cobrados por beneficiarios",
      "58% de las viviendas públicas previstas no se iniciaron en el plazo del plan",
      "6 CCAA no ejecutaron más del 60% de las transferencias recibidas para rehabilitación",
      "Falta de coordinación entre Ministerio y CCAA en los criterios de adjudicación",
    ],
    recommendations: [
      "Simplificar radicalmente el procedimiento de solicitud del bono alquiler",
      "Establecer convenios bilaterales con CCAA con hitos de ejecución vinculantes",
      "Crear un registro nacional de vivienda pública disponible en tiempo real",
    ],
    territorySlugs: ["espana", "madrid", "cataluna", "andalucia", "comunitat-valenciana"],
    tags: ["vivienda", "alquiler", "rehabilitación"],
    sourceUrl: "https://www.tcu.es/informes",
  },

  // ── Auditorías de entidades locales ────────────────────────────────────
  {
    id: "audit-008",
    title: "Fiscalización del Ayuntamiento de Madrid — Contratación pública 2024",
    summary: "Revisión de procedimientos de contratación del Ayuntamiento de Madrid. Detectados contratos menores encadenados y deficiencias en justificación de procedimientos negociados sin publicidad.",
    auditedEntity: "Ayuntamiento de Madrid",
    entityType: "ayuntamiento",
    fiscalYear: 2024,
    publicationDate: "2025-11-20",
    rating: "con-salvedades",
    totalFindingsCount: 18,
    criticalFindings: 3,
    amountQuestionedM: 45.2,
    keyFindings: [
      "67 contratos menores encadenados al mismo proveedor por 12,3 M€",
      "Procedimiento negociado sin publicidad en obra de Calle 30 por 28 M€ sin justificación suficiente",
      "Retrasos en publicación de actas de mesas de contratación",
    ],
    recommendations: [
      "Centralizar registro de contratos menores con alertas automáticas por proveedor",
      "Publicar justificación detallada en todos los negociados sin publicidad",
      "Implantar sistema electrónico de gestión de contratación",
    ],
    territorySlugs: ["madrid"],
    tags: ["contratación", "ayuntamiento", "madrid", "contratos-menores"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-009",
    title: "Fiscalización del Ayuntamiento de Barcelona — Gestión económico-financiera 2024",
    summary: "Análisis de la gestión presupuestaria y financiera. Superávit presupuestario no destinado a reducción de deuda. Gasto en personal por encima de los límites legales.",
    auditedEntity: "Ayuntamiento de Barcelona",
    entityType: "ayuntamiento",
    fiscalYear: 2024,
    publicationDate: "2025-12-05",
    rating: "con-salvedades",
    totalFindingsCount: 14,
    criticalFindings: 2,
    amountQuestionedM: 32.8,
    keyFindings: [
      "Superávit de 89 M€ no aplicado a reducción de deuda según regla de gasto",
      "Gasto en personal al 38% del presupuesto (límite recomendado: 35%)",
      "Subvenciones directas a entidades sin convocatoria pública por 18 M€",
    ],
    recommendations: [
      "Aplicar superávit a amortización de deuda conforme a LOEPSF",
      "Plan de ajuste de plantilla a medio plazo",
      "Aprobar bases reguladoras para todas las líneas de subvención",
    ],
    territorySlugs: ["cataluna"],
    tags: ["presupuestos", "ayuntamiento", "barcelona", "deuda", "personal"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-010",
    title: "Fiscalización de la Diputación de Valencia — Subvenciones y transferencias 2023-2024",
    summary: "Revisión de subvenciones a municipios de la provincia. Deficiencias en justificación de fondos transferidos y falta de seguimiento de ejecución.",
    auditedEntity: "Diputación de Valencia",
    entityType: "diputacion",
    fiscalYear: 2024,
    publicationDate: "2026-01-15",
    rating: "con-salvedades",
    totalFindingsCount: 22,
    criticalFindings: 4,
    amountQuestionedM: 28.5,
    keyFindings: [
      "42% de subvenciones a municipios sin justificación completa de gasto",
      "Plan Provincial de Obras: 15 proyectos sin certificación final por 8,5 M€",
      "Convenios con municipios sin cláusula de reintegro por incumplimiento",
      "Retraso medio de 14 meses en transferencias del Plan de Cooperación",
    ],
    recommendations: [
      "Implantar sistema de justificación telemática obligatoria",
      "Certificación de obra como requisito previo al último pago",
      "Incluir cláusulas de reintegro en todos los convenios",
    ],
    territorySlugs: ["comunitat-valenciana"],
    tags: ["subvenciones", "diputacion", "valencia", "municipios", "obras"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-011",
    title: "Fiscalización del Ayuntamiento de Sevilla — Urbanismo y licencias 2023",
    summary: "Revisión de la gestión urbanística municipal. Licencias otorgadas sin informe técnico preceptivo. Retrasos en tramitación que superan los plazos legales.",
    auditedEntity: "Ayuntamiento de Sevilla",
    entityType: "ayuntamiento",
    fiscalYear: 2023,
    publicationDate: "2025-09-10",
    rating: "desfavorable",
    totalFindingsCount: 26,
    criticalFindings: 6,
    amountQuestionedM: 15.3,
    keyFindings: [
      "189 licencias de obra otorgadas sin informe técnico municipal",
      "Plazo medio de tramitación de licencias: 14 meses (legal: 3 meses)",
      "Silencio administrativo positivo aplicado incorrectamente en 34 casos",
      "Expedientes de disciplina urbanística prescritos por inacción: 78",
    ],
    recommendations: [
      "Reforzar plantilla de arquitectos municipales",
      "Implantar tramitación electrónica de licencias",
      "Protocolo de vigilancia para evitar prescripción de expedientes",
    ],
    territorySlugs: ["andalucia"],
    tags: ["urbanismo", "licencias", "ayuntamiento", "sevilla"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-012",
    title: "Fiscalización de la Diputación de Barcelona — Planes de cooperación municipal 2023-2024",
    summary: "Auditoría del Plan de Cooperación con municipios de menos de 20.000 habitantes. Buenas prácticas en gestión pero deficiencias en evaluación de impacto.",
    auditedEntity: "Diputación de Barcelona",
    entityType: "diputacion",
    fiscalYear: 2024,
    publicationDate: "2026-02-20",
    rating: "favorable",
    totalFindingsCount: 8,
    criticalFindings: 0,
    amountQuestionedM: 3.1,
    keyFindings: [
      "98% de proyectos finalizados dentro del plazo previsto",
      "Sistema de seguimiento telemático ejemplar",
      "Falta evaluación de impacto ex-post en programas de digitalización",
    ],
    recommendations: [
      "Implantar evaluación de impacto a 2 años para todos los programas",
      "Compartir buenas prácticas de gestión con otras diputaciones",
    ],
    territorySlugs: ["cataluna"],
    tags: ["cooperacion", "diputacion", "barcelona", "municipios-rurales"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-013",
    title: "Fiscalización del Ayuntamiento de Málaga — Empresas municipales 2024",
    summary: "Auditoría de las sociedades municipales (EMT, LIMASA, PROMALAGA). Deficiencias en transparencia retributiva y contratación de personal directivo.",
    auditedEntity: "Ayuntamiento de Málaga",
    entityType: "ayuntamiento",
    fiscalYear: 2024,
    publicationDate: "2026-03-01",
    rating: "con-salvedades",
    totalFindingsCount: 12,
    criticalFindings: 2,
    amountQuestionedM: 8.7,
    keyFindings: [
      "Retribuciones de directivos de empresas municipales sin publicación en portal de transparencia",
      "Contratación de 12 directivos sin convocatoria pública",
      "LIMASA: costes de servicio 22% superiores a media de municipios similares",
    ],
    recommendations: [
      "Publicar retribuciones de directivos en el portal de transparencia",
      "Proceso selectivo público para puestos directivos de empresas municipales",
      "Benchmark de costes con municipios comparables",
    ],
    territorySlugs: ["andalucia"],
    tags: ["empresas-municipales", "ayuntamiento", "malaga", "transparencia"],
    sourceUrl: "https://www.tcu.es/informes",
  },
  {
    id: "audit-014",
    title: "Fiscalización de la gestión de emergencias por DANA — Generalitat Valenciana y AGE",
    summary: "Informe especial sobre la coordinación entre la Administración General del Estado y la Generalitat Valenciana en la gestión de la DANA de octubre 2024. Evaluación de protocolos de alerta, evacuación, contratación de emergencia y reconstrucción.",
    auditedEntity: "Generalitat Valenciana / Delegación del Gobierno",
    entityType: "ccaa",
    fiscalYear: 2025,
    publicationDate: "2026-04-07",
    rating: "desfavorable",
    totalFindingsCount: 32,
    criticalFindings: 8,
    amountQuestionedM: 580,
    keyFindings: [
      "Retraso de 4 horas en la activación del sistema de alertas a móviles ES-Alert",
      "Protocolos de evacuación no actualizados desde 2019 en 12 municipios afectados",
      "Contratos de emergencia por 1.200 M€ sin control de fiscalización posterior en el 60% de los casos",
      "Duplicidad de pagos entre AGE y Generalitat por 180 M€ en ayudas directas a damnificados",
      "Falta de coordinación en el despliegue de la UME con protección civil autonómica",
    ],
    recommendations: [
      "Revisar y actualizar todos los planes de emergencia municipal en zonas de riesgo hídrico",
      "Establecer protocolo conjunto Estado-CCAA de activación inmediata de ES-Alert",
      "Crear registro unificado de contratos de emergencia con auditoría posterior obligatoria en 6 meses",
      "Plataforma compartida AGE-CCAA para evitar duplicidades en pagos a damnificados",
    ],
    territorySlugs: ["comunitat-valenciana", "espana"],
    tags: ["DANA", "emergencia", "protección civil", "coordinación", "alertas"],
    sourceUrl: "https://www.tcu.es/informes",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   AGGREGATE STATS
   ══════════════════════════════════════════════════════════════════════════ */

export const auditSummary = {
  totalReports: auditReports.length,
  favorable: auditReports.filter((r) => r.rating === "favorable").length,
  conSalvedades: auditReports.filter((r) => r.rating === "con-salvedades").length,
  desfavorable: auditReports.filter((r) => r.rating === "desfavorable").length,
  totalFindings: auditReports.reduce((s, r) => s + r.totalFindingsCount, 0),
  criticalFindings: auditReports.reduce((s, r) => s + r.criticalFindings, 0),
  totalQuestionedM: auditReports.reduce((s, r) => s + (r.amountQuestionedM ?? 0), 0),
};

export function getAuditsForTerritory(slug: string): AuditReport[] {
  return auditReports.filter((r) => r.territorySlugs.includes(slug));
}

export function getAuditsByEntityType(type: AuditedEntityType): AuditReport[] {
  return auditReports.filter((r) => r.entityType === type);
}

export function getAuditsByRating(rating: AuditRating): AuditReport[] {
  return auditReports.filter((r) => r.rating === rating);
}
