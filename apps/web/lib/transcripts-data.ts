/* ═══════════════════════════════════════════════════════════════════════════
   Parliamentary Transcripts — Full-text interventions from Diarios de Sesiones.

   Each transcript entry contains the verbatim text of each speaker's
   intervention plus automated analysis:
     • sentiment polarity (–1 negative … +1 positive)
     • key claims / commitments extracted
     • topic tags per paragraph
     • position stance (a-favor / en-contra / ambiguo)
     • cross-references to votes and legislation

   Source: Diario de Sesiones del Congreso / Senado / Parlamentos CCAA
   Seed data for 2026-04-10.
   ═══════════════════════════════════════════════════════════════════════════ */

export type SentimentLabel = "muy-negativo" | "negativo" | "neutro" | "positivo" | "muy-positivo";
export type StancePosition = "a-favor" | "en-contra" | "ambiguo" | "abstencion";

export interface TranscriptClaim {
  text: string;
  type: "compromiso" | "dato" | "critica" | "propuesta" | "pregunta" | "acusacion";
  verifiable: boolean;
  relatedVoteId?: string;
  relatedLegislation?: string;
}

export interface TranscriptIntervention {
  id: string;
  sessionId: string;
  speakerName: string;
  politicianSlug?: string;
  partySlug: string;
  role: string;
  order: number; // intervention order within session
  agendaItemOrder?: number; // which agenda item this relates to
  startMinute: number;
  endMinute: number;
  durationMinutes: number;

  // Full text
  fullText: string;
  paragraphs: string[];

  // NLP Analysis
  sentiment: {
    score: number; // -1.0 to +1.0
    label: SentimentLabel;
    positiveSegments: number;
    negativeSegments: number;
    neutralSegments: number;
  };
  stance: {
    topic: string;
    position: StancePosition;
    confidence: number; // 0-1
    relatedVoteId?: string;
  }[];
  claims: TranscriptClaim[];
  keywords: string[];
  entities: { name: string; type: "persona" | "partido" | "institucion" | "ley" | "lugar" | "cifra" }[];
  topicTags: string[];

  // Cross-references
  mentionedPoliticians: string[]; // slugs
  mentionedParties: string[]; // slugs
  citedLegislation: string[]; // initiative refs
  referencedData: string[]; // e.g. "PIB", "tasa de paro", "presupuesto"
}

export interface SessionTranscript {
  sessionId: string;
  totalInterventions: number;
  totalWords: number;
  totalMinutes: number;
  interventions: TranscriptIntervention[];

