"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Political Twin — Gemelos digitales de instituciones, CCAA, partidos y
   cargos públicos. Modela patrones de decisión, alianzas, contradicciones
   y predicciones de comportamiento futuro.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Local interfaces (page-level) ─────────────────────────────────────────

interface PTNarrativeTopic { topic: string; mentions: number; trend: string; sentiment: number; sparkline: number[] }
interface PTMemoryEvent { date: string; title: string; description: string; impact: string }

interface PTEntity {
  id: string;
  name: string;
  type: string;
  slug: string;
  description: string;
  priorities: string[];
  legislativeRhythm: string;
  narrativeLines: string[];
  ideologicalPosition: number;
  cohesionIndex: number;
  activityScore: number;
  transparencyScore: number;
  narrativeTopics: PTNarrativeTopic[];
  keyEvents: PTMemoryEvent[];
  totalDecisions: number;
  contradictionCount: number;
  predictionAccuracy: number;
}

interface PTPattern {
  id: string;
  entityId: string;
  description: string;
  category: string;
  frequency: string;
  confidence: number;
  examples: string[];
  lastOccurrence: string;
  timingPattern?: string;
}

interface PTAlliance {
  id: string;
  entityA: string;
  entityB: string;
  type: "alianza" | "fricción";
  strength: number;
  topics: string[];
  recentEvents: string[];
  trend: string;
}

interface PTContradiction {
  id: string;
  entityId: string;
  title: string;
  said: string;
  did: string;
  date: string;
  severity: string;
  source: string;
}

interface PTPrediction {
  id: string;
  entityId: string;
  description: string;
  probability: number;
  timeframe: string;
  basis: string[];
  impact: string;
  category: string;
}

interface PTAlert {
  id: string;
  entityId: string;
  type: string;
  title: string;
  description: string;
  date: string;
  severity: string;
}

interface PTData {
  entities: PTEntity[];
  decisionPatterns: PTPattern[];
  alliances: PTAlliance[];
  contradictions: PTContradiction[];
  predictions: PTPrediction[];
  alerts: PTAlert[];
  stats: {
    totalEntities: number;
    activePatterns: number;
    allianceCount: number;
    frictionCount: number;
    contradictionCount: number;
    pendingPredictions: number;
    avgPredictionAccuracy: number;
    activeAlerts: number;
  };
}

type PTView = "perfil" | "patrones" | "alianzas" | "contradicciones" | "predicciones" | "narrativa";

// ── Helpers ───────────────────────────────────────────────────────────────

const severityColor: Record<string, string> = { critico: "var(--rojo)", alto: "#e67e22", medio: "#f1c40f", bajo: "var(--ink-muted)" };
const typeColor: Record<string, string> = { ccaa: "var(--azul)", ministerio: "var(--verde)", partido: "var(--rojo)", cargo: "var(--oro)" };
const typeLabel: Record<string, string> = { ccaa: "CCAA", ministerio: "Ministerio", partido: "Partido", cargo: "Cargo" };
const categoryColor: Record<string, string> = { legislativo: "var(--azul)", presupuestario: "var(--verde)", comunicación: "var(--oro)", alianza: "#9b59b6", veto: "var(--rojo)" };
const impactColor: Record<string, string> = { alto: "var(--rojo)", medio: "var(--oro)", bajo: "var(--verde)" };

