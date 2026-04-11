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

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Parlamento de Andalucía: Debate de presupuestos 2026 (2 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-andalucia-001",
    totalInterventions: 3,
    totalWords: 4800,
    totalMinutes: 180,
    interventions: [
      {
        id: "int-and-01",
        sessionId: "session-andalucia-001",
        speakerName: "Juanma Moreno",
        politicianSlug: "juanma-moreno",
        partySlug: "pp",
        role: "Presidente de la Junta de Andalucía",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 45,
        durationMinutes: 45,
        fullText: "Señorías, presento ante esta Cámara los presupuestos más ambiciosos de la historia de Andalucía: 46.200 millones de euros, un 6,3% más que el ejercicio anterior. Destinamos 13.800 millones a sanidad, el mayor esfuerzo inversor jamás realizado, y 9.400 millones a educación. Pero el verdadero cambio está en la inversión productiva: 3.200 millones para infraestructuras hídricas, logísticas y tecnológicas que permitirán a Andalucía competir de tú a tú con cualquier región europea. Quiero ser claro: estos presupuestos son posibles porque hemos reducido el gasto burocrático un 14% en cuatro años. No es austeridad; es eficiencia. Andalucía ya no es la comunidad que pide, es la comunidad que crece.",
        paragraphs: [
          "Señorías, presento ante esta Cámara los presupuestos más ambiciosos de la historia de Andalucía: 46.200 millones de euros, un 6,3% más que el ejercicio anterior.",
          "Destinamos 13.800 millones a sanidad, el mayor esfuerzo inversor jamás realizado, y 9.400 millones a educación.",
          "Pero el verdadero cambio está en la inversión productiva: 3.200 millones para infraestructuras hídricas, logísticas y tecnológicas que permitirán a Andalucía competir de tú a tú con cualquier región europea.",
          "Quiero ser claro: estos presupuestos son posibles porque hemos reducido el gasto burocrático un 14% en cuatro años. No es austeridad; es eficiencia. Andalucía ya no es la comunidad que pide, es la comunidad que crece.",
        ],
        sentiment: { score: 0.78, label: "positivo", positiveSegments: 4, negativeSegments: 0, neutralSegments: 0 },
        stance: [
          { topic: "presupuestos andaluces", position: "a-favor", confidence: 0.97 },
          { topic: "sanidad", position: "a-favor", confidence: 0.9 },
          { topic: "inversión productiva", position: "a-favor", confidence: 0.93 },
        ],
        claims: [
          { text: "Presupuestos de 46.200 M€, un 6,3% más", type: "dato", verifiable: true },
          { text: "13.800 M€ destinados a sanidad", type: "dato", verifiable: true },
          { text: "Reducción del gasto burocrático del 14% en cuatro años", type: "dato", verifiable: true },
          { text: "3.200 M€ para infraestructuras productivas", type: "compromiso", verifiable: true },
        ],
        keywords: ["presupuestos", "sanidad", "educación", "infraestructuras", "eficiencia", "inversión"],
        entities: [
          { name: "Andalucía", type: "lugar" },
          { name: "46.200 millones", type: "cifra" },
          { name: "13.800 millones", type: "cifra" },
          { name: "9.400 millones", type: "cifra" },
        ],
        topicTags: ["presupuestos", "sanidad", "educación", "inversión productiva"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["presupuesto autonómico", "gasto sanitario", "gasto educativo"],
      },
      {
        id: "int-and-02",
        sessionId: "session-andalucia-001",
        speakerName: "Juan Espadas",
        politicianSlug: "juan-espadas",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 45,
        endMinute: 85,
        durationMinutes: 40,
        fullText: "Señor Moreno, sus cifras son un espejismo. Usted habla de 13.800 millones en sanidad, pero el gasto real ejecutado el año pasado fue un 9% inferior al presupuestado. Las listas de espera quirúrgicas superan los 720.000 pacientes, un récord histórico. En educación, tiene 4.200 unidades de infantil sin cubrir. Y sus 3.200 millones en infraestructuras son papel mojado: en 2025 solo ejecutó el 43% de la inversión presupuestada. No necesitamos más promesas, señor presidente; necesitamos ejecución. El PSOE propone una enmienda a la totalidad porque estos presupuestos no responden a la Andalucía real.",
        paragraphs: [
          "Señor Moreno, sus cifras son un espejismo. Usted habla de 13.800 millones en sanidad, pero el gasto real ejecutado el año pasado fue un 9% inferior al presupuestado.",
          "Las listas de espera quirúrgicas superan los 720.000 pacientes, un récord histórico. En educación, tiene 4.200 unidades de infantil sin cubrir.",
          "Y sus 3.200 millones en infraestructuras son papel mojado: en 2025 solo ejecutó el 43% de la inversión presupuestada.",
          "No necesitamos más promesas, señor presidente; necesitamos ejecución. El PSOE propone una enmienda a la totalidad porque estos presupuestos no responden a la Andalucía real.",
        ],
        sentiment: { score: -0.72, label: "negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "presupuestos andaluces", position: "en-contra", confidence: 0.96 },
          { topic: "sanidad", position: "en-contra", confidence: 0.92 },
        ],
        claims: [
          { text: "Gasto sanitario ejecutado un 9% inferior al presupuestado", type: "critica", verifiable: true },
          { text: "720.000 pacientes en listas de espera quirúrgicas", type: "dato", verifiable: true },
          { text: "4.200 unidades de infantil sin cubrir", type: "dato", verifiable: true },
          { text: "Solo se ejecutó el 43% de la inversión presupuestada en 2025", type: "critica", verifiable: true },
        ],
        keywords: ["listas de espera", "ejecución presupuestaria", "sanidad", "educación", "enmienda a la totalidad"],
        entities: [
          { name: "Juanma Moreno", type: "persona" },
          { name: "Andalucía", type: "lugar" },
          { name: "720.000 pacientes", type: "cifra" },
          { name: "43%", type: "cifra" },
        ],
        topicTags: ["presupuestos", "sanidad", "educación", "ejecución presupuestaria"],
        mentionedPoliticians: ["juanma-moreno"],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["listas de espera", "ejecución presupuestaria", "plazas infantil"],
      },
      {
        id: "int-and-03",
        sessionId: "session-andalucia-001",
        speakerName: "Inmaculada Nieto",
        politicianSlug: "inmaculada-nieto",
        partySlug: "con-andalucia",
        role: "Portavoz GP Por Andalucía",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 85,
        endMinute: 110,
        durationMinutes: 25,
        fullText: "Estos presupuestos consolidan un modelo de privatización encubierta. El 31% del gasto sanitario ya va a conciertos con la privada. Mientras tanto, 2.800 profesionales sanitarios han abandonado la sanidad pública andaluza en dos años por las condiciones laborales. Exigimos un plan de choque de contratación pública y la reversión de los conciertos en atención primaria.",
        paragraphs: [
          "Estos presupuestos consolidan un modelo de privatización encubierta. El 31% del gasto sanitario ya va a conciertos con la privada.",
          "Mientras tanto, 2.800 profesionales sanitarios han abandonado la sanidad pública andaluza en dos años por las condiciones laborales.",
          "Exigimos un plan de choque de contratación pública y la reversión de los conciertos en atención primaria.",
        ],
        sentiment: { score: -0.65, label: "negativo", positiveSegments: 0, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "presupuestos andaluces", position: "en-contra", confidence: 0.93 },
          { topic: "sanidad pública", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "31% del gasto sanitario destinado a conciertos privados", type: "dato", verifiable: true },
          { text: "2.800 profesionales sanitarios han abandonado la pública en dos años", type: "dato", verifiable: true },
        ],
        keywords: ["privatización", "conciertos sanitarios", "contratación pública", "atención primaria"],
        entities: [
          { name: "Andalucía", type: "lugar" },
          { name: "31%", type: "cifra" },
          { name: "2.800 profesionales", type: "cifra" },
        ],
        topicTags: ["sanidad", "privatización", "empleo público"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["conciertos sanitarios", "fuga de profesionales"],
      },
    ],
    sessionSentiment: {
      overall: -0.20,
      byParty: [
        { partySlug: "pp", avgScore: 0.78, label: "positivo" },
        { partySlug: "psoe", avgScore: -0.72, label: "negativo" },
        { partySlug: "con-andalucia", avgScore: -0.65, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "presupuestos", weight: 0.35 },
      { topic: "sanidad", weight: 0.30 },
      { topic: "inversión productiva", weight: 0.15 },
      { topic: "educación", weight: 0.12 },
      { topic: "ejecución presupuestaria", weight: 0.08 },
    ],
    keyConflicts: [
      { topic: "Ejecución presupuestaria", parties: ["pp", "psoe"], description: "PP defiende cifras récord; PSOE denuncia baja ejecución real" },
      { topic: "Sanidad pública vs privada", parties: ["pp", "con-andalucia"], description: "PP apuesta por conciertos; Con Andalucía exige reversión" },
    ],
    consensusAreas: [
      { topic: "Necesidad de más inversión sanitaria", parties: ["pp", "psoe", "con-andalucia"], description: "Todos coinciden en que sanidad necesita más recursos, difieren en el modelo" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Parlament de Catalunya: Debate financiación singular (8 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-catalunya-001",
    totalInterventions: 3,
    totalWords: 5200,
    totalMinutes: 195,
    interventions: [
      {
        id: "int-cat-01",
        sessionId: "session-catalunya-001",
        speakerName: "Salvador Illa",
        politicianSlug: "salvador-illa",
        partySlug: "psc",
        role: "President de la Generalitat",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 50,
        durationMinutes: 50,
        fullText: "Senyories, el acuerdo de financiación singular que hemos pactado con el Gobierno de España no es un privilegio: es justicia. Catalunya aporta el 19,2% de la recaudación estatal y recibe el 14,8% del gasto público territorializado. Esa brecha, que supera los 22.000 millones anuales, debe corregirse. El modelo que proponemos es transparente: una agencia tributaria catalana recaudará el 100% de los tributos y luego transferirá al Estado la cuota de solidaridad pactada. No es independencia fiscal; es corresponsabilidad. Los servicios públicos catalanes necesitan este modelo: tenemos ratios de médicos por habitante un 12% inferiores a la media y un déficit de infraestructuras ferroviarias de cercanías reconocido por el propio Ministerio.",
        paragraphs: [
          "Senyories, el acuerdo de financiación singular que hemos pactado con el Gobierno de España no es un privilegio: es justicia.",
          "Catalunya aporta el 19,2% de la recaudación estatal y recibe el 14,8% del gasto público territorializado. Esa brecha, que supera los 22.000 millones anuales, debe corregirse.",
          "El modelo que proponemos es transparente: una agencia tributaria catalana recaudará el 100% de los tributos y luego transferirá al Estado la cuota de solidaridad pactada. No es independencia fiscal; es corresponsabilidad.",
          "Los servicios públicos catalanes necesitan este modelo: tenemos ratios de médicos por habitante un 12% inferiores a la media y un déficit de infraestructuras ferroviarias de cercanías reconocido por el propio Ministerio.",
        ],
        sentiment: { score: 0.55, label: "positivo", positiveSegments: 3, negativeSegments: 1, neutralSegments: 0 },
        stance: [
          { topic: "financiación singular", position: "a-favor", confidence: 0.98 },
          { topic: "agencia tributaria catalana", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Catalunya aporta el 19,2% de la recaudación estatal", type: "dato", verifiable: true },
          { text: "Recibe solo el 14,8% del gasto público territorializado", type: "dato", verifiable: true },
          { text: "Brecha superior a 22.000 M€ anuales", type: "dato", verifiable: true },
          { text: "Ratios de médicos un 12% inferiores a la media", type: "dato", verifiable: true },
        ],
        keywords: ["financiación singular", "balanza fiscal", "agencia tributaria", "corresponsabilidad", "cercanías"],
        entities: [
          { name: "Catalunya", type: "lugar" },
          { name: "España", type: "lugar" },
          { name: "19,2%", type: "cifra" },
          { name: "22.000 millones", type: "cifra" },
        ],
        topicTags: ["financiación autonómica", "fiscalidad", "servicios públicos", "infraestructuras"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["balanza fiscal", "recaudación tributaria", "ratio médicos", "infraestructuras ferroviarias"],
      },
      {
        id: "int-cat-02",
        sessionId: "session-catalunya-001",
        speakerName: "Alejandro Fernández",
        politicianSlug: "alejandro-fernandez",
        partySlug: "pp",
        role: "Portavoz GP Popular",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 50,
        endMinute: 90,
        durationMinutes: 40,
        fullText: "President Illa, lo que usted llama justicia, el resto de España lo llama privilegio. Si Catalunya recauda el 100% y luego decide cuánto transfiere, las comunidades del régimen común pierden 4.500 millones anuales en el fondo de nivelación. Valencia, con una deuda per cápita de 4.200 euros por habitante provocada por la infrafinanciación, no puede asumir otro golpe. Este modelo rompe la solidaridad interterritorial que consagra el artículo 138 de la Constitución. El PP presentará recurso de inconstitucionalidad en el momento en que se formalice cualquier acuerdo bilateral que altere el sistema LOFCA sin el consenso del Consejo de Política Fiscal.",
        paragraphs: [
          "President Illa, lo que usted llama justicia, el resto de España lo llama privilegio.",
          "Si Catalunya recauda el 100% y luego decide cuánto transfiere, las comunidades del régimen común pierden 4.500 millones anuales en el fondo de nivelación.",
          "Valencia, con una deuda per cápita de 4.200 euros por habitante provocada por la infrafinanciación, no puede asumir otro golpe.",
          "Este modelo rompe la solidaridad interterritorial que consagra el artículo 138 de la Constitución. El PP presentará recurso de inconstitucionalidad en el momento en que se formalice cualquier acuerdo bilateral que altere el sistema LOFCA sin el consenso del Consejo de Política Fiscal.",
        ],
        sentiment: { score: -0.74, label: "negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "financiación singular", position: "en-contra", confidence: 0.97 },
          { topic: "solidaridad interterritorial", position: "a-favor", confidence: 0.90 },
        ],
        claims: [
          { text: "Las CCAA del régimen común perderían 4.500 M€ anuales en nivelación", type: "dato", verifiable: true },
          { text: "Valencia tiene deuda per cápita de 4.200€ por infrafinanciación", type: "dato", verifiable: true },
          { text: "Recurso de inconstitucionalidad si se altera la LOFCA bilateralmente", type: "compromiso", verifiable: false },
        ],
        keywords: ["inconstitucionalidad", "LOFCA", "solidaridad", "nivelación", "artículo 138"],
        entities: [
          { name: "Salvador Illa", type: "persona" },
          { name: "Catalunya", type: "lugar" },
          { name: "Valencia", type: "lugar" },
          { name: "Constitución", type: "ley" },
          { name: "LOFCA", type: "ley" },
          { name: "4.500 millones", type: "cifra" },
        ],
        topicTags: ["financiación autonómica", "constitucionalidad", "solidaridad interterritorial"],
        mentionedPoliticians: ["salvador-illa"],
        mentionedParties: ["psc", "psoe"],
        citedLegislation: ["LOFCA", "Constitución art. 138"],
        referencedData: ["fondo de nivelación", "deuda per cápita"],
      },
      {
        id: "int-cat-03",
        sessionId: "session-catalunya-001",
        speakerName: "Marta Vilalta",
        politicianSlug: "marta-vilalta",
        partySlug: "erc",
        role: "Portavoz GP ERC",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 90,
        endMinute: 120,
        durationMinutes: 30,
        fullText: "El acuerdo es insuficiente. ERC pactó la financiación singular como condición para la investidura y lo que tenemos sobre la mesa es una versión descafeinada. La cuota de solidaridad no está cuantificada, no hay calendario vinculante y la agencia tributaria no tendrá plenas competencias inspectoras. Si el president Illa no cumple íntegramente lo pactado, ERC retirará su apoyo parlamentario. Catalunya necesita soberanía fiscal real, no un parche cosmético.",
        paragraphs: [
          "El acuerdo es insuficiente. ERC pactó la financiación singular como condición para la investidura y lo que tenemos sobre la mesa es una versión descafeinada.",
          "La cuota de solidaridad no está cuantificada, no hay calendario vinculante y la agencia tributaria no tendrá plenas competencias inspectoras.",
          "Si el president Illa no cumple íntegramente lo pactado, ERC retirará su apoyo parlamentario. Catalunya necesita soberanía fiscal real, no un parche cosmético.",
        ],
        sentiment: { score: -0.58, label: "negativo", positiveSegments: 0, negativeSegments: 3, neutralSegments: 0 },
        stance: [
          { topic: "financiación singular", position: "ambiguo", confidence: 0.70 },
          { topic: "soberanía fiscal", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Cuota de solidaridad no cuantificada ni con calendario vinculante", type: "critica", verifiable: true },
          { text: "Agencia tributaria sin plenas competencias inspectoras", type: "critica", verifiable: true },
          { text: "ERC retirará apoyo parlamentario si no se cumple lo pactado", type: "compromiso", verifiable: false },
        ],
        keywords: ["soberanía fiscal", "investidura", "cuota de solidaridad", "agencia tributaria", "competencias inspectoras"],
        entities: [
          { name: "Salvador Illa", type: "persona" },
          { name: "ERC", type: "partido" },
          { name: "Catalunya", type: "lugar" },
        ],
        topicTags: ["financiación autonómica", "gobernabilidad", "soberanía fiscal"],
        mentionedPoliticians: ["salvador-illa"],
        mentionedParties: ["psc"],
        citedLegislation: [],
        referencedData: ["cuota de solidaridad", "competencias inspectoras"],
      },
    ],
    sessionSentiment: {
      overall: -0.26,
      byParty: [
        { partySlug: "psc", avgScore: 0.55, label: "positivo" },
        { partySlug: "pp", avgScore: -0.74, label: "negativo" },
        { partySlug: "erc", avgScore: -0.58, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "financiación singular", weight: 0.50 },
      { topic: "solidaridad interterritorial", weight: 0.20 },
      { topic: "soberanía fiscal", weight: 0.15 },
      { topic: "servicios públicos", weight: 0.10 },
      { topic: "constitucionalidad", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "Financiación singular", parties: ["psc", "pp"], description: "PSC defiende modelo bilateral; PP lo considera inconstitucional" },
      { topic: "Alcance del acuerdo", parties: ["psc", "erc"], description: "ERC exige soberanía fiscal plena; PSC ofrece versión limitada" },
    ],
    consensusAreas: [
      { topic: "Déficit de infraestructuras en Catalunya", parties: ["psc", "pp", "erc"], description: "Todos reconocen el déficit inversor en cercanías catalanas" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Asamblea de Madrid: Debate urbanismo y vivienda (3 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-madrid-001",
    totalInterventions: 3,
    totalWords: 4500,
    totalMinutes: 160,
    interventions: [
      {
        id: "int-mad-01",
        sessionId: "session-madrid-001",
        speakerName: "Isabel Díaz Ayuso",
        politicianSlug: "isabel-diaz-ayuso",
        partySlug: "pp",
        role: "Presidenta de la Comunidad de Madrid",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 40,
        durationMinutes: 40,
        fullText: "Madrid es la comunidad que más viviendas construye: 28.400 nuevas licencias en 2025, un 18% más que el año anterior. Nuestro modelo es claro: liberar suelo, agilizar licencias y no intervenir los precios. La Ley de Vivienda del Gobierno central es un fracaso: desde su aprobación, la oferta de alquiler en Madrid ha caído un 32% y los precios han subido un 14%. Nosotros apostamos por la colaboración público-privada: el Plan VIVE ha entregado ya 5.200 viviendas en alquiler asequible sin un euro de intervención de precios. Anuncio hoy la ampliación del Plan VIVE con 12.000 nuevas viviendas para 2028, todas en suelo público cedido a gestión privada.",
        paragraphs: [
          "Madrid es la comunidad que más viviendas construye: 28.400 nuevas licencias en 2025, un 18% más que el año anterior.",
          "Nuestro modelo es claro: liberar suelo, agilizar licencias y no intervenir los precios.",
          "La Ley de Vivienda del Gobierno central es un fracaso: desde su aprobación, la oferta de alquiler en Madrid ha caído un 32% y los precios han subido un 14%.",
          "Nosotros apostamos por la colaboración público-privada: el Plan VIVE ha entregado ya 5.200 viviendas en alquiler asequible sin un euro de intervención de precios. Anuncio hoy la ampliación del Plan VIVE con 12.000 nuevas viviendas para 2028, todas en suelo público cedido a gestión privada.",
        ],
        sentiment: { score: 0.62, label: "positivo", positiveSegments: 3, negativeSegments: 1, neutralSegments: 0 },
        stance: [
          { topic: "vivienda", position: "a-favor", confidence: 0.95 },
          { topic: "regulación de precios", position: "en-contra", confidence: 0.97 },
        ],
        claims: [
          { text: "28.400 nuevas licencias de vivienda en 2025", type: "dato", verifiable: true },
          { text: "Oferta de alquiler en Madrid ha caído un 32% tras la Ley de Vivienda", type: "dato", verifiable: true },
          { text: "Plan VIVE ha entregado 5.200 viviendas", type: "dato", verifiable: true },
          { text: "Ampliación Plan VIVE con 12.000 nuevas viviendas para 2028", type: "compromiso", verifiable: true },
        ],
        keywords: ["vivienda", "Plan VIVE", "licencias", "alquiler", "suelo", "liberalización"],
        entities: [
          { name: "Madrid", type: "lugar" },
          { name: "Plan VIVE", type: "ley" },
          { name: "Ley de Vivienda", type: "ley" },
          { name: "28.400", type: "cifra" },
          { name: "5.200 viviendas", type: "cifra" },
        ],
        topicTags: ["vivienda", "urbanismo", "liberalización", "colaboración público-privada"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Ley de Vivienda"],
        referencedData: ["licencias de vivienda", "oferta de alquiler", "precios alquiler"],
      },
      {
        id: "int-mad-02",
        sessionId: "session-madrid-001",
        speakerName: "Juan Lobato",
        politicianSlug: "juan-lobato",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 40,
        endMinute: 75,
        durationMinutes: 35,
        fullText: "Presidenta, su modelo de vivienda es construir pisos de lujo en los barrios obreros. El 78% de las licencias que menciona son vivienda libre de precio superior a 350.000 euros, inaccesible para las familias madrileñas. El Plan VIVE cobra alquileres de 900 euros por un piso de 55 metros cuadrados: eso no es asequible. Madrid necesita un parque público de vivienda digno: solo el 1,5% del parque residencial es público, frente al 9% de media en la UE. El PSOE propone reservar el 40% del suelo para vivienda protegida y crear una empresa pública de vivienda con 2.000 M€ de dotación.",
        paragraphs: [
          "Presidenta, su modelo de vivienda es construir pisos de lujo en los barrios obreros. El 78% de las licencias que menciona son vivienda libre de precio superior a 350.000 euros.",
          "El Plan VIVE cobra alquileres de 900 euros por un piso de 55 metros cuadrados: eso no es asequible.",
          "Madrid necesita un parque público de vivienda digno: solo el 1,5% del parque residencial es público, frente al 9% de media en la UE.",
          "El PSOE propone reservar el 40% del suelo para vivienda protegida y crear una empresa pública de vivienda con 2.000 M€ de dotación.",
        ],
        sentiment: { score: -0.60, label: "negativo", positiveSegments: 0, negativeSegments: 3, neutralSegments: 1 },
        stance: [
          { topic: "vivienda", position: "en-contra", confidence: 0.93 },
          { topic: "vivienda pública", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "78% de las licencias son vivienda libre superior a 350.000€", type: "dato", verifiable: true },
          { text: "Plan VIVE cobra 900€ por 55 m2", type: "dato", verifiable: true },
          { text: "Solo el 1,5% del parque residencial es público frente al 9% en la UE", type: "dato", verifiable: true },
          { text: "Propuesta de reservar 40% del suelo para vivienda protegida", type: "propuesta", verifiable: false },
        ],
        keywords: ["vivienda pública", "vivienda protegida", "parque residencial", "Plan VIVE", "empresa pública"],
        entities: [
          { name: "Madrid", type: "lugar" },
          { name: "Plan VIVE", type: "ley" },
          { name: "350.000 euros", type: "cifra" },
          { name: "1,5%", type: "cifra" },
          { name: "9%", type: "cifra" },
        ],
        topicTags: ["vivienda", "vivienda pública", "urbanismo", "desigualdad"],
        mentionedPoliticians: ["isabel-diaz-ayuso"],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["parque residencial público", "precios vivienda", "alquileres"],
      },
      {
        id: "int-mad-03",
        sessionId: "session-madrid-001",
        speakerName: "Manuela Bergerot",
        politicianSlug: "manuela-bergerot",
        partySlug: "mas-madrid",
        role: "Portavoz GP Más Madrid",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 75,
        endMinute: 100,
        durationMinutes: 25,
        fullText: "La emergencia habitacional en Madrid ya no es una crisis, es una catástrofe estructural. 14.000 familias están en proceso de desahucio y el 42% de los jóvenes madrileños destina más de la mitad de su salario al alquiler. Más Madrid exige una moratoria inmediata de desahucios, la regulación de los alquileres de temporada y la prohibición de los fondos buitre en vivienda residencial. No más especulación con un derecho fundamental.",
        paragraphs: [
          "La emergencia habitacional en Madrid ya no es una crisis, es una catástrofe estructural. 14.000 familias están en proceso de desahucio y el 42% de los jóvenes madrileños destina más de la mitad de su salario al alquiler.",
          "Más Madrid exige una moratoria inmediata de desahucios, la regulación de los alquileres de temporada y la prohibición de los fondos buitre en vivienda residencial.",
          "No más especulación con un derecho fundamental.",
        ],
        sentiment: { score: -0.70, label: "negativo", positiveSegments: 0, negativeSegments: 3, neutralSegments: 0 },
        stance: [
          { topic: "vivienda", position: "en-contra", confidence: 0.95 },
          { topic: "regulación alquileres", position: "a-favor", confidence: 0.97 },
        ],
        claims: [
          { text: "14.000 familias en proceso de desahucio", type: "dato", verifiable: true },
          { text: "42% de jóvenes madrileños destina más de la mitad del salario al alquiler", type: "dato", verifiable: true },
        ],
        keywords: ["desahucios", "alquileres de temporada", "fondos buitre", "emergencia habitacional"],
        entities: [
          { name: "Madrid", type: "lugar" },
          { name: "14.000 familias", type: "cifra" },
          { name: "42%", type: "cifra" },
        ],
        topicTags: ["vivienda", "desahucios", "regulación", "especulación"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["desahucios", "esfuerzo alquiler juvenil"],
      },
    ],
    sessionSentiment: {
      overall: -0.23,
      byParty: [
        { partySlug: "pp", avgScore: 0.62, label: "positivo" },
        { partySlug: "psoe", avgScore: -0.60, label: "negativo" },
        { partySlug: "mas-madrid", avgScore: -0.70, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "vivienda", weight: 0.50 },
      { topic: "urbanismo", weight: 0.20 },
      { topic: "alquiler", weight: 0.15 },
      { topic: "desahucios", weight: 0.10 },
      { topic: "vivienda pública", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "Modelo de vivienda", parties: ["pp", "psoe"], description: "PP defiende liberalización y Plan VIVE; PSOE exige 40% suelo protegido" },
      { topic: "Regulación alquileres", parties: ["pp", "mas-madrid"], description: "PP rechaza intervención de precios; Más Madrid exige moratoria y regulación" },
    ],
    consensusAreas: [
      { topic: "Necesidad de más vivienda", parties: ["pp", "psoe", "mas-madrid"], description: "Todos coinciden en que Madrid necesita más vivienda, difieren en el modelo" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Corts Valencianes: Debate reconstrucción DANA (5 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-valencia-001",
    totalInterventions: 3,
    totalWords: 5000,
    totalMinutes: 185,
    interventions: [
      {
        id: "int-val-01",
        sessionId: "session-valencia-001",
        speakerName: "Carlos Mazón",
        politicianSlug: "carlos-mazon",
        partySlug: "pp",
        role: "President de la Generalitat Valenciana",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 55,
        durationMinutes: 55,
        fullText: "Senyories, la DANA de octubre de 2024 fue la mayor catástrofe natural de la historia reciente de España. 220 vidas perdidas, 78.000 viviendas dañadas, 42.000 vehículos destruidos y daños materiales que superan los 31.000 millones de euros. Hoy, 18 meses después, puedo informar a esta Cámara de que se han ejecutado 8.400 millones en ayudas directas, se han reconstruido 12.300 viviendas y se han reactivado el 87% de los negocios afectados. Pero reconozco que no es suficiente. Solicito al Gobierno de España la aprobación urgente del segundo tramo del Plan de Reconstrucción por 6.500 millones y la exención fiscal total para la zona cero durante cinco años más.",
        paragraphs: [
          "Senyories, la DANA de octubre de 2024 fue la mayor catástrofe natural de la historia reciente de España. 220 vidas perdidas, 78.000 viviendas dañadas, 42.000 vehículos destruidos y daños materiales que superan los 31.000 millones de euros.",
          "Hoy, 18 meses después, puedo informar a esta Cámara de que se han ejecutado 8.400 millones en ayudas directas, se han reconstruido 12.300 viviendas y se han reactivado el 87% de los negocios afectados.",
          "Pero reconozco que no es suficiente. Solicito al Gobierno de España la aprobación urgente del segundo tramo del Plan de Reconstrucción por 6.500 millones y la exención fiscal total para la zona cero durante cinco años más.",
        ],
        sentiment: { score: 0.15, label: "positivo", positiveSegments: 1, negativeSegments: 1, neutralSegments: 1 },
        stance: [
          { topic: "reconstrucción DANA", position: "a-favor", confidence: 0.92 },
          { topic: "ayudas estatales", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "220 vidas perdidas en la DANA", type: "dato", verifiable: true },
          { text: "78.000 viviendas dañadas y 31.000 M€ en daños", type: "dato", verifiable: true },
          { text: "8.400 M€ ejecutados en ayudas directas", type: "dato", verifiable: true },
          { text: "12.300 viviendas reconstruidas", type: "dato", verifiable: true },
          { text: "Solicita segundo tramo de 6.500 M€", type: "propuesta", verifiable: false },
        ],
        keywords: ["DANA", "reconstrucción", "ayudas directas", "zona cero", "exención fiscal"],
        entities: [
          { name: "Comunitat Valenciana", type: "lugar" },
          { name: "Plan de Reconstrucción", type: "ley" },
          { name: "220 vidas", type: "cifra" },
          { name: "31.000 millones", type: "cifra" },
          { name: "8.400 millones", type: "cifra" },
        ],
        topicTags: ["DANA", "reconstrucción", "emergencias", "fiscalidad"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Plan de Reconstrucción DANA"],
        referencedData: ["daños DANA", "ayudas ejecutadas", "viviendas reconstruidas"],
      },
      {
        id: "int-val-02",
        sessionId: "session-valencia-001",
        speakerName: "Diana Morant",
        politicianSlug: "diana-morant",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 55,
        endMinute: 95,
        durationMinutes: 40,
        fullText: "President Mazón, usted no puede pedir al Gobierno de España lo que no ha sido capaz de gestionar. Su Consell tardó 7 horas en activar la alerta a los móviles el día de la DANA. 220 personas murieron, muchas de ellas porque no fueron avisadas a tiempo. De los 8.400 millones que dice haber ejecutado, 6.100 los ha puesto el Gobierno de España a través del decreto de ayudas directas. La Generalitat solo ha aportado 1.200 millones propios. Y hay 23.000 familias que aún no han recibido ni un euro de las ayudas autonómicas. Lo que Valencia necesita no es más excusas: es una auditoría independiente de la gestión de la emergencia y la depuración de responsabilidades políticas.",
        paragraphs: [
          "President Mazón, usted no puede pedir al Gobierno de España lo que no ha sido capaz de gestionar. Su Consell tardó 7 horas en activar la alerta a los móviles el día de la DANA.",
          "220 personas murieron, muchas de ellas porque no fueron avisadas a tiempo.",
          "De los 8.400 millones que dice haber ejecutado, 6.100 los ha puesto el Gobierno de España a través del decreto de ayudas directas. La Generalitat solo ha aportado 1.200 millones propios.",
          "Y hay 23.000 familias que aún no han recibido ni un euro de las ayudas autonómicas. Lo que Valencia necesita no es más excusas: es una auditoría independiente de la gestión de la emergencia y la depuración de responsabilidades políticas.",
        ],
        sentiment: { score: -0.82, label: "muy-negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "gestión DANA", position: "en-contra", confidence: 0.98 },
          { topic: "responsabilidades políticas", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Consell tardó 7 horas en activar la alerta a móviles", type: "critica", verifiable: true },
          { text: "6.100 M€ de los 8.400 ejecutados provienen del Gobierno central", type: "dato", verifiable: true },
          { text: "23.000 familias sin recibir ayudas autonómicas", type: "dato", verifiable: true },
        ],
        keywords: ["alerta DANA", "responsabilidades", "auditoría", "ayudas autonómicas", "gestión emergencia"],
        entities: [
          { name: "Carlos Mazón", type: "persona" },
          { name: "Comunitat Valenciana", type: "lugar" },
          { name: "23.000 familias", type: "cifra" },
          { name: "7 horas", type: "cifra" },
          { name: "6.100 millones", type: "cifra" },
        ],
        topicTags: ["DANA", "gestión de emergencias", "responsabilidad política", "ayudas"],
        mentionedPoliticians: ["carlos-mazon"],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["alerta a móviles", "ayudas ejecutadas", "familias sin ayudas"],
      },
      {
        id: "int-val-03",
        sessionId: "session-valencia-001",
        speakerName: "Joan Baldoví",
        politicianSlug: "joan-baldovi",
        partySlug: "compromis",
        role: "Portavoz GP Compromís",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 95,
        endMinute: 125,
        durationMinutes: 30,
        fullText: "Ni el Consell ni el Gobierno central están a la altura. La zona cero sigue con escombros 18 meses después. L'Horta Sud necesita un plan urbanístico completo que incluya defensas fluviales, reordenación del territorio y vivienda de reposición. Compromís propone crear una Autoridad de Reconstrucción con participación ciudadana, independiente del Consell, que gestione los fondos con transparencia total. Además, exigimos que se prohíba la reconstrucción en zonas inundables y se apruebe un nuevo mapa de riesgos vinculante.",
        paragraphs: [
          "Ni el Consell ni el Gobierno central están a la altura. La zona cero sigue con escombros 18 meses después.",
          "L'Horta Sud necesita un plan urbanístico completo que incluya defensas fluviales, reordenación del territorio y vivienda de reposición.",
          "Compromís propone crear una Autoridad de Reconstrucción con participación ciudadana, independiente del Consell, que gestione los fondos con transparencia total.",
          "Además, exigimos que se prohíba la reconstrucción en zonas inundables y se apruebe un nuevo mapa de riesgos vinculante.",
        ],
        sentiment: { score: -0.48, label: "negativo", positiveSegments: 0, negativeSegments: 2, neutralSegments: 2 },
        stance: [
          { topic: "reconstrucción DANA", position: "en-contra", confidence: 0.85 },
          { topic: "ordenación territorial", position: "a-favor", confidence: 0.93 },
        ],
        claims: [
          { text: "Zona cero sigue con escombros 18 meses después", type: "critica", verifiable: true },
          { text: "Propuesta de Autoridad de Reconstrucción independiente", type: "propuesta", verifiable: false },
          { text: "Prohibir reconstrucción en zonas inundables", type: "propuesta", verifiable: false },
        ],
        keywords: ["zona cero", "Autoridad de Reconstrucción", "zonas inundables", "mapa de riesgos", "L'Horta Sud"],
        entities: [
          { name: "L'Horta Sud", type: "lugar" },
          { name: "Comunitat Valenciana", type: "lugar" },
        ],
        topicTags: ["DANA", "reconstrucción", "ordenación territorial", "transparencia"],
        mentionedPoliticians: [],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["escombros zona cero", "mapa de riesgos"],
      },
    ],
    sessionSentiment: {
      overall: -0.38,
      byParty: [
        { partySlug: "pp", avgScore: 0.15, label: "positivo" },
        { partySlug: "psoe", avgScore: -0.82, label: "muy-negativo" },
        { partySlug: "compromis", avgScore: -0.48, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "DANA / reconstrucción", weight: 0.50 },
      { topic: "responsabilidad política", weight: 0.20 },
      { topic: "ayudas", weight: 0.15 },
      { topic: "ordenación territorial", weight: 0.10 },
      { topic: "fiscalidad", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "Gestión de la DANA", parties: ["pp", "psoe"], description: "PP destaca avances en reconstrucción; PSOE denuncia retraso en alerta y gestión" },
      { topic: "Modelo de reconstrucción", parties: ["pp", "compromis"], description: "PP pide más fondos estatales; Compromís exige autoridad independiente" },
    ],
    consensusAreas: [
      { topic: "Necesidad de más fondos para la zona cero", parties: ["pp", "psoe", "compromis"], description: "Todos piden más recursos, difieren en la gestión" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Parlamento Vasco: Debate renovación concierto económico (7 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-euskadi-001",
    totalInterventions: 3,
    totalWords: 4200,
    totalMinutes: 155,
    interventions: [
      {
        id: "int-eus-01",
        sessionId: "session-euskadi-001",
        speakerName: "Imanol Pradales",
        politicianSlug: "imanol-pradales",
        partySlug: "pnv",
        role: "Lehendakari",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 45,
        durationMinutes: 45,
        fullText: "Legebiltzarkideak, el Concierto Económico no es un privilegio: es un derecho histórico amparado por la Disposición Adicional Primera de la Constitución y por el Estatuto de Gernika. La renovación quinquenal que negociamos con el Estado se basa en datos objetivos: el cupo actual de 1.480 millones anuales debe actualizarse para reflejar las nuevas competencias asumidas en empleo y formación profesional. Proponemos un cupo de 1.650 millones que incluya la financiación de las políticas activas de empleo transferidas en 2025. Además, planteamos crear un fondo de inversión conjunta Estado-Euskadi de 800 millones para infraestructuras de la Y vasca y la transición industrial del Valle del Nervión.",
        paragraphs: [
          "Legebiltzarkideak, el Concierto Económico no es un privilegio: es un derecho histórico amparado por la Disposición Adicional Primera de la Constitución y por el Estatuto de Gernika.",
          "La renovación quinquenal que negociamos con el Estado se basa en datos objetivos: el cupo actual de 1.480 millones anuales debe actualizarse para reflejar las nuevas competencias asumidas en empleo y formación profesional.",
          "Proponemos un cupo de 1.650 millones que incluya la financiación de las políticas activas de empleo transferidas en 2025.",
          "Además, planteamos crear un fondo de inversión conjunta Estado-Euskadi de 800 millones para infraestructuras de la Y vasca y la transición industrial del Valle del Nervión.",
        ],
        sentiment: { score: 0.58, label: "positivo", positiveSegments: 3, negativeSegments: 0, neutralSegments: 1 },
        stance: [
          { topic: "concierto económico", position: "a-favor", confidence: 0.98 },
          { topic: "cupo vasco", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Cupo actual de 1.480 M€ anuales", type: "dato", verifiable: true },
          { text: "Propuesta de cupo actualizado a 1.650 M€", type: "propuesta", verifiable: false },
          { text: "Fondo de inversión conjunta de 800 M€", type: "propuesta", verifiable: false },
        ],
        keywords: ["concierto económico", "cupo", "Estatuto de Gernika", "Y vasca", "Valle del Nervión"],
        entities: [
          { name: "País Vasco", type: "lugar" },
          { name: "Estatuto de Gernika", type: "ley" },
          { name: "Disposición Adicional Primera", type: "ley" },
          { name: "1.480 millones", type: "cifra" },
          { name: "1.650 millones", type: "cifra" },
        ],
        topicTags: ["concierto económico", "financiación", "infraestructuras", "empleo"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Estatuto de Gernika", "Constitución DA 1a"],
        referencedData: ["cupo vasco", "competencias transferidas"],
      },
      {
        id: "int-eus-02",
        sessionId: "session-euskadi-001",
        speakerName: "Pello Otxandiano",
        politicianSlug: "pello-otxandiano",
        partySlug: "ehbildu",
        role: "Portavoz GP EH Bildu",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 45,
        endMinute: 80,
        durationMinutes: 35,
        fullText: "Lehendakari, EH Bildu apoya la renovación del Concierto, pero exigimos ir más allá. El cupo sigue calculándose con metodología opaca y el Estado retiene competencias que nos corresponden en seguridad social y prestaciones. Además, el concierto debe adaptarse a los retos del siglo XXI: proponemos que incluya un componente climático vinculante que obligue a destinar el 15% de la recaudación foral a transición ecológica. Euskadi necesita soberanía energética y el concierto es la herramienta para financiarla.",
        paragraphs: [
          "Lehendakari, EH Bildu apoya la renovación del Concierto, pero exigimos ir más allá.",
          "El cupo sigue calculándose con metodología opaca y el Estado retiene competencias que nos corresponden en seguridad social y prestaciones.",
          "Además, el concierto debe adaptarse a los retos del siglo XXI: proponemos que incluya un componente climático vinculante que obligue a destinar el 15% de la recaudación foral a transición ecológica.",
          "Euskadi necesita soberanía energética y el concierto es la herramienta para financiarla.",
        ],
        sentiment: { score: -0.20, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "concierto económico", position: "a-favor", confidence: 0.80 },
          { topic: "transición ecológica", position: "a-favor", confidence: 0.93 },
        ],
        claims: [
          { text: "Metodología de cálculo del cupo es opaca", type: "critica", verifiable: true },
          { text: "Estado retiene competencias en seguridad social", type: "critica", verifiable: true },
          { text: "Propone destinar 15% de recaudación foral a transición ecológica", type: "propuesta", verifiable: false },
        ],
        keywords: ["cupo", "seguridad social", "transición ecológica", "soberanía energética", "recaudación foral"],
        entities: [
          { name: "País Vasco", type: "lugar" },
          { name: "Concierto Económico", type: "ley" },
          { name: "15%", type: "cifra" },
        ],
        topicTags: ["concierto económico", "competencias", "transición ecológica"],
        mentionedPoliticians: ["imanol-pradales"],
        mentionedParties: ["pnv"],
        citedLegislation: ["Concierto Económico"],
        referencedData: ["metodología cupo", "recaudación foral"],
      },
      {
        id: "int-eus-03",
        sessionId: "session-euskadi-001",
        speakerName: "Laura Garrido",
        politicianSlug: "laura-garrido",
        partySlug: "pp",
        role: "Portavoz GP Popular",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 80,
        endMinute: 105,
        durationMinutes: 25,
        fullText: "El PP respeta el Concierto Económico como parte del orden constitucional. Pero la actualización del cupo debe hacerse con transparencia y con una auditoría independiente que verifique que el cálculo refleja el coste real de las competencias. No aceptamos que la negociación sea opaca mientras otras comunidades sufren infrafinanciación crónica. El equilibrio entre autogobierno vasco y solidaridad con el conjunto de España es un principio irrenunciable para nuestro grupo.",
        paragraphs: [
          "El PP respeta el Concierto Económico como parte del orden constitucional.",
          "Pero la actualización del cupo debe hacerse con transparencia y con una auditoría independiente que verifique que el cálculo refleja el coste real de las competencias.",
          "No aceptamos que la negociación sea opaca mientras otras comunidades sufren infrafinanciación crónica.",
          "El equilibrio entre autogobierno vasco y solidaridad con el conjunto de España es un principio irrenunciable para nuestro grupo.",
        ],
        sentiment: { score: -0.15, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "concierto económico", position: "ambiguo", confidence: 0.75 },
          { topic: "transparencia", position: "a-favor", confidence: 0.92 },
        ],
        claims: [
          { text: "Exige auditoría independiente del cálculo del cupo", type: "propuesta", verifiable: false },
          { text: "Otras CCAA sufren infrafinanciación crónica", type: "critica", verifiable: true },
        ],
        keywords: ["auditoría", "transparencia", "infrafinanciación", "solidaridad", "autogobierno"],
        entities: [
          { name: "País Vasco", type: "lugar" },
          { name: "Concierto Económico", type: "ley" },
        ],
        topicTags: ["concierto económico", "transparencia", "solidaridad interterritorial"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Concierto Económico"],
        referencedData: ["cupo vasco", "infrafinanciación"],
      },
    ],
    sessionSentiment: {
      overall: 0.08,
      byParty: [
        { partySlug: "pnv", avgScore: 0.58, label: "positivo" },
        { partySlug: "ehbildu", avgScore: -0.20, label: "negativo" },
        { partySlug: "pp", avgScore: -0.15, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "concierto económico", weight: 0.45 },
      { topic: "cupo vasco", weight: 0.25 },
      { topic: "transparencia", weight: 0.12 },
      { topic: "transición ecológica", weight: 0.10 },
      { topic: "infraestructuras", weight: 0.08 },
    ],
    keyConflicts: [
      { topic: "Alcance de la renovación", parties: ["pnv", "ehbildu"], description: "PNV propone actualización moderada; EH Bildu exige componente climático y más competencias" },
      { topic: "Transparencia del cupo", parties: ["pnv", "pp"], description: "PP exige auditoría independiente; PNV defiende la negociación bilateral tradicional" },
    ],
    consensusAreas: [
      { topic: "Legitimidad del Concierto", parties: ["pnv", "ehbildu", "pp"], description: "Todos los grupos reconocen el fundamento constitucional del Concierto Económico" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Parlamento de Galicia: Debate sector pesquero (4 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-galicia-001",
    totalInterventions: 3,
    totalWords: 4000,
    totalMinutes: 150,
    interventions: [
      {
        id: "int-gal-01",
        sessionId: "session-galicia-001",
        speakerName: "Alfonso Rueda",
        politicianSlug: "alfonso-rueda",
        partySlug: "pp",
        role: "Presidente da Xunta de Galicia",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 40,
        durationMinutes: 40,
        fullText: "Señorías, Galicia es la primera potencia pesquera de Europa y la tercera del mundo en acuicultura. Pero nuestro sector está amenazado por la regulación europea de arrastre, que reduciría un 30% la capacidad extractiva de nuestra flota. Esto afecta directamente a 42.000 empleos entre flota, industria transformadora y lonja. Hemos negociado con Bruselas una moratoria de 3 años y una dotación de 480 millones del FEMPA para la reconversión. Además, lanzo hoy el Plan Galicia Azul 2030: 1.200 millones en cinco años para diversificación acuícola, energía eólica marina y biotecnología azul. El mar es nuestro futuro.",
        paragraphs: [
          "Señorías, Galicia es la primera potencia pesquera de Europa y la tercera del mundo en acuicultura.",
          "Pero nuestro sector está amenazado por la regulación europea de arrastre, que reduciría un 30% la capacidad extractiva de nuestra flota. Esto afecta directamente a 42.000 empleos entre flota, industria transformadora y lonja.",
          "Hemos negociado con Bruselas una moratoria de 3 años y una dotación de 480 millones del FEMPA para la reconversión.",
          "Además, lanzo hoy el Plan Galicia Azul 2030: 1.200 millones en cinco años para diversificación acuícola, energía eólica marina y biotecnología azul. El mar es nuestro futuro.",
        ],
        sentiment: { score: 0.45, label: "positivo", positiveSegments: 3, negativeSegments: 1, neutralSegments: 0 },
        stance: [
          { topic: "sector pesquero", position: "a-favor", confidence: 0.95 },
          { topic: "regulación europea arrastre", position: "en-contra", confidence: 0.90 },
        ],
        claims: [
          { text: "Regulación de arrastre reduciría 30% la capacidad extractiva", type: "dato", verifiable: true },
          { text: "42.000 empleos afectados en el sector pesquero gallego", type: "dato", verifiable: true },
          { text: "Moratoria de 3 años negociada con Bruselas", type: "dato", verifiable: true },
          { text: "Plan Galicia Azul 2030 de 1.200 M€ en cinco años", type: "compromiso", verifiable: true },
        ],
        keywords: ["pesca", "arrastre", "acuicultura", "FEMPA", "eólica marina", "biotecnología azul"],
        entities: [
          { name: "Galicia", type: "lugar" },
          { name: "Plan Galicia Azul 2030", type: "ley" },
          { name: "FEMPA", type: "institucion" },
          { name: "42.000 empleos", type: "cifra" },
          { name: "1.200 millones", type: "cifra" },
        ],
        topicTags: ["pesca", "acuicultura", "regulación europea", "economía azul"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Regulación europea de arrastre"],
        referencedData: ["capacidad extractiva", "empleo pesquero", "fondos FEMPA"],
      },
      {
        id: "int-gal-02",
        sessionId: "session-galicia-001",
        speakerName: "José Ramón Gómez Besteiro",
        politicianSlug: "jose-ramon-gomez-besteiro",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 40,
        endMinute: 72,
        durationMinutes: 32,
        fullText: "Presidente, su Plan Galicia Azul suena bien pero llega tarde. En los últimos cinco años han cerrado 1.800 embarcaciones artesanales por falta de relevo generacional y subvenciones insuficientes. La edad media del marinero gallego es de 54 años. Necesitamos un plan de atracción de jóvenes al sector con bonificaciones del 100% en cuotas de la Seguridad Social durante cinco años. Además, la reconversión que propone ignora a las mariscadoras: 4.200 mujeres que trabajan a pie de playa sin contrato estable ni cotización completa.",
        paragraphs: [
          "Presidente, su Plan Galicia Azul suena bien pero llega tarde. En los últimos cinco años han cerrado 1.800 embarcaciones artesanales por falta de relevo generacional y subvenciones insuficientes.",
          "La edad media del marinero gallego es de 54 años. Necesitamos un plan de atracción de jóvenes al sector con bonificaciones del 100% en cuotas de la Seguridad Social durante cinco años.",
          "Además, la reconversión que propone ignora a las mariscadoras: 4.200 mujeres que trabajan a pie de playa sin contrato estable ni cotización completa.",
        ],
        sentiment: { score: -0.55, label: "negativo", positiveSegments: 0, negativeSegments: 3, neutralSegments: 0 },
        stance: [
          { topic: "sector pesquero", position: "en-contra", confidence: 0.88 },
          { topic: "relevo generacional", position: "a-favor", confidence: 0.93 },
        ],
        claims: [
          { text: "1.800 embarcaciones artesanales cerradas en cinco años", type: "dato", verifiable: true },
          { text: "Edad media del marinero gallego es 54 años", type: "dato", verifiable: true },
          { text: "4.200 mariscadoras sin contrato estable ni cotización completa", type: "dato", verifiable: true },
        ],
        keywords: ["pesca artesanal", "relevo generacional", "mariscadoras", "Seguridad Social", "bonificaciones"],
        entities: [
          { name: "Galicia", type: "lugar" },
          { name: "1.800 embarcaciones", type: "cifra" },
          { name: "54 años", type: "cifra" },
          { name: "4.200 mariscadoras", type: "cifra" },
        ],
        topicTags: ["pesca", "relevo generacional", "género", "empleo"],
        mentionedPoliticians: ["alfonso-rueda"],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["embarcaciones cerradas", "edad media marineros", "mariscadoras"],
      },
      {
        id: "int-gal-03",
        sessionId: "session-galicia-001",
        speakerName: "Ana Pontón",
        politicianSlug: "ana-ponton",
        partySlug: "bng",
        role: "Portavoz GP BNG",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 72,
        endMinute: 98,
        durationMinutes: 26,
        fullText: "O mar galego non pode depender das decisións que se toman en Bruxelas sen a nosa voz. Galicia necesita unha representación directa nas negociacións pesqueiras europeas, como teñen Escocia ou as illas Feroe. O BNG propón crear unha delegación pesqueira galega permanente en Bruxelas e que a Xunta teña dereito de veto sobre calquera regulación que afecte á nosa flota. Ademais, exiximos a nacionalización das lonxas e a creación dunha empresa pública de comercialización que elimine os intermediarios que se quedan co 60% do valor do peixe.",
        paragraphs: [
          "O mar galego non pode depender das decisións que se toman en Bruxelas sen a nosa voz.",
          "Galicia necesita unha representación directa nas negociacións pesqueiras europeas, como teñen Escocia ou as illas Feroe.",
          "O BNG propón crear unha delegación pesqueira galega permanente en Bruxelas e que a Xunta teña dereito de veto sobre calquera regulación que afecte á nosa flota.",
          "Ademais, exiximos a nacionalización das lonxas e a creación dunha empresa pública de comercialización que elimine os intermediarios que se quedan co 60% do valor do peixe.",
        ],
        sentiment: { score: -0.35, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "representación pesquera", position: "a-favor", confidence: 0.95 },
          { topic: "empresa pública de comercialización", position: "a-favor", confidence: 0.92 },
        ],
        claims: [
          { text: "Intermediarios se quedan con el 60% del valor del pescado", type: "dato", verifiable: true },
          { text: "Propone delegación pesquera gallega permanente en Bruselas", type: "propuesta", verifiable: false },
          { text: "Propone nacionalización de lonjas y empresa pública", type: "propuesta", verifiable: false },
        ],
        keywords: ["representación europea", "lonjas", "empresa pública", "intermediarios", "veto"],
        entities: [
          { name: "Galicia", type: "lugar" },
          { name: "Bruselas", type: "lugar" },
          { name: "Escocia", type: "lugar" },
          { name: "60%", type: "cifra" },
        ],
        topicTags: ["pesca", "soberanía", "empresa pública", "comercialización"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["valor pescado", "intermediarios"],
      },
    ],
    sessionSentiment: {
      overall: -0.15,
      byParty: [
        { partySlug: "pp", avgScore: 0.45, label: "positivo" },
        { partySlug: "psoe", avgScore: -0.55, label: "negativo" },
        { partySlug: "bng", avgScore: -0.35, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "sector pesquero", weight: 0.45 },
      { topic: "regulación europea", weight: 0.20 },
      { topic: "relevo generacional", weight: 0.15 },
      { topic: "economía azul", weight: 0.12 },
      { topic: "soberanía", weight: 0.08 },
    ],
    keyConflicts: [
      { topic: "Modelo pesquero", parties: ["pp", "bng"], description: "PP apuesta por diversificación público-privada; BNG exige empresa pública y nacionalización de lonjas" },
      { topic: "Pesca artesanal", parties: ["pp", "psoe"], description: "PP prioriza reconversión industrial; PSOE denuncia abandono de la pesca artesanal y mariscadoras" },
    ],
    consensusAreas: [
      { topic: "Defensa del sector pesquero ante la UE", parties: ["pp", "psoe", "bng"], description: "Todos defienden la flota gallega frente a la regulación de arrastre" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Cortes de Castilla y León: Debate despoblación (6 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-cyl-001",
    totalInterventions: 3,
    totalWords: 3800,
    totalMinutes: 140,
    interventions: [
      {
        id: "int-cyl-01",
        sessionId: "session-cyl-001",
        speakerName: "Alfonso Fernández Mañueco",
        politicianSlug: "alfonso-fernandez-manueco",
        partySlug: "pp",
        role: "Presidente de la Junta de Castilla y León",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 42,
        durationMinutes: 42,
        fullText: "Señorías, la despoblación es el mayor desafío estructural de Castilla y León. Hemos perdido 180.000 habitantes en una década y el 73% de nuestros municipios tiene menos de 500 vecinos. Pero no nos resignamos. Presento el Plan Repuebla 2030 con 850 millones de euros en cinco años: conectividad 5G en todo el territorio rural antes de 2028, incentivos fiscales del 50% para empresas que se instalen en municipios de menos de 5.000 habitantes, y un bono de natalidad de 8.000 euros por hijo para familias en el medio rural. Ya hemos conseguido que 14 empresas tecnológicas instalen centros de datos y oficinas en Soria, Zamora y Teruel, creando 2.300 empleos cualificados.",
        paragraphs: [
          "Señorías, la despoblación es el mayor desafío estructural de Castilla y León. Hemos perdido 180.000 habitantes en una década y el 73% de nuestros municipios tiene menos de 500 vecinos.",
          "Pero no nos resignamos. Presento el Plan Repuebla 2030 con 850 millones de euros en cinco años: conectividad 5G en todo el territorio rural antes de 2028, incentivos fiscales del 50% para empresas que se instalen en municipios de menos de 5.000 habitantes, y un bono de natalidad de 8.000 euros por hijo para familias en el medio rural.",
          "Ya hemos conseguido que 14 empresas tecnológicas instalen centros de datos y oficinas en Soria, Zamora y Teruel, creando 2.300 empleos cualificados.",
        ],
        sentiment: { score: 0.48, label: "positivo", positiveSegments: 2, negativeSegments: 1, neutralSegments: 0 },
        stance: [
          { topic: "despoblación", position: "a-favor", confidence: 0.95 },
          { topic: "incentivos rurales", position: "a-favor", confidence: 0.93 },
        ],
        claims: [
          { text: "Pérdida de 180.000 habitantes en una década", type: "dato", verifiable: true },
          { text: "73% de municipios con menos de 500 vecinos", type: "dato", verifiable: true },
          { text: "Plan Repuebla 2030 de 850 M€ en cinco años", type: "compromiso", verifiable: true },
          { text: "14 empresas tecnológicas instaladas en Soria, Zamora y Teruel", type: "dato", verifiable: true },
          { text: "2.300 empleos cualificados creados", type: "dato", verifiable: true },
        ],
        keywords: ["despoblación", "Plan Repuebla", "5G rural", "incentivos fiscales", "bono natalidad", "centros de datos"],
        entities: [
          { name: "Castilla y León", type: "lugar" },
          { name: "Soria", type: "lugar" },
          { name: "Zamora", type: "lugar" },
          { name: "Plan Repuebla 2030", type: "ley" },
          { name: "180.000 habitantes", type: "cifra" },
          { name: "850 millones", type: "cifra" },
        ],
        topicTags: ["despoblación", "digitalización", "incentivos fiscales", "natalidad"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["pérdida poblacional", "municipios despoblados", "empleo tecnológico"],
      },
      {
        id: "int-cyl-02",
        sessionId: "session-cyl-001",
        speakerName: "Luis Tudanca",
        politicianSlug: "luis-tudanca",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 42,
        endMinute: 74,
        durationMinutes: 32,
        fullText: "Presidente, su Plan Repuebla es el quinto plan contra la despoblación que presenta en seis años y ninguno ha frenado la sangría. En 2025, Castilla y León registró 8.200 nacimientos frente a 28.400 defunciones: un saldo vegetativo de -20.200. No se combate la despoblación con bonos de natalidad; se combate con servicios públicos dignos. Hay 312 consultorios rurales cerrados, 84 colegios públicos han perdido unidades y las líneas de autobús interurbano se han reducido un 35%. Un joven de Almazán no se va porque le falten 8.000 euros; se va porque no tiene pediatra, ni instituto, ni transporte público.",
        paragraphs: [
          "Presidente, su Plan Repuebla es el quinto plan contra la despoblación que presenta en seis años y ninguno ha frenado la sangría.",
          "En 2025, Castilla y León registró 8.200 nacimientos frente a 28.400 defunciones: un saldo vegetativo de -20.200.",
          "No se combate la despoblación con bonos de natalidad; se combate con servicios públicos dignos. Hay 312 consultorios rurales cerrados, 84 colegios públicos han perdido unidades y las líneas de autobús interurbano se han reducido un 35%.",
          "Un joven de Almazán no se va porque le falten 8.000 euros; se va porque no tiene pediatra, ni instituto, ni transporte público.",
        ],
        sentiment: { score: -0.68, label: "negativo", positiveSegments: 0, negativeSegments: 4, neutralSegments: 0 },
        stance: [
          { topic: "despoblación", position: "en-contra", confidence: 0.92 },
          { topic: "servicios públicos rurales", position: "a-favor", confidence: 0.96 },
        ],
        claims: [
          { text: "Saldo vegetativo de -20.200 en 2025", type: "dato", verifiable: true },
          { text: "312 consultorios rurales cerrados", type: "dato", verifiable: true },
          { text: "84 colegios públicos han perdido unidades", type: "dato", verifiable: true },
          { text: "Líneas de autobús interurbano reducidas un 35%", type: "dato", verifiable: true },
        ],
        keywords: ["saldo vegetativo", "consultorios rurales", "colegios", "transporte público", "servicios públicos"],
        entities: [
          { name: "Castilla y León", type: "lugar" },
          { name: "Almazán", type: "lugar" },
          { name: "-20.200", type: "cifra" },
          { name: "312 consultorios", type: "cifra" },
        ],
        topicTags: ["despoblación", "servicios públicos", "sanidad rural", "educación rural", "transporte"],
        mentionedPoliticians: ["alfonso-fernandez-manueco"],
        mentionedParties: ["pp"],
        citedLegislation: [],
        referencedData: ["saldo vegetativo", "consultorios cerrados", "colegios cerrados", "transporte interurbano"],
      },
      {
        id: "int-cyl-03",
        sessionId: "session-cyl-001",
        speakerName: "Juan García-Gallardo",
        politicianSlug: "juan-garcia-gallardo",
        partySlug: "vox",
        role: "Portavoz GP Vox",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 74,
        endMinute: 95,
        durationMinutes: 21,
        fullText: "La despoblación de Castilla y León no se soluciona con planes burocráticos ni con subvenciones. Se soluciona bajando impuestos radicalmente: IVA cero para actividades agrarias y ganaderas, IRPF del 10% para residentes en municipios de menos de 2.000 habitantes, y eliminación total del impuesto de sucesiones y donaciones. Además, hay que frenar la instalación masiva de parques eólicos que destrozan el paisaje y expulsan a los últimos ganaderos. 14.000 hectáreas de suelo agrario se han convertido en plantas fotovoltaicas en tres años. Vox dice no al colonialismo energético.",
        paragraphs: [
          "La despoblación de Castilla y León no se soluciona con planes burocráticos ni con subvenciones.",
          "Se soluciona bajando impuestos radicalmente: IVA cero para actividades agrarias y ganaderas, IRPF del 10% para residentes en municipios de menos de 2.000 habitantes, y eliminación total del impuesto de sucesiones y donaciones.",
          "Además, hay que frenar la instalación masiva de parques eólicos que destrozan el paisaje y expulsan a los últimos ganaderos. 14.000 hectáreas de suelo agrario se han convertido en plantas fotovoltaicas en tres años.",
          "Vox dice no al colonialismo energético.",
        ],
        sentiment: { score: -0.42, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "despoblación", position: "en-contra", confidence: 0.88 },
          { topic: "energías renovables", position: "en-contra", confidence: 0.95 },
          { topic: "reducción fiscal", position: "a-favor", confidence: 0.97 },
        ],
        claims: [
          { text: "14.000 hectáreas de suelo agrario convertidas en plantas fotovoltaicas", type: "dato", verifiable: true },
          { text: "Propone IVA cero para actividades agrarias y ganaderas", type: "propuesta", verifiable: false },
          { text: "Propone IRPF del 10% para municipios de menos de 2.000 habitantes", type: "propuesta", verifiable: false },
        ],
        keywords: ["impuestos", "IVA cero", "IRPF", "parques eólicos", "suelo agrario", "colonialismo energético"],
        entities: [
          { name: "Castilla y León", type: "lugar" },
          { name: "14.000 hectáreas", type: "cifra" },
        ],
        topicTags: ["despoblación", "fiscalidad", "energías renovables", "agricultura"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: [],
        referencedData: ["suelo agrario fotovoltaico", "impuestos rurales"],
      },
    ],
    sessionSentiment: {
      overall: -0.21,
      byParty: [
        { partySlug: "pp", avgScore: 0.48, label: "positivo" },
        { partySlug: "psoe", avgScore: -0.68, label: "negativo" },
        { partySlug: "vox", avgScore: -0.42, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "despoblación", weight: 0.45 },
      { topic: "servicios públicos rurales", weight: 0.20 },
      { topic: "fiscalidad", weight: 0.15 },
      { topic: "energías renovables", weight: 0.12 },
      { topic: "natalidad", weight: 0.08 },
    ],
    keyConflicts: [
      { topic: "Modelo contra la despoblación", parties: ["pp", "psoe"], description: "PP apuesta por incentivos y digitalización; PSOE exige servicios públicos básicos" },
      { topic: "Energías renovables en el medio rural", parties: ["pp", "vox"], description: "PP promueve renovables como oportunidad; Vox denuncia colonialismo energético" },
    ],
    consensusAreas: [
      { topic: "Urgencia del problema demográfico", parties: ["pp", "psoe", "vox"], description: "Todos reconocen que la despoblación es una emergencia estructural" },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // SESSION — Parlamento de Canarias: Debate migración (9 abril 2026)
  // ────────────────────────────────────────────────────────────────────────
  {
    sessionId: "session-canarias-001",
    totalInterventions: 3,
    totalWords: 4400,
    totalMinutes: 165,
    interventions: [
      {
        id: "int-can-01",
        sessionId: "session-canarias-001",
        speakerName: "Fernando Clavijo",
        politicianSlug: "fernando-clavijo",
        partySlug: "cc",
        role: "Presidente del Gobierno de Canarias",
        order: 1,
        agendaItemOrder: 1,
        startMinute: 0,
        endMinute: 48,
        durationMinutes: 48,
        fullText: "Señorías, Canarias está desbordada. En 2025 llegaron 47.200 migrantes irregulares a nuestras costas, un 38% más que el año anterior. Tenemos 5.800 menores no acompañados bajo tutela del Gobierno de Canarias, cuando nuestra capacidad de acogida es de 2.000. El coste para las arcas canarias supera los 340 millones anuales. He pedido al Gobierno de España en 14 ocasiones la activación de la distribución obligatoria de menores entre todas las comunidades autónomas. Solo 4 CCAA han aceptado cuotas voluntarias. Esto no es sostenible. Exijo la reforma urgente de la Ley de Extranjería para incluir un mecanismo obligatorio y solidario de reparto. Canarias no puede ser el muro de contención de la política migratoria europea.",
        paragraphs: [
          "Señorías, Canarias está desbordada. En 2025 llegaron 47.200 migrantes irregulares a nuestras costas, un 38% más que el año anterior.",
          "Tenemos 5.800 menores no acompañados bajo tutela del Gobierno de Canarias, cuando nuestra capacidad de acogida es de 2.000. El coste para las arcas canarias supera los 340 millones anuales.",
          "He pedido al Gobierno de España en 14 ocasiones la activación de la distribución obligatoria de menores entre todas las comunidades autónomas. Solo 4 CCAA han aceptado cuotas voluntarias.",
          "Esto no es sostenible. Exijo la reforma urgente de la Ley de Extranjería para incluir un mecanismo obligatorio y solidario de reparto. Canarias no puede ser el muro de contención de la política migratoria europea.",
        ],
        sentiment: { score: -0.45, label: "negativo", positiveSegments: 0, negativeSegments: 3, neutralSegments: 1 },
        stance: [
          { topic: "migración", position: "a-favor", confidence: 0.88 },
          { topic: "reparto obligatorio de menores", position: "a-favor", confidence: 0.98 },
        ],
        claims: [
          { text: "47.200 migrantes irregulares llegaron en 2025, un 38% más", type: "dato", verifiable: true },
          { text: "5.800 menores no acompañados bajo tutela canaria", type: "dato", verifiable: true },
          { text: "Coste de 340 M€ anuales para Canarias", type: "dato", verifiable: true },
          { text: "Solo 4 CCAA han aceptado cuotas voluntarias", type: "dato", verifiable: true },
          { text: "Exige reforma de Ley de Extranjería con reparto obligatorio", type: "propuesta", verifiable: false },
        ],
        keywords: ["migración", "menores no acompañados", "reparto obligatorio", "Ley de Extranjería", "desbordamiento"],
        entities: [
          { name: "Canarias", type: "lugar" },
          { name: "Ley de Extranjería", type: "ley" },
          { name: "47.200 migrantes", type: "cifra" },
          { name: "5.800 menores", type: "cifra" },
          { name: "340 millones", type: "cifra" },
        ],
        topicTags: ["migración", "menores no acompañados", "solidaridad territorial", "ley de extranjería"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Ley de Extranjería"],
        referencedData: ["llegadas irregulares", "menores tutelados", "coste acogida"],
      },
      {
        id: "int-can-02",
        sessionId: "session-canarias-001",
        speakerName: "Nira Fierro",
        politicianSlug: "nira-fierro",
        partySlug: "psoe",
        role: "Portavoz GP Socialista",
        order: 2,
        agendaItemOrder: 2,
        startMinute: 48,
        endMinute: 82,
        durationMinutes: 34,
        fullText: "Presidente Clavijo, compartimos la preocupación, pero la solución no es solo repartir menores como si fueran paquetes. Necesitamos una política migratoria integral: vías legales de migración laboral, acuerdos con los países de origen y tránsito, y un fondo europeo de emergencia para las regiones frontera. El Gobierno de España ha transferido 420 millones a Canarias en dos años para la crisis migratoria y ha gestionado la reubicación de 3.200 menores. Pero coincidimos en que el mecanismo debe ser obligatorio. El PSOE apoya la reforma de la Ley de Extranjería siempre que incluya garantías de derechos humanos y un sistema de integración real.",
        paragraphs: [
          "Presidente Clavijo, compartimos la preocupación, pero la solución no es solo repartir menores como si fueran paquetes. Necesitamos una política migratoria integral: vías legales de migración laboral, acuerdos con los países de origen y tránsito, y un fondo europeo de emergencia para las regiones frontera.",
          "El Gobierno de España ha transferido 420 millones a Canarias en dos años para la crisis migratoria y ha gestionado la reubicación de 3.200 menores.",
          "Pero coincidimos en que el mecanismo debe ser obligatorio. El PSOE apoya la reforma de la Ley de Extranjería siempre que incluya garantías de derechos humanos y un sistema de integración real.",
        ],
        sentiment: { score: 0.10, label: "neutro", positiveSegments: 1, negativeSegments: 1, neutralSegments: 1 },
        stance: [
          { topic: "migración", position: "a-favor", confidence: 0.85 },
          { topic: "reparto obligatorio de menores", position: "a-favor", confidence: 0.90 },
        ],
        claims: [
          { text: "Gobierno ha transferido 420 M€ a Canarias en dos años", type: "dato", verifiable: true },
          { text: "3.200 menores reubicados por el Gobierno central", type: "dato", verifiable: true },
        ],
        keywords: ["migración laboral", "vías legales", "fondo europeo", "derechos humanos", "integración"],
        entities: [
          { name: "Canarias", type: "lugar" },
          { name: "Ley de Extranjería", type: "ley" },
          { name: "420 millones", type: "cifra" },
          { name: "3.200 menores", type: "cifra" },
        ],
        topicTags: ["migración", "derechos humanos", "integración", "política europea"],
        mentionedPoliticians: ["fernando-clavijo"],
        mentionedParties: ["cc"],
        citedLegislation: ["Ley de Extranjería"],
        referencedData: ["transferencias migratorias", "menores reubicados"],
      },
      {
        id: "int-can-03",
        sessionId: "session-canarias-001",
        speakerName: "Manuel Domínguez",
        politicianSlug: "manuel-dominguez",
        partySlug: "pp",
        role: "Vicepresidente del Gobierno de Canarias",
        order: 3,
        agendaItemOrder: 2,
        startMinute: 82,
        endMinute: 108,
        durationMinutes: 26,
        fullText: "El PP defiende una política migratoria firme y humanitaria. Firme en el control de fronteras y en la lucha contra las mafias, y humanitaria en el trato a quienes llegan. Pero necesitamos que Europa actúe: el Pacto de Migración y Asilo debe incluir un mecanismo de financiación directa a las regiones ultraperiféricas. Canarias no puede seguir financiando con su presupuesto autonómico una emergencia que es responsabilidad de la Unión Europea. El PP exige que el próximo Consejo Europeo incluya en su agenda la situación de Canarias como frontera sur de Europa.",
        paragraphs: [
          "El PP defiende una política migratoria firme y humanitaria. Firme en el control de fronteras y en la lucha contra las mafias, y humanitaria en el trato a quienes llegan.",
          "Pero necesitamos que Europa actúe: el Pacto de Migración y Asilo debe incluir un mecanismo de financiación directa a las regiones ultraperiféricas.",
          "Canarias no puede seguir financiando con su presupuesto autonómico una emergencia que es responsabilidad de la Unión Europea.",
          "El PP exige que el próximo Consejo Europeo incluya en su agenda la situación de Canarias como frontera sur de Europa.",
        ],
        sentiment: { score: -0.18, label: "negativo", positiveSegments: 1, negativeSegments: 2, neutralSegments: 1 },
        stance: [
          { topic: "migración", position: "a-favor", confidence: 0.82 },
          { topic: "responsabilidad europea", position: "a-favor", confidence: 0.95 },
        ],
        claims: [
          { text: "Pacto de Migración y Asilo debe financiar regiones ultraperiféricas", type: "propuesta", verifiable: false },
          { text: "Exige agenda Canarias en próximo Consejo Europeo", type: "propuesta", verifiable: false },
        ],
        keywords: ["control fronteras", "mafias", "Pacto Migración y Asilo", "regiones ultraperiféricas", "Consejo Europeo"],
        entities: [
          { name: "Canarias", type: "lugar" },
          { name: "Unión Europea", type: "institucion" },
          { name: "Pacto de Migración y Asilo", type: "ley" },
          { name: "Consejo Europeo", type: "institucion" },
        ],
        topicTags: ["migración", "política europea", "fronteras", "financiación"],
        mentionedPoliticians: [],
        mentionedParties: [],
        citedLegislation: ["Pacto de Migración y Asilo"],
        referencedData: ["financiación migratoria", "regiones ultraperiféricas"],
      },
    ],
    sessionSentiment: {
      overall: -0.18,
      byParty: [
        { partySlug: "cc", avgScore: -0.45, label: "negativo" },
        { partySlug: "psoe", avgScore: 0.10, label: "neutro" },
        { partySlug: "pp", avgScore: -0.18, label: "negativo" },
      ],
    },
    dominantTopics: [
      { topic: "migración", weight: 0.50 },
      { topic: "menores no acompañados", weight: 0.20 },
      { topic: "responsabilidad europea", weight: 0.15 },
      { topic: "solidaridad territorial", weight: 0.10 },
      { topic: "derechos humanos", weight: 0.05 },
    ],
    keyConflicts: [
      { topic: "Modelo de reparto", parties: ["cc", "psoe"], description: "CC exige reparto inmediato; PSOE pide política integral con vías legales" },
      { topic: "Responsabilidad de la crisis", parties: ["cc", "pp"], description: "CC culpa al Estado; PP traslada responsabilidad a la UE" },
    ],
    consensusAreas: [
      { topic: "Reparto obligatorio de menores", parties: ["cc", "psoe", "pp"], description: "Los tres grupos apoyan la reforma de la Ley de Extranjería para un mecanismo obligatorio" },
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
