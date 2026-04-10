/* ═══════════════════════════════════════════════════════════════════════════
   Visual identity data for parties, politicians, and territories.
   Photos from Wikimedia Commons (public domain / CC-BY-SA).
   Party colors from official brand guidelines.
   CCAA shields from institutional sources.
   URLs verified via Wikipedia/Commons API on 2026-04-09.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Official party colors — used for accent borders and badges */
export const partyColors: Record<string, string> = {
  psoe: "#e30613",
  pp: "#0056a0",
  vox: "#63be21",
  sumar: "#e5007e",
  podemos: "#6b2d7b",
  junts: "#00b8d4",
  erc: "#ffb232",
  pnv: "#e30613",
  "eh-bildu": "#8dc53e",
  bng: "#76b6de",
  "coalicion-canaria": "#ffe100",
};

/** Politician photos — Wikimedia Commons thumbnails (120px width, verified) */
export const politicianPhotos: Record<string, string> = {
  "pedro-sanchez":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Pedro_S%C3%A1nchez_in_2026.jpg/120px-Pedro_S%C3%A1nchez_in_2026.jpg",
  "yolanda-diaz":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Yolanda_D%C3%ADaz_on_11_January_2024_%28cropped%29.jpg/120px-Yolanda_D%C3%ADaz_on_11_January_2024_%28cropped%29.jpg",
  "santiago-abascal":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Santiago_Abascal_portrait.jpg/120px-Santiago_Abascal_portrait.jpg",
  "ione-belarra":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Ione_Belarra_2023.jpg/120px-Ione_Belarra_2023.jpg",
  "gabriel-rufian":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Gabriel_Rufi%C3%A1n_Portavoz_de_Esquerra_Republicana_en_el_Congreso_de_los_diputados_%28cropped%29.jpg/120px-Gabriel_Rufi%C3%A1n_Portavoz_de_Esquerra_Republicana_en_el_Congreso_de_los_diputados_%28cropped%29.jpg",
  "mertxe-aizpurua":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/GC_MERTXE_AIZPURUA.jpg/120px-GC_MERTXE_AIZPURUA.jpg",
  "miguel-tellado":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/13_Congreso_del_PP_de_Cantabria.jpg/120px-13_Congreso_del_PP_de_Cantabria.jpg",
};

/** CCAA shield/coat of arms — Wikimedia Commons (verified via API) */
export const territoryShields: Record<string, string> = {
  espana:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Escudo_nacional_de_Espa%C3%B1a%2C_1981_%28base_carpanel%29.svg/120px-Escudo_nacional_de_Espa%C3%B1a%2C_1981_%28base_carpanel%29.svg.png",
  andalucia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Escudo_de_Andaluc%C3%ADa_%28oficial%29.svg/120px-Escudo_de_Andaluc%C3%ADa_%28oficial%29.svg.png",
  aragon:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Official_Coat_of_Arms_of_Aragon.svg/120px-Official_Coat_of_Arms_of_Aragon.svg.png",
  asturias:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Coat_of_Arms_of_Asturias.svg/120px-Coat_of_Arms_of_Asturias.svg.png",
  "illes-balears":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Escudo_de_las_Islas_Baleares.svg/120px-Escudo_de_las_Islas_Baleares.svg.png",
  canarias:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Coat_of_Arms_of_the_Canary_Islands.svg/120px-Coat_of_Arms_of_the_Canary_Islands.svg.png",
  cantabria:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Arms_of_Cantabria.svg/120px-Arms_of_Cantabria.svg.png",
  "castilla-y-leon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Escudo_de_Castilla_y_Le%C3%B3n_-_Versi%C3%B3n_her%C3%A1ldica_oficial.svg/120px-Escudo_de_Castilla_y_Le%C3%B3n_-_Versi%C3%B3n_her%C3%A1ldica_oficial.svg.png",
  "castilla-la-mancha":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Coat_of_Arms_of_Castile-La_Mancha.svg/120px-Coat_of_Arms_of_Castile-La_Mancha.svg.png",
  cataluna:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Coat_of_Arms_of_Catalonia.svg/120px-Coat_of_Arms_of_Catalonia.svg.png",
  extremadura:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Escudo_de_Extremadura.svg/120px-Escudo_de_Extremadura.svg.png",
  galicia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Escudo_de_Galicia.svg/120px-Escudo_de_Galicia.svg.png",
  madrid:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Escudo_de_la_Comunidad_de_Madrid.svg/120px-Escudo_de_la_Comunidad_de_Madrid.svg.png",
  murcia:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Escudo_de_la_Regi%C3%B3n_de_Murcia.svg/120px-Escudo_de_la_Regi%C3%B3n_de_Murcia.svg.png",
  navarra:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Coat_of_Arms_of_Navarre.svg/120px-Coat_of_Arms_of_Navarre.svg.png",
  "pais-vasco":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Coat_of_Arms_of_the_Basque_Country.svg/120px-Coat_of_Arms_of_the_Basque_Country.svg.png",
  "comunitat-valenciana":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Escudo_de_la_Comunidad_Valenciana.svg/120px-Escudo_de_la_Comunidad_Valenciana.svg.png",
  ceuta:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Escudo_de_Ceuta.svg/120px-Escudo_de_Ceuta.svg.png",
  melilla:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Escudo_de_Melilla.svg/120px-Escudo_de_Melilla.svg.png",
};

/** Party logo URLs — Wikimedia Commons (official party emblems, verified) */
export const partyLogos: Record<string, string> = {
  psoe: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Logotipo_del_PSOE.svg/120px-Logotipo_del_PSOE.svg.png",
  pp: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_del_PP_%282022%29.svg/120px-Logo_del_PP_%282022%29.svg.png",
  vox: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/VOX_logo.svg/120px-VOX_logo.svg.png",
  sumar: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Movimiento_Sumar_logo_2025.svg/120px-Movimiento_Sumar_logo_2025.svg.png",
  podemos: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_de_Podemos_%282022%29.svg/120px-Logo_de_Podemos_%282022%29.svg.png",
  junts: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Logotip_Junts_per_Catalunya.svg/120px-Logotip_Junts_per_Catalunya.svg.png",
  erc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/ERC_logo_2025.svg/120px-ERC_logo_2025.svg.png",
  pnv: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Logo_PNV_2025.svg/120px-Logo_PNV_2025.svg.png",
  "eh-bildu": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Logo_de_EH_Bildu_%282023%29.svg/120px-Logo_de_EH_Bildu_%282023%29.svg.png",
  bng: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bloque_Nacionalista_Galego.svg/120px-Bloque_Nacionalista_Galego.svg.png",
  "coalicion-canaria": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Coalici%C3%B3n_Canaria.svg/120px-Coalici%C3%B3n_Canaria.svg.png",
};

/** Get initials for a party (used as fallback logo) */
export function getPartyInitials(acronym: string): string {
  return acronym.slice(0, 3);
}

/** Proxy a Wikimedia image URL through our API to avoid ORB/CORS blocking */
export function proxyImg(url: string): string {
  return `/api/img?url=${encodeURIComponent(url)}`;
}
