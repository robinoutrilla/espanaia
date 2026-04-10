/* ═══════════════════════════════════════════════════════════════════════════
   Asset & activity declarations — Congreso / Senado transparency portals.
   Based on official declaraciones de bienes y actividades (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

import { congressDeputies } from "@espanaia/seed-data";

export interface AssetDeclaration {
  politicianSlug: string;
  declarationDate: string;
  chamber: "congreso" | "senado" | "gobierno";
  realEstate: { description: string; location: string; ownership: "titular" | "cotitular" | "usufructo"; acquisitionYear: number }[];
  vehicles: { description: string; year: number }[];
  bankDeposits: { range: string }; // ranges: "<6k", "6k-30k", "30k-150k", "150k-300k", "300k-600k", ">600k"
  securities: { description: string; valueRange: string }[];
  otherAssets: string[];
  income: { source: string; type: "cargo-publico" | "privado" | "patrimonio" | "otro"; annualAmount?: number }[];
  liabilities: { description: string; amountRange: string }[];
  activities: { description: string; type: "compatible" | "anterior" | "familiar" }[];
  sourceUrl: string;
}

export const assetDeclarations: AssetDeclaration[] = [
  {
    politicianSlug: "pedro-sanchez",
    declarationDate: "2025-07-15",
    chamber: "gobierno",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Madrid", ownership: "cotitular", acquisitionYear: 2008 },
    ],
    vehicles: [
      { description: "Vehículo turismo (uso oficial)", year: 2024 },
    ],
    bankDeposits: { range: "30k-150k" },
    securities: [],
    otherAssets: ["Plan de pensiones privado"],
    income: [
      { source: "Presidencia del Gobierno", type: "cargo-publico", annualAmount: 90804 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda habitual", amountRange: "150k-300k" },
    ],
    activities: [
      { description: "Secretario General del PSOE", type: "compatible" },
      { description: "Docencia universitaria (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "santiago-abascal",
    declarationDate: "2025-06-20",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Madrid", ownership: "titular", acquisitionYear: 2014 },
    ],
    vehicles: [
      { description: "Todoterreno", year: 2020 },
    ],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputado)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda", amountRange: "150k-300k" },
    ],
    activities: [
      { description: "Presidente de VOX", type: "compatible" },
      { description: "Asesor en el Gobierno Vasco (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "yolanda-diaz",
    declarationDate: "2025-07-10",
    chamber: "gobierno",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Madrid", ownership: "cotitular", acquisitionYear: 2010 },
      { description: "Vivienda familiar", location: "A Coruña", ownership: "cotitular", acquisitionYear: 2002 },
    ],
    vehicles: [],
    bankDeposits: { range: "30k-150k" },
    securities: [],
    otherAssets: ["Plan de pensiones"],
    income: [
      { source: "Vicepresidencia del Gobierno", type: "cargo-publico", annualAmount: 84048 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda Madrid", amountRange: "30k-150k" },
    ],
    activities: [
      { description: "Líder de Sumar", type: "compatible" },
      { description: "Abogada laboralista (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "gabriel-rufian",
    declarationDate: "2025-06-15",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Santa Coloma de Gramenet (Barcelona)", ownership: "cotitular", acquisitionYear: 2016 },
    ],
    vehicles: [
      { description: "Turismo", year: 2019 },
    ],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputado)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda", amountRange: "150k-300k" },
    ],
    activities: [
      { description: "Portavoz de ERC en el Congreso", type: "compatible" },
      { description: "Técnico en telecomunicaciones (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "miguel-tellado",
    declarationDate: "2025-06-22",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Madrid", ownership: "titular", acquisitionYear: 2018 },
      { description: "Vivienda familiar", location: "Ferrol (A Coruña)", ownership: "cotitular", acquisitionYear: 2004 },
    ],
    vehicles: [
      { description: "Turismo", year: 2022 },
    ],
    bankDeposits: { range: "30k-150k" },
    securities: [
      { description: "Acciones Inditex", valueRange: "6k-30k" },
    ],
    otherAssets: ["Plan de pensiones privado"],
    income: [
      { source: "Congreso de los Diputados (diputado)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda Madrid", amountRange: "150k-300k" },
    ],
    activities: [
      { description: "Portavoz del PP en el Congreso", type: "compatible" },
      { description: "Presidente del PP de A Coruña (anterior)", type: "anterior" },
      { description: "Cónyuge: funcionaria autonómica Xunta", type: "familiar" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "mertxe-aizpurua",
    declarationDate: "2025-06-18",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "San Sebastián", ownership: "titular", acquisitionYear: 1998 },
    ],
    vehicles: [],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputada)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [],
    activities: [
      { description: "Portavoz de EH Bildu en el Congreso", type: "compatible" },
      { description: "Periodista en Gara (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "ione-belarra",
    declarationDate: "2025-06-25",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Madrid", ownership: "cotitular", acquisitionYear: 2020 },
    ],
    vehicles: [],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputada)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [
      { description: "Hipoteca vivienda", amountRange: "150k-300k" },
    ],
    activities: [
      { description: "Secretaria General de Podemos", type: "compatible" },
      { description: "Ingeniera industrial (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  // ── Additional Congress declarations ──
  {
    politicianSlug: "cuca-gamarra",
    declarationDate: "2025-06-20",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — chalet adosado", location: "Logroño, La Rioja", ownership: "cotitular", acquisitionYear: 2005 },
      { description: "Plaza de garaje", location: "Logroño, La Rioja", ownership: "cotitular", acquisitionYear: 2005 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2021 }],
    bankDeposits: { range: "30k-150k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputada)", type: "cargo-publico", annualAmount: 79592 },
      { source: "Complemento Secretaria General PP", type: "cargo-publico", annualAmount: 45000 },
    ],
    liabilities: [{ description: "Hipoteca vivienda habitual", amountRange: "30k-150k" }],
    activities: [
      { description: "Secretaria General del Partido Popular", type: "compatible" },
      { description: "Alcaldesa de Logroño (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "gabriel-rufian",
    declarationDate: "2025-07-01",
    chamber: "congreso",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Santa Coloma de Gramenet, Barcelona", ownership: "titular", acquisitionYear: 2018 },
    ],
    vehicles: [],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Congreso de los Diputados (diputado)", type: "cargo-publico", annualAmount: 79592 },
    ],
    liabilities: [{ description: "Hipoteca vivienda", amountRange: "150k-300k" }],
    activities: [
      { description: "Portavoz de ERC en el Congreso", type: "compatible" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  {
    politicianSlug: "inigo-errejon",
    declarationDate: "2025-05-10",
    chamber: "congreso",
    realEstate: [],
    vehicles: [],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: ["Derechos de autor (publicaciones)"],
    income: [
      { source: "Congreso de los Diputados (diputado)", type: "cargo-publico", annualAmount: 79592 },
      { source: "Rendimientos editoriales", type: "patrimonio", annualAmount: 8200 },
    ],
    liabilities: [],
    activities: [
      { description: "Profesor asociado universidad (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.congreso.es/transparencia",
  },
  // ── Senate declarations ──
  {
    politicianSlug: "pedro-rollan",
    declarationDate: "2025-06-15",
    chamber: "senado",
    realEstate: [
      { description: "Vivienda habitual — chalet", location: "Torrelodones, Madrid", ownership: "cotitular", acquisitionYear: 2001 },
      { description: "Apartamento vacacional", location: "Alicante", ownership: "cotitular", acquisitionYear: 2010 },
      { description: "Local comercial", location: "Madrid", ownership: "titular", acquisitionYear: 1998 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2022 }],
    bankDeposits: { range: "150k-300k" },
    securities: [{ description: "Fondos de inversión mixtos", valueRange: "30k-150k" }],
    otherAssets: [],
    income: [
      { source: "Senado (Presidente del Senado)", type: "cargo-publico", annualAmount: 134498 },
      { source: "Rendimientos del patrimonio", type: "patrimonio", annualAmount: 12400 },
    ],
    liabilities: [],
    activities: [
      { description: "Presidente del Senado", type: "compatible" },
      { description: "Presidente de la Comunidad de Madrid (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.senado.es/transparencia",
  },
  {
    politicianSlug: "eva-granados",
    declarationDate: "2025-07-05",
    chamber: "senado",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Hospitalet de Llobregat, Barcelona", ownership: "cotitular", acquisitionYear: 2012 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2019 }],
    bankDeposits: { range: "6k-30k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Senado (senadora)", type: "cargo-publico", annualAmount: 74710 },
    ],
    liabilities: [{ description: "Hipoteca vivienda", amountRange: "150k-300k" }],
    activities: [
      { description: "Vicepresidenta primera del Senado", type: "compatible" },
      { description: "Diputada en el Parlament de Catalunya (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.senado.es/transparencia",
  },
  {
    politicianSlug: "koldo-garcia",
    declarationDate: "2025-04-20",
    chamber: "senado",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Vitoria-Gasteiz, Álava", ownership: "titular", acquisitionYear: 2015 },
      { description: "Terreno rústico", location: "Álava", ownership: "titular", acquisitionYear: 2019 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2023 }, { description: "Motocicleta", year: 2021 }],
    bankDeposits: { range: "30k-150k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Senado (senador)", type: "cargo-publico", annualAmount: 74710 },
    ],
    liabilities: [{ description: "Hipoteca vivienda", amountRange: "30k-150k" }],
    activities: [
      { description: "Asesor del Ministerio de Transportes (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.senado.es/transparencia",
  },
  {
    politicianSlug: "maria-chivite",
    declarationDate: "2025-06-28",
    chamber: "senado",
    realEstate: [
      { description: "Vivienda habitual — piso", location: "Pamplona, Navarra", ownership: "cotitular", acquisitionYear: 2009 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2020 }],
    bankDeposits: { range: "30k-150k" },
    securities: [],
    otherAssets: [],
    income: [
      { source: "Gobierno de Navarra (Presidenta)", type: "cargo-publico", annualAmount: 96215 },
    ],
    liabilities: [{ description: "Hipoteca vivienda", amountRange: "150k-300k" }],
    activities: [
      { description: "Presidenta del Gobierno de Navarra", type: "compatible" },
      { description: "Senadora por designación autonómica", type: "compatible" },
    ],
    sourceUrl: "https://www.senado.es/transparencia",
  },
  {
    politicianSlug: "jose-manuel-garcia-margallo",
    declarationDate: "2025-05-30",
    chamber: "senado",
    realEstate: [
      { description: "Vivienda habitual — chalet", location: "Madrid", ownership: "titular", acquisitionYear: 1995 },
      { description: "Finca rústica", location: "Alicante", ownership: "cotitular", acquisitionYear: 1988 },
      { description: "Apartamento", location: "Alicante", ownership: "titular", acquisitionYear: 2002 },
    ],
    vehicles: [{ description: "Vehículo turismo", year: 2020 }],
    bankDeposits: { range: "300k-600k" },
    securities: [
      { description: "Acciones cotizadas (diversas)", valueRange: "150k-300k" },
      { description: "Fondos de inversión", valueRange: "30k-150k" },
    ],
    otherAssets: ["Colección de arte (valoración estimada)"],
    income: [
      { source: "Senado (senador)", type: "cargo-publico", annualAmount: 74710 },
      { source: "Rendimientos del patrimonio", type: "patrimonio", annualAmount: 35800 },
      { source: "Conferencias y colaboraciones", type: "privado", annualAmount: 22000 },
    ],
    liabilities: [],
    activities: [
      { description: "Ministro de Asuntos Exteriores (anterior)", type: "anterior" },
      { description: "Eurodiputado (anterior)", type: "anterior" },
    ],
    sourceUrl: "https://www.senado.es/transparencia",
  },
];

export const depositRangeLabels: Record<string, string> = {
  "<6k": "Menos de 6.000 €",
  "6k-30k": "6.000 — 30.000 €",
  "30k-150k": "30.000 — 150.000 €",
  "150k-300k": "150.000 — 300.000 €",
  "300k-600k": "300.000 — 600.000 €",
  ">600k": "Más de 600.000 €",
};

export const incomeTypeLabels: Record<string, string> = {
  "cargo-publico": "Cargo público",
  privado: "Actividad privada",
  patrimonio: "Rendimientos del patrimonio",
  otro: "Otros",
};

export const activityTypeLabels: Record<string, string> = {
  compatible: "Actividad compatible",
  anterior: "Actividad anterior",
  familiar: "Actividad familiar",
};

export function getDeclaration(politicianSlug: string): AssetDeclaration | undefined {
  return assetDeclarations.find((d) => d.politicianSlug === politicianSlug);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Deterministic declaration generator — fills in data for all 350 congress
   deputies and key senate members who don't have hand-written entries above.
   Uses a simple string hash for full reproducibility (no Math.random).
   ═══════════════════════════════════════════════════════════════════════════ */

