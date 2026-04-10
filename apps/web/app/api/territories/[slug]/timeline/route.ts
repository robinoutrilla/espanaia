import { getTerritoryTimeline, seedGeneratedAt } from "@espanaia/seed-data";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  return NextResponse.json({
    generatedAt: seedGeneratedAt,
    territory: slug,
    items: getTerritoryTimeline(slug),
  });
}