  // Session-level analysis
  sessionSentiment: {
    overall: number;
    byParty: { partySlug: string; avgScore: number; label: SentimentLabel }[];
  };
  dominantTopics: { topic: string; weight: number }[];
  keyConflicts: { topic: string; parties: [string, string]; description: string }[];
  consensusAreas: { topic: string; parties: string[]; description: string }[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION TRANSCRIPTS — Verbatim interventions + analysis
   ═══════════════════════════════════════════════════════════════════════════ */

export const sessionTranscripts: SessionTranscript[] = [
  // ────────────────────────────────────────────────────────────────────────
  // SESSION 142 — Debate sobre el estado de la Nación (25 marzo 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-congreso-001",
    totalInterventions: 8,
    totalWords: 14200,
    totalMinutes: 750,
    interventions: [
      {
        id: "int-001-01",
        sessionId: "session-congreso-001",
        speakerName: "Pedro Sánchez",
        politicianSlug: "pedro-sanchez",
        partySlug: "psoe",
        role: "Presidente del Gobierno",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 95,
        durationMinutes: 95,
        fullText: "Señorías, comparezco ante esta Cámara para rendir cuentas de la acción del Gobierno y para exponer las líneas maestras de la política que pretendemos desarrollar en lo que resta de legislatura. España crece al 2,7% del PIB, por encima de la media europea del 1,1%. Hemos creado 615.000 empleos netos en el último año, la mayor cifra desde 2019. La tasa de paro ha bajado al 10,8%, un mínimo desde 2008. Pero no nos conformamos. La vivienda sigue siendo el principal problema de los jóvenes, y por eso anuncio un nuevo Plan Estatal de Vivienda Asequible con 150.000 unidades en cuatro años, financiado con fondos NGEU y presupuestos propios. En materia territorial, este Gobierno apuesta por un modelo de financiación autonómica justo, que tenga en cuenta la población ajustada, la dispersión, la insularidad y el envejecimiento. Presentaremos la propuesta antes de verano. La transición energética es irreversible: hemos alcanzado el 58% de generación renovable y nuestro objetivo es llegar al 74% en 2030. Señorías, España funciona. No les pido fe ciega; les pido que miren los datos.",
        paragraphs: [
          "Señorías, comparezco ante esta Cámara para rendir cuentas de la acción del Gobierno y para exponer las líneas maestras de la política que pretendemos desarrollar en lo que resta de legislatura.",
          "España crece al 2,7% del PIB, por encima de la media europea del 1,1%. Hemos creado 615.000 empleos netos en el último año, la mayor cifra desde 2019. La tasa de paro ha bajado al 10,8%, un mínimo desde 2008.",
          "Pero no nos conformamos. La vivienda sigue siendo el principal problema de los jóvenes, y por eso anuncio un nuevo Plan Estatal de Vivienda Asequible con 150.000 unidades en cuatro años, financiado con fondos NGEU y presupuestos propios.",
          "En materia territorial, este Gobierno apuesta por un modelo de financiación autonómica justo, que tenga en cuenta la población ajustada, la dispersión, la insularidad y el envejecimiento. Presentaremos la propuesta antes de verano.",
          "La transición energética es irreversible: hemos alcanzado el 58% de generación renovable y nuestro objetivo es llegar al 74% en 2030.",
          "Señorías, España funciona. No les pido fe ciega; les pido que miren los datos.",
        ],
        sentiment: { score: 0.72, label: "positivo", positiveSegments: 5, negativeSegments: 0, neutralSegments: 1 },
        stance: [
          { topic: "economía", position: "a-favor", confidence: 0.95 },
          { topic: "vivienda", position: "a-favor", confidence: 0.9 },
          { topic: "financiación autonómica", position: "a-favor", confidence: 0.85 },
          { topic: "transición energética", position: "a-favor", confidence: 0.92 },
        ],
        claims: [
          { text: "España crece al 2,7% del PIB", type: "dato", verifiable: true },
          { text: "615.000 empleos netos creados en el último año", type: "dato", verifiable: true },
          { text: "Tasa de paro al 10,8%, mínimo desde 2008", type: "dato", verifiable: true },
          { text: "Plan de 150.000 viviendas asequibles en cuatro años", type: "compromiso", verifiable: true },
          { text: "Propuesta de financiación autonómica antes de verano", type: "compromiso", verifiable: true },
          { text: "58% de generación renovable alcanzada", type: "dato", verifiable: true },
          { text: "Objetivo del 74% renovable en 2030", type: "compromiso", verifiable: true },
        ],
        keywords: ["PIB", "empleo", "vivienda", "financiación autonómica", "transición energética", "NGEU", "renovables"],
        entities: [
          { name: "España", type: "lugar" },
          { name: "Plan Estatal de Vivienda Asequible", type: "ley" },
          { name: "2,7%", type: "cifra" },
          { name: "615.000 empleos", type: "cifra" },
          { name: "10,8%", type: "cifra" },
          { name: "150.000 viviendas", type: "cifra" },
        ],
        topicTags: ["economía", "empleo", "vivienda", "financiación autonómica", "energía"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["PIB", "tasa de paro", "empleo neto", "generación renovable"],
      },
      {
        id: "int-001-02",
        sessionId: "session-congreso-001",
        speakerName: "Miguel Tellado",
        politicianSlug: "miguel-tellado",
        partySlug: "pp",
        role: "Portavoz GP Popular",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 95,
        endMinute: 140,
        durationMinutes: 45,
        fullText: "Señor Presidente, usted viene aquí a vendernos un país que no existe. Dice que España crece, pero los españoles no lo notan: el 27% de los menores de 30 años no puede emanciparse. La vivienda no es un problema de oferta, es un problema de su modelo intervencionista que ahuyenta la inversión privada. Su plan de 150.000 viviendas públicas es el mismo anuncio que llevan haciendo desde 2018, y no han construido ni 12.000. En financiación autonómica, lo que usted llama 'modelo justo' es un pacto bilateral con Cataluña que perjudica a las comunidades del régimen común: Valencia, Andalucía, Murcia y Castilla-La Mancha están infrafinanciadas desde hace 15 años. Y usted las ignora para contentar a sus socios independentistas. Nuestro grupo parlamentario exige una reforma multilateral, en el Consejo de Política Fiscal, con todas las CCAA en la mesa. No pactitos bilaterales, señor Sánchez. Transparencia y multilateralidad.",
        paragraphs: [
          "Señor Presidente, usted viene aquí a vendernos un país que no existe. Dice que España crece, pero los españoles no lo notan: el 27% de los menores de 30 años no puede emanciparse.",
          "La vivienda no es un problema de oferta, es un problema de su modelo intervencionista que ahuyenta la inversión privada. Su plan de 150.000 viviendas públicas es el mismo anuncio que llevan haciendo desde 2018, y no han construido ni 12.000.",
          "En financiación autonómica, lo que usted llama 'modelo justo' es un pacto bilateral con Cataluña que perjudica a las comunidades del régimen común: Valencia, Andalucía, Murcia y Castilla-La Mancha están infrafinanciadas desde hace 15 años.",
          "Y usted las ignora para contentar a sus socios independentistas. Nuestro grupo parlamentario exige una reforma multilateral, en el Consejo de Política Fiscal, con todas las CCAA en la mesa. No pactitos bilaterales, señor Sánchez. Transparencia y multilateralidad.",
        ],
        sentiment: { score: -0.68, label: "negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "economía", position: "en-contra", confidence: 0.88 },
          { topic: "vivienda", position: "en-contra", confidence: 0.92 },
          { topic: "financiación autonómica", position: "en-contra", confidence: 0.95 },
        ],
        claims: [
          { text: "27% de menores de 30 años no puede emanciparse", type: "dato", verifiable: true },
          { text: "Solo han construido 12.000 de las 150.000 viviendas prometidas", type: "critica", verifiable: true },
          { text: "Valencia, Andalucía, Murcia y Castilla-La Mancha infrafinanciadas 15 años", type: "dato", verifiable: true },
          { text: "Exige reforma multilateral en el Consejo de Política Fiscal", type: "propuesta", verifiable: false },
        ],
        keywords: ["emancipación", "vivienda", "intervencionismo", "financiación autonómica", "multilateralidad", "Cataluña"],
        entities: [
          { name: "Pedro Sánchez", type: "persona" },
          { name: "Cataluña", type: "lugar" },
          { name: "Valencia", type: "lugar" },
          { name: "Andalucía", type: "lugar" },
          { name: "Consejo de Política Fiscal", type: "institucion" },
          { name: "27%", type: "cifra" },
          { name: "12.000", type: "cifra" },
        ],
        topicTags: ["vivienda", "financiación autonómica", "juventud", "modelo territorial"],
        mentionedPoliticians: ["pedro-sanchez"],
        mentionedParties: ["psoe"],
        citedLegislation: [],
        referencedData: ["emancipación juvenil", "viviendas construidas", "infrafinanciación"],
      },
      {
        id: "int-001-03",
        sessionId: "session-congreso-001",
        speakerName: "Santiago Abascal",
        politicianSlug: "santiago-abascal",
        partySlug: "vox",
        role: "Presidente de Vox",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 140,
        endMinute: 170,
        durationMinutes: 30,
        fullText: "Señor Sánchez, su discurso es una sucesión de datos maquillados que ocultan la realidad de millones de españoles. Usted habla de empleo, pero el 25% de los contratos son temporales de menos de un mes. Habla de crecimiento, pero la renta per cápita sigue por debajo del nivel de 2008 en términos reales. Y mientras tanto, 850.000 inmigrantes irregulares han entrado en España bajo su mandato, colapsando los servicios públicos. La delincuencia ha subido un 12% en las grandes ciudades. La DANA de Valencia demostró la incompetencia de un Estado que no protege a sus ciudadanos. 220 muertos porque su Gobierno no activó las alertas a tiempo. Vox exige un plan de seguridad nacional, el cierre de las fronteras a la inmigración ilegal y la devolución de competencias de emergencias al Estado. No más muertes por dejadez burocrática.",
        paragraphs: [
          "Señor Sánchez, su discurso es una sucesión de datos maquillados que ocultan la realidad de millones de españoles. Usted habla de empleo, pero el 25% de los contratos son temporales de menos de un mes.",
          "Habla de crecimiento, pero la renta per cápita sigue por debajo del nivel de 2008 en términos reales. Y mientras tanto, 850.000 inmigrantes irregulares han entrado en España bajo su mandato, colapsando los servicios públicos.",
          "La delincuencia ha subido un 12% en las grandes ciudades. La DANA de Valencia demostró la incompetencia de un Estado que no protege a sus ciudadanos. 220 muertos porque su Gobierno no activó las alertas a tiempo.",
          "Vox exige un plan de seguridad nacional, el cierre de las fronteras a la inmigración ilegal y la devolución de competencias de emergencias al Estado. No más muertes por dejadez burocrática.",
        ],
        sentiment: { score: -0.85, label: "muy-negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "empleo", position: "en-contra", confidence: 0.9 },
          { topic: "inmigración", position: "en-contra", confidence: 0.98 },
          { topic: "seguridad", position: "en-contra", confidence: 0.95 },
          { topic: "DANA", position: "en-contra", confidence: 0.97 },
        ],
        claims: [
          { text: "25% de los contratos son temporales de menos de un mes", type: "dato", verifiable: true },
          { text: "Renta per cápita por debajo del nivel de 2008 en términos reales", type: "dato", verifiable: true },
          { text: "850.000 inmigrantes irregulares bajo su mandato", type: "dato", verifiable: true },
          { text: "Delincuencia ha subido un 12% en grandes ciudades", type: "dato", verifiable: true },
          { text: "220 muertos por la DANA de Valencia", type: "dato", verifiable: true },
          { text: "Exige cierre de fronteras y devolución de competencias de emergencias", type: "propuesta", verifiable: false },
        ],
        keywords: ["inmigración", "seguridad", "DANA", "Valencia", "delincuencia", "contratos temporales"],
        entities: [
          { name: "Pedro Sánchez", type: "persona" },
          { name: "Valencia", type: "lugar" },
          { name: "DANA", type: "institucion" },
          { name: "850.000", type: "cifra" },
          { name: "220 muertos", type: "cifra" },
          { name: "12%", type: "cifra" },
        ],
        topicTags: ["inmigración", "seguridad", "DANA", "empleo", "emergencias"],
        mentionedPoliticians: ["pedro-sanchez"],
        mentionedParties: ["psoe"],
        citedLegislation: [],
        referencedData: ["contratos temporales", "renta per cápita", "inmigración irregular", "delincuencia"],
      },
      {
        id: "int-001-04",
        sessionId: "session-congreso-001",
        speakerName: "Yolanda Díaz",
        politicianSlug: "yolanda-diaz",
        partySlug: "sumar",
        role: "Vicepresidenta Segunda",
        order: 4,
        agendaItemOrder: 2,
        startMinute: 170,
        endMinute: 205,
        durationMinutes: 35,
        fullText: "Señorías, este debate debería servir para hablar de lo que importa a la gente: los salarios, la vivienda y los cuidados. La reforma laboral ha reducido la temporalidad del 26% al 13%, la mayor caída de la historia democrática. Pero no basta. El salario mínimo ha subido a 1.184 euros, pero la brecha salarial de género sigue en el 18,6%. Sumar propone una Ley de Usos del Tiempo que garantice la conciliación real: jornada de 37,5 horas, derecho a la desconexión digital y adaptación horaria para personas cuidadoras. En vivienda, apoyamos el plan del Gobierno pero exigimos que al menos el 30% de las nuevas viviendas sean de alquiler social permanente, no temporal. Y en materia fiscal, es hora de que las grandes fortunas contribuyan: proponemos que el impuesto a las grandes fortunas sea permanente, no temporal. Los 1.500 contribuyentes con más de 10 millones de euros deben aportar más a un país que les ha dado mucho.",
        paragraphs: [
          "Señorías, este debate debería servir para hablar de lo que importa a la gente: los salarios, la vivienda y los cuidados.",
          "La reforma laboral ha reducido la temporalidad del 26% al 13%, la mayor caída de la historia democrática. Pero no basta. El salario mínimo ha subido a 1.184 euros, pero la brecha salarial de género sigue en el 18,6%.",
          "Sumar propone una Ley de Usos del Tiempo que garantice la conciliación real: jornada de 37,5 horas, derecho a la desconexión digital y adaptación horaria para personas cuidadoras.",
          "En vivienda, apoyamos el plan del Gobierno pero exigimos que al menos el 30% de las nuevas viviendas sean de alquiler social permanente, no temporal.",
          "Y en materia fiscal, es hora de que las grandes fortunas contribuyan: proponemos que el impuesto a las grandes fortunas sea permanente, no temporal. Los 1.500 contribuyentes con más de 10 millones de euros deben aportar más a un país que les ha dado mucho.",
        ],
        sentiment: { score: 0.35, label: "positivo", positiveSegments: 3, negativeSegments: 1, neutralSegments: 1 },
        stance: [
          { topic: "reforma laboral", position: "a-favor", confidence: 0.85 },
          { topic: "vivienda", position: "a-favor", confidence: 0.8 },
          { topic: "fiscalidad", position: "a-favor", confidence: 0.92 },
          { topic: "jornada laboral", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Temporalidad reducida del 26% al 13%", type: "dato", verifiable: true },
          { text: "Salario mínimo a 1.184 euros", type: "dato", verifiable: true },
          { text: "Brecha salarial de género del 18,6%", type: "dato", verifiable: true },
          { text: "Propone Ley de Usos del Tiempo con jornada de 37,5 horas", type: "propuesta", verifiable: false, relatedLegislation: "Ley de Usos del Tiempo" },
          { text: "30% de nuevas viviendas como alquiler social permanente", type: "propuesta", verifiable: false },
          { text: "Impuesto a grandes fortunas permanente para >10M€", type: "propuesta", verifiable: false },
        ],
        keywords: ["salarios", "temporalidad", "brecha salarial", "jornada laboral", "vivienda social", "grandes fortunas", "fiscalidad"],
        entities: [
          { name: "Ley de Usos del Tiempo", type: "ley" },
          { name: "1.184 euros", type: "cifra" },
          { name: "18,6%", type: "cifra" },
          { name: "37,5 horas", type: "cifra" },
        ],
        topicTags: ["empleo", "salarios", "vivienda", "fiscalidad", "conciliación", "igualdad"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["reforma laboral"],
        referencedData: ["temporalidad", "SMI", "brecha salarial", "jornada laboral"],
      },
      {
        id: "int-001-05",
        sessionId: "session-congreso-001",
        speakerName: "Gabriel Rufián",
        politicianSlug: "gabriel-rufian",
        partySlug: "erc",
        role: "Portavoz ERC",
        order: 5,
        agendaItemOrder: 2,
        startMinute: 205,
        endMinute: 220,
        durationMinutes: 15,
        fullText: "Presidente, ERC quiere ser claro: apoyamos al Gobierno cuando cumple, y le fiscalizamos cuando incumple. Y en financiación, incumple gravemente. Cataluña sigue con un déficit fiscal de 16.000 millones anuales. El acuerdo de financiación singular que firmamos con el PSOE en julio de 2024 no se ha ejecutado. Ni una coma. Cero euros transferidos de los comprometidos. Le advierto: nuestra paciencia tiene un límite. Si antes de septiembre no hay hechos concretos — no promesas, no anuncios, hechos — nuestra colaboración parlamentaria se revisará. En inmigración, rechazamos las políticas de criminalización de Vox, pero también exigimos al Gobierno recursos reales para la acogida: España tiene 34 centros de primera acogida y hacen falta al menos 80.",
        paragraphs: [
          "Presidente, ERC quiere ser claro: apoyamos al Gobierno cuando cumple, y le fiscalizamos cuando incumple. Y en financiación, incumple gravemente.",
          "Cataluña sigue con un déficit fiscal de 16.000 millones anuales. El acuerdo de financiación singular que firmamos con el PSOE en julio de 2024 no se ha ejecutado. Ni una coma. Cero euros transferidos de los comprometidos.",
          "Le advierto: nuestra paciencia tiene un límite. Si antes de septiembre no hay hechos concretos — no promesas, no anuncios, hechos — nuestra colaboración parlamentaria se revisará.",
          "En inmigración, rechazamos las políticas de criminalización de Vox, pero también exigimos al Gobierno recursos reales para la acogida: España tiene 34 centros de primera acogida y hacen falta al menos 80.",
        ],
        sentiment: { score: -0.45, label: "negativo", positiveSegments: 1, negativeSegments: 3, neutralSegments: 0 },
        stance: [
          { topic: "financiación autonómica", position: "en-contra", confidence: 0.92 },
          { topic: "financiación singular Cataluña", position: "a-favor", confidence: 0.98 },
          { topic: "inmigración", position: "ambiguo", confidence: 0.7 },
        ],
        claims: [
          { text: "Déficit fiscal de Cataluña: 16.000 millones anuales", type: "dato", verifiable: true },
          { text: "Acuerdo de financiación singular de julio 2024 no ejecutado", type: "critica", verifiable: true },
          { text: "Amenaza de revisar colaboración parlamentaria si no hay hechos antes de septiembre", type: "compromiso", verifiable: false },
          { text: "España tiene 34 centros de primera acogida, hacen falta 80", type: "dato", verifiable: true },
        ],
        keywords: ["financiación singular", "Cataluña", "déficit fiscal", "inmigración", "acogida"],
        entities: [
          { name: "Cataluña", type: "lugar" },
          { name: "ERC", type: "partido" },
          { name: "PSOE", type: "partido" },
          { name: "Vox", type: "partido" },
          { name: "16.000 millones", type: "cifra" },
        ],
        topicTags: ["financiación autonómica", "Cataluña", "inmigración", "colaboración parlamentaria"],
        mentionedPoliticians: ["pedro-sanchez"],
        mentionedParties: ["psoe", "vox"],
        citedLegislation: ["acuerdo financiación singular"],
        referencedData: ["déficit fiscal", "centros de acogida"],
      },
    ],
    sessionSentiment: {
      overall: -0.04,
      byParty: [
        { partySlug: "psoe", avgScore: 0.72, label: "positivo" },
        { partySlug: "pp", avgScore: -0.68, label: "negativo" },
        { partySlug: "vox", avgScore: -0.85, label: "muy-negativo" },
        { partySlug: "sumar", avgScore: 0.35, label: "positivo" },
        { partySlug: "erc", avgScore: -0.45, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "financiación autonómica", weight: 0.28 },
      { topic: "vivienda", weight: 0.22 },
      { topic: "economía / empleo", weight: 0.20 },
      { topic: "inmigración", weight: 0.15 },
      { topic: "transición energética", weight: 0.10 },
      { topic: "seguridad / DANA", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "Financiación autonómica", parties: ["pp", "psoe"], description: "PP exige reforma multilateral; PSOE defiende modelo justo con atención a singularidades" },
      { topic: "Financiación singular Cataluña", parties: ["erc", "pp"], description: "ERC exige ejecución del acuerdo bilateral; PP denuncia pacto que perjudica al régimen común" },
      { topic: "Inmigración", parties: ["vox", "psoe"], description: "Vox exige cierre de fronteras; Gobierno defiende modelo de acogida regulada" },
      { topic: "Vivienda: intervención vs mercado", parties: ["pp", "sumar"], description: "PP acusa de intervencionismo; Sumar exige 30% de alquiler social permanente" },
    ],
    consensusAreas: [
      { topic: "Transición energética", parties: ["psoe", "sumar", "erc", "pnv"], description: "Amplio apoyo a objetivo 74% renovable en 2030" },
      { topic: "Necesidad de reforma de financiación", parties: ["psoe", "pp", "erc", "pnv"], description: "Todos coinciden en que el modelo actual es insuficiente, aunque difieren en la solución" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION 146 — Debate de política general (9 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-congreso-005",
    totalInterventions: 6,
    totalWords: 10800,
    totalMinutes: 660,
    interventions: [
      {
        id: "int-005-01",
        sessionId: "session-congreso-005",
        speakerName: "Pedro Sánchez",
        politicianSlug: "pedro-sanchez",
        partySlug: "psoe",
        role: "Presidente del Gobierno",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 50,
        durationMinutes: 50,
        fullText: "Señorías, España está en un momento decisivo. El primer trimestre de 2026 confirma que nuestra economía crece al 2,4%, con 21,3 millones de afiliados a la Seguridad Social, récord histórico. Pero los datos macroeconómicos no bastan si no llegan a todos los hogares. Por eso, ayer el Consejo de Ministros aprobó el Real Decreto-ley 6/2026 de vivienda: ampliación del bono alquiler joven a menores de 36 años, 2.000 millones para rehabilitación energética y la movilización de 25.000 viviendas vacías de entidades financieras. En materia de financiación autonómica, cumplo mi compromiso: he convocado la Conferencia de Presidentes para el 15 de mayo, donde presentaremos la propuesta técnica del nuevo modelo. No será un pacto bilateral con nadie; será un acuerdo de todos, para todos. Y hoy presento formalmente ante esta Cámara la PNL de reforma de la financiación, porque la transparencia exige que el Parlamento lidere este debate, no los despachos.",
        paragraphs: [
          "Señorías, España está en un momento decisivo. El primer trimestre de 2026 confirma que nuestra economía crece al 2,4%, con 21,3 millones de afiliados a la Seguridad Social, récord histórico.",
          "Pero los datos macroeconómicos no bastan si no llegan a todos los hogares. Por eso, ayer el Consejo de Ministros aprobó el Real Decreto-ley 6/2026 de vivienda: ampliación del bono alquiler joven a menores de 36 años, 2.000 millones para rehabilitación energética y la movilización de 25.000 viviendas vacías de entidades financieras.",
          "En materia de financiación autonómica, cumplo mi compromiso: he convocado la Conferencia de Presidentes para el 15 de mayo, donde presentaremos la propuesta técnica del nuevo modelo.",
          "No será un pacto bilateral con nadie; será un acuerdo de todos, para todos. Y hoy presento formalmente ante esta Cámara la PNL de reforma de la financiación, porque la transparencia exige que el Parlamento lidere este debate, no los despachos.",
        ],
        sentiment: { score: 0.65, label: "positivo", positiveSegments: 4, negativeSegments: 0, neutralSegments: 0 },
        stance: [
          { topic: "economía", position: "a-favor", confidence: 0.92 },
          { topic: "vivienda", position: "a-favor", confidence: 0.95 },
          { topic: "financiación autonómica", position: "a-favor", confidence: 0.9 },
        ],
        claims: [
          { text: "Economía crece al 2,4% en Q1 2026", type: "dato", verifiable: true },
          { text: "21,3 millones de afiliados a la SS, récord histórico", type: "dato", verifiable: true },
          { text: "RDL 6/2026: bono alquiler a menores de 36", type: "dato", verifiable: true, relatedLegislation: "RDL 6/2026" },
          { text: "2.000 millones para rehabilitación energética", type: "dato", verifiable: true },
          { text: "25.000 viviendas vacías movilizadas", type: "compromiso", verifiable: true },
          { text: "Conferencia de Presidentes convocada para 15 de mayo", type: "compromiso", verifiable: true },
        ],
        keywords: ["PIB", "afiliados", "vivienda", "bono alquiler", "financiación autonómica", "Conferencia de Presidentes"],
        entities: [
          { name: "RDL 6/2026", type: "ley" },
          { name: "Consejo de Ministros", type: "institucion" },
          { name: "Conferencia de Presidentes", type: "institucion" },
          { name: "Seguridad Social", type: "institucion" },
          { name: "21,3 millones", type: "cifra" },
          { name: "2.000 millones", type: "cifra" },
        ],
        topicTags: ["economía", "vivienda", "financiación autonómica"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["RDL 6/2026"],
        referencedData: ["PIB Q1", "afiliados SS", "bono alquiler"],
      },
      {
        id: "int-005-02",
        sessionId: "session-congreso-005",
        speakerName: "Miguel Tellado",
        politicianSlug: "miguel-tellado",
        partySlug: "pp",
        role: "Portavoz GP Popular",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 50,
        endMinute: 80,
        durationMinutes: 30,
        fullText: "Señor Presidente, de nuevo los anuncios. Una Conferencia de Presidentes que debería haberse celebrado hace dos años. Un decreto de vivienda que repite medidas que ya fracasaron. ¿Sabe cuántas viviendas vacías movilizó su anterior decreto? 3.200, de las 50.000 prometidas. Un 6,4% de cumplimiento. Eso es su gestión. En financiación, le recuerdo que Valencia lleva 15 años esperando. Andalucía 12 años. Y usted anuncia una conferencia para mayo. ¿Y hasta entonces qué? Nuestro grupo votará en contra de su PNL porque no es más que una maniobra para ganar tiempo. Lo que hace falta es una propuesta concreta sobre la mesa, no un debate parlamentario que usted controlará a su antojo. Señorías, el PP presentó hace 6 meses un texto articulado de reforma. 83 artículos. Con población ajustada, coste efectivo de servicios e insularidad. ¿Lo ha leído, señor Presidente? Lo dudo.",
        paragraphs: [
          "Señor Presidente, de nuevo los anuncios. Una Conferencia de Presidentes que debería haberse celebrado hace dos años. Un decreto de vivienda que repite medidas que ya fracasaron.",
          "¿Sabe cuántas viviendas vacías movilizó su anterior decreto? 3.200, de las 50.000 prometidas. Un 6,4% de cumplimiento. Eso es su gestión.",
          "En financiación, le recuerdo que Valencia lleva 15 años esperando. Andalucía 12 años. Y usted anuncia una conferencia para mayo. ¿Y hasta entonces qué?",
          "Nuestro grupo votará en contra de su PNL porque no es más que una maniobra para ganar tiempo.",
          "Señorías, el PP presentó hace 6 meses un texto articulado de reforma. 83 artículos. Con población ajustada, coste efectivo de servicios e insularidad. ¿Lo ha leído, señor Presidente? Lo dudo.",
        ],
        sentiment: { score: -0.72, label: "negativo", positiveSegments: 0, negativeSegments: 5, neutralSegments: 0 },
        stance: [
          { topic: "vivienda", position: "en-contra", confidence: 0.92 },
          { topic: "financiación autonómica", position: "en-contra", confidence: 0.88 },
          { topic: "PNL financiación", position: "en-contra", confidence: 0.98, relatedVoteId: "vote-011" },
        ],
        claims: [
          { text: "Solo se movilizaron 3.200 de 50.000 viviendas vacías prometidas (6,4%)", type: "critica", verifiable: true },
          { text: "Valencia lleva 15 años esperando reforma de financiación", type: "dato", verifiable: true },
          { text: "PP presentó texto articulado de 83 artículos hace 6 meses", type: "dato", verifiable: true },
        ],
        keywords: ["viviendas vacías", "financiación autonómica", "Valencia", "Andalucía", "Conferencia de Presidentes", "texto articulado"],
        entities: [
          { name: "Pedro Sánchez", type: "persona" },
          { name: "Valencia", type: "lugar" },
          { name: "Andalucía", type: "lugar" },
          { name: "3.200", type: "cifra" },
          { name: "83 artículos", type: "cifra" },
        ],
        topicTags: ["vivienda", "financiación autonómica", "gestión gubernamental"],
        mentionedPoliticians: ["pedro-sanchez"],
        mentionedParties: ["psoe"],
        citedLegislation: [],
        referencedData: ["viviendas vacías movilizadas", "infrafinanciación Valencia"],
      },
      {
        id: "int-005-03",
        sessionId: "session-congreso-005",
        speakerName: "Yolanda Díaz",
        politicianSlug: "yolanda-diaz",
        partySlug: "sumar",
        role: "Vicepresidenta Segunda",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 100,
        endMinute: 125,
        durationMinutes: 25,
        fullText: "Señorías, apoyo la PNL de financiación porque es un paso necesario, pero insuficiente. Sumar va a presentar enmiendas para que la reforma incluya un fondo de nivelación de servicios públicos esenciales. No puede ser que un niño en Extremadura tenga una ratio de 28 alumnos por aula mientras en Madrid es de 22. No puede ser que la lista de espera quirúrgica en Andalucía sea el doble que en el País Vasco. La financiación no es solo dinero: es igualdad de derechos. Respecto al RDL de vivienda, Sumar lo apoya pero pedimos que se incorpore la regulación de los alquileres de temporada, que se han convertido en la vía de escape de los grandes propietarios para eludir los topes. En Barcelona, el 40% de los nuevos contratos son 'de temporada' de 11 meses. Eso es fraude de ley, señorías, y hay que atajarlo.",
        paragraphs: [
          "Señorías, apoyo la PNL de financiación porque es un paso necesario, pero insuficiente. Sumar va a presentar enmiendas para que la reforma incluya un fondo de nivelación de servicios públicos esenciales.",
          "No puede ser que un niño en Extremadura tenga una ratio de 28 alumnos por aula mientras en Madrid es de 22. No puede ser que la lista de espera quirúrgica en Andalucía sea el doble que en el País Vasco.",
          "La financiación no es solo dinero: es igualdad de derechos.",
          "Respecto al RDL de vivienda, Sumar lo apoya pero pedimos que se incorpore la regulación de los alquileres de temporada, que se han convertido en la vía de escape de los grandes propietarios para eludir los topes.",
          "En Barcelona, el 40% de los nuevos contratos son 'de temporada' de 11 meses. Eso es fraude de ley, señorías, y hay que atajarlo.",
        ],
        sentiment: { score: 0.15, label: "neutro", positiveSegments: 2, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "financiación autonómica", position: "a-favor", confidence: 0.8 },
          { topic: "vivienda", position: "a-favor", confidence: 0.85 },
          { topic: "alquileres de temporada", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Ratio 28 alumnos/aula en Extremadura vs 22 en Madrid", type: "dato", verifiable: true },
          { text: "Lista de espera quirúrgica en Andalucía es el doble que en País Vasco", type: "dato", verifiable: true },
          { text: "40% de nuevos contratos en Barcelona son de temporada de 11 meses", type: "dato", verifiable: true },
          { text: "Propone fondo de nivelación de servicios públicos esenciales", type: "propuesta", verifiable: false },
          { text: "Pide regulación de alquileres de temporada", type: "propuesta", verifiable: false },
        ],
        keywords: ["nivelación", "servicios públicos", "alquileres de temporada", "ratio escolar", "listas de espera"],
        entities: [
          { name: "Extremadura", type: "lugar" },
          { name: "Madrid", type: "lugar" },
          { name: "Andalucía", type: "lugar" },
          { name: "País Vasco", type: "lugar" },
          { name: "Barcelona", type: "lugar" },
          { name: "28 alumnos", type: "cifra" },
          { name: "40%", type: "cifra" },
        ],
        topicTags: ["financiación autonómica", "vivienda", "servicios públicos", "educación", "sanidad"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["RDL 6/2026"],
        referencedData: ["ratio escolar", "listas de espera", "alquileres temporada"],
      },
      {
        id: "int-005-04",
        sessionId: "session-congreso-005",
        speakerName: "Gabriel Rufián",
        politicianSlug: "gabriel-rufian",
        partySlug: "erc",
        role: "Portavoz ERC",
        order: 4,
        agendaItemOrder: 2,
        startMinute: 135,
        endMinute: 150,
        durationMinutes: 15,
        fullText: "Señor Presidente, le dimos un ultimátum en marzo: hechos antes de septiembre sobre la financiación singular. Hoy vemos que convoca una Conferencia de Presidentes multilateral. Bien, pero eso no sustituye el compromiso bilateral con Cataluña. ERC votará a favor de esta PNL porque cualquier reforma es mejor que el statu quo, pero le advierto: nuestro voto no es un cheque en blanco. Si la Conferencia de mayo no incluye un mecanismo específico para Cataluña — un fondo bilateral de compensación por el déficit fiscal histórico — nuestra posición cambiará. Y no solo en financiación. Hay 14 proyectos de ley en tramitación que necesitan nuestros 7 votos. Mida bien sus pasos.",
        paragraphs: [
          "Señor Presidente, le dimos un ultimátum en marzo: hechos antes de septiembre sobre la financiación singular. Hoy vemos que convoca una Conferencia de Presidentes multilateral. Bien, pero eso no sustituye el compromiso bilateral con Cataluña.",
          "ERC votará a favor de esta PNL porque cualquier reforma es mejor que el statu quo, pero le advierto: nuestro voto no es un cheque en blanco.",
          "Si la Conferencia de mayo no incluye un mecanismo específico para Cataluña — un fondo bilateral de compensación por el déficit fiscal histórico — nuestra posición cambiará.",
          "Y no solo en financiación. Hay 14 proyectos de ley en tramitación que necesitan nuestros 7 votos. Mida bien sus pasos.",
        ],
        sentiment: { score: -0.3, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "PNL financiación", position: "a-favor", confidence: 0.75, relatedVoteId: "vote-011" },
          { topic: "financiación singular Cataluña", position: "a-favor", confidence: 0.98 },
        ],
        claims: [
          { text: "14 proyectos de ley en tramitación necesitan votos de ERC", type: "dato", verifiable: true },
          { text: "Exige fondo bilateral de compensación por déficit fiscal histórico", type: "propuesta", verifiable: false },
        ],
        keywords: ["financiación singular", "Cataluña", "Conferencia de Presidentes", "déficit fiscal", "ultimátum"],
        entities: [
          { name: "Cataluña", type: "lugar" },
          { name: "ERC", type: "partido" },
          { name: "PSOE", type: "partido" },
          { name: "14 proyectos de ley", type: "cifra" },
          { name: "7 votos", type: "cifra" },
        ],
        topicTags: ["financiación autonómica", "Cataluña", "gobernabilidad"],
        mentionedPoliticians: ["pedro-sanchez"],
        mentionedParties: ["psoe"],
        citedLegislation: [],
        referencedData: ["déficit fiscal Cataluña", "proyectos de ley en tramitación"],
      },
    ],
    sessionSentiment: {
      overall: -0.06,
      byParty: [
        { partySlug: "psoe", avgScore: 0.65, label: "positivo" },
        { partySlug: "pp", avgScore: -0.72, label: "negativo" },
        { partySlug: "sumar", avgScore: 0.15, label: "neutro" },
        { partySlug: "erc", avgScore: -0.3, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "financiación autonómica", weight: 0.35 },
      { topic: "vivienda", weight: 0.25 },
      { topic: "economía / empleo", weight: 0.15 },
      { topic: "servicios públicos", weight: 0.12 },
      { topic: "gobernabilidad", weight: 0.08 },
      { topic: "alquileres", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "PNL financiación autonómica", parties: ["psoe", "pp"], description: "PSOE presenta PNL de reforma multilateral; PP rechaza por insuficiente y maniobra dilatoria" },
      { topic: "Financiación singular vs multilateral", parties: ["erc", "pp"], description: "ERC exige mecanismo bilateral para Cataluña; PP exige igualdad de trato para todas las CCAA" },
      { topic: "Decreto vivienda", parties: ["pp", "sumar"], description: "PP denuncia incumplimiento del decreto anterior; Sumar pide incluir regulación de alquileres temporada" },
    ],
    consensusAreas: [
      { topic: "Necesidad urgente de reforma de financiación", parties: ["psoe", "sumar", "erc", "pnv"], description: "Todos los socios del Gobierno apoyan la PNL como primer paso" },
      { topic: "Empleo juvenil europeo", parties: ["psoe", "pp", "sumar", "erc"], description: "Amplio consenso en la PNL de empleo juvenil con FSE+" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Get transcript for a specific session */
export function getTranscript(sessionId: string): SessionTranscript | undefined {
  return sessionTranscripts.find((t) => t.sessionId === sessionId);
}

/** Get all interventions by a politician across all sessions */
export function getInterventionsByPolitician(politicianSlug: string): TranscriptIntervention[] {
  return sessionTranscripts.flatMap((t) =>
    t.interventions.filter((i) => i.politicianSlug === politicianSlug)
  );
}

/** Get all interventions by a party */
export function getInterventionsByParty(partySlug: string): TranscriptIntervention[] {
  return sessionTranscripts.flatMap((t) =>
    t.interventions.filter((i) => i.partySlug === partySlug)
  );
}

/** Get all claims across sessions, optionally filtered by type */
export function getAllClaims(type?: TranscriptClaim["type"]): (TranscriptClaim & { speaker: string; party: string; session: string; date: string })[] {
  const results: (TranscriptClaim & { speaker: string; party: string; session: string; date: string })[] = [];
  for (const transcript of sessionTranscripts) {
    for (const intervention of transcript.interventions) {
      for (const claim of intervention.claims) {
        if (!type || claim.type === type) {
          results.push({
            ...claim,
            speaker: intervention.speakerName,
            party: intervention.partySlug,
            session: transcript.sessionId,
            date: intervention.sessionId, // will be resolved by caller
          });
        }
      }
    }
  }
  return results;
}

/** Get sentiment summary across all sessions */
export function getSentimentSummary(): { byParty: { party: string; avgScore: number; label: SentimentLabel; interventions: number }[] } {
  const partyScores: Record<string, { total: number; count: number }> = {};
  for (const t of sessionTranscripts) {
    for (const i of t.interventions) {
      if (!partyScores[i.partySlug]) partyScores[i.partySlug] = { total: 0, count: 0 };
      partyScores[i.partySlug].total += i.sentiment.score;
      partyScores[i.partySlug].count++;
    }
  }
  const byParty = Object.entries(partyScores).map(([party, data]) => {
    const avg = data.total / data.count;
    let label: SentimentLabel = "neutro";
    if (avg >= 0.5) label = "muy-positivo";
    else if (avg >= 0.15) label = "positivo";
    else if (avg <= -0.5) label = "muy-negativo";
    else if (avg <= -0.15) label = "negativo";
    return { party, avgScore: Math.round(avg * 100) / 100, label, interventions: data.count };
  }).sort((a, b) => b.avgScore - a.avgScore);
  return { byParty };
}

/** Get all verifiable claims for fact-checking */
export function getVerifiableClaims() {
  return getAllClaims().filter((c) => c.verifiable);
}

/** Get topic heatmap: which parties talk most about which topics */
export function getTopicHeatmap(): { topic: string; parties: { party: string; mentions: number }[] }[] {
  const topicParty: Record<string, Record<string, number>> = {};
  for (const t of sessionTranscripts) {
    for (const i of t.interventions) {
      for (const tag of i.topicTags) {
        if (!topicParty[tag]) topicParty[tag] = {};
        topicParty[tag][i.partySlug] = (topicParty[tag][i.partySlug] ?? 0) + 1;
      }
    }
  }
  return Object.entries(topicParty)
    .map(([topic, parties]) => ({
      topic,
      parties: Object.entries(parties)
        .map(([party, mentions]) => ({ party, mentions }))
        .sort((a, b) => b.mentions - a.mentions),
    }))
    .sort((a, b) => b.parties.reduce((s, p) => s + p.mentions, 0) - a.parties.reduce((s, p) => s + p.mentions, 0));
}

/** Aggregate stats */
export function getTranscriptStats() {
  const totalSessions = sessionTranscripts.length;
  const totalInterventions = sessionTranscripts.reduce((s, t) => s + t.totalInterventions, 0);
  const totalWords = sessionTranscripts.reduce((s, t) => s + t.totalWords, 0);
  const totalClaims = sessionTranscripts.reduce((s, t) => s + t.interventions.reduce((c, i) => c + i.claims.length, 0), 0);
  const verifiableClaims = getVerifiableClaims().length;
  const uniqueSpeakers = new Set(sessionTranscripts.flatMap((t) => t.interventions.map((i) => i.speakerName))).size;
  return { totalSessions, totalInterventions, totalWords, totalClaims, verifiableClaims, uniqueSpeakers };
}
