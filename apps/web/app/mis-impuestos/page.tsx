"use client";
import { useState, useMemo, useEffect } from "react";
import { SiteHeader } from "../../components/site-header";
import { lookupPostalCode } from "../../lib/postal-codes";
import { getCcaaInitiatives, getMunicipalInitiatives, type FiscalInitiative } from "../../lib/fiscal-initiatives";
import { getContractsForTerritory, getSubsidiesForTerritory, contractTypeLabels, contractTypeColors, contractStatusLabels, type PublicContract, type PublicSubsidy } from "../../lib/contracts-data";

/* ═══════════════════════════════════════════════════════════════════════════
   /mis-impuestos — "¿En qué se gasta tu dinero?"
   Interactive tax calculator: user inputs their declared income + CCAA,
   and sees a full breakdown of where every euro of their taxes goes.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── IRPF State brackets (tramo estatal) 2024 ──────────────────────────────
const STATE_BRACKETS = [
  { upTo: 12450, rate: 0.095 },
  { upTo: 20200, rate: 0.12 },
  { upTo: 35200, rate: 0.15 },
  { upTo: 60000, rate: 0.185 },
  { upTo: 300000, rate: 0.225 },
  { upTo: Infinity, rate: 0.245 },
];

// ── IRPF Autonomic brackets by CCAA (tramo autonómico) 2024 ──────────────
// Simplified: most CCAA follow a standard scale with minor variations.
// País Vasco and Navarra have foral regimes (different system entirely).
type CcaaId = string;

interface CcaaInfo {
  name: string;
  brackets: { upTo: number; rate: number }[];
  foral?: boolean; // Foral regime (PV, Navarra)
  spendingOverrides?: Partial<Record<string, number>>; // spending % overrides
}

const CCAA_DATA: Record<CcaaId, CcaaInfo> = {
  andalucia: {
    name: "Andalucía",
    brackets: [
      { upTo: 13000, rate: 0.095 },
      { upTo: 21000, rate: 0.12 },
      { upTo: 36200, rate: 0.15 },
      { upTo: 60000, rate: 0.185 },
      { upTo: 120000, rate: 0.225 },
      { upTo: Infinity, rate: 0.245 },
    ],
  },
  aragon: {
    name: "Aragón",
    brackets: [
      { upTo: 12450, rate: 0.10 },
      { upTo: 20200, rate: 0.125 },
      { upTo: 34000, rate: 0.155 },
      { upTo: 50000, rate: 0.19 },
      { upTo: 70000, rate: 0.21 },
      { upTo: 90000, rate: 0.225 },
      { upTo: 150000, rate: 0.245 },
      { upTo: Infinity, rate: 0.25 },
    ],
  },
  asturias: {
    name: "Asturias",
    brackets: [
      { upTo: 12450, rate: 0.10 },
      { upTo: 17707, rate: 0.12 },
      { upTo: 33007, rate: 0.14 },
      { upTo: 53407, rate: 0.185 },
      { upTo: 70000, rate: 0.215 },
      { upTo: 90000, rate: 0.225 },
      { upTo: 175000, rate: 0.25 },
      { upTo: Infinity, rate: 0.255 },
    ],
  },
  balears: {
    name: "Illes Balears",
    brackets: [
      { upTo: 10000, rate: 0.095 },
      { upTo: 18000, rate: 0.115 },
      { upTo: 30000, rate: 0.145 },
      { upTo: 48000, rate: 0.175 },
      { upTo: 70000, rate: 0.20 },
      { upTo: 90000, rate: 0.225 },
      { upTo: 175000, rate: 0.245 },
      { upTo: Infinity, rate: 0.25 },
    ],
  },
  canarias: {
    name: "Canarias",
    brackets: [
      { upTo: 12450, rate: 0.09 },
      { upTo: 17707, rate: 0.115 },
      { upTo: 33007, rate: 0.14 },
      { upTo: 53407, rate: 0.185 },
      { upTo: 90000, rate: 0.235 },
      { upTo: Infinity, rate: 0.24 },
    ],
  },
  cantabria: {
    name: "Cantabria",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.12 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 60000, rate: 0.185 },
      { upTo: 90000, rate: 0.215 },
      { upTo: Infinity, rate: 0.245 },
    ],
  },
  "castilla-leon": {
    name: "Castilla y León",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.12 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 53407, rate: 0.185 },
      { upTo: Infinity, rate: 0.215 },
    ],
  },
  "castilla-la-mancha": {
    name: "Castilla-La Mancha",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.12 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 60000, rate: 0.185 },
      { upTo: Infinity, rate: 0.225 },
    ],
  },
  cataluna: {
    name: "Cataluña",
    brackets: [
      { upTo: 12450, rate: 0.105 },
      { upTo: 17707, rate: 0.12 },
      { upTo: 33007, rate: 0.15 },
      { upTo: 53407, rate: 0.185 },
      { upTo: 90000, rate: 0.215 },
      { upTo: 120000, rate: 0.235 },
      { upTo: 175000, rate: 0.245 },
      { upTo: Infinity, rate: 0.255 },
    ],
  },
  extremadura: {
    name: "Extremadura",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.12 },
      { upTo: 35200, rate: 0.155 },
      { upTo: 60000, rate: 0.19 },
      { upTo: 80000, rate: 0.225 },
      { upTo: Infinity, rate: 0.245 },
    ],
  },
  galicia: {
    name: "Galicia",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.115 },
      { upTo: 35200, rate: 0.145 },
      { upTo: 60000, rate: 0.185 },
      { upTo: Infinity, rate: 0.225 },
    ],
  },
  madrid: {
    name: "Comunidad de Madrid",
    brackets: [
      { upTo: 12450, rate: 0.085 },
      { upTo: 17707, rate: 0.108 },
      { upTo: 33007, rate: 0.128 },
      { upTo: 53407, rate: 0.179 },
      { upTo: Infinity, rate: 0.21 },
    ],
  },
  murcia: {
    name: "Región de Murcia",
    brackets: [
      { upTo: 12450, rate: 0.095 },
      { upTo: 20200, rate: 0.12 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 60000, rate: 0.185 },
      { upTo: Infinity, rate: 0.235 },
    ],
  },
  navarra: {
    name: "Navarra (Foral)",
    foral: true,
    brackets: [
      { upTo: 4230, rate: 0.13 },
      { upTo: 8382, rate: 0.22 },
      { upTo: 17882, rate: 0.25 },
      { upTo: 31882, rate: 0.28 },
      { upTo: 47882, rate: 0.365 },
      { upTo: 68882, rate: 0.39 },
      { upTo: 102882, rate: 0.42 },
      { upTo: 172882, rate: 0.44 },
      { upTo: 302882, rate: 0.47 },
      { upTo: Infinity, rate: 0.49 },
    ],
  },
  "pais-vasco": {
    name: "País Vasco (Foral)",
    foral: true,
    brackets: [
      { upTo: 17360, rate: 0.23 },
      { upTo: 34360, rate: 0.28 },
      { upTo: 52360, rate: 0.35 },
      { upTo: 72360, rate: 0.40 },
      { upTo: 102360, rate: 0.45 },
      { upTo: 177360, rate: 0.46 },
      { upTo: Infinity, rate: 0.49 },
    ],
  },
  rioja: {
    name: "La Rioja",
    brackets: [
      { upTo: 12450, rate: 0.09 },
      { upTo: 20200, rate: 0.115 },
      { upTo: 35200, rate: 0.15 },
      { upTo: 50000, rate: 0.185 },
      { upTo: 65000, rate: 0.215 },
      { upTo: 80000, rate: 0.225 },
      { upTo: 120000, rate: 0.245 },
      { upTo: Infinity, rate: 0.27 },
    ],
  },
  valencia: {
    name: "Comunitat Valenciana",
    brackets: [
      { upTo: 12450, rate: 0.10 },
      { upTo: 17707, rate: 0.12 },
      { upTo: 33007, rate: 0.14 },
      { upTo: 53407, rate: 0.18 },
      { upTo: 80000, rate: 0.225 },
      { upTo: 120000, rate: 0.245 },
      { upTo: 175000, rate: 0.255 },
      { upTo: Infinity, rate: 0.295 },
    ],
  },
};

// ── Spending categories (PGE 2024 + CCAA functional classification) ───────

interface SpendingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  percentOfState: number;   // % of state budget
  percentOfCcaa: number;    // % of CCAA budget
  examples: string[];
}

const SPENDING: SpendingCategory[] = [
  {
    id: "pensiones",
    name: "Pensiones",
    icon: "👴",
    color: "#dc2626",
    description: "Pensiones contributivas (jubilación, viudedad, incapacidad), no contributivas y complementos a mínimos",
    percentOfState: 38.5,
    percentOfCcaa: 0,
    examples: ["11.4M de pensionistas", "Pensión media: 1.260€/mes", "Gasto total: ~190.000M€"],
  },
  {
    id: "sanidad",
    name: "Sanidad",
    icon: "🏥",
    color: "#059669",
    description: "Hospitales, atención primaria, urgencias, farmacia, salud pública y prevención",
    percentOfState: 1.8,
    percentOfCcaa: 34.5,
    examples: ["468 hospitales públicos", "3.041 centros de salud", "~84.000M€ gasto total SNS"],
  },
  {
    id: "educacion",
    name: "Educación",
    icon: "📚",
    color: "#2563eb",
    description: "Infantil, primaria, secundaria, FP, universidad pública, becas e investigación educativa",
    percentOfState: 1.2,
    percentOfCcaa: 24.0,
    examples: ["8.2M de alumnos", "700.000 docentes", "~60.000M€ gasto total"],
  },
  {
    id: "deuda",
    name: "Deuda pública (intereses)",
    icon: "📊",
    color: "#6b7280",
    description: "Pago de intereses de la deuda pública del Estado y amortizaciones",
    percentOfState: 8.2,
    percentOfCcaa: 2.5,
    examples: ["Deuda: 109% del PIB", "~1.6 billones €", "Tipo medio: ~2.1%"],
  },
  {
    id: "desempleo",
    name: "Prestaciones por desempleo",
    icon: "📋",
    color: "#ea580c",
    description: "Prestaciones contributivas, subsidios, renta activa de inserción y formación para el empleo",
    percentOfState: 5.8,
    percentOfCcaa: 0,
    examples: ["~1.8M de beneficiarios", "Prestación media: 930€/mes", "SEPE gestiona"],
  },
  {
    id: "defensa",
    name: "Defensa",
    icon: "🛡️",
    color: "#475569",
    description: "Fuerzas Armadas, misiones internacionales, equipamiento militar, OTAN",
    percentOfState: 3.1,
    percentOfCcaa: 0,
    examples: ["120.000 militares", "Misiones: Líbano, Mali, Letonia", "~1.2% del PIB"],
  },
  {
    id: "seguridad",
    name: "Seguridad ciudadana y justicia",
    icon: "👮",
    color: "#1e40af",
    description: "Policía Nacional, Guardia Civil, instituciones penitenciarias, tribunales, fiscalía, justicia gratuita",
    percentOfState: 4.2,
    percentOfCcaa: 3.0,
    examples: ["~80.000 policías nacionales", "~75.000 guardias civiles", "~60.000 funcionarios de justicia"],
  },
  {
    id: "infraestructuras",
    name: "Infraestructuras y transportes",
    icon: "🚄",
    color: "#7c3aed",
    description: "Carreteras, AVE, puertos, aeropuertos, metro, cercanías, mantenimiento de la red viaria",
    percentOfState: 3.2,
    percentOfCcaa: 5.5,
    examples: ["17.000 km red estatal", "3.800 km de AVE", "49 aeropuertos AENA", "Circuito F1 Madrid (~480M€)"],
  },
  {
    id: "vivienda",
    name: "Vivienda y urbanismo",
    icon: "🏠",
    color: "#a16207",
    description: "Plan estatal de vivienda, alquiler social, SEPES, rehabilitación edificatoria, bono joven alquiler",
    percentOfState: 0.6,
    percentOfCcaa: 2.0,
    examples: ["Plan Vivienda 2022-2025", "Bono alquiler joven: 250€/mes", "SEPES: suelo público"],
  },
  {
    id: "servicios-sociales",
    name: "Servicios sociales",
    icon: "🤝",
    color: "#be185d",
    description: "Dependencia, discapacidad, IMV, protección a familias, inclusión social, menores",
    percentOfState: 3.2,
    percentOfCcaa: 8.5,
    examples: ["~700.000 beneficiarios IMV", "~1.4M con dependencia", "Servicios de acogida"],
  },
  {
    id: "investigacion",
    name: "Investigación e innovación",
    icon: "🔬",
    color: "#0891b2",
    description: "I+D civil, CSIC, universidades, programas europeos Horizonte, transferencia tecnológica",
    percentOfState: 2.8,
    percentOfCcaa: 2.0,
    examples: ["~1.4% del PIB en I+D", "CSIC: 120 centros", "Horizonte Europa"],
  },
  {
    id: "transferencias-ccaa",
    name: "Transferencias a CCAA",
    icon: "🗺️",
    color: "#b45309",
    description: "Financiación autonómica: fondo de suficiencia, nivelación, convergencia, cooperación y fondos REACT-UE",
    percentOfState: 14.8,
    percentOfCcaa: 0,
    examples: ["Sistema de financiación autonómica", "Fondo de Garantía de Servicios Públicos", "~180.000M€/año"],
  },
  {
    id: "agricultura",
    name: "Agricultura, pesca y alimentación",
    icon: "🌾",
    color: "#65a30d",
    description: "PAC (Política Agraria Común), FEGA, pesca marítima, desarrollo rural, seguros agrarios, regadíos",
    percentOfState: 1.2,
    percentOfCcaa: 1.8,
    examples: ["~700.000 perceptores PAC", "FEGA: ~7.000M€/año", "Flota pesquera: ~9.000 buques"],
  },
  {
    id: "industria-turismo",
    name: "Industria, comercio y turismo",
    icon: "🏭",
    color: "#0369a1",
    description: "Política industrial, PERTE, ICEX, Turespaña, comercio interior y exterior, CDTI, ENISA",
    percentOfState: 1.0,
    percentOfCcaa: 1.2,
    examples: ["PERTE Chip: 12.400M€", "85M turistas/año", "ICEX: internacionalización"],
  },
  {
    id: "cultura-deporte",
    name: "Cultura y deporte",
    icon: "🎭",
    color: "#4f46e5",
    description: "Museos, bibliotecas, patrimonio cultural, CSD, deporte federado, industria cultural, propiedad intelectual",
    percentOfState: 0.8,
    percentOfCcaa: 3.0,
    examples: ["67 museos estatales", "Prado, Reina Sofía", "CSD, ADO", "Gran Premio F1 Madrid 2026"],
  },
  {
    id: "medioambiente",
    name: "Medio ambiente y agua",
    icon: "🌿",
    color: "#15803d",
    description: "Parques nacionales, gestión de residuos, depuración de aguas, prevención de incendios, biodiversidad",
    percentOfState: 1.0,
    percentOfCcaa: 3.0,
    examples: ["16 parques nacionales", "Gestión hidráulica", "Plan forestal contra incendios"],
  },
  {
    id: "energia",
    name: "Energía y transición ecológica",
    icon: "⚡",
    color: "#ca8a04",
    description: "IDAE, subvenciones renovables, PNIEC 2030, eficiencia energética, hidrógeno verde, bono social",
    percentOfState: 0.6,
    percentOfCcaa: 1.0,
    examples: ["Plan PNIEC 2030", "MOVES III: coches eléctricos", "Bono social eléctrico"],
  },
  {
    id: "digitalizacion",
    name: "Digitalización y telecomunicaciones",
    icon: "💻",
    color: "#6d28d9",
    description: "España Digital 2026, Kit Digital pymes, despliegue 5G, SEDIA, ciberseguridad (INCIBE), IA",
    percentOfState: 0.5,
    percentOfCcaa: 0.4,
    examples: ["Kit Digital: hasta 12.000€/pyme", "Cobertura 5G: 75% población", "INCIBE: ciberseguridad"],
  },
  {
    id: "accion-exterior",
    name: "Acción exterior y UE",
    icon: "🌍",
    color: "#9333ea",
    description: "Servicio exterior, cooperación al desarrollo, contribución al presupuesto de la UE, consulados, AECID",
    percentOfState: 4.2,
    percentOfCcaa: 0,
    examples: ["Contribución UE: ~15.000M€", "AECID: cooperación", "118 embajadas"],
  },
  {
    id: "igualdad",
    name: "Igualdad y contra la violencia de género",
    icon: "⚖️",
    color: "#db2777",
    description: "Pacto de Estado contra violencia de género, 016, centros de atención, políticas de igualdad, diversidad",
    percentOfState: 0.15,
    percentOfCcaa: 0.5,
    examples: ["Línea 016: atención 24h", "Pacto de Estado VG", "~1.000 centros de atención"],
  },
  {
    id: "inmigracion",
    name: "Inmigración y asilo",
    icon: "🛂",
    color: "#0e7490",
    description: "Acogida de refugiados, CETI Ceuta/Melilla, integración, Oficina de Asilo, extranjería",
    percentOfState: 0.25,
    percentOfCcaa: 0.2,
    examples: ["OAR: Oficina de Asilo", "CETI Ceuta y Melilla", "Programa de acogida humanitaria"],
  },
  {
    id: "funcion-publica",
    name: "Empleo público y MUFACE",
    icon: "🏢",
    color: "#57534e",
    description: "MUFACE (mutualidad de funcionarios), clases pasivas, formación del empleado público, INAP",
    percentOfState: 0.35,
    percentOfCcaa: 1.0,
    examples: ["~1.5M de funcionarios mutualizados", "MUFACE, MUGEJU, ISFAS", "Clases pasivas"],
  },
  {
    id: "proteccion-civil",
    name: "Protección civil y emergencias",
    icon: "🚒",
    color: "#b91c1c",
    description: "UME, bomberos, protección civil, catástrofes naturales (DANA, incendios), Consorcio de Seguros",
    percentOfState: 0.2,
    percentOfCcaa: 0.5,
    examples: ["UME: 3.600 efectivos", "Emergencia DANA 2024", "112: emergencias"],
  },
  {
    id: "casa-real",
    name: "Casa Real",
    icon: "👑",
    color: "#a3a3a3",
    description: "Presupuesto de la Casa de S.M. el Rey: funcionamiento, viajes oficiales, seguridad, personal",
    percentOfState: 0.02,
    percentOfCcaa: 0,
    examples: ["Presupuesto 2025: 8.4M€", "Familia Real", "Actos oficiales y viajes de Estado"],
  },
  {
    id: "otros",
    name: "Otros gastos y administración general",
    icon: "🏛️",
    color: "#78716c",
    description: "Órganos constitucionales (Congreso, Senado, TC, CGPJ, Defensor del Pueblo), servicios comunes, imprevistos",
    percentOfState: 2.33,
    percentOfCcaa: 5.4,
    examples: ["Congreso: ~120M€", "Senado: ~70M€", "Tribunal Constitucional, CGPJ, Defensor del Pueblo"],
  },
];

// ── Mínimo personal IRPF ──────────────────────────────────────────────────
const MINIMO_PERSONAL = 5550; // 2024

// ── Tax calculation ───────────────────────────────────────────────────────

function calcBracketTax(base: number, brackets: { upTo: number; rate: number }[]): number {
  let tax = 0;
  let remaining = base;
  let prev = 0;
  for (const bracket of brackets) {
    const chunk = Math.min(remaining, bracket.upTo - prev);
    if (chunk <= 0) break;
    tax += chunk * bracket.rate;
    remaining -= chunk;
    prev = bracket.upTo;
  }
  return tax;
}

interface TaxResult {
  baseImponible: number;
  baseLiquidable: number;
  cuotaEstatal: number;
  cuotaAutonomica: number;
  cuotaTotal: number;
  tipoEfectivo: number;
  isForal: boolean;
  ccaaName: string;
}

function calculateIRPF(baseImponible: number, ccaaId: CcaaId): TaxResult {
  const ccaa = CCAA_DATA[ccaaId];
  if (!ccaa) throw new Error("CCAA no encontrada");

  const baseLiquidable = Math.max(0, baseImponible - MINIMO_PERSONAL);

  if (ccaa.foral) {
    // Foral regime: single unified scale, no state/autonomic split
    const cuotaTotal = calcBracketTax(baseLiquidable, ccaa.brackets);
    return {
      baseImponible,
      baseLiquidable,
      cuotaEstatal: 0,
      cuotaAutonomica: cuotaTotal,
      cuotaTotal,
      tipoEfectivo: baseImponible > 0 ? (cuotaTotal / baseImponible) * 100 : 0,
      isForal: true,
      ccaaName: ccaa.name,
    };
  }

  const cuotaEstatal = calcBracketTax(baseLiquidable, STATE_BRACKETS);
  const cuotaAutonomica = calcBracketTax(baseLiquidable, ccaa.brackets);
  const cuotaTotal = cuotaEstatal + cuotaAutonomica;

  return {
    baseImponible,
    baseLiquidable,
    cuotaEstatal,
    cuotaAutonomica,
    cuotaTotal,
    tipoEfectivo: baseImponible > 0 ? (cuotaTotal / baseImponible) * 100 : 0,
    isForal: false,
    ccaaName: ccaa.name,
  };
}

// ── Spending breakdown ────────────────────────────────────────────────────

interface SpendingItem {
  category: SpendingCategory;
  amount: number;
  perDay: number;
  perMonth: number;
}

function calculateSpending(tax: TaxResult): SpendingItem[] {
  // For common regime: state portion goes to state categories, autonomic to CCAA categories
  // For foral regime: we approximate a 60/40 state/ccaa split
  const statePortion = tax.isForal ? tax.cuotaTotal * 0.55 : tax.cuotaEstatal;
  const ccaaPortion = tax.isForal ? tax.cuotaTotal * 0.45 : tax.cuotaAutonomica;

  // Normalize spending percentages
  const totalStatePercent = SPENDING.reduce((s, c) => s + c.percentOfState, 0);
  const totalCcaaPercent = SPENDING.reduce((s, c) => s + c.percentOfCcaa, 0);

  return SPENDING.map(cat => {
    const fromState = statePortion * (cat.percentOfState / totalStatePercent);
    const fromCcaa = ccaaPortion * (cat.percentOfCcaa / totalCcaaPercent);
    const amount = fromState + fromCcaa;
    return {
      category: cat,
      amount,
      perDay: amount / 365,
      perMonth: amount / 12,
    };
  })
    .filter(item => item.amount > 0.01)
    .sort((a, b) => b.amount - a.amount);
}

// ── Format helpers ────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

// ── Component ─────────────────────────────────────────────────────────────

export default function MisImpuestosPage() {
  const [income, setIncome] = useState("");
  const [ccaa, setCcaa] = useState("madrid");
  const [submitted, setSubmitted] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [province, setProvince] = useState("");

  // Auto-detect CCAA from postal code
  useEffect(() => {
    if (postalCode.replace(/\s/g, "").length === 5) {
      const lookup = lookupPostalCode(postalCode);
      if (lookup) {
        setCcaa(lookup.ccaaSlug);
        setMunicipality(lookup.municipality);
        setProvince(lookup.province);
        setSubmitted(false);
      }
    }
  }, [postalCode]);

  const ccaaInitiatives = useMemo(() => getCcaaInitiatives(ccaa), [ccaa]);
  const municipalInitiatives = useMemo(() => getMunicipalInitiatives(municipality), [municipality]);

  // Estimate savings from each initiative based on amount string
  const estimateSaving = (amount: string, taxResult: TaxResult | null): number => {
    if (!taxResult) return 0;
    const s = amount.replace(/\./g, "").replace(/,/g, ".");
    // "30 %, hasta 6.000 €" → use the cap
    const capMatch = s.match(/hasta\s+([\d.]+)\s*€/i);
    // "15 %" or "20 %, hasta X"
    const pctMatch = s.match(/([\d.]+)\s*%/);
    // "1.500 €" or "300 € por hijo" or "582-910 €"
    const fixedMatch = s.match(/([\d.]+)\s*€/);
    const rangeMatch = s.match(/([\d.]+)-([\d.]+)\s*€/);

    if (capMatch && pctMatch) {
      const pct = parseFloat(pctMatch[1]) / 100;
      const cap = parseFloat(capMatch[1]);
      return Math.min(taxResult.cuotaAutonomica * pct, cap);
    }
    if (pctMatch && !capMatch) {
      const pct = parseFloat(pctMatch[1]) / 100;
      return Math.min(taxResult.cuotaAutonomica * pct, taxResult.cuotaAutonomica * 0.3);
    }
    if (rangeMatch) {
      return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
    }
    if (fixedMatch) {
      return parseFloat(fixedMatch[1]);
    }
    return 0;
  };

  // Map ccaaSlug to territory slug used in contracts (handle valencia → comunitat-valenciana)
  const territorySlug = useMemo(() => {
    const SLUG_MAP: Record<string, string> = { valencia: "comunitat-valenciana" };
    return SLUG_MAP[ccaa] ?? ccaa;
  }, [ccaa]);
  const localContracts = useMemo(() => getContractsForTerritory(territorySlug), [territorySlug]);
  const localSubsidies = useMemo(() => getSubsidiesForTerritory(territorySlug), [territorySlug]);

  const tax = useMemo(() => {
    const val = parseFloat(income.replace(/\./g, "").replace(",", "."));
    if (!val || val <= 0 || !submitted) return null;
    return calculateIRPF(val, ccaa);
  }, [income, ccaa, submitted]);

  const ccaaSavings = useMemo(() => {
    if (!tax) return { items: [] as { id: string; saving: number }[], total: 0 };
    const items = ccaaInitiatives.map((ini) => ({ id: ini.id, saving: estimateSaving(ini.amount, tax) }));
    return { items, total: items.reduce((s, i) => s + i.saving, 0) };
  }, [ccaaInitiatives, tax]);

  const municipalSavings = useMemo(() => {
    if (!tax) return { items: [] as { id: string; saving: number }[], total: 0 };
    const items = municipalInitiatives.map((ini) => ({ id: ini.id, saving: estimateSaving(ini.amount, tax) }));
    return { items, total: items.reduce((s, i) => s + i.saving, 0) };
  }, [municipalInitiatives, tax]);

  const totalSavings = ccaaSavings.total + municipalSavings.total;

  const spending = useMemo(() => {
    if (!tax) return [];
    return calculateSpending(tax);
  }, [tax]);

  const maxSpending = spending.length > 0 ? spending[0].amount : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const sortedCcaa = Object.entries(CCAA_DATA).sort((a, b) =>
    a[1].name.localeCompare(b[1].name, "es")
  );

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="mis-impuestos" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">Transparencia fiscal ciudadana</span>
            <h1 className="detail-title">
              ¿En qué se gasta tu dinero?
            </h1>
            <p className="detail-description">
              Introduce lo que declaraste a Hacienda y descubre exactamente
              a qué se destina cada euro de tus impuestos: pensiones, sanidad,
              educación, defensa, deuda pública y más.
            </p>
          </div>

          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Datos clave 2024</h2>
            <div className="kpi-grid">
              <div className="kpi-cell">
                <strong style={{ color: "var(--rojo)" }}>38.5%</strong>
                <span>Pensiones</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--verde)" }}>~18%</strong>
                <span>Sanidad (CCAA)</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--azul)" }}>~12%</strong>
                <span>Educación (CCAA)</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--ink-muted)" }}>109%</strong>
                <span>Deuda / PIB</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Input form ────────────────────────────────────────────── */}
      <section className="panel section-panel" id="calculadora">
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--space-sm)", textAlign: "center" }}>
            Calcula tu contribución
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", textAlign: "center", marginBottom: "var(--space-lg)" }}>
            Introduce tu <strong>base imponible general</strong> del IRPF
            (casilla 435 de la declaración de la renta) y tu comunidad autónoma.
          </p>

          <form onSubmit={handleSubmit} style={{
            display: "flex", flexDirection: "column", gap: "var(--space-md)",
            padding: "var(--space-lg)", borderRadius: "12px",
            background: "var(--surface-raised, var(--surface))",
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
              {/* Income input */}
              <div style={{ flex: "1 1 280px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px", color: "var(--ink-soft)" }}>
                  Base imponible general (€)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={income}
                    onChange={(e) => {
                      setSubmitted(false);
                      setIncome(e.target.value);
                    }}
                    placeholder="Ej: 35.000"
                    style={{
                      width: "100%", padding: "12px 40px 12px 16px",
                      fontSize: "1.1rem", fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      borderRadius: "8px", border: "2px solid var(--border)",
                      background: "var(--bg)", color: "var(--ink)",
                      outline: "none", transition: "border-color 200ms",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--azul)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  />
                  <span style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: "1rem", fontWeight: 700, color: "var(--ink-muted)",
                  }}>€</span>
                </div>
              </div>

              {/* Postal code input */}
              <div style={{ flex: "0 0 140px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px", color: "var(--ink-soft)" }}>
                  Código postal
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setPostalCode(v);
                  }}
                  placeholder="28001"
                  style={{
                    width: "100%", padding: "12px 16px",
                    fontSize: "1.1rem", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    borderRadius: "8px",
                    border: `2px solid ${postalCode.length === 5 && !lookupPostalCode(postalCode) ? "var(--rojo)" : "var(--border)"}`,
                    background: "var(--bg)", color: "var(--ink)",
                    outline: "none", transition: "border-color 200ms",
                    letterSpacing: "2px", textAlign: "center",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--azul)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = postalCode.length === 5 && !lookupPostalCode(postalCode) ? "var(--rojo)" : "var(--border)"}
                />
                {postalCode.length === 5 && lookupPostalCode(postalCode) && (
                  <span style={{ fontSize: "0.7rem", color: "var(--verde)", marginTop: 2, display: "block" }}>
                    {province}
                  </span>
                )}
                {postalCode.length === 5 && !lookupPostalCode(postalCode) && (
                  <span style={{ fontSize: "0.7rem", color: "var(--rojo)", marginTop: 2, display: "block" }}>
                    CP no válido
                  </span>
                )}
              </div>

              {/* CCAA selector */}
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px", color: "var(--ink-soft)" }}>
                  Comunidad Autónoma
                </label>
                <select
                  value={ccaa}
                  onChange={(e) => { setCcaa(e.target.value); setMunicipality(""); setProvince(""); setPostalCode(""); setSubmitted(false); }}
                  style={{
                    width: "100%", padding: "12px 16px",
                    fontSize: "0.95rem", fontWeight: 600,
                    borderRadius: "8px", border: "2px solid var(--border)",
                    background: "var(--bg)", color: "var(--ink)",
                    outline: "none", cursor: "pointer",
                  }}
                >
                  {sortedCcaa.map(([id, info]) => (
                    <option key={id} value={id}>{info.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick presets */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>Ejemplos:</span>
              {[15000, 25000, 35000, 50000, 75000, 120000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => { setIncome(fmtInt(val)); setSubmitted(false); }}
                  style={{
                    padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600,
                    borderRadius: "6px", border: "1px solid var(--border)",
                    background: income.replace(/\./g, "") === String(val) ? "var(--azul)" : "transparent",
                    color: income.replace(/\./g, "") === String(val) ? "#fff" : "var(--ink-soft)",
                    cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  {fmtInt(val)}€
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{
                padding: "14px 32px", fontSize: "1rem", fontWeight: 700,
                borderRadius: "10px", border: "none",
                background: "var(--azul)", color: "#fff",
                cursor: "pointer", transition: "transform 100ms, opacity 150ms",
                alignSelf: "center", minWidth: 220,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Calcular
            </button>
          </form>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────────── */}
      {tax && (
        <>
          {/* Tax summary */}
          <section className="panel section-panel" style={{ animation: "fadeIn 400ms ease" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "var(--space-md)", textAlign: "center" }}>
              Tu contribución fiscal en {tax.ccaaName}
            </h2>

            {tax.isForal && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px", marginBottom: "var(--space-md)",
                background: "#fef3c7", border: "1px solid #f59e0b", fontSize: "0.82rem",
                color: "#92400e", textAlign: "center",
              }}>
                <strong>Régimen foral:</strong> {tax.ccaaName} tiene su propio sistema tributario.
                La recaudación no se divide entre Estado y CCAA de la misma forma.
                Los datos de gasto son aproximaciones.
              </div>
            )}

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--space-md)", maxWidth: 800, margin: "0 auto",
            }}>
              <SummaryCard
                label="Base imponible"
                value={`${fmt(tax.baseImponible)} €`}
                sub="Lo que declaraste"
                color="var(--ink)"
              />
              <SummaryCard
                label="IRPF total"
                value={`${fmt(tax.cuotaTotal)} €`}
                sub={`Tipo efectivo: ${fmt(tax.tipoEfectivo)}%`}
                color="var(--rojo)"
                highlight
              />
              {!tax.isForal && (
                <>
                  <SummaryCard
                    label="Tramo estatal"
                    value={`${fmt(tax.cuotaEstatal)} €`}
                    sub={`${fmt((tax.cuotaEstatal / Math.max(tax.cuotaTotal, 1)) * 100)}% del total`}
                    color="var(--azul)"
                  />
                  <SummaryCard
                    label="Tramo autonómico"
                    value={`${fmt(tax.cuotaAutonomica)} €`}
                    sub={tax.ccaaName}
                    color="var(--verde)"
                  />
                </>
              )}
              <SummaryCard
                label="Al día"
                value={`${fmt(tax.cuotaTotal / 365)} €`}
                sub="Cada día contribuyes"
                color="var(--oro)"
              />
              <SummaryCard
                label="Al mes"
                value={`${fmt(tax.cuotaTotal / 12)} €`}
                sub="Media mensual"
                color="#7c3aed"
              />
            </div>
          </section>

          {/* ── Visual Charts ─────────────────────────────────── */}
          <section className="panel section-panel" style={{ animation: "fadeIn 500ms ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-lg)", maxWidth: 1000, margin: "0 auto" }}>

              {/* Donut Chart */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "var(--space-md)", color: "var(--ink)" }}>Distribucion de tu IRPF</h3>
                <svg viewBox="0 0 200 200" width="220" height="220" style={{ margin: "0 auto", display: "block" }}>
                  {(() => {
                    const top6 = spending.slice(0, 6);
                    const otherTotal = spending.slice(6).reduce((s, i) => s + i.amount, 0);
                    const items = [...top6, ...(otherTotal > 0 ? [{ category: { name: "Otros", color: "#9ca3af", id: "otros", icon: "", description: "", examples: [] }, amount: otherTotal, perMonth: otherTotal / 12 }] : [])];
                    const total = items.reduce((s, i) => s + i.amount, 0);
                    let cumulative = 0;
                    const R = 70; const CX = 100; const CY = 100;
                    return items.map((item, i) => {
                      const pct = total > 0 ? item.amount / total : 0;
                      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      cumulative += pct;
                      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      const largeArc = pct > 0.5 ? 1 : 0;
                      const x1 = CX + R * Math.cos(startAngle);
                      const y1 = CY + R * Math.sin(startAngle);
                      const x2 = CX + R * Math.cos(endAngle);
                      const y2 = CY + R * Math.sin(endAngle);
                      if (pct < 0.005) return null;
                      return (
                        <g key={i}>
                          <path
                            d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.category.color}
                            stroke="var(--bg)"
                            strokeWidth="2"
                            style={{ transition: "opacity 0.2s", cursor: "pointer" }}
                          >
                            <title>{item.category.name}: {fmt(item.amount)} euros ({(pct * 100).toFixed(1)}%)</title>
                          </path>
                        </g>
                      );
                    });
                  })()}
                  <circle cx="100" cy="100" r="40" fill="var(--bg)" />
                  <text x="100" y="96" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--ink)">{fmt(tax.cuotaTotal)}</text>
                  <text x="100" y="112" textAnchor="middle" fontSize="8" fill="var(--ink-muted)">euros IRPF</text>
                </svg>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginTop: "var(--space-sm)" }}>
                  {spending.slice(0, 6).map(item => (
                    <span key={item.category.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--ink-muted)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.category.color, display: "inline-block" }} />
                      {item.category.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tax Bracket Chart */}
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "var(--space-md)", textAlign: "center", color: "var(--ink)" }}>Tramos IRPF (escala estatal)</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {STATE_BRACKETS.map((bracket, i) => {
                    const prevLimit = i > 0 ? STATE_BRACKETS[i - 1].upTo : 0;
                    const isActive = tax.baseImponible > prevLimit;
                    const isCurrent = tax.baseImponible > prevLimit && (bracket.upTo === Infinity || tax.baseImponible <= bracket.upTo);
                    const fillPct = !isActive ? 0 : bracket.upTo === Infinity ? 100 : Math.min(100, ((Math.min(tax.baseImponible, bracket.upTo) - prevLimit) / (bracket.upTo - prevLimit)) * 100);
                    const label = bracket.upTo === Infinity ? `${fmtInt(prevLimit)}+ euros` : `${fmtInt(prevLimit)} - ${fmtInt(bracket.upTo)} euros`;
                    return (
                      <div key={i} style={{
                        padding: "8px 12px", borderRadius: 8,
                        border: isCurrent ? "2px solid var(--azul)" : "1px solid var(--border)",
                        background: isCurrent ? "var(--azul)08" : "var(--bg)",
                        opacity: isActive ? 1 : 0.4,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                          <span style={{ color: "var(--ink)", fontWeight: isCurrent ? 700 : 400 }}>{label}</span>
                          <span style={{ fontWeight: 700, color: isCurrent ? "var(--azul)" : "var(--ink-muted)" }}>{(bracket.rate * 2 * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            background: isCurrent ? "var(--azul)" : isActive ? "#059669" : "transparent",
                            width: `${fillPct}%`,
                            animation: "growBar 600ms ease-out",
                          }} />
                        </div>
                        {isCurrent && (
                          <div style={{ fontSize: "0.7rem", color: "var(--azul)", marginTop: 3, fontWeight: 600 }}>
                            Tu renta esta aqui
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Spending breakdown */}
          <section className="panel section-panel" style={{ animation: "fadeIn 600ms ease" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "4px", textAlign: "center" }}>
              ¿A dónde va cada euro?
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", textAlign: "center", marginBottom: "var(--space-lg)" }}>
              Desglose de tus {fmt(tax.cuotaTotal)} € de IRPF por partida de gasto público
            </p>

            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {spending.map((item, i) => (
                <SpendingRow key={item.category.id} item={item} maxAmount={maxSpending} rank={i + 1} />
              ))}
            </div>

            {/* Total check */}
            <div style={{
              marginTop: "var(--space-lg)", padding: "16px", borderRadius: "10px",
              background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              maxWidth: 900, margin: "var(--space-lg) auto 0",
              flexWrap: "wrap", gap: "8px",
            }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                Total IRPF distribuido
              </span>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--rojo)" }}>
                {fmt(spending.reduce((s, i) => s + i.amount, 0))} €
              </span>
            </div>
          </section>

          {/* Context section */}
          <section className="panel section-panel" style={{ animation: "fadeIn 800ms ease" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "var(--space-md)", textAlign: "center" }}>
              Para ponerlo en contexto
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-md)", maxWidth: 800, margin: "0 auto",
            }}>
              <ContextCard
                icon="☕"
                label="Cafés al día"
                value={fmt(tax.cuotaTotal / 365 / 1.5)}
                sub="a 1,50€ el café"
              />
              <ContextCard
                icon="🍕"
                label="Pizzas al mes"
                value={fmtInt(Math.floor(tax.cuotaTotal / 12 / 10))}
                sub="a 10€ la pizza"
              />
              <ContextCard
                icon="🎬"
                label="Entradas de cine al año"
                value={fmtInt(Math.floor(tax.cuotaTotal / 9))}
                sub="a 9€ la entrada"
              />
              <ContextCard
                icon="⛽"
                label="Depósitos de gasolina"
                value={fmtInt(Math.floor(tax.cuotaTotal / 75))}
                sub="a 75€ el depósito"
              />
              <ContextCard
                icon="📱"
                label="Meses de Netflix"
                value={fmtInt(Math.floor(tax.cuotaTotal / 13))}
                sub="a 12,99€/mes"
              />
              <ContextCard
                icon="🏠"
                label="Meses de alquiler medio"
                value={fmt(tax.cuotaTotal / 900)}
                sub="a 900€/mes"
              />
            </div>
          </section>

          {/* ── Fiscal Initiatives Section ── */}
          {(ccaaInitiatives.length > 0 || municipalInitiatives.length > 0) && (
            <section className="panel section-panel" style={{ animation: "fadeIn 800ms ease", maxWidth: 900, margin: "0 auto var(--space-xl)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--azul)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Iniciativas fiscales en tu zona
                </span>
                <h2 style={{ fontSize: "1.15rem", marginTop: 4 }}>
                  {CCAA_DATA[ccaa as CcaaId]?.name ?? ccaa}
                  {municipality ? ` / ${municipality}` : ""}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", maxWidth: 550, margin: "4px auto 0" }}>
                  Deducciones y bonificaciones que podrían aplicarse a tu declaración según tu comunidad autónoma y municipio.
                </p>
              </div>

              {/* Total Savings Summary */}
              {tax && totalSavings > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
                  marginBottom: "var(--space-lg)", padding: "16px 20px",
                  borderRadius: "12px", background: "linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)",
                  border: "1px solid #bbf7d0",
                }}>
                  <div style={{ textAlign: "center", minWidth: 140 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                      Ahorro total estimado
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#15803d" }}>
                      {totalSavings.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#166534" }}>
                      si aplicas todas las deducciones
                    </div>
                  </div>
                  {ccaaSavings.total > 0 && municipalSavings.total > 0 && (
                    <>
                      <div style={{ width: 1, background: "#bbf7d0", alignSelf: "stretch" }} />
                      <div style={{ textAlign: "center", minWidth: 120 }}>
                        <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#2563eb", textTransform: "uppercase", marginBottom: 2 }}>CCAA</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2563eb" }}>
                          {ccaaSavings.total.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
                        </div>
                      </div>
                      <div style={{ width: 1, background: "#bbf7d0", alignSelf: "stretch" }} />
                      <div style={{ textAlign: "center", minWidth: 120 }}>
                        <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#b45309", textTransform: "uppercase", marginBottom: 2 }}>Municipal</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#b45309" }}>
                          {municipalSavings.total.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
                        </div>
                      </div>
                    </>
                  )}
                  {tax.cuotaTotal > 0 && (
                    <>
                      <div style={{ width: 1, background: "#bbf7d0", alignSelf: "stretch" }} />
                      <div style={{ textAlign: "center", minWidth: 120 }}>
                        <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#15803d", textTransform: "uppercase", marginBottom: 2 }}>% sobre tu IRPF</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#15803d" }}>
                          {((totalSavings / tax.cuotaTotal) * 100).toFixed(1)} {"%"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* CCAA Deductions */}
              {ccaaInitiatives.length > 0 && (
                <div style={{ marginBottom: "var(--space-lg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-sm)" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                      Deducciones autonómicas IRPF
                    </h3>
                    {tax && ccaaSavings.total > 0 && (
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb" }}>
                        {"≈ "}{ccaaSavings.total.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {ccaaInitiatives.map((ini) => {
                      const saving = ccaaSavings.items.find((i) => i.id === ini.id)?.saving ?? 0;
                      return <InitiativeCard key={ini.id} initiative={ini} estimatedSaving={tax ? saving : undefined} />;
                    })}
                  </div>
                </div>
              )}

              {/* Municipal Bonifications */}
              {municipalInitiatives.length > 0 && (
                <div style={{ marginBottom: "var(--space-md)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-sm)" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                      Bonificaciones municipales — {municipality}
                    </h3>
                    {tax && municipalSavings.total > 0 && (
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#b45309" }}>
                        {"≈ "}{municipalSavings.total.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {municipalInitiatives.map((ini) => {
                      const saving = municipalSavings.items.find((i) => i.id === ini.id)?.saving ?? 0;
                      return <InitiativeCard key={ini.id} initiative={ini} estimatedSaving={tax ? saving : undefined} />;
                    })}
                  </div>
                </div>
              )}

              {municipality && municipalInitiatives.length === 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", textAlign: "center", padding: "var(--space-md) 0" }}>
                  No tenemos datos de bonificaciones específicas para {municipality}.
                  Consulta la web de tu ayuntamiento para conocer las bonificaciones locales.
                </p>
              )}

              <p style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textAlign: "center", marginTop: "var(--space-sm)" }}>
                {"ⓘ"} Datos orientativos basados en normativa 2024-2025. Consulta la agencia tributaria de tu CCAA y tu ayuntamiento para confirmar requisitos y importes.
              </p>
            </section>
          )}

          {/* ── Public Contracts & Subsidies by territory ── */}
          {postalCode.length === 5 && lookupPostalCode(postalCode) && (localContracts.length > 0 || localSubsidies.length > 0) && (
            <section className="panel section-panel" style={{ animation: "fadeIn 800ms ease", maxWidth: 900, margin: "0 auto var(--space-xl)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--rojo)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {"📍"} Contratos y subvenciones en tu zona
                </span>
                <h2 style={{ fontSize: "1.15rem", marginTop: 4 }}>
                  {CCAA_DATA[ccaa as CcaaId]?.name ?? ccaa}
                  {municipality ? ` / ${municipality}` : ""}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--ink-soft)", maxWidth: 600, margin: "4px auto 0" }}>
                  Proyectos de infraestructura y programas de inversión pública que afectan a tu territorio. Así se gasta tu dinero.
                </p>
              </div>

              {/* Contracts */}
              {localContracts.length > 0 && (
                <div style={{ marginBottom: "var(--space-lg)" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: "var(--space-sm)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {"🏗️"} Contratos públicos ({localContracts.length})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {localContracts.map((c) => (
                      <ContractCard key={c.id} contract={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Subsidies */}
              {localSubsidies.length > 0 && (
                <div style={{ marginBottom: "var(--space-md)" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: "var(--space-sm)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {"💰"} Subvenciones e inversiones ({localSubsidies.length})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {localSubsidies.map((s) => (
                      <SubsidyCard key={s.id} subsidy={s} />
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textAlign: "center", marginTop: "var(--space-sm)" }}>
                {"ⓘ"} Datos basados en la Plataforma de Contratación del Sector Público y el BOE. Importes en millones de euros.
              </p>
            </section>
          )}

          {/* Methodology */}
          <section className="panel section-panel" style={{ animation: "fadeIn 1000ms ease", maxWidth: 800, margin: "0 auto var(--space-xl)" }}>
            <details style={{ cursor: "pointer" }}>
              <summary style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "var(--space-sm)" }}>
                Metodología y fuentes
              </summary>
              <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <p><strong>Tramos IRPF:</strong> Escala estatal y autonómica 2024 según la Ley 35/2006 del IRPF
                  y normativa de cada CCAA. Se aplica el mínimo personal de {fmtInt(MINIMO_PERSONAL)}€.</p>
                <p><strong>Distribución del gasto:</strong> Basada en los Presupuestos Generales del Estado (PGE) 2024
                  y presupuestos medios de las CCAA por clasificación funcional. Fuentes: IGAE, Ministerio de Hacienda, INE.</p>
                <p><strong>Régimen foral:</strong> País Vasco y Navarra tienen su propio IRPF (sin división estatal/autonómica).
                  Se estima un reparto 55/45 a efectos de visualización del gasto.</p>
                <p><strong>Limitaciones:</strong> Este cálculo es una estimación educativa. No incluye deducciones personales,
                  IVA, impuestos especiales ni cotizaciones a la Seguridad Social (que financian gran parte de las pensiones).
                  Los porcentajes de gasto son aproximaciones agregadas.</p>
                <p>
                  <strong>Fuentes:</strong> BOE, Ministerio de Hacienda, IGAE, INE, Eurostat, AEAT, AIReF.
                  Todos los datos son de acceso público.
                </p>
              </div>
            </details>
          </section>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growBar {
          from { width: 0%; }
        }
      `}</style>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color, highlight }: {
  label: string; value: string; sub: string; color: string; highlight?: boolean;
}) {
  return (
    <div style={{
      padding: "16px", borderRadius: "10px",
      background: highlight ? `${color}10` : "var(--surface-raised, var(--surface))",
      border: highlight ? `2px solid ${color}` : "1px solid var(--border)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.3rem", fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginTop: "2px" }}>
        {sub}
      </div>
    </div>
  );
}

function SpendingRow({ item, maxAmount, rank }: { item: SpendingItem; maxAmount: number; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const pct = (item.amount / maxAmount) * 100;
  const totalPct = pct;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "32px 1fr",
      gap: "12px",
      padding: "14px 16px",
      borderRadius: "10px",
      background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--border)",
      alignItems: "start",
    }}>
      {/* Icon */}
      <div style={{
        fontSize: "1.4rem", width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {item.category.icon}
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              #{rank}
            </span>
            <strong style={{ fontSize: "0.9rem" }}>{item.category.name}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>
              {fmt(item.perMonth)}€/mes
            </span>
            <strong style={{ fontSize: "1.05rem", fontVariantNumeric: "tabular-nums", color: item.category.color }}>
              {fmt(item.amount)} €
            </strong>
          </div>
        </div>

        {/* Bar */}
        <div style={{
          height: "6px", borderRadius: "3px", background: "var(--border)",
          overflow: "hidden", margin: "6px 0",
        }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: item.category.color,
            width: `${pct}%`,
            animation: "growBar 800ms ease-out",
            transition: "width 300ms ease",
          }} />
        </div>

        {/* Description */}
        <p style={{ fontSize: "0.76rem", color: "var(--ink-soft)", margin: "4px 0 0", lineHeight: 1.4 }}>
          {item.category.description}
        </p>

        {/* Examples */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
          {item.category.examples.map((ex, i) => (
            <span key={i} className="micro-tag" style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>
              {ex}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none", border: "none", padding: "4px 0 0", cursor: "pointer",
            color: item.category.color, fontSize: "0.78rem", fontWeight: 600,
          }}
        >
          {expanded ? "Ocultar detalle ▲" : "Ver detalle ▼"}
        </button>

        {expanded && (
          <div style={{
            marginTop: 8, padding: 12, borderRadius: 8,
            background: item.category.color + "08", fontSize: "0.82rem",
            lineHeight: 1.6, color: "var(--ink)",
            animation: "fadeIn 200ms ease",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase" }}>Anual</div>
                <div style={{ fontWeight: 700, color: item.category.color }}>{fmt(item.amount)} euros</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase" }}>Mensual</div>
                <div style={{ fontWeight: 700, color: item.category.color }}>{fmt(item.perMonth)} euros</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase" }}>Diario</div>
                <div style={{ fontWeight: 700 }}>{fmt(item.amount / 365)} euros</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase" }}>% de tu IRPF</div>
                <div style={{ fontWeight: 700 }}>{fmt(pct)}%</div>
              </div>
            </div>
            <p style={{ margin: 0, color: "var(--ink-muted)", fontSize: "0.8rem" }}>
              {item.category.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContextCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div style={{
      padding: "16px", borderRadius: "10px",
      background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--border)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--azul)", fontVariantNumeric: "tabular-nums", margin: "4px 0" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>{sub}</div>
    </div>
  );
}

const INITIATIVE_COLORS: Record<string, { bg: string; fg: string }> = {
  "deduccion-irpf": { bg: "rgba(0,82,204,0.08)", fg: "var(--azul)" },
  "bonificacion-ibi": { bg: "rgba(0,155,58,0.08)", fg: "var(--verde)" },
  "subvencion": { bg: "rgba(230,126,34,0.08)", fg: "#e67e22" },
  "exencion": { bg: "rgba(142,68,173,0.08)", fg: "#8e44ad" },
  "programa": { bg: "rgba(41,128,185,0.08)", fg: "#2980b9" },
};

const INITIATIVE_LABELS: Record<string, string> = {
  "deduccion-irpf": "Deducción IRPF",
  "bonificacion-ibi": "Bonificación IBI",
  "subvencion": "Subvención",
  "exencion": "Exención",
  "programa": "Programa",
};

function InitiativeCard({ initiative: ini, estimatedSaving }: { initiative: FiscalInitiative; estimatedSaving?: number }) {
  const color = INITIATIVE_COLORS[ini.type] ?? { bg: "var(--surface)", fg: "var(--ink)" };
  return (
    <div style={{
      padding: "14px 16px", borderRadius: "10px",
      background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--border)",
      borderLeft: `4px solid ${color.fg}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: "1.1rem" }}>{ini.icon}</span>
        <span style={{
          fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
          padding: "2px 8px", borderRadius: "4px",
          background: color.bg, color: color.fg,
        }}>
          {INITIATIVE_LABELS[ini.type] ?? ini.type}
        </span>
      </div>
      <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: 4 }}>{ini.title}</strong>
      <p style={{ fontSize: "0.76rem", color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 6px" }}>
        {ini.description}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: color.fg }}>
          {ini.amount}
        </span>
        {estimatedSaving !== undefined && estimatedSaving > 0 && (
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, color: "#15803d",
            padding: "2px 8px", borderRadius: "4px",
            background: "#dcfce7",
          }}>
            {"≈ "}{estimatedSaving.toLocaleString("es-ES", { maximumFractionDigits: 0 })} {"€"}
          </span>
        )}
      </div>
      <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.4 }}>
        {ini.requirements}
      </div>
    </div>
  );
}

const CONTRACT_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  adjudicado: { bg: "#dcfce7", fg: "#15803d" },
  "en-licitacion": { bg: "#fef3c7", fg: "#b45309" },
  desierto: { bg: "#fee2e2", fg: "#dc2626" },
  resuelto: { bg: "#e0e7ff", fg: "#4338ca" },
};

function ContractCard({ contract: c }: { contract: PublicContract }) {
  const statusColor = CONTRACT_STATUS_COLORS[c.status] ?? { bg: "var(--surface)", fg: "var(--ink)" };
  const typeColor = contractTypeColors[c.contractType] ?? "#666";
  return (
    <div style={{
      padding: "14px 16px", borderRadius: "10px",
      background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--border)",
      borderLeft: `4px solid ${typeColor}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 6 }}>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
          padding: "2px 7px", borderRadius: "4px",
          background: `${typeColor}18`, color: typeColor,
        }}>
          {contractTypeLabels[c.contractType]}
        </span>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
          padding: "2px 7px", borderRadius: "4px",
          background: statusColor.bg, color: statusColor.fg,
        }}>
          {contractStatusLabels[c.status]}
        </span>
      </div>
      <strong style={{ fontSize: "0.82rem", display: "block", marginBottom: 4, lineHeight: 1.3 }}>{c.title}</strong>
      <p style={{ fontSize: "0.74rem", color: "var(--ink-soft)", lineHeight: 1.45, margin: "0 0 8px" }}>
        {c.summary}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: typeColor }}>
          {c.amountM >= 1000 ? `${(c.amountM / 1000).toFixed(1).replace(".0", "")}B€` : `${c.amountM.toLocaleString("es-ES")}M€`}
        </span>
        {c.duration && (
          <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>{c.duration}</span>
        )}
      </div>
      <div style={{ fontSize: "0.68rem", color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.4 }}>
        <span style={{ fontWeight: 600 }}>{c.entity}</span>
        {c.contractor && <> {"→"} {c.contractor}</>}
      </div>
      {c.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {c.tags.slice(0, 4).map((t) => (
            <span key={t} style={{ fontSize: "0.58rem", padding: "1px 6px", borderRadius: "3px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const SUBSIDY_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  concedida: { bg: "#dcfce7", fg: "#15803d" },
  "en-tramite": { bg: "#fef3c7", fg: "#b45309" },
  justificada: { bg: "#e0e7ff", fg: "#4338ca" },
};

function SubsidyCard({ subsidy: s }: { subsidy: PublicSubsidy }) {
  const statusColor = SUBSIDY_STATUS_COLORS[s.status] ?? { bg: "var(--surface)", fg: "var(--ink)" };
  return (
    <div style={{
      padding: "14px 16px", borderRadius: "10px",
      background: "var(--surface-raised, var(--surface))",
      border: "1px solid var(--border)",
      borderLeft: "4px solid #2563eb",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: "4px", background: "#eff6ff", color: "#2563eb" }}>
          Subvención
        </span>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
          padding: "2px 7px", borderRadius: "4px",
          background: statusColor.bg, color: statusColor.fg,
        }}>
          {s.status === "concedida" ? "Concedida" : s.status === "en-tramite" ? "En trámite" : "Justificada"}
        </span>
      </div>
      <strong style={{ fontSize: "0.82rem", display: "block", marginBottom: 4, lineHeight: 1.3 }}>{s.title}</strong>
      <p style={{ fontSize: "0.74rem", color: "var(--ink-soft)", lineHeight: 1.45, margin: "0 0 8px" }}>
        {s.summary}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#2563eb" }}>
          {s.amountM >= 1000 ? `${(s.amountM / 1000).toFixed(1).replace(".0", "")}B€` : `${s.amountM.toLocaleString("es-ES")}M€`}
        </span>
        <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>{s.publicationDate}</span>
      </div>
      <div style={{ fontSize: "0.68rem", color: "var(--ink-muted)", marginTop: 6 }}>
        <span style={{ fontWeight: 600 }}>{s.grantingBody}</span>
      </div>
      {s.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {s.tags.slice(0, 4).map((t) => (
            <span key={t} style={{ fontSize: "0.58rem", padding: "1px 6px", borderRadius: "3px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
