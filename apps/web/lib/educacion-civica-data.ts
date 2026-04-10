/* ═══════════════════════════════════════════════════════════════════════════
   Educacion Civica — Educational civics platform data for adolescents.
   Explains how Spain's democracy, institutions, and governance work.
   Seed date: 2026-04-10
   ═══════════════════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ModuleCategory =
  | "instituciones"
  | "democracia"
  | "presupuestos"
  | "territorio"
  | "europa"
  | "ciudadania-digital"
  | "actualidad";

export interface EducationModule {
  id: string;
  title: string;
  category: ModuleCategory;
  level: "basico" | "intermedio" | "avanzado";
  ageRange: string;
  description: string;
  objectives: string[];
  lessons: {
    id: string;
    order: number;
    title: string;
    type: "explicador" | "simulacion" | "quiz" | "comparador" | "timeline" | "debate";
    content: string;
    simpleText?: string;
    keyFacts: string[];
    interactiveElement?: string;
    liveDataRef?: string;
  }[];
  duration: string;
  tags: string[];
}

export interface CivicsChallenge {
  id: string;
  title: string;
  type: "simulacion" | "debate" | "investigacion" | "quiz";
  description: string;
  scenario: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  difficulty: "facil" | "medio" | "dificil";
  relatedModule: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms: string[];
  category: string;
  example?: string;
  constitutionalRef?: { article: number; title: string; text: string }[];
}

export interface MythReality {
  id: string;
  myth: string;
  reality: string;
  source: string;
  category: string;
}

export interface ConstitutionalRight {
  article: number;
  right: string;
  explanation: string;
  category: "fundamental" | "social" | "deber";
}

export interface NewsContext {
  id: string;
  headline: string;
  context: string;
  relatedModule: string;
  date: string;
}

export interface ParticipationMethod {
  id: string;
  name: string;
  description: string;
  requirements: string;
  example: string;
  difficulty: "facil" | "medio" | "dificil";
}

export interface InternationalComparison {
  topic: string;
  spain: string;
  countries: { country: string; value: string }[];
  source: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  task: string;
  hint: string;
  relatedModule: string;
  weekNumber: number;
}

export interface EducacionData {
  modules: EducationModule[];
  challenges: CivicsChallenge[];
  glossary: GlossaryTerm[];
  myths: MythReality[];
  rights: ConstitutionalRight[];
  newsContext: NewsContext[];
  participationMethods: ParticipationMethod[];
  internationalComparisons: InternationalComparison[];
  weeklyChallenge: WeeklyChallenge;
  stats: {
    totalModules: number;
    totalLessons: number;
    totalChallenges: number;
    byCategory: Record<ModuleCategory, number>;
    byLevel: Record<string, number>;
  };
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

const modules: EducationModule[] = [
  /* ── 1. Quien manda en Espana ─────────────────────────────────────────── */
  {
    id: "mod-instituciones-01",
    title: "Quien manda en Espana?",
    category: "instituciones",
    level: "basico",
    ageRange: "12-14",
    description: "Descubre las principales instituciones del Estado espanol: el Rey, el Gobierno, el Congreso, el Senado, el Tribunal Constitucional y el Consejo General del Poder Judicial.",
    objectives: [
      "Identificar las principales instituciones del Estado",
      "Entender la separacion de poderes",
      "Conocer el papel del Rey como Jefe del Estado",
      "Distinguir entre poder ejecutivo, legislativo y judicial",
    ],
    lessons: [
      {
        id: "mod01-l1",
        order: 1,
        title: "Los tres poderes",
        type: "explicador",
        content: "Espana es una democracia parlamentaria donde el poder se divide en tres ramas: el poder legislativo (Cortes Generales: Congreso y Senado), el poder ejecutivo (Gobierno, liderado por el Presidente) y el poder judicial (jueces y tribunales, con el Tribunal Supremo y el CGPJ). Esta separacion impide que una sola persona o grupo concentre todo el poder.",
        simpleText: "En Espana, el poder se reparte entre tres grupos: uno hace las leyes (Congreso y Senado), otro las aplica (el Gobierno) y otro juzga si se cumplen (los jueces). Asi nadie manda solo.",
        keyFacts: [
          "La Constitucion de 1978 establece la division de poderes",
          "El Congreso tiene 350 diputados y el Senado es la camara de representacion territorial",
          "El Tribunal Constitucional vela por que las leyes respeten la Constitucion",
        ],
        interactiveElement: "Diagrama interactivo: arrastra cada institucion al poder que le corresponde (ejecutivo, legislativo, judicial).",
        liveDataRef: "congreso.es/es/composicion",
      },
      {
        id: "mod01-l2",
        order: 2,
        title: "El Rey y la Corona",
        type: "explicador",
        content: "Espana es una monarquia parlamentaria. El Rey es el Jefe del Estado, pero no gobierna: su papel es simbolico y representativo. Sanciona las leyes, propone candidato a presidente del Gobierno y representa a Espana en el exterior. La Corona se hereda, pero el poder real reside en el pueblo a traves de sus representantes.",
        simpleText: "El Rey de Espana es como un arbitro: no juega el partido, pero tiene un papel importante. Firma las leyes y representa al pais, pero no decide que leyes se hacen.",
        keyFacts: [
          "Felipe VI es Rey desde junio de 2014",
          "El Rey no puede vetar leyes ni tomar decisiones politicas por su cuenta",
          "La Constitucion regula la sucesion al trono",
        ],
        interactiveElement: "Linea temporal interactiva de los reyes de Espana desde la Transicion.",
      },
      {
        id: "mod01-l3",
        order: 3,
        title: "El Gobierno y el Presidente",
        type: "explicador",
        content: "El Presidente del Gobierno es elegido por el Congreso de los Diputados tras unas elecciones generales. Dirige la politica interior y exterior, coordina a los ministros y responde ante el Congreso. El Gobierno se compone del Presidente, los vicepresidentes y los ministros, que forman el Consejo de Ministros.",
        simpleText: "El Presidente no lo elige la gente directamente, sino los diputados del Congreso. Es como el capitan de un equipo grande (el Gobierno) y tiene que rendir cuentas ante el Congreso.",
        keyFacts: [
          "El Presidente necesita la confianza del Congreso para gobernar",
          "El Consejo de Ministros aprueba decretos, proyectos de ley y presupuestos",
          "Actualmente hay 22 ministerios en el Gobierno de Espana",
        ],
        interactiveElement: "Quiz rapido: Que puede y que no puede hacer el Presidente?",
      },
      {
        id: "mod01-l4",
        order: 4,
        title: "Los guardianes de la Constitucion",
        type: "quiz",
        content: "El Tribunal Constitucional es el interprete supremo de la Constitucion. No forma parte del poder judicial ordinario. Sus 12 magistrados resuelven recursos de inconstitucionalidad, recursos de amparo y conflictos de competencias entre el Estado y las CCAA. El Consejo General del Poder Judicial (CGPJ) gobierna a los jueces.",
        keyFacts: [
          "El TC tiene 12 magistrados nombrados por 9 anos",
          "El CGPJ tiene 20 vocales y elige al presidente del Tribunal Supremo",
          "Un recurso de amparo protege los derechos fundamentales de los ciudadanos",
        ],
      },
    ],
    duration: "45 min",
    tags: ["instituciones", "constitucion", "poderes", "corona", "gobierno"],
  },

  /* ── 2. Como se hace una ley ──────────────────────────────────────────── */
  {
    id: "mod-democracia-01",
    title: "Como se hace una ley",
    category: "democracia",
    level: "intermedio",
    ageRange: "14-16",
    description: "Sigue el camino de una ley desde la idea inicial hasta su publicacion en el BOE, paso a paso.",
    objectives: [
      "Conocer las fases del proceso legislativo",
      "Distinguir entre proyecto de ley y proposicion de ley",
      "Entender el papel de las enmiendas y las comisiones",
      "Saber que es el BOE y por que importa",
    ],
    lessons: [
      {
        id: "mod02-l1",
        order: 1,
        title: "La idea: de donde nacen las leyes",
        type: "explicador",
        content: "Una ley puede nacer del Gobierno (proyecto de ley), de los grupos parlamentarios (proposicion de ley), de las CCAA o incluso de 500.000 ciudadanos (iniciativa legislativa popular). La mayoria de leyes vienen del Gobierno porque dispone de los recursos tecnicos para redactarlas.",
        simpleText: "Las leyes pueden nacer de varios sitios: del Gobierno, de los diputados, de las comunidades o incluso de la gente (si juntan 500.000 firmas). La mayoria las propone el Gobierno.",
        keyFacts: [
          "Un proyecto de ley viene del Gobierno; una proposicion, del Congreso",
          "La iniciativa legislativa popular requiere 500.000 firmas",
          "Las CCAA pueden proponer leyes al Congreso",
        ],
        interactiveElement: "Simulacion: elige el origen de tu ley y descubre el camino que seguira.",
      },
      {
        id: "mod02-l2",
        order: 2,
        title: "Debate y enmiendas",
        type: "simulacion",
        content: "Cuando un texto llega al Congreso, pasa por la comision correspondiente (sanidad, educacion, justicia...). Los diputados presentan enmiendas para modificar el texto. Luego se debate y vota en pleno. Si se aprueba, pasa al Senado, que puede introducir cambios o vetar temporalmente.",
        keyFacts: [
          "Las enmiendas pueden ser a la totalidad o parciales",
          "El Senado tiene dos meses para pronunciarse (20 dias en tramite urgente)",
          "Si el Senado modifica el texto, vuelve al Congreso para votacion final",
        ],
        interactiveElement: "Simulacion: presenta enmiendas a una ley ficticia y negocia con otros grupos.",
      },
      {
        id: "mod02-l3",
        order: 3,
        title: "Sancion, promulgacion y BOE",
        type: "explicador",
        content: "Una vez aprobada por las Cortes, la ley es sancionada por el Rey (acto formal), promulgada y publicada en el Boletin Oficial del Estado (BOE). A partir de su publicacion, entra en vigor segun lo que diga la propia ley (normalmente a los 20 dias).",
        keyFacts: [
          "El Rey no puede negarse a sancionar una ley aprobada por las Cortes",
          "El BOE es el diario oficial donde se publican todas las normas",
          "Vacatio legis: periodo entre publicacion y entrada en vigor",
        ],
      },
      {
        id: "mod02-l4",
        order: 4,
        title: "El atajo: decretos-ley y decretos legislativos",
        type: "comparador",
        content: "En situaciones de urgencia, el Gobierno puede aprobar decretos-ley sin pasar por el proceso legislativo completo. Pero el Congreso debe convalidarlos en 30 dias. Los decretos legislativos, en cambio, son encargos del Congreso al Gobierno para desarrollar una ley base.",
        keyFacts: [
          "Un decreto-ley entra en vigor inmediatamente pero debe ser convalidado",
          "No puede afectar a derechos fundamentales ni al regimen de las CCAA",
          "Un decreto legislativo desarrolla con detalle lo que una ley marco establece",
        ],
        interactiveElement: "Comparador visual: ley ordinaria vs. decreto-ley vs. decreto legislativo.",
      },
    ],
    duration: "50 min",
    tags: ["legislacion", "congreso", "senado", "boe", "proceso-legislativo"],
  },

  /* ── 3. Tu comunidad autonoma ─────────────────────────────────────────── */
  {
    id: "mod-territorio-01",
    title: "Tu comunidad autonoma",
    category: "territorio",
    level: "basico",
    ageRange: "12-14",
    description: "Espana se organiza en 17 comunidades autonomas y 2 ciudades autonomas. Cada una tiene su propio parlamento, presidente y gobierno.",
    objectives: [
      "Conocer las 17 CCAA y las 2 ciudades autonomas",
      "Entender que son las competencias autonomicas",
      "Distinguir competencias exclusivas, compartidas y transferidas",
      "Saber que es un Estatuto de Autonomia",
    ],
    lessons: [
      {
        id: "mod03-l1",
        order: 1,
        title: "El mapa autonomico",
        type: "explicador",
        content: "Espana tiene 17 comunidades autonomas (desde Andalucia hasta Pais Vasco) y 2 ciudades autonomas (Ceuta y Melilla). Cada comunidad tiene su propio Estatuto de Autonomia, que es como su 'mini-constitucion'. Este sistema se llama Estado de las Autonomias.",
        keyFacts: [
          "17 comunidades autonomas + 2 ciudades autonomas = 19 territorios",
          "El Estatuto de Autonomia define las competencias de cada comunidad",
          "El sistema autonomico se creo con la Constitucion de 1978",
        ],
        interactiveElement: "Mapa interactivo: haz clic en cada comunidad para ver su presidente, capital y datos clave.",
      },
      {
        id: "mod03-l2",
        order: 2,
        title: "Que puede hacer tu comunidad?",
        type: "comparador",
        content: "Las CCAA gestionan sanidad, educacion, servicios sociales, urbanismo y medio ambiente, entre otras competencias. Pero defensa, relaciones exteriores y justicia son del Estado central. Algunas competencias son compartidas, como la regulacion economica.",
        keyFacts: [
          "Sanidad y educacion son las competencias autonomicas con mayor presupuesto",
          "El Pais Vasco y Navarra tienen un regimen fiscal propio (concierto y convenio)",
          "El Estado puede delegar competencias adicionales mediante leyes organicas",
        ],
        interactiveElement: "Comparador: arrastra competencias al nivel correcto (Estado, CCAA, compartida).",
      },
      {
        id: "mod03-l3",
        order: 3,
        title: "La financiacion: de donde sale el dinero",
        type: "explicador",
        content: "Las CCAA se financian con impuestos cedidos por el Estado, transferencias del fondo de suficiencia y sus propios tributos. El sistema de financiacion autonomica se negocia periodicamente y es uno de los debates mas intensos de la politica espanola.",
        keyFacts: [
          "El IRPF se reparte al 50% entre Estado y comunidad autonoma",
          "El Fondo de Garantia de Servicios Publicos Fundamentales asegura servicios basicos",
          "El modelo vigente data de 2009 y esta pendiente de reforma",
        ],
      },
    ],
    duration: "40 min",
    tags: ["ccaa", "autonomias", "competencias", "financiacion", "territorio"],
  },

  /* ── 4. El presupuesto ────────────────────────────────────────────────── */
  {
    id: "mod-presupuestos-01",
    title: "El presupuesto: de donde viene y a donde va",
    category: "presupuestos",
    level: "intermedio",
    ageRange: "14-16",
    description: "Entiende los Presupuestos Generales del Estado (PGE): como se recauda, como se gasta y por que importa.",
    objectives: [
      "Entender que son los PGE y por que son la ley mas importante del ano",
      "Conocer las principales fuentes de ingresos del Estado",
      "Saber a donde va el gasto publico",
      "Comprender conceptos como deficit, deuda y politica fiscal",
    ],
    lessons: [
      {
        id: "mod04-l1",
        order: 1,
        title: "Los ingresos: impuestos y mas",
        type: "explicador",
        content: "El Estado recauda a traves de impuestos directos (IRPF, Sociedades), indirectos (IVA, Especiales) y cotizaciones sociales. Los PGE 2026 preveen ingresos de unos 575.000 millones de euros. El IRPF y el IVA son las dos fuentes principales.",
        simpleText: "El Estado necesita dinero para funcionar. Lo consigue con impuestos: cuando tus padres cobran su sueldo pagan IRPF, y cuando compras algo pagas IVA. Todo eso junto son unos 575.000 millones al ano.",
        keyFacts: [
          "El IRPF representa alrededor del 25% de los ingresos totales",
          "El IVA general es del 21%, el reducido del 10% y el superreducido del 4%",
          "Las cotizaciones sociales financian pensiones y prestaciones de desempleo",
        ],
        interactiveElement: "Grafico circular interactivo: explora de donde viene cada euro del Estado.",
      },
      {
        id: "mod04-l2",
        order: 2,
        title: "Los gastos: a donde va el dinero",
        type: "explicador",
        content: "El gasto publico se reparte en pensiones (la partida mas grande), sanidad, educacion, defensa, infraestructuras, deuda publica e I+D. Las pensiones suponen mas del 40% del gasto de los PGE.",
        keyFacts: [
          "Las pensiones cuestan mas de 190.000M EUR anuales",
          "Sanidad y educacion se gestionan mayormente desde las CCAA",
          "Los intereses de la deuda publica consumen mas de 30.000M EUR",
        ],
        interactiveElement: "Simulador de presupuesto: distribuye 100 EUR entre las partidas y compara con los PGE reales.",
      },
      {
        id: "mod04-l3",
        order: 3,
        title: "Deficit, deuda y reglas fiscales",
        type: "explicador",
        content: "Cuando el Estado gasta mas de lo que ingresa, hay deficit. Para financiar ese deficit se emite deuda publica (Letras del Tesoro, bonos). Espana tiene una deuda de aproximadamente el 105% del PIB. La UE impone reglas para limitar el deficit al 3% del PIB.",
        keyFacts: [
          "El deficit se mide como porcentaje del PIB",
          "La deuda publica espanola supera los 1,6 billones de euros",
          "El Pacto de Estabilidad de la UE limita el deficit al 3% y la deuda al 60% del PIB",
        ],
      },
    ],
    duration: "50 min",
    tags: ["presupuestos", "impuestos", "gasto-publico", "deuda", "pge"],
  },

  /* ── 5. Europa y Espana ───────────────────────────────────────────────── */
  {
    id: "mod-europa-01",
    title: "Europa y Espana",
    category: "europa",
    level: "intermedio",
    ageRange: "14-16",
    description: "Como funciona la Union Europea, que instituciones tiene y como afecta a la vida diaria en Espana.",
    objectives: [
      "Conocer las instituciones de la UE",
      "Entender como las decisiones europeas afectan a Espana",
      "Saber que son los fondos europeos",
      "Distinguir entre directivas, reglamentos y decisiones",
    ],
    lessons: [
      {
        id: "mod05-l1",
        order: 1,
        title: "Las instituciones europeas",
        type: "explicador",
        content: "La UE tiene varias instituciones clave: la Comision Europea (propone leyes), el Parlamento Europeo (colegislador elegido por los ciudadanos), el Consejo de la UE (representa a los gobiernos), el Consejo Europeo (jefes de Estado) y el Tribunal de Justicia de la UE.",
        keyFacts: [
          "Espana elige 61 eurodiputados al Parlamento Europeo",
          "La Comision Europea tiene un comisario por Estado miembro",
          "Teresa Ribera es actualmente vicepresidenta ejecutiva de la Comision",
        ],
        interactiveElement: "Organigrama interactivo de las instituciones de la UE con roles espanoles.",
      },
      {
        id: "mod05-l2",
        order: 2,
        title: "Fondos europeos y Next Generation",
        type: "explicador",
        content: "Espana recibe fondos europeos a traves de varios programas: fondos de cohesion, PAC para agricultura y los fondos Next Generation EU para la recuperacion post-COVID. Espana es uno de los mayores beneficiarios, con mas de 160.000M EUR asignados en Next Generation.",
        keyFacts: [
          "Los fondos Next Generation financian digitalizacion, energia verde y cohesion",
          "La PAC es el mayor fondo de la UE y los agricultores espanoles reciben unos 5.000M EUR anuales",
          "El Mecanismo de Recuperacion exige reformas a cambio de los fondos",
        ],
        interactiveElement: "Mapa de proyectos: explora que proyectos Next Generation se desarrollan cerca de ti.",
      },
      {
        id: "mod05-l3",
        order: 3,
        title: "El derecho europeo en tu vida",
        type: "comparador",
        content: "Las normas europeas afectan desde la calidad del agua que bebes hasta la proteccion de tus datos en Internet (RGPD). Los reglamentos se aplican directamente; las directivas deben ser transpuestas por cada Estado miembro.",
        keyFacts: [
          "El RGPD (proteccion de datos) es un reglamento europeo de aplicacion directa",
          "Las directivas dan un plazo a los Estados para adaptarlas a su legislacion",
          "El roaming gratuito en la UE es resultado de regulacion europea",
        ],
        interactiveElement: "Comparador: reglamento vs. directiva vs. decision, con ejemplos cotidianos.",
      },
    ],
    duration: "45 min",
    tags: ["europa", "ue", "fondos-europeos", "instituciones-europeas"],
  },

  /* ── 6. Elecciones ────────────────────────────────────────────────────── */
  {
    id: "mod-democracia-02",
    title: "Elecciones: como funciona votar",
    category: "democracia",
    level: "intermedio",
    ageRange: "14-16",
    description: "Sistema electoral espanol: como se vota, como se cuentan los votos, que es la ley D'Hondt y por que no todos los votos 'pesan' igual.",
    objectives: [
      "Entender el sistema electoral espanol",
      "Conocer la ley D'Hondt y su efecto en el reparto de escanos",
      "Saber que son las circunscripciones y como afectan al resultado",
      "Distinguir entre elecciones generales, autonomicas, municipales y europeas",
    ],
    lessons: [
      {
        id: "mod06-l1",
        order: 1,
        title: "Tipos de elecciones",
        type: "explicador",
        content: "En Espana hay cuatro tipos principales de elecciones: generales (Congreso y Senado), autonomicas (parlamentos de CCAA), municipales (ayuntamientos) y europeas (Parlamento Europeo). Cada tipo tiene sus propias reglas y su propio calendario.",
        keyFacts: [
          "Las elecciones generales se celebran cada 4 anos como maximo",
          "El Presidente puede disolver las Cortes y convocar elecciones anticipadas",
          "Votar es un derecho pero no una obligacion en Espana",
        ],
        interactiveElement: "Calendario electoral interactivo: cuando fueron las ultimas y cuando seran las proximas.",
      },
      {
        id: "mod06-l2",
        order: 2,
        title: "La ley D'Hondt",
        type: "simulacion",
        content: "La ley D'Hondt es el sistema que se usa para repartir los escanos proporcionalmente. Se divide el numero de votos de cada partido por 1, 2, 3, etc. y se asignan los escanos a las cifras mas altas. Este sistema favorece a los partidos grandes y penaliza a los pequenos, especialmente en circunscripciones con pocos escanos.",
        simpleText: "Imagina que hay un pastel (los escanos) y varios partidos quieren trozo. La regla D'Hondt dice: divide los votos de cada partido entre 1, 2, 3... y los trozos mas grandes se llevan escano. Los partidos grandes se llevan mas trozos.",
        keyFacts: [
          "Se necesita un minimo del 3% de los votos en una circunscripcion para optar a escano",
          "En Madrid (37 escanos) el sistema es mas proporcional que en Soria (2 escanos)",
          "La ley D'Hondt se usa en la mayoria de paises europeos",
        ],
        interactiveElement: "Simulador D'Hondt: introduce votos ficticios y observa como se reparten los escanos.",
      },
      {
        id: "mod06-l3",
        order: 3,
        title: "Las circunscripciones",
        type: "comparador",
        content: "Cada provincia es una circunscripcion electoral. Las provincias mas pobladas eligen mas diputados (Madrid: 37, Barcelona: 32) y las menos pobladas eligen un minimo de 2. Ceuta y Melilla eligen 1 cada una. Este reparto hace que el 'coste' en votos de un escano varie mucho entre provincias.",
        keyFacts: [
          "Hay 52 circunscripciones para las elecciones generales",
          "Un escano en Soria puede costar 20.000 votos; en Madrid, mas de 90.000",
          "Las CCAA uniprovinciales (Madrid, Asturias, etc.) coinciden con la circunscripcion",
        ],
        interactiveElement: "Mapa de escanos: compara el coste en votos por escano en cada provincia.",
      },
    ],
    duration: "50 min",
    tags: ["elecciones", "dhondt", "circunscripciones", "sistema-electoral"],
  },

  /* ── 7. Tu ayuntamiento ───────────────────────────────────────────────── */
  {
    id: "mod-territorio-02",
    title: "Tu ayuntamiento",
    category: "territorio",
    level: "basico",
    ageRange: "12-14",
    description: "El gobierno mas cercano a tu vida diaria: que hace el ayuntamiento, como se elige al alcalde y como puedes participar.",
    objectives: [
      "Conocer la estructura del gobierno municipal",
      "Entender que servicios presta tu ayuntamiento",
      "Saber como se elige al alcalde y a los concejales",
      "Descubrir mecanismos de participacion ciudadana local",
    ],
    lessons: [
      {
        id: "mod07-l1",
        order: 1,
        title: "Que hace el ayuntamiento",
        type: "explicador",
        content: "El ayuntamiento gestiona los servicios mas cercanos a tu dia a dia: alumbrado publico, recogida de basuras, transporte urbano, parques, bibliotecas, policia local, urbanismo y licencias de actividad. Es la administracion mas proxima al ciudadano.",
        keyFacts: [
          "Espana tiene mas de 8.000 municipios, desde pueblos de 10 habitantes hasta Madrid con 3,3 millones",
          "El pleno municipal es el organo donde se toman las decisiones mas importantes",
          "Los concejales se eligen por listas y el alcalde es normalmente el lider de la lista mas votada",
        ],
        interactiveElement: "Explorador de servicios: descubre que servicios presta tu municipio segun su tamano.",
      },
      {
        id: "mod07-l2",
        order: 2,
        title: "Como se elige al alcalde",
        type: "explicador",
        content: "En las elecciones municipales votas a una lista de concejales. El candidato de la lista mas votada es propuesto como alcalde, pero necesita mayoria absoluta o pactar con otros grupos. Si nadie alcanza la mayoria, el cabeza de la lista mas votada es alcalde automaticamente.",
        keyFacts: [
          "Las elecciones municipales se celebran cada 4 anos (las ultimas en mayo 2023)",
          "El numero de concejales depende de la poblacion: desde 5 hasta 57 en Madrid",
          "Es posible una mocion de censura constructiva para cambiar de alcalde",
        ],
      },
      {
        id: "mod07-l3",
        order: 3,
        title: "Participa en tu municipio",
        type: "debate",
        content: "No hace falta esperar a tener 18 anos para participar. Puedes asistir a plenos municipales, participar en presupuestos participativos, presentar sugerencias o quejas, unirte a asociaciones vecinales y en algunos municipios hay consejos de participacion juvenil.",
        keyFacts: [
          "Los presupuestos participativos permiten que los vecinos decidan parte del gasto municipal",
          "Los plenos municipales son publicos: cualquier persona puede asistir",
          "Muchos ayuntamientos tienen portales de transparencia y datos abiertos",
        ],
        interactiveElement: "Debate: Deberian los jovenes de 16 anos poder votar en elecciones municipales?",
      },
    ],
    duration: "40 min",
    tags: ["ayuntamiento", "municipio", "gobierno-local", "participacion"],
  },

  /* ── 8. Fake news y pensamiento critico ───────────────────────────────── */
  {
    id: "mod-digital-01",
    title: "Fake news y pensamiento critico",
    category: "ciudadania-digital",
    level: "intermedio",
    ageRange: "14-16",
    description: "Aprende a detectar desinformacion, verificar fuentes y formar tu propia opinion con pensamiento critico en la era digital.",
    objectives: [
      "Identificar senales de desinformacion",
      "Conocer herramientas de verificacion de hechos",
      "Entender como funcionan los algoritmos de redes sociales",
      "Desarrollar habitos de consumo critico de informacion",
    ],
    lessons: [
      {
        id: "mod08-l1",
        order: 1,
        title: "Que es la desinformacion",
        type: "explicador",
        content: "No toda la informacion falsa es igual. La desinformacion es informacion falsa creada deliberadamente para enganar. La misinformacion es informacion falsa compartida sin mala intencion. La malinformacion es informacion real sacada de contexto para danar. En politica, la desinformacion puede manipular elecciones y polarizar a la sociedad.",
        keyFacts: [
          "El 86% de los espanoles dice haber recibido noticias falsas alguna vez",
          "Las noticias falsas se comparten 6 veces mas rapido que las verdaderas en redes sociales",
          "Existen organizaciones de fact-checking como Maldita.es y Newtral en Espana",
        ],
        interactiveElement: "Galeria de ejemplos: identifica cual es noticia real y cual es fake.",
      },
      {
        id: "mod08-l2",
        order: 2,
        title: "Herramientas para verificar",
        type: "explicador",
        content: "Para verificar una noticia: comprueba la fuente original, busca si otros medios fiables la publican, verifica imagenes con busqueda inversa (Google Images, TinEye), consulta fact-checkers (Maldita.es, Newtral, AFP Factual) y desconfia de titulares muy emocionales o urgentes.",
        keyFacts: [
          "La busqueda inversa de imagenes detecta fotos antiguas usadas fuera de contexto",
          "Los fact-checkers siguen una metodologia estandarizada (IFCN)",
          "El portal de datos abiertos del gobierno (datos.gob.es) es una fuente primaria fiable",
        ],
        interactiveElement: "Taller practico: verifica tres noticias usando las herramientas aprendidas.",
      },
      {
        id: "mod08-l3",
        order: 3,
        title: "Algoritmos y burbujas de filtro",
        type: "explicador",
        content: "Las redes sociales usan algoritmos que te muestran contenido similar a lo que ya consumes, creando 'burbujas de filtro'. Esto puede reforzar tus creencias y limitar tu exposicion a otros puntos de vista. Ser consciente de esto es el primer paso para romper la burbuja.",
        keyFacts: [
          "El algoritmo de TikTok decide en segundos que contenido mostrarte",
          "Las camaras de eco amplifican la polarizacion politica",
          "Seguir medios con diferentes lineas editoriales ayuda a tener una vision mas completa",
        ],
        interactiveElement: "Simulacion: observa como cambia tu feed segun los clics que haces.",
      },
    ],
    duration: "45 min",
    tags: ["desinformacion", "fake-news", "pensamiento-critico", "redes-sociales", "fact-checking"],
  },

  /* ── 9. Derechos y deberes ────────────────────────────────────────────── */
  {
    id: "mod-democracia-03",
    title: "Derechos y deberes",
    category: "democracia",
    level: "basico",
    ageRange: "12-14",
    description: "La Constitucion Espanola reconoce derechos fundamentales y establece deberes. Conocelos para ejercerlos y protegerlos.",
    objectives: [
      "Conocer los derechos fundamentales de la Constitucion",
      "Distinguir entre derechos fundamentales, derechos sociales y deberes",
      "Entender que es el recurso de amparo",
      "Reflexionar sobre la responsabilidad ciudadana",
    ],
    lessons: [
      {
        id: "mod09-l1",
        order: 1,
        title: "Los derechos fundamentales",
        type: "explicador",
        content: "La Constitucion de 1978 reconoce derechos como la igualdad ante la ley, la libertad de expresion, el derecho a la educacion, la libertad religiosa, el derecho a la intimidad y la inviolabilidad del domicilio. Estos derechos estan especialmente protegidos y solo pueden regularse por ley organica.",
        keyFacts: [
          "Los derechos fundamentales estan en los articulos 14 a 29 de la Constitucion",
          "La libertad de expresion no ampara la injuria, la calumnia ni la incitacion al odio",
          "El derecho a la educacion es obligatorio y gratuito entre los 6 y los 16 anos",
        ],
        interactiveElement: "Flashcards interactivas: aprende los derechos fundamentales con ejemplos cotidianos.",
      },
      {
        id: "mod09-l2",
        order: 2,
        title: "Derechos sociales y economicos",
        type: "explicador",
        content: "Ademas de los derechos fundamentales, la Constitucion reconoce principios rectores: derecho a la vivienda, proteccion del medio ambiente, proteccion de la salud y seguridad social. Estos derechos guian la accion del gobierno pero no se pueden reclamar directamente ante un tribunal.",
        keyFacts: [
          "El derecho a la vivienda (articulo 47) es un principio rector, no un derecho fundamental",
          "La Seguridad Social protege a todos los ciudadanos ante enfermedad, desempleo y vejez",
          "Los principios rectores informan la legislacion y la practica judicial",
        ],
      },
      {
        id: "mod09-l3",
        order: 3,
        title: "Deberes ciudadanos",
        type: "debate",
        content: "La Constitucion tambien establece deberes: pagar impuestos, defender a Espana y cumplir las leyes. Pero la ciudadania democratica va mas alla: implica informarse, respetar los derechos de los demas, participar en la vida publica y contribuir al bien comun.",
        keyFacts: [
          "El deber de contribuir fiscalmente esta en el articulo 31",
          "El servicio militar obligatorio fue abolido en 2001",
          "Todos tenemos el deber de cumplir las sentencias judiciales firmes",
        ],
        interactiveElement: "Debate: Se deberia hacer obligatorio el voluntariado comunitario para jovenes?",
      },
    ],
    duration: "40 min",
    tags: ["derechos", "deberes", "constitucion", "ciudadania"],
  },

  /* ── 10. Los partidos politicos ───────────────────────────────────────── */
  {
    id: "mod-democracia-04",
    title: "Los partidos politicos",
    category: "democracia",
    level: "avanzado",
    ageRange: "16-18",
    description: "Como funcionan los partidos politicos: ideologias, financiacion, organizacion interna y su papel en la democracia.",
    objectives: [
      "Entender el papel de los partidos en la democracia",
      "Conocer el espectro ideologico izquierda-derecha",
      "Saber como se financian los partidos",
      "Reflexionar sobre la democracia interna de los partidos",
    ],
    lessons: [
      {
        id: "mod10-l1",
        order: 1,
        title: "Para que sirven los partidos",
        type: "explicador",
        content: "Los partidos politicos son el vehiculo principal de participacion politica. Canalizan las demandas ciudadanas, seleccionan candidatos, elaboran programas electorales y, si gobiernan, ejecutan esas propuestas. La Constitucion los reconoce en su articulo 6 como instrumento fundamental de participacion politica.",
        keyFacts: [
          "En Espana hay mas de 4.000 partidos registrados, pero solo unos 20 tienen representacion parlamentaria",
          "Los partidos deben tener funcionamiento interno democratico segun la Constitucion",
          "El multipartidismo se ha intensificado desde 2015 con la irrupcion de nuevos partidos",
        ],
      },
      {
        id: "mod10-l2",
        order: 2,
        title: "El espectro ideologico",
        type: "comparador",
        content: "El espectro politico clasico va de izquierda (mas igualdad, intervencion del Estado) a derecha (mas libertad individual, menos regulacion). Pero tambien hay ejes como centralismo vs. descentralizacion, progresismo vs. conservadurismo social, y europeismo vs. soberanismo.",
        keyFacts: [
          "PSOE y Sumar se situan en el centroizquierda e izquierda",
          "PP se situa en el centroderecha y VOX en la derecha",
          "Los partidos nacionalistas (PNV, ERC, Junts, BNG) anaden el eje territorial",
        ],
        interactiveElement: "Brujula politica: responde preguntas y descubre donde te situarias en el espectro.",
      },
      {
        id: "mod10-l3",
        order: 3,
        title: "Financiacion de los partidos",
        type: "explicador",
        content: "Los partidos se financian con subvenciones publicas (segun escanos y votos), cuotas de afiliados, donaciones privadas (limitadas a 50.000 EUR por persona y ano) y creditos bancarios. El Tribunal de Cuentas fiscaliza sus cuentas.",
        keyFacts: [
          "Las subvenciones publicas son la principal fuente de ingresos de los grandes partidos",
          "Las donaciones anonimas estan prohibidas",
          "Las fundaciones vinculadas a partidos estan sujetas a reglas de transparencia",
        ],
      },
      {
        id: "mod10-l4",
        order: 4,
        title: "Democracia interna",
        type: "debate",
        content: "La ley exige que los partidos funcionen democraticamente, pero en la practica el control interno varia mucho. Algunos partidos celebran primarias abiertas para elegir a su lider; otros eligen a sus dirigentes en congresos de delegados. La democracia interna es clave para la calidad democratica del pais.",
        keyFacts: [
          "El PSOE celebra primarias abiertas para elegir a su secretario general",
          "La ley de partidos de 2002 establece requisitos minimos de democracia interna",
          "Los partidos pueden ser ilegalizados si apoyan la violencia o el terrorismo",
        ],
        interactiveElement: "Debate: Deberian los partidos estar obligados a celebrar primarias abiertas?",
      },
    ],
    duration: "55 min",
    tags: ["partidos", "ideologia", "financiacion", "democracia-interna"],
  },
];

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

