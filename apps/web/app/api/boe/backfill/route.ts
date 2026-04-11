/* ═══════════════════════════════════════════════════════════════════════════
   POST /api/boe/backfill — Trigger BOE historical backfill
   GET  /api/boe/backfill — Check backfill status / archive stats

   Fetches BOE summaries day-by-day going backwards and persists to
   JSONL archive for RAG search. Each call processes N days (default 7).

   Query parameters:
     ?days=N         → number of days to backfill (default 7, max 90)
     ?from=YYYYMMDD  → start date (default: continues from last backfill)
   ═══════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { backfillBoe, getBoeArchiveStats } from "../../../../lib/boe-store";

export const maxDuration = 60; // Allow up to 60s for backfill

export async function GET() {
  const stats = getBoeArchiveStats();
  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "7", 10) || 7, 90);
  const startFrom = searchParams.get("from") ?? undefined;

  try {
    const result = await backfillBoe({
      days,
      startFrom: startFrom || undefined,
      concurrency: 3,
    });

    const successful = result.results.filter(r => r.itemsFetched > 0);
    const skipped = result.results.filter(r => r.skipped);
    const errors = result.results.filter(r => r.error && !r.skipped);

    return NextResponse.json({
      status: "ok",
      summary: {
        daysProcessed: result.results.length,
        daysWithData: successful.length,
        daysSkipped: skipped.length,
        daysErrored: errors.length,
        totalNewItems: result.totalNew,
      },
      details: result.results,
      archive: result.meta,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backfill failed" },
      { status: 500 }
    );
  }
}
