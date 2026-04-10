/* ═══════════════════════════════════════════════════════════════════════════
   Ministerios del Gobierno de Espana — Complete institutional data layer.
   Sources: La Moncloa, BOE, PGE 2026, datos.gob.es, ministry portals.
   Seed date: 2026-04-10
   ═══════════════════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface MinistryOfficialSource {
  id: string;
  label: string;
  url: string;
  type:
    | "web-principal"
    | "datos-abiertos"
    | "rss"
    | "api"
    | "boe"
    | "transparencia"
    | "estadisticas"
    | "presupuestos";
  status: "activo" | "parcial" | "inactivo";
  lastChecked: string;
  description: string;
  dataFormats?: string[];
}

export interface MinistryBudget {
  totalM: number;
  capitalM: number;
  currentM: number;
  staffM: number;
  changePct: number;
  pctOfPGE: number;
  keyItems: { label: string; amountM: number; description: string }[];
}

export interface MinistryKeyPerson {
  name: string;
  role: string;
  since: string;
  party?: string;
  previousRole?: string;
}

export interface MinistryOrganismo {
  name: string;
  slug: string;
  type:
    | "secretaria-estado"
    | "direccion-general"
    | "organismo-autonomo"
    | "agencia"
    | "empresa-publica"
    | "entidad";
  headName?: string;
  description: string;
  employeeCount?: number;
  budgetM?: number;
  webUrl?: string;
}

export interface MinistryActivity {
  id: string;
  date: string;
  type:
    | "boe"
    | "nota-prensa"
    | "comparecencia"
    | "convenio"
    | "convocatoria"
    | "legislacion";
  title: string;
  summary: string;
  sourceUrl?: string;
  impact: "alto" | "medio" | "bajo";
}

export interface MinistryMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  target?: number;
  description: string;
}

export interface Ministry {
  slug: string;
  name: string;
  shortName: string;
  acronym: string;
  minister: MinistryKeyPerson;
  vicePresident?: boolean;
  vpOrder?: number;
  description: string;
  keyAreas: string[];
  webUrl: string;
  colorAccent: string;

  budget: MinistryBudget;
  keyPersonnel: MinistryKeyPerson[];
  organismos: MinistryOrganismo[];
  officialSources: MinistryOfficialSource[];
  recentActivity: MinistryActivity[];
  metrics: MinistryMetric[];

  relatedParliamentaryCommissions: string[];
  relatedPERTEs?: string[];
  employeeCount: number;
  createdDate: string;
  lastRestructured: string;

  tags: string[];
}

// ---------------------------------------------------------------------------
// Data — 22 ministerios
// ---------------------------------------------------------------------------

export const ministries: Ministry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Presidencia, Justicia y Relaciones con las Cortes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "presidencia-justicia",
    name: "Ministerio de la Presidencia, Justicia y Relaciones con las Cortes",
    shortName: "Presidencia y Justicia",
    acronym: "MPRJRC",
    minister: {
      name: "Felix Bolanos Garcia",
      role: "Ministro",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Ministro de la Presidencia (2021-2023)",
    },
    description:
      "Coordina la actividad del Consejo de Ministros, la relacion con las Cortes Generales y las Comunidades Autonomas, y gestiona la administracion de justicia en el ambito de competencias estatales.",
    keyAreas: [
      "Justicia",
      "Relaciones con las Cortes",
      "Relaciones con CCAA",
      "Asistencia juridica al Estado",
      "Registro Civil",
    ],
    webUrl: "https://www.mpr.gob.es",
    colorAccent: "#1a365d",
    budget: {
      totalM: 2400,
      capitalM: 320,
      currentM: 1280,
      staffM: 800,
      changePct: 4.2,
      pctOfPGE: 0.42,
      keyItems: [
        { label: "Administracion de Justicia", amountM: 1100, description: "Funcionamiento juzgados y tribunales" },
        { label: "Abogacia del Estado", amountM: 180, description: "Representacion juridica del Estado" },
        { label: "Modernizacion judicial", amountM: 260, description: "Digitalizacion expediente judicial" },
      ],
    },
    keyPersonnel: [
      { name: "Felix Bolanos Garcia", role: "Ministro", since: "2023-11-21", party: "PSOE" },
      { name: "Juan Carlos Campo Moreno", role: "Secretario de Estado de Justicia", since: "2023-11-22", party: "PSOE" },
      { name: "Rafael Simon Marin", role: "Subsecretario", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Justicia",
        slug: "se-justicia",
        type: "secretaria-estado",
        headName: "Juan Carlos Campo Moreno",
        description: "Competencias del Estado en la administracion de justicia",
        employeeCount: 8500,
        budgetM: 950,
        webUrl: "https://www.mjusticia.gob.es",
      },
      {
        name: "Secretaria de Estado de Relaciones con las Cortes",
        slug: "se-relaciones-cortes",
        type: "secretaria-estado",
        description: "Relacion del Gobierno con el Parlamento",
        employeeCount: 320,
        budgetM: 45,
      },
      {
        name: "Direccion General de Relaciones con las CCAA",
        slug: "dg-relaciones-ccaa",
        type: "direccion-general",
        description: "Coordinacion territorial Estado-CCAA",
        employeeCount: 280,
        budgetM: 35,
      },
      {
        name: "Abogacia General del Estado",
        slug: "abogacia-estado",
        type: "organismo-autonomo",
        description: "Asistencia juridica y representacion del Estado en juicio",
        employeeCount: 2800,
        budgetM: 180,
        webUrl: "https://www.abogacia.es",
      },
      {
        name: "Centro de Estudios Juridicos",
        slug: "cej",
        type: "organismo-autonomo",
        description: "Formacion de jueces, fiscales y letrados",
        employeeCount: 120,
        budgetM: 28,
      },
    ],
    officialSources: [
      {
        id: "mprjrc-web",
        label: "Portal Ministerio Presidencia",
        url: "https://www.mpr.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de la Presidencia",
      },
      {
        id: "mprjrc-boe",
        label: "BOE - Disposiciones Justicia",
        url: "https://www.boe.es/legislacion/codigos/",
        type: "boe",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Disposiciones legislativas publicadas en el BOE",
        dataFormats: ["XML", "PDF", "HTML"],
      },
      {
        id: "mprjrc-transparencia",
        label: "Portal Transparencia Justicia",
        url: "https://transparencia.gob.es/transparencia/transparencia_Home/index/MasInformacion/Informes-de-interes/Justicia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Informacion publica sobre la administracion de justicia",
      },
      {
        id: "mprjrc-datos",
        label: "Datos abiertos Justicia",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Justicia",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Datasets de justicia en datos.gob.es",
        dataFormats: ["CSV", "JSON", "XML"],
      },
    ],
    recentActivity: [
      {
        id: "mprjrc-act-1",
        date: "2026-04-08",
        type: "legislacion",
        title: "Proyecto de Ley de Eficiencia Digital en la Justicia",
        summary: "Aprobacion en Consejo de Ministros del proyecto de ley para la digitalizacion integral del sistema judicial.",
        sourceUrl: "https://www.lamoncloa.gob.es",
        impact: "alto",
      },
      {
        id: "mprjrc-act-2",
        date: "2026-04-03",
        type: "nota-prensa",
        title: "Reunion bilateral con Comunidades Autonomas sobre transferencias",
        summary: "El ministro Bolanos se reune con consejeros autonomicos para coordinar transferencias pendientes.",
        impact: "medio",
      },
      {
        id: "mprjrc-act-3",
        date: "2026-03-28",
        type: "boe",
        title: "Real Decreto de estructura organica del Ministerio",
        summary: "Publicacion en BOE de la actualizacion de la estructura organica del MPRJRC.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "mprjrc-act-4",
        date: "2026-03-22",
        type: "comparecencia",
        title: "Comparecencia ante la Comision de Justicia",
        summary: "El ministro comparece ante la Comision de Justicia del Congreso para informar sobre la modernizacion judicial.",
        impact: "medio",
      },
      {
        id: "mprjrc-act-5",
        date: "2026-03-15",
        type: "convenio",
        title: "Convenio con CCAA para digitalizacion registros civiles",
        summary: "Firma de convenio marco con 12 comunidades para la interoperabilidad de registros civiles digitales.",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "mprjrc-m1", label: "Backlog judicial pendiente", value: 3420000, unit: "asuntos", trend: "down", target: 2800000, description: "Asuntos pendientes de resolucion en juzgados" },
      { id: "mprjrc-m2", label: "Tiempo medio resolucion", value: 8.4, unit: "meses", trend: "down", target: 6.0, description: "Duracion media de procedimientos judiciales" },
      { id: "mprjrc-m3", label: "Leyes tramitadas legislatura", value: 42, unit: "leyes", trend: "up", description: "Leyes aprobadas en la actual legislatura" },
      { id: "mprjrc-m4", label: "Tasa digitalizacion judicial", value: 67, unit: "%", trend: "up", target: 90, description: "Porcentaje de juzgados con expediente digital" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Justicia",
      "Comision Constitucional",
      "Comision de Relaciones con las CCAA",
    ],
    employeeCount: 28000,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["justicia", "cortes", "ccaa", "registro-civil", "abogacia-estado"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Hacienda
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "hacienda",
    name: "Ministerio de Hacienda",
    shortName: "Hacienda",
    acronym: "HACIENDA",
    minister: {
      name: "Maria Jesus Montero",
      role: "Ministra y Vicepresidenta Primera",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Ministra de Hacienda y Funcion Publica (2020-2023)",
    },
    vicePresident: true,
    vpOrder: 1,
    description:
      "Responsable de la politica fiscal, los presupuestos generales del Estado, la gestion tributaria y el control del gasto publico.",
    keyAreas: [
      "Politica fiscal",
      "Presupuestos Generales del Estado",
      "Gestion tributaria",
      "Control del gasto",
      "Financiacion autonomica",
    ],
    webUrl: "https://www.hacienda.gob.es",
    colorAccent: "#0d4a2e",
    budget: {
      totalM: 3200,
      capitalM: 280,
      currentM: 1520,
      staffM: 1400,
      changePct: 3.8,
      pctOfPGE: 0.56,
      keyItems: [
        { label: "AEAT - Agencia Tributaria", amountM: 1450, description: "Gestion y recaudacion de tributos" },
        { label: "IGAE", amountM: 120, description: "Intervencion General de la Administracion del Estado" },
        { label: "Catastro", amountM: 180, description: "Gestion catastral del territorio" },
      ],
    },
    keyPersonnel: [
      { name: "Maria Jesus Montero", role: "Ministra y VP1", since: "2023-11-21", party: "PSOE" },
      { name: "Carlos Cuerpo Caballero", role: "Secretario de Estado de Hacienda", since: "2023-11-22", party: "PSOE", previousRole: "DG Analisis Macroeconomico" },
      { name: "Maria Jose Garde Garde", role: "Secretaria de Estado de Presupuestos y Gastos", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Agencia Estatal de Administracion Tributaria (AEAT)",
        slug: "aeat",
        type: "agencia",
        headName: "Soledad Fernandez Doctor",
        description: "Recaudacion, gestion e inspeccion de tributos estatales",
        employeeCount: 52000,
        budgetM: 1450,
        webUrl: "https://www.agenciatributaria.es",
      },
      {
        name: "Secretaria de Estado de Hacienda",
        slug: "se-hacienda",
        type: "secretaria-estado",
        description: "Coordinacion de la politica fiscal del Estado",
        employeeCount: 2800,
        budgetM: 420,
      },
      {
        name: "Secretaria de Estado de Presupuestos y Gastos",
        slug: "se-presupuestos",
        type: "secretaria-estado",
        description: "Elaboracion y seguimiento de los PGE",
        employeeCount: 1200,
        budgetM: 180,
      },
      {
        name: "Intervencion General de la Administracion del Estado (IGAE)",
        slug: "igae",
        type: "organismo-autonomo",
        description: "Control interno de la gestion economico-financiera del sector publico",
        employeeCount: 3200,
        budgetM: 120,
        webUrl: "https://igae.pap.hacienda.gob.es",
      },
      {
        name: "Direccion General del Catastro",
        slug: "catastro",
        type: "direccion-general",
        description: "Gestion del catastro inmobiliario",
        employeeCount: 3500,
        budgetM: 180,
        webUrl: "https://www.catastro.meh.es",
      },
    ],
    officialSources: [
      {
        id: "hacienda-web",
        label: "Portal Hacienda",
        url: "https://www.hacienda.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de Hacienda",
      },
      {
        id: "hacienda-aeat",
        label: "AEAT Portal datos",
        url: "https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Memorias_y_estadisticas_tributarias/Estadisticas/Estadisticas.shtml",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Estadisticas tributarias de la Agencia Tributaria",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "hacienda-datos",
        label: "Datos abiertos Hacienda",
        url: "https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/DatosAbiertos.aspx",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Portal de datos abiertos del Ministerio de Hacienda",
        dataFormats: ["JSON", "CSV", "XML"],
      },
      {
        id: "hacienda-igae",
        label: "IGAE - Contabilidad nacional",
        url: "https://igae.pap.hacienda.gob.es",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Datos de contabilidad y ejecucion presupuestaria",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "hacienda-transparencia",
        label: "Portal Transparencia Hacienda",
        url: "https://transparencia.gob.es/transparencia/transparencia_Home/index/MasInformacion/Informes-de-interes/Hacienda.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Informacion de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "hacienda-act-1",
        date: "2026-04-07",
        type: "legislacion",
        title: "Proyecto de PGE 2027 - fase inicial",
        summary: "Inicio de la elaboracion de los Presupuestos Generales del Estado para 2027, con instrucciones a departamentos ministeriales.",
        impact: "alto",
      },
      {
        id: "hacienda-act-2",
        date: "2026-04-02",
        type: "nota-prensa",
        title: "Recaudacion tributaria T1 2026 supera previsiones",
        summary: "La AEAT anuncia que la recaudacion del primer trimestre de 2026 supera en un 6.2% las previsiones iniciales.",
        impact: "alto",
      },
      {
        id: "hacienda-act-3",
        date: "2026-03-25",
        type: "boe",
        title: "Orden de modulos IRPF 2026",
        summary: "Publicacion de la orden que regula el regimen de estimacion objetiva del IRPF para 2026.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "hacienda-act-4",
        date: "2026-03-18",
        type: "comparecencia",
        title: "Montero presenta informe de ejecucion presupuestaria",
        summary: "La vicepresidenta comparece para presentar los datos de ejecucion presupuestaria del ejercicio 2025.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "hacienda-m1", label: "Recaudacion total anual", value: 278500, unit: "M EUR", trend: "up", description: "Recaudacion tributaria total del Estado en 2025" },
      { id: "hacienda-m2", label: "Fraude fiscal detectado", value: 16800, unit: "M EUR", trend: "up", target: 20000, description: "Fraude detectado en actuaciones de la AEAT" },
      { id: "hacienda-m3", label: "Ejecucion PGE", value: 94.2, unit: "%", trend: "stable", target: 98, description: "Porcentaje de ejecucion de los PGE 2025" },
      { id: "hacienda-m4", label: "Deficit publico / PIB", value: 3.2, unit: "%", trend: "down", target: 3.0, description: "Deficit publico como porcentaje del PIB" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Hacienda y Funcion Publica",
      "Comision de Presupuestos",
    ],
    employeeCount: 25000,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["fiscal", "tributaria", "presupuestos", "aeat", "catastro"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Defensa
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "defensa",
    name: "Ministerio de Defensa",
    shortName: "Defensa",
    acronym: "MINISDEF",
    minister: {
      name: "Margarita Robles",
      role: "Ministra",
      since: "2018-06-07",
      party: "Independiente",
      previousRole: "Secretaria de Estado de Interior",
    },
    description:
      "Responsable de la politica de defensa, la direccion de las Fuerzas Armadas y la participacion en misiones internacionales bajo mandato de organizaciones internacionales.",
    keyAreas: [
      "Fuerzas Armadas",
      "Politica de defensa",
      "Misiones internacionales",
      "Industria de defensa",
      "Investigacion militar (INTA)",
    ],
    webUrl: "https://www.defensa.gob.es",
    colorAccent: "#2c3e50",
    budget: {
      totalM: 13200,
      capitalM: 4100,
      currentM: 3200,
      staffM: 5900,
      changePct: 7.5,
      pctOfPGE: 2.32,
      keyItems: [
        { label: "Personal militar y civil", amountM: 5900, description: "Retribuciones de las Fuerzas Armadas y personal civil" },
        { label: "Programas especiales de armamento", amountM: 3400, description: "Adquisicion de sistemas de armas y equipos" },
        { label: "Operaciones y mantenimiento", amountM: 2100, description: "Sostenimiento de unidades y bases" },
      ],
    },
    keyPersonnel: [
      { name: "Margarita Robles", role: "Ministra", since: "2018-06-07", party: "Independiente" },
      { name: "Amparo Valcarce Garcia", role: "Secretaria de Estado de Defensa", since: "2023-11-22", party: "PSOE" },
      { name: "Almirante General Teodoro Lopez Calderon", role: "JEMAD", since: "2022-01-15" },
    ],
    organismos: [
      {
        name: "Estado Mayor de la Defensa (EMAD)",
        slug: "emad",
        type: "entidad",
        headName: "Almirante General Teodoro Lopez Calderon",
        description: "Mando militar de las Fuerzas Armadas bajo el Presidente del Gobierno",
        employeeCount: 2500,
        budgetM: 800,
        webUrl: "https://emad.defensa.gob.es",
      },
      {
        name: "Secretaria de Estado de Defensa",
        slug: "se-defensa",
        type: "secretaria-estado",
        description: "Direccion de la politica de defensa y relaciones internacionales",
        employeeCount: 1800,
        budgetM: 450,
      },
      {
        name: "Instituto Nacional de Tecnica Aeroespacial (INTA)",
        slug: "inta",
        type: "organismo-autonomo",
        description: "Investigacion y desarrollo aeroespacial y de defensa",
        employeeCount: 1500,
        budgetM: 280,
        webUrl: "https://www.inta.es",
      },
      {
        name: "Navantia S.A.",
        slug: "navantia",
        type: "empresa-publica",
        description: "Construccion naval militar y civil",
        employeeCount: 5400,
        budgetM: 1200,
        webUrl: "https://www.navantia.es",
      },
      {
        name: "Direccion General de Politica de Defensa",
        slug: "dgpd",
        type: "direccion-general",
        description: "Planificacion de la politica de defensa y contribucion a organizaciones internacionales",
        employeeCount: 450,
        budgetM: 120,
      },
    ],
    officialSources: [
      {
        id: "def-web",
        label: "Portal Defensa",
        url: "https://www.defensa.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de Defensa",
      },
      {
        id: "def-transparencia",
        label: "Transparencia Defensa",
        url: "https://www.defensa.gob.es/portaldeTransparencia/",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Portal de transparencia del Ministerio de Defensa",
      },
      {
        id: "def-datos",
        label: "Datos abiertos Defensa",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Defensa",
        type: "datos-abiertos",
        status: "parcial",
        lastChecked: "2026-04-05",
        description: "Datasets de Defensa en datos.gob.es",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "def-revista",
        label: "Revista Espanola de Defensa",
        url: "https://www.defensa.gob.es/gabinete/red/",
        type: "rss",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Publicacion oficial de informacion de defensa",
      },
    ],
    recentActivity: [
      {
        id: "def-act-1",
        date: "2026-04-06",
        type: "nota-prensa",
        title: "Espana amplia participacion en mision OTAN en el Baltico",
        summary: "El Consejo de Ministros aprueba el envio de 200 efectivos adicionales a la mision de presencia avanzada de la OTAN.",
        impact: "alto",
      },
      {
        id: "def-act-2",
        date: "2026-04-01",
        type: "convocatoria",
        title: "Convocatoria de 3.500 plazas para tropa y marineria",
        summary: "Nueva convocatoria de plazas para las Fuerzas Armadas, con enfasis en ciberdefensa y logistica.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "def-act-3",
        date: "2026-03-26",
        type: "boe",
        title: "Contrato del programa de fragatas F-110",
        summary: "Aprobacion del contrato para la construccion de la cuarta fragata F-110 con Navantia.",
        impact: "alto",
      },
      {
        id: "def-act-4",
        date: "2026-03-20",
        type: "comparecencia",
        title: "Robles informa al Congreso sobre gasto en defensa",
        summary: "La ministra presenta el plan para alcanzar el 2% del PIB en defensa conforme al compromiso OTAN.",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "def-m1", label: "Gasto Defensa / PIB", value: 1.38, unit: "%", trend: "up", target: 2.0, description: "Gasto en defensa como porcentaje del PIB" },
      { id: "def-m2", label: "Misiones internacionales", value: 12, unit: "misiones", trend: "stable", description: "Numero de misiones internacionales activas" },
      { id: "def-m3", label: "Efectivos desplegados exterior", value: 2850, unit: "militares", trend: "up", description: "Personal militar desplegado en el exterior" },
      { id: "def-m4", label: "Efectivos totales FAS", value: 118500, unit: "militares", trend: "stable", target: 125000, description: "Efectivos totales de las Fuerzas Armadas" },
    ],
    relatedParliamentaryCommissions: ["Comision de Defensa"],
    employeeCount: 120000,
    createdDate: "1977-07-04",
    lastRestructured: "2023-11-21",
    tags: ["fuerzas-armadas", "otan", "misiones", "industria-defensa", "ciberdefensa"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Asuntos Exteriores, UE y Cooperacion
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "asuntos-exteriores",
    name: "Ministerio de Asuntos Exteriores, Union Europea y Cooperacion",
    shortName: "Exteriores",
    acronym: "MAEUEC",
    minister: {
      name: "Jose Manuel Albares",
      role: "Ministro",
      since: "2021-07-12",
      party: "PSOE",
      previousRole: "Secretario General de Asuntos Internacionales, UE, G20 y Seguridad Global",
    },
    description:
      "Dirige la politica exterior espanola, la representacion ante la UE y organismos internacionales, y la cooperacion al desarrollo.",
    keyAreas: [
      "Politica exterior",
      "Union Europea",
      "Cooperacion al desarrollo",
      "Servicio exterior",
      "Difusion de la lengua espanola",
    ],
    webUrl: "https://www.exteriores.gob.es",
    colorAccent: "#1e3a5f",
    budget: {
      totalM: 2800,
      capitalM: 180,
      currentM: 1200,
      staffM: 720,
      changePct: 5.1,
      pctOfPGE: 0.49,
      keyItems: [
        { label: "AECID", amountM: 850, description: "Agencia Espanola de Cooperacion Internacional para el Desarrollo" },
        { label: "Instituto Cervantes", amountM: 110, description: "Difusion de la lengua espanola y las culturas hispanicas" },
        { label: "Servicio Exterior", amountM: 680, description: "Red de embajadas y consulados" },
      ],
    },
    keyPersonnel: [
      { name: "Jose Manuel Albares", role: "Ministro", since: "2021-07-12", party: "PSOE" },
      { name: "Pascual Navarro Rios", role: "Secretario de Estado para la UE", since: "2023-11-22" },
      { name: "Cristina Gallach Figueras", role: "Secretaria de Estado de Cooperacion", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado para la Union Europea",
        slug: "se-ue",
        type: "secretaria-estado",
        description: "Coordinacion de las politicas europeas de Espana",
        employeeCount: 650,
        budgetM: 85,
      },
      {
        name: "Secretaria de Estado de Cooperacion Internacional",
        slug: "se-cooperacion",
        type: "secretaria-estado",
        description: "Politica de cooperacion al desarrollo",
        employeeCount: 480,
        budgetM: 70,
      },
      {
        name: "Agencia Espanola de Cooperacion Internacional (AECID)",
        slug: "aecid",
        type: "agencia",
        headName: "Anton Leis Garcia",
        description: "Ejecucion de la cooperacion espanola al desarrollo",
        employeeCount: 1200,
        budgetM: 850,
        webUrl: "https://www.aecid.es",
      },
      {
        name: "Instituto Cervantes",
        slug: "cervantes",
        type: "organismo-autonomo",
        description: "Promocion y ensenanza de la lengua espanola en el mundo",
        employeeCount: 1800,
        budgetM: 110,
        webUrl: "https://www.cervantes.es",
      },
      {
        name: "Direccion General del Servicio Exterior",
        slug: "dgse",
        type: "direccion-general",
        description: "Gestion de la red diplomatica y consular",
        employeeCount: 3200,
        budgetM: 680,
      },
    ],
    officialSources: [
      {
        id: "ext-web",
        label: "Portal Exteriores",
        url: "https://www.exteriores.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MAEUEC",
      },
      {
        id: "ext-transparencia",
        label: "Transparencia Exteriores",
        url: "https://www.exteriores.gob.es/es/Transparencia",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Portal de transparencia del Ministerio",
      },
      {
        id: "ext-aecid-datos",
        label: "AECID datos abiertos",
        url: "https://www.aecid.es/es/informacion-institucional/datos-abiertos",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Datos abiertos de cooperacion al desarrollo",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "ext-rss",
        label: "RSS Noticias Exteriores",
        url: "https://www.exteriores.gob.es/es/RSS",
        type: "rss",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Feed RSS de noticias del Ministerio",
        dataFormats: ["XML"],
      },
    ],
    recentActivity: [
      {
        id: "ext-act-1",
        date: "2026-04-09",
        type: "nota-prensa",
        title: "Espana acoge la cumbre ministerial UE-Latinoamerica",
        summary: "Madrid sera sede de la cumbre ministerial para reforzar la relacion birregional UE-CELAC.",
        impact: "alto",
      },
      {
        id: "ext-act-2",
        date: "2026-04-04",
        type: "convenio",
        title: "Acuerdo bilateral de cooperacion con Marruecos",
        summary: "Firma de nuevo acuerdo de cooperacion en materia de migracion y desarrollo sostenible.",
        impact: "alto",
      },
      {
        id: "ext-act-3",
        date: "2026-03-30",
        type: "comparecencia",
        title: "Albares en Comision Mixta UE",
        summary: "Comparecencia del ministro ante la Comision Mixta para la UE sobre la Presidencia checa del Consejo.",
        impact: "medio",
      },
      {
        id: "ext-act-4",
        date: "2026-03-22",
        type: "nota-prensa",
        title: "Apertura de consulado en Nairobi",
        summary: "Espana amplia su red consular con la apertura de un nuevo consulado en Kenia.",
        impact: "bajo",
      },
    ],
    metrics: [
      { id: "ext-m1", label: "Ayuda al desarrollo / PIB", value: 0.32, unit: "%", trend: "up", target: 0.7, description: "AOD como porcentaje del PIB" },
      { id: "ext-m2", label: "Tratados internacionales firmados", value: 18, unit: "tratados", trend: "stable", description: "Tratados firmados en el ultimo ano" },
      { id: "ext-m3", label: "Espanoles asistidos en el exterior", value: 245000, unit: "personas", trend: "up", description: "Ciudadanos espanoles asistidos por la red consular" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Asuntos Exteriores",
      "Comision Mixta para la Union Europea",
      "Comision de Cooperacion Internacional para el Desarrollo",
    ],
    employeeCount: 8500,
    createdDate: "1714-01-01",
    lastRestructured: "2023-11-21",
    tags: ["exterior", "diplomacia", "ue", "cooperacion", "cervantes"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Interior
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "interior",
    name: "Ministerio del Interior",
    shortName: "Interior",
    acronym: "MIR",
    minister: {
      name: "Fernando Grande-Marlaska",
      role: "Ministro",
      since: "2018-06-07",
      party: "PSOE",
      previousRole: "Magistrado de la Audiencia Nacional",
    },
    description:
      "Responsable de la seguridad publica, las fuerzas y cuerpos de seguridad del Estado, la gestion del trafico, instituciones penitenciarias y proteccion civil.",
    keyAreas: [
      "Seguridad publica",
      "Policia Nacional",
      "Guardia Civil",
      "Trafico y seguridad vial",
      "Instituciones Penitenciarias",
      "Proteccion Civil",
    ],
    webUrl: "https://www.interior.gob.es",
    colorAccent: "#4a0e0e",
    budget: {
      totalM: 10500,
      capitalM: 1200,
      currentM: 1800,
      staffM: 7500,
      changePct: 4.8,
      pctOfPGE: 1.84,
      keyItems: [
        { label: "Policia Nacional", amountM: 4200, description: "Personal y operaciones de la Policia Nacional" },
        { label: "Guardia Civil", amountM: 4500, description: "Personal y operaciones de la Guardia Civil" },
        { label: "Instituciones Penitenciarias", amountM: 1200, description: "Sistema penitenciario estatal" },
      ],
    },
    keyPersonnel: [
      { name: "Fernando Grande-Marlaska", role: "Ministro", since: "2018-06-07", party: "PSOE" },
      { name: "Rafael Perez Ruiz", role: "Secretario de Estado de Seguridad", since: "2023-11-22" },
      { name: "Isabel Goicoechea Aranguren", role: "Subsecretaria de Interior", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Direccion General de la Policia",
        slug: "dgp",
        type: "direccion-general",
        description: "Cuerpo Nacional de Policia",
        employeeCount: 70000,
        budgetM: 4200,
        webUrl: "https://www.policia.es",
      },
      {
        name: "Direccion General de la Guardia Civil",
        slug: "dggc",
        type: "direccion-general",
        description: "Cuerpo de la Guardia Civil",
        employeeCount: 80000,
        budgetM: 4500,
        webUrl: "https://www.guardiacivil.es",
      },
      {
        name: "Direccion General de Trafico (DGT)",
        slug: "dgt",
        type: "direccion-general",
        headName: "Pere Navarro Olivella",
        description: "Gestion del trafico y la seguridad vial",
        employeeCount: 4500,
        budgetM: 680,
        webUrl: "https://www.dgt.es",
      },
      {
        name: "Secretaria General de Instituciones Penitenciarias",
        slug: "sgip",
        type: "direccion-general",
        description: "Gestion del sistema penitenciario estatal",
        employeeCount: 24000,
        budgetM: 1200,
        webUrl: "https://www.institucionpenitenciaria.es",
      },
      {
        name: "Direccion General de Proteccion Civil y Emergencias",
        slug: "dgpce",
        type: "direccion-general",
        description: "Coordinacion de la proteccion civil y gestion de emergencias",
        employeeCount: 1200,
        budgetM: 180,
      },
    ],
    officialSources: [
      {
        id: "mir-web",
        label: "Portal Interior",
        url: "https://www.interior.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio del Interior",
      },
      {
        id: "mir-criminalidad",
        label: "Estadisticas de criminalidad",
        url: "https://estadisticasdecriminalidad.ses.mir.es",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Portal de estadisticas de criminalidad del SES",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "mir-dgt-datos",
        label: "DGT datos abiertos",
        url: "https://www.dgt.es/datos-abiertos/",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datos abiertos de trafico y seguridad vial",
        dataFormats: ["CSV", "JSON", "XML"],
      },
      {
        id: "mir-transparencia",
        label: "Transparencia Interior",
        url: "https://www.interior.gob.es/opencms/es/transparencia/",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Portal de transparencia del Ministerio del Interior",
      },
    ],
    recentActivity: [
      {
        id: "mir-act-1",
        date: "2026-04-08",
        type: "nota-prensa",
        title: "Tasa de criminalidad cae al minimo historico",
        summary: "El balance de criminalidad del primer trimestre muestra la tasa mas baja desde que se tienen registros comparables.",
        impact: "alto",
      },
      {
        id: "mir-act-2",
        date: "2026-04-02",
        type: "convocatoria",
        title: "Convocatoria de 4.000 plazas Policia Nacional",
        summary: "Nueva oferta de empleo publico para la Policia Nacional, con enfasis en ciberseguridad.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "mir-act-3",
        date: "2026-03-25",
        type: "boe",
        title: "Reglamento de identificacion digital en fronteras",
        summary: "Publicacion del reglamento que implementa el sistema europeo de entrada y salida (EES) en fronteras espanolas.",
        impact: "alto",
      },
      {
        id: "mir-act-4",
        date: "2026-03-18",
        type: "comparecencia",
        title: "Grande-Marlaska sobre la campana de verano DGT",
        summary: "Presentacion de la campana de seguridad vial para Semana Santa y el inicio del verano.",
        impact: "bajo",
      },
      {
        id: "mir-act-5",
        date: "2026-03-12",
        type: "convenio",
        title: "Convenio con Francia contra el narcotrafico",
        summary: "Firma de acuerdo bilateral con Francia para operaciones conjuntas contra el narcotrafico en el Atlantico.",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "mir-m1", label: "Tasa de criminalidad", value: 44.2, unit: "por 1.000 hab", trend: "down", description: "Tasa de criminalidad por cada 1.000 habitantes" },
      { id: "mir-m2", label: "Siniestralidad vial fallecidos", value: 1145, unit: "fallecidos", trend: "down", target: 900, description: "Fallecidos en accidentes de trafico (anual)" },
      { id: "mir-m3", label: "Poblacion reclusa", value: 55800, unit: "internos", trend: "stable", description: "Numero total de internos en centros penitenciarios" },
      { id: "mir-m4", label: "Tasa de presos por 100k hab", value: 117, unit: "por 100k", trend: "stable", description: "Internos por cada 100.000 habitantes" },
    ],
    relatedParliamentaryCommissions: ["Comision de Interior", "Comision de Seguridad Vial"],
    employeeCount: 165000,
    createdDate: "1714-01-01",
    lastRestructured: "2023-11-21",
    tags: ["seguridad", "policia", "guardia-civil", "trafico", "penitenciarias", "proteccion-civil"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Transportes y Movilidad Sostenible
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "transportes",
    name: "Ministerio de Transportes y Movilidad Sostenible",
    shortName: "Transportes",
    acronym: "MITMS",
    minister: {
      name: "Oscar Puente",
      role: "Ministro",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Alcalde de Valladolid",
    },
    description:
      "Responsable de la planificacion y gestion de infraestructuras de transporte, la regulacion del transporte aereo, ferroviario, maritimo y por carretera, y la movilidad sostenible.",
    keyAreas: [
      "Infraestructuras ferroviarias",
      "Transporte aereo",
      "Carreteras del Estado",
      "Puertos",
      "Movilidad sostenible",
    ],
    webUrl: "https://www.transportes.gob.es",
    colorAccent: "#0066a8",
    budget: {
      totalM: 15800,
      capitalM: 8200,
      currentM: 4100,
      staffM: 3500,
      changePct: 6.3,
      pctOfPGE: 2.78,
      keyItems: [
        { label: "ADIF inversiones ferroviarias", amountM: 5200, description: "Inversiones en infraestructura ferroviaria" },
        { label: "Carreteras del Estado", amountM: 2800, description: "Construccion y conservacion de carreteras" },
        { label: "AENA operaciones", amountM: 1800, description: "Gestion de la red aeroportuaria" },
      ],
    },
    keyPersonnel: [
      { name: "Oscar Puente", role: "Ministro", since: "2023-11-21", party: "PSOE" },
      { name: "Jose Antonio Santano Clavero", role: "Secretario de Estado de Transportes y Movilidad Sostenible", since: "2023-11-22" },
      { name: "Jesus Manuel Gomez Garcia", role: "Subsecretario", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "ADIF - Administrador de Infraestructuras Ferroviarias",
        slug: "adif",
        type: "empresa-publica",
        description: "Gestion de la infraestructura ferroviaria espanola",
        employeeCount: 12000,
        budgetM: 5200,
        webUrl: "https://www.adif.es",
      },
      {
        name: "AENA S.M.E.",
        slug: "aena",
        type: "empresa-publica",
        description: "Gestion de 46 aeropuertos y 2 helipuertos en Espana",
        employeeCount: 8500,
        budgetM: 1800,
        webUrl: "https://www.aena.es",
      },
      {
        name: "Renfe Operadora",
        slug: "renfe",
        type: "empresa-publica",
        description: "Operador ferroviario de viajeros y mercancias",
        employeeCount: 14000,
        budgetM: 2400,
        webUrl: "https://www.renfe.com",
      },
      {
        name: "Puertos del Estado",
        slug: "puertos-estado",
        type: "entidad",
        description: "Coordinacion del sistema portuario de interes general",
        employeeCount: 1500,
        budgetM: 1100,
        webUrl: "https://www.puertos.es",
      },
      {
        name: "ENAIRE",
        slug: "enaire",
        type: "empresa-publica",
        description: "Control del trafico aereo en Espana",
        employeeCount: 4200,
        budgetM: 980,
        webUrl: "https://www.enaire.es",
      },
    ],
    officialSources: [
      {
        id: "tms-web",
        label: "Portal Transportes",
        url: "https://www.transportes.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MITMS",
      },
      {
        id: "tms-datos",
        label: "Datos abiertos Transportes",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Transportes",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets de transporte en datos.gob.es",
        dataFormats: ["CSV", "JSON", "GeoJSON"],
      },
      {
        id: "tms-aena-stats",
        label: "AENA estadisticas",
        url: "https://www.aena.es/es/estadisticas/inicio.html",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Estadisticas de trafico aereo y pasajeros",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "tms-transparencia",
        label: "Transparencia Transportes",
        url: "https://www.transportes.gob.es/ministerio/transparencia",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Portal de transparencia del MITMS",
      },
    ],
    recentActivity: [
      {
        id: "tms-act-1",
        date: "2026-04-07",
        type: "nota-prensa",
        title: "Inauguracion del tramo AVE Murcia-Almeria",
        summary: "El ministro Puente inaugura el ultimo tramo de la conexion de alta velocidad Murcia-Almeria.",
        impact: "alto",
      },
      {
        id: "tms-act-2",
        date: "2026-04-01",
        type: "boe",
        title: "Regulacion de VTC y plataformas de movilidad",
        summary: "Publicacion del Real Decreto que regula las plataformas de movilidad compartida y VTC.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
      {
        id: "tms-act-3",
        date: "2026-03-28",
        type: "convocatoria",
        title: "Licitacion mantenimiento Red Carreteras del Estado 2026-2030",
        summary: "Publicacion de contratos de conservacion para 12.000 km de carreteras estatales.",
        impact: "medio",
      },
      {
        id: "tms-act-4",
        date: "2026-03-15",
        type: "nota-prensa",
        title: "Renfe supera 500 millones de viajeros en 2025",
        summary: "Renfe cierra 2025 con un record historico de viajeros gracias a los abonos gratuitos Cercanias.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "tms-m1", label: "Km AVE en servicio", value: 4200, unit: "km", trend: "up", target: 5000, description: "Kilometros de alta velocidad operativos" },
      { id: "tms-m2", label: "Puntualidad Renfe AVE", value: 94.8, unit: "%", trend: "stable", target: 96, description: "Porcentaje de trenes AVE puntuales" },
      { id: "tms-m3", label: "Pasajeros aereos anuales", value: 312, unit: "M pasajeros", trend: "up", description: "Pasajeros en aeropuertos espanoles en 2025" },
      { id: "tms-m4", label: "Viajeros Renfe Cercanias", value: 475, unit: "M viajeros", trend: "up", description: "Viajeros anuales en Cercanias Renfe" },
    ],
    relatedParliamentaryCommissions: ["Comision de Transportes, Movilidad y Agenda Urbana"],
    relatedPERTEs: ["PERTE VEC (Vehiculo Electrico y Conectado)"],
    employeeCount: 42000,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["transporte", "ferrocarril", "aeropuertos", "carreteras", "movilidad", "ave"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. Transformacion Digital y Funcion Publica
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "transformacion-digital",
    name: "Ministerio para la Transformacion Digital y de la Funcion Publica",
    shortName: "Transformacion Digital",
    acronym: "MTDFP",
    minister: {
      name: "Oscar Lopez Agueda",
      role: "Ministro",
      since: "2024-11-28",
      party: "PSOE",
      previousRole: "Presidente de Correos",
    },
    description:
      "Impulsa la transformacion digital de la economia y la administracion publica, la inteligencia artificial, las telecomunicaciones y la reforma de la funcion publica.",
    keyAreas: [
      "Transformacion digital",
      "Inteligencia artificial",
      "Telecomunicaciones",
      "Funcion publica",
      "Datos abiertos",
    ],
    webUrl: "https://www.transformaciondigital.gob.es",
    colorAccent: "#5b21b6",
    budget: {
      totalM: 4100,
      capitalM: 1800,
      currentM: 1300,
      staffM: 1000,
      changePct: 12.5,
      pctOfPGE: 0.72,
      keyItems: [
        { label: "Plan de Conectividad", amountM: 1200, description: "Despliegue de banda ancha y 5G" },
        { label: "Red.es programas", amountM: 580, description: "Programas de digitalizacion de Red.es" },
        { label: "Estrategia Nacional de IA", amountM: 420, description: "Implementacion de la ENIA" },
      ],
    },
    keyPersonnel: [
      { name: "Oscar Lopez Agueda", role: "Ministro", since: "2024-11-28", party: "PSOE" },
      { name: "Ana Maria Bravo Sierra", role: "Secretaria de Estado de Digitalizacion e IA", since: "2024-12-05" },
      { name: "Jose Antonio Benedicto Iruinela", role: "Secretario de Estado de Funcion Publica", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Digitalizacion e Inteligencia Artificial",
        slug: "sedia",
        type: "secretaria-estado",
        description: "Impulso de la digitalizacion y la IA en la economia y sociedad",
        employeeCount: 1200,
        budgetM: 1800,
      },
      {
        name: "Secretaria de Estado de Funcion Publica",
        slug: "se-funcion-publica",
        type: "secretaria-estado",
        description: "Modernizacion y gestion de la funcion publica estatal",
        employeeCount: 2500,
        budgetM: 680,
      },
      {
        name: "Red.es",
        slug: "redes",
        type: "entidad",
        description: "Impulso de la economia digital y la innovacion",
        employeeCount: 380,
        budgetM: 580,
        webUrl: "https://www.red.es",
      },
      {
        name: "ONTSI",
        slug: "ontsi",
        type: "entidad",
        description: "Observatorio Nacional de Tecnologia y Sociedad de la Informacion",
        employeeCount: 85,
        budgetM: 15,
        webUrl: "https://www.ontsi.es",
      },
      {
        name: "datos.gob.es",
        slug: "datos-gob",
        type: "entidad",
        description: "Portal nacional de datos abiertos del Gobierno de Espana",
        employeeCount: 45,
        budgetM: 12,
        webUrl: "https://datos.gob.es",
      },
    ],
    officialSources: [
      {
        id: "mtdfp-web",
        label: "Portal Transformacion Digital",
        url: "https://www.transformaciondigital.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MTDFP",
      },
      {
        id: "mtdfp-datosgob",
        label: "datos.gob.es API CKAN",
        url: "https://datos.gob.es/apidata",
        type: "api",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "API CKAN del portal nacional de datos abiertos",
        dataFormats: ["JSON", "CSV", "XML", "RDF"],
      },
      {
        id: "mtdfp-red-datos",
        label: "Red.es datos abiertos",
        url: "https://www.red.es/es/datos-abiertos",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datos abiertos de Red.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mtdfp-ontsi",
        label: "ONTSI indicadores digitales",
        url: "https://www.ontsi.es/indicadores",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Indicadores de la sociedad digital espanola",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "mtdfp-transparencia",
        label: "Transparencia MTDFP",
        url: "https://transparencia.gob.es",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Gobierno de Espana",
      },
    ],
    recentActivity: [
      {
        id: "mtdfp-act-1",
        date: "2026-04-09",
        type: "legislacion",
        title: "Reglamento de desarrollo de la Ley de IA",
        summary: "Aprobacion del reglamento que desarrolla la Ley de Inteligencia Artificial en linea con el AI Act europeo.",
        impact: "alto",
      },
      {
        id: "mtdfp-act-2",
        date: "2026-04-03",
        type: "nota-prensa",
        title: "Espana supera 95% cobertura de fibra optica",
        summary: "El informe de cobertura de banda ancha situa a Espana como lider europeo en fibra hasta el hogar.",
        impact: "alto",
      },
      {
        id: "mtdfp-act-3",
        date: "2026-03-29",
        type: "convocatoria",
        title: "Convocatoria Kit Digital ampliacion autonomos",
        summary: "Ampliacion del programa Kit Digital con 500M EUR adicionales para autonomos y microempresas.",
        impact: "medio",
      },
      {
        id: "mtdfp-act-4",
        date: "2026-03-20",
        type: "boe",
        title: "OEP 2026 Administracion General del Estado",
        summary: "Publicacion de la Oferta de Empleo Publico 2026 con mas de 40.000 plazas.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "mtdfp-m1", label: "Cobertura banda ancha >100Mbps", value: 95.2, unit: "%", trend: "up", target: 100, description: "Hogares con cobertura de banda ancha superior a 100 Mbps" },
      { id: "mtdfp-m2", label: "Servicios publicos digitalizados", value: 82, unit: "%", trend: "up", target: 100, description: "Porcentaje de servicios publicos disponibles online" },
      { id: "mtdfp-m3", label: "Datasets abiertos publicados", value: 42800, unit: "datasets", trend: "up", description: "Datasets disponibles en datos.gob.es" },
      { id: "mtdfp-m4", label: "Plazas OEP convocadas", value: 44500, unit: "plazas", trend: "up", description: "Plazas de empleo publico convocadas en 2026" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Asuntos Economicos y Transformacion Digital",
      "Comision de Hacienda y Funcion Publica",
    ],
    relatedPERTEs: ["PERTE Chip", "PERTE Nueva Economia de la Lengua"],
    employeeCount: 9200,
    createdDate: "2023-11-21",
    lastRestructured: "2024-11-28",
    tags: ["digital", "ia", "telecomunicaciones", "funcion-publica", "datos-abiertos", "5g"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. Educacion, FP y Deportes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "educacion",
    name: "Ministerio de Educacion, Formacion Profesional y Deportes",
    shortName: "Educacion",
    acronym: "MEFPD",
    minister: {
      name: "Pilar Alegria",
      role: "Ministra",
      since: "2021-07-12",
      party: "PSOE",
      previousRole: "Delegada del Gobierno en Aragon",
    },
    description:
      "Responsable de la politica educativa estatal, la formacion profesional, las becas y ayudas al estudio, y la politica deportiva.",
    keyAreas: [
      "Educacion basica y secundaria",
      "Formacion profesional",
      "Becas y ayudas",
      "Deportes",
      "Educacion digital",
    ],
    webUrl: "https://www.educacionfpydeportes.gob.es",
    colorAccent: "#d97706",
    budget: {
      totalM: 6200,
      capitalM: 480,
      currentM: 3700,
      staffM: 2020,
      changePct: 8.4,
      pctOfPGE: 1.09,
      keyItems: [
        { label: "Becas y ayudas al estudio", amountM: 2400, description: "Becas generales, FP y movilidad" },
        { label: "CSD - Deportes", amountM: 420, description: "Consejo Superior de Deportes" },
        { label: "Formacion Profesional", amountM: 1100, description: "Impulso y modernizacion de la FP" },
      ],
    },
    keyPersonnel: [
      { name: "Pilar Alegria", role: "Ministra", since: "2021-07-12", party: "PSOE" },
      { name: "Jose Manuel Bar Cendron", role: "Secretario de Estado de Educacion", since: "2023-11-22" },
      { name: "Victor Francos Diaz", role: "Presidente CSD", since: "2023-11-22", party: "PSOE" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Educacion",
        slug: "se-educacion",
        type: "secretaria-estado",
        description: "Politica educativa estatal y coordinacion con CCAA",
        employeeCount: 1200,
        budgetM: 1800,
      },
      {
        name: "Consejo Superior de Deportes (CSD)",
        slug: "csd",
        type: "organismo-autonomo",
        headName: "Victor Francos Diaz",
        description: "Organo superior de la politica deportiva estatal",
        employeeCount: 680,
        budgetM: 420,
        webUrl: "https://www.csd.gob.es",
      },
      {
        name: "INTEF",
        slug: "intef",
        type: "entidad",
        description: "Instituto Nacional de Tecnologias Educativas y de Formacion del Profesorado",
        employeeCount: 180,
        budgetM: 95,
        webUrl: "https://intef.es",
      },
      {
        name: "UNED",
        slug: "uned",
        type: "organismo-autonomo",
        description: "Universidad Nacional de Educacion a Distancia",
        employeeCount: 2800,
        budgetM: 380,
        webUrl: "https://www.uned.es",
      },
    ],
    officialSources: [
      {
        id: "edu-web",
        label: "Portal Educacion",
        url: "https://www.educacionfpydeportes.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MEFPD",
      },
      {
        id: "edu-datos",
        label: "Datos abiertos Educacion",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Educaci%C3%B3n",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets de educacion en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "edu-estadisticas",
        label: "Estadisticas de educacion",
        url: "https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/estadisticas.html",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Estadisticas del sistema educativo espanol",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "edu-transparencia",
        label: "Transparencia Educacion",
        url: "https://www.educacionfpydeportes.gob.es/transparencia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "edu-act-1",
        date: "2026-04-08",
        type: "convocatoria",
        title: "Convocatoria de becas generales 2026-2027",
        summary: "Apertura del plazo para becas generales universitarias y de FP con un presupuesto record de 2.400M EUR.",
        impact: "alto",
      },
      {
        id: "edu-act-2",
        date: "2026-04-02",
        type: "nota-prensa",
        title: "Tasa de abandono escolar temprano baja al 12.8%",
        summary: "Espana reduce la tasa de abandono escolar temprano al 12.8%, la mas baja de su historia.",
        impact: "alto",
      },
      {
        id: "edu-act-3",
        date: "2026-03-25",
        type: "legislacion",
        title: "Desarrollo reglamentario de la Ley de FP",
        summary: "Aprobacion de las normas de desarrollo de la Ley Organica de FP en los centros integrados.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "edu-act-4",
        date: "2026-03-18",
        type: "comparecencia",
        title: "Alegria presenta el Plan de Lectura 2026",
        summary: "La ministra presenta el nuevo Plan de Fomento de la Lectura con 85M EUR de presupuesto.",
        impact: "bajo",
      },
    ],
    metrics: [
      { id: "edu-m1", label: "Tasa abandono escolar temprano", value: 12.8, unit: "%", trend: "down", target: 9.0, description: "Jovenes 18-24 sin secundaria superior" },
      { id: "edu-m2", label: "Matriculados FP", value: 1120000, unit: "alumnos", trend: "up", description: "Alumnos matriculados en FP" },
      { id: "edu-m3", label: "Becas concedidas", value: 685000, unit: "becas", trend: "up", description: "Becas generales concedidas en el curso" },
      { id: "edu-m4", label: "Gasto educativo / PIB", value: 4.6, unit: "%", trend: "stable", target: 5.0, description: "Gasto publico en educacion como porcentaje del PIB" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Educacion y Formacion Profesional",
      "Comision de Ciencia, Innovacion y Universidades",
    ],
    employeeCount: 5800,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["educacion", "fp", "becas", "deportes", "lomloe"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. Trabajo y Economia Social
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "trabajo",
    name: "Ministerio de Trabajo y Economia Social",
    shortName: "Trabajo",
    acronym: "MTES",
    minister: {
      name: "Yolanda Diaz",
      role: "Ministra y Vicepresidenta Segunda",
      since: "2020-01-13",
      party: "Sumar",
      previousRole: "Ministra de Trabajo (gobierno de coalicion 2020)",
    },
    vicePresident: true,
    vpOrder: 2,
    description:
      "Responsable de la politica laboral, las relaciones laborales, las politicas de empleo, la economia social y la inspeccion de trabajo.",
    keyAreas: [
      "Relaciones laborales",
      "Empleo",
      "Salario minimo",
      "Economia social",
      "Inspeccion de trabajo",
    ],
    webUrl: "https://www.trabajo.gob.es",
    colorAccent: "#dc2626",
    budget: {
      totalM: 8900,
      capitalM: 280,
      currentM: 7020,
      staffM: 1600,
      changePct: 3.2,
      pctOfPGE: 1.57,
      keyItems: [
        { label: "SEPE prestaciones", amountM: 5800, description: "Prestaciones por desempleo y politicas activas" },
        { label: "Inspeccion de Trabajo", amountM: 380, description: "Inspeccion de Trabajo y Seguridad Social" },
        { label: "FOGASA", amountM: 420, description: "Fondo de Garantia Salarial" },
      ],
    },
    keyPersonnel: [
      { name: "Yolanda Diaz", role: "Ministra y VP2", since: "2020-01-13", party: "Sumar" },
      { name: "Joaquin Perez Rey", role: "Secretario de Estado de Empleo", since: "2020-01-15" },
      { name: "Babette Stein", role: "Secretaria de Estado de Trabajo", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Servicio Publico de Empleo Estatal (SEPE)",
        slug: "sepe",
        type: "organismo-autonomo",
        description: "Gestion de prestaciones por desempleo y politicas activas de empleo",
        employeeCount: 28000,
        budgetM: 5800,
        webUrl: "https://www.sepe.es",
      },
      {
        name: "Secretaria de Estado de Empleo y Economia Social",
        slug: "se-empleo",
        type: "secretaria-estado",
        description: "Politicas de empleo y economia social",
        employeeCount: 1200,
        budgetM: 780,
      },
      {
        name: "Inspeccion de Trabajo y Seguridad Social (ITSS)",
        slug: "itss",
        type: "organismo-autonomo",
        description: "Vigilancia del cumplimiento de la normativa laboral",
        employeeCount: 2800,
        budgetM: 380,
        webUrl: "https://www.mites.gob.es/itss/",
      },
      {
        name: "Fondo de Garantia Salarial (FOGASA)",
        slug: "fogasa",
        type: "organismo-autonomo",
        description: "Garantia de salarios e indemnizaciones ante insolvencia empresarial",
        employeeCount: 650,
        budgetM: 420,
      },
    ],
    officialSources: [
      {
        id: "trabajo-web",
        label: "Portal Trabajo",
        url: "https://www.trabajo.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MTES",
      },
      {
        id: "trabajo-sepe-datos",
        label: "SEPE datos abiertos",
        url: "https://www.sepe.es/HomeSepe/que-es-el-sepe/datos-abiertos.html",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Datos abiertos del SEPE sobre empleo y desempleo",
        dataFormats: ["CSV", "JSON", "XML"],
      },
      {
        id: "trabajo-estadisticas",
        label: "Estadisticas laborales",
        url: "https://www.trabajo.gob.es/estadisticas/",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Estadisticas del mercado de trabajo",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "trabajo-transparencia",
        label: "Transparencia Trabajo",
        url: "https://www.trabajo.gob.es/transparencia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del MTES",
      },
    ],
    recentActivity: [
      {
        id: "trabajo-act-1",
        date: "2026-04-07",
        type: "legislacion",
        title: "Subida del SMI a 1.184 EUR/mes en 14 pagas",
        summary: "Aprobacion en Consejo de Ministros de la subida del Salario Minimo Interprofesional para 2026.",
        impact: "alto",
      },
      {
        id: "trabajo-act-2",
        date: "2026-04-01",
        type: "nota-prensa",
        title: "Tasa de temporalidad baja al 14.2%",
        summary: "La reforma laboral sigue dando resultados: la temporalidad cae al 14.2%, minimo historico.",
        impact: "alto",
      },
      {
        id: "trabajo-act-3",
        date: "2026-03-26",
        type: "comparecencia",
        title: "Diaz presenta resultados de la reduccion de jornada",
        summary: "La vicepresidenta presenta los primeros datos de implementacion de la jornada de 37.5 horas.",
        impact: "alto",
      },
      {
        id: "trabajo-act-4",
        date: "2026-03-20",
        type: "boe",
        title: "Orden de cotizacion 2026",
        summary: "Publicacion de la orden que regula las bases y tipos de cotizacion a la Seguridad Social para 2026.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "trabajo-m1", label: "Contratos indefinidos", value: 48.5, unit: "%", trend: "up", description: "Porcentaje de contratos indefinidos sobre el total" },
      { id: "trabajo-m2", label: "Accidentes laborales mortales", value: 582, unit: "fallecidos", trend: "down", target: 400, description: "Fallecidos por accidente laboral (anual)" },
      { id: "trabajo-m3", label: "SMI mensual (14 pagas)", value: 1184, unit: "EUR", trend: "up", description: "Salario Minimo Interprofesional mensual" },
      { id: "trabajo-m4", label: "Convenios colectivos firmados", value: 4250, unit: "convenios", trend: "up", description: "Convenios colectivos firmados en el ultimo ano" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Trabajo, Inclusión, Seguridad Social y Migraciones",
    ],
    employeeCount: 12400,
    createdDate: "2020-01-13",
    lastRestructured: "2023-11-21",
    tags: ["empleo", "laboral", "smi", "sepe", "reforma-laboral", "economia-social"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. Industria y Turismo
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "industria-turismo",
    name: "Ministerio de Industria y Turismo",
    shortName: "Industria y Turismo",
    acronym: "MINTUR",
    minister: {
      name: "Jordi Hereu",
      role: "Ministro",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Alcalde de Barcelona (2006-2011)",
    },
    description:
      "Responsable de la politica industrial, la regulacion de las pymes, la politica turistica y la promocion internacional de Espana como destino.",
    keyAreas: [
      "Politica industrial",
      "Turismo",
      "Pyme y emprendimiento",
      "Reindustrializacion",
      "Comercio interior",
    ],
    webUrl: "https://www.mintur.gob.es",
    colorAccent: "#ea580c",
    budget: {
      totalM: 7600,
      capitalM: 3200,
      currentM: 3100,
      staffM: 1300,
      changePct: 5.8,
      pctOfPGE: 1.34,
      keyItems: [
        { label: "Turespaña", amountM: 380, description: "Promocion turistica internacional" },
        { label: "Reindustrializacion", amountM: 2100, description: "Programas de reindustrializacion y PERTEs industriales" },
        { label: "ENISA creditos emprendedores", amountM: 180, description: "Financiacion a emprendedores y startups" },
      ],
    },
    keyPersonnel: [
      { name: "Jordi Hereu", role: "Ministro", since: "2023-11-21", party: "PSOE" },
      { name: "Amparo Lopez Senovilla", role: "Secretaria de Estado de Turismo", since: "2023-11-22" },
      { name: "Raul Blanco Diaz", role: "Secretario General de Industria y Pyme", since: "2020-02-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Turismo",
        slug: "se-turismo",
        type: "secretaria-estado",
        description: "Politica turistica y regulacion del sector",
        employeeCount: 420,
        budgetM: 480,
      },
      {
        name: "Turespana",
        slug: "turespana",
        type: "organismo-autonomo",
        description: "Promocion turistica de Espana en el exterior",
        employeeCount: 380,
        budgetM: 380,
        webUrl: "https://www.tourspain.es",
      },
      {
        name: "Direccion General de Industria y de la Pyme",
        slug: "dg-industria-pyme",
        type: "direccion-general",
        description: "Politica industrial y apoyo a la pequena y mediana empresa",
        employeeCount: 850,
        budgetM: 2100,
      },
      {
        name: "ENISA",
        slug: "enisa",
        type: "empresa-publica",
        description: "Empresa Nacional de Innovacion: financiacion a emprendedores",
        employeeCount: 120,
        budgetM: 180,
        webUrl: "https://www.enisa.es",
      },
    ],
    officialSources: [
      {
        id: "mintur-web",
        label: "Portal Industria y Turismo",
        url: "https://www.mintur.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MINTUR",
      },
      {
        id: "mintur-datos",
        label: "Datos abiertos Turismo",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Industria",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets de industria y turismo en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mintur-estadisticas",
        label: "Estadisticas de turismo",
        url: "https://www.tourspain.es/es-es/CosasQueDebesSaber/Paginas/estadisticas.aspx",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Estadisticas de turismo internacional",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "mintur-transparencia",
        label: "Transparencia Industria",
        url: "https://www.mintur.gob.es/es-ES/GobiernoAbierto/Paginas/Transparencia.aspx",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "mintur-act-1",
        date: "2026-04-06",
        type: "nota-prensa",
        title: "Espana recibe 94 millones de turistas internacionales en 2025",
        summary: "Espana bate su record historico de turistas internacionales con 94 millones en 2025.",
        impact: "alto",
      },
      {
        id: "mintur-act-2",
        date: "2026-04-01",
        type: "convocatoria",
        title: "Linea de ayudas PERTE industrial descarbonizacion",
        summary: "Convocatoria de 800M EUR para proyectos de descarbonizacion de la industria.",
        impact: "alto",
      },
      {
        id: "mintur-act-3",
        date: "2026-03-24",
        type: "legislacion",
        title: "Plan de turismo sostenible 2026-2030",
        summary: "Aprobacion del Plan Nacional de Turismo Sostenible con enfoque en desestacionalización y calidad.",
        impact: "medio",
      },
      {
        id: "mintur-act-4",
        date: "2026-03-15",
        type: "boe",
        title: "Regulacion de alojamientos turisticos",
        summary: "Publicacion del marco regulatorio estatal para plataformas de alojamiento turistico.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "mintur-m1", label: "Turistas internacionales anuales", value: 94, unit: "M turistas", trend: "up", description: "Turistas internacionales en 2025" },
      { id: "mintur-m2", label: "Indice produccion industrial", value: 104.6, unit: "indice (2015=100)", trend: "up", description: "Indice de produccion industrial" },
      { id: "mintur-m3", label: "Pymes creadas (anual)", value: 320000, unit: "empresas", trend: "up", description: "Nuevas pymes creadas en el ultimo ano" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Industria, Comercio y Turismo",
    ],
    relatedPERTEs: [
      "PERTE Agroalimentario",
      "PERTE de descarbonizacion industrial",
      "PERTE Naval",
    ],
    employeeCount: 4800,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["industria", "turismo", "pyme", "emprendimiento", "reindustrializacion"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. Agricultura, Pesca y Alimentacion
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "agricultura",
    name: "Ministerio de Agricultura, Pesca y Alimentacion",
    shortName: "Agricultura",
    acronym: "MAPA",
    minister: {
      name: "Luis Planas",
      role: "Ministro",
      since: "2018-06-07",
      party: "PSOE",
      previousRole: "Embajador de Espana ante la UE",
    },
    description:
      "Responsable de la politica agraria, pesquera y alimentaria, incluyendo la gestion de las ayudas de la PAC y la seguridad alimentaria.",
    keyAreas: [
      "Politica Agraria Comun (PAC)",
      "Pesca y acuicultura",
      "Seguridad alimentaria",
      "Desarrollo rural",
      "Ganaderia",
    ],
    webUrl: "https://www.mapa.gob.es",
    colorAccent: "#15803d",
    budget: {
      totalM: 8400,
      capitalM: 1200,
      currentM: 5800,
      staffM: 1400,
      changePct: 2.8,
      pctOfPGE: 1.48,
      keyItems: [
        { label: "PAC pagos directos", amountM: 4800, description: "Ayudas directas de la Politica Agraria Comun" },
        { label: "Desarrollo rural", amountM: 1600, description: "Programas de desarrollo rural y LEADER" },
        { label: "FEGA gestion de ayudas", amountM: 280, description: "Fondo Espanol de Garantia Agraria" },
      ],
    },
    keyPersonnel: [
      { name: "Luis Planas", role: "Ministro", since: "2018-06-07", party: "PSOE" },
      { name: "Fernando Miranda Sotillos", role: "Secretario General de Agricultura y Alimentacion", since: "2018-06-15" },
      { name: "Alicia Villauriz Iglesias", role: "Secretaria General de Pesca", since: "2020-02-10" },
    ],
    organismos: [
      {
        name: "Secretaria General de Agricultura y Alimentacion",
        slug: "sg-agricultura",
        type: "secretaria-estado",
        description: "Politica agraria y alimentaria",
        employeeCount: 3200,
        budgetM: 5200,
      },
      {
        name: "Secretaria General de Pesca",
        slug: "sg-pesca",
        type: "secretaria-estado",
        description: "Gestion pesquera y acuicola",
        employeeCount: 1800,
        budgetM: 680,
      },
      {
        name: "Fondo Espanol de Garantia Agraria (FEGA)",
        slug: "fega",
        type: "organismo-autonomo",
        description: "Gestion y pago de las ayudas de la PAC",
        employeeCount: 2200,
        budgetM: 280,
        webUrl: "https://www.fega.gob.es",
      },
      {
        name: "Agencia Espanola de Seguridad Alimentaria y Nutricion (AESAN)",
        slug: "aesan",
        type: "agencia",
        description: "Evaluacion de riesgos en la cadena alimentaria (compartido con Sanidad)",
        employeeCount: 350,
        budgetM: 42,
        webUrl: "https://www.aesan.gob.es",
      },
    ],
    officialSources: [
      {
        id: "mapa-web",
        label: "Portal MAPA",
        url: "https://www.mapa.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MAPA",
      },
      {
        id: "mapa-estadistica",
        label: "Estadisticas agrarias",
        url: "https://www.mapa.gob.es/es/estadistica/temas/default.aspx",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Estadisticas agrarias, pesqueras y alimentarias",
        dataFormats: ["CSV", "XLS", "PDF"],
      },
      {
        id: "mapa-fega",
        label: "FEGA datos beneficiarios PAC",
        url: "https://www.fega.gob.es/es/datos-abiertos",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Datos abiertos de beneficiarios y pagos de la PAC",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mapa-datos",
        label: "Datos abiertos MAPA",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Agricultura",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Datasets agrarios en datos.gob.es",
        dataFormats: ["CSV", "JSON", "GeoJSON"],
      },
    ],
    recentActivity: [
      {
        id: "mapa-act-1",
        date: "2026-04-05",
        type: "nota-prensa",
        title: "Exportaciones agroalimentarias superan 70.000M EUR",
        summary: "Espana alcanza un nuevo record en exportaciones agroalimentarias con mas de 70.000 millones.",
        impact: "alto",
      },
      {
        id: "mapa-act-2",
        date: "2026-03-30",
        type: "legislacion",
        title: "Ley contra las practicas comerciales desleales en la cadena alimentaria",
        summary: "Aprobacion de la reforma de la ley de la cadena alimentaria para reforzar la posicion de agricultores.",
        impact: "alto",
      },
      {
        id: "mapa-act-3",
        date: "2026-03-22",
        type: "convocatoria",
        title: "Ayudas PAC campana 2026",
        summary: "Apertura del plazo de solicitud de la PAC para la campana 2026.",
        impact: "alto",
      },
      {
        id: "mapa-act-4",
        date: "2026-03-15",
        type: "boe",
        title: "Regulacion de bienestar animal en explotaciones",
        summary: "Publicacion de las normas de bienestar animal para explotaciones ganaderas intensivas.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "mapa-m1", label: "Produccion agraria bruta", value: 58200, unit: "M EUR", trend: "up", description: "Valor de la produccion agraria bruta" },
      { id: "mapa-m2", label: "Exportaciones agroalimentarias", value: 70300, unit: "M EUR", trend: "up", description: "Exportaciones del sector agroalimentario" },
      { id: "mapa-m3", label: "Flota pesquera", value: 8450, unit: "buques", trend: "down", description: "Numero de buques de la flota pesquera espanola" },
      { id: "mapa-m4", label: "Superficie agricola util", value: 23.8, unit: "M hectareas", trend: "stable", description: "Superficie dedicada a la agricultura" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Agricultura, Pesca y Alimentacion",
    ],
    relatedPERTEs: ["PERTE Agroalimentario"],
    employeeCount: 10200,
    createdDate: "1971-01-01",
    lastRestructured: "2023-11-21",
    tags: ["agricultura", "pac", "pesca", "alimentacion", "ganaderia", "desarrollo-rural"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. Economia, Comercio y Empresa
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "economia",
    name: "Ministerio de Economia, Comercio y Empresa",
    shortName: "Economia",
    acronym: "MINECO",
    minister: {
      name: "Carlos Cuerpo",
      role: "Ministro",
      since: "2023-12-01",
      party: "PSOE",
      previousRole: "Director General de Analisis Macroeconomico (Tesoro)",
    },
    description:
      "Responsable de la politica economica, el comercio exterior, la regulacion financiera y de seguros, y la empresa publica.",
    keyAreas: [
      "Politica economica",
      "Comercio exterior",
      "Regulacion financiera",
      "Tesoro Publico",
      "Empresa publica",
    ],
    webUrl: "https://www.mineco.gob.es",
    colorAccent: "#0369a1",
    budget: {
      totalM: 3800,
      capitalM: 680,
      currentM: 2200,
      staffM: 920,
      changePct: 4.5,
      pctOfPGE: 0.67,
      keyItems: [
        { label: "ICEX internacionalizacion", amountM: 320, description: "Apoyo a la internacionalizacion empresarial" },
        { label: "ICO creditos", amountM: 850, description: "Lineas de mediacion y creditos ICO" },
        { label: "Tesoro Publico gestion deuda", amountM: 180, description: "Costes de gestion de la deuda publica" },
      ],
    },
    keyPersonnel: [
      { name: "Carlos Cuerpo", role: "Ministro", since: "2023-12-01", party: "PSOE" },
      { name: "Gonzalo Garcia Andres", role: "Secretario de Estado de Economia y Apoyo a la Empresa", since: "2021-08-01" },
      { name: "Xiana Mendez Bertolo", role: "Secretaria de Estado de Comercio", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Economia y Apoyo a la Empresa",
        slug: "se-economia",
        type: "secretaria-estado",
        description: "Direccion de la politica economica y apoyo empresarial",
        employeeCount: 1200,
        budgetM: 480,
      },
      {
        name: "Secretaria de Estado de Comercio",
        slug: "se-comercio",
        type: "secretaria-estado",
        description: "Politica comercial y promocion del comercio exterior",
        employeeCount: 980,
        budgetM: 420,
      },
      {
        name: "ICEX Espana Exportacion e Inversiones",
        slug: "icex",
        type: "entidad",
        description: "Promocion del comercio exterior y atraccion de inversiones",
        employeeCount: 1200,
        budgetM: 320,
        webUrl: "https://www.icex.es",
      },
      {
        name: "Tesoro Publico",
        slug: "tesoro",
        type: "direccion-general",
        description: "Gestion de la deuda publica y el tesoro del Estado",
        employeeCount: 450,
        budgetM: 180,
        webUrl: "https://www.tesoro.es",
      },
      {
        name: "Instituto de Credito Oficial (ICO)",
        slug: "ico",
        type: "entidad",
        description: "Banco publico: lineas de financiacion empresarial",
        employeeCount: 380,
        budgetM: 850,
        webUrl: "https://www.ico.es",
      },
    ],
    officialSources: [
      {
        id: "mineco-web",
        label: "Portal MINECO",
        url: "https://www.mineco.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MINECO",
      },
      {
        id: "mineco-datos",
        label: "Datos abiertos Economia",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Econom%C3%ADa",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets economicos en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mineco-tesoro",
        label: "Tesoro Publico estadisticas",
        url: "https://www.tesoro.es/deuda-publica/estadisticas",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Estadisticas de la deuda publica",
        dataFormats: ["CSV", "PDF"],
      },
      {
        id: "mineco-transparencia",
        label: "Transparencia MINECO",
        url: "https://www.mineco.gob.es/portal/site/mineco/transparencia",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "mineco-act-1",
        date: "2026-04-08",
        type: "nota-prensa",
        title: "IED en Espana crece un 18% en 2025",
        summary: "La inversion extranjera directa en Espana alcanzo los 42.000M EUR, un 18% mas que en 2024.",
        impact: "alto",
      },
      {
        id: "mineco-act-2",
        date: "2026-04-03",
        type: "legislacion",
        title: "Reforma de la Ley de Mercado de Valores",
        summary: "Aprobacion de la reforma para impulsar la cotizacion de pymes en los mercados de capitales.",
        impact: "alto",
      },
      {
        id: "mineco-act-3",
        date: "2026-03-28",
        type: "nota-prensa",
        title: "Balanza comercial mejora el saldo",
        summary: "El deficit comercial se reduce un 12% gracias al crecimiento de las exportaciones de servicios.",
        impact: "medio",
      },
      {
        id: "mineco-act-4",
        date: "2026-03-20",
        type: "boe",
        title: "Lineas ICO verdes 2026",
        summary: "Convocatoria de nuevas lineas ICO de financiacion verde por valor de 2.000M EUR.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "mineco-m1", label: "Balanza comercial (deficit)", value: -32500, unit: "M EUR", trend: "up", description: "Saldo de la balanza comercial (mejorando)" },
      { id: "mineco-m2", label: "IED recibida", value: 42000, unit: "M EUR", trend: "up", description: "Inversion extranjera directa en Espana" },
      { id: "mineco-m3", label: "Credito ICO concedido", value: 12500, unit: "M EUR", trend: "up", description: "Credito ICO concedido a empresas" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Asuntos Economicos y Transformacion Digital",
      "Comision de Comercio",
    ],
    employeeCount: 6100,
    createdDate: "2023-11-21",
    lastRestructured: "2023-12-01",
    tags: ["economia", "comercio", "empresa", "tesoro", "ico", "icex"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. Derechos Sociales, Consumo y Agenda 2030
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "derechos-sociales",
    name: "Ministerio de Derechos Sociales, Consumo y Agenda 2030",
    shortName: "Derechos Sociales",
    acronym: "MDSCA",
    minister: {
      name: "Pablo Bustinduy",
      role: "Ministro",
      since: "2023-11-21",
      party: "Independiente",
      previousRole: "Portavoz de Asuntos Exteriores de Podemos",
    },
    description:
      "Responsable de los derechos sociales, la proteccion de consumidores, la dependencia, la diversidad familiar y la Agenda 2030.",
    keyAreas: [
      "Derechos sociales",
      "Consumo",
      "Dependencia",
      "Agenda 2030",
      "Diversidad familiar",
    ],
    webUrl: "https://www.derechossociales.gob.es",
    colorAccent: "#7c3aed",
    budget: {
      totalM: 3100,
      capitalM: 120,
      currentM: 2280,
      staffM: 700,
      changePct: 6.2,
      pctOfPGE: 0.55,
      keyItems: [
        { label: "IMSERSO prestaciones", amountM: 1600, description: "Servicios de atencion a mayores y dependencia" },
        { label: "Ingreso Minimo Vital (gestion)", amountM: 180, description: "Gestion administrativa del IMV" },
        { label: "Proteccion al consumidor", amountM: 85, description: "Programas de proteccion de consumidores" },
      ],
    },
    keyPersonnel: [
      { name: "Pablo Bustinduy", role: "Ministro", since: "2023-11-21", party: "Independiente" },
      { name: "Rosa Arranz Notario", role: "Secretaria de Estado de Derechos Sociales", since: "2023-11-22" },
      { name: "Patricia Bezunartea Garcia", role: "DG de Consumo", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Derechos Sociales",
        slug: "se-derechos-sociales",
        type: "secretaria-estado",
        description: "Politicas de derechos sociales y Agenda 2030",
        employeeCount: 580,
        budgetM: 450,
      },
      {
        name: "IMSERSO",
        slug: "imserso",
        type: "organismo-autonomo",
        description: "Instituto de Mayores y Servicios Sociales",
        employeeCount: 42000,
        budgetM: 1600,
        webUrl: "https://www.imserso.es",
      },
      {
        name: "Direccion General de Consumo",
        slug: "dg-consumo",
        type: "direccion-general",
        description: "Proteccion de los derechos de los consumidores",
        employeeCount: 320,
        budgetM: 85,
      },
      {
        name: "Direccion General de Diversidad Familiar y Servicios Sociales",
        slug: "dg-diversidad-familiar",
        type: "direccion-general",
        description: "Politicas de apoyo a la familia y servicios sociales",
        employeeCount: 280,
        budgetM: 120,
      },
    ],
    officialSources: [
      {
        id: "mdsca-web",
        label: "Portal Derechos Sociales",
        url: "https://www.derechossociales.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MDSCA",
      },
      {
        id: "mdsca-datos",
        label: "Datos abiertos Derechos Sociales",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Derechos+Sociales",
        type: "datos-abiertos",
        status: "parcial",
        lastChecked: "2026-04-07",
        description: "Datasets de derechos sociales en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mdsca-imserso",
        label: "IMSERSO estadisticas dependencia",
        url: "https://www.imserso.es/imserso_01/documentacion/estadisticas/index.htm",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Estadisticas del sistema de dependencia",
        dataFormats: ["PDF", "XLS"],
      },
    ],
    recentActivity: [
      {
        id: "mdsca-act-1",
        date: "2026-04-06",
        type: "nota-prensa",
        title: "IMV alcanza 680.000 hogares beneficiarios",
        summary: "El Ingreso Minimo Vital llega a 680.000 hogares, superando el objetivo del ano.",
        impact: "alto",
      },
      {
        id: "mdsca-act-2",
        date: "2026-04-01",
        type: "legislacion",
        title: "Reforma de la Ley de Dependencia",
        summary: "Aprobacion de la reforma para reducir los tiempos de espera en la valoracion de dependencia.",
        impact: "alto",
      },
      {
        id: "mdsca-act-3",
        date: "2026-03-25",
        type: "comparecencia",
        title: "Bustinduy presenta informe ODS",
        summary: "El ministro presenta el informe de progreso de Espana hacia los Objetivos de Desarrollo Sostenible.",
        impact: "medio",
      },
      {
        id: "mdsca-act-4",
        date: "2026-03-18",
        type: "boe",
        title: "Regulacion de publicidad alimentaria dirigida a menores",
        summary: "Publicacion de la regulacion que limita la publicidad de alimentos no saludables dirigida a menores.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "mdsca-m1", label: "Hogares beneficiarios IMV", value: 680000, unit: "hogares", trend: "up", target: 850000, description: "Hogares que reciben el Ingreso Minimo Vital" },
      { id: "mdsca-m2", label: "Reclamaciones consumo resueltas", value: 185000, unit: "reclamaciones", trend: "up", description: "Reclamaciones de consumo resueltas" },
      { id: "mdsca-m3", label: "Beneficiarios sistema dependencia", value: 1420000, unit: "personas", trend: "up", target: 1600000, description: "Personas atendidas por el sistema de dependencia" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Derechos Sociales y Politicas Integrales de la Discapacidad",
    ],
    employeeCount: 2800,
    createdDate: "2020-01-13",
    lastRestructured: "2023-11-21",
    tags: ["derechos-sociales", "consumo", "agenda-2030", "dependencia", "imv"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. Sanidad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "sanidad",
    name: "Ministerio de Sanidad",
    shortName: "Sanidad",
    acronym: "MS",
    minister: {
      name: "Monica Garcia",
      role: "Ministra",
      since: "2023-11-21",
      party: "Mas Madrid/Sumar",
      previousRole: "Portavoz de Mas Madrid en la Asamblea de Madrid",
    },
    description:
      "Coordina la sanidad estatal, la politica farmaceutica, la salud publica, la gestion de la Organizacion Nacional de Trasplantes y los organismos sanitarios centrales.",
    keyAreas: [
      "Salud publica",
      "Politica farmaceutica",
      "Trasplantes",
      "Coordinacion sanitaria con CCAA",
      "Medicamentos y productos sanitarios",
    ],
    webUrl: "https://www.sanidad.gob.es",
    colorAccent: "#0f766e",
    budget: {
      totalM: 5100,
      capitalM: 380,
      currentM: 3920,
      staffM: 800,
      changePct: 5.5,
      pctOfPGE: 0.90,
      keyItems: [
        { label: "INGESA - Ceuta y Melilla", amountM: 680, description: "Gestion sanitaria directa en Ceuta y Melilla" },
        { label: "AEMPS", amountM: 120, description: "Agencia Espanola de Medicamentos y Productos Sanitarios" },
        { label: "Fondo de Cohesion Sanitaria", amountM: 1200, description: "Fondo para garantizar la equidad del SNS entre CCAA" },
      ],
    },
    keyPersonnel: [
      { name: "Monica Garcia", role: "Ministra", since: "2023-11-21", party: "Mas Madrid/Sumar" },
      { name: "Javier Padilla Bernaldez", role: "Secretario de Estado de Sanidad", since: "2023-11-22" },
      { name: "Beatriz Dominguez-Gil Gonzalez", role: "Directora ONT", since: "2017-01-15" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Sanidad",
        slug: "se-sanidad",
        type: "secretaria-estado",
        description: "Coordinacion del Sistema Nacional de Salud",
        employeeCount: 850,
        budgetM: 1800,
      },
      {
        name: "Agencia Espanola de Medicamentos y Productos Sanitarios (AEMPS)",
        slug: "aemps",
        type: "agencia",
        headName: "Maria Jesus Lamas Diaz",
        description: "Regulacion de medicamentos y productos sanitarios",
        employeeCount: 620,
        budgetM: 120,
        webUrl: "https://www.aemps.gob.es",
      },
      {
        name: "Instituto de Gestion Sanitaria (INGESA)",
        slug: "ingesa",
        type: "organismo-autonomo",
        description: "Gestion sanitaria directa en Ceuta y Melilla",
        employeeCount: 4200,
        budgetM: 680,
      },
      {
        name: "Organizacion Nacional de Trasplantes (ONT)",
        slug: "ont",
        type: "entidad",
        headName: "Beatriz Dominguez-Gil Gonzalez",
        description: "Coordinacion del sistema de trasplantes de Espana, lider mundial",
        employeeCount: 180,
        budgetM: 28,
        webUrl: "https://www.ont.es",
      },
      {
        name: "Direccion General de Salud Publica",
        slug: "dg-salud-publica",
        type: "direccion-general",
        description: "Politicas de salud publica y vigilancia epidemiologica",
        employeeCount: 420,
        budgetM: 280,
      },
    ],
    officialSources: [
      {
        id: "ms-web",
        label: "Portal Sanidad",
        url: "https://www.sanidad.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de Sanidad",
      },
      {
        id: "ms-estadisticas",
        label: "Estadisticas sanitarias",
        url: "https://www.sanidad.gob.es/estadEstudios/estadisticas/sisInfSanSNS/home.htm",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Estadisticas del Sistema Nacional de Salud",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "ms-aemps-datos",
        label: "AEMPS datos",
        url: "https://www.aemps.gob.es/la-aemps/datos-abiertos/",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Datos abiertos de medicamentos y productos sanitarios",
        dataFormats: ["CSV", "JSON", "XML"],
      },
      {
        id: "ms-ont-datos",
        label: "ONT estadisticas trasplantes",
        url: "https://www.ont.es/datos-y-estadisticas/",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Estadisticas de donacion y trasplantes",
        dataFormats: ["PDF", "CSV"],
      },
    ],
    recentActivity: [
      {
        id: "ms-act-1",
        date: "2026-04-09",
        type: "nota-prensa",
        title: "Espana vuelve a ser lider mundial en trasplantes",
        summary: "Con 49.3 donantes por millon, Espana revalida su liderazgo mundial en donacion y trasplantes.",
        impact: "alto",
      },
      {
        id: "ms-act-2",
        date: "2026-04-03",
        type: "legislacion",
        title: "Plan Nacional de Salud Mental 2026-2030",
        summary: "Aprobacion del nuevo Plan Nacional de Salud Mental con una dotacion de 600M EUR.",
        impact: "alto",
      },
      {
        id: "ms-act-3",
        date: "2026-03-27",
        type: "boe",
        title: "Actualizacion de la cartera de servicios del SNS",
        summary: "Publicacion de la actualizacion de la cartera comun de servicios del Sistema Nacional de Salud.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
      {
        id: "ms-act-4",
        date: "2026-03-20",
        type: "comparecencia",
        title: "Garcia informa sobre listas de espera",
        summary: "La ministra presenta los datos de listas de espera y el plan para su reduccion.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "ms-m1", label: "Lista de espera quirurgica", value: 780000, unit: "pacientes", trend: "down", target: 500000, description: "Pacientes en lista de espera quirurgica" },
      { id: "ms-m2", label: "Cobertura vacunal infantil", value: 97.2, unit: "%", trend: "stable", target: 98, description: "Cobertura vacunal en menores de 2 anos" },
      { id: "ms-m3", label: "Gasto farmaceutico publico", value: 12800, unit: "M EUR", trend: "up", description: "Gasto farmaceutico del SNS" },
      { id: "ms-m4", label: "Donantes por millon hab.", value: 49.3, unit: "donantes/M hab", trend: "up", description: "Tasa de donantes de organos por millon de habitantes" },
    ],
    relatedParliamentaryCommissions: ["Comision de Sanidad y Consumo"],
    employeeCount: 3200,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["sanidad", "salud-publica", "trasplantes", "farmacia", "aemps"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. Ciencia, Innovacion y Universidades
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "ciencia",
    name: "Ministerio de Ciencia, Innovacion y Universidades",
    shortName: "Ciencia",
    acronym: "MICIU",
    minister: {
      name: "Diana Morant",
      role: "Ministra",
      since: "2021-07-12",
      party: "PSOE",
      previousRole: "Alcaldesa de Gandia",
    },
    description:
      "Impulsa la investigacion cientifica, la innovacion tecnologica, la transferencia de conocimiento y la politica universitaria.",
    keyAreas: [
      "Investigacion cientifica",
      "Innovacion",
      "Universidades",
      "Transferencia de conocimiento",
      "Infraestructuras cientificas",
    ],
    webUrl: "https://www.ciencia.gob.es",
    colorAccent: "#0284c7",
    budget: {
      totalM: 4800,
      capitalM: 2100,
      currentM: 1800,
      staffM: 900,
      changePct: 9.2,
      pctOfPGE: 0.84,
      keyItems: [
        { label: "CSIC", amountM: 980, description: "Consejo Superior de Investigaciones Cientificas" },
        { label: "AEI convocatorias", amountM: 1200, description: "Agencia Estatal de Investigacion: proyectos I+D" },
        { label: "CDTI innovacion empresarial", amountM: 680, description: "Centro para el Desarrollo Tecnologico e Industrial" },
      ],
    },
    keyPersonnel: [
      { name: "Diana Morant", role: "Ministra", since: "2021-07-12", party: "PSOE" },
      { name: "Juan Cruz Cigudosa Garcia", role: "Secretario de Estado de Ciencia e Innovacion", since: "2023-11-22" },
      { name: "Jose Manuel Pingarron Carrazon", role: "Secretario General de Universidades", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Consejo Superior de Investigaciones Cientificas (CSIC)",
        slug: "csic",
        type: "agencia",
        description: "Mayor organismo publico de investigacion de Espana",
        employeeCount: 11000,
        budgetM: 980,
        webUrl: "https://www.csic.es",
      },
      {
        name: "Agencia Estatal de Investigacion (AEI)",
        slug: "aei",
        type: "agencia",
        description: "Financiacion competitiva de proyectos de I+D",
        employeeCount: 280,
        budgetM: 1200,
        webUrl: "https://www.aei.gob.es",
      },
      {
        name: "Centro para el Desarrollo Tecnologico e Industrial (CDTI)",
        slug: "cdti",
        type: "entidad",
        description: "Innovacion empresarial y transferencia tecnologica",
        employeeCount: 450,
        budgetM: 680,
        webUrl: "https://www.cdti.es",
      },
      {
        name: "Instituto de Salud Carlos III (ISCIII)",
        slug: "isciii",
        type: "organismo-autonomo",
        description: "Investigacion biomedica y de salud publica",
        employeeCount: 1800,
        budgetM: 420,
        webUrl: "https://www.isciii.es",
      },
    ],
    officialSources: [
      {
        id: "miciu-web",
        label: "Portal Ciencia",
        url: "https://www.ciencia.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MICIU",
      },
      {
        id: "miciu-datos",
        label: "Datos abiertos Ciencia",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Ciencia",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets de ciencia e investigacion",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "miciu-estadisticas",
        label: "Estadisticas de I+D",
        url: "https://www.ciencia.gob.es/Estrategias-y-Planes/Sistema-de-Informacion-sobre-Ciencia--Tecnologia-e-Innovacion--SICTI-.html",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Indicadores del sistema de I+D+i espanol",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "miciu-transparencia",
        label: "Transparencia MICIU",
        url: "https://www.ciencia.gob.es/transparencia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "miciu-act-1",
        date: "2026-04-08",
        type: "convocatoria",
        title: "Convocatoria AEI proyectos I+D 2026",
        summary: "Apertura de la convocatoria de proyectos de generacion de conocimiento con 1.200M EUR.",
        impact: "alto",
      },
      {
        id: "miciu-act-2",
        date: "2026-04-02",
        type: "nota-prensa",
        title: "Gasto en I+D alcanza el 1.52% del PIB",
        summary: "Espana alcanza el 1.52% del PIB en gasto en I+D, maximo historico aunque lejos de la media UE.",
        impact: "alto",
      },
      {
        id: "miciu-act-3",
        date: "2026-03-28",
        type: "legislacion",
        title: "Reforma de la LOSU - modificacion parcial",
        summary: "Aprobacion de ajustes a la Ley Organica del Sistema Universitario en materia de acreditacion.",
        sourceUrl: "https://www.boe.es",
        impact: "medio",
      },
      {
        id: "miciu-act-4",
        date: "2026-03-22",
        type: "nota-prensa",
        title: "Espana se incorpora al CERN en nuevo proyecto de fisica de particulas",
        summary: "Participacion espanola en el nuevo experimento de fisica de particulas del CERN con 45M EUR.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "miciu-m1", label: "Gasto I+D / PIB", value: 1.52, unit: "%", trend: "up", target: 2.12, description: "Gasto en I+D como porcentaje del PIB" },
      { id: "miciu-m2", label: "Patentes registradas", value: 3450, unit: "patentes", trend: "up", description: "Patentes registradas por investigadores espanoles" },
      { id: "miciu-m3", label: "Publicaciones cientificas", value: 98500, unit: "publicaciones", trend: "up", description: "Publicaciones en revistas indexadas" },
      { id: "miciu-m4", label: "Matriculados universitarios", value: 1680000, unit: "alumnos", trend: "stable", description: "Alumnos matriculados en universidades espanolas" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Ciencia, Innovacion y Universidades",
    ],
    relatedPERTEs: ["PERTE Chip", "PERTE Salud de Vanguardia", "PERTE Aeroespacial"],
    employeeCount: 13500,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["ciencia", "investigacion", "universidades", "csic", "innovacion", "id"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. Igualdad
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "igualdad",
    name: "Ministerio de Igualdad",
    shortName: "Igualdad",
    acronym: "MIG",
    minister: {
      name: "Ana Redondo",
      role: "Ministra",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Concejala de Cultura del Ayuntamiento de Valladolid",
    },
    description:
      "Responsable de las politicas de igualdad de genero, la lucha contra la violencia machista y los derechos LGTBI.",
    keyAreas: [
      "Igualdad de genero",
      "Violencia de genero",
      "Derechos LGTBI",
      "Brecha salarial",
      "Corresponsabilidad",
    ],
    webUrl: "https://www.igualdad.gob.es",
    colorAccent: "#be185d",
    budget: {
      totalM: 580,
      capitalM: 25,
      currentM: 420,
      staffM: 135,
      changePct: 4.8,
      pctOfPGE: 0.10,
      keyItems: [
        { label: "Pacto de Estado contra la VdG", amountM: 220, description: "Financiacion del Pacto de Estado contra la Violencia de Genero" },
        { label: "Instituto de las Mujeres", amountM: 45, description: "Investigacion y promocion de la igualdad" },
        { label: "Programas LGTBI", amountM: 18, description: "Politicas de diversidad sexual y LGTBI" },
      ],
    },
    keyPersonnel: [
      { name: "Ana Redondo", role: "Ministra", since: "2023-11-21", party: "PSOE" },
      { name: "Maria Soledad Murillo de la Vega", role: "Secretaria de Estado de Igualdad", since: "2023-11-22" },
      { name: "Isabel Garcia Sanchez", role: "Directora del Instituto de las Mujeres", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Igualdad y contra la Violencia de Genero",
        slug: "se-igualdad",
        type: "secretaria-estado",
        description: "Politicas de igualdad y lucha contra la violencia machista",
        employeeCount: 320,
        budgetM: 280,
      },
      {
        name: "Delegacion del Gobierno contra la Violencia de Genero",
        slug: "dg-vdg",
        type: "direccion-general",
        description: "Coordinacion de la lucha contra la violencia de genero",
        employeeCount: 180,
        budgetM: 220,
      },
      {
        name: "Instituto de las Mujeres",
        slug: "instituto-mujeres",
        type: "organismo-autonomo",
        description: "Promocion de las politicas de igualdad",
        employeeCount: 120,
        budgetM: 45,
        webUrl: "https://www.inmujeres.gob.es",
      },
      {
        name: "Direccion General de Diversidad Sexual y Derechos LGTBI",
        slug: "dg-lgtbi",
        type: "direccion-general",
        description: "Politicas de igualdad real y efectiva de las personas LGTBI",
        employeeCount: 65,
        budgetM: 18,
      },
    ],
    officialSources: [
      {
        id: "mig-web",
        label: "Portal Igualdad",
        url: "https://www.igualdad.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de Igualdad",
      },
      {
        id: "mig-estadisticas-vdg",
        label: "Estadisticas Violencia de Genero",
        url: "https://violenciagenero.igualdad.gob.es/violenciaEnCifras/home.htm",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Estadisticas de violencia de genero",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "mig-datos",
        label: "Datos abiertos Igualdad",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Igualdad",
        type: "datos-abiertos",
        status: "parcial",
        lastChecked: "2026-04-06",
        description: "Datasets de igualdad en datos.gob.es",
        dataFormats: ["CSV"],
      },
    ],
    recentActivity: [
      {
        id: "mig-act-1",
        date: "2026-04-07",
        type: "nota-prensa",
        title: "Brecha salarial se reduce al 17.8%",
        summary: "La brecha salarial de genero se reduce al 17.8% segun los ultimos datos de la EPA.",
        impact: "alto",
      },
      {
        id: "mig-act-2",
        date: "2026-03-30",
        type: "legislacion",
        title: "Plan de Igualdad en la AGE",
        summary: "Aprobacion del III Plan de Igualdad en la Administracion General del Estado.",
        impact: "medio",
      },
      {
        id: "mig-act-3",
        date: "2026-03-22",
        type: "comparecencia",
        title: "Redondo informa sobre el Pacto de Estado contra la VdG",
        summary: "Comparecencia ante la Comision de Igualdad sobre la ejecucion del Pacto de Estado.",
        impact: "medio",
      },
      {
        id: "mig-act-4",
        date: "2026-03-08",
        type: "nota-prensa",
        title: "8-M: actos institucionales por el Dia de la Mujer",
        summary: "El Gobierno celebra el Dia Internacional de la Mujer con un acto institucional en La Moncloa.",
        impact: "bajo",
      },
    ],
    metrics: [
      { id: "mig-m1", label: "Denuncias VdG anuales", value: 198000, unit: "denuncias", trend: "stable", description: "Denuncias por violencia de genero anuales" },
      { id: "mig-m2", label: "Brecha salarial de genero", value: 17.8, unit: "%", trend: "down", target: 10, description: "Diferencia salarial media entre hombres y mujeres" },
      { id: "mig-m3", label: "Mujeres en consejos administracion", value: 34.2, unit: "%", trend: "up", target: 40, description: "Porcentaje de mujeres en consejos de administracion del IBEX-35" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Igualdad",
    ],
    employeeCount: 820,
    createdDate: "2020-01-13",
    lastRestructured: "2023-11-21",
    tags: ["igualdad", "genero", "violencia-genero", "lgtbi", "brecha-salarial"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 17. Cultura
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "cultura",
    name: "Ministerio de Cultura",
    shortName: "Cultura",
    acronym: "MC",
    minister: {
      name: "Ernest Urtasun",
      role: "Ministro",
      since: "2023-11-21",
      party: "Sumar/Comuns",
      previousRole: "Eurodiputado",
    },
    description:
      "Responsable de la politica cultural, la proteccion del patrimonio historico, las artes escenicas, el cine, el libro y los museos nacionales.",
    keyAreas: [
      "Patrimonio historico",
      "Artes escenicas y musica",
      "Cine y audiovisual",
      "Libro y bibliotecas",
      "Museos nacionales",
    ],
    webUrl: "https://www.cultura.gob.es",
    colorAccent: "#9333ea",
    budget: {
      totalM: 1900,
      capitalM: 380,
      currentM: 1120,
      staffM: 400,
      changePct: 7.8,
      pctOfPGE: 0.33,
      keyItems: [
        { label: "Museos nacionales", amountM: 280, description: "Prado, Reina Sofia, otros museos nacionales" },
        { label: "INAEM", amountM: 220, description: "Instituto Nacional de las Artes Escenicas y de la Musica" },
        { label: "Ayudas al cine", amountM: 180, description: "Subvenciones y ayudas a la produccion cinematografica" },
      ],
    },
    keyPersonnel: [
      { name: "Ernest Urtasun", role: "Ministro", since: "2023-11-21", party: "Sumar/Comuns" },
      { name: "Jordi Marti Grau", role: "Secretario de Estado de Cultura", since: "2023-11-22" },
      { name: "Maria del Carmen Calvo Poyato", role: "Directora BNE", since: "2023-12-15" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Cultura",
        slug: "se-cultura",
        type: "secretaria-estado",
        description: "Direccion de la politica cultural",
        employeeCount: 850,
        budgetM: 680,
      },
      {
        name: "Biblioteca Nacional de Espana (BNE)",
        slug: "bne",
        type: "organismo-autonomo",
        description: "Custodia del patrimonio bibliografico espanol",
        employeeCount: 650,
        budgetM: 55,
        webUrl: "https://www.bne.es",
      },
      {
        name: "Museo Nacional del Prado",
        slug: "prado",
        type: "organismo-autonomo",
        description: "Pinacoteca de referencia mundial",
        employeeCount: 520,
        budgetM: 45,
        webUrl: "https://www.museodelprado.es",
      },
      {
        name: "Museo Nacional Centro de Arte Reina Sofia",
        slug: "reina-sofia",
        type: "organismo-autonomo",
        description: "Museo de arte contemporaneo",
        employeeCount: 420,
        budgetM: 38,
        webUrl: "https://www.museoreinasofia.es",
      },
      {
        name: "Instituto Nacional de las Artes Escenicas y de la Musica (INAEM)",
        slug: "inaem",
        type: "organismo-autonomo",
        description: "Promocion de las artes escenicas y musicales",
        employeeCount: 380,
        budgetM: 220,
        webUrl: "https://www.inaem.gob.es",
      },
    ],
    officialSources: [
      {
        id: "mc-web",
        label: "Portal Cultura",
        url: "https://www.cultura.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del Ministerio de Cultura",
      },
      {
        id: "mc-datos",
        label: "Datos abiertos Cultura",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Cultura",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets culturales en datos.gob.es",
        dataFormats: ["CSV", "JSON", "XML"],
      },
      {
        id: "mc-estadisticas",
        label: "CULTURABase estadisticas",
        url: "https://www.cultura.gob.es/dam/jcr:b7f4a086-7d50-44e4-b3e6-2d8e4f8c7a60/culturabase.xlsx",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Base de datos de estadisticas culturales",
        dataFormats: ["XLS", "CSV"],
      },
      {
        id: "mc-transparencia",
        label: "Transparencia Cultura",
        url: "https://www.cultura.gob.es/transparencia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio de Cultura",
      },
    ],
    recentActivity: [
      {
        id: "mc-act-1",
        date: "2026-04-06",
        type: "nota-prensa",
        title: "Asistencia a museos nacionales crece un 12%",
        summary: "Los museos estatales reciben un 12% mas de visitantes en el primer trimestre de 2026.",
        impact: "medio",
      },
      {
        id: "mc-act-2",
        date: "2026-04-01",
        type: "convocatoria",
        title: "Convocatoria de ayudas a la produccion cinematografica 2026",
        summary: "Convocatoria de 180M EUR en ayudas a la produccion de largometrajes y series.",
        impact: "medio",
      },
      {
        id: "mc-act-3",
        date: "2026-03-25",
        type: "legislacion",
        title: "Ley del Mecenazgo",
        summary: "Tramitacion de la nueva Ley del Mecenazgo para incentivar la financiacion privada de la cultura.",
        impact: "alto",
      },
      {
        id: "mc-act-4",
        date: "2026-03-18",
        type: "boe",
        title: "Declaracion de Bien de Interes Cultural",
        summary: "Declaracion como BIC de las Cuevas de la Arana (Valencia).",
        sourceUrl: "https://www.boe.es",
        impact: "bajo",
      },
    ],
    metrics: [
      { id: "mc-m1", label: "Visitantes museos nacionales", value: 14800000, unit: "visitantes", trend: "up", description: "Visitantes anuales a museos nacionales (2025)" },
      { id: "mc-m2", label: "Produccion cinematografica", value: 342, unit: "peliculas", trend: "up", description: "Peliculas de produccion espanola en 2025" },
      { id: "mc-m3", label: "PIB cultural / PIB total", value: 3.8, unit: "%", trend: "up", description: "Contribucion de las industrias culturales al PIB" },
    ],
    relatedParliamentaryCommissions: ["Comision de Cultura y Deporte"],
    employeeCount: 4600,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["cultura", "museos", "cine", "patrimonio", "bibliotecas", "artes-escenicas"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 18. Inclusion, Seguridad Social y Migraciones
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "inclusion",
    name: "Ministerio de Inclusion, Seguridad Social y Migraciones",
    shortName: "Inclusion y SS",
    acronym: "MISSM",
    minister: {
      name: "Elma Saiz",
      role: "Ministra",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Alcaldesa de Pamplona",
    },
    description:
      "Gestiona el sistema de Seguridad Social (pensiones, prestaciones), las politicas migratorias y de asilo, y el Ingreso Minimo Vital.",
    keyAreas: [
      "Seguridad Social y pensiones",
      "Migraciones",
      "Asilo y refugio",
      "Ingreso Minimo Vital",
      "Regimen de la Seguridad Social",
    ],
    webUrl: "https://www.inclusion.gob.es",
    colorAccent: "#0e7490",
    budget: {
      totalM: 204000,
      capitalM: 850,
      currentM: 200350,
      staffM: 2800,
      changePct: 5.1,
      pctOfPGE: 35.86,
      keyItems: [
        { label: "Pensiones contributivas", amountM: 185000, description: "Pago de pensiones contributivas de jubilacion, viudedad e incapacidad" },
        { label: "Ingreso Minimo Vital", amountM: 3200, description: "Prestacion de Ingreso Minimo Vital" },
        { label: "Politica migratoria", amountM: 1800, description: "Acogida, integracion y gestion migratoria" },
      ],
    },
    keyPersonnel: [
      { name: "Elma Saiz", role: "Ministra", since: "2023-11-21", party: "PSOE" },
      { name: "Borja Suarez Corujo", role: "Secretario de Estado de Seguridad Social y Pensiones", since: "2023-11-22" },
      { name: "Pilar Cancela Rodriguez", role: "Secretaria de Estado de Migraciones", since: "2023-11-22" },
    ],
    organismos: [
      {
        name: "Tesoreria General de la Seguridad Social (TGSS)",
        slug: "tgss",
        type: "entidad",
        description: "Gestion de la recaudacion y pagos del sistema de Seguridad Social",
        employeeCount: 12000,
        budgetM: 920,
        webUrl: "https://www.seg-social.es",
      },
      {
        name: "Instituto Nacional de la Seguridad Social (INSS)",
        slug: "inss",
        type: "organismo-autonomo",
        description: "Reconocimiento de prestaciones economicas de la Seguridad Social",
        employeeCount: 8500,
        budgetM: 185000,
        webUrl: "https://www.seg-social.es/wps/portal/wss/internet/Conocenos/QuienesSomos/29413",
      },
      {
        name: "Secretaria de Estado de Migraciones",
        slug: "se-migraciones",
        type: "secretaria-estado",
        description: "Politica migratoria, asilo y acogida",
        employeeCount: 3200,
        budgetM: 1800,
      },
      {
        name: "Instituto Social de la Marina (ISM)",
        slug: "ism",
        type: "organismo-autonomo",
        description: "Proteccion social de los trabajadores del mar",
        employeeCount: 1200,
        budgetM: 280,
      },
      {
        name: "Oficina de Asilo y Refugio (OAR)",
        slug: "oar",
        type: "entidad",
        description: "Tramitacion de solicitudes de asilo y proteccion internacional",
        employeeCount: 450,
        budgetM: 85,
      },
    ],
    officialSources: [
      {
        id: "missm-web",
        label: "Portal Inclusion",
        url: "https://www.inclusion.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MISSM",
      },
      {
        id: "missm-ss",
        label: "Seguridad Social estadisticas",
        url: "https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Estadisticas del sistema de Seguridad Social",
        dataFormats: ["CSV", "PDF", "XLS"],
      },
      {
        id: "missm-datos",
        label: "Datos abiertos Seg. Social",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Seguridad+Social",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datasets de la Seguridad Social en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "missm-transparencia",
        label: "Transparencia MISSM",
        url: "https://www.inclusion.gob.es/transparencia/index.htm",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "missm-act-1",
        date: "2026-04-08",
        type: "nota-prensa",
        title: "Afiliacion a la Seguridad Social alcanza 21.4 millones",
        summary: "Record historico de afiliados al sistema de Seguridad Social con 21.4 millones de cotizantes.",
        impact: "alto",
      },
      {
        id: "missm-act-2",
        date: "2026-04-02",
        type: "legislacion",
        title: "Reforma del mecanismo de equidad intergeneracional",
        summary: "Ajuste del MEI al 0.8% de cotizacion para reforzar la hucha de las pensiones.",
        impact: "alto",
      },
      {
        id: "missm-act-3",
        date: "2026-03-28",
        type: "boe",
        title: "Revalorizacion de pensiones 2026",
        summary: "Publicacion de la revalorizacion de pensiones conforme al IPC: 2.8% en 2026.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
      {
        id: "missm-act-4",
        date: "2026-03-20",
        type: "nota-prensa",
        title: "Espana acoge 18.000 solicitudes de asilo en el primer trimestre",
        summary: "Incremento del 22% en las solicitudes de proteccion internacional respecto al mismo periodo de 2025.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "missm-m1", label: "Pension media mensual", value: 1285, unit: "EUR", trend: "up", description: "Pension media mensual del sistema" },
      { id: "missm-m2", label: "Afiliados Seguridad Social", value: 21400000, unit: "afiliados", trend: "up", description: "Afiliados medios al sistema de Seguridad Social" },
      { id: "missm-m3", label: "Solicitudes de asilo", value: 72000, unit: "solicitudes/ano", trend: "up", description: "Solicitudes de proteccion internacional anuales" },
      { id: "missm-m4", label: "Beneficiarios IMV", value: 1850000, unit: "personas", trend: "up", target: 2500000, description: "Personas beneficiarias del Ingreso Minimo Vital" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Trabajo, Inclusion, Seguridad Social y Migraciones",
      "Comision del Pacto de Toledo",
    ],
    employeeCount: 30000,
    createdDate: "2020-01-13",
    lastRestructured: "2023-11-21",
    tags: ["seguridad-social", "pensiones", "migraciones", "asilo", "imv"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 19. Transicion Ecologica y Reto Demografico
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "transicion-ecologica",
    name: "Ministerio para la Transicion Ecologica y el Reto Demografico",
    shortName: "Transicion Ecologica",
    acronym: "MITECO",
    minister: {
      name: "Sara Aagesen",
      role: "Ministra",
      since: "2024-11-28",
      party: "PSOE",
      previousRole: "Secretaria de Estado de Energia",
    },
    description:
      "Responsable de la politica medioambiental, la transicion energetica, la lucha contra el cambio climatico, la gestion del agua y el reto demografico.",
    keyAreas: [
      "Cambio climatico",
      "Energia y transicion energetica",
      "Agua y gestion hidrologica",
      "Biodiversidad",
      "Reto demografico",
    ],
    webUrl: "https://www.miteco.gob.es",
    colorAccent: "#047857",
    budget: {
      totalM: 11200,
      capitalM: 4800,
      currentM: 4600,
      staffM: 1800,
      changePct: 8.9,
      pctOfPGE: 1.97,
      keyItems: [
        { label: "IDAE energias renovables", amountM: 2400, description: "Instituto para la Diversificacion y Ahorro de la Energia" },
        { label: "Confederaciones Hidrograficas", amountM: 2800, description: "Gestion de cuencas hidrograficas y obras hidraulicas" },
        { label: "Parques Nacionales", amountM: 180, description: "Red de Parques Nacionales" },
      ],
    },
    keyPersonnel: [
      { name: "Sara Aagesen", role: "Ministra", since: "2024-11-28", party: "PSOE" },
      { name: "Hugo Moran Fernandez", role: "Secretario de Estado de Medio Ambiente", since: "2018-06-15" },
      { name: "Sara Aagesen (prev.)", role: "Secretaria de Estado de Energia (antes de ser ministra)", since: "2020-02-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Medio Ambiente",
        slug: "se-medio-ambiente",
        type: "secretaria-estado",
        description: "Politicas medioambientales y de biodiversidad",
        employeeCount: 4200,
        budgetM: 3200,
      },
      {
        name: "Instituto para la Diversificacion y Ahorro de la Energia (IDAE)",
        slug: "idae",
        type: "entidad",
        description: "Promocion de la eficiencia energetica y las energias renovables",
        employeeCount: 380,
        budgetM: 2400,
        webUrl: "https://www.idae.es",
      },
      {
        name: "Agencia Estatal de Meteorologia (AEMET)",
        slug: "aemet",
        type: "agencia",
        description: "Servicio meteorologico y climatologico nacional",
        employeeCount: 1200,
        budgetM: 150,
        webUrl: "https://www.aemet.es",
      },
      {
        name: "Confederaciones Hidrograficas",
        slug: "conf-hidrograficas",
        type: "organismo-autonomo",
        description: "Gestion de las cuencas hidrograficas intercomunitarias",
        employeeCount: 5800,
        budgetM: 2800,
      },
      {
        name: "Organismo Autonomo de Parques Nacionales",
        slug: "oapn",
        type: "organismo-autonomo",
        description: "Gestion de la Red de Parques Nacionales",
        employeeCount: 850,
        budgetM: 180,
        webUrl: "https://www.miteco.gob.es/es/parques-nacionales-oapn/",
      },
    ],
    officialSources: [
      {
        id: "miteco-web",
        label: "Portal MITECO",
        url: "https://www.miteco.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MITECO",
      },
      {
        id: "miteco-aemet",
        label: "AEMET OpenData",
        url: "https://opendata.aemet.es",
        type: "api",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "API de datos meteorologicos abiertos de AEMET",
        dataFormats: ["JSON", "XML", "CSV"],
      },
      {
        id: "miteco-datos",
        label: "Datos abiertos MITECO",
        url: "https://www.miteco.gob.es/es/calidad-y-evaluacion-ambiental/temas/informacion-ambiental-integrada/datos-abiertos/",
        type: "datos-abiertos",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Datos abiertos medioambientales del MITECO",
        dataFormats: ["CSV", "JSON", "GeoJSON", "SHP"],
      },
      {
        id: "miteco-transparencia",
        label: "Transparencia MITECO",
        url: "https://www.miteco.gob.es/es/ministerio/transparencia/",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Portal de transparencia del MITECO",
      },
      {
        id: "miteco-estadisticas",
        label: "Estadisticas ambientales",
        url: "https://www.miteco.gob.es/es/estadistica/",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Estadisticas ambientales y energeticas",
        dataFormats: ["CSV", "PDF"],
      },
    ],
    recentActivity: [
      {
        id: "miteco-act-1",
        date: "2026-04-09",
        type: "nota-prensa",
        title: "Espana supera el 55% de electricidad renovable",
        summary: "La generacion electrica renovable supera por primera vez el 55% del mix electrico anual.",
        impact: "alto",
      },
      {
        id: "miteco-act-2",
        date: "2026-04-04",
        type: "legislacion",
        title: "PNIEC actualizado 2026-2030",
        summary: "Aprobacion de la actualizacion del Plan Nacional Integrado de Energia y Clima con nuevos objetivos.",
        impact: "alto",
      },
      {
        id: "miteco-act-3",
        date: "2026-03-28",
        type: "boe",
        title: "Plan Hidrologico Nacional - actualizacion",
        summary: "Publicacion de la actualizacion del Plan Hidrologico Nacional para el ciclo 2027-2033.",
        sourceUrl: "https://www.boe.es",
        impact: "alto",
      },
      {
        id: "miteco-act-4",
        date: "2026-03-15",
        type: "convocatoria",
        title: "Convocatoria MOVES IV - vehiculos electricos",
        summary: "Cuarta edicion del programa MOVES con 800M EUR para la compra de vehiculos electricos.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "miteco-m1", label: "Emisiones CO2 vs 1990", value: -28.5, unit: "% reduccion", trend: "down", target: -55, description: "Reduccion de emisiones de CO2 respecto a 1990" },
      { id: "miteco-m2", label: "Electricidad renovable", value: 55.2, unit: "%", trend: "up", target: 74, description: "Porcentaje de electricidad de origen renovable" },
      { id: "miteco-m3", label: "Reservas hidricas", value: 48.3, unit: "% capacidad", trend: "down", target: 55, description: "Nivel de reservas hidricas sobre capacidad total" },
      { id: "miteco-m4", label: "Superficie protegida terrestre", value: 27.8, unit: "%", trend: "up", target: 30, description: "Superficie terrestre bajo alguna figura de proteccion" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Transicion Ecologica y Reto Demografico",
    ],
    relatedPERTEs: [
      "PERTE de Energias Renovables, Hidrogeno Renovable y Almacenamiento (ERHA)",
      "PERTE de Digitalizacion del Ciclo del Agua",
    ],
    employeeCount: 18500,
    createdDate: "2020-01-13",
    lastRestructured: "2024-11-28",
    tags: ["medio-ambiente", "energia", "clima", "agua", "biodiversidad", "renovables"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 20. Vivienda y Agenda Urbana
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "vivienda",
    name: "Ministerio de Vivienda y Agenda Urbana",
    shortName: "Vivienda",
    acronym: "MIVAU",
    minister: {
      name: "Isabel Rodriguez",
      role: "Ministra",
      since: "2023-11-21",
      party: "PSOE",
      previousRole: "Ministra de Politica Territorial y Portavoz del Gobierno",
    },
    description:
      "Responsable de la politica de vivienda, el urbanismo, la rehabilitacion edificatoria y la Agenda Urbana Espanola.",
    keyAreas: [
      "Vivienda protegida",
      "Alquiler social",
      "Rehabilitacion edificatoria",
      "Agenda Urbana",
      "Suelo publico",
    ],
    webUrl: "https://www.mivau.gob.es",
    colorAccent: "#b45309",
    budget: {
      totalM: 3400,
      capitalM: 1800,
      currentM: 1200,
      staffM: 400,
      changePct: 15.2,
      pctOfPGE: 0.60,
      keyItems: [
        { label: "Plan estatal de vivienda", amountM: 1200, description: "Ayudas al alquiler y adquisicion de vivienda" },
        { label: "Rehabilitacion NGEU", amountM: 1400, description: "Rehabilitacion edificatoria con fondos europeos" },
        { label: "SEPES suelo publico", amountM: 280, description: "Actuaciones de SEPES en suelo publico para vivienda" },
      ],
    },
    keyPersonnel: [
      { name: "Isabel Rodriguez", role: "Ministra", since: "2023-11-21", party: "PSOE" },
      { name: "David Lucas Parrondo", role: "Secretario de Estado de Vivienda y Agenda Urbana", since: "2023-11-22" },
      { name: "Francisco Javier Martin Ramirez", role: "DG Vivienda y Suelo", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Secretaria de Estado de Vivienda y Agenda Urbana",
        slug: "se-vivienda",
        type: "secretaria-estado",
        description: "Politica estatal de vivienda y urbanismo",
        employeeCount: 480,
        budgetM: 1800,
      },
      {
        name: "Direccion General de Vivienda y Suelo",
        slug: "dg-vivienda",
        type: "direccion-general",
        description: "Regulacion y promocion de la vivienda",
        employeeCount: 280,
        budgetM: 1200,
      },
      {
        name: "SEPES - Entidad Publica Empresarial de Suelo",
        slug: "sepes",
        type: "empresa-publica",
        description: "Gestion de suelo publico para actividades economicas y vivienda",
        employeeCount: 320,
        budgetM: 280,
        webUrl: "https://www.sepes.es",
      },
    ],
    officialSources: [
      {
        id: "mivau-web",
        label: "Portal Vivienda",
        url: "https://www.mivau.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MIVAU",
      },
      {
        id: "mivau-datos",
        label: "Datos abiertos Vivienda",
        url: "https://datos.gob.es/es/catalogo?publisher_display_name=Ministerio+de+Vivienda",
        type: "datos-abiertos",
        status: "parcial",
        lastChecked: "2026-04-07",
        description: "Datasets de vivienda en datos.gob.es",
        dataFormats: ["CSV", "JSON"],
      },
      {
        id: "mivau-transparencia",
        label: "Transparencia Vivienda",
        url: "https://www.mivau.gob.es/ministerio/transparencia",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-06",
        description: "Portal de transparencia del Ministerio de Vivienda",
      },
    ],
    recentActivity: [
      {
        id: "mivau-act-1",
        date: "2026-04-08",
        type: "legislacion",
        title: "Desarrollo reglamentario de la Ley de Vivienda",
        summary: "Aprobacion del reglamento que desarrolla la Ley 12/2023 de vivienda, incluyendo zonas tensionadas.",
        impact: "alto",
      },
      {
        id: "mivau-act-2",
        date: "2026-04-02",
        type: "nota-prensa",
        title: "20.000 viviendas protegidas iniciadas en T1 2026",
        summary: "El primer trimestre de 2026 registra el inicio de 20.000 viviendas de proteccion oficial.",
        impact: "alto",
      },
      {
        id: "mivau-act-3",
        date: "2026-03-25",
        type: "convocatoria",
        title: "Convocatoria rehabilitacion de barrios NGEU",
        summary: "Apertura de la convocatoria de rehabilitacion integral de barrios con fondos NGEU: 600M EUR.",
        impact: "alto",
      },
      {
        id: "mivau-act-4",
        date: "2026-03-18",
        type: "comparecencia",
        title: "Rodriguez presenta Observatorio de la Vivienda",
        summary: "La ministra presenta el nuevo Observatorio Nacional de la Vivienda con datos en tiempo real.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "mivau-m1", label: "Viviendas protegidas iniciadas (anual)", value: 42000, unit: "viviendas", trend: "up", target: 100000, description: "Viviendas de proteccion oficial iniciadas" },
      { id: "mivau-m2", label: "Precio m2 medio Espana", value: 2180, unit: "EUR/m2", trend: "up", description: "Precio medio del metro cuadrado de vivienda" },
      { id: "mivau-m3", label: "Alquiler social disponible", value: 28500, unit: "viviendas", trend: "up", target: 100000, description: "Viviendas de alquiler social gestionadas por el Estado" },
      { id: "mivau-m4", label: "Rehabilitaciones NGEU ejecutadas", value: 185000, unit: "viviendas", trend: "up", target: 510000, description: "Viviendas rehabilitadas con fondos Next Gen EU" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Transportes, Movilidad y Agenda Urbana",
      "Comision de Vivienda",
    ],
    employeeCount: 1200,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["vivienda", "alquiler", "rehabilitacion", "urbanismo", "agenda-urbana"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 21. Juventud e Infancia
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "juventud-infancia",
    name: "Ministerio de Juventud e Infancia",
    shortName: "Juventud e Infancia",
    acronym: "MJI",
    minister: {
      name: "Sira Rego",
      role: "Ministra",
      since: "2023-11-21",
      party: "Sumar",
      previousRole: "Eurodiputada de Izquierda Unida",
    },
    description:
      "Ministerio de nueva creacion responsable de las politicas de juventud, la proteccion de la infancia y la emancipacion juvenil.",
    keyAreas: [
      "Politicas de juventud",
      "Proteccion de la infancia",
      "Emancipacion juvenil",
      "Bono joven alquiler",
      "Participacion juvenil",
    ],
    webUrl: "https://www.juventud.gob.es",
    colorAccent: "#2563eb",
    budget: {
      totalM: 420,
      capitalM: 25,
      currentM: 340,
      staffM: 55,
      changePct: 18.5,
      pctOfPGE: 0.07,
      keyItems: [
        { label: "Bono alquiler joven", amountM: 200, description: "Ayuda al alquiler para jovenes" },
        { label: "INJUVE programas", amountM: 45, description: "Programas del Instituto de la Juventud" },
        { label: "Proteccion infancia", amountM: 85, description: "Programas de proteccion de derechos de la infancia" },
      ],
    },
    keyPersonnel: [
      { name: "Sira Rego", role: "Ministra", since: "2023-11-21", party: "Sumar" },
      { name: "Ruben Perez Carcedo", role: "DG de Juventud", since: "2023-12-01" },
      { name: "Ana Sastre Campo", role: "DG de Derechos de la Infancia y Adolescencia", since: "2023-12-01" },
    ],
    organismos: [
      {
        name: "Direccion General de Juventud",
        slug: "dg-juventud",
        type: "direccion-general",
        description: "Politicas de juventud y emancipacion",
        employeeCount: 120,
        budgetM: 180,
      },
      {
        name: "Direccion General de Derechos de la Infancia y de la Adolescencia",
        slug: "dg-infancia",
        type: "direccion-general",
        description: "Proteccion y promocion de los derechos de la infancia",
        employeeCount: 95,
        budgetM: 85,
      },
      {
        name: "Instituto de la Juventud (INJUVE)",
        slug: "injuve",
        type: "organismo-autonomo",
        description: "Promocion de politicas de juventud y participacion",
        employeeCount: 180,
        budgetM: 45,
        webUrl: "https://www.injuve.es",
      },
    ],
    officialSources: [
      {
        id: "mji-web",
        label: "Portal Juventud",
        url: "https://www.juventud.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial del MJI",
      },
      {
        id: "mji-injuve",
        label: "INJUVE datos",
        url: "https://www.injuve.es/observatorio",
        type: "estadisticas",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Observatorio de la Juventud del INJUVE",
        dataFormats: ["PDF", "CSV"],
      },
      {
        id: "mji-transparencia",
        label: "Transparencia MJI",
        url: "https://www.juventud.gob.es/transparencia",
        type: "transparencia",
        status: "parcial",
        lastChecked: "2026-04-05",
        description: "Portal de transparencia del Ministerio",
      },
    ],
    recentActivity: [
      {
        id: "mji-act-1",
        date: "2026-04-07",
        type: "nota-prensa",
        title: "Ampliacion del bono alquiler joven hasta 35 anos",
        summary: "El Gobierno amplia la edad del bono de alquiler joven de 30 a 35 anos y sube la cuantia a 300 EUR/mes.",
        impact: "alto",
      },
      {
        id: "mji-act-2",
        date: "2026-04-01",
        type: "legislacion",
        title: "Ley de Proteccion de la Infancia en el entorno digital",
        summary: "Tramitacion de la ley que protege a los menores en el entorno digital y redes sociales.",
        impact: "alto",
      },
      {
        id: "mji-act-3",
        date: "2026-03-25",
        type: "convocatoria",
        title: "Convocatoria Erasmus+ Juventud 2026",
        summary: "Apertura de la convocatoria de movilidad juvenil Erasmus+ con 45M EUR.",
        impact: "medio",
      },
      {
        id: "mji-act-4",
        date: "2026-03-12",
        type: "comparecencia",
        title: "Rego presenta la Estrategia de Emancipacion Juvenil",
        summary: "La ministra presenta la estrategia para facilitar la emancipacion juvenil con medidas de vivienda y empleo.",
        impact: "medio",
      },
    ],
    metrics: [
      { id: "mji-m1", label: "Tasa emancipacion juvenil (16-29)", value: 17.2, unit: "%", trend: "up", target: 30, description: "Porcentaje de jovenes emancipados (16-29 anos)" },
      { id: "mji-m2", label: "Beneficiarios bono alquiler joven", value: 125000, unit: "jovenes", trend: "up", target: 200000, description: "Jovenes beneficiarios del bono de alquiler" },
      { id: "mji-m3", label: "Gasto proteccion infancia / PIB", value: 1.3, unit: "%", trend: "up", target: 2.0, description: "Gasto publico en proteccion de la infancia sobre PIB" },
    ],
    relatedParliamentaryCommissions: [
      "Comision de Juventud e Infancia",
      "Comision de Derechos de la Infancia y Adolescencia",
    ],
    employeeCount: 450,
    createdDate: "2023-11-21",
    lastRestructured: "2023-11-21",
    tags: ["juventud", "infancia", "emancipacion", "bono-alquiler", "injuve"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 22. Presidencia del Gobierno (La Moncloa)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "presidencia-gobierno",
    name: "Presidencia del Gobierno",
    shortName: "Presidencia",
    acronym: "PG",
    minister: {
      name: "Pedro Sanchez Perez-Castejon",
      role: "Presidente del Gobierno",
      since: "2018-06-02",
      party: "PSOE",
      previousRole: "Secretario General del PSOE",
    },
    description:
      "Oficina del Presidente del Gobierno. Coordina la accion del Ejecutivo, la comunicacion institucional y la seguridad nacional. No es un ministerio pero se incluye como organo superior del Gobierno.",
    keyAreas: [
      "Coordinacion del Gobierno",
      "Seguridad Nacional",
      "Politica economica (Oficina Economica)",
      "Comunicacion institucional",
      "Inteligencia (CNI)",
    ],
    webUrl: "https://www.lamoncloa.gob.es",
    colorAccent: "#1e1b4b",
    budget: {
      totalM: 980,
      capitalM: 85,
      currentM: 620,
      staffM: 275,
      changePct: 3.5,
      pctOfPGE: 0.17,
      keyItems: [
        { label: "CNI", amountM: 380, description: "Centro Nacional de Inteligencia" },
        { label: "Gabinete de Presidencia", amountM: 120, description: "Oficina del Presidente y asesores" },
        { label: "DSN", amountM: 85, description: "Departamento de Seguridad Nacional" },
      ],
    },
    keyPersonnel: [
      { name: "Pedro Sanchez Perez-Castejon", role: "Presidente del Gobierno", since: "2018-06-02", party: "PSOE" },
      { name: "Oscar Lopez Agueda", role: "Director del Gabinete del Presidente (prev.)", since: "2021-07-12", party: "PSOE" },
      { name: "Esperanza Casteleiro Llamazares", role: "Directora del CNI", since: "2022-05-10" },
    ],
    organismos: [
      {
        name: "Gabinete de la Presidencia del Gobierno",
        slug: "gabinete-presidencia",
        type: "entidad",
        description: "Organo de apoyo politico y tecnico al Presidente",
        employeeCount: 320,
        budgetM: 120,
      },
      {
        name: "Centro Nacional de Inteligencia (CNI)",
        slug: "cni",
        type: "entidad",
        headName: "Esperanza Casteleiro Llamazares",
        description: "Servicio de inteligencia del Estado espanol",
        employeeCount: 3500,
        budgetM: 380,
        webUrl: "https://www.cni.es",
      },
      {
        name: "Departamento de Seguridad Nacional (DSN)",
        slug: "dsn",
        type: "entidad",
        description: "Coordinacion de la politica de seguridad nacional",
        employeeCount: 180,
        budgetM: 85,
        webUrl: "https://www.dsn.gob.es",
      },
      {
        name: "Oficina Economica del Presidente",
        slug: "oficina-economica",
        type: "entidad",
        description: "Asesoria economica directa al Presidente del Gobierno",
        employeeCount: 65,
        budgetM: 15,
      },
    ],
    officialSources: [
      {
        id: "pg-web",
        label: "La Moncloa",
        url: "https://www.lamoncloa.gob.es",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Sitio web oficial de la Presidencia del Gobierno",
      },
      {
        id: "pg-rss",
        label: "RSS La Moncloa",
        url: "https://www.lamoncloa.gob.es/paginas/rss.aspx",
        type: "rss",
        status: "activo",
        lastChecked: "2026-04-09",
        description: "Feed RSS de noticias de La Moncloa",
        dataFormats: ["XML"],
      },
      {
        id: "pg-dsn",
        label: "DSN informes",
        url: "https://www.dsn.gob.es/es/actualidad",
        type: "web-principal",
        status: "activo",
        lastChecked: "2026-04-08",
        description: "Informes y noticias de Seguridad Nacional",
      },
      {
        id: "pg-transparencia",
        label: "Transparencia Presidencia",
        url: "https://transparencia.gob.es/transparencia/transparencia_Home/index/MasInformacion/Informes-de-interes/Presidencia.html",
        type: "transparencia",
        status: "activo",
        lastChecked: "2026-04-07",
        description: "Informacion publica sobre la Presidencia",
      },
    ],
    recentActivity: [
      {
        id: "pg-act-1",
        date: "2026-04-09",
        type: "nota-prensa",
        title: "Sanchez se reune con Macron para preparar el Consejo Europeo",
        summary: "Reunion bilateral Espana-Francia en Paris para coordinar posiciones ante el proximo Consejo Europeo.",
        impact: "alto",
      },
      {
        id: "pg-act-2",
        date: "2026-04-05",
        type: "comparecencia",
        title: "Consejo de Ministros: 15 medidas de vivienda",
        summary: "El Presidente preside un Consejo de Ministros extraordinario con un paquete de 15 medidas de vivienda.",
        impact: "alto",
      },
      {
        id: "pg-act-3",
        date: "2026-03-30",
        type: "nota-prensa",
        title: "Espana presenta candidatura a la Expo 2030",
        summary: "El Gobierno formaliza la candidatura de Madrid a la Exposicion Universal 2030.",
        impact: "medio",
      },
      {
        id: "pg-act-4",
        date: "2026-03-22",
        type: "nota-prensa",
        title: "Debate sobre el Estado de la Nacion anunciado para mayo",
        summary: "Presidencia anuncia la celebracion del Debate sobre el Estado de la Nacion para la segunda semana de mayo.",
        impact: "alto",
      },
    ],
    metrics: [
      { id: "pg-m1", label: "Consejos de Ministros en 2026", value: 14, unit: "sesiones", trend: "stable", description: "Sesiones del Consejo de Ministros celebradas en 2026" },
      { id: "pg-m2", label: "Viajes internacionales del Presidente", value: 8, unit: "viajes", trend: "stable", description: "Viajes internacionales del Presidente en 2026" },
      { id: "pg-m3", label: "Aprobacion gestion Gobierno (CIS)", value: 38.5, unit: "%", trend: "down", description: "Porcentaje de aprobacion de la gestion del Gobierno" },
    ],
    relatedParliamentaryCommissions: [
      "Comision Constitucional",
      "Comision Mixta de Seguridad Nacional",
    ],
    employeeCount: 4200,
    createdDate: "1978-12-29",
    lastRestructured: "2023-11-21",
    tags: ["presidencia", "gobierno", "moncloa", "cni", "seguridad-nacional"],
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Find a ministry by its slug.
 */