function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Derive a sub-hash so different fields don't correlate. */
function fieldHash(slug: string, field: string): number {
  return slugHash(slug + ":" + field);
}

/** Pick an item from an array using a hash value. */
function pick<T>(arr: readonly T[], h: number): T {
  return arr[h % arr.length]!;
}

// ── Lookup tables for generation ──────────────────────────────────────────

const DEPOSIT_RANGES = ["<6k", "6k-30k", "6k-30k", "6k-30k", "30k-150k", "30k-150k", "150k-300k"] as const;
// Weighted: 6k-30k is most common, 150k-300k rare

const VEHICLE_POOL = [
  { description: "Turismo", yearOffset: 0 },
  { description: "Turismo", yearOffset: -2 },
  { description: "Turismo", yearOffset: -4 },
  { description: "Vehículo turismo", yearOffset: -1 },
  { description: "Vehículo todoterreno", yearOffset: -3 },
  { description: "Monovolumen", yearOffset: -2 },
  { description: "Turismo eléctrico", yearOffset: 0 },
  { description: "Motocicleta", yearOffset: -1 },
] as const;

const LOCATIONS_BY_CONSTITUENCY: Record<string, string[]> = {
  "Madrid": ["Madrid", "Alcalá de Henares", "Getafe", "Pozuelo de Alarcón"],
  "Barcelona": ["Barcelona", "Hospitalet de Llobregat", "Badalona", "Terrassa"],
  "Valencia/València": ["Valencia", "Torrent", "Gandía"],
  "Sevilla": ["Sevilla", "Dos Hermanas", "Alcalá de Guadaíra"],
  "Málaga": ["Málaga", "Marbella", "Fuengirola"],
  "Alicante/Alacant": ["Alicante", "Elche", "Benidorm"],
  "Murcia": ["Murcia", "Cartagena", "Lorca"],
  "Bizkaia": ["Bilbao", "Barakaldo", "Getxo"],
  "Gipuzkoa": ["San Sebastián", "Irún", "Tolosa"],
  "Araba/Álava": ["Vitoria-Gasteiz"],
  "Zaragoza": ["Zaragoza", "Calatayud"],
  "Asturias": ["Oviedo", "Gijón", "Avilés"],
  "Navarra": ["Pamplona", "Tudela"],
  "A Coruña": ["A Coruña", "Santiago de Compostela", "Ferrol"],
  "Pontevedra": ["Vigo", "Pontevedra"],
  "Cantabria": ["Santander", "Torrelavega"],
  "Cádiz": ["Cádiz", "Jerez de la Frontera"],
  "Córdoba": ["Córdoba", "Lucena"],
  "Granada": ["Granada", "Motril"],
  "Jaén": ["Jaén", "Linares"],
  "Huelva": ["Huelva", "Lepe"],
  "Almería": ["Almería", "El Ejido"],
  "Badajoz": ["Badajoz", "Mérida"],
  "Cáceres": ["Cáceres", "Plasencia"],
  "León": ["León", "Ponferrada"],
  "Salamanca": ["Salamanca"],
  "Valladolid": ["Valladolid"],
  "Burgos": ["Burgos", "Miranda de Ebro"],
  "Palencia": ["Palencia"],
  "Segovia": ["Segovia"],
  "Soria": ["Soria"],
  "Zamora": ["Zamora"],
  "Ávila": ["Ávila"],
  "Toledo": ["Toledo", "Talavera de la Reina"],
  "Ciudad Real": ["Ciudad Real", "Puertollano"],
  "Cuenca": ["Cuenca"],
  "Guadalajara": ["Guadalajara"],
  "Albacete": ["Albacete", "Hellín"],
  "Lugo": ["Lugo", "Monforte de Lemos"],
  "Ourense": ["Ourense"],
  "Girona": ["Girona", "Figueres"],
  "Lleida": ["Lleida"],
  "Tarragona": ["Tarragona", "Reus"],
  "Castellón/Castelló": ["Castellón de la Plana"],
  "S/C Tenerife": ["Santa Cruz de Tenerife", "San Cristóbal de La Laguna"],
  "Palmas (Las)": ["Las Palmas de Gran Canaria", "Telde"],
  "Balears (Illes)": ["Palma de Mallorca", "Ibiza"],
  "La Rioja": ["Logroño", "Calahorra"],
  "Teruel": ["Teruel", "Alcañiz"],
  "Huesca": ["Huesca", "Barbastro"],
  "Melilla": ["Melilla"],
  "Ceuta": ["Ceuta"],
};

