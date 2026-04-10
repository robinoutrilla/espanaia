/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getBoeItemsForParty,
  getInitiativesForParty,
  getPartyBySlug,
  getPartyPoliticians,
  getSignalsForParty,
  getTerritoryBySlug,
} from "@espanaia/seed-data";
import { notFound } from "next/navigation";
import { PoliticianCard } from "../../../components/politician-card";
import { SectionHeading } from "../../../components/section-heading";
import { SignalCard } from "../../../components/signal-card";
import { SiteHeader } from "../../../components/site-header";
import { partyColors, partyLogos, proxyImg } from "../../../lib/visual-data";
import {
  getPartyPresence,
  getRoleLabel,
  CONGRESS_TOTAL_SEATS,
  SENATE_TOTAL_SEATS,
} from "../../../lib/parliamentary-data";
import { getPartyFinance } from "../../../lib/finance-data";

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const party = getPartyBySlug(slug);

  if (!party) {
    notFound();
  }

  const signals = getSignalsForParty(slug);
  const politicians = getPartyPoliticians(slug);
  const boeItems = getBoeItemsForParty(slug);
  const initiatives = getInitiativesForParty(slug);
  const territories = (party.highlightTerritories ?? [])
    .map((territorySlug) => getTerritoryBySlug(territorySlug))
    .filter((territory): territory is NonNullable<typeof territory> => Boolean(territory));

  const presence = getPartyPresence(slug);
  const partyFinance = getPartyFinance(slug);
  const color = partyColors[slug] ?? "var(--rojo)";
  const logo = partyLogos[slug];

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="parties" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <Link className="back-link" href="/parties">
              Volver al mapa de partidos
            </Link>
            <span className="eyebrow">Ficha de partido</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {logo ? (
                <img src={proxyImg(logo)} alt={party.acronym} width={48} loading="lazy" style={{ objectFit: "contain" }} />
              ) : (
                <span className="party-logo-badge" style={{ background: `${color}22`, color, fontSize: "1.2rem", padding: "8px 16px" }}>{party.acronym}</span>
              )}
              <h1 className="detail-title">{party.shortName}</h1>
            </div>
            <p className="detail-description">{party.positioning}</p>
            <div className="chip-row">
              <span className="micro-tag">{party.acronym}</span>
              <span className="micro-tag">{party.scopeType === "national" ? "Nacional" : "Regional"}</span>
              {party.ideology ? <span className="micro-tag">{party.ideology}</span> : null}
            </div>
          </div>

          <aside className="detail-aside">
            <div className="stat-card">
              <span>Políticos enlazados</span>
              <strong>{politicians.length}</strong>
            </div>
            <div className="stat-card">
              <span>Territorios clave</span>
              <strong>{territories.length}</strong>
            </div>
            <div className="stat-card">
              <span>Iniciativas</span>
              <strong>{initiatives.length}</strong>
            </div>
            {presence.congress ? (
              <div className="stat-card">
                <span>Congreso</span>
                <strong>{presence.congress.seats} / {CONGRESS_TOTAL_SEATS}</strong>
              </div>
            ) : null}
            {presence.senate ? (
              <div className="stat-card">
                <span>Senado</span>
                <strong>{presence.senate.seats} / {SENATE_TOTAL_SEATS}</strong>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {/* ── National representation ── */}
      {(presence.congress || presence.senate) ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Representación nacional"
            title="Presencia en las Cortes Generales"
            description="Escaños y porcentaje de representación en Congreso y Senado."
          />
          <div className="representation-cards">
            {presence.congress ? (
              <div className="representation-chamber-card">
                <h3>Congreso de los Diputados</h3>
                <div className="representation-bar-wrap representation-bar-lg">
                  <div className="representation-bar" style={{ width: `${presence.congress.representationPct}%`, background: color }} />
                  <span className="representation-label">{presence.congress.representationPct}% · {presence.congress.seats} escaños</span>
                </div>
                {presence.congress.leadership.length > 0 ? (
                  <div className="parl-group-hierarchy">
                    {presence.congress.leadership.map((member, i) => (
                      <div className="hierarchy-member" key={i}>
                        <span className="hierarchy-role" style={{ color }}>{getRoleLabel(member.role)}</span>
                        {member.politicianSlug ? (
                          <Link className="hierarchy-name hierarchy-link" href={`/politicians/${member.politicianSlug}`}>
                            {member.name}
                          </Link>
                        ) : (
                          <span className="hierarchy-name">{member.name}</span>
                        )}
                        {member.constituency ? <span className="hierarchy-constituency">{member.constituency}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {presence.senate ? (
              <div className="representation-chamber-card">
                <h3>Senado</h3>
                <div className="representation-bar-wrap representation-bar-lg">
                  <div className="representation-bar" style={{ width: `${presence.senate.representationPct}%`, background: color }} />
                  <span className="representation-label">{presence.senate.representationPct}% · {presence.senate.seats} escaños</span>
                </div>
                {presence.senate.leadership.length > 0 ? (
                  <div className="parl-group-hierarchy">
                    {presence.senate.leadership.map((member, i) => (
                      <div className="hierarchy-member" key={i}>
                        <span className="hierarchy-role" style={{ color }}>{getRoleLabel(member.role)}</span>
                        <span className="hierarchy-name">{member.name}</span>
                        {member.constituency ? <span className="hierarchy-constituency">{member.constituency}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── CCAA presence ── */}
      {presence.ccaa.length > 0 ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Presencia autonómica"
            title={`${presence.ccaa.length} parlamentos autonómicos`}
            description={`Gobierna en ${presence.ccaa.filter(c => c.isGoverning).length} comunidades. Representación territorial completa.`}
          />
          <div className="chamber-groups">
            {presence.ccaa.map((ccaa) => (
              <Link className="parl-group-card parl-group-compact parl-group-link" href={`/territories/${ccaa.territorySlug}`} key={ccaa.territorySlug}>
                <div className="parl-group-top" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="parl-group-identity">
                    <div>
                      <h3>{ccaa.parliamentName}</h3>
                      {ccaa.isGoverning ? <span className="tag tag-up" style={{ fontSize: "0.6rem" }}>Gobierno</span> : null}
                    </div>
                  </div>
                  <div className="parl-group-stats">
                    <strong style={{ color }}>{ccaa.group.seats}</strong>
                    <span>/ {ccaa.totalSeats}</span>
                  </div>
                </div>
                <div className="representation-bar-wrap">
                  <div className="representation-bar" style={{ width: `${ccaa.group.representationPct}%`, background: color }} />
                  <span className="representation-label">{ccaa.group.representationPct}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Party financing ── */}
      {partyFinance ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Financiación"
            title="Cuentas públicas del partido"
            description={`Datos del ejercicio ${partyFinance.year}. Fuente: Tribunal de Cuentas.`}
          />
          <div className="party-finance-detail">
            <div className="party-finance-detail-grid">
              <div className="party-finance-detail-card">
                <span>Subvención estatal</span>
                <strong>{partyFinance.stateSubsidyM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Subvención electoral</span>
                <strong>{partyFinance.electoralSubsidyM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Grupos parlamentarios</span>
                <strong>{partyFinance.parliamentaryGroupM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card" style={{ background: `${color}08` }}>
                <span style={{ fontWeight: 600 }}>Total público</span>
                <strong style={{ color }}>{partyFinance.totalPublicM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Ingresos declarados</span>
                <strong>{partyFinance.declaredIncomeM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Gastos declarados</span>
                <strong>{partyFinance.declaredExpensesM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Deuda</span>
                <strong style={{ color: partyFinance.debtM > 10 ? "var(--rojo)" : "var(--ink)" }}>{partyFinance.debtM.toFixed(1)} M€</strong>
              </div>
              <div className="party-finance-detail-card">
                <span>Cuotas de afiliados</span>
                <strong>{partyFinance.membershipFeesM.toFixed(1)} M€</strong>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="representation-bar-wrap representation-bar-lg">
                <div className="representation-bar" style={{ width: `${Math.round((partyFinance.totalPublicM / partyFinance.declaredIncomeM) * 100)}%`, background: color }} />
                <span className="representation-label">
                  {Math.round((partyFinance.totalPublicM / partyFinance.declaredIncomeM) * 100)}% de los ingresos provienen de fondos públicos
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Señales"
            title="Señales donde aparece el partido"
            description="Cruce de debate mediático, foco territorial, BOE y Parlamento."
          />
          <div className="signal-list">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} territoryLabel={signal.territorySlug} />
            ))}
          </div>
        </div>

        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Territorios"
            title="Territorios clave"
            description="Espacios donde el partido tiene más peso estratégico."
          />
          <div className="compact-list">
            {territories.map((territory) => (
              <Link className="compact-card" href={`/territories/${territory.slug}`} key={territory.id}>
                <span className="tag tag-bright">{territory.shortCode}</span>
                <h3>{territory.name}</h3>
                <p>{territory.strategicFocus}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Personas"
            title="Figuras conectadas"
            description="Fichas personales actualmente relacionadas con este partido."
          />
          <div className="profile-grid">
            {politicians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                partySlug={party.slug}
                partyLabel={party.shortName}
                territoryLabel={getTerritoryBySlug(politician.territorySlug)?.name ?? politician.territorySlug}
              />
            ))}
          </div>
        </div>

        <div className="panel section-panel">
          <SectionHeading
            eyebrow="Oficial"
            title="BOE e iniciativas parlamentarias"
            description="Normativa y actividad legislativa vinculada al partido."
          />
          <div className="compact-list compact-list-wide">
            {boeItems.map((item) => (
              <article className="compact-card" key={item.id}>
                <span className="tag tag-bright">BOE</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href={item.documentUrl} rel="noreferrer" target="_blank">
                  Ver fuente oficial
                </a>
              </article>
            ))}
            {initiatives.map((initiative) => (
              <article className="compact-card" key={initiative.id}>
                <span className="tag tag-bright">Congreso</span>
                <h3>{initiative.title}</h3>
                <p>{initiative.status}</p>
                <a href={initiative.sourceUrl} rel="noreferrer" target="_blank">
                  Ver open data
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
