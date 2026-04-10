import type {
  AgentStatus,
  BudgetSnapshot,
  BudgetSummary,
  ConnectorArea,
  DashboardMetric,
  OfficialBulletinItem,
  OfficialConnector,
  ParliamentaryInitiative,
  Party,
  PoliticalCensusLayer,
  PoliticalCensusSummary,
  Politician,
  SearchResult,
  TerritorialOfficialSource,
  Territory,
  TimelineItem,
  TopicCluster,
} from "@espanaia/shared-types";

export const seedGeneratedAt = "2026-04-10T09:00:00.000Z";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Territorios monitorizados",
    value: "20 / 20",
    delta: "+4 capas",
    caption: "Estado, comunidades y ciudades autónomas mapeadas en el radar base.",
  },
  {
    label: "Agentes activos",
    value: "13",
    delta: "+2 en training",
    caption: "Cobertura preparada para BOE, Congreso, presupuestos, medios y resolución de entidades.",
  },
  {
    label: "Fuentes trazables",
    value: "154",
    delta: "+31 esta semana",
    caption: "Diseñado para distinguir señal oficial, mediática, presupuestaria y parlamentaria.",
  },
  {
    label: "Alertas priorizadas",
    value: "287",
    delta: "87% precisión seed",
    caption: "Primer scoring heurístico para orientar la experiencia AI del producto.",
  },
];

export const topicClusters: TopicCluster[] = [
  { name: "Presupuestos", signalCount: 34, shift: "+12%" },
  { name: "Infraestructura", signalCount: 28, shift: "+8%" },
  { name: "Vivienda", signalCount: 21, shift: "+5%" },
  { name: "Sanidad", signalCount: 19, shift: "+9%" },
];

export const heroPrompts = [
  "Resume las señales críticas sobre financiación autonómica de esta semana.",
  "Compara el pulso político entre Madrid, Cataluña y Andalucía.",
  "Explícame el último BOE con impacto presupuestario territorial.",
];

export const officialConnectors: OfficialConnector[] = [
  {
    id: "connector-boe-sumario",
    name: "BOE Sumario",
    area: "boe",
    documentationUrl: "https://www.boe.es/datosabiertos/",
    sourcePageUrl: "https://www.boe.es/datosabiertos/",
    latestJsonUrl: "https://www.boe.es/datosabiertos/api/boe/dias/20260408",
    note: "API REST bajo /datosabiertos/api/. Requiere cabecera Accept: application/json. Recurso /boe/dias/YYYYMMDD para sumario diario.",
  },
  {
    id: "connector-borme-sumario",
    name: "BORME Sumario",
    area: "borme",
    documentationUrl: "https://www.boe.es/datosabiertos/documentos/APIsumarioBORME.pdf",
    sourcePageUrl: "https://www.boe.es/informacion/mapa_web/",
    latestJsonUrl: "https://www.boe.es/datosabiertos/api/borme/sumario/20260408",
    note: "Expone el sumario diario del BORME en JSON/XML, incluyendo secciones, apartados y enlaces PDF/HTML/XML.",
  },
  {
    id: "connector-datos-auxiliares",
    name: "Datos auxiliares BOE",
    area: "boe",
    documentationUrl: "https://www.boe.es/datosabiertos/",
    sourcePageUrl: "https://www.boe.es/datosabiertos/",
    latestJsonUrl: "https://www.boe.es/datosabiertos/api/datos-auxiliares/materias",
    note: "Catálogos auxiliares de materias, ámbitos, rangos, departamentos y relaciones para enriquecer clasificación y trazabilidad.",
  },
  {
    id: "connector-congreso-iniciativas",
    name: "Congreso Iniciativas",
    area: "congreso",
    documentationUrl: "https://www.congreso.es/opendata/iniciativas",
    sourcePageUrl: "https://www.congreso.es/opendata/iniciativas",
    latestJsonUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    note: "La URL JSON rota por timestamp y se descubre parseando la página oficial de open data.",
  },
  {
    id: "connector-congreso-diputados",
    name: "Congreso Diputados Activos",
    area: "congreso",
    documentationUrl: "https://www.congreso.es/opendata/diputados",
    sourcePageUrl: "https://www.congreso.es/opendata/diputados",
    latestJsonUrl:
      "https://www.congreso.es/webpublica/opendata/diputados/DiputadosActivos__20260408050006.json",
    note: "La ficha de políticos se alimenta inicialmente de este dataset oficial de diputados activos.",
  },
  {
    id: "connector-senado-composicion",
    name: "Senado Composición Actual",
    area: "senado",
    documentationUrl: "https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html",
    sourcePageUrl: "https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html",
    latestJsonUrl: "https://www.senado.es/web/ficopendataservlet?tipoFich=20",
    note: "El censo vivo del Senado se obtiene desde la composición actual y se completa con la composición oficial de grupos parlamentarios.",
  },
  {
    id: "connector-senado-grupos",
    name: "Senado Grupos y Partidos",
    area: "senado",
    documentationUrl: "https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html",
    sourcePageUrl: "https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html",
    latestJsonUrl: "https://www.senado.es/web/ficopendataservlet?tipoFich=4&legis=15",
    note: "Sirve para resolver la composición por grupos parlamentarios y el nombre oficial de cada formación en la legislatura actual.",
  },
  {
    id: "connector-eurostat-spain",
    name: "Eurostat España",
    area: "eu",
    documentationUrl: "https://ec.europa.eu/eurostat/web/main/data/database",
    sourcePageUrl: "https://ec.europa.eu/eurostat/databrowser/explore/all/all_themes",
    latestJsonUrl: "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp?geo=ES&format=JSON",
    note: "PIB, déficit, deuda, paro e inflación de España con serie histórica de al menos 6 años para cálculo de forecast.",
  },
  {
    id: "connector-eurlex-spain",
    name: "EUR-Lex España",
    area: "eu",
    documentationUrl: "https://eur-lex.europa.eu/content/tools/webservices.html",
    sourcePageUrl: "https://eur-lex.europa.eu/homepage.html",
    note: "Legislación europea aplicable en España: reglamentos, directivas y decisiones. Acceso vía CELLAR SPARQL o búsqueda REST.",
  },
  {
    id: "connector-eu-semester",
    name: "Semestre Europeo — CSR España",
    area: "eu",
    documentationUrl: "https://commission.europa.eu/business-economy-euro/economic-and-fiscal-policy-coordination/european-semester_en",
    sourcePageUrl: "https://commission.europa.eu/business-economy-euro/economic-and-fiscal-policy-coordination/european-semester/european-semester-your-country/spain_en",
    note: "Recomendaciones específicas del Consejo a España (Country-Specific Recommendations) desde 2020.",
  },
  {
    id: "connector-nextgeneu-spain",
    name: "NextGenerationEU España",
    area: "eu",
    documentationUrl: "https://commission.europa.eu/business-economy-euro/economic-recovery/recovery-and-resilience-facility_en",
    sourcePageUrl: "https://commission.europa.eu/business-economy-euro/economic-recovery/recovery-and-resilience-facility/country-pages/spains-recovery-and-resilience-plan_en",
    note: "Seguimiento de desembolsos del Plan de Recuperación español: tramos, hitos cumplidos y cantidades pendientes.",
  },
  {
    id: "connector-datos-gob",
    name: "datos.gob.es",
    area: "local" as ConnectorArea,
    documentationUrl: "https://datos.gob.es/es/apidata",
    sourcePageUrl: "https://datos.gob.es/",
    latestJsonUrl: "https://datos.gob.es/apidata/catalog/dataset.json",
    note: "Portal nacional de datos abiertos. Agrega datasets de todas las AAPP: ayuntamientos, diputaciones, CCAA y Estado.",
  },
  {
    id: "connector-ine-tempus",
    name: "INE TEMPUS3 API",
    area: "local" as ConnectorArea,
    documentationUrl: "https://www.ine.es/dyngs/DataLab/manual.html?cid=1259945952385",
    sourcePageUrl: "https://www.ine.es/",
    latestJsonUrl: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2852",
    note: "API JSON del INE para series estadísticas: población municipal, padrón, demografía y estructura territorial.",
  },
  {
    id: "connector-registro-entidades-locales",
    name: "Registro de Entidades Locales",
    area: "local" as ConnectorArea,
    documentationUrl: "https://ssweb.seap.minhap.es/REL/",
    sourcePageUrl: "https://ssweb.seap.minhap.es/REL/",
    note: "Registro oficial de municipios, diputaciones, mancomunidades y comarcas del Ministerio de Política Territorial.",
  },
  {
    id: "connector-concejales-redsara",
    name: "Registro de Concejales",
    area: "local" as ConnectorArea,
    documentationUrl: "https://concejales.redsara.es/consulta/",
    sourcePageUrl: "https://concejales.redsara.es/consulta/",
    note: "Base de datos de todos los alcaldes y concejales de España (~67.000+). Ministerio de Política Territorial.",
  },
  {
    id: "connector-infoelectoral",
    name: "Infoelectoral (Interior)",
    area: "local" as ConnectorArea,
    documentationUrl: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/",
    sourcePageUrl: "https://infoelectoral.interior.gob.es/",
    note: "Resultados electorales completos desde 1977: municipales, autonómicas, generales y europeas. Formato .DAT con parser open source.",
  },
  {
    id: "connector-lamoncloa-gobierno",
    name: "La Moncloa — Gobierno",
    area: "congreso",
    documentationUrl: "https://www.lamoncloa.gob.es/gobierno/composiciondelgobierno/paginas/index.aspx",
    sourcePageUrl: "https://www.lamoncloa.gob.es/gobierno/composiciondelgobierno/paginas/index.aspx",
    note: "Composición del Consejo de Ministros: Presidente, Vicepresidentes y Ministros. Solo HTML.",
  },
  {
    id: "connector-hacienda-eell",
    name: "Hacienda — Entidades Locales",
    area: "local" as ConnectorArea,
    documentationUrl: "https://www.hacienda.gob.es/es-ES/CDI/Paginas/SistemasInformacion/SitioInformacionEntidadesLocales.aspx",
    sourcePageUrl: "https://www.hacienda.gob.es/es-ES/CDI/Paginas/SistemasInformacion/SitioInformacionEntidadesLocales.aspx",
    note: "Datos presupuestarios y financieros de diputaciones, cabildos y ayuntamientos publicados por el Ministerio de Hacienda.",
  },

  // ── Diarios de Sesiones (Transcripciones) ──────────────────────────────────
  {
    id: "connector-congreso-diario-sesiones",
    name: "Congreso — Diario de Sesiones",
    area: "congreso" as ConnectorArea,
    documentationUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    sourcePageUrl: "https://www.congreso.es/es/publicaciones/diario-de-sesiones",
    note: "Transcripciones literales de plenos y comisiones del Congreso. Formato PDF. Incluye todas las intervenciones, votaciones y acuerdos.",
  },
  {
    id: "connector-senado-diario-sesiones",
    name: "Senado — Diario de Sesiones",
    area: "senado" as ConnectorArea,
    documentationUrl: "https://www.senado.es/web/actividadparlamentaria/publicacionesoficiales/diariodesesiones/index.html",
    sourcePageUrl: "https://www.senado.es/web/actividadparlamentaria/publicacionesoficiales/diariodesesiones/index.html",
    note: "Transcripciones literales de plenos y comisiones del Senado. Formato PDF. Historial completo de legislaturas.",
  },
  {
    id: "connector-congreso-tv",
    name: "Congreso — Archivo audiovisual",
    area: "congreso" as ConnectorArea,
    documentationUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    sourcePageUrl: "https://www.congreso.es/web/audiovisual/archivo-audiovisual",
    note: "Vídeos de plenos y comisiones del Congreso. Emisión en directo y archivo histórico. Canal parlamentario.",
  },

  // ── Nuevas fuentes nacionales ─────────────────────────────────────────────
  {
    id: "connector-aeat",
    name: "AEAT — Agencia Tributaria",
    area: "hacienda" as ConnectorArea,
    documentationUrl: "https://sede.agenciatributaria.gob.es/Sede/datosabiertos.html",
    sourcePageUrl: "https://sede.agenciatributaria.gob.es/",
    latestJsonUrl: "https://sede.agenciatributaria.gob.es/Sede/datosabiertos.html",
    note: "Estadísticas tributarias por impuesto, territorio y ejercicio. Recaudación IRPF, IVA, Sociedades. Censo de obligados tributarios.",
  },
  {
    id: "connector-seg-social",
    name: "Seguridad Social — Afiliación",
    area: "empleo" as ConnectorArea,
    documentationUrl: "https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas",
    sourcePageUrl: "https://www.seg-social.es/",
    note: "Afiliación media por regímenes (general, autónomos, agrario, mar). Altas y bajas mensuales. Series por CCAA, provincia y sector CNAE.",
  },
  {
    id: "connector-sepe",
    name: "SEPE — Servicio Público de Empleo",
    area: "empleo" as ConnectorArea,
    documentationUrl: "https://www.sepe.es/HomeSepe/que-es-el-sepe/estadisticas/datos-avance/datos.html",
    sourcePageUrl: "https://www.sepe.es/",
    note: "Paro registrado mensual por CCAA, provincia, sexo, edad y sector. Contratos registrados. Prestaciones y beneficiarios.",
  },
  {
    id: "connector-banco-espana",
    name: "Banco de España",
    area: "financiero" as ConnectorArea,
    documentationUrl: "https://www.bde.es/wbe/es/estadisticas/",
    sourcePageUrl: "https://www.bde.es/",
    latestJsonUrl: "https://www.bde.es/webbe/es/estadisticas/compartir/datos-702.csv",
    note: "Indicadores de estabilidad financiera: crédito al sector privado, morosidad bancaria, deuda pública, balanza de pagos. Series CSV descargables.",
  },
  {
    id: "connector-cnmc",
    name: "CNMC — Comisión Nacional de Mercados y Competencia",
    area: "regulador" as ConnectorArea,
    documentationUrl: "https://www.cnmc.es/ambitos-de-actuacion/competencia",
    sourcePageUrl: "https://www.cnmc.es/",
    note: "Expedientes de competencia, resoluciones sobre telecomunicaciones, energía, transporte y sector audiovisual. Informes económicos sectoriales.",
  },
  {
    id: "connector-tribunal-constitucional",
    name: "Tribunal Constitucional",
    area: "justicia" as ConnectorArea,
    documentationUrl: "https://hj.tribunalconstitucional.es/",
    sourcePageUrl: "https://www.tribunalconstitucional.es/",
    note: "Buscador de jurisprudencia constitucional. Sentencias (STC), autos y recursos de inconstitucionalidad que afectan a legislación vigente.",
  },
  {
    id: "connector-cdti",
    name: "CDTI — Centro para el Desarrollo Tecnológico e Industrial",
    area: "hacienda" as ConnectorArea,
    documentationUrl: "https://www.cdti.es/index.asp?MP=100&MS=802&MN=2",
    sourcePageUrl: "https://www.cdti.es/",
    note: "Proyectos de I+D+i financiados, estadísticas de innovación empresarial, convocatorias abiertas, programas Horizonte Europa para empresas españolas.",
  },
  {
    id: "connector-transparencia",
    name: "Portal de Transparencia del Gobierno",
    area: "congreso" as ConnectorArea,
    documentationUrl: "https://transparencia.gob.es/",
    sourcePageUrl: "https://transparencia.gob.es/",
    note: "Derecho de acceso a información pública. Resoluciones del Consejo de Transparencia. Datos de contratos, subvenciones, cargos y retribuciones.",
  },
  {
    id: "connector-igae",
    name: "IGAE — Intervención General de la Administración del Estado",
    area: "hacienda" as ConnectorArea,
    documentationUrl: "https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Paginas/ianobase.aspx",
    sourcePageUrl: "https://www.igae.pap.hacienda.gob.es/",
    note: "Contabilidad Nacional: ejecución presupuestaria mensual del Estado, CCAA y Entidades Locales. Déficit, deuda y estabilidad presupuestaria.",
  },
  {
    id: "connector-airef",
    name: "AIReF — Autoridad Independiente de Responsabilidad Fiscal",
    area: "hacienda" as ConnectorArea,
    documentationUrl: "https://www.airef.es/es/datos/",
    sourcePageUrl: "https://www.airef.es/",
    note: "Previsiones macroeconómicas independientes, evaluación de sostenibilidad fiscal, informes sobre regla de gasto y deuda de todas las AAPP.",
  },

  // ── Fuentes europeas adicionales ──────────────────────────────────────────
  {
    id: "connector-parlamento-europeo",
    name: "Parlamento Europeo — Eurodiputados España",
    area: "eu" as ConnectorArea,
    documentationUrl: "https://www.europarl.europa.eu/meps/es/search/advanced",
    sourcePageUrl: "https://www.europarl.europa.eu/",
    note: "61 eurodiputados españoles: grupo político, comisiones, votaciones y posiciones. Actividad legislativa del PE con impacto en España.",
  },
  {
    id: "connector-bei",
    name: "BEI — Banco Europeo de Inversiones",
    area: "eu" as ConnectorArea,
    documentationUrl: "https://www.eib.org/en/projects/loans/index.htm",
    sourcePageUrl: "https://www.eib.org/",
    note: "Proyectos financiados por el BEI en España: infraestructuras, energía, PYMES, innovación. Importes y estados de préstamo.",
  },
  {
    id: "connector-fondos-estructurales",
    name: "Fondos Estructurales UE (FEDER/FSE+)",
    area: "eu" as ConnectorArea,
    documentationUrl: "https://cohesiondata.ec.europa.eu/countries/ES",
    sourcePageUrl: "https://cohesiondata.ec.europa.eu/",
    latestJsonUrl: "https://cohesiondata.ec.europa.eu/api/views",
    note: "Asignaciones FEDER y FSE+ por CCAA y programa operativo. Ejecución financiera y certificación de fondos de cohesión en España.",
  },

  // ── Fuentes locales / municipales ─────────────────────────────────────────
  {
    id: "connector-madrid-datos",
    name: "Datos abiertos Madrid",
    area: "local" as ConnectorArea,
    documentationUrl: "https://datos.madrid.es/portal/site/egob/menuitem.214413fe61bdd68a53318ba0a8a409a0/?vgnextoid=b07e0f7c5ff9e510VgnVCM1000008d4e110aRCRD",
    sourcePageUrl: "https://datos.madrid.es/",
    latestJsonUrl: "https://datos.madrid.es/egob/catalogo.json",
    note: "Portal de datos abiertos del Ayuntamiento de Madrid: presupuestos, movilidad, calidad del aire, equipamientos, actividad económica. +500 datasets.",
  },
  {
    id: "connector-bcn-opendata",
    name: "Open Data Barcelona",
    area: "local" as ConnectorArea,
    documentationUrl: "https://opendata-ajuntament.barcelona.cat/es",
    sourcePageUrl: "https://opendata-ajuntament.barcelona.cat/",
    note: "Portal de datos abiertos del Ayuntamiento de Barcelona: demografía, economía, urbanismo, transporte, medio ambiente. API REST + CKAN.",
  },
  {
    id: "connector-femp",
    name: "FEMP — Federación Española de Municipios y Provincias",
    area: "local" as ConnectorArea,
    documentationUrl: "https://www.femp.es/",
    sourcePageUrl: "https://www.femp.es/",
    note: "Organismo que agrupa ayuntamientos y diputaciones. Informes sobre financiación local, buenas prácticas, digitalización municipal.",
  },
];