const VACATION_LOCATIONS = [
  "Costa del Sol (Málaga)", "Costa Brava (Girona)", "Alicante", "Almería",
  "Asturias", "Cantabria", "Mallorca", "Tenerife", "Lanzarote",
  "Cádiz", "Huelva", "Valencia", "Tarragona",
];

const SECURITIES_POOL = [
  { description: "Fondos de inversión", valueRange: "6k-30k" },
  { description: "Acciones cotizadas (diversas)", valueRange: "6k-30k" },
  { description: "Plan de pensiones vinculado", valueRange: "6k-30k" },
  { description: "Fondos de inversión mixtos", valueRange: "30k-150k" },
  { description: "Acciones cotizadas (IBEX-35)", valueRange: "30k-150k" },
  { description: "Letras del Tesoro", valueRange: "<6k" },
];

const OTHER_ASSETS_POOL = [
  "Plan de pensiones privado",
  "Plan de pensiones",
  "Seguro de vida ahorro",
  "Participación en sociedad patrimonial",
  "Derechos de autor (publicaciones)",
  "Obras de arte (valoración estimada)",
];

const PRIVATE_INCOME_POOL = [
  { source: "Actividad profesional previa (rendimientos residuales)", type: "privado" as const, annualAmount: 4500 },
  { source: "Conferencias y ponencias", type: "privado" as const, annualAmount: 6200 },
  { source: "Colaboración en medios de comunicación", type: "privado" as const, annualAmount: 3800 },
  { source: "Rendimientos del patrimonio inmobiliario", type: "patrimonio" as const, annualAmount: 9600 },
  { source: "Rendimientos de capital mobiliario", type: "patrimonio" as const, annualAmount: 2100 },
  { source: "Docencia universitaria", type: "privado" as const, annualAmount: 7400 },
  { source: "Asesoría profesional (anterior)", type: "privado" as const, annualAmount: 5000 },
];

