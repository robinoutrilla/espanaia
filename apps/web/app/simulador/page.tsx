"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Simulador de España — Plataforma de simulación de políticas públicas.
   "SimCity" institucional: cambia una ley, presupuesto o política y
   observa el impacto en territorios, actores y cadenas regulatorias.
   ═══════════════════════════════════════════════════════════════════════════ */

interface SimVariable {
  id: string; label: string; currentValue: number; simulatedValue: number; unit: string; min: number; max: number;
}

interface SimScenario {
  id: string; title: string; description: string; category: string; variables: SimVariable[];
  createdDate: string; author: string; isPredefined: boolean; tags: string[];
}

interface CascadeEffect { order: number; description: string; timeframe: string; probability: number }
interface ActorImpact { name: string; type: string; stance: "beneficiado" | "perjudicado" | "neutro"; influence: number; reason: string }

interface ImpactResult {
  id: string; scenarioId: string; territory: string; territorySlug: string;
  impactLevel: string; impactScore: number; affectedPopulation: number; budgetDelta: number;
  riskLevel: string; opportunities: string[]; risks: string[];
  cascadeEffects: CascadeEffect[]; actors: ActorImpact[];
}

interface PredefinedScenario {
  id: string; title: string; description: string; category: string; complexity: string;
  estimatedTime: string; variables: SimVariable[]; tags: string[]; historicalPrecedent?: string;
}

interface RegChainStep { order: number; regulation: string; status: string; dependency: string; timeframe: string }
interface RegulatoryChain { id: string; scenarioId: string; steps: RegChainStep[] }

interface ROMItem { label: string; type: "riesgo" | "oportunidad"; probability: number; impact: number; sector: string }
interface RiskOpMatrix { scenarioId: string; items: ROMItem[] }

interface HistoricalComp { id: string; title: string; year: number; description: string; outcome: string; similarityScore: number }

interface SimData {
  scenarios: SimScenario[]; predefined: PredefinedScenario[]; impactResults: ImpactResult[];
  regulatoryChains: RegulatoryChain[]; riskMatrices: RiskOpMatrix[];
  historicalComparisons: HistoricalComp[];
  stats: { totalScenarios: number; predefinedCount: number; territoriesAnalyzed: number; actorsTracked: number; avgImpactScore: number; lastUpdated: string };
}

type SEView = "escenarios" | "predefinidos" | "impacto" | "actores" | "cascada" | "cadena-regulatoria" | "matriz-riesgo" | "historico" | "mapa" | "exportar";

const impactColor: Record<string, string> = { critico: "var(--rojo)", alto: "#e67e22", medio: "#f1c40f", bajo: "var(--verde)" };
const stanceColor: Record<string, string> = { beneficiado: "var(--verde)", perjudicado: "var(--rojo)", neutro: "var(--ink-muted)" };
const stanceLabel: Record<string, string> = { beneficiado: "Beneficiado", perjudicado: "Perjudicado", neutro: "Neutro" };

function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }
function formatNum(n: number) { return n.toLocaleString("es-ES"); }

