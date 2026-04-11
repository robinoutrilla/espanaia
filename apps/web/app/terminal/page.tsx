"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

/* ═══════════════════════════════════════════════════════════════════════════
   Terminal — Bloomberg-style political intelligence for journalists & analysts
   10 unique intelligence modules no competitor offers.
   ═══════════════════════════════════════════════════════════════════════════ */

interface TrendingItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceCategory: string;
  matches: { type: string; slug: string; name: string; href: string }[];
}

interface SearchResult {
  type: "politician" | "party" | "territory" | "law" | "contract";
  slug: string;
  name: string;
  href: string;
  meta?: string;
}

interface TerminalData {
  trending: TrendingItem[];
  budgetSummary: any;
  agenda: any[];
  stats: {
    politicians: number;
    parties: number;
    territories: number;
    sources: number;
    contracts: number;
    auditReports: number;
  };
  coherenceAlerts: any[];
  territoryHealth: any[];
  contractConcentration: any[];
  euCompliance: any;
  revenueSpendingFlow: any;
  coalitionCalc: any;
  euGaps: any[];
  powerMap: any[];
  transparency: any;
  budgetAlerts: any[];
  ngeuTracker: any;
  moneyRisk: any;
  stability: any;
  votePredictions: any[];
}

type PanelKey = "feed" | "budget" | "parliament" | "coherence" | "territories" | "contracts" | "europe" | "power" | "alerts" | "entities";

const PANELS: { key: PanelKey; label: string; shortcut: string }[] = [
  { key: "feed", label: "Feed en vivo", shortcut: "F1" },
  { key: "coherence", label: "Coherencia", shortcut: "F2" },
  { key: "budget", label: "Presupuestos", shortcut: "F3" },
  { key: "territories", label: "Territorios", shortcut: "F4" },
  { key: "parliament", label: "Parlamento", shortcut: "F5" },
  { key: "contracts", label: "Contratos", shortcut: "F6" },
  { key: "europe", label: "España-UE", shortcut: "F7" },
  { key: "power", label: "Poder", shortcut: "F8" },
  { key: "alerts", label: "Alertas", shortcut: "F9" },
  { key: "entities", label: "Entidades", shortcut: "F10" },
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function sourceIcon(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("boe")) return "📜";
  if (s.includes("congreso")) return "🏛";
  if (s.includes("moncloa")) return "🏢";
  if (s.includes("europa press")) return "📡";
  if (s.includes("rtve")) return "📺";
  if (s.includes("país") || s.includes("pais")) return "📰";
  if (s.includes("mundo")) return "📰";
  if (s.includes("abc")) return "📰";
  if (s.includes("vanguardia")) return "📰";
  if (s.includes("confidencial")) return "📰";
  if (s.includes("diario")) return "📰";
  if (s.includes("público") || s.includes("publico")) return "📰";
  return "📄";
}

function categoryColor(cat: string): string {
  if (cat === "institutional") return "var(--azul)";
  if (cat === "agency") return "var(--rojo)";
  return "var(--ink-muted)";
}

function sevColor(s: string): string {
  if (s === "critical") return "var(--rojo)";
  if (s === "high") return "var(--oro-dark, #c49000)";
  return "var(--azul)";
}

function statusDot(s: string): string {
  if (s === "green") return "🟢";
  if (s === "red") return "🔴";
  return "🟡";
}

