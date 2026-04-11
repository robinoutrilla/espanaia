"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Public Signal Engine — Motor de deteccion de senales precursoras.
   Detecta senales debiles antes de que se conviertan en regulaciones,
   presupuestos, licitaciones, crisis o cambios politicos relevantes.
   ═══════════════════════════════════════════════════════════════════════════ */

interface SignalSource { type: string; name: string; url?: string; date: string; reliability: number }

interface Signal {
  id: string; title: string; description: string; strength: "debil" | "media" | "fuerte";
  status: string; confidence: number; sector: string; territory: string;
  detectedDate: string; timeHorizon: string; estimatedDate?: string;
  sources: SignalSource[]; correlatedSignals: string[]; tags: string[];
  methodology: string; historicalAccuracy?: number;
}

interface SectorProfile {
  id: string; label: string; description: string; activeSignals: number; strongSignals: number;
  avgConfidence: number; topRisk: string; recentTrend: string; signalVelocity: number;
}

interface AccuracyRecord { month: string; predicted: number; confirmed: number; accuracy: number }
interface SignalCorrelation { signalA: string; signalB: string; correlationStrength: number; explanation: string }
interface AlertConfig { id: string; label: string; sectors: string[]; territories: string[]; minStrength: string; minConfidence: number; active: boolean }
interface ConfidenceFactor { label: string; weight: number; score: number }
interface ConfidenceBreakdown { signalId: string; factors: ConfidenceFactor[]; totalScore: number; methodology: string }

interface PSEData {
  signals: Signal[]; sectors: SectorProfile[]; accuracyHistory: AccuracyRecord[];
  correlations: SignalCorrelation[]; alertConfigs: AlertConfig[];
  confidenceBreakdowns: ConfidenceBreakdown[];
  stats: { totalSignals: number; activeSignals: number; strongSignals: number; avgConfidence: number; historicalAccuracy: number; sectorsMonitored: number };
}

type PSEView = "feed" | "sectores" | "territorios" | "precision" | "correlaciones" | "alertas" | "metodologia" | "detalle";

const strengthColor: Record<string, string> = { fuerte: "var(--rojo)", media: "var(--oro)", debil: "var(--ink-muted)" };
const strengthBg: Record<string, string> = { fuerte: "#fdecea", media: "#fef9e7", debil: "#f4f4f4" };
const trendIcon: Record<string, string> = { creciente: "\u2191", estable: "\u2192", decreciente: "\u2193" };
const trendColor: Record<string, string> = { creciente: "var(--rojo)", estable: "var(--oro)", decreciente: "var(--verde)" };

function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }

function confidenceColor(c: number) { return c >= 75 ? "var(--verde)" : c >= 50 ? "var(--oro)" : "var(--rojo)"; }

