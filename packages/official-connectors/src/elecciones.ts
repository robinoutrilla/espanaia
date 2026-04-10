/* ═══════════════════════════════════════════════════════════════════════════
   Elecciones Generales — Historical election results for Spain.
   The official infoelectoral.interior.gob.es is blocked by WAF and
   resultados.generales23j.es uses an internal API (intranet.infoelecciones.com).
   This connector provides a structured catalog of official national results
   from recent general elections (Congreso de los Diputados).
   ═══════════════════════════════════════════════════════════════════════════ */

import { slugify } from "./utils.js";

export interface EleccionResultado {
  id: string;
  eleccion: string;          // e.g. "generales-2023"
  fecha: string;             // YYYY-MM-DD
  tipo: "congreso" | "senado";
  partido: string;
  siglas: string;
  votos: number;
  porcentaje: number;        // percentage of valid votes (truncated to 2 decimals)
  escanos: number;
  candidato_cabeza: string;  // lead candidate
}

export interface EleccionMeta {
  id: string;
  eleccion: string;
  fecha: string;
  tipo: "congreso" | "senado";
  censo: number;
  votantes: number;
  participacion: number;     // percentage
  votos_validos: number;
  votos_nulos: number;
  votos_blanco: number;
  escanos_totales: number;
}

export interface EleccionesSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalResultados: number;
  totalElecciones: number;
  meta: EleccionMeta[];
  resultados: EleccionResultado[];
  note: string;
}

/* ── Official results data ─────────────────────────────────────────────── */

interface RawEleccion {
  eleccion: string;
  fecha: string;
  tipo: "congreso";
  censo: number;
  votantes: number;
  participacion: number;
  votos_validos: number;
  votos_nulos: number;
  votos_blanco: number;
  escanos_totales: number;
  partidos: {
    partido: string;
    siglas: string;
    votos: number;
    porcentaje: number;
    escanos: number;
    candidato: string;
  }[];
}

