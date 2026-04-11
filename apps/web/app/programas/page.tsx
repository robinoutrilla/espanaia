"use client";

import { useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";

/* ═══════════════════════════════════════════════════════════════════════════
   Programas Politicos — Visualizar, comparar y ver predicciones por partido
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Tipos ──────────────────────────────────────────────────────────────────

interface PolicyPosition {
  area: string;
  position: string;
  priority: "alta" | "media" | "baja";
  status: "cumplida" | "en-curso" | "incumplida" | "sin-datos";
}

interface Prediction {
  topic: string;
  claim: string;
  date: string;
  result: "acertada" | "parcial" | "erronea" | "pendiente" | "en-curso";
  details: string;
}

interface PartyProgram {
  slug: string;
  name: string;
  acronym: string;
  color: string;
  ideology: string;
  seats: number;
  leader: string;
  slogan: string;
  policies: PolicyPosition[];
  predictions: Prediction[];
  keyPromises: string[];
}

// ── Categorias de politicas ────────────────────────────────────────────────

const POLICY_AREAS = [
  "Economia y empleo",
  "Fiscalidad",
  "Vivienda",
  "Sanidad",
  "Educacion",
  "Energia y clima",
  "Migracion",
  "Justicia y seguridad",
  "Territorio y descentralizacion",
  "Politica exterior y UE",
  "Pensiones y proteccion social",
  "Igualdad y derechos sociales",
];

// ── Datos de partidos ──────────────────────────────────────────────────────

const PARTIES: PartyProgram[] = [
  {
    slug: "psoe",
    name: "Partido Socialista Obrero Espanol",
    acronym: "PSOE",
    color: "#e30613",
    ideology: "Socialdemocracia",
    seats: 120,
    leader: "Pedro Sanchez",
    slogan: "Espana avanza",
    keyPromises: [
      "Reduccion de la jornada laboral a 37,5 horas semanales",
      "Reforma fiscal progresiva con impuesto a grandes fortunas",
      "Ley de vivienda con topes al alquiler",
      "Blindaje constitucional de las pensiones",
      "Transicion energetica: 80% renovables en 2030",
    ],
    policies: [
      { area: "Economia y empleo", position: "Reduccion jornada a 37,5h. Subida SMI a 1.134 euros. Reforma laboral consolidada. Impulso a la economia social y cooperativa.", priority: "alta", status: "en-curso" },
      { area: "Fiscalidad", position: "Impuesto a grandes fortunas (patrimonio >3M euros). Tipo minimo del 15% en Sociedades. Gravamen a energeticas y banca. Armonizacion fiscal entre CCAA.", priority: "alta", status: "en-curso" },
      { area: "Vivienda", position: "Ley de Vivienda con control de alquileres en zonas tensionadas. Bono Joven de 250 euros/mes. 184.000 viviendas sociales en 4 anos.", priority: "alta", status: "en-curso" },
      { area: "Sanidad", position: "Refuerzo de la sanidad publica. Reduccion de listas de espera. Salud mental como prioridad. Ley ELA y Plan Nacional de Salud.", priority: "media", status: "en-curso" },
      { area: "Educacion", position: "Consolidacion de la LOMLOE. Ampliacion de becas. 0-3 anos gratuito universal. Dignificacion del profesorado. FP Dual reforzada.", priority: "media", status: "en-curso" },
      { area: "Energia y clima", position: "80% energia renovable en 2030. Fin del carbon. Rehabilitacion energetica de 500.000 viviendas. Espana como hub de hidrogeno verde.", priority: "alta", status: "en-curso" },
      { area: "Migracion", position: "Regularizacion extraordinaria de migrantes. Vias legales de entrada. Integracion sociolaboral. Lucha contra la trata.", priority: "media", status: "en-curso" },
      { area: "Justicia y seguridad", position: "Ley de amnistia. Renovacion del CGPJ. Reforma del delito de sedicion (ya aprobada). Digitalizacion de la justicia.", priority: "alta", status: "cumplida" },
      { area: "Territorio y descentralizacion", position: "Financiacion singular para Cataluna. Dialogo con Generalitat. Modelo federal asimetrico de facto. Traspasos competenciales.", priority: "alta", status: "en-curso" },
      { area: "Politica exterior y UE", position: "Liderazgo en la UE post-presidencia espanola. Reconocimiento de Palestina. Relanzamiento de relaciones con Marruecos y Latinoamerica.", priority: "media", status: "cumplida" },
      { area: "Pensiones y proteccion social", position: "Revalorizacion con IPC garantizada. Destope progresivo de cotizaciones. IMV reforzado. Blindaje constitucional de pensiones.", priority: "alta", status: "en-curso" },
      { area: "Igualdad y derechos sociales", position: "Ley trans consolidada. Permiso de paternidad igualitario. Lucha contra la violencia de genero. Ley de familias.", priority: "media", status: "cumplida" },
    ],
    predictions: [
      { topic: "PIB 2025", claim: "Crecimiento del 2,4% del PIB en 2025", date: "Oct 2024", result: "parcial", details: "El FMI situa el crecimiento en 2,1%. El gobierno mantiene su prevision por encima del consenso." },
      { topic: "Empleo", claim: "Crear 500.000 empleos netos en la legislatura", date: "Nov 2023", result: "en-curso", details: "En 18 meses se han creado 380.000 empleos netos segun EPA." },
      { topic: "Inflacion", claim: "Contener la inflacion por debajo de la media UE", date: "Dic 2023", result: "acertada", details: "El IPC espanol se situa en el 2,8%, por debajo de la media UE del 3,1%." },
      { topic: "Vivienda", claim: "Los topes al alquiler reduciran los precios un 5%", date: "Feb 2024", result: "erronea", details: "Los precios del alquiler han subido un 8,7% interanual en zonas tensionadas segun Idealista." },
      { topic: "Deficit", claim: "Deficit publico por debajo del 3% en 2025", date: "Oct 2024", result: "pendiente", details: "AIReF estima un deficit del 2,8% pero con riesgos al alza por compromisos de gasto." },
      { topic: "Pensiones", claim: "Garantizar poder adquisitivo de pensiones sin recortes", date: "Nov 2023", result: "acertada", details: "Revalorizacion del 3,8% en 2024 con IPC. Sistema sostenible segun ultima reforma." },
    ],
  },
  {
    slug: "pp",
    name: "Partido Popular",
    acronym: "PP",
    color: "#0056a0",
    ideology: "Centroderecha liberal-conservador",
    seats: 137,
    leader: "Alberto Nunez Feijoo",
    slogan: "Espana merece mas",
    keyPromises: [
      "Bajada generalizada de impuestos (IRPF, Sociedades, IVA)",
      "Derogacion parcial de la Ley de Vivienda",
      "Endurecer politica migratoria con muro legal",
      "Devolver competencias de educacion al Estado",
      "Pacto nacional por la justicia y contra la ocupacion",
    ],
    policies: [
      { area: "Economia y empleo", position: "Bajada del IRPF en todos los tramos. Reduccion de cotizaciones para pymes. Plan de reindustrializacion. Simplificacion administrativa para empresas.", priority: "alta", status: "sin-datos" },
      { area: "Fiscalidad", position: "Bajada de impuestos generalizada. Eliminar Patrimonio e impuesto a grandes fortunas. Deflactar IRPF. Reducir IVA de productos basicos. Tipo minimo de Sociedades al 23%.", priority: "alta", status: "sin-datos" },
      { area: "Vivienda", position: "Derogar la Ley de Vivienda del PSOE. Liberalizar suelo. Ventajas fiscales al alquiler para propietarios. Ocupacion como delito con desahucio express en 24h.", priority: "alta", status: "sin-datos" },
      { area: "Sanidad", position: "Homogeneizar cartera de servicios en todas las CCAA. Reducir listas de espera un 50%. Colaboracion publico-privada. Tarjeta sanitaria unica.", priority: "media", status: "sin-datos" },
      { area: "Educacion", position: "Derogar la LOMLOE. Prueba nacional de evaluacion. Castellano como lengua vehicular garantizada. Libertad de eleccion de centro. MIR educativo.", priority: "alta", status: "sin-datos" },
      { area: "Energia y clima", position: "Mix energetico con nucleares (alargar vida de centrales). Energia renovable sin primas. Fin del impuesto a la generacion electrica. Gas natural como transicion.", priority: "media", status: "sin-datos" },
      { area: "Migracion", position: "Endurecer fronteras con muro legal. Vincular inmigracion a necesidades del mercado laboral. Acuerdos de devolucion con paises de origen. Centros de internamiento.", priority: "alta", status: "sin-datos" },
      { area: "Justicia y seguridad", position: "Derogar la Ley de Amnistia. Endurecer el Codigo Penal contra la multireincidencia. Apoyo a Fuerzas de Seguridad. Prisiones para delitos graves reincidentes.", priority: "alta", status: "sin-datos" },
      { area: "Territorio y descentralizacion", position: "Contra la financiacion singular de Cataluna. Igualdad entre espanoles. Recentralizacion de competencias en educacion y sanidad si hay disparidades.", priority: "alta", status: "sin-datos" },
      { area: "Politica exterior y UE", position: "Atlantismo reforzado. Relacion transatlantica con EEUU. Firmeza con Marruecos por Ceuta/Melilla. Oposicion al reconocimiento unilateral de Palestina.", priority: "media", status: "sin-datos" },
      { area: "Pensiones y proteccion social", position: "Compatibilizar pension y empleo. Incentivar ahorro privado complementario. Revisar destope de cotizaciones. Sostenibilidad del sistema a largo plazo.", priority: "media", status: "sin-datos" },
      { area: "Igualdad y derechos sociales", position: "Reformar la Ley del 'Solo si es si'. Proteccion integral a victimas de violencia. Ley de maternidad. Conciliacion laboral-familiar.", priority: "media", status: "sin-datos" },
    ],
    predictions: [
      { topic: "Impuestos", claim: "La subida fiscal del PSOE destruira 200.000 empleos", date: "Sep 2023", result: "erronea", details: "El empleo ha seguido creciendo. EPA muestra 380.000 empleos netos creados." },
      { topic: "Inflacion", claim: "La inflacion se desbocara por el gasto publico", date: "Oct 2023", result: "erronea", details: "La inflacion ha bajado al 2,8%, en linea con la tendencia europea." },
      { topic: "Vivienda", claim: "La Ley de Vivienda subira los precios del alquiler", date: "Dic 2023", result: "acertada", details: "Los precios del alquiler han subido un 8,7% en zonas tensionadas. La oferta se ha contraido." },
      { topic: "Cataluna", claim: "La amnistia no resolvera el conflicto catalan", date: "Ene 2024", result: "parcial", details: "La amnistia se aprobo pero el conflicto politico persiste. Junts sigue pidiendo referendum." },
      { topic: "Deficit", claim: "El deficit se disparara por encima del 4%", date: "Nov 2023", result: "erronea", details: "El deficit se situa en torno al 3%, por debajo de la prevision del PP." },
      { topic: "Europa", claim: "Espana perdera peso en Europa con el PSOE", date: "Jul 2023", result: "erronea", details: "Espana presidio la UE con exito y Teresa Ribera fue nombrada Comisaria." },
    ],
  },
  {
    slug: "vox",
    name: "VOX",
    acronym: "VOX",
    color: "#63be21",
    ideology: "Derecha conservadora y soberanista",
    seats: 33,
    leader: "Santiago Abascal",
    slogan: "Espana decide",
    keyPromises: [
      "Devolucion total de competencias de CCAA al Estado",
      "Deportacion masiva de inmigrantes ilegales",
      "Eliminacion de leyes de genero e igualdad",
      "Bajada radical de impuestos con flat tax",
      "Salida de la Agenda 2030 y del Pacto Verde",
    ],
    policies: [
      { area: "Economia y empleo", position: "Flat tax (tipo unico del 20%). Eliminar impuestos de Patrimonio, Sucesiones, Donaciones. Desburocratizacion total. Proteccionismo comercial frente a China.", priority: "alta", status: "sin-datos" },
      { area: "Fiscalidad", position: "Tipo unico en IRPF. Eliminar todos los impuestos 'ideologicos'. IVA superreducido para productos espanoles. Cero impuestos para familias con 3+ hijos.", priority: "alta", status: "sin-datos" },
      { area: "Vivienda", position: "Expulsion inmediata de ocupas. Prioridad espanoles en vivienda social. Eliminar restricciones al suelo urbano. Sin topes al alquiler.", priority: "media", status: "sin-datos" },
      { area: "Sanidad", position: "Exclusion de inmigrantes ilegales de la sanidad publica. Sanidad gratuita para espanoles sin copago. Eliminar la gestion autonomica.", priority: "media", status: "sin-datos" },
      { area: "Educacion", position: "Pin parental. Castellano unico vehicular. Eliminar educacion afectivo-sexual. Historia de Espana patriotica. Cheque escolar.", priority: "alta", status: "sin-datos" },
      { area: "Energia y clima", position: "Salir de la Agenda 2030 y el Pacto Verde Europeo. Apostar por la nuclear y el gas. Eliminar subvenciones a renovables. Contra el coche electrico obligatorio.", priority: "alta", status: "sin-datos" },
      { area: "Migracion", position: "Deportacion masiva de ilegales. Muro fisico en Ceuta y Melilla. Fin del efecto llamada. Prioridad nacional en ayudas sociales. Cierre de mezquitas radicales.", priority: "alta", status: "sin-datos" },
      { area: "Justicia y seguridad", position: "Prision permanente revisable efectiva. Cadena perpetua para terroristas. Proteccion total a las FFCCSE. Ilegalizacion de partidos 'golpistas'.", priority: "alta", status: "sin-datos" },
      { area: "Territorio y descentralizacion", position: "Supresion de las autonomias. Estado unitario centralizado. Eliminacion de parlamentos regionales. Unica ley en todo el territorio.", priority: "alta", status: "sin-datos" },
      { area: "Politica exterior y UE", position: "Soberania nacional frente a la UE. Veto a ampliaciones. Alianza con Hungria e Italia. Derogacion de acuerdos con Marruecos. Gibraltar espanol.", priority: "media", status: "sin-datos" },
      { area: "Pensiones y proteccion social", position: "Pensiones solo para espanoles. Eliminar IMV. Ayudas condicionadas a nacionalidad. Apoyo natalidad con incentivos fiscales.", priority: "media", status: "sin-datos" },
      { area: "Igualdad y derechos sociales", position: "Derogar Ley trans, Ley del Solo si es si, Ley de Memoria Democratica. Eliminar cuotas de genero. Proteccion de la familia tradicional.", priority: "alta", status: "sin-datos" },
    ],
    predictions: [
      { topic: "Migracion", claim: "Se producira una crisis migratoria incontrolable en Canarias", date: "Nov 2023", result: "parcial", details: "Las llegadas a Canarias han aumentado un 82%, pero el gobierno ha reforzado la cooperacion con paises africanos." },
      { topic: "Amnistia", claim: "La amnistia provocara una ruptura constitucional", date: "Ene 2024", result: "erronea", details: "El TC ha avalado parcialmente la ley. No ha habido ruptura institucional." },
      { topic: "PSOE", claim: "El gobierno de Sanchez caera antes de 2025", date: "Oct 2023", result: "erronea", details: "El gobierno sigue en funciones con apoyos parlamentarios suficientes." },
      { topic: "Economia", claim: "La economia espanola entrara en recesion por las politicas socialistas", date: "Sep 2023", result: "erronea", details: "Espana crece al 2,1% en 2025, liderando la zona euro." },
      { topic: "Seguridad", claim: "La delincuencia se disparara por la politica migratoria", date: "Mar 2024", result: "parcial", details: "Las cifras de criminalidad han subido ligeramente pero no de forma significativa segun Interior." },
      { topic: "Soberania", claim: "La UE impondra cuotas migratorias obligatorias a Espana", date: "Jun 2023", result: "acertada", details: "El Pacto de Migracion y Asilo de la UE incluye mecanismos de solidaridad obligatoria." },
    ],
  },
  {
    slug: "sumar",
    name: "SUMAR",
    acronym: "SUMAR",
    color: "#e5007e",
    ideology: "Izquierda plurinacional",
    seats: 27,
    leader: "Yolanda Diaz",
    slogan: "Sumar para gobernar",
    keyPromises: [
      "Jornada laboral de 32 horas sin reduccion salarial",
      "Alquiler social universal con parque publico de 500.000 viviendas",
      "Renta basica universal",
      "Banca publica",
      "Reforma fiscal para gravar al 1% mas rico",
    ],
    policies: [
      { area: "Economia y empleo", position: "Jornada de 32h a medio plazo. Salario maximo vinculado al minimo (ratio 1:12). Economia verde y social. Banca publica.", priority: "alta", status: "en-curso" },
      { area: "Fiscalidad", position: "Impuesto a los ultrarricos (patrimonio >10M). IVA del 0% en alimentos basicos permanente. Tasa Tobin reforzada. Fin de los paraisos fiscales internos.", priority: "alta", status: "en-curso" },
      { area: "Vivienda", position: "Parque publico de 500.000 viviendas en 10 anos. Alquiler maximo del 30% de ingresos. Requisar viviendas vacias de grandes tenedores. Fin de pisos turisticos en zonas tensionadas.", priority: "alta", status: "en-curso" },
      { area: "Sanidad", position: "Sanidad 100% publica. Eliminar conciertos con la privada progresivamente. Salud mental en atencion primaria. Salud dental publica.", priority: "alta", status: "en-curso" },
      { area: "Educacion", position: "Escuela publica como eje. Reducir conciertos. Educacion 0-3 universal y gratuita. Fin de la religion en el curriculo.", priority: "media", status: "en-curso" },
      { area: "Energia y clima", position: "100% renovables en 2035. Empresa publica de energia. Prohibir nuevas concesiones de gas. Transporte publico gratuito para menores de 30.", priority: "alta", status: "en-curso" },
      { area: "Migracion", position: "Regularizacion extraordinaria y permanente. Ius soli (nacionalidad por nacimiento). Voto municipal para residentes. Cierre de los CIE.", priority: "media", status: "en-curso" },
      { area: "Justicia y seguridad", position: "Reforma del CGPJ con participacion ciudadana. Justicia restaurativa. Reducir la poblacion penitenciaria. Despenalizar el consumo de cannabis.", priority: "baja", status: "sin-datos" },
      { area: "Territorio y descentralizacion", position: "Espana plurinacional. Derecho a decidir para las naciones del Estado. Federalismo asimetrico. Reconocimiento de lenguas cooficiales en el Congreso.", priority: "media", status: "en-curso" },
      { area: "Politica exterior y UE", position: "Europa social. Contra la austeridad. Reconocimiento de Palestina. Sanciones efectivas a Israel. Reforma de los tratados UE.", priority: "media", status: "cumplida" },
      { area: "Pensiones y proteccion social", position: "Pensiones publicas minimas de 1.200 euros. Renta basica universal. IMV universal sin requisitos burocraticos. Cuidados como derecho.", priority: "alta", status: "en-curso" },
      { area: "Igualdad y derechos sociales", position: "Feminismo institucional. Ley de cuidados. Diversidad afectivo-sexual en educacion. Igualdad salarial real con auditorias obligatorias.", priority: "media", status: "en-curso" },
    ],
    predictions: [
      { topic: "Jornada laboral", claim: "La jornada de 37,5h se aprobara en 2024", date: "Dic 2023", result: "erronea", details: "No se aprobo en 2024 por falta de acuerdo con la patronal. Sigue en tramitacion en 2025." },
      { topic: "Vivienda", claim: "Los topes al alquiler frenaran la especulacion", date: "Ene 2024", result: "erronea", details: "Los precios han seguido subiendo. La oferta de alquiler se ha reducido un 15% en zonas reguladas." },
      { topic: "Economia social", claim: "La economia social creara 100.000 empleos en 2 anos", date: "Mar 2024", result: "pendiente", details: "El sector cooperativo crece pero las cifras estan lejos del objetivo." },
      { topic: "Fiscalidad", claim: "El impuesto a grandes fortunas recaudara 1.500M euros", date: "Nov 2023", result: "parcial", details: "Ha recaudado unos 620M euros, por debajo de la prevision pero es el primer ejercicio completo." },
      { topic: "Energia", claim: "Espana alcanzara el 50% de renovables en el mix electrico en 2024", date: "Ene 2024", result: "acertada", details: "Las renovables superaron el 50% del mix electrico en 2024 segun REE." },
      { topic: "SMI", claim: "El SMI subira a 1.200 euros en 2025", date: "Oct 2024", result: "parcial", details: "El SMI subio a 1.134 euros, por debajo de los 1.200 prometidos." },
    ],
  },
  {
    slug: "erc",
    name: "Esquerra Republicana de Catalunya",
    acronym: "ERC",
    color: "#ffb232",
    ideology: "Izquierda republicana e independentista",
    seats: 7,
    leader: "Oriol Junqueras",
    slogan: "Fem Republica",
    keyPromises: [
      "Referendum de autodeterminacion",
      "Financiacion singular para Cataluna (cupo catalan)",
      "Inmersion linguistica total en catalan",
      "Republica catalana independiente",
      "Justicia social con perspectiva nacional",
    ],
    policies: [
      { area: "Economia y empleo", position: "Soberania fiscal plena para Cataluna. Agencia tributaria propia. Reindustrializacion comarcal. Economia de proximidad.", priority: "alta", status: "en-curso" },
      { area: "Fiscalidad", position: "Cupo catalan (recaudar y gestionar todos los impuestos). Pacto fiscal bilateral. Fin del deficit fiscal con el Estado.", priority: "alta", status: "en-curso" },
      { area: "Vivienda", position: "Regulacion estricta de alquileres turisticos. Vivienda publica masiva. Penalizar pisos vacios. Derecho de tanteo municipal.", priority: "media", status: "en-curso" },
      { area: "Sanidad", position: "Gestion autonoma plena. Aumento del gasto sanitario al 7% del PIB catalan. Salud mental priorizada.", priority: "media", status: "en-curso" },
      { area: "Educacion", position: "Inmersion linguistica en catalan. Modelo educativo propio. Universidad publica reforzada. Investigacion en catalan.", priority: "alta", status: "cumplida" },
      { area: "Energia y clima", position: "Soberania energetica. 100% renovables. Cierre de petroquimicas. Cataluna libre de nucleares y gas.", priority: "media", status: "sin-datos" },
      { area: "Migracion", position: "Cataluna acogedora. Integracion linguistica en catalan. Regularizacion de migrantes. Politica propia de asilo.", priority: "baja", status: "sin-datos" },
      { area: "Justicia y seguridad", position: "Mossos d'Esquadra como unico cuerpo policial. Justicia en catalan. Amnistia como paso previo al referendum.", priority: "alta", status: "en-curso" },
      { area: "Territorio y descentralizacion", position: "Autodeterminacion como derecho democratico. Republica catalana. Relacion bilateral con Espana. Cataluna como Estado en la UE.", priority: "alta", status: "en-curso" },
      { area: "Politica exterior y UE", position: "Cataluna en la UE como Estado miembro. Relaciones internacionales propias. Delegaciones en el exterior.", priority: "media", status: "sin-datos" },
      { area: "Pensiones y proteccion social", position: "Renta garantizada de ciudadania catalana. Gestion propia de prestaciones. Modelo nordico de proteccion social.", priority: "media", status: "en-curso" },
      { area: "Igualdad y derechos sociales", position: "Feminismo y diversidad desde la perspectiva nacional. Igualdad linguistica real. Derechos LGTBI+.", priority: "baja", status: "sin-datos" },
    ],
    predictions: [
      { topic: "Financiacion", claim: "Conseguiremos el cupo catalan en esta legislatura", date: "Nov 2023", result: "en-curso", details: "El acuerdo PSC-ERC incluye un modelo de financiacion singular. Pendiente de materializarse." },
      { topic: "Amnistia", claim: "La amnistia se aprobara y sera efectiva en 2024", date: "Ene 2024", result: "parcial", details: "Aprobada, pero el TS ha retrasado su aplicacion a Puigdemont, generando controversia." },
      { topic: "Referendum", claim: "Habra referendum de autodeterminacion antes de 2027", date: "Nov 2023", result: "pendiente", details: "El PSOE ha rechazado la via del referendum. ERC mantiene la reivindicacion." },
      { topic: "Inmersion", claim: "El modelo de inmersion linguistica se mantendra intacto", date: "Dic 2023", result: "parcial", details: "El TSJC ordeno el 25% de castellano pero la Generalitat no lo aplica sistematicamente." },
    ],
  },
  {
    slug: "pnv",
    name: "Partido Nacionalista Vasco",
    acronym: "PNV",
    color: "#e30613",
    ideology: "Nacionalismo vasco moderado, democristiano",
    seats: 5,
    leader: "Andoni Ortuzar",
    slogan: "Egin dezagun Euskadi",
    keyPromises: [
      "Actualizacion del Concierto Economico",
      "Nuevo Estatuto de Autonomia para Euskadi",
      "Autogobierno reforzado con transferencias pendientes",
      "Liderazgo industrial vasco en la transicion verde",
      "Euskera como lengua de cohesion social",
    ],
    policies: [
      { area: "Economia y empleo", position: "Reindustrializacion avanzada. Clusterizacion empresarial. Apoyo a la internacionalizacion. Formacion dual excelente.", priority: "alta", status: "en-curso" },
      { area: "Fiscalidad", position: "Defensa a ultranza del Concierto Economico. Capacidad normativa plena. Competitividad fiscal como herramienta de desarrollo.", priority: "alta", status: "cumplida" },
      { area: "Vivienda", position: "Etxebizitza: parque publico de alquiler. Rehabilitacion de vivienda vacia. Promocion de vivienda protegida.", priority: "media", status: "en-curso" },
      { area: "Sanidad", position: "Osakidetza como referente. Innovacion sanitaria. Investigacion biomedica en Euskadi.", priority: "media", status: "en-curso" },
      { area: "Educacion", position: "Modelo trilingue (euskera-castellano-ingles). Universidad publica de calidad. FP como pilar.", priority: "media", status: "en-curso" },
      { area: "Energia y clima", position: "Transicion energetica liderada desde la industria vasca. Hidrogeno verde. Eolica marina.", priority: "media", status: "en-curso" },
      { area: "Territorio y descentralizacion", position: "Nuevo Estatuto de Gernika. Mas autogobierno. Bilateralidad con el Estado. Transferencias pendientes ya.", priority: "alta", status: "en-curso" },
      { area: "Politica exterior y UE", position: "Euskadi con voz propia en la UE. Euroregion vasca. Cooperacion transfronteriza.", priority: "baja", status: "en-curso" },
      { area: "Pensiones y proteccion social", position: "Complemento vasco a pensiones minimas. RGI (Renta de Garantia de Ingresos) como modelo.", priority: "media", status: "cumplida" },
      { area: "Migracion", position: "Acogida integrada. Euskera para migrantes. Inclusion sociolaboral.", priority: "baja", status: "en-curso" },
      { area: "Justicia y seguridad", position: "Ertzaintza como policia integral. Gestion penitenciaria propia. Modelo de seguridad ciudadana propio.", priority: "media", status: "en-curso" },
      { area: "Igualdad y derechos sociales", position: "Emakunde como referente. Igualdad de genero en empresas. Politicas de conciliacion avanzadas.", priority: "baja", status: "en-curso" },
    ],
    predictions: [
      { topic: "Autogobierno", claim: "Se completaran las transferencias pendientes (gestion economica de la SS)", date: "Ene 2024", result: "en-curso", details: "Negociaciones en marcha pero sin acuerdo definitivo por ahora." },
      { topic: "Estatuto", claim: "El nuevo Estatuto se tramitara antes de 2027", date: "Mar 2024", result: "pendiente", details: "Existe borrador pero el calendario parlamentario vasco va lento." },
      { topic: "Economia", claim: "Euskadi mantendra el pleno empleo tecnico", date: "Dic 2023", result: "acertada", details: "El paro vasco esta en el 7,8%, el mas bajo de Espana." },
      { topic: "Industria", claim: "Euskadi liderara la produccion de hidrogeno verde en Espana", date: "Feb 2024", result: "en-curso", details: "Petronor/Repsol y el Corredor Vasco del Hidrogeno avanzan. Primeras plantas en 2026." },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "cumplida": { label: "Cumplida", color: "#059669", bg: "#d1fae5" },
  "en-curso": { label: "En curso", color: "#d97706", bg: "#fef3c7" },
  "incumplida": { label: "Incumplida", color: "#dc2626", bg: "#fee2e2" },
  "sin-datos": { label: "Sin datos", color: "#6b7280", bg: "#f3f4f6" },
};

const RESULT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "acertada": { label: "Acertada", color: "#059669", bg: "#d1fae5" },
  "parcial": { label: "Parcial", color: "#d97706", bg: "#fef3c7" },
  "erronea": { label: "Erronea", color: "#dc2626", bg: "#fee2e2" },
  "pendiente": { label: "Pendiente", color: "#6b7280", bg: "#f3f4f6" },
  "en-curso": { label: "En curso", color: "#2563eb", bg: "#dbeafe" },
};

type Tab = "programas" | "comparar" | "predicciones";

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ProgramasPage() {
  const [tab, setTab] = useState<Tab>("programas");
  const [selectedParty, setSelectedParty] = useState<string>("psoe");
  const [compareParties, setCompareParties] = useState<string[]>(["psoe", "pp"]);
  const [filterArea, setFilterArea] = useState<string>("todas");

  const party = PARTIES.find(p => p.slug === selectedParty) ?? PARTIES[0];

  const toggleCompare = (slug: string) => {
    setCompareParties(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : prev.length < 4
          ? [...prev, slug]
          : prev
    );
  };

  const comparedParties = useMemo(
    () => PARTIES.filter(p => compareParties.includes(p.slug)),
    [compareParties]
  );

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border)",
    background: tab === t ? "var(--azul, #2563eb)" : "var(--bg)",
    color: tab === t ? "white" : "var(--ink)",
    cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
    transition: "all 0.2s",
  });

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <SiteHeader currentSection="programas" />

      <section className="detail-hero" style={{ textAlign: "center", padding: "var(--space-xl) var(--space-md)" }}>
        <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--azul)" }}>
          Analisis politico
        </span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "var(--space-sm) 0", color: "var(--ink)" }}>
          Programas Politicos
        </h1>
        <p style={{ maxWidth: 650, margin: "0 auto", color: "var(--ink-muted)", lineHeight: 1.7, fontSize: "1.05rem" }}>
          Explora los programas de cada partido, compara sus posiciones y contrasta sus predicciones con la realidad.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 var(--space-md) var(--space-xl)" }}>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
          <button style={tabStyle("programas")} onClick={() => setTab("programas")}>Programas</button>
          <button style={tabStyle("comparar")} onClick={() => setTab("comparar")}>Comparar</button>
          <button style={tabStyle("predicciones")} onClick={() => setTab("predicciones")}>Predicciones</button>
        </div>

        {/* ═══ TAB: PROGRAMAS ═══ */}
        {tab === "programas" && (
          <div>
            {/* Party selector */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "var(--space-lg)" }}>
              {PARTIES.map(p => (
                <button
                  key={p.slug}
                  onClick={() => setSelectedParty(p.slug)}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    border: `2px solid ${selectedParty === p.slug ? p.color : "var(--border)"}`,
                    background: selectedParty === p.slug ? p.color + "15" : "var(--bg)",
                    color: selectedParty === p.slug ? p.color : "var(--ink)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                    transition: "all 0.2s",
                  }}
                >
                  {p.acronym}
                </button>
              ))}
            </div>

            {/* Party header */}
            <div style={{
              padding: "var(--space-lg)", borderRadius: 16,
              border: `2px solid ${party.color}30`,
              background: `linear-gradient(135deg, ${party.color}08, ${party.color}03)`,
              marginBottom: "var(--space-lg)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-md)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: party.color, color: "white", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                    }}>{party.acronym.slice(0, 2)}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--ink)" }}>{party.acronym}</h2>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-muted)" }}>{party.name}</p>
                    </div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                    <strong>Lider:</strong> {party.leader} &middot; <strong>Escanos:</strong> {party.seats} &middot; <strong>Ideologia:</strong> {party.ideology}
                  </p>
                </div>
                <div style={{
                  padding: "8px 16px", borderRadius: 8, background: party.color + "15",
                  color: party.color, fontWeight: 600, fontStyle: "italic", fontSize: "1.1rem",
                }}>
                  &ldquo;{party.slogan}&rdquo;
                </div>
              </div>

              {/* Key promises */}
              <div style={{ marginTop: "var(--space-md)" }}>
                <h3 style={{ fontSize: "1rem", color: party.color, marginBottom: 8 }}>Promesas clave</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {party.keyPromises.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.9rem" }}>
                      <span style={{ color: party.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: "var(--ink)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Area filter */}
            <div style={{ marginBottom: "var(--space-md)" }}>
              <select
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg)", color: "var(--ink)", fontSize: "0.9rem",
                }}
              >
                <option value="todas">Todas las areas</option>
                {POLICY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Policies grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {party.policies
                .filter(p => filterArea === "todas" || p.area === filterArea)
                .map((pol, i) => {
                  const st = STATUS_LABELS[pol.status];
                  return (
                    <div key={i} style={{
                      padding: "var(--space-md)", borderRadius: 12,
                      border: "1px solid var(--border)", background: "var(--bg)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem",
                            fontWeight: 600, background: party.color + "15", color: party.color,
                          }}>{pol.area}</span>
                          <span style={{
                            padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem",
                            fontWeight: 600,
                            background: pol.priority === "alta" ? "#fee2e2" : pol.priority === "media" ? "#fef3c7" : "#f3f4f6",
                            color: pol.priority === "alta" ? "#dc2626" : pol.priority === "media" ? "#d97706" : "#6b7280",
                          }}>
                            Prioridad {pol.priority}
                          </span>
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem",
                          fontWeight: 600, background: st.bg, color: st.color,
                        }}>{st.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.6 }}>{pol.position}</p>
                    </div>
                  );
                })}
            </div>

            {/* Export button */}
            <button
              onClick={() => window.print()}
              style={{
                marginTop: "var(--space-lg)", padding: "12px 24px", borderRadius: 10,
                background: party.color, color: "white", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
              }}
            >
              Exportar programa (PDF)
            </button>
          </div>
        )}

        {/* ═══ TAB: COMPARAR ═══ */}
        {tab === "comparar" && (
          <div>
            <p style={{ color: "var(--ink-muted)", marginBottom: "var(--space-md)", fontSize: "0.95rem" }}>
              Selecciona hasta 4 partidos para comparar sus posiciones area por area.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "var(--space-lg)" }}>
              {PARTIES.map(p => (
                <button
                  key={p.slug}
                  onClick={() => toggleCompare(p.slug)}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    border: `2px solid ${compareParties.includes(p.slug) ? p.color : "var(--border)"}`,
                    background: compareParties.includes(p.slug) ? p.color + "15" : "var(--bg)",
                    color: compareParties.includes(p.slug) ? p.color : "var(--ink-muted)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                    transition: "all 0.2s",
                  }}
                >
                  {compareParties.includes(p.slug) ? "\u2713 " : ""}{p.acronym}
                </button>
              ))}
            </div>

            {/* Area filter for comparison */}
            <div style={{ marginBottom: "var(--space-md)" }}>
              <select
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg)", color: "var(--ink)", fontSize: "0.9rem",
                }}
              >
                <option value="todas">Todas las areas</option>
                {POLICY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Comparison table by area */}
            {(filterArea === "todas" ? POLICY_AREAS : [filterArea]).map(area => (
              <div key={area} style={{
                marginBottom: "var(--space-lg)", borderRadius: 12,
                border: "1px solid var(--border)", overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 16px", background: "var(--azul, #2563eb)",
                  color: "white", fontWeight: 700, fontSize: "1rem",
                }}>
                  {area}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparedParties.length}, 1fr)` }}>
                  {comparedParties.map(p => {
                    const pol = p.policies.find(pol => pol.area === area);
                    const st = pol ? STATUS_LABELS[pol.status] : STATUS_LABELS["sin-datos"];
                    return (
                      <div key={p.slug} style={{
                        padding: "var(--space-md)",
                        borderRight: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <span style={{
                            display: "inline-block", width: 10, height: 10,
                            borderRadius: "50%", background: p.color, flexShrink: 0,
                          }} />
                          <strong style={{ color: p.color, fontSize: "0.9rem" }}>{p.acronym}</strong>
                          {pol && (
                            <span style={{
                              padding: "1px 6px", borderRadius: 4, fontSize: "0.65rem",
                              fontWeight: 600, background: st.bg, color: st.color, marginLeft: "auto",
                            }}>{st.label}</span>
                          )}
                        </div>
                        <p style={{
                          margin: 0, fontSize: "0.85rem", color: "var(--ink)",
                          lineHeight: 1.5,
                        }}>
                          {pol?.position ?? "Sin posicion definida en esta area."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => window.print()}
              style={{
                padding: "12px 24px", borderRadius: 10,
                background: "var(--azul)", color: "white", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
              }}
            >
              Exportar comparativa (PDF)
            </button>
          </div>
        )}

        {/* ═══ TAB: PREDICCIONES ═══ */}
        {tab === "predicciones" && (
          <div>
            <p style={{ color: "var(--ink-muted)", marginBottom: "var(--space-lg)", fontSize: "0.95rem" }}>
              Cada partido lanza predicciones sobre economia, politica y sociedad. Aqui contrastamos sus afirmaciones con la realidad.
            </p>

            {PARTIES.map(p => {
              const stats = {
                acertada: p.predictions.filter(pr => pr.result === "acertada").length,
                parcial: p.predictions.filter(pr => pr.result === "parcial").length,
                erronea: p.predictions.filter(pr => pr.result === "erronea").length,
                pendiente: p.predictions.filter(pr => pr.result === "pendiente" || pr.result === "en-curso").length,
              };
              const total = p.predictions.length;
              const accuracy = total > 0 ? Math.round(((stats.acertada + stats.parcial * 0.5) / total) * 100) : 0;

              return (
                <div key={p.slug} style={{
                  marginBottom: "var(--space-lg)", borderRadius: 16,
                  border: `2px solid ${p.color}25`, overflow: "hidden",
                }}>
                  {/* Party header */}
                  <div style={{
                    padding: "var(--space-md) var(--space-lg)",
                    background: `linear-gradient(135deg, ${p.color}12, ${p.color}05)`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: "var(--space-sm)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: 8, background: p.color,
                        color: "white", fontWeight: 800, fontSize: "0.85rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{p.acronym.slice(0, 2)}</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink)" }}>{p.acronym}</h3>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--ink-muted)" }}>{p.leader}</p>
                      </div>
                    </div>

                    {/* Accuracy score */}
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontSize: "1.8rem", fontWeight: 800,
                          color: accuracy >= 60 ? "#059669" : accuracy >= 40 ? "#d97706" : "#dc2626",
                        }}>{accuracy}%</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>fiabilidad</div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          { n: stats.acertada, c: "#059669", l: "A" },
                          { n: stats.parcial, c: "#d97706", l: "P" },
                          { n: stats.erronea, c: "#dc2626", l: "E" },
                          { n: stats.pendiente, c: "#6b7280", l: "?" },
                        ].map(({ n, c, l }) => (
                          <span key={l} style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: 6, background: c + "18",
                            color: c, fontWeight: 700, fontSize: "0.8rem",
                          }} title={`${l}: ${n}`}>{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Predictions list */}
                  <div>
                    {p.predictions.map((pred, i) => {
                      const r = RESULT_LABELS[pred.result];
                      return (
                        <div key={i} style={{
                          padding: "var(--space-md) var(--space-lg)",
                          borderTop: "1px solid var(--border)",
                          background: "var(--bg)",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                            <div>
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 600, color: p.color,
                                textTransform: "uppercase", letterSpacing: 0.5,
                              }}>{pred.topic}</span>
                              <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", marginLeft: 8 }}>{pred.date}</span>
                            </div>
                            <span style={{
                              padding: "2px 10px", borderRadius: 6, fontSize: "0.75rem",
                              fontWeight: 600, background: r.bg, color: r.color, flexShrink: 0,
                            }}>{r.label}</span>
                          </div>
                          <p style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)" }}>
                            &ldquo;{pred.claim}&rdquo;
                          </p>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
                            {pred.details}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => window.print()}
              style={{
                padding: "12px 24px", borderRadius: 10,
                background: "var(--azul)", color: "white", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
              }}
            >
              Exportar predicciones (PDF)
            </button>
          </div>
        )}

        {/* DISCLAIMER */}
        <div style={{
          marginTop: "var(--space-xl)", padding: "var(--space-md)",
          background: "#fef3c7", borderRadius: 12, borderLeft: "4px solid #d97706",
          fontSize: "0.85rem", color: "#92400e", lineHeight: 1.6,
        }}>
          <strong>Nota:</strong> Las posiciones politicas se basan en los programas electorales oficiales, declaraciones publicas
          y propuestas legislativas de cada partido. Las predicciones se contrastan con datos de fuentes oficiales (INE, Eurostat, AIReF, Banco de Espana).
          Esta herramienta es informativa y no pretende favorecer a ningun partido.
        </div>
      </section>

      <style>{`
        @media print {
          .page-shell > header, .ambient, .detail-hero span, button { display: none !important; }
          .page-shell { padding: 0 !important; }
          section { max-width: 100% !important; }
        }
      `}</style>
    </main>
  );
}
