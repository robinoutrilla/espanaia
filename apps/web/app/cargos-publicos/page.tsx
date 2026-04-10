"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Cargos Publicos — Public officials tracking dashboard with 20 competitive
   differentiators: career timelines, revolving door tracker, influence scores,
   gender/age/education analytics, tenure analysis, media exposure, legislative
   productivity, conflict flags, patrimony, power concentration, succession,
   historical governments, appointment types, social media, international roles,
   comparative stats, weekly alerts, geographic diversity.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = "cp-data-v2";

type ViewMode = "directorio" | "cambios" | "grafo" | "partidos" | "estadisticas";
type Level = "gobierno" | "congreso" | "senado" | "ccaa" | "ayuntamiento" | "europa" | "organismo";
type ChangeType = "nombramiento" | "cese" | "dimision" | "remodelacion" | "eleccion";
type StatsSubView = "genero" | "edad" | "formacion" | "mandato" | "influencia" | "patrimonio" | "puerta-giratoria" | "conflictos" | "geografia" | "comparativa" | "historico" | "legislativa";

interface Official {
  id: string; name: string; role: string; institution: string; level: Level;
  party: string; partyColor: string; territory?: string; since: string;
  activityCount: number; connectionCount: number;
  previousRoles?: { role: string; institution: string; period: string }[];
  recentActivity?: { date: string; description: string }[];
  connections?: string[];
  // ── New competitive differentiator fields ──
  gender?: "M" | "F";
  birthYear?: number;
  education?: { degree: string; institution: string; specialization?: string };
  careerTimeline?: { year: number; role: string; institution: string }[];
  revolvingDoor?: { company: string; role: string; year: number }[];
  influenceScore?: number;
  mediaExposure?: number;
  appointmentType?: "eleccion" | "nombramiento" | "carrera";
  deputy?: string;
  homeCCAA?: string;
  conflictFlags?: string[];
  patrimony?: { realEstate: number; savings: number; otherAssets: number; lastDeclaration: string };
  socialMedia?: { platform: string; handle: string; followers: number }[];
  internationalRoles?: string[];
  legislativeActivity?: { billsProposed: number; interventions: number; votingAttendance: number };
}

interface CargoChange {
  id: string; date: string; person: string; type: ChangeType;
  fromRole?: string; toRole?: string; institution: string; description: string;
}

interface PartyBreakdown {
  party: string; slug: string; color: string;
  counts: Record<Level, number>; total: number;
  keyFigures: string[]; powerIndex: number;
}

interface ConnectionGroup {
  label: string; description: string;
  members: { name: string; role: string; party: string; partyColor: string }[];
}

interface GenderStats {
  total: number; women: number; men: number; pctWomen: number;
  byLevel: Record<Level, { total: number; women: number; pctWomen: number }>;
  byParty: { party: string; total: number; women: number; pctWomen: number }[];
}

interface TenureStats {
  avgYears: number;
  byLevel: Record<Level, number>;
  longest: { name: string; years: number; role: string }[];
  shortest: { name: string; years: number; role: string }[];
}

interface AgeStats {
  avgAge: number; byLevel: Record<Level, number>;
  under40: number; age40to55: number; age55to65: number; over65: number;
}

interface PowerConcentration {
  party: string; herfindahl: number; topThreeSharePct: number;
  topThree: { name: string; influenceScore: number }[];
}

interface ComparativeStats {
  spain: { govSize: number; avgTurnoverMonths: number; womenPct: number; avgAge: number };
  euAvg: { govSize: number; avgTurnoverMonths: number; womenPct: number; avgAge: number };
}

interface HistoricalGovernment {
  period: string; president: string; party: string; ministers: number; womenPct: number; formation: string;
}

interface WeeklyAlert {
  type: string; date: string; summary: string;
}

interface CPData {
  officials: Official[]; changes: CargoChange[];
  parties: PartyBreakdown[]; connectionGroups: ConnectionGroup[];
  stats: { total: number; recentChanges: number; levels: number; parties: number };
  genderStats?: GenderStats;
  tenureStats?: TenureStats;
  ageStats?: AgeStats;
  powerConcentration?: PowerConcentration[];
  comparativeStats?: ComparativeStats;
  historicalGovernments?: HistoricalGovernment[];
  weeklyAlerts?: WeeklyAlert[];
  geographicDiversity?: { ccaa: string; count: number; officials: string[] }[];
  revolvingDoorCount?: number;
  educationBreakdown?: { degree: string; count: number }[];
}

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: "directorio", label: "Directorio" },
  { id: "cambios", label: "Cambios" },
  { id: "grafo", label: "Grafo" },
  { id: "partidos", label: "Partidos" },
  { id: "estadisticas", label: "Inteligencia" },
];

