"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Radar Regulatorio — Seguimiento de cambios normativos por sector.
   20 competitive differentiators beyond standard regulatory monitoring.
   ═══════════════════════════════════════════════════════════════════════════ */

interface RRAlert {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceType: string;
  impactLevel: "critico" | "alto" | "medio" | "bajo";
  status: string;
  sectors: string[];
  complianceDeadline?: string;
  keyChanges: string[];
  date: string;
  /* ── Differentiator fields ── */
  relatedAlerts?: string[];
  complianceChecklist?: string[];
  euDirective?: { ref: string; deadline: string; transposed: boolean };
  estimatedCostRange?: { small: string; medium: string; large: string };
  affectedEntities?: string[];
  passProbability?: number;
  complexityScore?: number;
  publicConsultation?: { status: string; responses: number; closeDate: string };
  dependsOn?: string[];
  weekChanged?: string;
}

interface RRSector {
  slug?: string;
  id?: string;
  name?: string;
  label?: string;
  description: string;
  activeAlerts: number;
  criticalAlerts: number;
  regulatoryBurden?: number;
  regulatoryBurdenScore?: number;
  trend?: string;
  recentTrend?: string;
  keyRegulators: string[];
  topRisks: string[];
  velocityIndex?: number;
  velocitySparkline?: number[];
  burdenHistory?: { month: string; value: number }[];
  fragmentationIndex?: number;
  sandboxActive?: boolean;
}

interface RRTimeline {
  id: string;
  title: string;
  steps: { date: string; label: string; type: string; completed: boolean }[];
}

interface RRSource {
  type: string;
  name: string;
  url: string;
}

interface ComparativeStats {
  metric: string;
  spain: number;
  euAvg: number;
  unit: string;
}

interface WeeklyDigest {
  week: string;
  alerts: string[];
  summary: string;
}

interface RadarData {
  alerts: RRAlert[];
  sectors: RRSector[];
  timelines: RRTimeline[];
  sources: RRSource[];
  stats: { totalAlerts: number; criticalCount: number; last30Days: number; pendingDeadline: number; sourcesCount: number };
  comparativeStats?: ComparativeStats[];
  weeklyDigests?: WeeklyDigest[];
}

type RRView = "alertas" | "sectores" | "timeline" | "fuentes" | "heatmap" | "calendario" | "comparativa";

const impactColor: Record<string, string> = { critico: "var(--rojo)", alto: "#e67e22", medio: "#f1c40f", bajo: "var(--ink-muted)" };
const impactBg: Record<string, string> = { critico: "#fdecea", alto: "#fef3e2", medio: "#fef9e7", bajo: "#f4f4f4" };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

