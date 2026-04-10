/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { parties } from "@espanaia/seed-data";
import { SectionHeading } from "../../components/section-heading";
import { SiteHeader } from "../../components/site-header";
import { partyColors, partyLogos, getPartyInitials, proxyImg } from "../../lib/visual-data";
import { getNationalRepresentation, CONGRESS_TOTAL_SEATS, SENATE_TOTAL_SEATS } from "../../lib/parliamentary-data";

const nationalRep = getNationalRepresentation();

export default function PartiesPage() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="parties" />

      <section className="panel detail-hero">
        <div className="detail-copy">
          <span className="eyebrow">Mapa de actores</span>
          <h1 className="detail-title">Partidos políticos</h1>
          <p className="detail-description">
            Fichas conectadas con políticos, territorios, iniciativas parlamentarias y señales.
            Representación en Congreso ({CONGRESS_TOTAL_SEATS} escaños), Senado ({SENATE_TOTAL_SEATS} escaños) y parlamentos autonómicos.
          </p>
        </div>
      </section>

      {/* ── National representation overview ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Representación"
          title="Peso parlamentario nacional"
          description="Escaños en Congreso y Senado combinados, y presencia en gobiernos autonómicos."
        />
        <div className="chamber-groups">
          {nationalRep.map((rep) => {
            const color = partyColors[rep.partySlug] ?? "var(--ink-muted)";
            const logo = partyLogos[rep.partySlug];
            const party = parties.find(p => p.slug === rep.partySlug);
            return (
              <Link className="parl-group-card parl-group-compact parl-group-link" href={`/parties/${rep.partySlug}`} key={rep.partySlug}>
                <div className="parl-group-top" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="parl-group-identity">
                    {logo ? (
                      <img className="parl-group-logo" src={proxyImg(logo)} alt={party?.acronym ?? rep.partySlug} width={28} loading="lazy" />
                    ) : (
                      <span className="party-logo-badge" style={{ background: `${color}22`, color, fontSize: "0.72rem", padding: "2px 8px" }}>{party?.acronym ?? rep.partySlug.toUpperCase()}</span>
                    )}
                    <div>
                      <h3>{party?.shortName ?? rep.partySlug}</h3>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
                        {rep.ccaaGoverning > 0 ? `Gobierna en ${rep.ccaaGoverning} CCAA` : `Presente en ${rep.ccaaPresence} CCAA`}
                      </span>
                    </div>
                  </div>
                  <div className="parl-group-stats">
                    <strong style={{ color }}>{rep.totalSeats}</strong>
                    <span>escaños</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${rep.congressPct}%`, background: color }} />
                    <span className="representation-label">Congreso {rep.congressPct}%</span>
                  </div>
                  <div className="representation-bar-wrap">
                    <div className="representation-bar" style={{ width: `${rep.senatePct}%`, background: color }} />
                    <span className="representation-label">Senado {rep.senatePct}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Full party cards ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Actores"
          title="Partidos monitorizados"
          description="Fichas completas con ideología, posicionamiento y territorios clave."
        />
        <div className="party-list party-list-full">
          {parties.map((party) => {
            const color = partyColors[party.slug] ?? "var(--rojo)";
            const logo = partyLogos[party.slug];
            return (
              <Link
                className="party-card"
                href={`/parties/${party.slug}`}
                key={party.id}
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="party-header">
                  {logo ? (
                    <img src={proxyImg(logo)} alt={party.acronym} width={32} loading="lazy" style={{ objectFit: "contain" }} />
                  ) : (
                    <span className="party-logo-badge" style={{ background: `${color}22`, color }}>
                      {getPartyInitials(party.acronym)}
                    </span>
                  )}
                  <span className="tag tag-scope">{party.scopeType === "national" ? "Nacional" : "Regional"}</span>
                </div>
                <h3>{party.shortName}</h3>
                <p className="party-ideology">{party.ideology}</p>
                <p>{party.positioning}</p>
                <div className="party-footer">
                  {(party.highlightTerritories ?? []).slice(0, 3).map((t) => (
                    <span className="micro-tag" key={t}>{t}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