const challenges: CivicsChallenge[] = [
  {
    id: "ch-presupuesto",
    title: "Aprueba un presupuesto",
    type: "simulacion",
    description: "Tienes 100 unidades para repartir entre sanidad, educacion, pensiones, defensa, infraestructuras y deuda. Cada decision tiene consecuencias.",
    scenario: "Eres el ministro de Hacienda y debes presentar los PGE. La economia crece al 2% pero hay presion social por mejorar la sanidad y la educacion. La UE exige reducir el deficit.",
    questions: [
      {
        id: "ch-pre-q1",
        text: "Si aumentas el gasto en pensiones un 10%, que ocurre con el deficit?",
        options: ["Se reduce", "Se mantiene", "Aumenta", "Depende de los ingresos"],
        correctIndex: 3,
        explanation: "El efecto sobre el deficit depende de si los ingresos crecen lo suficiente para compensar el mayor gasto. Sin mas ingresos, el deficit aumenta.",
      },
      {
        id: "ch-pre-q2",
        text: "Que partida del presupuesto es la mas grande en Espana?",
        options: ["Defensa", "Educacion", "Pensiones", "Infraestructuras"],
        correctIndex: 2,
        explanation: "Las pensiones representan mas del 40% del gasto del Estado, siendo la partida mas grande con diferencia.",
      },
      {
        id: "ch-pre-q3",
        text: "Que organismo europeo vigila que Espana no supere el 3% de deficit?",
        options: ["El BCE", "La Comision Europea", "El Parlamento Europeo", "El Tribunal de Justicia de la UE"],
        correctIndex: 1,
        explanation: "La Comision Europea supervisa el cumplimiento de las reglas fiscales del Pacto de Estabilidad y Crecimiento.",
      },
    ],
    difficulty: "medio",
    relatedModule: "mod-presupuestos-01",
  },
  {
    id: "ch-negociar-ley",
    title: "Negocia una ley",
    type: "simulacion",
    description: "Tu grupo parlamentario quiere aprobar una ley de vivienda. Necesitas aliados para alcanzar 176 votos.",
    scenario: "Eres portavoz del partido gobernante con 120 escanos. Necesitas al menos 56 votos mas. Cada partido tiene sus lineas rojas.",
    questions: [
      {
        id: "ch-neg-q1",
        text: "Que es una mayoria absoluta en el Congreso espanol?",
        options: ["175 votos", "176 votos", "180 votos", "La mitad mas uno de los presentes"],
        correctIndex: 1,
        explanation: "La mayoria absoluta en el Congreso es 176 votos (la mitad mas uno de los 350 diputados).",
      },
      {
        id: "ch-neg-q2",
        text: "Cuando una ley se aprueba en comision sin pasar por pleno, se llama...",
        options: ["Decreto-ley", "Ley organica", "Competencia legislativa plena de comision", "Ley de bases"],
        correctIndex: 2,
        explanation: "Las comisiones pueden aprobar leyes con competencia legislativa plena, sin necesidad de votacion en pleno, salvo para leyes organicas o presupuestos.",
      },
      {
        id: "ch-neg-q3",
        text: "Si el Senado veta una ley, que pasa?",
        options: ["La ley queda anulada", "El Congreso puede levantarlo por mayoria absoluta", "Hay que empezar de cero", "Se convoca un referendum"],
        correctIndex: 1,
        explanation: "El veto del Senado es suspensivo. El Congreso puede levantarlo inmediatamente por mayoria absoluta o a los dos meses por mayoria simple.",
      },
    ],
    difficulty: "dificil",
    relatedModule: "mod-democracia-01",
  },
  {
    id: "ch-elecciones",
    title: "Gana unas elecciones",
    type: "simulacion",
    description: "Simula una campana electoral: elige tu programa, tus circunscripciones clave y tu estrategia.",
    scenario: "Lideras un partido nuevo con un 15% de intencion de voto nacional. Debes decidir donde concentrar esfuerzos para maximizar escanos.",
    questions: [
      {
        id: "ch-ele-q1",
        text: "En que tipo de circunscripcion es mas facil obtener escano con pocos votos?",
        options: ["Grandes (Madrid, Barcelona)", "Medianas (Valencia, Sevilla)", "Pequenas (Soria, Teruel)", "Es igual en todas"],
        correctIndex: 0,
        explanation: "Paradojicamente, en las circunscripciones grandes hay mas proporcionalidad y un partido pequeno puede obtener escano con un porcentaje menor de votos.",
      },
      {
        id: "ch-ele-q2",
        text: "Cual es la barrera electoral en las elecciones generales?",
        options: ["No hay barrera", "3% de los votos en la circunscripcion", "5% de los votos nacionales", "5% de los votos en la circunscripcion"],
        correctIndex: 1,
        explanation: "Para optar a escano en el Congreso hay que obtener al menos el 3% de los votos validos en la circunscripcion.",
      },
    ],
    difficulty: "medio",
    relatedModule: "mod-democracia-02",
  },
  {
    id: "ch-fake-news",
    title: "Detecta la fake news",
    type: "investigacion",
    description: "Analiza cinco noticias y determina cuales son verdaderas, cuales falsas y cuales estan sacadas de contexto.",
    scenario: "Es periodo electoral y las redes sociales estan llenas de noticias. Tu mision: verificar antes de compartir.",
    questions: [
      {
        id: "ch-fn-q1",
        text: "Una noticia tiene un titular muy emocional, sin autor firmante y un dominio web extrano. Que es lo mas probable?",
        options: ["Es una exclusiva", "Es una fake news", "Es una opinion personal", "Es un comunicado oficial"],
        correctIndex: 1,
        explanation: "Los titulares muy emocionales, la falta de autor y los dominios desconocidos son senales tipicas de desinformacion.",
      },
      {
        id: "ch-fn-q2",
        text: "Que herramienta usarias para verificar si una foto es real?",
        options: ["Wikipedia", "Busqueda inversa de imagenes (Google)", "ChatGPT", "La seccion de comentarios"],
        correctIndex: 1,
        explanation: "La busqueda inversa de imagenes permite encontrar el origen de una foto y comprobar si se esta usando fuera de contexto.",
      },
      {
        id: "ch-fn-q3",
        text: "Un mensaje de WhatsApp dice 'urgente, compartir ya'. Que deberias hacer?",
        options: ["Compartirlo inmediatamente", "Verificar la informacion antes de compartir", "Ignorarlo siempre", "Responder con otra cadena"],
        correctIndex: 1,
        explanation: "La urgencia por compartir es una tecnica clasica de desinformacion. Siempre hay que verificar antes de difundir.",
      },
    ],
    difficulty: "facil",
    relatedModule: "mod-digital-01",
  },
  {
    id: "ch-quiz-instituciones",
    title: "Quiz: Instituciones de Espana",
    type: "quiz",
    description: "Pon a prueba tus conocimientos sobre las instituciones espanolas.",
    scenario: "Responde correctamente a estas preguntas sobre como funciona el Estado espanol.",
    questions: [
      {
        id: "ch-qi-q1",
        text: "Cuantos diputados tiene el Congreso?",
        options: ["200", "300", "350", "400"],
        correctIndex: 2,
        explanation: "El Congreso de los Diputados tiene 350 escanos.",
      },
      {
        id: "ch-qi-q2",
        text: "Quien propone al candidato a presidente del Gobierno?",
        options: ["El Presidente saliente", "El Rey", "El Presidente del Congreso", "El Tribunal Constitucional"],
        correctIndex: 1,
        explanation: "Tras las elecciones, el Rey consulta con los lideres de los partidos y propone un candidato a presidente del Gobierno.",
      },
      {
        id: "ch-qi-q3",
        text: "Cuantos magistrados tiene el Tribunal Constitucional?",
        options: ["9", "12", "15", "21"],
        correctIndex: 1,
        explanation: "El Tribunal Constitucional se compone de 12 magistrados nombrados para un periodo de 9 anos.",
      },
      {
        id: "ch-qi-q4",
        text: "Que es una mocion de censura?",
        options: [
          "Una critica formal al Gobierno",
          "Un mecanismo para sustituir al Presidente por otro candidato",
          "Una votacion de confianza pedida por el Presidente",
          "Una disolucion del Congreso",
        ],
        correctIndex: 1,
        explanation: "La mocion de censura constructiva requiere proponer un candidato alternativo. Si prospera, ese candidato se convierte en Presidente.",
      },
    ],
    difficulty: "facil",
    relatedModule: "mod-instituciones-01",
  },
  {
    id: "ch-quiz-europa",
    title: "Quiz: Europa y tu",
    type: "quiz",
    description: "Cuanto sabes de la Union Europea y como afecta a Espana?",
    scenario: "Demuestra tus conocimientos sobre las instituciones europeas y el impacto de la UE en la vida cotidiana.",
    questions: [
      {
        id: "ch-qe-q1",
        text: "Cuantos Estados miembros tiene la UE actualmente?",
        options: ["25", "27", "28", "30"],
        correctIndex: 1,
        explanation: "La UE tiene 27 Estados miembros desde la salida del Reino Unido (Brexit) en 2020.",
      },
      {
        id: "ch-qe-q2",
        text: "Que institucion europea propone las leyes?",
        options: ["El Parlamento Europeo", "La Comision Europea", "El Consejo de la UE", "El Tribunal de Justicia"],
        correctIndex: 1,
        explanation: "La Comision Europea tiene la iniciativa legislativa: es la unica institucion que puede proponer nuevas leyes europeas.",
      },
      {
        id: "ch-qe-q3",
        text: "Que es el RGPD?",
        options: [
          "Un fondo de ayuda economica",
          "Un reglamento de proteccion de datos personales",
          "Un tratado comercial con America",
          "Un programa de becas europeas",
        ],
        correctIndex: 1,
        explanation: "El Reglamento General de Proteccion de Datos (RGPD) protege los datos personales de los ciudadanos europeos.",
      },
    ],
    difficulty: "facil",
    relatedModule: "mod-europa-01",
  },
  {
    id: "ch-quiz-constitucion",
    title: "Quiz: Derechos constitucionales",
    type: "quiz",
    description: "Conoces tus derechos? Pon a prueba tu conocimiento de la Constitucion.",
    scenario: "La Constitucion de 1978 es la base de nuestra convivencia. Veamos cuanto sabes.",
    questions: [
      {
        id: "ch-qc-q1",
        text: "En que ano se aprobo la Constitucion Espanola?",
        options: ["1975", "1978", "1982", "1986"],
        correctIndex: 1,
        explanation: "La Constitucion se aprobo en referendum el 6 de diciembre de 1978.",
      },
      {
        id: "ch-qc-q2",
        text: "Que derecho fundamental NO esta en la Constitucion?",
        options: ["Derecho a la educacion", "Derecho a la vivienda como fundamental", "Libertad de expresion", "Derecho a la vida"],
        correctIndex: 1,
        explanation: "El derecho a la vivienda (articulo 47) es un principio rector, no un derecho fundamental. Esta en el capitulo III, no en la seccion de derechos fundamentales.",
      },
      {
        id: "ch-qc-q3",
        text: "Que es un recurso de amparo?",
        options: [
          "Una peticion al Gobierno",
          "Una proteccion especial de los derechos fundamentales ante el Tribunal Constitucional",
          "Una denuncia policial",
          "Un tipo de eleccion",
        ],
        correctIndex: 1,
        explanation: "El recurso de amparo permite a cualquier ciudadano acudir al Tribunal Constitucional si considera que se han vulnerado sus derechos fundamentales.",
      },
    ],
    difficulty: "medio",
    relatedModule: "mod-democracia-03",
  },
  {
    id: "ch-debate-autonomias",
    title: "Debate: el modelo autonomico",
    type: "debate",
    description: "Debate sobre el futuro del Estado de las Autonomias: centralizar, descentralizar o federar?",
    scenario: "Se propone reformar la Constitucion para cambiar el modelo territorial. Tres posturas se enfrentan.",
    questions: [
      {
        id: "ch-da-q1",
        text: "Cuantas comunidades autonomas tiene Espana?",
        options: ["15", "17", "19", "20"],
        correctIndex: 1,
        explanation: "Espana tiene 17 comunidades autonomas (mas 2 ciudades autonomas: Ceuta y Melilla).",
      },
      {
        id: "ch-da-q2",
        text: "Que es el principio de solidaridad interterritorial?",
        options: [
          "Que todas las CCAA tengan el mismo presupuesto",
          "Que las CCAA mas ricas contribuyan a equilibrar los servicios en las mas pobres",
          "Que cada CCAA sea economicamente independiente",
          "Que el Estado controle todos los impuestos",
        ],
        correctIndex: 1,
        explanation: "El principio de solidaridad (articulo 138 CE) busca que haya un equilibrio economico entre territorios, garantizando servicios publicos similares.",
      },
    ],
    difficulty: "dificil",
    relatedModule: "mod-territorio-01",
  },
];

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