export function getMinistry(slug: string): Ministry | undefined {
  return ministries.find((m) => m.slug === slug);
}

/**
 * Get all ministries whose minister belongs to a given party (case-insensitive partial match).
 */
export function getMinisterByParty(partySlug: string): Ministry[] {
  const lower = partySlug.toLowerCase();
  return ministries.filter(
    (m) => m.minister.party?.toLowerCase().includes(lower) ?? false,
  );
}

/**
 * Return ministries sorted by total budget (descending).
 */
export function getMinistryByBudget(): Ministry[] {
  return [...ministries].sort((a, b) => b.budget.totalM - a.budget.totalM);
}

/**
 * For each ministry, return source counts and how many are active.
 */
export function getMinistryBySources(): {
  ministry: Ministry;
  sourceCount: number;
  activeCount: number;
}[] {
  return ministries.map((m) => ({
    ministry: m,
    sourceCount: m.officialSources.length,
    activeCount: m.officialSources.filter((s) => s.status === "activo").length,
  }));
}

/**
 * Collect all metrics grouped by ministry.
 */
export function getMinistryMetrics(): {
  slug: string;
  name: string;
  metrics: MinistryMetric[];
}[] {
  return ministries.map((m) => ({
    slug: m.slug,
    name: m.name,
    metrics: m.metrics,
  }));
}