export default function SimuladorPage() {
  const [data, setData] = useState<SimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SEView>("escenarios");
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState("");
  const [expandedImpact, setExpandedImpact] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("se-data-v1");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/simulador")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("se-data-v1", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scenarios = data?.scenarios ?? [];
  const predefined = data?.predefined ?? [];
  const impactResults = data?.impactResults ?? [];
  const regChains = data?.regulatoryChains ?? [];
  const riskMatrices = data?.riskMatrices ?? [];
  const historicals = data?.historicalComparisons ?? [];
  const stats = data?.stats ?? { totalScenarios: 0, predefinedCount: 0, territoriesAnalyzed: 0, actorsTracked: 0, avgImpactScore: 0, lastUpdated: "" };

  const allCategories = [...new Set(scenarios.map((s) => s.category))];

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => !filterCategory || s.category === filterCategory);
  }, [scenarios, filterCategory]);

  const scenarioImpacts = useMemo(() => {
    if (!selectedScenario) return impactResults;
    return impactResults.filter((r) => r.scenarioId === selectedScenario);
  }, [impactResults, selectedScenario]);

  const allActors = useMemo(() => {
    return scenarioImpacts.flatMap((r) => r.actors.map((a) => ({ ...a, territory: r.territory })));
  }, [scenarioImpacts]);

  const allCascades = useMemo(() => {
    return scenarioImpacts.flatMap((r) => r.cascadeEffects.map((c) => ({ ...c, territory: r.territory })));
  }, [scenarioImpacts]);

  const currentChains = useMemo(() => {
    if (!selectedScenario) return regChains;
    return regChains.filter((c) => c.scenarioId === selectedScenario);
  }, [regChains, selectedScenario]);

  const currentMatrix = useMemo(() => {
    if (!selectedScenario) return riskMatrices[0];
    return riskMatrices.find((m) => m.scenarioId === selectedScenario) ?? riskMatrices[0];
  }, [riskMatrices, selectedScenario]);

  const handleExport = () => {
    const sc = scenarios.find((s) => s.id === selectedScenario);
    const lines = [
      "SIMULADOR DE ESPAÑA - INFORME",
      `Generado: ${new Date().toLocaleDateString("es-ES")}`,
      sc ? `Escenario: ${sc.title}` : "Todos los escenarios",
      "",
      "IMPACTOS TERRITORIALES:",
      ...scenarioImpacts.map((r) => `- ${r.territory}: impacto ${r.impactScore > 0 ? "+" : ""}${r.impactScore}, ${r.impactLevel}, presupuesto ${r.budgetDelta > 0 ? "+" : ""}${r.budgetDelta}M€`),
      "",
      "ACTORES:",
      ...allActors.map((a) => `- ${a.name} (${a.type}): ${stanceLabel[a.stance]}, influencia ${a.influence}/100`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "simulador-espana-informe.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const viewLabels: Record<SEView, string> = {
    escenarios: "Escenarios", predefinidos: "Predefinidos", impacto: "Impacto",
    actores: "Actores", cascada: "Cascada", "cadena-regulatoria": "Cadena Regulatoria",
    "matriz-riesgo": "Riesgo/Oportunidad", historico: "Histórico", mapa: "Mapa", exportar: "Exportar",
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="simulador" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">SIMULADOR DE ESPAÑA</span>
        <h1>Simula el impacto de cambios en leyes, presupuestos y políticas</h1>
        <p className="hero-subtitle">
          &ldquo;SimCity&rdquo; institucional: {stats.totalScenarios} escenarios, {stats.territoriesAnalyzed} territorios analizados, {stats.actorsTracked} actores mapeados.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalScenarios}</span><span className="kpi-label">Escenarios</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.predefinedCount}</span><span className="kpi-label">Predefinidos</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.territoriesAnalyzed}</span><span className="kpi-label">Territorios</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.actorsTracked}</span><span className="kpi-label">Actores</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.avgImpactScore}</span><span className="kpi-label">Impacto medio</span></div>
        </div>
      </section>

      {/* Scenario selector */}
      <div className="se-scenario-selector" style={{ display: "flex", gap: 12, padding: "12px 24px", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600, color: "var(--ink)" }}>Escenario activo:</label>
        <select className="se-select" value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)", minWidth: 280 }}>
          <option value="">Todos los escenarios</option>
          {scenarios.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="se-view-bar" style={{ display: "flex", gap: 4, padding: "0 24px 16px", flexWrap: "wrap" }}>
        {(Object.keys(viewLabels) as SEView[]).map((v) => (
          <button key={v} className={`se-tab ${view === v ? "se-tab-active" : ""}`}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: view === v ? 700 : 400, background: view === v ? "var(--azul)" : "var(--surface)", color: view === v ? "#fff" : "var(--ink)", fontSize: 13, transition: "all .15s" }}
            onClick={() => { if (v === "exportar") { handleExport(); } else { setView(v); } }}>
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ ESCENARIOS ═══ */}
          {view === "escenarios" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Constructor de escenarios" title="Elige qué cambiar" description="Modifica presupuestos, leyes, políticas o prioridades territoriales y observa el impacto." />
              <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select className="se-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)" }}>
                  <option value="">Todas las categorías</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="se-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                {filteredScenarios.map((s) => (
                  <div key={s.id} className="se-card" style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer", transition: "box-shadow .15s" }}
                    onClick={() => { setSelectedScenario(s.id); setView("impacto"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, color: "var(--ink)" }}>{s.title}</h3>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--azul)", color: "#fff", whiteSpace: "nowrap" }}>{s.category}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 12px" }}>{s.description}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {s.variables.map((v) => (
                        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 8px", background: "#f8f8f8", borderRadius: 4 }}>
                          <span style={{ fontWeight: 500 }}>{v.label}</span>
                          <span>
                            <span style={{ color: "var(--ink-muted, #999)" }}>{formatNum(v.currentValue)}</span>
                            <span style={{ margin: "0 6px" }}>&rarr;</span>
                            <span style={{ fontWeight: 700, color: "var(--azul)" }}>{formatNum(v.simulatedValue)} {v.unit}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {s.tags.map((t) => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#eef", color: "var(--azul)" }}>{t}</span>)}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-muted, #999)" }}>
                      {formatDate(s.createdDate)} &middot; {s.author} {s.isPredefined && <span style={{ color: "var(--verde)" }}>&middot; Predefinido</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ PREDEFINIDOS ═══ */}
          {view === "predefinidos" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Escenarios predefinidos" title="Simulaciones listas para usar" description="Recortes NGEU, reformas fiscales, cambios regulatorios y más. Haz clic para activar." />
              <div className="se-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {predefined.map((p) => (
                  <div key={p.id} className="se-predef-card" style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer" }}
                    onClick={() => { const sc = scenarios.find((s) => s.title === p.title); if (sc) { setSelectedScenario(sc.id); setView("impacto"); } }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 15 }}>{p.title}</h3>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                        background: p.complexity === "avanzada" ? "#fdecea" : p.complexity === "intermedia" ? "#fef9e7" : "#eafde9",
                        color: p.complexity === "avanzada" ? "var(--rojo)" : p.complexity === "intermedia" ? "#92400e" : "var(--verde)" }}>
                        {p.complexity}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 8px" }}>{p.description}</p>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-muted, #999)" }}>
                      <span>Tiempo: {p.estimatedTime}</span>
                      <span>Categoría: {p.category}</span>
                    </div>
                    {p.historicalPrecedent && (
                      <div style={{ marginTop: 8, fontSize: 12, padding: "4px 8px", background: "#f0f0ff", borderRadius: 4, color: "var(--azul)" }}>
                        Precedente: {p.historicalPrecedent}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      {p.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#eef", color: "var(--azul)" }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ IMPACTO TERRITORIAL ═══ */}
          {view === "impacto" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Dashboard de impacto" title="Territorios afectados" description={selectedScenario ? `Escenario: ${scenarios.find((s) => s.id === selectedScenario)?.title ?? ""}` : "Todos los escenarios"} />
              <div className="se-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                {scenarioImpacts.map((r) => (
                  <div key={r.id} className="se-impact-card" style={{
                    background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)",
                    borderLeft: `4px solid ${impactColor[r.impactLevel] ?? "var(--ink-muted)"}`, cursor: "pointer",
                  }} onClick={() => setExpandedImpact(expandedImpact === r.id ? null : r.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{r.territory}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: impactColor[r.impactLevel] ?? "#ccc", color: "#fff" }}>{r.impactLevel}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, color: r.impactScore > 0 ? "var(--verde)" : "var(--rojo)", background: r.impactScore > 0 ? "#eafde9" : "#fdecea" }}>
                          {r.impactScore > 0 ? "+" : ""}{r.impactScore}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--azul)" }}>{formatNum(r.affectedPopulation)}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Población</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: r.budgetDelta >= 0 ? "var(--verde)" : "var(--rojo)" }}>{r.budgetDelta > 0 ? "+" : ""}{formatNum(r.budgetDelta)}M&euro;</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Presupuesto</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: impactColor[r.impactLevel] }}>{r.riskLevel}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Riesgo</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "var(--verde)" }}>Oportunidades</strong>
                        <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{r.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul>
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "var(--rojo)" }}>Riesgos</strong>
                        <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{r.risks.map((k, i) => <li key={i}>{k}</li>)}</ul>
                      </div>
                    </div>

                    {expandedImpact === r.id && (
                      <div style={{ borderTop: "1px solid var(--border, #e5e5e5)", paddingTop: 12, marginTop: 8 }}>
                        <strong style={{ fontSize: 13 }}>Actores involucrados:</strong>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                          {r.actors.map((a, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8f8f8", borderRadius: 6, fontSize: 12, borderLeft: `3px solid ${stanceColor[a.stance]}` }}>
                              <div><strong>{a.name}</strong> <span style={{ color: "var(--ink-muted, #999)" }}>({a.type})</span></div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ color: stanceColor[a.stance], fontWeight: 600 }}>{stanceLabel[a.stance]}</span>
                                <span style={{ background: "var(--azul)", color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 10 }}>Influencia: {a.influence}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <strong style={{ fontSize: 13 }}>Efectos cascada:</strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {r.cascadeEffects.map((c, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", padding: "6px 10px", background: "#fefcf0", borderRadius: 6, fontSize: 12, borderLeft: `3px solid ${c.order === 1 ? "var(--rojo)" : c.order === 2 ? "var(--oro)" : "var(--azul)"}` }}>
                                <span style={{ fontWeight: 700, minWidth: 30 }}>{c.order}&ordm;</span>
                                <div style={{ flex: 1 }}>
                                  <div>{c.description}</div>
                                  <div style={{ color: "var(--ink-muted, #999)", marginTop: 2 }}>{c.timeframe} &middot; Prob: {c.probability}%</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ ACTORES ═══ */}
          {view === "actores" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Análisis de actores" title="Quién gana, quién pierde" description="Mapa de actores afectados por el escenario simulado." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
                {["beneficiado", "perjudicado", "neutro"].map((stance) => {
                  const group = allActors.filter((a) => a.stance === stance);
                  if (group.length === 0) return null;
                  return (
                    <div key={stance} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: `2px solid ${stanceColor[stance]}` }}>
                      <h3 style={{ margin: "0 0 12px", color: stanceColor[stance], fontSize: 15 }}>{stanceLabel[stance]}s ({group.length})</h3>
                      {group.sort((a, b) => b.influence - a.influence).map((a, i) => (
                        <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border, #eee)", fontSize: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{a.name}</strong>
                            <span style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Influencia: {a.influence}/100</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted, #666)", marginTop: 2 }}>{a.reason}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted, #999)", marginTop: 2 }}>{a.territory} &middot; {a.type}</div>
                          <div style={{ marginTop: 4, height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${a.influence}%`, height: "100%", background: stanceColor[stance], borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ CASCADA ═══ */}
          {view === "cascada" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Efectos cascada" title="Timeline de consecuencias" description="Efectos de 1er, 2o y 3er orden a lo largo del tiempo." />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((order) => {
                  const effects = allCascades.filter((c) => c.order === order);
                  if (effects.length === 0) return null;
                  return (
                    <div key={order} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)" }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: 15, color: order === 1 ? "var(--rojo)" : order === 2 ? "var(--oro)" : "var(--azul)" }}>
                        Efectos de {order}&ordm; orden
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {effects.map((c, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8f8f8", borderRadius: 8, fontSize: 13 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{c.description}</div>
                              <div style={{ fontSize: 11, color: "var(--ink-muted, #999)", marginTop: 2 }}>{c.territory}</div>
                            </div>
                            <div style={{ textAlign: "right", minWidth: 100 }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.timeframe}</div>
                              <div style={{ fontSize: 11, color: c.probability >= 70 ? "var(--rojo)" : c.probability >= 40 ? "var(--oro)" : "var(--verde)" }}>
                                Prob: {c.probability}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ CADENA REGULATORIA ═══ */}
          {view === "cadena-regulatoria" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Cadena regulatoria" title="Pasos normativos necesarios" description="Desde el borrador hasta la entrada en vigor: cada paso y su dependencia." />
              {currentChains.length === 0 && <p style={{ padding: "24px", color: "var(--ink-muted, #999)", textAlign: "center" }}>Selecciona un escenario con cadena regulatoria disponible.</p>}
              {currentChains.map((chain) => (
                <div key={chain.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid var(--border, #e5e5e5)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {chain.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, alignItems: "start", position: "relative" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, background: step.status === "en-tramite" ? "var(--oro)" : step.status === "borrador" ? "var(--azul)" : "#e5e5e5", color: step.status !== "pendiente" ? "#fff" : "var(--ink-muted, #999)" }}>
                            {step.order}
                          </div>
                          {i < chain.steps.length - 1 && <div style={{ width: 2, height: 40, background: "#ddd" }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 16 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{step.regulation}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted, #666)", marginTop: 2 }}>
                            Estado: <span style={{ fontWeight: 600, color: step.status === "en-tramite" ? "var(--oro)" : step.status === "borrador" ? "var(--azul)" : "var(--ink-muted, #999)" }}>{step.status}</span>
                            {step.dependency !== "-" && <> &middot; Depende de: {step.dependency}</>}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted, #999)", marginTop: 2 }}>Plazo: {step.timeframe}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ═══ MATRIZ RIESGO/OPORTUNIDAD ═══ */}
          {view === "matriz-riesgo" && currentMatrix && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Matriz riesgo-oportunidad" title="Probabilidad vs. Impacto" description="Cuadrante de riesgos y oportunidades del escenario." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {["riesgo", "oportunidad"].map((type) => (
                  <div key={type} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: `2px solid ${type === "riesgo" ? "var(--rojo)" : "var(--verde)"}` }}>
                    <h3 style={{ margin: "0 0 12px", color: type === "riesgo" ? "var(--rojo)" : "var(--verde)", fontSize: 15, textTransform: "capitalize" }}>{type === "riesgo" ? "Riesgos" : "Oportunidades"}</h3>
                    {currentMatrix.items.filter((it) => it.type === type).sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact)).map((it, i) => (
                      <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border, #eee)", fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>{it.label}</strong>
                          <span style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>{it.sector}</span>
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 12 }}>
                          <span>Probabilidad: <strong>{it.probability}%</strong></span>
                          <span>Impacto: <strong>{it.impact}/100</strong></span>
                          <span style={{ fontWeight: 700, color: type === "riesgo" ? "var(--rojo)" : "var(--verde)" }}>Score: {Math.round(it.probability * it.impact / 100)}</span>
                        </div>
                        <div style={{ marginTop: 6, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.round(it.probability * it.impact / 100)}%`, height: "100%", background: type === "riesgo" ? "var(--rojo)" : "var(--verde)", borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ HISTÓRICO ═══ */}
          {view === "historico" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Comparaciones históricas" title="Precedentes similares en la historia de España" description="Escenarios pasados con similitudes al escenario actual." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                {historicals.sort((a, b) => b.similarityScore - a.similarityScore).map((h) => (
                  <div key={h.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)", borderTop: `4px solid ${h.similarityScore >= 70 ? "var(--rojo)" : h.similarityScore >= 50 ? "var(--oro)" : "var(--azul)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15 }}>{h.title}</h3>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 10, background: h.similarityScore >= 70 ? "#fdecea" : h.similarityScore >= 50 ? "#fef9e7" : "#edf6ff", color: h.similarityScore >= 70 ? "var(--rojo)" : h.similarityScore >= 50 ? "#92400e" : "var(--azul)" }}>
                        Similitud: {h.similarityScore}%
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--azul)", marginBottom: 6 }}>{h.year}</div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 8px" }}>{h.description}</p>
                    <div style={{ padding: "8px 12px", background: "#f8f8f8", borderRadius: 6, fontSize: 12 }}>
                      <strong>Resultado:</strong> {h.outcome}
                    </div>
                    <div style={{ marginTop: 8, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${h.similarityScore}%`, height: "100%", borderRadius: 3, background: h.similarityScore >= 70 ? "var(--rojo)" : h.similarityScore >= 50 ? "var(--oro)" : "var(--azul)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ MAPA DE IMPACTO TERRITORIAL ═══ */}
          {view === "mapa" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Mapa de impacto" title="Impacto por CCAA" description="Visualización territorial del impacto del escenario seleccionado." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {scenarioImpacts.map((r) => {
                  const absScore = Math.abs(r.impactScore);
                  const barColor = r.impactScore > 0 ? "var(--verde)" : "var(--rojo)";
                  return (
                    <div key={r.id} style={{ background: "var(--surface)", borderRadius: 8, padding: 14, border: "1px solid var(--border, #e5e5e5)", textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{r.territory}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: barColor, marginBottom: 4 }}>
                        {r.impactScore > 0 ? "+" : ""}{r.impactScore}
                      </div>
                      <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ width: `${absScore}%`, height: "100%", background: barColor, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>{r.impactLevel} &middot; {formatNum(r.budgetDelta)}M&euro;</div>
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