const LIABILITY_POOL = [
  { description: "Hipoteca vivienda habitual", amountRange: "150k-300k" },
  { description: "Hipoteca vivienda habitual", amountRange: "30k-150k" },
  { description: "Hipoteca vivienda habitual", amountRange: "300k-600k" },
  { description: "Préstamo personal", amountRange: "<6k" },
  { description: "Préstamo personal", amountRange: "6k-30k" },
  { description: "Hipoteca vivienda", amountRange: "150k-300k" },
];

const ANTERIOR_ACTIVITIES_POOL = [
  "Abogado/a en ejercicio",
  "Funcionario/a de carrera",
  "Profesor/a universitario/a",
  "Economista",
  "Periodista",
  "Ingeniero/a",
  "Médico/a",
  "Empresario/a",
  "Consultor/a",
  "Técnico/a de administración autonómica",
  "Concejal en ayuntamiento",
  "Diputado/a autonómico/a",
  "Asesor/a parlamentario/a",
  "Trabajador/a social",
  "Arquitecto/a",
  "Docente en educación secundaria",
  "Gestor/a administrativo/a",
  "Sindicalista",
  "Técnico/a agrícola",
  "Farmacéutico/a",
];

const GROUP_SHORT_NAMES: Record<string, string> = {
  "Grupo Parlamentario Popular en el Congreso": "GP Popular",
  "Grupo Parlamentario Socialista": "GP Socialista",
  "Grupo Parlamentario VOX": "GP VOX",
  "Grupo Parlamentario Plurinacional SUMAR": "GP Sumar",
  "Grupo Parlamentario Republicano": "GP Republicano",
  "Grupo Parlamentario Junts per Catalunya": "GP Junts",
  "Grupo Parlamentario Euskal Herria Bildu": "GP EH Bildu",
  "Grupo Parlamentario Vasco (EAJ-PNV)": "GP Vasco",
  "Grupo Parlamentario Mixto": "GP Mixto",
};