const STATS_SUB_TABS: { id: StatsSubView; label: string }[] = [
  { id: "genero", label: "Diversidad de genero" },
  { id: "edad", label: "Demografia" },
  { id: "formacion", label: "Formacion" },
  { id: "mandato", label: "Mandato" },
  { id: "influencia", label: "Influencia" },
  { id: "patrimonio", label: "Patrimonio" },
  { id: "puerta-giratoria", label: "Puerta giratoria" },
  { id: "conflictos", label: "Conflictos" },
  { id: "geografia", label: "Mapa territorial" },
  { id: "comparativa", label: "Espana vs UE" },
  { id: "historico", label: "Gobiernos hist." },
  { id: "legislativa", label: "Productividad" },
];

const LEVEL_LABELS: Record<Level, string> = {
  gobierno: "Gobierno", congreso: "Congreso", senado: "Senado",
  ccaa: "CCAA", ayuntamiento: "Ayuntamiento", europa: "Europa", organismo: "Organismo",
};

const LEVEL_COLORS: Record<Level, string> = {
  gobierno: "#0F4483", congreso: "#E30613", senado: "#ca8a04",
  ccaa: "#0d9488", ayuntamiento: "#7c3aed", europa: "#2563eb", organismo: "#6b7280",
};

const CHANGE_COLORS: Record<ChangeType, string> = {
  nombramiento: "#16a34a", cese: "#dc2626", dimision: "#ea580c",
  remodelacion: "#2563eb", eleccion: "#7c3aed",
};

const CHANGE_LABELS: Record<ChangeType, string> = {
  nombramiento: "Nombramiento", cese: "Cese", dimision: "Dimision",
  remodelacion: "Remodelacion", eleccion: "Eleccion",
};

const APPT_LABELS: Record<string, string> = {
  eleccion: "Eleccion", nombramiento: "Nombramiento", carrera: "Carrera funcionarial",
};

const LEVELS: Level[] = ["gobierno", "congreso", "senado", "ccaa", "ayuntamiento", "europa", "organismo"];

const FALLBACK: CPData = {
  stats: { total: 2480, recentChanges: 47, levels: 7, parties: 21 },
  officials: [], changes: [], parties: [], connectionGroups: [],
};

