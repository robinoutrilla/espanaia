"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   Constitución Viva — Real-time impact of public decisions on people,
   businesses, and territories.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = "cv-data-v1";

// ---------------------------------------------------------------------------
// Types (mirrors lib/constitucion-viva-data.ts)
// ---------------------------------------------------------------------------

type ProfileType = "autonomo" | "pyme" | "ciudadano" | "gran-empresa" | "estudiante" | "jubilado";
type CCAA = "madrid" | "cataluna" | "andalucia" | "pais-vasco" | "valencia" | "galicia";
type ChangeCategory = "fiscal" | "laboral" | "subvencion" | "obligacion" | "derecho" | "medioambiental";
type ChangePhase = "propuesta" | "debate" | "aprobado" | "implementacion" | "vigente";
type ImpactLevel = "alto" | "medio" | "bajo";

interface CVProfile { id: string; type: ProfileType; label: string; location: CCAA; description: string; icon: string; }
interface CVChange { id: string; title: string; summary: string; category: ChangeCategory; phase: ChangePhase; date: string; effectiveDate?: string; impactScore: number; impactLevel: ImpactLevel; affectedProfiles: ProfileType[]; affectedCCAA: CCAA[]; keyPoints: string[]; source: string; deadlineDate?: string; }
interface CVDebate { id: string; title: string; chamber: "congreso" | "senado" | "comision"; date: string; status: "programado" | "en-curso" | "finalizado"; relatedChanges: string[]; affectedProfiles: ProfileType[]; summary: string; speakers: { name: string; party: string; position: string }[]; }
interface CVOpportunity { id: string; title: string; description: string; type: "subvencion" | "programa" | "deduccion" | "bonificacion" | "formacion"; amount?: string; deadline: string; eligibleProfiles: ProfileType[]; eligibleCCAA: CCAA[]; url: string; requirements: string[]; }
interface CVRight { id: string; article: number; title: string; description: string; status: "vigente" | "modificado" | "amenazado"; affectedProfiles: ProfileType[]; recentChanges?: string; }
interface CVTerritorialComparison { id: string; metric: string; unit: string; description: string; values: Record<CCAA, number>; bestCCAA: CCAA; worstCCAA: CCAA; }
interface CVNotification { id: string; title: string; description: string; date: string; type: "deadline" | "cambio" | "oportunidad" | "debate"; urgent: boolean; relatedId: string; affectedProfiles: ProfileType[]; }
interface CVTimelineEvent { id: string; changeId: string; date: string; phase: ChangePhase; description: string; }
interface CVStats { totalChanges: number; activeChanges: number; upcomingDeadlines: number; opportunitiesOpen: number; debatesThisWeek: number; averageImpact: number; }
interface CVData { profiles: CVProfile[]; changes: CVChange[]; debates: CVDebate[]; opportunities: CVOpportunity[]; rights: CVRight[]; territorial: CVTerritorialComparison[]; notifications: CVNotification[]; timeline: CVTimelineEvent[]; stats: CVStats; }

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type CVView = "impacto" | "cambios" | "debates" | "territorial" | "oportunidades";

const VIEW_TABS: { id: CVView; label: string }[] = [
  { id: "impacto", label: "Impacto" },
  { id: "cambios", label: "Cambios" },
  { id: "debates", label: "Debates" },
  { id: "territorial", label: "Territorial" },
  { id: "oportunidades", label: "Oportunidades" },
];

// ---------------------------------------------------------------------------
// Colour / label maps
// ---------------------------------------------------------------------------

