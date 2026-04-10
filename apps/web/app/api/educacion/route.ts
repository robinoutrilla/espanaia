import { buildEducacionData } from "../../../lib/educacion-civica-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildEducacionData());
  } catch (err) {
    console.error("Educación API error:", err);
    return Response.json({ error: "Error loading educacion data" }, { status: 500 });
  }
}