function probColor(p: number) { return p >= 70 ? "var(--verde)" : p >= 40 ? "var(--oro)" : "var(--rojo)"; }
function sentimentColor(s: number) { return s > 20 ? "var(--verde)" : s < -20 ? "var(--rojo)" : "var(--oro)"; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }
function ideologyLabel(pos: number) { return pos < -30 ? "Izquierda" : pos < -10 ? "Centro-izquierda" : pos < 10 ? "Centro" : pos < 30 ? "Centro-derecha" : "Derecha"; }

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ verticalAlign: "middle" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export default function PoliticalTwinPage() {
  const [data, setData] = useState<PTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PTView>("perfil");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [compareEntity, setCompareEntity] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("todos");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("pt-data-v1");
      if (cached) { const p = JSON.parse(cached); if (p.entities) { setData(p); setLoading(false); } }
    } catch {}
    fetch("/api/political-twin")
      .then((r) => r.json())
      .then((d) => {
        setData(d as PTData);
        try { sessionStorage.setItem("pt-data-v1", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const entities = data?.entities ?? [];
  const allPatterns = data?.decisionPatterns ?? [];
  const allAlliances = data?.alliances ?? [];
  const allContradictions = data?.contradictions ?? [];
  const allPredictions = data?.predictions ?? [];
  const allAlerts = data?.alerts ?? [];
  const stats = data?.stats ?? { totalEntities: 0, activePatterns: 0, allianceCount: 0, frictionCount: 0, contradictionCount: 0, pendingPredictions: 0, avgPredictionAccuracy: 0, activeAlerts: 0 };

  const filteredEntities = useMemo(() => {
    if (typeFilter === "todos") return entities;
    return entities.filter((e) => e.type === typeFilter);
  }, [entities, typeFilter]);

  const selected = useMemo(() => entities.find((e) => e.id === selectedEntity) ?? null, [entities, selectedEntity]);
  const compared = useMemo(() => entities.find((e) => e.id === compareEntity) ?? null, [entities, compareEntity]);

  // Filtered data for selected entity
  const entityPatterns = useMemo(() => selectedEntity ? allPatterns.filter((p) => p.entityId === selectedEntity) : allPatterns, [allPatterns, selectedEntity]);
  const entityAlliances = useMemo(() => selectedEntity ? allAlliances.filter((a) => a.entityA === selectedEntity || a.entityB === selectedEntity) : allAlliances, [allAlliances, selectedEntity]);
  const entityContradictions = useMemo(() => selectedEntity ? allContradictions.filter((c) => c.entityId === selectedEntity) : allContradictions, [allContradictions, selectedEntity]);
  const entityPredictions = useMemo(() => selectedEntity ? allPredictions.filter((p) => p.entityId === selectedEntity) : allPredictions, [allPredictions, selectedEntity]);
  const entityAlerts = useMemo(() => selectedEntity ? allAlerts.filter((a) => a.entityId === selectedEntity) : allAlerts, [allAlerts, selectedEntity]);

  const entityName = (id: string) => entities.find((e) => e.id === id)?.name ?? id;

  const viewLabels: Record<PTView, string> = {
    perfil: "Perfil",
    patrones: "Patrones",
    alianzas: "Alianzas",
    contradicciones: "Contradicciones",
    predicciones: "Predicciones",
    narrativa: "Narrativa",
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main className="page-shell">
      <SiteHeader currentSection="political-twin" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">POLITICAL TWIN</span>
        <h1>Gemelos digitales de la politica espanola</h1>
        <p className="hero-subtitle">
          Modelado de comportamiento institucional: patrones de decision, alianzas, contradicciones y predicciones de movimiento futuro.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--azul)" }}>{stats.totalEntities}</span><span className="kpi-label">Entidades modeladas</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--verde)" }}>{stats.activePatterns}</span><span className="kpi-label">Patrones activos</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--oro)" }}>{stats.allianceCount}/{stats.frictionCount}</span><span className="kpi-label">Alianzas / Fricciones</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--rojo)" }}>{stats.contradictionCount}</span><span className="kpi-label">Contradicciones</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.avgPredictionAccuracy}%</span><span className="kpi-label">Precision predictiva</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: severityColor.alto }}>{stats.activeAlerts}</span><span className="kpi-label">Alertas activas</span></div>
        </div>
      </section>

      {/* Entity selector bar */}
      <div className="pt-selector-bar">
        <div className="pt-type-filter">
          {["todos", "ccaa", "ministerio", "partido"].map((t) => (
            <button key={t} className={`pt-type-btn ${typeFilter === t ? "pt-type-btn-active" : ""}`} onClick={() => setTypeFilter(t)}>
              {t === "todos" ? "Todos" : typeLabel[t] ?? t}
            </button>
          ))}
        </div>
        <div className="pt-entity-chips">
          <button className={`pt-entity-chip ${!selectedEntity ? "pt-entity-chip-active" : ""}`} onClick={() => { setSelectedEntity(null); setCompareEntity(null); setCompareMode(false); }}>
            Vista global
          </button>
          {filteredEntities.map((e) => (
            <button key={e.id} className={`pt-entity-chip ${selectedEntity === e.id ? "pt-entity-chip-active" : ""}`}
              style={{ borderColor: typeColor[e.type] }}
              onClick={() => {
                if (compareMode && selectedEntity && selectedEntity !== e.id) { setCompareEntity(e.id); }
                else { setSelectedEntity(e.id); setCompareEntity(null); }
              }}>
              <span className="pt-chip-dot" style={{ background: typeColor[e.type] }} />
              {e.name}
            </button>
          ))}
        </div>
        {selectedEntity && (
          <button className={`pt-compare-toggle ${compareMode ? "pt-compare-toggle-active" : ""}`} onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareEntity(null); }}>
            {compareMode ? "Cancelar comparacion" : "Comparar"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="pt-view-bar">
        {(Object.keys(viewLabels) as PTView[]).map((v) => (
          <button key={v} className={`pt-tab ${view === v ? "pt-tab-active" : ""}`} onClick={() => setView(v)}>
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ ALERTS BANNER ═══ */}
          {entityAlerts.length > 0 && (
            <div className="pt-alerts-banner">
              {entityAlerts.map((a) => (
                <div key={a.id} className="pt-alert-item" style={{ borderLeftColor: severityColor[a.severity] }}>
                  <span className="pt-alert-badge" style={{ background: severityColor[a.severity] }}>{a.type.replace("-", " ")}</span>
                  <strong>{a.title}</strong> — {a.description}
                  <span className="pt-alert-entity">{entityName(a.entityId)}</span>
                  <span className="pt-alert-date">{formatDate(a.date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* ═══ PERFIL ═══ */}
          {view === "perfil" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Perfil conductual" title={selected ? selected.name : "Todos los gemelos digitales"} description={selected ? selected.description : "Selecciona una entidad para ver su perfil detallado o explora la vista global."} />

              {/* Comparison mode */}
              {compareMode && selected && compared && (
                <div className="pt-compare-grid">
                  {[selected, compared].map((ent) => (
                    <div key={ent.id} className="pt-profile-card pt-compare-card">
                      <div className="pt-profile-header">
                        <span className="pt-profile-type" style={{ color: typeColor[ent.type] }}>{typeLabel[ent.type]}</span>
                        <h3>{ent.name}</h3>
                      </div>
                      <p className="pt-profile-desc">{ent.description}</p>
                      <div className="pt-profile-metrics">
                        <div className="pt-metric"><span className="pt-metric-value">{ent.activityScore}</span><span className="pt-metric-label">Actividad</span></div>
                        <div className="pt-metric"><span className="pt-metric-value">{ent.cohesionIndex}</span><span className="pt-metric-label">Cohesion</span></div>
                        <div className="pt-metric"><span className="pt-metric-value">{ent.transparencyScore}</span><span className="pt-metric-label">Transparencia</span></div>
                        <div className="pt-metric"><span className="pt-metric-value">{ent.predictionAccuracy}%</span><span className="pt-metric-label">Precision pred.</span></div>
                      </div>
                      <div className="pt-profile-priorities">
                        <strong>Prioridades:</strong>
                        <div className="pt-tag-row">{ent.priorities.map((p) => <span key={p} className="pt-tag">{p}</span>)}</div>
                      </div>
                      <div className="pt-profile-ideology">
                        <strong>Posicion ideologica:</strong> {ideologyLabel(ent.ideologicalPosition)} ({ent.ideologicalPosition > 0 ? "+" : ""}{ent.ideologicalPosition})
                        <div className="pt-ideology-bar">
                          <div className="pt-ideology-marker" style={{ left: `${((ent.ideologicalPosition + 100) / 200) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Single entity profile */}
              {selected && !compareMode && (
                <div className="pt-profile-card">
                  <div className="pt-profile-header">
                    <span className="pt-profile-type" style={{ color: typeColor[selected.type] }}>{typeLabel[selected.type]}</span>
                    <h3>{selected.name}</h3>
                    <span className="pt-profile-decisions">{selected.totalDecisions} decisiones registradas</span>
                  </div>
                  <p className="pt-profile-desc">{selected.description}</p>
                  <div className="pt-profile-metrics">
                    <div className="pt-metric"><span className="pt-metric-value" style={{ color: "var(--azul)" }}>{selected.activityScore}</span><span className="pt-metric-label">Actividad</span></div>
                    <div className="pt-metric"><span className="pt-metric-value" style={{ color: "var(--verde)" }}>{selected.cohesionIndex}</span><span className="pt-metric-label">Cohesion interna</span></div>
                    <div className="pt-metric"><span className="pt-metric-value" style={{ color: "var(--oro)" }}>{selected.transparencyScore}</span><span className="pt-metric-label">Transparencia</span></div>
                    <div className="pt-metric"><span className="pt-metric-value">{selected.predictionAccuracy}%</span><span className="pt-metric-label">Precision predictiva</span></div>
                    <div className="pt-metric"><span className="pt-metric-value" style={{ color: "var(--rojo)" }}>{selected.contradictionCount}</span><span className="pt-metric-label">Contradicciones</span></div>
                  </div>

                  <div className="pt-profile-section">
                    <strong>Prioridades detectadas</strong>
                    <div className="pt-tag-row">{selected.priorities.map((p) => <span key={p} className="pt-tag">{p}</span>)}</div>
                  </div>

                  <div className="pt-profile-section">
                    <strong>Lineas narrativas</strong>
                    <div className="pt-tag-row">{selected.narrativeLines.map((n) => <span key={n} className="pt-tag pt-tag-narrative">{n}</span>)}</div>
                  </div>

                  <div className="pt-profile-section">
                    <strong>Ritmo legislativo</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--ink-muted)", fontSize: "0.9rem" }}>{selected.legislativeRhythm}</p>
                  </div>

                  <div className="pt-profile-section">
                    <strong>Posicion ideologica</strong>
                    <span style={{ marginLeft: 8, color: "var(--ink-muted)", fontSize: "0.85rem" }}>{ideologyLabel(selected.ideologicalPosition)} ({selected.ideologicalPosition > 0 ? "+" : ""}{selected.ideologicalPosition})</span>
                    <div className="pt-ideology-bar">
                      <span className="pt-ideology-left">Izq</span>
                      <div className="pt-ideology-track">
                        <div className="pt-ideology-marker" style={{ left: `${((selected.ideologicalPosition + 100) / 200) * 100}%` }} />
                      </div>
                      <span className="pt-ideology-right">Der</span>
                    </div>
                  </div>

                  {/* Institutional memory */}
                  {selected.keyEvents.length > 0 && (
                    <div className="pt-profile-section">
                      <strong>Memoria institucional</strong>
                      <div className="pt-memory-timeline">
                        {selected.keyEvents.map((ev, i) => (
                          <div key={i} className="pt-memory-event">
                            <span className="pt-memory-dot" style={{ background: impactColor[ev.impact] }} />
                            <div className="pt-memory-content">
                              <span className="pt-memory-date">{formatDate(ev.date)}</span>
                              <strong>{ev.title}</strong>
                              <p>{ev.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Global entity grid */}
              {!selected && (
                <div className="pt-entity-grid">
                  {filteredEntities.map((e) => (
                    <div key={e.id} className="pt-entity-card" onClick={() => setSelectedEntity(e.id)} style={{ cursor: "pointer" }}>
                      <div className="pt-entity-card-header">
                        <span className="pt-card-type" style={{ color: typeColor[e.type], borderColor: typeColor[e.type] }}>{typeLabel[e.type]}</span>
                        <h4>{e.name}</h4>
                      </div>
                      <div className="pt-entity-card-metrics">
                        <span title="Actividad">Act: {e.activityScore}</span>
                        <span title="Cohesion">Coh: {e.cohesionIndex}</span>
                        <span title="Transparencia">Tra: {e.transparencyScore}</span>
                      </div>
                      <div className="pt-tag-row" style={{ marginTop: 6 }}>
                        {e.priorities.slice(0, 2).map((p) => <span key={p} className="pt-tag pt-tag-sm">{p}</span>)}
                      </div>
                      <div className="pt-entity-card-foot">
                        <span>{e.totalDecisions} decisiones</span>
                        <span style={{ color: "var(--rojo)" }}>{e.contradictionCount} contradicciones</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══ PATRONES ═══ */}
          {view === "patrones" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Patrones de decision" title={selected ? `Patrones de ${selected.name}` : "Todos los patrones detectados"} description="Decisiones recurrentes, frecuencia, confianza y ejemplos historicos." />
              <div className="pt-patterns-list">
                {entityPatterns.map((p) => (
                  <div key={p.id} className="pt-pattern-card">
                    <div className="pt-pattern-header">
                      <span className="pt-pattern-category" style={{ background: categoryColor[p.category] ?? "var(--ink-muted)", color: "#fff" }}>{p.category}</span>
                      <span className="pt-pattern-freq">{p.frequency}</span>
                      {!selectedEntity && <span className="pt-pattern-entity">{entityName(p.entityId)}</span>}
                    </div>
                    <p className="pt-pattern-desc">{p.description}</p>
                    <div className="pt-pattern-meta">
                      <div className="pt-pattern-confidence">
                        <span className="pt-pattern-conf-label">Confianza</span>
                        <div className="pt-conf-bar"><div className="pt-conf-fill" style={{ width: `${p.confidence}%`, background: probColor(p.confidence) }} /></div>
                        <span className="pt-conf-value" style={{ color: probColor(p.confidence) }}>{p.confidence}%</span>
                      </div>
                      <span className="pt-pattern-last">Ultima vez: {formatDate(p.lastOccurrence)}</span>
                      {p.timingPattern && <span className="pt-pattern-timing">Patron: {p.timingPattern}</span>}
                    </div>
                    <div className="pt-pattern-examples">
                      <strong>Ejemplos:</strong>
                      {p.examples.map((ex, i) => <span key={i} className="pt-example-tag">{ex}</span>)}
                    </div>
                  </div>
                ))}
                {entityPatterns.length === 0 && <p className="pt-empty">No se han detectado patrones para esta entidad.</p>}
              </div>
            </section>
          )}

          {/* ═══ ALIANZAS ═══ */}
          {view === "alianzas" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Mapa de alianzas y fricciones" title={selected ? `Relaciones de ${selected.name}` : "Red de alianzas y fricciones"} description="Actores alineados y en conflicto, temas compartidos y tendencia de la relacion." />
              <div className="pt-alliances-grid">
                {entityAlliances.map((a) => {
                  const isAlliance = a.type === "alianza";
                  const color = isAlliance ? "var(--verde)" : "var(--rojo)";
                  return (
                    <div key={a.id} className="pt-alliance-card" style={{ borderLeftColor: color }}>
                      <div className="pt-alliance-header">
                        <span className="pt-alliance-type" style={{ color }}>{isAlliance ? "ALIANZA" : "FRICCION"}</span>
                        <span className="pt-alliance-trend" style={{ color: a.trend === "fortaleciendo" ? "var(--verde)" : a.trend === "debilitando" ? "var(--rojo)" : "var(--oro)" }}>
                          {a.trend === "fortaleciendo" ? "En alza" : a.trend === "debilitando" ? "Debilitandose" : "Estable"}
                        </span>
                      </div>
                      <div className="pt-alliance-actors">
                        <span className="pt-actor">{entityName(a.entityA)}</span>
                        <span className="pt-alliance-connector" style={{ color }}>{isAlliance ? "---" : "///"}</span>
                        <span className="pt-actor">{entityName(a.entityB)}</span>
                      </div>
                      <div className="pt-alliance-strength">
                        <span>Intensidad</span>
                        <div className="pt-strength-bar"><div className="pt-strength-fill" style={{ width: `${a.strength}%`, background: color }} /></div>
                        <span style={{ color, fontWeight: 700 }}>{a.strength}%</span>
                      </div>
                      <div className="pt-alliance-topics">
                        {a.topics.map((t) => <span key={t} className="pt-tag">{t}</span>)}
                      </div>
                      <div className="pt-alliance-events">
                        {a.recentEvents.map((ev, i) => <span key={i} className="pt-event-tag">{ev}</span>)}
                      </div>
                    </div>
                  );
                })}
                {entityAlliances.length === 0 && <p className="pt-empty">No se han detectado relaciones para esta entidad.</p>}
              </div>
            </section>
          )}

          {/* ═══ CONTRADICCIONES ═══ */}
          {view === "contradicciones" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Detector de contradicciones" title={selected ? `Contradicciones de ${selected.name}` : "Todas las contradicciones detectadas"} description="Discrepancias entre lo que dicen y lo que votan, legislan o ejecutan." />
              <div className="pt-contradictions-list">
                {entityContradictions.map((c) => (
                  <div key={c.id} className="pt-contradiction-card" style={{ borderLeftColor: severityColor[c.severity] ?? "var(--ink-muted)" }}>
                    <div className="pt-contradiction-header">
                      <h4>{c.title}</h4>
                      <span className="pt-contradiction-severity" style={{ background: severityColor[c.severity], color: "#fff" }}>Severidad {c.severity}</span>
                      {!selectedEntity && <span className="pt-contradiction-entity">{entityName(c.entityId)}</span>}
                    </div>
                    <div className="pt-contradiction-body">
                      <div className="pt-contradiction-said">
                        <span className="pt-contradiction-label" style={{ color: "var(--verde)" }}>LO QUE DIJERON</span>
                        <p>{c.said}</p>
                      </div>
                      <div className="pt-contradiction-did">
                        <span className="pt-contradiction-label" style={{ color: "var(--rojo)" }}>LO QUE HICIERON</span>
                        <p>{c.did}</p>
                      </div>
                    </div>
                    <div className="pt-contradiction-foot">
                      <span className="pt-contradiction-date">{formatDate(c.date)}</span>
                      <span className="pt-contradiction-source">Fuente: {c.source}</span>
                    </div>
                  </div>
                ))}
                {entityContradictions.length === 0 && <p className="pt-empty">No se han detectado contradicciones para esta entidad.</p>}
              </div>
            </section>
          )}

          {/* ═══ PREDICCIONES ═══ */}
          {view === "predicciones" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Motor de prediccion" title={selected ? `Predicciones para ${selected.name}` : "Todas las predicciones activas"} description="Probabilidad de acciones futuras basada en patrones historicos y contexto actual." />
              <div className="pt-predictions-grid">
                {[...entityPredictions].sort((a, b) => b.probability - a.probability).map((p) => (
                  <div key={p.id} className="pt-prediction-card">
                    <div className="pt-prediction-header">
                      <span className="pt-prediction-category" style={{ background: categoryColor[p.category] ?? "var(--ink-muted)", color: "#fff" }}>{p.category}</span>
                      <span className="pt-prediction-impact" style={{ color: impactColor[p.impact] }}>Impacto {p.impact}</span>
                      {!selectedEntity && <span className="pt-prediction-entity">{entityName(p.entityId)}</span>}
                    </div>
                    <p className="pt-prediction-desc">{p.description}</p>
                    <div className="pt-prediction-prob">
                      <div className="pt-prob-bar"><div className="pt-prob-fill" style={{ width: `${p.probability}%`, background: probColor(p.probability) }} /></div>
                      <span className="pt-prob-value" style={{ color: probColor(p.probability), fontWeight: 700, fontSize: "1.3rem" }}>{p.probability}%</span>
                    </div>
                    <div className="pt-prediction-meta">
                      <span className="pt-prediction-timeframe">Horizonte: {p.timeframe}</span>
                    </div>
                    <div className="pt-prediction-basis">
                      <strong>Fundamentos:</strong>
                      <ul>{p.basis.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                  </div>
                ))}
                {entityPredictions.length === 0 && <p className="pt-empty">No hay predicciones activas para esta entidad.</p>}
              </div>
            </section>
          )}

          {/* ═══ NARRATIVA ═══ */}
          {view === "narrativa" && (
            <section className="pt-section">
              <SectionHeading eyebrow="Analisis narrativo" title={selected ? `Narrativa de ${selected.name}` : "Narrativas de todas las entidades"} description="Temas del discurso rastreados en el tiempo, sentimiento y tendencia." />
              {(selected ? [selected] : filteredEntities).map((ent) => (
                <div key={ent.id} className="pt-narrative-block">
                  {!selected && <h3 className="pt-narrative-entity-title" onClick={() => setSelectedEntity(ent.id)} style={{ cursor: "pointer" }}>{ent.name}</h3>}
                  <div className="pt-narrative-topics">
                    {ent.narrativeTopics.map((t) => (
                      <div key={t.topic} className="pt-narrative-topic-card">
                        <div className="pt-narrative-topic-header">
                          <span className="pt-narrative-topic-name">{t.topic}</span>
                          <MiniSparkline data={t.sparkline} color={sentimentColor(t.sentiment)} />
                        </div>
                        <div className="pt-narrative-topic-stats">
                          <span>{t.mentions} menciones</span>
                          <span className="pt-narrative-trend" style={{ color: t.trend === "creciente" ? "var(--verde)" : t.trend === "decreciente" ? "var(--rojo)" : "var(--oro)" }}>
                            {t.trend === "creciente" ? "Creciente" : t.trend === "decreciente" ? "Decreciente" : "Estable"}
                          </span>
                          <span style={{ color: sentimentColor(t.sentiment) }}>
                            Sentimiento: {t.sentiment > 0 ? "+" : ""}{t.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      <SiteFooter />

      {/* ── Scoped styles ── */}
      <style jsx>{`
        /* ── Selector bar ── */
        .pt-selector-bar { padding: 12px 24px; display: flex; flex-direction: column; gap: 10px; background: var(--surface); border-bottom: 1px solid rgba(255,255,255,.06); }
        .pt-type-filter { display: flex; gap: 6px; }
        .pt-type-btn { padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,.12); background: transparent; color: var(--ink-muted); font-size: .8rem; cursor: pointer; transition: all .15s; }
        .pt-type-btn-active { background: var(--azul); color: #fff; border-color: var(--azul); }
        .pt-entity-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .pt-entity-chip { display: flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,.12); background: transparent; color: var(--ink); font-size: .82rem; cursor: pointer; transition: all .15s; }
        .pt-entity-chip-active { background: rgba(255,255,255,.08); border-color: var(--azul); }
        .pt-chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pt-compare-toggle { padding: 5px 16px; border-radius: 20px; border: 1px solid var(--oro); background: transparent; color: var(--oro); font-size: .82rem; cursor: pointer; align-self: flex-start; }
        .pt-compare-toggle-active { background: var(--oro); color: #000; }

        /* ── View tabs ── */
        .pt-view-bar { display: flex; gap: 2px; padding: 0 24px; background: var(--surface); border-bottom: 1px solid rgba(255,255,255,.06); overflow-x: auto; }
        .pt-tab { padding: 10px 18px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--ink-muted); font-size: .85rem; cursor: pointer; white-space: nowrap; transition: all .15s; }
        .pt-tab:hover { color: var(--ink); }
        .pt-tab-active { color: var(--azul); border-bottom-color: var(--azul); }

        /* ── Section ── */
        .pt-section { padding: 24px; }
        .pt-empty { color: var(--ink-muted); text-align: center; padding: 40px 0; font-style: italic; }

        /* ── Alerts banner ── */
        .pt-alerts-banner { padding: 12px 24px; display: flex; flex-direction: column; gap: 8px; }
        .pt-alert-item { padding: 10px 16px; background: rgba(255,255,255,.03); border-left: 3px solid; border-radius: 4px; font-size: .85rem; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .pt-alert-badge { padding: 2px 8px; border-radius: 10px; font-size: .72rem; color: #fff; text-transform: uppercase; font-weight: 600; }
        .pt-alert-entity { color: var(--ink-muted); font-size: .78rem; }
        .pt-alert-date { color: var(--ink-muted); font-size: .78rem; margin-left: auto; }

        /* ── Profile card ── */
        .pt-profile-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 24px; }
        .pt-profile-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .pt-profile-header h3 { margin: 0; font-size: 1.3rem; }
        .pt-profile-type { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
        .pt-profile-decisions { color: var(--ink-muted); font-size: .82rem; margin-left: auto; }
        .pt-profile-desc { color: var(--ink-muted); font-size: .9rem; line-height: 1.5; margin: 0 0 16px; }
        .pt-profile-metrics { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,.02); border-radius: 6px; }
        .pt-metric { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .pt-metric-value { font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .pt-metric-label { font-size: .72rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: .04em; }
        .pt-profile-section { margin-top: 16px; }
        .pt-profile-section strong { font-size: .85rem; color: var(--ink); }

        /* ── Tags ── */
        .pt-tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .pt-tag { padding: 3px 10px; border-radius: 12px; background: rgba(255,255,255,.06); font-size: .78rem; color: var(--ink); }
        .pt-tag-sm { font-size: .72rem; padding: 2px 8px; }
        .pt-tag-narrative { border: 1px solid var(--oro); color: var(--oro); background: transparent; }

        /* ── Ideology bar ── */
        .pt-ideology-bar { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .pt-ideology-left, .pt-ideology-right { font-size: .7rem; color: var(--ink-muted); flex-shrink: 0; }
        .pt-ideology-track { flex: 1; height: 4px; background: linear-gradient(to right, var(--rojo), var(--oro), var(--azul)); border-radius: 2px; position: relative; }
        .pt-ideology-marker { position: absolute; top: -4px; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid var(--azul); transform: translateX(-50%); }

        /* ── Memory timeline ── */
        .pt-memory-timeline { margin-top: 10px; padding-left: 16px; border-left: 2px solid rgba(255,255,255,.08); }
        .pt-memory-event { display: flex; gap: 12px; padding: 8px 0; align-items: flex-start; }
        .pt-memory-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .pt-memory-content { flex: 1; }
        .pt-memory-content p { margin: 2px 0 0; font-size: .82rem; color: var(--ink-muted); }
        .pt-memory-date { font-size: .72rem; color: var(--ink-muted); }
        .pt-memory-content strong { font-size: .88rem; }

        /* ── Entity grid (global) ── */
        .pt-entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .pt-entity-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 16px; transition: border-color .15s; }
        .pt-entity-card:hover { border-color: var(--azul); }
        .pt-entity-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .pt-entity-card-header h4 { margin: 0; font-size: 1rem; }
        .pt-card-type { font-size: .68rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border: 1px solid; border-radius: 10px; }
        .pt-entity-card-metrics { display: flex; gap: 12px; font-size: .78rem; color: var(--ink-muted); }
        .pt-entity-card-foot { display: flex; justify-content: space-between; font-size: .75rem; color: var(--ink-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.06); }

        /* ── Compare ── */
        .pt-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .pt-compare-card { }

        /* ── Patterns ── */
        .pt-patterns-list { display: flex; flex-direction: column; gap: 12px; }
        .pt-pattern-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 16px; }
        .pt-pattern-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .pt-pattern-category { padding: 2px 10px; border-radius: 10px; font-size: .72rem; font-weight: 600; text-transform: uppercase; }
        .pt-pattern-freq { font-size: .78rem; color: var(--ink-muted); padding: 2px 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; }
        .pt-pattern-entity { font-size: .78rem; color: var(--azul); margin-left: auto; }
        .pt-pattern-desc { font-size: .9rem; margin: 0 0 12px; line-height: 1.5; }
        .pt-pattern-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
        .pt-pattern-confidence { display: flex; align-items: center; gap: 6px; }
        .pt-pattern-conf-label { font-size: .75rem; color: var(--ink-muted); }
        .pt-conf-bar { width: 80px; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; }
        .pt-conf-fill { height: 100%; border-radius: 3px; transition: width .3s; }
        .pt-conf-value { font-size: .82rem; font-weight: 600; }
        .pt-pattern-last, .pt-pattern-timing { font-size: .78rem; color: var(--ink-muted); }
        .pt-pattern-examples { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .pt-pattern-examples strong { font-size: .78rem; color: var(--ink-muted); }
        .pt-example-tag { padding: 2px 8px; background: rgba(255,255,255,.05); border-radius: 10px; font-size: .75rem; }

        /* ── Alliances ── */
        .pt-alliances-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
        .pt-alliance-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-left: 4px solid; border-radius: 8px; padding: 16px; }
        .pt-alliance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .pt-alliance-type { font-size: .75rem; font-weight: 700; letter-spacing: .05em; }
        .pt-alliance-trend { font-size: .78rem; }
        .pt-alliance-actors { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 1rem; font-weight: 600; }
        .pt-actor { }
        .pt-alliance-connector { font-weight: 400; letter-spacing: 2px; }
        .pt-alliance-strength { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: .8rem; }
        .pt-strength-bar { flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; }
        .pt-strength-fill { height: 100%; border-radius: 3px; }
        .pt-alliance-topics { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
        .pt-alliance-events { display: flex; flex-wrap: wrap; gap: 5px; }
        .pt-event-tag { padding: 2px 8px; background: rgba(255,255,255,.04); border-radius: 10px; font-size: .72rem; color: var(--ink-muted); }

        /* ── Contradictions ── */
        .pt-contradictions-list { display: flex; flex-direction: column; gap: 16px; }
        .pt-contradiction-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-left: 4px solid; border-radius: 8px; padding: 20px; }
        .pt-contradiction-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
        .pt-contradiction-header h4 { margin: 0; font-size: 1.05rem; flex: 1; }
        .pt-contradiction-severity { padding: 2px 10px; border-radius: 10px; font-size: .72rem; font-weight: 600; text-transform: uppercase; }
        .pt-contradiction-entity { font-size: .78rem; color: var(--azul); }
        .pt-contradiction-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
        .pt-contradiction-said, .pt-contradiction-did { padding: 12px; background: rgba(255,255,255,.02); border-radius: 6px; }
        .pt-contradiction-label { font-size: .7rem; font-weight: 700; letter-spacing: .05em; display: block; margin-bottom: 6px; }
        .pt-contradiction-said p, .pt-contradiction-did p { margin: 0; font-size: .85rem; line-height: 1.5; color: var(--ink-muted); }
        .pt-contradiction-foot { display: flex; gap: 16px; font-size: .78rem; color: var(--ink-muted); }

        /* ── Predictions ── */
        .pt-predictions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .pt-prediction-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 18px; }
        .pt-prediction-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .pt-prediction-category { padding: 2px 10px; border-radius: 10px; font-size: .72rem; font-weight: 600; text-transform: uppercase; }
        .pt-prediction-impact { font-size: .78rem; font-weight: 600; }
        .pt-prediction-entity { font-size: .78rem; color: var(--azul); margin-left: auto; }
        .pt-prediction-desc { font-size: .9rem; margin: 0 0 14px; line-height: 1.5; }
        .pt-prediction-prob { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .pt-prob-bar { flex: 1; height: 8px; background: rgba(255,255,255,.08); border-radius: 4px; overflow: hidden; }
        .pt-prob-fill { height: 100%; border-radius: 4px; transition: width .3s; }
        .pt-prediction-meta { margin-bottom: 10px; }
        .pt-prediction-timeframe { font-size: .82rem; color: var(--ink-muted); }
        .pt-prediction-basis { font-size: .82rem; }
        .pt-prediction-basis strong { color: var(--ink-muted); font-size: .78rem; }
        .pt-prediction-basis ul { margin: 4px 0 0; padding-left: 18px; }
        .pt-prediction-basis li { color: var(--ink-muted); font-size: .8rem; margin-bottom: 2px; }

        /* ── Narrative ── */
        .pt-narrative-block { margin-bottom: 24px; }
        .pt-narrative-entity-title { font-size: 1.1rem; margin: 0 0 12px; color: var(--azul); }
        .pt-narrative-entity-title:hover { text-decoration: underline; }
        .pt-narrative-topics { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .pt-narrative-topic-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 8px; padding: 14px; }
        .pt-narrative-topic-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .pt-narrative-topic-name { font-weight: 600; font-size: .95rem; }
        .pt-narrative-topic-stats { display: flex; gap: 12px; font-size: .78rem; color: var(--ink-muted); }
        .pt-narrative-trend { font-weight: 600; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .pt-compare-grid { grid-template-columns: 1fr; }
          .pt-contradiction-body { grid-template-columns: 1fr; }
          .pt-profile-metrics { gap: 16px; }
        }
      `}</style>
    </main>
  );
}