const glossary: GlossaryTerm[] = [
  {
    term: "Mocion de censura",
    definition: "Procedimiento por el que el Congreso retira la confianza al Presidente del Gobierno y lo sustituye por otro candidato. Debe incluir un candidato alternativo (constructiva).",
    relatedTerms: ["Cuestion de confianza", "Investidura", "Congreso"],
    category: "democracia",
    example: "En 2018, Pedro Sanchez presento una mocion de censura contra Mariano Rajoy que fue aprobada.",
    constitutionalRef: [{ article: 113, title: "Mocion de censura", text: "El Congreso de los Diputados puede exigir la responsabilidad politica del Gobierno mediante la adopcion por mayoria absoluta de la mocion de censura." }],
  },
  {
    term: "Proposicion de ley",
    definition: "Iniciativa legislativa presentada por un grupo parlamentario (del Congreso o del Senado) o por una comunidad autonoma.",
    relatedTerms: ["Proyecto de ley", "Proceso legislativo", "Congreso"],
    category: "democracia",
  },
  {
    term: "Proyecto de ley",
    definition: "Iniciativa legislativa presentada por el Gobierno. Es la via mas comun de creacion de leyes.",
    relatedTerms: ["Proposicion de ley", "Consejo de Ministros", "BOE"],
    category: "democracia",
  },
  {
    term: "Decreto-ley",
    definition: "Norma con rango de ley aprobada por el Gobierno en casos de urgencia. Debe ser convalidada por el Congreso en 30 dias.",
    relatedTerms: ["Decreto legislativo", "Proyecto de ley", "Consejo de Ministros"],
    category: "democracia",
    example: "Tras la DANA de 2024, el Gobierno aprobo un decreto-ley de ayudas de emergencia.",
  },
  {
    term: "Decreto legislativo",
    definition: "Norma con rango de ley dictada por el Gobierno por delegacion del Congreso, para desarrollar una ley de bases o refundir textos legales.",
    relatedTerms: ["Decreto-ley", "Ley de bases"],
    category: "democracia",
  },
  {
    term: "Ley organica",
    definition: "Ley que requiere mayoria absoluta en el Congreso para su aprobacion. Regula derechos fundamentales, estatutos de autonomia y el regimen electoral.",
    relatedTerms: ["Ley ordinaria", "Constitucion", "Derechos fundamentales"],
    category: "democracia",
    example: "La LOMLOE (ley de educacion) es una ley organica porque afecta al derecho a la educacion.",
    constitutionalRef: [{ article: 81, title: "Leyes organicas", text: "Son leyes organicas las relativas al desarrollo de los derechos fundamentales y de las libertades publicas, las que aprueben los Estatutos de Autonomia y el regimen electoral general." }],
  },
  {
    term: "Investidura",
    definition: "Proceso por el que el Congreso vota para otorgar su confianza a un candidato a presidente del Gobierno.",
    relatedTerms: ["Mocion de censura", "Presidente del Gobierno", "Congreso"],
    category: "democracia",
    constitutionalRef: [{ article: 99, title: "Investidura del Presidente", text: "Despues de cada renovacion del Congreso, el Rey, previa consulta con los representantes de los grupos politicos, propondra un candidato a la Presidencia del Gobierno." }],
  },
  {
    term: "Cuestion de confianza",
    definition: "Mecanismo por el que el Presidente pide al Congreso que ratifique su confianza. Si la pierde, debe dimitir.",
    relatedTerms: ["Mocion de censura", "Investidura"],
    category: "democracia",
    example: "Adolfo Suarez presento una cuestion de confianza en 1980.",
  },
  {
    term: "BOE (Boletin Oficial del Estado)",
    definition: "Diario oficial donde se publican leyes, decretos, nombramientos y demas actos oficiales. La publicacion en el BOE es requisito para la entrada en vigor de las normas.",
    relatedTerms: ["Vacatio legis", "Decreto-ley", "Ley"],
    category: "instituciones",
  },
  {
    term: "Congreso de los Diputados",
    definition: "Camara baja de las Cortes Generales, compuesta por 350 diputados elegidos por sufragio universal directo. Es la camara con mayor poder legislativo.",
    relatedTerms: ["Senado", "Cortes Generales", "Diputado"],
    category: "instituciones",
  },
  {
    term: "Senado",
    definition: "Camara alta de las Cortes Generales y camara de representacion territorial. Tiene 266 senadores, algunos elegidos directamente y otros designados por los parlamentos autonomicos.",
    relatedTerms: ["Congreso", "Cortes Generales", "CCAA"],
    category: "instituciones",
  },
  {
    term: "Estatuto de Autonomia",
    definition: "Norma institucional basica de cada comunidad autonoma. Define sus competencias, instituciones y organizacion territorial. Se aprueba como ley organica.",
    relatedTerms: ["Comunidad autonoma", "Competencias", "Ley organica"],
    category: "territorio",
    example: "El Estatut de Catalunya de 2006 fue parcialmente anulado por el Tribunal Constitucional en 2010.",
  },
  {
    term: "Competencias exclusivas",
    definition: "Materias que corresponden en exclusiva al Estado (defensa, relaciones exteriores) o a las CCAA (urbanismo, ciertos impuestos).",
    relatedTerms: ["Competencias compartidas", "Estatuto de Autonomia", "Constitucion"],
    category: "territorio",
  },
  {
    term: "Concierto economico",
    definition: "Sistema fiscal especial del Pais Vasco por el cual las diputaciones forales recaudan todos los impuestos y pagan al Estado una cantidad (cupo) por los servicios que este presta.",
    relatedTerms: ["Convenio economico", "Cupo", "Pais Vasco"],
    category: "presupuestos",
  },
  {
    term: "IRPF",
    definition: "Impuesto sobre la Renta de las Personas Fisicas. Grava los ingresos de los ciudadanos con tipos progresivos (quien mas gana, mas paga).",
    relatedTerms: ["IVA", "Impuesto de Sociedades", "PGE"],
    category: "presupuestos",
    example: "El IRPF se reparte al 50% entre el Estado y la comunidad autonoma donde resides.",
  },
  {
    term: "IVA",
    definition: "Impuesto sobre el Valor Anadido. Grava el consumo de bienes y servicios con tres tipos: general (21%), reducido (10%) y superreducido (4%).",
    relatedTerms: ["IRPF", "Impuestos indirectos", "PGE"],
    category: "presupuestos",
    example: "El pan y la leche tienen un IVA superreducido del 4%.",
  },
  {
    term: "PGE (Presupuestos Generales del Estado)",
    definition: "Ley anual que establece los ingresos y gastos del Estado para el ano siguiente. Es considerada la ley mas importante del ano.",
    relatedTerms: ["Deficit", "Deuda publica", "Ministerio de Hacienda"],
    category: "presupuestos",
  },
  {
    term: "Deficit publico",
    definition: "Diferencia negativa entre los ingresos y los gastos del Estado. Se mide como porcentaje del PIB.",
    relatedTerms: ["Deuda publica", "PGE", "Pacto de Estabilidad"],
    category: "presupuestos",
  },
  {
    term: "Deuda publica",
    definition: "Dinero que el Estado debe a sus acreedores (inversores que han comprado bonos y letras del Tesoro). Se mide como porcentaje del PIB.",
    relatedTerms: ["Deficit", "Letras del Tesoro", "PIB"],
    category: "presupuestos",
    example: "La deuda publica espanola supera el 105% del PIB, es decir, mas de 1,6 billones de euros.",
  },
  {
    term: "Tribunal Constitucional",
    definition: "Organo que interpreta la Constitucion y resuelve conflictos sobre la constitucionalidad de las leyes. Tiene 12 magistrados.",
    relatedTerms: ["Recurso de amparo", "Recurso de inconstitucionalidad", "Constitucion"],
    category: "instituciones",
  },
  {
    term: "CGPJ (Consejo General del Poder Judicial)",
    definition: "Organo de gobierno de los jueces y magistrados. Tiene 20 vocales y elige al presidente del Tribunal Supremo.",
    relatedTerms: ["Tribunal Supremo", "Poder judicial", "Constitucion"],
    category: "instituciones",
  },
  {
    term: "Recurso de amparo",
    definition: "Recurso ante el Tribunal Constitucional para proteger los derechos fundamentales cuando los tribunales ordinarios no lo han hecho.",
    relatedTerms: ["Tribunal Constitucional", "Derechos fundamentales"],
    category: "democracia",
    constitutionalRef: [{ article: 53, title: "Tutela de derechos", text: "Cualquier ciudadano podra recabar la tutela de las libertades y derechos reconocidos en el articulo 14 y la Seccion primera del Capitulo segundo ante los Tribunales ordinarios y, en su caso, a traves del recurso de amparo ante el Tribunal Constitucional." }],
  },
  {
    term: "D'Hondt (Ley)",
    definition: "Sistema de reparto proporcional de escanos. Los votos de cada partido se dividen sucesivamente por 1, 2, 3, etc. y los escanos se asignan a los cocientes mas altos.",
    relatedTerms: ["Sistema electoral", "Circunscripcion", "Escano"],
    category: "democracia",
    example: "En una circunscripcion de 5 escanos, un partido con el 30% de los votos puede obtener 2 escanos con D'Hondt.",
  },
  {
    term: "Circunscripcion electoral",
    definition: "Division territorial a efectos electorales. En Espana, cada provincia es una circunscripcion para las elecciones generales.",
    relatedTerms: ["D'Hondt", "Escano", "Sistema electoral"],
    category: "democracia",
  },
  {
    term: "Comision Europea",
    definition: "Organo ejecutivo de la Union Europea. Propone leyes, vigila los tratados y gestiona el presupuesto de la UE. Tiene un comisario por Estado miembro.",
    relatedTerms: ["Parlamento Europeo", "Consejo de la UE", "Union Europea"],
    category: "europa",
  },
  {
    term: "Parlamento Europeo",
    definition: "Institucion de la UE elegida directamente por los ciudadanos europeos. Colegisla con el Consejo de la UE y aprueba el presupuesto.",
    relatedTerms: ["Comision Europea", "Eurodiputado", "Union Europea"],
    category: "europa",
  },
  {
    term: "Reglamento europeo",
    definition: "Norma de la UE de aplicacion directa en todos los Estados miembros sin necesidad de transposicion.",
    relatedTerms: ["Directiva", "Comision Europea", "Parlamento Europeo"],
    category: "europa",
    example: "El RGPD es un reglamento europeo: se aplica igual en Espana, Francia o Alemania.",
  },
  {
    term: "Directiva europea",
    definition: "Norma de la UE que establece un objetivo que los Estados deben alcanzar, pero cada uno elige como incorporarla a su legislacion nacional.",
    relatedTerms: ["Reglamento", "Transposicion", "Comision Europea"],
    category: "europa",
  },
  {
    term: "Vacatio legis",
    definition: "Periodo entre la publicacion de una ley en el BOE y su entrada en vigor. Si la ley no dice nada, son 20 dias.",
    relatedTerms: ["BOE", "Ley", "Publicacion"],
    category: "democracia",
  },
  {
    term: "Iniciativa legislativa popular",
    definition: "Derecho de los ciudadanos a proponer una ley al Congreso reuniendo al menos 500.000 firmas verificadas.",
    relatedTerms: ["Proposicion de ley", "Congreso", "Participacion ciudadana"],
    category: "democracia",
    example: "La ILP sobre dacion en pago de 2013 fue la mas exitosa en recoger firmas en la historia de Espana.",
  },
  {
    term: "Presupuestos participativos",
    definition: "Mecanismo de participacion ciudadana por el que los vecinos deciden en que se invierte una parte del presupuesto municipal.",
    relatedTerms: ["Ayuntamiento", "Participacion ciudadana", "Gobierno local"],
    category: "territorio",
    example: "Madrid, Barcelona y muchas otras ciudades han implantado presupuestos participativos.",
  },
  {
    term: "Consejo de Ministros",
    definition: "Organo colegiado del Gobierno donde el Presidente, los vicepresidentes y los ministros toman decisiones ejecutivas: aprueba decretos, proyectos de ley y nombramientos.",
    relatedTerms: ["Gobierno", "Presidente", "Decreto-ley"],
    category: "instituciones",
  },
  {
    term: "Cortes Generales",
    definition: "Nombre oficial del parlamento espanol, compuesto por el Congreso de los Diputados y el Senado.",
    relatedTerms: ["Congreso", "Senado", "Poder legislativo"],
    category: "instituciones",
  },
  {
    term: "Estado de alarma",
    definition: "Situacion excepcional declarada por el Gobierno en caso de crisis graves (catastrofes, pandemias). Permite limitar ciertos derechos por un plazo determinado.",
    relatedTerms: ["Estado de excepcion", "Estado de sitio", "Constitucion"],
    category: "democracia",
    example: "Durante la pandemia de COVID-19 se declaro el estado de alarma en marzo de 2020.",
  },
  {
    term: "Referendum",
    definition: "Consulta directa a los ciudadanos sobre una decision politica importante. En Espana debe ser autorizado por el Rey a propuesta del Presidente.",
    relatedTerms: ["Democracia directa", "Constitucion", "Participacion ciudadana"],
    category: "democracia",
    example: "La Constitucion de 1978 fue aprobada en referendum con un 87% de votos a favor.",
    constitutionalRef: [{ article: 92, title: "Referendum consultivo", text: "Las decisiones politicas de especial trascendencia podran ser sometidas a referendum consultivo de todos los ciudadanos." }],
  },
];