export default function TerminalPage() {
  const [data, setData] = useState<TerminalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activePanel, setActivePanel] = useState<PanelKey>("feed");
  const [clock, setClock] = useState(new Date());
  const [selectedCoalition, setSelectedCoalition] = useState<string[]>([]);
  const cmdRef = useRef<HTMLInputElement>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts: Ctrl+K + F1-F10
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        cmdRef.current?.focus();
      }
      // F1-F10 panel switching
      const fKey = e.key.match(/^F(\d+)$/);
      if (fKey) {
        const idx = parseInt(fKey[1]) - 1;
        if (idx >= 0 && idx < PANELS.length) {
          e.preventDefault();
          setActivePanel(PANELS[idx].key);
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Load data
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("terminal-data-v2");
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    fetch("/api/terminal")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("terminal-data-v2", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Search handler
  useEffect(() => {
    if (!data || query.length < 2) {
      setSearchResults([]);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((results: SearchResult[]) => setSearchResults(results.slice(0, 8)))
      .catch(() => setSearchResults([]));
  }, [query, data]);

  const trending = data?.trending ?? [];
  const institutional = trending.filter((t) => t.sourceCategory === "institutional");
  const media = trending.filter((t) => t.sourceCategory !== "institutional");
  const agenda = data?.agenda ?? [];
  const stats = data?.stats;

  // Coalition calculator
  const coalitionSeats = (data?.coalitionCalc?.parties ?? [])
    .filter((p: any) => selectedCoalition.includes(p.slug))
    .reduce((s: number, p: any) => s + p.projectedSeats, 0);
  const majorityThreshold = data?.coalitionCalc?.majority ?? 176;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <main className="page-shell terminal-page">
      <SiteHeader currentSection="terminal" />

      {/* ── Terminal header bar ── */}
      <div className="terminal-topbar">
        <div className="terminal-topbar-left">
          <span className="terminal-brand">IAÑ <strong>TERMINAL</strong></span>
          <span className="terminal-badge">v2</span>
        </div>
        <div className="terminal-topbar-center">
          <div className="terminal-cmd-wrap">
            <span className="terminal-cmd-icon">⌘K</span>
            <input
              ref={cmdRef}
              className="terminal-cmd"
              type="text"
              placeholder="Buscar político, partido, territorio, ley..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />
            {searchResults.length > 0 && (
              <div className="terminal-cmd-results">
                {searchResults.map((r) => (
                  <Link key={r.href} href={r.href} className="terminal-cmd-result" onClick={() => setQuery("")}>
                    <span className="terminal-cmd-result-type">{r.type === "politician" ? "👤" : r.type === "party" ? "🏛" : r.type === "territory" ? "📍" : "📄"}</span>
                    <span className="terminal-cmd-result-name">{r.name}</span>
                    {r.meta && <span className="terminal-cmd-result-meta">{r.meta}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="terminal-topbar-right">
          <span className="terminal-clock">{formatTime(clock)}</span>
          <span className="terminal-date">{formatDate(clock)}</span>
          <span className="terminal-live-dot" />
        </div>
      </div>

      {/* ── Ticker bar ── */}
      <div className="terminal-ticker">
        <div className="terminal-ticker-track">
          {institutional.slice(0, 10).map((item, i) => (
            <span key={i} className="terminal-ticker-item">
              <strong style={{ color: categoryColor(item.sourceCategory) }}>{item.source}</strong>
              {" "}{item.title.substring(0, 80)}{item.title.length > 80 ? "…" : ""}
              <span className="terminal-ticker-time">{timeAgo(item.pubDate)}</span>
            </span>
          ))}
          {media.slice(0, 10).map((item, i) => (
            <span key={`m-${i}`} className="terminal-ticker-item">
              <strong>{item.source}</strong>
              {" "}{item.title.substring(0, 80)}{item.title.length > 80 ? "…" : ""}
              <span className="terminal-ticker-time">{timeAgo(item.pubDate)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Panel navigation with F-key shortcuts ── */}
      <div className="terminal-panels-nav">
        {PANELS.map((panel) => (
          <button
            key={panel.key}
            className={`terminal-panel-tab ${activePanel === panel.key ? "terminal-panel-tab-active" : ""}`}
            onClick={() => setActivePanel(panel.key)}
            title={panel.shortcut}
          >
            <span className="terminal-tab-key">{panel.shortcut}</span>
            {panel.label}
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="terminal-grid">
        {loading && !data ? (
          <div className="terminal-loading">
            <span className="research-chat-status-spinner" />
            Conectando con fuentes oficiales...
          </div>
        ) : (
          <>
            {/* ── Left: Main panel ── */}
            <div className="terminal-main">

              {/* ═══ F1: FEED EN VIVO ═══ */}
              {activePanel === "feed" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Feed en tiempo real</h2>
                    <span className="terminal-panel-count">{trending.length} titulares</span>
                  </div>
                  <div className="terminal-feed">
                    {trending.map((item, i) => (
                      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="terminal-feed-item">
                        <div className="terminal-feed-meta">
                          <span className="terminal-feed-source" style={{ color: categoryColor(item.sourceCategory) }}>
                            {sourceIcon(item.source)} {item.source}
                          </span>
                          <span className="terminal-feed-time">{timeAgo(item.pubDate)}</span>
                        </div>
                        <p className="terminal-feed-title">{item.title}</p>
                        {item.matches.length > 0 && (
                          <div className="terminal-feed-tags">
                            {item.matches.map((m) => (
                              <span key={m.slug} className={`terminal-tag terminal-tag-${m.type}`}>{m.name}</span>
                            ))}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ F2: COHERENCE DETECTOR ═══ */}
              {activePanel === "coherence" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Detector de Coherencia Política</h2>
                    <span className="terminal-panel-count">Voto vs discurso</span>
                  </div>
                  <p className="terminal-panel-desc">Cruce automático entre posiciones públicas, votaciones parlamentarias y disciplina de partido. Ningún competidor ofrece este análisis cruzado.</p>
                  <div className="terminal-coherence-grid">
                    {(data?.coherenceAlerts ?? []).map((alert: any, i: number) => (
                      <div key={i} className={`terminal-coherence-card terminal-coherence-${alert.severity}`}>
                        <div className="terminal-coherence-head">
                          <Link href={`/parties/${alert.partySlug}`} className="terminal-coherence-party">{alert.party}</Link>
                          <span className="terminal-coherence-sev" style={{ color: sevColor(alert.severity) }}>
                            {alert.severity === "high" ? "⚠ ALTA" : alert.severity === "medium" ? "⚡ MEDIA" : "ℹ BAJA"}
                          </span>
                        </div>
                        <div className="terminal-coherence-type">
                          {alert.type === "contradiction" ? "Contradicción" : alert.type === "abstention-dodge" ? "Evasión por abstención" : "Voto sorpresa"}
                        </div>
                        <p className="terminal-coherence-text">{alert.explanation}</p>
                        <div className="terminal-coherence-vote">
                          <span>Esperado: <strong>{alert.expected}</strong></span>
                          <span>Real: <strong style={{ color: "var(--rojo)" }}>{alert.actual}</strong></span>
                        </div>
                      </div>
                    ))}
                    {(data?.coherenceAlerts ?? []).length === 0 && (
                      <p className="terminal-empty">Sin alertas de coherencia detectadas</p>
                    )}
                  </div>

                  {/* Vote predictions sub-section */}
                  {(data?.votePredictions ?? []).length > 0 && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>Predicción de Votaciones</h2>
                        <span className="terminal-panel-count">IA predictiva</span>
                      </div>
                      <div className="terminal-predictions-grid">
                        {(data?.votePredictions ?? []).map((v: any, i: number) => (
                          <div key={i} className="terminal-prediction-card">
                            <div className="terminal-prediction-head">
                              <span className="terminal-prediction-cat">{v.category}</span>
                              <span className={`terminal-prediction-result terminal-prediction-${v.result}`}>
                                {v.result === "aprobado" ? "✓ Aprobado" : v.result === "rechazado" ? "✗ Rechazado" : "? Incierto"}
                              </span>
                            </div>
                            <div className="terminal-prediction-conf">
                              <div className="terminal-prediction-bar"><div style={{ width: `${v.confidence}%` }} /></div>
                              <span>{v.confidence}%</span>
                            </div>
                            <p className="terminal-prediction-text">{v.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ F3: BUDGET + FLOW ═══ */}
              {activePanel === "budget" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Monitor Presupuestario 2026</h2>
                    <span className="terminal-panel-count">
                      {data?.budgetSummary?.totalRevenue?.toFixed(1)} → {data?.budgetSummary?.totalSpending?.toFixed(1)} Md€
                    </span>
                  </div>

                  {/* Revenue-Spending Flow Visualization */}
                  <div className="terminal-flow-wrap">
                    <div className="terminal-flow-col">
                      <h3 className="terminal-flow-title" style={{ color: "var(--verde)" }}>Ingresos</h3>
                      {(data?.revenueSpendingFlow?.revenue ?? []).map((r: any, i: number) => (
                        <div key={i} className="terminal-flow-item terminal-flow-revenue">
                          <span className="terminal-flow-label">{r.label}</span>
                          <div className="terminal-flow-bar">
                            <div style={{ width: `${r.pctOfTotal}%`, background: "var(--verde)" }} />
                          </div>
                          <span className="terminal-flow-value">{r.amountB.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="terminal-flow-center">
                      <div className="terminal-flow-deficit">
                        <span>Déficit</span>
                        <strong style={{ color: "var(--rojo)" }}>−{data?.budgetSummary?.deficit?.toFixed(1)} Md€</strong>
                      </div>
                    </div>
                    <div className="terminal-flow-col">
                      <h3 className="terminal-flow-title" style={{ color: "var(--rojo)" }}>Gastos</h3>
                      {(data?.revenueSpendingFlow?.spending ?? []).map((s: any, i: number) => (
                        <div key={i} className="terminal-flow-item terminal-flow-spending">
                          <span className="terminal-flow-label">{s.label}</span>
                          <div className="terminal-flow-bar">
                            <div style={{ width: `${s.pctOfTotal}%`, background: "var(--rojo)" }} />
                          </div>
                          <span className="terminal-flow-value">{s.amountB.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget change table */}
                  <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                    <h2>Variación interanual</h2>
                  </div>
                  <div className="terminal-budget-grid">
                    {data?.budgetSummary?.revenue?.map((r: any, i: number) => (
                      <div key={i} className="terminal-budget-row">
                        <span className="terminal-budget-label">{r.label}</span>
                        <span className="terminal-budget-value">{r.amountB.toFixed(1)} Md€</span>
                        <span className={`terminal-budget-change ${r.changePct >= 0 ? "terminal-up" : "terminal-down"}`}>
                          {r.changePct >= 0 ? "▲" : "▼"} {Math.abs(r.changePct)}%
                        </span>
                        <div className="terminal-budget-bar"><div style={{ width: `${r.pctOfTotal}%` }} /></div>
                      </div>
                    ))}
                    <div className="terminal-budget-divider" />
                    {data?.budgetSummary?.spending?.map((s: any, i: number) => (
                      <div key={i} className="terminal-budget-row">
                        <span className="terminal-budget-label">{s.label}</span>
                        <span className="terminal-budget-value" style={{ color: "var(--rojo)" }}>{s.amountB.toFixed(1)} Md€</span>
                        <span className={`terminal-budget-change ${s.changePct >= 0 ? "terminal-up" : "terminal-down"}`}>
                          {s.changePct >= 0 ? "▲" : "▼"} {Math.abs(s.changePct)}%
                        </span>
                        <div className="terminal-budget-bar terminal-budget-bar-red"><div style={{ width: `${s.pctOfTotal}%` }} /></div>
                      </div>
                    ))}
                  </div>

                  {/* NGEU Tracker */}
                  {data?.ngeuTracker && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>NextGenEU Tracker</h2>
                        <span className="terminal-panel-count">{data.ngeuTracker.executionRate}% ejecutado</span>
                      </div>
                      <div className="terminal-ngeu-bar-wrap">
                        <div className="terminal-ngeu-bar">
                          <div style={{ width: `${data.ngeuTracker.executionRate}%` }} />
                        </div>
                        <div className="terminal-ngeu-labels">
                          <span>Desembolsado: {data.ngeuTracker.disbursed?.toFixed(1)} Md€</span>
                          <span>Total: {data.ngeuTracker.allocated?.toFixed(1)} Md€</span>
                        </div>
                      </div>
                      <div className="terminal-perte-grid">
                        {(data.ngeuTracker.perteStatus ?? []).map((p: any, i: number) => (
                          <div key={i} className="terminal-perte-item">
                            <span className="terminal-perte-name">{p.name}</span>
                            <div className="terminal-perte-bar"><div style={{ width: `${p.pct}%` }} /></div>
                            <span className="terminal-perte-pct">{p.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ F4: TERRITORY HEALTH ═══ */}
              {activePanel === "territories" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Semáforo Territorial</h2>
                    <span className="terminal-panel-count">17 CCAA + 2 ciudades</span>
                  </div>
                  <p className="terminal-panel-desc">Scoring compuesto de cada CCAA cruzando paro, PIB, pobreza y paro juvenil vs media nacional. Ningún competidor ofrece este ranking en tiempo real.</p>
                  <div className="terminal-territory-grid">
                    {(data?.territoryHealth ?? []).map((t: any, i: number) => (
                      <div key={i} className={`terminal-territory-card terminal-territory-${t.status}`}>
                        <div className="terminal-territory-head">
                          <span>{statusDot(t.status)}</span>
                          <Link href={`/territories/${t.slug}`} className="terminal-territory-name">{t.name}</Link>
                          <span className="terminal-territory-score">{t.score > 0 ? "+" : ""}{t.score}</span>
                        </div>
                        <div className="terminal-territory-metrics">
                          {(t.metrics ?? []).map((m: any, j: number) => (
                            <div key={j} className={`terminal-metric terminal-metric-${m.status}`}>
                              <span className="terminal-metric-label">{m.label}</span>
                              <span className="terminal-metric-value">{m.value}%</span>
                              <span className="terminal-metric-national">ES: {m.national}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ F5: PARLIAMENT + COALITION CALC ═══ */}
              {activePanel === "parliament" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Simulador de Coaliciones</h2>
                    <span className="terminal-panel-count">D'Hondt + modelo de dispersión</span>
                  </div>
                  <p className="terminal-panel-desc">Selecciona partidos para construir una coalición. Proyección de escaños basada en encuestas actuales con modelo D'Hondt por circunscripción.</p>

                  {/* Coalition builder */}
                  <div className="terminal-coalition-builder">
                    <div className="terminal-coalition-parties">
                      {(data?.coalitionCalc?.parties ?? []).map((p: any) => (
                        <button
                          key={p.slug}
                          className={`terminal-coalition-party ${selectedCoalition.includes(p.slug) ? "terminal-coalition-selected" : ""}`}
                          style={{ borderColor: p.color, ...(selectedCoalition.includes(p.slug) ? { background: p.color, color: "#fff" } : {}) }}
                          onClick={() => setSelectedCoalition((prev) =>
                            prev.includes(p.slug) ? prev.filter((s) => s !== p.slug) : [...prev, p.slug]
                          )}
                        >
                          <span className="terminal-coalition-acronym">{p.acronym}</span>
                          <span className="terminal-coalition-seats">{p.projectedSeats}</span>
                        </button>
                      ))}
                    </div>
                    <div className="terminal-coalition-result">
                      <div className="terminal-coalition-bar">
                        <div
                          className="terminal-coalition-fill"
                          style={{
                            width: `${Math.min(100, (coalitionSeats / (data?.coalitionCalc?.totalSeats ?? 350)) * 100)}%`,
                            background: coalitionSeats >= majorityThreshold ? "var(--verde)" : "var(--rojo)",
                          }}
                        />
                        <div className="terminal-coalition-majority-line" style={{ left: `${(majorityThreshold / (data?.coalitionCalc?.totalSeats ?? 350)) * 100}%` }} />
                      </div>
                      <div className="terminal-coalition-info">
                        <span><strong>{coalitionSeats}</strong> / {data?.coalitionCalc?.totalSeats ?? 350} escaños</span>
                        <span className={coalitionSeats >= majorityThreshold ? "terminal-up" : "terminal-down"}>
                          {coalitionSeats >= majorityThreshold ? "✓ Mayoría absoluta" : `Faltan ${majorityThreshold - coalitionSeats} para mayoría`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seat projection table */}
                  <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                    <h2>Proyección de escaños</h2>
                  </div>
                  <div className="terminal-seats-table">
                    {(data?.coalitionCalc?.parties ?? []).map((p: any) => (
                      <div key={p.slug} className="terminal-seats-row">
                        <span className="terminal-seats-color" style={{ background: p.color }} />
                        <span className="terminal-seats-name">{p.acronym}</span>
                        <span className="terminal-seats-current">{p.currentSeats}</span>
                        <span className="terminal-seats-arrow">→</span>
                        <span className="terminal-seats-projected">{p.projectedSeats}</span>
                        <span className={`terminal-seats-delta ${p.delta >= 0 ? "terminal-up" : "terminal-down"}`}>
                          {p.delta >= 0 ? "+" : ""}{p.delta}
                        </span>
                        <span className="terminal-seats-share">{p.voteSharePct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Stability index */}
                  {data?.stability && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>Índice de Estabilidad</h2>
                        <span className="terminal-panel-count">{data.stability.score}/100</span>
                      </div>
                      <div className="terminal-stability">
                        <div className="terminal-stability-gauge">
                          <div className="terminal-stability-fill" style={{
                            width: `${data.stability.score}%`,
                            background: data.stability.score >= 60 ? "var(--verde)" : data.stability.score >= 40 ? "var(--oro)" : "var(--rojo)",
                          }} />
                        </div>
                        <span className="terminal-stability-label">{data.stability.label}</span>
                        <p className="terminal-stability-detail">
                          Coalición: {data.stability.coalitionSeats} escaños (mayoría: {data.stability.majority}). Margen: {data.stability.margin > 0 ? "+" : ""}{data.stability.margin}.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Agenda */}
                  <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                    <h2>Agenda parlamentaria</h2>
                    <span className="terminal-panel-count">{agenda.length} eventos</span>
                  </div>
                  <div className="terminal-agenda">
                    {agenda.map((ev: any, i: number) => (
                      <div key={i} className="terminal-agenda-item">
                        <div className="terminal-agenda-date">
                          <span>{ev.date}</span>
                          <span className={`terminal-agenda-status terminal-agenda-${ev.status}`}>{ev.status}</span>
                        </div>
                        <div className="terminal-agenda-body">
                          <span className="terminal-agenda-type">{ev.type}</span>
                          <strong>{ev.title}</strong>
                          {ev.institution && <span className="terminal-agenda-inst">{ev.institution}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ F6: CONTRACTS CONCENTRATION ═══ */}
              {activePanel === "contracts" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Radar de Concentración de Contratos</h2>
                    <span className="terminal-panel-count">{(data?.contractConcentration ?? []).length} adjudicatarios top</span>
                  </div>
                  <p className="terminal-panel-desc">Detección de concentración: adjudicatarios con múltiples contratos públicos. Cruzado con auditorías del Tribunal de Cuentas.</p>
                  <div className="terminal-contracts-grid">
                    {(data?.contractConcentration ?? []).map((c: any, i: number) => (
                      <div key={i} className="terminal-contract-card">
                        <div className="terminal-contract-head">
                          <strong>{c.name}</strong>
                          <span className="terminal-contract-total">{c.totalM} M€</span>
                        </div>
                        <div className="terminal-contract-count">{c.count} contrato{c.count > 1 ? "s" : ""}</div>
                        <div className="terminal-contract-list">
                          {c.contracts.map((title: string, j: number) => (
                            <span key={j} className="terminal-contract-title">{title}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit accountability */}
                  {data?.moneyRisk && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>Dinero Público en Riesgo</h2>
                        <span className="terminal-panel-count">Score: {data.moneyRisk.accountabilityScore}/100</span>
                      </div>
                      <div className="terminal-risk-kpis">
                        <div className="terminal-risk-kpi">
                          <span>Cuestionado</span>
                          <strong style={{ color: "var(--rojo)" }}>{data.moneyRisk.totalQuestioned} M€</strong>
                        </div>
                        <div className="terminal-risk-kpi">
                          <span>Hallazgos críticos</span>
                          <strong style={{ color: "var(--rojo)" }}>{data.moneyRisk.criticalFindings}</strong>
                        </div>
                        <div className="terminal-risk-kpi">
                          <span>Accountability</span>
                          <strong style={{ color: data.moneyRisk.accountabilityScore >= 60 ? "var(--verde)" : "var(--rojo)" }}>{data.moneyRisk.accountabilityScore}/100</strong>
                        </div>
                      </div>
                      <div className="terminal-risk-entities">
                        {(data.moneyRisk.worstEntities ?? []).map((e: any, i: number) => (
                          <div key={i} className="terminal-risk-entity">
                            <span className="terminal-risk-entity-name">{e.name}</span>
                            <span className="terminal-risk-entity-rating" style={{ color: e.rating === "Desfavorable" ? "var(--rojo)" : "var(--oro)" }}>{e.rating}</span>
                            <span className="terminal-risk-entity-amount">{e.questionedM} M€</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ F7: EUROPE ═══ */}
              {activePanel === "europe" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Brechas España-UE</h2>
                    <span className="terminal-panel-count">{(data?.euGaps ?? []).length} indicadores peor que UE27</span>
                  </div>
                  <p className="terminal-panel-desc">Indicadores donde España está por debajo de la media UE27, ordenados por magnitud de la brecha.</p>
                  <div className="terminal-eu-gaps">
                    {(data?.euGaps ?? []).map((g: any, i: number) => (
                      <div key={i} className="terminal-eu-gap-row">
                        <span className="terminal-eu-gap-name">{g.indicator}</span>
                        <span className="terminal-eu-gap-spain">{g.spain}{g.unit === "%" ? "%" : ""}</span>
                        <span className="terminal-eu-gap-eu27">{g.eu27}{g.unit === "%" ? "%" : ""}</span>
                        <span className="terminal-eu-gap-diff" style={{ color: "var(--rojo)" }}>
                          {g.gapPct > 0 ? "+" : ""}{g.gapPct}%
                        </span>
                        <span className="terminal-eu-gap-rank">#{g.rank}/{g.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* EU Compliance */}
                  <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                    <h2>Cumplimiento Normativo UE</h2>
                    <span className="terminal-panel-count">{(data?.euCompliance?.pendingTranspositions ?? []).length} directivas retrasadas</span>
                  </div>
                  <div className="terminal-eu-compliance">
                    {(data?.euCompliance?.pendingTranspositions ?? []).map((t: any, i: number) => (
                      <div key={i} className={`terminal-eu-directive terminal-eu-${t.status}`}>
                        <div className="terminal-eu-directive-head">
                          <span className={`terminal-eu-status terminal-eu-status-${t.status}`}>
                            {t.status === "retrasada" ? "⏰ Retrasada" : "⚠ Incumplimiento"}
                          </span>
                          <span className="terminal-eu-sector">{t.sector}</span>
                        </div>
                        <p className="terminal-eu-directive-title">{t.title}</p>
                        {t.deadline && <span className="terminal-eu-deadline">Plazo: {t.deadline}</span>}
                      </div>
                    ))}
                  </div>

                  {/* Infringement procedures */}
                  {(data?.euCompliance?.activeInfringements ?? []).length > 0 && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>Procedimientos de Infracción</h2>
                        <span className="terminal-panel-count">{(data?.euCompliance?.activeInfringements ?? []).length} activos</span>
                      </div>
                      <div className="terminal-infringements">
                        {(data?.euCompliance?.activeInfringements ?? []).map((inf: any, i: number) => (
                          <div key={i} className="terminal-infringement-card">
                            <div className="terminal-infringement-stage">{inf.stage}</div>
                            <strong>{inf.subject}</strong>
                            <p>{inf.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ F8: POWER MAP ═══ */}
              {activePanel === "power" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Mapa de Concentración de Poder</h2>
                    <span className="terminal-panel-count">Índice multinivel</span>
                  </div>
                  <p className="terminal-panel-desc">Índice compuesto: escaños en Congreso + Senado + parlamentos autonómicos + presidencias de CCAA. Revela qué partidos controlan más instituciones simultáneamente.</p>
                  <div className="terminal-power-grid">
                    {(data?.powerMap ?? []).map((p: any, i: number) => (
                      <div key={i} className="terminal-power-card">
                        <div className="terminal-power-head">
                          <Link href={`/parties/${p.partySlug}`} className="terminal-power-party">{p.party}</Link>
                          <span className="terminal-power-index">Índice: {p.powerIndex}</span>
                        </div>
                        <div className="terminal-power-seats">
                          <div className="terminal-power-seat-item">
                            <span>Congreso</span><strong>{p.congress}</strong>
                          </div>
                          <div className="terminal-power-seat-item">
                            <span>Senado</span><strong>{p.senate}</strong>
                          </div>
                          <div className="terminal-power-seat-item">
                            <span>CCAA</span><strong>{p.ccaaSeats}</strong>
                          </div>
                        </div>
                        {p.ccaaGoverning.length > 0 && (
                          <div className="terminal-power-governs">
                            <span className="terminal-power-governs-label">Gobierna en:</span>
                            <div className="terminal-power-governs-list">
                              {p.ccaaGoverning.map((name: string, j: number) => (
                                <span key={j} className="terminal-power-ccaa">{name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Transparency tracker */}
                  {data?.transparency && (
                    <>
                      <div className="terminal-panel-header" style={{ marginTop: 24 }}>
                        <h2>Transparencia Patrimonial</h2>
                        <span className="terminal-panel-count">{data.transparency.complianceRate}% declaraciones indexadas</span>
                      </div>
                      <div className="terminal-transparency">
                        <div className="terminal-transparency-kpis">
                          <div className="terminal-transparency-kpi">
                            <span>Con declaración</span>
                            <strong style={{ color: "var(--verde)" }}>{data.transparency.withDeclaration}</strong>
                          </div>
                          <div className="terminal-transparency-kpi">
                            <span>Total cargos</span>
                            <strong>{data.transparency.totalPoliticians}</strong>
                          </div>
                          <div className="terminal-transparency-kpi">
                            <span>Renta media</span>
                            <strong>{(data.transparency.averageIncome / 1000).toFixed(0)}k€</strong>
                          </div>
                        </div>
                        <div className="terminal-transparency-list">
                          {(data.transparency.highestAssets ?? []).map((h: any, i: number) => (
                            <div key={i} className="terminal-transparency-row">
                              <span className="terminal-transparency-name">{h.name}</span>
                              <span>{h.realEstate} inmuebles</span>
                              <span>{h.deposits}</span>
                              <span className="terminal-transparency-income">{(h.income / 1000).toFixed(0)}k€</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══ F9: CROSS-CUTTING ALERTS ═══ */}
              {activePanel === "alerts" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Centro de Alertas</h2>
                    <span className="terminal-panel-count">{(data?.budgetAlerts ?? []).length + (data?.coherenceAlerts ?? []).length} alertas activas</span>
                  </div>
                  <p className="terminal-panel-desc">Dashboard unificado de alertas fiscales, de coherencia, riesgo de fondos europeos y anomalías territoriales. Actualización automática cruzando todas las fuentes.</p>

                  {/* Budget alerts */}
                  <div className="terminal-alerts-section">
                    <h3>Alertas Fiscales</h3>
                    {(data?.budgetAlerts ?? []).map((a: any, i: number) => (
                      <div key={i} className={`terminal-alert-card terminal-alert-${a.severity}`}>
                        <div className="terminal-alert-card-head">
                          <span className="terminal-alert-card-sev">{a.severity === "critical" ? "🔴" : a.severity === "high" ? "🟠" : "🟡"} {a.severity.toUpperCase()}</span>
                          <span className="terminal-alert-card-value">{a.value}</span>
                        </div>
                        <strong>{a.title}</strong>
                        <p>{a.explanation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coherence alerts summary */}
                  <div className="terminal-alerts-section" style={{ marginTop: 20 }}>
                    <h3>Alertas de Coherencia</h3>
                    {(data?.coherenceAlerts ?? []).map((a: any, i: number) => (
                      <div key={i} className={`terminal-alert-card terminal-alert-${a.severity}`}>
                        <div className="terminal-alert-card-head">
                          <span className="terminal-alert-card-sev">{a.severity === "high" ? "🔴" : "🟡"} {a.party}</span>
                          <span className="terminal-alert-card-value">{a.type}</span>
                        </div>
                        <strong>{a.voteTitle}</strong>
                        <p>{a.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ F10: ENTITIES ═══ */}
              {activePanel === "entities" && (
                <div className="terminal-panel">
                  <div className="terminal-panel-header">
                    <h2>Rastreador de Entidades</h2>
                    <span className="terminal-panel-count">Usa ⌘K para buscar</span>
                  </div>
                  <div className="terminal-entities-grid">
                    <Link href="/politicians" className="terminal-entity-card">
                      <span className="terminal-entity-icon">👤</span>
                      <strong>{stats?.politicians ?? "..."}</strong>
                      <span>Políticos indexados</span>
                    </Link>
                    <Link href="/parties" className="terminal-entity-card">
                      <span className="terminal-entity-icon">🏛</span>
                      <strong>{stats?.parties ?? "..."}</strong>
                      <span>Partidos</span>
                    </Link>
                    <Link href="/territories" className="terminal-entity-card">
                      <span className="terminal-entity-icon">📍</span>
                      <strong>{stats?.territories ?? "..."}</strong>
                      <span>Territorios</span>
                    </Link>
                    <Link href="/sources" className="terminal-entity-card">
                      <span className="terminal-entity-icon">📡</span>
                      <strong>{stats?.sources ?? "..."}</strong>
                      <span>Fuentes oficiales</span>
                    </Link>
                    <Link href="/contratacion" className="terminal-entity-card">
                      <span className="terminal-entity-icon">📋</span>
                      <strong>{stats?.contracts ?? "..."}</strong>
                      <span>Contratos públicos</span>
                    </Link>
                    <Link href="/transparencia" className="terminal-entity-card">
                      <span className="terminal-entity-icon">🔍</span>
                      <strong>{stats?.auditReports ?? "..."}</strong>
                      <span>Informes de auditoría</span>
                    </Link>
                  </div>
                  <div className="terminal-entity-desc">
                    <h3>Trazabilidad a fuente oficial</h3>
                    <p>
                      Cada dato enlaza con su fuente primaria: BOE, Congreso.es, PLACSP, Tribunal de Cuentas, IGAE, EUR-Lex, INE y Eurostat.
                      Sin intermediarios, sin interpretación editorial.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <aside className="terminal-sidebar">
              {/* KPI cards */}
              <div className="terminal-kpi-grid">
                <div className="terminal-kpi">
                  <span>Fuentes</span>
                  <strong>{stats?.sources ?? "..."}</strong>
                </div>
                <div className="terminal-kpi">
                  <span>Políticos</span>
                  <strong>{stats?.politicians ?? "..."}</strong>
                </div>
                <div className="terminal-kpi">
                  <span>Contratos</span>
                  <strong>{stats?.contracts ?? "..."}</strong>
                </div>
                <div className="terminal-kpi">
                  <span>Auditorías</span>
                  <strong>{stats?.auditReports ?? "..."}</strong>
                </div>
              </div>

              {/* Stability mini */}
              {data?.stability && (
                <div className="terminal-sidebar-section">
                  <h3>Estabilidad Gobierno</h3>
                  <div className="terminal-sidebar-stability">
                    <div className="terminal-stability-mini-gauge">
                      <div style={{
                        width: `${data.stability.score}%`,
                        background: data.stability.score >= 60 ? "var(--verde)" : data.stability.score >= 40 ? "var(--oro)" : "var(--rojo)",
                      }} />
                    </div>
                    <div className="terminal-sidebar-stability-info">
                      <strong>{data.stability.score}/100</strong>
                      <span>{data.stability.label}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming agenda */}
              <div className="terminal-sidebar-section">
                <h3>Próximos eventos</h3>
                {agenda.slice(0, 5).map((ev: any, i: number) => (
                  <div key={i} className="terminal-sidebar-event">
                    <span className="terminal-sidebar-event-date">{ev.date}</span>
                    <span className="terminal-sidebar-event-title">{ev.title}</span>
                  </div>
                ))}
                {agenda.length === 0 && <p className="terminal-sidebar-empty">Sin eventos próximos</p>}
              </div>

              {/* Alert section */}
              <div className="terminal-sidebar-section">
                <h3>Alertas activas</h3>
                <div className="terminal-alert terminal-alert-red">
                  <span>⚠</span> Déficit: −{data?.budgetSummary?.deficit?.toFixed(1) ?? "..."} Md€
                </div>
                <div className="terminal-alert terminal-alert-gold">
                  <span>⚡</span> NGEU: {data?.budgetSummary?.ngeuPending?.toFixed(1) ?? "..."} Md€ pendientes
                </div>
                <div className="terminal-alert terminal-alert-blue">
                  <span>📊</span> {trending.filter((t) => t.matches.length > 0).length} noticias enlazadas
                </div>
                {data?.moneyRisk && (
                  <div className="terminal-alert terminal-alert-red">
                    <span>💰</span> {data.moneyRisk.totalQuestioned} M€ cuestionados (TCU)
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="terminal-sidebar-section">
                <h3>Accesos rápidos</h3>
                <div className="terminal-quick-links">
                  <Link href="/research">🔬 Research AI</Link>
                  <Link href="/finanzas">💰 Finanzas</Link>
                  <Link href="/votaciones">🗳 Votaciones</Link>
                  <Link href="/europa">🇪🇺 España-UE</Link>
                  <Link href="/partido-ian">🤖 Partido IAÑ</Link>
                  <Link href="/predicciones">📈 Predicciones</Link>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