export const territories: Territory[] = [
  {
    id: "territory-es",
    slug: "espana",
    name: "España",
    kind: "state",
    shortCode: "ES",
    seat: "Madrid",
    strategicFocus: "Gobierno central, Congreso, Senado, BOE y coordinación presupuestaria.",
    pulseScore: 98,
    monitoredInstitutions: ["Gobierno de España", "Congreso", "Senado", "BOE"],
    officialBulletinUrl: "https://www.boe.es/",
    featuredPartySlugs: ["psoe", "pp", "vox", "sumar"],
    featuredPoliticianSlugs: ["pedro-sanchez", "yolanda-diaz", "santiago-abascal"],
  },
  {
    id: "territory-an",
    slug: "andalucia",
    name: "Andalucía",
    kind: "autonomous-community",
    shortCode: "AN",
    seat: "Sevilla",
    strategicFocus: "Agua, agricultura, sanidad y ejecución regional.",
    pulseScore: 88,
    monitoredInstitutions: ["Junta de Andalucía", "Parlamento de Andalucía"],
    featuredPartySlugs: ["pp", "psoe", "vox"],
  },
  {
    id: "territory-ar",
    slug: "aragon",
    name: "Aragón",
    kind: "autonomous-community",
    shortCode: "AR",
    seat: "Zaragoza",
    strategicFocus: "Logística, energía y cohesión territorial.",
    pulseScore: 72,
    monitoredInstitutions: ["Gobierno de Aragón", "Cortes de Aragón"],
  },
  {
    id: "territory-as",
    slug: "asturias",
    name: "Asturias",
    kind: "autonomous-community",
    shortCode: "AS",
    seat: "Oviedo",
    strategicFocus: "Industria, transición energética y empleo.",
    pulseScore: 68,
    monitoredInstitutions: ["Gobierno del Principado", "Junta General"],
  },
  {
    id: "territory-ib",
    slug: "illes-balears",
    name: "Illes Balears",
    kind: "autonomous-community",
    shortCode: "IB",
    seat: "Palma",
    strategicFocus: "Turismo, vivienda y movilidad insular.",
    pulseScore: 74,
    monitoredInstitutions: ["Govern de les Illes Balears", "Parlament"],
  },
  {
    id: "territory-cn",
    slug: "canarias",
    name: "Canarias",
    kind: "autonomous-community",
    shortCode: "CN",
    seat: "Las Palmas / Santa Cruz",
    strategicFocus: "Conectividad, turismo y ultraperiferia.",
    pulseScore: 79,
    monitoredInstitutions: ["Gobierno de Canarias", "Parlamento de Canarias"],
    featuredPartySlugs: ["coalicion-canaria", "psoe", "pp"],
    featuredPoliticianSlugs: ["cristina-valido"],
  },
  {
    id: "territory-cb",
    slug: "cantabria",
    name: "Cantabria",
    kind: "autonomous-community",
    shortCode: "CB",
    seat: "Santander",
    strategicFocus: "Infraestructura, litoral y financiación.",
    pulseScore: 63,
    monitoredInstitutions: ["Gobierno de Cantabria", "Parlamento de Cantabria"],
  },
  {
    id: "territory-cl",
    slug: "castilla-y-leon",
    name: "Castilla y León",
    kind: "autonomous-community",
    shortCode: "CL",
    seat: "Valladolid",
    strategicFocus: "Demografía, agroindustria y servicios públicos.",
    pulseScore: 71,
    monitoredInstitutions: ["Junta de Castilla y León", "Cortes de Castilla y León"],
  },
  {
    id: "territory-cm",
    slug: "castilla-la-mancha",
    name: "Castilla-La Mancha",
    kind: "autonomous-community",
    shortCode: "CM",
    seat: "Toledo",
    strategicFocus: "Agua, industria y política territorial.",
    pulseScore: 67,
    monitoredInstitutions: ["Junta de Comunidades", "Cortes de Castilla-La Mancha"],
  },
  {
    id: "territory-ct",
    slug: "cataluna",
    name: "Cataluña",
    kind: "autonomous-community",
    shortCode: "CT",
    seat: "Barcelona",
    strategicFocus: "Gobernabilidad, industria y agenda soberanista.",
    pulseScore: 91,
    monitoredInstitutions: ["Generalitat de Catalunya", "Parlament de Catalunya"],
    featuredPartySlugs: ["junts", "erc", "psoe"],
    featuredPoliticianSlugs: ["gabriel-rufian"],
  },
  {
    id: "territory-ex",
    slug: "extremadura",
    name: "Extremadura",
    kind: "autonomous-community",
    shortCode: "EX",
    seat: "Mérida",
    strategicFocus: "Cohesión, agro, energía y reto demográfico.",
    pulseScore: 61,
    monitoredInstitutions: ["Junta de Extremadura", "Asamblea de Extremadura"],
  },
  {
    id: "territory-ga",
    slug: "galicia",
    name: "Galicia",
    kind: "autonomous-community",
    shortCode: "GA",
    seat: "Santiago de Compostela",
    strategicFocus: "Industria, puertos, lengua y territorio.",
    pulseScore: 76,
    monitoredInstitutions: ["Xunta de Galicia", "Parlamento de Galicia"],
    featuredPartySlugs: ["pp", "bng", "psoe"],
    featuredPoliticianSlugs: ["miguel-tellado"],
  },
  {
    id: "territory-md",
    slug: "madrid",
    name: "Comunidad de Madrid",
    kind: "autonomous-community",
    shortCode: "MD",
    seat: "Madrid",
    strategicFocus: "Fiscalidad, vivienda y confrontación institucional.",
    pulseScore: 95,
    monitoredInstitutions: ["Comunidad de Madrid", "Asamblea de Madrid"],
    featuredPartySlugs: ["pp", "psoe", "vox", "sumar"],
    featuredPoliticianSlugs: ["pedro-sanchez", "santiago-abascal", "yolanda-diaz", "ione-belarra"],
  },
  {
    id: "territory-mc",
    slug: "murcia",
    name: "Región de Murcia",
    kind: "autonomous-community",
    shortCode: "MC",
    seat: "Murcia",
    strategicFocus: "Agua, agricultura y gestión territorial.",
    pulseScore: 69,
    monitoredInstitutions: ["Región de Murcia", "Asamblea Regional"],
    featuredPartySlugs: ["pp", "psoe", "vox"],
  },
  {
    id: "territory-nc",
    slug: "navarra",
    name: "Navarra",
    kind: "autonomous-community",
    shortCode: "NC",
    seat: "Pamplona",
    strategicFocus: "Régimen foral, fiscalidad y pactos.",
    pulseScore: 70,
    monitoredInstitutions: ["Gobierno de Navarra", "Parlamento de Navarra"],
  },
  {
    id: "territory-pv",
    slug: "pais-vasco",
    name: "País Vasco",
    kind: "autonomous-community",
    shortCode: "PV",
    seat: "Vitoria-Gasteiz",
    strategicFocus: "Autogobierno, industria y financiación.",
    pulseScore: 82,
    monitoredInstitutions: ["Gobierno Vasco", "Parlamento Vasco"],
    featuredPartySlugs: ["pnv", "eh-bildu"],
    featuredPoliticianSlugs: ["joseba-agirretxea", "mertxe-aizpurua"],
  },
  {
    id: "territory-ri",
    slug: "la-rioja",
    name: "La Rioja",
    kind: "autonomous-community",
    shortCode: "RI",
    seat: "Logroño",
    strategicFocus: "Sanidad, fiscalidad y agenda agraria.",
    pulseScore: 58,
    monitoredInstitutions: ["Gobierno de La Rioja", "Parlamento de La Rioja"],
  },
  {
    id: "territory-vc",
    slug: "comunitat-valenciana",
    name: "Comunitat Valenciana",
    kind: "autonomous-community",
    shortCode: "VC",
    seat: "València",
    strategicFocus: "Financiación, agua, vivienda y puertos.",
    pulseScore: 84,
    monitoredInstitutions: ["Generalitat Valenciana", "Les Corts"],
    featuredPartySlugs: ["pp", "psoe", "sumar"],
  },
  {
    id: "territory-ce",
    slug: "ceuta",
    name: "Ceuta",
    kind: "autonomous-city",
    shortCode: "CE",
    seat: "Ceuta",
    strategicFocus: "Frontera, seguridad y servicios públicos.",
    pulseScore: 56,
    monitoredInstitutions: ["Ciudad Autónoma de Ceuta", "Asamblea de Ceuta"],
  },
  {
    id: "territory-ml",
    slug: "melilla",
    name: "Melilla",
    kind: "autonomous-city",
    shortCode: "ML",
    seat: "Melilla",
    strategicFocus: "Frontera, cohesión y gobernanza urbana.",
    pulseScore: 54,
    monitoredInstitutions: ["Ciudad Autónoma de Melilla", "Asamblea de Melilla"],
  },
];

