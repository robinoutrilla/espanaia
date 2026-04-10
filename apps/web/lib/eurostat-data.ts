/* ═══════════════════════════════════════════════════════════════════════════
   Eurostat comparison data — Spain vs EU27 / peer countries.
   Based on Eurostat REST API indicators (seed 2026).
   ═══════════════════════════════════════════════════════════════════════════ */

export interface EuComparison {
  id: string;
  indicator: string;
  unit: string;
  category: "economia" | "empleo" | "social" | "deuda" | "digital" | "energia" | "educacion";
  spain: number;
  eu27: number;
  germany: number;
  france: number;
  italy: number;
  portugal: number;
  higherIsBetter: boolean;
  year: number;
  source: string;
}

export const euCategoryLabels: Record<string, string> = {
  economia: "Economía",
  empleo: "Empleo",
  social: "Social",
  deuda: "Deuda y déficit",
  digital: "Digital",
  energia: "Energía y clima",
  educacion: "Educación",
};

export const euCategoryColors: Record<string, string> = {
  economia: "#003da5",
  empleo: "#c8102e",
  social: "#009b3a",
  deuda: "#8e8e9a",
  digital: "#6b4c9a",
  energia: "#f1bf00",
  educacion: "#e87d00",
};

export const countryLabels: Record<string, string> = {
  spain: "España",
  eu27: "UE-27",
  germany: "Alemania",
  france: "Francia",
  italy: "Italia",
  portugal: "Portugal",
};

export const countryFlags: Record<string, string> = {
  spain: "🇪🇸",
  eu27: "🇪🇺",
  germany: "🇩🇪",
  france: "🇫🇷",
  italy: "🇮🇹",
  portugal: "🇵🇹",
};