/**
 * Aggregate totals across the whole government.
 */
export function getTotalGovernmentBudget(): {
  totalM: number;
  personnelM: number;
  investmentM: number;
} {
  let totalM = 0;
  let personnelM = 0;
  let investmentM = 0;
  for (const m of ministries) {
    totalM += m.budget.totalM;
    personnelM += m.budget.staffM;
    investmentM += m.budget.capitalM;
  }
  return { totalM, personnelM, investmentM };
}

/**
 * High-level summary of the government structure.
 */
export function getGovernmentStructureSummary(): {
  totalMinistries: number;
  totalEmployees: number;
  totalBudgetM: number;
  totalOrganismos: number;
  totalActiveSources: number;
  vpCount: number;
  partiesInGovernment: { party: string; count: number }[];
} {
  const partyMap = new Map<string, number>();
  let totalEmployees = 0;
  let totalBudgetM = 0;
  let totalOrganismos = 0;
  let totalActiveSources = 0;
  let vpCount = 0;

  for (const m of ministries) {
    totalEmployees += m.employeeCount;
    totalBudgetM += m.budget.totalM;
    totalOrganismos += m.organismos.length;
    totalActiveSources += m.officialSources.filter(
      (s) => s.status === "activo",
    ).length;
    if (m.vicePresident) vpCount++;

    const party = m.minister.party ?? "Independiente";
    partyMap.set(party, (partyMap.get(party) ?? 0) + 1);
  }

  const partiesInGovernment = Array.from(partyMap.entries())
    .map(([party, count]) => ({ party, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalMinistries: ministries.length,
    totalEmployees,
    totalBudgetM,
    totalOrganismos,
    totalActiveSources,
    vpCount,
    partiesInGovernment,
  };
}
