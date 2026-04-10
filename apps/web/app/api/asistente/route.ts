import { ministries } from "../../../lib/ministerios-data";
import { buildRadarData } from "../../../lib/radar-regulatorio-data";
import { buildCargosData } from "../../../lib/cargos-publicos-data";
import { buildEducacionData } from "../../../lib/educacion-civica-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const radar = buildRadarData();
    const cargos = buildCargosData();
    const educacion = buildEducacionData();
    return Response.json({
      availableTopics: [
        { id: "normativa", label: "Normativa y regulación", alertCount: radar.stats.totalAlerts },
        { id: "instituciones", label: "Instituciones y organismos", ministryCount: ministries.length },
        { id: "cargos", label: "Cargos públicos", officialCount: cargos.stats.totalTracked },
        { id: "presupuestos", label: "Presupuestos y finanzas", description: "PGE 2026, NGEU, fiscalidad" },
        { id: "territorial", label: "Organización territorial", description: "CCAA, ayuntamientos, competencias" },
        { id: "europa", label: "España en la UE", description: "Directivas, fondos, transposiciones" },
        { id: "elecciones", label: "Sistema electoral", description: "D'Hondt, circunscripciones, partidos" },
      ],
      educationModules: educacion.stats.totalModules,
      glossaryTerms: educacion.glossary.length,
      meta: { model: "IA asistida por datos oficiales", sources: "BOE, Congreso, Senado, INE, IGAE, datos.gob.es" },
    });
  } catch (err) {
    console.error("Asistente API error:", err);
    return Response.json({ error: "Error loading asistente data" }, { status: 500 });
  }
}