/* ── #3 Countdown timer helper ── */
function daysRemaining(deadline: string): number {
  const now = new Date("2026-04-10");
  const dl = new Date(deadline);
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownColor(days: number): string {
  if (days <= 0) return "var(--rojo)";
  if (days <= 30) return "var(--rojo)";
  if (days <= 90) return "#e67e22";
  if (days <= 180) return "#f1c40f";
  return "var(--verde)";
}

/* ── #16 Alert priority auto-sort ── */
function computePriority(a: RRAlert): number {
  const impactScore: Record<string, number> = { critico: 100, alto: 70, medio: 40, bajo: 10 };
  let priority = impactScore[a.impactLevel] || 0;
  if (a.complianceDeadline) {
    const days = daysRemaining(a.complianceDeadline);
    if (days <= 30) priority += 50;
    else if (days <= 90) priority += 30;
    else if (days <= 180) priority += 10;
  }
  if (a.sectors && a.sectors.length >= 3) priority += 15;
  return priority;
}

/* ── #2 Sparkline SVG ── */
function Sparkline({ data, color = "var(--azul)" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── #7 Mini bar chart for burden history ── */
function BurdenHistoryChart({ data }: { data: { month: string; value: number }[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="rr-burden-chart">
      {data.map((d, i) => (
        <div key={i} className="rr-burden-chart-bar-wrap" title={`${d.month}: ${d.value}`}>
          <div
            className="rr-burden-chart-bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: d.value > 80 ? "var(--rojo)" : d.value > 60 ? "var(--oro)" : "var(--verde)",
            }}
          />
          <span className="rr-burden-chart-label">{d.month.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RadarRegulatorioPage() {
  const [data, setData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<RRView>("alertas");
  const [filterSector, setFilterSector] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterImpact, setFilterImpact] = useState("");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [companySize, setCompanySize] = useState<"small" | "medium" | "large">("medium");
  const [sortByPriority, setSortByPriority] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("radar-data-v2");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/radar-regulatorio")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("radar-data-v2", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const alerts = data?.alerts ?? [];
  const sectors = data?.sectors ?? [];
  const timelines = data?.timelines ?? [];
  const sources = data?.sources ?? [];
  const stats = data?.stats ?? { totalAlerts: 0, criticalCount: 0, last30Days: 0, pendingDeadline: 0, sourcesCount: 0 };
  const comparativeStats = data?.comparativeStats ?? [];
  const weeklyDigests = data?.weeklyDigests ?? [];

  const allSectors = [...new Set(alerts.flatMap((a) => a.sectors))];
  const allSources = [...new Set(alerts.map((a) => a.sourceType))];

  const filtered = useMemo(() => {
    let result = alerts.filter((a) => {
      if (filterSector && !a.sectors.includes(filterSector)) return false;
      if (filterSource && a.sourceType !== filterSource) return false;
      if (filterImpact && a.impactLevel !== filterImpact) return false;
      return true;
    });
    /* #16 Priority auto-sort */
    if (sortByPriority) {
      result = [...result].sort((a, b) => computePriority(b) - computePriority(a));
    }
    return result;
  }, [alerts, filterSector, filterSource, filterImpact, sortByPriority]);

  const sourceGroups = sources.reduce<Record<string, RRSource[]>>((acc, s) => {
    (acc[s.type] ??= []).push(s);
    return acc;
  }, {});

  /* ── #1 Cross-regulation impact matrix helper ── */
  const getAlertTitle = (id: string) => alerts.find((a) => a.id === id)?.title ?? id;

  /* ── #19 Export summary handler ── */
  const handleExport = () => {
    const lines = [
      "RADAR REGULATORIO - INFORME RESUMEN",
      `Generado: ${new Date().toLocaleDateString("es-ES")}`,
      `Total alertas: ${stats.totalAlerts}`,
      `Alertas críticas: ${stats.criticalCount}`,
      "",
      "ALERTAS ACTIVAS:",
      ...filtered.map((a) => `- [${a.impactLevel.toUpperCase()}] ${a.title}${a.complianceDeadline ? ` (deadline: ${a.complianceDeadline})` : ""}`),
      "",
      "SECTORES:",
      ...sectors.map((s) => `- ${s.name ?? s.label}: carga ${s.regulatoryBurden ?? s.regulatoryBurdenScore}/100, ${s.activeAlerts} alertas${s.velocityIndex ? `, velocidad ${s.velocityIndex}/10` : ""}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "radar-regulatorio-resumen.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── #8 Heatmap data ── */
  const heatmapData = useMemo(() => {
    const impactLevels = ["critico", "alto", "medio", "bajo"];
    return sectors.map((s) => ({
      sector: s.name ?? s.label,
      slug: s.slug ?? s.id,
      counts: impactLevels.map((lvl) => alerts.filter((a) => a.sectors.includes((s.slug ?? s.id) as string) && a.impactLevel === lvl).length),
    }));
  }, [sectors, alerts]);

  /* ── #11 Calendar/Gantt data ── */
  const calendarAlerts = useMemo(() => {
    return alerts
      .filter((a) => a.complianceDeadline)
      .sort((a, b) => new Date(a.complianceDeadline!).getTime() - new Date(b.complianceDeadline!).getTime());
  }, [alerts]);

  const viewLabels: Record<RRView, string> = {
    alertas: "Alertas",
    sectores: "Sectores",
    timeline: "Timeline",
    fuentes: "Fuentes",
    heatmap: "Heatmap",
    calendario: "Calendario",
    comparativa: "Comparativa",
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="radar-regulatorio" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">RADAR REGULATORIO</span>
        <h1>Cambios normativos que afectan a tu sector</h1>
        <p className="hero-subtitle">
          {stats.totalAlerts} alertas activas, {stats.criticalCount} críticas, {stats.last30Days} en los últimos 30 días.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalAlerts}</span><span className="kpi-label">Total alertas</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--rojo)" }}>{stats.criticalCount}</span><span className="kpi-label">Críticas</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.pendingDeadline}</span><span className="kpi-label">Pendientes deadline</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.sourcesCount}</span><span className="kpi-label">Fuentes monitorizadas</span></div>
        </div>
      </section>

      {/* Tabs — now with 7 views */}
      <div className="rr-view-bar">
        {(Object.keys(viewLabels) as RRView[]).map((v) => (
          <button key={v} className={`rr-tab ${view === v ? "rr-tab-active" : ""}`} onClick={() => setView(v)}>
            {viewLabels[v]}
          </button>
        ))}
        {/* #19 Export button */}
        <button className="rr-tab rr-export-btn" onClick={handleExport} title="Exportar resumen">
          Exportar
        </button>
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ #20 SMART NOTIFICATIONS — What changed this week ═══ */}
          {weeklyDigests.length > 0 && view === "alertas" && (
            <div className="rr-digest-banner">
              <strong>Esta semana ({weeklyDigests[0].week}):</strong> {weeklyDigests[0].summary}
              <span className="rr-digest-count">{weeklyDigests[0].alerts.length} alertas actualizadas</span>
            </div>
          )}

          {/* ═══ ALERTAS ═══ */}
          {view === "alertas" && (
            <section className="rr-section">
              <div className="rr-filters">
                <select className="rr-select" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
                  <option value="">Todos los sectores</option>
                  {allSectors.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="rr-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="">Todas las fuentes</option>
                  {allSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* #9 Entity filter */}
                <select className="rr-select" value={companySize} onChange={(e) => setCompanySize(e.target.value as "small" | "medium" | "large")}>
                  <option value="small">Autónomos / Pequeña</option>
                  <option value="medium">Mediana empresa</option>
                  <option value="large">Gran empresa</option>
                </select>
                <div className="rr-impact-pills">
                  {["critico", "alto", "medio", "bajo"].map((lvl) => (
                    <button key={lvl} className={`rr-pill ${filterImpact === lvl ? "rr-pill-active" : ""}`}
                      style={{ borderColor: impactColor[lvl], color: filterImpact === lvl ? "#fff" : impactColor[lvl], background: filterImpact === lvl ? impactColor[lvl] : "transparent" }}
                      onClick={() => setFilterImpact(filterImpact === lvl ? "" : lvl)}>
                      {lvl}
                    </button>
                  ))}
                </div>
                {/* #16 Priority sort toggle */}
                <label className="rr-sort-toggle">
                  <input type="checkbox" checked={sortByPriority} onChange={() => setSortByPriority(!sortByPriority)} />
                  <span>Ordenar por prioridad</span>
                </label>
              </div>
              <div className="rr-grid">
                {filtered.map((a) => (
                  <div key={a.id} className="rr-card" style={{ borderLeftColor: impactColor[a.impactLevel] }}
                    onClick={() => setExpandedAlert(expandedAlert === a.id ? null : a.id)}>
                    <h3 className="rr-card-title">{a.title}</h3>
                    <p className="rr-card-summary">{a.summary}</p>
                    <div className="rr-card-meta">
                      <span className="rr-badge" style={{ background: impactBg[a.impactLevel], color: impactColor[a.impactLevel] }}>{a.impactLevel}</span>
                      <span className="rr-badge rr-badge-source">{a.source}</span>
                      <span className="rr-badge rr-badge-status">{a.status}</span>
                      {/* #13 Readability/complexity score */}
                      {a.complexityScore != null && (
                        <span className="rr-badge" style={{
                          background: a.complexityScore > 75 ? "#fdecea" : a.complexityScore > 50 ? "#fef9e7" : "#eafde9",
                          color: a.complexityScore > 75 ? "var(--rojo)" : a.complexityScore > 50 ? "#92400e" : "var(--verde)",
                        }}>
                          Complejidad: {a.complexityScore}/100
                        </span>
                      )}
                      {/* #10 Parliamentary probability */}
                      {a.passProbability != null && (
                        <span className="rr-badge rr-badge-probability" style={{
                          background: a.passProbability > 70 ? "#eafde9" : a.passProbability > 40 ? "#fef9e7" : "#fdecea",
                          color: a.passProbability > 70 ? "var(--verde)" : a.passProbability > 40 ? "#92400e" : "var(--rojo)",
                        }}>
                          Prob. aprobación: {a.passProbability}%
                        </span>
                      )}
                    </div>
                    <div className="rr-card-tags">
                      {a.sectors.map((s) => <span key={s} className="rr-tag">{s}</span>)}
                      {/* #9 Affected entities */}
                      {a.affectedEntities?.map((e) => <span key={e} className="rr-tag rr-tag-entity">{e}</span>)}
                    </div>
                    {/* #3 Countdown timer */}
                    {a.complianceDeadline && (
                      <div className="rr-countdown-row">
                        <span className="rr-deadline">Deadline: {formatDate(a.complianceDeadline)}</span>
                        <span className="rr-countdown" style={{ color: countdownColor(daysRemaining(a.complianceDeadline)) }}>
                          {daysRemaining(a.complianceDeadline) <= 0
                            ? "VENCIDO"
                            : `${daysRemaining(a.complianceDeadline)} días restantes`}
                        </span>
                      </div>
                    )}
                    {/* #6 Cost estimation */}
                    {a.estimatedCostRange && (
                      <div className="rr-cost-row">
                        <span className="rr-cost-label">Coste estimado ({companySize === "small" ? "pequeña" : companySize === "medium" ? "mediana" : "grande"}):</span>
                        <span className="rr-cost-value">{a.estimatedCostRange[companySize]}</span>
                      </div>
                    )}
                    {/* #5 EU Transposition gap */}
                    {a.euDirective && (
                      <div className="rr-eu-row">
                        <span className="rr-eu-ref">{a.euDirective.ref}</span>
                        <span className={`rr-eu-status ${a.euDirective.transposed ? "rr-eu-ok" : "rr-eu-gap"}`}>
                          {a.euDirective.transposed ? "Transpuesta" : "Pendiente transposición"}
                        </span>
                      </div>
                    )}
                    {/* #14 Public consultation */}
                    {a.publicConsultation && (
                      <div className="rr-consult-row">
                        <span className="rr-consult-status">
                          Consulta pública: {a.publicConsultation.status}
                        </span>
                        <span className="rr-consult-count">{a.publicConsultation.responses.toLocaleString("es-ES")} respuestas</span>
                        {a.publicConsultation.status === "abierta" && (
                          <span className="rr-consult-date">Cierra: {formatDate(a.publicConsultation.closeDate)}</span>
                        )}
                      </div>
                    )}
                    {a.keyChanges.length > 0 && (
                      <ul className="rr-changes">{a.keyChanges.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    )}

                    {/* ── Expanded details ── */}
                    {expandedAlert === a.id && (
                      <div className="rr-expanded">
                        {/* #4 AI Compliance checklist */}
                        {a.complianceChecklist && a.complianceChecklist.length > 0 && (
                          <div className="rr-checklist">
                            <strong>Checklist de cumplimiento:</strong>
                            <ul>
                              {a.complianceChecklist.map((item, i) => (
                                <li key={i} className="rr-checklist-item">
                                  <span className="rr-check-icon">{"☐"}</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* #1 Cross-regulation impact + #17 dependency graph */}
                        {a.relatedAlerts && a.relatedAlerts.length > 0 && (
                          <div className="rr-related">
                            <strong>Regulaciones relacionadas:</strong>
                            <div className="rr-related-list">
                              {a.relatedAlerts.map((rid) => (
                                <span key={rid} className="rr-related-chip" title={getAlertTitle(rid)}>
                                  {rid}: {getAlertTitle(rid).slice(0, 60)}...
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {a.dependsOn && a.dependsOn.length > 0 && (
                          <div className="rr-depends">
                            <strong>Depende de:</strong>
                            {a.dependsOn.map((did) => (
                              <span key={did} className="rr-depends-chip">{did}: {getAlertTitle(did).slice(0, 50)}...</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ SECTORES — enhanced with #2, #7, #12, #15 ═══ */}
          {view === "sectores" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Sectores regulados" title="Perfil regulatorio por sector" description="Carga normativa, velocidad regulatoria, fragmentación y alertas activas." />
              <div className="rr-grid">
                {sectors.map((s) => {
                  const sSlug = s.slug ?? s.id ?? "";
                  const sName = s.name ?? s.label ?? "";
                  const burden = s.regulatoryBurden ?? s.regulatoryBurdenScore ?? 0;
                  const sTrend = s.trend ?? s.recentTrend ?? "";
                  return (
                  <div key={sSlug} className="rr-card">
                    <div className="rr-card-header-row">
                      <h3 className="rr-card-title">{sName}</h3>
                      {/* #15 Sandbox badge */}
                      {s.sandboxActive && <span className="rr-sandbox-badge">Sandbox activo</span>}
                    </div>
                    <p className="rr-card-summary">{s.description}</p>
                    <div className="rr-card-meta">
                      <span className="rr-badge">{s.activeAlerts} alertas</span>
                      <span className="rr-badge" style={{ color: "var(--rojo)" }}>{s.criticalAlerts} críticas</span>
                      <span className="rr-badge">{sTrend}</span>
                    </div>
                    {/* #2 Velocity index with sparkline */}
                    {s.velocityIndex != null && (
                      <div className="rr-velocity-row">
                        <span className="rr-velocity-label">Índice de velocidad regulatoria:</span>
                        <span className="rr-velocity-value" style={{
                          color: s.velocityIndex > 7 ? "var(--rojo)" : s.velocityIndex > 5 ? "#e67e22" : "var(--verde)",
                        }}>
                          {s.velocityIndex}/10
                        </span>
                        {s.velocitySparkline && <Sparkline data={s.velocitySparkline} color={s.velocityIndex > 7 ? "#c8102e" : s.velocityIndex > 5 ? "#e67e22" : "#27ae60"} />}
                      </div>
                    )}
                    {/* Burden bar */}
                    <div className="rr-burden-bar">
                      <div className="rr-burden-fill" style={{ width: `${burden}%`, background: burden > 70 ? "var(--rojo)" : burden > 40 ? "var(--oro)" : "var(--verde)" }} />
                    </div>
                    <span className="rr-burden-label">Carga regulatoria: {burden}/100</span>
                    {/* #12 Fragmentation index */}
                    {s.fragmentationIndex != null && (
                      <div className="rr-frag-row">
                        <span className="rr-frag-label">Fragmentación inter-CCAA:</span>
                        <div className="rr-burden-bar" style={{ marginTop: 0 }}>
                          <div className="rr-burden-fill" style={{
                            width: `${s.fragmentationIndex}%`,
                            background: s.fragmentationIndex > 70 ? "var(--rojo)" : s.fragmentationIndex > 40 ? "var(--oro)" : "var(--verde)",
                          }} />
                        </div>
                        <span className="rr-burden-label">{s.fragmentationIndex}/100</span>
                      </div>
                    )}
                    {/* #7 Historical burden chart */}
                    {s.burdenHistory && s.burdenHistory.length > 0 && (
                      <div className="rr-history-section">
                        <span className="rr-burden-label">Evolución carga regulatoria (12 meses):</span>
                        <BurdenHistoryChart data={s.burdenHistory} />
                      </div>
                    )}
                    <div className="rr-card-tags">{s.keyRegulators.map((r) => <span key={r} className="rr-tag">{r}</span>)}</div>
                    <ul className="rr-changes">{s.topRisks.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                  ); })}
              </div>
            </section>
          )}

          {/* ═══ TIMELINE ═══ */}
          {view === "timeline" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Timelines regulatorios" title="Proceso normativo paso a paso" description="Estado de tramitación de las principales normas en curso." />
              <div className="rr-timeline-list">
                {timelines.map((tl) => (
                  <div key={tl.id} className="rr-timeline-card">
                    <h3 className="rr-card-title">{tl.title}</h3>
                    <div className="rr-timeline-steps">
                      {tl.steps.map((step, i) => (
                        <div key={i} className="rr-step">
                          <div className={`rr-step-dot ${step.completed ? "rr-step-done" : "rr-step-pending"}`} />
                          {i < tl.steps.length - 1 && <div className={`rr-step-line ${step.completed ? "rr-step-line-done" : ""}`} />}
                          <span className="rr-step-date">{formatDate(step.date)}</span>
                          <span className="rr-step-label">{step.label}</span>
                          <span className="rr-badge rr-badge-type">{step.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ FUENTES ═══ */}
          {view === "fuentes" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Fuentes oficiales" title="Fuentes monitorizadas" description={`${sources.length} fuentes activas en ${Object.keys(sourceGroups).length} categorías.`} />
              {Object.entries(sourceGroups).map(([type, items]) => (
                <div key={type} className="rr-source-group">
                  <h3 className="rr-source-type">{type} <span className="rr-source-count">({items.length})</span></h3>
                  <div className="rr-source-list">
                    {items.map((s, i) => (
                      <a key={i} className="rr-source-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ═══ #8 HEATMAP VIEW — Sector x Impact cross-tabulation ═══ */}
          {view === "heatmap" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Mapa de calor" title="Impacto regulatorio por sector" description="Cruce de sectores con nivel de impacto de alertas activas." />
              <div className="rr-heatmap-container">
                <table className="rr-heatmap-table">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th style={{ color: impactColor.critico }}>Crítico</th>
                      <th style={{ color: impactColor.alto }}>Alto</th>
                      <th style={{ color: impactColor.medio }}>Medio</th>
                      <th style={{ color: impactColor.bajo }}>Bajo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((row) => (
                      <tr key={row.slug}>
                        <td className="rr-heatmap-sector">{row.sector}</td>
                        {row.counts.map((count, i) => {
                          const levels = ["critico", "alto", "medio", "bajo"];
                          const intensity = count === 0 ? 0 : Math.min(count / 4, 1);
                          return (
                            <td key={i} className="rr-heatmap-cell" style={{
                              background: count === 0 ? "var(--surface)" : `color-mix(in srgb, ${impactColor[levels[i]]} ${Math.round(intensity * 60 + 20)}%, var(--white))`,
                              color: intensity > 0.5 ? "#fff" : "var(--ink)",
                              fontWeight: count > 0 ? 700 : 400,
                            }}>
                              {count}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ #11 CALENDAR / GANTT VIEW ═══ */}
          {view === "calendario" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Calendario regulatorio" title="Deadlines de cumplimiento" description="Visualización temporal de plazos normativos activos." />
              <div className="rr-calendar-list">
                {calendarAlerts.map((a) => {
                  const days = daysRemaining(a.complianceDeadline!);
                  const maxDays = 365;
                  const barWidth = Math.max(5, Math.min(100, (days / maxDays) * 100));
                  return (
                    <div key={a.id} className="rr-calendar-row">
                      <div className="rr-calendar-label">
                        <span className="rr-calendar-title">{a.title.slice(0, 70)}{a.title.length > 70 ? "..." : ""}</span>
                        <span className="rr-calendar-date" style={{ color: countdownColor(days) }}>
                          {formatDate(a.complianceDeadline!)} ({days <= 0 ? "VENCIDO" : `${days}d`})
                        </span>
                      </div>
                      <div className="rr-calendar-bar-bg">
                        <div className="rr-calendar-bar-fill" style={{
                          width: `${barWidth}%`,
                          background: countdownColor(days),
                        }} />
                      </div>
                      <span className="rr-badge" style={{ background: impactBg[a.impactLevel], color: impactColor[a.impactLevel], flexShrink: 0 }}>
                        {a.impactLevel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ #18 COMPARATIVE STATS VIEW ═══ */}
          {view === "comparativa" && (
            <section className="rr-section">
              <SectionHeading eyebrow="Comparativa" title="España vs. media UE" description="Indicadores clave del entorno regulatorio español en contexto europeo." />
              <div className="rr-comparative-grid">
                {comparativeStats.map((cs, i) => {
                  const diff = cs.spain - cs.euAvg;
                  const diffPct = cs.euAvg !== 0 ? ((diff / cs.euAvg) * 100).toFixed(0) : "N/A";
                  const isWorse = (cs.metric.includes("Tiempo") || cs.metric.includes("Procedimiento") || cs.metric.includes("Fragmentación") || cs.metric.includes("Normas publicadas"))
                    ? diff > 0 : diff < 0;
                  return (
                    <div key={i} className="rr-comparative-card">
                      <h4 className="rr-comparative-metric">{cs.metric}</h4>
                      <div className="rr-comparative-values">
                        <div className="rr-comparative-col">
                          <span className="rr-comparative-country">España</span>
                          <span className="rr-comparative-number">{cs.spain.toLocaleString("es-ES")}{cs.unit}</span>
                        </div>
                        <div className="rr-comparative-col">
                          <span className="rr-comparative-country">Media UE</span>
                          <span className="rr-comparative-number">{cs.euAvg.toLocaleString("es-ES")}{cs.unit}</span>
                        </div>
                        <div className="rr-comparative-col">
                          <span className="rr-comparative-country">Diferencia</span>
                          <span className="rr-comparative-number" style={{ color: isWorse ? "var(--rojo)" : "var(--verde)" }}>
                            {diff > 0 ? "+" : ""}{diff.toLocaleString("es-ES")}{cs.unit} ({diffPct}%)
                          </span>
                        </div>
                      </div>
                      {/* Visual bar comparison */}
                      <div className="rr-comparative-bars">
                        <div className="rr-comp-bar-row">
                          <span className="rr-comp-bar-label">ES</span>
                          <div className="rr-comp-bar-bg">
                            <div className="rr-comp-bar-fill" style={{
                              width: `${Math.min(100, (cs.spain / Math.max(cs.spain, cs.euAvg)) * 100)}%`,
                              background: isWorse ? "var(--rojo)" : "var(--verde)",
                            }} />
                          </div>
                        </div>
                        <div className="rr-comp-bar-row">
                          <span className="rr-comp-bar-label">UE</span>
                          <div className="rr-comp-bar-bg">
                            <div className="rr-comp-bar-fill" style={{
                              width: `${Math.min(100, (cs.euAvg / Math.max(cs.spain, cs.euAvg)) * 100)}%`,
                              background: "var(--azul)",
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
