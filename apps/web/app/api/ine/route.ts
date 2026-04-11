import { NextResponse } from "next/server";
import { getIneIndicators, getIneIndicator, getIneByCategory } from "../../../lib/ine-live";

/** Revalidate every hour — INE updates monthly/quarterly */
export const revalidate = 3600;

/**
 * GET /api/ine
 *
 * Query parameters:
 *   (none)          → all key indicators snapshot
 *   ?id=<id>        → single indicator (e.g. tasa-paro, ipc-general)
 *   ?category=<cat> → indicators by category (empleo, precios, pib, vivienda, demografia, industria)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  if (id) {
    const indicator = await getIneIndicator(id);
    if (!indicator) {
      return NextResponse.json({ error: "Indicador no encontrado", id }, { status: 404 });
    }
    return NextResponse.json({ indicator });
  }

  const category = searchParams.get("category");
  if (category) {
    const indicators = await getIneByCategory(category);
    return NextResponse.json({ category, indicators });
  }

  const snapshot = await getIneIndicators();
  return NextResponse.json(snapshot);
}
