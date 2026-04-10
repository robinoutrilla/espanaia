import { T } from "../../components/t";
import { SiteHeader } from "../../components/site-header";
import { SectionHeading } from "../../components/section-heading";
import {
  euComparisons,
  euCategoryLabels,
  euCategoryColors,
  countryLabels,
  getSpainRank,
} from "../../lib/eurostat-data";
import {
  euLegislation,
  infringementProcedures,
  legislationTypeLabels,
  legislationTypeColors,
  transpositionStatusLabels,
  transpositionStatusColors,
  infringementStageLabels,
  transpositionSummary,
  infringementSummary,
} from "../../lib/eurlex-data";

export default function EuropaPage() {
  const categories = [...new Set(euComparisons.map(c => c.category))];
  const countries = ["spain", "eu27", "germany", "france", "italy", "portugal"] as const;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="europa" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="europa.eyebrow" /></span>
            <h1 className="detail-title"><T k="europa.title" /></h1>
            <p className="detail-description">
              <T k="europa.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <div className="kpi-grid">
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--azul)" }}>{euComparisons.length}</strong>
                <span className="kpi-label"><T k="europa.euIndicators" /></span>
                <span className="kpi-sub">Eurostat</span>
              </div>
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--verde)" }}>{euLegislation.length}</strong>
                <span className="kpi-label"><T k="europa.euLaws" /></span>
                <span className="kpi-sub">EUR-Lex</span>
              </div>
              <div className="kpi-cell">
                <strong className="kpi-number" style={{ color: "var(--rojo)" }}>{infringementSummary.activos}</strong>
                <span className="kpi-label">infracciones activas</span>
                <span className="kpi-sub">Comisión Europea</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Eurostat comparisons ── */}
      {categories.map((cat) => {
        const items = euComparisons.filter(c => c.category === cat);
        const catColor = euCategoryColors[cat];
        return (
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }} key={cat}>
            <SectionHeading
              eyebrow={euCategoryLabels[cat]}
              title={`${items.length} indicadores`}
              description={<><T k="europa.comparisonDesc" /> Eurostat {items[0]?.year}.</>}
            />
            <div className="indicator-table-wrap">
              <table className="indicator-table">
                <thead>
                  <tr>
                    <th><T k="europa.thIndicator" /></th>
                    {countries.map(c => <th key={c}>{countryLabels[c]}</th>)}
                    <th><T k="europa.thSpainRank" /></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((comp) => {
                    const rank = getSpainRank(comp.id);
                    return (
                      <tr key={comp.id}>
                        <td style={{ fontWeight: 600, fontSize: "0.82rem" }}>{comp.indicator} <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>({comp.unit})</span></td>
                        {countries.map(c => {
                          const val = comp[c as keyof typeof comp] as number;
                          const isSpain = c === "spain";
                          return (
                            <td key={c} style={{ fontWeight: isSpain ? 700 : 400, color: isSpain ? catColor : "var(--ink)" }}>
                              {typeof val === "number" ? val.toLocaleString("es-ES") : val}
                            </td>
                          );
                        })}
                        <td>
                          <span className="tag" style={{
                            background: rank.rank <= 2 ? "var(--verde-soft)" : rank.rank >= 5 ? "var(--rojo-soft)" : "var(--oro-soft)",
                            color: rank.rank <= 2 ? "var(--verde)" : rank.rank >= 5 ? "var(--rojo)" : "var(--oro)",
                          }}>
                            {rank.rank}/{rank.total}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* ── EU legislation ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="europa.legislationEyebrow" />}
          title={<T k="europa.legislationTitle" />}
          description={`${euLegislation.length} normas con impacto directo. ${transpositionSummary.retrasadas} directivas retrasadas en transposición.`}
        />
        <div className="vote-list">
          {euLegislation.map((leg) => {
            const typeColor = legislationTypeColors[leg.type];
            return (
              <article className="vote-card" key={leg.id} style={{ borderLeft: `4px solid ${typeColor}` }}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${typeColor}18`, color: typeColor }}>
                      {legislationTypeLabels[leg.type]}
                    </span>
                    {leg.transpositionStatus ? (
                      <span className="tag" style={{
                        background: `${transpositionStatusColors[leg.transpositionStatus]}18`,
                        color: transpositionStatusColors[leg.transpositionStatus],
                      }}>
                        {transpositionStatusLabels[leg.transpositionStatus]}
                      </span>
                    ) : null}
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{leg.celex}</span>
                  </div>
                  <span className="micro-tag">{leg.sector}</span>
                </div>
                <h3>{leg.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{leg.summary}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--azul)", marginTop: 4 }}>{leg.impactOnSpain}</p>
                {leg.transpositionDeadline ? (
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                    <T k="europa.transpositionDeadline" /> {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(leg.transpositionDeadline))}
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Infringement procedures ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow={<T k="europa.infringementEyebrow" />}
          title={`${infringementSummary.activos} procedimientos activos contra España`}
          description={<><T k="europa.potentialFine" /> {infringementSummary.multaTotalPotencialM.toFixed(1)} M€. <T k="europa.infringementDesc" /></>}
        />
        <div className="vote-list">
          {infringementProcedures.map((inf) => {
            const stageColor = inf.stage === "sentencia" || inf.stage === "recurso-tjue" ? "var(--rojo)" : inf.stage === "dictamen-motivado" ? "var(--oro)" : inf.stage === "archivado" ? "var(--verde)" : "var(--azul)";
            return (
              <article className="vote-card" key={inf.id} style={{ borderLeft: `4px solid ${stageColor}` }}>
                <div className="vote-card-header">
                  <div className="vote-card-meta">
                    <span className="tag" style={{ background: `${stageColor}18`, color: stageColor }}>
                      {infringementStageLabels[inf.stage]}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{inf.caseNumber}</span>
                  </div>
                  {inf.potentialFineM ? (
                    <strong style={{ color: "var(--rojo)", fontFamily: "var(--font-mono)" }}>{inf.potentialFineM} M€</strong>
                  ) : null}
                </div>
                <h3>{inf.subject}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{inf.summary}</p>
                <div className="vote-tags">
                  <span className="micro-tag">{inf.sector}</span>
                  {inf.directive ? <span className="micro-tag">{inf.directive}</span> : null}
                  <span className="micro-tag"><T k="europa.opened" /> {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(inf.openedDate))}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