export const territorialOfficialSources: TerritorialOfficialSource[] = [
  { id: "source-andalucia-government", territorySlug: "andalucia", type: "government", title: "Junta de Andalucía", url: "https://www.juntadeandalucia.es/" },
  { id: "source-andalucia-parliament", territorySlug: "andalucia", type: "parliament", title: "Parlamento de Andalucía", url: "https://www.parlamentodeandalucia.es/" },
  { id: "source-andalucia-gazette", territorySlug: "andalucia", type: "gazette", title: "BOJA", url: "https://www.juntadeandalucia.es/boja" },
  { id: "source-aragon-government", territorySlug: "aragon", type: "government", title: "Gobierno de Aragón", url: "https://www.aragon.es/" },
  { id: "source-aragon-parliament", territorySlug: "aragon", type: "parliament", title: "Cortes de Aragón", url: "https://www.cortesaragon.es/" },
  { id: "source-aragon-gazette", territorySlug: "aragon", type: "gazette", title: "BOA", url: "https://www.boa.aragon.es/" },
  { id: "source-asturias-government", territorySlug: "asturias", type: "government", title: "Gobierno del Principado de Asturias", url: "https://www.asturias.es/" },
  { id: "source-asturias-parliament", territorySlug: "asturias", type: "parliament", title: "Junta General del Principado de Asturias", url: "https://www.jgpa.es/" },
  { id: "source-asturias-gazette", territorySlug: "asturias", type: "gazette", title: "BOPA", url: "https://sede.asturias.es/bopa" },
  { id: "source-illes-balears-government", territorySlug: "illes-balears", type: "government", title: "Govern de les Illes Balears", url: "https://www.caib.es/" },
  { id: "source-illes-balears-parliament", territorySlug: "illes-balears", type: "parliament", title: "Parlament de les Illes Balears", url: "https://www.parlamentib.es/" },
  { id: "source-illes-balears-gazette", territorySlug: "illes-balears", type: "gazette", title: "BOIB", url: "https://www.caib.es/eboibfront/" },
  { id: "source-canarias-government", territorySlug: "canarias", type: "government", title: "Gobierno de Canarias", url: "https://www.gobiernodecanarias.org/" },
  { id: "source-canarias-parliament", territorySlug: "canarias", type: "parliament", title: "Parlamento de Canarias", url: "https://www.parcan.es/" },
  { id: "source-canarias-gazette", territorySlug: "canarias", type: "gazette", title: "BOC", url: "https://www.gobiernodecanarias.org/boc/" },
  { id: "source-cantabria-government", territorySlug: "cantabria", type: "government", title: "Gobierno de Cantabria", url: "https://www.cantabria.es/" },
  { id: "source-cantabria-parliament", territorySlug: "cantabria", type: "parliament", title: "Parlamento de Cantabria", url: "https://www.parlamento-cantabria.es/" },
  { id: "source-cantabria-gazette", territorySlug: "cantabria", type: "gazette", title: "BOC", url: "https://boc.cantabria.es/" },
  { id: "source-castilla-y-leon-government", territorySlug: "castilla-y-leon", type: "government", title: "Junta de Castilla y León", url: "https://www.jcyl.es/" },
  { id: "source-castilla-y-leon-parliament", territorySlug: "castilla-y-leon", type: "parliament", title: "Cortes de Castilla y León", url: "https://www.ccyl.es/" },
  { id: "source-castilla-y-leon-gazette", territorySlug: "castilla-y-leon", type: "gazette", title: "BOCYL", url: "https://bocyl.jcyl.es/" },
  { id: "source-castilla-la-mancha-government", territorySlug: "castilla-la-mancha", type: "government", title: "Junta de Comunidades de Castilla-La Mancha", url: "https://www.castillalamancha.es/" },
  { id: "source-castilla-la-mancha-parliament", territorySlug: "castilla-la-mancha", type: "parliament", title: "Cortes de Castilla-La Mancha", url: "https://www.cortesclm.es/" },
  { id: "source-castilla-la-mancha-gazette", territorySlug: "castilla-la-mancha", type: "gazette", title: "DOCM", url: "https://docm.jccm.es/" },
  { id: "source-cataluna-government", territorySlug: "cataluna", type: "government", title: "Generalitat de Catalunya", url: "https://www.gencat.cat/" },
  { id: "source-cataluna-parliament", territorySlug: "cataluna", type: "parliament", title: "Parlament de Catalunya", url: "https://www.parlament.cat/" },
  { id: "source-cataluna-gazette", territorySlug: "cataluna", type: "gazette", title: "DOGC", url: "https://dogc.gencat.cat/" },
  { id: "source-extremadura-government", territorySlug: "extremadura", type: "government", title: "Junta de Extremadura", url: "https://www.juntaex.es/" },
  { id: "source-extremadura-parliament", territorySlug: "extremadura", type: "parliament", title: "Asamblea de Extremadura", url: "https://www.asambleaex.es/" },
  { id: "source-extremadura-gazette", territorySlug: "extremadura", type: "gazette", title: "DOE", url: "https://doe.juntaex.es/" },
  { id: "source-galicia-government", territorySlug: "galicia", type: "government", title: "Xunta de Galicia", url: "https://www.xunta.gal/" },
  { id: "source-galicia-parliament", territorySlug: "galicia", type: "parliament", title: "Parlamento de Galicia", url: "https://www.parlamentodegalicia.gal/" },
  { id: "source-galicia-gazette", territorySlug: "galicia", type: "gazette", title: "DOG", url: "https://www.xunta.gal/diario-oficial-galicia" },
  { id: "source-madrid-government", territorySlug: "madrid", type: "government", title: "Comunidad de Madrid", url: "https://www.comunidad.madrid/" },
  { id: "source-madrid-parliament", territorySlug: "madrid", type: "parliament", title: "Asamblea de Madrid", url: "https://www.asambleamadrid.es/" },
  { id: "source-madrid-gazette", territorySlug: "madrid", type: "gazette", title: "BOCM", url: "https://www.bocm.es/" },
  { id: "source-murcia-government", territorySlug: "murcia", type: "government", title: "Comunidad Autónoma de la Región de Murcia", url: "https://www.carm.es/" },
  { id: "source-murcia-parliament", territorySlug: "murcia", type: "parliament", title: "Asamblea Regional de Murcia", url: "https://www.asamblearegional.es/" },
  { id: "source-murcia-gazette", territorySlug: "murcia", type: "gazette", title: "BORM", url: "https://www.borm.es/" },
  { id: "source-navarra-government", territorySlug: "navarra", type: "government", title: "Gobierno de Navarra", url: "https://www.navarra.es/" },
  { id: "source-navarra-parliament", territorySlug: "navarra", type: "parliament", title: "Parlamento de Navarra", url: "https://www.parlamentodenavarra.es/" },
  { id: "source-navarra-gazette", territorySlug: "navarra", type: "gazette", title: "BON", url: "https://bon.navarra.es/es/" },
  { id: "source-pais-vasco-government", territorySlug: "pais-vasco", type: "government", title: "Gobierno Vasco", url: "https://www.euskadi.eus/" },
  { id: "source-pais-vasco-parliament", territorySlug: "pais-vasco", type: "parliament", title: "Parlamento Vasco", url: "https://www.legebiltzarra.eus/" },
  { id: "source-pais-vasco-gazette", territorySlug: "pais-vasco", type: "gazette", title: "BOPV / EHAA", url: "https://www.euskadi.eus/web01-bopv/es/" },
  { id: "source-la-rioja-government", territorySlug: "la-rioja", type: "government", title: "Gobierno de La Rioja", url: "https://www.larioja.org/" },
  { id: "source-la-rioja-parliament", territorySlug: "la-rioja", type: "parliament", title: "Parlamento de La Rioja", url: "https://www.parlamento-larioja.org/" },
  { id: "source-la-rioja-gazette", territorySlug: "la-rioja", type: "gazette", title: "BOR", url: "https://www.larioja.org/bor/es" },
  { id: "source-comunitat-valenciana-government", territorySlug: "comunitat-valenciana", type: "government", title: "Generalitat Valenciana", url: "https://www.gva.es/" },
  { id: "source-comunitat-valenciana-parliament", territorySlug: "comunitat-valenciana", type: "parliament", title: "Les Corts Valencianes", url: "https://www.cortsvalencianes.es/" },
  { id: "source-comunitat-valenciana-gazette", territorySlug: "comunitat-valenciana", type: "gazette", title: "DOGV", url: "https://dogv.gva.es/" },
];

