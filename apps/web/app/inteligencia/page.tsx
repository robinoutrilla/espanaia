"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

/* ═══════════════════════════════════════════════════════════════════════════
   Inteligencia Política-Territorial — Plataforma data-first para medios,
   partidos, lobbies, consultoras. Cobertura de 17 CCAA con gobierno,
   parlamento y boletín oficial. Competidores: Political Intelligence,
   Kreab, LLYC, ATREVIA. Diferencial: self-serve, visual, territorializado.
   ═══════════════════════════════════════════════════════════════════════════ */

interface TerritoryCard {
  slug: string;
  name: string;
  shortCode: string;
  kind: string;
  seat: string;
  pulseScore: number;
  strategicFocus: string;
  parliament: {
    totalSeats: number;
    president: string;
    presidentParty: string;
    coalition: string[];
    groups: { party: string; acronym: string; partySlug: string; seats: number; pct: number; isGoverning: boolean }[];
  } | null;
  indicators: {
    population: number;
    gdpPerCapita: number;
    gdpGrowthPct: number;
    unemploymentRate: number;
    youthUnemploymentRate: number;
    povertyRiskRate: number;
    averageSalary: number;
    rentAvgMonthly: number;
  } | null;
  fiscal: {
    budgetM: number;
    debtGdp: number;
    spendPerCapita: number;
    transfers: number;
    euFunds: number;
    spending: { label: string; pctOfBudget: number; amountM: number }[];
  } | null;
  health: {
    score: number;
    status: "green" | "yellow" | "red";
    metrics: { label: string; value: number; national: number; status: string }[];
  } | null;
  politicians: { name: string; party: string; role: string }[];
  contracts: number;
  events: { date: string; title: string; type: string; status: string; institution: string }[];
  sources: { type: string; title: string; url: string }[];
}

interface IntelData {
  territories: TerritoryCard[];
  governingMap: any[];
  congress: any[];
  powerMap: any[];
  national: any;
  agenda: any[];
  totalContracts: number;
  totalContractsM: number;
  totalSubsidies: number;
  totalPoliticians: number;
  totalParties: number;
  recentNews: any[];
  // 10 competitive improvements
  legislativeTracker: any[];
  regulatoryRisk: any[];
  stakeholderMap: any[];
  disciplineData: any[];
  actorProfiles: any[];
  euPipeline: any;
  ccaaCalendar: any[];
  nationalSessions: any[];
  fragility: any;
  mediaCoverage: any[];
  partyCoverage: any[];
  conflictAlerts: any[];
  coherenceAlerts: any[];
  votePredictions: any[];
  transcriptAnalysis: any;
}

type ViewMode = "map" | "compare" | "detail" | "legislative" | "regulatory" | "discipline" | "actors" | "fragility" | "transcripts";

function statusDot(s: string): string {
  if (s === "green") return "🟢";
  if (s === "red") return "🔴";
  return "🟡";
}

