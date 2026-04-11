import { buildPoliticalTwinData, getEntityTwin, getEntityPatterns, getEntityAlliances, getEntityContradictions, getEntityPredictions, getEntityAlerts } from "../../../lib/political-twin-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");

    if (entity) {
      const twin = getEntityTwin(entity);
      if (!twin) {
        return Response.json({ error: "Entity not found" }, { status: 404 });
      }
      return Response.json({
        entity: twin,
        patterns: getEntityPatterns(entity),
        alliances: getEntityAlliances(entity),
        contradictions: getEntityContradictions(entity),
        predictions: getEntityPredictions(entity),
        alerts: getEntityAlerts(entity),
      });
    }

    return Response.json(buildPoliticalTwinData());
  } catch (err) {
    console.error("Political Twin API error:", err);
    return Response.json({ error: "Error loading political twin data" }, { status: 500 });
  }
}
