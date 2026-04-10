import Link from "next/link";
import { territories } from "@espanaia/seed-data";
import { T } from "../../components/t";
import { SiteHeader } from "../../components/site-header";
import { SectionHeading } from "../../components/section-heading";
import {
  publicContracts,
  publicSubsidies,
  contractTypeLabels,
  contractTypeColors,
  contractStatusLabels,
  contractsSummary,
  subsidiesSummary,
} from "../../lib/contracts-data";

export default function ContratacionPage() {
  const formatM = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)} Md€` : `${n.toFixed(1)} M€`;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="contratacion" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="contratacion.eyebrow" /></span>
            <h1 className="detail-title"><T k="contratacion.title" /></h1>
            <p className="detail-description">
              <T k="contratacion.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{contractsSummary.totalContractsTracked}</strong><span>Contratos</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{formatM(contractsSummary.totalValueM)}</strong><span>Valor total</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--oro)" }}>{subsidiesSummary.totalSubsidies}</strong><span>Subvenciones</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Contracts ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="contratacion.contractsEyebrow" />}
          title={<>{contractsSummary.totalContractsTracked} <T k="common.contracts" /> · {formatM(contractsSummary.totalValueM)}</>}
          description={<T k="contratacion.contractsDesc" />}
        />
        <div className="vote-list">
          {publicContracts.map((ct) => {
            const typeColor = contractTypeColors[ct.contractType];
            const statusColor = ct.status === "adjudicado" ? "var(--verde)" : ct.status === "en-licitacion" ? "var(--azul)" : "var(--ink-muted)";
            return (
              <article className="vote-card" key={ct.id} style={{ borderLeft: `4px solid ${typeColor}` }}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${typeColor}18`, color: typeColor }}>
                      {contractTypeLabels[ct.contractType]}
                    </span>
                    <span className="tag" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {contractStatusLabels[ct.status]}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(ct.awardDate))}
                    </span>
                  </div>
                  <strong style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem" }}>{formatM(ct.amountM)}</strong>
                </div>
                <h3>{ct.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{ct.summary}</p>
                <div className="vote-tags">
                  <span className="micro-tag">{ct.entity}</span>
                  {ct.contractor ? <span className="micro-tag" style={{ color: "var(--verde)" }}>{ct.contractor}</span> : null}
                  {ct.duration ? <span className="micro-tag">{ct.duration}</span> : null}
                  {ct.territorySlugs.slice(0, 3).map((ts) => {
                    const terr = territories.find(t => t.slug === ts);
                    return terr ? <Link className="micro-tag" href={`/territories/${ts}`} key={ts}>{terr.shortCode}</Link> : null;
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Subsidies ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="contratacion.subsidiesEyebrow" />}
          title={<>{subsidiesSummary.totalSubsidies} <T k="common.programs" /> · {formatM(subsidiesSummary.totalValueM)}</>}
          description={<T k="contratacion.subsidiesDesc" />}
        />
        <div className="vote-list">
          {publicSubsidies.map((sub) => {
            const statusColor = sub.status === "concedida" ? "var(--verde)" : sub.status === "en-tramite" ? "var(--oro)" : "var(--azul)";
            return (
              <article className="vote-card" key={sub.id} style={{ borderLeft: "4px solid var(--oro)" }}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {sub.status === "concedida" ? <T k="contratacion.granted" /> : sub.status === "en-tramite" ? <T k="contratacion.inProgress" /> : <T k="contratacion.justified" />}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(sub.publicationDate))}
                    </span>
                  </div>
                  <strong style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem" }}>{formatM(sub.amountM)}</strong>
                </div>
                <h3>{sub.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{sub.summary}</p>
                <div className="vote-tags">
                  <span className="micro-tag">{sub.grantingBody}</span>
                  {sub.tags.map((tag) => <span className="micro-tag" key={tag}>{tag}</span>)}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