const impactColor: Record<ImpactLevel, string> = { alto: "var(--rojo)", medio: "var(--oro)", bajo: "var(--ink-muted, #6b7280)" };
const impactBg: Record<ImpactLevel, string> = { alto: "#fdecea", medio: "#fef9e7", bajo: "#f4f4f4" };
const phaseColor: Record<ChangePhase, string> = { propuesta: "#7c3aed", debate: "var(--oro)", aprobado: "var(--azul)", implementacion: "#ea580c", vigente: "var(--verde)" };
const phaseLabel: Record<ChangePhase, string> = { propuesta: "Propuesta", debate: "En debate", aprobado: "Aprobado", implementacion: "Implementando", vigente: "Vigente" };
const categoryLabel: Record<ChangeCategory, string> = { fiscal: "Fiscal", laboral: "Laboral", subvencion: "Subvención", obligacion: "Obligación", derecho: "Derecho", medioambiental: "Medioambiental" };
const categoryColor: Record<ChangeCategory, string> = { fiscal: "var(--azul)", laboral: "#7c3aed", subvencion: "var(--verde)", obligacion: "var(--rojo)", derecho: "#0d9488", medioambiental: "#16a34a" };
const chamberLabel: Record<string, string> = { congreso: "Congreso", senado: "Senado", comision: "Comisión" };
const statusLabel: Record<string, string> = { programado: "Programado", "en-curso": "En curso", finalizado: "Finalizado" };
const statusColor: Record<string, string> = { programado: "var(--azul)", "en-curso": "var(--oro)", finalizado: "var(--verde)" };
const ccaaLabel: Record<CCAA, string> = { madrid: "Madrid", cataluna: "Cataluña", andalucia: "Andalucía", "pais-vasco": "País Vasco", valencia: "Valencia", galicia: "Galicia" };
const oppTypeLabel: Record<string, string> = { subvencion: "Subvención", programa: "Programa", deduccion: "Deducción", bonificacion: "Bonificación", formacion: "Formación" };
const oppTypeColor: Record<string, string> = { subvencion: "var(--verde)", programa: "var(--azul)", deduccion: "#7c3aed", bonificacion: "var(--oro)", formacion: "#0d9488" };
const rightStatusColor: Record<string, string> = { vigente: "var(--verde)", modificado: "var(--oro)", amenazado: "var(--rojo)" };
const rightStatusLabel: Record<string, string> = { vigente: "Vigente", modificado: "Modificado", amenazado: "Amenazado" };
const notifTypeIcon: Record<string, string> = { deadline: "⏰", cambio: "📋", oportunidad: "💡", debate: "🏛️" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(d: string): number {
  const now = new Date("2026-04-11");
  return Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function impactBar(score: number): React.ReactNode {
  const colour = score >= 70 ? "var(--rojo)" : score >= 40 ? "var(--oro)" : "var(--verde)";
  return (
    <div className="cv-impact-bar">
      <div className="cv-impact-fill" style={{ width: `${score}%`, background: colour }} />
      <span className="cv-impact-score">{score}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

const FALLBACK: CVData = {
  profiles: [],
  changes: [],
  debates: [],
  opportunities: [],
  rights: [],
  territorial: [],
  notifications: [],
  timeline: [],
  stats: { totalChanges: 0, activeChanges: 0, upcomingDeadlines: 0, opportunitiesOpen: 0, debatesThisWeek: 0, averageImpact: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════════════════

export default function ConstitucionVivaPage() {
  const [data, setData] = useState<CVData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CVView>("impacto");
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | "">("");
  const [expandedChange, setExpandedChange] = useState<string | null>(null);
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const [changePhaseFilter, setChangePhaseFilter] = useState<ChangePhase | "">("");
  const [changeCatFilter, setChangeCatFilter] = useState<ChangeCategory | "">("");
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Fetch data ──
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    const url = selectedProfile
      ? `/api/constitucion-viva?profile=${selectedProfile}`
      : "/api/constitucion-viva";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedProfile]);

  // ── Derived data ──
  const { stats, profiles, changes, debates, opportunities, rights, territorial, notifications, timeline } = data;

  const filteredChanges = useMemo(() => {
    let list = changes;
    if (changePhaseFilter) list = list.filter((c) => c.phase === changePhaseFilter);
    if (changeCatFilter) list = list.filter((c) => c.category === changeCatFilter);
    return list.sort((a, b) => b.impactScore - a.impactScore);
  }, [changes, changePhaseFilter, changeCatFilter]);

  const sortedDebates = useMemo(
    () => [...debates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [debates]
  );

  const urgentNotifications = useMemo(
    () => notifications.filter((n) => n.urgent),
    [notifications]
  );

  const timelineForChange = (changeId: string) =>
    timeline.filter((t) => t.changeId === changeId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ── Profile for display ──
  const currentProfile = profiles.find((p) => p.type === selectedProfile);

  // ═════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="page-shell">
      <SiteHeader currentSection="constitucion-viva" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <span className="eyebrow">CONSTITUCI&Oacute;N VIVA</span>
        <h1>C&oacute;mo las decisiones p&uacute;blicas afectan tu vida</h1>
        <p className="hero-subtitle">
          Traducci&oacute;n en tiempo real del impacto de cambios legislativos sobre personas, empresas y territorios.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item">
            <span className="kpi-value">{stats.totalChanges}</span>
            <span className="kpi-label">Cambios activos</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value" style={{ color: "var(--rojo)" }}>{stats.upcomingDeadlines}</span>
            <span className="kpi-label">Plazos pr&oacute;ximos</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value" style={{ color: "var(--verde)" }}>{stats.opportunitiesOpen}</span>
            <span className="kpi-label">Oportunidades abiertas</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{stats.debatesThisWeek}</span>
            <span className="kpi-label">Debates esta semana</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-value">{stats.averageImpact}</span>
            <span className="kpi-label">Impacto medio</span>
          </div>
        </div>
      </section>

      {/* ── Profile selector + Notification bell ── */}
      <section className="panel cv-controls">
        <div className="cv-controls-row">
          <div className="cv-profile-selector">
            <label htmlFor="cv-profile" className="cv-label">Perfil:</label>
            <select
              id="cv-profile"
              className="cv-select"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value as ProfileType | "")}
            >
              <option value="">Todos los perfiles</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.type}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
            {currentProfile && (
              <span className="cv-profile-desc">{currentProfile.description}</span>
            )}
          </div>

          <button
            className="cv-notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: "relative" }}
          >
            🔔
            {urgentNotifications.length > 0 && (
              <span className="cv-notif-badge">{urgentNotifications.length}</span>
            )}
          </button>
        </div>

        {/* Notification dropdown */}
        {showNotifications && (
          <div className="cv-notif-panel">
            <h3 style={{ margin: "0 0 .5rem" }}>Notificaciones</h3>
            {notifications.length === 0 && <p style={{ color: "var(--ink-muted, #6b7280)" }}>Sin notificaciones.</p>}
            {notifications.map((n) => (
              <div
                key={n.id}
                className="cv-notif-item"
                style={{ borderLeft: n.urgent ? "3px solid var(--rojo)" : "3px solid var(--azul)" }}
              >
                <span className="cv-notif-icon">{notifTypeIcon[n.type]}</span>
                <div>
                  <strong>{n.title}</strong>
                  <p style={{ margin: ".15rem 0 0", fontSize: ".82rem", color: "var(--ink-muted, #6b7280)" }}>{n.description}</p>
                  <span style={{ fontSize: ".75rem", color: "var(--ink-muted, #6b7280)" }}>{formatDate(n.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Tab navigation ── */}
      <div className="cv-view-bar">
        {VIEW_TABS.map((t) => (
          <button
            key={t.id}
            className={`cv-tab ${view === t.id ? "cv-tab-active" : ""}`}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <section className="panel" style={{ textAlign: "center", padding: "3rem" }}>
          <p>Cargando datos...</p>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: IMPACTO                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!loading && view === "impacto" && (
        <>
          {/* Impact timeline */}
          <section className="panel">
            <SectionHeading eyebrow="" title="L&iacute;nea de impacto" description="Cambios recientes que afectan a tu perfil, ordenados por impacto" />
            <div className="cv-impact-timeline">
              {changes
                .sort((a, b) => b.impactScore - a.impactScore)
                .slice(0, 8)
                .map((c) => (
                  <div key={c.id} className="cv-timeline-card" style={{ background: impactBg[c.impactLevel] }}>
                    <div className="cv-timeline-header">
                      <span className="cv-pill" style={{ background: categoryColor[c.category], color: "#fff" }}>
                        {categoryLabel[c.category]}
                      </span>
                      <span className="cv-pill" style={{ background: phaseColor[c.phase], color: "#fff" }}>
                        {phaseLabel[c.phase]}
                      </span>
                      <span style={{ fontSize: ".78rem", color: "var(--ink-muted, #6b7280)", marginLeft: "auto" }}>
                        {formatDate(c.date)}
                      </span>
                    </div>
                    <h3 style={{ margin: ".4rem 0 .25rem", fontSize: "1rem" }}>{c.title}</h3>
                    <p style={{ margin: 0, fontSize: ".85rem", color: "var(--ink-muted, #6b7280)" }}>{c.summary}</p>
                    {impactBar(c.impactScore)}
                    {c.deadlineDate && (
                      <div className="cv-deadline-badge" style={{ color: daysUntil(c.deadlineDate) <= 60 ? "var(--rojo)" : "var(--ink-muted, #6b7280)" }}>
                        ⏰ Plazo: {formatDate(c.deadlineDate)} ({daysUntil(c.deadlineDate)} d&iacute;as)
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>

          {/* Rights & obligations tracker */}
          <section className="panel">
            <SectionHeading eyebrow="" title="Derechos y obligaciones" description="Estado actual de tus derechos constitucionales" />
            <div className="cv-rights-grid">
              {rights.map((r) => (
                <div key={r.id} className="cv-right-card">
                  <div className="cv-right-header">
                    <span className="cv-right-article">Art. {r.article}</span>
                    <span className="cv-pill" style={{ background: rightStatusColor[r.status], color: "#fff", fontSize: ".72rem" }}>
                      {rightStatusLabel[r.status]}
                    </span>
                  </div>
                  <h4 style={{ margin: ".3rem 0 .2rem" }}>{r.title}</h4>
                  <p style={{ margin: 0, fontSize: ".82rem", color: "var(--ink-muted, #6b7280)" }}>{r.description}</p>
                  {r.recentChanges && (
                    <p style={{ margin: ".3rem 0 0", fontSize: ".78rem", color: "var(--oro)", fontStyle: "italic" }}>
                      ⚡ {r.recentChanges}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: CAMBIOS                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!loading && view === "cambios" && (
        <section className="panel">
          <SectionHeading eyebrow="" title="Cambios activos" description="Cambios fiscales, laborales, subvenciones y obligaciones" />

          {/* Filters */}
          <div className="cv-filters">
            <select className="cv-select" value={changePhaseFilter} onChange={(e) => setChangePhaseFilter(e.target.value as ChangePhase | "")}>
              <option value="">Todas las fases</option>
              {(Object.keys(phaseLabel) as ChangePhase[]).map((p) => (
                <option key={p} value={p}>{phaseLabel[p]}</option>
              ))}
            </select>
            <select className="cv-select" value={changeCatFilter} onChange={(e) => setChangeCatFilter(e.target.value as ChangeCategory | "")}>
              <option value="">Todas las categor&iacute;as</option>
              {(Object.keys(categoryLabel) as ChangeCategory[]).map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
          </div>

          <div className="cv-changes-list">
            {filteredChanges.map((c) => {
              const isExpanded = expandedChange === c.id;
              const tl = timelineForChange(c.id);
              return (
                <div
                  key={c.id}
                  className="cv-change-card"
                  style={{ borderLeft: `4px solid ${impactColor[c.impactLevel]}` }}
                >
                  <div
                    className="cv-change-head"
                    onClick={() => setExpandedChange(isExpanded ? null : c.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="cv-change-pills">
                      <span className="cv-pill" style={{ background: categoryColor[c.category], color: "#fff" }}>
                        {categoryLabel[c.category]}
                      </span>
                      <span className="cv-pill" style={{ background: phaseColor[c.phase], color: "#fff" }}>
                        {phaseLabel[c.phase]}
                      </span>
                    </div>
                    <h3 style={{ margin: ".3rem 0 .15rem", fontSize: ".95rem" }}>{c.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", fontSize: ".8rem", color: "var(--ink-muted, #6b7280)" }}>
                      <span>{formatDate(c.date)}</span>
                      <span>Fuente: {c.source}</span>
                    </div>
                    {impactBar(c.impactScore)}
                  </div>

                  {isExpanded && (
                    <div className="cv-change-detail">
                      <p style={{ margin: "0 0 .5rem" }}>{c.summary}</p>
                      <strong>Puntos clave:</strong>
                      <ul className="cv-key-points">
                        {c.keyPoints.map((kp, i) => (
                          <li key={i}>{kp}</li>
                        ))}
                      </ul>
                      {c.effectiveDate && (
                        <p style={{ fontSize: ".82rem" }}>
                          📅 Fecha efectiva: <strong>{formatDate(c.effectiveDate)}</strong>
                        </p>
                      )}
                      {c.deadlineDate && (
                        <p style={{ fontSize: ".82rem", color: daysUntil(c.deadlineDate) <= 60 ? "var(--rojo)" : "inherit" }}>
                          ⏰ Plazo l&iacute;mite: <strong>{formatDate(c.deadlineDate)}</strong> ({daysUntil(c.deadlineDate)} d&iacute;as)
                        </p>
                      )}

                      {/* Change lifecycle tracker */}
                      {tl.length > 0 && (
                        <div className="cv-lifecycle">
                          <strong>Ciclo de vida:</strong>
                          <div className="cv-lifecycle-steps">
                            {tl.map((step, i) => (
                              <div key={step.id} className="cv-lifecycle-step">
                                <div className="cv-lifecycle-dot" style={{ background: phaseColor[step.phase] }} />
                                {i < tl.length - 1 && <div className="cv-lifecycle-line" />}
                                <div className="cv-lifecycle-info">
                                  <span className="cv-lifecycle-date">{formatDate(step.date)}</span>
                                  <span className="cv-lifecycle-label" style={{ color: phaseColor[step.phase] }}>{phaseLabel[step.phase]}</span>
                                  <span className="cv-lifecycle-desc">{step.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: DEBATES                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!loading && view === "debates" && (
        <section className="panel">
          <SectionHeading eyebrow="" title="Debates parlamentarios" description="Sesiones relacionadas con tu perfil" />
          <div className="cv-debates-list">
            {sortedDebates.map((d) => {
              const isExpanded = expandedDebate === d.id;
              return (
                <div key={d.id} className="cv-debate-card">
                  <div
                    className="cv-debate-head"
                    onClick={() => setExpandedDebate(isExpanded ? null : d.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="cv-change-pills">
                      <span className="cv-pill" style={{ background: statusColor[d.status], color: "#fff" }}>
                        {statusLabel[d.status]}
                      </span>
                      <span className="cv-pill" style={{ background: "var(--surface, #f8f8f8)", color: "var(--ink, #1a1a1a)", border: "1px solid #ddd" }}>
                        {chamberLabel[d.chamber]}
                      </span>
                    </div>
                    <h3 style={{ margin: ".3rem 0 .15rem", fontSize: ".95rem" }}>{d.title}</h3>
                    <span style={{ fontSize: ".8rem", color: "var(--ink-muted, #6b7280)" }}>
                      📅 {formatDate(d.date)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="cv-debate-detail">
                      <p style={{ margin: "0 0 .5rem" }}>{d.summary}</p>
                      <strong>Ponentes:</strong>
                      <div className="cv-speakers">
                        {d.speakers.map((s, i) => (
                          <div key={i} className="cv-speaker">
                            <span className="cv-speaker-name">{s.name}</span>
                            <span className="cv-speaker-party">{s.party}</span>
                            <span className="cv-speaker-pos">{s.position}</span>
                          </div>
                        ))}
                      </div>
                      {d.relatedChanges.length > 0 && (
                        <p style={{ fontSize: ".82rem", color: "var(--ink-muted, #6b7280)", marginTop: ".5rem" }}>
                          Cambios relacionados: {d.relatedChanges.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: TERRITORIAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!loading && view === "territorial" && (
        <section className="panel">
          <SectionHeading eyebrow="" title="Comparaci&oacute;n territorial" description="C&oacute;mo var&iacute;a el impacto entre Comunidades Aut&oacute;nomas" />
          <div className="cv-territorial-grid">
            {territorial.map((t) => {
              const entries = Object.entries(t.values) as [CCAA, number][];
              const maxVal = Math.max(...entries.map(([, v]) => v));
              return (
                <div key={t.id} className="cv-territorial-card">
                  <h3 style={{ margin: "0 0 .25rem", fontSize: ".95rem" }}>{t.metric}</h3>
                  <p style={{ margin: "0 0 .5rem", fontSize: ".82rem", color: "var(--ink-muted, #6b7280)" }}>{t.description}</p>
                  <div className="cv-territorial-bars">
                    {entries
                      .sort((a, b) => b[1] - a[1])
                      .map(([ccaa, val]) => (
                        <div key={ccaa} className="cv-territorial-row">
                          <span className="cv-territorial-label">{ccaaLabel[ccaa]}</span>
                          <div className="cv-territorial-barwrap">
                            <div
                              className="cv-territorial-barfill"
                              style={{
                                width: `${(val / maxVal) * 100}%`,
                                background: ccaa === t.bestCCAA ? "var(--verde)" : ccaa === t.worstCCAA ? "var(--rojo)" : "var(--azul)",
                              }}
                            />
                          </div>
                          <span className="cv-territorial-val">{val}{t.unit === "%" || t.unit === "% bonificación" ? "%" : ` ${t.unit}`}</span>
                        </div>
                      ))}
                  </div>
                  <div className="cv-territorial-legend">
                    <span style={{ color: "var(--verde)", fontSize: ".75rem" }}>● Mejor: {ccaaLabel[t.bestCCAA]}</span>
                    <span style={{ color: "var(--rojo)", fontSize: ".75rem" }}>● Peor: {ccaaLabel[t.worstCCAA]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: OPORTUNIDADES                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!loading && view === "oportunidades" && (
        <section className="panel">
          <SectionHeading eyebrow="" title="Oportunidades" description="Subvenciones, programas y deducciones disponibles para tu perfil" />
          <div className="cv-opp-grid">
            {opportunities.map((o) => {
              const days = daysUntil(o.deadline);
              return (
                <div key={o.id} className="cv-opp-card">
                  <div className="cv-opp-header">
                    <span className="cv-pill" style={{ background: oppTypeColor[o.type], color: "#fff" }}>
                      {oppTypeLabel[o.type]}
                    </span>
                    {days <= 30 && (
                      <span className="cv-pill" style={{ background: "var(--rojo)", color: "#fff", fontSize: ".7rem" }}>
                        ⚠ Urgente
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: ".4rem 0 .2rem", fontSize: ".95rem" }}>{o.title}</h3>
                  <p style={{ margin: "0 0 .4rem", fontSize: ".82rem", color: "var(--ink-muted, #6b7280)" }}>{o.description}</p>
                  {o.amount && (
                    <p style={{ margin: "0 0 .25rem", fontWeight: 600, color: "var(--verde)" }}>
                      💰 {o.amount}
                    </p>
                  )}
                  <p style={{ margin: "0 0 .4rem", fontSize: ".8rem", color: days <= 30 ? "var(--rojo)" : "var(--ink-muted, #6b7280)" }}>
                    ⏰ Plazo: {formatDate(o.deadline)} ({days} d&iacute;as)
                  </p>
                  <div>
                    <strong style={{ fontSize: ".8rem" }}>Requisitos:</strong>
                    <ul className="cv-opp-reqs">
                      {o.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cv-opp-ccaa">
                    {o.eligibleCCAA.map((c) => (
                      <span key={c} className="cv-ccaa-tag">{ccaaLabel[c]}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <SiteFooter />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Scoped styles                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <style jsx>{`
        /* ── Controls ── */
        .cv-controls { padding: 1rem 1.5rem; }
        .cv-controls-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .cv-profile-selector { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; flex: 1; }
        .cv-label { font-weight: 600; font-size: .85rem; }
        .cv-select { padding: .4rem .75rem; border-radius: 6px; border: 1px solid #ddd; font-size: .85rem; background: var(--surface, #fff); color: var(--ink, #1a1a1a); }
        .cv-profile-desc { font-size: .78rem; color: var(--ink-muted, #6b7280); }

        /* ── Notification ── */
        .cv-notif-btn { background: none; border: 1px solid #ddd; border-radius: 8px; padding: .35rem .6rem; font-size: 1.2rem; cursor: pointer; }
        .cv-notif-badge { position: absolute; top: -4px; right: -4px; background: var(--rojo); color: #fff; font-size: .65rem; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .cv-notif-panel { margin-top: .75rem; padding: .75rem; border: 1px solid #e5e5e5; border-radius: 8px; background: var(--surface, #fafafa); max-height: 350px; overflow-y: auto; }
        .cv-notif-item { display: flex; gap: .5rem; padding: .5rem; margin-bottom: .35rem; border-radius: 6px; background: var(--surface, #fff); }
        .cv-notif-icon { font-size: 1.3rem; flex-shrink: 0; }

        /* ── Tab bar ── */
        .cv-view-bar { display: flex; gap: .35rem; padding: 0 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .cv-tab { padding: .45rem 1rem; border-radius: 6px; border: 1px solid #ddd; background: var(--surface, #fff); color: var(--ink, #1a1a1a); font-size: .85rem; font-weight: 500; cursor: pointer; transition: all .15s; }
        .cv-tab:hover { border-color: var(--azul); color: var(--azul); }
        .cv-tab-active { background: var(--azul); color: #fff; border-color: var(--azul); }

        /* ── Pill ── */
        .cv-pill { display: inline-block; padding: .15rem .5rem; border-radius: 4px; font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .02em; margin-right: .25rem; }

        /* ── Impact bar ── */
        .cv-impact-bar { position: relative; height: 18px; background: #e5e7eb; border-radius: 9px; margin-top: .35rem; overflow: hidden; }
        .cv-impact-fill { height: 100%; border-radius: 9px; transition: width .3s; }
        .cv-impact-score { position: absolute; right: 6px; top: 1px; font-size: .7rem; font-weight: 700; color: var(--ink, #1a1a1a); }

        /* ── Impact timeline ── */
        .cv-impact-timeline { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: .75rem; }
        .cv-timeline-card { padding: .75rem; border-radius: 8px; border: 1px solid #e5e7eb; }
        .cv-timeline-header { display: flex; align-items: center; flex-wrap: wrap; gap: .25rem; margin-bottom: .25rem; }
        .cv-deadline-badge { margin-top: .35rem; font-size: .78rem; font-weight: 500; }

        /* ── Rights ── */
        .cv-rights-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: .75rem; }
        .cv-right-card { padding: .75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
        .cv-right-header { display: flex; align-items: center; gap: .5rem; }
        .cv-right-article { font-weight: 700; font-size: .85rem; color: var(--azul); }

        /* ── Changes list ── */
        .cv-filters { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .cv-changes-list { display: flex; flex-direction: column; gap: .6rem; }
        .cv-change-card { padding: .75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
        .cv-change-head { }
        .cv-change-pills { display: flex; gap: .25rem; flex-wrap: wrap; }
        .cv-change-detail { margin-top: .75rem; padding-top: .75rem; border-top: 1px solid #e5e7eb; }
        .cv-key-points { margin: .35rem 0; padding-left: 1.2rem; font-size: .85rem; }
        .cv-key-points li { margin-bottom: .2rem; }

        /* ── Lifecycle ── */
        .cv-lifecycle { margin-top: .75rem; }
        .cv-lifecycle-steps { display: flex; flex-direction: column; gap: 0; margin-top: .35rem; }
        .cv-lifecycle-step { display: flex; align-items: flex-start; gap: .5rem; position: relative; padding-bottom: .75rem; }
        .cv-lifecycle-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
        .cv-lifecycle-line { position: absolute; left: 5px; top: 15px; width: 2px; height: calc(100% - 15px); background: #e5e7eb; }
        .cv-lifecycle-info { display: flex; flex-direction: column; }
        .cv-lifecycle-date { font-size: .72rem; color: var(--ink-muted, #6b7280); }
        .cv-lifecycle-label { font-size: .78rem; font-weight: 600; }
        .cv-lifecycle-desc { font-size: .8rem; color: var(--ink-muted, #6b7280); }

        /* ── Debates ── */
        .cv-debates-list { display: flex; flex-direction: column; gap: .6rem; }
        .cv-debate-card { padding: .75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
        .cv-debate-detail { margin-top: .75rem; padding-top: .75rem; border-top: 1px solid #e5e7eb; }
        .cv-speakers { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .35rem; }
        .cv-speaker { display: flex; flex-direction: column; padding: .4rem .6rem; border-radius: 6px; background: var(--surface, #f8f8f8); border: 1px solid #e5e7eb; font-size: .82rem; }
        .cv-speaker-name { font-weight: 600; }
        .cv-speaker-party { font-size: .75rem; color: var(--ink-muted, #6b7280); }
        .cv-speaker-pos { font-size: .72rem; font-style: italic; }

        /* ── Territorial ── */
        .cv-territorial-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: .75rem; }
        .cv-territorial-card { padding: .75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
        .cv-territorial-bars { display: flex; flex-direction: column; gap: .3rem; }
        .cv-territorial-row { display: grid; grid-template-columns: 90px 1fr 60px; align-items: center; gap: .5rem; }
        .cv-territorial-label { font-size: .8rem; font-weight: 500; text-align: right; }
        .cv-territorial-barwrap { height: 16px; background: #e5e7eb; border-radius: 8px; overflow: hidden; }
        .cv-territorial-barfill { height: 100%; border-radius: 8px; transition: width .3s; }
        .cv-territorial-val { font-size: .78rem; font-weight: 600; }
        .cv-territorial-legend { display: flex; gap: 1rem; margin-top: .5rem; }

        /* ── Opportunities ── */
        .cv-opp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: .75rem; }
        .cv-opp-card { padding: .75rem; border: 1px solid #e5e7eb; border-radius: 8px; }
        .cv-opp-header { display: flex; gap: .25rem; flex-wrap: wrap; }
        .cv-opp-reqs { margin: .25rem 0; padding-left: 1.2rem; font-size: .82rem; }
        .cv-opp-reqs li { margin-bottom: .15rem; }
        .cv-opp-ccaa { display: flex; flex-wrap: wrap; gap: .25rem; margin-top: .4rem; }
        .cv-ccaa-tag { padding: .1rem .4rem; border-radius: 4px; background: var(--surface, #f0f0f0); border: 1px solid #ddd; font-size: .7rem; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .cv-territorial-grid { grid-template-columns: 1fr; }
          .cv-impact-timeline { grid-template-columns: 1fr; }
          .cv-territorial-row { grid-template-columns: 70px 1fr 50px; }
        }
      `}</style>
    </div>
  );
}
