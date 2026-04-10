import type { DashboardMetric } from "@espanaia/shared-types";

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-head">
        <span>{metric.label}</span>
        <strong>{metric.delta}</strong>
      </div>
      <p className="metric-value">{metric.value}</p>
      <p className="metric-caption">{metric.caption}</p>
    </article>
  );
}
