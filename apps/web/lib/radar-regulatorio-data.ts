/* ═══════════════════════════════════════════════════════════════════════════
   Radar Regulatorio — Regulatory change tracking for businesses.
   Tracks BOE, EUR-Lex, Congreso, Senado, CNMC, TC, CCAA, BdE, AEPD
   publications and classifies them by sector impact.
   ═══════════════════════════════════════════════════════════════════════════ */

import { euLegislation } from "./eurlex-data";
import { boeItems, featuredSignals } from "@espanaia/seed-data";

/* ══════════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════════ */

export type SectorId =
  | "banca"
  | "energia"
  | "telecom"
  | "pharma"
  | "inmobiliario"
  | "tecnologia"
  | "agroalimentario"
  | "transporte"
  | "turismo"
  | "defensa"
  | "medio-ambiente"
  | "sanidad"
  | "educacion"
  | "general";

export type SourceType =
  | "boe"
  | "eurlex"
  | "congreso"
  | "senado"
  | "cnmc"
  | "tc"
  | "ccaa-boletin"
  | "bde"
  | "aepd";

export type ImpactLevel = "critico" | "alto" | "medio" | "bajo" | "informativo";

export type AlertStatus = "nueva" | "en-tramite" | "aprobada" | "en-vigor" | "derogada";

export interface RegulatoryAlert {
  id: string;
  title: string;
  summary: string;
  source: SourceType;
  sourceLabel: string;
  sourceUrl: string;
  publishDate: string;
  effectiveDate?: string;
  sectors: SectorId[];
  impactLevel: ImpactLevel;
  status: AlertStatus;
  territory?: string;
  tags: string[];
  affectedRegulations?: string[];
  complianceDeadline?: string;
  keyChanges: string[];
  /* ── Competitive differentiators ── */
  relatedAlerts?: string[];
  complianceChecklist?: string[];
  euDirective?: { ref: string; deadline: string; transposed: boolean };
  estimatedCostRange?: { small: string; medium: string; large: string };
  affectedEntities?: string[];
  passProbability?: number;
  complexityScore?: number;
  publicConsultation?: { status: string; responses: number; closeDate: string };
  dependsOn?: string[];
  weekChanged?: string;
}

export interface SectorProfile {
  id: SectorId;
  label: string;
  description: string;
  activeAlerts: number;
  criticalAlerts: number;
  regulatoryBurdenScore: number;
  recentTrend: "increasing" | "stable" | "decreasing";
  keyRegulators: string[];
  topRisks: string[];
  /* ── Competitive differentiators ── */
  velocityIndex?: number;
  velocitySparkline?: number[];
  burdenHistory?: { month: string; value: number }[];
  fragmentationIndex?: number;
  sandboxActive?: boolean;
}

export interface RegulatoryTimeline {
  id: string;
  title: string;
  events: {
    date: string;
    label: string;
    type: "publicacion" | "consulta" | "tramite" | "aprobacion" | "entrada-vigor" | "deadline";
    completed: boolean;
  }[];
}

export interface ComparativeStats {
  metric: string;
  spain: number;
  euAvg: number;
  unit: string;
}

export interface WeeklyDigest {
  week: string;
  alerts: string[];
  summary: string;
}

export interface RadarData {
  alerts: RegulatoryAlert[];
  sectors: SectorProfile[];
  timelines: RegulatoryTimeline[];
  stats: {
    totalAlerts: number;
    criticalCount: number;
    bySource: Record<SourceType, number>;
    bySector: Record<SectorId, number>;
    last30Days: number;
    pendingDeadlines: number;
  };
  /* ── Competitive differentiators ── */
  comparativeStats: ComparativeStats[];
  weeklyDigests: WeeklyDigest[];
}

/* ══════════════════════════════════════════════════════════════════════════
   LABEL MAPS
   ══════════════════════════════════════════════════════════════════════════ */

export const sourceLabels: Record<SourceType, string> = {
  boe: "Boletín Oficial del Estado",
  eurlex: "EUR-Lex / Diario Oficial UE",
  congreso: "Congreso de los Diputados",
  senado: "Senado",
  cnmc: "CNMC",
  tc: "Tribunal Constitucional",
  "ccaa-boletin": "Boletín Oficial CCAA",
  bde: "Banco de España",
  aepd: "Agencia Española de Protección de Datos",
};

export const sectorLabels: Record<SectorId, string> = {
  banca: "Banca y Finanzas",
  energia: "Energía",
  telecom: "Telecomunicaciones",
  pharma: "Farmacéutico y Salud",
  inmobiliario: "Inmobiliario",
  tecnologia: "Tecnología",
  agroalimentario: "Agroalimentario",
  transporte: "Transporte y Logística",
  turismo: "Turismo y Hostelería",
  defensa: "Defensa y Seguridad",
  "medio-ambiente": "Medio Ambiente",
  sanidad: "Sanidad",
  educacion: "Educación",
  general: "Transversal / General",
};

export const impactLevelLabels: Record<ImpactLevel, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Medio",
  bajo: "Bajo",
  informativo: "Informativo",
};

export const impactLevelColors: Record<ImpactLevel, string> = {
  critico: "#c8102e",
  alto: "#e65100",
  medio: "#f1bf00",
  bajo: "#003da5",
  informativo: "#6b7280",
};

export const alertStatusLabels: Record<AlertStatus, string> = {
  nueva: "Nueva",
  "en-tramite": "En trámite",
  aprobada: "Aprobada",
  "en-vigor": "En vigor",
  derogada: "Derogada",
};

/* ══════════════════════════════════════════════════════════════════════════
   REGULATORY ALERTS — seed data (30-40 items)
   ══════════════════════════════════════════════════════════════════════════ */

