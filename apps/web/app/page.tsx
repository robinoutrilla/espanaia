/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getBudgetSummary,
  getLatestBudgetSnapshots,
  officialConnectors,
  parties,
  politicians,
  seedGeneratedAt,
  territories,
  budgetSnapshots,
  parliamentaryInitiatives,
  featuredSignals,
} from "@espanaia/seed-data";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { SpainMapAmcharts } from "../components/spain-map-amcharts";
import type { MapTerritory } from "../components/spain-map";
import { T } from "../components/t";
import { getPoliticalCensusSnapshot } from "../lib/political-census";
import { territoryShields, partyColors, partyLogos, proxyImg } from "../lib/visual-data";
import { getUpcomingEvents, eventTypeLabels, eventTypeColors } from "../lib/agenda-data";
import {
  getCoherenceAlerts,
  getTerritoryTrafficLights,
  getPublicMoneyRisk,
  getEuGaps,
  getTransparencyTracker,
  getNgeuTracker,
  getPowerConcentration,
  getBudgetAnalysis,
} from "../lib/insights-data";
import { totalRevenue2026, totalSpending2026 } from "../lib/finance-data";
import { getTrending } from "../lib/rss-trending";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const budgetSummary = getBudgetSummary();
const budgetYearRange = (() => {
  const years = [...new Set(budgetSnapshots.map((s) => s.fiscalYear))].sort();
  return { from: years[0], to: years[years.length - 1], count: years.length };
})();
const topTerritories = [...territories].sort((a, b) => b.pulseScore - a.pulseScore).slice(0, 6);
const topParties = parties.slice(0, 6);
const latestBudgets = getLatestBudgetSnapshots();
const upcomingEvents = getUpcomingEvents(5);
const coherenceAlerts = getCoherenceAlerts();
const trafficLights = getTerritoryTrafficLights();
const moneyRisk = getPublicMoneyRisk();
const euGaps = getEuGaps();
const transparencyTracker = getTransparencyTracker();
const ngeuTracker = getNgeuTracker();
const powerConcentration = getPowerConcentration();
const budgetAlerts = getBudgetAnalysis();

