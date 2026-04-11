"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Monitor de Subvenciones — Convocatorias, programas de fondos,
   distribución territorial, calendario de deadlines y analytics.
   20 competitive differentiators vs. typical grant monitoring tools.
   ═══════════════════════════════════════════════════════════════════════════ */

interface EligibilityProfile {
  entityTypes: string[];
  sectors: string[];
  territories: string[];
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

interface SubConvocatoria {
  id: string;
  title: string;
  organism: string;
  budgetM: number;
  executedM?: number;
  status: "abierta" | "en-evaluacion" | "resuelta" | "cerrada" | "proxima";
  fundSource: string;
  territory: string;
  openDate: string;
  closeDate?: string;
  beneficiaryTypes: string[];
  sectors: string[];
  cofinancingPct?: number;
  /* Differentiator fields */
  eligibilityProfile?: EligibilityProfile;
  successRate?: number;
  applicantCount?: number;
  competitionLevel?: "bajo" | "medio" | "alto" | "muy-alto";
  applicationComplexity?: "simple" | "moderada" | "compleja";
  avgResolutionDays?: number;
  impactMultiplier?: number;
  executionRisk?: "bajo" | "medio" | "alto";
  riskFactors?: string[];
  compatibleGrants?: string[];
  relatedProcurement?: string[];
  prtComponent?: string;
  maxCumulation?: string;
}

interface ProgramMilestone {
  label: string;
  status: "done" | "pending" | "risk";
  date: string;
}

interface SubPrograma {
  id: string;
  name: string;
  managingBody: string;
  totalBudgetM: number;
  executedM: number;
  executionPct: number;
  activeConvocatorias: number;
  yearlyExecution: { year: number; executedM: number }[];
  milestones?: ProgramMilestone[];
  executionRisk?: "bajo" | "medio" | "alto";
  riskFactors?: string[];
}

interface SubTerritorial {
  territory: string;
  totalReceivedM: number;
  perCapita: number;
  topSectors: string[] | { sector: string; amountM: number }[];
  ngeuExecutionPct: number;
  equityIndex?: number;
}

interface EuComparisonEntry {
  country: string;
  absorptionPct: number;
  totalAllocatedM: number;
}

interface ForecastEntry {
  title: string;
  organism: string;
  expectedMonth: string;
  estimatedBudgetM: number;
  fundSource: string;
  sectors: string[];
  confidence: "alta" | "media" | "baja";
}

interface BeneficiaryAnalytic {
  type: string;
  label: string;
  count: number;
  totalBudgetM: number;
  avgGrantM: number;
}

interface SeasonalPattern {
  month: number;
  count: number;
}

interface SubData {
  convocatorias: SubConvocatoria[];
  programas: SubPrograma[];
  territorial: SubTerritorial[];
  stats: {
    totalConvocatorias: number;
    abiertasCount: number;
    totalBudgetM: number;
    executionRate: number;
    bySource?: Record<string, { count: number; budgetM: number }>;
    bySector?: { sector: string; count: number; budgetM: number }[];
    seasonalPattern?: SeasonalPattern[];
  };
  euComparison?: EuComparisonEntry[];
  forecast?: ForecastEntry[];
  beneficiaryAnalytics?: BeneficiaryAnalytic[];
}

type SubView = "convocatorias" | "programas" | "territorial" | "calendario" | "analytics";

const statusColor: Record<string, string> = { abierta: "var(--verde)", "en-evaluacion": "var(--azul)", resuelta: "var(--ink-muted)", cerrada: "var(--ink-muted)", proxima: "#e67e22" };
const statusLabel: Record<string, string> = { abierta: "Abierta", "en-evaluacion": "En evaluación", resuelta: "Resuelta", cerrada: "Cerrada", proxima: "Próxima" };

const competitionColors: Record<string, string> = { bajo: "#22c55e", medio: "#f59e0b", alto: "#ef4444", "muy-alto": "#dc2626" };
const competitionLabels: Record<string, string> = { bajo: "Baja", medio: "Media", alto: "Alta", "muy-alto": "Muy alta" };

const complexityLabels: Record<string, string> = { simple: "Simple", moderada: "Moderada", compleja: "Compleja" };
const complexityColors: Record<string, string> = { simple: "#22c55e", moderada: "#f59e0b", compleja: "#ef4444" };

const riskColors: Record<string, string> = { bajo: "#22c55e", medio: "#f59e0b", alto: "#ef4444" };
const riskLabels: Record<string, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto" };

const confidenceColors: Record<string, string> = { alta: "#22c55e", media: "#f59e0b", baja: "#ef4444" };

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatM(n: number) { return `${n.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M\u20ac`; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); }

