/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { territories } from "@espanaia/seed-data";
import { SectionHeading } from "../../components/section-heading";
import { SiteHeader } from "../../components/site-header";
import { territoryShields, proxyImg } from "../../lib/visual-data";

const sortedTerritories = [...territories].sort((left, right) => right.pulseScore - left.pulseScore);

export default function TerritoriesPage() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="territories" />

      <section className="panel detail-hero">
        <div className="detail-copy">
          <span className="eyebrow">Atlas territorial</span>
          <h1 className="detail-title">Territorios monitorizados</h1>
          <p className="detail-description">
            Estado, 17 comunidades autónomas y 2 ciudades autónomas ya tienen una ficha propia con señales, presupuesto y
            actores enlazados.
          </p>
        </div>
      </section>

      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Atlas"
          title="Malla territorial completa"
          description="Ordenada por pulso político para priorizar exploración y análisis rápido."
        />
        <div className="territory-grid territory-grid-full">
          {sortedTerritories.map((territory) => {
            const shieldUrl = territoryShields[territory.slug];
            return (
              <Link
                className="territory-card territory-link-card"
                href={`/territories/${territory.slug}`}
                key={territory.id}
              >
                <div className="territory-header">
                  <div className="territory-shield-row">
                    {shieldUrl ? (
                      <img
                        className="territory-shield"
                        src={proxyImg(shieldUrl)}
                        alt={`Escudo de ${territory.name}`}
                        width={28}
                        loading="lazy"
                      />
                    ) : (
                      <span className="territory-shield-fallback">{territory.shortCode}</span>
                    )}
                    <span>{territory.shortCode}</span>
                  </div>
                  <strong className="territory-pulse">{territory.pulseScore}</strong>
                </div>
                <h3>{territory.name}</h3>
                <p>{territory.strategicFocus}</p>
                <div className="territory-footer">
                  <span>{territory.seat}</span>
                  <span>{territory.monitoredInstitutions.length} nodos</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
