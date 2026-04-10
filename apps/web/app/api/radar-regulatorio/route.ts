import { buildRadarData } from "../../../lib/radar-regulatorio-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildRadarData());
  } catch (err) {
    console.error("Radar API error:", err);
    return Response.json({ error: "Error loading radar data" }, { status: 500 });
  }
}
