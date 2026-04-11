"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Scoring de Riesgo — Riesgo regulatorio y político por territorio y sector.
   Rankings, alertas de riesgo, componentes y dashboard nacional.
   20 diferenciadores competitivos integrados.
   ═══════════════════════════════════════════════════════════════════════════ */

interface SRComponent {
  label: string;
  score: number;
}

interface SRConfidenceInterval { p10: number; p50: number; p90: number }
interface SRStressScenario { name: string; impactOnScore: number; description: string }
interface SRContagionLink { target: string; strength: number }
interface SRScoreHistory { month: string; score: number }
interface SREarlyWarning { signal: string; direction: "up" | "down"; magnitude: number }
interface SRForecast { month: string; projected: number }

interface SRTerritory {
  slug: string;
  name: string;
  overallScore: number;
  riskLevel: string;
  components: SRComponent[];
  trend: string;
  keyRisks: string[];
  opportunities: string[];
  confidenceInterval: SRConfidenceInterval;
  stressScenarios: SRStressScenario[];
  contagionLinks: SRContagionLink[];
  scoreHistory: SRScoreHistory[];
  earlyWarnings: SREarlyWarning[];
  forecast: SRForecast[];
  mediaSentiment: number;
  investmentClimate: number;
}

interface SRSector {
  sector: string;
  name: string;
  overallScore: number;
  regulatoryPressure: number;
  politicalAttention: number;
  complianceCost: number;
  changeVelocity: number;
  keyRegulations: string[];
  outlook: string;
  growthPotential: number;
  complianceCostM: number;
  riskReductionPct: number;
}

interface SRAlert {
  id: string;
  type: string;
  severity: "critico" | "alto" | "medio" | "bajo";
  title: string;
  description: string;
  territories: string[];
  sectors: string[];
  probability: number;
  date: string;
  blackSwan: boolean;
  impactScore: number;
}

interface SRWeeklyPulse { day: string; delta: number }
interface SRSovereign { agency: string; rating: string; outlook: string; equivalentScore: number }
interface SREUPeer { country: string; score: number }
interface SRPoliticalEvent { date: string; event: string; riskImpact: number }
interface SRCorrelation { factor1: string; factor2: string; coefficient: number }

interface SRNational {
  overallScore: number;
  components: SRComponent[];
  stabilityIndex: number;
  fiscalHealth: number;
  euCompliance: number;
  methodology: string;
  weeklyPulse: SRWeeklyPulse[];
  sovereignComparison: SRSovereign[];
  euPeers: SREUPeer[];
  politicalEvents: SRPoliticalEvent[];
}

interface SRData {
  territories: SRTerritory[];
  sectors: SRSector[];
  alerts: SRAlert[];
  national: SRNational;
  correlations: SRCorrelation[];
  stats: { nationalScore: number; highRiskTerritories: number; highPressureSectors: number; activeAlerts: number };
}

type SRView = "territorios" | "sectores" | "alertas" | "nacional" | "matriz" | "proyecciones";

const severityColor: Record<string, string> = { critico: "var(--rojo)", alto: "#e67e22", medio: "#f1c40f", bajo: "var(--ink-muted)" };

function scoreColor(s: number) { return s >= 60 ? "var(--rojo)" : s >= 30 ? "var(--oro)" : "var(--verde)"; }
function sentimentColor(s: number) { return s > 20 ? "var(--verde)" : s < -20 ? "var(--rojo)" : "var(--oro)"; }
function correlationColor(c: number) { return c > 0.5 ? "var(--rojo)" : c > 0 ? "var(--oro)" : c > -0.5 ? "#3498db" : "var(--verde)"; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }

