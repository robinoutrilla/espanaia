import type { BudgetSnapshot } from "@espanaia/shared-types";

interface BudgetCardProps {
  snapshot: BudgetSnapshot;
  territoryLabel: string;
}

export function BudgetCard({ snapshot, territoryLabel }: BudgetCardProps) {
  const trendLabel = snapshot.trend === "up" ? "Aceleración" : snapshot.trend === "down" ? "Presión" : "Estable";

  return (
    <article className="budget-card">
      <div className="budget-topline">
        <div>
          <span className="budget-territory">{territoryLabel}</span>
          <p>{snapshot.fiscalYear}</p>
        </div>
        <span className={`tag tag-${snapshot.trend}`}>{trendLabel}</span>
      </div>
      <div className="budget-score">
        <strong>{snapshot.executionRate}%</strong>
        <span>
          {snapshot.variationVsPlan > 0 ? "+" : ""}
          {snapshot.variationVsPlan}% vs plan
        </span>
      </div>
      <div className="budget-programs">
        {snapshot.highlightedPrograms.map((program) => (
          <div className="budget-program" key={program.code}>
            <span>{program.label}</span>
            <strong>{program.amountM} M</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