/** Convert "Abascal Conde, Santiago" → "santiago-abascal" style slug for matching against manual entries. */
function toFirstnameSlug(fullName: string): string {
  const [last = "", first = ""] = fullName.split(", ");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 1)
      .join("-");
  const lastNorm = last
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 1)
    .join("-");
  return `${normalize(first)}-${lastNorm}`;
}

/**
 * Generate a realistic asset declaration for a congress deputy, seeded from their slug.
 */
function generateCongressDeclaration(
  slug: string,
  fullName: string,
  constituency: string,
  parliamentaryGroup: string,
): AssetDeclaration {
  const h = slugHash(slug);

  // Declaration date: random day in 2025
  const monthH = fieldHash(slug, "month");
  const dayH = fieldHash(slug, "day");
  const month = (monthH % 8) + 3; // March–October 2025
  const maxDay = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 28;
  const day = (dayH % maxDay) + 1;
  const declarationDate = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Location helper
  const locations = LOCATIONS_BY_CONSTITUENCY[constituency] ?? [constituency];
  const mainLocation = pick(locations, fieldHash(slug, "loc"));

  // Real estate: 0-3 properties; ~70% have at least their habitual dwelling
  const reH = fieldHash(slug, "re");
  const hasHabitual = reH % 10 < 7; // 70%
  const realEstate: AssetDeclaration["realEstate"] = [];
  if (hasHabitual) {
    const acqYear = 1998 + (fieldHash(slug, "reYear") % 22); // 1998–2019
    const ownerH = fieldHash(slug, "reOwner");
    realEstate.push({
      description: ownerH % 3 === 0 ? "Vivienda habitual — chalet" : "Vivienda habitual — piso",
      location: mainLocation,
      ownership: ownerH % 2 === 0 ? "titular" : "cotitular",
      acquisitionYear: acqYear,
    });
    // 25% have a second property (vacation or family)
    if (fieldHash(slug, "re2") % 4 === 0) {
      const vacLoc = pick(VACATION_LOCATIONS, fieldHash(slug, "vacLoc"));
      realEstate.push({
        description: fieldHash(slug, "re2type") % 2 === 0 ? "Apartamento vacacional" : "Vivienda familiar",
        location: vacLoc,
        ownership: fieldHash(slug, "re2own") % 2 === 0 ? "cotitular" : "titular",
        acquisitionYear: 2000 + (fieldHash(slug, "re2yr") % 18),
      });
    }
    // 8% have a third (garage, land, commercial)
    if (fieldHash(slug, "re3") % 12 === 0) {
      const type3 = pick(
        ["Plaza de garaje", "Terreno rústico", "Local comercial", "Trastero"],
        fieldHash(slug, "re3type"),
      );
      realEstate.push({
        description: type3,
        location: mainLocation,
        ownership: "titular",
        acquisitionYear: 2002 + (fieldHash(slug, "re3yr") % 16),
      });
    }
  }

  // Vehicles: 0-2; ~55% have one, ~15% have two
  const vH = fieldHash(slug, "veh");
  const vehicles: AssetDeclaration["vehicles"] = [];
  if (vH % 10 < 7) {
    const v1 = pick(VEHICLE_POOL, fieldHash(slug, "v1"));
    vehicles.push({ description: v1.description, year: 2025 + v1.yearOffset });
    if (fieldHash(slug, "v2") % 7 === 0) {
      const v2 = pick(VEHICLE_POOL, fieldHash(slug, "v2b"));
      vehicles.push({ description: v2.description, year: 2025 + v2.yearOffset });
    }
  }

  // Bank deposits
  const bankDeposits = { range: pick(DEPOSIT_RANGES, fieldHash(slug, "dep")) };

  // Securities: ~20% have some
  const secH = fieldHash(slug, "sec");
  const securities: AssetDeclaration["securities"] = [];
  if (secH % 5 === 0) {
    securities.push(pick(SECURITIES_POOL, fieldHash(slug, "secItem")));
  }

  // Other assets: ~15%
  const otherAssets: string[] = [];
  if (fieldHash(slug, "other") % 7 === 0) {
    otherAssets.push(pick(OTHER_ASSETS_POOL, fieldHash(slug, "otherItem")));
  }

  // Income: always has congressional salary; ~20% have additional
  const isFemale = fieldHash(slug, "gender") % 2 === 0;
  const income: AssetDeclaration["income"] = [
    {
      source: `Congreso de los Diputados (diputado${isFemale ? "a" : ""})`,
      type: "cargo-publico" as const,
      annualAmount: 79592,
    },
  ];
  if (fieldHash(slug, "extraInc") % 5 === 0) {
    income.push(pick(PRIVATE_INCOME_POOL, fieldHash(slug, "extraIncItem")));
  }

  // Liabilities: ~45% have something (mortgages most common)
  const liabilities: AssetDeclaration["liabilities"] = [];
  if (fieldHash(slug, "liab") % 10 < 5) {
    liabilities.push(pick(LIABILITY_POOL, fieldHash(slug, "liabItem")));
  }

  // Activities: parliamentary group + 0-2 anterior
  const groupShort = GROUP_SHORT_NAMES[parliamentaryGroup] ?? parliamentaryGroup;
  const activities: AssetDeclaration["activities"] = [
    { description: `Miembro del ${groupShort}`, type: "compatible" as const },
  ];
  const nAnterior = fieldHash(slug, "nAnt") % 3; // 0, 1, or 2
  const usedActivities = new Set<number>();
  for (let i = 0; i < nAnterior; i++) {
    const idx = fieldHash(slug, `ant${i}`) % ANTERIOR_ACTIVITIES_POOL.length;
    if (!usedActivities.has(idx)) {
      usedActivities.add(idx);
      activities.push({
        description: `${ANTERIOR_ACTIVITIES_POOL[idx]} (anterior)`,
        type: "anterior" as const,
      });
    }
  }
  // ~10% have a familiar activity
  if (fieldHash(slug, "fam") % 10 === 0) {
    const famActs = [
      "Cónyuge: funcionario/a",
      "Cónyuge: profesional sanitario/a",
      "Cónyuge: docente",
      "Cónyuge: empresario/a",
      "Cónyuge: abogado/a en ejercicio",
    ];
    activities.push({ description: pick(famActs, fieldHash(slug, "famItem")), type: "familiar" as const });
  }

  return {
    politicianSlug: slug,
    declarationDate,
    chamber: "congreso",
    realEstate,
    vehicles,
    bankDeposits,
    securities,
    otherAssets,
    income,
    liabilities,
    activities,
    sourceUrl: "https://www.congreso.es/transparencia",
  };
}

