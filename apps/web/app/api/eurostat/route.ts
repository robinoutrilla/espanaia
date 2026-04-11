import { NextResponse } from "next/server";
import { getEurostatSnapshot, getEurostatIndicator } from "../../../lib/eurostat-live";

/** Revalidate every 6 hours */
export const revalidate = 21600;

/**
 * GET /api/eurostat
 *
 * Query parameters:
 *   (none)      → full snapshot: Spain vs EU on 9 macro indicators
 *   ?id=<id>    → single indicator (gov-debt, unemployment, inflation, etc.)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  if (id) {
    const indicator = await getEurostatIndicator(id);
    if (!indicator) {
      return NextResponse.json({ error: "Indicador no encontrado", id }, { status: 404 });
    }
    return NextResponse.json({ indicator });
  }

  const snapshot = await getEurostatSnapshot();
  return NextResponse.json(snapshot);
}
