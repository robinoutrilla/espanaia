"use client";

import { useEffect, useState } from "react";

interface MirofishState {
  status: "checking" | "connected" | "offline";
  model?: string;
  aiData?: {
    source: string;
    electoral?: { overallAnalysis?: string; keyFactors?: string[] };
    stability?: { analysis?: string; risks?: string[]; strengths?: string[] };
  };
}

export function MirofishStatus() {
  const [state, setState] = useState<MirofishState>({ status: "checking" });

  useEffect(() => {
    fetch("/api/predict")
      .then((r) => r.json())
      .then((data) => {
        if (data.source === "mirofish") {
          setState({ status: "connected", aiData: data });
        } else {
          setState({ status: "offline" });
        }
      })
      .catch(() => setState({ status: "offline" }));
  }, []);

  const colors = {
    checking: { bg: "var(--surface)", text: "var(--ink-muted)", dot: "var(--oro)" },
    connected: { bg: "rgba(0,155,58,0.08)", text: "var(--verde)", dot: "var(--verde)" },
    offline: { bg: "var(--surface)", text: "var(--ink-muted)", dot: "var(--ink-muted)" },
  };

  const c = colors[state.status];

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 20,
          background: c.bg,
          border: `1px solid ${c.text}22`,
          fontSize: "0.78rem",
          fontWeight: 600,
          color: c.text,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: c.dot,
            animation: state.status === "checking" ? "pulse 1.5s infinite" : "none",
          }}
        />
        {state.status === "checking" && "Conectando con MiroFish..."}
        {state.status === "connected" && "MiroFish IA Local · Conectado"}
        {state.status === "offline" && "MiroFish IA · Desconectado (motor determinista)"}
      </div>

      {state.status === "connected" && state.aiData?.electoral?.overallAnalysis && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            fontSize: "0.82rem",
            color: "var(--ink-soft)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--ink)", fontSize: "0.78rem" }}>
            Análisis IA (MiroFish):
          </strong>
          <p style={{ margin: "6px 0 0" }}>{state.aiData.electoral.overallAnalysis}</p>
          {state.aiData.electoral.keyFactors && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {state.aiData.electoral.keyFactors.map((f, i) => (
                <span key={i} className="micro-tag">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