function daysUntil(d: string): number {
  const now = new Date();
  const target = new Date(d);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function deadlineUrgency(d: string): { label: string; color: string; className: string } {
  const days = daysUntil(d);
  if (days < 0) return { label: "Cerrada", color: "var(--ink-muted)", className: "sub-urgency-past" };
  if (days <= 7) return { label: `${days}d — Urgente`, color: "#dc2626", className: "sub-urgency-critical" };
  if (days <= 30) return { label: `${days}d — Próximo`, color: "#ef4444", className: "sub-urgency-soon" };
  if (days <= 90) return { label: `${days}d`, color: "#f59e0b", className: "sub-urgency-medium" };
  return { label: `${days}d`, color: "var(--ink-soft)", className: "sub-urgency-far" };
}

function sectorName(s: string | { sector: string; amountM: number }): string {
  return typeof s === "string" ? s : s.sector;
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function SubvencionesPage() {
  const [data, setData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<SubView>("convocatorias");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("sub-data-v2");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/subvenciones")
      .then((r) => r.json())
      .then((raw) => {
        // Normalize API shape to page expectations
        const d: SubData = {
          convocatorias: raw.convocatorias ?? [],
          programas: (raw.programs ?? raw.programas ?? []).map((p: Record<string, unknown>) => ({
            ...p,
            yearlyExecution: (p.timeline as { year: number; allocatedM: number; executedM: number }[] | undefined)?.map((t: { year: number; executedM: number }) => ({ year: t.year, executedM: t.executedM })) ?? p.yearlyExecution ?? [],
          })),
          territorial: (raw.territoryProfiles ?? raw.territorial ?? []).map((t: Record<string, unknown>) => ({
            ...t,
            topSectors: t.topSectors ?? [],
          })),
          stats: {
            totalConvocatorias: raw.stats?.totalConvocatorias ?? 0,
            abiertasCount: raw.stats?.openNow ?? raw.stats?.abiertasCount ?? 0,
            totalBudgetM: raw.stats?.totalBudgetM ?? 0,
            executionRate: raw.stats?.executionRate ?? 0,
            bySource: raw.stats?.bySource,
            bySector: raw.stats?.bySector,
            seasonalPattern: raw.stats?.seasonalPattern,
          },
          euComparison: raw.euComparison,
          forecast: raw.forecast,
          beneficiaryAnalytics: raw.beneficiaryAnalytics,
        };
        setData(d);
        try { sessionStorage.setItem("sub-data-v2", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const convocatorias = data?.convocatorias ?? [];
  const programas = data?.programas ?? [];
  const territorial = data?.territorial ?? [];
  const stats = data?.stats ?? { totalConvocatorias: 0, abiertasCount: 0, totalBudgetM: 0, executionRate: 0 };

  const allSources = [...new Set(convocatorias.map((c) => c.fundSource))];

  const filtered = convocatorias.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterSource && c.fundSource !== filterSource) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const calendar = [...convocatorias].filter((c) => c.closeDate).sort((a, b) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime());

  // Analytics computed values
  const avgSuccessRate = convocatorias.filter((c) => c.successRate != null).reduce((s, c) => s + (c.successRate ?? 0), 0) / (convocatorias.filter((c) => c.successRate != null).length || 1);
  const avgImpact = convocatorias.filter((c) => c.impactMultiplier != null).reduce((s, c) => s + (c.impactMultiplier ?? 0), 0) / (convocatorias.filter((c) => c.impactMultiplier != null).length || 1);

  return (
    <main className="page-shell">
      <SiteHeader currentSection="subvenciones" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">MONITOR DE SUBVENCIONES</span>
        <h1>Ayudas, fondos y NextGenerationEU</h1>
        <p className="hero-subtitle">
          Seguimiento de {stats.totalConvocatorias} convocatorias públicas de ayudas y subvenciones.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalConvocatorias}</span><span className="kpi-label">Total convocatorias</span></div>
          <div className="kpi-item"><span className="kpi-value" style={{ color: "var(--verde)" }}>{stats.abiertasCount}</span><span className="kpi-label">Abiertas ahora</span></div>
          <div className="kpi-item"><span className="kpi-value">{formatM(stats.totalBudgetM)}</span><span className="kpi-label">Presupuesto total</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.executionRate}%</span><span className="kpi-label">Tasa ejecución</span></div>
        </div>
      </section>

      {/* Tabs — now with analytics */}
      <div className="sub-view-bar">
        {(["convocatorias", "programas", "territorial", "calendario", "analytics"] as SubView[]).map((v) => (
          <button key={v} className={`sub-tab ${view === v ? "sub-tab-active" : ""}`} onClick={() => setView(v)}>
            {v === "convocatorias" ? "Convocatorias" : v === "programas" ? "Programas" : v === "territorial" ? "Territorial" : v === "calendario" ? "Calendario" : "Analytics"}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ CONVOCATORIAS (enhanced with differentiators) ═══ */}
          {view === "convocatorias" && (
            <section className="sub-section">
              <div className="sub-filters">
                <div className="sub-status-pills">
                  {(["abierta", "en-evaluacion", "resuelta", "proxima"] as const).map((s) => (
                    <button key={s} className={`sub-pill ${filterStatus === s ? "sub-pill-active" : ""}`}
                      style={{ borderColor: statusColor[s], color: filterStatus === s ? "#fff" : statusColor[s], background: filterStatus === s ? statusColor[s] : "transparent" }}
                      onClick={() => setFilterStatus(filterStatus === s ? "" : s)}>
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
                <select className="sub-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="">Todas las fuentes</option>
                  {allSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="sub-search" type="text" placeholder="Buscar convocatoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="sub-grid">
                {filtered.map((c) => {
                  const urgency = c.closeDate ? deadlineUrgency(c.closeDate) : null;
                  return (
                    <div key={c.id} className="sub-card">
                      <div className="sub-card-top-row">
                        <h3 className="sub-card-title">{c.title}</h3>
                        {/* #4 Competition level indicator */}
                        {c.competitionLevel && (
                          <span className="sub-competition-dot" style={{ background: competitionColors[c.competitionLevel] }} title={`Competencia: ${competitionLabels[c.competitionLevel]}`} />
                        )}
                      </div>
                      <p className="sub-card-organism">{c.organism}</p>

                      {/* #16 Recovery plan alignment */}
                      {c.prtComponent && <p className="sub-prt-badge">{c.prtComponent}</p>}

                      <div className="sub-card-meta">
                        <span className="sub-badge sub-badge-budget">{formatM(c.budgetM)}</span>
                        <span className="sub-badge" style={{ background: statusColor[c.status], color: "#fff" }}>{statusLabel[c.status]}</span>
                        <span className="sub-badge sub-badge-fund">{c.fundSource}</span>
                        {/* #6 Co-financing */}
                        {c.cofinancingPct != null && c.cofinancingPct > 0 && (
                          <span className="sub-badge sub-badge-cofin" title="Porcentaje de cofinanciación del beneficiario">{c.cofinancingPct}% cofin.</span>
                        )}
                      </div>

                      {/* #11 Application complexity */}
                      {c.applicationComplexity && (
                        <div className="sub-indicator-row">
                          <span className="sub-indicator-label">Complejidad:</span>
                          <span className="sub-indicator-value" style={{ color: complexityColors[c.applicationComplexity] }}>
                            {complexityLabels[c.applicationComplexity]}
                          </span>
                        </div>
                      )}

                      {/* #2 Historical success rate + #4 Competition */}
                      {(c.successRate != null || c.competitionLevel) && (
                        <div className="sub-indicator-row">
                          {c.successRate != null && (
                            <>
                              <span className="sub-indicator-label">Tasa aprobación:</span>
                              <span className="sub-indicator-value sub-indicator-mono">{c.successRate}%</span>
                            </>
                          )}
                          {c.applicantCount != null && (
                            <>
                              <span className="sub-indicator-label">Solicitantes:</span>
                              <span className="sub-indicator-value sub-indicator-mono">{c.applicantCount.toLocaleString("es-ES")}</span>
                            </>
                          )}
                          {c.competitionLevel && (
                            <>
                              <span className="sub-indicator-label">Competencia:</span>
                              <span className="sub-indicator-value" style={{ color: competitionColors[c.competitionLevel] }}>{competitionLabels[c.competitionLevel]}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* #9 Impact multiplier + #12 Resolution time */}
                      {(c.impactMultiplier != null || c.avgResolutionDays != null) && (
                        <div className="sub-indicator-row">
                          {c.impactMultiplier != null && (
                            <>
                              <span className="sub-indicator-label">Multiplicador:</span>
                              <span className="sub-indicator-value sub-indicator-mono">{c.impactMultiplier}x</span>
                            </>
                          )}
                          {c.avgResolutionDays != null && (
                            <>
                              <span className="sub-indicator-label">Resolución:</span>
                              <span className="sub-indicator-value sub-indicator-mono">{c.avgResolutionDays}d</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* #8 Execution risk */}
                      {c.executionRisk && c.executionRisk !== "bajo" && (
                        <div className="sub-indicator-row">
                          <span className="sub-indicator-label">Riesgo ejecución:</span>
                          <span className="sub-indicator-value" style={{ color: riskColors[c.executionRisk] }}>{riskLabels[c.executionRisk]}</span>
                          {c.riskFactors && c.riskFactors.length > 0 && (
                            <span className="sub-risk-factors" title={c.riskFactors.join("; ")}>({c.riskFactors.length} factores)</span>
                          )}
                        </div>
                      )}

                      <p className="sub-card-territory">{c.territory}</p>

                      {/* #18 Smart deadline alerts */}
                      {urgency && c.status === "abierta" && (
                        <p className={`sub-card-deadline ${urgency.className}`} style={{ color: urgency.color }}>
                          Cierre: {formatDate(c.closeDate!)} — {urgency.label}
                        </p>
                      )}
                      {c.closeDate && c.status !== "abierta" && (
                        <p className="sub-card-deadline">Cierre: {formatDate(c.closeDate)}</p>
                      )}

                      {/* #7 Grant overlap / compatible grants */}
                      {c.compatibleGrants && c.compatibleGrants.length > 0 && (
                        <div className="sub-compatible-row">
                          <span className="sub-indicator-label">Compatible con:</span>
                          <span className="sub-compatible-count">{c.compatibleGrants.length} ayudas</span>
                        </div>
                      )}

                      {/* #15 Cross-reference contratación */}
                      {c.relatedProcurement && c.relatedProcurement.length > 0 && (
                        <div className="sub-procurement-row">
                          <span className="sub-procurement-icon">&#x1F517;</span>
                          <span className="sub-indicator-label">{c.relatedProcurement.length} licitación(es) relacionada(s)</span>
                        </div>
                      )}

                      {/* #19 Grant stacking / cumulation */}
                      {c.maxCumulation && (
                        <p className="sub-cumulation" title={c.maxCumulation}>Acumulación: {c.maxCumulation.length > 60 ? c.maxCumulation.slice(0, 57) + "..." : c.maxCumulation}</p>
                      )}

                      <div className="sub-card-tags">
                        {c.beneficiaryTypes.map((b) => <span key={b} className="sub-tag sub-tag-beneficiary">{b}</span>)}
                        {c.sectors.map((s) => <span key={s} className="sub-tag">{s}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ PROGRAMAS (enhanced with milestones, execution risk) ═══ */}
          {view === "programas" && (
            <section className="sub-section">
              <SectionHeading eyebrow="Programas de fondos" title="Ejecución presupuestaria por programa" description="Presupuesto total, ejecutado, milestones NGEU y riesgo de ejecución." />
              <div className="sub-programas-list">
                {programas.map((p) => (
                  <div key={p.id} className="sub-programa-card">
                    <div className="sub-programa-header">
                      <h3 className="sub-card-title">{p.name}</h3>
                      <div className="sub-programa-header-right">
                        <span className="sub-card-organism">{p.managingBody}</span>
                        {/* #8 Execution risk */}
                        {p.executionRisk && (
                          <span className="sub-risk-badge" style={{ background: riskColors[p.executionRisk] + "22", color: riskColors[p.executionRisk], borderColor: riskColors[p.executionRisk] }}>
                            Riesgo: {riskLabels[p.executionRisk]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sub-budget-bar">
                      <div className="sub-budget-fill" style={{ width: `${p.executionPct}%` }} />
                    </div>
                    <div className="sub-programa-meta">
                      <span className="sub-execution-pct">{p.executionPct}%</span>
                      <span>{formatM(p.executedM)} / {formatM(p.totalBudgetM)}</span>
                      <span className="sub-badge">{p.activeConvocatorias} convocatorias</span>
                    </div>

                    {/* #8 Risk factors */}
                    {p.riskFactors && p.riskFactors.length > 0 && (
                      <div className="sub-risk-factors-list">
                        {p.riskFactors.map((f, i) => <span key={i} className="sub-risk-factor-item">{f}</span>)}
                      </div>
                    )}

                    {/* #3 NGEU Milestone tracker */}
                    {p.milestones && p.milestones.length > 0 && (
                      <div className="sub-milestones">
                        <span className="sub-milestones-title">Hitos clave</span>
                        <div className="sub-milestones-list">
                          {p.milestones.map((m, i) => (
                            <div key={i} className={`sub-milestone sub-milestone-${m.status}`}>
                              <span className="sub-milestone-dot" />
                              <span className="sub-milestone-label">{m.label}</span>
                              <span className="sub-milestone-date">{formatDate(m.date)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="sub-mini-timeline">
                      {p.yearlyExecution.map((y) => (
                        <div key={y.year} className="sub-year-bar">
                          <span className="sub-year-label">{y.year}</span>
                          <div className="sub-year-fill" style={{ height: `${p.totalBudgetM > 0 ? (y.executedM / p.totalBudgetM) * 100 : 0}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ TERRITORIAL (enhanced with equity index) ═══ */}
          {view === "territorial" && (
            <section className="sub-section">
              <SectionHeading eyebrow="Distribución territorial" title="Subvenciones por territorio" description="Fondos recibidos, per cápita, ejecución NGEU e índice de equidad regional." />
              <div className="sub-grid">
                {territorial.map((t) => (
                  <div key={t.territory} className="sub-card">
                    <div className="sub-card-top-row">
                      <h3 className="sub-card-title">{t.territory}</h3>
                      {/* #17 Regional equity index */}
                      {t.equityIndex != null && (
                        <span className="sub-equity-badge" style={{ background: t.equityIndex >= 75 ? "#22c55e22" : t.equityIndex >= 60 ? "#f59e0b22" : "#ef444422", color: t.equityIndex >= 75 ? "#22c55e" : t.equityIndex >= 60 ? "#f59e0b" : "#ef4444", borderColor: t.equityIndex >= 75 ? "#22c55e" : t.equityIndex >= 60 ? "#f59e0b" : "#ef4444" }}>
                          Equidad: {t.equityIndex}
                        </span>
                      )}
                    </div>
                    <div className="sub-card-meta">
                      <span className="sub-badge sub-badge-budget">{formatM(t.totalReceivedM)}</span>
                      <span className="sub-badge">{t.perCapita.toLocaleString("es-ES")} {"€"}/hab</span>
                    </div>
                    <div className="sub-card-tags">{t.topSectors?.map((s, i) => <span key={i} className="sub-tag">{sectorName(s)}</span>)}</div>
                    <div className="sub-ngeu-bar">
                      <div className="sub-ngeu-fill" style={{ width: `${t.ngeuExecutionPct}%` }} />
                    </div>
                    <span className="sub-ngeu-label">NGEU: {t.ngeuExecutionPct}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ CALENDARIO (enhanced with #18 smart deadline alerts) ═══ */}
          {view === "calendario" && (
            <section className="sub-section">
              <SectionHeading eyebrow="Calendario de plazos" title="Próximos cierres de convocatorias" description="Convocatorias ordenadas por fecha de cierre con alertas de urgencia." />
              <div className="sub-calendar-list">
                {calendar.map((c) => {
                  const urgency = deadlineUrgency(c.closeDate!);
                  return (
                    <div key={c.id} className={`sub-calendar-item ${urgency.className}`}>
                      <div className="sub-calendar-date">
                        <span>{formatDate(c.closeDate!)}</span>
                        <span className="sub-calendar-urgency" style={{ color: urgency.color }}>{urgency.label}</span>
                      </div>
                      <div className="sub-calendar-info">
                        <h4 className="sub-card-title">{c.title}</h4>
                        <span className="sub-card-organism">{c.organism}</span>
                        <div className="sub-card-meta">
                          <span className="sub-badge sub-badge-budget">{formatM(c.budgetM)}</span>
                          <span className="sub-badge" style={{ background: statusColor[c.status], color: "#fff" }}>{statusLabel[c.status]}</span>
                          {c.competitionLevel && (
                            <span className="sub-badge" style={{ background: competitionColors[c.competitionLevel] + "22", color: competitionColors[c.competitionLevel] }}>
                              Competencia: {competitionLabels[c.competitionLevel]}
                            </span>
                          )}
                          {c.applicationComplexity && (
                            <span className="sub-badge" style={{ background: complexityColors[c.applicationComplexity] + "22", color: complexityColors[c.applicationComplexity] }}>
                              {complexityLabels[c.applicationComplexity]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ ANALYTICS (Feature #20 + #5 EU Comparison + #10 Seasonal + #13 Forecast + #14 Beneficiary) ═══ */}
          {view === "analytics" && (
            <section className="sub-section">
              <SectionHeading eyebrow="Inteligencia competitiva" title="Analytics de subvenciones" description="Tendencias, patrones estacionales, comparativa europea y previsiones." />

              {/* Summary KPIs */}
              <div className="sub-analytics-kpis">
                <div className="sub-analytics-kpi">
                  <span className="sub-analytics-kpi-value">{Math.round(avgSuccessRate)}%</span>
                  <span className="sub-analytics-kpi-label">Tasa media de aprobación</span>
                </div>
                <div className="sub-analytics-kpi">
                  <span className="sub-analytics-kpi-value">{avgImpact.toFixed(1)}x</span>
                  <span className="sub-analytics-kpi-label">Multiplicador medio</span>
                </div>
                <div className="sub-analytics-kpi">
                  <span className="sub-analytics-kpi-value">{convocatorias.filter((c) => c.competitionLevel === "bajo").length}</span>
                  <span className="sub-analytics-kpi-label">Baja competencia</span>
                </div>
                <div className="sub-analytics-kpi">
                  <span className="sub-analytics-kpi-value">{convocatorias.filter((c) => c.applicationComplexity === "simple").length}</span>
                  <span className="sub-analytics-kpi-label">Solicitud simple</span>
                </div>
              </div>

              {/* #5 EU Budget absorption comparison */}
              {data.euComparison && data.euComparison.length > 0 && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Absorción presupuestaria NextGenerationEU — Comparativa europea</h3>
                  <div className="sub-eu-comparison">
                    {data.euComparison.map((e) => (
                      <div key={e.country} className={`sub-eu-row ${e.country === "España" ? "sub-eu-row-highlight" : ""}`}>
                        <span className="sub-eu-country">{e.country}</span>
                        <div className="sub-eu-bar-container">
                          <div className="sub-eu-bar" style={{ width: `${e.absorptionPct}%` }} />
                        </div>
                        <span className="sub-eu-pct">{e.absorptionPct}%</span>
                        <span className="sub-eu-amount">{formatM(e.totalAllocatedM)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* #10 Seasonal patterns */}
              {stats.seasonalPattern && stats.seasonalPattern.length > 0 && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Patrón estacional de publicación de convocatorias</h3>
                  <div className="sub-seasonal-chart">
                    {stats.seasonalPattern.map((sp) => {
                      const maxCount = Math.max(...stats.seasonalPattern!.map((s) => s.count), 1);
                      return (
                        <div key={sp.month} className="sub-seasonal-bar-wrapper">
                          <div className="sub-seasonal-bar" style={{ height: `${(sp.count / maxCount) * 100}%` }}>
                            <span className="sub-seasonal-count">{sp.count}</span>
                          </div>
                          <span className="sub-seasonal-month">{monthNames[sp.month - 1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* #20 Budget by source */}
              {stats.bySource && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Presupuesto por fuente de financiación</h3>
                  <div className="sub-source-bars">
                    {Object.entries(stats.bySource).filter(([, v]) => v.count > 0).sort(([, a], [, b]) => b.budgetM - a.budgetM).map(([src, v]) => {
                      const maxBudget = Math.max(...Object.values(stats.bySource!).map((x) => x.budgetM), 1);
                      return (
                        <div key={src} className="sub-source-row">
                          <span className="sub-source-name">{src.toUpperCase()}</span>
                          <div className="sub-source-bar-container">
                            <div className="sub-source-bar" style={{ width: `${(v.budgetM / maxBudget) * 100}%` }} />
                          </div>
                          <span className="sub-source-value">{formatM(v.budgetM)}</span>
                          <span className="sub-source-count">{v.count} conv.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* #20 Budget by sector (top 12) */}
              {stats.bySector && stats.bySector.length > 0 && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Top sectores por presupuesto</h3>
                  <div className="sub-source-bars">
                    {stats.bySector.slice(0, 12).map((s) => {
                      const maxBudget = stats.bySector![0].budgetM || 1;
                      return (
                        <div key={s.sector} className="sub-source-row">
                          <span className="sub-source-name">{s.sector}</span>
                          <div className="sub-source-bar-container">
                            <div className="sub-source-bar sub-source-bar-sector" style={{ width: `${(s.budgetM / maxBudget) * 100}%` }} />
                          </div>
                          <span className="sub-source-value">{formatM(s.budgetM)}</span>
                          <span className="sub-source-count">{s.count} conv.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* #14 Beneficiary analytics */}
              {data.beneficiaryAnalytics && data.beneficiaryAnalytics.length > 0 && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Análisis por tipo de beneficiario</h3>
                  <div className="sub-beneficiary-grid">
                    {data.beneficiaryAnalytics.map((b) => (
                      <div key={b.type} className="sub-beneficiary-card">
                        <h4 className="sub-beneficiary-type">{b.label}</h4>
                        <div className="sub-beneficiary-stats">
                          <div className="sub-beneficiary-stat">
                            <span className="sub-beneficiary-stat-value">{b.count}</span>
                            <span className="sub-beneficiary-stat-label">Convocatorias</span>
                          </div>
                          <div className="sub-beneficiary-stat">
                            <span className="sub-beneficiary-stat-value">{formatM(b.totalBudgetM)}</span>
                            <span className="sub-beneficiary-stat-label">Presupuesto</span>
                          </div>
                          <div className="sub-beneficiary-stat">
                            <span className="sub-beneficiary-stat-value">{formatM(b.avgGrantM)}</span>
                            <span className="sub-beneficiary-stat-label">Media/conv.</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* #13 Forecast — upcoming predicted convocatorias */}
              {data.forecast && data.forecast.length > 0 && (
                <div className="sub-analytics-block">
                  <h3 className="sub-analytics-block-title">Previsión de próximas convocatorias</h3>
                  <div className="sub-forecast-list">
                    {data.forecast.map((f, i) => (
                      <div key={i} className="sub-forecast-item">
                        <div className="sub-forecast-month">{f.expectedMonth}</div>
                        <div className="sub-forecast-info">
                          <h4 className="sub-card-title">{f.title}</h4>
                          <span className="sub-card-organism">{f.organism}</span>
                          <div className="sub-card-meta">
                            <span className="sub-badge sub-badge-budget">{formatM(f.estimatedBudgetM)}</span>
                            <span className="sub-badge sub-badge-fund">{f.fundSource}</span>
                            <span className="sub-badge" style={{ background: confidenceColors[f.confidence] + "22", color: confidenceColors[f.confidence] }}>
                              Confianza: {f.confidence}
                            </span>
                          </div>
                          <div className="sub-card-tags">
                            {f.sectors.map((s) => <span key={s} className="sub-tag">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* #1 Eligibility matcher summary */}
              <div className="sub-analytics-block">
                <h3 className="sub-analytics-block-title">Perfiles de elegibilidad — Resumen</h3>
                <p className="sub-analytics-desc">
                  {convocatorias.filter((c) => c.eligibilityProfile).length} de {convocatorias.length} convocatorias tienen perfil de elegibilidad detallado con criterios de tipo de entidad, sector, territorio y tamaño.
                </p>
                <div className="sub-eligibility-summary">
                  <div className="sub-eligibility-stat">
                    <span className="sub-beneficiary-stat-value">{convocatorias.filter((c) => c.eligibilityProfile).length}</span>
                    <span className="sub-beneficiary-stat-label">Con perfil detallado</span>
                  </div>
                  <div className="sub-eligibility-stat">
                    <span className="sub-beneficiary-stat-value">{convocatorias.filter((c) => c.compatibleGrants && c.compatibleGrants.length > 0).length}</span>
                    <span className="sub-beneficiary-stat-label">Con solapamientos mapeados</span>
                  </div>
                  <div className="sub-eligibility-stat">
                    <span className="sub-beneficiary-stat-value">{convocatorias.filter((c) => c.relatedProcurement && c.relatedProcurement.length > 0).length}</span>
                    <span className="sub-beneficiary-stat-label">Con contratación vinculada</span>
                  </div>
                  <div className="sub-eligibility-stat">
                    <span className="sub-beneficiary-stat-value">{convocatorias.filter((c) => c.maxCumulation).length}</span>
                    <span className="sub-beneficiary-stat-label">Con reglas acumulación</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
