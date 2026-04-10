import { buildCargosData } from "../../../lib/cargos-publicos-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildCargosData());
  } catch (err) {
    console.error("Cargos Públicos API error:", err);
    return Response.json({ error: "Error loading cargos data" }, { status: 500 });
  }
}