// ---------------------------------------------------------------------------
// Myths vs Reality
// ---------------------------------------------------------------------------

const myths: MythReality[] = [
  {
    id: "myth-01",
    myth: "El Rey de Espana tiene poder real y puede vetar leyes",
    reality: "El Rey tiene un papel simbolico y representativo. No puede vetar leyes: debe sancionar (firmar) toda ley aprobada por las Cortes Generales. Su funcion esta regulada por el Titulo II de la Constitucion.",
    source: "Constitucion Espanola, Titulo II, articulos 56-65",
    category: "instituciones",
  },
  {
    id: "myth-02",
    myth: "Los diputados pueden cobrar por no ir al Congreso",
    reality: "Los diputados tienen asignacion fija, pero se les puede descontar por inasistencia reiterada sin justificacion. El Reglamento del Congreso prevee sanciones economicas. Sin embargo, la percepcion publica de absentismo existe porque no todos los debates requieren presencia en pleno.",
    source: "Reglamento del Congreso de los Diputados, articulo 99",
    category: "instituciones",
  },
  {
    id: "myth-03",
    myth: "Las comunidades autonomas pueden independizarse si quieren",
    reality: "La Constitucion no reconoce el derecho de secesion. El articulo 2 establece la indisoluble unidad de la nacion espanola y reconoce el derecho a la autonomia, no a la independencia. Cualquier cambio requeriria una reforma constitucional.",
    source: "Constitucion Espanola, articulo 2",
    category: "territorio",
  },
  {
    id: "myth-04",
    myth: "Todos los impuestos van al Gobierno central",
    reality: "Los impuestos se reparten entre Estado, CCAA y ayuntamientos. El IRPF se divide al 50% entre Estado y CCAA. Las CCAA gestionan alrededor del 35% del gasto publico total, y los ayuntamientos tambien recaudan impuestos propios como el IBI.",
    source: "LOFCA y sistema de financiacion autonomica",
    category: "presupuestos",
  },
  {
    id: "myth-05",
    myth: "En Espana el voto es obligatorio",
    reality: "El voto en Espana es un derecho, no una obligacion. La Constitucion reconoce el derecho de sufragio activo (articulo 23) pero no impone la obligacion de votar. La participacion media en generales ronda el 70%.",
    source: "Constitucion Espanola, articulo 23",
    category: "democracia",
  },
  {
    id: "myth-06",
    myth: "La Constitucion espanola nunca se ha modificado",
    reality: "Se ha reformado dos veces: en 1992 (para permitir el sufragio pasivo de extranjeros en municipales, por el Tratado de Maastricht) y en 2011 (para incluir el principio de estabilidad presupuestaria en el articulo 135).",
    source: "BOE, reformas constitucionales de 1992 y 2011",
    category: "democracia",
  },
  {
    id: "myth-07",
    myth: "El Senado espanol no sirve para nada",
    reality: "Aunque su poder es menor que el del Congreso, el Senado puede introducir enmiendas y vetar leyes (veto suspensivo). Ademas, autoriza la aplicacion del articulo 155 y es la camara de representacion territorial.",
    source: "Constitucion Espanola, articulos 66-69",
    category: "instituciones",
  },
  {
    id: "myth-08",
    myth: "Los eurodiputados espanoles no influyen en la vida diaria",
    reality: "Las decisiones del Parlamento Europeo afectan directamente a la vida cotidiana: desde el roaming gratuito hasta las normas de calidad alimentaria, el RGPD de proteccion de datos y las reglas de emisiones de vehiculos.",
    source: "Parlamento Europeo, legislacion vigente",
    category: "europa",
  },
  {
    id: "myth-09",
    myth: "Los presupuestos del Estado los decide el Presidente solo",
    reality: "Los PGE son elaborados por el Gobierno (Ministerio de Hacienda), debatidos y enmendados en comision y pleno del Congreso, y deben ser aprobados por las Cortes. Sin mayoria parlamentaria, no se aprueban.",
    source: "Constitucion Espanola, articulo 134",
    category: "presupuestos",
  },
  {
    id: "myth-10",
    myth: "En Espana solo se puede participar en politica votando cada 4 anos",
    reality: "Ademas de votar, los ciudadanos pueden presentar ILP (con 500.000 firmas), participar en presupuestos participativos, asistir a plenos municipales, unirse a asociaciones, presentar peticiones al Congreso y participar en consultas publicas de la UE.",
    source: "Constitucion Espanola, articulos 23, 29, 87.3",
    category: "democracia",
  },
];

