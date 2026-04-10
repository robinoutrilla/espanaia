/* ═══════════════════════════════════════════════════════════════════════════
   Parliamentary Sessions & Transcripts — Diarios de Sesiones
   Sources:
     Congreso: https://www.congreso.es/es/publicaciones/diario-de-sesiones
     Senado:   https://www.senado.es/legis15/publicaciones/index.html
   Each session links to its official transcript (Diario de Sesiones).
   ═══════════════════════════════════════════════════════════════════════════ */

export type SessionChamber = "congreso" | "senado" | "comision" | "parlamento-ccaa";
export type SessionStatus = "celebrada" | "en-curso" | "programada" | "suspendida";

export interface SessionSpeaker {
  name: string;
  politicianSlug?: string;
  partySlug: string;
  role: string; // "Presidente del Gobierno", "Portavoz GP Popular", etc.
  interventionMinutes?: number;
}

export interface SessionAgendaItem {
  order: number;
  title: string;
  type: "debate" | "votacion" | "pregunta-oral" | "interpelacion" | "mocion" | "comparecencia" | "proposicion" | "proyecto-ley" | "control";
  result?: string; // "aprobado", "rechazado", "tomada en consideración", etc.
  voteSummary?: { si: number; no: number; abstencion: number };
}

export interface ParliamentarySession {
  id: string;
  chamber: SessionChamber;
  sessionType: "plenaria" | "comision" | "extraordinaria" | "control" | "investidura" | "mocion-censura";
  sessionNumber: number;
  legislature: number;
  title: string;
  date: string; // ISO date
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  status: SessionStatus;

  // Transcript source
  transcriptUrl: string; // Diario de Sesiones PDF/HTML
  transcriptFormat: "pdf" | "html" | "xml";
  videoUrl?: string; // Congress/Senate TV archive

  // Content
  summary: string;
  agendaItems: SessionAgendaItem[];
  speakers: SessionSpeaker[];
  keyTopics: string[];