export default function SignalEnginePage() {
  const [data, setData] = useState<PSEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PSEView>("feed");
  const [filterSector, setFilterSector] = useState("");
  const [filterTerritory, setFilterTerritory] = useState("");
  const [filterStrength, setFilterStrength] = useState("");
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [sortByConfidence, setSortByConfidence] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("pse-data-v1");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/signal-engine")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("pse-data-v1", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signals = data?.signals ?? [];
  const sectors = data?.sectors ?? [];
  const accuracy = data?.accuracyHistory ?? [];
  const correlations = data?.correlations ?? [];
  const alertConfigs = data?.alertConfigs ?? [];
  const breakdowns = data?.confidenceBreakdowns ?? [];
  const stats = data?.stats ?? { totalSignals: 0, activeSignals: 0, strongSignals: 0, avgConfidence: 0, historicalAccuracy: 0, sectorsMonitored: 0 };

  const allSectors = [...new Set(signals.map((s) => s.sector))];
  const allTerritories = [...new Set(signals.map((s) => s.territory))];

  const filtered = useMemo(() => {
    let result = signals.filter((s) => s.status === "activa");
    if (filterSector) result = result.filter((s) => s.sector === filterSector);
    if (filterTerritory) result = result.filter((s) => s.territory === filterTerritory);
    if (filterStrength) result = result.filter((s) => s.strength === filterStrength);
    if (sortByConfidence) result = [...result].sort((a, b) => b.confidence - a.confidence);
    return result;
  }, [signals, filterSector, filterTerritory, filterStrength, sortByConfidence]);

  const getSignalTitle = (id: string) => signals.find((s) => s.id === id)?.title ?? id;

  const selectedBreakdown = useMemo(() => {
    if (!selectedSignal) return null;
    return breakdowns.find((b) => b.signalId === selectedSignal) ?? null;
  }, [breakdowns, selectedSignal]);

  const handleExport = () => {
    const lines = [
      "PUBLIC SIGNAL ENGINE - INFORME DE SENALES",
      `Generado: ${new Date().toLocaleDateString("es-ES")}`,
      `Senales activas: ${stats.activeSignals}`,
      `Precision historica: ${stats.historicalAccuracy}%`,
      "",
      "SENALES ACTIVAS:",
      ...filtered.map((s) => `- [${s.strength.toUpperCase()}] ${s.title} (confianza: ${s.confidence}%, horizonte: ${s.timeHorizon})`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "signal-engine-informe.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const viewLabels: Record<PSEView, string> = {
    feed: "Feed", sectores: "Sectores", territorios: "Territorios", precision: "Precision",
    correlaciones: "Correlaciones", alertas: "Alertas", metodologia: "Metodologia", detalle: "Detalle",
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="signal-engine" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">PUBLIC SIGNAL ENGINE</span>
        <h1>Detecta senales antes de que se conviertan en realidad</h1>
        <p className="hero-subtitle">
          Motor de deteccion temprana: {stats.activeSignals} senales activas, {stats.strongSignals} fuertes, {stats.historicalAccuracy}% de precision historica.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalSignals}</span><span className="kpi-label">Total senales</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--rojo)" }}>{stats.strongSignals}</span><span className="kpi-label">Senales fuertes</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.avgConfidence}%</span><span className="kpi-label">Confianza media</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--verde)" }}>{stats.historicalAccuracy}%</span><span className="kpi-label">Precision historica</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.sectorsMonitored}</span><span className="kpi-label">Sectores</span></div>
        </div>
      </section>

      {/* Tabs */}
      <div className="pse-view-bar" style={{ display: "flex", gap: 4, padding: "0 24px 16px", flexWrap: "wrap" }}>
        {(Object.keys(viewLabels) as PSEView[]).map((v) => (
          <button key={v} className={`pse-tab ${view === v ? "pse-tab-active" : ""}`}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: view === v ? 700 : 400, background: view === v ? "var(--azul)" : "var(--surface)", color: view === v ? "#fff" : "var(--ink)", fontSize: 13, transition: "all .15s" }}
            onClick={() => setView(v)}>
            {viewLabels[v]}
          </button>
        ))}
        <button style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", background: "var(--surface)", color: "var(--ink)", fontSize: 13, marginLeft: "auto" }}
          onClick={handleExport}>
          Exportar
        </button>
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ SIGNAL FEED ═══ */}
          {view === "feed" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Feed de senales" title="Alertas tempranas en tiempo real" description="Senales precursoras detectadas antes de que se materialicen en el BOE." />
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)" }}>
                  <option value="">Todos los sectores</option>
                  {allSectors.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterTerritory} onChange={(e) => setFilterTerritory(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)" }}>
                  <option value="">Todos los territorios</option>
                  {allTerritories.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["fuerte", "media", "debil"] as const).map((str) => (
                    <button key={str} onClick={() => setFilterStrength(filterStrength === str ? "" : str)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${strengthColor[str]}`, cursor: "pointer", fontWeight: filterStrength === str ? 700 : 400, background: filterStrength === str ? strengthColor[str] : "transparent", color: filterStrength === str ? "#fff" : strengthColor[str], fontSize: 12 }}>
                      {str}
                    </button>
                  ))}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={sortByConfidence} onChange={() => setSortByConfidence(!sortByConfidence)} />
                  Ordenar por confianza
                </label>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((s) => (
                  <div key={s.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)", borderLeft: `4px solid ${strengthColor[s.strength]}`, cursor: "pointer" }}
                    onClick={() => setExpandedSignal(expandedSignal === s.id ? null : s.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{s.title}</h3>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: strengthBg[s.strength], color: strengthColor[s.strength] }}>{s.strength}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: "#eef", color: confidenceColor(s.confidence) }}>{s.confidence}%</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 10px", lineHeight: 1.5 }}>{s.description}</p>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-muted, #999)", marginBottom: 8, flexWrap: "wrap" }}>
                      <span>Sector: <strong style={{ color: "var(--ink)" }}>{s.sector}</strong></span>
                      <span>Territorio: <strong style={{ color: "var(--ink)" }}>{s.territory}</strong></span>
                      <span>Horizonte: <strong style={{ color: "var(--azul)" }}>{s.timeHorizon}</strong></span>
                      <span>Detectada: {formatDate(s.detectedDate)}</span>
                      {s.estimatedDate && <span>Estimada: <strong style={{ color: "var(--rojo)" }}>{formatDate(s.estimatedDate)}</strong></span>}
                    </div>
                    {/* Confidence bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--ink-muted, #999)", minWidth: 60 }}>Confianza</span>
                      <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${s.confidence}%`, height: "100%", background: confidenceColor(s.confidence), borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: confidenceColor(s.confidence), minWidth: 36 }}>{s.confidence}%</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {s.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#f0f0ff", color: "var(--azul)" }}>{t}</span>)}
                    </div>
                    {s.historicalAccuracy != null && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-muted, #999)" }}>
                        Precision historica para senales similares: <strong style={{ color: confidenceColor(s.historicalAccuracy) }}>{s.historicalAccuracy}%</strong>
                      </div>
                    )}

                    {/* Expanded */}
                    {expandedSignal === s.id && (
                      <div style={{ borderTop: "1px solid var(--border, #eee)", paddingTop: 12, marginTop: 12 }}>
                        {/* Sources */}
                        <div style={{ marginBottom: 12 }}>
                          <strong style={{ fontSize: 13 }}>Fuentes ({s.sources.length}):</strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {s.sources.map((src, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8f8f8", borderRadius: 6, fontSize: 12 }}>
                                <div>
                                  <span style={{ fontWeight: 600 }}>{src.name}</span>
                                  <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#eef", color: "var(--azul)" }}>{src.type}</span>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <span style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>{formatDate(src.date)}</span>
                                  <span style={{ fontWeight: 600, color: confidenceColor(src.reliability) }}>Fiabilidad: {src.reliability}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Methodology */}
                        <div style={{ padding: "10px 14px", background: "#f0f0ff", borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
                          <strong style={{ color: "var(--azul)" }}>Metodologia:</strong> {s.methodology}
                        </div>
                        {/* Correlated signals */}
                        {s.correlatedSignals.length > 0 && (
                          <div>
                            <strong style={{ fontSize: 13 }}>Senales correlacionadas:</strong>
                            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                              {s.correlatedSignals.map((cid) => (
                                <span key={cid} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: "#fef9e7", color: "var(--oro)", fontWeight: 500, cursor: "pointer" }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedSignal(cid); setView("detalle"); }}>
                                  {getSignalTitle(cid)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ SECTORES ═══ */}
          {view === "sectores" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Filtro por sector" title="Senales por sector" description="Cada sector tiene su propio perfil de riesgo y velocidad de senales." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {sectors.map((sec) => (
                  <div key={sec.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer" }}
                    onClick={() => { setFilterSector(sec.id); setView("feed"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{sec.label}</h3>
                      <span style={{ color: trendColor[sec.recentTrend], fontWeight: 700, fontSize: 14 }}>
                        {trendIcon[sec.recentTrend]} {sec.recentTrend}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ink-muted, #666)", margin: "0 0 12px" }}>{sec.description}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--azul)" }}>{sec.activeSignals}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-muted, #999)" }}>Activas</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--rojo)" }}>{sec.strongSignals}</div>
                        <div style={{ fontSize: 10, color: "var(--ink-muted, #999)" }}>Fuertes</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 8, background: "#f8f8f8", borderRadius: 6 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: confidenceColor(sec.avgConfidence) }}>{sec.avgConfidence}%</div>
                        <div style={{ fontSize: 10, color: "var(--ink-muted, #999)" }}>Confianza</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, padding: "6px 10px", background: "#fdecea", borderRadius: 6, marginBottom: 8 }}>
                      <strong style={{ color: "var(--rojo)" }}>Top riesgo:</strong> {sec.topRisk}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>
                      Velocidad: {sec.signalVelocity} senales/mes
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ TERRITORIOS ═══ */}
          {view === "territorios" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Filtro territorial" title="Senales por territorio" description="Filtra senales por ambito geografico." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {allTerritories.map((terr) => {
                  const terrSignals = signals.filter((s) => s.territory === terr && s.status === "activa");
                  const strong = terrSignals.filter((s) => s.strength === "fuerte").length;
                  const avgConf = terrSignals.length > 0 ? Math.round(terrSignals.reduce((sum, s) => sum + s.confidence, 0) / terrSignals.length) : 0;
                  return (
                    <div key={terr} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer" }}
                      onClick={() => { setFilterTerritory(terr); setView("feed"); }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>{terr}</h3>
                      <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                        <div><span style={{ fontWeight: 700, color: "var(--azul)" }}>{terrSignals.length}</span> activas</div>
                        <div><span style={{ fontWeight: 700, color: "var(--rojo)" }}>{strong}</span> fuertes</div>
                        <div>Confianza: <span style={{ fontWeight: 700, color: confidenceColor(avgConf) }}>{avgConf}%</span></div>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                        {[...new Set(terrSignals.map((s) => s.sector))].map((sec) => (
                          <span key={sec} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#eef", color: "var(--azul)" }}>{sec}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ PRECISION ═══ */}
          {view === "precision" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Historial de precision" title="Cuanto acertamos" description="Registro mensual de predicciones vs. confirmaciones. Precision media: {stats.historicalAccuracy}%." />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--azul)", color: "#fff" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Mes</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Predichas</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Confirmadas</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Precision</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Barra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accuracy.map((a) => (
                      <tr key={a.month} style={{ borderBottom: "1px solid var(--border, #eee)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>{a.month}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>{a.predicted}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>{a.confirmed}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: confidenceColor(a.accuracy) }}>{a.accuracy}%</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden", minWidth: 120 }}>
                            <div style={{ width: `${a.accuracy}%`, height: "100%", background: confidenceColor(a.accuracy), borderRadius: 4 }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center" }}>
                {accuracy.map((a) => (
                  <div key={a.month} style={{ textAlign: "center" }}>
                    <div style={{ height: 100, width: 36, background: "#eee", borderRadius: 4, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: `${a.accuracy}%`, background: confidenceColor(a.accuracy), borderRadius: "0 0 4px 4px" }} />
                    </div>
                    <div style={{ fontSize: 10, marginTop: 4, color: "var(--ink-muted, #999)" }}>{a.month.slice(5)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: confidenceColor(a.accuracy) }}>{a.accuracy}%</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ CORRELACIONES ═══ */}
          {view === "correlaciones" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Mapa de correlaciones" title="Senales conectadas" description="Relaciones entre senales que se refuerzan o condicionan mutuamente." />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {correlations.sort((a, b) => b.correlationStrength - a.correlationStrength).map((c, i) => {
                  const barColor = c.correlationStrength >= 0.7 ? "var(--rojo)" : c.correlationStrength >= 0.5 ? "var(--oro)" : "var(--azul)";
                  return (
                    <div key={i} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, padding: "4px 10px", background: "#f0f0ff", borderRadius: 6, cursor: "pointer" }}
                            onClick={() => { setSelectedSignal(c.signalA); setView("detalle"); }}>
                            {getSignalTitle(c.signalA)}
                          </span>
                          <span style={{ fontSize: 16, color: barColor }}>&harr;</span>
                          <span style={{ fontSize: 13, fontWeight: 600, padding: "4px 10px", background: "#f0f0ff", borderRadius: 6, cursor: "pointer" }}
                            onClick={() => { setSelectedSignal(c.signalB); setView("detalle"); }}>
                            {getSignalTitle(c.signalB)}
                          </span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: barColor }}>
                          {(c.correlationStrength * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--ink-muted, #666)", margin: "0 0 8px" }}>{c.explanation}</p>
                      <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${c.correlationStrength * 100}%`, height: "100%", background: barColor, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ ALERTAS ═══ */}
          {view === "alertas" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Configuracion de alertas" title="Tus alertas personalizadas" description="Define que senales quieres recibir: sector, territorio, fuerza minima, confianza." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {alertConfigs.map((ac) => (
                  <div key={ac.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: `2px solid ${ac.active ? "var(--verde)" : "var(--border, #e5e5e5)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15 }}>{ac.label}</h3>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: ac.active ? "#eafde9" : "#f4f4f4", color: ac.active ? "var(--verde)" : "var(--ink-muted, #999)" }}>
                        {ac.active ? "ACTIVA" : "INACTIVA"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
                      <div><strong>Sectores:</strong> {ac.sectors.join(", ")}</div>
                      <div><strong>Territorios:</strong> {ac.territories.join(", ")}</div>
                      <div><strong>Fuerza minima:</strong> <span style={{ color: strengthColor[ac.minStrength] }}>{ac.minStrength}</span></div>
                      <div><strong>Confianza minima:</strong> {ac.minConfidence}%</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>
                        Senales que coinciden: <strong style={{ color: "var(--azul)" }}>
                          {signals.filter((s) => {
                            if (!ac.sectors.includes(s.sector as never)) return false;
                            if (!ac.territories.some((t) => s.territory === t || t === "Nacional")) return false;
                            const strengthOrder: Record<string, number> = { debil: 1, media: 2, fuerte: 3 };
                            if ((strengthOrder[s.strength] ?? 0) < (strengthOrder[ac.minStrength] ?? 0)) return false;
                            if (s.confidence < ac.minConfidence) return false;
                            return true;
                          }).length}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
                {/* Add new alert placeholder */}
                <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "2px dashed var(--border, #e5e5e5)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, cursor: "pointer" }}>
                  <span style={{ fontSize: 14, color: "var(--ink-muted, #999)" }}>+ Nueva alerta personalizada</span>
                </div>
              </div>
            </section>
          )}

          {/* ═══ METODOLOGIA ═══ */}
          {view === "metodologia" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Metodologia" title="Como calculamos la confianza" description="Modelo bayesiano con 4 factores, calibrado con datos historicos." />
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border, #e5e5e5)", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Modelo de Confianza Bayesiano</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", lineHeight: 1.6 }}>
                    Cada senal recibe una puntuacion de confianza (0-100) basada en 4 factores ponderados:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    {[
                      { label: "Fiabilidad de fuentes", weight: 30, desc: "Media ponderada de la fiabilidad de cada fuente detectada." },
                      { label: "Convergencia de senales", weight: 25, desc: "Cuantas fuentes independientes apuntan en la misma direccion." },
                      { label: "Patron historico", weight: 25, desc: "Precision pasada para senales similares en sector y tipo." },
                      { label: "Proximidad temporal", weight: 20, desc: "Senales con horizonte mas corto tienden a ser mas fiables." },
                    ].map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "start", padding: "12px 14px", background: "#f8f8f8", borderRadius: 8 }}>
                        <div style={{ minWidth: 40, textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--azul)" }}>{f.weight}%</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{f.label}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-muted, #666)", marginTop: 2 }}>{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Example breakdowns */}
                {breakdowns.map((bd) => {
                  const sig = signals.find((s) => s.id === bd.signalId);
                  return (
                    <div key={bd.signalId} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <strong style={{ fontSize: 14 }}>{sig?.title ?? bd.signalId}</strong>
                        <span style={{ fontSize: 18, fontWeight: 800, color: confidenceColor(bd.totalScore) }}>{bd.totalScore}%</span>
                      </div>
                      {bd.factors.map((f, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12 }}>
                          <span style={{ minWidth: 140 }}>{f.label} ({f.weight}%)</span>
                          <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${f.score}%`, height: "100%", background: confidenceColor(f.score), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontWeight: 600, color: confidenceColor(f.score), minWidth: 32 }}>{f.score}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ DETALLE SENAL ═══ */}
          {view === "detalle" && (() => {
            const sig = signals.find((s) => s.id === selectedSignal);
            if (!sig) return (
              <section style={{ padding: "24px", textAlign: "center", color: "var(--ink-muted, #999)" }}>
                Selecciona una senal desde el feed o las correlaciones.
              </section>
            );
            return (
              <section style={{ padding: "0 24px 32px" }}>
                <SectionHeading eyebrow={`SENAL ${sig.id}`} title={sig.title} description={`${sig.strength} | Confianza: ${sig.confidence}% | Horizonte: ${sig.timeHorizon}`} />
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                  <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: `2px solid ${strengthColor[sig.strength]}`, marginBottom: 16 }}>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)", margin: "0 0 16px" }}>{sig.description}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div style={{ textAlign: "center", padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: confidenceColor(sig.confidence) }}>{sig.confidence}%</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Confianza</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 12, background: strengthBg[sig.strength], borderRadius: 8 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: strengthColor[sig.strength] }}>{sig.strength}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Fuerza</div>
                      </div>
                      <div style={{ textAlign: "center", padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--azul)" }}>{sig.timeHorizon}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Horizonte</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-muted, #999)", marginBottom: 16, flexWrap: "wrap" }}>
                      <span>Sector: <strong style={{ color: "var(--ink)" }}>{sig.sector}</strong></span>
                      <span>Territorio: <strong style={{ color: "var(--ink)" }}>{sig.territory}</strong></span>
                      <span>Detectada: {formatDate(sig.detectedDate)}</span>
                      {sig.estimatedDate && <span>Estimada: <strong style={{ color: "var(--rojo)" }}>{formatDate(sig.estimatedDate)}</strong></span>}
                    </div>

                    <h4 style={{ margin: "16px 0 8px", fontSize: 14 }}>Fuentes</h4>
                    {sig.sources.map((src, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f8f8f8", borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                        <span><strong>{src.name}</strong> <span style={{ color: "var(--azul)" }}>({src.type})</span></span>
                        <span style={{ color: confidenceColor(src.reliability) }}>Fiabilidad: {src.reliability}%</span>
                      </div>
                    ))}

                    <div style={{ padding: "10px 14px", background: "#f0f0ff", borderRadius: 8, marginTop: 12, fontSize: 12 }}>
                      <strong style={{ color: "var(--azul)" }}>Metodologia:</strong> {sig.methodology}
                    </div>

                    {selectedBreakdown && (
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Desglose de confianza</h4>
                        {selectedBreakdown.factors.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12 }}>
                            <span style={{ minWidth: 140 }}>{f.label} ({f.weight}%)</span>
                            <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${f.score}%`, height: "100%", background: confidenceColor(f.score), borderRadius: 3 }} />
                            </div>
                            <span style={{ fontWeight: 600, color: confidenceColor(f.score), minWidth: 32 }}>{f.score}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {sig.correlatedSignals.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Senales correlacionadas</h4>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {sig.correlatedSignals.map((cid) => (
                            <button key={cid} onClick={() => setSelectedSignal(cid)}
                              style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "#fef9e7", border: "none", color: "var(--oro)", fontWeight: 600, cursor: "pointer" }}>
                              {getSignalTitle(cid)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setView("feed")}
                    style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "var(--azul)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                    Volver al feed
                  </button>
                </div>
              </section>
            );
          })()}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