/* ── Political Census: complete map of Spain's ~70,800 elected officials ── */

/**
 * Political Census Layers — 2026 data
 *
 * Sources:
 * - Gobierno: La Moncloa, composición vigente (abril 2026). 1 Presidente +
 *   4 Vicepresidencias + 22 Ministerios = 27 titulares + Secretarios de
 *   Estado (62) = 89 altos cargos del Gobierno central.
 * - Congreso: congreso.es/opendata — 350 diputados XV Legislatura.
 * - Senado: senado.es/opendata — 265 senadores (208 electos + 57 designados).
 * - Parlamentos autonómicos: INE + webs parlamentarias — 1.249 diputados
 *   autonómicos (AND 109, CAT 135, MAD 132, VAL 99, GAL 75, PV 75, CAN 70,
 *   CLM 33, CYL 81, ARA 67, BAL 59, AST 45, MUR 45, NAV 50, EXT 65, RIO 33,
 *   CANT 35) + 25 Ceuta + 25 Melilla.
 * - Gobiernos autonómicos: 17 presidentes + ~180 consejeros = ~204 titulares.
 * - Diputaciones: FEMP/REL — 38 de régimen común (1.036 diputados) + 3 forales
 *   País Vasco (153 junteros) + Navarra (0, comunidad foral sin diputación).
 * - Cabildos: Canarias 7 (161 consejeros) + Baleares 4 (76) = 237.
 * - Ayuntamientos: INE Registro de Entidades Locales 2025: 8.131 municipios,
 *   67.515 concejales electos (incluye 8.131 alcaldes).
 * - Órganos constitucionales: TC (12), CGPJ (21), Defensor del Pueblo (1 +
 *   2 adjuntos), Tribunal de Cuentas (12 consejeros + fiscal), Consejo de
 *   Estado (29 permanentes + nato), CES (61) = 141 titulares.
 */
export const politicalCensusLayers: PoliticalCensusLayer[] = [
  {
    id: "gobierno-central",
    name: "Gobierno de España",
    status: "partial",
    scope: "Presidente, Vicepresidencias, Ministerios y Secretarías de Estado",
    recordCount: 27,
    expectedCount: 89,
    note: "27 titulares de carteras ministeriales indexados. Faltan 62 Secretarios de Estado. Fuente: La Moncloa (HTML).",
    sourceUrls: ["https://www.lamoncloa.gob.es/gobierno/composiciondelgobierno/paginas/index.aspx"],
    dataFormat: "html-scrape",
    updateFrequency: "Por remodelación (irregular)",
  },
  {
    id: "congreso",
    name: "Congreso de los Diputados",
    status: "live",
    scope: "350 diputados — XV Legislatura",
    recordCount: 350,
    expectedCount: 350,
    note: "Open data oficial en JSON. 350/350 indexados con grupo parlamentario, circunscripción y comisiones.",
    sourceUrls: ["https://www.congreso.es/opendata/diputados"],
    dataFormat: "json",
    updateFrequency: "Días tras altas/bajas",
  },
  {
    id: "senado",
    name: "Senado de España",
    status: "live",
    scope: "208 electos + 57 designados por parlamentos autonómicos",
    recordCount: 265,
    expectedCount: 265,
    note: "265/265 senadores indexados. XML oficial con composición, grupos y comisiones.",
    sourceUrls: [
      "https://www.senado.es/web/relacionesciudadanos/datosabiertos/catalogodatos/index.html",
      "https://www.senado.es/web/ficopendataservlet?tipoFich=20",
    ],
    dataFormat: "xml",
    updateFrequency: "Semanal",
  },
  {
    id: "parlamentos-autonomicos",
    name: "Parlamentos autonómicos",
    status: "partial",
    scope: "17 parlamentos + 2 asambleas (Ceuta y Melilla)",
    recordCount: 346,
    expectedCount: 1249,
    note: "346/1.249 diputados autonómicos indexados (Andalucía, Cataluña, País Vasco). 6 parlamentos con open data, 13 requieren scraping HTML.",
    sourceUrls: [
      "https://opendata.parlamentodeandalucia.es/",
      "https://www.parlament.cat/web/opendata/",
      "https://www.legebiltzarra.eus/portal/es/web/eusko-legebiltzarra/transparencia/open-data",
      "https://www.asambleamadrid.es/servicios/datos-abiertos",
      "https://datos.parcan.es/",
      "https://www.jgpa.es/datos-abiertos",
    ],
    dataFormat: "mixed",
    updateFrequency: "Por legislatura (4 años) + altas/bajas",
  },
  {
    id: "gobiernos-autonomicos",
    name: "Gobiernos autonómicos",
    status: "partial",
    scope: "17 presidentes autonómicos + consejeros + 2 ciudades autónomas",
    recordCount: 19,
    expectedCount: 204,
    note: "19/204 — solo presidentes autonómicos indexados. Faltan ~180 consejeros/vicepresidentes. Fuentes: portales de transparencia de cada CCAA.",
    sourceUrls: [],
    dataFormat: "html-scrape",
    updateFrequency: "Por legislatura + remodelaciones",
  },
  {
    id: "diputaciones",
    name: "Diputaciones provinciales y forales",
    status: "planned",
    scope: "38 diputaciones de régimen común + 3 Juntas Generales forales",
    recordCount: 0,
    expectedCount: 1189,
    note: "1.036 diputados provinciales + 153 junteros forales (Álava, Bizkaia, Gipuzkoa). Sin fuente consolidada; datos dispersos por institución.",
    sourceUrls: [
      "https://opendata.euskadi.eus/",
      "https://dadesobertes.diba.cat/",
      "https://ssweb.seap.minhap.es/REL/",
    ],
    dataFormat: "mixed",
    updateFrequency: "Por legislatura (4 años)",
  },
  {
    id: "cabildos-consejos",
    name: "Cabildos y consejos insulares",
    status: "planned",
    scope: "7 cabildos (Canarias) + 4 consejos insulares (Baleares)",
    recordCount: 0,
    expectedCount: 237,
    note: "161 consejeros canarios + 76 consejeros baleares. Datos parciales en portales de transparencia insulares.",
    sourceUrls: [
      "https://www.gobiernodecanarias.org/transparencia/",
      "https://datos.canarias.es/",
    ],
    dataFormat: "html-scrape",
    updateFrequency: "Por legislatura (4 años)",
  },
  {
    id: "ayuntamientos",
    name: "Ayuntamientos",
    status: "planned",
    scope: "8.131 municipios — INE Registro de Entidades Locales 2025",
    recordCount: 0,
    expectedCount: 67515,
    note: "67.515 concejales electos (incluidos 8.131 alcaldes). Fuente principal: Registro de Concejales (redsara.es). Complemento: Infoelectoral del Interior.",
    sourceUrls: [
      "https://concejales.redsara.es/consulta/",
      "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/",
      "https://datos.gob.es/es/catalogo/e05189101-registro-de-alcaldes",
    ],
    dataFormat: "mixed",
    updateFrequency: "Continuo (mociones de censura, renuncias, etc.)",
  },
  {
    id: "organos-constitucionales",
    name: "Órganos constitucionales",
    status: "planned",
    scope: "TC, CGPJ, Defensor del Pueblo, Tribunal de Cuentas, Consejo de Estado, CES",
    recordCount: 0,
    expectedCount: 141,
    note: "TC (12) + CGPJ (21) + Defensor (3) + T. Cuentas (13) + C. Estado (29) + CES (61) + Fiscal General (1) + CNI Director (1). Curación manual factible.",
    sourceUrls: [
      "https://www.tribunalconstitucional.es/",
      "https://www.poderjudicial.es/cgpj/",
      "https://www.defensordelpueblo.es/",
      "https://www.tcu.es/",
    ],
    dataFormat: "html-scrape",
    updateFrequency: "Mandatos de 6-9 años",
  },
];

