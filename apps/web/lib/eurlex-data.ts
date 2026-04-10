/* ═══════════════════════════════════════════════════════════════════════════
   EUR-Lex — EU regulations, directives, transpositions and infringements.
   Based on EUR-Lex SPARQL/API and European Commission data (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

export type LegislationType = "reglamento" | "directiva" | "decision" | "recomendacion";
export type TranspositionStatus = "transpuesta" | "en-plazo" | "retrasada" | "incumplimiento";
export type InfringementStage = "carta-emplazamiento" | "dictamen-motivado" | "recurso-tjue" | "sentencia" | "archivado";

export interface EuLegislation {
  id: string;
  celex: string;
  title: string;
  summary: string;
  type: LegislationType;
  adoptionDate: string;
  transpositionDeadline?: string;
  transpositionStatus?: TranspositionStatus;
  spanishTranspositionDate?: string;
  spanishTranspositionRef?: string;
  sector: string;
  impactOnSpain: string;
  sourceUrl: string;
  tags: string[];
}

export interface InfringementProcedure {
  id: string;
  caseNumber: string;
  directive?: string;
  subject: string;
  summary: string;
  stage: InfringementStage;
  openedDate: string;
  lastUpdateDate: string;
  sector: string;
  potentialFineM?: number;
  sourceUrl: string;
}

export const legislationTypeLabels: Record<LegislationType, string> = {
  reglamento: "Reglamento",
  directiva: "Directiva",
  decision: "Decisión",
  recomendacion: "Recomendación",
};

export const legislationTypeColors: Record<LegislationType, string> = {
  reglamento: "#003399",
  directiva: "#c8102e",
  decision: "#f1bf00",
  recomendacion: "#009b3a",
};

export const transpositionStatusLabels: Record<TranspositionStatus, string> = {
  transpuesta: "Transpuesta",
  "en-plazo": "En plazo",
  retrasada: "Retrasada",
  incumplimiento: "Incumplimiento",
};

export const transpositionStatusColors: Record<TranspositionStatus, string> = {
  transpuesta: "#009b3a",
  "en-plazo": "#003da5",
  retrasada: "#f1bf00",
  incumplimiento: "#c8102e",
};

export const infringementStageLabels: Record<InfringementStage, string> = {
  "carta-emplazamiento": "Carta de emplazamiento",
  "dictamen-motivado": "Dictamen motivado",
  "recurso-tjue": "Recurso ante el TJUE",
  sentencia: "Sentencia",
  archivado: "Archivado",
};

/* ══════════════════════════════════════════════════════════════════════════
   KEY EU LEGISLATION AFFECTING SPAIN
   ══════════════════════════════════════════════════════════════════════════ */

