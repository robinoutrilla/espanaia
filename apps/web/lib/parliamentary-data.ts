/* ═══════════════════════════════════════════════════════════════════════════
   Parliamentary structure data — Congress, Senate & CCAA parliaments.
   Hierarchy, roles, seat counts and representation percentages.
   Based on XV Legislature composition (seed 2026-04-10).
   ═══════════════════════════════════════════════════════════════════════════ */

export type ChamberType = "congreso" | "senado";
export type MemberRole =
  | "presidente"
  | "vicepresidente"
  | "portavoz"
  | "portavoz-adjunto"
  | "secretario"
  | "vocal"
  | "diputado"
  | "senador";

export interface GroupMember {
  name: string;
  role: MemberRole;
  constituency?: string;
  politicianSlug?: string; // links to seed politician if exists
}

export interface ParliamentaryGroup {
  id: string;
  chamber: ChamberType;
  name: string;
  shortName: string;
  partySlug: string;
  seats: number;
  totalChamberSeats: number;
  representationPct: number; // seats / totalChamberSeats * 100
  leadership: GroupMember[];
}

export interface CcaaParliament {
  territorySlug: string;
  name: string;
  totalSeats: number;
  groups: CcaaParliamentGroup[];
  governingCoalition: string[];
  presidentName: string;
  presidentParty: string;
}

export interface CcaaParliamentGroup {
  partySlug: string;
  partyName: string;
  acronym: string;
  seats: number;
  representationPct: number;
  isGoverning: boolean;
}

/* ══════════════════════════════════════════════════════════════════════════
   CONGRESS — Congreso de los Diputados (350 seats, XV Legislature)
   ══════════════════════════════════════════════════════════════════════════ */

export const CONGRESS_TOTAL_SEATS = 350;

