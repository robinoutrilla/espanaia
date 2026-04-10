"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Sales Intelligence Institucional — Señales de contratación pública,
   compradores institucionales, pipeline y análisis sectorial.
   ═══════════════════════════════════════════════════════════════════════════ */

interface SISignal {
  id: string;
  title: string;
  buyer: string;
  territory: string;
  estimatedValue: number;
  stage: "deteccion" | "pre-licitacion" | "licitacion-abierta" | "adjudicacion" | "ejecucion";
  confidence: number;
  signalType: string;
  sourceTags: string[];
  expectedDate: string;
  sector: string;
  // Competitive differentiators
  winProbability: number;
  knownCompetitors: string[];
  incumbent?: string;
  renewalDate?: string;
  priceBenchmark?: { avgM: number; minM: number; maxM: number };
  oversightPolitician?: string;
  frameworkAgreement?: { name: string; endsDate: string };
  subcontractingAllowed: boolean;
  subcontractPct?: number;
  earlyWarningDays: number;
  decisionMaker?: { role: string; department: string };
  protestRisk: "bajo" | "medio" | "alto";
  modifications: number;
}

interface SIBuyer {
  id: string;
  name: string;
  type: string;
  annualProcurementM: number;
  activeSignals: number;
  topSectors: string[];
  spendingTrend: "up" | "down" | "stable";
  avgContractSizeM: number;
  historicalAwards: { year: number; count: number; totalM: number }[];
  budgetCycleMonth: number[];
  transparencyScore: number;
}

interface SISector {
  sector: string;
  signalCount: number;
  totalValueM: number;
  avgValueM: number;
  marketShare: { provider: string; sharePct: number }[];
}

interface PipelineVelocity {
  stage: string;
  avgDaysInStage: number;
  avgDaysToAward: number;
}

interface GeoConcentration {
  territory: string;
  count: number;
  valueM: number;
}

interface RevenueForecast {
  stage: string;
  weightedValueM: number;
  probability: number;
}

interface SIData {
  signals: SISignal[];
  buyers: SIBuyer[];
  sectors: SISector[];
  stats: {
    totalSignals: number;
    totalValueM: number;
    preLicitacion: number;
    licitacionAbierta: number;
    revenueForecast: RevenueForecast[];
    pipelineVelocity: PipelineVelocity[];
    geographicConcentration: GeoConcentration[];
  };
}

type SIView = "signals" | "buyers" | "pipeline" | "sectores" | "analytics";

const stageColor: Record<string, string> = { deteccion: "#8e44ad", "pre-licitacion": "var(--azul)", "licitacion-abierta": "var(--verde)", adjudicacion: "#e67e22", ejecucion: "var(--ink-muted)" };
const stageLabel: Record<string, string> = { deteccion: "Detección", "pre-licitacion": "Pre-licitación", "licitacion-abierta": "Licitación abierta", adjudicacion: "Adjudicación", ejecucion: "Ejecución" };
const STAGES = ["deteccion", "pre-licitacion", "licitacion-abierta", "adjudicacion", "ejecucion"] as const;

function formatM(n: number) { return `${n.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M€`; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }
function valueColor(v: number) { return v >= 50 ? "var(--verde)" : v >= 10 ? "var(--azul)" : "var(--ink)"; }
function trendArrow(t: string) { return t === "up" ? "\u2191" : t === "down" ? "\u2193" : "\u2192"; }
function winProbColor(p: number) { return p >= 70 ? "var(--verde)" : p >= 40 ? "#e67e22" : "#e74c3c"; }
function protestColor(r: string) { return r === "bajo" ? "var(--verde)" : r === "medio" ? "#e67e22" : "#e74c3c"; }
function earlyWarningLabel(d: number) { return d >= 30 ? "Temprana" : d >= 7 ? "Normal" : "Tardía"; }
function earlyWarningColor(d: number) { return d >= 30 ? "var(--verde)" : d >= 7 ? "#e67e22" : "#e74c3c"; }
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const TERRITORY_LABELS: Record<string, string> = {
  "espana": "España (nacional)",
  "madrid": "Madrid",
  "cataluna": "Cataluña",
  "andalucia": "Andalucía",
  "pais-vasco": "País Vasco",
  "comunitat-valenciana": "Comunitat Valenciana",
};

