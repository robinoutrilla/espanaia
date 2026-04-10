"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   /ministerios — Government ministry dashboard.
   Grid of all 22 ministries with detail expansion, source inventory,
   budget breakdown, and performance metrics.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = "min-data-v1";

type ViewMode = "grid" | "presupuestos" | "fuentes" | "metricas" | "organigrama";

interface MinistryGrid {
  slug: string; name: string; shortName: string; acronym: string;
  ministerName: string; ministerParty: string; vicePresident: boolean; vpOrder?: number;
  webUrl: string; colorAccent: string; description: string; keyAreas: string[];
  employeeCount: number; budgetTotalM: number; budgetChangePct: number; budgetPctOfPGE: number;
  organismoCount: number; sourceCount: number; activeSourceCount: number;
  metricCount: number; activityCount: number; tags: string[];
}

interface MinData {
  grid: MinistryGrid[];
  detail: Record<string, any>;
  summary: any;
  budget: any;
  sourceStatus: { slug: string; name: string; sourceCount: number; activeCount: number }[];
  meta: any;
}

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: "grid", label: "Ministerios" },
  { id: "presupuestos", label: "Presupuestos" },
  { id: "fuentes", label: "Fuentes oficiales" },
  { id: "metricas", label: "Métricas" },
  { id: "organigrama", label: "Organigrama" },
];

