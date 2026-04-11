import Link from "next/link";
import { officialConnectors, territorialOfficialSources, territories, getPoliticalCensusSummary } from "@espanaia/seed-data";
import type { TerritorialSourceType, ConnectorArea } from "@espanaia/shared-types";
import { SectionHeading } from "../../components/section-heading";
import { SiteHeader } from "../../components/site-header";
import {
  dataSourceStatuses,
  ingestionStats,
  stateLabels,
  stateColors,
  groupLabels,
  RAG_BY_GROUP,
  RAG_LABELS,
  type IngestionState,
} from "../../lib/ingestion-status";
import { getRssSources } from "../../lib/rss-trending";

const censusSummary = getPoliticalCensusSummary();

/* ── helpers ────────────────────────────────────────────────────────────── */

const autonomousCommunities = territories
  .filter((t) => t.kind === "autonomous-community")
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

const sourceTypeMeta: Record<
  TerritorialSourceType,
  { label: string; description: string; tagClassName: string }
> = {
  government: {
    label: "Gobierno",
    description: "Portales institucionales de presidencia, consejerías y servicios del ejecutivo autonómico.",
    tagClassName: "tag-bright",
  },
  parliament: {
    label: "Parlamento",
    description: "Cámaras legislativas con actividad, composición, publicaciones y tramitación parlamentaria.",
    tagClassName: "tag-up",
  },
  gazette: {
    label: "Boletín oficial",
    description: "Diarios oficiales con normativa, nombramientos, anuncios y disposiciones autonómicas.",
    tagClassName: "tag-flat",
  },
};

const sourcesByTerritory = Object.fromEntries(
  autonomousCommunities.map((t) => [
    t.slug,
    territorialOfficialSources.filter((s) => s.territorySlug === t.slug),
  ]),
);

function getHostLabel(url: string) {
  try { return new URL(url).host.replace(/^www\./, ""); } catch { return url; }
}

/* ── connector grouping ─────────────────────────────────────────────────── */

interface ConnectorGroup {
  id: string;
  label: string;
  icon: string;
  description: string;
  tagClass: string;
  areas: ConnectorArea[];
}

const connectorGroups: ConnectorGroup[] = [
  {
    id: "estado",
    label: "Estado — Poder Legislativo y Ejecutivo",
    icon: "🏛️",
    description: "Congreso, Senado, BOE, BORME, Gobierno y Portal de Transparencia.",
    tagClass: "tag-bright",
    areas: ["boe", "borme", "congreso", "senado"],
  },
  {
    id: "hacienda",
    label: "Hacienda y Fiscalidad",
    icon: "💰",
    description: "AEAT, IGAE, AIReF, CDTI y Hacienda — recaudación, ejecución presupuestaria, I+D e innovación.",
    tagClass: "tag-flat",
    areas: ["hacienda"],
  },
  {
    id: "empleo",
    label: "Empleo y Seguridad Social",
    icon: "👷",
    description: "SEPE y Seguridad Social — paro registrado, afiliación, prestaciones y autónomos.",
    tagClass: "tag-up",
    areas: ["empleo"],
  },
  {
    id: "regulador",
    label: "Reguladores y Justicia",
    icon: "⚖️",
    description: "CNMC, Tribunal Constitucional — competencia, jurisprudencia y mercados regulados.",
    tagClass: "tag-down",
    areas: ["regulador", "justicia", "financiero"],
  },
  {
    id: "europa",
    label: "Unión Europea",
    icon: "🇪🇺",
    description: "Eurostat, EUR-Lex, Parlamento Europeo, BEI, fondos estructurales y NextGenerationEU.",
    tagClass: "tag-eu",
    areas: ["eu"],
  },
  {
    id: "local",
    label: "Administración Local",
    icon: "🏘️",
    description: "datos.gob.es, INE, Registro de Entidades Locales, datos abiertos de Madrid y Barcelona, FEMP.",
    tagClass: "tag-local",
    areas: ["local"],
  },
];

/* ── Ministerios: sourced from ingestion-status, not officialConnectors ─── */
const ministerioSources = dataSourceStatuses.filter((s) => s.group === "ministerios");

function getConnectorsForGroup(group: ConnectorGroup) {
  return officialConnectors.filter((c) => group.areas.includes(c.area as ConnectorArea));
}

/* ── stats ──────────────────────────────────────────────────────────────── */