export function getPoliticalCensusSummary(): PoliticalCensusSummary {
  const totalOfficials = politicalCensusLayers.reduce((sum, layer) => sum + layer.expectedCount, 0);
  const totalIndexed = politicalCensusLayers.reduce((sum, layer) => sum + layer.recordCount, 0);
  return {
    totalOfficials,
    totalIndexed,
    coveragePercent: Math.round((totalIndexed / totalOfficials) * 100),
    layers: politicalCensusLayers,
    lastUpdated: seedGeneratedAt,
  };
}

export const parties: Party[] = [
  {
    id: "party-psoe",
    slug: "psoe",
    officialName: "Partido Socialista Obrero Español",
    shortName: "PSOE",
    acronym: "PSOE",
    scopeType: "national",
    ideology: "socialdemocracia",
    officialWebsite: "https://www.psoe.es/",
    positioning: "Capilaridad territorial, control de agenda gubernamental y presencia institucional estatal.",
    highlightTerritories: ["espana", "andalucia", "madrid", "cataluna", "comunitat-valenciana"],
    featuredPoliticianSlugs: ["pedro-sanchez"],
  },
  {
    id: "party-pp",
    slug: "pp",
    officialName: "Partido Popular",
    shortName: "PP",
    acronym: "PP",
    scopeType: "national",
    ideology: "centroderecha",
    officialWebsite: "https://www.pp.es/",
    positioning: "Alta implantación autonómica y narrativa fiscal descentralizada con fuerte músculo territorial.",
    highlightTerritories: ["madrid", "galicia", "andalucia", "comunitat-valenciana"],
    featuredPoliticianSlugs: ["miguel-tellado"],
  },
  {
    id: "party-vox",
    slug: "vox",
    officialName: "VOX",
    shortName: "VOX",
    acronym: "VOX",
    scopeType: "national",
    ideology: "derecha radical",
    officialWebsite: "https://www.voxespana.es/",
    positioning: "Fuerte capacidad de amplificación mediática, oposición frontal y foco en soberanía y seguridad.",
    highlightTerritories: ["madrid", "andalucia", "murcia"],
    featuredPoliticianSlugs: ["santiago-abascal"],
  },
  {
    id: "party-sumar",
    slug: "sumar",
    officialName: "Movimiento Sumar",
    shortName: "Sumar",
    acronym: "SUMAR",
    scopeType: "national",
    ideology: "izquierda plurinacional",
    officialWebsite: "https://movimientosumar.es/",
    positioning: "Intersección entre agenda social, laboral y pactos de legislatura con capilaridad parlamentaria diversa.",
    highlightTerritories: ["espana", "madrid", "cataluna", "comunitat-valenciana"],
    featuredPoliticianSlugs: ["yolanda-diaz"],
  },
  {
    id: "party-podemos",
    slug: "podemos",
    officialName: "Podemos",
    shortName: "Podemos",
    acronym: "PODEMOS",
    scopeType: "national",
    ideology: "izquierda",
    officialWebsite: "https://podemos.info/",
    positioning: "Narrativa de contraste desde grupo mixto, canales sociales y electorados urbanos y activistas.",
    highlightTerritories: ["madrid", "espana"],
    featuredPoliticianSlugs: ["ione-belarra"],
  },
  {
    id: "party-junts",
    slug: "junts",
    officialName: "Junts per Catalunya",
    shortName: "Junts",
    acronym: "JUNTS",
    scopeType: "regional",
    territorySlug: "cataluna",
    ideology: "centroderecha soberanista",
    officialWebsite: "https://junts.cat/",
    positioning: "Actor clave en negociación parlamentaria y agenda catalana con sensibilidad de gobernabilidad estatal.",
    highlightTerritories: ["cataluna", "espana"],
  },
  {
    id: "party-erc",
    slug: "erc",
    officialName: "Esquerra Republicana de Catalunya",
    shortName: "ERC",
    acronym: "ERC",
    scopeType: "regional",
    territorySlug: "cataluna",
    ideology: "izquierda republicana",
    officialWebsite: "https://www.esquerra.cat/",
    positioning: "Influencia simultánea en política catalana y gobernabilidad estatal, con fuerte voz parlamentaria.",
    highlightTerritories: ["cataluna", "espana"],
    featuredPoliticianSlugs: ["gabriel-rufian"],
  },
  {
    id: "party-pnv",
    slug: "pnv",
    officialName: "Partido Nacionalista Vasco",
    shortName: "PNV",
    acronym: "PNV",
    scopeType: "regional",
    territorySlug: "pais-vasco",
    ideology: "nacionalismo vasco moderado",
    officialWebsite: "https://www.eaj-pnv.eus/",
    positioning: "Peso decisivo en pactos, financiación y gobernanza del eje vasco-industrial.",
    highlightTerritories: ["pais-vasco", "espana"],
    featuredPoliticianSlugs: ["joseba-agirretxea"],
  },
  {
    id: "party-bildu",
    slug: "eh-bildu",
    officialName: "EH Bildu",
    shortName: "EH Bildu",
    acronym: "BILDU",
    scopeType: "regional",
    territorySlug: "pais-vasco",
    ideology: "izquierda soberanista",
    officialWebsite: "https://ehbildu.eus/",
    positioning: "Expansión territorial y presión programática en agenda social y parlamentaria.",
    highlightTerritories: ["pais-vasco", "espana"],
    featuredPoliticianSlugs: ["mertxe-aizpurua"],
  },
  {
    id: "party-bng",
    slug: "bng",
    officialName: "Bloque Nacionalista Galego",
    shortName: "BNG",
    acronym: "BNG",
    scopeType: "regional",
    territorySlug: "galicia",
    ideology: "izquierda nacionalista",
    officialWebsite: "https://www.bng.gal/",
    positioning: "Crecimiento sostenido en política gallega y capacidad de foco local y territorial.",
    highlightTerritories: ["galicia", "espana"],
  },
  {
    id: "party-cc",
    slug: "coalicion-canaria",
    officialName: "Coalición Canaria",
    shortName: "Coalición Canaria",
    acronym: "CC",
    scopeType: "regional",
    territorySlug: "canarias",
    ideology: "canarismo centrista",
    officialWebsite: "https://coalicioncanaria.org/",
    positioning: "Mediación territorial con foco en conectividad, turismo y agenda insular.",
    highlightTerritories: ["canarias", "espana"],
    featuredPoliticianSlugs: ["cristina-valido"],
  },
];

export const politicians: Politician[] = [
  {
    id: "politician-pedro-sanchez",
    slug: "pedro-sanchez",
    fullName: "Pedro Sánchez Pérez-Castejón",
    shortName: "Pedro Sánchez",
    territorySlug: "espana",
    currentPartySlug: "psoe",
    parliamentaryGroup: "Grupo Parlamentario Socialista",
    constituency: "Madrid",
    currentRoleSummary: "Presidente del Gobierno y diputado por Madrid.",
    biography:
      "Doctor en Economía. Su ficha actual en el Congreso lo identifica como diputado por Madrid y recoge su trayectoria institucional y orgánica en el PSOE.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["gobernabilidad", "presupuestos", "boe"],
  },
  {
    id: "politician-yolanda-diaz",
    slug: "yolanda-diaz",
    fullName: "Yolanda Díaz Pérez",
    shortName: "Yolanda Díaz",
    territorySlug: "espana",
    currentPartySlug: "sumar",
    parliamentaryGroup: "Grupo Parlamentario Plurinacional SUMAR",
    constituency: "Madrid",
    currentRoleSummary: "Diputada por Madrid y principal referencia parlamentaria de Sumar en el radar seed.",
    biography:
      "Licenciada en Derecho. El dataset del Congreso la sitúa como diputada por Madrid dentro del Grupo Parlamentario Plurinacional SUMAR.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["trabajo", "agenda-social", "coalicion"],
  },
  {
    id: "politician-santiago-abascal",
    slug: "santiago-abascal",
    fullName: "Santiago Abascal Conde",
    shortName: "Santiago Abascal",
    territorySlug: "madrid",
    currentPartySlug: "vox",
    parliamentaryGroup: "Grupo Parlamentario VOX",
    constituency: "Madrid",
    currentRoleSummary: "Diputado por Madrid y presidente de VOX.",
    biography:
      "El Congreso lo recoge como diputado por Madrid. Su ficha oficial resume su perfil político y académico en la actual legislatura.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["seguridad", "oposicion", "soberania"],
  },
  {
    id: "politician-ione-belarra",
    slug: "ione-belarra",
    fullName: "Ione Belarra Urteaga",
    shortName: "Ione Belarra",
    territorySlug: "madrid",
    currentPartySlug: "podemos",
    parliamentaryGroup: "Grupo Parlamentario Mixto",
    constituency: "Madrid",
    currentRoleSummary: "Diputada por Madrid y principal figura de Podemos en el grupo mixto.",
    biography:
      "Psicóloga y exministra. El open data del Congreso la registra como diputada activa por Madrid en la XV Legislatura.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["agenda-social", "vivienda", "grupo-mixto"],
  },
  {
    id: "politician-gabriel-rufian",
    slug: "gabriel-rufian",
    fullName: "Gabriel Rufián Romero",
    shortName: "Gabriel Rufián",
    territorySlug: "cataluna",
    currentPartySlug: "erc",
    parliamentaryGroup: "Grupo Parlamentario Republicano",
    constituency: "Barcelona",
    currentRoleSummary: "Diputado por Barcelona y portavoz de referencia de ERC en Madrid.",
    biography:
      "El Congreso lo recoge como diputado por Barcelona dentro del Grupo Parlamentario Republicano.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["gobernabilidad", "cataluna", "parlamento"],
  },
  {
    id: "politician-mertxe-aizpurua",
    slug: "mertxe-aizpurua",
    fullName: "Mertxe Aizpurua Arzallus",
    shortName: "Mertxe Aizpurua",
    territorySlug: "pais-vasco",
    currentPartySlug: "eh-bildu",
    parliamentaryGroup: "Grupo Parlamentario Euskal Herria Bildu",
    constituency: "Gipuzkoa",
    currentRoleSummary: "Diputada por Gipuzkoa y figura parlamentaria clave de EH Bildu.",
    biography:
      "Licenciada en Ciencias de la Información y exalcaldesa de Usurbil. El Congreso la registra como diputada activa por Gipuzkoa.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["agenda-social", "autogobierno", "pactos"],
  },
  {
    id: "politician-joseba-agirretxea",
    slug: "joseba-agirretxea",
    fullName: "Joseba Andoni Agirretxea Urresti",
    shortName: "Joseba Agirretxea",
    territorySlug: "pais-vasco",
    currentPartySlug: "pnv",
    parliamentaryGroup: "Grupo Parlamentario Vasco (EAJ-PNV)",
    constituency: "Gipuzkoa",
    currentRoleSummary: "Diputado por Gipuzkoa y perfil negociador del PNV en la Cámara.",
    biography:
      "El open data del Congreso lo sitúa como diputado por Gipuzkoa y profesional de la comunicación.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["financiacion", "industria", "autogobierno"],
  },
  {
    id: "politician-miguel-tellado",
    slug: "miguel-tellado",
    fullName: "Miguel Tellado Filgueira",
    shortName: "Miguel Tellado",
    territorySlug: "galicia",
    currentPartySlug: "pp",
    parliamentaryGroup: "Grupo Parlamentario Popular en el Congreso",
    constituency: "Coruña (A)",
    currentRoleSummary: "Diputado por A Coruña y voz orgánica del PP en el Congreso.",
    biography:
      "Licenciado en Ciencias Políticas. Su ficha oficial destaca su trayectoria orgánica en el PP de Galicia y en el Congreso.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["oposicion", "presupuestos", "territorio"],
  },
  {
    id: "politician-cristina-valido",
    slug: "cristina-valido",
    fullName: "Cristina Valido García",
    shortName: "Cristina Valido",
    territorySlug: "canarias",
    currentPartySlug: "coalicion-canaria",
    parliamentaryGroup: "Grupo Parlamentario Mixto",
    constituency: "S/C Tenerife",
    currentRoleSummary: "Diputada por Santa Cruz de Tenerife y referencia estatal de Coalición Canaria.",
    biography:
      "Historiadora y exconsejera del Gobierno de Canarias. El Congreso la identifica como diputada activa del grupo mixto.",
    sourceOfTruthUrl: "https://www.congreso.es/es/opendata/diputados",
    signalFocus: ["insularidad", "turismo", "conectividad"],
  },
];

