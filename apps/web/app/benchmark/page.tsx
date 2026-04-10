"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

/* ═══════════════════════════════════════════════════════════════════════════
   Benchmark de CCAA y Ayuntamientos — Herramienta de comparación territorial.
   Competidores: datos.gob.es, INE, portales abiertos (pero fragmentados).
   Diferencial: normalización, scoring, comparación interactiva y explicaciones.
   ═══════════════════════════════════════════════════════════════════════════ */

interface BenchmarkData {
  ccaa: any[];
  ayuntamientos: any[];
  rankings: any[];
  national: any;
  euContext: any[];
  meta: any;
}

type BenchView = "ranking" | "compare" | "ayuntamientos" | "radar" | "eu";

const CCAA_COLORS: Record<string, string> = {
  madrid: "#003da5", cataluna: "#c8102e", andalucia: "#009b3a", "comunitat-valenciana": "#e87d00",
  "pais-vasco": "#DC002E", galicia: "#76B6E4", "castilla-y-leon": "#6b4c9a", "castilla-la-mancha": "#f1bf00",
  murcia: "#E30613", aragon: "#ff6b35", extremadura: "#2E8B57", "illes-balears": "#00B1C7",
  canarias: "#FFD700", asturias: "#1a5276", navarra: "#8B0000", cantabria: "#4682B4",
  "la-rioja": "#800080", ceuta: "#8e8e9a", melilla: "#555566",
};

function ccaaColor(slug: string) {
  return CCAA_COLORS[slug] ?? "var(--azul)";
}

function fmt(n: number | undefined, unit: string): string {
  if (n == null) return "—";
  if (unit === "M€" || unit === "M") return `${n.toLocaleString("es-ES")} M€`;
  if (unit === "€") return `${n.toLocaleString("es-ES")} €`;
  if (unit === "€/mes") return `${n.toLocaleString("es-ES")} €/mes`;
  if (unit === "%") return `${n.toFixed(1)}%`;
  if (unit === "‰") return `${n.toFixed(1)}‰`;
  if (unit === "años") return `${n.toFixed(1)} años`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("es-ES");
}

