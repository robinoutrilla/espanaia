"use client";
import { useState, useCallback, useMemo } from "react";
import { runSimulation, pollingData, type SimulationResult } from "../lib/polling-model";

/* ═══════════════════════════════════════════════════════════════════════════
   Projection Simulator — interactive client component that lets users
   adjust participation % and per-party vote shares to explore different
   electoral scenarios using the D'Hondt constituency dispersion model.
   ═══════════════════════════════════════════════════════════════════════════ */

function formatVotes(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toString();
}

export function ProjectionSimulator({
  initialParticipation,
  initialOverrides,
}: {
  initialParticipation?: number;
  initialOverrides?: Record<string, number>;
}) {
  const [participation, setParticipation] = useState(initialParticipation ?? 69.8);
  const [overrides, setOverrides] = useState<Record<string, number>>(
    initialOverrides ?? {}
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Run simulation with current parameters
  const result: SimulationResult = useMemo(() => {
    const voteShareOverrides = Object.keys(overrides).length > 0 ? overrides : undefined;
    return runSimulation({
      participationPct: participation,
      voteShareOverrides,
    });
  }, [participation, overrides]);

  /**
   * Update URL without triggering Next.js navigation.
   * Uses window.history.replaceState so the URL stays shareable
   * but doesn't cause a server re-render (which would remount
   * the component and reset all slider state).
   */
  const updateUrl = useCallback(
    (newParticipation: number, newOverrides: Record<string, number>) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (Math.abs(newParticipation - 69.8) > 0.1) {
        url.searchParams.set("p", newParticipation.toFixed(1));
      } else {
        url.searchParams.delete("p");
      }
      const overrideEntries = Object.entries(newOverrides);
      if (overrideEntries.length > 0) {
        url.searchParams.set("v", overrideEntries.map(([k, v]) => `${k}:${v}`).join(","));
      } else {
        url.searchParams.delete("v");
      }
      window.history.replaceState(null, "", url.toString());
    },
    []
  );

  const handleParticipationChange = (val: number) => {
    setParticipation(val);
    updateUrl(val, overrides);
  };

  const handleVoteShareChange = (slug: string, val: number) => {
    const base = pollingData.find((p) => p.slug === slug)?.voteSharePct ?? 0;
    const newOverrides = { ...overrides };
    if (Math.abs(val - base) < 0.05) {
      delete newOverrides[slug];
    } else {
      newOverrides[slug] = Math.round(val * 10) / 10;
    }
    setOverrides(newOverrides);
    updateUrl(participation, newOverrides);
  };

  const resetAll = () => {
    setParticipation(69.8);
    setOverrides({});
    updateUrl(69.8, {});
  };

  const hasChanges = Math.abs(participation - 69.8) > 0.1 || Object.keys(overrides).length > 0;

  // Seat majority threshold
  const majorityThreshold = Math.ceil(result.totalSeats / 2); // 176

  // Bloque coalitions
  const leftBlock = result.parties
    .filter((p) => ["psoe", "sumar", "podemos", "eh-bildu", "erc", "bng"].includes(p.slug))
    .reduce((s, p) => s + p.projectedSeats, 0);
  const rightBlock = result.parties
    .filter((p) => ["pp", "vox", "coalicion-canaria", "upn"].includes(p.slug))
    .reduce((s, p) => s + p.projectedSeats, 0);

  return (
    <div className="simulator-wrap">
      {/* ── Controls panel ── */}
      <div className="simulator-controls">
        <div className="simulator-controls-head">
          <span className="eyebrow">SIMULADOR ELECTORAL</span>
          {hasChanges && (
            <button className="simulator-reset" onClick={resetAll}>
              Restablecer
            </button>
          )}
        </div>

        {/* Participation slider */}
        <div className="simulator-slider-group">
          <div className="simulator-slider-label">
            <span>Participaci{"ó"}n</span>
            <strong>{participation.toFixed(1)}%</strong>
          </div>
          <input
            type="range"
            min="50"
            max="85"
            step="0.5"
            value={participation}
            onChange={(e) => handleParticipationChange(parseFloat(e.target.value))}
            className="simulator-range"
          />
          <div className="simulator-slider-bounds">
            <span>50%</span>
            <span>85%</span>
          </div>
        </div>

        {/* Party vote share sliders */}
        <button
          className="simulator-toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Ocultar" : "Ajustar"} voto por partido
          <svg
            className={`nav-dropdown-chevron ${showAdvanced ? "nav-dropdown-chevron-open" : ""}`}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
          >
            <path
              d="M2.5 3.75L5 6.25L7.5 3.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showAdvanced && (
          <div className="simulator-party-sliders">
            {pollingData.map((p) => {
              const val = overrides[p.slug] ?? p.voteSharePct;
              const isChanged = p.slug in overrides;
              return (
                <div key={p.slug} className="simulator-slider-group simulator-slider-compact">
                  <div className="simulator-slider-label">
                    <span>
                      <span
                        className="simulator-party-dot"
                        style={{ background: p.color }}
                      />
                      {p.acronym}
                    </span>
                    <strong style={{ color: isChanged ? "var(--azul)" : undefined }}>
                      {val.toFixed(1)}%
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={p.slug === "pp" || p.slug === "psoe" ? "45" : p.slug === "vox" ? "25" : "15"}
                    step="0.1"
                    value={val}
                    onChange={(e) => handleVoteShareChange(p.slug, parseFloat(e.target.value))}
                    className="simulator-range"
                    style={{
                      accentColor: p.color,
                    }}
                  />
                </div>
              );
            })}
            <p className="simulator-note">
              Nota: la suma de votos puede superar 100%. Los escaños se asignan
              proporcionalmente con corrección por circunscripción.
            </p>
          </div>
        )}

        {/* Block summary */}
        <div className="simulator-blocks">
          <div className="simulator-block">
            <span className="simulator-block-label">Bloque izquierda</span>
            <strong style={{ color: leftBlock >= majorityThreshold ? "var(--verde)" : "var(--rojo)" }}>
              {leftBlock} esca{"ñ"}os
            </strong>
          </div>
          <div className="simulator-block-divider">
            <span>{majorityThreshold}</span>
            <div className="simulator-majority-line" />
          </div>
          <div className="simulator-block">
            <span className="simulator-block-label">Bloque derecha</span>
            <strong style={{ color: rightBlock >= majorityThreshold ? "var(--verde)" : "var(--rojo)" }}>
              {rightBlock} esca{"ñ"}os
            </strong>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="simulator-results">
        {/* Hemicycle-style seat bar */}
        <div className="simulator-seat-bar">
          {result.parties.map((p) => {
            const pct = (p.projectedSeats / result.totalSeats) * 100;
            if (pct < 0.3) return null;
            return (
              <div
                key={p.slug}
                className="simulator-seat-segment"
                style={{
                  width: `${pct}%`,
                  background: p.color,
                }}
                title={`${p.acronym}: ${p.projectedSeats} escaños (${p.voteSharePct}%)`}
              />
            );
          })}
        </div>
        <div className="simulator-seat-bar-legend">
          <span>0</span>
          <span style={{ left: `${(majorityThreshold / result.totalSeats) * 100}%` }} className="simulator-majority-marker">
            {majorityThreshold}
          </span>
          <span>{result.totalSeats}</span>
        </div>

        {/* Party cards grid */}
        <div className="simulator-party-grid">
          {result.parties.map((p) => {
            const deltaColor = p.delta > 0 ? "var(--verde)" : p.delta < 0 ? "var(--rojo)" : "var(--ink-muted)";
            return (
              <div className="simulator-party-card" key={p.slug} style={{ borderLeft: `4px solid ${p.color}` }}>
                <div className="simulator-party-card-head">
                  <strong>{p.acronym}</strong>
                  <span className="tag" style={{ background: `${deltaColor}18`, color: deltaColor }}>
                    {p.delta > 0 ? "+" : ""}{p.delta}
                  </span>
                </div>
                <div className="simulator-party-card-seats">
                  <span className="simulator-seats-big">{p.projectedSeats}</span>
                  <span className="simulator-seats-label">esca{"ñ"}os</span>
                </div>
                <div className="simulator-party-card-meta">
                  <span>Voto: {p.voteSharePct}%</span>
                  <span>Efect.: {p.effectiveSharePct}%</span>
                  <span>~{formatVotes(p.estimatedVotes)} votos</span>
                </div>
                <div className="representation-bar-wrap">
                  <div
                    className="representation-bar"
                    style={{
                      width: `${(p.projectedSeats / result.totalSeats) * 100 * 2.8}%`,
                      background: p.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Census info */}
        <div className="simulator-meta">
          <span>Censo: {(result.censoElectoral / 1e6).toFixed(1)}M</span>
          <span>Votantes: {(result.totalVoters / 1e6).toFixed(1)}M</span>
          <span>Participaci{"ó"}n: {result.participationPct}%</span>
        </div>
      </div>
    </div>
  );
}