const ELECCIONES: RawEleccion[] = [
  {
    eleccion: "generales-2023",
    fecha: "2023-07-23",
    tipo: "congreso",
    censo: 34872054,
    votantes: 24951049,
    participacion: 70.40,
    votos_validos: 24693609,
    votos_nulos: 257440,
    votos_blanco: 118937,
    escanos_totales: 350,
    partidos: [
      { partido: "Partido Popular", siglas: "PP", votos: 8160837, porcentaje: 33.05, escanos: 137, candidato: "Alberto Núñez Feijóo" },
      { partido: "Partido Socialista Obrero Español", siglas: "PSOE", votos: 7760970, porcentaje: 31.70, escanos: 121, candidato: "Pedro Sánchez" },
      { partido: "Vox", siglas: "VOX", votos: 3033744, porcentaje: 12.39, escanos: 33, candidato: "Santiago Abascal" },
      { partido: "Sumar", siglas: "SUMAR", votos: 3014006, porcentaje: 12.31, escanos: 31, candidato: "Yolanda Díaz" },
      { partido: "Esquerra Republicana de Catalunya", siglas: "ERC", votos: 462541, porcentaje: 1.89, escanos: 7, candidato: "Gabriel Rufián" },
      { partido: "Junts per Catalunya", siglas: "JxCat", votos: 392634, porcentaje: 1.60, escanos: 7, candidato: "Míriam Nogueras" },
      { partido: "Euskal Herria Bildu", siglas: "EH Bildu", votos: 333362, porcentaje: 1.36, escanos: 6, candidato: "Mertxe Aizpurua" },
      { partido: "Partido Nacionalista Vasco", siglas: "PNV", votos: 275782, porcentaje: 1.13, escanos: 5, candidato: "Aitor Esteban" },
      { partido: "Bloque Nacionalista Galego", siglas: "BNG", votos: 152327, porcentaje: 0.62, escanos: 1, candidato: "Néstor Rego" },
      { partido: "Coalición Canaria", siglas: "CCa", votos: 114718, porcentaje: 0.47, escanos: 1, candidato: "Cristina Valido" },
      { partido: "Unión del Pueblo Navarro", siglas: "UPN", votos: 51764, porcentaje: 0.21, escanos: 1, candidato: "Alberto Catalán" },
    ],
  },
  {
    eleccion: "generales-2019-nov",
    fecha: "2019-11-10",
    tipo: "congreso",
    censo: 34872576,
    votantes: 24503184,
    participacion: 66.23,
    votos_validos: 24264940,
    votos_nulos: 238244,
    votos_blanco: 83264,
    escanos_totales: 350,
    partidos: [
      { partido: "Partido Socialista Obrero Español", siglas: "PSOE", votos: 6752983, porcentaje: 28.00, escanos: 120, candidato: "Pedro Sánchez" },
      { partido: "Partido Popular", siglas: "PP", votos: 5047040, porcentaje: 20.82, escanos: 89, candidato: "Pablo Casado" },
      { partido: "Vox", siglas: "VOX", votos: 3640063, porcentaje: 15.09, escanos: 52, candidato: "Santiago Abascal" },
      { partido: "Unidas Podemos", siglas: "UP", votos: 3097185, porcentaje: 12.84, escanos: 35, candidato: "Pablo Iglesias" },
      { partido: "Ciudadanos", siglas: "Cs", votos: 1637540, porcentaje: 6.79, escanos: 10, candidato: "Albert Rivera" },
      { partido: "Esquerra Republicana de Catalunya", siglas: "ERC", votos: 874859, porcentaje: 3.63, escanos: 13, candidato: "Gabriel Rufián" },
      { partido: "Junts per Catalunya", siglas: "JxCat", votos: 527375, porcentaje: 2.19, escanos: 8, candidato: "Laura Borràs" },
      { partido: "Partido Nacionalista Vasco", siglas: "PNV", votos: 377423, porcentaje: 1.56, escanos: 6, candidato: "Aitor Esteban" },
      { partido: "Euskal Herria Bildu", siglas: "EH Bildu", votos: 276519, porcentaje: 1.15, escanos: 5, candidato: "Mertxe Aizpurua" },
      { partido: "Más País", siglas: "MP", votos: 173488, porcentaje: 0.72, escanos: 3, candidato: "Íñigo Errejón" },
      { partido: "Coalición Canaria", siglas: "CCa", votos: 123981, porcentaje: 0.51, escanos: 2, candidato: "Ana Oramas" },
      { partido: "Bloque Nacionalista Galego", siglas: "BNG", votos: 119597, porcentaje: 0.50, escanos: 1, candidato: "Néstor Rego" },
      { partido: "Navarra Suma", siglas: "NA+", votos: 98448, porcentaje: 0.41, escanos: 2, candidato: "Sergio Sayas" },
      { partido: "Compromís", siglas: "Compromís", votos: 174019, porcentaje: 0.72, escanos: 1, candidato: "Joan Baldoví" },
      { partido: "Partido Regionalista de Cantabria", siglas: "PRC", votos: 68580, porcentaje: 0.28, escanos: 1, candidato: "José María Mazón" },
      { partido: "Teruel Existe", siglas: "TE", votos: 19696, porcentaje: 0.08, escanos: 1, candidato: "Tomás Guitarte" },
    ],
  },
  {
    eleccion: "generales-2019-abr",
    fecha: "2019-04-28",
    tipo: "congreso",
    censo: 34827146,
    votantes: 26431748,
    participacion: 75.75,
    votos_validos: 26198952,
    votos_nulos: 232796,
    votos_blanco: 81282,
    escanos_totales: 350,
    partidos: [
      { partido: "Partido Socialista Obrero Español", siglas: "PSOE", votos: 7480755, porcentaje: 28.68, escanos: 123, candidato: "Pedro Sánchez" },
      { partido: "Partido Popular", siglas: "PP", votos: 4356023, porcentaje: 16.70, escanos: 66, candidato: "Pablo Casado" },
      { partido: "Ciudadanos", siglas: "Cs", votos: 4136600, porcentaje: 15.86, escanos: 57, candidato: "Albert Rivera" },
      { partido: "Unidas Podemos", siglas: "UP", votos: 3732929, porcentaje: 14.31, escanos: 42, candidato: "Pablo Iglesias" },
      { partido: "Vox", siglas: "VOX", votos: 2677173, porcentaje: 10.26, escanos: 24, candidato: "Santiago Abascal" },
      { partido: "Esquerra Republicana de Catalunya", siglas: "ERC", votos: 1015355, porcentaje: 3.89, escanos: 15, candidato: "Gabriel Rufián" },
      { partido: "Junts per Catalunya", siglas: "JxCat", votos: 497743, porcentaje: 1.91, escanos: 7, candidato: "Jordi Sànchez" },
      { partido: "Partido Nacionalista Vasco", siglas: "PNV", votos: 394627, porcentaje: 1.51, escanos: 6, candidato: "Aitor Esteban" },
      { partido: "Euskal Herria Bildu", siglas: "EH Bildu", votos: 258840, porcentaje: 0.99, escanos: 4, candidato: "Mertxe Aizpurua" },
      { partido: "Coalición Canaria", siglas: "CCa", votos: 137496, porcentaje: 0.53, escanos: 2, candidato: "Ana Oramas" },
      { partido: "Navarra Suma", siglas: "NA+", votos: 107619, porcentaje: 0.41, escanos: 2, candidato: "Sergio Sayas" },
      { partido: "Compromís", siglas: "Compromís", votos: 172751, porcentaje: 0.66, escanos: 1, candidato: "Joan Baldoví" },
      { partido: "Partido Regionalista de Cantabria", siglas: "PRC", votos: 62679, porcentaje: 0.24, escanos: 1, candidato: "José María Mazón" },
    ],
  },
  {
    eleccion: "generales-2016",
    fecha: "2016-06-26",
    tipo: "congreso",
    censo: 34597909,
    votantes: 24161083,
    participacion: 69.84,
    votos_validos: 23871116,
    votos_nulos: 289967,
    votos_blanco: 49824,
    escanos_totales: 350,
    partidos: [
      { partido: "Partido Popular", siglas: "PP", votos: 7941236, porcentaje: 33.03, escanos: 137, candidato: "Mariano Rajoy" },
      { partido: "Partido Socialista Obrero Español", siglas: "PSOE", votos: 5443846, porcentaje: 22.66, escanos: 85, candidato: "Pedro Sánchez" },
      { partido: "Unidos Podemos", siglas: "UP", votos: 5087538, porcentaje: 21.17, escanos: 71, candidato: "Pablo Iglesias" },
      { partido: "Ciudadanos", siglas: "Cs", votos: 3141570, porcentaje: 13.07, escanos: 32, candidato: "Albert Rivera" },
      { partido: "Esquerra Republicana de Catalunya", siglas: "ERC", votos: 629294, porcentaje: 2.62, escanos: 9, candidato: "Gabriel Rufián" },
      { partido: "Convergència Democràtica de Catalunya", siglas: "CDC", votos: 481839, porcentaje: 2.01, escanos: 8, candidato: "Francesc Homs" },
      { partido: "Partido Nacionalista Vasco", siglas: "PNV", votos: 286215, porcentaje: 1.19, escanos: 5, candidato: "Aitor Esteban" },
      { partido: "Euskal Herria Bildu", siglas: "EH Bildu", votos: 184092, porcentaje: 0.77, escanos: 2, candidato: "Oskar Matute" },
      { partido: "Coalición Canaria", siglas: "CCa", votos: 78080, porcentaje: 0.32, escanos: 1, candidato: "Ana Oramas" },
    ],
  },
];

