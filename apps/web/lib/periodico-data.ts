/* ═══════════════════════════════════════════════════════════════════════════
   El Periódico de IAÑ — News data layer
   "Datos, no ideología. Soluciones, no promesas."
   Generated articles from the perspective of the fictional party Partido IAÑ,
   a data-driven, evidence-based political party.
   Seed date: 2026-04-10
   ═══════════════════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ArticleCategory =
  | "politica"
  | "economia"
  | "sociedad"
  | "europa"
  | "tecnologia"
  | "territorio";

export type Severity = "alto" | "medio" | "bajo";

export type PartyPosition =
  | "a-favor"
  | "en-contra"
  | "abstención"
  | "dividido";

export type FactCheckVerdict =
  | "verdadero"
  | "mayormente-verdadero"
  | "mixto"
  | "engañoso"
  | "falso";

export type Importance = "portada" | "alta" | "media" | "breve";

export interface Blocker {
  actor: string;
  reason: string;
  severity: Severity;
}

export interface PartyReaction {
  party: string;
  color: string;
  position: PartyPosition;
  statement: string;
  probabilityAgree: number;
}

export interface ProCon {
  point: string;
  source: string;
}

export interface Source {
  name: string;
  url: string;
}

export interface FactCheck {
  claim: string;
  verdict: FactCheckVerdict;
  explanation: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  subheadline: string;
  category: ArticleCategory;
  date: string;
  author: string;
  summary: string;
  body: string[];
  ianProposal: string;
  ianQuote: string;
  blockers: Blocker[];
  partyReactions: PartyReaction[];
  benefitScore: number;
  benefitAnalysis: string;
  pros: ProCon[];
  cons: ProCon[];
  sources: Source[];
  readingTimeMin: number;
  importance: Importance;
  tags: string[];
  relatedArticles: string[];
  factCheck: FactCheck[];
}

export interface EditorialNote {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  disclaimer: string;
}

export interface BreakingNews {
  id: string;
  headline: string;
  date: string;
  articleId: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  count: number;
}

export interface PeriodicoStats {
  totalArticles: number;
  avgBenefitScore: number;
  partiesAnalyzed: number;
  sourcesReferenced: number;
  lastUpdated: string;
}

export interface PeriodicoData {
  articles: NewsArticle[];
  editorials: EditorialNote[];
  breakingNews: BreakingNews[];
  categories: CategoryInfo[];
  stats: PeriodicoStats;
  methodology: string;
}

// ---------------------------------------------------------------------------
// Party colour map (for partyReactions)
// ---------------------------------------------------------------------------

const PARTY_COLORS = {
  PSOE: "#e30613",
  PP: "#0056a0",
  VOX: "#63be21",
  Sumar: "#e5007e",
  PNV: "#e41d13",
  ERC: "#ffb232",
  Junts: "#00c4b3",
  EHBildu: "#7a2182",
  BNG: "#76b6de",
  CCa: "#ffcb05",
  IAÑ: "#1e88e5",
} as const;

// ---------------------------------------------------------------------------
// Legislative proposals reference
// ---------------------------------------------------------------------------

export const IAN_PROPOSALS = {
  empleoGarantizado:
    "Ley de Empleo Garantizado — Convertir subsidios pasivos en empleo activo, reducir desempleo del 11,2% al 7%",
  estabilidadPresupuestaria:
    "Reforma Estabilidad Presupuestaria — Permitir inversión productiva alineada con reglas fiscales UE, ejecutar 100% NGEU",
  transparencia:
    "Ley de Transparencia 2.0 — Datos de gasto público en tiempo real, dashboard de rendición de cuentas automático",
  cohesionTerritorial:
    "Ley de Cohesión Territorial — Fondo de emergencia para 8 CCAA críticas (Extremadura, Canarias, Murcia, etc.)",
  vivienda:
    "Reforma Mercado Vivienda — Topes al alquiler, incentivos fiscales, 100.000 viviendas públicas/año",
  aceleracionNGEU:
    "Ley Aceleración NGEU — Ventanilla única para fondos UE, adjudicación máxima 60 días",
  fraudeFiscal:
    "Ley Lucha contra Fraude Fiscal — 5.000 nuevos inspectores, recuperar 15.000M€/año",
  reindustrializacion:
    "Ley Reindustrialización Estratégica — Semiconductores, renovables, biotech, I+D al 3% PIB",
} as const;

// ---------------------------------------------------------------------------
// Shared party reaction templates (base — articles override as needed)
// ---------------------------------------------------------------------------

function psoe(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "PSOE",
    color: PARTY_COLORS.PSOE,
    position,
    statement,
    probabilityAgree: prob,
  };
}
function pp(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "PP",
    color: PARTY_COLORS.PP,
    position,
    statement,
    probabilityAgree: prob,
  };
}
function vox(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "VOX",
    color: PARTY_COLORS.VOX,
    position,
    statement,
    probabilityAgree: prob,
  };
}
function sumar(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "Sumar",
    color: PARTY_COLORS.Sumar,
    position,
    statement,
    probabilityAgree: prob,
  };
}
function pnv(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "PNV",
    color: PARTY_COLORS.PNV,
    position,
    statement,
    probabilityAgree: prob,
  };
}
function erc(
  position: PartyPosition,
  statement: string,
  prob: number,
): PartyReaction {
  return {
    party: "ERC",
    color: PARTY_COLORS.ERC,
    position,
    statement,
    probabilityAgree: prob,
  };
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const articles: NewsArticle[] = [
  // ── 1. PORTADA — Fraude fiscal ──────────────────────────────────────────
  {
    id: "art-001-fraude-fiscal",
    headline:
      "España pierde 70.000M€ al año en fraude fiscal: IAÑ propone 5.000 inspectores",
    subheadline:
      "La economía sumergida representa el 20% del PIB según estimaciones del FMI y la AEAT",
    category: "economia",
    date: "2026-04-10",
    author: "Redacción El Periódico de IAÑ",
    summary:
      "El fraude fiscal en España asciende a unos 70.000 millones de euros anuales, según estimaciones cruzadas de la AEAT, el Banco de España y el FMI. La cifra equivale al presupuesto combinado de Sanidad y Educación. El Partido IAÑ ha presentado un plan para contratar 5.000 nuevos inspectores tributarios en tres años con el objetivo de recuperar 15.000 millones anuales adicionales para las arcas públicas.",
    body: [
      "La Agencia Tributaria calcula que la brecha fiscal —la diferencia entre lo que se debería recaudar y lo que efectivamente se recauda— se sitúa en torno al 6% del PIB. Los informes del Banco de España y del Fondo Monetario Internacional elevan la estimación de la economía sumergida hasta el 20% del PIB, lo que sitúa las pérdidas totales entre 60.000 y 80.000 millones de euros.",
      "En la actualidad, España cuenta con aproximadamente 25.000 empleados en la AEAT, de los cuales unos 5.400 son inspectores y técnicos de Hacienda. La ratio de inspectores por habitante es inferior a la media de la OCDE: España dispone de un inspector por cada 1.900 contribuyentes, frente al uno por cada 900 de Alemania o el uno por cada 700 de Francia.",
      "El plan legislativo propuesto contempla la incorporación escalonada de 5.000 nuevos inspectores: 2.000 en el primer año, 2.000 en el segundo y 1.000 en el tercero. El coste estimado de la medida es de 450 millones de euros anuales en salarios y formación, con un retorno proyectado de 15.000 millones al año una vez completado el despliegue.",
      "Según datos de Eurostat, España se sitúa en el puesto 21 de 27 estados miembros de la UE en eficacia recaudatoria. Países como Estonia, Dinamarca y Suecia superan ratios de cumplimiento voluntario del 95%, mientras que España se mantiene en el 86%.",
      "El Consejo General de Economistas ha señalado que la lucha contra el fraude fiscal requiere no solo más inspectores, sino una modernización tecnológica de los sistemas de cruce de datos y una mayor cooperación con las administraciones autonómicas.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Lucha contra el Fraude Fiscal: contratación de 5.000 nuevos inspectores tributarios, inversión en inteligencia artificial para detección de fraude, creación de un registro público de beneficiarios reales, y endurecimiento de penas para delitos fiscales superiores a 120.000€. Objetivo: recuperar 15.000M€/año en 3 años.",
    ianQuote:
      "«Cada euro defraudado es un euro menos para hospitales, colegios e infraestructuras. No es una cuestión ideológica, es aritmética.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Ministerio de Hacienda",
        reason:
          "Resistencia a ampliar plantilla por compromisos de estabilidad presupuestaria",
        severity: "alto",
      },
      {
        actor: "Comunidades Autónomas",
        reason:
          "Competencias compartidas en inspección tributaria dificultan coordinación",
        severity: "medio",
      },
      {
        actor: "Lobbies empresariales",
        reason: "Oposición a registro de beneficiarios reales",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "dividido",
        "Compartimos el objetivo pero ya hemos aumentado recursos de la AEAT un 12% esta legislatura.",
        0.55,
      ),
      pp(
        "en-contra",
        "La presión fiscal ya es excesiva. Hay que simplificar el sistema, no añadir más inspectores.",
        0.2,
      ),
      vox(
        "en-contra",
        "Rechazamos más burocracia estatal. La solución es bajar impuestos para eliminar el incentivo al fraude.",
        0.1,
      ),
      sumar(
        "a-favor",
        "Apoyamos la lucha contra el fraude fiscal y pedimos ampliar la medida a grandes patrimonios.",
        0.85,
      ),
      pnv(
        "abstención",
        "El País Vasco y Navarra tienen régimen foral propio; respetamos la propuesta pero no nos afecta directamente.",
        0.4,
      ),
      erc(
        "dividido",
        "Apoyamos combatir el fraude pero la inspección debe respetar las competencias autonómicas catalanas.",
        0.45,
      ),
    ],
    benefitScore: 82,
    benefitAnalysis:
      "El retorno estimado de 15.000M€ anuales sobre una inversión de 450M€ presenta una ratio coste-beneficio de 1:33. Incluso con estimaciones conservadoras (recuperación del 50% del objetivo), el beneficio neto sería de 7.000M€/año. Impacto redistributivo alto: los recursos recuperados financiarían servicios públicos universales.",
    pros: [
      {
        point:
          "Ratio coste-beneficio muy favorable: cada euro invertido genera 33€ en recaudación potencial",
        source: "AEAT — Informe Anual de Recaudación 2025",
      },
      {
        point:
          "Alineación con la media OCDE en ratio inspectores/contribuyentes",
        source: "OCDE — Tax Administration 2025",
      },
      {
        point:
          "Efecto disuasorio: la percepción de mayor control reduce el fraude voluntario un 15-20%",
        source: "Banco de España — Documento de Trabajo 2024/18",
      },
    ],
    cons: [
      {
        point:
          "Tiempo de formación de inspectores: 18-24 meses antes de ser plenamente operativos",
        source: "Instituto de Estudios Fiscales",
      },
      {
        point:
          "Riesgo de litigiosidad masiva si no se moderniza simultáneamente la justicia tributaria",
        source: "Consejo General del Poder Judicial — Memoria 2025",
      },
      {
        point:
          "El aumento de presión inspectora puede generar inseguridad jurídica en pymes si no se acompaña de clarificación normativa",
        source: "CEOE — Informe trimestral Q1 2026",
      },
    ],
    sources: [
      {
        name: "AEAT — Informe Anual de Recaudación",
        url: "https://sede.agenciatributaria.gob.es",
      },
      {
        name: "Banco de España — Economía Sumergida",
        url: "https://www.bde.es/investigador/en/menu/working_papers.html",
      },
      {
        name: "Eurostat — Taxation Trends",
        url: "https://ec.europa.eu/eurostat/web/government-finance-statistics",
      },
    ],
    readingTimeMin: 7,
    importance: "portada",
    tags: [
      "fraude fiscal",
      "AEAT",
      "inspectores",
      "recaudación",
      "economía sumergida",
    ],
    relatedArticles: [
      "art-009-presupuestos-2026",
      "art-008-deficit-reglas-fiscales",
    ],
    factCheck: [
      {
        claim:
          "España pierde 70.000M€ al año en fraude fiscal",
        verdict: "mayormente-verdadero",
        explanation:
          "Las estimaciones varían: la AEAT cifra la brecha fiscal en ~45.000M€, pero el FMI y estudios académicos elevan la cifra a 60.000-80.000M€ incluyendo economía sumergida. 70.000M€ es una estimación intermedia razonable.",
      },
      {
        claim:
          "España tiene un inspector por cada 1.900 contribuyentes",
        verdict: "verdadero",
        explanation:
          "Según datos oficiales de la AEAT y el Cuerpo Superior de Inspectores, la plantilla efectiva de inspección sitúa la ratio en aproximadamente 1:1.850-1:1.950.",
      },
      {
        claim:
          "Se pueden recuperar 15.000M€/año con 5.000 inspectores adicionales",
        verdict: "mixto",
        explanation:
          "La cifra es una proyección optimista basada en rendimientos marginales decrecientes. Estudios del IEF sugieren que el rango realista es 8.000-15.000M€ dependiendo del enfoque y los instrumentos legales disponibles.",
      },
    ],
  },

  // ── 2. PORTADA — NGEU estancado ────────────────────────────────────────
  {
    id: "art-002-ngeu-ejecucion",
    headline:
      "La ejecución NGEU se estanca en el 58%: propuesta de ventanilla única",
    subheadline:
      "España ha comprometido 81.000M€ en fondos europeos pero solo ha ejecutado efectivamente 47.000M€",
    category: "europa",
    date: "2026-04-09",
    author: "Redacción El Periódico de IAÑ",
    summary:
      "La ejecución de los fondos Next Generation EU en España se sitúa en el 58% a cierre del primer trimestre de 2026, según datos del IGAE y la Secretaría General de Fondos Europeos. De los 81.000 millones de euros comprometidos entre transferencias y préstamos, solo 47.000 millones han sido efectivamente adjudicados y ejecutados. El Partido IAÑ propone una ventanilla única con plazo máximo de 60 días para la adjudicación de proyectos.",
    body: [
      "La Intervención General de la Administración del Estado (IGAE) publicó esta semana los datos actualizados de ejecución del Plan de Recuperación, Transformación y Resiliencia. Según el informe, el ritmo de ejecución se ha desacelerado respecto a 2025, cuando se alcanzó un avance del 12% en el último trimestre.",
      "Los principales cuellos de botella identificados por la IGAE son: la complejidad administrativa de los procesos de licitación (37% de los retrasos), la falta de capacidad técnica en las administraciones autonómicas y locales (28%), y las exigencias de justificación ante la Comisión Europea (19%).",
      "Italia, con un volumen similar de fondos asignados (191.000M€), presenta una ejecución del 62%. Portugal alcanza el 71% y Grecia el 65%. España se sitúa por debajo de la media de los cuatro grandes receptores.",
      "El Tribunal de Cuentas ha señalado en su informe de fiscalización que un 14% de los fondos ejecutados presenta «deficiencias significativas» en la documentación justificativa, lo que podría derivar en correcciones financieras por parte de la Comisión.",
      "La Comisión Europea ha condicionado el desembolso del sexto tramo (10.000M€) al cumplimiento de 42 hitos reformistas, de los cuales España ha completado 34 a fecha de marzo de 2026.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Aceleración NGEU: creación de una ventanilla única digital para la gestión de fondos europeos, con plazo máximo de adjudicación de 60 días. Simplificación de requisitos documentales, creación de 200 equipos técnicos de apoyo a comunidades autónomas y ayuntamientos, y dashboard público de seguimiento en tiempo real.",
    ianQuote:
      "«Los fondos europeos son una oportunidad generacional. Cada día de retraso es dinero que no se invierte en el futuro de España.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Administraciones autonómicas",
        reason:
          "Falta de capacidad técnica y personal cualificado para gestionar proyectos complejos",
        severity: "alto",
      },
      {
        actor: "Intervención General del Estado",
        reason:
          "Requisitos de fiscalización previa ralentizan el proceso de adjudicación",
        severity: "alto",
      },
      {
        actor: "Comisión Europea",
        reason:
          "Exigencias de hitos reformistas condicionan desembolsos sucesivos",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "en-contra",
        "La ejecución avanza según el calendario acordado con Bruselas. España es el segundo mayor receptor y cumple plazos.",
        0.25,
      ),
      pp(
        "a-favor",
        "Llevamos meses denunciando la lentitud en la ejecución. Una ventanilla única simplificaría trámites.",
        0.7,
      ),
      vox(
        "en-contra",
        "Los fondos NGEU vienen con condiciones inaceptables de Bruselas. España no necesita tutela europea.",
        0.1,
      ),
      sumar(
        "a-favor",
        "Los fondos deben llegar a la economía real. Apoyamos agilizar los procesos con controles de calidad.",
        0.75,
      ),
      pnv(
        "a-favor",
        "Euskadi ha ejecutado el 72% de sus fondos asignados. Apoyamos herramientas que mejoren la gestión en otras CCAA.",
        0.65,
      ),
      erc(
        "dividido",
        "Catalunya ha ejecutado más que la media pero la ventanilla única no puede recentralizar competencias.",
        0.4,
      ),
    ],
    benefitScore: 88,
    benefitAnalysis:
      "La aceleración de la ejecución NGEU tendría impacto directo en el PIB: cada 10.000M€ ejecutados generan un impulso estimado de 0,8-1,2 puntos de PIB según el Banco de España. Completar la ejecución al 100% antes de 2028 supondría un estímulo acumulado de hasta 40.000M€ en actividad económica adicional.",
    pros: [
      {
        point:
          "Impacto directo en PIB: 0,8-1,2 puntos por cada 10.000M€ ejecutados",
        source: "Banco de España — Proyecciones Macroeconómicas 2026",
      },
      {
        point:
          "Creación de empleo: estimación de 300.000 puestos de trabajo vinculados a proyectos NGEU",
        source: "Ministerio de Economía — Plan de Recuperación",
      },
      {
        point:
          "Modernización productiva en sectores estratégicos: digitalización, energías renovables, movilidad",
        source: "Comisión Europea — Country Report Spain 2026",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de ejecución acelerada sin control de calidad: proyectos mal diseñados pueden requerir devolución de fondos",
        source: "Tribunal de Cuentas — Informe de Fiscalización PRTR 2025",
      },
      {
        point:
          "La ventanilla única requiere inversión tecnológica y coordinación interadministrativa compleja",
        source: "FEMP — Informe sobre Gestión de Fondos Europeos",
      },
      {
        point:
          "Posible conflicto competencial con CCAA que reclaman autonomía plena en la gestión de fondos",
        source: "Consejo de Estado — Dictamen 2025/127",
      },
    ],
    sources: [
      {
        name: "IGAE — Ejecución Fondos NGEU Q1 2026",
        url: "https://www.igae.pap.hacienda.gob.es",
      },
      {
        name: "Comisión Europea — Recovery and Resilience Scoreboard",
        url: "https://ec.europa.eu/economy_finance/recovery-and-resilience-scoreboard",
      },
      {
        name: "Tribunal de Cuentas — Informe PRTR",
        url: "https://www.tcu.es/tribunal-de-cuentas/es/search/informes.html",
      },
    ],
    readingTimeMin: 8,
    importance: "portada",
    tags: [
      "NGEU",
      "fondos europeos",
      "ejecución presupuestaria",
      "ventanilla única",
      "Plan de Recuperación",
    ],
    relatedArticles: [
      "art-011-ngeu-cohesion",
      "art-006-transparencia",
    ],
    factCheck: [
      {
        claim: "La ejecución NGEU se sitúa en el 58%",
        verdict: "mayormente-verdadero",
        explanation:
          "El porcentaje exacto depende de la métrica utilizada: la ejecución presupuestaria (compromisos) alcanza el 72%, pero la ejecución efectiva (pagos realizados) se sitúa en el 55-60% según el IGAE.",
      },
      {
        claim:
          "Italia ejecuta un 62% de sus fondos NGEU",
        verdict: "verdadero",
        explanation:
          "Según el Recovery and Resilience Scoreboard de la Comisión Europea, Italia ha ejecutado el 61-63% de sus fondos a febrero de 2026.",
      },
      {
        claim:
          "El 14% de los fondos ejecutados presenta deficiencias documentales",
        verdict: "mayormente-verdadero",
        explanation:
          "El Tribunal de Cuentas cifró las deficiencias significativas en un 13,7% en su último informe de fiscalización publicado en enero de 2026.",
      },
    ],
  },

  // ── 3. Desempleo juvenil ───────────────────────────────────────────────
  {
    id: "art-003-desempleo-juvenil",
    headline:
      "Desempleo juvenil al 26%: el empleo garantizado como alternativa a los subsidios",
    subheadline:
      "España lidera el desempleo juvenil en la UE por cuarto año consecutivo, solo por detrás de Grecia",
    category: "economia",
    date: "2026-04-08",
    author: "Marta Vidal — Economía",
    summary:
      "El desempleo juvenil en España se sitúa en el 26,3% según la última EPA del INE, publicada el 25 de marzo de 2026. La tasa duplica la media de la Unión Europea (11,8%) y solo Grecia (27,1%) presenta una cifra superior. El Partido IAÑ ha propuesto una Ley de Empleo Garantizado que sustituiría los subsidios pasivos por programas de empleo activo con formación integrada.",
    body: [
      "La Encuesta de Población Activa (EPA) del cuarto trimestre de 2025, publicada por el INE en marzo de 2026, sitúa la tasa de desempleo juvenil (16-24 años) en el 26,3%. La cifra supone un descenso de 1,4 puntos respecto al mismo trimestre de 2024, pero mantiene a España en los niveles más altos de la UE.",
      "El número absoluto de jóvenes desempleados se cifra en 532.000 personas. De ellos, el 38% lleva más de un año en situación de desempleo, lo que el INE clasifica como paro de larga duración. La tasa de temporalidad juvenil, aunque ha descendido tras la reforma laboral de 2022, sigue en el 42%.",
      "El gasto público en políticas pasivas de empleo (prestaciones y subsidios) alcanzó los 22.400 millones de euros en 2025, según el SEPE. Las políticas activas (formación, intermediación, incentivos a la contratación) recibieron 6.800 millones, una ratio de 3,3:1 a favor de las pasivas.",
      "Programas de empleo garantizado similares existen en Austria (Marienthal 2.0), con resultados preliminares que muestran una reducción del desempleo de larga duración del 30% en las localidades participantes, según la evaluación del Instituto de Investigación Económica de Viena (WIFO).",
      "La Autoridad Independiente de Responsabilidad Fiscal (AIReF) ha estimado que la reorientación del 15% del gasto en políticas pasivas hacia programas de empleo activo podría reducir el desempleo juvenil en 4-6 puntos porcentuales en un horizonte de tres años.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Empleo Garantizado: oferta de empleo público temporal (máximo 2 años) a todos los desempleados de larga duración menores de 30 años, con formación obligatoria en competencias digitales e industriales. Financiación: reasignación de 3.400M€ de políticas pasivas. Objetivo: reducir el desempleo juvenil del 26% al 18% en 3 años.",
    ianQuote:
      "«Ningún joven debería pasar más de un año sin empleo ni formación. El empleo garantizado no es asistencialismo: es inversión en capital humano.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "SEPE",
        reason:
          "Capacidad operativa insuficiente para gestionar programas de empleo activo a gran escala",
        severity: "alto",
      },
      {
        actor: "Sindicatos (CCOO/UGT)",
        reason:
          "Preocupación por precarización si el empleo garantizado sustituye empleo público estable",
        severity: "medio",
      },
      {
        actor: "Comunidades Autónomas",
        reason:
          "Competencias en formación profesional y empleo dificultan diseño centralizado",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "dividido",
        "La reforma laboral de 2022 ya ha reducido la temporalidad. Un programa de empleo garantizado requiere estudio de viabilidad.",
        0.45,
      ),
      pp(
        "en-contra",
        "El empleo lo crea el sector privado, no el Estado. Proponemos incentivos fiscales a la contratación juvenil.",
        0.2,
      ),
      vox(
        "en-contra",
        "El Estado no debe ser empleador de último recurso. Bajar cotizaciones sociales para menores de 30 años.",
        0.1,
      ),
      sumar(
        "a-favor",
        "El empleo garantizado es una herramienta de justicia social que llevamos en nuestro programa.",
        0.9,
      ),
      pnv(
        "abstención",
        "El modelo de formación dual vasco ya logra tasas de empleo juvenil superiores a la media. Cada territorio debe decidir su modelo.",
        0.35,
      ),
      erc(
        "a-favor",
        "Apoyamos políticas activas de empleo siempre que se transfieran íntegramente las competencias y la financiación a las comunidades.",
        0.6,
      ),
    ],
    benefitScore: 75,
    benefitAnalysis:
      "El coste neto de la medida se estima en 1.200M€ anuales (3.400M€ de inversión menos 2.200M€ de ahorro en prestaciones). El beneficio socioeconómico estimado por la AIReF incluye mayor recaudación por IRPF y cotizaciones (800M€/año) y reducción de costes sanitarios y sociales asociados al desempleo juvenil (400M€/año).",
    pros: [
      {
        point:
          "Evidencia internacional positiva: el programa Marienthal 2.0 en Austria redujo el paro de larga duración un 30%",
        source: "WIFO — Evaluación Marienthal 2.0 (2025)",
      },
      {
        point:
          "Impacto fiscal positivo a medio plazo: cada desempleado que se incorpora genera 18.000€/año en cotizaciones e IRPF",
        source: "AIReF — Spending Review Políticas de Empleo 2025",
      },
      {
        point:
          "Reducción de la exclusión social juvenil y prevención de efectos cicatriz en las carreras profesionales",
        source: "OIT — Informe sobre Empleo Juvenil 2025",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de efecto desplazamiento: el empleo público temporal podría desplazar contrataciones privadas",
        source: "FEDEA — Documento de Trabajo 2025/14",
      },
      {
        point:
          "Capacidad administrativa limitada para gestionar 500.000+ beneficiarios simultáneamente",
        source: "SEPE — Informe de Gestión 2025",
      },
      {
        point:
          "Dependencia del ciclo político: programas de empleo garantizado requieren financiación estable a largo plazo",
        source: "Banco de España — Boletín Económico 2026/Q1",
      },
    ],
    sources: [
      {
        name: "INE — Encuesta de Población Activa Q4 2025",
        url: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176918",
      },
      {
        name: "SEPE — Estadísticas de Empleo",
        url: "https://www.sepe.es/HomeSepe/que-es-el-sepe/estadisticas.html",
      },
      {
        name: "AIReF — Spending Review",
        url: "https://www.airef.es/es/spending-review/",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "desempleo juvenil",
      "empleo garantizado",
      "políticas activas",
      "EPA",
      "formación",
    ],
    relatedArticles: [
      "art-001-fraude-fiscal",
      "art-009-presupuestos-2026",
    ],
    factCheck: [
      {
        claim: "El desempleo juvenil en España es del 26,3%",
        verdict: "verdadero",
        explanation:
          "La EPA del Q4 2025 publicada por el INE sitúa la tasa de paro juvenil (16-24 años) en el 26,3%, dato provisional.",
      },
      {
        claim:
          "España gasta 3,3 veces más en políticas pasivas que activas de empleo",
        verdict: "mayormente-verdadero",
        explanation:
          "Según los datos del SEPE y los PGE 2025, la ratio es de aproximadamente 3,1-3,4:1 dependiendo de la clasificación de algunas partidas mixtas.",
      },
      {
        claim:
          "El programa Marienthal 2.0 redujo el paro de larga duración un 30%",
        verdict: "mayormente-verdadero",
        explanation:
          "La evaluación preliminar del WIFO indica una reducción del 28-32% en las localidades participantes, aunque el programa aún está en fase piloto.",
      },
    ],
  },

  // ── 4. Vivienda ────────────────────────────────────────────────────────
  {
    id: "art-004-vivienda-alquiler",
    headline:
      "Vivienda: el alquiler consume el 45% del salario medio en Madrid y Barcelona",
    subheadline:
      "La tasa de esfuerzo supera el umbral del 30% recomendado por la UE en 12 de las 17 comunidades autónomas",
    category: "sociedad",
    date: "2026-04-07",
    author: "Laura Sánchez — Sociedad",
    summary:
      "El alquiler medio en Madrid y Barcelona alcanza los 1.150€ y 1.080€ mensuales respectivamente, lo que supone un 45% y un 42% del salario medio neto según datos del portal Idealista y el INE. La tasa de esfuerzo supera el 30% recomendado por la UE en 12 de 17 CCAA. El Partido IAÑ propone una reforma integral del mercado de vivienda que incluye topes al alquiler, incentivos fiscales y la construcción de 100.000 viviendas públicas al año.",
    body: [
      "El Índice de Precios de Alquiler publicado por el INE refleja un incremento interanual del 8,7% a nivel nacional en el cuarto trimestre de 2025. En las grandes ciudades, los incrementos superan el 10%: Madrid (11,2%), Barcelona (10,8%), Málaga (12,3%) y Palma de Mallorca (13,1%).",
      "El parque público de vivienda en alquiler social en España representa el 2,5% del total, frente al 9,3% de la media de la UE. Países Bajos lidera con un 30%, seguido de Austria (24%) y Dinamarca (21%). El déficit acumulado de vivienda social se estima en 1,5 millones de unidades.",
      "La Ley de Vivienda de 2023 introdujo las zonas tensionadas y límites a los incrementos de alquiler, pero su aplicación ha sido desigual: solo Catalunya, País Vasco, Navarra y Asturias han declarado zonas tensionadas. Madrid, principal mercado, no ha activado el mecanismo.",
      "El Banco de España ha advertido en su último informe de estabilidad financiera que la combinación de precios altos y salarios estancados está generando un «efecto expulsión» de los jóvenes de las ciudades, con consecuencias demográficas y económicas a largo plazo.",
      "La construcción de vivienda nueva se sitúa en 90.000 unidades anuales, muy por debajo de las 180.000-200.000 que el sector estima necesarias para cubrir la demanda y reducir precios. Los visados de obra nueva crecieron un 4% en 2025, insuficiente para cerrar la brecha.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Reforma del Mercado de Vivienda: topes al alquiler vinculados al IPC+2% en zonas tensionadas, deducción fiscal del 90% a propietarios que alquilen por debajo del precio de referencia, plan de construcción de 100.000 viviendas públicas/año durante 10 años (inversión: 8.000M€/año), y movilización de vivienda vacía mediante recargos del IBI progresivos.",
    ianQuote:
      "«La vivienda es un derecho, no un activo especulativo. Necesitamos construir más, regular mejor y proteger a quien más lo necesita.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Comunidad de Madrid",
        reason:
          "Rechazo a declarar zonas tensionadas por considerarlo intervencionismo",
        severity: "alto",
      },
      {
        actor: "Sector inmobiliario",
        reason:
          "Oposición a topes de alquiler por reducción de oferta prevista",
        severity: "alto",
      },
      {
        actor: "Déficit de mano de obra en construcción",
        reason: "Escasez de 700.000 trabajadores cualificados en el sector",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "a-favor",
        "La Ley de Vivienda ya avanza en esta dirección. Apoyamos ampliar la construcción pública.",
        0.7,
      ),
      pp(
        "en-contra",
        "Los topes al alquiler reducen la oferta. La solución es liberalizar suelo y agilizar licencias.",
        0.15,
      ),
      vox(
        "en-contra",
        "El problema es la inmigración masiva que tensiona el mercado. Hay que priorizar a los españoles.",
        0.05,
      ),
      sumar(
        "a-favor",
        "Apoyamos y pedimos ir más allá: prohibición de fondos buitre en vivienda y alquiler social universal.",
        0.85,
      ),
      pnv(
        "a-favor",
        "Euskadi ya tiene programa Bizigune de vivienda vacía. Apoyamos incentivos fiscales al alquiler.",
        0.6,
      ),
      erc(
        "a-favor",
        "Catalunya fue pionera en regular alquileres. Apoyamos siempre que se respeten competencias autonómicas.",
        0.7,
      ),
    ],
    benefitScore: 78,
    benefitAnalysis:
      "La construcción de 100.000 viviendas/año generaría 250.000 empleos directos e indirectos y un impulso al PIB del 0,4%. A medio plazo (5-10 años), el aumento de oferta reduciría los precios un 10-15% en zonas tensionadas según modelos del Banco de España. El coste fiscal (8.000M€/año) se compensaría parcialmente con ingresos fiscales de la actividad constructora (IVA, IRPF, cotizaciones).",
    pros: [
      {
        point:
          "Generación masiva de empleo: 250.000 puestos directos e indirectos en construcción",
        source: "CNC — Cámara Nacional de Contratistas",
      },
      {
        point:
          "Reducción estimada del 10-15% en precios de alquiler en zonas tensionadas a 5 años",
        source: "Banco de España — Informe de Estabilidad Financiera 2025",
      },
      {
        point:
          "Impacto social: reducción de la tasa de emancipación tardía (actualmente a los 30,3 años de media)",
        source: "Eurostat — Youth Statistics 2025",
      },
    ],
    cons: [
      {
        point:
          "Los topes al alquiler pueden reducir la oferta privada un 5-10% según evidencia de Berlín y Estocolmo",
        source: "DIW Berlin — Mietendeckel Evaluation 2024",
      },
      {
        point:
          "Inversión de 8.000M€/año compite con otras prioridades presupuestarias",
        source: "AIReF — Opinión sobre los PGE 2026",
      },
      {
        point:
          "Escasez de mano de obra en construcción: se necesitan 700.000 trabajadores que no están disponibles",
        source: "Confederación Nacional de la Construcción",
      },
    ],
    sources: [
      {
        name: "INE — Índice de Precios de Alquiler",
        url: "https://www.ine.es/experimental/ipav/experimental_precios_alquiler.htm",
      },
      {
        name: "Idealista — Informe de Precios Q4 2025",
        url: "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/",
      },
      {
        name: "Banco de España — Estabilidad Financiera",
        url: "https://www.bde.es/bde/es/publicaciones/informes-estabilidad-financiera/",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "vivienda",
      "alquiler",
      "vivienda social",
      "zonas tensionadas",
      "construcción",
    ],
    relatedArticles: [
      "art-005-cohesion-territorial",
      "art-003-desempleo-juvenil",
    ],
    factCheck: [
      {
        claim:
          "El alquiler consume el 45% del salario medio en Madrid",
        verdict: "verdadero",
        explanation:
          "Con un alquiler medio de 1.150€ y un salario neto medio de 2.550€ en Madrid (INE), la tasa de esfuerzo es del 45,1%.",
      },
      {
        claim:
          "España tiene un 2,5% de vivienda social frente al 9,3% de la UE",
        verdict: "mayormente-verdadero",
        explanation:
          "Las cifras exactas varían según la fuente: Housing Europe cifra el parque social español en 2,0-2,5% y la media UE en 9-10%.",
      },
      {
        claim:
          "Se necesitan 180.000-200.000 viviendas nuevas al año",
        verdict: "mixto",
        explanation:
          "Las estimaciones varían ampliamente: el sector constructor cifra la necesidad en 180.000-200.000, pero estudios académicos sugieren 120.000-150.000 considerando factores demográficos y de vivienda vacía.",
      },
    ],
  },

  // ── 5. Cohesión territorial ────────────────────────────────────────────
  {
    id: "art-005-cohesion-territorial",
    headline:
      "Las 8 comunidades que necesitan un plan de emergencia territorial",
    subheadline:
      "Extremadura, Canarias, Murcia, Castilla-La Mancha, Andalucía, Asturias, Galicia y Cantabria acumulan déficits estructurales en inversión pública",
    category: "territorio",
    date: "2026-04-06",
    author: "Carlos Martín — Territorio",
    summary:
      "Ocho comunidades autónomas presentan indicadores de desarrollo por debajo del 75% de la media nacional en al menos tres de cinco dimensiones clave: PIB per cápita, tasa de empleo, inversión pública per cápita, conectividad digital y esperanza de vida. El Partido IAÑ ha presentado una Ley de Cohesión Territorial que crearía un fondo de emergencia de 5.000M€ anuales para estas comunidades.",
    body: [
      "Los datos de Contabilidad Regional del INE y la IGAE revelan que la brecha territorial en España no se ha reducido en la última década. El PIB per cápita de Extremadura (19.200€) es un 56% del de Madrid (34.100€), una diferencia que se ha mantenido estable desde 2015.",
      "Canarias presenta la mayor tasa de desempleo autonómico (17,8%), seguida de Andalucía (16,3%) y Extremadura (15,9%). En el extremo opuesto, País Vasco (6,8%), Navarra (7,2%) y Aragón (8,1%) se sitúan por debajo de la media nacional.",
      "La inversión pública per cápita muestra disparidades significativas: Cataluña y País Vasco reciben 2.100€ y 2.800€ respectivamente, mientras que Murcia (1.200€), Canarias (1.350€) y Castilla-La Mancha (1.180€) se sitúan en los niveles más bajos.",
      "El Fondo de Compensación Interterritorial, principal instrumento de solidaridad entre CCAA, tiene una dotación de 850M€ anuales, una cifra que no se ha actualizado sustancialmente en una década y que el Consejo de Política Fiscal y Financiera considera insuficiente.",
      "La despoblación agrava el problema: las ocho comunidades identificadas concentran el 85% de los municipios en riesgo de despoblación (menos de 1.000 habitantes y pérdida sostenida de población). Según el INE, 3.400 municipios españoles podrían quedar vacíos antes de 2040.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Cohesión Territorial: fondo de emergencia de 5.000M€/año para las 8 CCAA con indicadores críticos, con inversiones vinculadas a infraestructura digital, sanitaria, educativa y de transporte. Fórmula de reparto basada en indicadores objetivos (PIB per cápita, desempleo, despoblación). Revisión cuatrienal por la AIReF.",
    ianQuote:
      "«Un país no puede permitirse que sus ciudadanos tengan oportunidades radicalmente distintas según su código postal.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "CCAA contribuyentes netas (Madrid, Cataluña, Baleares)",
        reason: "Oposición a mayores transferencias que perciben como injustas",
        severity: "alto",
      },
      {
        actor: "Régimen foral (País Vasco, Navarra)",
        reason:
          "Estructura fiscal propia que queda fuera del sistema de financiación común",
        severity: "medio",
      },
      {
        actor: "Debate sobre modelo de financiación autonómica",
        reason:
          "La reforma del sistema de financiación lleva 12 años pendiente",
        severity: "alto",
      },
    ],
    partyReactions: [
      psoe(
        "a-favor",
        "Compartimos la necesidad de mayor cohesión pero el Fondo de Compensación ya canaliza solidaridad interterritorial.",
        0.6,
      ),
      pp(
        "dividido",
        "Apoyamos la cohesión territorial pero rechazamos un fondo que penalice a las comunidades bien gestionadas.",
        0.35,
      ),
      vox(
        "en-contra",
        "El problema es el modelo autonómico. España necesita recentralizar competencias, no crear más fondos.",
        0.1,
      ),
      sumar(
        "a-favor",
        "La España vaciada necesita inversión urgente. Apoyamos un fondo amplio con criterios de justicia territorial.",
        0.8,
      ),
      pnv(
        "abstención",
        "Respetamos la solidaridad interterritorial pero el concierto vasco debe quedar fuera de la ecuación.",
        0.3,
      ),
      erc(
        "en-contra",
        "Catalunya ya aporta más de lo que recibe. Antes de nuevos fondos, hay que reformar la financiación autonómica.",
        0.15,
      ),
    ],
    benefitScore: 80,
    benefitAnalysis:
      "La inversión de 5.000M€/año en las 8 CCAA con mayor déficit tendría un efecto multiplicador estimado de 1,5-1,8 (AIReF), generando entre 7.500M€ y 9.000M€ en actividad económica. A largo plazo, la convergencia territorial reduce los costes de las transferencias compensatorias y mejora la eficiencia del mercado laboral nacional.",
    pros: [
      {
        point:
          "Efecto multiplicador alto en territorios con baja inversión: cada euro invertido genera 1,5-1,8€ de actividad",
        source: "AIReF — Estudio de Inversión Pública Regional 2025",
      },
      {
        point:
          "Freno a la despoblación: los programas de inversión territorial han reducido la emigración rural un 12% en casos piloto",
        source: "Ministerio para la Transición Ecológica — Reto Demográfico",
      },
      {
        point:
          "Alineación con la Política de Cohesión de la UE: acceso a cofinanciación FEDER",
        source: "Comisión Europea — Cohesion Policy 2021-2027",
      },
    ],
    cons: [
      {
        point:
          "Tensiones territoriales: las CCAA contribuyentes netas pueden percibir el fondo como penalización",
        source: "Consejo de Política Fiscal y Financiera",
      },
      {
        point:
          "Riesgo de clientelismo: los fondos territoriales pueden ser capturados por élites locales si no hay controles",
        source: "Tribunal de Cuentas — Informe de Fiscalización FCI 2024",
      },
      {
        point:
          "La reforma del sistema de financiación autonómica es prerrequisito para cualquier solución duradera",
        source: "Comité de Expertos para la Reforma de la Financiación Autonómica",
      },
    ],
    sources: [
      {
        name: "INE — Contabilidad Regional de España",
        url: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736167628",
      },
      {
        name: "IGAE — Inversión Pública por CCAA",
        url: "https://www.igae.pap.hacienda.gob.es",
      },
      {
        name: "Ministerio de Política Territorial — Fondo de Compensación",
        url: "https://www.mptfp.gob.es",
      },
    ],
    readingTimeMin: 8,
    importance: "alta",
    tags: [
      "cohesión territorial",
      "España vaciada",
      "despoblación",
      "financiación autonómica",
      "FCI",
    ],
    relatedArticles: [
      "art-011-ngeu-cohesion",
      "art-009-presupuestos-2026",
    ],
    factCheck: [
      {
        claim:
          "El PIB per cápita de Extremadura es el 56% del de Madrid",
        verdict: "verdadero",
        explanation:
          "Según la Contabilidad Regional del INE (datos 2025), Extremadura tiene un PIB per cápita de 19.200€ frente a los 34.100€ de Madrid, lo que supone un 56,3%.",
      },
      {
        claim:
          "3.400 municipios podrían quedar vacíos antes de 2040",
        verdict: "mayormente-verdadero",
        explanation:
          "El INE y el Instituto de Demografía del CSIC estiman entre 3.000 y 3.800 municipios en riesgo extremo de despoblación, dependiendo de los supuestos migratorios.",
      },
      {
        claim:
          "El Fondo de Compensación Interterritorial tiene 850M€ anuales",
        verdict: "verdadero",
        explanation:
          "Los PGE 2026 dotan al FCI (secciones 33 y 34) con 847M€, cifra que se ha mantenido en el rango 800-900M€ durante la última década.",
      },
    ],
  },

  // ── 6. Transparencia ──────────────────────────────────────────────────
  {
    id: "art-006-transparencia",
    headline:
      "España, 35ª en transparencia: la propuesta de dashboard en tiempo real",
    subheadline:
      "El Consejo de Transparencia tramitó 4.200 reclamaciones en 2025 con un tiempo medio de resolución de 4 meses",
    category: "politica",
    date: "2026-04-05",
    author: "Ana Torres — Política",
    summary:
      "España ocupa el puesto 35 de 180 países en el Índice de Percepción de la Corrupción de Transparencia Internacional, con una puntuación de 61/100. El Consejo de Transparencia y Buen Gobierno tramitó 4.200 reclamaciones en 2025, un 18% más que el año anterior, con un tiempo medio de resolución de 4 meses. El Partido IAÑ propone una Ley de Transparencia 2.0 con un dashboard público de gasto en tiempo real y rendición de cuentas automática.",
    body: [
      "El Índice de Percepción de la Corrupción 2025 de Transparencia Internacional sitúa a España en el puesto 35, por detrás de Estonia (14), Portugal (32) e Irlanda (18), pero por delante de Italia (41) y Grecia (49). La puntuación de 61/100 se ha mantenido estable en los últimos cinco años.",
      "La Ley 19/2013 de Transparencia, vigente desde 2014, creó el Portal de Transparencia y el Consejo de Transparencia y Buen Gobierno. Sin embargo, el Consejo carece de capacidad sancionadora: solo puede emitir resoluciones que los organismos públicos pueden recurrir sin consecuencias inmediatas.",
      "Según el informe anual del propio Consejo, el 23% de las solicitudes de acceso a información pública son denegadas total o parcialmente. Las causas más frecuentes son la protección de datos personales (34%), la seguridad pública (22%) y el «proceso de toma de decisiones» (18%).",
      "Varios países han implementado portales de gasto en tiempo real con éxito: Brasil (Portal da Transparência), Estonia (e-Governance) y Corea del Sur (Open Budget). En estos casos, la transparencia activa ha correlacionado con mejoras de 5-10 puntos en los índices de percepción de corrupción.",
      "El Tribunal de Cuentas publicó en 2025 un informe señalando que el 42% de los contratos públicos menores (hasta 15.000€) no se publican en la Plataforma de Contratación del Sector Público, lo que supone un «agujero negro» de transparencia.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Transparencia 2.0: dashboard público de gasto en tiempo real con desglose por ministerio, programa y proveedor. Publicación obligatoria de todos los contratos (incluidos menores). Capacidad sancionadora para el Consejo de Transparencia. Declaración de patrimonio obligatoria y verificable para todos los cargos públicos. Plazo máximo de 15 días para responder solicitudes de información.",
    ianQuote:
      "«Si el Estado exige transparencia fiscal a los ciudadanos, los ciudadanos tienen derecho a exigir transparencia presupuestaria al Estado.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Ministerios y organismos públicos",
        reason:
          "Resistencia institucional a la publicación en tiempo real por carga administrativa",
        severity: "alto",
      },
      {
        actor: "Agencia Española de Protección de Datos",
        reason:
          "Conflicto potencial entre transparencia total y protección de datos personales",
        severity: "medio",
      },
      {
        actor: "Partidos políticos",
        reason:
          "Históricamente reticentes a dotar al Consejo de Transparencia de capacidad sancionadora",
        severity: "alto",
      },
    ],
    partyReactions: [
      psoe(
        "dividido",
        "Aprobamos la Ley de Transparencia en 2013 y seguimos comprometidos, pero la capacidad sancionadora requiere debate.",
        0.4,
      ),
      pp(
        "a-favor",
        "Apoyamos más transparencia en el gasto público. La ciudadanía tiene derecho a saber.",
        0.6,
      ),
      vox(
        "a-favor",
        "Transparencia total para acabar con el despilfarro autonómico y los chiringuitos.",
        0.55,
      ),
      sumar(
        "a-favor",
        "La transparencia es un pilar democrático. Apoyamos el dashboard y la capacidad sancionadora.",
        0.8,
      ),
      pnv(
        "abstención",
        "El País Vasco tiene su propio portal de transparencia. Apoyamos la transparencia respetando las competencias forales.",
        0.4,
      ),
      erc(
        "a-favor",
        "Apoyamos la transparencia total siempre que incluya las transferencias Estado-CCAA y el sistema de financiación.",
        0.65,
      ),
    ],
    benefitScore: 85,
    benefitAnalysis:
      "El coste de implementación del dashboard se estima en 120M€ (desarrollo tecnológico) + 45M€/año (mantenimiento). El beneficio potencial es elevado: la evidencia internacional muestra que la transparencia activa reduce el sobrecoste en contratación pública un 8-15%, lo que en España (contratación pública: 190.000M€/año) supondría un ahorro de 15.000-28.000M€.",
    pros: [
      {
        point:
          "Ahorro potencial en contratación pública: 15.000-28.000M€/año por reducción de sobrecoste",
        source: "OCDE — Government at a Glance 2025",
      },
      {
        point:
          "Mejora de la confianza institucional: países con transparencia activa muestran 15-20 puntos más en confianza ciudadana",
        source: "Eurobarómetro — Trust in Institutions 2025",
      },
      {
        point:
          "Efecto disuasorio sobre la corrupción: la publicación en tiempo real dificulta el desvío de fondos",
        source: "Transparencia Internacional — CPI Methodology",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de saturación informativa: sin herramientas de análisis, los datos brutos son inútiles para la mayoría de ciudadanos",
        source: "Access Info Europe — Informe 2025",
      },
      {
        point:
          "Conflictos con protección de datos: la publicación de contratos puede revelar información comercial sensible",
        source: "AEPD — Informe sobre Transparencia y Protección de Datos 2025",
      },
      {
        point:
          "Coste tecnológico significativo para administraciones pequeñas (ayuntamientos de menos de 20.000 habitantes)",
        source: "FEMP — Informe sobre Capacidad Digital Municipal",
      },
    ],
    sources: [
      {
        name: "Transparencia Internacional — Índice de Percepción de la Corrupción 2025",
        url: "https://www.transparency.org/cpi2025",
      },
      {
        name: "Consejo de Transparencia y Buen Gobierno — Memoria 2025",
        url: "https://www.consejodetransparencia.es",
      },
      {
        name: "Tribunal de Cuentas — Contratos Públicos Menores",
        url: "https://www.tcu.es",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "transparencia",
      "corrupción",
      "datos abiertos",
      "rendición de cuentas",
      "contratación pública",
    ],
    relatedArticles: [
      "art-010-bloqueo-parlamentario",
      "art-009-presupuestos-2026",
    ],
    factCheck: [
      {
        claim:
          "España ocupa el puesto 35 en el Índice de Percepción de la Corrupción",
        verdict: "verdadero",
        explanation:
          "El IPC 2025 de Transparencia Internacional sitúa a España en el puesto 35 con 61/100 puntos.",
      },
      {
        claim:
          "El 42% de los contratos menores no se publican en la Plataforma de Contratación",
        verdict: "mayormente-verdadero",
        explanation:
          "El Tribunal de Cuentas cifra el incumplimiento en un rango del 38-45% según el ejercicio fiscalizado.",
      },
      {
        claim:
          "La transparencia activa reduce el sobrecoste en contratación un 8-15%",
        verdict: "mayormente-verdadero",
        explanation:
          "Estudios de la OCDE y el Banco Mundial muestran reducciones en este rango, aunque con alta varianza según el contexto institucional de cada país.",
      },
    ],
  },

  // ── 7. Semiconductores ────────────────────────────────────────────────
  {
    id: "art-007-semiconductores",
    headline:
      "Reindustrialización: ¿puede España fabricar semiconductores?",
    subheadline:
      "El PERTE Chip destina 12.250M€ al ecosistema de microchips pero España parte de una cuota industrial del 0,1% global",
    category: "tecnologia",
    date: "2026-04-04",
    author: "David López — Tecnología",
    summary:
      "España destinará 12.250 millones de euros al PERTE Chip para desarrollar un ecosistema de semiconductores, según la Secretaría de Estado de Telecomunicaciones. Sin embargo, la cuota española en la producción global de chips es inferior al 0,1%, frente al 8% de la UE que el European Chips Act pretende alcanzar para 2030. El Partido IAÑ propone una Ley de Reindustrialización Estratégica que priorice la especialización en nichos de alto valor (sensores, chips de potencia, fotónica).",
    body: [
      "El mercado global de semiconductores alcanzó los 620.000 millones de dólares en 2025, según la Semiconductor Industry Association (SIA). Asia concentra el 78% de la fabricación, con Taiwán (TSMC) y Corea del Sur (Samsung) como líderes indiscutibles en chips avanzados (sub-7nm).",
      "La Unión Europea aprobó el European Chips Act en 2023 con el objetivo de duplicar su cuota de producción del 8% al 20% en 2030. Hasta la fecha, se han anunciado inversiones por valor de 43.000M€ en la UE, principalmente en Alemania (Intel, Magdeburg), Irlanda (Intel, Leixlip) y Francia (STMicroelectronics, Crolles).",
      "España cuenta con centros de investigación reconocidos: el Centro Nacional de Microelectrónica (IMB-CNM-CSIC) en Barcelona, el centro de diseño de chips de la Universidad de Sevilla, y el nodo de Mondragon Unibertsitatea en el País Vasco. Sin embargo, carece de fábricas (fabs) de producción en volumen.",
      "El PERTE Chip ha recibido 58 manifestaciones de interés de empresas nacionales e internacionales. Los proyectos más avanzados incluyen una planta de empaquetado (packaging) en Cataluña y una línea piloto de chips de potencia (SiC/GaN) para automoción en el País Vasco, con inversiones combinadas de 2.100M€.",
      "Los expertos del sector señalan que la ventana de oportunidad para España está en la especialización: chips de potencia para vehículos eléctricos, sensores para IoT industrial, y fotónica integrada para telecomunicaciones. Competir en fabricación de chips avanzados (sub-5nm) requiere inversiones de 20.000-30.000M€ por fab, fuera de alcance.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Ley de Reindustrialización Estratégica: inversión de 3.000M€/año en I+D+i industrial (objetivo: 3% del PIB), especialización en semiconductores de potencia (SiC/GaN), fotónica y sensores. Creación de un «Sandbox Industrial» con fiscalidad reducida para fábricas de semiconductores. Formación de 10.000 ingenieros especializados en 5 años mediante becas STEM.",
    ianQuote:
      "«España no necesita competir con Taiwán. Necesita encontrar su nicho estratégico y dominarlo. Los chips de potencia para la transición energética son nuestra oportunidad.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Competencia internacional",
        reason:
          "Alemania, Francia e Irlanda captan la mayor parte de las inversiones del European Chips Act",
        severity: "alto",
      },
      {
        actor: "Déficit de talento STEM",
        reason:
          "España gradúa 28.000 ingenieros/año pero necesitaría 40.000 para cubrir la demanda industrial",
        severity: "alto",
      },
      {
        actor: "Burocracia de permisos",
        reason:
          "La autorización de una planta industrial puede tardar 18-36 meses en España frente a 6-12 en Irlanda",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "a-favor",
        "El PERTE Chip ya avanza en esta dirección. España será un actor clave en el ecosistema europeo de semiconductores.",
        0.65,
      ),
      pp(
        "a-favor",
        "Apoyamos la reindustrialización pero hay que agilizar permisos y reducir la carga regulatoria.",
        0.6,
      ),
      vox(
        "dividido",
        "Apoyamos la soberanía tecnológica pero rechazamos la dependencia de fondos europeos con condiciones.",
        0.3,
      ),
      sumar(
        "a-favor",
        "La reindustrialización debe ser verde y con derechos laborales. Apoyamos la inversión pública en I+D.",
        0.7,
      ),
      pnv(
        "a-favor",
        "Euskadi ya es líder en industria avanzada. Apoyamos la especialización en chips de potencia desde Mondragon.",
        0.75,
      ),
      erc(
        "a-favor",
        "Catalunya alberga el CNM-CSIC y tiene ecosistema tecnológico maduro. Apoyamos si se respeta la descentralización.",
        0.65,
      ),
    ],
    benefitScore: 72,
    benefitAnalysis:
      "La reindustrialización en semiconductores tiene un horizonte de retorno a largo plazo (8-12 años). La inversión de 12.250M€ del PERTE Chip podría generar 15.000 empleos directos y 45.000 indirectos. El valor añadido sectorial se estima en 4.000-6.000M€/año a partir de 2032. El riesgo principal es la concentración de inversión en proyectos que no alcancen escala competitiva.",
    pros: [
      {
        point:
          "Posición estratégica en chips de potencia para automoción eléctrica: España es el 2º productor de automóviles de la UE",
        source: "ANFAC — Informe Anual 2025",
      },
      {
        point:
          "Base investigadora sólida: el IMB-CNM-CSIC es referencia europea en microelectrónica",
        source: "CSIC — Memoria Anual 2025",
      },
      {
        point:
          "Acceso a cofinanciación europea: el European Chips Act aporta hasta el 50% de la inversión",
        source: "Comisión Europea — European Chips Act Implementation Report",
      },
    ],
    cons: [
      {
        point:
          "Horizonte de rentabilidad muy largo (8-12 años) con alta incertidumbre tecnológica",
        source: "McKinsey — Semiconductor Strategy for Europe 2025",
      },
      {
        point:
          "Competencia agresiva de otros estados miembros con mayores incentivos fiscales",
        source: "EIB — Investment Report 2025",
      },
      {
        point:
          "Déficit de 12.000 ingenieros especializados en microelectrónica en España",
        source: "Fundación COTEC — Informe I+D+i 2025",
      },
    ],
    sources: [
      {
        name: "Secretaría de Estado de Telecomunicaciones — PERTE Chip",
        url: "https://planderecuperacion.gob.es/como-acceder-a-los-fondos/pertes/perte-chip",
      },
      {
        name: "SIA — Global Semiconductor Sales Report 2025",
        url: "https://www.semiconductors.org/global-semiconductor-sales-data/",
      },
      {
        name: "European Commission — Chips Act",
        url: "https://digital-strategy.ec.europa.eu/en/policies/european-chips-act",
      },
    ],
    readingTimeMin: 8,
    importance: "alta",
    tags: [
      "semiconductores",
      "reindustrialización",
      "PERTE Chip",
      "I+D",
      "chips de potencia",
    ],
    relatedArticles: [
      "art-012-ia-administracion",
      "art-002-ngeu-ejecucion",
    ],
    factCheck: [
      {
        claim:
          "España tiene una cuota del 0,1% en la producción global de semiconductores",
        verdict: "verdadero",
        explanation:
          "España carece de fábricas de producción en volumen. Su participación se limita a diseño y prototipado, lo que representa menos del 0,1% del mercado global.",
      },
      {
        claim:
          "El European Chips Act aspira a una cuota europea del 20% en 2030",
        verdict: "verdadero",
        explanation:
          "El Reglamento (UE) 2023/1781 establece el objetivo de alcanzar al menos el 20% de la producción mundial en 2030.",
      },
      {
        claim:
          "España es el 2º productor de automóviles de la UE",
        verdict: "verdadero",
        explanation:
          "Según ANFAC y OICA, España produjo 2,27 millones de vehículos en 2025, segundo tras Alemania (3,9M).",
      },
    ],
  },

  // ── 8. Déficit y reglas fiscales ──────────────────────────────────────
  {
    id: "art-008-deficit-reglas-fiscales",
    headline:
      "El déficit estructural y las nuevas reglas fiscales europeas",
    subheadline:
      "El nuevo marco fiscal de la UE exige a España reducir su déficit estructural del 3,2% al 1,5% del PIB en 4 años",
    category: "europa",
    date: "2026-04-03",
    author: "Elena Ruiz — Europa",
    summary:
      "Las nuevas reglas fiscales de la UE, vigentes desde enero de 2025, exigen a España un ajuste del déficit estructural de 1,7 puntos de PIB en un plazo de 4 años (ampliable a 7 si se presentan reformas estructurales). El déficit público español cerró 2025 en el 3,6% del PIB y la deuda en el 105%. El Partido IAÑ propone una Reforma de Estabilidad Presupuestaria que diferencie gasto corriente e inversión productiva.",
    body: [
      "El nuevo marco de gobernanza económica de la UE (Reglamento 2024/1263) sustituye al Pacto de Estabilidad y Crecimiento. Los estados miembros deben presentar planes fiscales de medio plazo (4-7 años) con trayectorias de reducción de deuda y déficit verificadas por la Comisión Europea.",
      "España presentó su plan fiscal-estructural en septiembre de 2025. La Comisión evaluó que el ajuste requerido es de 0,5 puntos de PIB al año en el escenario de 4 años, o de 0,25 puntos en el escenario de 7 años con reformas estructurales.",
      "El IGAE cerró las cuentas públicas de 2025 con un déficit del 3,6% del PIB (60.300M€) y una deuda pública del 105% del PIB (1.530.000M€). Los intereses de la deuda consumieron 36.000M€, un 2,4% del PIB, frente a los 26.000M€ de 2022.",
      "La AIReF ha señalado que el mayor riesgo fiscal para España es el envejecimiento poblacional: el gasto en pensiones crecerá del 13,8% del PIB actual al 16,5% en 2050 según las proyecciones del Ageing Report de la Comisión Europea.",
      "El debate europeo sobre las reglas fiscales ha girado en torno a la «regla de oro»: la posibilidad de excluir la inversión productiva (verde, digital, defensa) del cómputo del déficit. Francia y España han liderado esta petición, que Alemania y los países «frugales» han rechazado hasta ahora.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Reforma de Estabilidad Presupuestaria: diferenciar gasto corriente (sometido a las reglas fiscales) de inversión productiva (excluida del cómputo de déficit). Compromiso de ejecución del 100% de los fondos NGEU. Creación de un fondo de estabilización fiscal anticíclico dotado con el 0,5% del PIB/año en periodos de crecimiento.",
    ianQuote:
      "«La austeridad indiscriminada mata el crecimiento. Un país que no invierte en su futuro no puede reducir su deuda.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Comisión Europea",
        reason:
          "La exclusión de inversión productiva del déficit no tiene consenso en el Consejo",
        severity: "alto",
      },
      {
        actor: "Países frugales (Alemania, Países Bajos, Austria, Finlandia)",
        reason: "Oposición frontal a flexibilizar las reglas de deuda",
        severity: "alto",
      },
      {
        actor: "Presión del gasto en pensiones y defensa",
        reason:
          "Márgenes presupuestarios cada vez más estrechos para inversión productiva",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "a-favor",
        "Compartimos la necesidad de diferenciar inversión y gasto corriente. Lo defendemos en el Consejo Europeo.",
        0.7,
      ),
      pp(
        "dividido",
        "La disciplina fiscal es fundamental pero hay que proteger la inversión en infraestructuras.",
        0.4,
      ),
      vox(
        "en-contra",
        "España no debe aceptar que Bruselas dicte su política fiscal. Soberanía presupuestaria plena.",
        0.1,
      ),
      sumar(
        "a-favor",
        "Las reglas fiscales europeas son austeridad encubierta. Hay que reformarlas de raíz.",
        0.8,
      ),
      pnv(
        "abstención",
        "El régimen foral tiene estabilidad presupuestaria propia. Respetamos el debate pero no nos afecta directamente.",
        0.35,
      ),
      erc(
        "a-favor",
        "Apoyamos flexibilizar las reglas fiscales siempre que la inversión adicional se distribuya equitativamente entre CCAA.",
        0.55,
      ),
    ],
    benefitScore: 70,
    benefitAnalysis:
      "La diferenciación gasto corriente / inversión productiva permitiría aumentar la inversión pública en 8.000-12.000M€/año sin incumplir las reglas fiscales. Según el Banco de España, cada punto de inversión pública adicional genera un multiplicador de 1,2-1,5 en el PIB. El riesgo es que la flexibilización sea utilizada para financiar gasto corriente disfrazado de inversión.",
    pros: [
      {
        point:
          "Mayor espacio fiscal para inversión verde y digital: 8.000-12.000M€ adicionales/año",
        source: "Banco de España — Documento de Trabajo 2025/22",
      },
      {
        point:
          "Alineación con el consenso económico: el FMI recomienda diferenciar gasto corriente e inversión",
        source: "FMI — Fiscal Monitor Abril 2026",
      },
      {
        point:
          "El fondo anticíclico reduciría la volatilidad del gasto público en recesiones",
        source: "AIReF — Evaluación del Fondo de Reserva",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de contabilidad creativa: reclasificar gasto corriente como inversión para eludir límites",
        source: "Tribunal de Cuentas Europeo — Informe sobre Reglas Fiscales 2025",
      },
      {
        point:
          "Falta de consenso europeo: Alemania y los frugales bloquean cualquier flexibilización",
        source: "Consejo de la UE — Actas del Ecofin",
      },
      {
        point:
          "La deuda al 105% del PIB ya limita la capacidad de endeudamiento a tipos razonables",
        source: "BCE — Financial Stability Review 2025",
      },
    ],
    sources: [
      {
        name: "IGAE — Cuentas de las Administraciones Públicas 2025",
        url: "https://www.igae.pap.hacienda.gob.es",
      },
      {
        name: "Comisión Europea — Fiscal Governance Reform",
        url: "https://economy-finance.ec.europa.eu/economic-and-fiscal-governance/fiscal-governance_en",
      },
      {
        name: "AIReF — Opinión sobre el Plan Fiscal-Estructural",
        url: "https://www.airef.es",
      },
    ],
    readingTimeMin: 8,
    importance: "alta",
    tags: [
      "déficit",
      "reglas fiscales",
      "UE",
      "deuda pública",
      "inversión productiva",
    ],
    relatedArticles: [
      "art-001-fraude-fiscal",
      "art-009-presupuestos-2026",
    ],
    factCheck: [
      {
        claim:
          "El déficit español cerró 2025 en el 3,6% del PIB",
        verdict: "mayormente-verdadero",
        explanation:
          "El dato provisional del IGAE sitúa el déficit en el 3,5-3,7% del PIB. El dato definitivo se publicará en septiembre de 2026.",
      },
      {
        claim:
          "Los intereses de la deuda consumieron 36.000M€ en 2025",
        verdict: "verdadero",
        explanation:
          "Según la IGAE y el Tesoro Público, el gasto en intereses de la deuda ascendió a 35.800M€ en 2025.",
      },
      {
        claim:
          "El gasto en pensiones crecerá al 16,5% del PIB en 2050",
        verdict: "mayormente-verdadero",
        explanation:
          "El Ageing Report 2024 de la Comisión Europea proyecta un rango del 15,5-17,0% del PIB para 2050 según el escenario demográfico.",
      },
    ],
  },

  // ── 9. Presupuestos 2026 ──────────────────────────────────────────────
  {
    id: "art-009-presupuestos-2026",
    headline:
      "Presupuestos 2026: dónde va cada euro de los PGE",
    subheadline:
      "El gasto público total asciende a 688.000M€, con pensiones (196.000M€) y deuda (36.000M€) como principales partidas",
    category: "economia",
    date: "2026-04-02",
    author: "Marta Vidal — Economía",
    summary:
      "Los Presupuestos Generales del Estado para 2026 contemplan un gasto total de 688.000 millones de euros, un 4,2% más que el ejercicio anterior. Las pensiones absorben 196.000M€ (28,5%), los intereses de la deuda 36.000M€ (5,2%), y la financiación de las CCAA 143.000M€ (20,8%). La partida de inversión pública real se sitúa en 28.000M€ (4,1%), la más baja en proporción desde 2019.",
    body: [
      "El Ministerio de Hacienda presentó los PGE 2026 el 15 de febrero, siendo aprobados por el Congreso el 28 de marzo tras un acuerdo de última hora con PNV y ERC que incluyó 1.200M€ adicionales en inversión territorial. El voto fue ajustado: 176 a favor, 170 en contra, 4 abstenciones.",
      "El desglose por funciones muestra la siguiente distribución: protección social (pensiones, desempleo, dependencia) 312.000M€ (45,3%); servicios públicos generales (deuda, administración) 78.000M€ (11,3%); sanidad 84.000M€ (12,2%); educación 56.000M€ (8,1%); defensa 18.000M€ (2,6%); infraestructuras 28.000M€ (4,1%); resto 112.000M€ (16,3%).",
      "Los ingresos previstos ascienden a 664.000M€, lo que implica un déficit previsto de 24.000M€ (1,6% del PIB). La recaudación tributaria proyectada es de 318.000M€, con IRPF (118.000M€), IVA (92.000M€) y Sociedades (38.000M€) como principales figuras.",
      "La AIReF ha señalado que las previsiones de ingresos son «moderadamente optimistas»: asumen un crecimiento del PIB del 2,4% cuando el consenso del panel de analistas se sitúa en el 2,1%. Una desviación de 0,3 puntos de crecimiento equivale a 4.500M€ menos de recaudación.",
      "El gasto en I+D público se sitúa en 9.800M€ (0,65% del PIB), aún lejos del objetivo del 1% del PIB en gasto público en I+D que recomienda la Estrategia Española de Ciencia, Tecnología e Innovación.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Redistribución presupuestaria basada en evidencia: aumentar inversión pública real del 4,1% al 6% del gasto total (+13.000M€), financiado con 15.000M€ de la lucha contra el fraude fiscal. Incrementar I+D público del 0,65% al 1% del PIB. Crear dashboard de ejecución presupuestaria en tiempo real accesible a la ciudadanía.",
    ianQuote:
      "«Los presupuestos son la radiografía de las prioridades de un país. Los nuestros reflejan un país que gasta en inercia, no en futuro.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Inercia presupuestaria",
        reason:
          "El 75% del presupuesto es gasto obligatorio (pensiones, deuda, funcionarios) con muy escaso margen de reasignación",
        severity: "alto",
      },
      {
        actor: "Partidos socios de Gobierno",
        reason:
          "Los acuerdos de investidura condicionan las prioridades presupuestarias",
        severity: "medio",
      },
      {
        actor: "Reglas fiscales europeas",
        reason:
          "El nuevo marco fiscal limita el aumento del gasto neto primario",
        severity: "alto",
      },
    ],
    partyReactions: [
      psoe(
        "en-contra",
        "Los PGE 2026 son los más sociales de la historia, con récord en gasto en protección social.",
        0.2,
      ),
      pp(
        "en-contra",
        "Los presupuestos son inflacionistas y no reducen el déficit. España necesita austeridad inteligente.",
        0.15,
      ),
      vox(
        "en-contra",
        "Los PGE son un reparto de sillones entre los socios del Gobierno. Hay que recortar gasto improductivo.",
        0.05,
      ),
      sumar(
        "dividido",
        "Hemos logrado mejoras sociales pero la inversión verde y en vivienda sigue siendo insuficiente.",
        0.45,
      ),
      pnv(
        "a-favor",
        "Los PGE incluyen compromisos de inversión en infraestructuras ferroviarias para Euskadi.",
        0.7,
      ),
      erc(
        "a-favor",
        "Hemos negociado inversiones comprometidas en Rodalies y otras infraestructuras para Catalunya.",
        0.6,
      ),
    ],
    benefitScore: 55,
    benefitAnalysis:
      "Los PGE 2026 mantienen la estabilidad fiscal pero sacrifican la inversión productiva. La ratio inversión/gasto total (4,1%) es la más baja de la UE-15 (media: 6,8%). A corto plazo, el presupuesto es viable; a medio plazo, la falta de inversión lastra la productividad y el crecimiento potencial.",
    pros: [
      {
        point:
          "Estabilidad fiscal: el déficit previsto (1,6% PIB) cumple la senda de la Comisión Europea",
        source: "Ministerio de Hacienda — PGE 2026",
      },
      {
        point:
          "Gasto social récord: las pensiones crecen un 3,8% y se mantiene la revalorización con el IPC",
        source: "Seguridad Social — Presupuesto 2026",
      },
      {
        point:
          "Ingresos tributarios crecientes: la lucha contra el fraude y la recuperación económica aumentan la recaudación",
        source: "AEAT — Previsión de Ingresos 2026",
      },
    ],
    cons: [
      {
        point:
          "Inversión pública real en mínimos históricos: 4,1% del gasto frente al 6,8% de media UE-15",
        source: "Eurostat — Government Expenditure by Function 2025",
      },
      {
        point:
          "Previsiones de ingresos optimistas: riesgo de desviación de 4.500M€ si el PIB crece menos de lo previsto",
        source: "AIReF — Informe sobre los PGE 2026",
      },
      {
        point:
          "I+D público estancado en el 0,65% del PIB, lejos del 1% objetivo",
        source: "COTEC — Informe de Ciencia e Innovación 2025",
      },
    ],
    sources: [
      {
        name: "Ministerio de Hacienda — Presupuestos Generales del Estado 2026",
        url: "https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-es/Presupuestos/PGE/PGE2026",
      },
      {
        name: "AIReF — Informe sobre PGE",
        url: "https://www.airef.es/es/informes-sobre-las-lineas-fundamentales-de-presupuestos/",
      },
      {
        name: "Eurostat — Government Finance Statistics",
        url: "https://ec.europa.eu/eurostat/web/government-finance-statistics",
      },
    ],
    readingTimeMin: 8,
    importance: "alta",
    tags: [
      "presupuestos",
      "PGE",
      "gasto público",
      "déficit",
      "inversión",
      "I+D",
    ],
    relatedArticles: [
      "art-001-fraude-fiscal",
      "art-008-deficit-reglas-fiscales",
    ],
    factCheck: [
      {
        claim:
          "Las pensiones absorben el 28,5% de los PGE 2026",
        verdict: "verdadero",
        explanation:
          "La Seguridad Social presupuesta 196.000M€ en pensiones contributivas y no contributivas, un 28,5% del gasto total consolidado.",
      },
      {
        claim:
          "La inversión pública real es del 4,1% del gasto total",
        verdict: "verdadero",
        explanation:
          "Los capítulos VI (inversiones reales) y VII (transferencias de capital) suman 28.200M€, un 4,1% del gasto total de 688.000M€.",
      },
      {
        claim:
          "El gasto en I+D público es del 0,65% del PIB",
        verdict: "mayormente-verdadero",
        explanation:
          "El dato exacto depende de la delimitación: el PGE cifra el gasto directo en I+D civil en 9.800M€ (0,65% PIB), pero incluyendo I+D militar sube al 0,72%.",
      },
    ],
  },

  // ── 10. Bloqueo parlamentario ─────────────────────────────────────────
  {
    id: "art-010-bloqueo-parlamentario",
    headline:
      "El bloqueo parlamentario: por qué España no legisla",
    subheadline:
      "El Congreso ha aprobado 12 leyes orgánicas en la XV Legislatura frente a las 28 de la XIV: la fragmentación impide acuerdos",
    category: "politica",
    date: "2026-04-01",
    author: "Ana Torres — Política",
    summary:
      "La XV Legislatura lleva aprobadas 12 leyes orgánicas en 18 meses, frente a las 28 de la XIV Legislatura en su periodo equivalente. La fragmentación del arco parlamentario —con 9 grupos y ninguna mayoría superior a 130 escaños— ha convertido cada votación en una negociación multilateral. El Partido IAÑ atribuye el bloqueo a la falta de incentivos institucionales para el consenso y propone reformas del reglamento del Congreso.",
    body: [
      "El Congreso de los Diputados cuenta en la XV Legislatura con 9 grupos parlamentarios y 14 formaciones políticas representadas. El grupo mayoritario (PSOE) tiene 120 escaños, seguido del PP (118). La mayoría absoluta requiere 176 votos, lo que obliga a coaliciones de al menos 4-5 partidos para cualquier legislación orgánica.",
      "Según los datos del portal del Congreso, se han registrado 487 iniciativas legislativas en esta legislatura, de las cuales 312 están «en tramitación» (sin avance significativo), 89 han sido rechazadas y solo 86 han sido aprobadas. De estas, 12 son leyes orgánicas y 74 son leyes ordinarias o reales decretos-ley convalidados.",
      "El uso de reales decretos-ley se ha intensificado: 34 en 18 meses, frente a los 22 del periodo equivalente de la legislatura anterior. El Tribunal Constitucional ha advertido reiteradamente sobre el uso excesivo de este instrumento legislativo.",
      "Los politólogos identifican tres factores del bloqueo: la fragmentación (ningún bloque ideológico alcanza mayoría), la polarización (el «cordón sanitario» cruzado impide acuerdos PP-Sumar o PSOE-VOX), y la lógica electoral permanente (los partidos priorizan el posicionamiento sobre la legislación).",
      "En comparativa europea, Alemania (coalición tripartita) aprobó 142 leyes en 18 meses, Francia (mayoría relativa) 98, e Italia (coalición de derechas) 87. España, con 86 normas aprobadas, se sitúa en niveles similares a Italia pero con menor proporción de leyes orgánicas.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Reforma del Reglamento del Congreso: introducción del «voto ponderado por programa» (cada partido publica compromisos temáticos y el voto se negocia bloque a bloque, no ley a ley). Creación de comisiones legislativas transversales con mandato de consenso. Límite de 6 meses para la tramitación de proyectos de ley. Reducción del uso de reales decretos-ley a situaciones de emergencia verificada.",
    ianQuote:
      "«El bloqueo no es un accidente: es el resultado de un sistema que premia el enfrentamiento sobre el acuerdo. Hay que cambiar las reglas del juego.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Partidos mayoritarios (PSOE y PP)",
        reason:
          "La reforma del reglamento requiere mayoría absoluta que ambos se resisten a facilitar al otro",
        severity: "alto",
      },
      {
        actor: "Partidos nacionalistas",
        reason:
          "El sistema actual les otorga poder de veto desproporcionado que no querrían perder",
        severity: "alto",
      },
      {
        actor: "Cultura política española",
        reason:
          "Tradición de adversarialismo parlamentario profundamente arraigada",
        severity: "medio",
      },
    ],
    partyReactions: [
      psoe(
        "en-contra",
        "El Gobierno legisla con eficacia a través de decretos-ley cuando la oposición bloquea. El sistema funciona.",
        0.15,
      ),
      pp(
        "dividido",
        "Compartimos la preocupación por el bloqueo pero la solución es un gobierno con mayoría clara, no parches reglamentarios.",
        0.3,
      ),
      vox(
        "en-contra",
        "El problema es que Sánchez gobierna con separatistas y comunistas. Con un gobierno patriota no habría bloqueo.",
        0.05,
      ),
      sumar(
        "dividido",
        "La reforma del reglamento es interesante pero no debe recortar los derechos de los grupos minoritarios.",
        0.4,
      ),
      pnv(
        "en-contra",
        "El sistema actual permite a los partidos vascos defender los intereses de Euskadi en cada negociación.",
        0.1,
      ),
      erc(
        "en-contra",
        "La capacidad de negociación de los partidos catalanes es una herramienta democrática legítima.",
        0.1,
      ),
    ],
    benefitScore: 65,
    benefitAnalysis:
      "La reforma parlamentaria no tiene un coste fiscal directo pero su beneficio potencial es sistémico: un Congreso funcional podría aprobar 30-40 leyes más por legislatura, incluyendo reformas estructurales pendientes (financiación autonómica, mercado eléctrico, pensiones). Sin embargo, la probabilidad de implementación es baja dada la oposición de todos los partidos beneficiados por el statu quo.",
    pros: [
      {
        point:
          "Mayor producción legislativa: potencial de 30-40 leyes adicionales por legislatura",
        source: "Congreso de los Diputados — Estadísticas Legislativas",
      },
      {
        point:
          "Reducción del uso de decretos-ley: mayor calidad democrática y seguridad jurídica",
        source: "Tribunal Constitucional — Doctrina sobre Decretos-Ley",
      },
      {
        point:
          "Mejora de la percepción ciudadana: el 68% de los españoles cree que el Congreso no funciona (CIS)",
        source: "CIS — Barómetro Marzo 2026",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de marginar a minorías parlamentarias si se facilitan mayorías simples",
        source: "Fundación Alternativas — Informe sobre Calidad Democrática",
      },
      {
        point:
          "El «voto ponderado por programa» es teórico y no tiene precedentes en democracias parlamentarias",
        source: "Instituto de Derecho Parlamentario — UCM",
      },
      {
        point:
          "Ningún partido con representación apoya de forma clara la reforma, lo que la hace políticamente inviable a corto plazo",
        source: "Análisis propio basado en declaraciones parlamentarias",
      },
    ],
    sources: [
      {
        name: "Congreso de los Diputados — Actividad Legislativa",
        url: "https://www.congreso.es/en/actividad-legislativa",
      },
      {
        name: "CIS — Barómetro de Opinión",
        url: "https://www.cis.es/cis/opencm/ES/11_barometros/index.jsp",
      },
      {
        name: "BOE — Leyes y Reales Decretos-Ley XV Legislatura",
        url: "https://www.boe.es/legislacion/legislacion.php",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "bloqueo parlamentario",
      "Congreso",
      "legislación",
      "fragmentación",
      "reforma reglamento",
    ],
    relatedArticles: [
      "art-006-transparencia",
      "art-009-presupuestos-2026",
    ],
    factCheck: [
      {
        claim:
          "Se han aprobado 12 leyes orgánicas en 18 meses de la XV Legislatura",
        verdict: "mayormente-verdadero",
        explanation:
          "El dato exacto puede variar según la fecha de corte: a 1 de abril de 2026 se han publicado en el BOE entre 11 y 13 leyes orgánicas de la XV Legislatura.",
      },
      {
        claim:
          "Se han aprobado 34 reales decretos-ley en esta legislatura",
        verdict: "verdadero",
        explanation:
          "Según el BOE, se han publicado 34 reales decretos-ley entre octubre de 2024 y marzo de 2026.",
      },
      {
        claim:
          "El 68% de los españoles cree que el Congreso no funciona",
        verdict: "mayormente-verdadero",
        explanation:
          "El CIS de marzo de 2026 muestra que el 65-70% de los encuestados valora negativamente el funcionamiento del Congreso.",
      },
    ],
  },

  // ── 11. NGEU y cohesión territorial ───────────────────────────────────
  {
    id: "art-011-ngeu-cohesion",
    headline:
      "NGEU y cohesión territorial: fondos que no llegan a quien más los necesita",
    subheadline:
      "Las 8 CCAA con menor PIB per cápita reciben el 31% de los fondos NGEU pero representan el 42% de la población",
    category: "territorio",
    date: "2026-03-30",
    author: "Carlos Martín — Territorio",
    summary:
      "Un análisis de la distribución territorial de los fondos Next Generation EU revela que las 8 comunidades autónomas con menor PIB per cápita (Extremadura, Canarias, Murcia, Castilla-La Mancha, Andalucía, Asturias, Galicia y Cantabria) reciben el 31% de los fondos asignados pese a representar el 42% de la población española. Madrid y Cataluña concentran el 35% de los fondos entre ambas.",
    body: [
      "La Secretaría General de Fondos Europeos ha publicado el desglose territorial de los fondos NGEU ejecutados hasta diciembre de 2025. Del total de 47.000M€ ejecutados, Madrid ha recibido 9.200M€ (19,6%), Cataluña 7.100M€ (15,1%), Andalucía 5.800M€ (12,3%), Comunitat Valenciana 3.900M€ (8,3%) y País Vasco 3.400M€ (7,2%).",
      "La distribución per cápita muestra disparidades significativas: País Vasco recibe 1.540€ per cápita, Madrid 1.380€, Cataluña 910€, mientras que Extremadura recibe 780€, Canarias 690€ y Murcia 640€. La media nacional se sitúa en 990€ per cápita.",
      "Los fondos NGEU se asignan mayoritariamente por criterios de capacidad de gestión y calidad de los proyectos, no por necesidad territorial. Esto favorece estructuralmente a las CCAA con mayor capacidad administrativa y técnica, que coinciden con las más prósperas.",
      "La Comisión Europea ha recomendado a España mejorar la distribución territorial de los fondos en su Country Report 2026, señalando que «la convergencia territorial es un objetivo explícito del NGEU que no se está cumpliendo adecuadamente en España».",
      "El Comité de las Regiones de la UE ha propuesto un «suelo mínimo» del 30% de los fondos NGEU para regiones con PIB per cápita inferior al 75% de la media nacional, pero la propuesta no ha sido adoptada por el Consejo.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Reforma de la distribución NGEU: asignar al menos el 40% de los fondos restantes a las 8 CCAA con indicadores críticos. Creación de 200 equipos técnicos de apoyo para mejorar la capacidad de gestión de las CCAA menos dotadas. Criterios de asignación que ponderen necesidad territorial (40%), calidad del proyecto (40%) y capacidad de ejecución (20%).",
    ianQuote:
      "«Los fondos europeos deben ser un instrumento de convergencia, no de divergencia. Si llegan solo a quien ya tiene, ampliamos la brecha.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "CCAA receptoras netas (Madrid, Cataluña, País Vasco)",
        reason:
          "Oposición a redistribución de fondos que perciben como penalización a la eficiencia",
        severity: "alto",
      },
      {
        actor: "Criterios de la Comisión Europea",
        reason:
          "Los fondos NGEU priorizan reformas e inversiones transformadoras, no cohesión territorial directamente",
        severity: "medio",
      },
      {
        actor: "Capacidad administrativa de CCAA receptoras",
        reason:
          "Incluso con más fondos asignados, la capacidad de ejecución es limitada",
        severity: "alto",
      },
    ],
    partyReactions: [
      psoe(
        "dividido",
        "La distribución sigue criterios objetivos de la Comisión. Pero estamos mejorando la asistencia técnica a las CCAA.",
        0.4,
      ),
      pp(
        "dividido",
        "Denunciamos la opacidad en el reparto pero cada CCAA debe ser responsable de mejorar su capacidad de gestión.",
        0.35,
      ),
      vox(
        "en-contra",
        "El reparto de fondos europeos es un instrumento de control político del Gobierno sobre las CCAA.",
        0.1,
      ),
      sumar(
        "a-favor",
        "Los fondos deben llegar prioritariamente a los territorios con mayor desigualdad. Apoyamos la redistribución.",
        0.8,
      ),
      pnv(
        "en-contra",
        "El País Vasco gestiona eficientemente sus fondos. Penalizar la buena gestión es contraproducente.",
        0.15,
      ),
      erc(
        "en-contra",
        "Catalunya recibe menos per cápita que la media. Redistribuir aún más sería injusto.",
        0.15,
      ),
    ],
    benefitScore: 76,
    benefitAnalysis:
      "Redistribuir los fondos NGEU hacia CCAA con mayor necesidad tendría un efecto multiplicador superior (1,8 en regiones de baja renta vs. 1,3 en regiones de alta renta, según el Banco de España) y contribuiría al objetivo europeo de cohesión territorial. Sin embargo, el riesgo de baja ejecución en las CCAA beneficiadas es real y requiere inversión paralela en capacidad administrativa.",
    pros: [
      {
        point:
          "Mayor efecto multiplicador en regiones de baja renta: 1,8 vs 1,3 en regiones de alta renta",
        source: "Banco de España — Documento de Trabajo 2025/15",
      },
      {
        point:
          "Alineación con el objetivo de cohesión territorial del Reglamento NGEU",
        source: "Reglamento (UE) 2021/241 del Mecanismo de Recuperación y Resiliencia",
      },
      {
        point:
          "Reducción de la desigualdad territorial: cada punto de convergencia en PIB per cápita reduce la emigración interna un 3%",
        source: "CES — Informe sobre Desigualdad Territorial 2025",
      },
    ],
    cons: [
      {
        point:
          "Riesgo de baja ejecución: las CCAA con menor capacidad administrativa podrían no absorber los fondos reasignados",
        source: "IGAE — Informe de Ejecución por CCAA",
      },
      {
        point:
          "Posible conflicto con los criterios de la Comisión Europea, que prioriza calidad sobre territorio",
        source: "Comisión Europea — Country Report Spain 2026",
      },
      {
        point:
          "Desincentivo a la mejora de la gestión: las CCAA eficientes verían reducida su asignación",
        source: "FEDEA — Policy Brief sobre Fondos Europeos",
      },
    ],
    sources: [
      {
        name: "Secretaría General de Fondos Europeos — Distribución Territorial NGEU",
        url: "https://planderecuperacion.gob.es",
      },
      {
        name: "Banco de España — Multiplicadores Regionales",
        url: "https://www.bde.es/investigador/en/menu/working_papers.html",
      },
      {
        name: "Comisión Europea — Country Report Spain 2026",
        url: "https://ec.europa.eu/info/publications/2026-european-semester-country-reports_en",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "NGEU",
      "cohesión territorial",
      "fondos europeos",
      "desigualdad regional",
      "CCAA",
    ],
    relatedArticles: [
      "art-002-ngeu-ejecucion",
      "art-005-cohesion-territorial",
    ],
    factCheck: [
      {
        claim:
          "Las 8 CCAA con menor PIB per cápita reciben el 31% de los fondos NGEU",
        verdict: "mayormente-verdadero",
        explanation:
          "El cálculo exacto depende de la clasificación de algunas partidas como «plurirregionales». Excluyendo estas, las 8 CCAA identificadas reciben entre el 29% y el 33%.",
      },
      {
        claim:
          "Madrid y Cataluña concentran el 35% de los fondos entre ambas",
        verdict: "verdadero",
        explanation:
          "Madrid (19,6%) + Cataluña (15,1%) = 34,7% de los fondos ejecutados a diciembre de 2025.",
      },
      {
        claim:
          "Murcia recibe 640€ per cápita en fondos NGEU",
        verdict: "mayormente-verdadero",
        explanation:
          "El dato varía según si se incluyen fondos canalizados a través de programas estatales. La horquilla es 600-680€ per cápita.",
      },
    ],
  },

  // ── 12. IA y administración pública ───────────────────────────────────
  {
    id: "art-012-ia-administracion",
    headline:
      "IA y administración pública: digitalizar para ahorrar 12.000M€",
    subheadline:
      "Solo el 34% de los trámites administrativos en España son completamente digitales, frente al 89% de Estonia",
    category: "tecnologia",
    date: "2026-03-28",
    author: "David López — Tecnología",
    summary:
      "La digitalización completa de la administración pública española podría generar un ahorro de 12.000 millones de euros anuales, según un estudio de la Secretaría General de Administración Digital. Actualmente, solo el 34% de los trámites son completamente digitales, frente al 89% de Estonia, el 82% de Dinamarca o el 76% de Finlandia. El Partido IAÑ propone integrar inteligencia artificial en la gestión administrativa para reducir plazos y costes.",
    body: [
      "El índice DESI (Digital Economy and Society Index) de la Comisión Europea sitúa a España en el puesto 11 de 27 en servicios públicos digitales. Aunque la posición general es razonable, el porcentaje de trámites «end-to-end» (completamente digitales, sin necesidad de presencialidad) es del 34%, muy por debajo de los líderes nórdicos y bálticos.",
      "El coste estimado de la gestión administrativa presencial y mixta es de 28.000 millones de euros anuales, según la Secretaría General de Administración Digital. La digitalización completa (incluyendo back-office) reduciría este coste a 16.000M€, un ahorro neto de 12.000M€/año.",
      "La Administración General del Estado (AGE) gestiona 2.700 procedimientos administrativos diferentes. De ellos, 1.800 tienen algún componente digital pero solo 920 son completamente digitales. Los principales obstáculos son: sistemas legacy incompatibles (42%), falta de interoperabilidad entre administraciones (31%) y resistencia al cambio del personal (18%).",
      "Varios países han implementado IA en la administración pública con resultados medibles: Estonia (e-Residency, X-Road) ha reducido el tiempo medio de trámite de 15 días a 15 minutos; Dinamarca (borger.dk) procesa el 92% de las solicitudes sin intervención humana; Singapur (LifeSG) ha eliminado el 60% de los formularios mediante «tell-us-once» (datos compartidos entre agencias).",
      "La AIReF ha evaluado que la inversión necesaria para digitalizar completamente la AGE y las administraciones territoriales es de 4.500M€ en un plazo de 5 años, con un periodo de recuperación de la inversión de 2 años.",
    ],
    ianProposal:
      "[PROPUESTA IAÑ] Plan de IA para la Administración Pública: inversión de 4.500M€ en 5 años para digitalización completa. Implantación de IA en tramitación automática de expedientes (objetivo: 80% de trámites sin intervención humana). Principio «tell-us-once»: el ciudadano aporta cada dato una sola vez. Interoperabilidad obligatoria entre todas las administraciones (AGE, CCAA, EELL). Recolocación y formación del personal afectado.",
    ianQuote:
      "«La mejor administración es la que no necesitas visitar. La tecnología existe; lo que falta es voluntad política.» — Portavocía de IAÑ",
    blockers: [
      {
        actor: "Sindicatos de la función pública",
        reason:
          "Preocupación por destrucción de empleo público en tramitación administrativa",
        severity: "alto",
      },
      {
        actor: "Brecha digital ciudadana",
        reason:
          "El 8% de la población española (3,8 millones) no tiene competencias digitales básicas",
        severity: "medio",
      },
      {
        actor: "Sistemas legacy y deuda técnica",
        reason:
          "Reemplazar sistemas informáticos de los años 90-2000 requiere inversión masiva y tiempo",
        severity: "alto",
      },
    ],
    partyReactions: [
      psoe(
        "a-favor",
        "El Plan de Digitalización de las AAPP ya está en marcha con fondos NGEU. Compartimos el objetivo.",
        0.65,
      ),
      pp(
        "a-favor",
        "La administración digital es eficiencia y ahorro. Apoyamos la simplificación y la IA en el sector público.",
        0.7,
      ),
      vox(
        "dividido",
        "Apoyamos la eficiencia pero no el uso de IA que pueda vulnerar derechos o sustituir el criterio humano.",
        0.35,
      ),
      sumar(
        "dividido",
        "La digitalización es necesaria pero debe garantizar que nadie se quede atrás: atención presencial para quien la necesite.",
        0.5,
      ),
      pnv(
        "a-favor",
        "Euskadi es líder en administración digital. Apoyamos la interoperabilidad manteniendo competencias propias.",
        0.65,
      ),
      erc(
        "a-favor",
        "Catalunya ya tiene plataforma propia (AOC). Apoyamos la interoperabilidad si no centraliza la gestión.",
        0.55,
      ),
    ],
    benefitScore: 86,
    benefitAnalysis:
      "La ratio coste-beneficio es excelente: inversión de 4.500M€ para un ahorro anual de 12.000M€, con periodo de recuperación de 2 años. Adicionalmente, la digitalización reduce los tiempos de tramitación (de 45 días de media a 5 días), mejora la transparencia y reduce errores humanos. El principal riesgo es la exclusión digital del 8% de la población.",
    pros: [
      {
        point:
          "Ahorro anual de 12.000M€ con periodo de recuperación de 2 años",
        source: "Secretaría General de Administración Digital — Plan 2025-2030",
      },
      {
        point:
          "Reducción de tiempos de tramitación: de 45 días de media a 5 días",
        source: "OCDE — Digital Government Index 2025",
      },
      {
        point:
          "Mejora de la satisfacción ciudadana: los países con administración digital tienen 20-30 puntos más en satisfacción con el sector público",
        source: "Eurobarómetro — Servicios Públicos 2025",
      },
    ],
    cons: [
      {
        point:
          "Exclusión digital: 3,8 millones de españoles sin competencias digitales básicas necesitan atención presencial",
        source: "INE — Encuesta sobre Equipamiento y Uso de TIC 2025",
      },
      {
        point:
          "Riesgo de sesgos algorítmicos en la tramitación automática de expedientes",
        source: "Agencia Española de Supervisión de IA — Informe Inaugural 2026",
      },
      {
        point:
          "Vulnerabilidades de ciberseguridad: la digitalización total amplía la superficie de ataque",
        source: "CCN-CERT — Informe de Amenazas 2025",
      },
    ],
    sources: [
      {
        name: "Comisión Europea — DESI Index 2025",
        url: "https://digital-strategy.ec.europa.eu/en/policies/desi",
      },
      {
        name: "Secretaría General de Administración Digital",
        url: "https://administracionelectronica.gob.es",
      },
      {
        name: "AIReF — Evaluación del Gasto en Digitalización",
        url: "https://www.airef.es",
      },
    ],
    readingTimeMin: 7,
    importance: "alta",
    tags: [
      "inteligencia artificial",
      "administración digital",
      "e-government",
      "digitalización",
      "ahorro público",
    ],
    relatedArticles: [
      "art-007-semiconductores",
      "art-006-transparencia",
    ],
    factCheck: [
      {
        claim:
          "Solo el 34% de los trámites en España son completamente digitales",
        verdict: "verdadero",
        explanation:
          "El índice DESI 2025 cifra los servicios públicos digitales «end-to-end» en España en el 34%, dato corroborado por la Secretaría General de Administración Digital.",
      },
      {
        claim:
          "La digitalización ahorraría 12.000M€ anuales",
        verdict: "mayormente-verdadero",
        explanation:
          "La cifra proviene de un estudio de la Secretaría General que estima el ahorro en 10.000-14.000M€ dependiendo del nivel de digitalización alcanzado. 12.000M€ asume el escenario medio.",
      },
      {
        claim:
          "Estonia procesa trámites en 15 minutos de media",
        verdict: "mayormente-verdadero",
        explanation:
          "Para trámites estándar (declaración de impuestos, registro de empresas, solicitud de prestaciones), el tiempo medio es de 10-20 minutos. Trámites complejos requieren más tiempo.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Editorial notes
// ---------------------------------------------------------------------------

export const editorials: EditorialNote[] = [
  {
    id: "editorial-001-datos-no-ideologia",
    title: "Datos, no ideología: por qué España necesita un partido basado en evidencia",
    content: `España afronta retos estructurales que no se resuelven con eslóganes: desempleo juvenil del 26%, brecha territorial creciente, ejecución NGEU al 58%, fraude fiscal de 70.000M€ al año. Estos no son problemas de izquierdas ni de derechas: son problemas aritméticos.

El debate político español está atrapado en un bucle de polarización donde cada propuesta se evalúa por quién la hace, no por sus méritos. Cuando el PP propone bajar impuestos, la izquierda lo rechaza por principio. Cuando el PSOE propone más gasto social, la derecha lo bloquea por defecto. Mientras tanto, los problemas se enquistan.

El Partido IAÑ nace de una premisa simple: las decisiones políticas deben basarse en datos verificables, evidencia internacional y análisis coste-beneficio riguroso. No somos de izquierdas ni de derechas: somos de lo que funciona.

Nuestras 8 propuestas legislativas están respaldadas por datos del INE, el Banco de España, Eurostat, la OCDE y la AIReF. Cada una incluye coste estimado, beneficio proyectado, riesgos identificados y evidencia internacional comparable. No prometemos utopías: proyectamos escenarios.

¿Significa esto que no tenemos valores? Al contrario. Nuestro valor fundamental es la honestidad intelectual: presentar los datos tal como son, reconocer los trade-offs de cada medida y someter nuestras propuestas al escrutinio público. Creemos que los ciudadanos merecen ser tratados como adultos capaces de evaluar evidencia, no como audiencias a las que manipular con miedo o esperanza.

Soluciones, no promesas. Datos, no ideología. Este es el periodismo —y la política— que España necesita.`,
    author: "Comité Editorial — El Periódico de IAÑ",
    date: "2026-04-10",
    disclaimer:
      "NOTA: Este texto es un editorial de opinión del Partido IAÑ. No constituye información periodística neutral. Las opiniones expresadas son las del partido y deben evaluarse como tales.",
  },
  {
    id: "editorial-002-urgencia-ngeu",
    title: "La urgencia de los fondos europeos: España no puede permitirse perder esta oportunidad",
    content: `Los fondos Next Generation EU son la mayor transferencia de recursos de la historia de la integración europea. España tiene comprometidos 81.000 millones de euros entre transferencias y préstamos. Es, literalmente, una oportunidad generacional.

Y la estamos desaprovechando.

Con una ejecución del 58% y un calendario que se agota en 2026 para las transferencias y 2028 para los préstamos, España corre el riesgo de perder decenas de miles de millones que podrían transformar nuestra economía. No se trata de gastar por gastar: se trata de invertir en las tres transiciones que definirán la competitividad del siglo XXI: digital, verde e industrial.

Los cuellos de botella son conocidos: burocracia excesiva, falta de capacidad técnica en las administraciones, exigencias documentales desproporcionadas. La solución también es conocida: ventanilla única, plazos tasados, equipos técnicos de apoyo. Lo que falta es voluntad política para implementarla.

Cada día de retraso tiene un coste de oportunidad medible: 130 millones de euros diarios en fondos no ejecutados. Cada semana que pasa sin acelerar la ejecución, España pierde competitividad frente a Italia, Portugal y Grecia, que avanzan más rápido con menos recursos.

No es una cuestión partidista. Es una cuestión de Estado. Los fondos NGEU deben ser la prioridad número uno de cualquier gobierno, independientemente de su color. El futuro de España depende de ello.`,
    author: "Comité Editorial — El Periódico de IAÑ",
    date: "2026-04-09",
    disclaimer:
      "NOTA: Este texto es un editorial de opinión del Partido IAÑ. No constituye información periodística neutral. Las opiniones expresadas son las del partido y deben evaluarse como tales.",
  },
];

// ---------------------------------------------------------------------------
// Breaking news
// ---------------------------------------------------------------------------

export const breakingNews: BreakingNews[] = [
  {
    id: "bn-001",
    headline:
      "ÚLTIMA HORA: La AEAT detecta un incremento del 23% en esquemas de fraude fiscal transfronterizo",
    date: "2026-04-10",
    articleId: "art-001-fraude-fiscal",
  },
  {
    id: "bn-002",
    headline:
      "La Comisión Europea condiciona el 6º desembolso NGEU al cumplimiento de 8 hitos pendientes",
    date: "2026-04-09",
    articleId: "art-002-ngeu-ejecucion",
  },
  {
    id: "bn-003",
    headline:
      "El INE confirma que el alquiler medio sube un 8,7% interanual: máximo histórico",
    date: "2026-04-07",
    articleId: "art-004-vivienda-alquiler",
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories: CategoryInfo[] = [
  { id: "economia", label: "Economía", count: 3 },
  { id: "europa", label: "Europa", count: 2 },
  { id: "sociedad", label: "Sociedad", count: 1 },
  { id: "territorio", label: "Territorio", count: 2 },
  { id: "politica", label: "Política", count: 2 },
  { id: "tecnologia", label: "Tecnología", count: 2 },
];

// ---------------------------------------------------------------------------
// Computed stats
// ---------------------------------------------------------------------------

function computeStats(): PeriodicoStats {
  const allSources = articles.flatMap((a) => a.sources);
  const avgScore =
    Math.round(
      articles.reduce((sum, a) => sum + a.benefitScore, 0) / articles.length,
    );
  const parties = new Set(
    articles.flatMap((a) => a.partyReactions.map((r) => r.party)),
  );

  return {
    totalArticles: articles.length,
    avgBenefitScore: avgScore,
    partiesAnalyzed: parties.size,
    sourcesReferenced: allSources.length,
    lastUpdated: "2026-04-10T08:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// Methodology
// ---------------------------------------------------------------------------

const METHODOLOGY = `El Periódico de IAÑ utiliza una metodología de análisis basada en datos públicos y verificables:

1. FUENTES: Solo se utilizan datos de instituciones oficiales (INE, IGAE, AEAT, Banco de España, Eurostat, OCDE, AIReF, Comisión Europea, Tribunal de Cuentas, CIS, BOE, Congreso de los Diputados) y publicaciones académicas revisadas por pares.

2. PUNTUACIÓN DE BENEFICIO (0-100): Evalúa el impacto potencial de cada propuesta legislativa para España en base a: ratio coste-beneficio (30%), evidencia internacional comparable (25%), viabilidad de implementación (20%), impacto social redistributivo (15%) y consenso parlamentario probable (10%).

3. FACT-CHECK: Cada artículo incluye 2-3 verificaciones de afirmaciones clave con veredictos graduales (verdadero, mayormente verdadero, mixto, engañoso, falso) y explicación de la metodología de verificación.

4. REACCIONES DE PARTIDOS: Se recogen posiciones de todos los grupos parlamentarios relevantes, con estimación de probabilidad de acuerdo basada en su historial de votación y declaraciones públicas.

5. SEPARACIÓN INFORMACIÓN/OPINIÓN: El cuerpo de cada artículo es estrictamente factual y neutral. Las propuestas de IAÑ están claramente etiquetadas como [PROPUESTA IAÑ]. Los editoriales llevan aviso explícito de que son opinión.

6. ACTUALIZACIÓN: Los datos se revisan semanalmente y las puntuaciones se recalculan cuando hay nueva información disponible.`;

// ---------------------------------------------------------------------------
// Assembled dataset
// ---------------------------------------------------------------------------

export const periodicoData: PeriodicoData = {
  articles,
  editorials,
  breakingNews,
  categories,
  stats: computeStats(),
  methodology: METHODOLOGY,
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

export function getArticleById(id: string): NewsArticle | undefined {
  return articles.find((a) => a.id === id);
}

export function getArticlesByCategory(
  category: ArticleCategory,
): NewsArticle[] {
  return articles.filter((a) => a.category === category);
}

export function getPortadaArticles(): NewsArticle[] {
  return articles.filter((a) => a.importance === "portada");
}

export function getArticlesByTag(tag: string): NewsArticle[] {
  return articles.filter((a) =>
    a.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())),
  );
}

export function getRelatedArticles(articleId: string): NewsArticle[] {
  const article = getArticleById(articleId);
  if (!article) return [];
  return article.relatedArticles
    .map((id) => getArticleById(id))
    .filter((a): a is NewsArticle => a !== undefined);
}

export function searchArticles(query: string): NewsArticle[] {
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.headline.toLowerCase().includes(q) ||
      a.subheadline.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
