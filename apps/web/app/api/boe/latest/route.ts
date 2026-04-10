import { boeItems, seedGeneratedAt } from "@espanaia/seed-data";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    generatedAt: seedGeneratedAt,
    total: boeItems.length,
    items: boeItems,
  });
}
