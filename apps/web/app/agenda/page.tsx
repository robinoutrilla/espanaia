import Link from "next/link";
import { parties, territories } from "@espanaia/seed-data";
import { SectionHeading } from "../../components/section-heading";
import { SiteHeader } from "../../components/site-header";
import { partyColors } from "../../lib/visual-data";
import {
  agendaEvents,
  eventTypeLabels,
  eventTypeColors,
  type AgendaEventType,
} from "../../lib/agenda-data";

export default function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ territorio?: string; partido?: string; tipo?: string }>;
}) {
  /* We read searchParams synchronously via the page props — Next 15 */
  return <AgendaContent searchParamsPromise={searchParams} />;
}

async function AgendaContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ territorio?: string; partido?: string; tipo?: string }>;
}) {
  const sp = await searchParamsPromise;
  const filterTerritory = sp.territorio ?? "";
  const filterParty = sp.partido ?? "";
  const filterType = sp.tipo ?? "";

  const filtered = agendaEvents
    .filter((e) => {
      if (filterTerritory && !e.territorySlugs.includes(filterTerritory)) return false;
      if (filterParty && !e.partySlugs.includes(filterParty)) return false;
      if (filterType && e.eventType !== filterType) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time ?? "").localeCompare(a.time ?? ""));

  const eventTypes: AgendaEventType[] = [
    "pleno", "comision", "consejo-ministros", "parlamento-ccaa",
    "boe", "comparecencia", "ue", "otro",
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" }).format(d);
  };

  /* Group events by date */
  const grouped = new Map<string, typeof filtered>();
  for (const event of filtered) {
    const group = grouped.get(event.date) ?? [];
    group.push(event);
    grouped.set(event.date, group);
  }

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="home" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">Agenda pública</span>
            <h1 className="detail-title">Calendario institucional</h1>
            <p className="detail-description">
              Plenos, comisiones, consejos de ministros, parlamentos autonómicos, BOE y eventos europeos.
              Filtrado por territorio, partido o tipo de evento.
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid-2">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{agendaEvents.length}</strong><span>Eventos</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{filtered.length}</strong><span>Visibles</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="panel section-panel">
        <div className="agenda-filters">
          {/* Territory filter */}
          <div className="agenda-filter-group">
            <span className="agenda-filter-label">Territorio</span>
            <div className="agenda-filter-options">
              <Link
                className={`agenda-filter-pill ${!filterTerritory ? "agenda-filter-active" : ""}`}
                href={{ pathname: "/agenda", query: { ...(filterParty ? { partido: filterParty } : {}), ...(filterType ? { tipo: filterType } : {}) } }}
              >
                Todos
              </Link>
              {territories.slice(0, 8).map((t) => (
                <Link
                  key={t.slug}
                  className={`agenda-filter-pill ${filterTerritory === t.slug ? "agenda-filter-active" : ""}`}
                  href={{ pathname: "/agenda", query: { territorio: t.slug, ...(filterParty ? { partido: filterParty } : {}), ...(filterType ? { tipo: filterType } : {}) } }}
                >
                  {t.shortCode}
                </Link>
              ))}
            </div>
          </div>

          {/* Party filter */}
          <div className="agenda-filter-group">
            <span className="agenda-filter-label">Partido</span>
            <div className="agenda-filter-options">
              <Link
                className={`agenda-filter-pill ${!filterParty ? "agenda-filter-active" : ""}`}
                href={{ pathname: "/agenda", query: { ...(filterTerritory ? { territorio: filterTerritory } : {}), ...(filterType ? { tipo: filterType } : {}) } }}
              >
                Todos
              </Link>
              {parties.map((p) => {
                const color = partyColors[p.slug] ?? "var(--ink-muted)";
                return (
                  <Link
                    key={p.slug}
                    className={`agenda-filter-pill ${filterParty === p.slug ? "agenda-filter-active" : ""}`}
                    href={{ pathname: "/agenda", query: { partido: p.slug, ...(filterTerritory ? { territorio: filterTerritory } : {}), ...(filterType ? { tipo: filterType } : {}) } }}
                    style={filterParty === p.slug ? { background: `${color}22`, color, borderColor: color } : {}}
                  >
                    {p.acronym}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Event type filter */}
          <div className="agenda-filter-group">
            <span className="agenda-filter-label">Tipo</span>
            <div className="agenda-filter-options">
              <Link
                className={`agenda-filter-pill ${!filterType ? "agenda-filter-active" : ""}`}
                href={{ pathname: "/agenda", query: { ...(filterTerritory ? { territorio: filterTerritory } : {}), ...(filterParty ? { partido: filterParty } : {}) } }}
              >
                Todos
              </Link>
              {eventTypes.map((t) => (
                <Link
                  key={t}
                  className={`agenda-filter-pill ${filterType === t ? "agenda-filter-active" : ""}`}
                  href={{ pathname: "/agenda", query: { tipo: t, ...(filterTerritory ? { territorio: filterTerritory } : {}), ...(filterParty ? { partido: filterParty } : {}) } }}
                >
                  {eventTypeLabels[t]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Events grouped by date ── */}
      <section className="panel section-panel">
        <SectionHeading
          eyebrow="Próximos eventos"
          title={`${filtered.length} actividades`}
          description="Calendario de actividad institucional ordenado cronológicamente."
        />

        {filtered.length === 0 ? (
          <div style={{ padding: "var(--space-xl)", textAlign: "center", color: "var(--ink-muted)" }}>
            <p>No hay eventos que coincidan con los filtros seleccionados.</p>
            <Link className="hero-button hero-button-secondary" href="/agenda" style={{ marginTop: 16, display: "inline-flex" }}>
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <div className="agenda-timeline">
            {[...grouped.entries()].map(([date, events]) => (
              <div className="agenda-day-group" key={date}>
                <div className="agenda-day-label">
                  <span className="agenda-day-date">{formatDate(date)}</span>
                  <span className="agenda-day-count">{events.length} {events.length === 1 ? "evento" : "eventos"}</span>
                </div>
                <div className="agenda-day-events">
                  {events.map((event) => {
                    const typeColor = eventTypeColors[event.eventType];
                    return (
                      <article className="agenda-event-card" key={event.id} style={{ borderLeft: `4px solid ${typeColor}` }}>
                        <div className="agenda-event-top">
                          <span className="tag" style={{ background: `${typeColor}18`, color: typeColor }}>
                            {eventTypeLabels[event.eventType]}
                          </span>
                          {event.time ? <span className="agenda-event-time">{event.time}h</span> : null}
                          <span className="agenda-event-institution">{event.institution}</span>
                        </div>
                        <h3>{event.title}</h3>
                        <p>{event.summary}</p>
                        <div className="agenda-event-tags">
                          {event.territorySlugs.map((ts) => {
                            const terr = territories.find((t) => t.slug === ts);
                            return terr ? (
                              <Link className="micro-tag" href={`/territories/${ts}`} key={ts}>{terr.shortCode}</Link>
                            ) : null;
                          })}
                          {event.partySlugs.slice(0, 4).map((ps) => {
                            const color = partyColors[ps] ?? "var(--ink-muted)";
                            const party = parties.find((p) => p.slug === ps);
                            return party ? (
                              <Link className="micro-tag" href={`/parties/${ps}`} key={ps} style={{ background: `${color}12`, color, borderColor: `${color}30` }}>
                                {party.acronym}
                              </Link>
                            ) : null;
                          })}
                          {event.sourceUrl ? (
                            <a className="micro-tag" href={event.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--rojo)" }}>
                              Fuente →
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
