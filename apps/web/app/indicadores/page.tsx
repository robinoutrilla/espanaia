/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { territories } from "@espanaia/seed-data";
import { T } from "../../components/t";
import { SiteHeader } from "../../components/site-header";
import { SectionHeading } from "../../components/section-heading";
import { territoryShields, proxyImg } from "../../lib/visual-data";
import {
  nationalIndicators,
  ccaaIndicators,
  indicatorLabels,
  indicatorUnits,
  type TerritoryIndicators,
} from "../../lib/ine-data";

const keyFields: (keyof TerritoryIndicators)[] = [
  "population", "gdpPerCapita", "gdpGrowthPct", "unemploymentRate",
  "youthUnemploymentRate", "averageSalary", "povertyRiskRate", "lifeExpectancy",
  "cpiAnnual", "housingPriceIndex", "rentAvgMonthly", "medianAge",
];

const formatValue = (field: keyof TerritoryIndicators, value: number) => {
  if (field === "population") return value.toLocaleString("es-ES");
  if (field === "gdpPerCapita" || field === "averageSalary" || field === "rentAvgMonthly") return `${value.toLocaleString("es-ES")} €`;
  if (["gdpGrowthPct", "unemploymentRate", "youthUnemploymentRate", "povertyRiskRate", "cpiAnnual", "activePopulationPct", "populationChange"].includes(field)) return `${value}%`;
  if (field === "lifeExpectancy" || field === "medianAge") return `${value} años`;
  return String(value);
};

export default function IndicadoresPage() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="indicadores" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow"><T k="indicadores.eyebrow" /></span>
            <h1 className="detail-title"><T k="indicadores.title" /></h1>
            <p className="detail-description">
              <T k="indicadores.description" />
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{nationalIndicators.population.toLocaleString("es-ES")}</strong><span>Habitantes</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{nationalIndicators.gdpPerCapita.toLocaleString("es-ES")} €</strong><span>PIB per cápita</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{nationalIndicators.unemploymentRate}%</strong><span>Tasa de desempleo</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── National overview ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow="España"
          title="Indicadores nacionales 2026"
          description="Resumen macroeconómico y social del conjunto del Estado."
        />
        <div className="indicator-national-grid">
          {keyFields.map((field) => (
            <div className="indicator-national-card" key={field}>
              <span>{indicatorLabels[field]}</span>
              <strong>{formatValue(field, nationalIndicators[field] as number)}</strong>
              {indicatorUnits[field] && !["€", "%", "años", "‰", "€/mes", "M€"].some(u => formatValue(field, 0).includes(u)) ? (
                <span className="indicator-unit">{indicatorUnits[field]}</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ── CCAA comparison table ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow="Comparación territorial"
          title="Indicadores por Comunidad Autónoma"
          description="Ranking de las CCAA en indicadores clave. Fuente: INE, EPA, Contabilidad Regional."
        />
        <div className="indicator-table-wrap">
          <table className="indicator-table">
            <thead>
              <tr>
                <th><T k="indicadores.thCCAA" /></th>
                <th><T k="indicadores.thPopulation" /></th>
                <th><T k="indicadores.thGdpCap" /></th>
                <th><T k="indicadores.thGdpGrowth" /></th>
                <th><T k="indicadores.thUnemployment" /></th>
                <th><T k="indicadores.thYouthUnemp" /></th>
                <th><T k="indicadores.thSalary" /></th>
                <th><T k="indicadores.thPoverty" /></th>
                <th><T k="indicadores.thRent" /></th>
              </tr>
            </thead>
            <tbody>
              {[...ccaaIndicators].sort((a, b) => b.gdpPerCapita - a.gdpPerCapita).map((ind) => {
                const terr = territories.find(t => t.slug === ind.territorySlug);
                if (!terr) return null;
                const shield = territoryShields[terr.slug];
                return (
                  <tr key={ind.territorySlug}>
                    <td>
                      <Link href={`/territories/${terr.slug}`} className="indicator-territory-cell">
                        {shield ? <img src={proxyImg(shield)} alt="" width={16} loading="lazy" /> : null}
                        <span>{terr.shortCode}</span>
                      </Link>
                    </td>
                    <td>{(ind.population / 1000000).toFixed(2)}M</td>
                    <td><strong>{ind.gdpPerCapita.toLocaleString("es-ES")}€</strong></td>
                    <td style={{ color: ind.gdpGrowthPct >= 2.4 ? "var(--verde)" : ind.gdpGrowthPct < 1.5 ? "var(--rojo)" : "var(--ink)" }}>{ind.gdpGrowthPct}%</td>
                    <td style={{ color: ind.unemploymentRate > 15 ? "var(--rojo)" : ind.unemploymentRate < 9 ? "var(--verde)" : "var(--ink)" }}>{ind.unemploymentRate}%</td>
                    <td style={{ color: ind.youthUnemploymentRate > 30 ? "var(--rojo)" : "var(--ink)" }}>{ind.youthUnemploymentRate}%</td>
                    <td>{ind.averageSalary.toLocaleString("es-ES")}€</td>
                    <td style={{ color: ind.povertyRiskRate > 25 ? "var(--rojo)" : ind.povertyRiskRate < 15 ? "var(--verde)" : "var(--ink)" }}>{ind.povertyRiskRate}%</td>
                    <td>{ind.rentAvgMonthly}€</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Territory cards ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <SectionHeading
          eyebrow="Fichas territoriales"
          title="Perfil socioeconómico por CCAA"
          description="Indicadores clave de cada comunidad autónoma con contexto visual."
        />
        <div className="ccaa-fiscal-grid">
          {ccaaIndicators.map((ind) => {
            const terr = territories.find(t => t.slug === ind.territorySlug);
            if (!terr) return null;
            const shield = territoryShields[terr.slug];
            return (
              <Link className="ccaa-fiscal-card" href={`/territories/${terr.slug}`} key={ind.territorySlug}>
                <div className="ccaa-fiscal-header">
                  <div className="territory-shield-row">
                    {shield ? <img className="territory-shield" src={proxyImg(shield)} alt={terr.name} width={24} loading="lazy" /> : null}
                    <h3>{terr.name}</h3>
                  </div>
                  <span className="micro-tag">{terr.shortCode}</span>
                </div>
                <div className="ccaa-fiscal-stats">
                  <div>
                    <strong>{ind.gdpPerCapita.toLocaleString("es-ES")}€</strong>
                    <span>PIB/CÁP.</span>
                  </div>
                  <div>
                    <strong style={{ color: ind.unemploymentRate > 15 ? "var(--rojo)" : "var(--verde)" }}>{ind.unemploymentRate}%</strong>
                    <span>PARO</span>
                  </div>
                  <div>
                    <strong>{ind.rentAvgMonthly}€</strong>
                    <span>ALQUILER</span>
                  </div>
                </div>
                <div className="ccaa-fiscal-footer">
                  <span>Pobreza: {ind.povertyRiskRate}%</span>
                  <span>Salario: {ind.averageSalary.toLocaleString("es-ES")}€</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