export const congressGroups: ParliamentaryGroup[] = [
  {
    id: "cg-popular",
    chamber: "congreso",
    name: "Grupo Parlamentario Popular en el Congreso",
    shortName: "GP Popular",
    partySlug: "pp",
    seats: 137,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 39.1,
    leadership: [
      { name: "Miguel Tellado Filgueira", role: "portavoz", constituency: "A Coruña", politicianSlug: "miguel-tellado" },
      { name: "Cuca Gamarra Ruiz-Clavijo", role: "portavoz-adjunto", constituency: "La Rioja" },
      { name: "Elías Bendodo Benasayag", role: "secretario", constituency: "Málaga" },
      { name: "Ana Pastor Julián", role: "vicepresidente", constituency: "Pontevedra" },
    ],
  },
  {
    id: "cg-socialista",
    chamber: "congreso",
    name: "Grupo Parlamentario Socialista",
    shortName: "GP Socialista",
    partySlug: "psoe",
    seats: 120,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 34.3,
    leadership: [
      { name: "Pedro Sánchez Pérez-Castejón", role: "presidente", constituency: "Madrid", politicianSlug: "pedro-sanchez" },
      { name: "Patxi López Álvarez", role: "portavoz", constituency: "Bizkaia" },
      { name: "Santos Cerdán León", role: "secretario", constituency: "Navarra" },
    ],
  },
  {
    id: "cg-vox",
    chamber: "congreso",
    name: "Grupo Parlamentario VOX en el Congreso",
    shortName: "GP VOX",
    partySlug: "vox",
    seats: 33,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 9.4,
    leadership: [
      { name: "Santiago Abascal Conde", role: "presidente", constituency: "Madrid", politicianSlug: "santiago-abascal" },
      { name: "Iván Espinosa de los Monteros", role: "portavoz", constituency: "Madrid" },
      { name: "Pepa Millán Jaldón", role: "portavoz-adjunto", constituency: "Sevilla" },
    ],
  },
  {
    id: "cg-sumar",
    chamber: "congreso",
    name: "Grupo Parlamentario Plurinacional SUMAR",
    shortName: "GP Sumar",
    partySlug: "sumar",
    seats: 27,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 7.7,
    leadership: [
      { name: "Yolanda Díaz Pérez", role: "presidente", constituency: "Madrid", politicianSlug: "yolanda-diaz" },
      { name: "Íñigo Errejón Galván", role: "portavoz", constituency: "Madrid" },
      { name: "Aina Vidal Sáez", role: "portavoz-adjunto", constituency: "Barcelona" },
    ],
  },
  {
    id: "cg-republicano",
    chamber: "congreso",
    name: "Grupo Parlamentario Republicano",
    shortName: "GP Republicano",
    partySlug: "erc",
    seats: 7,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 2.0,
    leadership: [
      { name: "Gabriel Rufián Romero", role: "portavoz", constituency: "Barcelona", politicianSlug: "gabriel-rufian" },
      { name: "Teresa Jordà Roura", role: "portavoz-adjunto", constituency: "Girona" },
    ],
  },
  {
    id: "cg-junts",
    chamber: "congreso",
    name: "Grupo Parlamentario Junts per Catalunya",
    shortName: "GP Junts",
    partySlug: "junts",
    seats: 7,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 2.0,
    leadership: [
      { name: "Míriam Nogueras i Camero", role: "portavoz", constituency: "Barcelona" },
      { name: "Josep Pagès i Massó", role: "portavoz-adjunto", constituency: "Girona" },
    ],
  },
  {
    id: "cg-bildu",
    chamber: "congreso",
    name: "Grupo Parlamentario Euskal Herria Bildu",
    shortName: "GP EH Bildu",
    partySlug: "eh-bildu",
    seats: 6,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 1.7,
    leadership: [
      { name: "Mertxe Aizpurua Arzallus", role: "portavoz", constituency: "Gipuzkoa", politicianSlug: "mertxe-aizpurua" },
      { name: "Oskar Matute López", role: "portavoz-adjunto", constituency: "Bizkaia" },
    ],
  },
  {
    id: "cg-pnv",
    chamber: "congreso",
    name: "Grupo Parlamentario Vasco (EAJ-PNV)",
    shortName: "GP Vasco",
    partySlug: "pnv",
    seats: 5,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 1.4,
    leadership: [
      { name: "Aitor Esteban Bravo", role: "portavoz", constituency: "Bizkaia" },
      { name: "Joseba Andoni Agirretxea Urresti", role: "vocal", constituency: "Gipuzkoa", politicianSlug: "joseba-agirretxea" },
    ],
  },
  {
    id: "cg-mixto",
    chamber: "congreso",
    name: "Grupo Parlamentario Mixto",
    shortName: "GP Mixto",
    partySlug: "podemos",
    seats: 8,
    totalChamberSeats: CONGRESS_TOTAL_SEATS,
    representationPct: 2.3,
    leadership: [
      { name: "Ione Belarra Urteaga", role: "portavoz", constituency: "Madrid", politicianSlug: "ione-belarra" },
      { name: "Cristina Valido García", role: "vocal", constituency: "S/C Tenerife", politicianSlug: "cristina-valido" },
      { name: "Néstor Rego Candamil", role: "vocal", constituency: "A Coruña" },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   SENATE — Senado de España (266 seats: 208 elected + 58 designated)
   ══════════════════════════════════════════════════════════════════════════ */

export const SENATE_TOTAL_SEATS = 266;

export const senateGroups: ParliamentaryGroup[] = [
  {
    id: "sg-popular",
    chamber: "senado",
    name: "Grupo Parlamentario Popular en el Senado",
    shortName: "GP Popular",
    partySlug: "pp",
    seats: 156,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 58.6,
    leadership: [
      { name: "Alicia García Rodríguez", role: "portavoz", constituency: "Ávila" },
      { name: "Javier Maroto Aranzábal", role: "portavoz-adjunto", constituency: "Álava" },
    ],
  },
  {
    id: "sg-socialista",
    chamber: "senado",
    name: "Grupo Parlamentario Socialista",
    shortName: "GP Socialista",
    partySlug: "psoe",
    seats: 72,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 27.1,
    leadership: [
      { name: "Eva Granados Galiano", role: "portavoz", constituency: "Barcelona" },
      { name: "Txema Oleaga Zalvidea", role: "portavoz-adjunto", constituency: "Bizkaia" },
    ],
  },
  {
    id: "sg-vox",
    chamber: "senado",
    name: "Grupo Parlamentario VOX",
    shortName: "GP VOX",
    partySlug: "vox",
    seats: 13,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 4.9,
    leadership: [
      { name: "José Manuel Marín Gascón", role: "portavoz", constituency: "Murcia" },
    ],
  },
  {
    id: "sg-izquierda",
    chamber: "senado",
    name: "Grupo Parlamentario Izquierda Confederal",
    shortName: "GP Izq. Confederal",
    partySlug: "sumar",
    seats: 10,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 3.8,
    leadership: [
      { name: "Carles Mulet García", role: "portavoz", constituency: "València" },
    ],
  },
  {
    id: "sg-pnv",
    chamber: "senado",
    name: "Grupo Parlamentario Vasco en el Senado (EAJ-PNV)",
    shortName: "GP Vasco",
    partySlug: "pnv",
    seats: 9,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 3.4,
    leadership: [
      { name: "Koldo Mediavilla Mentxaka", role: "portavoz", constituency: "Bizkaia" },
    ],
  },
  {
    id: "sg-mixto",
    chamber: "senado",
    name: "Grupo Parlamentario Mixto",
    shortName: "GP Mixto",
    partySlug: "eh-bildu",
    seats: 6,
    totalChamberSeats: SENATE_TOTAL_SEATS,
    representationPct: 2.3,
    leadership: [
      { name: "Gorka Elejabarrieta Díaz", role: "portavoz", constituency: "Gipuzkoa" },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   CCAA PARLIAMENTS — all 17 communities + 2 autonomous cities
   ══════════════════════════════════════════════════════════════════════════ */

export const ccaaParliaments: CcaaParliament[] = [
  {
    territorySlug: "andalucia",
    name: "Parlamento de Andalucía",
    totalSeats: 109,
    presidentName: "Juan Manuel Moreno Bonilla",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 58, representationPct: 53.2, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE-A", acronym: "PSOE", seats: 30, representationPct: 27.5, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 14, representationPct: 12.8, isGoverning: false },
      { partySlug: "sumar", partyName: "Por Andalucía", acronym: "PorA", seats: 5, representationPct: 4.6, isGoverning: false },
      { partySlug: "podemos", partyName: "Adelante Andalucía", acronym: "AA", seats: 2, representationPct: 1.8, isGoverning: false },
    ],
  },
  {
    territorySlug: "aragon",
    name: "Cortes de Aragón",
    totalSeats: 67,
    presidentName: "Jorge Azcón Navarro",
    presidentParty: "PP",
    governingCoalition: ["pp", "vox"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 28, representationPct: 41.8, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE Aragón", acronym: "PSOE", seats: 16, representationPct: 23.9, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 7, representationPct: 10.4, isGoverning: true },
      { partySlug: "sumar", partyName: "Aragón Existe / CHA", acronym: "AE-CHA", seats: 8, representationPct: 11.9, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 4, representationPct: 6.0, isGoverning: false },
      { partySlug: "psoe", partyName: "PAR", acronym: "PAR", seats: 3, representationPct: 4.5, isGoverning: false },
    ],
  },
  {
    territorySlug: "asturias",
    name: "Junta General del Principado de Asturias",
    totalSeats: 45,
    presidentName: "Adrián Barbón Rodríguez",
    presidentParty: "PSOE",
    governingCoalition: ["psoe"],
    groups: [
      { partySlug: "psoe", partyName: "FSA-PSOE", acronym: "PSOE", seats: 18, representationPct: 40.0, isGoverning: true },
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 17, representationPct: 37.8, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 3, representationPct: 6.7, isGoverning: false },
      { partySlug: "sumar", partyName: "IU Asturias", acronym: "IU", seats: 4, representationPct: 8.9, isGoverning: false },
      { partySlug: "podemos", partyName: "Convocatoria por Asturies", acronym: "CpA", seats: 3, representationPct: 6.7, isGoverning: false },
    ],
  },
  {
    territorySlug: "illes-balears",
    name: "Parlament de les Illes Balears",
    totalSeats: 59,
    presidentName: "Margalida Prohens Rigo",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 25, representationPct: 42.4, isGoverning: true },
      { partySlug: "psoe", partyName: "PSIB-PSOE", acronym: "PSOE", seats: 13, representationPct: 22.0, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 8, representationPct: 13.6, isGoverning: false },
      { partySlug: "sumar", partyName: "Més per Mallorca", acronym: "MÉS", seats: 6, representationPct: 10.2, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 4, representationPct: 6.8, isGoverning: false },
      { partySlug: "sumar", partyName: "Més per Menorca", acronym: "MxMe", seats: 3, representationPct: 5.1, isGoverning: false },
    ],
  },
  {
    territorySlug: "canarias",
    name: "Parlamento de Canarias",
    totalSeats: 70,
    presidentName: "Fernando Clavijo Batlle",
    presidentParty: "CC",
    governingCoalition: ["coalicion-canaria", "pp"],
    groups: [
      { partySlug: "coalicion-canaria", partyName: "Coalición Canaria", acronym: "CC", seats: 19, representationPct: 27.1, isGoverning: true },
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 16, representationPct: 22.9, isGoverning: true },
      { partySlug: "psoe", partyName: "PSC-PSOE", acronym: "PSOE", seats: 17, representationPct: 24.3, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 5, representationPct: 7.1, isGoverning: false },
      { partySlug: "sumar", partyName: "Nueva Canarias", acronym: "NC", seats: 7, representationPct: 10.0, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos / Drago", acronym: "DRG", seats: 4, representationPct: 5.7, isGoverning: false },
      { partySlug: "sumar", partyName: "ASG", acronym: "ASG", seats: 2, representationPct: 2.9, isGoverning: false },
    ],
  },
  {
    territorySlug: "cantabria",
    name: "Parlamento de Cantabria",
    totalSeats: 35,
    presidentName: "María José Sáenz de Buruaga",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 19, representationPct: 54.3, isGoverning: true },
      { partySlug: "psoe", partyName: "PSC-PSOE", acronym: "PSOE", seats: 8, representationPct: 22.9, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 5, representationPct: 14.3, isGoverning: false },
      { partySlug: "sumar", partyName: "PRC", acronym: "PRC", seats: 3, representationPct: 8.6, isGoverning: false },
    ],
  },
  {
    territorySlug: "castilla-y-leon",
    name: "Cortes de Castilla y León",
    totalSeats: 81,
    presidentName: "Alfonso Fernández Mañueco",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 40, representationPct: 49.4, isGoverning: true },
      { partySlug: "psoe", partyName: "PSCyL-PSOE", acronym: "PSOE", seats: 28, representationPct: 34.6, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 13, representationPct: 16.0, isGoverning: false },
    ],
  },
  {
    territorySlug: "castilla-la-mancha",
    name: "Cortes de Castilla-La Mancha",
    totalSeats: 33,
    presidentName: "Emiliano García-Page Sánchez",
    presidentParty: "PSOE",
    governingCoalition: ["psoe"],
    groups: [
      { partySlug: "psoe", partyName: "PSOE-CLM", acronym: "PSOE", seats: 17, representationPct: 51.5, isGoverning: true },
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 13, representationPct: 39.4, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 3, representationPct: 9.1, isGoverning: false },
    ],
  },
  {
    territorySlug: "cataluna",
    name: "Parlament de Catalunya",
    totalSeats: 135,
    presidentName: "Salvador Illa Roca",
    presidentParty: "PSC",
    governingCoalition: ["psoe"],
    groups: [
      { partySlug: "psoe", partyName: "PSC-PSOE", acronym: "PSC", seats: 42, representationPct: 31.1, isGoverning: true },
      { partySlug: "junts", partyName: "Junts per Catalunya", acronym: "JxCat", seats: 35, representationPct: 25.9, isGoverning: false },
      { partySlug: "erc", partyName: "Esquerra Republicana", acronym: "ERC", seats: 20, representationPct: 14.8, isGoverning: false },
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 15, representationPct: 11.1, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 11, representationPct: 8.1, isGoverning: false },
      { partySlug: "sumar", partyName: "Comuns Sumar", acronym: "CUP-S", seats: 6, representationPct: 4.4, isGoverning: false },
      { partySlug: "podemos", partyName: "CUP", acronym: "CUP", seats: 4, representationPct: 3.0, isGoverning: false },
      { partySlug: "sumar", partyName: "Aliança Catalana", acronym: "AC", seats: 2, representationPct: 1.5, isGoverning: false },
    ],
  },
  {
    territorySlug: "extremadura",
    name: "Asamblea de Extremadura",
    totalSeats: 65,
    presidentName: "María Guardiola Martín",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 34, representationPct: 52.3, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE Extremadura", acronym: "PSOE", seats: 22, representationPct: 33.8, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 9, representationPct: 13.8, isGoverning: false },
    ],
  },
  {
    territorySlug: "galicia",
    name: "Parlamento de Galicia",
    totalSeats: 75,
    presidentName: "Alfonso Rueda Valenzuela",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "PPdeG", acronym: "PP", seats: 40, representationPct: 53.3, isGoverning: true },
      { partySlug: "bng", partyName: "BNG", acronym: "BNG", seats: 25, representationPct: 33.3, isGoverning: false },
      { partySlug: "psoe", partyName: "PSdeG-PSOE", acronym: "PSOE", seats: 9, representationPct: 12.0, isGoverning: false },
      { partySlug: "podemos", partyName: "Democracia Ourensana", acronym: "DO", seats: 1, representationPct: 1.3, isGoverning: false },
    ],
  },
  {
    territorySlug: "madrid",
    name: "Asamblea de Madrid",
    totalSeats: 136,
    presidentName: "Isabel Díaz Ayuso",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 74, representationPct: 54.4, isGoverning: true },
      { partySlug: "psoe", partyName: "PSM-PSOE", acronym: "PSOE", seats: 27, representationPct: 19.9, isGoverning: false },
      { partySlug: "sumar", partyName: "Más Madrid", acronym: "MM", seats: 19, representationPct: 14.0, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 11, representationPct: 8.1, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 5, representationPct: 3.7, isGoverning: false },
    ],
  },
  {
    territorySlug: "murcia",
    name: "Asamblea Regional de Murcia",
    totalSeats: 45,
    presidentName: "Fernando López Miras",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 22, representationPct: 48.9, isGoverning: true },
      { partySlug: "psoe", partyName: "PSRM-PSOE", acronym: "PSOE", seats: 12, representationPct: 26.7, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 9, representationPct: 20.0, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 2, representationPct: 4.4, isGoverning: false },
    ],
  },
  {
    territorySlug: "navarra",
    name: "Parlamento de Navarra",
    totalSeats: 50,
    presidentName: "María Chivite Navascués",
    presidentParty: "PSN-PSOE",
    governingCoalition: ["psoe"],
    groups: [
      { partySlug: "psoe", partyName: "PSN-PSOE", acronym: "PSN", seats: 11, representationPct: 22.0, isGoverning: true },
      { partySlug: "pp", partyName: "UPN / PP", acronym: "UPN", seats: 15, representationPct: 30.0, isGoverning: false },
      { partySlug: "eh-bildu", partyName: "EH Bildu", acronym: "EHB", seats: 12, representationPct: 24.0, isGoverning: false },
      { partySlug: "sumar", partyName: "Geroa Bai / Contigo", acronym: "GB", seats: 7, representationPct: 14.0, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 3, representationPct: 6.0, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 2, representationPct: 4.0, isGoverning: false },
    ],
  },
  {
    territorySlug: "pais-vasco",
    name: "Parlamento Vasco / Eusko Legebiltzarra",
    totalSeats: 75,
    presidentName: "Imanol Pradales Ruiz",
    presidentParty: "PNV",
    governingCoalition: ["pnv", "psoe"],
    groups: [
      { partySlug: "pnv", partyName: "EAJ-PNV", acronym: "PNV", seats: 27, representationPct: 36.0, isGoverning: true },
      { partySlug: "eh-bildu", partyName: "EH Bildu", acronym: "EHB", seats: 21, representationPct: 28.0, isGoverning: false },
      { partySlug: "psoe", partyName: "PSE-EE", acronym: "PSE", seats: 12, representationPct: 16.0, isGoverning: true },
      { partySlug: "pp", partyName: "PP+Cs", acronym: "PP", seats: 7, representationPct: 9.3, isGoverning: false },
      { partySlug: "sumar", partyName: "Elkarrekin Podemos", acronym: "EP", seats: 5, representationPct: 6.7, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 1, representationPct: 1.3, isGoverning: false },
    ],
  },
  {
    territorySlug: "la-rioja",
    name: "Parlamento de La Rioja",
    totalSeats: 33,
    presidentName: "Gonzalo Capellán de Miguel",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 17, representationPct: 51.5, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE La Rioja", acronym: "PSOE", seats: 10, representationPct: 30.3, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 4, representationPct: 12.1, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos-IU", acronym: "UP", seats: 2, representationPct: 6.1, isGoverning: false },
    ],
  },
  {
    territorySlug: "comunitat-valenciana",
    name: "Corts Valencianes",
    totalSeats: 99,
    presidentName: "Carlos Mazón Guixot",
    presidentParty: "PP",
    governingCoalition: ["pp", "vox"],
    groups: [
      { partySlug: "pp", partyName: "PPCV", acronym: "PP", seats: 40, representationPct: 40.4, isGoverning: true },
      { partySlug: "psoe", partyName: "PSPV-PSOE", acronym: "PSOE", seats: 25, representationPct: 25.3, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 13, representationPct: 13.1, isGoverning: true },
      { partySlug: "sumar", partyName: "Compromís", acronym: "COMP", seats: 15, representationPct: 15.2, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 4, representationPct: 4.0, isGoverning: false },
      { partySlug: "sumar", partyName: "Esquerra Unida", acronym: "EU", seats: 2, representationPct: 2.0, isGoverning: false },
    ],
  },
  {
    territorySlug: "ceuta",
    name: "Asamblea de Ceuta",
    totalSeats: 25,
    presidentName: "Juan Jesús Vivas Lara",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 12, representationPct: 48.0, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE", acronym: "PSOE", seats: 5, representationPct: 20.0, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 5, representationPct: 20.0, isGoverning: false },
      { partySlug: "sumar", partyName: "MDyC", acronym: "MDyC", seats: 3, representationPct: 12.0, isGoverning: false },
    ],
  },
  {
    territorySlug: "melilla",
    name: "Asamblea de Melilla",
    totalSeats: 25,
    presidentName: "Juan José Imbroda Ortiz",
    presidentParty: "PP",
    governingCoalition: ["pp"],
    groups: [
      { partySlug: "pp", partyName: "Partido Popular", acronym: "PP", seats: 10, representationPct: 40.0, isGoverning: true },
      { partySlug: "psoe", partyName: "PSOE", acronym: "PSOE", seats: 5, representationPct: 20.0, isGoverning: false },
      { partySlug: "vox", partyName: "VOX", acronym: "VOX", seats: 5, representationPct: 20.0, isGoverning: false },
      { partySlug: "sumar", partyName: "CpM", acronym: "CpM", seats: 4, representationPct: 16.0, isGoverning: false },
      { partySlug: "podemos", partyName: "Podemos", acronym: "POD", seats: 1, representationPct: 4.0, isGoverning: false },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   NATIONAL REPRESENTATION — party % across Congress + Senate combined
   ══════════════════════════════════════════════════════════════════════════ */

export interface NationalRepresentation {
  partySlug: string;
  congressSeats: number;
  senateSeats: number;
  totalSeats: number;
  congressPct: number;
  senatePct: number;
  /** Number of CCAA where this party is in the governing coalition */
  ccaaGoverning: number;
  ccaaPresence: number;
}

export function getNationalRepresentation(): NationalRepresentation[] {
  const partySlugs = [...new Set([
    ...congressGroups.map(g => g.partySlug),
    ...senateGroups.map(g => g.partySlug),
  ])];

  return partySlugs.map(slug => {
    const cg = congressGroups.find(g => g.partySlug === slug);
    const sg = senateGroups.find(g => g.partySlug === slug);
    const ccaaGov = ccaaParliaments.filter(p =>
      p.governingCoalition.includes(slug)
    ).length;
    const ccaaPresence = ccaaParliaments.filter(p =>
      p.groups.some(g => g.partySlug === slug)
    ).length;

    return {
      partySlug: slug,
      congressSeats: cg?.seats ?? 0,
      senateSeats: sg?.seats ?? 0,
      totalSeats: (cg?.seats ?? 0) + (sg?.seats ?? 0),
      congressPct: cg?.representationPct ?? 0,
      senatePct: sg?.representationPct ?? 0,
      ccaaGoverning: ccaaGov,
      ccaaPresence: ccaaPresence,
    };
  }).sort((a, b) => b.totalSeats - a.totalSeats);
}

/** Get CCAA parliament by territory slug */
export function getCcaaParliament(territorySlug: string): CcaaParliament | undefined {
  return ccaaParliaments.find(p => p.territorySlug === territorySlug);
}

/** Get all groups for a party across all chambers */
export function getPartyPresence(partySlug: string) {
  const congress = congressGroups.find(g => g.partySlug === partySlug);
  const senate = senateGroups.find(g => g.partySlug === partySlug);
  const ccaa = ccaaParliaments
    .filter(p => p.groups.some(g => g.partySlug === partySlug))
    .map(p => ({
      territorySlug: p.territorySlug,
      parliamentName: p.name,
      totalSeats: p.totalSeats,
      group: p.groups.find(g => g.partySlug === partySlug)!,
      isGoverning: p.governingCoalition.includes(partySlug),
    }));

  return { congress, senate, ccaa };
}

/** Format role label in Spanish */
export function getRoleLabel(role: MemberRole): string {
  const labels: Record<MemberRole, string> = {
    presidente: "Presidente/a",
    vicepresidente: "Vicepresidente/a",
    portavoz: "Portavoz",
    "portavoz-adjunto": "Portavoz adjunto/a",
    secretario: "Secretario/a",
    vocal: "Vocal",
    diputado: "Diputado/a",
    senador: "Senador/a",
  };
  return labels[role];
}