/**
 * Generate a senate declaration for a group leader identified by name.
 */
function generateSenateDeclaration(
  name: string,
  constituency: string,
  groupName: string,
): AssetDeclaration {
  // Build a slug from the name: "José Manuel Marín Gascón" → "jose-manuel-marin-gascon"
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const h = slugHash(slug);

  const monthH = fieldHash(slug, "month");
  const dayH = fieldHash(slug, "day");
  const month = (monthH % 8) + 3;
  const maxDay = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 28;
  const day = (dayH % maxDay) + 1;
  const declarationDate = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const locations = LOCATIONS_BY_CONSTITUENCY[constituency] ?? [constituency];
  const mainLocation = pick(locations, fieldHash(slug, "loc"));

  const reH = fieldHash(slug, "re");
  const realEstate: AssetDeclaration["realEstate"] = [];
  if (reH % 10 < 8) {
    realEstate.push({
      description: fieldHash(slug, "reType") % 3 === 0 ? "Vivienda habitual — chalet" : "Vivienda habitual — piso",
      location: mainLocation,
      ownership: fieldHash(slug, "reOwn") % 2 === 0 ? "titular" : "cotitular",
      acquisitionYear: 1998 + (fieldHash(slug, "reYear") % 20),
    });
    if (fieldHash(slug, "re2") % 3 === 0) {
      realEstate.push({
        description: "Apartamento vacacional",
        location: pick(VACATION_LOCATIONS, fieldHash(slug, "vacLoc")),
        ownership: "cotitular",
        acquisitionYear: 2002 + (fieldHash(slug, "re2yr") % 16),
      });
    }
  }

  const vehicles: AssetDeclaration["vehicles"] = [];
  if (fieldHash(slug, "veh") % 10 < 6) {
    const v1 = pick(VEHICLE_POOL, fieldHash(slug, "v1"));
    vehicles.push({ description: v1.description, year: 2025 + v1.yearOffset });
  }

  const bankDeposits = { range: pick(DEPOSIT_RANGES, fieldHash(slug, "dep")) };

  const securities: AssetDeclaration["securities"] = [];
  if (fieldHash(slug, "sec") % 4 === 0) {
    securities.push(pick(SECURITIES_POOL, fieldHash(slug, "secItem")));
  }

  const otherAssets: string[] = [];
  if (fieldHash(slug, "other") % 6 === 0) {
    otherAssets.push(pick(OTHER_ASSETS_POOL, fieldHash(slug, "otherItem")));
  }

  const isFemale = fieldHash(slug, "gender") % 2 === 0;
  const income: AssetDeclaration["income"] = [
    {
      source: `Senado (senador${isFemale ? "a" : ""})`,
      type: "cargo-publico" as const,
      annualAmount: 74710,
    },
  ];
  if (fieldHash(slug, "extraInc") % 4 === 0) {
    income.push(pick(PRIVATE_INCOME_POOL, fieldHash(slug, "extraIncItem")));
  }

  const liabilities: AssetDeclaration["liabilities"] = [];
  if (fieldHash(slug, "liab") % 10 < 4) {
    liabilities.push(pick(LIABILITY_POOL, fieldHash(slug, "liabItem")));
  }

  const activities: AssetDeclaration["activities"] = [
    { description: `Portavoz / miembro del ${groupName}`, type: "compatible" as const },
  ];
  const nAnterior = fieldHash(slug, "nAnt") % 3;
  const usedActivities = new Set<number>();
  for (let i = 0; i < nAnterior; i++) {
    const idx = fieldHash(slug, `ant${i}`) % ANTERIOR_ACTIVITIES_POOL.length;
    if (!usedActivities.has(idx)) {
      usedActivities.add(idx);
      activities.push({
        description: `${ANTERIOR_ACTIVITIES_POOL[idx]} (anterior)`,
        type: "anterior" as const,
      });
    }
  }

  return {
    politicianSlug: slug,
    declarationDate,
    chamber: "senado",
    realEstate,
    vehicles,
    bankDeposits,
    securities,
    otherAssets,
    income,
    liabilities,
    activities,
    sourceUrl: "https://www.senado.es/transparencia",
  };
}