function formatPop(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function partyColor(slug: string): string {
  const colors: Record<string, string> = {
    pp: "#0066CC", psoe: "#E30613", vox: "#63BE21", sumar: "#E6007E",
    podemos: "#6B2D6B", erc: "#FFB81C", junts: "#00B1C7", "eh-bildu": "#A1C738",
    pnv: "#DC002E", bng: "#76B6E4", "coalicion-canaria": "#FFD700",
    "psc": "#E30613", "mas-madrid": "#00BFA5",
  };
  return colors[slug] ?? "var(--ink-muted)";
}

export default function InteligenciaPage() {
  const [data, setData] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("map");
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string>("cataluna");
  const [compareB, setCompareB] = useState<string>("madrid");
  const [sortBy, setSortBy] = useState<"pulse" | "unemployment" | "gdp" | "debt" | "population">("pulse");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("intel-data-v2");
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}
    fetch("/api/inteligencia")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("intel-data-v2", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const terrs = data?.territories ?? [];
  const selected = selectedTerritory ? terrs.find((t) => t.slug === selectedTerritory) : null;
  const terrA = terrs.find((t) => t.slug === compareA);
  const terrB = terrs.find((t) => t.slug === compareB);

  // Sorted territories
  const sorted = [...terrs].sort((a, b) => {
    if (sortBy === "pulse") return b.pulseScore - a.pulseScore;
    if (sortBy === "unemployment") return (a.indicators?.unemploymentRate ?? 0) - (b.indicators?.unemploymentRate ?? 0);
    if (sortBy === "gdp") return (b.indicators?.gdpPerCapita ?? 0) - (a.indicators?.gdpPerCapita ?? 0);
    if (sortBy === "debt") return (a.fiscal?.debtGdp ?? 0) - (b.fiscal?.debtGdp ?? 0);
    if (sortBy === "population") return (b.indicators?.population ?? 0) - (a.indicators?.population ?? 0);
    return 0;
  });

  return (
    <main className="page-shell">
      <SiteHeader currentSection="inteligencia" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <span className="eyebrow">INTELIGENCIA POLÍTICA-TERRITORIAL</span>
        <h1>Plataforma de seguimiento político por territorio</h1>
        <p className="hero-subtitle">
          Cobertura de 17 Comunidades Autónomas + 2 Ciudades Autónomas: gobierno, parlamento, boletín oficial, indicadores socioeconómicos,
          perfiles fiscales y actores políticos. Data-first, visual y autoservicio.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item">
            <span className="kpi-value">{terrs.length}</span>
            <span className="kpi-label">Territorios</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{data?.totalPoliticians ?? "..."}</span>
            <span className="kpi-label">Políticos</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{data?.totalParties ?? "..."}</span>
            <span className="kpi-label">Partidos</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{data?.totalContracts ?? "..."}</span>
            <span className="kpi-label">Contratos</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{data?.totalContractsM ? `${data.totalContractsM}M€` : "..."}</span>
            <span className="kpi-label">Vol. contratos</span>
          </div>
        </div>
      </section>

      {/* ── View selector ── */}
      <div className="intel-view-bar">
        <div className="intel-view-tabs">
          <button className={`intel-view-tab ${view === "map" ? "intel-view-tab-active" : ""}`} onClick={() => setView("map")}>
            📊 Territorios
          </button>
          <button className={`intel-view-tab ${view === "compare" ? "intel-view-tab-active" : ""}`} onClick={() => setView("compare")}>
            ⚖️ Comparador
          </button>
          <button className={`intel-view-tab ${view === "detail" ? "intel-view-tab-active" : ""}`} onClick={() => setView("detail")}>
            🔍 Ficha
          </button>
          <button className={`intel-view-tab ${view === "legislative" ? "intel-view-tab-active" : ""}`} onClick={() => setView("legislative")}>
            📜 Legislativo
          </button>
          <button className={`intel-view-tab ${view === "regulatory" ? "intel-view-tab-active" : ""}`} onClick={() => setView("regulatory")}>
            ⚠️ Regulatorio
          </button>
          <button className={`intel-view-tab ${view === "discipline" ? "intel-view-tab-active" : ""}`} onClick={() => setView("discipline")}>
            🗳 Disciplina
          </button>
          <button className={`intel-view-tab ${view === "actors" ? "intel-view-tab-active" : ""}`} onClick={() => setView("actors")}>
            👤 Actores
          </button>
          <button className={`intel-view-tab ${view === "fragility" ? "intel-view-tab-active" : ""}`} onClick={() => setView("fragility")}>
            🏛 Estabilidad
          </button>
          <button className={`intel-view-tab ${view === "transcripts" ? "intel-view-tab-active" : ""}`} onClick={() => setView("transcripts")}>
            📜 Transcripciones
          </button>
        </div>
        {view === "map" && (
          <div className="intel-sort-bar">
            <span className="intel-sort-label">Ordenar:</span>
            {(["pulse", "population", "gdp", "unemployment", "debt"] as const).map((s) => (
              <button key={s} className={`intel-sort-btn ${sortBy === s ? "intel-sort-active" : ""}`} onClick={() => setSortBy(s)}>
                {s === "pulse" ? "Actividad" : s === "population" ? "Población" : s === "gdp" ? "PIB/cap" : s === "unemployment" ? "Empleo" : "Deuda"}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && !data ? (
        <div className="intel-loading">
          <span className="research-chat-status-spinner" />
          Cargando datos territoriales...
        </div>
      ) : (
        <>
          {/* ═══ MAP VIEW: Territory cards grid ═══ */}
          {view === "map" && (
            <section className="intel-grid-section">
              {/* Power concentration bar */}
              <div className="intel-power-bar">
                <h2 className="intel-section-title">Mapa de poder autonómico</h2>
                <div className="intel-power-strip">
                  {(data?.governingMap ?? []).map((g: any) => (
                    <div
                      key={g.slug}
                      className="intel-power-chip"
                      style={{ borderColor: partyColor(g.presidentParty) }}
                      onClick={() => { setSelectedTerritory(g.slug); setView("detail"); }}
                    >
                      <span className="intel-power-chip-name">{g.name.replace(/Comunitat |Comunidad de |C\. de |R\. de |Illes /, "").substring(0, 12)}</span>
                      <span className="intel-power-chip-party" style={{ color: partyColor(g.presidentParty) }}>{g.presidentParty.toUpperCase()}</span>
                      <span className="intel-power-chip-seats">{g.govSeats}/{g.totalSeats}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Territory cards */}
              <div className="intel-territory-cards">
                {sorted.map((t) => (
                  <div key={t.slug} className="intel-card" onClick={() => { setSelectedTerritory(t.slug); setView("detail"); }}>
                    <div className="intel-card-header">
                      <div className="intel-card-title-row">
                        {t.health && <span>{statusDot(t.health.status)}</span>}
                        <h3>{t.name}</h3>
                        <span className="intel-card-pulse">{t.pulseScore}</span>
                      </div>
                      {t.parliament && (
                        <div className="intel-card-gov">
                          <span className="intel-card-president">{t.parliament.president}</span>
                          <span className="intel-card-party-tag" style={{ background: partyColor(t.parliament.presidentParty), color: "#fff" }}>
                            {t.parliament.presidentParty.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Parliament composition bar */}
                    {t.parliament && (
                      <div className="intel-card-parl">
                        <div className="intel-card-parl-bar">
                          {t.parliament.groups.map((g) => (
                            <div
                              key={g.partySlug}
                              className="intel-card-parl-seg"
                              style={{ width: `${g.pct}%`, background: partyColor(g.partySlug) }}
                              title={`${g.acronym}: ${g.seats} (${g.pct}%)`}
                            />
                          ))}
                        </div>
                        <span className="intel-card-parl-seats">{t.parliament.totalSeats} escaños</span>
                      </div>
                    )}

                    {/* Key indicators */}
                    {t.indicators && (
                      <div className="intel-card-indicators">
                        <div className="intel-card-ind">
                          <span>{formatPop(t.indicators.population)}</span>
                          <label>Población</label>
                        </div>
                        <div className="intel-card-ind">
                          <span>{(t.indicators.gdpPerCapita / 1000).toFixed(1)}k€</span>
                          <label>PIB/cap</label>
                        </div>
                        <div className="intel-card-ind">
                          <span style={{ color: t.indicators.unemploymentRate > 14 ? "var(--rojo)" : t.indicators.unemploymentRate < 9 ? "var(--verde)" : "var(--ink)" }}>
                            {t.indicators.unemploymentRate}%
                          </span>
                          <label>Paro</label>
                        </div>
                        <div className="intel-card-ind">
                          <span style={{ color: (t.fiscal?.debtGdp ?? 0) > 30 ? "var(--rojo)" : "var(--ink)" }}>
                            {t.fiscal?.debtGdp ?? "—"}%
                          </span>
                          <label>Deuda/PIB</label>
                        </div>
                      </div>
                    )}

                    {/* Sources row */}
                    <div className="intel-card-sources">
                      {t.sources.map((s) => (
                        <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className={`intel-source-tag intel-source-${s.type}`} onClick={(e) => e.stopPropagation()}>
                          {s.type === "gazette" ? "📜" : s.type === "parliament" ? "🏛" : "🏢"} {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ COMPARE VIEW ═══ */}
          {view === "compare" && (
            <section className="intel-compare-section">
              <div className="intel-compare-selectors">
                <div className="intel-compare-select">
                  <label>Territorio A</label>
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                    {terrs.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  </select>
                </div>
                <span className="intel-compare-vs">VS</span>
                <div className="intel-compare-select">
                  <label>Territorio B</label>
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                    {terrs.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {terrA && terrB && (
                <div className="intel-compare-grid">
                  {/* Header */}
                  <div className="intel-compare-header">
                    <span />
                    <strong>{terrA.name}</strong>
                    <strong>{terrB.name}</strong>
                  </div>

                  {/* Government */}
                  <div className="intel-compare-group-title">Gobierno</div>
                  <CompareRow label="Presidente" a={terrA.parliament?.president ?? "—"} b={terrB.parliament?.president ?? "—"} />
                  <CompareRow label="Partido gobernante" a={terrA.parliament?.presidentParty?.toUpperCase() ?? "—"} b={terrB.parliament?.presidentParty?.toUpperCase() ?? "—"} />
                  <CompareRow label="Escaños parlamento" a={String(terrA.parliament?.totalSeats ?? "—")} b={String(terrB.parliament?.totalSeats ?? "—")} />

                  {/* Socioeconomic */}
                  <div className="intel-compare-group-title">Socioeconomía</div>
                  <CompareRowNum label="Población" a={terrA.indicators?.population} b={terrB.indicators?.population} format={formatPop} />
                  <CompareRowNum label="PIB per cápita (€)" a={terrA.indicators?.gdpPerCapita} b={terrB.indicators?.gdpPerCapita} format={(n) => `${(n/1000).toFixed(1)}k`} higherBetter />
                  <CompareRowNum label="Crecimiento PIB (%)" a={terrA.indicators?.gdpGrowthPct} b={terrB.indicators?.gdpGrowthPct} format={(n) => `${n}%`} higherBetter />
                  <CompareRowNum label="Paro (%)" a={terrA.indicators?.unemploymentRate} b={terrB.indicators?.unemploymentRate} format={(n) => `${n}%`} />
                  <CompareRowNum label="Paro juvenil (%)" a={terrA.indicators?.youthUnemploymentRate} b={terrB.indicators?.youthUnemploymentRate} format={(n) => `${n}%`} />
                  <CompareRowNum label="Pobreza (%)" a={terrA.indicators?.povertyRiskRate} b={terrB.indicators?.povertyRiskRate} format={(n) => `${n}%`} />
                  <CompareRowNum label="Salario medio (€)" a={terrA.indicators?.averageSalary} b={terrB.indicators?.averageSalary} format={(n) => `${(n/1000).toFixed(1)}k`} higherBetter />
                  <CompareRowNum label="Alquiler medio (€/mes)" a={terrA.indicators?.rentAvgMonthly} b={terrB.indicators?.rentAvgMonthly} format={(n) => `${n}€`} />

                  {/* Fiscal */}
                  <div className="intel-compare-group-title">Perfil Fiscal</div>
                  <CompareRowNum label="Presupuesto (M€)" a={terrA.fiscal?.budgetM} b={terrB.fiscal?.budgetM} format={(n) => `${(n/1000).toFixed(1)}B`} />
                  <CompareRowNum label="Deuda/PIB (%)" a={terrA.fiscal?.debtGdp} b={terrB.fiscal?.debtGdp} format={(n) => `${n}%`} />
                  <CompareRowNum label="Gasto per cápita (€)" a={terrA.fiscal?.spendPerCapita} b={terrB.fiscal?.spendPerCapita} format={(n) => `${(n/1000).toFixed(1)}k`} higherBetter />
                  <CompareRowNum label="Transferencias Estado (M€)" a={terrA.fiscal?.transfers} b={terrB.fiscal?.transfers} format={(n) => `${n}`} />

                  {/* Health */}
                  <div className="intel-compare-group-title">Salud Territorial</div>
                  <CompareRow
                    label="Semáforo"
                    a={terrA.health ? `${statusDot(terrA.health.status)} ${terrA.health.score > 0 ? "+" : ""}${terrA.health.score}` : "—"}
                    b={terrB.health ? `${statusDot(terrB.health.status)} ${terrB.health.score > 0 ? "+" : ""}${terrB.health.score}` : "—"}
                  />
                </div>
              )}
            </section>
          )}

          {/* ═══ DETAIL VIEW ═══ */}
          {view === "detail" && (
            <section className="intel-detail-section">
              <div className="intel-detail-selector">
                <label>Seleccionar territorio:</label>
                <select value={selectedTerritory ?? ""} onChange={(e) => setSelectedTerritory(e.target.value || null)}>
                  <option value="">— Elige un territorio —</option>
                  {terrs.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                </select>
              </div>

              {selected ? (
                <div className="intel-detail-grid">
                  {/* Left: main info */}
                  <div className="intel-detail-main">
                    {/* Government header */}
                    <div className="intel-detail-hero-card">
                      <div className="intel-detail-hero-top">
                        {selected.health && <span className="intel-detail-status">{statusDot(selected.health.status)}</span>}
                        <h2>{selected.name}</h2>
                        <span className="intel-detail-pulse">Pulse: {selected.pulseScore}</span>
                      </div>
                      {selected.parliament && (
                        <div className="intel-detail-gov">
                          <div className="intel-detail-gov-info">
                            <span className="intel-detail-gov-label">Presidente/a</span>
                            <strong>{selected.parliament.president}</strong>
                            <span className="intel-detail-gov-party" style={{ color: partyColor(selected.parliament.presidentParty) }}>
                              {selected.parliament.presidentParty.toUpperCase()}
                            </span>
                          </div>
                          <div className="intel-detail-gov-info">
                            <span className="intel-detail-gov-label">Coalición</span>
                            <div className="intel-detail-coalition-tags">
                              {selected.parliament.coalition.map((p: string) => (
                                <span key={p} className="intel-detail-coalition-tag" style={{ borderColor: partyColor(p) }}>{p.toUpperCase()}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="intel-detail-focus">{selected.strategicFocus}</p>
                    </div>

                    {/* Parliament composition */}
                    {selected.parliament && (
                      <div className="intel-detail-panel">
                        <h3>Parlamento — {selected.parliament.totalSeats} escaños</h3>
                        <div className="intel-detail-parl-bar">
                          {selected.parliament.groups.map((g) => (
                            <div
                              key={g.partySlug}
                              style={{ width: `${g.pct}%`, background: partyColor(g.partySlug) }}
                              title={`${g.acronym}: ${g.seats}`}
                            />
                          ))}
                        </div>
                        <div className="intel-detail-parl-table">
                          {selected.parliament.groups.map((g) => (
                            <div key={g.partySlug} className="intel-detail-parl-row">
                              <span className="intel-detail-parl-dot" style={{ background: partyColor(g.partySlug) }} />
                              <span className="intel-detail-parl-name">{g.acronym}</span>
                              <span className="intel-detail-parl-seats">{g.seats}</span>
                              <span className="intel-detail-parl-pct">{g.pct}%</span>
                              {g.isGoverning && <span className="intel-detail-parl-gov">GOB</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indicators */}
                    {selected.indicators && (
                      <div className="intel-detail-panel">
                        <h3>Indicadores socioeconómicos</h3>
                        <div className="intel-detail-ind-grid">
                          <IndCard label="Población" value={formatPop(selected.indicators.population)} />
                          <IndCard label="PIB per cápita" value={`${(selected.indicators.gdpPerCapita / 1000).toFixed(1)}k€`} />
                          <IndCard label="Crec. PIB" value={`${selected.indicators.gdpGrowthPct}%`} good={selected.indicators.gdpGrowthPct >= 2} />
                          <IndCard label="Paro" value={`${selected.indicators.unemploymentRate}%`} bad={selected.indicators.unemploymentRate > 14} good={selected.indicators.unemploymentRate < 9} />
                          <IndCard label="Paro juvenil" value={`${selected.indicators.youthUnemploymentRate}%`} bad={selected.indicators.youthUnemploymentRate > 30} />
                          <IndCard label="Pobreza" value={`${selected.indicators.povertyRiskRate}%`} bad={selected.indicators.povertyRiskRate > 25} />
                          <IndCard label="Salario medio" value={`${(selected.indicators.averageSalary / 1000).toFixed(1)}k€`} />
                          <IndCard label="Alquiler" value={`${selected.indicators.rentAvgMonthly}€/mes`} />
                        </div>
                      </div>
                    )}

                    {/* Fiscal profile */}
                    {selected.fiscal && (
                      <div className="intel-detail-panel">
                        <h3>Perfil fiscal</h3>
                        <div className="intel-detail-ind-grid">
                          <IndCard label="Presupuesto" value={`${(selected.fiscal.budgetM / 1000).toFixed(1)}B€`} />
                          <IndCard label="Deuda/PIB" value={`${selected.fiscal.debtGdp}%`} bad={selected.fiscal.debtGdp > 30} />
                          <IndCard label="Gasto/cápita" value={`${(selected.fiscal.spendPerCapita / 1000).toFixed(1)}k€`} />
                          <IndCard label="Transferencias" value={`${selected.fiscal.transfers}M€`} />
                          <IndCard label="Fondos UE" value={`${selected.fiscal.euFunds}M€`} />
                        </div>
                        {selected.fiscal.spending.length > 0 && (
                          <div className="intel-detail-spending">
                            <h4>Distribución del gasto</h4>
                            {selected.fiscal.spending.map((s: any) => (
                              <div key={s.label} className="intel-detail-spend-row">
                                <span>{s.label}</span>
                                <div className="intel-detail-spend-bar"><div style={{ width: `${s.pctOfBudget}%` }} /></div>
                                <span className="intel-detail-spend-pct">{s.pctOfBudget}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right sidebar */}
                  <aside className="intel-detail-sidebar">
                    {/* Official sources */}
                    <div className="intel-detail-side-panel">
                      <h3>Fuentes oficiales</h3>
                      {selected.sources.map((s) => (
                        <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className="intel-detail-source">
                          {s.type === "gazette" ? "📜" : s.type === "parliament" ? "🏛" : "🏢"} {s.title}
                          <span className="intel-detail-source-type">{s.type === "gazette" ? "Boletín" : s.type === "parliament" ? "Parlamento" : "Gobierno"}</span>
                        </a>
                      ))}
                    </div>

                    {/* Politicians */}
                    {selected.politicians.length > 0 && (
                      <div className="intel-detail-side-panel">
                        <h3>Actores clave</h3>
                        {selected.politicians.map((p, i) => (
                          <div key={i} className="intel-detail-actor">
                            <strong>{p.name}</strong>
                            <span style={{ color: partyColor(p.party) }}>{p.party.toUpperCase()}</span>
                            <span className="intel-detail-actor-role">{p.role}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Agenda */}
                    {selected.events.length > 0 && (
                      <div className="intel-detail-side-panel">
                        <h3>Agenda territorial</h3>
                        {selected.events.map((ev, i) => (
                          <div key={i} className="intel-detail-event">
                            <span className="intel-detail-event-date">{ev.date}</span>
                            <span>{ev.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick nav */}
                    <div className="intel-detail-side-panel">
                      <h3>Ir a</h3>
                      <div className="intel-detail-links">
                        <Link href={`/territories/${selected.slug}`}>📍 Ficha completa</Link>
                        <Link href={`/agenda?territorio=${selected.slug}`}>📅 Agenda</Link>
                        <Link href="/contratacion">📋 Contratos ({selected.contracts})</Link>
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="intel-detail-empty">
                  <p>Selecciona un territorio del desplegable o haz click en una tarjeta de la vista general.</p>
                </div>
              )}
            </section>
          )}

          {/* ═══ LEGISLATIVE TRACKER ═══ */}
          {view === "legislative" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Seguimiento Legislativo</h2>
              <p className="intel-section-desc">Seguimiento de votaciones parlamentarias con desglose por partido. Political Intelligence no ofrece este nivel de detalle automatizado.</p>

              {/* National sessions */}
              {(data?.nationalSessions ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginBottom: 16 }}>
                  <h3 className="intel-panel-title">Sesiones Parlamentarias</h3>
                  {(data?.nationalSessions ?? []).map((s: any, i: number) => (
                    <div key={i} className="intel-session-card">
                      <div className="intel-session-head">
                        <span className="intel-session-date">{s.date}</span>
                        <strong>{s.title}</strong>
                        <span className={`intel-session-status intel-status-${s.status}`}>{s.status}</span>
                      </div>
                      {s.speakers.length > 0 && (
                        <div className="intel-session-speakers">
                          {s.speakers.map((sp: any, j: number) => (
                            <span key={j} className="intel-speaker-tag" style={{ borderColor: partyColor(sp.party) }}>
                              {sp.name} <em>({sp.minutes}min)</em>
                            </span>
                          ))}
                        </div>
                      )}
                      {s.agendaItems.length > 0 && (
                        <div className="intel-session-agenda">
                          {s.agendaItems.map((a: any, j: number) => (
                            <div key={j} className="intel-agenda-item-mini">
                              <span className="intel-agenda-type-tag">{a.type}</span>
                              <span>{a.title}</span>
                              {a.result && <span className={`intel-agenda-result ${a.result === "aprobada" ? "intel-result-ok" : "intel-result-no"}`}>{a.result}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {s.topics.length > 0 && (
                        <div className="intel-topic-tags">
                          {s.topics.map((t: string, j: number) => (
                            <span key={j} className="intel-topic-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Vote tracker */}
              <div className="intel-panel-card">
                <h3 className="intel-panel-title">Votaciones plenarias</h3>
                <div className="intel-votes-grid">
                  {(data?.legislativeTracker ?? []).map((v: any, i: number) => (
                    <div key={i} className="intel-vote-card">
                      <div className="intel-vote-head">
                        <span className="intel-vote-cat">{v.category}</span>
                        <span className={`intel-vote-result ${v.result === "aprobado" ? "intel-result-ok" : "intel-result-no"}`}>
                          {v.result === "aprobado" ? "✓ Aprobado" : "✗ Rechazado"}
                        </span>
                      </div>
                      <strong className="intel-vote-title">{v.title}</strong>
                      <div className="intel-vote-counts">
                        <span className="intel-vote-si">Sí: {v.si}</span>
                        <span className="intel-vote-no">No: {v.no}</span>
                        <span className="intel-vote-abs">Abs: {v.abstencion}</span>
                      </div>
                      <div className="intel-vote-parties">
                        {v.parties.slice(0, 6).map((p: any, j: number) => (
                          <span key={j} className="intel-vote-party" style={{ color: partyColor(p.party) }}>
                            {p.party.toUpperCase()}: {p.position}
                          </span>
                        ))}
                      </div>
                      {v.tags.length > 0 && (
                        <div className="intel-topic-tags" style={{ marginTop: 6 }}>
                          {v.tags.map((t: string, j: number) => <span key={j} className="intel-topic-tag">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vote predictions */}
              {(data?.votePredictions ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Predicción de próximas votaciones</h3>
                  <div className="intel-predictions-row">
                    {(data?.votePredictions ?? []).map((v: any, i: number) => (
                      <div key={i} className="intel-prediction-chip">
                        <span className="intel-prediction-cat">{v.category}</span>
                        <span className={`intel-prediction-result ${v.result === "aprobado" ? "intel-result-ok" : v.result === "rechazado" ? "intel-result-no" : "intel-result-maybe"}`}>
                          {v.result} ({v.confidence}%)
                        </span>
                        <p className="intel-prediction-reason">{v.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ═══ REGULATORY RISK RADAR ═══ */}
          {view === "regulatory" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Radar de Riesgo Regulatorio</h2>
              <p className="intel-section-desc">Regulaciones en trámite y directivas UE pendientes de transposición que afectan a sectores empresariales. Kreab y LLYC cobran por este seguimiento; aquí es self-serve y automático.</p>

              <div className="intel-reg-grid">
                {(data?.regulatoryRisk ?? []).map((r: any, i: number) => (
                  <div key={i} className={`intel-reg-card intel-reg-${r.status === "retrasada" || r.status === "incumplimiento" ? "danger" : r.status === "en-tramite" || r.status === "anteproyecto" ? "warning" : "info"}`}>
                    <div className="intel-reg-head">
                      <span className={`intel-reg-status intel-reg-status-${r.status}`}>
                        {r.status === "retrasada" ? "⏰ Retrasada" : r.status === "incumplimiento" ? "🔴 Incumplimiento" : r.status === "en-tramite" ? "📋 En trámite" : r.status === "en-plazo" ? "🟢 En plazo" : "📝 " + r.status}
                      </span>
                      <span className="intel-reg-type">{r.type}</span>
                    </div>
                    <strong className="intel-reg-title">{r.title}</strong>
                    {r.impact && <p className="intel-reg-impact">{r.impact}</p>}
                    {(r.sectors ?? []).length > 0 && (
                      <div className="intel-topic-tags">
                        {r.sectors.map((s: string, j: number) => <span key={j} className="intel-topic-tag">{s}</span>)}
                        {(r.companyTypes ?? []).map((c: string, j: number) => <span key={`c-${j}`} className="intel-topic-tag intel-topic-tag-alt">{c}</span>)}
                      </div>
                    )}
                    {r.sector && <span className="intel-reg-sector">{r.sector}</span>}
                    {r.deadline && <span className="intel-reg-deadline">Plazo: {r.deadline}</span>}
                    {r.fiscalImpact && <span className="intel-reg-fiscal">{r.fiscalImpact}</span>}
                  </div>
                ))}
              </div>

              {/* EU Pipeline summary */}
              {data?.euPipeline && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Pipeline UE-España</h3>
                  <div className="intel-eu-kpis">
                    <div className="intel-eu-kpi"><span>Directivas</span><strong>{data.euPipeline.totalDirectives}</strong></div>
                    <div className="intel-eu-kpi"><span>Transpuestas</span><strong style={{ color: "var(--verde)" }}>{data.euPipeline.transpositionSummary?.transpuesta ?? 0}</strong></div>
                    <div className="intel-eu-kpi"><span>Retrasadas</span><strong style={{ color: "var(--rojo)" }}>{data.euPipeline.transpositionSummary?.retrasada ?? 0}</strong></div>
                    <div className="intel-eu-kpi"><span>Infracciones</span><strong style={{ color: "var(--rojo)" }}>{data.euPipeline.infringements?.length ?? 0}</strong></div>
                  </div>
                  {(data.euPipeline.infringements ?? []).length > 0 && (
                    <div className="intel-infringements-list">
                      {data.euPipeline.infringements.map((inf: any, i: number) => (
                        <div key={i} className="intel-infringement-row">
                          <span className="intel-infringement-stage">{inf.stage}</span>
                          <strong>{inf.subject}</strong>
                          {inf.potentialFine && <span className="intel-infringement-fine">{inf.potentialFine}M€ multa</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stakeholder map */}
              <div className="intel-panel-card" style={{ marginTop: 16 }}>
                <h3 className="intel-panel-title">Mapa de Actores (Contratos + Subvenciones)</h3>
                <div className="intel-stakeholder-grid">
                  {(data?.stakeholderMap ?? []).slice(0, 12).map((s: any, i: number) => (
                    <div key={i} className="intel-stakeholder-card">
                      <div className="intel-stakeholder-type">{s.type === "contrato" ? "📋 Contrato" : "💰 Subvención"}</div>
                      <strong>{s.title}</strong>
                      <div className="intel-stakeholder-meta">
                        {s.contractor && <span>Adjudicatario: {s.contractor}</span>}
                        {s.grantor && <span>Otorgante: {s.grantor}</span>}
                        <span className="intel-stakeholder-amount">{s.amountM}M€</span>
                      </div>
                      {(s.territories ?? []).length > 0 && (
                        <div className="intel-topic-tags">
                          {s.territories.map((t: string, j: number) => <span key={j} className="intel-topic-tag">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══ PARTY DISCIPLINE ═══ */}
          {view === "discipline" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Disciplina de Partido y Coherencia</h2>
              <p className="intel-section-desc">Tasas de disciplina en votaciones del Congreso, rebeliones internas y alertas de coherencia. Dato que ni Political Intelligence ni ATREVIA ofrecen automatizado.</p>

              <div className="intel-discipline-table">
                <div className="intel-discipline-header">
                  <span>Partido</span>
                  <span>Disciplina</span>
                  <span>Rebeliones</span>
                  <span>Ausencia</span>
                  <span>Votaciones</span>
                </div>
                {(data?.disciplineData ?? []).map((d: any, i: number) => (
                  <div key={i} className="intel-discipline-row">
                    <span className="intel-discipline-party" style={{ color: partyColor(d.slug) }}>{d.party}</span>
                    <span className="intel-discipline-rate" style={{ color: d.disciplineRate >= 98 ? "var(--verde)" : d.disciplineRate >= 95 ? "var(--ink)" : "var(--rojo)" }}>
                      {d.disciplineRate}%
                    </span>
                    <span className={d.rebellions > 2 ? "intel-discipline-bad" : ""}>{d.rebellions}</span>
                    <span>{d.absenceRate}%</span>
                    <span className="intel-discipline-mono">{d.totalVotes}</span>
                  </div>
                ))}
              </div>

              {/* Coherence alerts */}
              {(data?.coherenceAlerts ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Alertas de coherencia voto-discurso</h3>
                  {(data?.coherenceAlerts ?? []).map((a: any, i: number) => (
                    <div key={i} className={`intel-coherence-alert intel-coherence-${a.severity}`}>
                      <div className="intel-coherence-head">
                        <Link href={`/parties/${a.slug}`} className="intel-coherence-party" style={{ color: partyColor(a.slug) }}>{a.party}</Link>
                        <span className="intel-coherence-type">{a.type === "contradiction" ? "Contradicción" : a.type === "abstention-dodge" ? "Evasión" : "Sorpresa"}</span>
                      </div>
                      <p>{a.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Media coverage */}
              {(data?.partyCoverage ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Cobertura mediática por partido</h3>
                  <div className="intel-media-grid">
                    {(data?.partyCoverage ?? []).map((p: any, i: number) => (
                      <div key={i} className="intel-media-card">
                        <div className="intel-media-head">
                          <strong style={{ color: partyColor(p.slug) }}>{p.name}</strong>
                          <span className="intel-media-count">{p.mentions} menciones</span>
                        </div>
                        <div className="intel-media-sources">
                          {p.sources.map(([source, count]: [string, number], j: number) => (
                            <span key={j} className="intel-media-source">{source}: {count}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ═══ ACTOR PROFILES ═══ */}
          {view === "actors" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Perfiles de Actores Clave</h2>
              <p className="intel-section-desc">Declaraciones patrimoniales, actividades compatibles, valores y renta. Cruce automático con contratos para detectar posibles conflictos de interés.</p>

              <div className="intel-actors-grid">
                {(data?.actorProfiles ?? []).map((a: any, i: number) => (
                  <div key={i} className="intel-actor-card">
                    <div className="intel-actor-head">
                      <Link href={`/politicians/${a.slug}`} className="intel-actor-name">{a.name}</Link>
                      <span className="intel-actor-party" style={{ color: partyColor(a.party) }}>{a.party.toUpperCase()}</span>
                    </div>
                    <span className="intel-actor-role">{a.role}</span>
                    <div className="intel-actor-assets">
                      <div><span>Renta</span><strong>{a.income > 0 ? `${(a.income / 1000).toFixed(0)}k€` : "—"}</strong></div>
                      <div><span>Inmuebles</span><strong>{a.realEstate}</strong></div>
                      <div><span>Depósitos</span><strong>{a.deposits || "—"}</strong></div>
                      <div><span>Deudas</span><strong>{a.liabilities}</strong></div>
                    </div>
                    {a.activities.length > 0 && (
                      <div className="intel-actor-activities">
                        <span className="intel-actor-act-label">Actividades:</span>
                        {a.activities.map((act: string, j: number) => (
                          <span key={j} className="intel-actor-act">{act}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Conflict of interest alerts */}
              {(data?.conflictAlerts ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Detector de Conflictos de Interés</h3>
                  <p className="intel-section-desc" style={{ marginTop: 0 }}>Cruce automático: actividades compatibles + valores + contratos públicos en sus territorios. Ningún competidor ofrece este cruce automatizado.</p>
                  {(data?.conflictAlerts ?? []).map((c: any, i: number) => (
                    <div key={i} className="intel-conflict-card">
                      <div className="intel-conflict-head">
                        <strong>{c.politician}</strong>
                        <span style={{ color: partyColor(c.party) }}>{c.party.toUpperCase()}</span>
                        <span className="intel-conflict-income">{(c.income / 1000).toFixed(0)}k€</span>
                      </div>
                      <div className="intel-conflict-activities">
                        {c.activities.map((a: string, j: number) => <span key={j} className="intel-conflict-act">{a}</span>)}
                      </div>
                      {c.securities.length > 0 && (
                        <div className="intel-conflict-securities">
                          Valores: {c.securities.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Media coverage per politician */}
              {(data?.mediaCoverage ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Cobertura mediática por político</h3>
                  <div className="intel-media-grid">
                    {(data?.mediaCoverage ?? []).map((m: any, i: number) => (
                      <div key={i} className="intel-media-card">
                        <div className="intel-media-head">
                          <Link href={`/politicians/${m.slug}`} style={{ color: partyColor(m.party), fontWeight: 700, textDecoration: "none" }}>{m.name}</Link>
                          <span className="intel-media-count">{m.mentions} menciones</span>
                        </div>
                        <div className="intel-media-sources">
                          {m.sources.map(([source, count]: [string, number], j: number) => (
                            <span key={j} className="intel-media-source">{source}: {count}</span>
                          ))}
                        </div>
                        {m.headlines.length > 0 && (
                          <div className="intel-media-headlines">
                            {m.headlines.map((h: any, j: number) => (
                              <div key={j} className="intel-media-headline">{h.title}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ═══ GOVERNMENT FRAGILITY MONITOR ═══ */}
          {view === "fragility" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Monitor de Estabilidad Gubernamental</h2>
              <p className="intel-section-desc">Índice compuesto de fragilidad: margen de escaños, fiabilidad de socios, disciplina de coalición, tensiones territoriales. Political Intelligence vende este análisis como consultoría; aquí es automático.</p>

              {data?.fragility && (
                <div className="intel-fragility-dashboard">
                  {/* Main gauge */}
                  <div className="intel-fragility-gauge-card">
                    <div className="intel-fragility-score">
                      <span className="intel-fragility-number" style={{
                        color: data.fragility.score >= 60 ? "var(--verde)" : data.fragility.score >= 40 ? "var(--oro)" : "var(--rojo)",
                      }}>{data.fragility.score}</span>
                      <span className="intel-fragility-of">/100</span>
                    </div>
                    <div className="intel-fragility-bar">
                      <div style={{
                        width: `${data.fragility.score}%`,
                        background: data.fragility.score >= 60 ? "var(--verde)" : data.fragility.score >= 40 ? "var(--oro)" : "var(--rojo)",
                      }} />
                    </div>
                    <span className="intel-fragility-label">{data.fragility.label}</span>
                    <div className="intel-fragility-seats">
                      <span>Coalición: <strong>{data.fragility.coalitionSeats}</strong> escaños</span>
                      <span>Mayoría: <strong>{data.fragility.majority}</strong></span>
                      <span>Margen: <strong style={{ color: data.fragility.margin > 0 ? "var(--verde)" : "var(--rojo)" }}>
                        {data.fragility.margin > 0 ? "+" : ""}{data.fragility.margin}
                      </strong></span>
                    </div>
                  </div>

                  {/* Factors */}
                  <div className="intel-fragility-factors">
                    <h3 className="intel-panel-title">Factores de riesgo</h3>
                    {(data.fragility.factors ?? []).map((f: any, i: number) => (
                      <div key={i} className="intel-factor-card">
                        <div className="intel-factor-head">
                          <strong>{f.label ?? f.description?.substring(0, 40)}</strong>
                          {f.value != null && <span className="intel-factor-value">{f.value}</span>}
                        </div>
                        {f.description && <p className="intel-factor-desc">{f.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CCAA Calendar */}
              {(data?.ccaaCalendar ?? []).length > 0 && (
                <div className="intel-panel-card" style={{ marginTop: 16 }}>
                  <h3 className="intel-panel-title">Calendario Legislativo Autonómico</h3>
                  {(data?.ccaaCalendar ?? []).map((s: any, i: number) => (
                    <div key={i} className="intel-ccaa-session">
                      <div className="intel-ccaa-session-head">
                        <span className="intel-session-date">{s.date}</span>
                        <strong>{s.title}</strong>
                        <span className={`intel-session-status intel-status-${s.status}`}>{s.status}</span>
                      </div>
                      {s.territories.length > 0 && (
                        <div className="intel-topic-tags">
                          {s.territories.map((t: string, j: number) => <span key={j} className="intel-topic-tag">{t}</span>)}
                        </div>
                      )}
                      {s.speakers.length > 0 && (
                        <div className="intel-session-speakers">
                          {s.speakers.map((sp: any, j: number) => (
                            <span key={j} className="intel-speaker-tag" style={{ borderColor: partyColor(sp.party) }}>{sp.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Power concentration */}
              <div className="intel-panel-card" style={{ marginTop: 16 }}>
                <h3 className="intel-panel-title">Concentración de Poder Multinivel</h3>
                <div className="intel-power-table">
                  {(data?.powerMap ?? []).map((p: any, i: number) => (
                    <div key={i} className="intel-power-row">
                      <span className="intel-power-name" style={{ color: partyColor(p.slug) }}>{p.party}</span>
                      <span className="intel-power-seats-col">🏛 {p.congress}</span>
                      <span className="intel-power-ccaa-col">🗺 {p.ccaaSeats} esc.</span>
                      <span className="intel-power-gov-col">{p.ccaaGoverning.length} gob.</span>
                      <span className="intel-power-index-col">Idx: {p.powerIndex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══ TRANSCRIPT ANALYSIS ═══ */}
          {view === "transcripts" && (
            <section className="intel-grid-section">
              <h2 className="intel-section-title">Análisis de Transcripciones Parlamentarias</h2>
              <p className="intel-section-desc">Texto completo de las intervenciones con análisis de sentimiento, extracción de afirmaciones verificables, posiciones por tema y mapa de conflictos. Ningún competidor ofrece transcripciones analizadas automáticamente.</p>

              {/* KPI bar */}
              {data?.transcriptAnalysis?.stats && (
                <div className="transcript-kpi-bar">
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{data.transcriptAnalysis.stats.totalSessions}</span><span className="transcript-kpi-label">Sesiones</span></div>
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{data.transcriptAnalysis.stats.totalInterventions}</span><span className="transcript-kpi-label">Intervenciones</span></div>
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{(data.transcriptAnalysis.stats.totalWords / 1000).toFixed(1)}k</span><span className="transcript-kpi-label">Palabras</span></div>
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{data.transcriptAnalysis.stats.totalClaims}</span><span className="transcript-kpi-label">Afirmaciones</span></div>
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{data.transcriptAnalysis.stats.verifiableClaims}</span><span className="transcript-kpi-label">Verificables</span></div>
                  <div className="transcript-kpi"><span className="transcript-kpi-value">{data.transcriptAnalysis.stats.uniqueSpeakers}</span><span className="transcript-kpi-label">Oradores</span></div>
                </div>
              )}

              {/* Sentiment by party */}
              <div className="transcript-section">
                <h3 className="intel-panel-title">Sentimiento por Partido (agregado de todas las sesiones)</h3>
                <div className="transcript-sentiment-grid">
                  {(data?.transcriptAnalysis?.sentimentByParty ?? []).map((p: any, i: number) => (
                    <div key={i} className="transcript-sentiment-card">
                      <div className="transcript-sentiment-party" style={{ color: partyColor(p.party) }}>{p.party.toUpperCase()}</div>
                      <div className={`transcript-sentiment-bar ${p.avgScore >= 0.15 ? "sentiment-positive" : p.avgScore <= -0.15 ? "sentiment-negative" : "sentiment-neutral"}`}>
                        <div className="transcript-sentiment-fill" style={{ width: `${Math.abs(p.avgScore) * 100}%`, background: p.avgScore >= 0 ? "var(--verde)" : "var(--rojo)" }} />
                      </div>
                      <div className="transcript-sentiment-score">{p.avgScore > 0 ? "+" : ""}{p.avgScore.toFixed(2)}</div>
                      <div className="transcript-sentiment-label">{p.label}</div>
                      <div className="transcript-sentiment-count">{p.interventions} intervenciones</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic heatmap */}
              <div className="transcript-section">
                <h3 className="intel-panel-title">Mapa de Temas por Partido</h3>
                <p className="intel-section-desc" style={{ marginBottom: 8 }}>Frecuencia con la que cada partido habla de cada tema en sus intervenciones.</p>
                <div className="transcript-heatmap">
                  {(data?.transcriptAnalysis?.topicHeatmap ?? []).slice(0, 10).map((t: any, i: number) => (
                    <div key={i} className="transcript-heatmap-row">
                      <span className="transcript-heatmap-topic">{t.topic}</span>
                      <div className="transcript-heatmap-parties">
                        {t.parties.map((p: any, j: number) => (
                          <span key={j} className="transcript-heatmap-chip" style={{ background: partyColor(p.party), opacity: 0.6 + (p.mentions * 0.15) }}>
                            {p.party} ({p.mentions})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verifiable claims */}
              <div className="transcript-section">
                <h3 className="intel-panel-title">Afirmaciones Verificables — Fact-checking automatizado</h3>
                <div className="transcript-claims-grid">
                  {(data?.transcriptAnalysis?.verifiableClaims ?? []).map((c: any, i: number) => (
                    <div key={i} className="transcript-claim-card">
                      <div className="transcript-claim-header">
                        <span className="transcript-claim-speaker" style={{ color: partyColor(c.party) }}>{c.speaker}</span>
                        <span className={`transcript-claim-type transcript-claim-type-${c.type}`}>{c.type}</span>
                      </div>
                      <p className="transcript-claim-text">{`"${c.text}"`}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-session deep dives */}
              {(data?.transcriptAnalysis?.sessions ?? []).map((session: any) => (
                <div key={session.sessionId} className="transcript-session">
                  <h3 className="intel-panel-title">
                    Sesión: {session.sessionId}
                    <span className="transcript-session-meta">
                      {session.totalInterventions} intervenciones · {session.totalWords.toLocaleString()} palabras · {session.totalMinutes} min
                    </span>
                  </h3>

                  {/* Conflicts & consensus */}
                  <div className="transcript-conflict-consensus">
                    <div className="transcript-conflicts">
                      <h4 className="transcript-sub-title">Conflictos clave</h4>
                      {session.keyConflicts.map((c: any, i: number) => (
                        <div key={i} className="transcript-conflict-card">
                          <span className="transcript-conflict-topic">{c.topic}</span>
                          <span className="transcript-conflict-parties">
                            <span style={{ color: partyColor(c.parties[0]) }}>{c.parties[0]}</span> vs <span style={{ color: partyColor(c.parties[1]) }}>{c.parties[1]}</span>
                          </span>
                          <p className="transcript-conflict-desc">{c.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="transcript-consensus">
                      <h4 className="transcript-sub-title">Áreas de consenso</h4>
                      {session.consensusAreas.map((c: any, i: number) => (
                        <div key={i} className="transcript-consensus-card">
                          <span className="transcript-consensus-topic">{c.topic}</span>
                          <div className="transcript-consensus-parties">
                            {c.parties.map((p: string) => (
                              <span key={p} className="transcript-consensus-chip" style={{ background: partyColor(p) }}>{p}</span>
                            ))}
                          </div>
                          <p className="transcript-consensus-desc">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dominant topics */}
                  <div className="transcript-topics-bar">
                    {session.dominantTopics.map((t: any, i: number) => (
                      <div key={i} className="transcript-topic-pill" style={{ flex: t.weight }}>
                        <span className="transcript-topic-name">{t.topic}</span>
                        <span className="transcript-topic-pct">{(t.weight * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Interventions */}
                  {session.interventions.map((int: any) => (
                    <div key={int.id} className="transcript-intervention">
                      <div className="transcript-int-header">
                        <span className="transcript-int-speaker" style={{ borderLeft: `4px solid ${partyColor(int.party)}`, paddingLeft: 8 }}>
                          {int.speaker}
                        </span>
                        <span className="transcript-int-role">{int.role}</span>
                        <span className="transcript-int-party" style={{ color: partyColor(int.party) }}>{int.party.toUpperCase()}</span>
                        <span className="transcript-int-duration">{int.durationMinutes} min</span>
                        <span className={`transcript-int-sentiment ${int.sentiment.score >= 0.15 ? "sentiment-positive" : int.sentiment.score <= -0.15 ? "sentiment-negative" : "sentiment-neutral"}`}>
                          {int.sentiment.score > 0 ? "+" : ""}{int.sentiment.score.toFixed(2)} {int.sentiment.label}
                        </span>
                      </div>

                      {/* Full text */}
                      <div className="transcript-int-text">{int.fullText}</div>

                      {/* Stance chips */}
                      <div className="transcript-int-stances">
                        {int.stance.map((s: any, j: number) => (
                          <span key={j} className={`transcript-stance-chip stance-${s.position}`}>
                            {s.topic}: {s.position} ({(s.confidence * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>

                      {/* Claims */}
                      {int.claims.length > 0 && (
                        <div className="transcript-int-claims">
                          <span className="transcript-claims-label">Afirmaciones:</span>
                          {int.claims.map((c: any, j: number) => (
                            <div key={j} className="transcript-int-claim">
                              <span className={`transcript-claim-badge transcript-claim-type-${c.type}`}>{c.type}</span>
                              <span className="transcript-int-claim-text">{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Keywords */}
                      <div className="transcript-int-keywords">
                        {int.keywords.map((k: string) => (
                          <span key={k} className="transcript-keyword-chip">{k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          )}

          {/* ── Bottom: National agenda + recent news ── */}
          <section className="intel-bottom-grid">
            <div className="intel-bottom-panel">
              <h2 className="intel-section-title">Agenda nacional próxima</h2>
              {(data?.agenda ?? []).map((ev: any, i: number) => (
                <div key={i} className="intel-bottom-event">
                  <span className="intel-bottom-event-date">{ev.date}</span>
                  <span className="intel-bottom-event-type">{ev.type}</span>
                  <span className="intel-bottom-event-title">{ev.title}</span>
                </div>
              ))}
            </div>
            <div className="intel-bottom-panel">
              <h2 className="intel-section-title">Noticias recientes con mención territorial</h2>
              {(data?.recentNews ?? []).map((n: any, i: number) => (
                <div key={i} className="intel-bottom-news">
                  <span className="intel-bottom-news-source">{n.source}</span>
                  <span className="intel-bottom-news-title">{n.title}</span>
                  {n.territories.length > 0 && (
                    <div className="intel-bottom-news-tags">
                      {n.territories.map((ts: string) => (
                        <span key={ts} className="intel-bottom-news-tag">{ts}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <SiteFooter />
    </main>
  );
}

/* ── Helper components ── */

function IndCard({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = bad ? "var(--rojo)" : good ? "var(--verde)" : "var(--azul)";
  return (
    <div className="intel-ind-card">
      <span className="intel-ind-value" style={{ color }}>{value}</span>
      <span className="intel-ind-label">{label}</span>
    </div>
  );
}

function CompareRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="intel-compare-row">
      <span className="intel-compare-label">{label}</span>
      <span className="intel-compare-val">{a}</span>
      <span className="intel-compare-val">{b}</span>
    </div>
  );
}

function CompareRowNum({ label, a, b, format, higherBetter }: {
  label: string; a?: number; b?: number; format: (n: number) => string; higherBetter?: boolean;
}) {
  const valA = a != null ? format(a) : "—";
  const valB = b != null ? format(b) : "—";
  const better = higherBetter === undefined ? null : a != null && b != null
    ? (higherBetter ? (a > b ? "a" : a < b ? "b" : null) : (a < b ? "a" : a > b ? "b" : null))
    : null;
  return (
    <div className="intel-compare-row">
      <span className="intel-compare-label">{label}</span>
      <span className={`intel-compare-val ${better === "a" ? "intel-compare-better" : better === "b" ? "intel-compare-worse" : ""}`}>{valA}</span>
      <span className={`intel-compare-val ${better === "b" ? "intel-compare-better" : better === "a" ? "intel-compare-worse" : ""}`}>{valB}</span>
    </div>
  );
}