function pctBar(value: number, max: number, color: string) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="bench-pct-bar">
      <div className="bench-pct-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function BenchmarkPage() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<BenchView>("ranking");
  const [rankingField, setRankingField] = useState(0);
  const [compareSlots, setCompareSlots] = useState<string[]>(["madrid", "cataluna", "andalucia"]);
  const [aytoSort, setAytoSort] = useState<string>("population");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("bench-data-v1");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/benchmark")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("bench-data-v1", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ccaa = data?.ccaa ?? [];
  const aytos = data?.ayuntamientos ?? [];
  const rankings = data?.rankings ?? [];
  const national = data?.national;
  const euCtx = data?.euContext ?? [];
  const meta = data?.meta;

  const currentRanking = rankings[rankingField] ?? null;

  // Compare territories
  const compareData = compareSlots.map((slug) => ccaa.find((c) => c.slug === slug)).filter(Boolean);

  // Sorted ayuntamientos
  const sortedAytos = [...aytos].sort((a: any, b: any) => {
    if (aytoSort === "population") return b.population - a.population;
    if (aytoSort === "budget") return b.totalBudgetM - a.totalBudgetM;
    if (aytoSort === "budgetPerCapita") return b.budgetPerCapita - a.budgetPerCapita;
    if (aytoSort === "debt") return b.debtPerCapita - a.debtPerCapita;
    if (aytoSort === "investment") return b.investmentPct - a.investmentPct;
    if (aytoSort === "ownRevenue") return b.ownRevenuePct - a.ownRevenuePct;
    return 0;
  });

  return (
    <main className="page-shell">
      <SiteHeader currentSection="benchmark" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <span className="eyebrow">BENCHMARK TERRITORIAL</span>
        <h1>Comparador de Comunidades Aut{"ó"}nomas y Ayuntamientos</h1>
        <p className="hero-subtitle">
          {meta?.totalCcaa ?? 19} CCAA y {meta?.totalAyuntamientos ?? 57} ayuntamientos con datos de INE, Hacienda, datos.gob.es y Eurostat.
          Rankings, comparaciones lado a lado, gasto por categor{"í"}a y contexto europeo. Todo normalizado y listo para usar.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{meta?.totalCcaa ?? "..."}</span><span className="kpi-label">CCAA</span></div>
          <div className="kpi-item"><span className="kpi-value">{meta?.totalAyuntamientos ?? "..."}</span><span className="kpi-label">Ayuntamientos</span></div>
          <div className="kpi-item"><span className="kpi-value">17+</span><span className="kpi-label">Indicadores</span></div>
          <div className="kpi-item"><span className="kpi-value">{rankings.length}</span><span className="kpi-label">Rankings</span></div>
          <div className="kpi-item"><span className="kpi-value">{euCtx.length}</span><span className="kpi-label">Indicadores UE</span></div>
        </div>
      </section>

      {/* ── View tabs ── */}
      <div className="bench-view-bar">
        <button className={`bench-tab ${view === "ranking" ? "bench-tab-active" : ""}`} onClick={() => setView("ranking")}>
          🏆 Rankings CCAA
        </button>
        <button className={`bench-tab ${view === "compare" ? "bench-tab-active" : ""}`} onClick={() => setView("compare")}>
          ⚖️ Comparador
        </button>
        <button className={`bench-tab ${view === "ayuntamientos" ? "bench-tab-active" : ""}`} onClick={() => setView("ayuntamientos")}>
          🏛 Ayuntamientos
        </button>
        <button className={`bench-tab ${view === "radar" ? "bench-tab-active" : ""}`} onClick={() => setView("radar")}>
          📊 Perfil Completo
        </button>
        <button className={`bench-tab ${view === "eu" ? "bench-tab-active" : ""}`} onClick={() => setView("eu")}>
          🇪🇺 Contexto UE
        </button>
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ RANKINGS ═══ */}
          {view === "ranking" && (
            <section className="bench-section">
              <h2 className="bench-section-title">Rankings por Indicador</h2>
              <p className="bench-section-desc">
                Selecciona un indicador para ver el ranking de las {ccaa.length} comunidades aut{"ó"}nomas. La media nacional se muestra como referencia.
              </p>

              <div className="bench-ranking-selector">
                {rankings.map((r: any, i: number) => (
                  <button
                    key={r.field}
                    className={`bench-ranking-btn ${i === rankingField ? "bench-ranking-btn-active" : ""}`}
                    onClick={() => setRankingField(i)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {currentRanking && (
                <div className="bench-ranking-table">
                  <div className="bench-ranking-header">
                    <span className="bench-rank-col">#</span>
                    <span className="bench-name-col">Comunidad</span>
                    <span className="bench-value-col">{currentRanking.label} ({currentRanking.unit})</span>
                    <span className="bench-bar-col">vs media nacional</span>
                  </div>

                  {/* National reference line */}
                  <div className="bench-ranking-row bench-ranking-national">
                    <span className="bench-rank-col">—</span>
                    <span className="bench-name-col">🇪🇸 ESPAÑA (media)</span>
                    <span className="bench-value-col">{fmt(national?.[currentRanking.field], currentRanking.unit)}</span>
                    <span className="bench-bar-col">
                      <div className="bench-national-line" />
                    </span>
                  </div>

                  {currentRanking.ranking.map((r: any) => {
                    const natVal = national?.[currentRanking.field] ?? 1;
                    const deviation = natVal > 0 ? ((r.value - natVal) / natVal) * 100 : 0;
                    const isGood = currentRanking.higherBetter ? deviation > 0 : deviation < 0;
                    return (
                      <div key={r.slug} className={`bench-ranking-row ${r.rank <= 3 ? "bench-ranking-top" : r.rank >= currentRanking.ranking.length - 2 ? "bench-ranking-bottom" : ""}`}>
                        <span className="bench-rank-col">
                          {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}
                        </span>
                        <span className="bench-name-col" style={{ color: ccaaColor(r.slug) }}>{r.name}</span>
                        <span className="bench-value-col">{fmt(r.value, currentRanking.unit)}</span>
                        <span className="bench-bar-col">
                          <div className="bench-deviation-bar">
                            <div
                              className="bench-deviation-fill"
                              style={{
                                width: `${Math.min(Math.abs(deviation) * 2, 100)}%`,
                                background: isGood ? "var(--verde)" : "var(--rojo)",
                                marginLeft: deviation >= 0 ? "50%" : `${50 - Math.min(Math.abs(deviation) * 2, 50)}%`,
                              }}
                            />
                            <div className="bench-deviation-center" />
                          </div>
                          <span className={`bench-deviation-pct ${isGood ? "bench-good" : "bench-bad"}`}>
                            {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ═══ COMPARADOR ═══ */}
          {view === "compare" && (
            <section className="bench-section">
              <h2 className="bench-section-title">Comparador CCAA lado a lado</h2>
              <p className="bench-section-desc">
                Selecciona hasta 4 comunidades para comparar indicadores econ{"ó"}micos, fiscales, sociales y de vivienda.
              </p>

              <div className="bench-compare-selectors">
                {compareSlots.map((slug, i) => (
                  <select
                    key={i}
                    value={slug}
                    onChange={(e) => {
                      const next = [...compareSlots];
                      next[i] = e.target.value;
                      setCompareSlots(next);
                    }}
                    className="bench-compare-select"
                    style={{ borderColor: ccaaColor(slug) }}
                  >
                    {ccaa.map((c: any) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                ))}
                {compareSlots.length < 4 && (
                  <button className="bench-compare-add" onClick={() => setCompareSlots([...compareSlots, ccaa[0]?.slug ?? "madrid"])}>
                    + A{"ñ"}adir
                  </button>
                )}
                {compareSlots.length > 2 && (
                  <button className="bench-compare-remove" onClick={() => setCompareSlots(compareSlots.slice(0, -1))}>
                    − Quitar
                  </button>
                )}
              </div>

              {compareData.length >= 2 && (
                <div className="bench-compare-table">
                  {/* Header */}
                  <div className="bench-compare-header">
                    <span className="bench-compare-label-col">Indicador</span>
                    {compareData.map((c: any) => (
                      <span key={c.slug} className="bench-compare-val-col" style={{ color: ccaaColor(c.slug) }}>{c.name}</span>
                    ))}
                  </div>

                  {/* Economy */}
                  <div className="bench-compare-group-title">Econom{"í"}a</div>
                  {[
                    { key: "population", label: "Población", unit: "", higherBetter: undefined },
                    { key: "gdpPerCapita", label: "PIB per cápita", unit: "€", higherBetter: true },
                    { key: "gdpGrowthPct", label: "Crecimiento PIB", unit: "%", higherBetter: true },
                    { key: "unemploymentRate", label: "Tasa de paro", unit: "%", higherBetter: false },
                    { key: "youthUnemploymentRate", label: "Paro juvenil", unit: "%", higherBetter: false },
                    { key: "averageSalary", label: "Salario medio", unit: "€", higherBetter: true },
                    { key: "cpiAnnual", label: "IPC anual", unit: "%", higherBetter: false },
                  ].map((row) => {
                    const values = compareData.map((c: any) => c[row.key] as number);
                    const best = row.higherBetter === true ? Math.max(...values) : row.higherBetter === false ? Math.min(...values) : null;
                    return (
                      <div key={row.key} className="bench-compare-row">
                        <span className="bench-compare-label-col">{row.label}</span>
                        {compareData.map((c: any) => (
                          <span
                            key={c.slug}
                            className={`bench-compare-val-col ${best !== null && c[row.key] === best ? "bench-compare-best" : ""}`}
                          >
                            {fmt(c[row.key], row.unit)}
                          </span>
                        ))}
                      </div>
                    );
                  })}

                  {/* Social */}
                  <div className="bench-compare-group-title">Social</div>
                  {[
                    { key: "povertyRiskRate", label: "Riesgo pobreza", unit: "%", higherBetter: false },
                    { key: "giniIndex", label: "Índice Gini", unit: "", higherBetter: false },
                    { key: "lifeExpectancy", label: "Esperanza de vida", unit: "años", higherBetter: true },
                    { key: "medianAge", label: "Edad mediana", unit: "años", higherBetter: undefined },
                    { key: "birthRate", label: "Natalidad", unit: "‰", higherBetter: true },
                    { key: "activePopulationPct", label: "Población activa", unit: "%", higherBetter: true },
                  ].map((row) => {
                    const values = compareData.map((c: any) => c[row.key] as number);
                    const best = row.higherBetter === true ? Math.max(...values) : row.higherBetter === false ? Math.min(...values) : null;
                    return (
                      <div key={row.key} className="bench-compare-row">
                        <span className="bench-compare-label-col">{row.label}</span>
                        {compareData.map((c: any) => (
                          <span key={c.slug} className={`bench-compare-val-col ${best !== null && c[row.key] === best ? "bench-compare-best" : ""}`}>
                            {fmt(c[row.key], row.unit)}
                          </span>
                        ))}
                      </div>
                    );
                  })}

                  {/* Housing */}
                  <div className="bench-compare-group-title">Vivienda</div>
                  {[
                    { key: "housingPriceIndex", label: "Índice precio vivienda", unit: "", higherBetter: false },
                    { key: "rentAvgMonthly", label: "Alquiler medio", unit: "€/mes", higherBetter: false },
                  ].map((row) => {
                    const values = compareData.map((c: any) => c[row.key] as number);
                    const best = row.higherBetter === false ? Math.min(...values) : Math.max(...values);
                    return (
                      <div key={row.key} className="bench-compare-row">
                        <span className="bench-compare-label-col">{row.label}</span>
                        {compareData.map((c: any) => (
                          <span key={c.slug} className={`bench-compare-val-col ${c[row.key] === best ? "bench-compare-best" : ""}`}>
                            {fmt(c[row.key], row.unit)}
                          </span>
                        ))}
                      </div>
                    );
                  })}

                  {/* Fiscal */}
                  <div className="bench-compare-group-title">Presupuesto y deuda</div>
                  {[
                    { key: "totalBudgetM", label: "Presupuesto total", unit: "M€", higherBetter: undefined },
                    { key: "spendPerCapita", label: "Gasto per cápita", unit: "€", higherBetter: undefined },
                    { key: "debtPctGdp", label: "Deuda (% PIB)", unit: "%", higherBetter: false },
                    { key: "stateTransfersM", label: "Transferencias Estado", unit: "M€", higherBetter: undefined },
                    { key: "euFundsReceivedM", label: "Fondos UE recibidos", unit: "M€", higherBetter: true },
                  ].map((row) => {
                    const values = compareData.map((c: any) => c[row.key] as number);
                    const best = row.higherBetter === true ? Math.max(...values) : row.higherBetter === false ? Math.min(...values) : null;
                    return (
                      <div key={row.key} className="bench-compare-row">
                        <span className="bench-compare-label-col">{row.label}</span>
                        {compareData.map((c: any) => (
                          <span key={c.slug} className={`bench-compare-val-col ${best !== null && c[row.key] === best ? "bench-compare-best" : ""}`}>
                            {fmt(c[row.key], row.unit)}
                          </span>
                        ))}
                      </div>
                    );
                  })}

                  {/* Spending breakdown */}
                  <div className="bench-compare-group-title">Desglose de gasto p{"ú"}blico</div>
                  {(compareData[0]?.spendingBreakdown ?? []).map((cat: any, i: number) => (
                    <div key={i} className="bench-compare-row">
                      <span className="bench-compare-label-col">{cat.category}</span>
                      {compareData.map((c: any) => {
                        const entry = c.spendingBreakdown?.[i];
                        return (
                          <span key={c.slug} className="bench-compare-val-col">
                            {entry ? `${entry.pctOfBudget.toFixed(1)}%` : "—"}
                            {entry?.amountM ? <small className="bench-compare-sub"> ({entry.amountM.toLocaleString("es-ES")} M€)</small> : null}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══ AYUNTAMIENTOS ═══ */}
          {view === "ayuntamientos" && (
            <section className="bench-section">
              <h2 className="bench-section-title">Benchmark de Ayuntamientos</h2>
              <p className="bench-section-desc">
                {aytos.length} municipios principales con presupuestos, deuda, inversi{"ó"}n, autonomía fiscal y gasto por categoría.
              </p>

              <div className="bench-ayto-sort">
                <span className="bench-sort-label">Ordenar por:</span>
                {[
                  { key: "population", label: "Población" },
                  { key: "budget", label: "Presupuesto" },
                  { key: "budgetPerCapita", label: "Gasto/hab" },
                  { key: "debt", label: "Deuda/hab" },
                  { key: "investment", label: "% Inversión" },
                  { key: "ownRevenue", label: "Autonomía fiscal" },
                ].map((s) => (
                  <button key={s.key} className={`bench-sort-btn ${aytoSort === s.key ? "bench-sort-btn-active" : ""}`} onClick={() => setAytoSort(s.key)}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="bench-ayto-grid">
                {/* Table header */}
                <div className="bench-ayto-header">
                  <span className="bench-ayto-name-col">Municipio</span>
                  <span className="bench-ayto-num-col">Población</span>
                  <span className="bench-ayto-num-col">Presupuesto</span>
                  <span className="bench-ayto-num-col">€/hab</span>
                  <span className="bench-ayto-num-col">Deuda/hab</span>
                  <span className="bench-ayto-num-col">Inversión</span>
                  <span className="bench-ayto-num-col">Autonom{"í"}a</span>
                  <span className="bench-ayto-num-col">Empleados</span>
                </div>

                {sortedAytos.map((a: any) => {
                  const maxBudgetPerCapita = Math.max(...aytos.map((x: any) => x.budgetPerCapita));
                  return (
                    <div key={a.slug} className="bench-ayto-row">
                      <span className="bench-ayto-name-col">
                        <span className="bench-ayto-name" style={{ color: ccaaColor(a.ccaaSlug) }}>{a.name.replace("Ayuntamiento de ", "")}</span>
                        <span className="bench-ayto-ccaa">{a.province}{a.isCapital ? " ★" : ""}</span>
                      </span>
                      <span className="bench-ayto-num-col">{fmt(a.population, "")}</span>
                      <span className="bench-ayto-num-col">{a.totalBudgetM.toLocaleString("es-ES")} M€</span>
                      <span className="bench-ayto-num-col">
                        {a.budgetPerCapita.toLocaleString("es-ES")} €
                        {pctBar(a.budgetPerCapita, maxBudgetPerCapita, ccaaColor(a.ccaaSlug))}
                      </span>
                      <span className="bench-ayto-num-col">{a.debtPerCapita.toLocaleString("es-ES")} €</span>
                      <span className="bench-ayto-num-col">{a.investmentPct.toFixed(1)}%</span>
                      <span className="bench-ayto-num-col">{a.ownRevenuePct.toFixed(1)}%</span>
                      <span className="bench-ayto-num-col">{a.employeesPerThousand}/1k hab</span>
                    </div>
                  );
                })}
              </div>

              {/* Detail cards for top 6 */}
              <h3 className="bench-section-title" style={{ marginTop: 32 }}>Desglose presupuestario — Top {Math.min(6, sortedAytos.length)}</h3>
              <div className="bench-ayto-detail-grid">
                {sortedAytos.slice(0, 6).map((a: any) => (
                  <div key={a.slug} className="bench-ayto-detail-card">
                    <h4 className="bench-ayto-detail-name" style={{ color: ccaaColor(a.ccaaSlug) }}>
                      {a.name.replace("Ayuntamiento de ", "")}
                    </h4>
                    <div className="bench-ayto-detail-kpis">
                      <span>{fmt(a.population, "")} hab</span>
                      <span>{a.totalBudgetM.toLocaleString("es-ES")} M€</span>
                      <span>Deuda: {a.debtPerCapita}€/hab</span>
                    </div>
                    <div className="bench-ayto-spending">
                      {(a.spendingBreakdown ?? []).map((s: any, i: number) => (
                        <div key={i} className="bench-ayto-spend-row">
                          <span className="bench-ayto-spend-label">{s.category}</span>
                          <div className="bench-ayto-spend-bar">
                            <div className="bench-ayto-spend-fill" style={{ width: `${s.pctOfBudget * 3}%`, background: ccaaColor(a.ccaaSlug) }} />
                          </div>
                          <span className="bench-ayto-spend-pct">{s.pctOfBudget.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ PERFIL COMPLETO (radar-style indicators) ═══ */}
          {view === "radar" && (
            <section className="bench-section">
              <h2 className="bench-section-title">Perfil Completo por CCAA</h2>
              <p className="bench-section-desc">
                Cada CCAA con todos sus indicadores, sem{"á"}foro de salud territorial y posición en el ranking nacional.
              </p>

              <div className="bench-profile-grid">
                {ccaa.map((c: any) => {
                  const fields = [
                    { key: "gdpPerCapita", label: "PIB/hab", unit: "€", better: "high" },
                    { key: "gdpGrowthPct", label: "Crecimiento", unit: "%", better: "high" },
                    { key: "unemploymentRate", label: "Paro", unit: "%", better: "low" },
                    { key: "youthUnemploymentRate", label: "Paro joven", unit: "%", better: "low" },
                    { key: "averageSalary", label: "Salario", unit: "€", better: "high" },
                    { key: "povertyRiskRate", label: "Pobreza", unit: "%", better: "low" },
                    { key: "rentAvgMonthly", label: "Alquiler", unit: "€/mes", better: "low" },
                    { key: "debtPctGdp", label: "Deuda/PIB", unit: "%", better: "low" },
                  ];
                  return (
                    <div key={c.slug} className="bench-profile-card">
                      <div className="bench-profile-header">
                        <span className="bench-profile-name" style={{ color: ccaaColor(c.slug) }}>{c.name}</span>
                        <span className={`bench-profile-health bench-health-${c.healthStatus}`}>{c.healthScore}</span>
                      </div>
                      <div className="bench-profile-pop">{fmt(c.population, "")} hab · {c.totalBudgetM.toLocaleString("es-ES")} M€</div>
                      <div className="bench-profile-indicators">
                        {fields.map((f) => {
                          const val = c[f.key];
                          const natVal = national?.[f.key];
                          const isGood = natVal != null && (f.better === "high" ? val >= natVal : val <= natVal);
                          return (
                            <div key={f.key} className="bench-profile-ind">
                              <span className="bench-profile-ind-label">{f.label}</span>
                              <span className={`bench-profile-ind-value ${isGood ? "bench-good" : "bench-bad"}`}>
                                {fmt(val, f.unit)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ CONTEXTO UE ═══ */}
          {view === "eu" && (
            <section className="bench-section">
              <h2 className="bench-section-title">Espa{"ñ"}a en Contexto Europeo</h2>
              <p className="bench-section-desc">
                Indicadores clave de Espa{"ñ"}a vs UE-27 y pa{"í"}ses comparables. Fuente: Eurostat {meta?.fiscalYear ?? 2026}.
              </p>

              <div className="bench-eu-table">
                <div className="bench-eu-header">
                  <span className="bench-eu-ind-col">Indicador</span>
                  <span className="bench-eu-val-col">🇪🇸 España</span>
                  <span className="bench-eu-val-col">🇪🇺 UE-27</span>
                  <span className="bench-eu-val-col">🇩🇪 Alemania</span>
                  <span className="bench-eu-val-col">🇫🇷 Francia</span>
                  <span className="bench-eu-val-col">🇮🇹 Italia</span>
                  <span className="bench-eu-val-col">🇵🇹 Portugal</span>
                </div>
                {euCtx.map((e: any, i: number) => {
                  const isGood = e.higherIsBetter ? e.spain >= e.eu27 : e.spain <= e.eu27;
                  return (
                    <div key={i} className="bench-eu-row">
                      <span className="bench-eu-ind-col">{e.indicator} <small>({e.unit})</small></span>
                      <span className={`bench-eu-val-col bench-eu-spain ${isGood ? "bench-good" : "bench-bad"}`}>{e.spain}</span>
                      <span className="bench-eu-val-col">{e.eu27}</span>
                      <span className="bench-eu-val-col">{e.germany}</span>
                      <span className="bench-eu-val-col">{e.france}</span>
                      <span className="bench-eu-val-col">{e.italy}</span>
                      <span className="bench-eu-val-col">{e.portugal}</span>
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
