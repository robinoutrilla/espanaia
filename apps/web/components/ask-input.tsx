"use client";

import { useState, useRef } from "react";

interface AgentInfo {
  id: string;
  name: string;
  chunks: number;
  sources: string[];
}

const AGENT_COLORS: Record<string, { bg: string; fg: string; icon: string }> = {
  normativo: { bg: "var(--rojo-soft)", fg: "var(--rojo)", icon: "N" },
  presupuestario: { bg: "var(--azul-soft)", fg: "var(--azul)", icon: "P" },
  "politico-social": { bg: "var(--verde-soft)", fg: "var(--verde)", icon: "S" },
  empresarial: { bg: "#fef3c7", fg: "#b45309", icon: "E" },
  medios: { bg: "#ede9fe", fg: "#7c3aed", icon: "M" },
};

export function AskInput() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [routedTo, setRoutedTo] = useState<string[]>([]);
  const [totalContext, setTotalContext] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setAgents([]);
    setRoutedTo([]);
    setTotalContext(0);
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setAnswer(data.answer ?? "Sin respuesta.");
      setSources(data.sources ?? []);
      setAgents(data.agents ?? []);
      setRoutedTo(data.routedTo ?? []);
      setTotalContext(data.totalContext ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(
        msg.includes("Ollama") || msg.includes("conectar")
          ? msg
          : `No se pudo conectar con Ollama (localhost:11434). Asegúrate de que está activo.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <div className="prompt-chip" style={{ flex: 1, gridTemplateColumns: "auto 1fr", padding: "6px 12px", alignItems: "center" }}>
          <span style={{ color: "var(--rojo)", fontWeight: 700, fontSize: "0.78rem" }}>/ask</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu pregunta sobre política, presupuestos o legislación española…"
            disabled={loading}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              color: "var(--ink)",
              width: "100%",
            }}
          />
        </div>
        <button
          type="submit"
          className="hero-button hero-button-primary"
          disabled={loading || !query.trim()}
          style={{ minHeight: 44, padding: "0 20px", fontSize: "0.85rem", opacity: loading || !query.trim() ? 0.5 : 1 }}
        >
          {loading ? "Pensando…" : "Preguntar"}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: 16, padding: 16, background: "var(--surface)", borderRadius: "var(--radius-md)" }}>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>
            Consultando agentes RAG y procesando con Ollama… puede tardar 15-30 segundos.
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 16, background: "var(--rojo-soft)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--rojo)" }}>
          <p style={{ color: "var(--rojo)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
        </div>
      )}

      {answer && (
        <div style={{ marginTop: 16 }}>
          {/* Agent badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {routedTo.map((id) => {
              const colors = AGENT_COLORS[id] ?? { bg: "var(--surface)", fg: "var(--ink-muted)", icon: "?" };
              const agent = agents.find(a => a.id === id);
              const isActive = agent && agent.chunks > 0;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: colors.bg,
                    border: `1px solid ${isActive ? colors.fg : "transparent"}`,
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: colors.fg, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.68rem", fontWeight: 800,
                  }}>
                    {colors.icon}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.fg }}>
                    {id === "normativo" ? "RAG Normativo" : id === "presupuestario" ? "RAG Presupuestario" : id === "empresarial" ? "RAG Empresarial" : "RAG Político-Social"}
                  </span>
                  {agent && (
                    <span style={{ fontSize: "0.68rem", color: colors.fg, opacity: 0.7 }}>
                      {agent.chunks} contextos
                    </span>
                  )}
                </div>
              );
            })}
            <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", alignSelf: "center" }}>
              {totalContext} fragmentos recuperados
            </span>
          </div>

          {/* Answer */}
          <div style={{ padding: 20, background: "var(--surface)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--azul)" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--azul)", marginBottom: 8 }}>RESPUESTA</p>
            <div style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
              {answer}
            </div>
            {sources.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: 6 }}>
                  FUENTES ({sources.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sources.map((s, i) => (
                    <span className="micro-tag" key={i}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