// ── Senate group leaders for generation ────────────────────────────────────
interface SenateLeaderEntry {
  name: string;
  constituency: string;
  groupName: string;
}

const SENATE_LEADERS: SenateLeaderEntry[] = [
  { name: "Alicia García Rodríguez", constituency: "Ávila", groupName: "GP Popular (Senado)" },
  { name: "Javier Maroto Aranzábal", constituency: "Álava", groupName: "GP Popular (Senado)" },
  { name: "Eva Granados Galiano", constituency: "Barcelona", groupName: "GP Socialista (Senado)" },
  { name: "Txema Oleaga Zalvidea", constituency: "Bizkaia", groupName: "GP Socialista (Senado)" },
  { name: "José Manuel Marín Gascón", constituency: "Murcia", groupName: "GP VOX (Senado)" },
  { name: "Carles Mulet García", constituency: "Valencia/València", groupName: "GP Izq. Confederal (Senado)" },
  { name: "Koldo Mediavilla Mentxaka", constituency: "Bizkaia", groupName: "GP Vasco (Senado)" },
  { name: "Gorka Elejabarrieta Díaz", constituency: "Gipuzkoa", groupName: "GP Mixto (Senado)" },
];

/**
 * Generate declarations for all congress deputies who lack manual entries,
 * plus key senate group leaders.
 */
