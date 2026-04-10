/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPartyBySlug, getTerritoryBySlug, parties, politicians, congressDeputies, parliamentaryGroups } from "@espanaia/seed-data";
import { PoliticianCard } from "../../components/politician-card";
import { SectionHeading } from "../../components/section-heading";
import { SiteHeader } from "../../components/site-header";
import { DeputiesDirectory } from "../../components/deputies-directory";
import { getPoliticalCensusSnapshot } from "../../lib/political-census";
import { partyColors, partyLogos, proxyImg } from "../../lib/visual-data";
import {
  congressGroups,
  senateGroups,
  CONGRESS_TOTAL_SEATS,
  SENATE_TOTAL_SEATS,
  getRoleLabel,
} from "../../lib/parliamentary-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PoliticiansPage() {
  const politicalCensus = await getPoliticalCensusSnapshot();
  const officialProfiles = politicalCensus?.items ?? [];
  const censusLayers = politicalCensus?.layers ?? [];
  const liveLayers = politicalCensus?.layers.filter((layer) => layer.status === "live") ?? [];
  const isOfficialDirectory = officialProfiles.length > 0;
  const monitoredProfiles = isOfficialDirectory ? officialProfiles.length : politicians.length;

  /* Group seed politicians by party */
  const partyGroups = new Map<string, typeof politicians>();
  for (const pol of politicians) {
    const group = partyGroups.get(pol.currentPartySlug) ?? [];
    group.push(pol);
    partyGroups.set(pol.currentPartySlug, group);
  }
  const sortedPartyEntries = [...partyGroups.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="politicians" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">Censo parlamentario</span>
            <h1 className="detail-title">Representación política de España</h1>
            <p className="detail-description">
              Congreso de los Diputados, Senado y parlamentos autonómicos: composición por grupos
              parlamentarios, portavoces y estructura orgánica oficial.
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{CONGRESS_TOTAL_SEATS}</strong><span>Congreso</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{SENATE_TOTAL_SEATS}</strong><span>Senado</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{monitoredProfiles}</strong><span>Perfiles</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Congress groups ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Congreso de los Diputados"
          title={`${CONGRESS_TOTAL_SEATS} escaños · ${congressGroups.length} grupos parlamentarios`}
          description="Composición oficial de la XV Legislatura con portavoces y estructura de cada grupo."
        />
        <div className="chamber-groups">
          {congressGroups.map((group) => {
            const color = partyColors[group.partySlug] ?? "var(--rojo)";
            const logo = partyLogos[group.partySlug];
            const party = getPartyBySlug(group.partySlug);
            return (
              <div className="parl-group-card" key={group.id}>
                <div className="parl-group-top" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="parl-group-identity">
                    {logo ? (
                      <img className="parl-group-logo" src={proxyImg(logo)} alt={group.shortName} width={32} loading="lazy" />
                    ) : (
                      <span className="party-logo-badge" style={{ background: `${color}22`, color }}>{party?.acronym ?? group.shortName}</span>
                    )}
                    <div>
                      <h3>{group.shortName}</h3>
                      <p className="parl-group-fullname">{group.name}</p>
                    </div>
                  </div>
                  <div className="parl-group-stats">
                    <strong style={{ color }}>{group.seats}</strong>
                    <span>escaños</span>
                  </div>
                </div>

                {/* Representation bar */}
                <div className="representation-bar-wrap">
                  <div className="representation-bar" style={{ width: `${group.representationPct}%`, background: color }} />
                  <span className="representation-label">{group.representationPct}%</span>
                </div>

                {/* Leadership hierarchy */}
                <div className="parl-group-hierarchy">
                  {group.leadership.map((member, i) => (
                    <div className="hierarchy-member" key={i}>
                      <span className="hierarchy-role" style={{ color }}>{getRoleLabel(member.role)}</span>
                      {member.politicianSlug ? (
                        <Link className="hierarchy-name hierarchy-link" href={`/politicians/${member.politicianSlug}`}>
                          {member.name}
                        </Link>
                      ) : (
                        <span className="hierarchy-name">{member.name}</span>
                      )}
                      {member.constituency ? (
                        <span className="hierarchy-constituency">{member.constituency}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Senate groups ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Senado"
          title={`${SENATE_TOTAL_SEATS} escaños · ${senateGroups.length} grupos parlamentarios`}
          description="Cámara alta: 208 senadores electos y 58 designados por parlamentos autonómicos."
        />
        <div className="chamber-groups">
          {senateGroups.map((group) => {
            const color = partyColors[group.partySlug] ?? "var(--rojo)";
            const logo = partyLogos[group.partySlug];
            const party = getPartyBySlug(group.partySlug);
            return (
              <div className="parl-group-card" key={group.id}>
                <div className="parl-group-top" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="parl-group-identity">
                    {logo ? (
                      <img className="parl-group-logo" src={proxyImg(logo)} alt={group.shortName} width={32} loading="lazy" />
                    ) : (
                      <span className="party-logo-badge" style={{ background: `${color}22`, color }}>{party?.acronym ?? group.shortName}</span>
                    )}
                    <div>
                      <h3>{group.shortName}</h3>
                      <p className="parl-group-fullname">{group.name}</p>
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
                <div className="parl-group-hierarchy">
                  {group.leadership.map((member, i) => (
                    <div className="hierarchy-member" key={i}>
                      <span className="hierarchy-role" style={{ color }}>{getRoleLabel(member.role)}</span>
                      <span className="hierarchy-name">{member.name}</span>
                      {member.constituency ? (
                        <span className="hierarchy-constituency">{member.constituency}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Full directory: 350 deputies ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Directorio completo"
          title={`${congressDeputies.length} diputados · ${parliamentaryGroups.length} grupos`}
          description="Todos los diputados de la XV Legislatura, agrupados por grupo parlamentario. Fuente: congreso.es/opendata."
        />
        <DeputiesDirectory
          deputies={congressDeputies}
          groups={parliamentaryGroups}
          partyColors={partyColors}
        />
      </section>

      {/* ── Seed profiles grouped by party ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Perfiles enlazados"
          title={`${monitoredProfiles} fichas activas`}
          description="Cargos públicos confirmados desde open data oficial, agrupados por partido."
        />
        {isOfficialDirectory ? (
          <div className="profile-grid profile-grid-full">
            {officialProfiles.map((profile) => (
              <PoliticianCard
                key={profile.id}
                politician={profile}
                partySlug={profile.currentPartyCode?.toLowerCase() ?? ""}
                partyLabel={profile.currentPartyCode ?? profile.currentPartyName}
                territoryLabel={profile.territoryLabel}
              />
            ))}
          </div>
        ) : (
          sortedPartyEntries.map(([partySlug, members]) => {
            const party = getPartyBySlug(partySlug);
            const color = partyColors[partySlug] ?? "var(--rojo)";
            return (
              <div key={partySlug} style={{ marginBottom: "var(--space-lg)" }}>
                <div className="party-group-header" style={{ borderLeft: `4px solid ${color}` }}>
                  <span className="party-group-badge" style={{ background: `${color}22`, color }}>{party?.acronym ?? partySlug.toUpperCase()}</span>
                  <h2 className="party-group-name">{party?.shortName ?? partySlug}</h2>
                  <span className="party-group-count">{members.length} {members.length === 1 ? "perfil" : "perfiles"}</span>
                </div>
                <div className="profile-grid profile-grid-full">
                  {members.map((politician) => (
                    <PoliticianCard
                      key={politician.id}
                      politician={politician}
                      partySlug={partySlug}
                      partyLabel={party?.shortName ?? partySlug}
                      territoryLabel={getTerritoryBySlug(politician.territorySlug)?.name ?? politician.territorySlug}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {isOfficialDirectory ? (
        <section className="panel section-panel">
          <SectionHeading
            eyebrow="Ingestión por capas"
            title="Cobertura del censo"
            description="Congreso y Senado en vivo, con expansión prevista hacia parlamentos autonómicos y administración local."
          />
          <div className="compact-list compact-list-wide">
            {censusLayers.map((layer) => (
              <article className="compact-card" key={layer.id}>
                <span className="tag tag-bright">{layer.status}</span>
                <h3>{layer.name}</h3>
                <p>{layer.note}</p>
                <span>{layer.recordCount} registros · {layer.scope}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