export default function SalesIntelligencePage() {
  const [data, setData] = useState<SIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SIView>("signals");
  const [filterStage, setFilterStage] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [minValue, setMinValue] = useState(0);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("si-data-v2");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/sales-intelligence")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("si-data-v2", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signals = data?.signals ?? [];
  const buyers = data?.buyers ?? [];
  const sectors = data?.sectors ?? [];
  const stats = data?.stats ?? { totalSignals: 0, totalValueM: 0, preLicitacion: 0, licitacionAbierta: 0, revenueForecast: [] as RevenueForecast[], pipelineVelocity: [] as PipelineVelocity[], geographicConcentration: [] as GeoConcentration[] };

  const allSectors = [...new Set(signals.map((s) => s.sector))];

  const filtered = signals.filter((s) => {
    if (filterStage && s.stage !== filterStage) return false;
    if (filterSector && s.sector !== filterSector) return false;
    if (s.estimatedValue < minValue) return false;
    return true;
  });

  const pipelineColumns = STAGES.map((stage) => ({
    stage,
    label: stageLabel[stage],
    color: stageColor[stage],
    items: signals.filter((s) => s.stage === stage),
    totalM: signals.filter((s) => s.stage === stage).reduce((sum, s) => sum + s.estimatedValue, 0),
  }));

  return (
    <main className="page-shell">
      <SiteHeader currentSection="sales-intelligence" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">SALES INTELLIGENCE INSTITUCIONAL</span>
        <h1>Oportunidades de contratación pública</h1>
        <p className="hero-subtitle">
          {stats.totalSignals} señales de oportunidad por valor estimado de {formatM(stats.totalValueM)}.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalSignals}</span><span className="kpi-label">Total señales</span></div>
          <div className="kpi-item"><span className="kpi-value">{formatM(stats.totalValueM)}</span><span className="kpi-label">Valor estimado</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--azul)" }}>{stats.preLicitacion}</span><span className="kpi-label">Pre-licitación</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--verde)" }}>{stats.licitacionAbierta}</span><span className="kpi-label">Licitación abierta</span></div>
        </div>
      </section>

      {/* Tabs */}
      <div className="si-view-bar">
        {(["signals", "buyers", "pipeline", "sectores", "analytics"] as SIView[]).map((v) => (
          <button key={v} className={`si-tab ${view === v ? "si-tab-active" : ""}`} onClick={() => setView(v)}>
            {v === "signals" ? "Señales" : v === "buyers" ? "Compradores" : v === "pipeline" ? "Pipeline" : v === "sectores" ? "Sectores" : "Analytics"}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ SIGNALS ═══ */}
          {view === "signals" && (
            <section className="si-section">
              <div className="si-filters">
                <div className="si-stage-pills">
                  {STAGES.map((s) => (
                    <button key={s} className={`si-pill ${filterStage === s ? "si-pill-active" : ""}`}
                      style={{ borderColor: stageColor[s], color: filterStage === s ? "#fff" : stageColor[s], background: filterStage === s ? stageColor[s] : "transparent" }}
                      onClick={() => setFilterStage(filterStage === s ? "" : s)}>
                      {stageLabel[s]}
                    </button>
                  ))}
                </div>
                <select className="si-select" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
                  <option value="">Todos los sectores</option>
                  {allSectors.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="si-slider-label">
                  Min. valor: {formatM(minValue)}
                  <input type="range" className="si-slider" min={0} max={100} step={1} value={minValue} onChange={(e) => setMinValue(Number(e.target.value))} />
                </label>
              </div>
              <div className="si-signal-list">
                {filtered.map((s) => (
                  <div key={s.id} className="si-signal-card">
                    <div className="si-signal-header">
                      <h3 className="si-card-title">{s.title}</h3>
                      <span className="si-value" style={{ color: valueColor(s.estimatedValue) }}>{formatM(s.estimatedValue)}</span>
                    </div>
                    <p className="si-signal-buyer">{s.buyer} &middot; {TERRITORY_LABELS[s.territory] ?? s.territory}</p>
                    <div className="si-signal-meta">
                      <span className="si-badge" style={{ background: stageColor[s.stage], color: "#fff" }}>{stageLabel[s.stage]}</span>
                      <span className="si-badge si-badge-type">{s.signalType}</span>
                      <span className="si-badge" style={{ background: winProbColor(s.winProbability), color: "#fff" }}>Win {s.winProbability}%</span>
                      <span className="si-badge" style={{ background: protestColor(s.protestRisk), color: "#fff" }}>Riesgo: {s.protestRisk}</span>
                      <span className="si-badge" style={{ background: earlyWarningColor(s.earlyWarningDays), color: "#fff" }}>{earlyWarningLabel(s.earlyWarningDays)} ({s.earlyWarningDays}d)</span>
                      {s.modifications > 0 && <span className="si-badge si-badge-mods">{s.modifications} mod.</span>}
                    </div>
                    {/* Competitors */}
                    {s.knownCompetitors.length > 0 && (
                      <div className="si-competitors">
                        <span className="si-competitors-label">Competidores:</span>
                        {s.knownCompetitors.map((c) => <span key={c} className="si-competitor-chip">{c}</span>)}
                      </div>
                    )}
                    {/* Incumbent & renewal */}
                    <div className="si-extra-row">
                      {s.incumbent && <span className="si-extra-item">Incumbente: <strong>{s.incumbent}</strong></span>}
                      {s.renewalDate && <span className="si-extra-item">Renovación: <strong>{formatDate(s.renewalDate)}</strong></span>}
                      {s.subcontractingAllowed && <span className="si-extra-item">Subcontratación: <strong>{s.subcontractPct ?? "?"}%</strong></span>}
                    </div>
                    {/* Price benchmark */}
                    {s.priceBenchmark && (
                      <div className="si-benchmark">
                        <span className="si-benchmark-label">Benchmark precio:</span>
                        <span className="si-benchmark-bar">
                          <span className="si-benchmark-range" style={{ left: `${(s.priceBenchmark.minM / (s.priceBenchmark.maxM * 1.2)) * 100}%`, width: `${((s.priceBenchmark.maxM - s.priceBenchmark.minM) / (s.priceBenchmark.maxM * 1.2)) * 100}%` }} />
                          <span className="si-benchmark-avg" style={{ left: `${(s.priceBenchmark.avgM / (s.priceBenchmark.maxM * 1.2)) * 100}%` }} />
                        </span>
                        <span className="si-benchmark-values">{formatM(s.priceBenchmark.minM)} — {formatM(s.priceBenchmark.avgM)} — {formatM(s.priceBenchmark.maxM)}</span>
                      </div>
                    )}
                    {/* Political oversight & decision maker */}
                    <div className="si-extra-row">
                      {s.oversightPolitician && <span className="si-extra-item">Político supervisor: <strong>{s.oversightPolitician}</strong></span>}
                      {s.decisionMaker && <span className="si-extra-item">Decisor: <strong>{s.decisionMaker.role}</strong> ({s.decisionMaker.department})</span>}
                    </div>
                    {/* Framework agreement */}
                    {s.frameworkAgreement && (
                      <div className="si-framework">
                        Acuerdo marco: <strong>{s.frameworkAgreement.name}</strong> (hasta {formatDate(s.frameworkAgreement.endsDate)})
                      </div>
                    )}
                    <div className="si-signal-tags">{s.sourceTags.map((t) => <span key={t} className="si-tag">{t}</span>)}</div>
                    <span className="si-expected-date">{formatDate(s.expectedDate)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ BUYERS ═══ */}
          {view === "buyers" && (
            <section className="si-section">
              <SectionHeading eyebrow="Compradores institucionales" title="Perfil de compradores públicos" description="Volumen de contratación, señales activas, transparencia y patrones históricos." />
              <div className="si-grid">
                {buyers.map((b) => (
                  <div key={b.id} className="si-buyer-card">
                    <div className="si-buyer-card-header">
                      <h3 className="si-card-title">{b.name}</h3>
                      <span className="si-transparency-badge" style={{ background: b.transparencyScore >= 80 ? "var(--verde)" : b.transparencyScore >= 60 ? "#e67e22" : "#e74c3c" }}>
                        Transparencia: {b.transparencyScore}/100
                      </span>
                    </div>
                    <span className="si-badge si-badge-type">{b.type}</span>
                    <div className="si-buyer-stats">
                      <span className="si-buyer-stat"><strong>{formatM(b.annualProcurementM)}</strong> anual</span>
                      <span className="si-buyer-stat"><strong>{b.activeSignals}</strong> señales</span>
                      <span className="si-buyer-stat"><strong>{formatM(b.avgContractSizeM)}</strong> contrato medio</span>
                      <span className="si-buyer-trend">{trendArrow(b.spendingTrend)} {b.spendingTrend}</span>
                    </div>
                    {/* Historical awards (feature 3) */}
                    {b.historicalAwards && b.historicalAwards.length > 0 && (
                      <div className="si-historical">
                        <span className="si-historical-label">Histórico de adjudicaciones:</span>
                        <div className="si-historical-bars">
                          {b.historicalAwards.map((h) => (
                            <div key={h.year} className="si-historical-bar-group">
                              <div className="si-historical-bar" style={{ height: `${Math.min(100, (h.totalM / Math.max(...b.historicalAwards.map((a) => a.totalM))) * 60)}px` }} />
                              <span className="si-historical-year">{h.year}</span>
                              <span className="si-historical-val">{h.count} · {formatM(h.totalM)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Budget cycle (feature 4) */}
                    {b.budgetCycleMonth && b.budgetCycleMonth.length > 0 && (
                      <div className="si-budget-cycle">
                        <span className="si-budget-cycle-label">Ciclo presupuestario:</span>
                        <div className="si-budget-months">
                          {MONTH_NAMES.map((m, i) => (
                            <span key={m} className={`si-month-dot ${b.budgetCycleMonth.includes(i + 1) ? "si-month-active" : ""}`}>{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="si-signal-tags">{b.topSectors?.map((s) => <span key={s} className="si-tag">{s}</span>)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ PIPELINE ═══ */}
          {view === "pipeline" && (
            <section className="si-section">
              <SectionHeading eyebrow="Pipeline de oportunidades" title="Kanban de contratación pública" description="Señales organizadas por fase del proceso de licitación, con velocidad y previsión de ingresos." />
              {/* Revenue forecast banner (feature 16) */}
              {stats.revenueForecast && (
                <div className="si-forecast-bar">
                  <span className="si-forecast-title">Previsión de ingresos ponderada:</span>
                  {stats.revenueForecast.map((f) => (
                    <div key={f.stage} className="si-forecast-item">
                      <span className="si-forecast-stage">{stageLabel[f.stage] ?? f.stage}</span>
                      <span className="si-forecast-value">{formatM(f.weightedValueM)}</span>
                      <span className="si-forecast-prob">{Math.round(f.probability * 100)}% prob.</span>
                    </div>
                  ))}
                  <div className="si-forecast-item si-forecast-total">
                    <span className="si-forecast-stage">Total ponderado</span>
                    <span className="si-forecast-value">{formatM(stats.revenueForecast.reduce((s, f) => s + f.weightedValueM, 0))}</span>
                  </div>
                </div>
              )}
              {/* Pipeline velocity (feature 20) */}
              {stats.pipelineVelocity && (
                <div className="si-velocity-bar">
                  <span className="si-velocity-title">Velocidad del pipeline (días medios):</span>
                  {stats.pipelineVelocity.map((v) => (
                    <div key={v.stage} className="si-velocity-item">
                      <span className="si-velocity-stage">{stageLabel[v.stage] ?? v.stage}</span>
                      <span className="si-velocity-days">{v.avgDaysInStage}d en fase</span>
                      {v.avgDaysToAward > 0 && <span className="si-velocity-to-award">{v.avgDaysToAward}d hasta adjudicación</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="si-pipeline">
                {pipelineColumns.map((col) => (
                  <div key={col.stage} className="si-pipeline-col">
                    <div className="si-pipeline-header" style={{ borderBottomColor: col.color }}>
                      <span className="si-pipeline-stage">{col.label}</span>
                      <span className="si-pipeline-total">{formatM(col.totalM)} ({col.items.length})</span>
                    </div>
                    <div className="si-pipeline-cards">
                      {col.items.map((s) => (
                        <div key={s.id} className="si-pipeline-card">
                          <span className="si-pipeline-card-title">{s.title}</span>
                          <div className="si-pipeline-card-row">
                            <span className="si-pipeline-card-value">{formatM(s.estimatedValue)}</span>
                            <span className="si-pipeline-card-win" style={{ color: winProbColor(s.winProbability) }}>Win {s.winProbability}%</span>
                          </div>
                          <span className="si-pipeline-card-buyer">{s.buyer}</span>
                          {s.knownCompetitors?.length > 0 && <span className="si-pipeline-card-comp">{s.knownCompetitors.length} competidores</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ SECTORES ═══ */}
          {view === "sectores" && (
            <section className="si-section">
              <SectionHeading eyebrow="Análisis sectorial" title="Desglose de oportunidades por sector" description="Número de señales, valor total, valor medio y cuota de mercado estimada." />
              <div className="si-sector-table">
                <div className="si-sector-header">
                  <span className="si-sector-col">Sector</span>
                  <span className="si-sector-col">Señales</span>
                  <span className="si-sector-col">Valor total</span>
                  <span className="si-sector-col">Valor medio</span>
                  <span className="si-sector-col si-sector-col-wide">Cuota de mercado (top proveedores)</span>
                </div>
                {sectors.map((s) => (
                  <div key={s.sector} className="si-sector-row-ext">
                    <div className="si-sector-main">
                      <span className="si-sector-col si-sector-name">{s.sector}</span>
                      <span className="si-sector-col">{s.signalCount}</span>
                      <span className="si-sector-col">{formatM(s.totalValueM)}</span>
                      <span className="si-sector-col">{formatM(s.avgValueM)}</span>
                      <span className="si-sector-col si-sector-col-wide">
                        {s.marketShare && s.marketShare.length > 0 ? (
                          <div className="si-market-share-bar">
                            {s.marketShare.map((ms, i) => (
                              <div key={ms.provider} className="si-ms-segment" style={{ width: `${ms.sharePct}%`, background: ["var(--azul)", "var(--verde)", "#e67e22", "#8e44ad", "#e74c3c"][i % 5] }} title={`${ms.provider}: ${ms.sharePct}%`} />
                            ))}
                          </div>
                        ) : "—"}
                      </span>
                    </div>
                    {s.marketShare && s.marketShare.length > 0 && (
                      <div className="si-market-share-legend">
                        {s.marketShare.map((ms, i) => (
                          <span key={ms.provider} className="si-ms-legend-item">
                            <span className="si-ms-dot" style={{ background: ["var(--azul)", "var(--verde)", "#e67e22", "#8e44ad", "#e74c3c"][i % 5] }} />
                            {ms.provider} ({ms.sharePct}%)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* ═══ ANALYTICS ═══ */}
          {view === "analytics" && (
            <section className="si-section">
              <SectionHeading eyebrow="Analytics avanzados" title="Inteligencia competitiva diferenciada" description="Concentración geográfica, comparativa de compradores, previsión de ingresos y velocidad del pipeline." />

              {/* Geographic concentration heatmap (feature 11) */}
              <div className="si-analytics-panel">
                <h3 className="si-analytics-title">Concentración geográfica de oportunidades</h3>
                <div className="si-geo-grid">
                  {(stats.geographicConcentration ?? []).map((g) => {
                    const maxVal = Math.max(...(stats.geographicConcentration ?? []).map((x) => x.valueM));
                    const pct = maxVal > 0 ? (g.valueM / maxVal) * 100 : 0;
                    return (
                      <div key={g.territory} className="si-geo-item">
                        <span className="si-geo-name">{TERRITORY_LABELS[g.territory] ?? g.territory}</span>
                        <div className="si-geo-bar-wrap">
                          <div className="si-geo-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="si-geo-stats">{g.count} señales · {formatM(g.valueM)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue forecast (feature 16) */}
              <div className="si-analytics-panel">
                <h3 className="si-analytics-title">Previsión de ingresos ponderada por probabilidad</h3>
                <div className="si-forecast-grid">
                  {(stats.revenueForecast ?? []).map((f) => (
                    <div key={f.stage} className="si-forecast-card">
                      <span className="si-forecast-card-stage">{stageLabel[f.stage] ?? f.stage}</span>
                      <span className="si-forecast-card-value">{formatM(f.weightedValueM)}</span>
                      <span className="si-forecast-card-prob">Probabilidad: {Math.round(f.probability * 100)}%</span>
                    </div>
                  ))}
                  <div className="si-forecast-card si-forecast-card-total">
                    <span className="si-forecast-card-stage">Total pipeline ponderado</span>
                    <span className="si-forecast-card-value">{formatM((stats.revenueForecast ?? []).reduce((s, f) => s + f.weightedValueM, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Deal velocity (feature 20) */}
              <div className="si-analytics-panel">
                <h3 className="si-analytics-title">Velocidad del pipeline (días medios por fase)</h3>
                <div className="si-velocity-grid">
                  {(stats.pipelineVelocity ?? []).map((v, i, arr) => (
                    <div key={v.stage} className="si-velocity-card">
                      <span className="si-velocity-card-stage">{stageLabel[v.stage] ?? v.stage}</span>
                      <span className="si-velocity-card-days">{v.avgDaysInStage} días</span>
                      {v.avgDaysToAward > 0 && <span className="si-velocity-card-total">{v.avgDaysToAward}d hasta adjudicación</span>}
                      {i < arr.length - 1 && <span className="si-velocity-arrow">\u2192</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-buyer comparison (feature 19) */}
              <div className="si-analytics-panel">
                <h3 className="si-analytics-title">Comparativa de compradores (cross-buyer analysis)</h3>
                <div className="si-comparison-table">
                  <div className="si-comparison-header">
                    <span className="si-comp-col">Comprador</span>
                    <span className="si-comp-col">Gasto anual</span>
                    <span className="si-comp-col">Señales</span>
                    <span className="si-comp-col">Contrato medio</span>
                    <span className="si-comp-col">Transparencia</span>
                    <span className="si-comp-col">Tendencia</span>
                    <span className="si-comp-col">Ciclo publicación</span>
                  </div>
                  {buyers
                    .sort((a, b) => b.annualProcurementM - a.annualProcurementM)
                    .map((b) => (
                    <div key={b.id} className="si-comparison-row">
                      <span className="si-comp-col si-comp-name">{b.name}</span>
                      <span className="si-comp-col">{formatM(b.annualProcurementM)}</span>
                      <span className="si-comp-col">{b.activeSignals}</span>
                      <span className="si-comp-col">{formatM(b.avgContractSizeM)}</span>
                      <span className="si-comp-col">
                        <span className="si-transparency-mini" style={{ background: b.transparencyScore >= 80 ? "var(--verde)" : b.transparencyScore >= 60 ? "#e67e22" : "#e74c3c" }}>
                          {b.transparencyScore}
                        </span>
                      </span>
                      <span className="si-comp-col">{trendArrow(b.spendingTrend)} {b.spendingTrend}</span>
                      <span className="si-comp-col si-comp-months">
                        {b.budgetCycleMonth.map((m) => MONTH_NAMES[m - 1]).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Renewal calendar (feature 6) */}
              <div className="si-analytics-panel">
                <h3 className="si-analytics-title">Calendario de renovaciones</h3>
                <div className="si-renewal-list">
                  {signals
                    .filter((s) => s.renewalDate)
                    .sort((a, b) => (a.renewalDate ?? "").localeCompare(b.renewalDate ?? ""))
                    .map((s) => (
                      <div key={s.id} className="si-renewal-item">
                        <span className="si-renewal-date">{formatDate(s.renewalDate!)}</span>
                        <span className="si-renewal-title">{s.title}</span>
                        <span className="si-renewal-buyer">{s.buyer}</span>
                        <span className="si-renewal-value">{formatM(s.estimatedValue)}</span>
                        {s.incumbent && <span className="si-renewal-incumbent">Incumbente: {s.incumbent}</span>}
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
