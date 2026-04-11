import { buildNextGenData } from "../../../lib/next-gen-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  try {
    return Response.json(buildNextGenData());
  } catch (err) {
    console.error("Next-Gen API error:", err);
    return Response.json({ error: "Error loading next-gen data" }, { status: 500 });
  }
}
