/* ═══════════════════════════════════════════════════════════════════════════
   Business & Entrepreneurship Data — Regulations, procedures, incentives
   and EU initiatives affecting company creation in Spain.
   Sources: BOE, BORME, Parlamento Europeo, Comisión Europea, Ministerio de
   Economía, DGIPYME, INE-DIRCE, ICO, ENISA, SEPE, Seguridad Social.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Company Legal Forms ─────────────────────────────────────────────────────

export interface CompanyForm {
  id: string;
  name: string;
  acronym: string;
  minCapital: number; // € required
  minPartners: number;
  maxPartners: number | null; // null = unlimited
  liability: "limitada" | "ilimitada" | "mixta";
  taxRegime: "sociedades" | "irpf" | "especial";
  registrationCost: string; // approximate
  timeToIncorporate: string; // average
  bestFor: string;
  keyLaw: string;
  notes: string;
}

export const companyForms: CompanyForm[] = [
  {
    id: "sl",
    name: "Sociedad Limitada",
    acronym: "S.L.",
    minCapital: 1,
    minPartners: 1,
    maxPartners: null,
    liability: "limitada",
    taxRegime: "sociedades",
    registrationCost: "300–600 €",
    timeToIncorporate: "5–10 días (vía CIRCE), 20–40 días (tradicional)",
    bestFor: "PYMES, startups, emprendedores con socios",
    keyLaw: "Ley 14/2022 (Crea y Crece) — capital mínimo reducido a 1 €",
    notes: "Desde septiembre 2022, el capital mínimo pasó de 3.000 € a 1 €. La forma más popular en España (~97% de nuevas sociedades).",
  },
  {
    id: "sa",
    name: "Sociedad Anónima",
    acronym: "S.A.",
    minCapital: 60000,
    minPartners: 1,
    maxPartners: null,
    liability: "limitada",
    taxRegime: "sociedades",
    registrationCost: "600–1.500 €",
    timeToIncorporate: "30–60 días",
    bestFor: "Grandes empresas, cotizadas, capital riesgo",
    keyLaw: "Real Decreto Legislativo 1/2010 — Ley de Sociedades de Capital",
    notes: "Obligatoria para cotizar en bolsa. Capital mínimo 60.000 € (25% desembolsado en constitución).",
  },
  {
    id: "autonomo",
    name: "Trabajador Autónomo",
    acronym: "Autónomo",
    minCapital: 0,
    minPartners: 1,
    maxPartners: 1,
    liability: "ilimitada",
    taxRegime: "irpf",
    registrationCost: "0–100 €",
    timeToIncorporate: "1–3 días",
    bestFor: "Freelancers, profesionales, actividades iniciales",
    keyLaw: "Ley 20/2007 del Estatuto del Trabajo Autónomo + RD 13/2022 (cuotas por ingresos reales)",
    notes: "Desde 2023: cuotas por tramos de ingresos reales (230–500 €/mes). Tarifa plana 80 €/mes primer año para nuevas altas.",
  },
  {
    id: "slu",
    name: "Sociedad Limitada Unipersonal",
    acronym: "S.L.U.",
    minCapital: 1,
    minPartners: 1,
    maxPartners: 1,
    liability: "limitada",
    taxRegime: "sociedades",
    registrationCost: "300–600 €",
    timeToIncorporate: "5–10 días (vía CIRCE)",
    bestFor: "Emprendedores individuales que quieren responsabilidad limitada",
    keyLaw: "Ley de Sociedades de Capital + Ley Crea y Crece",
    notes: "SL con un solo socio. Mismas ventajas fiscales que la SL. Obligación de indicar 'Unipersonal' en documentación.",
  },
  {
    id: "coop",
    name: "Sociedad Cooperativa",
    acronym: "S.Coop.",
    minCapital: 3000,
    minPartners: 3,
    maxPartners: null,
    liability: "limitada",
    taxRegime: "especial",
    registrationCost: "400–800 €",
    timeToIncorporate: "30–60 días",
    bestFor: "Proyectos colectivos, economía social, agro",
    keyLaw: "Ley 27/1999 de Cooperativas (estatal) + leyes autonómicas",
    notes: "Régimen fiscal bonificado (20% IS vs 25%). Cada CCAA tiene su propia ley de cooperativas. Bonificación 100% SS primeros 3 años.",
  },
  {
    id: "slne",
    name: "Sociedad Limitada Nueva Empresa",
    acronym: "S.L.N.E.",
    minCapital: 3012,
    minPartners: 1,
    maxPartners: 5,
    liability: "limitada",
    taxRegime: "sociedades",
    registrationCost: "300–500 €",
    timeToIncorporate: "48 horas (telemática)",
    bestFor: "Constitución rápida telemática",
    keyLaw: "Ley 7/2003 de Sociedad Limitada Nueva Empresa",
    notes: "Variante simplificada de la SL. Constitución telemática en 48h. Uso decreciente desde que la SL bajó a 1 € de capital.",
  },
  {
    id: "cb",
    name: "Comunidad de Bienes",
    acronym: "C.B.",
    minCapital: 0,
    minPartners: 2,
    maxPartners: null,
    liability: "ilimitada",
    taxRegime: "irpf",
    registrationCost: "50–200 €",
    timeToIncorporate: "1–5 días",
    bestFor: "Actividades sencillas entre socios, negocios familiares",
    keyLaw: "Código Civil arts. 392–406",
    notes: "Sin personalidad jurídica propia. Cada comunero tributa por IRPF. Simple pero con responsabilidad ilimitada.",
  },
];

// ── Business Creation Procedures ────────────────────────────────────────────

export interface BusinessProcedure {
  id: string;
  step: number;
  title: string;
  entity: string; // where you do it
  timeEstimate: string;
  cost: string;
  isDigital: boolean; // can do online?
  url: string;
  description: string;
  appliesTo: string[]; // which company forms
}

export const businessProcedures: BusinessProcedure[] = [
  {
    id: "proc-01",
    step: 1,
    title: "Certificación negativa de nombre",
    entity: "Registro Mercantil Central",
    timeEstimate: "24–48 horas (online) / 3–5 días (presencial)",
    cost: "13,94 €",
    isDigital: true,
    url: "https://www.rmc.es",
    description: "Verificar que el nombre elegido para la sociedad no está registrado. Reserva válida 6 meses, prorrogable.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop"],
  },
  {
    id: "proc-02",
    step: 2,
    title: "Apertura de cuenta bancaria y depósito de capital",
    entity: "Entidad bancaria",
    timeEstimate: "1–2 días",
    cost: "0 € (según banco)",
    isDigital: true,
    url: "",
    description: "Depositar el capital social mínimo. El banco emite certificado de depósito necesario para la escritura.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop"],
  },
  {
    id: "proc-03",
    step: 3,
    title: "Escritura pública ante notario",
    entity: "Notaría",
    timeEstimate: "1–3 días",
    cost: "150–500 € (según capital y complejidad)",
    isDigital: false,
    url: "",
    description: "Otorgar escritura de constitución con estatutos sociales. Desde 2022, modelo de estatutos tipo gratuito para SL con capital ≤3.100 €.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop"],
  },
  {
    id: "proc-04",
    step: 4,
    title: "Obtención del NIF provisional",
    entity: "Agencia Tributaria (AEAT)",
    timeEstimate: "Inmediato (con modelo 036/037)",
    cost: "0 €",
    isDigital: true,
    url: "https://sede.agenciatributaria.gob.es",
    description: "Solicitar NIF provisional con modelo 036. Permite facturar mientras se completa la inscripción registral.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop", "autonomo"],
  },
  {
    id: "proc-05",
    step: 5,
    title: "Inscripción en el Registro Mercantil",
    entity: "Registro Mercantil Provincial",
    timeEstimate: "5–15 días hábiles",
    cost: "100–250 € (según capital)",
    isDigital: true,
    url: "https://www.registradores.org",
    description: "Inscribir la escritura. La sociedad adquiere personalidad jurídica plena. Publicación automática en BORME.",
    appliesTo: ["sl", "sa", "slu", "slne"],
  },
  {
    id: "proc-06",
    step: 6,
    title: "Alta en Seguridad Social (RETA / Régimen General)",
    entity: "Tesorería General de la Seguridad Social",
    timeEstimate: "1–2 días",
    cost: "0 € (trámite gratuito)",
    isDigital: true,
    url: "https://sede.seg-social.gob.es",
    description: "Administradores: alta en RETA (autónomos). Empleados: alta en Régimen General. Obligatorio antes de iniciar actividad.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop", "autonomo"],
  },
  {
    id: "proc-07",
    step: 7,
    title: "Alta censal y declaración de IVA",
    entity: "Agencia Tributaria (AEAT)",
    timeEstimate: "Inmediato",
    cost: "0 €",
    isDigital: true,
    url: "https://sede.agenciatributaria.gob.es",
    description: "Modelo 036/037: declarar inicio de actividad, epígrafe IAE, régimen de IVA aplicable. Comunicar domicilio fiscal.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop", "autonomo", "cb"],
  },
  {
    id: "proc-08",
    step: 8,
    title: "Licencia de apertura / Declaración responsable",
    entity: "Ayuntamiento correspondiente",
    timeEstimate: "15–60 días (según municipio y actividad)",
    cost: "50–3.000 € (según actividad y municipio)",
    isDigital: true,
    url: "",
    description: "Para locales comerciales. Muchos ayuntamientos aceptan declaración responsable para actividades de bajo riesgo (sin espera). Actividades clasificadas requieren licencia.",
    appliesTo: ["sl", "sa", "slu", "slne", "coop", "autonomo", "cb"],
  },
];

// ── Regulations & Initiatives (Spanish + EU) ────────────────────────────────

export interface BusinessRegulation {
  id: string;
  title: string;
  type: "ley-nacional" | "real-decreto" | "directiva-ue" | "reglamento-ue" | "propuesta-ue" | "iniciativa-gobierno" | "plan-estrategico";
  date: string; // publication/approval date
  status: "vigente" | "en-tramite" | "propuesta" | "aprobada-pendiente-transposicion" | "anteproyecto";
  source: string; // BOE, DOUE, Parlamento Europeo, etc.
  sourceUrl: string;
  summary: string;
  impactOnBusiness: string;
  affectedSectors: string[];
  affectedCompanyTypes: string[]; // sl, autonomo, pyme, startup, etc.
  fiscalImpact: string;
  tags: string[];
}

export const businessRegulations: BusinessRegulation[] = [
  {
    id: "reg-crea-crece",
    title: "Ley 18/2022 de Creación y Crecimiento de Empresas (Crea y Crece)",
    type: "ley-nacional",
    date: "2022-09-29",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/l/2022/09/28/18",
    summary: "Reduce el capital mínimo de las SL de 3.000 € a 1 €. Generaliza la facturación electrónica B2B. Reduce barreras regulatorias a la actividad económica. Facilita el acceso a financiación alternativa.",
    impactOnBusiness: "Eliminación de la barrera de capital para crear SL. Obligatoriedad progresiva de factura electrónica (2025 grandes empresas, 2026 PYMES). Acceso a plataformas de financiación participativa.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["sl", "slu", "pyme", "startup"],
    fiscalImpact: "Neutral — reduce costes de constitución, no modifica fiscalidad directa.",
    tags: ["capital-social", "factura-electronica", "simplificacion", "financiacion"],
  },
  {
    id: "reg-startups",
    title: "Ley 28/2022 de Fomento del Ecosistema de las Empresas Emergentes (Ley de Startups)",
    type: "ley-nacional",
    date: "2022-12-22",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/l/2022/12/21/28",
    summary: "Crea un marco legal específico para startups. IS reducido al 15% durante 4 años. Stock options con tributación diferida hasta 50.000 €/año. Visado especial para emprendedores e inversores extranjeros. Sandbox regulatorio.",
    impactOnBusiness: "Las startups certificadas por ENISA pagan 15% IS (vs 25%). Empleados pueden recibir acciones con impuestos diferidos. Inversores extranjeros obtienen NIF y visado acelerado. Nómadas digitales con régimen fiscal especial.",
    affectedSectors: ["tecnologia", "innovacion", "digital"],
    affectedCompanyTypes: ["startup", "sl", "slu"],
    fiscalImpact: "Ahorro de ~10 puntos en IS para startups certificadas. Exención parcial en stock options.",
    tags: ["startup", "stock-options", "visado", "innovacion", "enisa", "sandbox"],
  },
  {
    id: "reg-autonomos-cuotas",
    title: "Real Decreto-ley 13/2022 — Nuevo sistema de cotización de autónomos",
    type: "real-decreto",
    date: "2022-07-26",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/rdl/2022/07/26/13",
    summary: "Establece cotización por ingresos reales para autónomos en 15 tramos (230–500 €/mes). Tarifa plana de 80 €/mes durante 12 meses para nuevas altas. Cese de actividad mejorado.",
    impactOnBusiness: "Autónomos con ingresos bajos (<670 €/mes) pagan menos (230 €). Los de ingresos altos (>6.000 €/mes) pagan hasta 500 €. Tarifa plana primer año incentiva nuevos emprendedores.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["autonomo"],
    fiscalImpact: "Ahorro para autónomos de bajos ingresos, mayor coste para rentas altas.",
    tags: ["autonomos", "seguridad-social", "cotizacion", "tarifa-plana"],
  },
  {
    id: "reg-factura-electronica",
    title: "Obligatoriedad de facturación electrónica B2B",
    type: "real-decreto",
    date: "2024-06-25",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/rd/2024/06/25/XXX",
    summary: "Desarrollo reglamentario de la Ley Crea y Crece. Empresas con facturación >8M€: obligadas desde 2025. Resto de empresarios y profesionales: desde 2026. Formato Facturae o UBL.",
    impactOnBusiness: "Todas las empresas deben emitir y recibir facturas electrónicas en transacciones B2B. Inversión necesaria en software de facturación. Reducción de morosidad (plazo máximo 30 días).",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["sl", "sa", "autonomo", "pyme"],
    fiscalImpact: "Inversión en software 200–2.000 €. Reducción estimada de morosidad del 30%.",
    tags: ["factura-electronica", "digitalizacion", "morosidad"],
  },
  {
    id: "reg-eu-ai-act",
    title: "Reglamento (UE) 2024/1689 — Ley de Inteligencia Artificial",
    type: "reglamento-ue",
    date: "2024-08-01",
    status: "vigente",
    source: "DOUE",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689",
    summary: "Primer marco regulatorio mundial para la IA. Clasifica sistemas de IA por riesgo. Prohibe ciertas prácticas (scoring social, vigilancia biométrica masiva). Sandbox regulatorio para PYMES.",
    impactOnBusiness: "Empresas que desarrollen o desplieguen IA deben cumplir requisitos según nivel de riesgo. PYMES y startups tienen acceso preferente a sandboxes regulatorios nacionales. Multas hasta 35M€ o 7% facturación global.",
    affectedSectors: ["tecnologia", "ia", "salud", "finanzas", "rrhh", "educacion"],
    affectedCompanyTypes: ["startup", "sl", "sa", "pyme"],
    fiscalImpact: "Costes de compliance: 5.000–200.000 € según tamaño. Sandboxes PYME gratuitos.",
    tags: ["ia", "inteligencia-artificial", "compliance", "sandbox", "europa"],
  },
  {
    id: "reg-eu-csrd",
    title: "Directiva (UE) 2022/2464 — Sostenibilidad Corporativa (CSRD)",
    type: "directiva-ue",
    date: "2023-01-05",
    status: "aprobada-pendiente-transposicion",
    source: "DOUE",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2464",
    summary: "Obliga a reportar información de sostenibilidad (ESG) según estándares europeos (ESRS). Aplicación escalonada: 2024 cotizadas grandes, 2025 otras grandes, 2026 PYMES cotizadas.",
    impactOnBusiness: "~1.500 empresas españolas afectadas directamente. PYMES en cadenas de valor de grandes empresas también impactadas indirectamente. Auditoría de sostenibilidad obligatoria.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["sa", "sl", "pyme"],
    fiscalImpact: "Costes de reporting: 10.000–100.000 €/año. Sin incentivos fiscales directos.",
    tags: ["sostenibilidad", "esg", "reporting", "europa", "transposicion"],
  },
  {
    id: "reg-eu-late-payment",
    title: "Propuesta de Reglamento UE contra la morosidad comercial",
    type: "propuesta-ue",
    date: "2025-03-15",
    status: "en-tramite",
    source: "Parlamento Europeo",
    sourceUrl: "https://www.europarl.europa.eu",
    summary: "Plazo máximo de pago de 30 días en todas las transacciones comerciales (incluidas Administraciones Públicas). Intereses automáticos de demora. Autoridades nacionales de cumplimiento.",
    impactOnBusiness: "Beneficia enormemente a PYMES y autónomos que sufren morosidad. Las Administraciones Públicas deberán pagar en 30 días o intereses automáticos. Empresas grandes no podrán imponer plazos de 60–90 días.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["pyme", "autonomo", "sl", "startup"],
    fiscalImpact: "Estimación: +2.400 M€ anuales de liquidez adicional para PYMES españolas.",
    tags: ["morosidad", "pagos", "pymes", "europa", "liquidez"],
  },
  {
    id: "reg-eu-corporate-tax",
    title: "Directiva BEFIT — Base Imponible Común Europea para Sociedades",
    type: "propuesta-ue",
    date: "2025-06-01",
    status: "en-tramite",
    source: "Comisión Europea",
    sourceUrl: "https://commission.europa.eu",
    summary: "Propuesta para armonizar la base imponible del Impuesto de Sociedades en la UE. Declaración única para grupos que operen en múltiples estados. Fórmula de reparto basada en ventas, empleados y activos.",
    impactOnBusiness: "Simplificación para empresas con filiales en varios países UE. Una sola declaración fiscal. Posible redistribución de recaudación entre países.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["sa", "sl"],
    fiscalImpact: "Ahorro en compliance fiscal transfronterizo: 10.000–50.000 €/año por grupo.",
    tags: ["impuesto-sociedades", "armonizacion", "europa", "fiscal"],
  },
  {
    id: "reg-kit-digital",
    title: "Programa Kit Digital — Ayudas a la digitalización de PYMES",
    type: "iniciativa-gobierno",
    date: "2022-02-25",
    status: "vigente",
    source: "Red.es / Ministerio de Transformación Digital",
    sourceUrl: "https://www.acelerapyme.gob.es/kit-digital",
    summary: "Bonos digitales de 2.000–12.000 € para PYMES y autónomos. Cubren: web, e-commerce, gestión de clientes (CRM), factura electrónica, ciberseguridad, IA. Ampliado hasta 2026 con fondos NGEU.",
    impactOnBusiness: "Más de 500.000 PYMES beneficiadas. Bono de 12.000 € (10–49 empleados), 6.000 € (3–9), 2.000 € (0–2). Nuevas categorías incluyen IA y ciberseguridad avanzada.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["pyme", "autonomo", "sl", "slu"],
    fiscalImpact: "Subvención directa. Presupuesto total: 4.066 M€ (fondos NGEU).",
    tags: ["digitalizacion", "kit-digital", "pyme", "subvencion", "ngeu"],
  },
  {
    id: "reg-enisa",
    title: "Líneas ENISA de financiación para emprendedores",
    type: "iniciativa-gobierno",
    date: "2025-01-15",
    status: "vigente",
    source: "ENISA (Empresa Nacional de Innovación)",
    sourceUrl: "https://www.enisa.es",
    summary: "Préstamos participativos sin garantías de 25.000–1.500.000 € para emprendedores y PYMES innovadoras. Líneas: Jóvenes Emprendedores (hasta 75.000 €), Emprendedores (hasta 300.000 €), Crecimiento (hasta 1.500.000 €).",
    impactOnBusiness: "Financiación sin avales para startups. Interés vinculado a resultados (participativo). Amortización 3–9 años con carencia. Presupuesto 2025: 130 M€.",
    affectedSectors: ["innovacion", "tecnologia", "todos"],
    affectedCompanyTypes: ["startup", "sl", "slu", "pyme"],
    fiscalImpact: "Préstamo, no subvención. Interés 3–8% según línea. Sin coste fiscal.",
    tags: ["enisa", "prestamo-participativo", "startup", "financiacion", "sin-garantias"],
  },
  {
    id: "reg-ley-mercados",
    title: "Ley 6/2023 de los Mercados de Valores y de los Servicios de Inversión",
    type: "ley-nacional",
    date: "2023-03-17",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/l/2023/03/17/6",
    summary: "Moderniza el acceso de PYMES a mercados de capitales. Crea el BME Scaleup (mercado de valores para empresas en crecimiento). Simplifica requisitos de admisión. Regula crowdfunding y plataformas de financiación.",
    impactOnBusiness: "PYMES pueden acceder al BME Scaleup con menos requisitos que el mercado principal. Crowdfunding regulado permite captar hasta 5 M€. Tokenización de activos financieros.",
    affectedSectors: ["finanzas", "tecnologia"],
    affectedCompanyTypes: ["startup", "sl", "sa", "pyme"],
    fiscalImpact: "Costes de salida al BME Scaleup: 30.000–100.000 €. Crowdfunding: comisiones 3–7%.",
    tags: ["mercados", "crowdfunding", "bme-scaleup", "financiacion", "inversion"],
  },
  {
    id: "reg-eu-single-market-emergency",
    title: "Reglamento (UE) 2024/2747 — Instrumento del Mercado Único para Emergencias (SMEI)",
    type: "reglamento-ue",
    date: "2024-11-28",
    status: "vigente",
    source: "DOUE",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/2747",
    summary: "Permite a la Comisión activar mecanismos de emergencia en el mercado único ante crisis. Reservas estratégicas. Compras conjuntas. Simplificación regulatoria temporal para empresas.",
    impactOnBusiness: "En situaciones de emergencia: simplificación temporal de trámites, prioridad en adjudicaciones para PYMES, acceso a compras conjuntas europeas.",
    affectedSectors: ["salud", "energia", "alimentacion", "tecnologia"],
    affectedCompanyTypes: ["pyme", "sl", "sa"],
    fiscalImpact: "Variable según crisis activada.",
    tags: ["emergencia", "mercado-unico", "europa", "crisis", "resiliencia"],
  },
  {
    id: "reg-segunda-oportunidad",
    title: "Ley 16/2022 de reforma del Texto Refundido de la Ley Concursal",
    type: "ley-nacional",
    date: "2022-09-05",
    status: "vigente",
    source: "BOE",
    sourceUrl: "https://www.boe.es/eli/es/l/2022/09/05/16",
    summary: "Transpone la Directiva UE de insolvencia. Mecanismo de segunda oportunidad mejorado para personas físicas y autónomos. Planes de reestructuración pre-concursales. Exoneración de deudas más accesible.",
    impactOnBusiness: "Autónomos y emprendedores que fracasan pueden obtener exoneración de deudas pendientes (incluidas deudas públicas hasta 10.000 €). Planes de reestructuración sin pasar por concurso. Menor estigma al fracaso empresarial.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["autonomo", "sl", "slu", "pyme"],
    fiscalImpact: "Exoneración de deudas públicas hasta 10.000 €. Deudas privadas: exoneración total posible.",
    tags: ["segunda-oportunidad", "insolvencia", "concursal", "fracaso", "deudas"],
  },
  {
    id: "reg-eu-due-diligence",
    title: "Directiva (UE) 2024/1760 — Diligencia debida en sostenibilidad corporativa (CSDDD)",
    type: "directiva-ue",
    date: "2024-07-25",
    status: "aprobada-pendiente-transposicion",
    source: "DOUE",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2024/1760",
    summary: "Obliga a grandes empresas a identificar, prevenir y mitigar impactos adversos en derechos humanos y medio ambiente en toda su cadena de valor. Transposición: julio 2026.",
    impactOnBusiness: "Empresas con >1.000 empleados y >450 M€ facturación afectadas directamente. PYMES proveedoras de grandes empresas afectadas indirectamente: deberán cumplir código de conducta. Planes de transición climática obligatorios.",
    affectedSectors: ["todos"],
    affectedCompanyTypes: ["sa", "sl"],
    fiscalImpact: "Costes de compliance: 50.000–500.000 €/año. Sin incentivos fiscales asociados.",
    tags: ["due-diligence", "sostenibilidad", "cadena-valor", "europa", "transposicion"],
  },
];

// ── Business Statistics (Spain) ─────────────────────────────────────────────

export interface BusinessStatistics {
  year: number;
  totalActiveCompanies: number;
  newCompaniesCreated: number;
  companiesDissolved: number;
  netBalance: number;
  totalAutonomos: number;
  newAutonomos: number;
  autonomosBaja: number;
  averageIncorporationDays: number;
  slPercentage: number; // % of new companies that are SL
  digitalIncorporation: number; // % incorporated via CIRCE/online
  survivalRate1Year: number; // % surviving after 1 year
  survivalRate3Years: number; // % surviving after 3 years
  survivalRate5Years: number; // % surviving after 5 years
  topSectors: { sector: string; count: number; pct: number }[];
  topCCAA: { ccaa: string; count: number; pct: number }[];
}

export const businessStats2025: BusinessStatistics = {
  year: 2025,
  totalActiveCompanies: 3_412_000,
  newCompaniesCreated: 108_500,
  companiesDissolved: 24_300,
  netBalance: 84_200,
  totalAutonomos: 3_368_000,
  newAutonomos: 542_000,
  autonomosBaja: 498_000,
  averageIncorporationDays: 12.5,
  slPercentage: 97.2,
  digitalIncorporation: 38.5,
  survivalRate1Year: 78.4,
  survivalRate3Years: 56.2,
  survivalRate5Years: 41.8,
  topSectors: [
    { sector: "Comercio", count: 18_200, pct: 16.8 },
    { sector: "Construcción", count: 14_600, pct: 13.5 },
    { sector: "Actividades profesionales y técnicas", count: 13_900, pct: 12.8 },
    { sector: "Hostelería", count: 11_500, pct: 10.6 },
    { sector: "Tecnología y comunicaciones", count: 9_800, pct: 9.0 },
    { sector: "Industria manufacturera", count: 7_200, pct: 6.6 },
    { sector: "Transporte y logística", count: 6_800, pct: 6.3 },
    { sector: "Sanidad y servicios sociales", count: 5_400, pct: 5.0 },
  ],
  topCCAA: [
    { ccaa: "Madrid", count: 28_400, pct: 26.2 },
    { ccaa: "Cataluña", count: 20_100, pct: 18.5 },
    { ccaa: "Andalucía", count: 14_800, pct: 13.6 },
    { ccaa: "Comunitat Valenciana", count: 10_200, pct: 9.4 },
    { ccaa: "País Vasco", count: 5_100, pct: 4.7 },
    { ccaa: "Galicia", count: 4_300, pct: 4.0 },
    { ccaa: "Castilla y León", count: 3_600, pct: 3.3 },
    { ccaa: "Canarias", count: 3_400, pct: 3.1 },
  ],
};

// ── Incentives & Fiscal Benefits ────────────────────────────────────────────

export interface BusinessIncentive {
  id: string;
  title: string;
  type: "fiscal" | "subvencion" | "prestamo" | "formacion" | "infraestructura";
  scope: "nacional" | "ccaa" | "europeo";
  targetProfile: string[]; // autonomo, startup, pyme, mujer, joven, etc.
  benefit: string;
  amount: string;
  duration: string;
  requirements: string;
  source: string;
  status: "activo" | "convocatoria-abierta" | "proximo";
}

export const businessIncentives: BusinessIncentive[] = [
  {
    id: "inc-tarifa-plana",
    title: "Tarifa plana autónomos",
    type: "fiscal",
    scope: "nacional",
    targetProfile: ["autonomo", "joven", "mujer"],
    benefit: "Cuota reducida de 80 €/mes durante 12 meses (prorrogable 12 más si ingresos < SMI)",
    amount: "Ahorro ~2.400 €/año",
    duration: "12–24 meses",
    requirements: "No haber estado de alta como autónomo en los 2 años anteriores (3 años si fue con bonificación)",
    source: "Seguridad Social",
    status: "activo",
  },
  {
    id: "inc-is-reducido-startup",
    title: "IS reducido 15% para startups",
    type: "fiscal",
    scope: "nacional",
    targetProfile: ["startup"],
    benefit: "Tipo del 15% en Impuesto de Sociedades (vs 25% general) durante 4 ejercicios",
    amount: "Ahorro del 10% sobre base imponible",
    duration: "4 años desde constitución",
    requirements: "Certificación ENISA como empresa emergente. <5 años antigüedad (7 en biotech). No cotizada. No distribuir dividendos.",
    source: "Ley de Startups 28/2022",
    status: "activo",
  },
  {
    id: "inc-stock-options",
    title: "Stock options con tributación diferida",
    type: "fiscal",
    scope: "nacional",
    targetProfile: ["startup"],
    benefit: "Exención de tributación en entrega de acciones/participaciones hasta 50.000 €/año",
    amount: "Hasta 50.000 €/año exentos",
    duration: "Mientras la empresa tenga condición de emergente",
    requirements: "Empresa certificada como emergente. Ofertar a todos los empleados en igualdad de condiciones.",
    source: "Ley de Startups 28/2022",
    status: "activo",
  },
  {
    id: "inc-kit-digital",
    title: "Kit Digital",
    type: "subvencion",
    scope: "nacional",
    targetProfile: ["pyme", "autonomo"],
    benefit: "Bono digital para servicios de digitalización: web, e-commerce, CRM, factura-e, ciberseguridad, IA",
    amount: "2.000 € (0-2 empl.), 6.000 € (3-9), 12.000 € (10-49)",
    duration: "Hasta agotar fondos (previsto 2026)",
    requirements: "Inscripción en Acelera Pyme. No superar 49 empleados. Estar al corriente con AEAT y SS.",
    source: "Red.es / NGEU",
    status: "convocatoria-abierta",
  },
  {
    id: "inc-enisa-jovenes",
    title: "ENISA Jóvenes Emprendedores",
    type: "prestamo",
    scope: "nacional",
    targetProfile: ["joven", "startup"],
    benefit: "Préstamo participativo sin garantías de 25.000–75.000 €",
    amount: "25.000–75.000 €",
    duration: "Amortización hasta 7 años (1 año carencia)",
    requirements: "Mayoría del capital en manos de <40 años. Empresa <24 meses. Plan de empresa viable.",
    source: "ENISA",
    status: "convocatoria-abierta",
  },
  {
    id: "inc-enisa-crecimiento",
    title: "ENISA Crecimiento",
    type: "prestamo",
    scope: "nacional",
    targetProfile: ["pyme", "startup", "sl"],
    benefit: "Préstamo participativo sin garantías de 25.000–1.500.000 €",
    amount: "25.000–1.500.000 €",
    duration: "Amortización hasta 9 años (hasta 7 carencia)",
    requirements: "PYME según definición UE. Fondos propios ≥ préstamo solicitado. Sin incidencias RAI/ASNEF.",
    source: "ENISA",
    status: "convocatoria-abierta",
  },
  {
    id: "inc-ico-empresas",
    title: "Línea ICO Empresas y Emprendedores 2025",
    type: "prestamo",
    scope: "nacional",
    targetProfile: ["pyme", "autonomo", "sl", "startup"],
    benefit: "Financiación de inversiones y necesidades de liquidez a través de entidades de crédito",
    amount: "Hasta 12.500.000 € por cliente y año",
    duration: "1–20 años según finalidad",
    requirements: "Ser autónomo, empresa o entidad pública/privada española. Solicitar a través de banco intermediario.",
    source: "ICO (Instituto de Crédito Oficial)",
    status: "activo",
  },
  {
    id: "inc-deduccion-id",
    title: "Deducción por I+D+i en Impuesto de Sociedades",
    type: "fiscal",
    scope: "nacional",
    targetProfile: ["sl", "sa", "pyme", "startup"],
    benefit: "Deducción del 25% (I+D) y 12% (innovación) sobre gastos. Bonificación adicional del 17% por personal investigador.",
    amount: "25–42% de deducción sobre gasto en I+D",
    duration: "Sin límite temporal",
    requirements: "Justificar ante AEAT que la actividad es I+D o innovación. Informe motivado vinculante del CDTI recomendado.",
    source: "Ley del Impuesto de Sociedades art. 35",
    status: "activo",
  },
  {
    id: "inc-zona-franca",
    title: "Zonas Francas — Incentivos aduaneros y fiscales",
    type: "infraestructura",
    scope: "nacional",
    targetProfile: ["sl", "sa", "pyme"],
    benefit: "Exención de aranceles, IVA diferido, simplificación aduanera. Zonas: Barcelona, Cádiz, Vigo, Gran Canaria, Tenerife.",
    amount: "Variable según operación",
    duration: "Mientras opere en zona franca",
    requirements: "Establecer actividad en una zona franca autorizada. Solicitar autorización a la Delegación Especial de Aduanas.",
    source: "AEAT / Consorcios de Zonas Francas",
    status: "activo",
  },
  {
    id: "inc-canarias-ric-zec",
    title: "Régimen Económico y Fiscal de Canarias (REF/RIC/ZEC)",
    type: "fiscal",
    scope: "ccaa",
    targetProfile: ["sl", "sa", "pyme", "startup"],
    benefit: "IS reducido al 4% en ZEC. RIC: deducción del 90% de beneficios reinvertidos. IGIC al 7% (vs 21% IVA peninsular).",
    amount: "IS 4% (vs 25%), IGIC 7% (vs IVA 21%)",
    duration: "ZEC autorizada hasta 2027 (prorrogable)",
    requirements: "ZEC: crear al menos 5 empleos (3 en islas menores). Actividades incluidas en lista ZEC. Inversión mínima 100.000 € (50.000 € islas menores).",
    source: "Gobierno de Canarias / AEAT",
    status: "activo",
  },
];

// ── Helper functions ────────────────────────────────────────────────────────

/** Get a regulation by id */
export function getBusinessRegulation(id: string): BusinessRegulation | undefined {
  return businessRegulations.find(r => r.id === id);
}

/** Get all regulations matching a tag */
export function getRegulationsByTag(tag: string): BusinessRegulation[] {
  return businessRegulations.filter(r => r.tags.includes(tag));
}

/** Get incentives for a given company profile */
export function getIncentivesForProfile(profile: string): BusinessIncentive[] {
  return businessIncentives.filter(inc => inc.targetProfile.includes(profile));
}

/** Get active incentives only */
export function getActiveIncentives(): BusinessIncentive[] {
  return businessIncentives.filter(inc => inc.status === "activo" || inc.status === "convocatoria-abierta");
}