export default async function HomePage() {
  const [politicalCensus, trending] = await Promise.all([
    getPoliticalCensusSnapshot(),
    getTrending(15),
  ]);
  const officialPoliticalCount = politicalCensus?.total ?? politicians.length;
  const seedDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(seedGeneratedAt));

  /* Build map data by merging territories with budget + traffic light indicators */
  const mapTerritories: MapTerritory[] = territories
    .filter((t) => t.kind !== "state")
    .map((t) => {
      const budget = latestBudgets.find((b) => b.territorySlug === t.slug);
      const tl = trafficLights.find((x) => x.territorySlug === t.slug);
      const indicators: MapTerritory["indicators"] = [];
      if (budget) {
        indicators.push({
          label: "Ejecución presupuestaria",
          value: `${budget.executionRate}%`,
          color: budget.executionRate > 70 ? "var(--verde)" : budget.executionRate > 50 ? "var(--oro)" : "var(--rojo)",
        });
        indicators.push({
          label: "Tendencia",
          value: budget.trend === "up" ? "↑ Aceleración" : budget.trend === "down" ? "↓ Presión" : "→ Estable",
          color: budget.trend === "up" ? "var(--verde)" : budget.trend === "down" ? "var(--rojo)" : "var(--ink-muted)",
        });
      }
      if (tl) {
        indicators.push({
          label: "Semáforo territorial",
          value: `${tl.score > 0 ? "+" : ""}${tl.score}`,
          color: tl.status === "green" ? "var(--verde)" : tl.status === "red" ? "var(--rojo)" : "var(--oro)",
        });
        if (tl.metrics[0]) {
          indicators.push({
            label: tl.metrics[0].label,
            value: `${tl.metrics[0].value}%`,
            color: tl.metrics[0].status === "good" ? "var(--verde)" : tl.metrics[0].status === "bad" ? "var(--rojo)" : "var(--oro)",
          });
        }
      }
      indicators.push({ label: "Pulse score", value: `${t.pulseScore}/100`, color: "var(--azul)" });
      return {
        slug: t.slug,
        name: t.name,
        shortCode: t.shortCode,
        pulseScore: t.pulseScore,
        href: `/territories/${t.slug}`,
        indicators,
      };
    });

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" }).format(d);
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="home" />

      {/* ── Hero ── */}
      <section className="panel hero-panel">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><T k="home.eyebrow" /></span>
            <h1><T k="home.title" /></h1>
            <p className="hero-description">
              <T k="home.description" />
            </p>
            <div className="hero-actions">
              <Link className="hero-button hero-button-primary" href="/research">
                <T k="home.cta1" />
              </Link>
              <Link className="hero-button hero-button-secondary" href="/sources">
                <T k="home.cta2" />
              </Link>
              <Link className="hero-button hero-button-accent" href="/predicciones">
                <T k="home.cta3" />
              </Link>
            </div>
          </div>

          <aside className="control-panel">
            <span className="eyebrow">Resumen · {seedDate}</span>
            <div className="control-metrics">
              <div>
                <strong>{officialPoliticalCount}</strong>
                <span><T k="home.indexed" /></span>
              </div>
              <div>
                <strong>{territories.length}</strong>
                <span><T k="home.territories" /></span>
              </div>
              <div>
                <strong>{officialConnectors.length}</strong>
                <span><T k="home.officialSources" /></span>
              </div>
            </div>
            <div className="control-metrics">
              <div>
                <strong>{budgetSummary.averageExecutionRate}%</strong>
                <span><T k="home.avgExecution" /></span>
              </div>
              <div>
                <strong>{budgetYearRange.count}</strong>
                <span><T k="home.yearsOfData" /></span>
              </div>
              <div>
                <strong>{parliamentaryInitiatives.length}</strong>
                <span><T k="home.initiatives" /></span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Navigation cards ── */}
      <section className="directory-grid">
        <Link className="directory-card" href="/territories">
          <div className="directory-card-heading">
            <span className="eyebrow"><T k="home.atlas" /></span>
            <strong>{territories.length}</strong>
          </div>
          <h3><T k="home.territoriesTitle" /></h3>
          <p><T k="home.territoriesDesc" /></p>
        </Link>
        <Link className="directory-card" href="/parties">
          <div className="directory-card-heading">
            <span className="eyebrow"><T k="home.actors" /></span>
            <strong>{parties.length}</strong>
          </div>
          <h3><T k="home.partiesTitle" /></h3>
          <p><T k="home.partiesDesc" /></p>
        </Link>
        <Link className="directory-card" href="/politicians">
          <div className="directory-card-heading">
            <span className="eyebrow"><T k="home.census" /></span>
            <strong>{officialPoliticalCount}</strong>
          </div>
          <h3><T k="home.politiciansTitle" /></h3>
          <p><T k="home.politiciansDesc" /></p>
        </Link>
      </section>

      {/* ── Interactive Map of Spain ── */}
      <section className="panel section-panel" style={{ maxWidth: 1400, margin: "0 auto", width: "calc(100% - 40px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--azul)" }}>MAPA INTERACTIVO</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              España en un vistazo
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.82rem", marginTop: 4 }}>
              Pulse score, ejecución presupuestaria e indicadores clave de cada comunidad autónoma. Haz click para explorar.
            </p>
          </div>
          <Link className="hero-button hero-button-secondary" href="/territories" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver todos →
          </Link>
        </div>
        <SpainMapAmcharts territories={mapTerritories} />
      </section>

      {/* ── Trending from RSS ── */}
      {trending.length > 0 && (
        <section className="panel section-panel trending-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--rojo)" }}>EN LOS MEDIOS</span>
            <h2 className="insight-title">Temas del día en España</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              Titulares de {new Set(trending.map(t => t.source)).size} fuentes con enlaces a nuestros datos.
            </p>
          </div>
          <div className="trending-grid">
            {trending.slice(0, 6).map((item, i) => (
              <article className="trending-card" key={i}>
                <div className="trending-card-header">
                  <span className={`trending-source trending-source-${item.sourceCategory}`}>
                    {item.source}
                  </span>
                  {item.pubDate && (
                    <time className="trending-time" dateTime={item.pubDate}>
                      {(() => {
                        try {
                          return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.pubDate));
                        } catch { return ""; }
                      })()}
                    </time>
                  )}
                </div>
                <a className="trending-title" href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                {item.matches.length > 0 && (
                  <div className="trending-matches">
                    {item.matches.map((m) => (
                      <Link
                        key={m.slug}
                        className={`trending-match trending-match-${m.type}`}
                        href={m.href}
                      >
                        {m.type === "politician" ? "👤" : m.type === "party" ? "🏛" : "📍"} {m.name}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link className="hero-button hero-button-secondary" href="/medios" style={{ display: "inline-flex" }}>
              Ver todas las noticias →
            </Link>
          </div>
        </section>
      )}

      {/* ── Budget radar ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Presupuestos</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              Ejecución presupuestaria {budgetYearRange.to}
            </h2>
            <p style={{ color: "var(--oro)", fontSize: "0.78rem", fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--oro)" }} />
              Proyección estimada — España opera con presupuestos prorrogados desde 2023
            </p>
          </div>
          <Link className="hero-button hero-button-secondary" href="/finanzas" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver todos →
          </Link>
        </div>
        <div className="budget-radar-grid">
          {latestBudgets.map((snap) => {
            const terr = territories.find(t => t.slug === snap.territorySlug);
            if (!terr) return null;
            const shield = territoryShields[terr.slug];
            const trendLabel = snap.trend === "up" ? "Aceleración" : snap.trend === "down" ? "Presión" : "Estable";
            const trendClass = snap.trend === "up" ? "tag-up" : snap.trend === "down" ? "tag-down" : "tag-flat";
            return (
              <Link className="budget-radar-card" href={`/territories/${terr.slug}`} key={snap.territorySlug}>
                <div className="budget-radar-top">
                  <div className="territory-shield-row">
                    {shield ? (
                      <img className="territory-shield" src={proxyImg(shield)} alt={terr.name} width={20} loading="lazy" />
                    ) : null}
                    <span style={{ fontWeight: 600 }}>{terr.shortCode}</span>
                  </div>
                  <span className={`tag ${trendClass}`}>{trendLabel}</span>
                </div>
                <h3>{terr.name}</h3>
                <div className="representation-bar-wrap">
                  <div className="representation-bar" style={{ width: `${snap.executionRate}%`, background: snap.trend === "up" ? "var(--verde)" : snap.trend === "down" ? "var(--rojo)" : "var(--oro)" }} />
                  <span className="representation-label">{snap.executionRate}% ejecutado</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--ink-muted)" }}>
                  <span>{snap.variationVsPlan > 0 ? "+" : ""}{snap.variationVsPlan}% vs plan</span>
                  <span>{snap.highlightedPrograms[0]?.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ INSIGHT SECTIONS ═══ */}

      {/* ── 1. Alerta de Coherencia ── */}
      {coherenceAlerts.length > 0 ? (
        <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--rojo)" }}>ANÁLISIS CRÍTICO</span>
            <h2 className="insight-title">Alerta de Coherencia</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Contradicciones entre posiciones públicas y comportamiento de voto en el Congreso.</p>
          </div>
          <div className="insight-grid">
            {coherenceAlerts.map((alert, i) => (
              <div className="insight-alert-card" key={i} style={{ borderLeft: `4px solid ${alert.severity === "high" ? "var(--rojo)" : alert.severity === "medium" ? "var(--oro)" : "var(--ink-muted)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="tag" style={{ background: alert.severity === "high" ? "var(--rojo-soft)" : "var(--oro-soft)", color: alert.severity === "high" ? "var(--rojo)" : "var(--oro)" }}>
                    {alert.type === "contradiction" ? "Contradicción" : alert.type === "surprise" ? "Sorpresa" : "Abstención evasiva"}
                  </span>
                  <strong style={{ fontSize: "0.82rem" }}>{alert.partyName}</strong>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", margin: 0 }}>{alert.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── 1b. Análisis Presupuestario ── */}
      {budgetAlerts.length > 0 ? (
        <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--rojo)" }}>ANÁLISIS PRESUPUESTARIO</span>
            <h2 className="insight-title">Alertas Fiscales 2026</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              Radiografía crítica de los Presupuestos Generales del Estado: ingresos {totalRevenue2026.toFixed(0)} Md€ vs gasto {totalSpending2026.toFixed(0)} Md€.
            </p>
          </div>
          <div className="ngeu-summary-row" style={{ marginBottom: 16 }}>
            <div className="ngeu-summary-card">
              <span>Ingresos totales</span>
              <strong style={{ color: "var(--verde)" }}>{totalRevenue2026.toFixed(1)} Md€</strong>
            </div>
            <div className="ngeu-summary-card">
              <span>Gasto total</span>
              <strong style={{ color: "var(--rojo)" }}>{totalSpending2026.toFixed(1)} Md€</strong>
            </div>
            <div className="ngeu-summary-card">
              <span>Déficit</span>
              <strong style={{ color: "var(--rojo)" }}>−{(totalSpending2026 - totalRevenue2026).toFixed(1)} Md€</strong>
            </div>
            <div className="ngeu-summary-card">
              <span>Alertas detectadas</span>
              <strong style={{ color: budgetAlerts.filter(a => a.severity === "critical").length > 0 ? "var(--rojo)" : "var(--oro)" }}>
                {budgetAlerts.length}
              </strong>
            </div>
          </div>
          <div className="insight-grid">
            {budgetAlerts.map((alert) => {
              const sevColor = alert.severity === "critical" ? "var(--rojo)" : alert.severity === "high" ? "var(--oro)" : alert.severity === "medium" ? "var(--azul)" : "var(--ink-muted)";
              const sevBg = alert.severity === "critical" ? "var(--rojo-soft)" : alert.severity === "high" ? "var(--oro-soft)" : "var(--azul-soft, rgba(37,99,235,0.1))";
              const sevLabel = alert.severity === "critical" ? "CRÍTICO" : alert.severity === "high" ? "ALTO" : alert.severity === "medium" ? "MEDIO" : "BAJO";
              const typeLabel = alert.type === "deficit" ? "Déficit" : alert.type === "deuda" ? "Deuda" : alert.type === "presion-gasto" ? "Gasto" : alert.type === "territorio" ? "Territorio" : alert.type === "ngeu" ? "NGEU" : "Dependencia";
              const trendIcon = alert.trend === "up" ? "↑" : alert.trend === "down" ? "↓" : "→";
              return (
                <div className="insight-alert-card" key={alert.id} style={{ borderLeft: `4px solid ${sevColor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="tag" style={{ background: sevBg, color: sevColor }}>{sevLabel}</span>
                      <span className="tag" style={{ background: "var(--surface-alt, #f3f4f6)", color: "var(--ink-soft)" }}>{typeLabel}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: sevColor, fontSize: "0.82rem" }}>{trendIcon} {alert.value}</span>
                  </div>
                  <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: 4 }}>{alert.title}</strong>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>{alert.explanation}</p>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link className="hero-button hero-button-secondary" href="/finanzas" style={{ display: "inline-flex" }}>
              Ver análisis financiero completo →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── 2. Semáforo Territorial ── */}
      <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--verde)" }}>SEMÁFORO TERRITORIAL</span>
          <h2 className="insight-title">Estado de las Comunidades Autónomas</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Indicadores clave comparados con la media nacional. Verde = mejor que la media, rojo = peor.</p>
        </div>
        <div className="traffic-light-grid">
          {trafficLights.slice(0, 6).map((tl) => (
            <div className="traffic-light-card" key={tl.territorySlug} style={{ borderTop: `4px solid ${tl.status === "green" ? "var(--verde)" : tl.status === "red" ? "var(--rojo)" : "var(--oro)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.88rem" }}>{tl.name}</strong>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: tl.status === "green" ? "var(--verde)" : tl.status === "red" ? "var(--rojo)" : "var(--oro)" }}>
                  {tl.score > 0 ? "+" : ""}{tl.score}
                </span>
              </div>
              <div className="traffic-metrics">
                {tl.metrics.map((m) => (
                  <div key={m.label} className="traffic-metric">
                    <span>{m.label}</span>
                    <strong style={{ color: m.status === "good" ? "var(--verde)" : m.status === "bad" ? "var(--rojo)" : "var(--oro)" }}>{m.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link className="hero-button hero-button-secondary" href="/indicadores" style={{ display: "inline-flex" }}>
            Ver las {trafficLights.length} comunidades →
          </Link>
        </div>
      </section>

      {/* ── 3. Dinero Público en Riesgo ── */}
      <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--rojo)" }}>DINERO PÚBLICO EN RIESGO</span>
          <h2 className="insight-title">{moneyRisk.totalQuestioned.toLocaleString("es-ES")} M€ cuestionados</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Informes del Tribunal de Cuentas: hallazgos críticos, entidades peor valoradas y puntuación de rendición de cuentas.</p>
        </div>
        <div className="ngeu-summary-row" style={{ marginBottom: 16 }}>
          <div className="ngeu-summary-card">
            <span>Hallazgos críticos</span>
            <strong style={{ color: "var(--rojo)" }}>{moneyRisk.criticalFindings}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span>Contratos &gt;50M€</span>
            <strong>{moneyRisk.noCompetitionContracts}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span>Puntuación rendición</span>
            <strong style={{ color: moneyRisk.accountabilityScore < 50 ? "var(--rojo)" : moneyRisk.accountabilityScore < 70 ? "var(--oro)" : "var(--verde)" }}>
              {moneyRisk.accountabilityScore}/100
            </strong>
          </div>
        </div>
        <div className="insight-grid">
          {moneyRisk.worstEntities.slice(0, 4).map((e, i) => (
            <div className="insight-alert-card" key={i} style={{ borderLeft: "4px solid var(--rojo)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span className="tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)" }}>{e.rating}</span>
                {e.questionedM > 0 ? <strong style={{ fontFamily: "var(--font-mono)", color: "var(--rojo)" }}>{e.questionedM} M€</strong> : null}
              </div>
              <p style={{ fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>{e.name}</p>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{e.findings} hallazgos</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link className="hero-button hero-button-secondary" href="/contratacion" style={{ display: "inline-flex" }}>
            Ver todos los informes →
          </Link>
        </div>
      </section>

      {/* ── 4. Brecha España-Europa ── */}
      {euGaps.length > 0 ? (
        <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--azul)" }}>BRECHA ESPAÑA-EUROPA</span>
            <h2 className="insight-title">Donde España queda peor que la UE-27</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Indicadores Eurostat donde España se sitúa por debajo de la media europea.</p>
          </div>
          <div className="eu-gap-list">
            {euGaps.slice(0, 5).map((gap, i) => (
              <div className="eu-gap-card" key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.88rem" }}>{gap.indicator}</strong>
                  <span className="tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)" }}>{gap.rank}/{gap.totalCountries}</span>
                </div>
                <div className="eu-gap-bar-wrap">
                  <div className="eu-gap-values">
                    <span>España: <strong>{gap.spainValue} {gap.unit}</strong></span>
                    <span>UE-27: <strong>{gap.eu27Value} {gap.unit}</strong></span>
                  </div>
                  <div className="eu-gap-bar">
                    <div className="eu-gap-bar-spain" style={{ width: `${Math.min(Math.abs(gap.spainValue / Math.max(gap.eu27Value, 0.01)) * 50, 100)}%` }} />
                    <div className="eu-gap-bar-eu" style={{ width: "50%" }} />
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>Brecha: {gap.gap > 0 ? "+" : ""}{gap.gap} {gap.unit} ({gap.gapPct > 0 ? "+" : ""}{gap.gapPct}%)</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link className="hero-button hero-button-secondary" href="/europa" style={{ display: "inline-flex" }}>
              Ver todos los indicadores EU →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── 5. Transparencia Tracker ── */}
      <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--oro)" }}>TRANSPARENCIA TRACKER</span>
          <h2 className="insight-title">{transparencyTracker.complianceRate}% de cargos con declaración</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Seguimiento de declaraciones de bienes. {transparencyTracker.withoutDeclaration} cargos sin declaración publicada.</p>
        </div>
        <div className="ngeu-summary-row" style={{ marginBottom: 16 }}>
          <div className="ngeu-summary-card">
            <span>Con declaración</span>
            <strong style={{ color: "var(--verde)" }}>{transparencyTracker.withDeclaration}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span>Sin declaración</span>
            <strong style={{ color: "var(--rojo)" }}>{transparencyTracker.withoutDeclaration}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span>Ingreso medio declarado</span>
            <strong>{transparencyTracker.averageIncome.toLocaleString("es-ES")} €</strong>
          </div>
        </div>
        <div className="indicator-table-wrap">
          <table className="indicator-table">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Inmuebles</th>
                <th>Depósitos</th>
                <th>Ingresos anuales</th>
              </tr>
            </thead>
            <tbody>
              {transparencyTracker.highestAssets.map((p) => (
                <tr key={p.name}>
                  <td style={{ fontWeight: 600, textTransform: "capitalize" }}>{p.name}</td>
                  <td>{p.realEstate}</td>
                  <td>{p.deposits}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{p.income.toLocaleString("es-ES")} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link className="hero-button hero-button-secondary" href="/transparencia" style={{ display: "inline-flex" }}>
            Ver todas las declaraciones →
          </Link>
        </div>
      </section>

      {/* ── 6. Fondos NGEU ── */}
      <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--azul)" }}>FONDOS NGEU: PROMESAS VS EJECUCIÓN</span>
          <h2 className="insight-title">{ngeuTracker.executionRate}% ejecutado de {ngeuTracker.totalAllocated} Md€</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Estado de los PERTEs y desembolsos del Plan de Recuperación.</p>
        </div>
        <div className="representation-bar-wrap" style={{ height: 16, marginBottom: 16 }}>
          <div className="representation-bar" style={{ width: `${ngeuTracker.executionRate}%`, background: ngeuTracker.executionRate > 60 ? "var(--verde)" : "var(--oro)" }} />
          <span className="representation-label">{ngeuTracker.executionRate}% desembolsado</span>
        </div>
        <div className="insight-grid">
          {ngeuTracker.perteStatus.map((p) => (
            <div className="insight-alert-card" key={p.name} style={{ borderLeft: `4px solid ${p.pct > 40 ? "var(--verde)" : p.pct > 30 ? "var(--oro)" : "var(--rojo)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong style={{ fontSize: "0.82rem" }}>{p.name}</strong>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: p.pct > 40 ? "var(--verde)" : p.pct > 30 ? "var(--oro)" : "var(--rojo)" }}>{p.pct}%</span>
              </div>
              <div className="representation-bar-wrap" style={{ height: 6 }}>
                <div className="representation-bar" style={{ width: `${p.pct}%`, background: p.pct > 40 ? "var(--verde)" : p.pct > 30 ? "var(--oro)" : "var(--rojo)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--ink-muted)", marginTop: 4 }}>
                <span>Asignado: {(p.allocated / 1000).toFixed(1)} Md€</span>
                <span>Ejecutado: {(p.executed / 1000).toFixed(1)} Md€</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Concentración de Poder ── */}
      <section className="panel section-panel insight-section" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--ink)" }}>CONCENTRACIÓN DE PODER</span>
          <h2 className="insight-title">Mapa de control político</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>Qué partidos controlan qué instituciones: Congreso, parlamentos autonómicos y gobiernos regionales.</p>
        </div>
        <div className="power-grid">
          {powerConcentration.map((p) => {
            const color = partyColors[p.partySlug] ?? "var(--ink-muted)";
            return (
              <div className="power-card" key={p.partySlug} style={{ borderLeft: `4px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong>{p.partyName}</strong>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color, fontSize: "1.1rem" }}>{p.powerIndex}</span>
                </div>
                <div className="power-stats">
                  <div><span>Congreso</span><strong>{p.congressSeats}</strong></div>
                  <div><span>CCAA escaños</span><strong>{p.totalCcaaSeats}</strong></div>
                  <div><span>Gobierna en</span><strong>{p.ccaaGoverning.length} CCAA</strong></div>
                </div>
                {p.ccaaGoverning.length > 0 ? (
                  <div className="vote-tags" style={{ marginTop: 6 }}>
                    {p.ccaaGoverning.slice(0, 4).map((g) => <span className="micro-tag" key={g}>{g}</span>)}
                    {p.ccaaGoverning.length > 4 ? <span className="micro-tag">+{p.ccaaGoverning.length - 4}</span> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Laws & initiatives ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Actividad legislativa</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              Iniciativas parlamentarias
            </h2>
          </div>
          <Link className="hero-button hero-button-secondary" href="/votaciones" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver todas →
          </Link>
        </div>
        <div className="laws-list">
          {parliamentaryInitiatives.map((initiative) => {
            const statusColor = initiative.status === "Cerrado" ? "var(--verde)" : "var(--azul)";
            return (
              <article className="law-card" key={initiative.id}>
                <div className="law-card-top">
                  <span className="tag" style={{ background: `${statusColor}15`, color: statusColor }}>
                    {initiative.status === "Cerrado" ? "Aprobado" : "En trámite"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{initiative.dossierNumber}</span>
                </div>
                <h3>{initiative.title}</h3>
                <div className="law-card-meta">
                  {initiative.commission ? <span className="micro-tag">{initiative.commission}</span> : null}
                  {initiative.partySlugs.slice(0, 3).map((ps) => {
                    const color = partyColors[ps] ?? "var(--ink-muted)";
                    const party = parties.find(p => p.slug === ps);
                    return party ? (
                      <span className="micro-tag" key={ps} style={{ background: `${color}12`, color, borderColor: `${color}30` }}>
                        {party.acronym}
                      </span>
                    ) : null;
                  })}
                  {initiative.territorySlugs.slice(0, 2).map((ts) => {
                    const terr = territories.find(t => t.slug === ts);
                    return terr ? <span className="micro-tag" key={ts}>{terr.shortCode}</span> : null;
                  })}
                </div>
                {initiative.result ? (
                  <p style={{ fontSize: "0.82rem", color: "var(--verde)", fontWeight: 600 }}>{initiative.result}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Upcoming agenda ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Agenda</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              Próximos eventos
            </h2>
          </div>
          <Link className="hero-button hero-button-secondary" href="/agenda" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver agenda completa →
          </Link>
        </div>
        <div className="agenda-day-events">
          {upcomingEvents.map((event) => {
            const typeColor = eventTypeColors[event.eventType];
            return (
              <article className="agenda-event-card" key={event.id} style={{ borderLeft: `4px solid ${typeColor}` }}>
                <div className="agenda-event-top">
                  <span className="tag" style={{ background: `${typeColor}18`, color: typeColor }}>
                    {eventTypeLabels[event.eventType]}
                  </span>
                  <span className="agenda-event-time">{formatDate(event.date)}{event.time ? ` · ${event.time}h` : ""}</span>
                  <span className="agenda-event-institution">{event.institution}</span>
                </div>
                <h3>{event.title}</h3>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Territories preview ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Territorios</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              Pulso territorial
            </h2>
          </div>
          <Link className="hero-button hero-button-secondary" href="/territories" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver todos →
          </Link>
        </div>
        <div className="territory-grid">
          {topTerritories.map((t) => {
            const shield = territoryShields[t.slug];
            return (
              <Link className="territory-card territory-link-card" href={`/territories/${t.slug}`} key={t.id}>
                <div className="territory-header">
                  <div className="territory-shield-row">
                    {shield ? (
                      <img className="territory-shield" src={proxyImg(shield)} alt={t.name} width={24} loading="lazy" />
                    ) : null}
                    <span>{t.shortCode}</span>
                  </div>
                  <strong className="territory-pulse">{t.pulseScore}</strong>
                </div>
                <h3>{t.name}</h3>
                <p>{t.strategicFocus}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Parties preview ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span className="eyebrow">Actores</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
              Partidos principales
            </h2>
          </div>
          <Link className="hero-button hero-button-secondary" href="/parties" style={{ minHeight: 36, padding: "0 16px", fontSize: "0.82rem" }}>
            Ver todos →
          </Link>
        </div>
        <div className="party-list">
          {topParties.map((party) => {
            const color = partyColors[party.slug] ?? "var(--rojo)";
            const logo = partyLogos[party.slug];
            return (
              <Link className="party-card" href={`/parties/${party.slug}`} key={party.id} style={{ borderLeft: `4px solid ${color}` }}>
                <div className="party-header">
                  {logo ? (
                    <img src={proxyImg(logo)} alt={party.acronym} width={28} loading="lazy" style={{ objectFit: "contain" }} />
                  ) : (
                    <span className="party-logo-badge" style={{ background: `${color}15`, color }}>{party.acronym}</span>
                  )}
                  <span>{party.scopeType === "national" ? "Nacional" : "Regional"}</span>
                </div>
                <h3>{party.shortName}</h3>
                <p>{party.positioning}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter
        sources="BOE, Congreso, Senado, Eurostat, EUR-Lex, INE"
        extra={`Datos: ${seedDate} · ${officialConnectors.length} fuentes · ${budgetYearRange.from}–${budgetYearRange.to}`}
      />
    </main>
  );
}