export const euComparisons: EuComparison[] = [
  // ECONOMÍA
  {
    id: "eu-gdp-growth",
    indicator: "Crecimiento PIB",
    unit: "%",
    category: "economia",
    spain: 2.4,
    eu27: 1.4,
    germany: 0.8,
    france: 1.2,
    italy: 0.9,
    portugal: 2.1,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [nama_10_gdp]",
  },
  {
    id: "eu-gdp-capita",
    indicator: "PIB per cápita (PPA)",
    unit: "€",
    category: "economia",
    spain: 30990,
    eu27: 35820,
    germany: 44680,
    france: 37840,
    italy: 31420,
    portugal: 26840,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [nama_10_pc]",
  },
  {
    id: "eu-inflation",
    indicator: "Inflación (IPCA)",
    unit: "%",
    category: "economia",
    spain: 2.8,
    eu27: 2.4,
    germany: 2.2,
    france: 2.0,
    italy: 2.6,
    portugal: 2.4,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [prc_hicp_aind]",
  },
  // EMPLEO
  {
    id: "eu-unemployment",
    indicator: "Tasa de desempleo",
    unit: "%",
    category: "empleo",
    spain: 11.2,
    eu27: 5.9,
    germany: 3.4,
    france: 7.2,
    italy: 7.4,
    portugal: 6.2,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [une_rt_m]",
  },
  {
    id: "eu-youth-unemployment",
    indicator: "Paro juvenil (<25 años)",
    unit: "%",
    category: "empleo",
    spain: 26.4,
    eu27: 14.2,
    germany: 6.8,
    france: 16.8,
    italy: 22.4,
    portugal: 18.6,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [une_rt_m]",
  },
  {
    id: "eu-employment-rate",
    indicator: "Tasa de empleo (20-64)",
    unit: "%",
    category: "empleo",
    spain: 70.2,
    eu27: 75.4,
    germany: 80.6,
    france: 73.8,
    italy: 65.4,
    portugal: 76.8,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [lfsi_emp_a]",
  },
  // DEUDA
  {
    id: "eu-debt-gdp",
    indicator: "Deuda pública / PIB",
    unit: "%",
    category: "deuda",
    spain: 105.2,
    eu27: 82.4,
    germany: 62.8,
    france: 112.4,
    italy: 138.6,
    portugal: 98.4,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [gov_10dd_edpt1]",
  },
  {
    id: "eu-deficit",
    indicator: "Déficit público / PIB",
    unit: "%",
    category: "deuda",
    spain: -3.2,
    eu27: -2.8,
    germany: -1.4,
    france: -4.8,
    italy: -3.8,
    portugal: -0.8,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [gov_10dd_edpt1]",
  },
  // SOCIAL
  {
    id: "eu-poverty-risk",
    indicator: "Riesgo de pobreza o exclusión (AROPE)",
    unit: "%",
    category: "social",
    spain: 20.4,
    eu27: 21.6,
    germany: 20.8,
    france: 19.2,
    italy: 24.4,
    portugal: 20.0,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [ilc_peps01n]",
  },
  {
    id: "eu-gini",
    indicator: "Índice de Gini (desigualdad)",
    unit: "",
    category: "social",
    spain: 33.0,
    eu27: 29.6,
    germany: 29.2,
    france: 29.8,
    italy: 32.8,
    portugal: 32.4,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [ilc_di12]",
  },
  {
    id: "eu-life-expectancy",
    indicator: "Esperanza de vida al nacer",
    unit: "años",
    category: "social",
    spain: 83.6,
    eu27: 80.4,
    germany: 81.2,
    france: 82.8,
    italy: 83.2,
    portugal: 81.4,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [demo_mlexpec]",
  },
  // DIGITAL
  {
    id: "eu-desi",
    indicator: "Índice DESI (economía digital)",
    unit: "/100",
    category: "digital",
    spain: 62.4,
    eu27: 52.8,
    germany: 54.6,
    france: 56.2,
    italy: 48.4,
    portugal: 54.8,
    higherIsBetter: true,
    year: 2026,
    source: "Comisión Europea [DESI]",
  },
  {
    id: "eu-fiber",
    indicator: "Cobertura FTTH (fibra óptica)",
    unit: "%",
    category: "digital",
    spain: 94.2,
    eu27: 56.4,
    germany: 28.6,
    france: 68.4,
    italy: 52.8,
    portugal: 92.4,
    higherIsBetter: true,
    year: 2026,
    source: "Comisión Europea [Broadband]",
  },
  // ENERGÍA
  {
    id: "eu-renewables",
    indicator: "Energía renovable en consumo final",
    unit: "%",
    category: "energia",
    spain: 28.4,
    eu27: 24.8,
    germany: 22.6,
    france: 21.4,
    italy: 22.8,
    portugal: 34.2,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [nrg_ind_ren]",
  },
  {
    id: "eu-emissions",
    indicator: "Emisiones CO₂ per cápita",
    unit: "t",
    category: "energia",
    spain: 5.2,
    eu27: 6.4,
    germany: 7.8,
    france: 4.6,
    italy: 5.4,
    portugal: 4.2,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [env_air_gge]",
  },
  // EDUCACIÓN
  {
    id: "eu-tertiary",
    indicator: "Educación terciaria (25-34 años)",
    unit: "%",
    category: "educacion",
    spain: 50.8,
    eu27: 42.8,
    germany: 38.4,
    france: 50.2,
    italy: 30.2,
    portugal: 46.2,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [edat_lfse_03]",
  },
  {
    id: "eu-early-leavers",
    indicator: "Abandono escolar temprano",
    unit: "%",
    category: "educacion",
    spain: 12.8,
    eu27: 9.6,
    germany: 12.2,
    france: 7.8,
    italy: 11.4,
    portugal: 8.2,
    higherIsBetter: false,
    year: 2026,
    source: "Eurostat [edat_lfse_14]",
  },
  {
    id: "eu-rd-spending",
    indicator: "Gasto en I+D / PIB",
    unit: "%",
    category: "educacion",
    spain: 1.48,
    eu27: 2.28,
    germany: 3.14,
    france: 2.22,
    italy: 1.42,
    portugal: 1.68,
    higherIsBetter: true,
    year: 2026,
    source: "Eurostat [rd_e_gerdtot]",
  },
];

/** Get comparisons by category */
export function getComparisonsByCategory(category: string): EuComparison[] {
  return euComparisons.filter((c) => c.category === category);
}

/** Get Spain's rank within the comparison group for a given indicator */
export function getSpainRank(id: string): { rank: number; total: number; isBest: boolean } {
  const comp = euComparisons.find((c) => c.id === id);
  if (!comp) return { rank: 0, total: 0, isBest: false };
  const values = [
    { country: "spain", value: comp.spain },
    { country: "eu27", value: comp.eu27 },
    { country: "germany", value: comp.germany },
    { country: "france", value: comp.france },
    { country: "italy", value: comp.italy },
    { country: "portugal", value: comp.portugal },
  ];
  values.sort((a, b) => comp.higherIsBetter ? b.value - a.value : a.value - b.value);
  const rank = values.findIndex((v) => v.country === "spain") + 1;
  return { rank, total: values.length, isBest: rank === 1 };
}
