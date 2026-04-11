import { buildSimuladorData } from "../../../lib/simulador-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildSimuladorData());
  } catch (err) {
    console.error("Simulador API error:", err);
    return Response.json({ error: "Error loading simulador data" }, { status: 500 });
  }
}
