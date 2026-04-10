import { buildPoliticalGraph, getGraphForView } from "../../../lib/decision-graph-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeTypesParam = searchParams.get("types");
    const minWeight = searchParams.get("minWeight");

    const nodeTypes = nodeTypesParam ? nodeTypesParam.split(",") as any[] : undefined;

    const data = nodeTypes || minWeight
      ? getGraphForView({ nodeTypes, minWeight: minWeight ? parseFloat(minWeight) : undefined })
      : buildPoliticalGraph();

    return Response.json(data);
  } catch (err) {
    console.error("Decisiones API error:", err);
    return Response.json({ error: "Error loading decision graph" }, { status: 500 });
  }
}
