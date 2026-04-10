import { buildScoringData } from "../../../lib/scoring-riesgo-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildScoringData());
  } catch (err) {
    console.error("Scoring Riesgo API error:", err);
    return Response.json({ error: "Error loading scoring data" }, { status: 500 });
  }
}