/* ── Bar helper ── */
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="cp-bar-track">
      <div className="cp-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function CargosPublicosPage() {
  const [data, setData] = useState<CPData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("directorio");
  const [statsSubView, setStatsSubView] = useState<StatsSubView>("genero");
  const [levelFilter, setLevelFilter] = useState<Level | "">("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem(CACHE_KEY);
      if (c) { setData(JSON.parse(c)); setLoading(false); return; }
    } catch {}
    fetch("/api/cargos-publicos")
      .then((r) => r.json())
      .then((d) => {
        /* Normalize API shape to page shape */
        const norm: CPData = {
          officials: (d.officials ?? []).map((o: any) => ({
            id: o.id, name: o.name, role: o.currentRole ?? o.role, institution: o.institution,
            level: o.level, party: o.party ?? "Independiente", partyColor: o.partyColor ?? "#6b7280",
            territory: o.territory, since: o.since,
            activityCount: o.activity?.length ?? o.activityCount ?? 0,
            connectionCount: o.connections?.length ?? o.connectionCount ?? 0,
            previousRoles: (o.previousRoles ?? []).map((r: any) => ({ role: r.role, institution: r.institution, period: r.from && r.to ? `${r.from} - ${r.to}` : r.period ?? "" })),
            recentActivity: (o.activity ?? o.recentActivity ?? []).slice(0, 3).map((a: any) => ({ date: a.date, description: a.summary ?? a.description ?? a.title })),
            connections: (o.connections ?? []).map((c: any) => c.label ?? c.targetId ?? c),
            gender: o.gender, birthYear: o.birthYear, education: o.education,
            careerTimeline: o.careerTimeline, revolvingDoor: o.revolvingDoor,
            influenceScore: o.influenceScore, mediaExposure: o.mediaExposure,
            appointmentType: o.appointmentType, deputy: o.deputy, homeCCAA: o.homeCCAA,
            conflictFlags: o.conflictFlags, patrimony: o.patrimony,
            socialMedia: o.socialMedia, internationalRoles: o.internationalRoles,
            legislativeActivity: o.legislativeActivity,
          })),
          changes: (d.recentChanges ?? d.changes ?? []).map((c: any) => ({
            id: c.id, date: c.date, person: c.personName ?? c.person, type: c.type,
            fromRole: c.fromRole, toRole: c.toRole, institution: c.institution, description: c.description,
          })),
          parties: d.parties ?? [],
          connectionGroups: d.connectionGroups ?? [],
          stats: d.stats ? {
            total: d.stats.totalTracked ?? d.stats.total ?? 0,
            recentChanges: d.stats.recentChangesCount ?? d.stats.recentChanges ?? 0,
            levels: Object.keys(d.stats.byLevel ?? {}).length || d.stats.levels || 7,
            parties: d.stats.byParty?.length ?? d.stats.parties ?? 0,
          } : FALLBACK.stats,
          genderStats: d.genderStats,
          tenureStats: d.tenureStats,
          ageStats: d.ageStats,
          powerConcentration: d.powerConcentration,
          comparativeStats: d.comparativeStats,
          historicalGovernments: d.historicalGovernments,
          weeklyAlerts: d.weeklyAlerts,
          geographicDiversity: d.geographicDiversity,
          revolvingDoorCount: d.revolvingDoorCount,
          educationBreakdown: d.educationBreakdown,
        };
        setData(norm);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(norm)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = data.officials;
    if (levelFilter) list = list.filter((o) => o.level === levelFilter);
    if (search) { const q = search.toLowerCase(); list = list.filter((o) => o.name.toLowerCase().includes(q) || o.role.toLowerCase().includes(q) || o.institution.toLowerCase().includes(q)); }
    return list;
  }, [data.officials, levelFilter, search]);

  const { stats } = data;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="cargos-publicos" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">SEGUIMIENTO DE CARGOS PUBLICOS</span>
            <h1 className="detail-title">Mapa de actores institucionales</h1>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid-2">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{stats.total.toLocaleString("es-ES")}</strong><span>Total rastreados</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{stats.recentChanges}</strong><span>Cambios recientes</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{stats.levels}</strong><span>Niveles cubiertos</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--amarillo)" }}>{stats.parties}</strong><span>Partidos</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Weekly Alerts (feature #19) ── */}
      {data.weeklyAlerts && data.weeklyAlerts.length > 0 && (
        <section className="panel section-panel cp-alerts-panel">
          <h3 className="cp-alerts-title">Esta semana en cargos publicos</h3>
          <div className="cp-alerts-list">
            {data.weeklyAlerts.map((a, i) => (
              <div key={i} className="cp-alert-item">
                <span className="cp-alert-date">{a.date}</span>
                <span className={`cp-alert-type cp-alert-type-${a.type}`}>{a.type}</span>
                <span className="cp-alert-text">{a.summary}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── View tabs ── */}
      <section className="panel section-panel">
        <div className="cp-tabs">
          {VIEW_TABS.map((t) => (
            <button key={t.id} className={`cp-tab ${view === t.id ? "cp-tab-active" : ""}`} onClick={() => setView(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ══════════════════ DIRECTORIO ══════════════════ */}
        {view === "directorio" && (
          <>
            <div className="cp-filters">
              <div className="cp-level-pills">
                <button className={`cp-pill ${!levelFilter ? "cp-pill-active" : ""}`} onClick={() => setLevelFilter("")}>Todos</button>
                {LEVELS.map((l) => (
                  <button key={l} className={`cp-pill ${levelFilter === l ? "cp-pill-active" : ""}`} style={levelFilter === l ? { background: `${LEVEL_COLORS[l]}18`, color: LEVEL_COLORS[l], borderColor: LEVEL_COLORS[l] } : {}} onClick={() => setLevelFilter(l)}>{LEVEL_LABELS[l]}</button>
                ))}
              </div>
              <input className="cp-search" type="text" placeholder="Buscar cargo, nombre o institucion..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="cp-grid">
              {filtered.map((o) => {
                const isOpen = expanded === o.id;
                return (
                  <article key={o.id} className="cp-card" onClick={() => setExpanded(isOpen ? null : o.id)}>
                    <div className="cp-card-head">
                      <div>
                        <strong className="cp-card-name">{o.name}</strong>
                        {o.gender && <span className="cp-gender-badge">{o.gender === "F" ? "M" : "H"}</span>}
                        {o.birthYear && <span className="cp-age-badge">{2026 - o.birthYear} anos</span>}
                      </div>
                      <span className="cp-card-role">{o.role}</span>
                    </div>
                    <div className="cp-card-meta">
                      <span className="cp-card-institution">{o.institution}</span>
                      <span className="tag" style={{ background: `${LEVEL_COLORS[o.level]}18`, color: LEVEL_COLORS[o.level] }}>{LEVEL_LABELS[o.level]}</span>
                      <span className="tag" style={{ background: `${o.partyColor}18`, color: o.partyColor }}>{o.party}</span>
                      {o.territory && <span className="micro-tag">{o.territory}</span>}
                      {o.appointmentType && <span className="micro-tag">{APPT_LABELS[o.appointmentType]}</span>}
                    </div>

                    {/* Influence + media bars (features #3, #8) */}
                    {(o.influenceScore != null || o.mediaExposure != null) && (
                      <div className="cp-card-bars">
                        {o.influenceScore != null && (
                          <div className="cp-bar-row">
                            <span className="cp-bar-label">Influencia</span>
                            <Bar value={o.influenceScore} max={100} color="var(--azul)" />
                            <span className="cp-bar-val">{o.influenceScore}</span>
                          </div>
                        )}
                        {o.mediaExposure != null && (
                          <div className="cp-bar-row">
                            <span className="cp-bar-label">Exposicion mediatica</span>
                            <Bar value={o.mediaExposure} max={100} color="var(--rojo)" />
                            <span className="cp-bar-val">{o.mediaExposure}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="cp-card-stats">
                      <span>Desde: {o.since}</span>
                      <span>{o.activityCount} actividades</span>
                      <span>{o.connectionCount} conexiones</span>
                    </div>

                    {/* Conflict flags (feature #10) */}
                    {o.conflictFlags && o.conflictFlags.length > 0 && (
                      <div className="cp-conflict-flags">
                        {o.conflictFlags.map((f, i) => (
                          <span key={i} className="cp-conflict-flag">{f}</span>
                        ))}
                      </div>
                    )}

                    {isOpen && (
                      <div className="cp-card-detail">
                        {/* Education (feature #6) */}
                        {o.education && (
                          <div className="cp-detail-section">
                            <h4>Formacion academica</h4>
                            <p className="cp-edu-info"><strong>{o.education.degree}</strong> &mdash; {o.education.institution}{o.education.specialization ? ` (${o.education.specialization})` : ""}</p>
                          </div>
                        )}

                        {/* Career timeline (feature #1) */}
                        {o.careerTimeline && o.careerTimeline.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Trayectoria profesional</h4>
                            <div className="cp-timeline-mini">
                              {o.careerTimeline.map((step, i) => (
                                <div key={i} className="cp-timeline-step">
                                  <span className="cp-timeline-year">{step.year}</span>
                                  <div className="cp-timeline-dot" />
                                  <div className="cp-timeline-content">
                                    <strong>{step.role}</strong>
                                    <span>{step.institution}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Revolving door (feature #2) */}
                        {o.revolvingDoor && o.revolvingDoor.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Puerta giratoria</h4>
                            {o.revolvingDoor.map((rd, i) => (
                              <div key={i} className="cp-revolving-entry">
                                <span className="cp-revolving-year">{rd.year}</span>
                                <span className="cp-revolving-role">{rd.role}</span>
                                <span className="cp-revolving-company">{rd.company}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Patrimony (feature #11) */}
                        {o.patrimony && (
                          <div className="cp-detail-section">
                            <h4>Declaracion patrimonial</h4>
                            <div className="cp-patrimony-grid">
                              <div><span>Inmuebles:</span> <strong>{o.patrimony.realEstate.toLocaleString("es-ES")} EUR</strong></div>
                              <div><span>Ahorro:</span> <strong>{o.patrimony.savings.toLocaleString("es-ES")} EUR</strong></div>
                              <div><span>Otros activos:</span> <strong>{o.patrimony.otherAssets.toLocaleString("es-ES")} EUR</strong></div>
                              <div><span>Ultima declaracion:</span> <strong>{o.patrimony.lastDeclaration}</strong></div>
                            </div>
                          </div>
                        )}

                        {/* Deputy / Succession (feature #13) */}
                        {o.deputy && (
                          <div className="cp-detail-section">
                            <h4>Sucesor/a designado/a</h4>
                            <p className="cp-deputy-name">{o.deputy}</p>
                          </div>
                        )}

                        {/* Social media (feature #16) */}
                        {o.socialMedia && o.socialMedia.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Redes sociales</h4>
                            <div className="cp-chips">
                              {o.socialMedia.map((sm, i) => (
                                <span key={i} className="cp-social-chip">
                                  <strong>{sm.platform}</strong> {sm.handle} ({(sm.followers / 1000).toFixed(0)}k)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* International roles (feature #17) */}
                        {o.internationalRoles && o.internationalRoles.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Roles internacionales</h4>
                            <div className="cp-chips">
                              {o.internationalRoles.map((r, i) => (
                                <span key={i} className="micro-tag">{r}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Legislative activity (feature #9) */}
                        {o.legislativeActivity && (
                          <div className="cp-detail-section">
                            <h4>Actividad legislativa</h4>
                            <div className="cp-legis-grid">
                              <div><span>Proposiciones de ley:</span> <strong>{o.legislativeActivity.billsProposed}</strong></div>
                              <div><span>Intervenciones:</span> <strong>{o.legislativeActivity.interventions}</strong></div>
                              <div><span>Asistencia a votaciones:</span> <strong>{o.legislativeActivity.votingAttendance}%</strong></div>
                            </div>
                          </div>
                        )}

                        {o.previousRoles && o.previousRoles.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Cargos anteriores</h4>
                            {o.previousRoles.map((r, i) => (<div key={i} className="cp-prev-role"><strong>{r.role}</strong> &mdash; {r.institution} <span className="cp-period">({r.period})</span></div>))}
                          </div>
                        )}
                        {o.recentActivity && o.recentActivity.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Actividad reciente</h4>
                            {o.recentActivity.map((a, i) => (<div key={i} className="cp-activity"><span className="cp-activity-date">{a.date}</span> {a.description}</div>))}
                          </div>
                        )}
                        {o.connections && o.connections.length > 0 && (
                          <div className="cp-detail-section">
                            <h4>Conexiones</h4>
                            <div className="cp-chips">{o.connections.map((c) => (<span key={c} className="micro-tag">{c}</span>))}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════════ CAMBIOS ══════════════════ */}
        {view === "cambios" && (
          <div className="cp-timeline">
            <SectionHeading eyebrow="Historial" title="Cambios recientes en cargos publicos" description="Cronologia de nombramientos, ceses, dimisiones, remodelaciones y elecciones." />
            {data.changes.map((c) => {
              const color = CHANGE_COLORS[c.type];
              return (
                <div key={c.id} className="cp-change" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="cp-change-top">
                    <span className="cp-change-date">{c.date}</span>
                    <strong className="cp-change-person">{c.person}</strong>
                    <span className="tag" style={{ background: `${color}18`, color }}>{CHANGE_LABELS[c.type]}</span>
                  </div>
                  <div className="cp-change-roles">
                    {c.fromRole && <span className="cp-role-from">{c.fromRole}</span>}
                    {c.fromRole && c.toRole && <span className="cp-arrow">&rarr;</span>}
                    {c.toRole && <span className="cp-role-to">{c.toRole}</span>}
                  </div>
                  <span className="cp-change-inst">{c.institution}</span>
                  <p className="cp-change-desc">{c.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════ GRAFO ══════════════════ */}
        {view === "grafo" && (
          <div className="cp-grafo">
            <SectionHeading eyebrow="Red de conexiones" title="Grupos de conexion entre cargos" description="Visualizacion de las principales redes de relacion entre actores institucionales." />
            {data.connectionGroups.map((g, gi) => (
              <div key={gi} className="cp-conn-group">
                <h3 className="cp-conn-title">{g.label}</h3>
                <p className="cp-conn-desc">{g.description}</p>
                <div className="cp-chips">
                  {g.members.map((m, mi) => (
                    <span key={mi} className="cp-conn-chip" style={{ borderColor: m.partyColor, background: `${m.partyColor}10` }}>
                      <strong>{m.name}</strong>
                      <span className="cp-conn-role">{m.role}</span>
                      <span className="micro-tag" style={{ color: m.partyColor }}>{m.party}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════ PARTIDOS ══════════════════ */}
        {view === "partidos" && (
          <div className="cp-partidos">
            <SectionHeading eyebrow="Desglose por partido" title="Presencia institucional por partido" description="Indice de poder basado en cargos ocupados en todos los niveles de gobierno." />
            {data.parties.map((p) => (
              <div key={p.slug} className="cp-party-card">
                <div className="cp-party-head">
                  <div className="cp-party-color-bar" style={{ background: p.color }} />
                  <strong className="cp-party-name">{p.party}</strong>
                  <span className="cp-party-total">{p.total} cargos</span>
                  <span className="cp-party-power" style={{ color: p.color }}>Poder: {p.powerIndex}/100</span>
                </div>
                <div className="cp-party-levels">
                  {LEVELS.map((l) => (
                    <div key={l} className="cp-party-level">
                      <span className="cp-party-level-label">{LEVEL_LABELS[l]}</span>
                      <span className="cp-party-level-count" style={{ color: p.counts[l] > 0 ? p.color : "var(--ink-muted)" }}>{p.counts[l]}</span>
                    </div>
                  ))}
                </div>
                <div className="cp-party-figures">
                  <span className="cp-party-figures-label">Figuras clave:</span>
                  {p.keyFigures.map((f) => (<span key={f} className="micro-tag">{f}</span>))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════ ESTADISTICAS / INTELIGENCIA ══════════════════ */}
        {view === "estadisticas" && (
          <div className="cp-estadisticas">
            <SectionHeading eyebrow="Inteligencia competitiva" title="Analisis avanzado de cargos publicos" description="Metricas exclusivas que ningun directorio de cargos publicos ofrece." />

            <div className="cp-stats-sub-tabs">
              {STATS_SUB_TABS.map((t) => (
                <button key={t.id} className={`cp-sub-tab ${statsSubView === t.id ? "cp-sub-tab-active" : ""}`} onClick={() => setStatsSubView(t.id)}>{t.label}</button>
              ))}
            </div>

            {/* ── Gender diversity (feature #4) ── */}
            {statsSubView === "genero" && data.genderStats && (
              <div className="cp-stat-panel">
                <h3>Diversidad de genero en cargos publicos</h3>
                <div className="cp-stat-kpis">
                  <div className="cp-stat-kpi"><strong style={{ color: "var(--rojo)" }}>{data.genderStats.pctWomen}%</strong><span>Mujeres</span></div>
                  <div className="cp-stat-kpi"><strong>{data.genderStats.women}</strong><span>Mujeres</span></div>
                  <div className="cp-stat-kpi"><strong>{data.genderStats.men}</strong><span>Hombres</span></div>
                </div>
                <h4>Por nivel institucional</h4>
                <div className="cp-stat-table">
                  {LEVELS.map((l) => {
                    const s = data.genderStats!.byLevel[l];
                    return s ? (
                      <div key={l} className="cp-stat-row">
                        <span className="cp-stat-row-label">{LEVEL_LABELS[l]}</span>
                        <Bar value={s.pctWomen} max={100} color="#e11d48" />
                        <span className="cp-stat-row-val">{s.pctWomen}% ({s.women}/{s.total})</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <h4>Por partido</h4>
                <div className="cp-stat-table">
                  {data.genderStats.byParty.slice(0, 10).map((p) => (
                    <div key={p.party} className="cp-stat-row">
                      <span className="cp-stat-row-label">{p.party}</span>
                      <Bar value={p.pctWomen} max={100} color="#e11d48" />
                      <span className="cp-stat-row-val">{p.pctWomen}% ({p.women}/{p.total})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Age demographics (feature #5) ── */}
            {statsSubView === "edad" && data.ageStats && (
              <div className="cp-stat-panel">
                <h3>Demografia por edad</h3>
                <div className="cp-stat-kpis">
                  <div className="cp-stat-kpi"><strong style={{ color: "var(--azul)" }}>{data.ageStats.avgAge}</strong><span>Edad media</span></div>
                  <div className="cp-stat-kpi"><strong>{data.ageStats.under40}</strong><span>Menores de 40</span></div>
                  <div className="cp-stat-kpi"><strong>{data.ageStats.age40to55}</strong><span>40-55 anos</span></div>
                  <div className="cp-stat-kpi"><strong>{data.ageStats.age55to65}</strong><span>55-65 anos</span></div>
                  <div className="cp-stat-kpi"><strong>{data.ageStats.over65}</strong><span>Mayores de 65</span></div>
                </div>
                <h4>Edad media por nivel</h4>
                <div className="cp-stat-table">
                  {LEVELS.map((l) => (
                    <div key={l} className="cp-stat-row">
                      <span className="cp-stat-row-label">{LEVEL_LABELS[l]}</span>
                      <Bar value={data.ageStats!.byLevel[l]} max={80} color={LEVEL_COLORS[l]} />
                      <span className="cp-stat-row-val">{data.ageStats!.byLevel[l]} anos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Education (feature #6) ── */}
            {statsSubView === "formacion" && data.educationBreakdown && (
              <div className="cp-stat-panel">
                <h3>Formacion academica de los cargos publicos</h3>
                <div className="cp-stat-table">
                  {data.educationBreakdown.map((e) => (
                    <div key={e.degree} className="cp-stat-row">
                      <span className="cp-stat-row-label">{e.degree}</span>
                      <Bar value={e.count} max={data.educationBreakdown![0]?.count ?? 1} color="var(--azul)" />
                      <span className="cp-stat-row-val">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tenure (feature #7) ── */}
            {statsSubView === "mandato" && data.tenureStats && (
              <div className="cp-stat-panel">
                <h3>Analisis de permanencia en el cargo</h3>
                <div className="cp-stat-kpis">
                  <div className="cp-stat-kpi"><strong style={{ color: "var(--azul)" }}>{data.tenureStats.avgYears}</strong><span>Anos de media</span></div>
                </div>
                <h4>Media por nivel</h4>
                <div className="cp-stat-table">
                  {LEVELS.map((l) => (
                    <div key={l} className="cp-stat-row">
                      <span className="cp-stat-row-label">{LEVEL_LABELS[l]}</span>
                      <Bar value={data.tenureStats!.byLevel[l]} max={15} color={LEVEL_COLORS[l]} />
                      <span className="cp-stat-row-val">{data.tenureStats!.byLevel[l]} anos</span>
                    </div>
                  ))}
                </div>
                <h4>Mayor permanencia</h4>
                <div className="cp-stat-table">
                  {data.tenureStats.longest.map((o) => (
                    <div key={o.name} className="cp-stat-row">
                      <span className="cp-stat-row-label">{o.name}</span>
                      <Bar value={o.years} max={25} color="#16a34a" />
                      <span className="cp-stat-row-val">{o.years} anos</span>
                    </div>
                  ))}
                </div>
                <h4>Menor permanencia</h4>
                <div className="cp-stat-table">
                  {data.tenureStats.shortest.map((o) => (
                    <div key={o.name} className="cp-stat-row">
                      <span className="cp-stat-row-label">{o.name}</span>
                      <Bar value={o.years} max={25} color="#ea580c" />
                      <span className="cp-stat-row-val">{o.years} anos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Influence / Power concentration (features #3, #12) ── */}
            {statsSubView === "influencia" && data.powerConcentration && (
              <div className="cp-stat-panel">
                <h3>Indice de concentracion de poder</h3>
                <p className="cp-stat-desc">Mide cuanto poder concentran los 3 principales lideres de cada partido (indice Herfindahl). Un indice alto indica que el partido depende de pocos lideres.</p>
                <div className="cp-stat-table">
                  {data.powerConcentration.map((pc) => (
                    <div key={pc.party} className="cp-power-card">
                      <div className="cp-stat-row">
                        <span className="cp-stat-row-label"><strong>{pc.party}</strong></span>
                        <Bar value={pc.herfindahl} max={10000} color="var(--azul)" />
                        <span className="cp-stat-row-val">HHI: {pc.herfindahl}</span>
                      </div>
                      <div className="cp-power-top3">
                        <span className="cp-power-top3-pct">Top 3 acumulan el {pc.topThreeSharePct}% de la influencia:</span>
                        <div className="cp-chips">
                          {pc.topThree.map((t) => (
                            <span key={t.name} className="micro-tag">{t.name} ({t.influenceScore})</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Patrimony aggregate (feature #11) ── */}
            {statsSubView === "patrimonio" && (
              <div className="cp-stat-panel">
                <h3>Declaraciones patrimoniales</h3>
                <p className="cp-stat-desc">Patrimonio declarado por cargo publico (inmuebles + ahorro + otros). Solo se muestran los que tienen declaracion publica.</p>
                <div className="cp-stat-table">
                  {data.officials
                    .filter((o) => o.patrimony)
                    .sort((a, b) => ((b.patrimony?.realEstate ?? 0) + (b.patrimony?.savings ?? 0) + (b.patrimony?.otherAssets ?? 0)) - ((a.patrimony?.realEstate ?? 0) + (a.patrimony?.savings ?? 0) + (a.patrimony?.otherAssets ?? 0)))
                    .map((o) => {
                      const total = (o.patrimony!.realEstate + o.patrimony!.savings + o.patrimony!.otherAssets);
                      return (
                        <div key={o.id} className="cp-stat-row">
                          <span className="cp-stat-row-label">{o.name}</span>
                          <Bar value={total} max={800000} color="#ca8a04" />
                          <span className="cp-stat-row-val">{total.toLocaleString("es-ES")} EUR</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ── Revolving door (feature #2) ── */}
            {statsSubView === "puerta-giratoria" && (
              <div className="cp-stat-panel">
                <h3>Rastreador de puerta giratoria</h3>
                <p className="cp-stat-desc">Cargos publicos con transiciones entre el sector publico y privado. {data.revolvingDoorCount ?? 0} casos detectados.</p>
                <div className="cp-stat-table">
                  {data.officials
                    .filter((o) => o.revolvingDoor && o.revolvingDoor.length > 0)
                    .map((o) => (
                      <div key={o.id} className="cp-revolving-card">
                        <strong>{o.name}</strong> <span className="cp-revolving-current">({o.role})</span>
                        {o.revolvingDoor!.map((rd, i) => (
                          <div key={i} className="cp-revolving-entry">
                            <span className="cp-revolving-year">{rd.year}</span>
                            <span className="cp-revolving-role">{rd.role}</span>
                            <span className="cp-revolving-company">{rd.company}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── Conflict flags (feature #10) ── */}
            {statsSubView === "conflictos" && (
              <div className="cp-stat-panel">
                <h3>Alertas de conflicto de interes</h3>
                <p className="cp-stat-desc">Cargos publicos con alertas activas de posible conflicto de interes o investigaciones.</p>
                <div className="cp-stat-table">
                  {data.officials
                    .filter((o) => o.conflictFlags && o.conflictFlags.length > 0)
                    .map((o) => (
                      <div key={o.id} className="cp-conflict-card">
                        <strong>{o.name}</strong> <span className="cp-conflict-role">({o.role})</span>
                        {o.conflictFlags!.map((f, i) => (
                          <div key={i} className="cp-conflict-flag">{f}</div>
                        ))}
                      </div>
                    ))}
                  {data.officials.filter((o) => o.conflictFlags && o.conflictFlags.length > 0).length === 0 && (
                    <p>No se han detectado alertas de conflicto de interes.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Geographic diversity (feature #20) ── */}
            {statsSubView === "geografia" && data.geographicDiversity && (
              <div className="cp-stat-panel">
                <h3>Diversidad territorial de los cargos</h3>
                <p className="cp-stat-desc">Comunidad autonoma de procedencia de los cargos publicos rastreados.</p>
                <div className="cp-stat-table">
                  {data.geographicDiversity.map((g) => (
                    <div key={g.ccaa} className="cp-geo-row">
                      <div className="cp-stat-row">
                        <span className="cp-stat-row-label">{g.ccaa}</span>
                        <Bar value={g.count} max={data.geographicDiversity![0]?.count ?? 1} color="#0d9488" />
                        <span className="cp-stat-row-val">{g.count}</span>
                      </div>
                      <div className="cp-chips">
                        {g.officials.map((n) => (<span key={n} className="micro-tag">{n}</span>))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Comparative stats (feature #18) ── */}
            {statsSubView === "comparativa" && data.comparativeStats && (
              <div className="cp-stat-panel">
                <h3>Espana vs media de la UE</h3>
                <div className="cp-comparative-grid">
                  <div className="cp-comparative-col">
                    <h4>Espana</h4>
                    <div className="cp-comp-item"><span>Tamano del Gobierno</span> <strong>{data.comparativeStats.spain.govSize} ministros</strong></div>
                    <div className="cp-comp-item"><span>Permanencia media</span> <strong>{data.comparativeStats.spain.avgTurnoverMonths} meses</strong></div>
                    <div className="cp-comp-item"><span>Mujeres en cargos</span> <strong>{data.comparativeStats.spain.womenPct}%</strong></div>
                    <div className="cp-comp-item"><span>Edad media</span> <strong>{data.comparativeStats.spain.avgAge} anos</strong></div>
                  </div>
                  <div className="cp-comparative-col">
                    <h4>Media UE-27</h4>
                    <div className="cp-comp-item"><span>Tamano del Gobierno</span> <strong>{data.comparativeStats.euAvg.govSize} ministros</strong></div>
                    <div className="cp-comp-item"><span>Permanencia media</span> <strong>{data.comparativeStats.euAvg.avgTurnoverMonths} meses</strong></div>
                    <div className="cp-comp-item"><span>Mujeres en cargos</span> <strong>{data.comparativeStats.euAvg.womenPct}%</strong></div>
                    <div className="cp-comp-item"><span>Edad media</span> <strong>{data.comparativeStats.euAvg.avgAge} anos</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Historical governments (feature #14) ── */}
            {statsSubView === "historico" && data.historicalGovernments && (
              <div className="cp-stat-panel">
                <h3>Composiciones de gobierno historicas</h3>
                <div className="cp-hist-timeline">
                  {data.historicalGovernments.map((g, i) => (
                    <div key={i} className="cp-hist-card">
                      <div className="cp-hist-header">
                        <span className="cp-hist-period">{g.period}</span>
                        <strong>{g.president}</strong>
                        <span className="micro-tag">{g.party}</span>
                      </div>
                      <div className="cp-hist-stats">
                        <span>{g.ministers} ministros</span>
                        <span>{g.womenPct}% mujeres</span>
                      </div>
                      <p className="cp-hist-formation">{g.formation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Legislative productivity (feature #9) ── */}
            {statsSubView === "legislativa" && (
              <div className="cp-stat-panel">
                <h3>Productividad legislativa</h3>
                <p className="cp-stat-desc">Proposiciones de ley, intervenciones y asistencia a votaciones de los cargos legislativos.</p>
                <div className="cp-stat-table">
                  {data.officials
                    .filter((o) => o.legislativeActivity)
                    .sort((a, b) => (b.legislativeActivity?.interventions ?? 0) - (a.legislativeActivity?.interventions ?? 0))
                    .map((o) => (
                      <div key={o.id} className="cp-legis-card">
                        <strong>{o.name}</strong> <span className="cp-legis-party">({o.party})</span>
                        <div className="cp-legis-bars">
                          <div className="cp-bar-row">
                            <span className="cp-bar-label">Proposiciones</span>
                            <Bar value={o.legislativeActivity!.billsProposed} max={40} color="var(--azul)" />
                            <span className="cp-bar-val">{o.legislativeActivity!.billsProposed}</span>
                          </div>
                          <div className="cp-bar-row">
                            <span className="cp-bar-label">Intervenciones</span>
                            <Bar value={o.legislativeActivity!.interventions} max={200} color="var(--verde)" />
                            <span className="cp-bar-val">{o.legislativeActivity!.interventions}</span>
                          </div>
                          <div className="cp-bar-row">
                            <span className="cp-bar-label">Asistencia</span>
                            <Bar value={o.legislativeActivity!.votingAttendance} max={100} color="#ca8a04" />
                            <span className="cp-bar-val">{o.legislativeActivity!.votingAttendance}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <SiteFooter sources="BOE, Congreso, Senado, La Moncloa, parlamentos autonomicos, Portal de Transparencia" />
    </main>
  );
}
