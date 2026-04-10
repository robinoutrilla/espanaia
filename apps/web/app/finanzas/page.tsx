/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { parties, territories } from "@espanaia/seed-data";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";
import { T } from "../../components/t";
import { partyColors, partyLogos, proxyImg, territoryShields } from "../../lib/visual-data";
import {
  stateRevenue2026,
  totalRevenue2026,
  revenueCategoryLabels,
  revenueCategoryColors,
  stateSpending2026,
  totalSpending2026,
  ngeuPlan,
  ngeuDisbursements,
  territoryFiscalProfiles,
  partyFinances,
  diputacionBudgets,
  ayuntamientoBudgets,
  pgeSecciones2026,
  totalPGE2026Estado,
  totalPGE2026Consolidado,
  defensaDesglose,
  pgeChapterColors,
  pgeChapterLabels,
} from "../../lib/finance-data";

export default function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  return <FinanzasContent searchParamsPromise={searchParams} />;
}

async function FinanzasContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ seccion?: string }>;
}) {
  const sp = await searchParamsPromise;
  const section = sp.seccion ?? "";

  const ngeuDisbursedPct = Math.round((ngeuPlan.disbursedTotalB / ngeuPlan.totalB) * 100);

  const formatB = (n: number) => `${n.toFixed(1)} Md€`;

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="finanzas" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="finanzas.eyebrow" /></span>
            <h1 className="detail-title"><T k="finanzas.title" /></h1>
            <p className="detail-description">
              <T k="finanzas.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{formatB(totalRevenue2026)}</strong><span>Ingresos 2026</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{formatB(totalSpending2026)}</strong><span>Gasto 2026</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{formatB(ngeuPlan.totalB)}</strong><span>NGEU total</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Section filter ── */}
      <section className="panel section-panel">
        <div className="agenda-filters">
          <div className="agenda-filter-group">
            <span className="agenda-filter-label"><T k="finanzas.sectionLabel" /></span>
            <div className="agenda-filter-options">
              <Link className={`agenda-filter-pill ${!section ? "agenda-filter-active" : ""}`} href="/finanzas"><T k="finanzas.all" /></Link>
              <Link className={`agenda-filter-pill ${section === "ingresos" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=ingresos"><T k="finanzas.income" /></Link>
              <Link className={`agenda-filter-pill ${section === "gasto" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=gasto"><T k="finanzas.spending" /></Link>
              <Link className={`agenda-filter-pill ${section === "ngeu" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=ngeu"><T k="finanzas.ngeu" /></Link>
              <Link className={`agenda-filter-pill ${section === "ccaa" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=ccaa"><T k="finanzas.ccaa" /></Link>
              <Link className={`agenda-filter-pill ${section === "partidos" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=partidos"><T k="finanzas.partyFinance" /></Link>
              <Link className={`agenda-filter-pill ${section === "locales" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=locales">Haciendas locales</Link>
              <Link className={`agenda-filter-pill ${section === "pge" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=pge">PGE por Secciones</Link>
              <Link className={`agenda-filter-pill ${section === "defensa" ? "agenda-filter-active" : ""}`} href="/finanzas?seccion=defensa">Defensa</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ INGRESOS ══════════════ */}
      {(!section || section === "ingresos") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Ingresos del Estado"
            title={`${formatB(totalRevenue2026)} previstos en 2026`}
            description="Fuentes de financiación del sector público: impuestos, cotizaciones, transferencias UE y deuda."
          />

          {/* Summary bar */}
          <div className="finance-stacked-bar">
            {stateRevenue2026.map((r) => (
              <div
                key={r.id}
                className="finance-bar-segment"
                style={{ width: `${r.pctOfTotal}%`, background: revenueCategoryColors[r.category] }}
                title={`${r.label}: ${r.pctOfTotal}%`}
              />
            ))}
          </div>
          <div className="finance-bar-legend">
            {Object.entries(revenueCategoryLabels).filter(([k]) => stateRevenue2026.some(r => r.category === k)).map(([key, label]) => (
              <span key={key} className="finance-legend-item">
                <span className="finance-legend-dot" style={{ background: revenueCategoryColors[key] }} />
                {label}
              </span>
            ))}
          </div>

          <div className="finance-items-grid">
            {stateRevenue2026.map((rev) => {
              const catColor = revenueCategoryColors[rev.category];
              const trendLabel = rev.trend === "up" ? "Alza" : rev.trend === "down" ? "Baja" : "Estable";
              const trendClass = rev.trend === "up" ? "tag-up" : rev.trend === "down" ? "tag-down" : "tag-flat";
              return (
                <article className="finance-item-card" key={rev.id} style={{ borderLeft: `4px solid ${catColor}` }}>
                  <div className="finance-item-top">
                    <span className="micro-tag" style={{ background: `${catColor}15`, color: catColor }}>
                      {revenueCategoryLabels[rev.category]}
                    </span>
                    <span className={`tag ${trendClass}`}>{trendLabel}</span>
                  </div>
                  <h3>{rev.label}</h3>
                  <div className="finance-item-figures">
                    <strong>{formatB(rev.amountB)}</strong>
                    <span>{rev.pctOfTotal}% del total</span>
                    <span style={{ color: rev.changePct > 0 ? "var(--verde)" : rev.changePct < 0 ? "var(--rojo)" : "var(--ink-muted)" }}>
                      {rev.changePct > 0 ? "+" : ""}{rev.changePct}% interanual
                    </span>
                  </div>
                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${rev.pctOfTotal}%`, background: catColor }} />
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 4 }}>{rev.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ GASTO ══════════════ */}
      {(!section || section === "gasto") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Gasto público"
            title={`${formatB(totalSpending2026)} presupuestados en 2026`}
            description="Distribución del gasto consolidado del Estado y las CCAA por grandes categorías."
          />

          <div className="finance-stacked-bar">
            {stateSpending2026.map((s, i) => {
              const colors = ["#c8102e", "#003da5", "#009b3a", "#8e8e9a", "#f1bf00", "#6b4c9a", "#e87d00", "#00838f", "#555566"];
              return (
                <div
                  key={s.id}
                  className="finance-bar-segment"
                  style={{ width: `${s.pctOfTotal}%`, background: colors[i % colors.length] }}
                  title={`${s.label}: ${s.pctOfTotal}%`}
                />
              );
            })}
          </div>

          <div className="finance-items-grid">
            {stateSpending2026.map((cat, i) => {
              const colors = ["#c8102e", "#003da5", "#009b3a", "#8e8e9a", "#f1bf00", "#6b4c9a", "#e87d00", "#00838f", "#555566"];
              const catColor = colors[i % colors.length];
              const trendLabel = cat.trend === "up" ? "Alza" : cat.trend === "down" ? "Baja" : "Estable";
              const trendClass = cat.trend === "up" ? "tag-up" : cat.trend === "down" ? "tag-down" : "tag-flat";
              return (
                <article className="finance-item-card" key={cat.id} style={{ borderLeft: `4px solid ${catColor}` }}>
                  <div className="finance-item-top">
                    <span className={`tag ${trendClass}`}>{trendLabel}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {cat.changePct > 0 ? "+" : ""}{cat.changePct}% interanual
                    </span>
                  </div>
                  <h3>{cat.label}</h3>
                  <div className="finance-item-figures">
                    <strong>{formatB(cat.amountB)}</strong>
                    <span>{cat.pctOfTotal}% del gasto</span>
                  </div>
                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${cat.pctOfTotal * 2.6}%`, background: catColor }} />
                  </div>
                  {cat.subItems.length > 0 && (
                    <div className="finance-subitems">
                      {cat.subItems.map((sub) => (
                        <div className="finance-subitem" key={sub.label}>
                          <span>{sub.label}</span>
                          <span>{formatB(sub.amountB)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 4 }}>{cat.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ NGEU ══════════════ */}
      {(!section || section === "ngeu") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="NextGenerationEU"
            title={`Plan de Recuperación · ${formatB(ngeuPlan.totalB)}`}
            description={`${ngeuPlan.components} componentes, ${ngeuPlan.reforms} reformas, ${ngeuPlan.investments} inversiones. ${ngeuDisbursedPct}% desembolsado.`}
          />

          {/* NGEU summary cards */}
          <div className="ngeu-summary-row">
            <div className="ngeu-summary-card">
              <span>Subvenciones</span>
              <strong>{formatB(ngeuPlan.totalGrantsB)}</strong>
              <span className="micro-tag">{formatB(ngeuPlan.disbursedGrantsB)} recibidos</span>
            </div>
            <div className="ngeu-summary-card">
              <span>Pr&eacute;stamos</span>
              <strong>{formatB(ngeuPlan.totalLoansB)}</strong>
              <span className="micro-tag">{formatB(ngeuPlan.disbursedLoantsB)} recibidos</span>
            </div>
            <div className="ngeu-summary-card">
              <span>Total desembolsado</span>
              <strong style={{ color: "var(--verde)" }}>{formatB(ngeuPlan.disbursedTotalB)}</strong>
              <div className="representation-bar-wrap">
                <div className="representation-bar" style={{ width: `${ngeuDisbursedPct}%`, background: "var(--verde)" }} />
                <span className="representation-label">{ngeuDisbursedPct}%</span>
              </div>
            </div>
            <div className="ngeu-summary-card">
              <span>Pendiente</span>
              <strong style={{ color: "var(--rojo)" }}>{formatB(ngeuPlan.pendingB)}</strong>
              <span className="micro-tag">{100 - ngeuDisbursedPct}% restante</span>
            </div>
          </div>

          {/* Disbursement timeline */}
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, margin: "24px 0 12px" }}>
            Tramos de desembolso
          </h3>
          <div className="ngeu-timeline">
            {ngeuDisbursements.map((d) => {
              const statusColor = d.status === "desembolsado" ? "var(--verde)" : d.status === "solicitado" ? "var(--oro)" : "var(--ink-muted)";
              const statusLabel = d.status === "desembolsado" ? "Desembolsado" : d.status === "solicitado" ? "Solicitado" : "Pendiente";
              const milestonePct = d.milestones > 0 ? Math.round((d.milestonesCompleted / d.milestones) * 100) : 0;
              return (
                <article className="ngeu-tranche-card" key={d.id} style={{ borderLeft: `4px solid ${statusColor}` }}>
                  <div className="finance-item-top">
                    <span className="tag" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {statusLabel}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {d.tranche === 0 ? "Prefinanciación" : `Tramo ${d.tranche}`}
                    </span>
                  </div>
                  <div className="finance-item-figures">
                    <strong>{formatB(d.amountB)}</strong>
                    {d.disbursementDate ? (
                      <span>Recibido: {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(d.disbursementDate))}</span>
                    ) : (
                      <span>Solicitud: {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(d.requestDate))}</span>
                    )}
                  </div>
                  {d.milestones > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div className="representation-bar-wrap">
                        <div className="representation-bar" style={{ width: `${milestonePct}%`, background: statusColor }} />
                        <span className="representation-label">{d.milestonesCompleted}/{d.milestones} hitos</span>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 4 }}>{d.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ CCAA ══════════════ */}
      {(!section || section === "ccaa") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Perfiles fiscales"
            title="Finanzas de las Comunidades Autónomas"
            description="Presupuesto total, gasto per cápita, deuda, fondos europeos y transferencias del Estado."
          />

          <div className="ccaa-fiscal-grid">
            {territoryFiscalProfiles.map((profile) => {
              const terr = territories.find(t => t.slug === profile.territorySlug);
              if (!terr) return null;
              const shield = territoryShields[terr.slug];
              return (
                <Link className="ccaa-fiscal-card" href={`/territories/${terr.slug}`} key={profile.territorySlug}>
                  <div className="ccaa-fiscal-header">
                    <div className="territory-shield-row">
                      {shield ? (
                        <img className="territory-shield" src={proxyImg(shield)} alt={terr.name} width={24} loading="lazy" />
                      ) : null}
                      <h3>{terr.name}</h3>
                    </div>
                    <span className="micro-tag">{terr.shortCode}</span>
                  </div>

                  <div className="ccaa-fiscal-stats">
                    <div>
                      <strong>{(profile.totalBudgetM / 1000).toFixed(1)} Md€</strong>
                      <span>Presupuesto</span>
                    </div>
                    <div>
                      <strong>{profile.spendPerCapita.toLocaleString("es-ES")} €</strong>
                      <span>Gasto/cápita</span>
                    </div>
                    <div>
                      <strong>{profile.debtPctGdp}%</strong>
                      <span>Deuda/PIB</span>
                    </div>
                  </div>

                  <div className="ccaa-fiscal-spending">
                    {profile.mainSpending.map((item) => (
                      <div className="ccaa-spending-row" key={item.label}>
                        <span>{item.label}</span>
                        <div className="representation-bar-wrap" style={{ flex: 1 }}>
                          <div className="representation-bar" style={{ width: `${item.pctOfBudget * 2.5}%`, background: "var(--azul)" }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", minWidth: 36, textAlign: "right" }}>{item.pctOfBudget}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="ccaa-fiscal-footer">
                    <span>UE: {(profile.euFundsReceivedM / 1000).toFixed(1)} Md€</span>
                    {profile.stateTransfersM > 0 ? (
                      <span>Estado: {(profile.stateTransfersM / 1000).toFixed(1)} Md€</span>
                    ) : (
                      <span style={{ color: "var(--oro)" }}>Concierto económico</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ PARTIDOS ══════════════ */}
      {(!section || section === "partidos") && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <SectionHeading
            eyebrow="Financiación de partidos"
            title="Cuentas públicas de los actores políticos"
            description="Subvenciones estatales, electorales, grupos parlamentarios, deuda y cuotas. Fuente: Tribunal de Cuentas."
          />

          <div className="party-finance-grid">
            {partyFinances.map((pf) => {
              const party = parties.find(p => p.slug === pf.partySlug);
              if (!party) return null;
              const color = partyColors[pf.partySlug] ?? "var(--rojo)";
              const logo = partyLogos[pf.partySlug];
              const publicPct = Math.round((pf.totalPublicM / pf.declaredIncomeM) * 100);
              return (
                <Link className="party-finance-card" href={`/parties/${party.slug}`} key={pf.partySlug} style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="party-finance-header">
                    {logo ? (
                      <img src={proxyImg(logo)} alt={party.acronym} width={28} loading="lazy" style={{ objectFit: "contain" }} />
                    ) : (
                      <span className="party-logo-badge" style={{ background: `${color}15`, color }}>{party.acronym}</span>
                    )}
                    <div>
                      <h3>{party.shortName}</h3>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{pf.year}</span>
                    </div>
                  </div>

                  <div className="party-finance-figures">
                    <div className="party-finance-row">
                      <span>Subvención estatal</span>
                      <strong>{pf.stateSubsidyM.toFixed(1)} M€</strong>
                    </div>
                    <div className="party-finance-row">
                      <span>Subvención electoral</span>
                      <strong>{pf.electoralSubsidyM.toFixed(1)} M€</strong>
                    </div>
                    <div className="party-finance-row">
                      <span>Grupos parlamentarios</span>
                      <strong>{pf.parliamentaryGroupM.toFixed(1)} M€</strong>
                    </div>
                    <div className="party-finance-row" style={{ borderTop: "1px solid var(--border-light)", paddingTop: 6 }}>
                      <span style={{ fontWeight: 600 }}>Total público</span>
                      <strong style={{ color }}>{pf.totalPublicM.toFixed(1)} M€</strong>
                    </div>
                  </div>

                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${publicPct}%`, background: color }} />
                    <span className="representation-label">{publicPct}% de ingresos son públicos</span>
                  </div>

                  <div className="party-finance-meta">
                    <span>Ingresos: {pf.declaredIncomeM.toFixed(1)} M€</span>
                    <span>Gastos: {pf.declaredExpensesM.toFixed(1)} M€</span>
                    <span>Deuda: {pf.debtM.toFixed(1)} M€</span>
                    <span>Cuotas: {pf.membershipFeesM.toFixed(1)} M€</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════ HACIENDAS LOCALES ══════════════ */}
      {(!section || section === "locales") && (() => {
        /* ── Aggregate stats ── */
        const activeDip = diputacionBudgets.filter(d => d.totalBudgetM > 0);
        const totalDipBudget = activeDip.reduce((s, d) => s + d.totalBudgetM, 0);
        const totalAyuBudget = ayuntamientoBudgets.reduce((s, a) => s + a.totalBudgetM, 0);

        /* ── Group by CCAA ── */
        const ccaaMap = new Map<string, { dips: typeof diputacionBudgets; ayus: typeof ayuntamientoBudgets }>();
        for (const d of activeDip) {
          if (!ccaaMap.has(d.ccaaSlug)) ccaaMap.set(d.ccaaSlug, { dips: [], ayus: [] });
          ccaaMap.get(d.ccaaSlug)!.dips.push(d);
        }
        for (const a of ayuntamientoBudgets) {
          if (!ccaaMap.has(a.ccaaSlug)) ccaaMap.set(a.ccaaSlug, { dips: [], ayus: [] });
          ccaaMap.get(a.ccaaSlug)!.ayus.push(a);
        }
        const ccaaEntries = [...ccaaMap.entries()].sort(([, a], [, b]) => {
          const ta = a.dips.reduce((s, d) => s + d.totalBudgetM, 0) + a.ayus.reduce((s, d) => s + d.totalBudgetM, 0);
          const tb = b.dips.reduce((s, d) => s + d.totalBudgetM, 0) + b.ayus.reduce((s, d) => s + d.totalBudgetM, 0);
          return tb - ta;
        });

        const typeLabels: Record<string, string> = {
          diputacion: "Diputación",
          "diputacion-foral": "Dip. Foral",
          cabildo: "Cabildo",
          consell: "Consell",
        };
        const typeColors: Record<string, string> = {
          diputacion: "#4338ca",
          "diputacion-foral": "#b45309",
          cabildo: "#0e7490",
          consell: "#9333ea",
        };

        const formatM = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)} Md€` : `${n.toFixed(0)} M€`;

        return (
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Haciendas locales"
              title={`${formatM(totalDipBudget + totalAyuBudget)} en presupuestos locales`}
              description={`${activeDip.length} diputaciones/cabildos/consells y ${ayuntamientoBudgets.length} capitales de provincia. Fuente: Hacienda — SIEL.`}
            />

            {/* ── Summary cards ── */}
            <div className="ngeu-summary-row" style={{ marginBottom: 28 }}>
              <div className="ngeu-summary-card">
                <span>Diputaciones</span>
                <strong>{activeDip.length}</strong>
                <span className="micro-tag">{formatM(totalDipBudget)}</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Ayuntamientos</span>
                <strong>{ayuntamientoBudgets.length}</strong>
                <span className="micro-tag">{formatM(totalAyuBudget)}</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Empleados locales</span>
                <strong>{(activeDip.reduce((s, d) => s + d.employeeCount, 0) + ayuntamientoBudgets.reduce((s, a) => s + a.employeeCount, 0)).toLocaleString("es-ES")}</strong>
                <span className="micro-tag">Total plantillas</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Inversión local</span>
                <strong>{formatM(activeDip.reduce((s, d) => s + d.investmentM, 0) + ayuntamientoBudgets.reduce((s, a) => s + a.investmentM, 0))}</strong>
                <span className="micro-tag">Cap. VI y VII</span>
              </div>
            </div>

            {/* ── Diputaciones table ── */}
            <h3 className="local-section-title">
              <span className="local-section-icon">🏛</span>
              Diputaciones, Cabildos y Consells
              <span className="micro-tag" style={{ marginLeft: 8 }}>{activeDip.length}</span>
            </h3>

            <div className="local-table-wrap">
              <table className="local-table">
                <thead>
                  <tr>
                    <th className="local-th-name">Entidad</th>
                    <th>Tipo</th>
                    <th className="local-th-num">Presupuesto</th>
                    <th className="local-th-num">Deuda/hab.</th>
                    <th className="local-th-num local-hide-mobile">Empleados</th>
                    <th className="local-th-num local-hide-mobile">Inversión</th>
                    <th className="local-th-bar">Ppal. gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDip
                    .sort((a, b) => b.totalBudgetM - a.totalBudgetM)
                    .map((dip) => {
                      const terr = territories.find(t => t.slug === dip.ccaaSlug);
                      const shield = terr ? territoryShields[terr.slug] : undefined;
                      const tc = typeColors[dip.type] ?? "#4338ca";
                      const top = dip.mainSpending[0];
                      return (
                        <tr key={dip.slug}>
                          <td className="local-td-name">
                            {shield && <img className="territory-shield" src={proxyImg(shield)} alt="" width={16} loading="lazy" style={{ height: 16, objectFit: "contain" }} />}
                            <span>{dip.name}</span>
                          </td>
                          <td>
                            <span className="local-type-tag" style={{ background: `${tc}12`, color: tc }}>{typeLabels[dip.type] ?? dip.type}</span>
                          </td>
                          <td className="local-td-num">{formatM(dip.totalBudgetM)}</td>
                          <td className="local-td-num">{dip.debtPerCapita.toLocaleString("es-ES")} €</td>
                          <td className="local-td-num local-hide-mobile">{dip.employeeCount.toLocaleString("es-ES")}</td>
                          <td className="local-td-num local-hide-mobile">{formatM(dip.investmentM)}</td>
                          <td className="local-td-bar">
                            {top && (
                              <>
                                <div className="local-mini-bar">
                                  <div style={{ width: `${top.pctOfBudget}%`, background: tc }} />
                                </div>
                                <span className="local-bar-label">{top.label} {top.pctOfBudget}%</span>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* ── Ayuntamientos table ── */}
            <h3 className="local-section-title" style={{ marginTop: 36 }}>
              <span className="local-section-icon">🏘</span>
              Capitales de Provincia
              <span className="micro-tag" style={{ marginLeft: 8 }}>{ayuntamientoBudgets.length}</span>
            </h3>

            <div className="local-table-wrap">
              <table className="local-table">
                <thead>
                  <tr>
                    <th className="local-th-name">Ciudad</th>
                    <th className="local-th-num">Población</th>
                    <th className="local-th-num">Presupuesto</th>
                    <th className="local-th-num">Deuda/hab.</th>
                    <th className="local-th-num local-hide-mobile">IBI</th>
                    <th className="local-th-num local-hide-mobile">Inversión</th>
                    <th className="local-th-bar">Ppal. gasto</th>
                  </tr>
                </thead>
                {ccaaEntries.map(([ccaaSlug, group]) => {
                  const terr = territories.find(t => t.slug === ccaaSlug);
                  const shield = terr ? territoryShields[terr.slug] : undefined;
                  const ccaaTotal = group.ayus.reduce((s, a) => s + a.totalBudgetM, 0);
                  if (group.ayus.length === 0) return null;
                  return (
                    <tbody key={ccaaSlug}>
                      <tr className="local-ccaa-row">
                        <td colSpan={7}>
                          <div className="local-ccaa-row-inner">
                            {shield && <img className="territory-shield" src={proxyImg(shield)} alt="" width={16} loading="lazy" style={{ height: 16, objectFit: "contain" }} />}
                            <strong>{terr?.name ?? ccaaSlug}</strong>
                            <span className="micro-tag">{group.ayus.length} capital{group.ayus.length > 1 ? "es" : ""} · {formatM(ccaaTotal)}</span>
                          </div>
                        </td>
                      </tr>
                      {group.ayus
                        .sort((a, b) => b.totalBudgetM - a.totalBudgetM)
                        .map((ayu) => {
                          const top = ayu.mainSpending[0];
                          return (
                            <tr key={ayu.slug}>
                              <td className="local-td-name">
                                <span>{ayu.name}</span>
                              </td>
                              <td className="local-td-num">{(ayu.population / 1000).toFixed(0)}k</td>
                              <td className="local-td-num">{formatM(ayu.totalBudgetM)}</td>
                              <td className="local-td-num">{ayu.debtPerCapita.toLocaleString("es-ES")} €</td>
                              <td className="local-td-num local-hide-mobile">{ayu.ibiRecaudacionM.toFixed(0)} M€</td>
                              <td className="local-td-num local-hide-mobile">{formatM(ayu.investmentM)}</td>
                              <td className="local-td-bar">
                                {top && (
                                  <>
                                    <div className="local-mini-bar">
                                      <div style={{ width: `${top.pctOfBudget}%`, background: "var(--azul)" }} />
                                    </div>
                                    <span className="local-bar-label">{top.label} {top.pctOfBudget}%</span>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  );
                })}
              </table>
            </div>
          </section>
        );
      })()}

      {/* ══════════════ PGE POR SECCIONES ══════════════ */}
      {(!section || section === "pge") && (() => {
        const formatM = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)} Md€` : `${n.toFixed(0)} M€`;
        const typeLabels: Record<string, string> = {
          "organo-constitucional": "Órgano Constitucional",
          ministerio: "Ministerio",
          "gasto-comun": "Gasto Común",
          "seguridad-social": "Seguridad Social",
        };
        const typeColors: Record<string, string> = {
          "organo-constitucional": "#9333ea",
          ministerio: "#1d4ed8",
          "gasto-comun": "#b45309",
          "seguridad-social": "#047857",
        };
        const sorted = [...pgeSecciones2026].sort((a, b) => b.totalBudgetM - a.totalBudgetM);
        const maxBudget = sorted[0]?.totalBudgetM ?? 1;

        return (
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Presupuestos Generales del Estado"
              title={`${formatM(totalPGE2026Consolidado)} — PGE 2026 consolidado`}
              description={`${pgeSecciones2026.length} secciones presupuestarias: Estado (${formatM(totalPGE2026Estado)}) + Seguridad Social. Fuente: Ministerio de Hacienda, IGAE, BOE.`}
            />

            <div className="pge-summary-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
              {(["organo-constitucional", "ministerio", "gasto-comun", "seguridad-social"] as const).map((type) => {
                const secs = pgeSecciones2026.filter((s) => s.type === type);
                const total = secs.reduce((s, sec) => s + sec.totalBudgetM, 0);
                const tc = typeColors[type];
                return (
                  <div className="ngeu-summary-card" key={type} style={{ borderLeft: `3px solid ${tc}` }}>
                    <span>{typeLabels[type]}</span>
                    <strong>{formatM(total)}</strong>
                    <span className="micro-tag">{secs.length} secciones</span>
                  </div>
                );
              })}
            </div>

            {/* Chapter color legend */}
            <div className="pge-chapter-legend">
              {[1, 2, 4, 6, 7, 3, 8, 9].map((ch) => (
                <span key={ch} className="pge-legend-item">
                  <span className="pge-legend-dot" style={{ background: pgeChapterColors[ch] }} />
                  Cap. {ch}: {pgeChapterLabels[ch]}
                </span>
              ))}
            </div>

            <div className="local-table-wrap">
              <table className="local-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Secc.</th>
                    <th className="local-th-name">Nombre</th>
                    <th>Tipo</th>
                    <th className="local-th-num">Presupuesto</th>
                    <th className="local-th-num local-hide-mobile">Var.</th>
                    <th style={{ minWidth: 240 }}>Distribución por capítulos</th>
                    <th className="local-hide-mobile" style={{ minWidth: 220 }}>Principales programas</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((sec) => {
                    const tc = typeColors[sec.type] ?? "#1d4ed8";
                    return (
                      <tr key={sec.seccion}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-muted)" }}>{sec.seccion}</td>
                        <td className="local-td-name">
                          <span>{sec.name}</span>
                        </td>
                        <td>
                          <span className="local-type-tag" style={{ background: `${tc}12`, color: tc }}>{typeLabels[sec.type]?.split(" ")[0] ?? sec.type}</span>
                        </td>
                        <td className="local-td-num">{formatM(sec.totalBudgetM)}</td>
                        <td className="local-td-num local-hide-mobile" style={{ color: sec.changePct >= 0 ? "var(--verde)" : "var(--rojo)" }}>
                          {sec.changePct >= 0 ? "+" : ""}{sec.changePct}%
                        </td>
                        <td>
                          <div className="pge-stacked-bar" title={sec.chapters.map(ch => `Cap.${ch.chapter}: ${ch.pct}%`).join(" | ")}>
                            {sec.chapters.map((ch) => (
                              <div
                                key={ch.chapter}
                                style={{ width: `${ch.pct}%`, background: pgeChapterColors[ch.chapter] ?? "#6b7280" }}
                                title={`Cap. ${ch.chapter} — ${ch.label}: ${formatM(ch.amountM)} (${ch.pct}%)`}
                              />
                            ))}
                          </div>
                          <div className="pge-stacked-labels">
                            {sec.chapters.filter(ch => ch.pct >= 10).map((ch) => (
                              <span key={ch.chapter} style={{ color: pgeChapterColors[ch.chapter] }}>
                                {ch.pct}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="local-hide-mobile pge-programs-cell">
                          {sec.keyPrograms.slice(0, 2).map((p) => (
                            <span key={p.code} className="pge-program-tag">{p.label} ({formatM(p.amountM)})</span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <p style={{ fontSize: "0.72rem", color: "var(--ink-muted)", marginTop: 12, lineHeight: 1.5 }}>
              Cifras proyectadas sobre PGE 2025 aprobados. La Seguridad Social tiene presupuesto separado del Estado.
              Los Programas Especiales de Armamento (PEAs) de Defensa se computan parcialmente en Cap. 6 y Cap. 8.
            </p>
          </section>
        );
      })()}

      {/* ══════════════ DEFENSA — DESGLOSE DETALLADO ══════════════ */}
      {(!section || section === "defensa") && (() => {
        const d = defensaDesglose;
        const formatM = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)} Md€` : `${n.toFixed(0)} M€`;
        const peaStatusLabels: Record<string, string> = {
          "en-produccion": "En producción",
          "en-desarrollo": "En desarrollo",
          "entregado-parcial": "Entrega parcial",
          planificado: "Planificado",
        };
        const peaStatusColors: Record<string, string> = {
          "en-produccion": "#047857",
          "en-desarrollo": "#b45309",
          "entregado-parcial": "#1d4ed8",
          planificado: "#6b7280",
        };
        const totalEffectivos = d.effectivos.ejercitoTierra + d.effectivos.armada + d.effectivos.ejercitoAire + d.effectivos.cuerposComunes;

        return (
          <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
            <SectionHeading
              eyebrow="Sección 14 — Ministerio de Defensa"
              title={`${formatM(d.totalBudgetM)} — Presupuesto de Defensa 2026`}
              description={`${d.pctPIB}% del PIB (objetivo OTAN: ${d.targetOTAN}%). Incremento del ${d.changePct}% interanual. Fuente: Secretaría General de Defensa, IGAE, BOE.`}
            />

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 24 }}>
              <div className="ngeu-summary-card">
                <span>Presupuesto total</span>
                <strong>{formatM(d.totalBudgetM)}</strong>
                <span className="micro-tag">+{d.changePct}% vs 2025</span>
              </div>
              <div className="ngeu-summary-card">
                <span>% PIB</span>
                <strong>{d.pctPIB}%</strong>
                <span className="micro-tag">Objetivo OTAN: {d.targetOTAN}%</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Gap hasta 2% PIB</span>
                <strong>{formatM(d.gapToTargetM)}</strong>
                <span className="micro-tag">Plazo: {d.otan.plazoCompromiso}</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Efectivos militares</span>
                <strong>{totalEffectivos.toLocaleString("es-ES")}</strong>
                <span className="micro-tag">+ {d.effectivos.civil.toLocaleString("es-ES")} civiles</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Reservistas</span>
                <strong>{d.effectivos.reservistas.toLocaleString("es-ES")}</strong>
                <span className="micro-tag">Reserva voluntaria</span>
              </div>
              <div className="ngeu-summary-card">
                <span>Ranking OTAN</span>
                <strong style={{ fontSize: "0.82rem" }}>{d.otan.ranking}</strong>
                <span className="micro-tag">% PIB dedicado</span>
              </div>
            </div>

            {/* Chapters table */}
            <h3 className="local-section-title">Desglose por capítulos presupuestarios</h3>
            <div className="local-table-wrap" style={{ marginBottom: 24 }}>
              <table className="local-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Cap.</th>
                    <th className="local-th-name">Concepto</th>
                    <th className="local-th-num">Importe</th>
                    <th className="local-th-num">% Total</th>
                    <th style={{ minWidth: 160 }}>Proporción</th>
                  </tr>
                </thead>
                <tbody>
                  {d.chapters.map((ch) => (
                    <tr key={ch.chapter}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{ch.chapter}</td>
                      <td className="local-td-name"><span>{ch.label}</span></td>
                      <td className="local-td-num">{formatM(ch.amountM)}</td>
                      <td className="local-td-num">{ch.pct}%</td>
                      <td>
                        <div className="pge-proportion-bar">
                          <div style={{ width: `${ch.pct * 2}%`, background: "#1d4ed8" }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PEAs table */}
            <h3 className="local-section-title">Programas Especiales de Armamento (PEAs)</h3>
            <div className="local-table-wrap" style={{ marginBottom: 24 }}>
              <table className="local-table">
                <thead>
                  <tr>
                    <th className="local-th-name">Programa</th>
                    <th className="local-hide-mobile">Contratista</th>
                    <th className="local-th-num">Coste total</th>
                    <th className="local-th-num">Pendiente</th>
                    <th className="local-th-num">Anualidad 2026</th>
                    <th className="local-hide-mobile">Unidades</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {d.peas.map((pea) => {
                    const sc = peaStatusColors[pea.status] ?? "#6b7280";
                    return (
                      <tr key={pea.name}>
                        <td className="local-td-name"><span>{pea.name}</span></td>
                        <td className="local-hide-mobile" style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{pea.contractor}</td>
                        <td className="local-td-num">{formatM(pea.totalCostM)}</td>
                        <td className="local-td-num">{formatM(pea.pendingM)}</td>
                        <td className="local-td-num" style={{ fontWeight: 600 }}>{formatM(pea.annuity2026M)}</td>
                        <td className="local-hide-mobile" style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{pea.units}</td>
                        <td>
                          <span className="local-type-tag" style={{ background: `${sc}15`, color: sc }}>{peaStatusLabels[pea.status]}</span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 600, background: "var(--bg-warm)" }}>
                    <td className="local-td-name"><span>Total PEAs</span></td>
                    <td className="local-hide-mobile"></td>
                    <td className="local-td-num">{formatM(d.peas.reduce((s, p) => s + p.totalCostM, 0))}</td>
                    <td className="local-td-num">{formatM(d.peas.reduce((s, p) => s + p.pendingM, 0))}</td>
                    <td className="local-td-num">{formatM(d.peas.reduce((s, p) => s + p.annuity2026M, 0))}</td>
                    <td className="local-hide-mobile"></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* International missions */}
            <h3 className="local-section-title">Operaciones internacionales</h3>
            <div className="local-table-wrap" style={{ marginBottom: 24 }}>
              <table className="local-table">
                <thead>
                  <tr>
                    <th className="local-th-name">Misión</th>
                    <th>Teatro</th>
                    <th className="local-th-num">Desplegados</th>
                    <th className="local-th-num">Coste anual</th>
                  </tr>
                </thead>
                <tbody>
                  {d.misionesInternacionales.map((m) => (
                    <tr key={m.name}>
                      <td className="local-td-name"><span>{m.name}</span></td>
                      <td style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{m.theater}</td>
                      <td className="local-td-num">{m.personnelDeployed.toLocaleString("es-ES")}</td>
                      <td className="local-td-num">{formatM(m.annualCostM)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 600, background: "var(--bg-warm)" }}>
                    <td className="local-td-name"><span>Total misiones</span></td>
                    <td></td>
                    <td className="local-td-num">{d.misionesInternacionales.reduce((s, m) => s + m.personnelDeployed, 0).toLocaleString("es-ES")}</td>
                    <td className="local-td-num">{formatM(d.misionesInternacionales.reduce((s, m) => s + m.annualCostM, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Effectivos breakdown */}
            <h3 className="local-section-title">Efectivos por ejército</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Ejército de Tierra", count: d.effectivos.ejercitoTierra },
                { label: "Armada", count: d.effectivos.armada },
                { label: "Ejército del Aire y del Espacio", count: d.effectivos.ejercitoAire },
                { label: "Cuerpos Comunes", count: d.effectivos.cuerposComunes },
                { label: "Personal civil", count: d.effectivos.civil },
                { label: "Reservistas voluntarios", count: d.effectivos.reservistas },
              ].map((e) => (
                <div className="ngeu-summary-card" key={e.label}>
                  <span style={{ fontSize: "0.72rem" }}>{e.label}</span>
                  <strong>{e.count.toLocaleString("es-ES")}</strong>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.72rem", color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5 }}>
              Fuente: Secretaría General de Defensa, IGAE, BOE (Sección 14 PGE).
              Los PEAs se financian mediante créditos plurianuales (Cap. 6) y aplazamientos al sector industrial (Cap. 8).
              El compromiso OTAN del 2% PIB incluye pensiones militares (Clases Pasivas, Sección 07).
            </p>
          </section>
        );
      })()}

      {/* ── Footer ── */}
      <SiteFooter sources="IGAE, Hacienda, Tribunal de Cuentas, Comisión Europea, Eurostat, SIEL, BOE, Secretaría General de Defensa" />
    </main>
  );
}