function formatM(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)} Md\u20ac`;
  return `${n.toLocaleString("es-ES")} M\u20ac`;
}

export default function MinisteriosPage() {
  const [data, setData] = useState<MinData | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"budget" | "employees" | "sources" | "name">("budget");

  /* Auto-select ministry from ?m= query param */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("m");
      if (m) setSelectedSlug(m);
    }
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) { setData(JSON.parse(cached)); return; }
    fetch("/api/ministerios")
      .then((r) => r.json())
      .then((d) => { setData(d); sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.grid;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.shortName.toLowerCase().includes(q) ||
               m.ministerName.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "budget") return b.budgetTotalM - a.budgetTotalM;
      if (sortBy === "employees") return b.employeeCount - a.employeeCount;
      if (sortBy === "sources") return b.activeSourceCount - a.activeSourceCount;
      return a.name.localeCompare(b.name, "es");
    });
  }, [data, search, sortBy]);

  const selectedDetail = selectedSlug && data ? data.detail[selectedSlug] : null;

  if (!data) {
    return (
      <main className="page-shell detail-page">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <SiteHeader currentSection="ministerios" />
        <section className="panel detail-hero">
          <div className="detail-copy">
            <span className="eyebrow">GOBIERNO DE ESPA&Ntilde;A</span>
            <h1 className="detail-title">Ministerios</h1>
            <p className="detail-description">Cargando datos ministeriales...</p>
          </div>
        </section>
      </main>
    );
  }

  const { summary, budget } = data;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <SiteHeader currentSection="ministerios" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">GOBIERNO DE ESPA{"Ñ"}A</span>
            <h1 className="detail-title">Ministerios del Gobierno</h1>
            <p className="detail-description">
              {summary.totalMinistries} ministerios, {summary.totalOrganismos} organismos p{"ú"}blicos,
              {" "}{(summary.totalEmployees / 1000).toFixed(0)}k empleados p{"ú"}blicos.
              Presupuesto total: {formatM(budget.totalM)}.
              Datos extra{"í"}dos de {summary.totalActiveSources} fuentes oficiales activas.
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Gobierno</h2>
            <div className="kpi-grid">
              <div className="kpi-cell">
                <strong style={{ color: "var(--azul)" }}>{summary.totalMinistries}</strong>
                <span>Ministerios</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--verde)" }}>{summary.totalActiveSources}</strong>
                <span>Fuentes activas</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--rojo)" }}>{formatM(budget.totalM)}</strong>
                <span>Presupuesto</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--azul)" }}>{summary.vpCount}</strong>
                <span>Vicepresidencias</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── View tabs ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="min-view-bar">
          {VIEW_TABS.map((t) => (
            <button
              key={t.id}
              className={`min-view-btn ${view === t.id ? "min-view-btn-active" : ""}`}
              onClick={() => { setView(t.id); setSelectedSlug(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ GRID VIEW ══════════════ */}
        {view === "grid" && (
          <>
            <div className="min-controls">
              <input
                className="min-search"
                type="text"
                placeholder="Buscar ministerio, ministro, tema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="min-sort-group">
                <span className="min-sort-label">Ordenar:</span>
                {(["budget", "employees", "sources", "name"] as const).map((s) => (
                  <button
                    key={s}
                    className={`min-sort-btn ${sortBy === s ? "min-sort-btn-active" : ""}`}
                    onClick={() => setSortBy(s)}
                  >
                    {{ budget: "Presupuesto", employees: "Empleados", sources: "Fuentes", name: "Nombre" }[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-grid">
              {filtered.map((m) => (
                <div
                  key={m.slug}
                  className={`min-card ${selectedSlug === m.slug ? "min-card-selected" : ""}`}
                  style={{ borderLeftColor: m.colorAccent }}
                  onClick={() => setSelectedSlug(selectedSlug === m.slug ? null : m.slug)}
                >
                  <div className="min-card-head">
                    <div>
                      <span className="min-card-acronym" style={{ color: m.colorAccent }}>{m.acronym}</span>
                      <h3 className="min-card-name">{m.shortName}</h3>
                    </div>
                    {m.vicePresident && (
                      <span className="min-vp-badge">VP{m.vpOrder}</span>
                    )}
                  </div>
                  <p className="min-card-minister">
                    {m.ministerName}
                    <span className="min-card-party">{m.ministerParty}</span>
                  </p>
                  <div className="min-card-stats">
                    <span>{formatM(m.budgetTotalM)}</span>
                    <span>{m.employeeCount.toLocaleString("es-ES")} emp.</span>
                    <span>{m.organismoCount} org.</span>
                    <span style={{ color: "var(--verde)" }}>{m.activeSourceCount}/{m.sourceCount} fuentes</span>
                  </div>
                  <div className="min-card-bar">
                    <div
                      className="min-card-bar-fill"
                      style={{
                        width: `${Math.min(100, (m.budgetTotalM / (data.grid[0]?.budgetTotalM || 1)) * 100)}%`,
                        background: m.colorAccent,
                      }}
                    />
                  </div>
                  <div className="min-card-tags">
                    {m.keyAreas.slice(0, 3).map((a) => (
                      <span key={a} className="micro-tag" style={{ background: `${m.colorAccent}14`, color: m.colorAccent }}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selectedDetail && (
              <div className="min-detail-panel">
                <div className="min-detail-head" style={{ borderLeftColor: selectedDetail.colorAccent }}>
                  <div>
                    <span className="eyebrow" style={{ color: selectedDetail.colorAccent }}>{selectedDetail.acronym}</span>
                    <h2 style={{ fontSize: "1.1rem", margin: "4px 0" }}>{selectedDetail.name}</h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{selectedDetail.description}</p>
                  </div>
                  <button className="min-detail-close" onClick={() => setSelectedSlug(null)}>&times;</button>
                </div>

                {/* Minister + VP */}
                <div className="min-detail-section">
                  <h4>Titular</h4>
                  <div className="min-detail-minister">
                    <strong>{selectedDetail.minister.name}</strong>
                    <span>{selectedDetail.minister.role}</span>
                    <span>{selectedDetail.minister.party ?? "independiente"} &middot; Desde {selectedDetail.minister.since}</span>
                  </div>
                </div>

                {/* Budget */}
                <div className="min-detail-section">
                  <h4>Presupuesto PGE 2026</h4>
                  <div className="min-detail-budget-grid">
                    <div><span>Total</span><strong>{formatM(selectedDetail.budget.totalM)}</strong></div>
                    <div><span>Personal</span><strong>{formatM(selectedDetail.budget.staffM)}</strong></div>
                    <div><span>Inversiones</span><strong>{formatM(selectedDetail.budget.capitalM)}</strong></div>
                    <div>
                      <span>Variaci{"ó"}n</span>
                      <strong style={{ color: selectedDetail.budget.changePct >= 0 ? "var(--verde)" : "var(--rojo)" }}>
                        {selectedDetail.budget.changePct >= 0 ? "+" : ""}{selectedDetail.budget.changePct}%
                      </strong>
                    </div>
                  </div>
                  {selectedDetail.budget.keyItems.map((ki: any, i: number) => (
                    <div key={i} className="min-detail-budget-item">
                      <span>{ki.label}</span>
                      <span>{formatM(ki.amountM)}</span>
                    </div>
                  ))}
                </div>

                {/* Organismos */}
                <div className="min-detail-section">
                  <h4>Organismos ({selectedDetail.organismos.length})</h4>
                  <div className="min-detail-org-list">
                    {selectedDetail.organismos.map((o: any) => (
                      <div key={o.slug} className="min-detail-org">
                        <div className="min-detail-org-head">
                          <strong>{o.name}</strong>
                          <span className="micro-tag">{o.type.replace(/-/g, " ")}</span>
                        </div>
                        <p>{o.description}</p>
                        {(o.employeeCount || o.budgetM) && (
                          <div className="min-detail-org-stats">
                            {o.employeeCount && <span>{o.employeeCount.toLocaleString("es-ES")} emp.</span>}
                            {o.budgetM && <span>{formatM(o.budgetM)}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Sources */}
                <div className="min-detail-section">
                  <h4>Fuentes oficiales ({selectedDetail.officialSources.length})</h4>
                  <div className="min-detail-source-list">
                    {selectedDetail.officialSources.map((s: any) => (
                      <a
                        key={s.id}
                        className="min-detail-source"
                        href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="min-detail-source-head">
                          <strong>{s.label}</strong>
                          <span className={`min-source-status min-source-status-${s.status}`}>
                            {s.status}
                          </span>
                        </div>
                        <span className="min-detail-source-type">{s.type.replace(/-/g, " ")}</span>
                        <p>{s.description}</p>
                        {s.dataFormats && (
                          <div className="min-detail-source-formats">
                            {s.dataFormats.map((f: string) => (
                              <span key={f} className="micro-tag">{f}</span>
                            ))}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="min-detail-section">
                  <h4>M{"é"}tricas clave</h4>
                  <div className="min-detail-metrics">
                    {selectedDetail.metrics.map((mt: any) => {
                      const trendIcon = mt.trend === "up" ? "\u2191" : mt.trend === "down" ? "\u2193" : "\u2192";
                      const trendColor = mt.trend === "up" ? "var(--verde)" : mt.trend === "down" ? "var(--rojo)" : "var(--ink-muted)";
                      return (
                        <div key={mt.id} className="min-detail-metric-card">
                          <div className="min-detail-metric-head">
                            <span>{mt.label}</span>
                            <span style={{ color: trendColor, fontSize: "1.1rem" }}>{trendIcon}</span>
                          </div>
                          <strong className="min-detail-metric-value">
                            {typeof mt.value === "number" ? mt.value.toLocaleString("es-ES") : mt.value} {mt.unit}
                          </strong>
                          {mt.target && <span className="min-detail-metric-target">Objetivo: {mt.target.toLocaleString("es-ES")} {mt.unit}</span>}
                          <p>{mt.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="min-detail-section">
                  <h4>Actividad reciente</h4>
                  <div className="min-detail-activity-list">
                    {selectedDetail.recentActivity.slice(0, 6).map((a: any) => {
                      const impactColor = a.impact === "alto" ? "var(--rojo)" : a.impact === "medio" ? "var(--oro)" : "var(--ink-muted)";
                      return (
                        <div key={a.id} className="min-detail-activity">
                          <div className="min-detail-activity-head">
                            <span className="min-detail-activity-date">{a.date}</span>
                            <span className="micro-tag" style={{ background: `${impactColor}14`, color: impactColor }}>{a.type}</span>
                          </div>
                          <strong>{a.title}</strong>
                          <p>{a.summary}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════ PRESUPUESTOS VIEW ══════════════ */}
        {view === "presupuestos" && (
          <>
            <SectionHeading
              eyebrow="PGE 2026"
              title={`Presupuesto total: ${formatM(budget.totalM)}`}
              description={`Personal: ${formatM(budget.personnelM)} · Inversión: ${formatM(budget.investmentM)}`}
            />
            <div className="min-budget-ranking">
              {[...data.grid].sort((a, b) => b.budgetTotalM - a.budgetTotalM).map((m, i) => {
                const pct = (m.budgetTotalM / budget.totalM) * 100;
                const changePctColor = m.budgetChangePct >= 0 ? "var(--verde)" : "var(--rojo)";
                return (
                  <div key={m.slug} className="min-budget-row" onClick={() => { setView("grid"); setSelectedSlug(m.slug); }}>
                    <span className="min-budget-rank">{i + 1}</span>
                    <span className="min-budget-name" style={{ color: m.colorAccent }}>{m.shortName}</span>
                    <div className="min-budget-bar-wrap">
                      <div className="min-budget-bar-fill" style={{ width: `${Math.min(100, pct * 2)}%`, background: m.colorAccent }} />
                    </div>
                    <span className="min-budget-amount">{formatM(m.budgetTotalM)}</span>
                    <span className="min-budget-pct">{m.budgetPctOfPGE}%</span>
                    <span className="min-budget-change" style={{ color: changePctColor }}>
                      {m.budgetChangePct >= 0 ? "+" : ""}{m.budgetChangePct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════ FUENTES VIEW ══════════════ */}
        {view === "fuentes" && (
          <>
            <SectionHeading
              eyebrow="Inventario de fuentes"
              title={`${summary.totalActiveSources} fuentes oficiales activas`}
              description="Estado de conectividad con portales de datos abiertos, APIs, RSS y transparencia de cada ministerio"
            />
            <div className="min-sources-grid">
              {data.grid.map((m) => {
                const det = data.detail[m.slug];
                if (!det) return null;
                return (
                  <div key={m.slug} className="min-source-card" style={{ borderLeftColor: m.colorAccent }}>
                    <div className="min-source-card-head">
                      <strong style={{ color: m.colorAccent }}>{m.shortName}</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                        {m.activeSourceCount}/{m.sourceCount} activas
                      </span>
                    </div>
                    {det.officialSources.map((s: any) => (
                      <a
                        key={s.id}
                        className="min-source-item"
                        href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className={`min-source-dot min-source-dot-${s.status}`} />
                        <span className="min-source-item-label">{s.label}</span>
                        <span className="min-source-item-type">{s.type.replace(/-/g, " ")}</span>
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════ METRICAS VIEW ══════════════ */}
        {view === "metricas" && (
          <>
            <SectionHeading
              eyebrow="Indicadores de gestión"
              title="Métricas clave por ministerio"
              description="Indicadores de rendimiento extraídos de las fuentes oficiales de cada ministerio"
            />
            <div className="min-metrics-list">
              {data.grid.map((m) => {
                const det = data.detail[m.slug];
                if (!det || !det.metrics?.length) return null;
                return (
                  <div key={m.slug} className="min-metrics-ministry">
                    <h3 className="min-metrics-ministry-name" style={{ color: m.colorAccent }}>
                      {m.shortName}
                    </h3>
                    <div className="min-metrics-cards">
                      {det.metrics.map((mt: any) => {
                        const trendIcon = mt.trend === "up" ? "\u2191" : mt.trend === "down" ? "\u2193" : "\u2192";
                        const trendColor = mt.trend === "up" ? "var(--verde)" : mt.trend === "down" ? "var(--rojo)" : "var(--ink-muted)";
                        return (
                          <div key={mt.id} className="min-metric-compact">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{mt.label}</span>
                              <span style={{ color: trendColor }}>{trendIcon}</span>
                            </div>
                            <strong style={{ fontSize: "1.1rem", fontFamily: "var(--font-mono)" }}>
                              {typeof mt.value === "number" ? mt.value.toLocaleString("es-ES") : mt.value} {mt.unit}
                            </strong>
                            {mt.target && (
                              <div style={{ position: "relative", height: 4, background: "var(--surface)", borderRadius: 2, marginTop: 4 }}>
                                <div style={{
                                  height: "100%",
                                  width: `${Math.min(100, (mt.value / mt.target) * 100)}%`,
                                  background: mt.value >= mt.target ? "var(--verde)" : "var(--oro)",
                                  borderRadius: 2,
                                }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════ ORGANIGRAMA VIEW ══════════════ */}
        {view === "organigrama" && (
          <>
            <SectionHeading
              eyebrow="Estructura del Gobierno"
              title="Organigrama ministerial"
              description={`${summary.partiesInGovernment?.map((p: any) => `${p.party}: ${p.count}`).join(" · ") ?? ""}`}
            />
            <div className="min-organi-container">
              {/* President node */}
              <div className="min-organi-president">
                <strong>Presidente del Gobierno</strong>
                <span>Pedro S{"á"}nchez P{"é"}rez-Castej{"ó"}n</span>
                <span className="micro-tag" style={{ background: "#E3061314", color: "#E30613" }}>PSOE</span>
              </div>

              {/* VP row */}
              <div className="min-organi-vp-row">
                {data.grid.filter((m) => m.vicePresident).sort((a, b) => (a.vpOrder ?? 9) - (b.vpOrder ?? 9)).map((m) => (
                  <div
                    key={m.slug}
                    className="min-organi-vp-card"
                    style={{ borderColor: m.colorAccent }}
                    onClick={() => { setView("grid"); setSelectedSlug(m.slug); }}
                  >
                    <span className="min-organi-vp-label">Vicepresidencia {m.vpOrder}{"ª"}</span>
                    <strong>{m.ministerName}</strong>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>{m.shortName}</span>
                    <span className="micro-tag" style={{ background: `${m.colorAccent}14`, color: m.colorAccent }}>{m.ministerParty}</span>
                  </div>
                ))}
              </div>

              {/* Ministry grid */}
              <div className="min-organi-grid">
                {data.grid.filter((m) => !m.vicePresident || m.slug !== "presidencia-gobierno").map((m) => (
                  <div
                    key={m.slug}
                    className="min-organi-node"
                    style={{ borderLeftColor: m.colorAccent }}
                    onClick={() => { setView("grid"); setSelectedSlug(m.slug); }}
                  >
                    <span className="min-organi-node-acronym" style={{ color: m.colorAccent }}>{m.acronym}</span>
                    <strong className="min-organi-node-name">{m.shortName}</strong>
                    <span className="min-organi-node-minister">{m.ministerName}</span>
                    <div className="min-organi-node-stats">
                      <span>{m.organismoCount} org.</span>
                      <span>{m.employeeCount.toLocaleString("es-ES")} emp.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <SiteFooter sources="La Moncloa, BOE, PGE 2026, datos.gob.es, portales ministeriales, IGAE" />
    </main>
  );
}
