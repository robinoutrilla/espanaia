import { buildSignalEngineData } from "../../../lib/signal-engine-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildSignalEngineData());
  } catch (err) {
    console.error("Signal Engine API error:", err);
    return Response.json({ error: "Error loading signal engine data" }, { status: 500 });
  }
}
