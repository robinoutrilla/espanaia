"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";
import { MirofishStatus } from "../../components/mirofish-status";
import type { GovernancePlan } from "../../lib/ian-governance";

interface AiPolicy {
  area: string;
  title: string;
  description: string;
  currentGovResponse: string;
  impact: string;
  budgetImpact: string;
  timeline: string;
  requiredLaw: string | null;
  supportingParties: string[];
  opposingParties: string[];
  reasoning: string;
}

interface GovernanceResponse {
  source: "mirofish" | "deterministic";
  plan: GovernancePlan;
  aiPolicies: {
    policies: AiPolicy[];
    governmentCritique: string;
    ianAdvantage: string;
  } | null;
}

const severityColor = (s: string) =>
  s === "critical" ? "var(--rojo)" : s === "high" ? "var(--oro)" : s === "medium" ? "var(--azul)" : "var(--verde)";

const severityLabel = (s: string) =>
  s === "critical" ? "CRITICO" : s === "high" ? "ALTO" : s === "medium" ? "MEDIO" : "BAJO";

export default function PartidoIANPage() {
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/governance")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        // Cache in sessionStorage for same-session reloads
        try { sessionStorage.setItem("ian-governance", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Try sessionStorage first for instant reload
    try {
      const cached = sessionStorage.getItem("ian-governance");
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {}
    loadData();
  }, []);

  const plan = data?.plan;
  const ai = data?.aiPolicies;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="partido-ian" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">LABORATORIO POLITICO</span>
            <h1 className="detail-title">Partido IAN</h1>
            <p className="detail-description">
              Simulador de gobernanza: un partido ficticio basado en datos que resuelve
              los problemas reales de Espana. Sin ideologia, solo evidencia.
            </p>
            <MirofishStatus />
            <button
              className="hero-button hero-button-secondary"
              onClick={() => { sessionStorage.removeItem("ian-governance"); loadData(); }}
              disabled={loading}
              style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
            >
              {loading ? "Actualizando..." : "↻ Regenerar análisis"}
            </button>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>176</strong><span>Escanos objetivo</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>4 anos</strong><span>Equilibrar cuentas</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{plan ? plan.diagnosis.length : "..."}</strong><span>Problemas detectados</span></div>
            </div>
          </aside>
        </div>
      </section>

      {loading && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)", textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>Analizando datos de todas las fuentes...</p>
        </section>
      )}

      {plan && (
        <>
          {/* ══════════════ 1. DIAGNOSIS ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Diagnostico nacional"
              title={`${plan.diagnosis.length} problemas identificados`}
              description="Cruce de datos INE, Congreso, IGAE, Eurostat y alertas de coherencia parlamentaria."
            />

            <div className="insight-grid">
              {plan.diagnosis.map((d, i) => (
                <div
                  className="insight-alert-card"
                  key={i}
                  style={{ borderLeft: `4px solid ${severityColor(d.severity)}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>{d.area}</span>
                    <span
                      className="tag"
                      style={{
                        background: `${severityColor(d.severity)}18`,
                        color: severityColor(d.severity),
                        fontWeight: 700,
                        fontSize: "0.65rem",
                      }}
                    >
                      {severityLabel(d.severity)}
                    </span>
                  </div>
                  <strong style={{ fontSize: "0.88rem" }}>{d.title}</strong>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "4px 0 0" }}>{d.description}</p>
                  {d.metric && (
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
                      {d.metric} &middot; {d.dataSource}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════ 2. BUDGET PLAN ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Plan presupuestario a 4 anos"
              title={`Deuda: ${plan.budget.currentDebt}B EUR -> ${plan.budget.targetDebt4Y}B EUR`}
              description={`Deficit actual: ${plan.budget.currentDeficit}B EUR. Ahorro total proyectado: ${plan.budget.totalSaved}B EUR (${plan.budget.debtReductionPct}% de la deuda).`}
            />

            <div className="finance-items-grid">
              {plan.budget.yearlyPlan.map((y) => {
                const isPositive = y.balance >= 0;
                const balColor = isPositive ? "var(--verde)" : "var(--rojo)";
                return (
                  <article className="finance-item-card" key={y.year} style={{ borderLeft: `4px solid ${balColor}` }}>
                    <div className="finance-item-top">
                      <strong style={{ fontSize: "1.1rem" }}>{y.year}</strong>
                      <span className="tag" style={{ background: `${balColor}18`, color: balColor }}>
                        {isPositive ? "+" : ""}{y.balance}B EUR
                      </span>
                    </div>
                    <div className="finance-item-figures">
                      <span>Ingresos: <strong>{y.revenue}B EUR</strong></span>
                      <span>Gasto: <strong>{y.spending}B EUR</strong></span>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                        Reduccion deuda: {y.debtReduction}B EUR
                      </span>
                    </div>
                    <ul style={{ fontSize: "0.72rem", color: "var(--ink-soft)", margin: "6px 0 0", paddingLeft: 14, listStyle: "disc" }}>
                      {y.keyMeasures.map((m, j) => <li key={j}>{m}</li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ══════════════ 3. LEGISLATIVE AGENDA ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Agenda legislativa"
              title={`${plan.legislativeAgenda.length} leyes propuestas`}
              description="Haz clic en cada ley para ver pros, contras, beneficios y analisis de actores."
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {plan.legislativeAgenda.map((law) => {
                const priorityColor = law.priority === "urgente" ? "var(--rojo)" : law.priority === "alta" ? "var(--oro)" : "var(--azul)";
                const isOpen = expandedLaw === law.slug;
                return (
                  <div key={law.slug} style={{ borderRadius: 10, border: `1px solid ${isOpen ? priorityColor : "var(--border)"}`, overflow: "hidden", transition: "border-color 200ms" }}>
                    {/* Clickable header */}
                    <button
                      onClick={() => setExpandedLaw(isOpen ? null : law.slug)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                        background: isOpen ? `${priorityColor}08` : "var(--white)", border: "none", cursor: "pointer",
                        borderLeft: `4px solid ${priorityColor}`, textAlign: "left",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
                        <path d="M4 2L8 6L4 10" stroke={priorityColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <strong style={{ fontSize: "0.92rem", flex: 1 }}>{law.title}</strong>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <span className="micro-tag" style={{ background: `${priorityColor}18`, color: priorityColor, textTransform: "uppercase" }}>{law.priority}</span>
                        <span className="micro-tag">{law.type}</span>
                      </div>
                    </button>

                    {/* Summary always visible */}
                    <div style={{ padding: "0 18px 12px 34px" }}>
                      <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "0 0 8px" }}>{law.description}</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {law.expectedVotes.favor.map((v) => (
                          <span key={v.party} className="micro-tag" style={{ background: "rgba(0,155,58,0.08)", color: "var(--verde)" }}>{v.party}</span>
                        ))}
                        {law.expectedVotes.contra.map((v) => (
                          <span key={v.party} className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)" }}>{v.party}</span>
                        ))}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ padding: "0 18px 20px 18px", borderTop: "1px solid var(--border)" }}>
                        {/* Pros & Cons */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
                          <div>
                            <h4 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--verde)", margin: "0 0 8px", textTransform: "uppercase" }}>Ventajas</h4>
                            <ul style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: 0, paddingLeft: 16, listStyle: "disc", lineHeight: 1.6 }}>
                              {law.pros.map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--rojo)", margin: "0 0 8px", textTransform: "uppercase" }}>Riesgos</h4>
                            <ul style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: 0, paddingLeft: 16, listStyle: "disc", lineHeight: 1.6 }}>
                              {law.cons.map((c, j) => <li key={j}>{c}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "0 0 16px" }}>
                          <div style={{ background: "rgba(0,155,58,0.04)", borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid var(--verde)" }}>
                            <h4 style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--verde)", margin: "0 0 6px", textTransform: "uppercase" }}>Beneficio para los ciudadanos</h4>
                            <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>{law.citizenBenefit}</p>
                          </div>
                          <div style={{ background: "rgba(0,82,204,0.04)", borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid var(--azul)" }}>
                            <h4 style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--azul)", margin: "0 0 6px", textTransform: "uppercase" }}>Beneficio para Espana</h4>
                            <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>{law.spainBenefit}</p>
                          </div>
                        </div>

                        {/* Party analysis */}
                        <h4 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", textTransform: "uppercase" }}>Analisis de actores parlamentarios</h4>

                        {law.expectedVotes.favor.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--verde)", textTransform: "uppercase" }}>A favor</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {law.expectedVotes.favor.map((v) => (
                                <div key={v.party} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.78rem" }}>
                                  <span className="micro-tag" style={{ background: "rgba(0,155,58,0.08)", color: "var(--verde)", flexShrink: 0, minWidth: 50, textAlign: "center" }}>{v.party}</span>
                                  <span style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>{v.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {law.expectedVotes.contra.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--rojo)", textTransform: "uppercase" }}>En contra</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {law.expectedVotes.contra.map((v) => (
                                <div key={v.party} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.78rem" }}>
                                  <span className="micro-tag" style={{ background: "var(--rojo-soft)", color: "var(--rojo)", flexShrink: 0, minWidth: 50, textAlign: "center" }}>{v.party}</span>
                                  <span style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>{v.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prediction */}
                        <div style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid var(--oro)" }}>
                          <h4 style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--oro)", margin: "0 0 6px", textTransform: "uppercase" }}>Prediccion de resultado</h4>
                          <p style={{ fontSize: "0.82rem", color: "var(--ink)", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{law.prediction}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════ 4. TERRITORIAL PLAN ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Plan territorial"
              title={`${plan.territorial.length} comunidades analizadas`}
              description="Diagnostico y propuestas especificas por comunidad autonoma basadas en indicadores INE."
            />

            {/* Summary bar */}
            <div className="finance-stacked-bar" style={{ marginBottom: 16 }}>
              {["red", "yellow", "green"].map((status) => {
                const count = plan.territorial.filter((t) => t.status === status).length;
                const pct = (count / plan.territorial.length) * 100;
                const bg = status === "red" ? "var(--rojo)" : status === "yellow" ? "var(--oro)" : "var(--verde)";
                return (
                  <div
                    key={status}
                    className="finance-bar-segment"
                    style={{ width: `${pct}%`, background: bg }}
                    title={`${count} ${status}`}
                  />
                );
              })}
            </div>

            <div className="finance-items-grid">
              {plan.territorial
                .sort((a, b) => {
                  const order = { red: 0, yellow: 1, green: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((t) => {
                  const statusColor = t.status === "red" ? "var(--rojo)" : t.status === "yellow" ? "var(--oro)" : "var(--verde)";
                  return (
                    <article className="finance-item-card" key={t.territory} style={{ borderLeft: `4px solid ${statusColor}` }}>
                      <div className="finance-item-top">
                        <strong>{t.territory}</strong>
                        <span className="tag" style={{ background: `${statusColor}18`, color: statusColor, textTransform: "uppercase" }}>
                          {t.status === "red" ? "Critico" : t.status === "yellow" ? "En riesgo" : "Estable"}
                        </span>
                      </div>
                      {t.problems.length > 0 && (
                        <ul style={{ fontSize: "0.72rem", color: "var(--ink-soft)", margin: "4px 0", paddingLeft: 14, listStyle: "disc" }}>
                          {t.problems.slice(0, 3).map((p, j) => <li key={j}>{p}</li>)}
                        </ul>
                      )}
                      {t.proposals.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <span style={{ fontSize: "0.65rem", color: "var(--verde)", fontWeight: 700 }}>PROPUESTAS:</span>
                          <ul style={{ fontSize: "0.72rem", color: "var(--ink-soft)", margin: "2px 0 0", paddingLeft: 14, listStyle: "disc" }}>
                            {t.proposals.map((p, j) => <li key={j}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                      <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)", marginTop: 4, display: "block" }}>
                        Objetivo: {t.expectedImprovement}
                      </span>
                    </article>
                  );
                })}
            </div>
          </section>

          {/* ══════════════ 5. AI POLICIES (MiroFish) ══════════════ */}
          {ai && ai.policies && ai.policies.length > 0 && (
            <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
              <SectionHeading
                eyebrow="Analisis IA (MiroFish local)"
                title="Propuestas generadas por inteligencia artificial"
                description={ai.ianAdvantage || "Politicas generadas localmente con Ollama. Sin envio de datos a APIs externas."}
              />

              {ai.governmentCritique && (
                <div style={{
                  background: "var(--rojo-soft)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 20,
                  borderLeft: "4px solid var(--rojo)",
                }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--rojo)", textTransform: "uppercase" }}>
                    Critica al gobierno actual
                  </span>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "4px 0 0" }}>{ai.governmentCritique}</p>
                </div>
              )}

              <div className="insight-grid">
                {ai.policies.map((p, i) => (
                  <div className="insight-alert-card" key={i} style={{ borderLeft: "4px solid var(--azul)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" }}>{p.area}</span>
                      <span className="micro-tag">{p.timeline} &middot; {p.budgetImpact}</span>
                    </div>
                    <strong style={{ fontSize: "0.88rem" }}>{p.title}</strong>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", margin: "4px 0" }}>{p.description}</p>

                    {p.currentGovResponse && (
                      <div style={{
                        background: "var(--surface)",
                        borderRadius: 6,
                        padding: "8px 10px",
                        margin: "6px 0",
                        borderLeft: "3px solid var(--oro)",
                      }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--oro)" }}>RESPUESTA GOB. ACTUAL:</span>
                        <p style={{ fontSize: "0.72rem", color: "var(--ink-soft)", margin: "2px 0 0" }}>{p.currentGovResponse}</p>
                      </div>
                    )}

                    {p.requiredLaw && (
                      <span style={{ fontSize: "0.7rem", color: "var(--azul)" }}>Ley necesaria: {p.requiredLaw}</span>
                    )}

                    {p.supportingParties && p.supportingParties.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--verde)", fontWeight: 700 }}>APOYO:</span>
                        {p.supportingParties.map((sp) => (
                          <span key={sp} className="micro-tag" style={{ background: "rgba(0,155,58,0.08)", color: "var(--verde)" }}>{sp}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════ 6. ELECTORAL STRATEGY ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Estrategia electoral"
              title={`Objetivo: ${plan.electoralStrategy.targetSeats} escanos`}
              description={`${(plan.electoralStrategy.targetVotes / 1e6).toFixed(1)}M votos necesarios. ${plan.electoralStrategy.coalitionStrategy}`}
            />

            <div style={{
              background: "var(--surface)",
              borderRadius: 12,
              padding: "20px 24px",
              border: "2px solid var(--border)",
            }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                &ldquo;{plan.electoralStrategy.keyMessage}&rdquo;
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                {plan.electoralStrategy.coalitionStrategy}
              </p>
            </div>
          </section>

          {/* ══════════════ 7. NEWS CONTEXT ══════════════ */}
          {plan.recentNewsContext.length > 0 && (
            <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
              <SectionHeading
                eyebrow="Contexto mediatico"
                title="Noticias recientes relacionadas"
                description="Titulares de RSS con entidades politicas detectadas."
              />

              <div className="finance-items-grid">
                {plan.recentNewsContext.map((n, i) => (
                  <article className="finance-item-card" key={i}>
                    <div className="finance-item-top">
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{n.title}</span>
                    </div>
                    <div className="finance-item-figures">
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{n.source}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--azul)" }}>{n.relevance}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ══════════════ METHODOLOGY ══════════════ */}
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)", borderTop: "2px solid var(--border)" }}>
            <div className="insight-header">
              <span className="eyebrow" style={{ color: "var(--ink-muted)" }}>METODOLOGIA</span>
              <h2 className="insight-title">Como funciona el simulador</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <strong>Datos:</strong> El diagnostico cruza indicadores INE (paro, PIB, IPC, pobreza),
                composicion parlamentaria, patrones de votacion, alertas de coherencia, fondos NGEU
                y presupuestos generales del Estado.
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <strong>Simulacion:</strong> El plan presupuestario modela 4 anos de mejora progresiva
                con medidas concretas por ejercicio. Las leyes propuestas incluyen estimacion de apoyos
                parlamentarios basados en votaciones historicas.
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <strong>IA local:</strong> Cuando MiroFish esta activo, un LLM local (Ollama) genera
                propuestas detalladas con respuestas simuladas del gobierno actual. Todos los datos
                se procesan localmente — sin envio a APIs externas.
              </div>
            </div>
          </section>
        </>
      )}

      <SiteFooter extra="Simulador basado en datos reales. IAN es un partido ficticio con fines educativos." />
    </main>
  );
}