const alerts: RegulatoryAlert[] = [
  // ── BOE ──────────────────────────────────────────────────────────────
  {
    id: "ra-001",
    title: "RDL 6/2026 de medidas urgentes en materia de vivienda y protección social",
    summary:
      "Ampliación del bono alquiler joven a menores de 36 años, nuevas ayudas a rehabilitación energética y movilización de vivienda vacía de entidades financieras.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8201",
    publishDate: "2026-04-10",
    effectiveDate: "2026-04-11",
    sectors: ["inmobiliario", "banca", "energia"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["vivienda", "alquiler", "rehabilitación", "banca"],
    affectedRegulations: ["Ley 12/2023 de Vivienda", "RDL 11/2020"],
    keyChanges: [
      "Ampliación bono alquiler joven hasta 36 años (antes 35)",
      "Obligación de entidades financieras de movilizar vivienda vacía en cartera",
      "Nuevas ayudas directas a rehabilitación energética para comunidades de propietarios",
      "Limitación de desahucios sin alternativa habitacional ampliada hasta 2028",
    ],
    relatedAlerts: ["ra-014", "ra-024"],
    complianceChecklist: [
      "Revisar cartera de vivienda vacía y plan de movilización",
      "Actualizar procedimientos de desahucio con nuevos requisitos",
      "Adaptar contratos de alquiler a nuevas condiciones del bono joven",
      "Verificar cumplimiento de requisitos de rehabilitación energética",
    ],
    estimatedCostRange: { small: "2.000–5.000€", medium: "15.000–40.000€", large: "200.000–500.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos", "admin pública"],
    complexityScore: 72,
    weekChanged: "2026-W15",
  },
  {
    id: "ra-002",
    title: "Real Decreto sobre requisitos de transparencia en sistemas de IA de alto riesgo",
    summary:
      "Desarrollo reglamentario del AI Act europeo para su aplicación en España. Establece el marco de supervisión de la AESIA.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7650",
    publishDate: "2026-03-28",
    effectiveDate: "2026-09-28",
    sectors: ["tecnologia", "sanidad", "banca", "general"],
    impactLevel: "critico",
    status: "aprobada",
    territory: "nacional",
    tags: ["IA", "inteligencia artificial", "AESIA", "supervisión"],
    affectedRegulations: ["Reglamento (UE) 2024/1689 (AI Act)"],
    complianceDeadline: "2026-09-28",
    keyChanges: [
      "Registro obligatorio de sistemas de IA de alto riesgo ante la AESIA",
      "Evaluación de impacto en derechos fundamentales antes del despliegue",
      "Requisitos de explicabilidad para decisiones automatizadas en sector público",
      "Régimen sancionador con multas de hasta 35M€ o 7% facturación global",
    ],
    relatedAlerts: ["ra-008", "ra-027"],
    complianceChecklist: [
      "Inventariar todos los sistemas de IA en uso y clasificar por riesgo",
      "Registrar sistemas de alto riesgo ante la AESIA",
      "Realizar EIPD para cada sistema de IA con datos personales",
      "Implementar mecanismos de explicabilidad en decisiones automatizadas",
      "Designar responsable interno de cumplimiento AI Act",
    ],
    euDirective: { ref: "Reglamento (UE) 2024/1689 (AI Act)", deadline: "2026-08-02", transposed: true },
    estimatedCostRange: { small: "5.000–15.000€", medium: "50.000–150.000€", large: "500.000–2.000.000€" },
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 88,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-003",
    title: "Reforma del sistema de pensiones: segunda fase del mecanismo de equidad intergeneracional",
    summary:
      "Ajuste del MEI al 1,2% y nuevas medidas de sostenibilidad del sistema de Seguridad Social vinculadas al envejecimiento poblacional.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-6890",
    publishDate: "2026-03-15",
    effectiveDate: "2026-07-01",
    sectors: ["banca", "general"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "nacional",
    tags: ["pensiones", "Seguridad Social", "MEI", "cotizaciones"],
    affectedRegulations: ["Ley 21/2021 de garantía del poder adquisitivo de las pensiones"],
    complianceDeadline: "2026-07-01",
    keyChanges: [
      "Incremento del MEI del 0,7% al 1,2% (empresa 0,83%, trabajador 0,37%)",
      "Nuevo tope de cotización para salarios superiores a la base máxima",
      "Incentivos a la prolongación voluntaria de la vida laboral",
    ],
    complianceChecklist: [
      "Actualizar nóminas con nuevo porcentaje MEI (0,83% empresa)",
      "Revisar convenio colectivo para adaptación de cotizaciones",
      "Informar a trabajadores del cambio en su cotización (0,37%)",
    ],
    estimatedCostRange: { small: "500–1.500€", medium: "5.000–15.000€", large: "50.000–200.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 45,
    weekChanged: "2026-W11",
  },
  {
    id: "ra-004",
    title: "Regulación del mercado de criptoactivos: transposición del Reglamento MiCA",
    summary:
      "Adaptación al ordenamiento español del marco regulatorio europeo para criptoactivos, incluyendo requisitos para proveedores de servicios.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-5320",
    publishDate: "2026-02-20",
    effectiveDate: "2026-06-30",
    sectors: ["banca", "tecnologia"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["cripto", "MiCA", "blockchain", "fintech"],
    affectedRegulations: ["Reglamento (UE) 2023/1114 (MiCA)", "Ley 10/2010 de PBC"],
    complianceDeadline: "2026-06-30",
    keyChanges: [
      "Autorización obligatoria de la CNMV para exchanges y custodios",
      "Requisitos de reservas para emisores de stablecoins",
      "Prohibición de criptoactivos anónimos en operaciones superiores a 1.000€",
      "Régimen fiscal específico para ganancias en criptoactivos",
    ],
    relatedAlerts: ["ra-026", "ra-029"],
    complianceChecklist: [
      "Solicitar autorización a la CNMV para operación de exchange",
      "Constituir reservas mínimas para stablecoins emitidas",
      "Implementar KYC reforzado para operaciones >1.000€",
      "Adaptar plataforma para informes fiscales automáticos",
    ],
    euDirective: { ref: "Reglamento (UE) 2023/1114 (MiCA)", deadline: "2024-12-30", transposed: true },
    estimatedCostRange: { small: "10.000–30.000€", medium: "80.000–200.000€", large: "500.000–1.500.000€" },
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 82,
    dependsOn: ["ra-026"],
    weekChanged: "2026-W08",
  },
  {
    id: "ra-005",
    title: "Modificación de la LOPD: adaptación al Data Act europeo",
    summary:
      "Actualización de la Ley Orgánica de Protección de Datos para incorporar las obligaciones del Data Act sobre acceso y portabilidad de datos.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-4180",
    publishDate: "2026-02-05",
    sectors: ["tecnologia", "general"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["protección de datos", "LOPD", "Data Act", "portabilidad"],
    affectedRegulations: ["LO 3/2018 (LOPD-GDD)", "Reglamento (UE) 2023/2854 (Data Act)"],
    complianceDeadline: "2026-09-12",
    keyChanges: [
      "Derecho reforzado de portabilidad de datos IoT para usuarios y empresas",
      "Obligación de interfaces de acceso para fabricantes de dispositivos conectados",
      "Nuevas competencias de la AEPD en supervisión del Data Act",
    ],
    relatedAlerts: ["ra-027"],
    complianceChecklist: [
      "Auditar flujos de datos IoT y diseñar interfaces de acceso",
      "Implementar mecanismos de portabilidad en formato estándar",
      "Actualizar política de privacidad con derechos Data Act",
    ],
    euDirective: { ref: "Reglamento (UE) 2023/2854 (Data Act)", deadline: "2025-09-12", transposed: false },
    estimatedCostRange: { small: "3.000–8.000€", medium: "20.000–60.000€", large: "150.000–400.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 67,
    publicConsultation: { status: "cerrada", responses: 342, closeDate: "2026-01-15" },
    weekChanged: "2026-W06",
  },
  {
    id: "ra-006",
    title: "Normativa ESG: obligaciones de reporting de sostenibilidad para grandes empresas",
    summary:
      "Transposición parcial de la CSRD al derecho español mediante orden ministerial. Requisitos de auditoría de información no financiera.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-3560",
    publishDate: "2026-01-22",
    effectiveDate: "2026-01-23",
    sectors: ["banca", "energia", "general"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "nacional",
    tags: ["ESG", "sostenibilidad", "CSRD", "reporting"],
    affectedRegulations: ["Directiva (UE) 2022/2464 (CSRD)", "Ley 11/2018 de información no financiera"],
    complianceDeadline: "2026-12-31",
    keyChanges: [
      "Empresas >500 empleados deben reportar indicadores ESRS desde ejercicio 2026",
      "Auditoría externa obligatoria de la información de sostenibilidad",
      "Publicación del informe ESG junto con las cuentas anuales",
    ],
    relatedAlerts: ["ra-009"],
    complianceChecklist: [
      "Designar responsable de reporting ESG",
      "Contratar auditor externo especializado en sostenibilidad",
      "Implementar sistema de recogida de indicadores ESRS",
      "Preparar primer informe ESG para cuentas anuales 2026",
    ],
    euDirective: { ref: "Directiva (UE) 2022/2464 (CSRD)", deadline: "2024-07-06", transposed: false },
    estimatedCostRange: { small: "N/A", medium: "30.000–80.000€", large: "200.000–600.000€" },
    affectedEntities: ["gran empresa"],
    complexityScore: 74,
    weekChanged: "2026-W04",
  },
  {
    id: "ra-007",
    title: "RDL de emergencia energética: prórroga del tope al gas y ayudas a industria electrointensiva",
    summary:
      "Extensión del mecanismo ibérico de tope al gas hasta diciembre 2026 y nuevas compensaciones para industria electrointensiva.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-2100",
    publishDate: "2026-01-10",
    effectiveDate: "2026-01-11",
    sectors: ["energia", "agroalimentario", "general"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "nacional",
    tags: ["energía", "tope gas", "electrointensiva", "industria"],
    affectedRegulations: ["RDL 10/2022", "RDL 18/2022"],
    keyChanges: [
      "Prórroga del mecanismo ibérico hasta 31/12/2026",
      "Ayudas a industria electrointensiva de hasta 40€/MWh",
      "Bono social ampliado a hogares vulnerables energéticos",
    ],
    complianceChecklist: [
      "Verificar elegibilidad para ayudas de industria electrointensiva",
      "Solicitar bono social si se cumplen criterios de vulnerabilidad",
      "Revisar contratos de suministro energético vigentes",
    ],
    estimatedCostRange: { small: "0€ (beneficiario)", medium: "0€ (beneficiario)", large: "Hasta -500.000€ (ahorro)" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 38,
    weekChanged: "2026-W02",
  },

  // ── EUR-LEX ──────────────────────────────────────────────────────────
  {
    id: "ra-008",
    title: "Reglamento de IA (AI Act): entrada en vigor plena de obligaciones para sistemas de alto riesgo",
    summary:
      "Aplicación completa de los requisitos del AI Act para sistemas de IA de alto riesgo en toda la UE, incluyendo conformidad, registro y supervisión.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689",
    publishDate: "2024-06-13",
    effectiveDate: "2026-08-02",
    sectors: ["tecnologia", "sanidad", "banca", "educacion", "general"],
    impactLevel: "critico",
    status: "en-tramite",
    territory: "nacional",
    tags: ["AI Act", "IA", "alto riesgo", "conformidad"],
    complianceDeadline: "2026-08-02",
    keyChanges: [
      "Evaluaciones de conformidad obligatorias para sistemas de IA de alto riesgo",
      "Prohibición de scoring social y reconocimiento biométrico masivo",
      "Sandbox regulatorio supervisado por la AESIA en España",
      "Transparencia obligatoria en contenido generado por IA",
    ],
    relatedAlerts: ["ra-002", "ra-027"],
    complianceChecklist: [
      "Clasificar todos los sistemas de IA según nivel de riesgo del Anexo III",
      "Completar evaluación de conformidad CE para sistemas de alto riesgo",
      "Registrar sistemas en base de datos de la UE",
      "Implementar watermark en contenido generativo",
      "Preparar documentación técnica obligatoria",
    ],
    euDirective: { ref: "Reglamento (UE) 2024/1689 (AI Act)", deadline: "2026-08-02", transposed: true },
    estimatedCostRange: { small: "8.000–25.000€", medium: "80.000–250.000€", large: "1.000.000–5.000.000€" },
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 94,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-009",
    title: "Directiva CSRD: procedimiento de infracción contra España por no transposición",
    summary:
      "La Comisión Europea escala el procedimiento contra España por retraso en la transposición de la CSRD. Dictamen motivado emitido.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
    publishDate: "2026-04-08",
    sectors: ["banca", "energia", "general"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["CSRD", "infracción", "sostenibilidad", "transposición"],
    affectedRegulations: ["Directiva (UE) 2022/2464 (CSRD)"],
    keyChanges: [
      "Dictamen motivado de la Comisión — 2 meses para responder",
      "Riesgo de multa por incumplimiento si no se transpone antes de septiembre",
      "Afecta a ~1.500 empresas españolas que necesitan certeza jurídica",
    ],
    relatedAlerts: ["ra-006"],
    euDirective: { ref: "Directiva (UE) 2022/2464 (CSRD)", deadline: "2024-07-06", transposed: false },
    affectedEntities: ["gran empresa"],
    complexityScore: 55,
    weekChanged: "2026-W15",
  },
  {
    id: "ra-010",
    title: "DORA: Reglamento de Resiliencia Operativa Digital para el sector financiero",
    summary:
      "Aplicación plena del reglamento DORA. Las entidades financieras deben cumplir requisitos de resiliencia digital, pruebas de penetración y gestión de riesgo TIC.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2022/2554",
    publishDate: "2023-01-16",
    effectiveDate: "2025-01-17",
    sectors: ["banca", "tecnologia"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["DORA", "resiliencia digital", "finanzas", "ciberseguridad"],
    affectedRegulations: ["Reglamento (UE) 2022/2554"],
    keyChanges: [
      "Pruebas de penetración avanzadas obligatorias cada 3 años",
      "Marco de gestión de riesgo TIC con notificación de incidentes al BdE",
      "Supervisión de proveedores TIC críticos por las autoridades europeas",
      "Intercambio de información sobre ciberamenazas entre entidades",
    ],
    relatedAlerts: ["ra-011", "ra-037"],
    complianceChecklist: [
      "Establecer marco de gestión de riesgo TIC aprobado por alta dirección",
      "Contratar empresa de TLPT para pruebas de penetración avanzadas",
      "Implementar sistema de notificación de incidentes al BdE",
      "Mapear y evaluar proveedores TIC críticos",
      "Crear canal de intercambio de ciberamenazas con sector financiero",
    ],
    euDirective: { ref: "Reglamento (UE) 2022/2554 (DORA)", deadline: "2025-01-17", transposed: true },
    estimatedCostRange: { small: "N/A", medium: "100.000–300.000€", large: "1.000.000–3.000.000€" },
    affectedEntities: ["gran empresa"],
    complexityScore: 91,
    weekChanged: "2026-W03",
  },
  {
    id: "ra-011",
    title: "Directiva NIS2: transposición al derecho español de ciberseguridad",
    summary:
      "España transpone la NIS2 ampliando sectores cubiertos por la normativa de ciberseguridad y endureciendo las obligaciones de notificación.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2555",
    publishDate: "2023-01-16",
    effectiveDate: "2026-04-01",
    sectors: ["tecnologia", "energia", "sanidad", "transporte", "banca", "general"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["NIS2", "ciberseguridad", "infraestructura crítica"],
    affectedRegulations: ["RDL 12/2018 (NIS1)", "Esquema Nacional de Seguridad"],
    complianceDeadline: "2026-10-17",
    keyChanges: [
      "Ampliación de sectores esenciales e importantes (incluye alimentación, espacio, aguas residuales)",
      "Notificación de incidentes en 24h (alerta inicial) y 72h (informe completo)",
      "Multas de hasta 10M€ o 2% facturación para entidades esenciales",
      "Responsabilidad personal de los órganos de dirección",
    ],
    relatedAlerts: ["ra-010", "ra-037"],
    complianceChecklist: [
      "Determinar si la entidad es esencial o importante bajo NIS2",
      "Implementar sistema de notificación de incidentes en 24h",
      "Adoptar medidas de gestión de riesgos de ciberseguridad",
      "Formar a órganos de dirección en responsabilidad NIS2",
    ],
    euDirective: { ref: "Directiva (UE) 2022/2555 (NIS2)", deadline: "2024-10-17", transposed: true },
    estimatedCostRange: { small: "5.000–15.000€", medium: "50.000–150.000€", large: "500.000–2.000.000€" },
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 78,
    weekChanged: "2026-W14",
  },
  {
    id: "ra-012",
    title: "EU Chips Act: convocatoria de proyectos de interés común en semiconductores",
    summary:
      "Nueva convocatoria bajo el Chips Act para proyectos de fabricación avanzada de semiconductores en Europa. España candidata con PERTE Chip.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1781",
    publishDate: "2026-03-01",
    sectors: ["tecnologia", "defensa"],
    impactLevel: "medio",
    status: "en-tramite",
    territory: "nacional",
    tags: ["chips", "semiconductores", "PERTE", "industria"],
    keyChanges: [
      "Financiación de hasta 3.000M€ para fábricas de semiconductores avanzados",
      "España posiciona proyectos en Cataluña, Aragón y Madrid",
      "Requisitos de soberanía tecnológica para cadena de suministro",
    ],
    euDirective: { ref: "Reglamento (UE) 2023/1781 (Chips Act)", deadline: "2027-06-01", transposed: false },
    affectedEntities: ["gran empresa"],
    complexityScore: 52,
    publicConsultation: { status: "abierta", responses: 87, closeDate: "2026-05-15" },
    weekChanged: "2026-W09",
  },

  // ── CONGRESO ─────────────────────────────────────────────────────────
  {
    id: "ra-013",
    title: "PNL sobre reforma de la financiación autonómica",
    summary:
      "El Congreso aprueba proposición no de ley instando al Gobierno a reformar el sistema de financiación autonómica antes de fin de 2026.",
    source: "congreso",
    sourceLabel: sourceLabels.congreso,
    sourceUrl: "https://www.congreso.es/opendata",
    publishDate: "2026-04-09",
    sectors: ["general", "sanidad", "educacion"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["financiación autonómica", "CCAA", "presupuestos"],
    keyChanges: [
      "Mandato de presentar propuesta de nuevo modelo antes de diciembre 2026",
      "Fondo de nivelación transitorio para CCAA infrafinanciadas",
      "Impacto directo en presupuestos de sanidad y educación de todas las CCAA",
    ],
    affectedEntities: ["admin pública"],
    complexityScore: 62,
    passProbability: 35,
    weekChanged: "2026-W15",
  },
  {
    id: "ra-014",
    title: "Proyecto de Ley de Vivienda: ampliación de zonas de mercado tensionado",
    summary:
      "Tramitación parlamentaria para ampliar los criterios de declaración de zonas de mercado tensionado y reforzar la intervención de precios del alquiler.",
    source: "congreso",
    sourceLabel: sourceLabels.congreso,
    sourceUrl: "https://www.congreso.es/opendata",
    publishDate: "2026-03-20",
    sectors: ["inmobiliario", "banca"],
    impactLevel: "critico",
    status: "en-tramite",
    territory: "nacional",
    tags: ["vivienda", "alquiler", "mercado tensionado", "precios"],
    affectedRegulations: ["Ley 12/2023 de Vivienda"],
    keyChanges: [
      "Reducción del umbral de incremento de renta para declarar zona tensionada del 5% al 3%",
      "Ampliación de la limitación de renta a todos los propietarios (no solo grandes tenedores)",
      "Índice de referencia de alquiler vinculante en zonas tensionadas",
    ],
    relatedAlerts: ["ra-001", "ra-021"],
    complianceChecklist: [
      "Revisar contratos de alquiler en zonas potencialmente tensionadas",
      "Adaptar sistema de fijación de rentas al nuevo índice de referencia",
      "Verificar si se amplía la consideración de gran tenedor",
    ],
    estimatedCostRange: { small: "1.000–3.000€", medium: "10.000–30.000€", large: "100.000–500.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 58,
    passProbability: 62,
    publicConsultation: { status: "cerrada", responses: 1247, closeDate: "2026-02-28" },
    weekChanged: "2026-W12",
  },
  {
    id: "ra-015",
    title: "Proposición de ley de reforma laboral: jornada de 37,5 horas",
    summary:
      "Avanza en comisión la reducción de la jornada laboral máxima legal de 40 a 37,5 horas semanales sin reducción salarial.",
    source: "congreso",
    sourceLabel: sourceLabels.congreso,
    sourceUrl: "https://www.congreso.es/opendata",
    publishDate: "2026-03-05",
    sectors: ["general", "turismo", "agroalimentario"],
    impactLevel: "critico",
    status: "en-tramite",
    territory: "nacional",
    tags: ["jornada laboral", "reforma laboral", "37,5 horas"],
    affectedRegulations: ["Estatuto de los Trabajadores (art. 34)"],
    complianceDeadline: "2026-12-31",
    keyChanges: [
      "Jornada máxima legal reducida a 37,5 horas semanales",
      "Registro de jornada digital obligatorio con acceso en tiempo real de la ITSS",
      "Régimen transitorio de 6 meses para sectores con convenios en negociación",
      "Sanciones reforzadas por incumplimiento: hasta 10.000€ por trabajador",
    ],
    complianceChecklist: [
      "Adaptar turnos y horarios a la nueva jornada de 37,5h",
      "Implementar registro de jornada digital con acceso ITSS",
      "Negociar con representación sindical la adaptación del convenio",
      "Calcular impacto en costes laborales y productividad",
      "Preparar régimen transitorio si el convenio está en negociación",
    ],
    estimatedCostRange: { small: "2.000–8.000€", medium: "20.000–80.000€", large: "500.000–2.000.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 55,
    passProbability: 72,
    publicConsultation: { status: "cerrada", responses: 4521, closeDate: "2025-10-30" },
    weekChanged: "2026-W10",
  },

  // ── SENADO ───────────────────────────────────────────────────────────
  {
    id: "ra-016",
    title: "Moción sobre la inversión territorial equitativa rechazada",
    summary:
      "El Senado rechaza moción del GP Popular sobre inversión territorial. Debate intenso sobre financiación de infraestructuras en España vaciada.",
    source: "senado",
    sourceLabel: sourceLabels.senado,
    sourceUrl: "https://www.senado.es",
    publishDate: "2026-04-10",
    sectors: ["transporte", "general"],
    impactLevel: "medio",
    status: "en-tramite",
    territory: "nacional",
    tags: ["inversión territorial", "España vaciada", "infraestructura"],
    keyChanges: [
      "Rechazo de propuesta de mínimo del 2% del PIB en inversión territorial",
      "Debate abierto sobre distribución de fondos NextGenerationEU",
    ],
    affectedEntities: ["admin pública"],
    complexityScore: 35,
    weekChanged: "2026-W15",
  },

  // ── CNMC ─────────────────────────────────────────────────────────────
  {
    id: "ra-017",
    title: "Resolución CNMC: análisis del mercado mayorista de telecomunicaciones fijas",
    summary:
      "La CNMC revisa las obligaciones de acceso a la red fija de Telefónica. Posible reducción de la regulación ex ante en mercados competitivos.",
    source: "cnmc",
    sourceLabel: sourceLabels.cnmc,
    sourceUrl: "https://www.cnmc.es/expedientes",
    publishDate: "2026-03-25",
    sectors: ["telecom"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["telecomunicaciones", "acceso red", "Telefónica", "NEBA"],
    keyChanges: [
      "Posible desregulación del acceso mayorista NEBA en zonas con 3+ operadores",
      "Mantenimiento de obligaciones en zonas rurales con menos competencia",
      "Revisión de precios mayoristas de acceso a fibra",
    ],
    affectedEntities: ["gran empresa"],
    complexityScore: 70,
    publicConsultation: { status: "abierta", responses: 156, closeDate: "2026-05-30" },
    weekChanged: "2026-W12",
  },
  {
    id: "ra-018",
    title: "Expediente sancionador CNMC a distribuidoras eléctricas por prácticas anticompetitivas",
    summary:
      "Apertura de expediente contra tres grandes distribuidoras eléctricas por presuntas barreras de entrada a comercializadoras independientes.",
    source: "cnmc",
    sourceLabel: sourceLabels.cnmc,
    sourceUrl: "https://www.cnmc.es/expedientes",
    publishDate: "2026-02-18",
    sectors: ["energia"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["competencia", "energía", "distribución", "comercialización"],
    keyChanges: [
      "Investigación de discriminación en el acceso a datos de puntos de suministro",
      "Análisis de posibles cláusulas abusivas en contratos de acceso a red",
      "Posible multa de hasta el 10% de la facturación del negocio regulado",
    ],
    affectedEntities: ["gran empresa"],
    complexityScore: 65,
    weekChanged: "2026-W07",
  },
  {
    id: "ra-019",
    title: "Sanción CNMC a entidades bancarias por coordinación en comisiones interbancarias",
    summary:
      "Multa de 94M€ a cinco entidades bancarias por intercambio de información sensible sobre comisiones en tarjetas de débito y crédito.",
    source: "cnmc",
    sourceLabel: sourceLabels.cnmc,
    sourceUrl: "https://www.cnmc.es/expedientes",
    publishDate: "2026-01-30",
    sectors: ["banca"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "nacional",
    tags: ["competencia", "banca", "comisiones", "tarjetas"],
    keyChanges: [
      "Multa de 94M€ repartida entre CaixaBank, BBVA, Santander, Sabadell y Bankinter",
      "Prohibición de intercambio de información sobre comisiones durante 5 años",
      "Programa de cumplimiento obligatorio supervisado por la CNMC",
    ],
    complianceChecklist: [
      "Implementar programa de cumplimiento de competencia",
      "Revisar protocolos internos de intercambio de información",
      "Formar a directivos en normas de competencia",
    ],
    affectedEntities: ["gran empresa"],
    complexityScore: 48,
    weekChanged: "2026-W05",
  },

  // ── TRIBUNAL CONSTITUCIONAL ──────────────────────────────────────────
  {
    id: "ra-020",
    title: "STC sobre la Ley de Amnistía: constitucionalidad parcial",
    summary:
      "El Tribunal Constitucional declara la constitucionalidad de la Ley de Amnistía con interpretación conforme en varios artículos.",
    source: "tc",
    sourceLabel: sourceLabels.tc,
    sourceUrl: "https://www.tribunalconstitucional.es",
    publishDate: "2026-03-12",
    sectors: ["general"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["amnistía", "constitucionalidad", "procés"],
    affectedRegulations: ["LO 1/2024 de Amnistía"],
    keyChanges: [
      "Declaración de constitucionalidad de la amnistía como medida excepcional",
      "Interpretación conforme que excluye delitos de terrorismo del ámbito de aplicación",
      "Dos votos particulares disidentes de los magistrados conservadores",
    ],
    affectedEntities: ["admin pública"],
    complexityScore: 42,
    weekChanged: "2026-W11",
  },
  {
    id: "ra-021",
    title: "Recurso de inconstitucionalidad contra la regulación de alquiler de temporada",
    summary:
      "Admisión a trámite del recurso del PP contra la regulación estatal del alquiler de temporada incluida en la Ley de Vivienda.",
    source: "tc",
    sourceLabel: sourceLabels.tc,
    sourceUrl: "https://www.tribunalconstitucional.es",
    publishDate: "2026-02-28",
    sectors: ["inmobiliario", "turismo"],
    impactLevel: "medio",
    status: "en-tramite",
    territory: "nacional",
    tags: ["vivienda", "alquiler temporal", "constitucionalidad"],
    affectedRegulations: ["Ley 12/2023 de Vivienda"],
    keyChanges: [
      "Cuestiona competencia estatal para regular alquiler de temporada (competencia autonómica)",
      "Suspensión cautelar denegada — la norma sigue vigente",
      "Plazo estimado de resolución: 12-18 meses",
    ],
    relatedAlerts: ["ra-014", "ra-022"],
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 60,
    weekChanged: "2026-W09",
  },

  // ── CCAA BOLETINES ───────────────────────────────────────────────────
  {
    id: "ra-022",
    title: "Baleares: Decreto de regulación de viviendas turísticas vacacionales",
    summary:
      "Nuevo decreto del Govern balear que prohíbe nuevas licencias de alquiler turístico en Palma y limita estrictamente en el resto de las islas.",
    source: "ccaa-boletin",
    sourceLabel: "BOIB (Baleares)",
    sourceUrl: "https://www.caib.es/eboibfront",
    publishDate: "2026-03-15",
    effectiveDate: "2026-06-01",
    sectors: ["turismo", "inmobiliario"],
    impactLevel: "critico",
    status: "aprobada",
    territory: "illes-balears",
    tags: ["vivienda turística", "alquiler vacacional", "Baleares", "moratoria"],
    keyChanges: [
      "Moratoria total de nuevas licencias de alquiler turístico en Palma",
      "Reducción del 15% de plazas turísticas autorizadas en 5 años para el resto de islas",
      "Obligación de registro en plataformas con verificación automatizada",
      "Sanciones de hasta 400.000€ por explotación sin licencia",
    ],
    relatedAlerts: ["ra-023", "ra-021"],
    complianceChecklist: [
      "Verificar estado de licencia turística vigente",
      "Registrar propiedad en plataforma de verificación automatizada",
      "Adaptar plan de negocio a la reducción del 15% de plazas",
    ],
    estimatedCostRange: { small: "500–2.000€", medium: "5.000–20.000€", large: "50.000–200.000€" },
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 50,
    weekChanged: "2026-W11",
  },
  {
    id: "ra-023",
    title: "Canarias: Ley de ordenación del alojamiento turístico extrahotelero",
    summary:
      "El Parlamento canario aprueba la ley que limita la vivienda vacacional y establece un sistema de cuotas por isla.",
    source: "ccaa-boletin",
    sourceLabel: "BOC (Canarias)",
    sourceUrl: "https://www.gobiernodecanarias.org/boc",
    publishDate: "2026-02-10",
    effectiveDate: "2026-05-01",
    sectors: ["turismo", "inmobiliario"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "canarias",
    tags: ["vivienda vacacional", "Canarias", "turismo", "cuotas"],
    keyChanges: [
      "Sistema de cuotas de plazas turísticas por isla, revisable cada 3 años",
      "Prohibición de vivienda vacacional en suelo residencial protegido",
      "Canon turístico de 2€/noche por plaza en viviendas vacacionales",
    ],
    relatedAlerts: ["ra-022"],
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 44,
    weekChanged: "2026-W06",
  },
  {
    id: "ra-024",
    title: "Valencia: moratoria urbanística en zonas inundables post-DANA",
    summary:
      "La Generalitat Valenciana aprueba moratoria de licencias urbanísticas en zonas afectadas por la DANA e inundables según el PATRICOVA.",
    source: "ccaa-boletin",
    sourceLabel: "DOGV (Valencia)",
    sourceUrl: "https://dogv.gva.es",
    publishDate: "2026-01-20",
    effectiveDate: "2026-02-01",
    sectors: ["inmobiliario", "medio-ambiente"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "comunitat-valenciana",
    tags: ["moratoria urbanística", "DANA", "inundable", "Valencia", "PATRICOVA"],
    keyChanges: [
      "Suspensión de licencias urbanísticas en zonas de riesgo de inundación alto y muy alto",
      "Revisión del PATRICOVA con nuevos mapas de riesgo actualizados",
      "Afecta a 82 municipios del área metropolitana de Valencia y La Ribera",
    ],
    relatedAlerts: ["ra-001"],
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 56,
    weekChanged: "2026-W03",
  },

  // ── BANCO DE ESPAÑA ──────────────────────────────────────────────────
  {
    id: "ra-025",
    title: "Circular BdE 2/2026 sobre supervisión de riesgo climático en entidades bancarias",
    summary:
      "Nueva circular que obliga a las entidades bancarias a integrar el riesgo climático en sus modelos de solvencia y provisiones.",
    source: "bde",
    sourceLabel: sourceLabels.bde,
    sourceUrl: "https://www.bde.es/bde/es/secciones/normativa",
    publishDate: "2026-03-01",
    effectiveDate: "2026-09-01",
    sectors: ["banca", "medio-ambiente"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "nacional",
    tags: ["riesgo climático", "solvencia", "banca", "supervisión"],
    complianceDeadline: "2026-09-01",
    keyChanges: [
      "Escenarios de estrés climático obligatorios en los ejercicios ICAAP/ILAAP",
      "Requisitos de divulgación de exposición a activos marrones (brown assets)",
      "Planes de transición exigibles a entidades significativas",
    ],
    complianceChecklist: [
      "Integrar escenarios climáticos en ejercicios ICAAP/ILAAP",
      "Mapear exposición a activos marrones en cartera crediticia",
      "Elaborar plan de transición climática aprobado por consejo",
    ],
    estimatedCostRange: { small: "N/A", medium: "40.000–100.000€", large: "300.000–800.000€" },
    affectedEntities: ["gran empresa"],
    complexityScore: 76,
    weekChanged: "2026-W09",
  },
  {
    id: "ra-026",
    title: "Circular BdE 1/2026: requisitos de capital para exposición a criptoactivos",
    summary:
      "El Banco de España establece los ponderadores de riesgo y requisitos de capital para entidades con exposición a criptoactivos.",
    source: "bde",
    sourceLabel: sourceLabels.bde,
    sourceUrl: "https://www.bde.es/bde/es/secciones/normativa",
    publishDate: "2026-01-15",
    effectiveDate: "2026-07-01",
    sectors: ["banca"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "nacional",
    tags: ["criptoactivos", "capital", "solvencia", "banca"],
    complianceDeadline: "2026-07-01",
    keyChanges: [
      "Ponderación del 1.250% para exposiciones a criptoactivos no respaldados",
      "Ponderación del 100% para stablecoins reguladas bajo MiCA",
      "Límite del 2% de capital Tier 1 en exposición agregada a criptoactivos",
    ],
    relatedAlerts: ["ra-004"],
    affectedEntities: ["gran empresa"],
    complexityScore: 80,
    dependsOn: ["ra-004"],
    weekChanged: "2026-W03",
  },

  // ── AEPD ─────────────────────────────────────────────────────────────
  {
    id: "ra-027",
    title: "Guía AEPD: uso de inteligencia artificial y protección de datos personales",
    summary:
      "Guía vinculante de la AEPD sobre tratamiento de datos personales en sistemas de IA, incluyendo LLMs y modelos generativos.",
    source: "aepd",
    sourceLabel: sourceLabels.aepd,
    sourceUrl: "https://www.aepd.es/guias",
    publishDate: "2026-03-18",
    sectors: ["tecnologia", "sanidad", "banca", "general"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "nacional",
    tags: ["IA", "protección de datos", "LLM", "AEPD"],
    keyChanges: [
      "Base jurídica de interés legítimo insuficiente para entrenamiento con datos personales sin consentimiento",
      "Evaluación de impacto obligatoria (EIPD) para despliegues de IA con datos personales",
      "Derecho de oposición reforzado al perfilado automatizado con IA",
      "Requisitos de minimización de datos en fine-tuning de modelos",
    ],
    relatedAlerts: ["ra-002", "ra-005", "ra-008"],
    complianceChecklist: [
      "Realizar EIPD para cada sistema de IA que trate datos personales",
      "Revisar base jurídica del tratamiento — interés legítimo insuficiente",
      "Implementar mecanismo de oposición al perfilado automatizado",
      "Documentar minimización de datos en procesos de fine-tuning",
    ],
    estimatedCostRange: { small: "2.000–6.000€", medium: "15.000–50.000€", large: "100.000–300.000€" },
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 71,
    weekChanged: "2026-W12",
  },
  {
    id: "ra-028",
    title: "Resolución AEPD: sanción a plataforma de delivery por uso de algoritmos discriminatorios",
    summary:
      "Multa de 8,5M€ por uso de algoritmos de asignación de pedidos que discriminaban por nacionalidad y género de los riders.",
    source: "aepd",
    sourceLabel: sourceLabels.aepd,
    sourceUrl: "https://www.aepd.es/resoluciones",
    publishDate: "2026-02-25",
    sectors: ["tecnologia", "transporte"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "nacional",
    tags: ["algoritmo", "discriminación", "riders", "delivery"],
    keyChanges: [
      "Multa de 8,5M€ por vulneración de los artículos 5 y 22 del RGPD",
      "Obligación de auditoría algorítmica independiente en 6 meses",
      "Precedente para regulación de decisiones automatizadas en plataformas laborales",
    ],
    relatedAlerts: ["ra-027"],
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 63,
    weekChanged: "2026-W08",
  },

  // ── ADDITIONAL BOE / MIXED ───────────────────────────────────────────
  {
    id: "ra-029",
    title: "Orden ministerial de regulación de publicidad de criptoactivos",
    summary:
      "Nuevas restricciones publicitarias para criptoactivos: advertencias obligatorias, prohibición de influencers no regulados y limitaciones en redes sociales.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-4890",
    publishDate: "2026-02-12",
    sectors: ["banca", "tecnologia"],
    impactLevel: "medio",
    status: "en-vigor",
    territory: "nacional",
    tags: ["cripto", "publicidad", "CNMV", "influencers"],
    affectedRegulations: ["Circular CNMV sobre publicidad de criptoactivos"],
    keyChanges: [
      "Advertencia legal obligatoria en toda publicidad de criptoactivos",
      "Prohibición de uso de influencers sin registro previo en CNMV",
      "Multas de hasta 300.000€ por incumplimiento",
    ],
    relatedAlerts: ["ra-004"],
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 34,
    weekChanged: "2026-W07",
  },
  {
    id: "ra-030",
    title: "Real Decreto de regulación de la telemedicina y salud digital",
    summary:
      "Marco normativo para la prestación de servicios sanitarios a distancia, incluyendo prescripción electrónica intercomunitaria.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-3200",
    publishDate: "2026-01-25",
    effectiveDate: "2026-07-01",
    sectors: ["sanidad", "tecnologia"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "nacional",
    tags: ["telemedicina", "salud digital", "prescripción electrónica"],
    complianceDeadline: "2026-07-01",
    keyChanges: [
      "Regulación de la teleconsulta como acto médico con plenas garantías",
      "Receta electrónica válida en todas las CCAA sin necesidad de validación adicional",
      "Estándares de ciberseguridad específicos para plataformas de telemedicina",
    ],
    complianceChecklist: [
      "Adaptar plataforma de telemedicina a requisitos de ciberseguridad",
      "Implementar receta electrónica intercomunitaria",
      "Acreditar teleconsulta como acto médico en sistema de calidad",
    ],
    estimatedCostRange: { small: "3.000–10.000€", medium: "25.000–80.000€", large: "200.000–500.000€" },
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 64,
    weekChanged: "2026-W04",
  },
  {
    id: "ra-031",
    title: "Orden TED/2026 sobre el autoconsumo colectivo y comunidades energéticas",
    summary:
      "Simplificación administrativa del autoconsumo colectivo y nuevo marco para comunidades energéticas locales.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-5670",
    publishDate: "2026-02-28",
    effectiveDate: "2026-04-01",
    sectors: ["energia", "inmobiliario"],
    impactLevel: "medio",
    status: "en-vigor",
    territory: "nacional",
    tags: ["autoconsumo", "comunidades energéticas", "renovables"],
    keyChanges: [
      "Eliminación de licencia de obras para instalaciones de autoconsumo <100kW",
      "Compensación simplificada para comunidades energéticas de hasta 500 miembros",
      "Ampliación del radio de autoconsumo colectivo de 500m a 2km",
    ],
    affectedEntities: ["pymes", "autónomos", "admin pública"],
    complexityScore: 40,
    weekChanged: "2026-W09",
  },
  {
    id: "ra-032",
    title: "RD de transposición de la Directiva de transparencia salarial",
    summary:
      "Anteproyecto de transposición de la Directiva (UE) 2023/970. Obligación de publicar bandas salariales y derecho a conocer salarios medios por género.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-2980",
    publishDate: "2026-01-18",
    sectors: ["general"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["transparencia salarial", "igualdad", "brecha salarial"],
    affectedRegulations: ["Directiva (UE) 2023/970", "RD 902/2020"],
    complianceDeadline: "2026-06-07",
    keyChanges: [
      "Publicación obligatoria de bandas salariales en todas las ofertas de empleo",
      "Informes de brecha salarial anuales para empresas >100 trabajadores",
      "Derecho de trabajadores a conocer el salario medio de su categoría desglosado por género",
    ],
    complianceChecklist: [
      "Establecer bandas salariales por categoría profesional",
      "Adaptar ofertas de empleo para incluir rango salarial",
      "Preparar informe anual de brecha salarial por género",
      "Informar a trabajadores sobre el salario medio de su categoría",
    ],
    euDirective: { ref: "Directiva (UE) 2023/970", deadline: "2026-06-07", transposed: false },
    estimatedCostRange: { small: "1.000–3.000€", medium: "8.000–25.000€", large: "50.000–150.000€" },
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 47,
    passProbability: 85,
    publicConsultation: { status: "cerrada", responses: 2890, closeDate: "2025-12-15" },
    weekChanged: "2026-W03",
  },
  {
    id: "ra-033",
    title: "Resolución CNMC sobre condiciones de acceso al mercado de paquetería de última milla",
    summary:
      "La CNMC analiza las condiciones de competencia en la distribución de última milla y propone medidas para garantizar el acceso de operadores independientes.",
    source: "cnmc",
    sourceLabel: sourceLabels.cnmc,
    sourceUrl: "https://www.cnmc.es/expedientes",
    publishDate: "2026-03-10",
    sectors: ["transporte", "tecnologia"],
    impactLevel: "medio",
    status: "en-tramite",
    territory: "nacional",
    tags: ["logística", "última milla", "competencia", "ecommerce"],
    keyChanges: [
      "Requisitos de interoperabilidad en redes de taquillas inteligentes",
      "Prohibición de cláusulas de exclusividad en contratos con plataformas",
      "Transparencia en las condiciones de acceso a lockers y puntos de recogida",
    ],
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 42,
    weekChanged: "2026-W10",
  },
  {
    id: "ra-034",
    title: "Ley Orgánica de reforma del Código Penal: delitos contra el medio ambiente",
    summary:
      "Endurecimiento de penas por delitos medioambientales: contaminación, vertidos y gestión ilegal de residuos. Nuevas figuras de ecocidio.",
    source: "congreso",
    sourceLabel: sourceLabels.congreso,
    sourceUrl: "https://www.congreso.es/opendata",
    publishDate: "2026-03-28",
    sectors: ["medio-ambiente", "energia", "agroalimentario"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["medio ambiente", "código penal", "ecocidio", "vertidos"],
    affectedRegulations: ["Código Penal (Título XVI, Libro II)"],
    keyChanges: [
      "Nueva figura de ecocidio con penas de hasta 15 años de prisión",
      "Responsabilidad penal de personas jurídicas en delitos ambientales ampliada",
      "Agravante por daño a espacios naturales protegidos o Red Natura 2000",
    ],
    complianceChecklist: [
      "Revisar programas de compliance penal — incluir ecocidio",
      "Auditar vertidos y emisiones frente a nuevos umbrales penales",
      "Verificar actividad en proximidad de Red Natura 2000",
    ],
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 68,
    passProbability: 55,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-035",
    title: "Reglamento (UE) 2024/1183: identidad digital europea (eIDAS 2.0)",
    summary:
      "Entrada en vigor de las carteras de identidad digital europeas. España desarrolla la app de identidad digital bajo el marco eIDAS 2.0.",
    source: "eurlex",
    sourceLabel: sourceLabels.eurlex,
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1183",
    publishDate: "2024-04-11",
    effectiveDate: "2026-11-01",
    sectors: ["tecnologia", "banca", "sanidad", "general"],
    impactLevel: "alto",
    status: "en-tramite",
    territory: "nacional",
    tags: ["identidad digital", "eIDAS", "cartera digital", "DNIe"],
    complianceDeadline: "2026-11-01",
    keyChanges: [
      "Cartera de identidad digital disponible para todos los ciudadanos de la UE",
      "Obligación de aceptación por bancos, telecoms y servicios públicos",
      "Firma electrónica cualificada gratuita desde la cartera digital",
    ],
    euDirective: { ref: "Reglamento (UE) 2024/1183 (eIDAS 2.0)", deadline: "2026-11-01", transposed: false },
    complianceChecklist: [
      "Integrar aceptación de cartera digital europea en onboarding",
      "Adaptar sistemas de verificación de identidad al framework eIDAS 2.0",
      "Preparar aceptación de firma electrónica cualificada desde cartera",
    ],
    estimatedCostRange: { small: "3.000–10.000€", medium: "20.000–60.000€", large: "150.000–400.000€" },
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 62,
    weekChanged: "2026-W14",
  },
  {
    id: "ra-036",
    title: "Decreto Ley de emergencia hídrica en la cuenca del Segura",
    summary:
      "Medidas extraordinarias de gestión hídrica ante la sequía severa en la cuenca del Segura: restricciones de riego y prioridad de abastecimiento urbano.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-6100",
    publishDate: "2026-03-08",
    effectiveDate: "2026-03-09",
    sectors: ["agroalimentario", "medio-ambiente"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "nacional",
    tags: ["sequía", "agua", "Segura", "riego", "emergencia hídrica"],
    keyChanges: [
      "Reducción del 40% en dotaciones de riego para la campaña 2026",
      "Prioridad absoluta de abastecimiento urbano sobre riego agrícola",
      "Activación de desaladoras de emergencia y trasvases extraordinarios",
      "Ayudas de 200M€ a agricultores afectados por restricciones hídricas",
    ],
    affectedEntities: ["pymes", "autónomos", "admin pública"],
    complexityScore: 45,
    weekChanged: "2026-W10",
  },
  {
    id: "ra-037",
    title: "Directiva (UE) 2022/2557: resiliencia de entidades críticas (CER) — transposición",
    summary:
      "España transpone la directiva CER identificando entidades críticas nacionales y estableciendo obligaciones de resiliencia física y cibernética.",
    source: "boe",
    sourceLabel: sourceLabels.boe,
    sourceUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7200",
    publishDate: "2026-03-20",
    sectors: ["energia", "transporte", "sanidad", "banca", "defensa"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "nacional",
    tags: ["infraestructura crítica", "resiliencia", "CER", "seguridad"],
    affectedRegulations: ["Directiva (UE) 2022/2557 (CER)", "Ley 8/2011 de infraestructuras críticas"],
    complianceDeadline: "2026-10-17",
    keyChanges: [
      "Identificación de entidades críticas en 11 sectores estratégicos",
      "Evaluación de riesgo de resiliencia obligatoria cada 4 años",
      "Plan de resiliencia con medidas físicas y cibernéticas",
      "Notificación de incidentes disruptivos en 24 horas",
    ],
    relatedAlerts: ["ra-010", "ra-011"],
    complianceChecklist: [
      "Determinar si la entidad es crítica según los 11 sectores",
      "Realizar evaluación de riesgo de resiliencia",
      "Elaborar plan de resiliencia con medidas físicas y ciber",
      "Implementar notificación de incidentes disruptivos en 24h",
    ],
    euDirective: { ref: "Directiva (UE) 2022/2557 (CER)", deadline: "2024-10-17", transposed: true },
    estimatedCostRange: { small: "N/A", medium: "60.000–180.000€", large: "400.000–1.200.000€" },
    affectedEntities: ["gran empresa", "admin pública"],
    complexityScore: 73,
    dependsOn: ["ra-011"],
    weekChanged: "2026-W12",
  },

  // ── CCAA BOLETINES — Alertas autonómicas (ra-038 → ra-056) ──────────
  {
    id: "ra-038",
    title: "Andalucía: Decreto de regulación integral del alquiler turístico",
    summary:
      "La Junta de Andalucía aprueba un decreto que establece un registro obligatorio de viviendas turísticas, límites de densidad por barrio y requisitos de convivencia vecinal.",
    source: "ccaa-boletin",
    sourceLabel: "BOJA (Andalucía)",
    sourceUrl: "https://www.juntadeandalucia.es/eboja",
    publishDate: "2026-03-28",
    effectiveDate: "2026-07-01",
    sectors: ["inmobiliario", "turismo"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "andalucia",
    tags: ["alquiler turístico", "Andalucía", "vivienda", "registro obligatorio"],
    keyChanges: [
      "Registro obligatorio de viviendas con finalidad turística con verificación telemática",
      "Límites de densidad turística por barrio en municipios de más de 50.000 hab.",
      "Requisitos de insonorización y convivencia vecinal para nuevas licencias",
      "Sanciones de hasta 150.000€ por explotación irregular",
    ],
    relatedAlerts: ["ra-022", "ra-023"],
    complianceChecklist: [
      "Inscribir vivienda en registro turístico andaluz",
      "Verificar cumplimiento de ratio de densidad del barrio",
      "Adaptar inmueble a requisitos de insonorización",
    ],
    estimatedCostRange: { small: "800–3.000€", medium: "8.000–25.000€", large: "30.000–100.000€" },
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 48,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-039",
    title: "Cataluña: Ley de transición energética y soberanía renovable",
    summary:
      "El Parlament aprueba la ley catalana de transición energética que fija objetivos vinculantes de autoconsumo y comunidades energéticas locales, con calendario más ambicioso que el PNIEC.",
    source: "ccaa-boletin",
    sourceLabel: "DOGC (Cataluña)",
    sourceUrl: "https://dogc.gencat.cat",
    publishDate: "2026-04-02",
    effectiveDate: "2026-07-15",
    sectors: ["energia", "medio-ambiente"],
    impactLevel: "critico",
    status: "aprobada",
    territory: "cataluna",
    tags: ["transición energética", "Cataluña", "renovables", "autoconsumo", "comunidades energéticas"],
    keyChanges: [
      "Objetivo vinculante del 50% de energía renovable en 2030 para Cataluña",
      "Obligación de autoconsumo en nuevas edificaciones comerciales de más de 500 m²",
      "Fondo catalán de transición energética dotado con 200 M€",
      "Comunidades energéticas locales con régimen fiscal bonificado",
    ],
    relatedAlerts: ["ra-005", "ra-015"],
    complianceChecklist: [
      "Evaluar obligación de autoconsumo en inmuebles comerciales",
      "Analizar elegibilidad para comunidades energéticas locales",
      "Revisar planificación energética conforme al nuevo calendario",
    ],
    estimatedCostRange: { small: "5.000–15.000€", medium: "50.000–200.000€", large: "500.000–2.000.000€" },
    affectedEntities: ["gran empresa", "pymes", "admin pública"],
    complexityScore: 72,
    weekChanged: "2026-W14",
  },
  {
    id: "ra-040",
    title: "Madrid: Ordenanza de zona de bajas emisiones Madrid Central 360",
    summary:
      "El Ayuntamiento de Madrid aprueba la nueva ordenanza que amplía la zona de bajas emisiones a la M-30 completa y endurece restricciones para vehículos sin etiqueta ambiental.",
    source: "ccaa-boletin",
    sourceLabel: "BOCM (Madrid)",
    sourceUrl: "https://www.bocm.es",
    publishDate: "2026-03-22",
    effectiveDate: "2026-09-01",
    sectors: ["transporte", "medio-ambiente"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "madrid",
    tags: ["bajas emisiones", "Madrid Central", "ZBE", "transporte", "contaminación"],
    keyChanges: [
      "Ampliación de la ZBE a todo el interior de la M-30",
      "Prohibición total de acceso a vehículos sin etiqueta ambiental a partir de 2027",
      "Sistema de cámaras ANPR para control automatizado de acceso",
      "Bonificaciones fiscales del 75% en IBI para edificios con puntos de recarga",
    ],
    relatedAlerts: ["ra-006"],
    complianceChecklist: [
      "Verificar clasificación ambiental de la flota de vehículos",
      "Planificar renovación de vehículos sin etiqueta antes de 2027",
      "Evaluar instalación de puntos de recarga para bonificación IBI",
    ],
    estimatedCostRange: { small: "2.000–8.000€", medium: "20.000–80.000€", large: "200.000–800.000€" },
    affectedEntities: ["gran empresa", "pymes", "autónomos"],
    complexityScore: 55,
    weekChanged: "2026-W12",
  },
  {
    id: "ra-041",
    title: "C. Valenciana: Decreto integral de reconstrucción post-DANA",
    summary:
      "La Generalitat Valenciana aprueba el decreto de reconstrucción de las zonas afectadas por la DANA con medidas urbanísticas, fiscales y de reactivación económica.",
    source: "ccaa-boletin",
    sourceLabel: "DOGV (Valencia)",
    sourceUrl: "https://dogv.gva.es",
    publishDate: "2026-04-05",
    effectiveDate: "2026-04-06",
    sectors: ["inmobiliario", "general"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "comunitat-valenciana",
    tags: ["DANA", "reconstrucción", "Valencia", "urbanismo", "emergencia"],
    keyChanges: [
      "Plan de reconstrucción dotado con 1.400 M€ para municipios afectados",
      "Exención total de ICIO y tasas urbanísticas para reconstrucción de viviendas",
      "Procedimiento urbanístico acelerado (licencia en 30 días) en zonas DANA",
      "Fondo de reactivación económica para pymes y autónomos afectados",
    ],
    relatedAlerts: ["ra-024", "ra-001"],
    complianceChecklist: [
      "Solicitar calificación de zona DANA para acceder a exenciones",
      "Tramitar licencia de reconstrucción por vía acelerada",
      "Solicitar acceso al fondo de reactivación económica",
    ],
    estimatedCostRange: { small: "0€ (exenciones)", medium: "0–5.000€", large: "10.000–50.000€" },
    affectedEntities: ["pymes", "autónomos", "admin pública"],
    complexityScore: 45,
    weekChanged: "2026-W14",
  },
  {
    id: "ra-042",
    title: "País Vasco: Reforma fiscal foral del IRPF — tramos y deducciones",
    summary:
      "Las Juntas Generales aprueban la reforma del IRPF foral vasco con nuevos tramos, deducciones por inversión productiva y ajuste de la tributación del ahorro.",
    source: "ccaa-boletin",
    sourceLabel: "EHAA (País Vasco)",
    sourceUrl: "https://www.euskadi.eus/web01-bopv/es",
    publishDate: "2026-03-10",
    effectiveDate: "2026-01-01",
    sectors: ["banca", "general"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "pais-vasco",
    tags: ["IRPF", "fiscalidad foral", "País Vasco", "deducciones", "ahorro"],
    keyChanges: [
      "Nuevo tramo del 49% para rentas superiores a 120.000€",
      "Deducción del 15% por inversión en startups y economía social",
      "Tipo del ahorro reducido al 19% para primeros 10.000€ de ganancias",
      "Deducción reforzada por vivienda habitual para menores de 35 años",
    ],
    relatedAlerts: ["ra-053"],
    affectedEntities: ["pymes", "autónomos", "gran empresa"],
    complexityScore: 62,
    weekChanged: "2026-W10",
  },
  {
    id: "ra-043",
    title: "Galicia: Regulación de acuicultura sostenible y trazabilidad",
    summary:
      "La Xunta aprueba la nueva regulación de acuicultura sostenible con requisitos de trazabilidad digital, límites de densidad en bateas y protección de la ría.",
    source: "ccaa-boletin",
    sourceLabel: "DOG (Galicia)",
    sourceUrl: "https://www.xunta.gal/dog",
    publishDate: "2026-02-18",
    effectiveDate: "2026-06-01",
    sectors: ["agroalimentario", "medio-ambiente"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "galicia",
    tags: ["acuicultura", "Galicia", "trazabilidad", "bateas", "sostenibilidad"],
    keyChanges: [
      "Sistema de trazabilidad digital obligatorio para toda la cadena acuícola",
      "Reducción del 10% de densidad máxima en bateas de mejillón",
      "Monitorización continua de calidad de agua en zonas de producción",
    ],
    relatedAlerts: [],
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 40,
    weekChanged: "2026-W07",
  },
  {
    id: "ra-044",
    title: "Castilla y León: Plan contra la despoblación — servicios mínimos garantizados",
    summary:
      "Las Cortes de CyL aprueban la ley de servicios mínimos garantizados en municipios de menos de 5.000 habitantes, con estándares en sanidad, educación y conectividad.",
    source: "ccaa-boletin",
    sourceLabel: "BOCyL (Castilla y León)",
    sourceUrl: "https://bocyl.jcyl.es",
    publishDate: "2026-03-05",
    effectiveDate: "2026-09-01",
    sectors: ["sanidad", "educacion"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "castilla-y-leon",
    tags: ["despoblación", "Castilla y León", "servicios mínimos", "rural"],
    keyChanges: [
      "Garantía de atención primaria a menos de 30 min en todos los municipios",
      "Aulas digitales con banda ancha mínima de 100 Mbps en escuelas rurales",
      "Incentivos fiscales del 20% en IRPF autonómico para profesionales en municipios <2.000 hab.",
    ],
    relatedAlerts: [],
    affectedEntities: ["admin pública", "pymes"],
    complexityScore: 38,
    weekChanged: "2026-W09",
  },
  {
    id: "ra-045",
    title: "Castilla-La Mancha: Regulación de macrogranjas y control de vertidos",
    summary:
      "El gobierno de CLM aprueba el decreto que endurece los requisitos ambientales para macrogranjas y establece un sistema de control de vertidos a acuíferos.",
    source: "ccaa-boletin",
    sourceLabel: "DOCM (Castilla-La Mancha)",
    sourceUrl: "https://docm.jccm.es",
    publishDate: "2026-02-25",
    effectiveDate: "2026-06-15",
    sectors: ["agroalimentario", "medio-ambiente"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "castilla-la-mancha",
    tags: ["macrogranjas", "vertidos", "Castilla-La Mancha", "acuíferos", "ganadería"],
    keyChanges: [
      "Moratoria de 2 años para nuevas macrogranjas de más de 2.000 UGM",
      "Sistema de monitorización de nitratos en acuíferos en tiempo real",
      "Obligación de planes de gestión de purines con trazabilidad completa",
      "Sanciones de hasta 600.000€ por vertidos no autorizados",
    ],
    relatedAlerts: [],
    complianceChecklist: [
      "Verificar clasificación de explotación según UGM",
      "Implementar sistema de trazabilidad de purines",
      "Conectar a red de monitorización de nitratos",
    ],
    estimatedCostRange: { small: "3.000–10.000€", medium: "30.000–100.000€", large: "150.000–500.000€" },
    affectedEntities: ["pymes", "gran empresa"],
    complexityScore: 58,
    weekChanged: "2026-W08",
  },
  {
    id: "ra-046",
    title: "Aragón: Normativa de protección del paisaje frente a instalaciones renovables",
    summary:
      "Las Cortes de Aragón aprueban la ley de protección paisajística que regula la implantación de parques solares y eólicos con criterios de integración visual y distancias mínimas.",
    source: "ccaa-boletin",
    sourceLabel: "BOA (Aragón)",
    sourceUrl: "https://www.boa.aragon.es",
    publishDate: "2026-03-12",
    effectiveDate: "2026-07-01",
    sectors: ["energia", "medio-ambiente"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "aragon",
    tags: ["renovables", "paisaje", "Aragón", "eólica", "solar"],
    keyChanges: [
      "Distancias mínimas de 1 km entre parques solares y núcleos urbanos",
      "Evaluación de impacto paisajístico obligatoria para instalaciones >5 MW",
      "Fondo de compensación paisajística del 1,5% de la inversión del proyecto",
    ],
    relatedAlerts: ["ra-005"],
    affectedEntities: ["gran empresa", "pymes"],
    complexityScore: 46,
    weekChanged: "2026-W10",
  },
  {
    id: "ra-047",
    title: "Canarias: Regulación integral del alquiler vacacional insular",
    summary:
      "Nuevo decreto canario que complementa la ley de alojamiento turístico con un sistema de cuotas por isla, zonificación y requisitos de sostenibilidad.",
    source: "ccaa-boletin",
    sourceLabel: "BOC (Canarias)",
    sourceUrl: "https://www.gobiernodecanarias.org/boc",
    publishDate: "2026-04-01",
    effectiveDate: "2026-08-01",
    sectors: ["turismo", "inmobiliario"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "canarias",
    tags: ["alquiler vacacional", "Canarias", "cuotas insulares", "sostenibilidad"],
    keyChanges: [
      "Cuota máxima de plazas turísticas diferenciada por isla",
      "Zonificación turística con áreas de saturación donde no se conceden licencias",
      "Certificación de sostenibilidad obligatoria para viviendas vacacionales",
      "Tasa turística de 3€/noche destinada a conservación medioambiental",
    ],
    relatedAlerts: ["ra-023", "ra-022"],
    complianceChecklist: [
      "Verificar cuota de plazas disponible en la isla correspondiente",
      "Obtener certificación de sostenibilidad turística",
      "Registrar alta en sistema de tasa turística",
    ],
    estimatedCostRange: { small: "1.000–4.000€", medium: "10.000–40.000€", large: "50.000–150.000€" },
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 52,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-048",
    title: "Illes Balears: Ley de circularidad y sostenibilidad turística",
    summary:
      "El Parlament balear aprueba la ley de economía circular aplicada al turismo, con obligaciones de gestión de residuos, eficiencia hídrica y huella de carbono para establecimientos.",
    source: "ccaa-boletin",
    sourceLabel: "BOIB (Illes Balears)",
    sourceUrl: "https://www.caib.es/eboibfront",
    publishDate: "2026-03-18",
    effectiveDate: "2026-10-01",
    sectors: ["turismo", "medio-ambiente"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "illes-balears",
    tags: ["circularidad", "Baleares", "turismo sostenible", "residuos", "huella de carbono"],
    keyChanges: [
      "Obligación de cálculo y declaración de huella de carbono para hoteles de más de 50 plazas",
      "Eliminación total de plásticos de un solo uso en establecimientos turísticos",
      "Objetivos de reutilización hídrica del 40% en 2028 para grandes complejos",
      "Sello de circularidad turística con beneficios fiscales",
    ],
    relatedAlerts: ["ra-022"],
    complianceChecklist: [
      "Calcular y registrar huella de carbono del establecimiento",
      "Eliminar plásticos de un solo uso del suministro",
      "Evaluar sistemas de reutilización hídrica",
    ],
    estimatedCostRange: { small: "2.000–8.000€", medium: "15.000–60.000€", large: "100.000–400.000€" },
    affectedEntities: ["pymes", "gran empresa"],
    complexityScore: 54,
    weekChanged: "2026-W11",
  },
  {
    id: "ra-049",
    title: "Extremadura: Regulación del desmantelamiento de la central nuclear de Almaraz",
    summary:
      "La Junta de Extremadura aprueba el marco normativo autonómico para el desmantelamiento de Almaraz, con requisitos de seguridad, empleo local y restauración ambiental.",
    source: "ccaa-boletin",
    sourceLabel: "DOE (Extremadura)",
    sourceUrl: "https://doe.juntaex.es",
    publishDate: "2026-04-08",
    effectiveDate: "2026-05-01",
    sectors: ["energia"],
    impactLevel: "critico",
    status: "aprobada",
    territory: "extremadura",
    tags: ["nuclear", "Almaraz", "Extremadura", "desmantelamiento", "transición energética"],
    keyChanges: [
      "Plan de transición laboral para los 1.200 trabajadores de la central",
      "Fondo autonómico de restauración ambiental de 80 M€",
      "Requisito de contratación local mínima del 60% en obras de desmantelamiento",
      "Monitorización radiológica continua durante 15 años post-cierre",
    ],
    relatedAlerts: ["ra-005"],
    affectedEntities: ["gran empresa", "admin pública"],
    complexityScore: 78,
    weekChanged: "2026-W14",
  },
  {
    id: "ra-050",
    title: "Murcia: Ley de protección integral del Mar Menor",
    summary:
      "La Asamblea Regional aprueba la ley de protección integral del Mar Menor con medidas contra vertidos agrícolas, restricciones urbanísticas y restauración ecológica.",
    source: "ccaa-boletin",
    sourceLabel: "BORM (Murcia)",
    sourceUrl: "https://www.borm.es",
    publishDate: "2026-03-30",
    effectiveDate: "2026-04-15",
    sectors: ["medio-ambiente", "agroalimentario"],
    impactLevel: "critico",
    status: "en-vigor",
    territory: "murcia",
    tags: ["Mar Menor", "Murcia", "vertidos", "nitratos", "restauración ecológica"],
    keyChanges: [
      "Banda de protección de 1.500 m sin actividad agrícola intensiva alrededor del Mar Menor",
      "Prohibición total de nuevos desarrollos urbanísticos en la primera línea",
      "Sistema de filtros verdes obligatorios en explotaciones agrícolas del Campo de Cartagena",
      "Fondo de restauración ecológica de 120 M€ con cargo a canon de vertidos",
    ],
    relatedAlerts: [],
    complianceChecklist: [
      "Verificar si la explotación se encuentra en la banda de protección",
      "Instalar filtros verdes conforme a especificaciones técnicas",
      "Registrar actividad en el sistema de control de vertidos",
    ],
    estimatedCostRange: { small: "5.000–20.000€", medium: "50.000–200.000€", large: "300.000–1.000.000€" },
    affectedEntities: ["pymes", "autónomos", "gran empresa"],
    complexityScore: 68,
    weekChanged: "2026-W13",
  },
  {
    id: "ra-051",
    title: "Asturias: Plan de transición justa para las cuencas mineras",
    summary:
      "El Principado aprueba el plan de transición justa con medidas de reindustrialización, formación y ayudas para los municipios de las cuencas mineras asturianas.",
    source: "ccaa-boletin",
    sourceLabel: "BOPA (Asturias)",
    sourceUrl: "https://sede.asturias.es/bopa",
    publishDate: "2026-03-15",
    effectiveDate: "2026-06-01",
    sectors: ["energia", "general"],
    impactLevel: "alto",
    status: "aprobada",
    territory: "asturias",
    tags: ["transición justa", "Asturias", "cuencas mineras", "reindustrialización"],
    keyChanges: [
      "Fondo de reindustrialización de 150 M€ para comarcas mineras",
      "Programa de recualificación profesional para 3.000 trabajadores",
      "Bonificaciones fiscales del 25% para empresas que se instalen en cuencas mineras",
      "Hub de innovación energética en Mieres y Langreo",
    ],
    relatedAlerts: ["ra-005"],
    affectedEntities: ["pymes", "admin pública", "gran empresa"],
    complexityScore: 50,
    weekChanged: "2026-W11",
  },
  {
    id: "ra-052",
    title: "Cantabria: Regulación urbanística del litoral cántabro",
    summary:
      "El Parlamento de Cantabria aprueba la ley de protección urbanística del litoral con retranqueos obligatorios, limitación de alturas y protección de rasas costeras.",
    source: "ccaa-boletin",
    sourceLabel: "BOC (Cantabria)",
    sourceUrl: "https://boc.cantabria.es",
    publishDate: "2026-02-28",
    effectiveDate: "2026-07-01",
    sectors: ["inmobiliario", "medio-ambiente"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "cantabria",
    tags: ["litoral", "Cantabria", "urbanismo", "costa", "protección"],
    keyChanges: [
      "Retranqueo obligatorio de 200 m desde la línea de costa para nuevas construcciones",
      "Limitación de alturas a planta baja + 2 en la primera franja costera",
      "Protección integral de rasas costeras como patrimonio geomorfológico",
    ],
    relatedAlerts: [],
    affectedEntities: ["pymes", "gran empresa"],
    complexityScore: 42,
    weekChanged: "2026-W08",
  },
  {
    id: "ra-053",
    title: "Navarra: Reforma del impuesto de sociedades foral navarro",
    summary:
      "El Parlamento de Navarra aprueba la reforma del IS foral con nuevo tipo reducido para pymes, incentivos a I+D+i y tributación mínima del 15% para grandes grupos.",
    source: "ccaa-boletin",
    sourceLabel: "BON (Navarra)",
    sourceUrl: "https://bon.navarra.es",
    publishDate: "2026-03-20",
    effectiveDate: "2026-01-01",
    sectors: ["banca", "general"],
    impactLevel: "alto",
    status: "en-vigor",
    territory: "navarra",
    tags: ["impuesto de sociedades", "Navarra", "fiscalidad foral", "pymes", "I+D"],
    keyChanges: [
      "Tipo reducido del 20% para pymes con facturación inferior a 1 M€",
      "Deducción del 40% en I+D+i (frente al 25% anterior)",
      "Tributación mínima efectiva del 15% para grupos con facturación >750 M€",
      "Régimen especial de consolidación fiscal para cooperativas",
    ],
    relatedAlerts: ["ra-042"],
    affectedEntities: ["pymes", "gran empresa"],
    complexityScore: 60,
    weekChanged: "2026-W12",
  },
  {
    id: "ra-054",
    title: "La Rioja: Normativa de adaptación climática de la DOC Rioja",
    summary:
      "El Gobierno de La Rioja aprueba la normativa que permite nuevas variedades de uva resistentes al calor en la DOC Rioja y adapta rendimientos máximos al cambio climático.",
    source: "ccaa-boletin",
    sourceLabel: "BOR (La Rioja)",
    sourceUrl: "https://www.larioja.org/bor",
    publishDate: "2026-02-15",
    effectiveDate: "2026-09-01",
    sectors: ["agroalimentario"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "la-rioja",
    tags: ["DOC Rioja", "La Rioja", "vino", "adaptación climática", "variedades"],
    keyChanges: [
      "Autorización de 5 nuevas variedades de uva tinta resistentes al estrés hídrico",
      "Revisión de rendimientos máximos por hectárea adaptados a temperaturas medias",
      "Fondo de modernización de viñedos de 25 M€ para reconversión varietal",
    ],
    relatedAlerts: [],
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 35,
    weekChanged: "2026-W07",
  },
  {
    id: "ra-055",
    title: "Ceuta: Regulación del comercio transfronterizo y control aduanero",
    summary:
      "La Ciudad Autónoma de Ceuta aprueba la ordenanza de regulación del comercio transfronterizo con Marruecos, incluyendo registro de operadores y control de mercancías.",
    source: "ccaa-boletin",
    sourceLabel: "BOCCE (Ceuta)",
    sourceUrl: "https://www.ceuta.es/ceuta/bocce",
    publishDate: "2026-03-08",
    effectiveDate: "2026-06-01",
    sectors: ["general", "transporte"],
    impactLevel: "medio",
    status: "aprobada",
    territory: "ceuta",
    tags: ["comercio transfronterizo", "Ceuta", "aduanas", "Marruecos"],
    keyChanges: [
      "Registro obligatorio de operadores comerciales transfronterizos",
      "Límites de volumen diario de mercancías por operador",
      "Sistema de trazabilidad digital para mercancías en tránsito",
    ],
    relatedAlerts: [],
    affectedEntities: ["pymes", "autónomos"],
    complexityScore: 34,
    weekChanged: "2026-W10",
  },
  {
    id: "ra-056",
    title: "Melilla: Normativa de zona portuaria de actividades logísticas especiales",
    summary:
      "La Ciudad Autónoma de Melilla aprueba la normativa que crea una zona portuaria de actividades logísticas especiales con régimen aduanero y fiscal simplificado.",
    source: "ccaa-boletin",
    sourceLabel: "BOME (Melilla)",
    sourceUrl: "https://www.melilla.es/melillaportal/contenedor.jsp?seccion=s_floc_d4_v1.jsp&contenido=bome",
    publishDate: "2026-01-30",
    effectiveDate: "2026-05-01",
    sectors: ["transporte", "general"],
    impactLevel: "bajo",
    status: "aprobada",
    territory: "melilla",
    tags: ["zona portuaria", "Melilla", "logística", "aduanas"],
    keyChanges: [
      "Creación de zona franca portuaria con régimen aduanero simplificado",
      "Bonificación del 50% en tasas portuarias para operadores logísticos certificados",
      "Procedimiento aduanero acelerado para mercancías en tránsito hacia la UE",
    ],
    relatedAlerts: [],
    affectedEntities: ["pymes", "gran empresa"],
    complexityScore: 30,
    weekChanged: "2026-W04",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   SECTOR PROFILES
   ══════════════════════════════════════════════════════════════════════════ */

function countAlertsForSector(sector: SectorId): number {
  return alerts.filter((a) => a.sectors.includes(sector)).length;
}

function countCriticalForSector(sector: SectorId): number {
  return alerts.filter((a) => a.sectors.includes(sector) && a.impactLevel === "critico").length;
}

const sectors: SectorProfile[] = [
  {
    id: "banca",
    label: "Banca y Finanzas",
    description: "Regulación bancaria, mercados financieros, criptoactivos, seguros y servicios de pago.",
    activeAlerts: countAlertsForSector("banca"),
    criticalAlerts: countCriticalForSector("banca"),
    regulatoryBurdenScore: 89,
    recentTrend: "increasing",
    keyRegulators: ["Banco de España", "CNMV", "EBA", "BCE", "CNMC"],
    topRisks: [
      "Cumplimiento DORA y NIS2 simultáneo",
      "Requisitos de capital para criptoactivos",
      "Riesgo climático en modelos de solvencia",
      "Multas CNMC por prácticas anticompetitivas",
    ],
    velocityIndex: 8.7,
    velocitySparkline: [5, 6, 7, 6, 8, 7, 9, 8, 9, 10, 8, 9],
    burdenHistory: [
      { month: "May-25", value: 78 }, { month: "Jun-25", value: 80 }, { month: "Jul-25", value: 82 },
      { month: "Ago-25", value: 81 }, { month: "Sep-25", value: 83 }, { month: "Oct-25", value: 84 },
      { month: "Nov-25", value: 85 }, { month: "Dic-25", value: 86 }, { month: "Ene-26", value: 87 },
      { month: "Feb-26", value: 88 }, { month: "Mar-26", value: 89 }, { month: "Abr-26", value: 89 },
    ],
    fragmentationIndex: 32,
    sandboxActive: true,
  },
  {
    id: "energia",
    label: "Energía",
    description: "Mercados energéticos, renovables, eficiencia energética, autoconsumo y transición ecológica.",
    activeAlerts: countAlertsForSector("energia"),
    criticalAlerts: countCriticalForSector("energia"),
    regulatoryBurdenScore: 82,
    recentTrend: "increasing",
    keyRegulators: ["CNMC", "MITECO", "IDAE", "REE", "ACER"],
    topRisks: [
      "Expediente CNMC contra distribuidoras",
      "Incertidumbre sobre mecanismo ibérico post-2026",
      "Requisitos ESG y reporting CSRD",
      "Transposición de directiva de eficiencia energética",
    ],
    velocityIndex: 7.9,
    velocitySparkline: [6, 7, 7, 8, 7, 8, 8, 9, 8, 7, 8, 8],
    burdenHistory: [
      { month: "May-25", value: 72 }, { month: "Jun-25", value: 73 }, { month: "Jul-25", value: 74 },
      { month: "Ago-25", value: 75 }, { month: "Sep-25", value: 76 }, { month: "Oct-25", value: 77 },
      { month: "Nov-25", value: 78 }, { month: "Dic-25", value: 79 }, { month: "Ene-26", value: 80 },
      { month: "Feb-26", value: 81 }, { month: "Mar-26", value: 82 }, { month: "Abr-26", value: 82 },
    ],
    fragmentationIndex: 68,
    sandboxActive: true,
  },
  {
    id: "telecom",
    label: "Telecomunicaciones",
    description: "Redes fijas y móviles, espectro, servicios digitales, plataformas y competencia.",
    activeAlerts: countAlertsForSector("telecom"),
    criticalAlerts: countCriticalForSector("telecom"),
    regulatoryBurdenScore: 68,
    recentTrend: "stable",
    keyRegulators: ["CNMC", "Secretaría de Estado de Telecomunicaciones", "BEREC"],
    topRisks: [
      "Revisión del mercado mayorista de acceso fijo",
      "Obligaciones NIS2 para proveedores de telecomunicaciones",
      "Inversión en 5G con incertidumbre regulatoria",
    ],
    velocityIndex: 5.2,
    velocitySparkline: [4, 5, 5, 6, 5, 4, 5, 6, 5, 5, 6, 5],
    burdenHistory: [
      { month: "May-25", value: 65 }, { month: "Jun-25", value: 66 }, { month: "Jul-25", value: 66 },
      { month: "Ago-25", value: 67 }, { month: "Sep-25", value: 67 }, { month: "Oct-25", value: 67 },
      { month: "Nov-25", value: 68 }, { month: "Dic-25", value: 68 }, { month: "Ene-26", value: 68 },
      { month: "Feb-26", value: 68 }, { month: "Mar-26", value: 68 }, { month: "Abr-26", value: 68 },
    ],
    fragmentationIndex: 25,
    sandboxActive: true,
  },
  {
    id: "pharma",
    label: "Farmacéutico y Salud",
    description: "Medicamentos, productos sanitarios, ensayos clínicos y regulación sanitaria.",
    activeAlerts: countAlertsForSector("pharma"),
    criticalAlerts: countCriticalForSector("pharma"),
    regulatoryBurdenScore: 74,
    recentTrend: "stable",
    keyRegulators: ["AEMPS", "Ministerio de Sanidad", "EMA"],
    topRisks: [
      "Regulación de IA aplicada a diagnóstico médico",
      "Revisión de precios de referencia de medicamentos",
      "Requisitos de telemedicina para plataformas farmacéuticas",
    ],
    velocityIndex: 5.8,
    velocitySparkline: [5, 5, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6],
    burdenHistory: [
      { month: "May-25", value: 70 }, { month: "Jun-25", value: 71 }, { month: "Jul-25", value: 71 },
      { month: "Ago-25", value: 72 }, { month: "Sep-25", value: 72 }, { month: "Oct-25", value: 73 },
      { month: "Nov-25", value: 73 }, { month: "Dic-25", value: 73 }, { month: "Ene-26", value: 74 },
      { month: "Feb-26", value: 74 }, { month: "Mar-26", value: 74 }, { month: "Abr-26", value: 74 },
    ],
    fragmentationIndex: 72,
    sandboxActive: false,
  },
  {
    id: "inmobiliario",
    label: "Inmobiliario",
    description: "Mercado inmobiliario, vivienda, alquiler, urbanismo y construcción.",
    activeAlerts: countAlertsForSector("inmobiliario"),
    criticalAlerts: countCriticalForSector("inmobiliario"),
    regulatoryBurdenScore: 85,
    recentTrend: "increasing",
    keyRegulators: ["Ministerio de Vivienda", "CCAA", "Ayuntamientos", "Tribunal Constitucional"],
    topRisks: [
      "Ampliación de zonas de mercado tensionado",
      "Moratoria urbanística en zonas inundables",
      "Restricciones a vivienda turística en CCAA",
      "Incertidumbre jurídica por recurso TC sobre alquiler temporal",
    ],
    velocityIndex: 8.1,
    velocitySparkline: [5, 6, 7, 7, 8, 8, 9, 8, 9, 8, 8, 8],
    burdenHistory: [
      { month: "May-25", value: 74 }, { month: "Jun-25", value: 75 }, { month: "Jul-25", value: 77 },
      { month: "Ago-25", value: 78 }, { month: "Sep-25", value: 79 }, { month: "Oct-25", value: 80 },
      { month: "Nov-25", value: 81 }, { month: "Dic-25", value: 82 }, { month: "Ene-26", value: 83 },
      { month: "Feb-26", value: 84 }, { month: "Mar-26", value: 85 }, { month: "Abr-26", value: 85 },
    ],
    fragmentationIndex: 88,
    sandboxActive: false,
  },
  {
    id: "tecnologia",
    label: "Tecnología",
    description: "IA, datos, ciberseguridad, plataformas digitales, semiconductores y servicios digitales.",
    activeAlerts: countAlertsForSector("tecnologia"),
    criticalAlerts: countCriticalForSector("tecnologia"),
    regulatoryBurdenScore: 91,
    recentTrend: "increasing",
    keyRegulators: ["AESIA", "AEPD", "CNMC", "INCIBE", "Comisión Europea"],
    topRisks: [
      "Cumplimiento del AI Act para sistemas de alto riesgo",
      "Guía AEPD sobre IA y protección de datos",
      "NIS2 y DORA para proveedores TIC",
      "Obligaciones del Data Act sobre portabilidad",
    ],
    velocityIndex: 9.4,
    velocitySparkline: [7, 8, 8, 9, 9, 10, 9, 10, 10, 9, 10, 9],
    burdenHistory: [
      { month: "May-25", value: 80 }, { month: "Jun-25", value: 82 }, { month: "Jul-25", value: 83 },
      { month: "Ago-25", value: 84 }, { month: "Sep-25", value: 85 }, { month: "Oct-25", value: 86 },
      { month: "Nov-25", value: 87 }, { month: "Dic-25", value: 88 }, { month: "Ene-26", value: 89 },
      { month: "Feb-26", value: 90 }, { month: "Mar-26", value: 91 }, { month: "Abr-26", value: 91 },
    ],
    fragmentationIndex: 18,
    sandboxActive: true,
  },
  {
    id: "agroalimentario",
    label: "Agroalimentario",
    description: "Agricultura, ganadería, industria alimentaria, PAC y cadena de valor agroalimentaria.",
    activeAlerts: countAlertsForSector("agroalimentario"),
    criticalAlerts: countCriticalForSector("agroalimentario"),
    regulatoryBurdenScore: 72,
    recentTrend: "increasing",
    keyRegulators: ["MAPA", "FEGA", "AICA", "Comisión Europea (DG AGRI)"],
    topRisks: [
      "Restricciones hídricas por sequía en cuenca del Segura",
      "Jornada laboral de 37,5 horas en el sector",
      "Reglamento contra la deforestación (EUDR)",
      "Reforma penal en delitos medioambientales",
    ],
    velocityIndex: 6.5,
    velocitySparkline: [4, 5, 5, 6, 7, 6, 7, 7, 6, 7, 7, 7],
    burdenHistory: [
      { month: "May-25", value: 62 }, { month: "Jun-25", value: 63 }, { month: "Jul-25", value: 64 },
      { month: "Ago-25", value: 65 }, { month: "Sep-25", value: 66 }, { month: "Oct-25", value: 67 },
      { month: "Nov-25", value: 68 }, { month: "Dic-25", value: 69 }, { month: "Ene-26", value: 70 },
      { month: "Feb-26", value: 71 }, { month: "Mar-26", value: 72 }, { month: "Abr-26", value: 72 },
    ],
    fragmentationIndex: 82,
    sandboxActive: false,
  },
  {
    id: "transporte",
    label: "Transporte y Logística",
    description: "Transporte terrestre, marítimo, aéreo, logística, movilidad y concesiones.",
    activeAlerts: countAlertsForSector("transporte"),
    criticalAlerts: countCriticalForSector("transporte"),
    regulatoryBurdenScore: 64,
    recentTrend: "stable",
    keyRegulators: ["Ministerio de Transportes", "AESA", "CNMC", "ADIF"],
    topRisks: [
      "Regulación de última milla y paquetería",
      "Resiliencia de infraestructura crítica (CER)",
      "Zonas de bajas emisiones y restricciones de acceso urbano",
    ],
    velocityIndex: 4.8,
    velocitySparkline: [4, 4, 5, 4, 5, 5, 4, 5, 5, 5, 5, 5],
    burdenHistory: [
      { month: "May-25", value: 60 }, { month: "Jun-25", value: 61 }, { month: "Jul-25", value: 61 },
      { month: "Ago-25", value: 62 }, { month: "Sep-25", value: 62 }, { month: "Oct-25", value: 63 },
      { month: "Nov-25", value: 63 }, { month: "Dic-25", value: 63 }, { month: "Ene-26", value: 64 },
      { month: "Feb-26", value: 64 }, { month: "Mar-26", value: 64 }, { month: "Abr-26", value: 64 },
    ],
    fragmentationIndex: 55,
    sandboxActive: false,
  },
  {
    id: "turismo",
    label: "Turismo y Hostelería",
    description: "Alojamiento turístico, restauración, agencias de viaje y regulación turística.",
    activeAlerts: countAlertsForSector("turismo"),
    criticalAlerts: countCriticalForSector("turismo"),
    regulatoryBurdenScore: 76,
    recentTrend: "increasing",
    keyRegulators: ["CCAA", "Ministerio de Industria y Turismo", "Ayuntamientos"],
    topRisks: [
      "Moratoria de vivienda turística en Baleares",
      "Cuotas de plazas turísticas en Canarias",
      "Jornada laboral de 37,5 horas en hostelería",
      "Recurso TC sobre regulación de alquiler temporal",
    ],
    velocityIndex: 7.3,
    velocitySparkline: [4, 5, 6, 6, 7, 7, 8, 7, 8, 7, 7, 7],
    burdenHistory: [
      { month: "May-25", value: 65 }, { month: "Jun-25", value: 66 }, { month: "Jul-25", value: 68 },
      { month: "Ago-25", value: 69 }, { month: "Sep-25", value: 70 }, { month: "Oct-25", value: 71 },
      { month: "Nov-25", value: 72 }, { month: "Dic-25", value: 73 }, { month: "Ene-26", value: 74 },
      { month: "Feb-26", value: 75 }, { month: "Mar-26", value: 76 }, { month: "Abr-26", value: 76 },
    ],
    fragmentationIndex: 92,
    sandboxActive: false,
  },
  {
    id: "defensa",
    label: "Defensa y Seguridad",
    description: "Contratación militar, ciberseguridad, infraestructura crítica y seguridad nacional.",
    activeAlerts: countAlertsForSector("defensa"),
    criticalAlerts: countCriticalForSector("defensa"),
    regulatoryBurdenScore: 58,
    recentTrend: "increasing",
    keyRegulators: ["Ministerio de Defensa", "CNI", "DSN", "OTAN"],
    topRisks: [
      "Requisitos del EU Chips Act para soberanía tecnológica",
      "Directiva CER de resiliencia de entidades críticas",
      "Aumento del gasto en defensa al 2% PIB",
    ],
    velocityIndex: 4.2,
    velocitySparkline: [3, 3, 4, 4, 4, 5, 4, 4, 5, 4, 4, 4],
    burdenHistory: [
      { month: "May-25", value: 50 }, { month: "Jun-25", value: 51 }, { month: "Jul-25", value: 52 },
      { month: "Ago-25", value: 52 }, { month: "Sep-25", value: 53 }, { month: "Oct-25", value: 54 },
      { month: "Nov-25", value: 55 }, { month: "Dic-25", value: 56 }, { month: "Ene-26", value: 57 },
      { month: "Feb-26", value: 57 }, { month: "Mar-26", value: 58 }, { month: "Abr-26", value: 58 },
    ],
    fragmentationIndex: 15,
    sandboxActive: false,
  },
  {
    id: "medio-ambiente",
    label: "Medio Ambiente",
    description: "Protección ambiental, residuos, aguas, biodiversidad, cambio climático y economía circular.",
    activeAlerts: countAlertsForSector("medio-ambiente"),
    criticalAlerts: countCriticalForSector("medio-ambiente"),
    regulatoryBurdenScore: 78,
    recentTrend: "increasing",
    keyRegulators: ["MITECO", "Confederaciones Hidrográficas", "OECC", "Comisión Europea"],
    topRisks: [
      "Emergencia hídrica en cuenca del Segura",
      "Procedimiento de infracción UE por calidad del aire",
      "Moratoria urbanística en zonas inundables",
      "Endurecimiento penal de delitos medioambientales",
    ],
    velocityIndex: 7.1,
    velocitySparkline: [5, 6, 6, 7, 7, 7, 8, 7, 7, 8, 7, 7],
    burdenHistory: [
      { month: "May-25", value: 68 }, { month: "Jun-25", value: 69 }, { month: "Jul-25", value: 70 },
      { month: "Ago-25", value: 71 }, { month: "Sep-25", value: 72 }, { month: "Oct-25", value: 73 },
      { month: "Nov-25", value: 74 }, { month: "Dic-25", value: 75 }, { month: "Ene-26", value: 76 },
      { month: "Feb-26", value: 77 }, { month: "Mar-26", value: 78 }, { month: "Abr-26", value: 78 },
    ],
    fragmentationIndex: 75,
    sandboxActive: false,
  },
  {
    id: "sanidad",
    label: "Sanidad",
    description: "Sistema Nacional de Salud, salud digital, telemedicina y regulación sanitaria.",
    activeAlerts: countAlertsForSector("sanidad"),
    criticalAlerts: countCriticalForSector("sanidad"),
    regulatoryBurdenScore: 70,
    recentTrend: "stable",
    keyRegulators: ["Ministerio de Sanidad", "AEMPS", "AESIA", "CCAA (Consejerías de Salud)"],
    topRisks: [
      "Regulación de IA en diagnóstico y decisiones clínicas",
      "Telemedicina: nuevos requisitos de ciberseguridad",
      "Interoperabilidad de historia clínica digital",
      "Impacto de financiación autonómica en presupuestos sanitarios",
    ],
    velocityIndex: 5.5,
    velocitySparkline: [4, 5, 5, 5, 6, 5, 6, 5, 5, 6, 6, 6],
    burdenHistory: [
      { month: "May-25", value: 65 }, { month: "Jun-25", value: 66 }, { month: "Jul-25", value: 66 },
      { month: "Ago-25", value: 67 }, { month: "Sep-25", value: 67 }, { month: "Oct-25", value: 68 },
      { month: "Nov-25", value: 68 }, { month: "Dic-25", value: 69 }, { month: "Ene-26", value: 69 },
      { month: "Feb-26", value: 70 }, { month: "Mar-26", value: 70 }, { month: "Abr-26", value: 70 },
    ],
    fragmentationIndex: 85,
    sandboxActive: false,
  },
  {
    id: "educacion",
    label: "Educación",
    description: "Sistema educativo, universidades, formación profesional e investigación.",
    activeAlerts: countAlertsForSector("educacion"),
    criticalAlerts: countCriticalForSector("educacion"),
    regulatoryBurdenScore: 52,
    recentTrend: "stable",
    keyRegulators: ["Ministerio de Educación", "Ministerio de Ciencia", "CCAA", "ANECA"],
    topRisks: [
      "Regulación de IA en contexto educativo (AI Act)",
      "Impacto de financiación autonómica en presupuestos educativos",
      "Transparencia salarial en universidades públicas",
    ],
    velocityIndex: 3.4,
    velocitySparkline: [3, 3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3],
    burdenHistory: [
      { month: "May-25", value: 48 }, { month: "Jun-25", value: 48 }, { month: "Jul-25", value: 49 },
      { month: "Ago-25", value: 49 }, { month: "Sep-25", value: 50 }, { month: "Oct-25", value: 50 },
      { month: "Nov-25", value: 51 }, { month: "Dic-25", value: 51 }, { month: "Ene-26", value: 51 },
      { month: "Feb-26", value: 52 }, { month: "Mar-26", value: 52 }, { month: "Abr-26", value: 52 },
    ],
    fragmentationIndex: 90,
    sandboxActive: false,
  },
  {
    id: "general",
    label: "Transversal / General",
    description: "Normativa de aplicación transversal a todos los sectores económicos.",
    activeAlerts: countAlertsForSector("general"),
    criticalAlerts: countCriticalForSector("general"),
    regulatoryBurdenScore: 75,
    recentTrend: "increasing",
    keyRegulators: ["Gobierno de España", "Cortes Generales", "Tribunal Constitucional", "Comisión Europea"],
    topRisks: [
      "Jornada laboral de 37,5 horas — impacto en costes",
      "Transparencia salarial obligatoria",
      "AI Act y Data Act de aplicación transversal",
      "Identidad digital europea eIDAS 2.0",
    ],
    velocityIndex: 7.0,
    velocitySparkline: [5, 6, 6, 7, 7, 7, 8, 7, 7, 7, 7, 7],
    burdenHistory: [
      { month: "May-25", value: 66 }, { month: "Jun-25", value: 67 }, { month: "Jul-25", value: 68 },
      { month: "Ago-25", value: 69 }, { month: "Sep-25", value: 70 }, { month: "Oct-25", value: 71 },
      { month: "Nov-25", value: 72 }, { month: "Dic-25", value: 73 }, { month: "Ene-26", value: 73 },
      { month: "Feb-26", value: 74 }, { month: "Mar-26", value: 75 }, { month: "Abr-26", value: 75 },
    ],
    fragmentationIndex: 45,
    sandboxActive: false,
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   REGULATORY TIMELINES — major legislative processes
   ══════════════════════════════════════════════════════════════════════════ */

const timelines: RegulatoryTimeline[] = [
  {
    id: "tl-001",
    title: "AI Act — Implementación completa en España",
    events: [
      { date: "2024-06-13", label: "Publicación en DOUE", type: "publicacion", completed: true },
      { date: "2024-08-01", label: "Entrada en vigor del Reglamento", type: "entrada-vigor", completed: true },
      { date: "2025-02-02", label: "Prohibición de prácticas de IA inaceptables", type: "deadline", completed: true },
      { date: "2025-08-02", label: "Obligaciones de modelos de propósito general", type: "deadline", completed: true },
      { date: "2026-03-28", label: "RD español de desarrollo (AESIA)", type: "aprobacion", completed: true },
      { date: "2026-08-02", label: "Obligaciones para sistemas de alto riesgo", type: "deadline", completed: false },
      { date: "2027-08-02", label: "Aplicación completa de todas las disposiciones", type: "deadline", completed: false },
    ],
  },
  {
    id: "tl-002",
    title: "Reducción de jornada laboral a 37,5 horas",
    events: [
      { date: "2024-02-12", label: "Acuerdo de coalición PSOE-Sumar", type: "publicacion", completed: true },
      { date: "2025-06-15", label: "Inicio de negociación con agentes sociales", type: "consulta", completed: true },
      { date: "2025-11-20", label: "Acuerdo con sindicatos (sin patronal)", type: "consulta", completed: true },
      { date: "2026-01-14", label: "Aprobación en Consejo de Ministros como PL", type: "aprobacion", completed: true },
      { date: "2026-03-05", label: "Debate y aprobación en Comisión de Trabajo", type: "tramite", completed: true },
      { date: "2026-05-15", label: "Votación en Pleno del Congreso (prevista)", type: "tramite", completed: false },
      { date: "2026-06-30", label: "Tramitación en Senado (estimada)", type: "tramite", completed: false },
      { date: "2026-12-31", label: "Entrada en vigor prevista", type: "entrada-vigor", completed: false },
    ],
  },
  {
    id: "tl-003",
    title: "Regulación de vivienda turística — Baleares",
    events: [
      { date: "2025-09-01", label: "Anuncio del Govern de Baleares", type: "publicacion", completed: true },
      { date: "2025-11-15", label: "Consulta pública previa", type: "consulta", completed: true },
      { date: "2026-01-20", label: "Dictamen del Consell Consultiu", type: "tramite", completed: true },
      { date: "2026-03-15", label: "Aprobación del Decreto", type: "aprobacion", completed: true },
      { date: "2026-06-01", label: "Entrada en vigor", type: "entrada-vigor", completed: false },
      { date: "2026-12-31", label: "Fecha límite adaptación plataformas", type: "deadline", completed: false },
    ],
  },
  {
    id: "tl-004",
    title: "Transposición CSRD — reporting ESG obligatorio",
    events: [
      { date: "2022-12-14", label: "Adopción de la Directiva CSRD", type: "publicacion", completed: true },
      { date: "2024-07-06", label: "Plazo de transposición (incumplido)", type: "deadline", completed: true },
      { date: "2025-01-30", label: "Carta de emplazamiento de la Comisión", type: "tramite", completed: true },
      { date: "2026-01-22", label: "Orden ministerial de transposición parcial", type: "aprobacion", completed: true },
      { date: "2026-04-08", label: "Dictamen motivado de la Comisión", type: "tramite", completed: true },
      { date: "2026-09-30", label: "Fecha límite para evitar recurso TJUE (estimada)", type: "deadline", completed: false },
      { date: "2026-12-31", label: "Primer ejercicio de reporting obligatorio", type: "deadline", completed: false },
    ],
  },
  {
    id: "tl-005",
    title: "Regulación de criptoactivos (MiCA + nacional)",
    events: [
      { date: "2023-06-29", label: "Publicación del Reglamento MiCA", type: "publicacion", completed: true },
      { date: "2024-06-30", label: "Aplicación parcial (stablecoins)", type: "entrada-vigor", completed: true },
      { date: "2024-12-30", label: "Aplicación completa de MiCA", type: "entrada-vigor", completed: true },
      { date: "2026-01-15", label: "Circular BdE sobre requisitos de capital", type: "aprobacion", completed: true },
      { date: "2026-02-12", label: "Orden sobre publicidad de criptoactivos", type: "aprobacion", completed: true },
      { date: "2026-02-20", label: "RD de adaptación al ordenamiento español", type: "aprobacion", completed: true },
      { date: "2026-06-30", label: "Fecha límite de autorización de exchanges", type: "deadline", completed: false },
    ],
  },
  {
    id: "tl-006",
    title: "Identidad digital europea (eIDAS 2.0)",
    events: [
      { date: "2024-04-11", label: "Publicación del Reglamento eIDAS 2.0", type: "publicacion", completed: true },
      { date: "2024-11-20", label: "Especificaciones técnicas de la cartera", type: "tramite", completed: true },
      { date: "2025-06-01", label: "Pilotos de gran escala (LSPs)", type: "tramite", completed: true },
      { date: "2026-02-01", label: "España inicia desarrollo de app de identidad", type: "tramite", completed: true },
      { date: "2026-11-01", label: "Carteras digitales disponibles para ciudadanos", type: "entrada-vigor", completed: false },
      { date: "2027-05-01", label: "Obligación de aceptación por servicios esenciales", type: "deadline", completed: false },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   BUILD RADAR DATA
   ══════════════════════════════════════════════════════════════════════════ */

function computeStats(alertList: RegulatoryAlert[]): RadarData["stats"] {
  const now = new Date("2026-04-10");
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const bySource = Object.fromEntries(
    (["boe", "eurlex", "congreso", "senado", "cnmc", "tc", "ccaa-boletin", "bde", "aepd"] as SourceType[]).map(
      (s) => [s, alertList.filter((a) => a.source === s).length]
    )
  ) as Record<SourceType, number>;

  const allSectors: SectorId[] = [
    "banca", "energia", "telecom", "pharma", "inmobiliario", "tecnologia",
    "agroalimentario", "transporte", "turismo", "defensa", "medio-ambiente",
    "sanidad", "educacion", "general",
  ];
  const bySector = Object.fromEntries(
    allSectors.map((s) => [s, alertList.filter((a) => a.sectors.includes(s)).length])
  ) as Record<SectorId, number>;

  const pendingDeadlines = alertList.filter((a) => {
    if (!a.complianceDeadline) return false;
    return new Date(a.complianceDeadline) > now;
  }).length;

  return {
    totalAlerts: alertList.length,
    criticalCount: alertList.filter((a) => a.impactLevel === "critico").length,
    bySource,
    bySector,
    last30Days: alertList.filter((a) => new Date(a.publishDate) >= thirtyDaysAgo).length,
    pendingDeadlines,
  };
}

const comparativeStats: ComparativeStats[] = [
  { metric: "Normas publicadas (anual)", spain: 12847, euAvg: 9320, unit: "" },
  { metric: "Tiempo medio de transposición UE", spain: 18.5, euAvg: 14.2, unit: "meses" },
  { metric: "Carga regulatoria (Doing Business)", spain: 72, euAvg: 78, unit: "/100" },
  { metric: "Procedimientos administrativos", spain: 9, euAvg: 6, unit: "" },
  { metric: "Tiempo para crear empresa", spain: 12.5, euAvg: 8.3, unit: "días" },
  { metric: "Sandbox regulatorios activos", spain: 3, euAvg: 4.1, unit: "" },
  { metric: "Consultas públicas (2025)", spain: 142, euAvg: 215, unit: "" },
  { metric: "Índice de fragmentación CCAA", spain: 67, euAvg: 38, unit: "/100" },
];

const weeklyDigests: WeeklyDigest[] = [
  {
    week: "2026-W15",
    alerts: ["ra-001", "ra-009", "ra-013", "ra-016"],
    summary: "Semana marcada por el RDL de vivienda, el procedimiento de infracción CSRD y actividad parlamentaria intensa sobre financiación autonómica.",
  },
  {
    week: "2026-W14",
    alerts: ["ra-011", "ra-035"],
    summary: "Entrada en vigor de la transposición NIS2 y avances en la implementación de la identidad digital europea eIDAS 2.0.",
  },
  {
    week: "2026-W13",
    alerts: ["ra-002", "ra-008", "ra-034"],
    summary: "Semana clave para la regulación de IA: RD de transparencia y AI Act para alto riesgo. Avanza la reforma penal medioambiental.",
  },
  {
    week: "2026-W12",
    alerts: ["ra-014", "ra-017", "ra-027", "ra-037"],
    summary: "Vivienda y ciberseguridad dominan la agenda: ampliación de zonas tensionadas, consulta de telecom y guía AEPD sobre IA.",
  },
];

export function buildRadarData(): RadarData {
  return {
    alerts,
    sectors,
    timelines,
    stats: computeStats(alerts),
    comparativeStats,
    weeklyDigests,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   QUERY HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

export function getAlertsBySector(sector: SectorId): RegulatoryAlert[] {
  return alerts.filter((a) => a.sectors.includes(sector));
}

export function getAlertsBySource(source: SourceType): RegulatoryAlert[] {
  return alerts.filter((a) => a.source === source);
}

export function getCriticalAlerts(): RegulatoryAlert[] {
  return alerts.filter((a) => a.impactLevel === "critico");
}

export function getUpcomingDeadlines(days: number): RegulatoryAlert[] {
  const now = new Date("2026-04-10");
  const future = new Date(now);
  future.setDate(future.getDate() + days);

  return alerts.filter((a) => {
    if (!a.complianceDeadline) return false;
    const deadline = new Date(a.complianceDeadline);
    return deadline >= now && deadline <= future;
  });
}

export function getSectorProfile(sector: SectorId): SectorProfile | undefined {
  return sectors.find((s) => s.id === sector);
}

/* ══════════════════════════════════════════════════════════════════════════
   CROSS-REFERENCES — helpers that leverage seed-data and eurlex-data
   ══════════════════════════════════════════════════════════════════════════ */

/** Returns BOE items from seed-data that relate to regulatory alerts by keyword matching. */
export function getRelatedBoeItems(alertId: string) {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return [];
  const keywords = alert.tags.map((t) => t.toLowerCase());
  return boeItems.filter((item) =>
    keywords.some(
      (kw) =>
        item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw)
    )
  );
}

/** Returns EU legislation from eurlex-data that is referenced in a regulatory alert. */
export function getRelatedEuLegislation(alertId: string) {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert || !alert.affectedRegulations) return [];
  return euLegislation.filter((leg) =>
    alert.affectedRegulations!.some(
      (ref) =>
        leg.title.toLowerCase().includes(ref.toLowerCase()) ||
        ref.toLowerCase().includes(leg.celex.toLowerCase())
    )
  );
}

/** Returns featured signals from seed-data that overlap with a sector's regulatory landscape. */
export function getSignalsForSector(sector: SectorId) {
  const sectorKeywords: Record<SectorId, string[]> = {
    banca: ["financ", "banc", "cripto", "capital"],
    energia: ["energ", "descarboniz", "renovab", "gas"],
    telecom: ["telecom", "digital", "5g", "fibra"],
    pharma: ["farmac", "medicament", "sanitar"],
    inmobiliario: ["vivienda", "alquiler", "urbanís"],
    tecnologia: ["IA", "inteligencia artificial", "digital", "datos", "ciber"],
    agroalimentario: ["agri", "agro", "alimenta", "PAC", "riego"],
    transporte: ["transport", "ferrocarril", "logíst", "AVE"],
    turismo: ["turism", "hotel", "vacacion"],
    defensa: ["defensa", "militar", "seguridad nacional"],
    "medio-ambiente": ["ambiental", "clima", "residuo", "agua"],
    sanidad: ["sanidad", "salud", "hospital"],
    educacion: ["educa", "universidad", "formación"],
    general: ["presupuest", "financiación autonómica", "laboral"],
  };

  const keywords = sectorKeywords[sector] ?? [];
  return featuredSignals.filter((signal) =>
    keywords.some(
      (kw) =>
        signal.title.toLowerCase().includes(kw.toLowerCase()) ||
        signal.summary.toLowerCase().includes(kw.toLowerCase())
    )
  );
}