// ---------------------------------------------------------------------------
// Constitutional Rights & Duties
// ---------------------------------------------------------------------------

const rights: ConstitutionalRight[] = [
  { article: 14, right: "Igualdad ante la ley", explanation: "Todos los espanoles son iguales ante la ley, sin discriminacion por nacimiento, raza, sexo, religion, opinion o cualquier otra circunstancia.", category: "fundamental" },
  { article: 15, right: "Derecho a la vida", explanation: "Todos tienen derecho a la vida y a la integridad fisica y moral. Queda abolida la pena de muerte.", category: "fundamental" },
  { article: 16, right: "Libertad religiosa e ideologica", explanation: "Se garantiza la libertad ideologica, religiosa y de culto. Nadie puede ser obligado a declarar sobre su ideologia, religion o creencias.", category: "fundamental" },
  { article: 18, right: "Derecho a la intimidad", explanation: "Se garantiza el derecho al honor, a la intimidad personal y familiar y a la propia imagen. El domicilio es inviolable.", category: "fundamental" },
  { article: 20, right: "Libertad de expresion", explanation: "Se reconoce el derecho a expresar y difundir libremente pensamientos, ideas y opiniones. Se garantiza la libertad de prensa.", category: "fundamental" },
  { article: 21, right: "Derecho de reunion", explanation: "Se reconoce el derecho de reunion pacifica y sin armas. Las manifestaciones requieren comunicacion previa a la autoridad.", category: "fundamental" },
  { article: 22, right: "Derecho de asociacion", explanation: "Se reconoce el derecho de asociacion. Estan prohibidas las asociaciones secretas y las de caracter paramilitar.", category: "fundamental" },
  { article: 23, right: "Derecho de participacion politica", explanation: "Los ciudadanos tienen derecho a participar en asuntos publicos directamente o por medio de representantes elegidos en elecciones periodicas por sufragio universal.", category: "fundamental" },
  { article: 24, right: "Tutela judicial efectiva", explanation: "Todas las personas tienen derecho a obtener la tutela efectiva de los jueces y tribunales, sin que pueda producirse indefension.", category: "fundamental" },
  { article: 27, right: "Derecho a la educacion", explanation: "Todos tienen derecho a la educacion. La ensenanza basica es obligatoria y gratuita.", category: "fundamental" },
  { article: 28, right: "Derecho de huelga y sindicacion", explanation: "Todos tienen derecho a sindicarse libremente. Se reconoce el derecho a la huelga de los trabajadores.", category: "fundamental" },
  { article: 31, right: "Deber de contribuir fiscalmente", explanation: "Todos contribuiran al sostenimiento de los gastos publicos de acuerdo con su capacidad economica mediante un sistema tributario justo.", category: "deber" },
  { article: 35, right: "Derecho al trabajo", explanation: "Todos los espanoles tienen el deber de trabajar y el derecho al trabajo, a la libre eleccion de profesion y a una remuneracion suficiente.", category: "social" },
  { article: 43, right: "Derecho a la proteccion de la salud", explanation: "Se reconoce el derecho a la proteccion de la salud. Compete a los poderes publicos organizar y tutelar la salud publica.", category: "social" },
  { article: 47, right: "Derecho a la vivienda", explanation: "Todos los espanoles tienen derecho a disfrutar de una vivienda digna y adecuada. Los poderes publicos promoveran las condiciones necesarias.", category: "social" },
];

