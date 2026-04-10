/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getBoeItemsForTerritory,
  getBudgetByTerritory,
  getInitiativesForTerritory,
  getPartyBySlug,
  getTerritoryBySlug,
  getTerritoryParties,
  getTerritoryPoliticians,
  getTerritoryTimeline,
} from "@espanaia/seed-data";
import { notFound } from "next/navigation";
import { BudgetCard } from "../../../components/budget-card";
import { PoliticianCard } from "../../../components/politician-card";
import { SectionHeading } from "../../../components/section-heading";
import { SignalCard } from "../../../components/signal-card";
import { SiteHeader } from "../../../components/site-header";
import { partyColors, partyLogos, proxyImg, territoryShields } from "../../../lib/visual-data";
import { getCcaaParliament } from "../../../lib/parliamentary-data";
import { getTerritoryFiscalProfile } from "../../../lib/finance-data";
import { getTerritoryIndicators, indicatorLabels } from "../../../lib/ine-data";
import { getContractsForTerritory, contractTypeLabels, contractTypeColors, contractStatusLabels } from "../../../lib/contracts-data";

export default async function TerritoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const territory = getTerritoryBySlug(slug);

  if (!territory) {
    notFound();
  }

  const signals = getTerritoryTimeline(slug);
  const parties = getTerritoryParties(slug);
  const politicians = getTerritoryPoliticians(slug);
  const budget = getBudgetByTerritory(slug);
  const boeItems = getBoeItemsForTerritory(slug);
  const initiatives = getInitiativesForTerritory(slug);
  const partyLabels = Object.fromEntries(parties.map((party) => [party.slug, party.shortName]));
  const ccaaParliament = getCcaaParliament(slug);
  const fiscalProfile = getTerritoryFiscalProfile(slug);
  const shield = territoryShields[slug];
  const ineIndicators = getTerritoryIndicators(slug);
  const territoryContracts = getContractsForTerritory(slug);

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="territories" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <Link className="back-link" href="/territories">
              Volver al atlas territorial
            </Link>
            <span className="eyebrow">Inteligencia territorial</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {shield ? (
                <img src={proxyImg(shield)} alt={territory.name} width={48} loading="lazy" style={{ objectFit: "contain" }} />
              ) : null}
              <h1 className="detail-title">{territory.name}</h1>
            </div>
            <p className="detail-description">{territory.strategicFocus}</p>
            <div className="chip-row">
              <span className="micro-tag">Sede: {territory.seat}</span>
              <span className="micro-tag">{territory.kind === "state" ? "Estado" : territory.kind === "autonomous-community" ? "Comunidad autónoma" : "Ciudad autónoma"}</span>
              <span className="micro-tag">{territory.monitoredInstitutions.length} instituciones</span>
            </div>
          </div>

          <aside className="detail-aside">
            <div className="stat-card">
              <span>Pulso territorial</span>
              <strong>{territory.pulseScore}</strong>
            </div>
            <div className="stat-card">
              <span>Partidos conectados</span>
              <strong>{parties.length}</strong>
            </div>
            <div className="stat-card">
              <span>Políticos vinculados</span>
              <strong>{politicians.length}</strong>
            </div>
            {ccaaParliament ? (
              <div className="stat-card">
                <span>Escaños parlamento</span>
                <strong>{ccaaParliament.totalSeats}</strong>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {/* ── CCAA Parliament composition ── */}
      {ccaaParliament ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow={ccaaParliament.name}
            title={`${ccaaParliament.totalSeats} escaños · Composición actual`}
            description={`Presidente: ${ccaaParliament.presidentName} (${ccaaParliament.presidentParty})`}
          />
          <div className="chamber-groups">
            {ccaaParliament.groups.map((group, i) => {
              const color = partyColors[group.partySlug] ?? "var(--ink-muted)";
              const logo = partyLogos[group.partySlug];
              return (
                <div className="parl-group-card parl-group-compact" key={i}>
                  <div className="parl-group-top" style={{ borderLeft: `4px solid ${color}` }}>
                    <div className="parl-group-identity">
                      {logo ? (
                        <img className="parl-group-logo" src={proxyImg(logo)} alt={group.acronym} width={28} loading="lazy" />
                      ) : (
                        <span className="party-logo-badge" style={{ background: `${color}22`, color, fontSize: "0.72rem", padding: "2px 8px" }}>{group.acronym}</span>
                      )}
                      <div>
                        <h3>{group.partyName}</h3>
                        {group.isGoverning ? <span className="tag tag-up" style={{ fontSize: "0.6rem" }}>Gobierno</span> : null}
                      </div>
                    </div>
                    <div className="parl-group-stats">
                      <strong style={{ color }}>{group.seats}</strong>
                      <span>escaños</span>
                    </div>
                  </div>
                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${group.representationPct}%`, background: color }} />
                    <span className="representation-label">{group.representationPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── Fiscal profile ── */}
      {fiscalProfile ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Perfil fiscal"
            title={`Presupuesto ${(fiscalProfile.totalBudgetM / 1000).toFixed(1)} Md€`}
            description="Desglose de gasto, fondos europeos y transferencias del Estado."
          />
          <div className="ccaa-fiscal-detail">
            <div className="ccaa-fiscal-detail-stats">
              <div className="party-finance-detail-card">
                <span>Gasto per cápita</span>
                <strong>{fiscalProfile.spendPerCapita.toLocaleString("es-ES")} €</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Ingreso per cápita</span>
                <strong>{fiscalProfile.revenuePerCapita.toLocaleString("es-ES")} €</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Deuda / PIB</span>
                <strong style={{ color: fiscalProfile.debtPctGdp > 30 ? "var(--rojo)" : "var(--ink)" }}>{fiscalProfile.debtPctGdp}%</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Fondos UE recibidos</span>
                <strong>{(fiscalProfile.euFundsReceivedM / 1000).toFixed(1)} Md€</strong>
              </div>
              {fiscalProfile.stateTransfersM > 0 ? (
                <div className="party-finance-detail-card">
                  <span>Transferencias del Estado</span>
                  <strong>{(fiscalProfile.stateTransfersM / 1000).toFixed(1)} Md€</strong>
                </div>
              ) : (
                <div className="party-finance-detail-card" style={{ background: "var(--oro-soft)" }}>
                  <span>Régimen foral</span>
                  <strong style={{ color: "var(--oro)" }}>Concierto económico</strong>
                </div>
              )}
            </div>
            <div className="ccaa-fiscal-detail-spending">
              <h3 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 8 }}>Distribución del gasto</h3>
              {(() => {
                const listedPct = fiscalProfile.mainSpending.reduce((s, i) => s + i.pctOfBudget, 0);
                const listedAmountM = fiscalProfile.mainSpending.reduce((s, i) => s + i.amountM, 0);
                const otherPct = Math.round((100 - listedPct) * 10) / 10;
                const otherAmountM = fiscalProfile.totalBudgetM - listedAmountM;
                const allSpending = [
                  ...fiscalProfile.mainSpending,
                  ...(otherPct > 0 ? [{ label: "Otros gastos", pctOfBudget: otherPct, amountM: otherAmountM }] : []),
                ];
                return allSpending.map((item) => (
                  <div className="ccaa-spending-row" key={item.label}>
                    <span style={{ minWidth: 120 }}>{item.label}</span>
                    <div className="representation-bar-wrap" style={{ flex: 1 }}>
                      <div className="representation-bar" style={{ width: `${item.pctOfBudget * 2.5}%`, background: item.label === "Otros gastos" ? "var(--ink-muted)" : "var(--azul)" }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)", minWidth: 42, textAlign: "right" }}>{item.pctOfBudget}%</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, minWidth: 60, textAlign: "right" }}>{(item.amountM / 1000).toFixed(1)} Md€</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── INE socioeconomic indicators ── */}
      {ineIndicators ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="INE"
            title="Indicadores socioeconómicos"
            description="Población, empleo, salarios, pobreza y vivienda. Fuente: INE, EPA."
          />
          <div className="indicator-national-grid">
            {(["population", "gdpPerCapita", "gdpGrowthPct", "unemploymentRate", "youthUnemploymentRate", "averageSalary", "povertyRiskRate", "lifeExpectancy", "rentAvgMonthly", "medianAge"] as const).map((field) => {
              const val = ineIndicators[field];
              if (val === undefined) return null;
              const fmt = field === "population" ? val.toLocaleString("es-ES")
                : field === "gdpPerCapita" || field === "averageSalary" ? `${val.toLocaleString("es-ES")} €`
                : field === "rentAvgMonthly" ? `${val} €/mes`
                : ["gdpGrowthPct", "unemploymentRate", "youthUnemploymentRate", "povertyRiskRate"].includes(field) ? `${val}%`
                : field === "lifeExpectancy" || field === "medianAge" ? `${val} años`
                : String(val);
              return (
                <div className="indicator-national-card" key={field}>
                  <span>{indicatorLabels[field]}</span>
                  <strong style={{
                    color: field === "unemploymentRate" && val > 15 ? "var(--rojo)"
                      : field === "povertyRiskRate" && val > 25 ? "var(--rojo)"
                      : undefined,
                  }}>{fmt}</strong>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── Public contracts in territory ── */}
      {territoryContracts.length > 0 ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Contratación pública"
            title={`${territoryContracts.length} contratos vinculados`}
            description="Contratos públicos con impacto en este territorio."
          />
          <div className="vote-list">
            {territoryContracts.map((ct) => {
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
                    </div>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>
                      {ct.amountM >= 1000 ? `${(ct.amountM / 1000).toFixed(1)} Md€` : `${ct.amountM.toFixed(1)} M€`}
                    </strong>
                  </div>
                  <h3 style={{ fontSize: "0.92rem" }}>{ct.title}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>{ct.summary}</p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Señales"
            title="Señales prioritarias"
            description="Cruce de señal oficial, mediática, parlamentaria y presupuestaria para este territorio."
          />
          <div className="signal-list">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} territoryLabel={territory.name} />
            ))}
          </div>
        </div>

        <div className="side-stack">
          {budget ? (
            <div className="panel section-panel">
              <SectionHeading
                eyebrow="Presupuesto"
                title="Snapshot presupuestario"
                description="Programa y ejecución territorial más relevantes del radar actual."
              />
              <BudgetCard snapshot={budget} territoryLabel={territory.name} />
            </div>
          ) : null}

          <div className="panel section-panel">
            <SectionHeading
              eyebrow="BOE"
              title="Boletines con impacto"
              description="Elementos del BOE que afectan a este territorio."
            />
            <div className="compact-list">
              {boeItems.map((item) => (
                <article className="compact-card" key={item.id}>
                  <span className="tag tag-bright">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <a href={item.documentUrl} rel="noreferrer" target="_blank">
                    Fuente oficial
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Actores"
            title="Partidos en el territorio"
            description="Actores con mayor relevancia en este nodo territorial."
          />
          <div className="party-list">
            {parties.map((party) => {
              const color = partyColors[party.slug] ?? "var(--rojo)";
              const logo = partyLogos[party.slug];
              return (
                <Link className="party-card" href={`/parties/${party.slug}`} key={party.id} style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="party-header">
                    {logo ? (
                      <img src={proxyImg(logo)} alt={party.acronym} width={28} loading="lazy" style={{ objectFit: "contain" }} />
                    ) : (
                      <strong>{party.acronym}</strong>
                    )}
                    <span>{party.scopeType === "national" ? "Nacional" : "Regional"}</span>
                  </div>
                  <h3>{party.shortName}</h3>
                  <p>{party.positioning}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Personas"
            title="Políticos conectados"
            description="Fichas personales relacionadas con este territorio."
          />
          <div className="profile-grid">
            {politicians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                partySlug={politician.currentPartySlug}
                partyLabel={partyLabels[politician.currentPartySlug] ?? getPartyBySlug(politician.currentPartySlug)?.shortName ?? politician.currentPartySlug}
                territoryLabel={territory.name}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Parlamento"
          title="Iniciativas relacionadas"
          description="Piezas parlamentarias relevantes para el territorio."
        />
        <div className="compact-list compact-list-wide">
          {initiatives.map((initiative) => (
            <article className="compact-card" key={initiative.id}>
              <div className="signal-meta">
                <span className="tag tag-bright">{initiative.initiativeType}</span>
                <span>{initiative.dossierNumber}</span>
              </div>
              <h3>{initiative.title}</h3>
              <p>{initiative.status}</p>
              <a href={initiative.sourceUrl} rel="noreferrer" target="_blank">
                Ver open data del Congreso
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