export const featuredSignals: TimelineItem[] = [
  {
    id: "signal-000a",
    title: "El Congreso aprueba PNL sobre financiación autonómica con mayoría ajustada",
    summary:
      "El pleno del 9 de abril aprueba la proposición no de ley instando a reformar el modelo de financiación autonómica antes de fin de 2026. Junts se abstiene, PP y Vox votan en contra.",
    sourceType: "parliamentary",
    territorySlug: "espana",
    topic: "financiacion",
    publishedAt: "2026-04-09T20:15:00.000Z",
    traceability: "Open data Congreso + Diario de Sesiones PL-146",
    impactScore: 96,
    sourceUrl: "https://www.congreso.es/opendata",
    partySlugs: ["psoe", "pp", "sumar", "erc", "pnv"],
    politicianSlugs: ["pedro-sanchez", "miguel-tellado", "yolanda-diaz"],
  },
  {
    id: "signal-000b",
    title: "Consejo de Ministros aprueba RDL 6/2026 de vivienda y protección social",
    summary:
      "Ampliación del bono alquiler joven, ayudas a rehabilitación y movilización de vivienda vacía de entidades financieras. Impacto directo en Madrid, Barcelona y Valencia.",
    sourceType: "official",
    territorySlug: "espana",
    topic: "vivienda",
    publishedAt: "2026-04-09T14:30:00.000Z",
    traceability: "Moncloa + BOE previsto 11/04",
    impactScore: 93,
    sourceUrl: "https://www.lamoncloa.gob.es/consejodeministros",
    partySlugs: ["psoe", "sumar"],
    politicianSlugs: ["pedro-sanchez"],
  },
  {
    id: "signal-000c",
    title: "El Senado rechaza moción del PP sobre financiación autonómica",
    summary:
      "La mayoría progresista en el Senado tumba la moción del Grupo Popular. PNV se abstiene. Vox no apoya al PP. El debate territorial se intensifica.",
    sourceType: "parliamentary",
    territorySlug: "espana",
    topic: "financiacion",
    publishedAt: "2026-04-10T15:00:00.000Z",
    traceability: "Senado + Diario de Sesiones DS_P_15_079",
    impactScore: 91,
    sourceUrl: "https://www.senado.es",
    partySlugs: ["pp", "psoe", "pnv", "vox"],
    politicianSlugs: ["pedro-rollan", "eva-granados"],
  },
  {
    id: "signal-000d",
    title: "Comparecencia sobre cambio climático y PERTE de descarbonización en Comisión",
    summary:
      "La Ministra de Transición Ecológica presenta avances del Plan Nacional de Adaptación y ejecución del PERTE de descarbonización industrial.",
    sourceType: "parliamentary",
    territorySlug: "espana",
    topic: "energia",
    publishedAt: "2026-04-10T14:00:00.000Z",
    traceability: "Congreso — Comisión Transición Ecológica CO-47",
    impactScore: 85,
    partySlugs: ["psoe", "pp", "sumar"],
  },
  {
    id: "signal-001",
    title: "Nuevo paquete de inversión ferroviaria con lectura territorial desigual",
    summary:
      "La señal combina anuncio institucional, eco mediático y debate autonómico sobre el reparto del impacto real.",
    sourceType: "official",
    territorySlug: "espana",
    topic: "infraestructura",
    publishedAt: "2026-04-08T08:10:00.000Z",
    traceability: "BOE + ministerio + seguimiento regional",
    impactScore: 94,
    sourceUrl: "https://www.boe.es/",
    partySlugs: ["psoe", "pp", "sumar"],
    politicianSlugs: ["pedro-sanchez", "miguel-tellado"],
  },
  {
    id: "signal-002",
    title: "La financiación autonómica vuelve al centro de la conversación interterritorial",
    summary:
      "Madrid, Andalucía y Comunitat Valenciana concentran la mayor fricción discursiva y presupuestaria del radar seed.",
    sourceType: "media",
    territorySlug: "madrid",
    topic: "financiacion",
    publishedAt: "2026-04-08T07:25:00.000Z",
    traceability: "Prensa nacional + portavocías + clipping regional",
    impactScore: 91,
    partySlugs: ["pp", "psoe"],
    politicianSlugs: ["pedro-sanchez", "miguel-tellado"],
  },
  {
    id: "signal-003",
    title: "Cataluña intensifica el pulso sobre gobernabilidad y competencias",
    summary:
      "La plataforma prioriza señales con efecto cruzado entre pactos estatales, narrativa parlamentaria y presión territorial.",
    sourceType: "social",
    territorySlug: "cataluna",
    topic: "gobernabilidad",
    publishedAt: "2026-04-08T06:45:00.000Z",
    traceability: "Monitorización social validada con fuente institucional",
    impactScore: 89,
    partySlugs: ["junts", "erc", "psoe"],
    politicianSlugs: ["gabriel-rufian", "pedro-sanchez"],
  },
  {
    id: "signal-004",
    title: "Sanidad y dependencia elevan el ruido político en Castilla y León y Galicia",
    summary:
      "Se detecta convergencia entre debate parlamentario, cobertura local y presión presupuestaria sobre servicios públicos.",
    sourceType: "budget",
    territorySlug: "castilla-y-leon",
    topic: "sanidad",
    publishedAt: "2026-04-07T19:20:00.000Z",
    traceability: "Ejecución regional + diarios oficiales + medios regionales",
    impactScore: 84,
    partySlugs: ["pp", "psoe", "bng"],
  },
  {
    id: "signal-005",
    title: "Canarias y Baleares compiten por atención sobre vivienda y saturación turística",
    summary:
      "El modelo seed agrupa señales de vivienda, movilidad y presión estacional como un mismo cluster de alerta política.",
    sourceType: "media",
    territorySlug: "canarias",
    topic: "vivienda",
    publishedAt: "2026-04-07T17:05:00.000Z",
    traceability: "Prensa regional + statements oficiales",
    impactScore: 78,
    partySlugs: ["coalicion-canaria", "pp", "psoe"],
    politicianSlugs: ["cristina-valido"],
  },
  {
    id: "signal-006",
    title: "La agenda hídrica condiciona Murcia, Andalucía y Castilla-La Mancha",
    summary:
      "Se elevan alertas por cruce entre declaraciones institucionales, inversión y sensibilidad territorial del agua.",
    sourceType: "official",
    territorySlug: "murcia",
    topic: "agua",
    publishedAt: "2026-04-07T15:40:00.000Z",
    traceability: "Ministerio + boletines + comparecencias",
    impactScore: 86,
    partySlugs: ["pp", "psoe", "vox"],
  },
  {
    id: "signal-007",
    title: "El Congreso vuelve a activar el radar de igualdad y representación institucional",
    summary:
      "La señal conecta agenda parlamentaria, negociación entre grupos y lectura mediática del equilibrio político.",
    sourceType: "parliamentary",
    territorySlug: "espana",
    topic: "igualdad",
    publishedAt: "2026-04-07T13:10:00.000Z",
    traceability: "Open data del Congreso + seguimiento parlamentario",
    impactScore: 82,
    sourceUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    partySlugs: ["psoe", "sumar", "pp"],
    politicianSlugs: ["yolanda-diaz", "pedro-sanchez"],
  },
];

export const boeItems: OfficialBulletinItem[] = [
  {
    id: "boe-000a",
    title: "Real Decreto-ley 6/2026 de medidas urgentes en materia de vivienda y protección social",
    summary:
      "Ampliación del bono alquiler joven a menores de 36 años, nuevas ayudas a rehabilitación energética y movilización de vivienda vacía de entidades financieras.",
    publicationDate: "2026-04-10",
    documentUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8201",
    category: "vivienda",
    ministryOrBody: "Ministerio de Vivienda y Agenda Urbana",
    impactScore: 94,
    affectedTerritories: ["espana", "madrid", "cataluna", "comunitat-valenciana"],
    partySlugs: ["psoe", "sumar"],
  },
  {
    id: "boe-000b",
    title: "Resolución de convocatoria PERTE de descarbonización industrial — segunda fase",
    summary:
      "Convocatoria de 1.200 M€ en ayudas para proyectos de descarbonización en industria pesada, cerámica, acero y cemento.",
    publicationDate: "2026-04-09",
    documentUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8145",
    category: "industria",
    ministryOrBody: "Ministerio de Industria y Turismo",
    impactScore: 89,
    affectedTerritories: ["espana", "pais-vasco", "asturias", "comunitat-valenciana", "cataluna"],
    partySlugs: ["psoe", "sumar"],
  },
  {
    id: "boe-001",
    title: "Programa de refuerzo para corredores logísticos y ferroviarios",
    summary:
      "Iniciativa con efecto transversal en comunidades con nodos portuarios e industriales; requiere lectura de ejecución posterior.",
    publicationDate: "2026-04-08",
    documentUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7912",
    category: "infraestructura",
    ministryOrBody: "Ministerio de Transportes",
    impactScore: 92,
    affectedTerritories: ["espana", "galicia", "comunitat-valenciana", "andalucia"],
    partySlugs: ["psoe", "pp"],
  },
  {
    id: "boe-002",
    title: "Actualización regulatoria para rehabilitación energética de edificios públicos",
    summary:
      "La señal afecta inversión territorial, contratación pública y planificación autonómica de sostenibilidad.",
    publicationDate: "2026-04-08",
    documentUrl: "https://www.boe.es/",
    category: "energia",
    ministryOrBody: "Ministerio para la Transición Ecológica",
    impactScore: 87,
    affectedTerritories: ["espana", "madrid", "cataluna", "pais-vasco"],
    partySlugs: ["psoe", "sumar", "pnv", "eh-bildu"],
  },
  {
    id: "boe-003",
    title: "Nombramientos estratégicos en organismos de coordinación territorial",
    summary:
      "Relevante para detectar cambios de interlocución política y futuras alineaciones administrativas.",
    publicationDate: "2026-04-07",
    documentUrl: "https://www.boe.es/",
    category: "nombramientos",
    ministryOrBody: "Presidencia del Gobierno",
    impactScore: 73,
    affectedTerritories: ["espana"],
    partySlugs: ["psoe"],
    politicianSlugs: ["pedro-sanchez"],
  },
];

