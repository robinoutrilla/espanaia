/* ═══════════════════════════════════════════════════════════════════════════
   Postal Code → CCAA/Province/Municipality lookup
   Spanish postal codes: first 2 digits = province code (01-52)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PostalLookup {
  ccaaSlug: string;
  province: string;
  municipality: string;
}

const PROVINCE_TO_CCAA: Record<string, PostalLookup> = {
  "01": { ccaaSlug: "pais-vasco", province: "Álava", municipality: "Vitoria-Gasteiz" },
  "02": { ccaaSlug: "castilla-la-mancha", province: "Albacete", municipality: "Albacete" },
  "03": { ccaaSlug: "valencia", province: "Alicante", municipality: "Alicante" },
  "04": { ccaaSlug: "andalucia", province: "Almería", municipality: "Almería" },
  "05": { ccaaSlug: "castilla-y-leon", province: "Ávila", municipality: "Ávila" },
  "06": { ccaaSlug: "extremadura", province: "Badajoz", municipality: "Badajoz" },
  "07": { ccaaSlug: "illes-balears", province: "Illes Balears", municipality: "Palma" },
  "08": { ccaaSlug: "cataluna", province: "Barcelona", municipality: "Barcelona" },
  "09": { ccaaSlug: "castilla-y-leon", province: "Burgos", municipality: "Burgos" },
  "10": { ccaaSlug: "extremadura", province: "Cáceres", municipality: "Cáceres" },
  "11": { ccaaSlug: "andalucia", province: "Cádiz", municipality: "Cádiz" },
  "12": { ccaaSlug: "valencia", province: "Castellón", municipality: "Castellón de la Plana" },
  "13": { ccaaSlug: "castilla-la-mancha", province: "Ciudad Real", municipality: "Ciudad Real" },
  "14": { ccaaSlug: "andalucia", province: "Córdoba", municipality: "Córdoba" },
  "15": { ccaaSlug: "galicia", province: "A Coruña", municipality: "A Coruña" },
  "16": { ccaaSlug: "castilla-la-mancha", province: "Cuenca", municipality: "Cuenca" },
  "17": { ccaaSlug: "cataluna", province: "Girona", municipality: "Girona" },
  "18": { ccaaSlug: "andalucia", province: "Granada", municipality: "Granada" },
  "19": { ccaaSlug: "castilla-la-mancha", province: "Guadalajara", municipality: "Guadalajara" },
  "20": { ccaaSlug: "pais-vasco", province: "Gipuzkoa", municipality: "Donostia-San Sebastián" },
  "21": { ccaaSlug: "andalucia", province: "Huelva", municipality: "Huelva" },
  "22": { ccaaSlug: "aragon", province: "Huesca", municipality: "Huesca" },
  "23": { ccaaSlug: "andalucia", province: "Jaén", municipality: "Jaén" },
  "24": { ccaaSlug: "castilla-y-leon", province: "León", municipality: "León" },
  "25": { ccaaSlug: "cataluna", province: "Lleida", municipality: "Lleida" },
  "26": { ccaaSlug: "la-rioja", province: "La Rioja", municipality: "Logroño" },
  "27": { ccaaSlug: "galicia", province: "Lugo", municipality: "Lugo" },
  "28": { ccaaSlug: "madrid", province: "Madrid", municipality: "Madrid" },
  "29": { ccaaSlug: "andalucia", province: "Málaga", municipality: "Málaga" },
  "30": { ccaaSlug: "murcia", province: "Murcia", municipality: "Murcia" },
  "31": { ccaaSlug: "navarra", province: "Navarra", municipality: "Pamplona" },
  "32": { ccaaSlug: "galicia", province: "Ourense", municipality: "Ourense" },
  "33": { ccaaSlug: "asturias", province: "Asturias", municipality: "Oviedo" },
  "34": { ccaaSlug: "castilla-y-leon", province: "Palencia", municipality: "Palencia" },
  "35": { ccaaSlug: "canarias", province: "Las Palmas", municipality: "Las Palmas de Gran Canaria" },
  "36": { ccaaSlug: "galicia", province: "Pontevedra", municipality: "Pontevedra" },
  "37": { ccaaSlug: "castilla-y-leon", province: "Salamanca", municipality: "Salamanca" },
  "38": { ccaaSlug: "canarias", province: "Santa Cruz de Tenerife", municipality: "Santa Cruz de Tenerife" },
  "39": { ccaaSlug: "cantabria", province: "Cantabria", municipality: "Santander" },
  "40": { ccaaSlug: "castilla-y-leon", province: "Segovia", municipality: "Segovia" },
  "41": { ccaaSlug: "andalucia", province: "Sevilla", municipality: "Sevilla" },
  "42": { ccaaSlug: "castilla-y-leon", province: "Soria", municipality: "Soria" },
  "43": { ccaaSlug: "cataluna", province: "Tarragona", municipality: "Tarragona" },
  "44": { ccaaSlug: "aragon", province: "Teruel", municipality: "Teruel" },
  "45": { ccaaSlug: "castilla-la-mancha", province: "Toledo", municipality: "Toledo" },
  "46": { ccaaSlug: "valencia", province: "Valencia", municipality: "Valencia" },
  "47": { ccaaSlug: "castilla-y-leon", province: "Valladolid", municipality: "Valladolid" },
  "48": { ccaaSlug: "pais-vasco", province: "Bizkaia", municipality: "Bilbao" },
  "49": { ccaaSlug: "castilla-y-leon", province: "Zamora", municipality: "Zamora" },
  "50": { ccaaSlug: "aragon", province: "Zaragoza", municipality: "Zaragoza" },
  "51": { ccaaSlug: "ceuta", province: "Ceuta", municipality: "Ceuta" },
  "52": { ccaaSlug: "melilla", province: "Melilla", municipality: "Melilla" },
};

export function lookupPostalCode(cp: string): PostalLookup | null {
  const clean = cp.replace(/\s/g, "");
  if (!/^\d{5}$/.test(clean)) return null;
  const prefix = clean.slice(0, 2);
  return PROVINCE_TO_CCAA[prefix] ?? null;
}

export function isValidPostalCode(cp: string): boolean {
  return lookupPostalCode(cp) !== null;
}
