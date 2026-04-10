import type { AgentStatus } from "@espanaia/shared-types";

interface AgentCardProps {
  agent: AgentStatus;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <article className="agent-card">
      <div className="agent-header">
        <div>
          <span className="eyebrow">{agent.scope}</span>
          <h3>{agent.name}</h3>
        </div>
        <span className={`status-pill status-${agent.status}`}>{agent.status}</span>
      </div>
      <p className="agent-mission">{agent.mission}</p>
      <div className="agent-footer">
        <span>{agent.coverage}</span>
        <strong>Next run {agent.nextRun}</strong>
      </div>
    </article>
  );
}
