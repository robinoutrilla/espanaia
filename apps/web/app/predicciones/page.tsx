import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";
import { MirofishStatus } from "../../components/mirofish-status";
import { ProjectionSimulator } from "../../components/projection-simulator";
import {
  getStabilityIndex,
  getEconomicForecast,
  getVotePredictions,
  getCoalitionScenarios,
  getPollingHistory,
  getGovernmentFormationProbabilities,
  getLegislativeRiskMap,
  getParliamentaryTension,
  getMocionCensuraRisk,
  getElectoralSensitivity,
  getKeyProvincePredictions,
  getCausalCorrelations,
  getPresetScenarios,
  CENSO_ELECTORAL,
} from "../../lib/predictions-data";
import { runSimulation, pollingData } from "../../lib/polling-model";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SECTIONS = [
  { id: "electoral", label: "Escenarios electorales" },
  { id: "coaliciones", label: "Coaliciones" },
  { id: "tendencias", label: "Tendencias" },
  { id: "gobierno", label: "Gobierno" },
  { id: "estabilidad", label: "Estabilidad" },
  { id: "riesgo-legislativo", label: "Riesgo legislativo" },
  { id: "tension", label: "Tensión" },
  { id: "mocion", label: "Moción censura" },
  { id: "perspectiva", label: "Perspectiva económica" },
  { id: "sensibilidad", label: "Sensibilidad" },
  { id: "provincias", label: "Provincias" },
  { id: "correlaciones", label: "Correlaciones" },
  { id: "votaciones", label: "Votaciones" },
  { id: "escenarios", label: "Escenarios" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function PrediccionesPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string; p?: string; v?: string }>;
}) {
  return <PrediccionesContent searchParamsPromise={searchParams} />;
}

