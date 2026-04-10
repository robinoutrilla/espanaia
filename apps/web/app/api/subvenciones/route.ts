import { buildSubvencionesData } from "../../../lib/subvenciones-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildSubvencionesData());
  } catch (err) {
    console.error("Subvenciones API error:", err);
    return Response.json({ error: "Error loading subvenciones data" }, { status: 500 });
  }
}
