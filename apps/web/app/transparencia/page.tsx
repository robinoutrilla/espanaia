import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";
import { T } from "../../components/t";
import {
  allDeclarations,
  depositRangeLabels,
  incomeTypeLabels,
  activityTypeLabels,
} from "../../lib/declarations-data";
import {
  auditReports,
  ratingLabels,
  ratingColors,
  entityTypeLabels,
  auditSummary,
} from "../../lib/audit-data";

export default function TransparenciaPage() {
  const congressDecls = allDeclarations.filter((d) => d.chamber === "congreso" || d.chamber === "gobierno");
  const senateDecls = allDeclarations.filter((d) => d.chamber === "senado");

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(iso));

  const chamberLabel = (c: string) =>
    c === "gobierno" ? "Gobierno" : c === "congreso" ? "Congreso" : "Senado";

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="transparencia" />

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="transparencia.eyebrow" /></span>
            <h1 className="detail-title"><T k="transparencia.title" /></h1>
            <p className="detail-description">
              <T k="transparencia.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell">
                <strong style={{ color: "var(--azul)" }}>{congressDecls.length}</strong>
                <span>Congreso / Gobierno</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--azul)" }}>{senateDecls.length}</strong>
                <span>Senado</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--verde)" }}>{allDeclarations.length}</strong>
                <span>Total declaraciones</span>
              </div>
            </div>
            <div className="kpi-grid-2">
              <div className="kpi-cell">
                <strong style={{ color: "var(--rojo)" }}>{auditSummary.totalReports}</strong>
                <span>Informes TCu</span>
              </div>
              <div className="kpi-cell">
                <strong style={{ color: "var(--rojo)" }}>{auditSummary.totalQuestionedM.toLocaleString("es-ES")}</strong>
                <span>M€ cuestionados</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Congress / Government declarations ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow="Congreso de los Diputados"
          title={`${congressDecls.length} cargos con declaración publicada`}
          description="Bienes inmuebles, depósitos, valores, ingresos y actividades compatibles declaradas al Congreso."
        />
        <div className="decl-grid">
          {congressDecls.map((decl, idx) => (
            <article className="decl-card" key={`${decl.politicianSlug}-${idx}`}>
              <div className="decl-card-top">
                <span className="tag tag-bright">{chamberLabel(decl.chamber)}</span>
                <span className="decl-date">{formatDate(decl.declarationDate)}</span>
              </div>
              <h3 className="decl-name">{decl.politicianSlug.replace(/-/g, " ")}</h3>
              <div className="decl-rows">
                {decl.realEstate.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Inmuebles</span>
                    <span className="decl-row-value">{decl.realEstate.length} — {decl.realEstate.map((r) => r.location).join(", ")}</span>
                  </div>
                )}
                <div className="decl-row">
                  <span className="decl-row-label">Depósitos</span>
                  <span className="decl-row-value">{depositRangeLabels[decl.bankDeposits.range]}</span>
                </div>
                {decl.securities.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Valores</span>
                    <span className="decl-row-value">{decl.securities.map((s) => s.description).join(", ")}</span>
                  </div>
                )}
                {decl.income.map((inc, i) => (
                  <div className="decl-row" key={i}>
                    <span className="decl-row-label">{incomeTypeLabels[inc.type]}</span>
                    <span className="decl-row-value">{inc.annualAmount ? `${inc.annualAmount.toLocaleString("es-ES")} €/año` : inc.source}</span>
                  </div>
                ))}
                {decl.liabilities.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Deudas</span>
                    <span className="decl-row-value">{decl.liabilities[0]?.description} ({decl.liabilities[0]?.amountRange})</span>
                  </div>
                )}
              </div>
              {decl.activities.length > 0 && (
                <div className="decl-activities">
                  {decl.activities.map((act, i) => (
                    <span className="micro-tag" key={i}>{activityTypeLabels[act.type]}: {act.description}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Senate declarations ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow="Senado"
          title={`${senateDecls.length} cargos con declaraci{"ó"}n publicada`}
          description="Declaraciones de bienes y actividades de senadores. Fuente: senado.es/transparencia."
        />
        <div className="decl-grid">
          {senateDecls.map((decl, idx) => (
            <article className="decl-card" key={`${decl.politicianSlug}-${idx}`}>
              <div className="decl-card-top">
                <span className="tag" style={{ background: "var(--azul-soft)", color: "var(--azul)" }}>Senado</span>
                <span className="decl-date">{formatDate(decl.declarationDate)}</span>
              </div>
              <h3 className="decl-name">{decl.politicianSlug.replace(/-/g, " ")}</h3>
              <div className="decl-rows">
                {decl.realEstate.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Inmuebles</span>
                    <span className="decl-row-value">{decl.realEstate.length} — {decl.realEstate.map((r) => r.location).join(", ")}</span>
                  </div>
                )}
                <div className="decl-row">
                  <span className="decl-row-label">Depósitos</span>
                  <span className="decl-row-value">{depositRangeLabels[decl.bankDeposits.range]}</span>
                </div>
                {decl.securities.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Valores</span>
                    <span className="decl-row-value">{decl.securities.map((s) => s.description).join(", ")}</span>
                  </div>
                )}
                {decl.income.map((inc, i) => (
                  <div className="decl-row" key={i}>
                    <span className="decl-row-label">{incomeTypeLabels[inc.type]}</span>
                    <span className="decl-row-value">{inc.annualAmount ? `${inc.annualAmount.toLocaleString("es-ES")} €/año` : inc.source}</span>
                  </div>
                ))}
                {decl.liabilities.length > 0 && (
                  <div className="decl-row">
                    <span className="decl-row-label">Deudas</span>
                    <span className="decl-row-value">{decl.liabilities[0]?.description} ({decl.liabilities[0]?.amountRange})</span>
                  </div>
                )}
              </div>
              {decl.activities.length > 0 && (
                <div className="decl-activities">
                  {decl.activities.map((act, i) => (
                    <span className="micro-tag" key={i}>{activityTypeLabels[act.type]}: {act.description}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Audit reports ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="transparencia.auditEyebrow" />}
          title={<><T k="transparencia.auditTitle" /></>}
          description={`${auditSummary.totalFindings} hallazgos, ${auditSummary.criticalFindings} críticos. ${auditSummary.totalQuestionedM.toLocaleString("es-ES")} M€ en importes cuestionados.`}
        />

        {/* Summary cards */}
        <div className="ngeu-summary-row" style={{ marginBottom: 20 }}>
          <div className="ngeu-summary-card">
            <span><T k="transparencia.favorable" /></span>
            <strong style={{ color: "var(--verde)" }}>{auditSummary.favorable}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span><T k="transparencia.withReservations" /></span>
            <strong style={{ color: "var(--oro)" }}>{auditSummary.conSalvedades}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span><T k="transparencia.unfavorable" /></span>
            <strong style={{ color: "var(--rojo)" }}>{auditSummary.desfavorable}</strong>
          </div>
          <div className="ngeu-summary-card">
            <span><T k="transparencia.questionedAmount" /></span>
            <strong>{(auditSummary.totalQuestionedM / 1000).toFixed(1)} Md€</strong>
          </div>
        </div>

        <div className="vote-list">
          {auditReports.map((report) => {
            const rColor = ratingColors[report.rating];
            return (
              <article className="vote-card" key={report.id} style={{ borderLeft: `4px solid ${rColor}` }}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${rColor}18`, color: rColor }}>
                      {ratingLabels[report.rating]}
                    </span>
                    <span className="tag" style={{ background: "var(--surface)", color: "var(--ink-muted)" }}>
                      {entityTypeLabels[report.entityType]}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      <T k="transparencia.fiscalYear" /> {report.fiscalYear} · <T k="transparencia.published" /> {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(report.publicationDate))}
                    </span>
                  </div>
                  {report.amountQuestionedM ? (
                    <strong style={{ color: "var(--rojo)", fontFamily: "var(--font-mono)" }}>{report.amountQuestionedM} M€</strong>
                  ) : null}
                </div>
                <h3>{report.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{report.summary}</p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)" }}>
                    {report.totalFindingsCount} hallazgos · {report.criticalFindings} críticos
                  </span>
                </div>
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 16px", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
                  {report.keyFindings.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                {report.recommendations.length > 0 ? (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--surface)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem" }}>
                    <strong style={{ color: "var(--azul)" }}><T k="transparencia.recommendations" />:</strong>
                    <ul style={{ margin: "4px 0 0", padding: "0 0 0 16px", color: "var(--ink-soft)" }}>
                      {report.recommendations.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                ) : null}
                <div className="vote-tags" style={{ marginTop: 8 }}>
                  {report.tags.map((tag) => <span className="micro-tag" key={tag}>{tag}</span>)}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <SiteFooter sources="Congreso, Senado, Portal de Transparencia, Tribunal de Cuentas, BOE" />
    </main>
  );
}