// ---------------------------------------------------------------------------
// News Context
// ---------------------------------------------------------------------------

const newsContext: NewsContext[] = [
  {
    id: "news-01",
    headline: "El Congreso debate los Presupuestos Generales del Estado para 2027",
    context: "Los PGE son la ley mas importante del ano. Cada grupo parlamentario presenta enmiendas para modificar las partidas. El Gobierno necesita mayoria para aprobarlos.",
    relatedModule: "mod-presupuestos-01",
    date: "2026-04",
  },
  {
    id: "news-02",
    headline: "Espana preside el turno rotatorio del Consejo de la UE",
    context: "La presidencia rotatoria del Consejo de la UE permite al pais que la ejerce fijar prioridades en la agenda europea durante seis meses.",
    relatedModule: "mod-europa-01",
    date: "2026-04",
  },
  {
    id: "news-03",
    headline: "Debate sobre la reforma del sistema de financiacion autonomica",
    context: "El sistema de financiacion de las CCAA data de 2009 y lleva anos pendiente de reforma. Las comunidades infrafinanciadas reclaman un reparto mas justo.",
    relatedModule: "mod-territorio-01",
    date: "2026-04",
  },
  {
    id: "news-04",
    headline: "Aumento de la desinformacion en redes antes de las elecciones",
    context: "Antes de cada proceso electoral aumentan las campanas de desinformacion. Los organismos de verificacion como Maldita.es y Newtral intensifican su trabajo.",
    relatedModule: "mod-digital-01",
    date: "2026-04",
  },
  {
    id: "news-05",
    headline: "El Tribunal Constitucional resuelve un conflicto competencial",
    context: "Los conflictos de competencias entre Estado y CCAA se resuelven en el Tribunal Constitucional. Estos conflictos son habituales en materias como sanidad, educacion o medio ambiente.",
    relatedModule: "mod-instituciones-01",
    date: "2026-04",
  },
];

