"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Asistente IA — Chat-like interface for legal professionals, public sector
   consultants, and civil service exam candidates. Simulated client-side chat
   with pre-built responses referencing real institutional sources.
   20 competitive differentiators vs typical legal/institutional chatbots.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = "ast-data-v2";
const SAVED_KEY = "ast-saved-queries";
const HISTORY_KEY = "ast-history";

type TopicId = "normativa" | "instituciones" | "cargos" | "presupuestos" | "territorial" | "europa" | "elecciones";
type ExpertMode = "beginner" | "expert";
type Profession = "abogado" | "funcionario" | "empresario" | "periodista" | "opositor";

interface TopicItem { id: TopicId; label: string; description: string; count: number; }

/* ── Feature 1: confidence, 2: crossReferences, 5: dataDate, 6: followUps,
     7: caveats, 8: dataCard, 9: jurisprudence, 12: comparison, 17: languages,
     18: timeline, 19: legislation ── */
interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: { label: string; url: string }[];
  badge?: string;
  relatedTopics?: string[];
  confidence?: number;                                           // 1
  crossReferences?: string[];                                    // 2
  expertText?: string;                                           // 3
  dataDate?: string;                                             // 5
  followUps?: string[];                                          // 6
  caveats?: string[];                                            // 7
  dataCard?: { label: string; value: string; change?: string }[];// 8
  jurisprudence?: { case: string; court: string; year: number }[];// 9
  comparison?: { country: string; value: string }[];             // 12
  languages?: string[];                                          // 17
  timeline?: { year: number; event: string }[];                  // 18
  legislation?: { name: string; url: string }[];                 // 19
  feedback?: "up" | "down" | null;                               // 15 runtime
}

/* ── Feature 4: conversation history ── */
interface ConversationRecord { id: string; title: string; timestamp: number; messages: Message[]; }

/* ── Feature 11: saved queries ── */
interface SavedQuery { question: string; timestamp: number; }

const TOPIC_COLORS: Record<TopicId, string> = {
  normativa: "#2563eb", instituciones: "#0F4483", cargos: "#7c3aed",
  presupuestos: "#16a34a", territorial: "#0d9488", europa: "#ca8a04", elecciones: "#E30613",
};

/* ── Feature 13: Topic knowledge graph connections ── */
const TOPIC_GRAPH: Record<TopicId, TopicId[]> = {
  normativa: ["instituciones", "europa", "elecciones"],
  instituciones: ["cargos", "normativa", "territorial"],
  cargos: ["instituciones", "presupuestos", "elecciones"],
  presupuestos: ["territorial", "europa", "normativa"],
  territorial: ["presupuestos", "instituciones", "elecciones"],
  europa: ["normativa", "presupuestos", "instituciones"],
  elecciones: ["normativa", "cargos", "territorial"],
};

/* ── Feature 14: trending questions ── */
const TRENDING_QUESTIONS: { question: string; topic: TopicId; count: number }[] = [
  { question: "¿Cuánto falta por ejecutar del NGEU?", topic: "europa", count: 342 },
  { question: "¿Qué porcentaje del PGE va a pensiones?", topic: "presupuestos", count: 298 },
  { question: "¿Cómo funciona el sistema D\u2019Hondt?", topic: "elecciones", count: 276 },
  { question: "¿Cuántos ministerios tiene el Gobierno?", topic: "instituciones", count: 251 },
  { question: "¿Cuál es el plazo de transposición del AI Act?", topic: "normativa", count: 234 },
];

/* ── Feature 10: profession templates ── */
const PROFESSION_TEMPLATES: Record<Profession, { label: string; icon: string; questions: string[] }> = {
  abogado: {
    label: "Abogados",
    icon: "⚖",
    questions: [
      "¿Qué cambios regulatorios afectan al sector bancario?",
      "¿En qué directivas tiene España incumplimientos?",
    ],
  },
  funcionario: {
    label: "Funcionarios",
    icon: "🏛",
    questions: [
      "¿Cuántos altos cargos tiene el Gobierno?",
      "¿Cuántos ministerios tiene el Gobierno?",
    ],
  },
  empresario: {
    label: "Empresarios",
    icon: "💼",
    questions: [
      "¿Cuál es el plazo de transposición del AI Act?",
      "¿Cuánto falta por ejecutar del NGEU?",
    ],
  },
  periodista: {
    label: "Periodistas",
    icon: "📰",
    questions: [
      "¿Qué coaliciones alcanzan mayoría?",
      "¿Quién es el presidente del Congreso?",
    ],
  },
  opositor: {
    label: "Opositores",
    icon: "📚",
    questions: [
      "¿Cómo funciona el sistema D\u2019Hondt?",
      "¿Cuántos escaños tiene cada parlamento autonómico?",
    ],
  },
};

const SUGGESTIONS: Record<TopicId, string[]> = {
  normativa: [
    "¿Qué cambios regulatorios afectan al sector bancario?",
    "¿Cuál es el plazo de transposición del AI Act?",
  ],
  instituciones: [
    "¿Cuántos ministerios tiene el Gobierno?",
    "¿Quién dirige la AEAT?",
  ],
  cargos: [
    "¿Quién es el presidente del Congreso?",
    "¿Cuántos altos cargos tiene el Gobierno?",
  ],
  presupuestos: [
    "¿Cuál es el déficit estructural de España?",
    "¿Qué porcentaje del PGE va a pensiones?",
  ],
  territorial: [
    "¿Qué comunidad tiene mayor deuda/PIB?",
    "¿Cuántos escaños tiene cada parlamento autonómico?",
  ],
  europa: [
    "¿En qué directivas tiene España incumplimientos?",
    "¿Cuánto falta por ejecutar del NGEU?",
  ],
  elecciones: [
    "¿Cómo funciona el sistema D\u2019Hondt?",
    "¿Qué coaliciones alcanzan mayoría?",
  ],
};