const totalConnectors = officialConnectors.length;
const totalTerritorialSources = territorialOfficialSources.length;
const totalMinisterios = ministerioSources.length;
const totalMediaFeeds = getRssSources().length;
const totalSources = totalConnectors + totalTerritorialSources + totalMinisterios + totalMediaFeeds;
const govLevels = connectorGroups.length + 2; // +1 for CCAA, +1 for Ministerios

export default function SourcesPage() {
  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="sources" />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">Registro completo de fuentes oficiales</span>
            <h1 className="detail-title">
              Todas las fuentes públicas que alimentan IAÑ
            </h1>
            <p className="detail-description">
              Directorio de {totalSources} fuentes oficiales organizadas por nivel de gobierno:
              Estado, Unión Europea, comunidades autónomas, diputaciones y ayuntamientos.
              Cada fuente enlaza al portal público original para garantizar trazabilidad total.
            </p>
          </div>

          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{totalConnectors}</strong><span>Conectores estatales + EU</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{totalMinisterios}</strong><span>Ministerios</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{autonomousCommunities.length}</strong><span>CCAA × 3 fuentes</span></div>
              <div className="kpi-cell"><strong style={{ color: "#7c3aed" }}>{totalMediaFeeds}</strong><span>Medios RSS</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--oro)" }}>{censusSummary.totalOfficials.toLocaleString("es-ES")}</strong><span>Cargos en censo</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Ingestion Status Dashboard ─────────────────────────────── */}
      <section className="panel section-panel" id="section-ingestion">
        <SectionHeading
          eyebrow="Estado de ingestión"
          title={`${ingestionStats.total} fuentes auditadas — ${ingestionStats.totalDocs} documentos reales`}
          description={`Transparencia total: cada fuente muestra su estado real de ingestión. ${ingestionStats.built} conectores listos, ${ingestionStats.seedOnly} con datos seed, ${ingestionStats.planned} planificados.`}
        />

        {/* Summary pills */}
        <div className="chip-row" style={{ marginBottom: "var(--space-lg)", gap: "var(--space-sm)", flexWrap: "wrap" }}>
          {(["live", "built", "seed-only", "stub", "planned"] as IngestionState[]).map((state) => {
            const count = dataSourceStatuses.filter((s) => s.state === state).length;
            if (count === 0) return null;
            return (
              <span
                key={state}
                className="micro-tag"
                style={{
                  borderLeft: `3px solid ${stateColors[state]}`,
                  paddingLeft: "8px",
                }}
              >
                <strong style={{ color: stateColors[state] }}>{count}</strong>{" "}
                {stateLabels[state]}
              </span>
            );
          })}
          <span className="micro-tag">
            <strong>{ingestionStats.totalDocs}</strong> docs reales
          </span>
          <span className="micro-tag">
            <strong>{ingestionStats.totalSeed}</strong> registros seed
          </span>
        </div>

        {/* Full status table */}
        <div className="local-table-wrap">
          <table className="local-table">
            <thead>
              <tr>
                <th className="local-th-name">Fuente</th>
                <th className="local-th-num">RAG</th>
                <th className="local-th-num">Estado</th>
                <th className="local-th-name" style={{ minWidth: 240 }}>Motivo</th>
                <th className="local-th-num">Docs</th>
                <th className="local-th-num">Seed</th>
                <th className="local-th-name" style={{ minWidth: 200 }}>
                  <span style={{ color: "var(--verde)" }}>✓</span> Tenemos
                </th>
                <th className="local-th-name" style={{ minWidth: 200 }}>
                  <span style={{ color: "var(--rojo)" }}>✗</span> No podemos obtener
                </th>
              </tr>
            </thead>
            {/* Group by group */}
            {Object.entries(groupLabels).map(([groupId, groupLabel]) => {
              const sources = dataSourceStatuses.filter((s) => s.group === groupId);
              if (sources.length === 0) return null;
              return (
                <tbody key={groupId}>
                  <tr className="local-ccaa-row">
                    <td colSpan={8}>
                      <div className="local-ccaa-row-inner">
                        {groupLabel} — {sources.length} fuente{sources.length > 1 ? "s" : ""}
                      </div>
                    </td>
                  </tr>
                  {sources.map((source) => {
                    const rag = RAG_BY_GROUP[source.group];
                    const ragMeta = rag ? RAG_LABELS[rag] : null;
                    return (
                    <tr key={source.id}>
                      <td className="local-td-name">
                        <strong style={{ fontSize: "0.82rem" }}>{source.shortName}</strong>
                        <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>
                          {source.name.length > 50 ? source.name.slice(0, 50) + "…" : source.name}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>
                          {source.updateFrequency === "none" ? "" : source.updateFrequency}
                        </span>
                      </td>
                      <td className="local-td-num">
                        {ragMeta ? (
                          <span
                            className="micro-tag"
                            style={{
                              background: ragMeta.color + "14",
                              color: ragMeta.color,
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              gap: "3px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <span style={{
                              width: "16px", height: "16px", borderRadius: "4px",
                              background: ragMeta.color, color: "#fff",
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.6rem", fontWeight: 800, flexShrink: 0,
                            }}>{ragMeta.icon}</span>
                            {ragMeta.label}
                          </span>
                        ) : (
                          <span style={{ color: "var(--ink-muted)", fontSize: "0.72rem" }}>—</span>
                        )}
                      </td>
                      <td className="local-td-num">
                        <span
                          className="micro-tag"
                          style={{
                            background: stateColors[source.state] + "18",
                            color: stateColors[source.state],
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            borderLeft: `2px solid ${stateColors[source.state]}`,
                          }}
                        >
                          {stateLabels[source.state]}
                        </span>
                      </td>
                      <td className="local-td-name" style={{ fontSize: "0.73rem", color: stateColors[source.state], maxWidth: "280px", lineHeight: 1.3 }}>
                        {source.statusReason}
                      </td>
                      <td className="local-td-num" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {source.docsCount > 0 ? (
                          <strong style={{ color: "var(--verde)" }}>{source.docsCount}</strong>
                        ) : (
                          <span style={{ color: "var(--ink-muted)" }}>0</span>
                        )}
                      </td>
                      <td className="local-td-num" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {source.seedCount > 0 ? (
                          <span style={{ color: "var(--ink-soft)" }}>{source.seedCount}</span>
                        ) : (
                          <span style={{ color: "var(--ink-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="local-td-name" style={{ fontSize: "0.74rem", color: "var(--ink-soft)", maxWidth: "280px" }}>
                        {source.weHave ? (
                          <span style={{ color: "var(--verde-dark, var(--verde))" }}>{source.weHave}</span>
                        ) : (
                          <span style={{ color: "var(--ink-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="local-td-name" style={{ fontSize: "0.74rem", color: "var(--ink-soft)", maxWidth: "280px" }}>
                        {source.cannotHave ? (
                          <span style={{ color: "var(--rojo-soft, var(--ink-muted))" }}>{source.cannotHave}</span>
                        ) : (
                          <span style={{ color: "var(--ink-muted)" }}>—</span>
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

        {/* Coverage bar */}
        <div style={{ marginTop: "var(--space-lg)" }}>
          <div style={{ display: "flex", gap: "var(--space-sm)", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "6px" }}>
            <span>Cobertura real de datos:</span>
            <strong>{ingestionStats.totalDocs} docs</strong>
            <span>de {ingestionStats.total} fuentes</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden", display: "flex" }}>
            {(["live", "built", "seed-only", "stub", "planned"] as IngestionState[]).map((state) => {
              const count = dataSourceStatuses.filter((s) => s.state === state).length;
              const pct = (count / ingestionStats.total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={state}
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: stateColors[state],
                    transition: "width 300ms ease",
                  }}
                  title={`${stateLabels[state]}: ${count}`}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "var(--space-md)", fontSize: "0.7rem", color: "var(--ink-muted)", marginTop: "4px", flexWrap: "wrap" }}>
            {(["live", "built", "seed-only", "stub", "planned"] as IngestionState[]).map((state) => {
              const count = dataSourceStatuses.filter((s) => s.state === state).length;
              if (count === 0) return null;
              return (
                <span key={state} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: stateColors[state], display: "inline-block" }} />
                  {stateLabels[state]} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Political Census ──────────────────────────────────────── */}
      <section className="panel section-panel" id="section-censo">
        <SectionHeading
          eyebrow="Censo político"
          title={`${censusSummary.totalOfficials.toLocaleString("es-ES")} cargos mapeados en ${censusSummary.layers.length} niveles`}
          description={`${censusSummary.totalIndexed.toLocaleString("es-ES")} indexados (${censusSummary.coveragePercent}%). Objetivo: cobertura completa de todos los niveles de gobierno en España.`}
        />

        <div className="compact-list-wide">
          {censusSummary.layers.map((layer) => {
            const pct = layer.expectedCount > 0 ? Math.round((layer.recordCount / layer.expectedCount) * 100) : 0;
            const statusLabel = layer.status === "live" ? "En vivo" : layer.status === "partial" ? "Parcial" : layer.status === "degraded" ? "Degradado" : "Planificado";
            const statusClass = layer.status === "live" ? "tag-up" : layer.status === "partial" ? "tag-flat" : "tag-down";
            const barColor = layer.status === "live" ? "var(--verde)" : layer.status === "partial" ? "var(--oro)" : "var(--ink-soft)";
            return (
              <article className="compact-card" key={layer.id}>
                <div className="profile-card-top">
                  <span className={`tag ${statusClass}`}>{statusLabel}</span>
                  <strong style={{ fontSize: "0.82rem", fontVariantNumeric: "tabular-nums" }}>
                    {layer.recordCount.toLocaleString("es-ES")} / {layer.expectedCount.toLocaleString("es-ES")}
                  </strong>
                </div>
                <h3>{layer.name}</h3>
                <p style={{ fontSize: "0.78rem" }}>{layer.scope}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>{layer.note}</p>
                <div className="profile-card-footer">
                  <span>{layer.dataFormat}</span>
                  <span>{layer.updateFrequency}</span>
                  {pct > 0 && <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>}
                </div>
                {/* Coverage bar */}
                <div style={{ height: "4px", borderRadius: "2px", background: "var(--border)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: "2px",
                      background: barColor,
                      transition: "width 300ms ease",
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Census summary bar */}
        <div style={{ marginTop: "var(--space-md)", display: "flex", gap: "var(--space-md)", fontSize: "0.75rem", color: "var(--ink-soft)", flexWrap: "wrap", justifyContent: "center" }}>
          <span><strong style={{ color: "var(--verde)" }}>{censusSummary.layers.filter(l => l.status === "live").length}</strong> en vivo</span>
          <span><strong style={{ color: "var(--oro)" }}>{censusSummary.layers.filter(l => l.status === "partial").length}</strong> parcial</span>
          <span><strong style={{ color: "var(--ink-muted)" }}>{censusSummary.layers.filter(l => l.status === "planned").length}</strong> planificado</span>
          <span>Cobertura: <strong>{censusSummary.coveragePercent}%</strong></span>
        </div>
      </section>

      {/* ── Overview metrics ───────────────────────────────────────── */}
      <section className="metrics-grid">
        {connectorGroups.map((group) => {
          const count = getConnectorsForGroup(group).length;
          return (
            <article className="metric-card" key={group.id}>
              <div className="metric-head">
                <span>{group.icon} {group.label}</span>
                <strong>{count} fuentes</strong>
              </div>
              <p className="metric-value">{count}</p>
              <p className="metric-caption">{group.description}</p>
            </article>
          );
        })}
        <article className="metric-card">
          <div className="metric-head">
            <span>🏢 Ministerios del Gobierno</span>
            <strong>{totalMinisterios} fuentes</strong>
          </div>
          <p className="metric-value">{totalMinisterios}</p>
          <p className="metric-caption">
            Portales institucionales de los ministerios del Gobierno de España — sanidad, educación,
            economía, trabajo, transición ecológica y más.
          </p>
        </article>
        <article className="metric-card">
          <div className="metric-head">
            <span>🗺️ Comunidades Autónomas</span>
            <strong>{totalTerritorialSources} fuentes</strong>
          </div>
          <p className="metric-value">{autonomousCommunities.length}</p>
          <p className="metric-caption">
            Gobierno, parlamento y boletín oficial de cada CCAA — {totalTerritorialSources} fuentes
            territoriales normalizadas.
          </p>
        </article>
      </section>

      {/* ── Connectors by group ────────────────────────────────────── */}
      {connectorGroups.map((group) => {
        const connectors = getConnectorsForGroup(group);
        if (connectors.length === 0) return null;
        return (
          <section className="panel section-panel" key={group.id} id={`section-${group.id}`}>
            <SectionHeading
              eyebrow={group.icon + " " + group.id.charAt(0).toUpperCase() + group.id.slice(1)}
              title={group.label}
              description={group.description}
            />
            <div className="connectors-grid">
              {connectors.map((connector) => (
                <article className="connector-card" key={connector.id}>
                  <div className="signal-meta">
                    <span className={`tag ${group.tagClass}`}>{connector.area}</span>
                    <span>{connector.name}</span>
                  </div>
                  <p>{connector.note}</p>
                  <div className="connector-footer">
                    <a href={connector.documentationUrl} rel="noreferrer" target="_blank">
                      Documentación
                    </a>
                    {connector.latestJsonUrl ? (
                      <a href={connector.latestJsonUrl} rel="noreferrer" target="_blank">
                        API / Feed
                      </a>
                    ) : null}
                    {connector.sourcePageUrl && connector.sourcePageUrl !== connector.documentationUrl ? (
                      <a href={connector.sourcePageUrl} rel="noreferrer" target="_blank">
                        {getHostLabel(connector.sourcePageUrl)}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* ── Ministerios ──────────────────────────────────────────── */}
      <section className="panel section-panel" id="section-ministerios">
        <SectionHeading
          eyebrow="🏢 Poder Ejecutivo"
          title={`${totalMinisterios} Ministerios del Gobierno de España`}
          description="Portales institucionales de cada ministerio. Fuentes de datos sectoriales, estadísticas, convocatorias y normativa ministerial."
        />
        <div className="connectors-grid">
          {ministerioSources.map((src) => {
            const sColor = stateColors[src.state];
            return (
              <article className="connector-card" key={src.id}>
                <div className="signal-meta">
                  <span
                    className="tag"
                    style={{ background: `${sColor}18`, color: sColor, fontWeight: 600, fontSize: "0.7rem" }}
                  >
                    {stateLabels[src.state]}
                  </span>
                  <span>{src.shortName}</span>
                </div>
                <h3 style={{ fontSize: "0.85rem", margin: "6px 0 4px" }}>{src.name}</h3>
                {src.weHave && (
                  <p style={{ fontSize: "0.75rem", color: "var(--verde)", margin: "4px 0 2px" }}>
                    <strong>✓</strong> {src.weHave}
                  </p>
                )}
                {src.cannotHave && (
                  <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", margin: "2px 0 0" }}>
                    <strong style={{ color: "var(--rojo)" }}>✗</strong> {src.cannotHave}
                  </p>
                )}
                <div className="connector-footer">
                  {src.apiEndpoint && (
                    <a href={src.apiEndpoint} rel="noreferrer" target="_blank">
                      {getHostLabel(src.apiEndpoint)}
                    </a>
                  )}
                  {src.seedCount > 0 && (
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                      {src.seedCount} seed
                    </span>
                  )}
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                    {src.updateFrequency === "none" ? "" : src.updateFrequency}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── CCAA sources ───────────────────────────────────────────── */}
      <section className="panel section-panel" id="section-ccaa">
        <SectionHeading
          eyebrow="🗺️ Autonómico"
          title="Fuentes oficiales por Comunidad Autónoma"
          description="Gobierno, parlamento y boletín oficial de las 17 CCAA. Cada fuente enlaza al portal institucional original."
        />

        {/* Source type legend */}
        <div className="chip-row" style={{ marginBottom: "var(--space-lg)" }}>
          {(Object.entries(sourceTypeMeta) as [TerritorialSourceType, typeof sourceTypeMeta[TerritorialSourceType]][]).map(([type, meta]) => (
            <span className={`tag ${meta.tagClassName}`} key={type} style={{ fontSize: "0.75rem" }}>
              {meta.label} — {territorialOfficialSources.filter(s => s.type === type).length}
            </span>
          ))}
        </div>

        <div className="source-directory-grid">
          {autonomousCommunities.map((territory) => {
            const sources = sourcesByTerritory[territory.slug] ?? [];

            return (
              <article className="profile-card" id={territory.slug} key={territory.id}>
                <div className="profile-card-top">
                  <div>
                    <span className="eyebrow">CCAA</span>
                    <h3>{territory.name}</h3>
                  </div>
                  <span className="micro-tag">{territory.shortCode}</span>
                </div>
                <p>{territory.strategicFocus}</p>
                <div className="chip-row">
                  <span className="micro-tag">Sede: {territory.seat}</span>
                  <span className="micro-tag">{sources.length} fuentes</span>
                </div>
                <div className="source-stack">
                  {sources.map((source) => {
                    const typeMeta = sourceTypeMeta[source.type];
                    return (
                      <a className="compact-card" href={source.url} key={source.id} rel="noreferrer" target="_blank">
                        <div className="source-link-top">
                          <span className={`tag ${typeMeta.tagClassName}`}>{typeMeta.label}</span>
                          <span className="source-link-domain">{getHostLabel(source.url)}</span>
                        </div>
                        <h3>{source.title}</h3>
                        <p>{typeMeta.description}</p>
                      </a>
                    );
                  })}
                </div>
                <Link className="back-link" href={`/territories/${territory.slug}`}>
                  Abrir ficha territorial
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Media / RSS Sources ─────────────────────────────────────── */}
      <section className="panel section-panel" id="section-medios">
        <SectionHeading
          eyebrow="📰 Medios y Agencias"
          title={`${getRssSources().length} fuentes de prensa e institucionales`}
          description="Feeds RSS de medios nacionales, agencias y portales institucionales. Alimentan el RAG Medios con titulares vinculados a entidades."
        />
        <div className="local-table-wrap">
          <table className="local-table">
            <thead>
              <tr>
                <th className="local-th-name">Fuente</th>
                <th className="local-th-num">RAG</th>
                <th className="local-th-num">Categor{"í"}a</th>
                <th className="local-th-name">Feed RSS</th>
              </tr>
            </thead>
            <tbody>
              {getRssSources().map((feed) => {
                const ragMeta = RAG_LABELS.medios;
                const catLabel = feed.category === "media" ? "Prensa" : feed.category === "institutional" ? "Institucional" : "Agencia";
                const catColor = feed.category === "media" ? "var(--azul)" : feed.category === "institutional" ? "var(--rojo)" : "var(--verde)";
                return (
                  <tr key={feed.id}>
                    <td className="local-td-name">
                      <strong style={{ fontSize: "0.82rem" }}>{feed.name}</strong>
                    </td>
                    <td className="local-td-num">
                      <span
                        className="micro-tag"
                        style={{
                          background: ragMeta.color + "14",
                          color: ragMeta.color,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          gap: "3px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <span style={{
                          width: "16px", height: "16px", borderRadius: "4px",
                          background: ragMeta.color, color: "#fff",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.6rem", fontWeight: 800, flexShrink: 0,
                        }}>{ragMeta.icon}</span>
                        {ragMeta.label}
                      </span>
                    </td>
                    <td className="local-td-num">
                      <span className="micro-tag" style={{ borderLeft: `2px solid ${catColor}`, paddingLeft: "6px", color: catColor, fontWeight: 600, fontSize: "0.72rem" }}>
                        {catLabel}
                      </span>
                    </td>
                    <td className="local-td-name">
                      <a href={feed.url} rel="noreferrer" target="_blank" style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
                        {feed.url.replace(/https?:\/\/(www\.)?/, "").substring(0, 50)}...
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Quick nav anchors (bottom) ─────────────────────────────── */}
      <section className="panel section-panel" style={{ textAlign: "center", paddingBottom: "var(--space-2xl)" }}>
        <SectionHeading
          eyebrow="Navegación rápida"
          title="Ir a una sección"
          description=""
        />
        <div className="chip-row" style={{ justifyContent: "center", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          <a href="#section-ingestion" className="micro-tag" style={{ textDecoration: "none", borderLeft: "2px solid var(--rojo)", paddingLeft: "6px" }}>
            📊 Estado de ingesti{"ó"}n
          </a>
          <a href="#section-censo" className="micro-tag" style={{ textDecoration: "none", borderLeft: "2px solid var(--oro)", paddingLeft: "6px" }}>
            🏛️ Censo pol{"í"}tico
          </a>
          {connectorGroups.map((g) => (
            <a key={g.id} href={`#section-${g.id}`} className="micro-tag" style={{ textDecoration: "none" }}>
              {g.icon} {g.label.split(" — ")[0]}
            </a>
          ))}
          <a href="#section-ministerios" className="micro-tag" style={{ textDecoration: "none" }}>
            🏢 Ministerios
          </a>
          <a href="#section-ccaa" className="micro-tag" style={{ textDecoration: "none" }}>
            🗺️ CCAA
          </a>
          <a href="#section-medios" className="micro-tag" style={{ textDecoration: "none", borderLeft: "2px solid #7c3aed", paddingLeft: "6px" }}>
            📰 Medios
          </a>
        </div>
      </section>
    </main>
  );
}