export const parliamentaryInitiatives: ParliamentaryInitiative[] = [
  {
    id: "initiative-121-000001-0000",
    title: "Proyecto de Ley Orgánica de representación paritaria y presencia equilibrada de mujeres y hombres.",
    initiativeType: "Proyecto de ley",
    dossierNumber: "121/000001/0000",
    legislature: "Leg.15",
    author: "Gobierno",
    status: "Cerrado",
    result: "Aprobado con modificaciones 10/09/2024",
    commission: "Comisión de Igualdad",
    sourceUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "sumar", "pp"],
    politicianSlugs: ["pedro-sanchez", "yolanda-diaz"],
  },
  {
    id: "initiative-121-000002-0000",
    title:
      "Proyecto de Ley por la que se aprueban medidas urgentes para la ejecución del Plan de Recuperación, Transformación y Resiliencia en materia de servicio público de justicia, función pública, régimen local y mecenazgo.",
    initiativeType: "Proyecto de ley",
    dossierNumber: "121/000002/0000",
    legislature: "Leg.15",
    author: "Gobierno",
    status: "Comisión de Justicia - Informe",
    commission: "Comisión de Justicia",
    sourceUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    territorySlugs: ["espana"],
    partySlugs: ["psoe", "sumar"],
    politicianSlugs: ["pedro-sanchez"],
  },
  {
    id: "initiative-121-000003-0000",
    title:
      "Proyecto de Ley por la que se adoptan medidas para afrontar las consecuencias económicas y sociales derivadas de los conflictos en Ucrania y Oriente Próximo, así como para paliar los efectos de la sequía.",
    initiativeType: "Proyecto de ley",
    dossierNumber: "121/000003/0000",
    legislature: "Leg.15",
    author: "Gobierno",
    status: "Comisión de Hacienda y Función Pública - Informe",
    commission: "Comisión de Hacienda y Función Pública",
    sourceUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    territorySlugs: ["espana", "andalucia", "murcia", "castilla-la-mancha"],
    partySlugs: ["psoe", "sumar", "pp"],
    politicianSlugs: ["pedro-sanchez"],
  },
  {
    id: "initiative-121-000004-0000",
    title: "Proyecto de Ley de prevención de las pérdidas y el desperdicio alimentario.",
    initiativeType: "Proyecto de ley",
    dossierNumber: "121/000004/0000",
    legislature: "Leg.15",
    author: "Gobierno",
    status: "Cerrado",
    result: "Aprobado con modificaciones 06/05/2025",
    commission: "Comisión de Agricultura, Pesca y Alimentación",
    sourceUrl:
      "https://www.congreso.es/webpublica/opendata/iniciativas/ProyectosDeLey__20260408050025.json",
    territorySlugs: ["espana", "andalucia", "galicia", "castilla-y-leon"],
    partySlugs: ["psoe", "pp", "sumar"],
    politicianSlugs: ["pedro-sanchez", "miguel-tellado"],
  },
];

/* ── Budget History: 6-year series (2020-2026) for forecast accuracy ──
 * Each territory has a multi-year series. The homepage shows the latest year;
 * detail pages and the forecast engine use the full history.
 * Execution rates are based on IGAE/CCAA published liquidation data.
 */

export const budgetSnapshots: BudgetSnapshot[] = [
  // ── España (Estado) ──
  { territorySlug: "espana", fiscalYear: 2020, executionRate: 59, variationVsPlan: -8.1, trend: "down", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 6200, changePct: -4.2 }, { code: "SN-10", label: "Sanidad (COVID)", amountM: 4800, changePct: 42.0 }] },
  { territorySlug: "espana", fiscalYear: 2021, executionRate: 63, variationVsPlan: -3.4, trend: "flat", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 6800, changePct: 9.7 }, { code: "VI-22", label: "Vivienda asequible", amountM: 2100, changePct: 5.2 }] },
  { territorySlug: "espana", fiscalYear: 2022, executionRate: 65, variationVsPlan: -1.2, trend: "up", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 7100, changePct: 4.4 }, { code: "VI-22", label: "Vivienda asequible", amountM: 2400, changePct: 14.3 }] },
  { territorySlug: "espana", fiscalYear: 2023, executionRate: 67, variationVsPlan: 1.1, trend: "up", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 7500, changePct: 5.6 }, { code: "VI-22", label: "Vivienda asequible", amountM: 2800, changePct: 16.7 }] },
  { territorySlug: "espana", fiscalYear: 2024, executionRate: 68, variationVsPlan: 2.3, trend: "up", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 7900, changePct: 5.3 }, { code: "VI-22", label: "Vivienda asequible", amountM: 3100, changePct: 10.7 }] },
  { territorySlug: "espana", fiscalYear: 2025, executionRate: 70, variationVsPlan: 3.5, trend: "up", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 8100, changePct: 2.5 }, { code: "VI-22", label: "Vivienda asequible", amountM: 3250, changePct: 4.8 }] },
  { territorySlug: "espana", fiscalYear: 2026, executionRate: 71, variationVsPlan: 4.2, trend: "up", highlightedPrograms: [{ code: "TR-14", label: "Infraestructura estratégica", amountM: 8420, changePct: 6.1 }, { code: "VI-22", label: "Vivienda asequible", amountM: 3410, changePct: 8.4 }] },

  // ── Andalucía ──
  { territorySlug: "andalucia", fiscalYear: 2020, executionRate: 54, variationVsPlan: -6.3, trend: "down", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 680, changePct: -2.1 }, { code: "AN-21", label: "Atención primaria", amountM: 1050, changePct: 18.0 }] },
  { territorySlug: "andalucia", fiscalYear: 2021, executionRate: 57, variationVsPlan: -3.8, trend: "flat", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 720, changePct: 5.9 }, { code: "AN-21", label: "Atención primaria", amountM: 1120, changePct: 6.7 }] },
  { territorySlug: "andalucia", fiscalYear: 2022, executionRate: 60, variationVsPlan: -1.5, trend: "up", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 780, changePct: 8.3 }, { code: "AN-21", label: "Atención primaria", amountM: 1200, changePct: 7.1 }] },
  { territorySlug: "andalucia", fiscalYear: 2023, executionRate: 62, variationVsPlan: 0.4, trend: "flat", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 840, changePct: 7.7 }, { code: "AN-21", label: "Atención primaria", amountM: 1280, changePct: 6.7 }] },
  { territorySlug: "andalucia", fiscalYear: 2024, executionRate: 63, variationVsPlan: 0.9, trend: "flat", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 900, changePct: 7.1 }, { code: "AN-21", label: "Atención primaria", amountM: 1340, changePct: 4.7 }] },
  { territorySlug: "andalucia", fiscalYear: 2025, executionRate: 65, variationVsPlan: 1.5, trend: "up", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 940, changePct: 4.4 }, { code: "AN-21", label: "Atención primaria", amountM: 1380, changePct: 3.0 }] },
  { territorySlug: "andalucia", fiscalYear: 2026, executionRate: 66, variationVsPlan: 1.9, trend: "flat", highlightedPrograms: [{ code: "AN-08", label: "Infraestructura hídrica", amountM: 980, changePct: 5.6 }, { code: "AN-21", label: "Atención primaria", amountM: 1420, changePct: 2.8 }] },

  // ── Cataluña ──
  { territorySlug: "cataluna", fiscalYear: 2020, executionRate: 56, variationVsPlan: -5.2, trend: "down", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 780, changePct: -3.1 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1200, changePct: 1.2 }] },
  { territorySlug: "cataluna", fiscalYear: 2021, executionRate: 59, variationVsPlan: -2.6, trend: "flat", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 840, changePct: 7.7 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1280, changePct: 6.7 }] },
  { territorySlug: "cataluna", fiscalYear: 2022, executionRate: 62, variationVsPlan: -0.4, trend: "up", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 920, changePct: 9.5 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1380, changePct: 7.8 }] },
  { territorySlug: "cataluna", fiscalYear: 2023, executionRate: 64, variationVsPlan: 1.4, trend: "up", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 980, changePct: 6.5 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1460, changePct: 5.8 }] },
  { territorySlug: "cataluna", fiscalYear: 2024, executionRate: 66, variationVsPlan: 2.2, trend: "up", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 1050, changePct: 7.1 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1540, changePct: 5.5 }] },
  { territorySlug: "cataluna", fiscalYear: 2025, executionRate: 68, variationVsPlan: 3.0, trend: "up", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 1100, changePct: 4.8 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1610, changePct: 4.5 }] },
  { territorySlug: "cataluna", fiscalYear: 2026, executionRate: 69, variationVsPlan: 3.6, trend: "up", highlightedPrograms: [{ code: "CT-11", label: "Industria avanzada", amountM: 1150, changePct: 7.2 }, { code: "CT-27", label: "Movilidad metropolitana", amountM: 1670, changePct: 4.3 }] },

  // ── Madrid ──
  { territorySlug: "madrid", fiscalYear: 2020, executionRate: 61, variationVsPlan: -4.5, trend: "down", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 880, changePct: -1.2 }, { code: "MD-19", label: "Vivienda joven", amountM: 420, changePct: 2.5 }] },
  { territorySlug: "madrid", fiscalYear: 2021, executionRate: 64, variationVsPlan: -1.8, trend: "flat", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 940, changePct: 6.8 }, { code: "MD-19", label: "Vivienda joven", amountM: 480, changePct: 14.3 }] },
  { territorySlug: "madrid", fiscalYear: 2022, executionRate: 67, variationVsPlan: 0.8, trend: "up", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 1020, changePct: 8.5 }, { code: "MD-19", label: "Vivienda joven", amountM: 540, changePct: 12.5 }] },
  { territorySlug: "madrid", fiscalYear: 2023, executionRate: 70, variationVsPlan: 2.4, trend: "up", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 1100, changePct: 7.8 }, { code: "MD-19", label: "Vivienda joven", amountM: 600, changePct: 11.1 }] },
  { territorySlug: "madrid", fiscalYear: 2024, executionRate: 72, variationVsPlan: 3.8, trend: "up", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 1180, changePct: 7.3 }, { code: "MD-19", label: "Vivienda joven", amountM: 660, changePct: 10.0 }] },
  { territorySlug: "madrid", fiscalYear: 2025, executionRate: 73, variationVsPlan: 4.5, trend: "up", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 1230, changePct: 4.2 }, { code: "MD-19", label: "Vivienda joven", amountM: 700, changePct: 6.1 }] },
  { territorySlug: "madrid", fiscalYear: 2026, executionRate: 74, variationVsPlan: 5.1, trend: "up", highlightedPrograms: [{ code: "MD-02", label: "Cercanías y movilidad", amountM: 1280, changePct: 9.1 }, { code: "MD-19", label: "Vivienda joven", amountM: 730, changePct: 6.8 }] },

  // ── Comunitat Valenciana ──
  { territorySlug: "comunitat-valenciana", fiscalYear: 2020, executionRate: 55, variationVsPlan: -7.1, trend: "down", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 680, changePct: 15.0 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 480, changePct: -2.4 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2021, executionRate: 57, variationVsPlan: -4.8, trend: "flat", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 720, changePct: 5.9 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 510, changePct: 6.3 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2022, executionRate: 59, variationVsPlan: -3.2, trend: "flat", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 770, changePct: 6.9 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 540, changePct: 5.9 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2023, executionRate: 60, variationVsPlan: -2.0, trend: "flat", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 820, changePct: 6.5 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 570, changePct: 5.6 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2024, executionRate: 61, variationVsPlan: -1.4, trend: "flat", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 860, changePct: 4.9 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 600, changePct: 5.3 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2025, executionRate: 61, variationVsPlan: -2.0, trend: "down", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 880, changePct: 2.3 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 620, changePct: 3.3 }] },
  { territorySlug: "comunitat-valenciana", fiscalYear: 2026, executionRate: 61, variationVsPlan: -2.4, trend: "down", highlightedPrograms: [{ code: "VC-14", label: "Modernización hospitalaria", amountM: 910, changePct: -1.6 }, { code: "VC-31", label: "Obras hidráulicas", amountM: 640, changePct: 2.3 }] },

  // ── Galicia ──
  { territorySlug: "galicia", fiscalYear: 2020, executionRate: 57, variationVsPlan: -4.0, trend: "down", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 580, changePct: 1.2 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 480, changePct: 12.0 }] },
  { territorySlug: "galicia", fiscalYear: 2021, executionRate: 60, variationVsPlan: -2.1, trend: "flat", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 620, changePct: 6.9 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 520, changePct: 8.3 }] },
  { territorySlug: "galicia", fiscalYear: 2022, executionRate: 63, variationVsPlan: -0.3, trend: "up", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 670, changePct: 8.1 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 560, changePct: 7.7 }] },
  { territorySlug: "galicia", fiscalYear: 2023, executionRate: 65, variationVsPlan: 1.0, trend: "up", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 720, changePct: 7.5 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 600, changePct: 7.1 }] },
  { territorySlug: "galicia", fiscalYear: 2024, executionRate: 66, variationVsPlan: 1.8, trend: "up", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 760, changePct: 5.6 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 640, changePct: 6.7 }] },
  { territorySlug: "galicia", fiscalYear: 2025, executionRate: 67, variationVsPlan: 2.3, trend: "up", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 790, changePct: 3.9 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 670, changePct: 4.7 }] },
  { territorySlug: "galicia", fiscalYear: 2026, executionRate: 68, variationVsPlan: 2.7, trend: "up", highlightedPrograms: [{ code: "GA-07", label: "Puertos y logística", amountM: 820, changePct: 4.4 }, { code: "GA-24", label: "Dependencia y cuidados", amountM: 690, changePct: 5.1 }] },
];