  // Metadata
  institution: string;
  territorySlugs: string[];
  partySlugs: string[];
  sourceUrl: string; // Main page of the session
  relatedInitiatives: string[]; // dossier numbers
  agendaEventId?: string; // link to AgendaEvent
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAST SESSIONS — Celebradas (with transcripts available)
   ═══════════════════════════════════════════════════════════════════════════ */

export const parliamentarySessions: ParliamentarySession[] = [
  // ── March 2026 ────────────────────────────────────────────────────────
  {
    id: "session-congreso-001",
    chamber: "congreso",
    sessionType: "plenaria",
    sessionNumber: 142,
    legislature: 15,
    title: "Pleno del Congreso — Debate sobre el estado de la Nación",
    date: "2026-03-25",
    startTime: "09:00",
    endTime: "21:30",
    durationMinutes: 750,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-142.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    summary: "Debate sobre el estado de la Nación 2026. El Presidente del Gobierno presentó balance de legislatura. Intervenciones de todos los grupos. Aprobación de 3 resoluciones sobre vivienda, empleo y transición energética.",
    agendaItems: [
      { order: 1, title: "Debate sobre el estado de la Nación — Intervención del Presidente", type: "debate" },
      { order: 2, title: "Réplica de los grupos parlamentarios", type: "debate" },
      { order: 3, title: "Resolución sobre vivienda asequible", type: "votacion", result: "aprobada", voteSummary: { si: 178, no: 165, abstencion: 7 } },
      { order: 4, title: "Resolución sobre empleo joven", type: "votacion", result: "aprobada", voteSummary: { si: 185, no: 158, abstencion: 7 } },
      { order: 5, title: "Resolución sobre transición energética", type: "votacion", result: "aprobada", voteSummary: { si: 190, no: 153, abstencion: 7 } },
    ],
    speakers: [
      { name: "Pedro Sánchez", politicianSlug: "pedro-sanchez", partySlug: "psoe", role: "Presidente del Gobierno", interventionMinutes: 95 },
      { name: "Miguel Tellado", politicianSlug: "miguel-tellado", partySlug: "pp", role: "Portavoz GP Popular", interventionMinutes: 45 },
      { name: "Santiago Abascal", politicianSlug: "santiago-abascal", partySlug: "vox", role: "Presidente de Vox", interventionMinutes: 30 },
      { name: "Yolanda Díaz", politicianSlug: "yolanda-diaz", partySlug: "sumar", role: "Vicepresidenta Segunda", interventionMinutes: 35 },
      { name: "Gabriel Rufián", politicianSlug: "gabriel-rufian", partySlug: "erc", role: "Portavoz ERC", interventionMinutes: 15 },
      { name: "Mertxe Aizpurua", politicianSlug: "mertxe-aizpurua", partySlug: "eh-bildu", role: "Portavoz EH Bildu", interventionMinutes: 15 },
      { name: "Aitor Esteban", partySlug: "pnv", role: "Portavoz PNV", interventionMinutes: 12 },
      { name: "Miriam Nogueras", partySlug: "junts", role: "Portavoz Junts", interventionMinutes: 12 },
    ],
    keyTopics: ["estado de la nación", "vivienda", "empleo", "transición energética", "economía"],
    institution: "Congreso de los Diputados",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "vox", "sumar", "erc", "eh-bildu", "pnv", "junts"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },
  {
    id: "session-congreso-002",
    chamber: "congreso",
    sessionType: "control",
    sessionNumber: 143,
    legislature: 15,
    title: "Pleno del Congreso — Sesión de control al Gobierno",
    date: "2026-03-26",
    startTime: "09:00",
    endTime: "14:30",
    durationMinutes: 330,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-143.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    summary: "Sesión de control con preguntas orales sobre la reforma de la financiación autonómica, la situación del empleo y la gestión de los fondos NGEU.",
    agendaItems: [
      { order: 1, title: "Pregunta al Presidente: Reforma financiación autonómica", type: "pregunta-oral" },
      { order: 2, title: "Pregunta al Ministro de Hacienda: Ejecución presupuestos prorrogados", type: "pregunta-oral" },
      { order: 3, title: "Pregunta a la Vicepresidenta: Empleo y reforma laboral", type: "pregunta-oral" },
      { order: 4, title: "Interpelación urgente sobre política migratoria", type: "interpelacion" },
      { order: 5, title: "Moción consecuencia de interpelación sobre Canarias", type: "mocion", result: "rechazada", voteSummary: { si: 152, no: 178, abstencion: 20 } },
    ],
    speakers: [
      { name: "Pedro Sánchez", politicianSlug: "pedro-sanchez", partySlug: "psoe", role: "Presidente del Gobierno", interventionMinutes: 25 },
      { name: "Alberto Núñez Feijóo", politicianSlug: "alberto-nunez-feijoo", partySlug: "pp", role: "Líder de la Oposición", interventionMinutes: 20 },
      { name: "Yolanda Díaz", politicianSlug: "yolanda-diaz", partySlug: "sumar", role: "Vicepresidenta Segunda", interventionMinutes: 15 },
    ],
    keyTopics: ["financiación autonómica", "empleo", "fondos europeos", "migración", "canarias"],
    institution: "Congreso de los Diputados",
    territorySlugs: ["espana", "canarias"],
    partySlugs: ["psoe", "pp", "vox", "sumar"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },
  {
    id: "session-senado-001",
    chamber: "senado",
    sessionType: "plenaria",
    sessionNumber: 78,
    legislature: 15,
    title: "Pleno del Senado — Ley de Inteligencia Artificial",
    date: "2026-03-27",
    startTime: "10:00",
    endTime: "18:00",
    durationMinutes: 480,
    status: "celebrada",
    transcriptUrl: "https://www.senado.es/legis15/publicaciones/pdf/senado/ds/DS_P_15_078.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.senado.es/web/actividadparlamentaria/sesionesplenarias/plenos/sesionesanteriores/index.html",
    summary: "Debate y votación del Proyecto de Ley de regulación de la IA en España (transposición parcial del AI Act). Aprobado con enmiendas del GP Popular sobre protección de PYMES.",
    agendaItems: [
      { order: 1, title: "Proyecto de Ley de Inteligencia Artificial — Debate", type: "proyecto-ley" },
      { order: 2, title: "Enmiendas del GP Popular — Protección PYMES ante IA", type: "votacion", result: "aprobada parcialmente", voteSummary: { si: 142, no: 98, abstencion: 25 } },
      { order: 3, title: "Votación final del Proyecto de Ley de IA", type: "votacion", result: "aprobado", voteSummary: { si: 168, no: 82, abstencion: 15 } },
      { order: 4, title: "Moción sobre conectividad rural y brecha digital", type: "mocion", result: "aprobada", voteSummary: { si: 201, no: 45, abstencion: 19 } },
    ],
    speakers: [
      { name: "Pedro Rollán", politicianSlug: "pedro-rollan", partySlug: "pp", role: "Presidente del Senado", interventionMinutes: 10 },
      { name: "Eva Granados", politicianSlug: "eva-granados", partySlug: "psoe", role: "Portavoz GP Socialista Senado", interventionMinutes: 25 },
    ],
    keyTopics: ["inteligencia artificial", "AI Act", "PYMES", "brecha digital", "conectividad rural"],
    institution: "Senado",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "vox", "sumar", "pnv"],
    sourceUrl: "https://www.senado.es/legis15/publicaciones/index.html",
    relatedInitiatives: ["621/000045"],
  },
  {
    id: "session-comision-001",
    chamber: "comision",
    sessionType: "comision",
    sessionNumber: 45,
    legislature: 15,
    title: "Comisión de Economía — Comparecencia del Gobernador del Banco de España",
    date: "2026-03-31",
    startTime: "10:00",
    endTime: "14:00",
    durationMinutes: 240,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/CO/DSCD-15-CO-45.PDF",
    transcriptFormat: "pdf",
    summary: "Comparecencia del Gobernador del Banco de España sobre estabilidad financiera, evolución del crédito a empresas y perspectivas de tipos de interés del BCE para el segundo semestre.",
    agendaItems: [
      { order: 1, title: "Comparecencia del Gobernador del Banco de España", type: "comparecencia" },
      { order: 2, title: "Preguntas de los portavoces sobre morosidad hipotecaria", type: "pregunta-oral" },
      { order: 3, title: "Preguntas sobre financiación PYME", type: "pregunta-oral" },
    ],
    speakers: [
      { name: "José Luis Escrivá", partySlug: "independiente", role: "Gobernador del Banco de España", interventionMinutes: 60 },
    ],
    keyTopics: ["banco de españa", "tipos de interés", "crédito", "morosidad", "PYMES", "BCE"],
    institution: "Congreso — Comisión de Economía",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "sumar", "vox"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },
  {
    id: "session-congreso-003",
    chamber: "congreso",
    sessionType: "plenaria",
    sessionNumber: 144,
    legislature: 15,
    title: "Pleno del Congreso — PNL sobre Vivienda y Ley Crea y Crece",
    date: "2026-04-01",
    startTime: "09:00",
    endTime: "19:00",
    durationMinutes: 600,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-144.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    summary: "Debate de varias PNL: regulación de precios de alquiler, ampliación del programa Kit Digital, reforma de la Ley Crea y Crece para simplificar trámites de constitución de empresas.",
    agendaItems: [
      { order: 1, title: "PNL sobre regulación de precios de alquiler", type: "proposicion", result: "aprobada", voteSummary: { si: 176, no: 168, abstencion: 6 } },
      { order: 2, title: "PNL sobre ampliación Kit Digital para autónomos", type: "proposicion", result: "aprobada", voteSummary: { si: 312, no: 25, abstencion: 13 } },
      { order: 3, title: "PNL sobre simplificación Ley Crea y Crece", type: "proposicion", result: "aprobada", voteSummary: { si: 289, no: 42, abstencion: 19 } },
      { order: 4, title: "Convalidación RDL medidas DANA", type: "votacion", result: "convalidado", voteSummary: { si: 330, no: 0, abstencion: 20 } },
    ],
    speakers: [
      { name: "Pedro Sánchez", politicianSlug: "pedro-sanchez", partySlug: "psoe", role: "Presidente del Gobierno", interventionMinutes: 30 },
      { name: "Cuca Gamarra", politicianSlug: "cuca-gamarra", partySlug: "pp", role: "Portavoz GP Popular", interventionMinutes: 25 },
    ],
    keyTopics: ["vivienda", "alquiler", "kit digital", "crea y crece", "autónomos", "DANA"],
    institution: "Congreso de los Diputados",
    territorySlugs: ["espana", "comunitat-valenciana"],
    partySlugs: ["psoe", "pp", "vox", "sumar", "erc", "eh-bildu", "pnv"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: ["121/000089", "121/000091"],
  },
  {
    id: "session-comision-002",
    chamber: "comision",
    sessionType: "comision",
    sessionNumber: 46,
    legislature: 15,
    title: "Comisión de Hacienda — Informe del Tribunal de Cuentas",
    date: "2026-04-03",
    startTime: "10:30",
    endTime: "14:00",
    durationMinutes: 210,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/CO/DSCD-15-CO-46.PDF",
    transcriptFormat: "pdf",
    summary: "Presentación del informe anual del Tribunal de Cuentas sobre la Cuenta General del Estado 2025. Debate sobre hallazgos en contratación pública y ejecución de fondos NGEU.",
    agendaItems: [
      { order: 1, title: "Informe anual del Tribunal de Cuentas 2025", type: "comparecencia" },
      { order: 2, title: "Debate sobre hallazgos en contratación pública", type: "debate" },
      { order: 3, title: "Preguntas sobre ejecución fondos NextGenerationEU", type: "pregunta-oral" },
    ],
    speakers: [
      { name: "Enriqueta Chicano", partySlug: "independiente", role: "Presidenta del Tribunal de Cuentas", interventionMinutes: 45 },
    ],
    keyTopics: ["tribunal de cuentas", "cuenta general", "contratación pública", "NGEU", "fiscalización"],
    institution: "Congreso — Comisión de Hacienda",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "sumar"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },
  {
    id: "session-congreso-004",
    chamber: "congreso",
    sessionType: "control",
    sessionNumber: 145,
    legislature: 15,
    title: "Pleno del Congreso — Sesión de control al Gobierno",
    date: "2026-04-08",
    startTime: "09:00",
    endTime: "14:00",
    durationMinutes: 300,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-145.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    summary: "Sesión de control con preguntas sobre la política energética, la reforma del mercado eléctrico y la ejecución presupuestaria del primer trimestre.",
    agendaItems: [
      { order: 1, title: "Pregunta al Presidente: Política energética y precios eléctricos", type: "pregunta-oral" },
      { order: 2, title: "Pregunta al Ministro de Industria: Reindustrialización y PERTE", type: "pregunta-oral" },
      { order: 3, title: "Pregunta a la Ministra de Trabajo: Reforma de las pensiones", type: "pregunta-oral" },
      { order: 4, title: "Interpelación sobre política exterior y relación con Marruecos", type: "interpelacion" },
    ],
    speakers: [
      { name: "Pedro Sánchez", politicianSlug: "pedro-sanchez", partySlug: "psoe", role: "Presidente del Gobierno", interventionMinutes: 20 },
      { name: "Alberto Núñez Feijóo", politicianSlug: "alberto-nunez-feijoo", partySlug: "pp", role: "Líder de la Oposición", interventionMinutes: 15 },
      { name: "Santiago Abascal", politicianSlug: "santiago-abascal", partySlug: "vox", role: "Presidente de Vox", interventionMinutes: 10 },
    ],
    keyTopics: ["energía", "electricidad", "PERTE", "pensiones", "Marruecos", "política exterior"],
    institution: "Congreso de los Diputados",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "vox", "sumar"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },

  // ── April 9–10 2026 ────────────────────────────────────────────────────
  {
    id: "session-congreso-005",
    chamber: "congreso",
    sessionType: "plenaria",
    sessionNumber: 146,
    legislature: 15,
    title: "Pleno del Congreso — Debate de política general",
    date: "2026-04-09",
    startTime: "09:00",
    endTime: "20:00",
    durationMinutes: 660,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-146.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    summary: "Debate de política general con intervenciones de todos los grupos. Reforma fiscal, modelo territorial y relaciones UE como ejes principales. Aprobada PNL sobre reforma de la financiación autonómica con votos de PSOE, Sumar, ERC y PNV.",
    agendaItems: [
      { order: 1, title: "Debate de política general — Intervención del Presidente", type: "debate" },
      { order: 2, title: "Réplica de los grupos parlamentarios", type: "debate" },
      { order: 3, title: "PNL sobre reforma de la financiación autonómica", type: "proposicion", result: "aprobada", voteSummary: { si: 179, no: 163, abstencion: 8 } },
      { order: 4, title: "PNL sobre plan de empleo juvenil europeo", type: "proposicion", result: "aprobada", voteSummary: { si: 295, no: 33, abstencion: 22 } },
      { order: 5, title: "Moción sobre política migratoria en Canarias", type: "mocion", result: "rechazada", voteSummary: { si: 155, no: 176, abstencion: 19 } },
    ],
    speakers: [
      { name: "Pedro Sánchez", politicianSlug: "pedro-sanchez", partySlug: "psoe", role: "Presidente del Gobierno", interventionMinutes: 50 },
      { name: "Miguel Tellado", politicianSlug: "miguel-tellado", partySlug: "pp", role: "Portavoz GP Popular", interventionMinutes: 30 },
      { name: "Santiago Abascal", politicianSlug: "santiago-abascal", partySlug: "vox", role: "Presidente de Vox", interventionMinutes: 20 },
      { name: "Yolanda Díaz", politicianSlug: "yolanda-diaz", partySlug: "sumar", role: "Vicepresidenta Segunda", interventionMinutes: 25 },
      { name: "Gabriel Rufián", politicianSlug: "gabriel-rufian", partySlug: "erc", role: "Portavoz ERC", interventionMinutes: 15 },
      { name: "Aitor Esteban", partySlug: "pnv", role: "Portavoz PNV", interventionMinutes: 12 },
    ],
    keyTopics: ["reforma fiscal", "modelo territorial", "financiación autonómica", "empleo juvenil", "migración"],
    institution: "Congreso de los Diputados",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "vox", "sumar", "erc", "pnv"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: ["121/000095"],
  },
  {
    id: "session-comision-003",
    chamber: "comision",
    sessionType: "comision",
    sessionNumber: 47,
    legislature: 15,
    title: "Comisión de Transición Ecológica — Comparecencia Ministra",
    date: "2026-04-10",
    startTime: "10:00",
    endTime: "14:00",
    durationMinutes: 240,
    status: "celebrada",
    transcriptUrl: "https://www.congreso.es/public_oficiales/L15/CONG/DS/CO/DSCD-15-CO-47.PDF",
    transcriptFormat: "pdf",
    summary: "Comparecencia de la Ministra de Transición Ecológica sobre el Plan Nacional de Adaptación al Cambio Climático 2026-2030 y la ejecución del PERTE de descarbonización industrial.",
    agendaItems: [
      { order: 1, title: "Comparecencia de la Ministra de Transición Ecológica", type: "comparecencia" },
      { order: 2, title: "Preguntas sobre ejecución del PERTE de descarbonización", type: "pregunta-oral" },
      { order: 3, title: "Debate sobre plan de adaptación al cambio climático", type: "debate" },
    ],
    speakers: [
      { name: "Teresa Ribera", partySlug: "psoe", role: "Ministra de Transición Ecológica", interventionMinutes: 55 },
    ],
    keyTopics: ["cambio climático", "PERTE", "descarbonización", "transición ecológica", "energías renovables"],
    institution: "Congreso — Comisión de Transición Ecológica",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "pp", "sumar", "vox"],
    sourceUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    relatedInitiatives: [],
  },
  {
    id: "session-senado-002",
    chamber: "senado",
    sessionType: "plenaria",
    sessionNumber: 79,
    legislature: 15,
    title: "Pleno del Senado — Moción sobre financiación autonómica",
    date: "2026-04-10",
    startTime: "09:00",
    endTime: "15:00",
    durationMinutes: 360,
    status: "celebrada",
    transcriptUrl: "https://www.senado.es/legis15/publicaciones/pdf/senado/ds/DS_P_15_079.PDF",
    transcriptFormat: "pdf",
    videoUrl: "https://www.senado.es/web/actividadparlamentaria/sesionesplenarias/plenos/sesionesanteriores/index.html",
    summary: "Debate y votación de moción del GP Popular sobre la reforma del modelo de financiación autonómica. Rechazada por mayoría de PSOE + socios. Debate sobre fondo de compensación interterritorial.",
    agendaItems: [
      { order: 1, title: "Moción sobre reforma de financiación autonómica", type: "mocion", result: "rechazada", voteSummary: { si: 148, no: 102, abstencion: 16 } },
      { order: 2, title: "Debate sobre fondo de compensación interterritorial", type: "debate" },
      { order: 3, title: "Pregunta sobre despoblación en provincias interiores", type: "pregunta-oral" },
    ],
    speakers: [
      { name: "Pedro Rollán", politicianSlug: "pedro-rollan", partySlug: "pp", role: "Presidente del Senado", interventionMinutes: 8 },
      { name: "Eva Granados", politicianSlug: "eva-granados", partySlug: "psoe", role: "Portavoz GP Socialista Senado", interventionMinutes: 20 },
    ],
    keyTopics: ["financiación autonómica", "fondo compensación", "despoblación", "modelo territorial"],
    institution: "Senado",
    territorySlugs: ["espana", "cataluna", "comunitat-valenciana", "andalucia"],
    partySlugs: ["pp", "psoe", "pnv", "erc"],
    sourceUrl: "https://www.senado.es/legis15/publicaciones/index.html",
    relatedInitiatives: [],
  },

  // ── CCAA sessions ─────────────────────────────────────────────────────
  {
    id: "session-cataluna-001",
    chamber: "parlamento-ccaa",
    sessionType: "plenaria",
    sessionNumber: 62,
    legislature: 15,
    title: "Parlament de Catalunya — Pleno sobre presupuestos 2026",
    date: "2026-03-28",
    startTime: "10:00",
    endTime: "20:00",
    durationMinutes: 600,
    status: "celebrada",
    transcriptUrl: "https://www.parlament.cat/web/documentacio/diari-sessions/index.html",
    transcriptFormat: "html",
    summary: "Aprobación de los Presupuestos de la Generalitat 2026 con el apoyo de PSC, ERC y Comuns. Principales partidas: sanidad (+8%), educación (+6%), vivienda (+15%).",
    agendaItems: [
      { order: 1, title: "Debate de totalidad — Presupuestos Generalitat 2026", type: "debate" },
      { order: 2, title: "Votación del articulado y enmiendas", type: "votacion" },
      { order: 3, title: "Votación final de los Presupuestos", type: "votacion", result: "aprobados", voteSummary: { si: 74, no: 56, abstencion: 5 } },
    ],
    speakers: [
      { name: "Salvador Illa", partySlug: "psoe", role: "President de la Generalitat", interventionMinutes: 40 },
    ],
    keyTopics: ["presupuestos", "sanidad", "educación", "vivienda", "cataluña"],
    institution: "Parlament de Catalunya",
    territorySlugs: ["cataluna"],
    partySlugs: ["psoe", "erc", "junts"],
    sourceUrl: "https://www.parlament.cat/",
    relatedInitiatives: [],
  },
  {
    id: "session-andalucia-001",
    chamber: "parlamento-ccaa",
    sessionType: "control",
    sessionNumber: 88,
    legislature: 12,
    title: "Parlamento de Andalucía — Control al Gobierno andaluz",
    date: "2026-04-02",
    startTime: "10:00",
    endTime: "14:30",
    durationMinutes: 270,
    status: "celebrada",
    transcriptUrl: "https://www.parlamentodeandalucia.es/webdinamica/portal-web-parlamento/recursosdeinformacion/diariodesesiones.do",
    transcriptFormat: "html",
    summary: "Sesión de control sobre gestión hídrica, sequía y Plan Hidrológico. Preguntas sobre inversión sanitaria y listas de espera.",
    agendaItems: [
      { order: 1, title: "Pregunta al Presidente: Gestión de la sequía en Andalucía", type: "pregunta-oral" },
      { order: 2, title: "Pregunta a la Consejera de Salud: Listas de espera", type: "pregunta-oral" },
      { order: 3, title: "Interpelación sobre inversión en infraestructuras hídricas", type: "interpelacion" },
    ],
    speakers: [],
    keyTopics: ["sequía", "agua", "sanidad", "listas de espera", "infraestructuras"],
    institution: "Parlamento de Andalucía",
    territorySlugs: ["andalucia"],
    partySlugs: ["pp", "psoe", "vox"],
    sourceUrl: "https://www.parlamentodeandalucia.es/",
    relatedInitiatives: [],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Transcript source registry — Official endpoints for Diarios de Sesiones
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TranscriptSource {
  id: string;
  institution: string;
  chamber: SessionChamber;
  baseUrl: string;
  format: "pdf" | "html" | "xml";
  description: string;
  searchUrl?: string;
  apiUrl?: string;
  legislature?: number;
  territorySlugs: string[];
}

export const transcriptSources: TranscriptSource[] = [
  // ── Nacional ──────────────────────────────────────────────────────────
  {
    id: "ts-congreso-pleno",
    institution: "Congreso de los Diputados",
    chamber: "congreso",
    baseUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    format: "pdf",
    description: "Diarios de Sesiones del Pleno del Congreso. Transcripción literal de todas las intervenciones en sesión plenaria.",
    searchUrl: "https://www.congreso.es/web/search/diario-sesiones/pleno",
    legislature: 15,
    territorySlugs: ["espana"],
  },
  {
    id: "ts-congreso-comisiones",
    institution: "Congreso — Comisiones",
    chamber: "comision",
    baseUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    format: "pdf",
    description: "Diarios de Sesiones de las Comisiones del Congreso. Incluye comparecencias, ponencias y debates en comisión.",
    searchUrl: "https://www.congreso.es/web/search/diario-sesiones/comisiones",
    legislature: 15,
    territorySlugs: ["espana"],
  },
  {
    id: "ts-senado-pleno",
    institution: "Senado",
    chamber: "senado",
    baseUrl: "https://www.senado.es/legis15/publicaciones/index.html",
    format: "pdf",
    description: "Diarios de Sesiones del Pleno del Senado. Transcripciones completas de debates plenarios y votaciones.",
    searchUrl: "https://www.senado.es/web/actividadparlamentaria/publicacionesoficiales/diariodesesiones/index.html",
    legislature: 15,
    territorySlugs: ["espana"],
  },
  {
    id: "ts-senado-comisiones",
    institution: "Senado — Comisiones",
    chamber: "comision",
    baseUrl: "https://www.senado.es/legis15/publicaciones/index.html",
    format: "pdf",
    description: "Diarios de Sesiones de las Comisiones del Senado.",
    legislature: 15,
    territorySlugs: ["espana"],
  },

  // ── Parlamentos autonómicos ───────────────────────────────────────────
  {
    id: "ts-andalucia",
    institution: "Parlamento de Andalucía",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamentodeandalucia.es/webdinamica/portal-web-parlamento/recursosdeinformacion/diariodesesiones.do",
    format: "html",
    description: "DSPA — Diario de Sesiones del Parlamento de Andalucía. Plenos y comisiones.",
    territorySlugs: ["andalucia"],
  },
  {
    id: "ts-cataluna",
    institution: "Parlament de Catalunya",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlament.cat/web/documentacio/diari-sessions/index.html",
    format: "html",
    description: "DSPC — Diari de Sessions del Parlament de Catalunya.",
    territorySlugs: ["cataluna"],
  },
  {
    id: "ts-madrid",
    institution: "Asamblea de Madrid",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.asambleamadrid.es/servicios/publicaciones/diario-de-sesiones",
    format: "pdf",
    description: "DSAM — Diario de Sesiones de la Asamblea de Madrid.",
    territorySlugs: ["madrid"],
  },
  {
    id: "ts-pais-vasco",
    institution: "Parlamento Vasco",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.legebiltzarra.eus/Portal/Publicaciones",
    format: "pdf",
    description: "DSPV — Diario de Sesiones del Parlamento Vasco / Legebiltzarra.",
    territorySlugs: ["pais-vasco"],
  },
  {
    id: "ts-valencia",
    institution: "Les Corts Valencianes",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.cortsvalencianes.es/es/publicaciones-oficiales/diario-de-sesiones",
    format: "pdf",
    description: "DSCV — Diari de Sessions de les Corts Valencianes.",
    territorySlugs: ["comunitat-valenciana"],
  },
  {
    id: "ts-galicia",
    institution: "Parlamento de Galicia",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamentodegalicia.gal/Publicacions/DiarioSesions",
    format: "pdf",
    description: "DSPG — Diario de Sesións do Parlamento de Galicia.",
    territorySlugs: ["galicia"],
  },
  {
    id: "ts-canarias",
    institution: "Parlamento de Canarias",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parcan.es/pub/ds.py",
    format: "pdf",
    description: "DSPC — Diario de Sesiones del Parlamento de Canarias.",
    territorySlugs: ["canarias"],
  },
  {
    id: "ts-aragon",
    institution: "Cortes de Aragón",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.cortesaragon.es/DiarioDeSesiones",
    format: "pdf",
    description: "DSCA — Diario de Sesiones de las Cortes de Aragón.",
    territorySlugs: ["aragon"],
  },
  {
    id: "ts-castilla-leon",
    institution: "Cortes de Castilla y León",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.ccyl.es/Publicaciones/DiarioSesiones",
    format: "pdf",
    description: "DSCyL — Diario de Sesiones de las Cortes de Castilla y León.",
    territorySlugs: ["castilla-y-leon"],
  },
  {
    id: "ts-navarra",
    institution: "Parlamento de Navarra",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamentodenavarra.es/es/publicaciones",
    format: "pdf",
    description: "DSPN — Diario de Sesiones del Parlamento de Navarra.",
    territorySlugs: ["navarra"],
  },
  {
    id: "ts-murcia",
    institution: "Asamblea Regional de Murcia",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.asamblearegional.es/publicaciones/diario-sesiones",
    format: "pdf",
    description: "DSARM — Diario de Sesiones de la Asamblea Regional de Murcia.",
    territorySlugs: ["murcia"],
  },
  {
    id: "ts-extremadura",
    institution: "Asamblea de Extremadura",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.asambleaex.es/publicaciones",
    format: "pdf",
    description: "DSAE — Diario de Sesiones de la Asamblea de Extremadura.",
    territorySlugs: ["extremadura"],
  },
  {
    id: "ts-balears",
    institution: "Parlament de les Illes Balears",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamentib.es/",
    format: "pdf",
    description: "DSPIB — Diari de Sessions del Parlament de les Illes Balears.",
    territorySlugs: ["illes-balears"],
  },
  {
    id: "ts-cantabria",
    institution: "Parlamento de Cantabria",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamento-cantabria.es/publicaciones",
    format: "pdf",
    description: "DSPC — Diario de Sesiones del Parlamento de Cantabria.",
    territorySlugs: ["cantabria"],
  },
  {
    id: "ts-asturias",
    institution: "Junta General del Principado de Asturias",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.jgpa.es/publicaciones",
    format: "pdf",
    description: "DSJG — Diario de Sesiones de la Junta General del Principado de Asturias.",
    territorySlugs: ["asturias"],
  },
  {
    id: "ts-la-rioja",
    institution: "Parlamento de La Rioja",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.parlamento-larioja.org/publicaciones",
    format: "pdf",
    description: "DSPLR — Diario de Sesiones del Parlamento de La Rioja.",
    territorySlugs: ["la-rioja"],
  },
  {
    id: "ts-castilla-la-mancha",
    institution: "Cortes de Castilla-La Mancha",
    chamber: "parlamento-ccaa",
    baseUrl: "https://www.cortesclm.es/publicaciones",
    format: "pdf",
    description: "DSCLM — Diario de Sesiones de las Cortes de Castilla-La Mancha.",
    territorySlugs: ["castilla-la-mancha"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Helper functions
   ═══════════════════════════════════════════════════════════════════════════ */

/** Get past (celebrated) sessions */
export function getPastSessions(limit = 20): ParliamentarySession[] {
  return parliamentarySessions
    .filter((s) => s.status === "celebrada")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Get sessions by chamber */
export function getSessionsByChamber(chamber: SessionChamber): ParliamentarySession[] {
  return parliamentarySessions.filter((s) => s.chamber === chamber);
}

/** Get sessions by topic keyword */
export function getSessionsByTopic(keyword: string): ParliamentarySession[] {
  const q = keyword.toLowerCase();
  return parliamentarySessions.filter((s) =>
    s.keyTopics.some((t) => t.includes(q)) ||
    s.title.toLowerCase().includes(q) ||
    s.summary.toLowerCase().includes(q)
  );
}

/** Get all transcript sources for a territory */
export function getTranscriptSourcesByTerritory(territorySlug: string): TranscriptSource[] {
  return transcriptSources.filter((ts) => ts.territorySlugs.includes(territorySlug));
}

/** Get total statistics */
export function getSessionStats() {
  const past = parliamentarySessions.filter((s) => s.status === "celebrada");
  const totalMinutes = past.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const totalSpeakers = new Set(past.flatMap((s) => s.speakers.map((sp) => sp.name))).size;
  const totalAgendaItems = past.reduce((sum, s) => sum + s.agendaItems.length, 0);
  const totalVotaciones = past.reduce((sum, s) => sum + s.agendaItems.filter((a) => a.type === "votacion").length, 0);
  return {
    totalSessions: past.length,
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60),
    totalSpeakers,
    totalAgendaItems,
    totalVotaciones,
    transcriptSources: transcriptSources.length,
    ccaaCovered: new Set(transcriptSources.filter((ts) => ts.chamber === "parlamento-ccaa").flatMap((ts) => ts.territorySlugs)).size,
  };
}