export const euLegislation: EuLegislation[] = [
  {
    id: "eul-001",
    celex: "32024R1689",
    title: "Reglamento de Inteligencia Artificial (AI Act)",
    summary: "Marco regulatorio europeo para IA. Clasifica sistemas por riesgo: prohibidos, alto riesgo, riesgo limitado y mínimo.",
    type: "reglamento",
    adoptionDate: "2024-06-13",
    sector: "Digital y tecnología",
    impactOnSpain: "Aplicación directa. España ya lidera con la AESIA como primera agencia de supervisión de IA en la UE. Afecta a sector público, sanidad, educación y justicia.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["IA", "regulación digital", "tecnología"],
  },
  {
    id: "eul-002",
    celex: "32022L2464",
    title: "Directiva de Informes de Sostenibilidad Corporativa (CSRD)",
    summary: "Obligación de reporting ESG para grandes empresas y cotizadas. Auditoría externa de la información de sostenibilidad.",
    type: "directiva",
    adoptionDate: "2022-12-14",
    transpositionDeadline: "2024-07-06",
    transpositionStatus: "retrasada",
    sector: "Empresa y mercados",
    impactOnSpain: "Afecta a ~1.500 empresas españolas cotizadas y de gran tamaño. Anteproyecto de ley aprobado en Consejo de Ministros pero pendiente en Cortes.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["sostenibilidad", "ESG", "empresas"],
  },
  {
    id: "eul-003",
    celex: "32023L1791",
    title: "Directiva de Eficiencia Energética (refundición)",
    summary: "Objetivo vinculante de reducción del consumo energético del 11,7% para 2030. Renovación de edificios públicos al 3% anual.",
    type: "directiva",
    adoptionDate: "2023-09-13",
    transpositionDeadline: "2025-10-11",
    transpositionStatus: "en-plazo",
    sector: "Energía y clima",
    impactOnSpain: "Plan Nacional de Rehabilitación de Edificios con fondos NGEU. España debe renovar 400.000 viviendas/año.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["energía", "eficiencia", "edificios", "clima"],
  },
  {
    id: "eul-004",
    celex: "32024R0903",
    title: "Reglamento Europeo de Chips (EU Chips Act)",
    summary: "Moviliza 43.000 M€ para fortalecer la industria de semiconductores en Europa. Objetivo: 20% producción mundial en 2030.",
    type: "reglamento",
    adoptionDate: "2023-09-21",
    sector: "Industria y tecnología",
    impactOnSpain: "PERTE Chip dotado con 12.400 M€. Fábricas previstas en Cataluña, Aragón y Madrid.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["chips", "semiconductores", "industria"],
  },
  {
    id: "eul-005",
    celex: "32022R2065",
    title: "Reglamento de Servicios Digitales (DSA)",
    summary: "Obligaciones de moderación de contenidos para plataformas digitales. Transparencia en algoritmos y publicidad.",
    type: "reglamento",
    adoptionDate: "2022-10-19",
    sector: "Digital y tecnología",
    impactOnSpain: "Aplicación directa desde febrero 2024. CNMC designada como coordinador de servicios digitales.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["plataformas", "contenidos", "digital"],
  },
  {
    id: "eul-006",
    celex: "32023L0970",
    title: "Directiva de transparencia salarial",
    summary: "Obligación de publicar bandas salariales en ofertas de empleo. Derecho a conocer salarios medios por género.",
    type: "directiva",
    adoptionDate: "2023-05-10",
    transpositionDeadline: "2026-06-07",
    transpositionStatus: "en-plazo",
    sector: "Empleo e igualdad",
    impactOnSpain: "Afecta a empresas >100 trabajadores. Complementa el RD 902/2020 de igualdad retributiva ya vigente.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["igualdad", "salarios", "transparencia"],
  },
  {
    id: "eul-007",
    celex: "32024L1760",
    title: "Directiva de Diligencia Debida en materia de sostenibilidad (CS3D)",
    summary: "Las grandes empresas deben prevenir impactos negativos en derechos humanos y medio ambiente en toda su cadena de valor.",
    type: "directiva",
    adoptionDate: "2024-07-05",
    transpositionDeadline: "2026-07-26",
    transpositionStatus: "en-plazo",
    sector: "Empresa y derechos humanos",
    impactOnSpain: "Afecta inicialmente a empresas >1.000 empleados y >450 M€ facturación. Sector agroalimentario y textil especialmente impactados.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["derechos humanos", "cadena de valor", "empresas"],
  },
  {
    id: "eul-008",
    celex: "32023R1115",
    title: "Reglamento contra la Deforestación (EUDR)",
    summary: "Prohíbe importar a la UE productos vinculados a deforestación: soja, carne, aceite de palma, madera, café, cacao, caucho.",
    type: "reglamento",
    adoptionDate: "2023-06-09",
    sector: "Medioambiente y comercio",
    impactOnSpain: "Impacto en industria agroalimentaria, importadores de commodities y sector ganadero. Sistema de diligencia debida obligatorio.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["deforestación", "comercio", "medioambiente"],
  },
  {
    id: "eul-009",
    celex: "32024L1640",
    title: "Directiva contra el blanqueo de capitales (AMLD6)",
    summary: "Refuerzo de la regulación antiblanqueo: registros de titularidad real, supervisión de criptoactivos y nuevos sujetos obligados.",
    type: "directiva",
    adoptionDate: "2024-05-30",
    transpositionDeadline: "2027-07-10",
    transpositionStatus: "en-plazo",
    sector: "Finanzas y regulación",
    impactOnSpain: "Requiere actualizar la Ley 10/2010 de Prevención del Blanqueo. SEPBLAC se reforzará como unidad de inteligencia financiera.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["blanqueo", "finanzas", "regulación"],
  },
  {
    id: "eul-010",
    celex: "32023R2405",
    title: "Reglamento de Restauración de la Naturaleza",
    summary: "Objetivos vinculantes para restaurar el 20% de ecosistemas terrestres y marinos degradados para 2030.",
    type: "reglamento",
    adoptionDate: "2024-06-17",
    sector: "Medioambiente",
    impactOnSpain: "España tiene el 30% de hábitats Natura 2000 en estado desfavorable. Plan Nacional de Restauración requerido para 2026.",
    sourceUrl: "https://eur-lex.europa.eu",
    tags: ["biodiversidad", "restauración", "naturaleza"],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   INFRINGEMENT PROCEDURES AGAINST SPAIN
   ══════════════════════════════════════════════════════════════════════════ */

export const infringementProcedures: InfringementProcedure[] = [
  {
    id: "inf-001",
    caseNumber: "INFR(2024)2048",
    directive: "Directiva (UE) 2019/1937 (Protección de denunciantes)",
    subject: "Retraso en la transposición de la Directiva de protección de denunciantes",
    summary: "España transpuso tarde (Ley 2/2023) pero la Comisión mantiene el procedimiento por deficiencias en la protección del canal interno.",
    stage: "dictamen-motivado",
    openedDate: "2022-01-27",
    lastUpdateDate: "2025-11-14",
    sector: "Justicia y derechos fundamentales",
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
  },
  {
    id: "inf-002",
    caseNumber: "INFR(2023)4062",
    directive: "Directiva 2011/92/UE (Evaluación impacto ambiental)",
    subject: "Insuficiente evaluación ambiental de proyectos urbanísticos en zonas costeras",
    summary: "Deficiencias en la aplicación de la EIA en desarrollos turísticos en Baleares, Canarias y Costa del Sol.",
    stage: "carta-emplazamiento",
    openedDate: "2023-09-28",
    lastUpdateDate: "2025-06-20",
    sector: "Medioambiente",
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
  },
  {
    id: "inf-003",
    caseNumber: "INFR(2022)2152",
    directive: "Directiva 91/271/CEE (Tratamiento aguas residuales)",
    subject: "Incumplimiento del tratamiento de aguas residuales urbanas",
    summary: "46 aglomeraciones urbanas españolas incumplen las normas de depuración. Sentencia C-343/22 del TJUE.",
    stage: "sentencia",
    openedDate: "2019-04-25",
    lastUpdateDate: "2025-12-10",
    sector: "Medioambiente",
    potentialFineM: 48.6,
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
  },
  {
    id: "inf-004",
    caseNumber: "INFR(2025)0184",
    directive: "Directiva (UE) 2022/2464 (CSRD)",
    subject: "No transposición de la Directiva de información sobre sostenibilidad corporativa",
    summary: "España no ha transpuesto la CSRD dentro del plazo (julio 2024). Anteproyecto de ley todavía en tramitación parlamentaria.",
    stage: "carta-emplazamiento",
    openedDate: "2025-01-30",
    lastUpdateDate: "2026-04-08",
    sector: "Empresa y mercados",
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
  },
  {
    id: "inf-005",
    caseNumber: "INFR(2021)2204",
    directive: "Directiva 2008/50/CE (Calidad del aire)",
    subject: "Superación de los valores límite de NO₂ en Madrid y Barcelona",
    summary: "Procedimiento por contaminación persistente de dióxido de nitrógeno en zonas urbanas. Zonas de bajas emisiones implantadas pero insuficientes.",
    stage: "recurso-tjue",
    openedDate: "2021-11-12",
    lastUpdateDate: "2026-02-20",
    sector: "Medioambiente",
    potentialFineM: 32.4,
    sourceUrl: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   AGGREGATE STATS
   ══════════════════════════════════════════════════════════════════════════ */

export const transpositionSummary = {
  totalDirectives: euLegislation.filter((l) => l.type === "directiva").length,
  transpuestas: euLegislation.filter((l) => l.transpositionStatus === "transpuesta").length,
  enPlazo: euLegislation.filter((l) => l.transpositionStatus === "en-plazo").length,
  retrasadas: euLegislation.filter((l) => l.transpositionStatus === "retrasada").length,
  incumplimiento: euLegislation.filter((l) => l.transpositionStatus === "incumplimiento").length,
};

export const infringementSummary = {
  total: infringementProcedures.length,
  activos: infringementProcedures.filter((i) => i.stage !== "archivado").length,
  conMultaPotencial: infringementProcedures.filter((i) => i.potentialFineM).length,
  multaTotalPotencialM: infringementProcedures.reduce((s, i) => s + (i.potentialFineM ?? 0), 0),
};

export function getLegislationBySector(sector: string): EuLegislation[] {
  return euLegislation.filter((l) => l.sector === sector);
}

export function getPendingTranspositions(): EuLegislation[] {
  return euLegislation.filter(
    (l) => l.transpositionStatus && l.transpositionStatus !== "transpuesta"
  );
}
