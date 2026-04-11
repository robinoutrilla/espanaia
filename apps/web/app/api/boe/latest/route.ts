import { boeItems, seedGeneratedAt } from "@espanaia/seed-data";
import { NextResponse } from "next/server";
import { getLatestBoe, getBoeStats } from "../../../../lib/boe-live";

/** Revalidate every hour — BOE publishes once daily */
export const revalidate = 3600;

/**
 * GET /api/boe/latest
 *
 * Query parameters:
 *   (none)        → latest BOE items (live from boe.es, fallback to seed)
 *   ?stats=true   → BOE statistics (ministry breakdown, section counts)
 *   ?limit=N      → limit results (default 30)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30", 10) || 30, 200);

  // Stats endpoint
  if (searchParams.get("stats") === "true") {
    try {
      const stats = await getBoeStats();
      return NextResponse.json({ live: true, ...stats });
    } catch {
      return NextResponse.json({
        live: false,
        totalDisposiciones: boeItems.length,
        boeDate: "",
        topMinistries: [],
        sectionBreakdown: [],
      });
    }
  }

  // Main endpoint — try live BOE first
  try {
    const result = await getLatestBoe(limit);
    if (result.items.length > 0) {
      return NextResponse.json({
        live: true,
        generatedAt: result.fetchedAt,
        boeDate: result.boeDate,
        total: result.total,
        showing: result.items.length,
        items: result.items,
      });
    }
  } catch {
    // Fall through to seed data
  }

  // Fallback to seed data
  return NextResponse.json({
    live: false,
    generatedAt: seedGeneratedAt,
    total: boeItems.length,
    showing: boeItems.length,
    items: boeItems,
  });
}