// ---------------------------------------------------------------------------
// Participation Methods
// ---------------------------------------------------------------------------

const participationMethods: ParticipationMethod[] = [
  {
    id: "part-01",
    name: "Iniciativa Legislativa Popular (ILP)",
    description: "Los ciudadanos pueden proponer leyes al Congreso reuniendo al menos 500.000 firmas acreditadas ante la Junta Electoral Central.",
    requirements: "500.000 firmas verificadas, no puede afectar a materias reservadas a ley organica ni a impuestos",
    example: "La ILP sobre dacion en pago de 2013 recogio mas de 1,4 millones de firmas",
    difficulty: "dificil",
  },
  {
    id: "part-02",
    name: "Presupuestos participativos",
    description: "Mecanismo por el que los vecinos deciden directamente en que se invierte parte del presupuesto municipal. Se vota online o presencialmente.",
    requirements: "Estar empadronado en el municipio (en muchos sitios desde los 16 anos)",
    example: "Madrid Decide permitio a los ciudadanos votar sobre proyectos de hasta 100 millones de euros",
    difficulty: "facil",
  },
  {
    id: "part-03",
    name: "Consultas publicas de la UE",
    description: "La Comision Europea abre consultas publicas antes de proponer nueva legislacion. Cualquier ciudadano europeo puede participar online.",
    requirements: "Acceso a Internet y registro en el portal Have Your Say de la CE",
    example: "La consulta sobre el horario de verano recibio 4,6 millones de respuestas",
    difficulty: "facil",
  },
  {
    id: "part-04",
    name: "Peticiones al Congreso",
    description: "El articulo 29 de la Constitucion reconoce el derecho de peticion. Se puede enviar una peticion individual o colectiva al Congreso sobre cualquier tema.",
    requirements: "Presentar escrito ante la Comision de Peticiones del Congreso",
    example: "Se reciben cientos de peticiones al ano sobre temas como vivienda, sanidad o transporte",
    difficulty: "facil",
  },
  {
    id: "part-05",
    name: "Plenos municipales abiertos",
    description: "Los plenos del ayuntamiento son publicos. Cualquier vecino puede asistir y, en muchos municipios, hay un turno de preguntas ciudadanas.",
    requirements: "Ninguno especial; basta con asistir al pleno en el ayuntamiento",
    example: "En municipios pequenos, los plenos son un canal directo de comunicacion con los concejales",
    difficulty: "facil",
  },
  {
    id: "part-06",
    name: "Asociaciones vecinales y juveniles",
    description: "Las asociaciones son la columna vertebral de la participacion ciudadana. Existen asociaciones vecinales, juveniles, culturales, ecologistas y de todo tipo.",
    requirements: "Inscribirse en una asociacion existente o crear una nueva (minimo 3 personas)",
    example: "Las asociaciones vecinales jugaron un papel clave en la mejora de barrios durante la Transicion",
    difficulty: "facil",
  },
];

