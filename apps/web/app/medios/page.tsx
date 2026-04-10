import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { getTrending, getRssSources } from "../../lib/rss-trending";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MediosPage() {
  const [trending, sources] = await Promise.all([
    getTrending(100),
    Promise.resolve(getRssSources()),
  ]);

  const withMatches = trending.filter((t) => t.matches.length > 0);
  const withoutMatches = trending.filter((t) => t.matches.length === 0);

  const sourceCount = new Map<string, number>();
  for (const item of trending) {
    sourceCount.set(item.source, (sourceCount.get(item.source) || 0) + 1);
  }

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="home" />

      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">RSS · MEDIOS · INSTITUCIONES</span>
            <h1 className="detail-title">España en los medios</h1>
            <p className="detail-description">
              Titulares en tiempo real de {sources.length} fuentes españolas. Los que mencionan
              políticos, partidos o territorios se enlazan automáticamente con nuestros datos.
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Resumen</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{trending.length}</strong><span>Titulares</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>{withMatches.length}</strong><span>Enlazados</span></div>
              <div className="kpi-cell"><strong>{sources.length}</strong><span>Fuentes RSS</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Sources overview ── */}
      <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {sources.map((s) => (
            <span
              key={s.id}
              className={`trending-source trending-source-${s.category}`}
              style={{ padding: "4px 10px", fontSize: "0.72rem" }}
            >
              {s.name} ({sourceCount.get(s.name) || 0})
            </span>
          ))}
        </div>
      </section>

      {/* ── Headlines with entity matches ── */}
      {withMatches.length > 0 && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--rojo)" }}>CON DATOS ENLAZADOS</span>
            <h2 className="insight-title">{withMatches.length} titulares vinculados a nuestros datos</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              Mencionan políticos, partidos o comunidades autónomas que tenemos indexados.
            </p>
          </div>
          <div className="trending-grid">
            {withMatches.map((item, i) => (
              <article className="trending-card" key={`m-${i}`}>
                <div className="trending-card-header">
                  <span className={`trending-source trending-source-${item.sourceCategory}`}>
                    {item.source}
                  </span>
                  {item.pubDate && (
                    <time className="trending-time" dateTime={item.pubDate}>
                      {formatTime(item.pubDate)}
                    </time>
                  )}
                </div>
                <a className="trending-title" href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                <div className="trending-matches">
                  {item.matches.map((m) => (
                    <Link
                      key={m.slug}
                      className={`trending-match trending-match-${m.type}`}
                      href={m.href}
                    >
                      {m.type === "politician" ? "\u{1F464}" : m.type === "party" ? "\u{1F3DB}" : "\u{1F4CD}"} {m.name}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Other headlines ── */}
      {withoutMatches.length > 0 && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div className="insight-header">
            <span className="eyebrow" style={{ color: "var(--ink-muted)" }}>OTROS TITULARES</span>
            <h2 className="insight-title">{withoutMatches.length} noticias adicionales</h2>
          </div>
          <div className="trending-grid">
            {withoutMatches.map((item, i) => (
              <article className="trending-card" key={`o-${i}`}>
                <div className="trending-card-header">
                  <span className={`trending-source trending-source-${item.sourceCategory}`}>
                    {item.source}
                  </span>
                  {item.pubDate && (
                    <time className="trending-time" dateTime={item.pubDate}>
                      {formatTime(item.pubDate)}
                    </time>
                  )}
                </div>
                <a className="trending-title" href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <SiteFooter sources={sources.map((s) => s.name).join(", ")} />
    </main>
  );
}

function formatTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(dateStr));
  } catch {
    return "";
  }
}