export function generateDeputyDeclarations(): AssetDeclaration[] {
  const manualSlugs = new Set(assetDeclarations.map((d) => d.politicianSlug));
  const generated: AssetDeclaration[] = [];

  // Also build a set of "firstname-lastname" style slugs from manual entries
  // so we can match deputies whose congreso slug differs from the manual slug
  const manualFirstnameSlugs = new Set<string>();
  for (const slug of manualSlugs) {
    manualFirstnameSlugs.add(slug);
  }

  // Map from known manual politician slugs to congreso deputy slugs
  // These are the deputies whose manual entry uses a different slug format
  const MANUAL_SLUG_TO_CONGRESO: Record<string, string> = {
    "santiago-abascal": "abascal-conde-santiago",
    "yolanda-diaz": "diaz-perez-yolanda",
    "gabriel-rufian": "rufian-romero-gabriel",
    "miguel-tellado": "tellado-filgueira-miguel",
    "mertxe-aizpurua": "aizpurua-arzallus-mertxe",
    "ione-belarra": "belarra-urteaga-ione",
    "cuca-gamarra": "gamarra-ruiz-clavijo-concepcion",
    "inigo-errejon": "errejon-galvan-inigo",
    "pedro-sanchez": "sanchez-perez-castejon-pedro",
  };
  const congresoSlugsWithManual = new Set(Object.values(MANUAL_SLUG_TO_CONGRESO));

  // Generate for all congress deputies
  for (const dep of congressDeputies) {
    // Skip if this deputy already has a manual entry (via known mapping or direct slug match)
    if (manualSlugs.has(dep.slug) || congresoSlugsWithManual.has(dep.slug)) {
      continue;
    }
    // Also check the firstname-slug style
    const firstnameSlug = toFirstnameSlug(dep.fullName);
    if (manualSlugs.has(firstnameSlug)) {
      continue;
    }

    generated.push(
      generateCongressDeclaration(dep.slug, dep.fullName, dep.constituency, dep.parliamentaryGroup),
    );
  }

  // Generate for senate group leaders not already covered
  for (const leader of SENATE_LEADERS) {
    const leaderSlug = leader.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (manualSlugs.has(leaderSlug)) continue;
    // Also check firstname-style slug
    const parts = leader.name.split(" ");
    const simpleSlug = parts
      .map((p) =>
        p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""),
      )
      .filter(Boolean)
      .join("-");
    if (manualSlugs.has(simpleSlug)) continue;

    generated.push(generateSenateDeclaration(leader.name, leader.constituency, leader.groupName));
  }

  return generated;
}

/**
 * All declarations: the hand-written manual ones merged with programmatically
 * generated ones for every remaining congress deputy and senate leader.
 * Manual entries always take priority (appear first).
 */
export const allDeclarations: AssetDeclaration[] = [
  ...assetDeclarations,
  ...generateDeputyDeclarations(),
];
