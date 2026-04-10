import type { TimelineItem } from "@espanaia/shared-types";

const sourceLabels: Record<TimelineItem["sourceType"], string> = {
  official: "Oficial",
  media: "Medios",
  social: "Social",
  budget: "Presupuesto",
  election: "Electoral",
  parliamentary: "Parlamento",
};

interface SignalCardProps {
  signal: TimelineItem;
  territoryLabel: string;
}

export function SignalCard({ signal, territoryLabel }: SignalCardProps) {
  const publishedAt = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(signal.publishedAt));

  return (
    <article className="signal-card">
      <div className="signal-meta">
        <span className="tag tag-bright">{sourceLabels[signal.sourceType]}</span>
        <span>{territoryLabel}</span>
        <span>Impacto {signal.impactScore}</span>
      </div>
      <h3>{signal.title}</h3>
      <p>{signal.summary}</p>
      <div className="signal-footer">
        <span>{signal.traceability}</span>
        <span>{publishedAt}</span>
      </div>
    </article>
  );
}