async function PrediccionesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ seccion?: string; p?: string; v?: string }>;
}) {
  const sp = await searchParamsPromise;

  /* Parse active sections from ?seccion=electoral,estabilidad,... */
  const activeSections: Set<SectionId> = (() => {
    if (!sp.seccion) return new Set<SectionId>(SECTIONS.map((s) => s.id)); // all visible by default
    const parts = sp.seccion.split(",").filter(Boolean) as SectionId[];
    return new Set(parts.filter((p) => SECTIONS.some((s) => s.id === p)));
  })();

  const allActive = activeSections.size === SECTIONS.length;

  /* Parse simulation params from URL */
  const initialParticipation = sp.p ? parseFloat(sp.p) : undefined;
  const initialOverrides: Record<string, number> | undefined = sp.v
    ? Object.fromEntries(
        sp.v.split(",").map((entry) => {
          const [slug, val] = entry.split(":");
          return [slug, parseFloat(val)];
        }).filter(([, val]) => !isNaN(val as number))
      )
    : undefined;

  /* Build toggle URL helpers */
  function toggleUrl(id: SectionId): string {
    if (allActive) {
      return `/predicciones?seccion=${id}`;
    }
    const next = new Set(activeSections);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    if (next.size === SECTIONS.length || next.size === 0) return "/predicciones";
    return `/predicciones?seccion=${[...next].join(",")}`;
  }

  // Run default simulation for server-side summary
  const defaultSim = runSimulation();

  const stability = getStabilityIndex();
  const economic = getEconomicForecast();
  const votePredictions = getVotePredictions();
  const coalitions = getCoalitionScenarios();
  const pollingHistory = getPollingHistory();
  const govScenarios = getGovernmentFormationProbabilities();
  const legislativeRisks = getLegislativeRiskMap();
  const tension = getParliamentaryTension();
  const mocionRisk = getMocionCensuraRisk();
  const sensitivity = getElectoralSensitivity();
  const provinces = getKeyProvincePredictions();
  const correlations = getCausalCorrelations();
  const presetScenarios = getPresetScenarios();

  const stabilityColor = stability.score >= 70 ? "var(--verde)" : stability.score >= 50 ? "var(--oro)" : "var(--rojo)";
  const outlookColor = economic.overallOutlook === "positivo" ? "var(--verde)" : economic.overallOutlook === "negativo" ? "var(--rojo)" : "var(--oro)";

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="predicciones" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">MOTOR DE PREDICCIONES</span>
            <h1 className="detail-title">Predicciones Pol{"í"}ticas</h1>
            <p className="detail-description">
              Proyecciones basadas en datos demosc{"ó"}picos (CIS, Sigma Dos, GAD3),
              modelo D{"'"}Hondt con dispersi{"ó"}n por circunscripci{"ó"}n, y un censo
              electoral de {(CENSO_ELECTORAL / 1_000_000).toFixed(1)}M electores.
              Ajusta los par{"á"}metros para simular escenarios.
            </p>
            <MirofishStatus />
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{defaultSim.parties.length}</strong><span>Partidos</span></div>
              <div className="kpi-cell"><strong style={{ color: stabilityColor }}>{stability.score}/100</strong><span>Estabilidad</span></div>
              <div className="kpi-cell"><strong style={{ color: outlookColor }}>{economic.overallOutlook}</strong><span>Perspectiva</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>350</strong><span>Esca{"ñ"}os</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Section filters ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div className="pred-filters">
          <span className="pred-filters-label">Secciones</span>
          <div className="pred-filters-options">
            <Link
              className={`deputies-filter-pill ${allActive ? "deputies-filter-pill-active" : ""}`}
              href="/predicciones"
            >
              Todas
            </Link>
            {SECTIONS.map((s) => {
              const isActive = !allActive && activeSections.has(s.id);
              return (
                <Link
                  key={s.id}
                  className={`deputies-filter-pill ${isActive ? "deputies-filter-pill-active" : ""}`}
                  href={toggleUrl(s.id)}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ 1. ELECTORAL PROJECTION — POLLING MODEL ══════════════ */}
      {activeSections.has("electoral") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Escenarios electorales — Modelo demoscópico"
            title={`Proyección de ${defaultSim.totalSeats} escaños del Congreso`}
            description={`Censo: ${(defaultSim.censoElectoral / 1e6).toFixed(1)}M · Participación base: ${defaultSim.participationPct}% · Modelo D'Hondt con dispersión por circunscripción`}
          />

          <ProjectionSimulator
            initialParticipation={initialParticipation}
            initialOverrides={initialOverrides}
          />
        </section>
      )}

      {/* ══════════════ COALICIONES ══════════════ */}
      {activeSections.has("coaliciones") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Aritmética parlamentaria"
            title="Escenarios de coalición"
            description={`${coalitions.filter(c => c.reachesMajority).length} combinaciones alcanzan mayoría de 176 escaños`}
          />
          <div className="pred-coalition-grid">
            {coalitions.map((c) => {
              const borderColor = c.reachesMajority ? "var(--verde)" : "var(--rojo)";
              return (
                <div className="pred-coalition-card" key={c.id} style={{ borderLeft: `4px solid ${borderColor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: "0.88rem" }}>{c.label}</strong>
                    <span className="tag" style={{
                      background: c.reachesMajority ? "rgba(0,155,58,0.1)" : "var(--rojo-soft)",
                      color: c.reachesMajority ? "var(--verde)" : "var(--rojo)",
                      fontWeight: 700,
                    }}>
                      {c.totalSeats} escaños
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                    {c.partyNames.map(name => (
                      <span key={name} className="micro-tag" style={{ background: "var(--azul-soft)", color: "var(--azul)" }}>{name}</span>
                    ))}
                  </div>
                  <div style={{ position: "relative", height: 6, background: "var(--surface)", borderRadius: 3, marginBottom: 6 }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      width: `${(c.totalSeats / 350) * 100}%`,
                      background: borderColor,
                      borderRadius: 3,
                    }} />
                    <div style={{
                      position: "absolute", left: `${(176 / 350) * 100}%`, top: -2, height: 10,
                      width: 2, background: "var(--ink)", borderRadius: 1,
                    }} />
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)", margin: "0 0 4px" }}>{c.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="micro-tag" style={{
                      background: c.type === "mayoria-absoluta" ? "rgba(0,155,58,0.1)" : c.type === "bloqueo" ? "var(--rojo-soft)" : "var(--oro-soft)",
                      color: c.type === "mayoria-absoluta" ? "var(--verde)" : c.type === "bloqueo" ? "var(--rojo)" : "var(--ink)",
                    }}>{c.type.replace(/-/g, " ")}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>Prob: {c.probability}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ TENDENCIAS ══════════════ */}
      {activeSections.has("tendencias") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Evolución demoscópica"
            title="Tendencia de encuestas (8 meses)"
            description="Media ponderada de CIS, Sigma Dos, GAD3, Simple Lógica y Electomania"
          />
          <div className="pred-trend-table">
            <div className="pred-trend-header">
              <span className="pred-trend-party-col">Partido</span>
              {pollingHistory.map(s => (
                <span key={s.date} className="pred-trend-date-col">{s.date.substring(5)}</span>
              ))}
              <span className="pred-trend-delta-col">Δ</span>
            </div>
            {["pp", "psoe", "vox", "sumar", "podemos", "erc", "junts", "eh-bildu", "pnv"].map(slug => {
              const first = pollingHistory[0]?.parties.find(p => p.slug === slug)?.pct ?? 0;
              const last = pollingHistory[pollingHistory.length - 1]?.parties.find(p => p.slug === slug)?.pct ?? 0;
              const delta = Math.round((last - first) * 10) / 10;
              const deltaColor = delta > 0 ? "var(--verde)" : delta < 0 ? "var(--rojo)" : "var(--ink-muted)";
              return (
                <div key={slug} className="pred-trend-row">
                  <span className="pred-trend-party-col" style={{ fontWeight: 600 }}>{slug.toUpperCase()}</span>
                  {pollingHistory.map(s => {
                    const val = s.parties.find(p => p.slug === slug)?.pct;
                    return (
                      <span key={s.date} className="pred-trend-date-col">
                        {val !== undefined ? `${val}%` : "—"}
                      </span>
                    );
                  })}
                  <span className="pred-trend-delta-col" style={{ color: deltaColor, fontWeight: 700 }}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ GOBIERNO ══════════════ */}
      {activeSections.has("gobierno") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Formación de gobierno"
            title="Probabilidad por escenario"
            description="Basado en aritmética parlamentaria, encuestas y dinámica de coaliciones"
          />
          <div className="pred-gov-scenarios">
            {govScenarios.map((s) => {
              const color = s.probability > 30 ? "var(--azul)" : s.probability > 15 ? "var(--oro)" : "var(--ink-muted)";
              return (
                <div key={s.type} className="pred-gov-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: "0.9rem" }}>{s.label}</strong>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>{s.probability}%</span>
                  </div>
                  <div style={{ position: "relative", height: 8, background: "var(--surface)", borderRadius: 4, marginBottom: 8 }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      width: `${s.probability}%`,
                      background: color,
                      borderRadius: 4,
                    }} />
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "0 0 6px" }}>{s.description}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {s.keyFactors.slice(0, 3).map((f, i) => (
                      <span key={i} className="micro-tag" style={{ background: "var(--azul-soft)", color: "var(--azul)" }}>{f}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ 2. STABILITY INDEX ══════════════ */}
      {activeSections.has("estabilidad") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Estabilidad del gobierno"
            title={`${stability.score}/100 — ${stability.label.charAt(0).toUpperCase() + stability.label.slice(1)}`}
            description={`Coalición: ${stability.coalitionSeats} escaños · Mayoría: ${stability.majorityThreshold} · Margen: ${stability.seatMargin >= 0 ? "+" : ""}${stability.seatMargin}`}
          />

          {/* Gauge bar */}
          <div style={{ position: "relative", height: 32, background: "var(--surface)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${stability.score}%`,
              background: `linear-gradient(90deg, var(--rojo), var(--oro), var(--verde))`,
              borderRadius: 8,
              transition: "width 500ms ease",
            }} />
            <span style={{
              position: "absolute", left: `${stability.score}%`, top: "50%", transform: "translate(-50%, -50%)",
              fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "0.85rem",
              color: "var(--white)", textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}>
              {stability.score}
            </span>
          </div>

          <div className="insight-grid">
            {stability.factors.map((f, i) => (
              <div className="insight-alert-card" key={i} style={{ borderLeft: `4px solid ${f.value >= 0 ? "var(--verde)" : "var(--rojo)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.85rem" }}>{f.label}</strong>
                  <span className="tag" style={{
                    background: f.value >= 0 ? "rgba(0,155,58,0.1)" : "var(--rojo-soft)",
                    color: f.value >= 0 ? "var(--verde)" : "var(--rojo)",
                  }}>
                    {f.value >= 0 ? "+" : ""}{f.value}
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "4px 0 0" }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ RIESGO LEGISLATIVO ══════════════ */}
      {activeSections.has("riesgo-legislativo") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Mapa legislativo"
            title="Riesgo de aprobación parlamentaria"
            description="Próximas iniciativas y su probabilidad de aprobación"
          />
          <div className="pred-legis-grid">
            {legislativeRisks.map((r) => {
              const probColor = r.passProbability > 65 ? "var(--verde)" : r.passProbability > 35 ? "var(--oro)" : "var(--rojo)";
              const impactBg = r.impact === "alto" ? "var(--rojo-soft)" : r.impact === "medio" ? "var(--oro-soft)" : "var(--azul-soft)";
              return (
                <div key={r.id} className="pred-legis-card" style={{ borderLeft: `4px solid ${probColor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ fontSize: "0.85rem" }}>{r.title}</strong>
                    <span className="micro-tag" style={{ background: impactBg, fontWeight: 700 }}>
                      {r.impact}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                    <span>{r.type.replace(/-/g, " ")}</span>
                    <span>{r.expectedDate}</span>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "var(--surface)", borderRadius: 3, marginBottom: 6 }}>
                    <div style={{
                      width: `${r.passProbability}%`,
                      height: "100%",
                      background: probColor,
                      borderRadius: 3,
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{r.description}</span>
                  </div>
                  {r.keyBlocker && (
                    <span className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)", marginTop: 4, display: "inline-block" }}>
                      Bloqueador: {r.keyBlocker}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ TENSION ══════════════ */}
      {activeSections.has("tension") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Índice de tensión parlamentaria"
            title={`${tension.score}/100 — ${tension.label}`}
            description={`Tendencia: ${tension.trend}. Basado en disciplina de voto, coherencia, márgenes y fragmentación.`}
          />
          <div style={{ position: "relative", height: 32, background: "var(--surface)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${tension.score}%`,
              background: tension.score > 70 ? "var(--rojo)" : tension.score > 45 ? "var(--oro)" : "var(--verde)",
              borderRadius: 8,
            }} />
            <span style={{
              position: "absolute", left: `${tension.score}%`, top: "50%", transform: "translate(-50%, -50%)",
              fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "0.85rem",
              color: "var(--white)", textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}>
              {tension.score}
            </span>
          </div>
          <div className="insight-grid">
            {tension.components.map((c, i) => (
              <div className="insight-alert-card" key={i} style={{ borderLeft: `4px solid ${c.value > 65 ? "var(--rojo)" : c.value > 40 ? "var(--oro)" : "var(--verde)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.85rem" }}>{c.name}</strong>
                  <span className="tag" style={{
                    background: c.value > 65 ? "var(--rojo-soft)" : c.value > 40 ? "var(--oro-soft)" : "var(--verde-soft)",
                    color: c.value > 65 ? "var(--rojo)" : c.value > 40 ? "var(--ink)" : "var(--verde)",
                  }}>
                    {c.value}/100
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "4px 0 0" }}>{c.explanation}</p>
                <div style={{ position: "relative", height: 4, background: "var(--surface)", borderRadius: 2, marginTop: 6 }}>
                  <div style={{ height: "100%", width: `${c.value}%`, background: c.value > 65 ? "var(--rojo)" : c.value > 40 ? "var(--oro)" : "var(--verde)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          {/* Weekly trend */}
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60, marginTop: 16 }}>
            {tension.weeklyHistory.map((w, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{
                  width: "100%", height: `${w.score * 0.6}px`,
                  background: w.score > 65 ? "var(--rojo)" : w.score > 40 ? "var(--oro)" : "var(--verde)",
                  borderRadius: 2,
                }} />
                <span style={{ fontSize: "0.55rem", color: "var(--ink-muted)" }}>{w.week.substring(5)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ MOCION DE CENSURA ══════════════ */}
      {activeSections.has("mocion") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Moción de censura"
            title={`Probabilidad: ${mocionRisk.probability}% — ${mocionRisk.label}`}
            description={`Proponente: ${mocionRisk.potentialProponent} · Candidato: ${mocionRisk.alternativeCandidate} · Necesarios: ${mocionRisk.requiredVotes} · Actual: ${mocionRisk.currentSupport} · Brecha: ${mocionRisk.gapToSuccess}`}
          />
          <div style={{ position: "relative", height: 40, background: "var(--surface)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${(mocionRisk.currentSupport / 350) * 100}%`,
              background: "var(--azul)",
              borderRadius: 8,
            }} />
            <div style={{
              position: "absolute", left: `${(mocionRisk.requiredVotes / 350) * 100}%`, top: 0, height: "100%",
              width: 3, background: "var(--rojo)", zIndex: 1,
            }} />
            <span style={{
              position: "absolute", left: `${(mocionRisk.currentSupport / 350) * 100}%`, top: "50%", transform: "translate(-50%, -50%)",
              fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "0.85rem",
              color: "var(--white)", textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}>
              {mocionRisk.currentSupport}
            </span>
            <span style={{
              position: "absolute", left: `${(mocionRisk.requiredVotes / 350) * 100}%`, top: -16,
              fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--rojo)", fontWeight: 700,
              transform: "translateX(-50%)",
            }}>
              {mocionRisk.requiredVotes}
            </span>
          </div>
          <div className="insight-grid">
            {mocionRisk.factors.map((f, i) => (
              <div className="insight-alert-card" key={i} style={{ borderLeft: `4px solid ${f.value >= 0 ? "var(--verde)" : "var(--rojo)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.85rem" }}>{f.label}</strong>
                  <span className="tag" style={{
                    background: f.value >= 0 ? "rgba(0,155,58,0.1)" : "var(--rojo-soft)",
                    color: f.value >= 0 ? "var(--verde)" : "var(--rojo)",
                  }}>
                    {f.value >= 0 ? "+" : ""}{f.value}
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "4px 0 0" }}>{f.description}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: 12, fontStyle: "italic" }}>
            {mocionRisk.historicalContext}
          </p>
        </section>
      )}

      {/* ══════════════ 3. ECONOMIC FORECAST ══════════════ */}
      {activeSections.has("perspectiva") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Previsión económica"
            title={`Perspectiva: ${economic.overallOutlook}`}
            description={`NGEU ejecutado: ${economic.ngeuExecutionPct}%. ${economic.ngeuImpact}`}
          />

          <div className="finance-items-grid">
            {economic.indicators.map((ind) => {
              const arrow = ind.direction === "up" ? "↑" : ind.direction === "down" ? "↓" : "→";
              const dirColor = ind.sentiment === "positive" ? "var(--verde)" : ind.sentiment === "negative" ? "var(--rojo)" : "var(--oro)";
              return (
                <article className="finance-item-card" key={ind.name} style={{ borderLeft: `4px solid ${dirColor}` }}>
                  <div className="finance-item-top">
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{ind.name}</span>
                    <span style={{ fontSize: "1.2rem", color: dirColor }}>{arrow}</span>
                  </div>
                  <div className="finance-item-figures">
                    <span>Actual: <strong>{ind.currentValue.toLocaleString("es-ES")} {ind.unit}</strong></span>
                    <span>Proyecci{"ó"}n: <strong style={{ color: dirColor }}>{ind.projectedValue.toLocaleString("es-ES")} {ind.unit}</strong></span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>Confianza: {ind.confidence}%</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "6px 0 0" }}>{ind.explanation}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ SENSIBILIDAD ══════════════ */}
      {activeSections.has("sensibilidad") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Análisis de sensibilidad"
            title="Impacto de ±1pp por partido"
            description="Qué partido moverá más escaños al ganar o perder un punto porcentual"
          />
          <div className="pred-sensitivity-table">
            <div className="pred-sensitivity-header">
              <span>Partido</span>
              <span>Actual</span>
              <span>+1pp</span>
              <span>-1pp</span>
              <span>Sensibilidad</span>
            </div>
            {sensitivity.map((s) => (
              <div key={s.partySlug} className="pred-sensitivity-row">
                <span style={{ fontWeight: 600 }}>{s.partyName}</span>
                <span>{s.currentPct}%</span>
                <span style={{ color: s.scenarioUp.delta > 0 ? "var(--verde)" : "var(--rojo)" }}>
                  {s.scenarioUp.seats} ({s.scenarioUp.delta > 0 ? "+" : ""}{s.scenarioUp.delta})
                  {s.scenarioUp.governmentChanges && <span className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)", marginLeft: 4 }}>cambio gob.</span>}
                </span>
                <span style={{ color: s.scenarioDown.delta < 0 ? "var(--rojo)" : "var(--verde)" }}>
                  {s.scenarioDown.seats} ({s.scenarioDown.delta > 0 ? "+" : ""}{s.scenarioDown.delta})
                  {s.scenarioDown.governmentChanges && <span className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)", marginLeft: 4 }}>cambio gob.</span>}
                </span>
                <span>
                  <div style={{ position: "relative", height: 6, width: 80, background: "var(--surface)", borderRadius: 3, display: "inline-block", verticalAlign: "middle", marginRight: 6 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, s.sensitivityScore * 10)}%`, background: s.sensitivityScore > 5 ? "var(--rojo)" : "var(--azul)", borderRadius: 3 }} />
                  </div>
                  {s.sensitivityScore}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ PROVINCIAS ══════════════ */}
      {activeSections.has("provincias") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Provincias clave"
            title="Predicción por circunscripción"
            description="Las 8 provincias decisivas para la formación de gobierno"
          />
          <div className="pred-province-grid">
            {provinces.map((p) => (
              <div key={p.province} className="pred-province-card" style={{ borderLeft: `4px solid ${p.swing ? "var(--oro)" : "var(--azul)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: "0.88rem" }}>{p.province}</strong>
                  <span className="micro-tag" style={{ background: "var(--azul-soft)", color: "var(--azul)" }}>{p.seats} escaños</span>
                </div>
                {p.swing && <span className="micro-tag" style={{ background: "var(--oro-soft)", color: "var(--ink)", marginBottom: 6, display: "inline-block" }}>Swing</span>}
                <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginBottom: 6 }}>
                  Ganador actual: <strong>{p.currentWinner}</strong> → Proyectado: <strong style={{ color: "var(--azul)" }}>{p.projectedWinner}</strong>
                </div>
                {p.keyParties.slice(0, 4).map(kp => (
                  <div key={kp.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.75rem" }}>{kp.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ position: "relative", height: 4, width: 60, background: "var(--surface)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${kp.projectedPct * 2}%`, background: "var(--azul)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>{kp.projectedPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ CORRELACIONES ══════════════ */}
      {activeSections.has("correlaciones") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Correlaciones causales"
            title="Economía → Voto"
            description="Cómo los indicadores económicos afectan al apoyo electoral"
          />
          <div className="pred-corr-grid">
            {correlations.map((c, i) => {
              const corrColor = c.correlation > 0 ? "var(--verde)" : "var(--rojo)";
              const strengthLabel = c.strength === "fuerte" ? "●●●" : c.strength === "moderada" ? "●●○" : "●○○";
              return (
                <div key={i} className="pred-corr-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ fontSize: "0.82rem" }}>{c.indicator}</strong>
                    <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: corrColor, fontWeight: 700 }}>
                      {c.correlation > 0 ? "+" : ""}{c.correlation.toFixed(2)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                    {c.direction}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="micro-tag" style={{ background: "var(--azul-soft)", color: "var(--azul)" }}>{c.affectedParty}</span>
                    <span style={{ fontSize: "0.7rem", color: corrColor, letterSpacing: 2 }}>{strengthLabel}</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--ink-muted)", margin: "4px 0 0" }}>{c.explanation}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ 4. VOTE PREDICTIONS ══════════════ */}
      {activeSections.has("votaciones") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Predicción parlamentaria"
            title="Votaciones probables por categoría"
            description="Resultado estimado según patrones de coalición históricos."
          />

          <div className="insight-grid">
            {votePredictions.map((vp) => {
              const resultColor = vp.likelyResult === "aprobado" ? "var(--verde)" : vp.likelyResult === "rechazado" ? "var(--rojo)" : "var(--oro)";
              return (
                <div className="insight-alert-card" key={vp.category} style={{ borderLeft: `4px solid ${resultColor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ fontSize: "0.88rem" }}>{vp.categoryLabel}</strong>
                    <span className="tag" style={{ background: `${resultColor}18`, color: resultColor, textTransform: "uppercase", fontWeight: 700 }}>
                      {vp.likelyResult}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "0 0 6px" }}>{vp.reasoning}</p>
                  {vp.coalitionFor.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--verde)", fontWeight: 700 }}>A FAVOR:</span>
                      {vp.coalitionFor.map(p => (
                        <span key={p} className="micro-tag" style={{ background: "rgba(0,155,58,0.08)", color: "var(--verde)" }}>{p}</span>
                      ))}
                    </div>
                  )}
                  {vp.coalitionAgainst.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--rojo)", fontWeight: 700 }}>EN CONTRA:</span>
                      {vp.coalitionAgainst.map(p => (
                        <span key={p} className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)" }}>{p}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: "0.7rem", color: "var(--ink-muted)" }}>
                    Confianza: {vp.confidence}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ ESCENARIOS ══════════════ */}
      {activeSections.has("escenarios") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Escenarios predefinidos"
            title="¿Qué pasaría si...?"
            description="Simulaciones de situaciones hipotéticas. Haz clic para cargar en el simulador electoral."
          />
          <div className="pred-preset-grid">
            {presetScenarios.map((s) => (
              <a
                key={s.id}
                href={`/predicciones?seccion=electoral&p=${s.participationPct}&v=${Object.entries(s.voteShareOverrides).map(([k, v]) => `${k}:${v}`).join(",")}`}
                className="pred-preset-card"
              >
                <span style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.emoji}</span>
                <strong style={{ fontSize: "0.88rem", marginBottom: 4 }}>{s.label}</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)", margin: 0 }}>{s.description}</p>
                <span className="micro-tag" style={{ background: "var(--azul-soft)", color: "var(--azul)", marginTop: 8 }}>
                  Simular →
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ METHODOLOGY ══════════════ */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)", borderTop: "2px solid var(--border)" }}>
        <div className="insight-header">
          <span className="eyebrow" style={{ color: "var(--ink-muted)" }}>METODOLOG{"Í"}A</span>
          <h2 className="insight-title">C{"ó"}mo se calculan estas predicciones</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            <strong>Modelo demosc{"ó"}pico:</strong> Media ponderada de encuestas CIS, Sigma Dos, GAD3, Simple L{"ó"}gica y
            Electomania (ciclo marzo-abril 2026). Los porcentajes de voto se procesan mediante asignaci{"ó"}n
            D{"'"}Hondt con un modelo de dispersi{"ó"}n por circunscripci{"ó"}n que aplica factores de concentraci{"ó"}n
            territorial a cada partido.
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            <strong>Concentraci{"ó"}n territorial:</strong> Los partidos regionales (ERC, Junts, EH Bildu, PNV)
            concentran el 100% de su voto en pocas circunscripciones, maximizando su eficiencia.
            Los partidos nacionales peque{"ñ"}os (Sumar ~3.1%, Podemos ~3.8%) dispersan su voto en 52
            circunscripciones, quedando por debajo del umbral del 3% en la mayor{"í"}a.
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            <strong>Fase 2 (activa):</strong> Integraci{"ó"}n local con{" "}
            <a href="https://github.com/666ghj/MiroFish" target="_blank" rel="noopener noreferrer" style={{ color: "var(--azul)", fontWeight: 600 }}>
              MiroFish
            </a>, motor de inteligencia de enjambre open-source ejecutado localmente con Ollama.
            Extrae entidades y relaciones mediante grafos de conocimiento y genera predicciones con LLM local.
          </div>
        </div>
      </section>

      <SiteFooter sources="CIS, Sigma Dos, GAD3, Simple Lógica, Electomania, Congreso, INE, IGAE" />
    </main>
  );
}