// ---------------------------------------------------------------------------
// International Comparisons
// ---------------------------------------------------------------------------

const internationalComparisons: InternationalComparison[] = [
  {
    topic: "Sistema de gobierno",
    spain: "Monarquia parlamentaria",
    countries: [
      { country: "Francia", value: "Republica semipresidencialista" },
      { country: "Alemania", value: "Republica parlamentaria federal" },
      { country: "Reino Unido", value: "Monarquia parlamentaria" },
      { country: "Estados Unidos", value: "Republica presidencialista federal" },
    ],
    source: "CIA World Factbook",
  },
  {
    topic: "Numero de parlamentarios por millon de habitantes",
    spain: "7,4 (350 diputados / 47,4M hab.)",
    countries: [
      { country: "Alemania", value: "8,8 (736 diputados / 83,2M hab.)" },
      { country: "Francia", value: "8,5 (577 diputados / 67,8M hab.)" },
      { country: "Italia", value: "6,7 (400 diputados / 59,6M hab.)" },
      { country: "Reino Unido", value: "9,7 (650 MPs / 67M hab.)" },
    ],
    source: "IPU Parline, datos 2024",
  },
  {
    topic: "Presion fiscal (% PIB)",
    spain: "38,3%",
    countries: [
      { country: "Francia", value: "47,0%" },
      { country: "Alemania", value: "41,8%" },
      { country: "Italia", value: "42,9%" },
      { country: "Media OCDE", value: "34,1%" },
    ],
    source: "OCDE Revenue Statistics 2025",
  },
  {
    topic: "Edad minima para votar",
    spain: "18 anos",
    countries: [
      { country: "Austria", value: "16 anos" },
      { country: "Alemania", value: "16 anos (europeas)" },
      { country: "Grecia", value: "17 anos" },
      { country: "Estados Unidos", value: "18 anos" },
    ],
    source: "ACE Electoral Knowledge Network",
  },
  {
    topic: "Gasto en educacion (% PIB)",
    spain: "4,3%",
    countries: [
      { country: "Finlandia", value: "5,9%" },
      { country: "Francia", value: "5,5%" },
      { country: "Alemania", value: "4,7%" },
      { country: "Media UE", value: "4,8%" },
    ],
    source: "Eurostat, datos 2024",
  },
];

// ---------------------------------------------------------------------------
// Weekly Challenge
// ---------------------------------------------------------------------------

const weeklyChallenge: WeeklyChallenge = {
  id: "wk-15-2026",
  title: "Investiga tu ayuntamiento",
  description: "Esta semana, descubre como funciona el gobierno de tu municipio y que servicios ofrece.",
  task: "Busca en la web de tu ayuntamiento: 1) Quien es el alcalde/alcaldesa, 2) Cuantos concejales hay, 3) Que partidos gobiernan, 4) Si tiene presupuestos participativos. Comparte lo que descubras.",
  hint: "Busca '[nombre de tu municipio] ayuntamiento transparencia' en Google",
  relatedModule: "mod-territorio-02",
  weekNumber: 15,
};

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildEducacionData(): EducacionData {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const byCategory: Record<ModuleCategory, number> = {
    instituciones: 0,
    democracia: 0,
    presupuestos: 0,
    territorio: 0,
    europa: 0,
    "ciudadania-digital": 0,
    actualidad: 0,
  };
  for (const m of modules) {
    byCategory[m.category]++;
  }

  const byLevel: Record<string, number> = { basico: 0, intermedio: 0, avanzado: 0 };
  for (const m of modules) {
    byLevel[m.level]++;
  }

  return {
    modules,
    challenges,
    glossary,
    myths,
    rights,
    newsContext,
    participationMethods,
    internationalComparisons,
    weeklyChallenge,
    stats: {
      totalModules: modules.length,
      totalLessons,
      totalChallenges: challenges.length,
      byCategory,
      byLevel,
    },
  };
}
