import { budgetSnapshots, getBudgetSummary, seedGeneratedAt } from "@espanaia/seed-data";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    generatedAt: seedGeneratedAt,
    summary: getBudgetSummary(),
    items: budgetSnapshots,
  });
}