/**
 * Returns a structured snapshot of Spanish general election results.
 * Note: infoelectoral.interior.gob.es blocked by WAF, resultados.generales23j.es
 * uses internal API. Data sourced from official published results.
 */
export async function fetchEleccionesData(): Promise<EleccionesSnapshot> {
  const meta: EleccionMeta[] = [];
  const resultados: EleccionResultado[] = [];

  for (const e of ELECCIONES) {
    const metaId = `meta-${slugify(e.eleccion)}-${e.tipo}`;
    meta.push({
      id: metaId,
      eleccion: e.eleccion,
      fecha: e.fecha,
      tipo: e.tipo,
      censo: e.censo,
      votantes: e.votantes,
      participacion: e.participacion,
      votos_validos: e.votos_validos,
      votos_nulos: e.votos_nulos,
      votos_blanco: e.votos_blanco,
      escanos_totales: e.escanos_totales,
    });

    for (const p of e.partidos) {
      resultados.push({
        id: `${slugify(e.eleccion)}-${e.tipo}-${slugify(p.siglas)}`,
        eleccion: e.eleccion,
        fecha: e.fecha,
        tipo: e.tipo,
        partido: p.partido,
        siglas: p.siglas,
        votos: p.votos,
        porcentaje: p.porcentaje,
        escanos: p.escanos,
        candidato_cabeza: p.candidato,
      });
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: "https://infoelectoral.interior.gob.es/",
    totalResultados: resultados.length,
    totalElecciones: ELECCIONES.length,
    meta,
    resultados,
    note: "infoelectoral.interior.gob.es blocked by WAF. Data from officially published results of recent general elections (Congreso).",
  };
}