export default function ScoringRiesgoPage() {
  const [data, setData] = useState<SRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SRView>("territorios");
  const [expandedTerritory, setExpandedTerritory] = useState<string | null>(null);
  const [riskAppetite, setRiskAppetite] = useState(50);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("sr-data-v3");
      if (cached) { const p = JSON.parse(cached); if (p.national && p.territories?.[0]?.name) { setData(p); setLoading(false); } }
    } catch {}
    fetch("/api/scoring-riesgo")
      .then((r) => r.json())
      .then((raw) => {
        // Normalize API shape to match page interfaces
        const d = { ...raw } as any;

        // nationalScore → national
        if (d.nationalScore && !d.national) {
          const ns = d.nationalScore;
          d.national = {
            overallScore: ns.overall ?? ns.overallScore ?? 0,
            components: ns.components ?? [],
            stabilityIndex: ns.stabilityIndex ?? 0,
            fiscalHealth: ns.fiscalHealth ?? 0,
            euCompliance: ns.euCompliance ?? 0,
            methodology: ns.methodology ?? d.methodology ?? "",
            weeklyPulse: ns.weeklyPulse ?? [],
            sovereignComparison: ns.sovereignComparison ?? [],
            euPeers: ns.euPeers ?? [],
            politicalEvents: ns.politicalEvents ?? [],
          };
        }

        // Territories: territory → name, components object → array
        const COMP_LABELS: Record<string, string> = {
          politicalStability: "Estabilidad política",
          regulatoryBurden: "Carga regulatoria",
          fiscalHealth: "Salud fiscal",
          economicDynamism: "Dinamismo económico",
          euFundDependency: "Dependencia fondos UE",
          parliamentaryActivity: "Actividad parlamentaria",
        };
        if (Array.isArray(d.territories)) {
          d.territories = d.territories.map((t: any) => ({
            ...t,
            name: t.name ?? t.territory ?? t.slug,
            components: Array.isArray(t.components)
              ? t.components
              : Object.entries(t.components ?? {}).map(([key, val]: [string, any]) => ({
                  label: COMP_LABELS[key] ?? key,
                  score: val,
                })),
          }));
        }

        // Sectors: sector → name
        if (Array.isArray(d.sectors)) {
          d.sectors = d.sectors.map((s: any) => ({
            ...s,
            name: s.name ?? s.sector,
          }));
        }

        // Alerts: affectedTerritories → territories, affectedSectors → sectors
        if (Array.isArray(d.alerts)) {
          d.alerts = d.alerts.map((a: any) => ({
            ...a,
            territories: a.territories ?? a.affectedTerritories ?? [],
            sectors: a.sectors ?? a.affectedSectors ?? [],
          }));
        }

        // Compute stats if missing
        if (!d.stats) {
          const tArr: any[] = d.territories ?? [];
          const sArr: any[] = d.sectors ?? [];
          const aArr: any[] = d.alerts ?? [];
          d.stats = {
            nationalScore: d.national?.overallScore ?? 0,
            highRiskTerritories: tArr.filter((t: any) => t.overallScore >= 50).length,
            highPressureSectors: sArr.filter((s: any) => s.overallScore >= 50).length,
            activeAlerts: aArr.length,
          };
        }

        setData(d as SRData);
        try { sessionStorage.setItem("sr-data-v3", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const territories = data?.territories ?? [];
  const sectors = data?.sectors ?? [];
  const alerts = data?.alerts ?? [];
  const national = data?.national;
  const correlations = data?.correlations ?? [];
  const stats = data?.stats ?? { nationalScore: 0, highRiskTerritories: 0, highPressureSectors: 0, activeAlerts: 0 };

  const sortedTerritories = [...territories].sort((a, b) => b.overallScore - a.overallScore);
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order: Record<string, number> = { critico: 0, alto: 1, medio: 2, bajo: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  // ── Regional divergence analysis (computed) ──
  const territoryScores = territories.map((t) => t.overallScore);
  const avgScore = territoryScores.length > 0 ? territoryScores.reduce((a, b) => a + b, 0) / territoryScores.length : 0;
  const variance = territoryScores.length > 0 ? territoryScores.reduce((sum, s) => sum + (s - avgScore) ** 2, 0) / territoryScores.length : 0;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
  const divergenceIndex = Math.round(stdDev / Math.max(avgScore, 1) * 100);

  // ── Breach count for risk appetite ──
  const breachedTerritories = territories.filter((t) => t.overallScore > riskAppetite);
  const breachedSectors = sectors.filter((s) => s.overallScore > riskAppetite);

  const viewLabels: Record<SRView, string> = {
    territorios: "Territorios",
    sectores: "Sectores",
    alertas: "Alertas",
    nacional: "Nacional",
    matriz: "Matriz Riesgo",
    proyecciones: "Proyecciones",
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="scoring-riesgo" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">SCORING DE RIESGO</span>
        <h1>Riesgo regulatorio y político por territorio y sector</h1>
        <p className="hero-subtitle">
          Evaluación continua del riesgo normativo y político en España. 20 diferenciadores analíticos exclusivos.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value" style={{ color: scoreColor(stats.nationalScore) }}>{stats.nationalScore}</span><span className="kpi-label">Score nacional</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--rojo)" }}>{stats.highRiskTerritories}</span><span className="kpi-label">Territorios alto riesgo</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "#e67e22" }}>{stats.highPressureSectors}</span><span className="kpi-label">Sectores presión alta</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.activeAlerts}</span><span className="kpi-label">Alertas activas</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: divergenceIndex > 25 ? "var(--rojo)" : "var(--verde)" }}>{divergenceIndex}%</span><span className="kpi-label">Divergencia regional</span></div>
        </div>
      </section>

      {/* Risk appetite framework */}
      {data && (
        <div className="sr-appetite-bar">
          <label className="sr-appetite-label">Apetito de riesgo: <strong>{riskAppetite}</strong></label>
          <input type="range" min={10} max={90} value={riskAppetite} onChange={(e) => setRiskAppetite(Number(e.target.value))} className="sr-appetite-slider" />
          <span className="sr-appetite-breaches">
            {breachedTerritories.length} territorios y {breachedSectors.length} sectores superan el umbral
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="sr-view-bar">
        {(Object.keys(viewLabels) as SRView[]).map((v) => (
          <button key={v} className={`sr-tab ${view === v ? "sr-tab-active" : ""}`} onClick={() => setView(v)}>
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ TERRITORIOS ═══ */}
          {view === "territorios" && (
            <section className="sr-section">
              <SectionHeading eyebrow="Ranking territorial" title="Riesgo por comunidad autónoma" description="Puntuación global con Monte Carlo, stress testing, contagio, sentimiento y proyecciones." />
              <div className="sr-territory-table">
                <div className="sr-territory-header">
                  <span className="sr-col-rank">#</span>
                  <span className="sr-col-name">Territorio</span>
                  <span className="sr-col-score">Score</span>
                  <span className="sr-col-ci">IC P10/P90</span>
                  <span className="sr-col-level">Nivel</span>
                  <span className="sr-col-sentiment">Sentim.</span>
                  <span className="sr-col-invest">Inversión</span>
                  <span className="sr-col-trend">Tend.</span>
                </div>
                {sortedTerritories.map((t, i) => {
                  const breached = t.overallScore > riskAppetite;
                  return (
                  <div key={t.slug}>
                    <div className={`sr-territory-row ${breached ? "sr-row-breached" : ""}`} onClick={() => setExpandedTerritory(expandedTerritory === t.slug ? null : t.slug)} style={{ cursor: "pointer" }}>
                      <span className="sr-col-rank">{i + 1}</span>
                      <span className="sr-col-name">{t.name}</span>
                      <span className="sr-col-score" style={{ color: scoreColor(t.overallScore), fontWeight: 700 }}>{t.overallScore}</span>
                      <span className="sr-col-ci">
                        <span className="sr-ci-range">{t.confidenceInterval.p10}–{t.confidenceInterval.p90}</span>
                      </span>
                      <span className="sr-col-level"><span className="sr-level-badge" style={{ background: scoreColor(t.overallScore), color: "#fff" }}>{t.riskLevel}</span></span>
                      <span className="sr-col-sentiment" style={{ color: sentimentColor(t.mediaSentiment) }}>{t.mediaSentiment > 0 ? "+" : ""}{t.mediaSentiment}</span>
                      <span className="sr-col-invest" style={{ color: scoreColor(100 - t.investmentClimate) }}>{t.investmentClimate}</span>
                      <span className="sr-col-trend">{t.trend}</span>
                    </div>
                    {expandedTerritory === t.slug && (
                      <div className="sr-territory-detail">
                        {/* Components */}
                        <div className="sr-detail-components">
                          {t.components.map((c) => (
                            <div key={c.label} className="sr-detail-comp">
                              <span className="sr-detail-comp-label">{c.label}</span>
                              <div className="sr-detail-comp-bar"><div className="sr-detail-comp-fill" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} /></div>
                              <span className="sr-detail-comp-value">{c.score}</span>
                            </div>
                          ))}
                        </div>

                        {/* Monte Carlo confidence interval */}
                        <div className="sr-montecarlo">
                          <strong>Simulación Monte Carlo</strong>
                          <div className="sr-ci-visual">
                            <div className="sr-ci-bar">
                              <div className="sr-ci-range-fill" style={{
                                left: `${t.confidenceInterval.p10}%`,
                                width: `${t.confidenceInterval.p90 - t.confidenceInterval.p10}%`,
                              }} />
                              <div className="sr-ci-median" style={{ left: `${t.confidenceInterval.p50}%` }} />
                            </div>
                            <div className="sr-ci-labels">
                              <span>P10: {t.confidenceInterval.p10}</span>
                              <span>P50: {t.confidenceInterval.p50}</span>
                              <span>P90: {t.confidenceInterval.p90}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stress scenarios */}
                        <div className="sr-stress">
                          <strong>Stress testing</strong>
                          <div className="sr-stress-grid">
                            {t.stressScenarios.map((s) => (
                              <div key={s.name} className="sr-stress-card">
                                <div className="sr-stress-header">
                                  <span className="sr-stress-name">{s.name}</span>
                                  <span className="sr-stress-impact" style={{ color: "var(--rojo)" }}>+{s.impactOnScore}pts</span>
                                </div>
                                <p className="sr-stress-desc">{s.description}</p>
                                <div className="sr-stress-bar">
                                  <div className="sr-stress-current" style={{ width: `${t.overallScore}%`, background: scoreColor(t.overallScore) }} />
                                  <div className="sr-stress-delta" style={{ width: `${s.impactOnScore}%`, background: "var(--rojo)", opacity: 0.5 }} />
                                </div>
                                <span className="sr-stress-result">{t.overallScore} → {Math.min(100, t.overallScore + s.impactOnScore)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contagion links */}
                        {t.contagionLinks.length > 0 && (
                          <div className="sr-contagion">
                            <strong>Mapa de contagio</strong>
                            <div className="sr-contagion-links">
                              {t.contagionLinks.map((l) => (
                                <div key={l.target} className="sr-contagion-link">
                                  <span className="sr-contagion-target">{l.target}</span>
                                  <div className="sr-contagion-bar">
                                    <div className="sr-contagion-fill" style={{ width: `${l.strength * 100}%`, opacity: 0.4 + l.strength * 0.6 }} />
                                  </div>
                                  <span className="sr-contagion-strength">{Math.round(l.strength * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Score history (12 months) */}
                        <div className="sr-history">
                          <strong>Evolución 12 meses</strong>
                          <div className="sr-sparkline">
                            {t.scoreHistory.map((h, idx) => (
                              <div key={h.month} className="sr-spark-col" title={`${h.month}: ${h.score}`}>
                                <div className="sr-spark-bar" style={{ height: `${h.score}%`, background: scoreColor(h.score) }} />
                                {idx % 3 === 0 && <span className="sr-spark-label">{h.month}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Early warnings */}
                        {t.earlyWarnings.length > 0 && (
                          <div className="sr-early-warnings">
                            <strong>Señales de alerta temprana</strong>
                            <div className="sr-ew-list">
                              {t.earlyWarnings.map((w) => (
                                <div key={w.signal} className="sr-ew-item">
                                  <span className={`sr-ew-arrow ${w.direction === "up" ? "sr-ew-up" : "sr-ew-down"}`}>{w.direction === "up" ? "\u2191" : "\u2193"}</span>
                                  <span className="sr-ew-signal">{w.signal}</span>
                                  <div className="sr-ew-bar"><div className="sr-ew-fill" style={{ width: `${w.magnitude}%`, background: w.direction === "up" ? "var(--rojo)" : "var(--verde)" }} /></div>
                                  <span className="sr-ew-mag">{w.magnitude}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Forward forecast */}
                        <div className="sr-forecast-section">
                          <strong>Proyección 6 meses</strong>
                          <div className="sr-sparkline">
                            {t.forecast.map((f) => (
                              <div key={f.month} className="sr-spark-col" title={`${f.month}: ${f.projected}`}>
                                <div className="sr-spark-bar sr-spark-forecast" style={{ height: `${f.projected}%`, background: scoreColor(f.projected) }} />
                                <span className="sr-spark-label">{f.month}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key risks & opportunities */}
                        <div className="sr-detail-risks">
                          <strong>Riesgos clave:</strong>
                          <div className="sr-detail-tags">{t.keyRisks.map((r) => <span key={r} className="sr-tag sr-tag-risk">{r}</span>)}</div>
                        </div>
                        <div className="sr-detail-opportunities">
                          <strong>Oportunidades:</strong>
                          <div className="sr-detail-tags">{t.opportunities.map((o) => <span key={o} className="sr-tag sr-tag-opp">{o}</span>)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ SECTORES ═══ */}
          {view === "sectores" && (
            <section className="sr-section">
              <SectionHeading eyebrow="Riesgo sectorial" title="Presión regulatoria por sector" description="Componentes de riesgo, coste-beneficio del cumplimiento y potencial de crecimiento ajustado." />
              <div className="sr-grid">
                {sectors.map((s) => {
                  const breached = s.overallScore > riskAppetite;
                  const riskAdjustedAttr = Math.round((s.growthPotential * (100 - s.overallScore)) / 100);
                  return (
                  <div key={s.sector} className={`sr-sector-card ${breached ? "sr-card-breached" : ""}`}>
                    <div className="sr-sector-header">
                      <h3 className="sr-card-title">{s.name}</h3>
                      <div className="sr-score-circle" style={{ borderColor: scoreColor(s.overallScore) }}>
                        <span style={{ color: scoreColor(s.overallScore) }}>{s.overallScore}</span>
                      </div>
                    </div>
                    <div className="sr-sector-bars">
                      {([
                        ["Presión regulatoria", s.regulatoryPressure],
                        ["Atención política", s.politicalAttention],
                        ["Coste cumplimiento", s.complianceCost],
                        ["Velocidad cambio", s.changeVelocity],
                      ] as [string, number][]).map(([label, val]) => (
                        <div key={label} className="sr-sector-bar-row">
                          <span className="sr-sector-bar-label">{label}</span>
                          <div className="sr-sector-bar"><div className="sr-sector-bar-fill" style={{ width: `${val}%`, background: scoreColor(val) }} /></div>
                          <span className="sr-sector-bar-val">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Growth potential + risk-adjusted attractiveness */}
                    <div className="sr-sector-growth">
                      <div className="sr-growth-row">
                        <span className="sr-growth-label">Potencial crecimiento</span>
                        <div className="sr-growth-bar"><div className="sr-growth-fill" style={{ width: `${s.growthPotential}%`, background: "var(--verde)" }} /></div>
                        <span className="sr-growth-val">{s.growthPotential}</span>
                      </div>
                      <div className="sr-growth-row">
                        <span className="sr-growth-label">Atractivo ajustado</span>
                        <div className="sr-growth-bar"><div className="sr-growth-fill" style={{ width: `${riskAdjustedAttr}%`, background: "var(--azul)" }} /></div>
                        <span className="sr-growth-val">{riskAdjustedAttr}</span>
                      </div>
                    </div>

                    {/* Compliance cost-benefit */}
                    <div className="sr-compliance-cb">
                      <div className="sr-cb-item">
                        <span className="sr-cb-label">Coste cumplimiento</span>
                        <span className="sr-cb-value">{s.complianceCostM} M€</span>
                      </div>
                      <div className="sr-cb-item">
                        <span className="sr-cb-label">Reducción riesgo</span>
                        <span className="sr-cb-value" style={{ color: "var(--verde)" }}>-{s.riskReductionPct}%</span>
                      </div>
                      <div className="sr-cb-item">
                        <span className="sr-cb-label">Coste por punto</span>
                        <span className="sr-cb-value">{Math.round(s.complianceCostM / Math.max(s.riskReductionPct, 1))} M€/pp</span>
                      </div>
                    </div>

                    <div className="sr-sector-regs">{s.keyRegulations.map((r) => <span key={r} className="sr-tag">{r}</span>)}</div>
                    <p className="sr-sector-outlook">{s.outlook}</p>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ ALERTAS ═══ */}
          {view === "alertas" && (
            <section className="sr-section">
              <SectionHeading eyebrow="Alertas de riesgo" title="Alertas activas por severidad" description="Eventos y cambios que pueden impactar territorios y sectores. Incluye identificación de cisnes negros." />
              <div className="sr-alerts-list">
                {sortedAlerts.map((a) => (
                  <div key={a.id} className={`sr-alert-card ${a.blackSwan ? "sr-alert-blackswan" : ""}`} style={{ borderLeftColor: severityColor[a.severity] }}>
                    <div className="sr-alert-header">
                      <span className="sr-badge sr-badge-type">{a.type}</span>
                      <span className="sr-badge" style={{ background: severityColor[a.severity], color: "#fff" }}>{a.severity}</span>
                      {a.blackSwan && <span className="sr-badge sr-badge-blackswan">cisne negro</span>}
                      <span className="sr-alert-date">{formatDate(a.date)}</span>
                    </div>
                    <h3 className="sr-card-title">{a.title}</h3>
                    <p className="sr-alert-desc">{a.description}</p>
                    <div className="sr-alert-tags">
                      {a.territories.map((t) => <span key={t} className="sr-tag">{t}</span>)}
                      {a.sectors.map((s) => <span key={s} className="sr-tag sr-tag-sector">{s}</span>)}
                    </div>
                    <div className="sr-alert-metrics">
                      <div className="sr-probability-bar">
                        <div className="sr-probability-fill" style={{ width: `${a.probability}%`, background: scoreColor(a.probability) }} />
                        <span className="sr-probability-label">Probabilidad: {a.probability}%</span>
                      </div>
                      <div className="sr-impact-bar">
                        <div className="sr-impact-fill" style={{ width: `${a.impactScore}%`, background: scoreColor(a.impactScore) }} />
                        <span className="sr-impact-label">Impacto: {a.impactScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ NACIONAL ═══ */}
          {view === "nacional" && national && (
            <section className="sr-section">
              <SectionHeading eyebrow="Dashboard nacional" title="Scoring compuesto de España" description="Visión global con pulso semanal, comparación soberana, peers UE y calendario político." />
              <div className="sr-national-dashboard">
                <div className="sr-national-score">
                  <div className="sr-score-circle sr-score-circle-big" style={{ borderColor: scoreColor(national.overallScore) }}>
                    <span style={{ color: scoreColor(national.overallScore), fontSize: "2rem", fontWeight: 800 }}>{national.overallScore}</span>
                  </div>
                  <span className="sr-national-label">Score nacional</span>
                </div>
                <div className="sr-national-components">
                  {national.components.map((c) => (
                    <div key={c.label} className="sr-detail-comp">
                      <span className="sr-detail-comp-label">{c.label}</span>
                      <div className="sr-detail-comp-bar"><div className="sr-detail-comp-fill" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} /></div>
                      <span className="sr-detail-comp-value">{c.score}</span>
                    </div>
                  ))}
                </div>
                <div className="sr-national-indicators">
                  <div className="sr-indicator">
                    <span className="sr-indicator-value" style={{ color: scoreColor(100 - national.stabilityIndex) }}>{national.stabilityIndex}</span>
                    <span className="sr-indicator-label">Índice estabilidad</span>
                  </div>
                  <div className="sr-indicator">
                    <span className="sr-indicator-value" style={{ color: scoreColor(100 - national.fiscalHealth) }}>{national.fiscalHealth}</span>
                    <span className="sr-indicator-label">Salud fiscal</span>
                  </div>
                  <div className="sr-indicator">
                    <span className="sr-indicator-value" style={{ color: scoreColor(100 - national.euCompliance) }}>{national.euCompliance}</span>
                    <span className="sr-indicator-label">Cumplimiento UE</span>
                  </div>
                </div>

                {/* Weekly pulse */}
                <div className="sr-pulse-section">
                  <h4>Pulso semanal (7 días)</h4>
                  <div className="sr-pulse-chart">
                    {national.weeklyPulse.map((p) => (
                      <div key={p.day} className="sr-pulse-col">
                        <div className="sr-pulse-bar-wrap">
                          <div className={`sr-pulse-bar ${p.delta >= 0 ? "sr-pulse-up" : "sr-pulse-down"}`} style={{ height: `${Math.abs(p.delta) * 40}px` }} />
                        </div>
                        <span className="sr-pulse-val" style={{ color: p.delta >= 0 ? "var(--rojo)" : "var(--verde)" }}>{p.delta > 0 ? "+" : ""}{p.delta}</span>
                        <span className="sr-pulse-day">{p.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sovereign comparison */}
                <div className="sr-sovereign-section">
                  <h4>Comparación soberana</h4>
                  <div className="sr-sovereign-grid">
                    {national.sovereignComparison.map((s) => (
                      <div key={s.agency} className="sr-sovereign-card">
                        <span className="sr-sovereign-agency">{s.agency}</span>
                        <span className="sr-sovereign-rating">{s.rating}</span>
                        <span className="sr-sovereign-outlook">{s.outlook}</span>
                        <div className="sr-sovereign-bar"><div className="sr-sovereign-fill" style={{ width: `${s.equivalentScore}%`, background: scoreColor(s.equivalentScore) }} /></div>
                        <span className="sr-sovereign-score">Score equiv.: {s.equivalentScore}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EU Peer comparison */}
                <div className="sr-peers-section">
                  <h4>España vs peers UE</h4>
                  <div className="sr-peers-chart">
                    {[...national.euPeers, { country: "España", score: national.overallScore }]
                      .sort((a, b) => a.score - b.score)
                      .map((p) => (
                      <div key={p.country} className={`sr-peer-row ${p.country === "España" ? "sr-peer-highlight" : ""}`}>
                        <span className="sr-peer-country">{p.country}</span>
                        <div className="sr-peer-bar"><div className="sr-peer-fill" style={{ width: `${p.score}%`, background: scoreColor(p.score) }} /></div>
                        <span className="sr-peer-score">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Political calendar */}
                <div className="sr-calendar-section">
                  <h4>Calendario político</h4>
                  <div className="sr-calendar-list">
                    {national.politicalEvents.map((e) => (
                      <div key={e.date} className="sr-calendar-item">
                        <span className="sr-calendar-date">{formatDate(e.date)}</span>
                        <span className="sr-calendar-event">{e.event}</span>
                        <span className="sr-calendar-impact" style={{ color: e.riskImpact > 0 ? "var(--rojo)" : "var(--verde)" }}>
                          {e.riskImpact > 0 ? "+" : ""}{e.riskImpact}pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correlation matrix */}
                <div className="sr-correlation-section">
                  <h4>Matriz de correlaciones</h4>
                  <div className="sr-correlation-grid">
                    {correlations.map((c, i) => (
                      <div key={i} className="sr-corr-item">
                        <span className="sr-corr-factors">{c.factor1} \u2194 {c.factor2}</span>
                        <div className="sr-corr-bar">
                          <div className="sr-corr-fill" style={{
                            width: `${Math.abs(c.coefficient) * 100}%`,
                            background: correlationColor(c.coefficient),
                          }} />
                        </div>
                        <span className="sr-corr-coeff" style={{ color: correlationColor(c.coefficient) }}>{c.coefficient > 0 ? "+" : ""}{c.coefficient.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional divergence */}
                <div className="sr-divergence-section">
                  <h4>Análisis de divergencia regional</h4>
                  <div className="sr-divergence-stats">
                    <div className="sr-div-stat">
                      <span className="sr-div-val">{Math.round(avgScore)}</span>
                      <span className="sr-div-label">Media</span>
                    </div>
                    <div className="sr-div-stat">
                      <span className="sr-div-val">{stdDev}</span>
                      <span className="sr-div-label">Desv. estándar</span>
                    </div>
                    <div className="sr-div-stat">
                      <span className="sr-div-val" style={{ color: divergenceIndex > 25 ? "var(--rojo)" : "var(--verde)" }}>{divergenceIndex}%</span>
                      <span className="sr-div-label">Coef. variación</span>
                    </div>
                    <div className="sr-div-stat">
                      <span className="sr-div-val">{Math.min(...territoryScores)}</span>
                      <span className="sr-div-label">Mínimo</span>
                    </div>
                    <div className="sr-div-stat">
                      <span className="sr-div-val">{Math.max(...territoryScores)}</span>
                      <span className="sr-div-label">Máximo</span>
                    </div>
                  </div>
                </div>

                <div className="sr-methodology">
                  <h4>Metodología</h4>
                  <p>{national.methodology}</p>
                </div>
              </div>
            </section>
          )}

          {/* ═══ MATRIZ RIESGO (probability × impact) ═══ */}
          {view === "matriz" && (
            <section className="sr-section">
              <SectionHeading eyebrow="Matriz de riesgo" title="Probabilidad × Impacto" description="Scatter plot de alertas posicionadas por probabilidad e impacto. Cisnes negros resaltados." />
              <div className="sr-matrix-container">
                <div className="sr-matrix-plot">
                  {/* Axis labels */}
                  <span className="sr-matrix-y-label">Impacto \u2191</span>
                  <span className="sr-matrix-x-label">Probabilidad \u2192</span>
                  {/* Quadrant labels */}
                  <span className="sr-matrix-q sr-matrix-q1">VIGILAR</span>
                  <span className="sr-matrix-q sr-matrix-q2">CRÍTICO</span>
                  <span className="sr-matrix-q sr-matrix-q3">ACEPTABLE</span>
                  <span className="sr-matrix-q sr-matrix-q4">GESTIONAR</span>
                  {/* Dots */}
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className={`sr-matrix-dot ${a.blackSwan ? "sr-matrix-dot-bs" : ""}`}
                      style={{
                        left: `${a.probability}%`,
                        bottom: `${a.impactScore}%`,
                        background: severityColor[a.severity],
                      }}
                      title={`${a.title}\nProb: ${a.probability}% | Impacto: ${a.impactScore}`}
                    >
                      <span className="sr-matrix-dot-label">{a.id.replace("alert-", "")}</span>
                    </div>
                  ))}
                  {/* Grid lines */}
                  <div className="sr-matrix-grid-h" />
                  <div className="sr-matrix-grid-v" />
                </div>
                {/* Legend */}
                <div className="sr-matrix-legend">
                  <h4>Leyenda de alertas</h4>
                  {alerts.map((a) => (
                    <div key={a.id} className="sr-matrix-legend-item">
                      <span className="sr-matrix-legend-id" style={{ background: severityColor[a.severity] }}>{a.id.replace("alert-0", "")}</span>
                      <span className="sr-matrix-legend-title">{a.title}</span>
                      {a.blackSwan && <span className="sr-badge sr-badge-blackswan">cisne negro</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══ PROYECCIONES ═══ */}
          {view === "proyecciones" && (
            <section className="sr-section">
              <SectionHeading eyebrow="Proyecciones y tendencias" title="Forward 6 meses por territorio" description="Proyección de riesgo a futuro con evolución histórica y señales de alerta temprana." />
              <div className="sr-proj-grid">
                {sortedTerritories.map((t) => (
                  <div key={t.slug} className="sr-proj-card">
                    <div className="sr-proj-header">
                      <h3 className="sr-card-title">{t.name}</h3>
                      <div className="sr-proj-scores">
                        <span className="sr-proj-current" style={{ color: scoreColor(t.overallScore) }}>{t.overallScore}</span>
                        <span className="sr-proj-arrow">\u2192</span>
                        <span className="sr-proj-future" style={{ color: scoreColor(t.forecast[t.forecast.length - 1]?.projected ?? t.overallScore) }}>
                          {t.forecast[t.forecast.length - 1]?.projected ?? t.overallScore}
                        </span>
                      </div>
                    </div>
                    {/* Combined sparkline: history + forecast */}
                    <div className="sr-proj-sparkline">
                      {t.scoreHistory.map((h) => (
                        <div key={h.month} className="sr-spark-col" title={`${h.month}: ${h.score}`}>
                          <div className="sr-spark-bar" style={{ height: `${h.score}%`, background: scoreColor(h.score) }} />
                        </div>
                      ))}
                      <div className="sr-spark-divider" />
                      {t.forecast.map((f) => (
                        <div key={f.month} className="sr-spark-col" title={`${f.month}: ${f.projected}`}>
                          <div className="sr-spark-bar sr-spark-forecast" style={{ height: `${f.projected}%`, background: scoreColor(f.projected) }} />
                        </div>
                      ))}
                    </div>
                    <div className="sr-proj-labels">
                      <span>may-25</span>
                      <span>abr-26</span>
                      <span className="sr-proj-forecast-label">oct-26</span>
                    </div>
                    {/* Early warnings */}
                    {t.earlyWarnings.length > 0 && (
                      <div className="sr-proj-warnings">
                        {t.earlyWarnings.map((w) => (
                          <span key={w.signal} className={`sr-tag ${w.direction === "up" ? "sr-tag-risk" : "sr-tag-opp"}`}>
                            {w.direction === "up" ? "\u2191" : "\u2193"} {w.signal} ({w.magnitude})
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Sentiment + investment */}
                    <div className="sr-proj-footer">
                      <span style={{ color: sentimentColor(t.mediaSentiment) }}>Sentimiento: {t.mediaSentiment > 0 ? "+" : ""}{t.mediaSentiment}</span>
                      <span style={{ color: scoreColor(100 - t.investmentClimate) }}>Clima inversión: {t.investmentClimate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
