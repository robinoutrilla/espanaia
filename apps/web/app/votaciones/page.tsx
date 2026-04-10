import Link from "next/link";
import { parties } from "@espanaia/seed-data";
import { T } from "../../components/t";
import { SiteHeader } from "../../components/site-header";
import { SectionHeading } from "../../components/section-heading";
import { partyColors } from "../../lib/visual-data";
import {
  plenaryVotes,
  categoryLabels,
  categoryColors,
  partyDisciplineStats,
} from "../../lib/voting-data";

export default function VotacionesPage() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="votaciones" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="votaciones.eyebrow" /></span>
            <h1 className="detail-title"><T k="votaciones.title" /></h1>
            <p className="detail-description">
              <T k="votaciones.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <div className="kpi-grid">
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--azul)" }}>{plenaryVotes.length}</strong>
                <span className="kpi-label"><T k="votaciones.registered" /></span>
              </div>
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--verde)" }}>{plenaryVotes.filter(v => v.result === "aprobado").length}</strong>
                <span className="kpi-label"><T k="common.approved" /></span>
              </div>
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--rojo)" }}>{plenaryVotes.filter(v => v.result === "rechazado").length}</strong>
                <span className="kpi-label"><T k="common.rejected" /></span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Party discipline ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="votaciones.disciplineEyebrow" />}
          title={<T k="votaciones.disciplineTitle" />}
          description={<T k="votaciones.disciplineDesc" />}
        />
        <div className="finance-items-grid">
          {partyDisciplineStats.filter(d => d.chamber === "congreso").map((d) => {
            const party = parties.find(p => p.slug === d.partySlug);
            const color = partyColors[d.partySlug] ?? "var(--ink-muted)";
            return (
              <Link className="finance-item-card" href={`/parties/${d.partySlug}`} key={d.partySlug} style={{ borderLeft: `4px solid ${color}` }}>
                <h3>{party?.shortName ?? d.partySlug}</h3>
                <div className="finance-item-figures">
                  <strong style={{ color }}>{d.disciplineRate}%</strong>
                  <span><T k="votaciones.discipline" /></span>
                  <span>{d.rebellions} <T k="votaciones.rebellions" /></span>
                  <span>{d.absenceRate}% <T k="votaciones.absence" /></span>
                </div>
                <div className="representation-bar-wrap">
                  <div className="representation-bar" style={{ width: `${d.disciplineRate}%`, background: color }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Vote list ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="votaciones.votesEyebrow" />}
          title={<T k="votaciones.votesTitle" />}
          description={<T k="votaciones.votesDesc" />}
        />
        <div className="vote-list">
          {plenaryVotes.map((vote) => {
            const catColor = categoryColors[vote.category] ?? "var(--ink-muted)";
            return (
              <article className="vote-card" key={vote.id}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${catColor}18`, color: catColor }}>
                      {categoryLabels[vote.category]}
                    </span>
                    <span className="tag" style={{ background: vote.result === "aprobado" ? "var(--verde-soft)" : "var(--rojo-soft)", color: vote.result === "aprobado" ? "var(--verde)" : "var(--rojo)" }}>
                      {vote.result === "aprobado" ? <T k="common.approved" /> : <T k="common.rejected" />}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {vote.chamber === "congreso" ? "Congreso" : "Senado"} · {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(vote.sessionDate))}
                    </span>
                  </div>
                  <div className="vote-totals">
                    <span className="vote-total-si">{vote.si}</span>
                    <span className="vote-total-no">{vote.no}</span>
                    <span className="vote-total-abs">{vote.abstencion}</span>
                  </div>
                </div>
                <h3>{vote.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{vote.summary}</p>

                {/* Stacked bar */}
                <div className="vote-bar">
                  <div style={{ width: `${(vote.si / vote.totalVotes) * 100}%`, background: "var(--verde)" }} title={`Sí: ${vote.si}`} />
                  <div style={{ width: `${(vote.no / vote.totalVotes) * 100}%`, background: "var(--rojo)" }} title={`No: ${vote.no}`} />
                  <div style={{ width: `${(vote.abstencion / vote.totalVotes) * 100}%`, background: "var(--oro)" }} title={`Abs: ${vote.abstencion}`} />
                  <div style={{ width: `${(vote.ausente / vote.totalVotes) * 100}%`, background: "var(--border)" }} title={`Aus: ${vote.ausente}`} />
                </div>

                {/* Party breakdown */}
                <div className="vote-party-grid">
                  {vote.partyBreakdown.map((pb) => {
                    const color = partyColors[pb.partySlug] ?? "var(--ink-muted)";
                    const party = parties.find(p => p.slug === pb.partySlug);
                    const posColor = pb.position === "si" ? "var(--verde)" : pb.position === "no" ? "var(--rojo)" : "var(--oro)";
                    return (
                      <div className="vote-party-chip" key={pb.partySlug} style={{ borderLeft: `3px solid ${color}` }}>
                        <span style={{ fontWeight: 700, fontSize: "0.75rem" }}>{party?.acronym ?? pb.partySlug}</span>
                        <span style={{ color: posColor, fontWeight: 600, fontSize: "0.72rem" }}>
                          {pb.position === "si" ? <T k="common.inFavor" /> : pb.position === "no" ? <T k="common.against" /> : <T k="common.abstention" />}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="vote-tags">
                  {vote.tags.map((tag) => (
                    <span className="micro-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