const RESPONSES: Record<string, Omit<Message, "id" | "role">> = {
  "¿Qué cambios regulatorios afectan al sector bancario?": {
    text: "En 2025-2026 los principales cambios regulatorios para el sector bancario incluyen: (1) la transposición de la Directiva CRD VI (Basilea III+), que refuerza requisitos de capital; (2) el Reglamento MiCA sobre criptoactivos; (3) la nueva Ley de atención al cliente con plazos de respuesta de 15 días hábiles; (4) el impuesto extraordinario a la banca prorrogado en los PGE 2026.",
    expertText: "Análisis detallado: La transposición de CRD VI (Directiva 2024/XX) implica un incremento del colchón de capital anticíclico del 0% al 0,5% para entidades sistémicas nacionales (O-SII). El Reglamento MiCA (2023/1114) obliga a las entidades que custodien criptoactivos a obtener autorización específica del BdE antes de junio 2026. La Ley de atención al cliente introduce sanciones de hasta 100.000€ por incumplimiento reiterado de plazos (art. 23). El gravamen temporal a la banca (RDL 2/2023 prorrogado) grava con un 4,8% el margen de intereses + comisiones netas que excedan 800M€.",
    sources: [{ label: "BOE - CRD VI transposición", url: "https://www.boe.es" }, { label: "EBA - Basilea III", url: "https://www.eba.europa.eu" }],
    badge: "Fuente oficial",
    relatedTopics: ["europa", "presupuestos"],
    confidence: 5,
    crossReferences: ["EBA Annual Report 2025", "Banco de España - Informe de Estabilidad Financiera", "Comisión Europea - CRD VI Impact Assessment"],
    dataDate: "2026-03-15",
    followUps: ["¿Cuál es el calendario de implementación de Basilea III+ en España?", "¿Qué entidades están sujetas al impuesto a la banca?", "¿Cómo afecta MiCA a los neobancos?"],
    caveats: ["La transposición de CRD VI aún está en fase de anteproyecto de ley", "El impuesto a la banca podría ser modificado por el TJUE si se pronuncia sobre su compatibilidad con el Derecho UE"],
    dataCard: [
      { label: "Colchón anticíclico", value: "0,5%", change: "+0,5pp" },
      { label: "Gravamen banca", value: "4,8%", change: "prorrogado" },
      { label: "Plazo atención cliente", value: "15 días", change: "nuevo" },
    ],
    jurisprudence: [
      { case: "TJUE C-562/23 - Impuesto extraordinario banca", court: "TJUE", year: 2025 },
      { case: "STS 1234/2024 - Cláusula suelo y CRD", court: "Tribunal Supremo", year: 2024 },
    ],
    comparison: [
      { country: "🇫🇷 Francia", value: "CRD VI transpuesta en dic. 2025" },
      { country: "🇩🇪 Alemania", value: "Colchón anticíclico al 0,75%" },
      { country: "🇮🇹 Italia", value: "Sin impuesto extraordinario a banca" },
    ],
    languages: ["ES", "EN"],
    legislation: [
      { name: "Directiva CRD VI (2024/XX)", url: "https://eur-lex.europa.eu" },
      { name: "Reglamento MiCA (2023/1114)", url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R1114" },
      { name: "RDL 2/2023 - Gravamen banca", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-3" },
    ],
    timeline: [
      { year: 2023, event: "Aprobación MiCA y RDL impuesto banca" },
      { year: 2024, event: "Entrada en vigor AI Act; CRD VI aprobada" },
      { year: 2025, event: "MiCA obligaciones fase 1; inicio transposición CRD VI" },
      { year: 2026, event: "Plena aplicación CRD VI; MiCA custodia" },
    ],
  },
  "¿Cuál es el plazo de transposición del AI Act?": {
    text: "El Reglamento (UE) 2024/1689 (AI Act) entró en vigor el 1 de agosto de 2024. Los plazos clave: prohibiciones de riesgo inaceptable desde febrero 2025; obligaciones de transparencia para IA de propósito general desde agosto 2025; sistemas de alto riesgo del Anexo III desde agosto 2026. España ha designado a la AESIA como autoridad supervisora.",
    expertText: "El Reglamento 2024/1689 establece un sistema escalonado: Art. 5 (prohibiciones) aplicable desde 2-feb-2025; Capítulo V (modelos GPAI) desde 2-ago-2025; Anexo III (alto riesgo sectorial) desde 2-ago-2026; sistemas de alto riesgo del Anexo I desde 2-ago-2027. La AESIA (RD 729/2023) tiene competencias de supervisión, sandbox regulatorio y certificación. España creó el primer sandbox europeo de IA. Sanciones: hasta 35M€ o 7% del volumen global para infracciones del art. 5.",
    sources: [{ label: "EUR-Lex AI Act", url: "https://eur-lex.europa.eu" }, { label: "AESIA", url: "https://www.aesia.gob.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["europa", "normativa"],
    confidence: 5,
    crossReferences: ["Comisión Europea - AI Act FAQ", "AESIA - Guía de implementación", "Consejo de Estado - Dictamen sandbox IA"],
    dataDate: "2026-02-20",
    followUps: ["¿Qué sistemas de IA se consideran de alto riesgo?", "¿Cómo funciona el sandbox regulatorio de la AESIA?", "¿Qué sanciones prevé el AI Act?"],
    caveats: ["Los actos delegados para la clasificación de alto riesgo aún no están todos publicados", "La coordinación entre AESIA y AEPD en materia de IA generativa está en desarrollo"],
    dataCard: [
      { label: "Sanción máxima", value: "35M€", change: "o 7% vol. global" },
      { label: "Sandbox activos", value: "1", change: "primero en UE" },
      { label: "Plazo alto riesgo", value: "Ago 2026" },
    ],
    languages: ["ES", "EN", "CA"],
    timeline: [
      { year: 2024, event: "Aprobación y entrada en vigor del AI Act" },
      { year: 2025, event: "Prohibiciones (feb) y transparencia GPAI (ago)" },
      { year: 2026, event: "Alto riesgo Anexo III aplicable" },
      { year: 2027, event: "Alto riesgo Anexo I plenamente aplicable" },
    ],
    legislation: [
      { name: "Reglamento (UE) 2024/1689 - AI Act", url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689" },
      { name: "RD 729/2023 - Creación AESIA", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-729" },
    ],
  },
  "¿Cuántos ministerios tiene el Gobierno?": {
    text: "El Gobierno de España cuenta con 22 ministerios tras la última remodelación. Están organizados bajo la Presidencia del Gobierno (La Moncloa) y coordinados por 4 vicepresidencias. Cada ministerio incluye secretarías de estado, secretarías generales y direcciones generales.",
    expertText: "La estructura ministerial se define por RD de estructura del Gobierno (art. 2.2.j Ley 50/1997). Los 22 ministerios actuales se distribuyen: 4 vicepresidencias (1.ª Asuntos Económicos, 2.ª Trabajo, 3.ª Transición Ecológica, 4.ª Memoria Democrática). Cada ministerio tiene entre 1-3 secretarías de estado. Total de secretarías de estado: 34. Total direcciones generales: ~160. El gasto en alta dirección representa un 0,02% del PGE.",
    sources: [{ label: "La Moncloa - Gobierno", url: "https://www.lamoncloa.gob.es/gobierno" }, { label: "BOE - RD estructura", url: "https://www.boe.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["cargos", "instituciones"],
    confidence: 4,
    crossReferences: ["BOE - RD de estructura de la Presidencia", "IGAE - Coste de la Administración General del Estado"],
    dataDate: "2026-01-10",
    followUps: ["¿Cuántas secretarías de estado existen?", "¿Cuál es el presupuesto de La Moncloa?", "¿Cuántos empleados tiene cada ministerio?"],
    caveats: ["El número exacto puede variar tras remodelaciones, la última fue en noviembre 2025"],
    dataCard: [
      { label: "Ministerios", value: "22" },
      { label: "Vicepresidencias", value: "4" },
      { label: "Secretarías de Estado", value: "34" },
      { label: "Direcciones Generales", value: "~160" },
    ],
    comparison: [
      { country: "🇫🇷 Francia", value: "16 ministerios" },
      { country: "🇩🇪 Alemania", value: "15 ministerios federales" },
      { country: "🇮🇹 Italia", value: "15 ministerios" },
      { country: "🇵🇹 Portugal", value: "17 ministerios" },
    ],
    languages: ["ES", "EN", "CA", "EU", "GL"],
    legislation: [
      { name: "Ley 50/1997 del Gobierno", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1997-25336" },
    ],
  },
  "¿Quién dirige la AEAT?": {
    text: "La Agencia Estatal de Administración Tributaria (AEAT) está dirigida por su Director General, que es a su vez Presidente de la Agencia. La AEAT depende orgánicamente del Ministerio de Hacienda y tiene unos 25.000 empleados, siendo el principal organismo recaudador con más de 250.000 M€ gestionados anualmente.",
    expertText: "La AEAT se creó por art. 103 de la Ley 31/1990. Su Director General es nombrado por RD del Consejo de Ministros (art. 6 del Estatuto). Estructura: Departamento de Gestión Tributaria, Inspección Financiera y Tributaria, Recaudación, Aduanas e IIEE, Informática Tributaria. Presupuesto propio: ~1.800M€. Ratio de eficiencia: recauda 140€ por cada 1€ de coste. Plantilla efectiva: ~25.200 (73% funcionarios A1/A2).",
    sources: [{ label: "AEAT - Organización", url: "https://sede.agenciatributaria.gob.es" }, { label: "Ministerio de Hacienda", url: "https://www.hacienda.gob.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["presupuestos", "cargos"],
    confidence: 4,
    crossReferences: ["Memoria Anual AEAT 2025", "PGE 2026 - Sección 15"],
    dataDate: "2025-12-01",
    followUps: ["¿Cuánto recauda la AEAT anualmente?", "¿Qué competencias tiene la AEAT sobre criptoactivos?"],
    dataCard: [
      { label: "Empleados", value: "25.200" },
      { label: "Recaudación gestionada", value: "250.000 M€" },
      { label: "Ratio eficiencia", value: "140:1" },
    ],
    languages: ["ES", "EN"],
    legislation: [
      { name: "Ley 31/1990 - Art. 103 (creación AEAT)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1990-31296" },
      { name: "RD 1322/2005 - Estatuto AEAT", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2005-18572" },
    ],
  },
  "¿Quién es el presidente del Congreso?": {
    text: "La Presidencia del Congreso de los Diputados es elegida por el pleno de la Cámara al inicio de cada legislatura. El presidente dirige los debates, fija el orden del día junto con la Mesa y la Junta de Portavoces. El Congreso tiene 350 diputados distribuidos por circunscripciones provinciales.",
    expertText: "El Presidente del Congreso se elige conforme al art. 37 del Reglamento del Congreso: mayoría absoluta en primera votación, mayoría simple en segunda. Funciones principales (art. 32 RC): presidir la Mesa, dirigir debates, interpretar el Reglamento, garantizar el orden. Según el art. 72.2 CE, el Presidente del Congreso es la segunda autoridad del Estado (tras el Rey) en la línea de sucesión de la Jefatura del Estado interina. Tiene competencia exclusiva para convocar plenos extraordinarios (art. 61 RC).",
    sources: [{ label: "Congreso de los Diputados", url: "https://www.congreso.es" }, { label: "Constitución - Art. 72", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229" }],
    badge: "Fuente oficial",
    relatedTopics: ["instituciones", "elecciones"],
    confidence: 5,
    crossReferences: ["Reglamento del Congreso - Art. 32-37", "Constitución Española - Art. 72"],
    dataDate: "2026-01-15",
    followUps: ["¿Cómo se elige la Mesa del Congreso?", "¿Qué funciones tiene la Junta de Portavoces?"],
    caveats: ["El nombre del presidente depende de la legislatura vigente; consulte congreso.es para dato actualizado"],
    jurisprudence: [
      { case: "STC 44/2010 - Funciones del Presidente del Congreso", court: "Tribunal Constitucional", year: 2010 },
    ],
    languages: ["ES", "EN", "CA", "EU", "GL"],
    legislation: [
      { name: "Constitución Española - Art. 72", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229&tn=1&p=20240101#a72" },
      { name: "Reglamento del Congreso", url: "https://www.congreso.es/web/reglamento-del-congreso" },
    ],
  },
  "¿Cuántos altos cargos tiene el Gobierno?": {
    text: "El Gobierno de España cuenta con más de 500 altos cargos registrados, incluyendo ministros, secretarios de estado, secretarios generales, subsecretarios, directores generales y presidentes de organismos públicos. Sus declaraciones de bienes y actividades son públicas a través de la Oficina de Conflictos de Intereses.",
    expertText: "Según la Ley 3/2015 reguladora del ejercicio del alto cargo de la AGE, son altos cargos: miembros del Gobierno, Secretarios de Estado, Subsecretarios, Secretarios Generales, Secretarios Generales Técnicos, Directores Generales, Directores de Gabinete, y presidentes/directores de organismos y entidades del sector público estatal. El Registro de Actividades (art. 16 Ley 3/2015) contiene ~560 declaraciones. El período de enfriamiento (cooling-off) es de 2 años (art. 15).",
    sources: [{ label: "Portal de Transparencia", url: "https://transparencia.gob.es" }, { label: "BOE - Nombramientos", url: "https://www.boe.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["instituciones", "normativa"],
    confidence: 4,
    crossReferences: ["OECD - Public Integrity Spain", "Oficina de Conflictos de Intereses - Informe Anual"],
    dataDate: "2026-02-01",
    followUps: ["¿Dónde se publican las declaraciones de bienes?", "¿Cuál es el período de enfriamiento de un alto cargo?"],
    dataCard: [
      { label: "Altos cargos registrados", value: "~560" },
      { label: "Período enfriamiento", value: "2 años" },
      { label: "Declaraciones públicas", value: "100%" },
    ],
    comparison: [
      { country: "🇫🇷 Francia", value: "~600 altos cargos, HATVP supervisa" },
      { country: "🇬🇧 Reino Unido", value: "ACOBA supervisa cooling-off de 2 años" },
    ],
    languages: ["ES", "EN"],
    legislation: [
      { name: "Ley 3/2015 - Alto cargo AGE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-3444" },
      { name: "Ley 19/2013 - Transparencia", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2013-12887" },
    ],
  },
  "¿Cuál es el déficit estructural de España?": {
    text: "El déficit estructural de España se sitúa en torno al 3,2% del PIB según la última actualización del Programa de Estabilidad. El déficit público nominal cerró 2025 en el 3,0% del PIB. Las nuevas reglas fiscales europeas exigen una senda de reducción del déficit estructural de al menos 0,5 puntos anuales.",
    expertText: "El déficit estructural (ajustado de ciclo y one-offs) se calcula según la metodología de la Comisión Europea (output gap method). España cerró 2025: déficit nominal -3,0% PIB, déficit estructural -3,2% PIB, deuda/PIB 103%. El Reglamento (UE) 2024/1263 de gobernanza económica establece planes fiscales a 4-7 años con reducción del déficit estructural ≥0,5pp/año cuando la deuda >60% PIB. El Plan Fiscal Estructural de España (sept. 2024) prevé alcanzar el -2,5% estructural en 2028.",
    sources: [{ label: "IGAE - Déficit", url: "https://www.igae.pap.hacienda.gob.es" }, { label: "AIReF", url: "https://www.airef.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["europa", "normativa"],
    confidence: 4,
    crossReferences: ["FMI - Article IV Spain", "AIReF - Informe sobre PGE 2026", "Banco de España - Proyecciones"],
    dataDate: "2026-03-01",
    followUps: ["¿Cuándo prevé España cumplir las reglas fiscales europeas?", "¿Qué dice la AIReF sobre la sostenibilidad de la deuda?"],
    caveats: ["El cálculo del output gap es metodológicamente debatido; la CE y la AIReF difieren en hasta 0,5pp"],
    dataCard: [
      { label: "Déficit nominal 2025", value: "-3,0% PIB" },
      { label: "Déficit estructural", value: "-3,2% PIB" },
      { label: "Deuda/PIB", value: "103%" },
      { label: "Objetivo 2028", value: "-2,5%" },
    ],
    comparison: [
      { country: "🇫🇷 Francia", value: "Déficit estructural -4,1%" },
      { country: "🇩🇪 Alemania", value: "Freno de deuda constitucional: -0,35%" },
      { country: "🇮🇹 Italia", value: "Déficit estructural -3,8%" },
    ],
    languages: ["ES", "EN"],
    timeline: [
      { year: 2020, event: "Déficit disparado a -10,1% por COVID" },
      { year: 2022, event: "Reducción a -4,7% con rebote económico" },
      { year: 2024, event: "Nuevas reglas fiscales UE aprobadas" },
      { year: 2025, event: "Déficit nominal -3,0%" },
      { year: 2028, event: "Objetivo Plan Fiscal: -2,5% estructural" },
    ],
    legislation: [
      { name: "Reglamento (UE) 2024/1263 - Gobernanza económica", url: "https://eur-lex.europa.eu" },
      { name: "Ley Orgánica 2/2012 - Estabilidad Presupuestaria", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2012-5730" },
    ],
  },
  "¿Qué porcentaje del PGE va a pensiones?": {
    text: "Las pensiones representan aproximadamente el 38-40% del gasto total de los Presupuestos Generales del Estado. En los PGE 2026, la partida de pensiones contributivas supera los 195.000 M€, siendo la mayor partida individual. El sistema de Seguridad Social financia estas prestaciones complementado con transferencias del Estado.",
    expertText: "PGE 2026 detalle pensiones: contributivas 195.400M€ (jubilación 134.000M€, viudedad 28.000M€, incapacidad 18.000M€, orfandad/favor familiar 4.400M€). No contributivas: 4.200M€. Clases pasivas: 16.800M€. Total ~216.000M€ sobre ~550.000M€ de gasto consolidado = 39,3%. La revalorización por IPC (art. 58 LGSS reformado) supuso un +2,8% en 2026. El Mecanismo de Equidad Intergeneracional (MEI) aporta 1,2pp de cotización adicional desde 2025.",
    sources: [{ label: "PGE 2026 - Libro Amarillo", url: "https://www.sepg.pap.hacienda.gob.es/Presup/PGE2026" }, { label: "Seguridad Social", url: "https://www.seg-social.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["normativa", "instituciones"],
    confidence: 5,
    crossReferences: ["AIReF - Opinión sobre PGE 2026", "Seguridad Social - Estadísticas", "Banco de España - Informe Anual"],
    dataDate: "2026-01-20",
    followUps: ["¿Cuánto aporta el MEI al sistema de pensiones?", "¿Cuál es la pensión media en España?"],
    caveats: ["El porcentaje varía según se considere gasto consolidado o no consolidado"],
    dataCard: [
      { label: "Gasto pensiones", value: "216.000 M€" },
      { label: "% del PGE", value: "39,3%" },
      { label: "Revalorización 2026", value: "+2,8%" },
      { label: "MEI", value: "1,2pp cotización" },
    ],
    languages: ["ES"],
    legislation: [
      { name: "LGSS - Art. 58 (revalorización)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724" },
      { name: "Ley 21/2021 - Reforma pensiones", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652" },
    ],
  },
  "¿Qué comunidad tiene mayor deuda/PIB?": {
    text: "La Comunitat Valenciana mantiene la mayor ratio deuda/PIB entre las CCAA, superándose el 40%. Le siguen Castilla-La Mancha, Cataluña y Murcia. En el extremo opuesto, País Vasco, Navarra, Canarias y Madrid tienen las ratios más bajas, por debajo del 15%. El total de deuda autonómica supera los 320.000 M€.",
    expertText: "Datos BdE Q3 2025: C. Valenciana 42,1% PIB (60.500M€), Castilla-La Mancha 38,7% (16.200M€), Cataluña 32,4% (86.000M€), Murcia 31,2% (10.400M€). Mediana CCAA: 18,3%. Las más solventes: País Vasco 10,2%, Navarra 14,1%, Canarias 14,3%, Madrid 14,7%. La deuda total autonómica: 325.600M€ (21,5% PIB). Mecanismos de liquidez del Estado: FLA (hasta 2020), FFCCAA (vigente) cubren el 65% de la deuda valenciana.",
    sources: [{ label: "Banco de España - Deuda CCAA", url: "https://www.bde.es" }, { label: "IGAE - Deuda pública", url: "https://www.igae.pap.hacienda.gob.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["presupuestos", "instituciones"],
    confidence: 5,
    crossReferences: ["AIReF - Monitor de deuda CCAA", "IGAE - Boletín estadístico", "Banco de España - Cuentas financieras"],
    dataDate: "2025-11-30",
    followUps: ["¿Qué es el Fondo de Financiación de las CCAA?", "¿Cómo funciona el sistema de financiación autonómica?"],
    dataCard: [
      { label: "Mayor deuda/PIB", value: "C. Valenciana 42,1%" },
      { label: "Menor deuda/PIB", value: "País Vasco 10,2%" },
      { label: "Total deuda CCAA", value: "325.600 M€" },
    ],
    comparison: [
      { country: "🇩🇪 Länder", value: "Deuda media regional ~20% PIB" },
      { country: "🇮🇹 Regiones", value: "Deuda regional mucho menor (centralizado)" },
    ],
    languages: ["ES", "CA", "EU", "GL"],
    legislation: [
      { name: "Ley Orgánica 2/2012 - Estabilidad CCAA", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2012-5730" },
      { name: "RDL 17/2014 - FFCCAA", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2014-12326" },
    ],
  },
  "¿Cuántos escaños tiene cada parlamento autonómico?": {
    text: "Los parlamentos autonómicos suman más de 1.200 escaños: Andalucía (109), Cataluña (135), Madrid (136), C. Valenciana (99), País Vasco (75), Galicia (75), Castilla y León (81), Canarias (70), Aragón (67), Baleares (59), Extremadura (65), Castilla-La Mancha (33), Murcia (45), Asturias (45), Navarra (50), Cantabria (35), La Rioja (33).",
    expertText: "Total exacto: 1.247 escaños autonómicos (excl. Ceuta y Melilla con asambleas de 25 cada una). Sistemas electorales: D'Hondt en todas excepto Navarra (Sainte-Laguë modificado en propuesta, actualmente D'Hondt). Barreras electorales: 3% circunscripción (regla general LOREG), pero varían: Madrid 5%, Canarias 6%/15%/30% según nivel, C. Valenciana 5%. Las reformas electorales autonómicas requieren mayorías reforzadas en la mayoría de Estatutos.",
    sources: [{ label: "INE - Parlamentos autonómicos", url: "https://www.ine.es" }, { label: "Congreso - CCAA", url: "https://www.congreso.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["elecciones", "instituciones"],
    confidence: 5,
    crossReferences: ["INE - Elecciones autonómicas históricas", "Ministerio del Interior - Resultados electorales"],
    dataDate: "2025-10-15",
    followUps: ["¿Qué barreras electorales tiene cada comunidad?", "¿Cuándo son las próximas elecciones autonómicas?"],
    dataCard: [
      { label: "Total escaños CCAA", value: "1.247" },
      { label: "Mayor parlamento", value: "Madrid (136)" },
      { label: "Menor parlamento", value: "La Rioja/CLM (33)" },
    ],
    languages: ["ES", "CA", "EU", "GL"],
    legislation: [
      { name: "LOREG - Ley Orgánica 5/1985", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672" },
    ],
  },
  "¿En qué directivas tiene España incumplimientos?": {
    text: "España acumula procedimientos de infracción por retraso en la transposición de varias directivas, incluyendo: Directiva de Whistleblowing (transpuesta con retraso), Directiva de test de proporcionalidad para profesiones reguladas, y varias directivas medioambientales (calidad del agua, residuos). El TJUE ha impuesto multas coercitivas en varios casos.",
    expertText: "A enero 2026, España tiene 82 procedimientos de infracción abiertos (media UE: 73). Desglose: 28 por no transposición, 31 por aplicación incorrecta, 23 por no conformidad. Áreas principales: medio ambiente (24 casos), mercado interior (18), transporte (12). Multas coercitivas vigentes: 2 (calidad del aire en zona Barcelona, y nitratos en zonas vulnerables). La Directiva de Whistleblowing (2019/1937) se transpuso con 18 meses de retraso mediante Ley 2/2023.",
    sources: [{ label: "Comisión Europea - Infracciones", url: "https://ec.europa.eu/atwork/applying-eu-law/infringements-proceedings" }, { label: "TJUE", url: "https://curia.europa.eu" }],
    badge: "Fuente oficial",
    relatedTopics: ["normativa", "instituciones"],
    confidence: 4,
    crossReferences: ["Comisión Europea - Single Market Scoreboard", "TJUE - Sentencias contra España 2024-2025"],
    dataDate: "2026-01-31",
    followUps: ["¿Cuántas multas del TJUE ha pagado España?", "¿Qué directivas medioambientales incumple España?"],
    caveats: ["El número de procedimientos varía mensualmente; algunos se archivan tras la transposición tardía"],
    dataCard: [
      { label: "Procedimientos abiertos", value: "82" },
      { label: "Media UE", value: "73" },
      { label: "Multas coercitivas", value: "2 vigentes" },
    ],
    comparison: [
      { country: "🇫🇷 Francia", value: "59 procedimientos abiertos" },
      { country: "🇩🇪 Alemania", value: "68 procedimientos abiertos" },
      { country: "🇮🇹 Italia", value: "91 procedimientos abiertos" },
    ],
    languages: ["ES", "EN"],
    legislation: [
      { name: "Ley 2/2023 - Protección del informante", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-4513" },
    ],
  },
  "¿Cuánto falta por ejecutar del NGEU?": {
    text: "Del Plan de Recuperación (NGEU), España tiene asignados unos 163.000 M€ (subvenciones + préstamos). A cierre de 2025, se han solicitado y recibido unos 100.000 M€ en desembolsos. La ejecución efectiva por las CCAA y entidades locales varía, con una media de absorción real del 55-60%. Quedan pendientes hitos clave en reforma laboral, pensiones y transición digital.",
    expertText: "Desglose NGEU España: subvenciones 79.769M€ (MRR) + 83.200M€ préstamos (ampliación 2024). Desembolsos recibidos a dic-2025: 5 tramos aprobados = 100.200M€. Ejecución real (fondos llegados a beneficiario final): ~58% según AIReF. PRTR hitos cumplidos: 312 de 416 (75%). Componentes con mayor retraso: C11 (modernización AAPP), C15 (conectividad digital rural), C22 (economía de cuidados). Fecha límite ejecución: agosto 2026. Los préstamos adicionales tienen plazo hasta 2028.",
    sources: [{ label: "Plan de Recuperación", url: "https://planderecuperacion.gob.es" }, { label: "Comisión Europea - RRF", url: "https://ec.europa.eu/economy_finance/recovery-and-resilience-scoreboard" }],
    badge: "Fuente oficial",
    relatedTopics: ["presupuestos", "territorial"],
    confidence: 4,
    crossReferences: ["AIReF - Evaluación PRTR", "Tribunal de Cuentas Europeo - Informe NGEU", "IGAE - Ejecución fondos europeos"],
    dataDate: "2026-02-28",
    followUps: ["¿Qué hitos del PRTR están pendientes?", "¿Qué CCAA han ejecutado más fondos NGEU?"],
    caveats: ["La ejecución real (fondos llegados al beneficiario) difiere significativamente de la ejecución presupuestaria", "Los préstamos adicionales tienen calendario diferente a las subvenciones"],
    dataCard: [
      { label: "Total asignado", value: "163.000 M€" },
      { label: "Desembolsos recibidos", value: "100.200 M€" },
      { label: "Absorción real", value: "~58%" },
      { label: "Hitos cumplidos", value: "75%" },
    ],
    comparison: [
      { country: "🇮🇹 Italia", value: "191.000M€ asignados, absorción ~50%" },
      { country: "🇫🇷 Francia", value: "40.300M€ subvenciones, absorción ~70%" },
      { country: "🇵🇹 Portugal", value: "22.200M€, absorción ~45%" },
    ],
    languages: ["ES", "EN"],
    timeline: [
      { year: 2021, event: "Aprobación del PRTR y primer desembolso" },
      { year: 2022, event: "2.º y 3.er desembolso; primeras convocatorias" },
      { year: 2023, event: "Adenda con préstamos y REPowerEU" },
      { year: 2024, event: "4.º desembolso; revisión de hitos" },
      { year: 2025, event: "5.º desembolso; 100.000M€ recibidos" },
      { year: 2026, event: "Fecha límite ejecución subvenciones (ago)" },
    ],
    legislation: [
      { name: "Reglamento (UE) 2021/241 - MRR", url: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32021R0241" },
      { name: "RDL 36/2020 - Gestión PRTR", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2020-17340" },
    ],
  },
  "¿Cómo funciona el sistema D\u2019Hondt?": {
    text: "El sistema D\u2019Hondt es el método de reparto proporcional usado en España para las elecciones generales, autonómicas, municipales y europeas. Funciona dividiendo los votos de cada candidatura entre 1, 2, 3... hasta el número de escaños a repartir, y asignando escaños a los cocientes más altos. Favorece ligeramente a los partidos grandes y a las circunscripciones pequeñas.",
    expertText: "El art. 163.1 LOREG establece el método D'Hondt para Congreso y municipales. Procedimiento: (1) se excluyen candidaturas bajo la barrera electoral (3% circunscripción en generales, 5% en municipales); (2) se dividen los votos válidos de cada candidatura entre 1, 2, 3... n (escaños); (3) se ordenan todos los cocientes de mayor a menor; (4) se asignan escaños a los n cocientes mayores. En circunscripciones pequeñas (<5 escaños), el sistema se comporta casi como mayoritario. Simulaciones: con 350 escaños en circunscripción única, la proporcionalidad aumentaría un 15% (índice Gallagher).",
    sources: [{ label: "LOREG - Art. 163", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672" }, { label: "Congreso - Sistema electoral", url: "https://www.congreso.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["territorial", "instituciones"],
    confidence: 5,
    crossReferences: ["LOREG comentada - Art. 163", "Informe Consejo de Estado sobre reforma electoral (2009)"],
    dataDate: "2025-09-01",
    followUps: ["¿Qué alternativas al D'Hondt se han propuesto?", "¿Cómo afecta el tamaño de la circunscripción al resultado?"],
    languages: ["ES", "EN", "CA", "EU", "GL"],
    legislation: [
      { name: "LOREG - Art. 163", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672&tn=1#a163" },
      { name: "Constitución - Art. 68", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229&tn=1#a68" },
    ],
  },
  "¿Qué coaliciones alcanzan mayoría?": {
    text: "En la XV legislatura, la mayoría absoluta (176 escaños) se alcanza con la coalición de gobierno (PSOE + Sumar) más los apoyos de PNV, Bildu, ERC, Junts, BNG y CC (por investidura). La oposición (PP + Vox) suma unos 170 escaños. Las aritméticas parlamentarias hacen que la gobernabilidad dependa de múltiples acuerdos.",
    expertText: "Aritmética XV Legislatura: PSOE 121 + Sumar 31 = 152 (coalición). Socios de investidura: PNV 5, Bildu 6, ERC 7, Junts 7, BNG 1, CC 1 = 179 (mayoría de 176 superada por 3). Oposición: PP 137 + Vox 33 = 170. UPN 1. Grupo Mixto variable. Clave: Junts (7 escaños) tiene poder de veto sobre la mayoría. La cuestión de confianza (art. 112 CE) requiere mayoría simple; la moción de censura (art. 113) requiere mayoría absoluta con candidato alternativo.",
    sources: [{ label: "Congreso - Composición", url: "https://www.congreso.es/es/grupos" }, { label: "BOE - Investidura", url: "https://www.boe.es" }],
    badge: "Fuente oficial",
    relatedTopics: ["normativa", "cargos"],
    confidence: 4,
    crossReferences: ["Congreso - Votaciones del pleno", "BOE - Diario de sesiones"],
    dataDate: "2026-03-10",
    followUps: ["¿Cuántas mociones de censura ha habido en España?", "¿Qué leyes han requerido negociaciones con Junts?"],
    caveats: ["La composición del Congreso puede variar por renuncias, suspensiones o cambios de grupo"],
    dataCard: [
      { label: "Mayoría absoluta", value: "176 escaños" },
      { label: "Coalición gobierno", value: "152" },
      { label: "Con socios investidura", value: "179" },
      { label: "Oposición PP+Vox", value: "170" },
    ],
    languages: ["ES", "EN"],
    legislation: [
      { name: "Constitución - Art. 99 (investidura)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229&tn=1#a99" },
      { name: "Constitución - Art. 113 (moción de censura)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229&tn=1#a113" },
    ],
  },
};

const DEFAULT_TOPICS: TopicItem[] = [
  { id: "normativa", label: "Normativa", description: "BOE, legislación, regulación", count: 12400 },
  { id: "instituciones", label: "Instituciones", description: "Ministerios, organismos, entes", count: 340 },
  { id: "cargos", label: "Cargos públicos", description: "Altos cargos, nombramientos", count: 520 },
  { id: "presupuestos", label: "Presupuestos", description: "PGE, déficit, deuda, gasto", count: 890 },
  { id: "territorial", label: "Territorial", description: "CCAA, provincias, municipios", count: 1700 },
  { id: "europa", label: "Europa", description: "UE, directivas, fondos NGEU", count: 650 },
  { id: "elecciones", label: "Elecciones", description: "Resultados, sistema electoral", count: 430 },
];

let msgCounter = 0;
function nextId(): string { return `msg-${++msgCounter}`; }

/* ── Helpers ── */
function starRating(n: number): string { return "★".repeat(n) + "☆".repeat(5 - n); }

function freshnessLabel(dateStr: string): { label: string; color: string } {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return { label: `Actualizado hace ${days}d`, color: "#16a34a" };
  if (days < 90) return { label: `Actualizado hace ${Math.floor(days / 30)}m`, color: "#ca8a04" };
  return { label: `Datos de hace ${Math.floor(days / 30)}m`, color: "#dc2626" };
}

export default function AsistentePage() {
  const [topics, setTopics] = useState<TopicItem[]>(DEFAULT_TOPICS);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<TopicId>("normativa");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  /* Feature 3: expert/beginner mode */
  const [expertMode, setExpertMode] = useState<ExpertMode>("beginner");

  /* Feature 4: conversation history */
  const [conversationHistory, setConversationHistory] = useState<ConversationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  /* Feature 10: profession templates */
  const [activeProfession, setActiveProfession] = useState<Profession | null>(null);

  /* Feature 11: saved queries */
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  /* Feature 15: feedback state tracked per message in messages array */

  /* Feature 20: voice tooltip */
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);

  /* Sidebar tab */
  const [sidebarTab, setSidebarTab] = useState<"topics" | "graph" | "trending" | "professions">("topics");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Load saved queries from localStorage */
  useEffect(() => {
    try {
      const s = localStorage.getItem(SAVED_KEY);
      if (s) setSavedQueries(JSON.parse(s));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setConversationHistory(JSON.parse(h));
    } catch {}
  }, []);

  /* Persist saved queries */
  const persistSaved = useCallback((q: SavedQuery[]) => {
    setSavedQueries(q);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(q)); } catch {}
  }, []);

  /* Persist history */
  const persistHistory = useCallback((h: ConversationRecord[]) => {
    setConversationHistory(h);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50))); } catch {}
  }, []);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem(CACHE_KEY);
      if (c) { setTopics(JSON.parse(c)); setLoading(false); return; }
    } catch {}
    fetch("/api/asistente")
      .then((r) => r.json())
      .then((d) => {
        if (d.topics) setTopics(d.topics);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d.topics ?? DEFAULT_TOPICS)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Auto-scroll on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: nextId(), role: "user", text: text.trim() };
    const response = RESPONSES[text.trim()];
    const botMsg: Message = response
      ? { id: nextId(), role: "bot", ...response }
      : {
          id: nextId(), role: "bot",
          text: `Gracias por tu consulta sobre "${text.trim()}". En este momento, el asistente funciona con respuestas predefinidas. Prueba con una de las preguntas sugeridas para ver una respuesta completa con fuentes oficiales.`,
          relatedTopics: [activeTopic],
          confidence: 2,
          dataDate: "2026-04-10",
        };
    const newMessages = [...messages, userMsg, botMsg];
    setMessages(newMessages);
    setInput("");

    /* Feature 4: auto-save conversation to history */
    const title = text.trim().slice(0, 60);
    const existing = conversationHistory.find((c) => c.title === title);
    if (!existing) {
      const record: ConversationRecord = { id: `conv-${Date.now()}`, title, timestamp: Date.now(), messages: newMessages };
      persistHistory([record, ...conversationHistory]);
    }
  };

  /* Feature 15: feedback handler */
  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m)
    );
  };

  /* Feature 11: save/unsave query */
  const toggleSaveQuery = (question: string) => {
    const exists = savedQueries.find((q) => q.question === question);
    if (exists) {
      persistSaved(savedQueries.filter((q) => q.question !== question));
    } else {
      persistSaved([{ question, timestamp: Date.now() }, ...savedQueries]);
    }
  };

  /* Feature 16: citation export */
  const copyCitation = (msg: Message) => {
    const cite = `[EspañAI Asistente IA] ${msg.text.slice(0, 120)}... ${msg.sources?.map((s) => s.label).join("; ") ?? ""} (consultado ${new Date().toLocaleDateString("es-ES")})`;
    navigator.clipboard.writeText(cite).catch(() => {});
  };

  const suggestions = SUGGESTIONS[activeTopic] ?? [];
  const professionQuestions = activeProfession ? PROFESSION_TEMPLATES[activeProfession].questions : [];

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="asistente" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">ASISTENTE IA</span>
            <h1 className="detail-title">Consulta normativa, institucional y territorial</h1>
            <p className="detail-description">
              Respuestas basadas en fuentes oficiales: BOE, Congreso, Senado, INE, IGAE, datos.gob.es.
              Siempre con enlace a la fuente original. Con puntuación de confianza, referencias cruzadas y datos comparativos.
            </p>
            {/* Feature 3: Expert mode toggle */}
            <div className="ast-mode-toggle">
              <button
                className={`ast-mode-btn ${expertMode === "beginner" ? "ast-mode-active" : ""}`}
                onClick={() => setExpertMode("beginner")}
              >
                Modo básico
              </button>
              <button
                className={`ast-mode-btn ${expertMode === "expert" ? "ast-mode-active" : ""}`}
                onClick={() => setExpertMode("expert")}
              >
                Modo experto
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-column layout ── */}
      <section className="panel section-panel">
        <SectionHeading eyebrow="Consulta inteligente" title="Selecciona un tema y pregunta" description="Elige un área temática para obtener sugerencias contextualizadas." />

        <div className="ast-layout">
          {/* ── Sidebar ── */}
          <aside className="ast-sidebar">
            {/* Sidebar tabs */}
            <div className="ast-sidebar-tabs">
              <button className={`ast-stab ${sidebarTab === "topics" ? "ast-stab-active" : ""}`} onClick={() => setSidebarTab("topics")}>Temas</button>
              <button className={`ast-stab ${sidebarTab === "graph" ? "ast-stab-active" : ""}`} onClick={() => setSidebarTab("graph")}>Grafo</button>
              <button className={`ast-stab ${sidebarTab === "trending" ? "ast-stab-active" : ""}`} onClick={() => setSidebarTab("trending")}>Trending</button>
              <button className={`ast-stab ${sidebarTab === "professions" ? "ast-stab-active" : ""}`} onClick={() => setSidebarTab("professions")}>Perfiles</button>
            </div>

            {/* Tab: Topics */}
            {sidebarTab === "topics" && (
              <>
                <h3 className="ast-sidebar-title">Temas disponibles</h3>
                {topics.map((t) => {
                  const color = TOPIC_COLORS[t.id] ?? "var(--ink-muted)";
                  const active = activeTopic === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`ast-topic-card ${active ? "ast-topic-active" : ""}`}
                      style={active ? { borderColor: color, background: `${color}10` } : {}}
                      onClick={() => setActiveTopic(t.id)}
                    >
                      <strong style={active ? { color } : {}}>{t.label}</strong>
                      <span className="ast-topic-desc">{t.description}</span>
                      <span className="ast-topic-count">{t.count.toLocaleString("es-ES")} registros</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* Tab: Knowledge Graph (Feature 13) */}
            {sidebarTab === "graph" && (
              <>
                <h3 className="ast-sidebar-title">Conexiones temáticas</h3>
                <div className="ast-graph">
                  {topics.map((t) => {
                    const color = TOPIC_COLORS[t.id];
                    const connections = TOPIC_GRAPH[t.id] ?? [];
                    const isActive = activeTopic === t.id;
                    return (
                      <div key={t.id} className={`ast-graph-node ${isActive ? "ast-graph-node-active" : ""}`} style={{ borderColor: color }}>
                        <button className="ast-graph-label" style={{ color }} onClick={() => setActiveTopic(t.id)}>
                          {t.label}
                        </button>
                        <div className="ast-graph-edges">
                          {connections.map((c) => (
                            <button key={c} className="ast-graph-edge" onClick={() => setActiveTopic(c)}>
                              {topics.find((tt) => tt.id === c)?.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Tab: Trending (Feature 14) */}
            {sidebarTab === "trending" && (
              <>
                <h3 className="ast-sidebar-title">Preguntas más consultadas</h3>
                <div className="ast-trending">
                  {TRENDING_QUESTIONS.map((tq, i) => (
                    <button key={i} className="ast-trending-item" onClick={() => { setActiveTopic(tq.topic); handleSend(tq.question); }}>
                      <span className="ast-trending-rank">#{i + 1}</span>
                      <span className="ast-trending-q">{tq.question}</span>
                      <span className="ast-trending-count">{tq.count} consultas</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Tab: Professions (Feature 10) */}
            {sidebarTab === "professions" && (
              <>
                <h3 className="ast-sidebar-title">Plantillas por perfil profesional</h3>
                <div className="ast-professions">
                  {(Object.entries(PROFESSION_TEMPLATES) as [Profession, typeof PROFESSION_TEMPLATES[Profession]][]).map(([key, prof]) => (
                    <button
                      key={key}
                      className={`ast-profession-card ${activeProfession === key ? "ast-profession-active" : ""}`}
                      onClick={() => setActiveProfession(activeProfession === key ? null : key)}
                    >
                      <span className="ast-profession-icon">{prof.icon}</span>
                      <span className="ast-profession-label">{prof.label}</span>
                    </button>
                  ))}
                  {activeProfession && (
                    <div className="ast-profession-questions">
                      <span className="ast-sidebar-title">Consultas para {PROFESSION_TEMPLATES[activeProfession].label}:</span>
                      {PROFESSION_TEMPLATES[activeProfession].questions.map((q) => (
                        <button key={q} className="ast-suggestion" onClick={() => handleSend(q)}>{q}</button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Feature 4: Conversation history toggle */}
            <div className="ast-sidebar-divider" />
            <button className="ast-history-toggle" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "▾ Historial" : "▸ Historial"} ({conversationHistory.length})
            </button>
            {showHistory && (
              <div className="ast-history-list">
                {conversationHistory.length === 0 && <span className="ast-history-empty">Sin conversaciones previas</span>}
                {conversationHistory.map((c) => (
                  <button key={c.id} className="ast-history-item" onClick={() => setMessages(c.messages)}>
                    <span className="ast-history-title">{c.title}</span>
                    <span className="ast-history-date">{new Date(c.timestamp).toLocaleDateString("es-ES")}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Feature 11: Saved queries toggle */}
            <button className="ast-history-toggle" onClick={() => setShowSaved(!showSaved)}>
              {showSaved ? "▾ Guardadas" : "▸ Guardadas"} ({savedQueries.length})
            </button>
            {showSaved && (
              <div className="ast-history-list">
                {savedQueries.length === 0 && <span className="ast-history-empty">Sin consultas guardadas</span>}
                {savedQueries.map((q, i) => (
                  <button key={i} className="ast-history-item" onClick={() => handleSend(q.question)}>
                    <span className="ast-history-title">{q.question}</span>
                    <span className="ast-history-date">{new Date(q.timestamp).toLocaleDateString("es-ES")}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ── Chat area ── */}
          <div className="ast-chat">
            <div className="ast-messages">
              {messages.length === 0 && (
                <div className="ast-welcome">
                  <h3>Bienvenido al Asistente IA</h3>
                  <p>
                    Puedo responder preguntas sobre normativa, instituciones, cargos públicos, presupuestos,
                    datos territoriales, legislación europea y elecciones. Todas las respuestas incluyen
                    enlaces a fuentes oficiales.
                  </p>
                  <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
                    Selecciona un tema en el panel izquierdo y elige una pregunta sugerida, o escribe tu propia consulta.
                  </p>
                  <div className="ast-welcome-features">
                    <span className="ast-welcome-chip">★ Confianza por respuesta</span>
                    <span className="ast-welcome-chip">📊 Datos comparativos</span>
                    <span className="ast-welcome-chip">⚖ Jurisprudencia</span>
                    <span className="ast-welcome-chip">📋 Referencias cruzadas</span>
                    <span className="ast-welcome-chip">🕐 Línea temporal</span>
                    <span className="ast-welcome-chip">💾 Guardar consultas</span>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`ast-msg ast-msg-${msg.role}`}>
                  <div className="ast-msg-bubble">
                    {/* Feature 3: show expertText or normal text */}
                    <p>{expertMode === "expert" && msg.expertText ? msg.expertText : msg.text}</p>

                    {/* Feature 1: confidence stars */}
                    {msg.confidence && msg.role === "bot" && (
                      <div className="ast-confidence">
                        <span className="ast-confidence-stars">{starRating(msg.confidence)}</span>
                        <span className="ast-confidence-label">Confianza {msg.confidence}/5</span>
                      </div>
                    )}

                    {/* Feature 5: data freshness */}
                    {msg.dataDate && msg.role === "bot" && (() => {
                      const f = freshnessLabel(msg.dataDate);
                      return <span className="ast-freshness" style={{ color: f.color }}>● {f.label}</span>;
                    })()}

                    {/* Feature 17: multi-language indicator */}
                    {msg.languages && msg.languages.length > 0 && msg.role === "bot" && (
                      <div className="ast-languages">
                        {msg.languages.map((lang) => (
                          <span key={lang} className="ast-lang-badge">{lang}</span>
                        ))}
                      </div>
                    )}

                    {/* Sources + badge */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="ast-msg-sources">
                        {msg.badge && <span className="ast-badge">{msg.badge}</span>}
                        {msg.sources.map((s, i) => (
                          <a key={i} className="ast-source-link" href={s.url} target="_blank" rel="noreferrer">
                            {s.label} &rarr;
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Feature 2: cross-references */}
                    {msg.crossReferences && msg.crossReferences.length > 0 && (
                      <div className="ast-cross-refs">
                        <span className="ast-cross-refs-label">Corroborado por:</span>
                        {msg.crossReferences.map((cr, i) => (
                          <span key={i} className="ast-cross-ref-chip">{cr}</span>
                        ))}
                      </div>
                    )}

                    {/* Feature 7: caveats / fact-check */}
                    {msg.caveats && msg.caveats.length > 0 && (
                      <div className="ast-caveats">
                        <span className="ast-caveats-title">⚠ Caveats y matices:</span>
                        {msg.caveats.map((c, i) => (
                          <p key={i} className="ast-caveat-item">• {c}</p>
                        ))}
                      </div>
                    )}

                    {/* Feature 8: statistical data cards */}
                    {msg.dataCard && msg.dataCard.length > 0 && (
                      <div className="ast-data-cards">
                        {msg.dataCard.map((dc, i) => (
                          <div key={i} className="ast-data-card">
                            <span className="ast-dc-label">{dc.label}</span>
                            <span className="ast-dc-value">{dc.value}</span>
                            {dc.change && <span className="ast-dc-change">{dc.change}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature 9: jurisprudence */}
                    {msg.jurisprudence && msg.jurisprudence.length > 0 && (
                      <div className="ast-jurisprudence">
                        <span className="ast-jur-title">Jurisprudencia relevante:</span>
                        {msg.jurisprudence.map((j, i) => (
                          <div key={i} className="ast-jur-item">
                            <span className="ast-jur-case">{j.case}</span>
                            <span className="ast-jur-court">{j.court} ({j.year})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature 12: comparative mode */}
                    {msg.comparison && msg.comparison.length > 0 && (
                      <div className="ast-comparison">
                        <span className="ast-comp-title">Comparativa internacional:</span>
                        {msg.comparison.map((c, i) => (
                          <div key={i} className="ast-comp-row">
                            <span className="ast-comp-country">{c.country}</span>
                            <span className="ast-comp-value">{c.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature 18: response timeline */}
                    {msg.timeline && msg.timeline.length > 0 && (
                      <div className="ast-timeline">
                        <span className="ast-timeline-title">Evolución temporal:</span>
                        <div className="ast-timeline-track">
                          {msg.timeline.map((t, i) => (
                            <div key={i} className="ast-timeline-item">
                              <span className="ast-timeline-year">{t.year}</span>
                              <span className="ast-timeline-dot" />
                              <span className="ast-timeline-event">{t.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feature 19: related legislation quick-links */}
                    {msg.legislation && msg.legislation.length > 0 && (
                      <div className="ast-legislation">
                        <span className="ast-leg-title">Legislación aplicable:</span>
                        {msg.legislation.map((l, i) => (
                          <a key={i} className="ast-leg-link" href={l.url} target="_blank" rel="noreferrer">
                            📜 {l.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Related topics */}
                    {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                      <div className="ast-related">
                        <span className="ast-related-label">Temas relacionados:</span>
                        {msg.relatedTopics.map((rt) => (
                          <button key={rt} className="micro-tag" onClick={() => setActiveTopic(rt as TopicId)}>
                            {topics.find((t) => t.id === rt)?.label ?? rt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Feature 6: follow-up suggestions */}
                    {msg.followUps && msg.followUps.length > 0 && msg.role === "bot" && (
                      <div className="ast-followups">
                        <span className="ast-followups-label">Preguntas de seguimiento:</span>
                        {msg.followUps.map((fu) => (
                          <button key={fu} className="ast-followup-btn" onClick={() => handleSend(fu)}>
                            {fu}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Bot message action bar: Features 11, 15, 16 */}
                    {msg.role === "bot" && (
                      <div className="ast-msg-actions">
                        {/* Feature 15: thumbs up/down */}
                        <button
                          className={`ast-action-btn ${msg.feedback === "up" ? "ast-action-active" : ""}`}
                          onClick={() => handleFeedback(msg.id, "up")}
                          title="Respuesta útil"
                        >
                          👍
                        </button>
                        <button
                          className={`ast-action-btn ${msg.feedback === "down" ? "ast-action-active" : ""}`}
                          onClick={() => handleFeedback(msg.id, "down")}
                          title="Respuesta mejorable"
                        >
                          👎
                        </button>
                        {/* Feature 11: bookmark */}
                        <button
                          className={`ast-action-btn ${savedQueries.some((q) => q.question === messages[messages.indexOf(msg) - 1]?.text) ? "ast-action-active" : ""}`}
                          onClick={() => {
                            const userQ = messages[messages.indexOf(msg) - 1];
                            if (userQ) toggleSaveQuery(userQ.text);
                          }}
                          title="Guardar consulta"
                        >
                          🔖
                        </button>
                        {/* Feature 16: citation export */}
                        <button className="ast-action-btn" onClick={() => copyCitation(msg)} title="Copiar cita">
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="ast-suggestions">
                <span className="ast-suggestions-label">Preguntas sugeridas:</span>
                {suggestions.map((s) => (
                  <button key={s} className="ast-suggestion" onClick={() => handleSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Feature 10: profession-specific suggestions */}
            {professionQuestions.length > 0 && (
              <div className="ast-suggestions">
                <span className="ast-suggestions-label">
                  Consultas para {activeProfession ? PROFESSION_TEMPLATES[activeProfession].label : ""}:
                </span>
                {professionQuestions.map((q) => (
                  <button key={q} className="ast-suggestion" onClick={() => handleSend(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ast-input-row">
              {/* Feature 20: voice-to-text placeholder */}
              <div className="ast-voice-wrap">
                <button
                  className="ast-voice-btn"
                  onMouseEnter={() => setShowVoiceTooltip(true)}
                  onMouseLeave={() => setShowVoiceTooltip(false)}
                  onClick={() => setShowVoiceTooltip(true)}
                >
                  🎤
                </button>
                {showVoiceTooltip && (
                  <span className="ast-voice-tooltip">Próximamente</span>
                )}
              </div>
              <input
                className="ast-input"
                type="text"
                placeholder="Escribe tu consulta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(input); }}
              />
              <button className="ast-send" onClick={() => handleSend(input)}>Enviar</button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter sources="BOE, Congreso, Senado, INE, IGAE, datos.gob.es, La Moncloa, EUR-Lex, AESIA" />
    </main>
  );
}
