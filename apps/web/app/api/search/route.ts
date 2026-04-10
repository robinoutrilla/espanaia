import { searchEntities, seedGeneratedAt } from "@espanaia/seed-data";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  return NextResponse.json({
    query,
    generatedAt: seedGeneratedAt,
    results: searchEntities(query),
  });
}