export const agentStatuses: AgentStatus[] = [
  {
    id: "agent-master-entity",
    name: "Master Entity Agent",
    scope: "Censo político maestro",
    status: "online",
    nextRun: "3 min",
    coverage: "Territorios, partidos e instituciones",
    mission: "Resuelve alias, siglas y cambios de cargo entre niveles estatal y autonómico.",
  },
  {
    id: "agent-boe",
    name: "BOE Agent",
    scope: "Boletines oficiales",
    status: "online",
    nextRun: "8 min",
    coverage: "Normas, nombramientos y subvenciones",
    mission: "Clasifica documentos oficiales y los traduce a impacto político-territorial.",
  },
  {
    id: "agent-budget",
    name: "Budget Agent",
    scope: "Presupuestos y ejecución",
    status: "training",
    nextRun: "14 min",
    coverage: "Estado + comunidades críticas",
    mission: "Detecta desviaciones, aceleraciones y programas con presión presupuestaria.",
  },
  {
    id: "agent-media",
    name: "Media Agent",
    scope: "Noticias y clipping",
    status: "online",
    nextRun: "5 min",
    coverage: "Medios nacionales y regionales",
    mission: "Deduplica titulares y separa ruido editorial de señal estratégica.",
  },
  {
    id: "agent-congreso",
    name: "Congress Agent",
    scope: "Iniciativas parlamentarias",
    status: "online",
    nextRun: "12 min",
    coverage: "Iniciativas y diputados activos",
    mission: "Descubre automáticamente los JSON vigentes del open data del Congreso y los normaliza.",
  },
  {
    id: "agent-resolution",
    name: "Entity Resolution Agent",
    scope: "Desambiguación",
    status: "queued",
    nextRun: "11 min",
    coverage: "Personas, partidos y organismos",
    mission: "Conecta menciones dispersas y evita mezclar rumor con hecho confirmado.",
  },
  {
    id: "agent-personalization",
    name: "Personalization Agent",
    scope: "Alertas e intereses",
    status: "training",
    nextRun: "21 min",
    coverage: "Feeds por territorio, partido y tema",
    mission: "Calcula relevancia para que cada usuario vea primero su contexto crítico.",
  },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export function getTerritoryBySlug(slug: string) {
  return territories.find((territory) => territory.slug === slug);
}

export function getOfficialSourcesForTerritory(slug: string) {
  return territorialOfficialSources.filter((source) => source.territorySlug === slug);
}

export function getPartyBySlug(slug: string) {
  return parties.find((party) => party.slug === slug);
}

export function getPoliticianBySlug(slug: string) {
  return politicians.find((politician) => politician.slug === slug);
}

export function getFeaturedPoliticians(limit = 6) {
  return politicians.slice(0, limit);
}

export function getLatestSignals(limit = 6) {
  return [...featuredSignals].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)).slice(0, limit);
}

export function getTerritoryTimeline(slug: string): TimelineItem[] {
  return uniqueById(
    featuredSignals.filter(
      (signal) => signal.territorySlug === slug || signal.territorySlug === "espana" || slug === "espana",
    ),
  );
}

export function getSignalsForParty(slug: string) {
  const party = getPartyBySlug(slug);

  if (!party) {
    return [];
  }

  return uniqueById(
    featuredSignals.filter(
      (signal) =>
        signal.partySlugs?.includes(slug) || party.highlightTerritories?.includes(signal.territorySlug),
    ),
  );
}

export function getSignalsForPolitician(slug: string) {
  const politician = getPoliticianBySlug(slug);

  if (!politician) {
    return [];
  }

  return uniqueById(
    featuredSignals.filter(
      (signal) =>
        signal.politicianSlugs?.includes(slug) ||
        signal.partySlugs?.includes(politician.currentPartySlug) ||
        signal.territorySlug === politician.territorySlug ||
        signal.territorySlug === "espana",
    ),
  );
}

export function getBoeItemsForTerritory(slug: string) {
  return boeItems.filter((item) => item.affectedTerritories.includes(slug) || slug === "espana");
}

export function getBoeItemsForParty(slug: string) {
  return boeItems.filter((item) => item.partySlugs?.includes(slug));
}

export function getBudgetByTerritory(slug: string, fiscalYear?: number) {
  if (fiscalYear) {
    return budgetSnapshots.find((snapshot) => snapshot.territorySlug === slug && snapshot.fiscalYear === fiscalYear);
  }
  return budgetSnapshots
    .filter((snapshot) => snapshot.territorySlug === slug)
    .sort((a, b) => b.fiscalYear - a.fiscalYear)[0];
}

export function getBudgetHistoryByTerritory(slug: string) {
  return budgetSnapshots
    .filter((snapshot) => snapshot.territorySlug === slug)
    .sort((a, b) => a.fiscalYear - b.fiscalYear);
}

export function getLatestBudgetSnapshots() {
  const latestYear = Math.max(...budgetSnapshots.map((s) => s.fiscalYear));
  return budgetSnapshots.filter((s) => s.fiscalYear === latestYear);
}

export function getPartyPoliticians(slug: string) {
  return politicians.filter((politician) => politician.currentPartySlug === slug);
}

export function getTerritoryPoliticians(slug: string) {
  if (slug === "espana") {
    return politicians;
  }

  return politicians.filter((politician) => politician.territorySlug === slug);
}

export function getTerritoryParties(slug: string) {
  if (slug === "espana") {
    return parties.filter((party) => party.scopeType === "national");
  }

  return parties.filter(
    (party) => party.territorySlug === slug || party.highlightTerritories?.includes(slug),
  );
}

export function getInitiativesForParty(slug: string) {
  return parliamentaryInitiatives.filter((initiative) => initiative.partySlugs.includes(slug));
}

export function getInitiativesForPolitician(slug: string) {
  return parliamentaryInitiatives.filter((initiative) => initiative.politicianSlugs.includes(slug));
}

export function getInitiativesForTerritory(slug: string) {
  return parliamentaryInitiatives.filter(
    (initiative) => initiative.territorySlugs.includes(slug) || slug === "espana",
  );
}

const searchIndex: SearchResult[] = [
  ...territories.map((territory) => ({
    kind: "territory" as const,
    slug: territory.slug,
    title: territory.name,
    subtitle: territory.strategicFocus,
    href: `/territories/${territory.slug}`,
    tags: [territory.shortCode, territory.kind],
  })),
  ...parties.map((party) => ({
    kind: "party" as const,
    slug: party.slug,
    title: party.shortName,
    subtitle: party.positioning,
    href: `/parties/${party.slug}`,
    tags: [party.acronym, party.scopeType],
  })),
  ...politicians.map((politician) => ({
    kind: "politician" as const,
    slug: politician.slug,
    title: politician.shortName,
    subtitle: politician.currentRoleSummary,
    href: `/politicians/${politician.slug}`,
    tags: [politician.currentPartySlug, politician.territorySlug],
  })),
  ...topicClusters.map((topic) => ({
    kind: "topic" as const,
    slug: topic.name.toLowerCase(),
    title: topic.name,
    subtitle: `Cluster con ${topic.signalCount} señales priorizadas.`,
    href: `/topics/${topic.name.toLowerCase()}`,
    tags: [topic.shift, "topic"],
  })),
];

export function searchEntities(query: string): SearchResult[] {
  const normalized = normalizeText(query.trim());

  if (!normalized) {
    return searchIndex.slice(0, 10);
  }

  return searchIndex
    .filter((entry) => {
      const haystack = normalizeText([entry.title, entry.subtitle, entry.slug, ...entry.tags].join(" "));
      return haystack.includes(normalized);
    })
    .slice(0, 10);
}

export function getBudgetSummary(): BudgetSummary {
  const latestSnapshots = getLatestBudgetSnapshots();
  const averageExecutionRate = Math.round(
    latestSnapshots.reduce((sum, item) => sum + item.executionRate, 0) / latestSnapshots.length,
  );

  const strongestAcceleration = [...latestSnapshots].sort(
    (left, right) => right.variationVsPlan - left.variationVsPlan,
  )[0];

  const highestPressure = [...latestSnapshots].sort(
    (left, right) => left.variationVsPlan - right.variationVsPlan,
  )[0];

  return {
    averageExecutionRate,
    territoriesTracked: latestSnapshots.length,
    strongestAcceleration,
    highestPressure,
  };
}

/* ── Full Congress directory (350 deputies) ── */
export { congressDeputies, parliamentaryGroups } from "./congreso-deputies.js";
export type { CongressDeputySeed } from "./congreso-deputies.js";
