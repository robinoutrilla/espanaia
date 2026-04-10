"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

/* ── Types ── */

interface NewsArticle {
  id: string; headline: string; subheadline: string;
  category: "politica" | "economia" | "sociedad" | "europa" | "tecnologia" | "territorio";
  date: string; author: string; summary: string; body: string[];
  iapnProposal: string; iapnQuote: string;
  blockers: { actor: string; reason: string; severity: "alto" | "medio" | "bajo" }[];
  partyReactions: { party: string; color: string; position: "a-favor" | "en-contra" | "abstención" | "dividido"; statement: string; probabilityAgree: number }[];
  benefitScore: number; benefitAnalysis: string;
  pros: { point: string; source: string }[]; cons: { point: string; source: string }[];
  sources: { name: string; url: string }[];
  readingTimeMin: number; importance: "portada" | "alta" | "media" | "breve";
  tags: string[]; relatedArticles: string[];
  factCheck: { claim: string; verdict: "verdadero" | "mayormente-verdadero" | "mixto" | "engañoso" | "falso"; explanation: string }[];
}

interface EditorialNote {
  id: string; title: string; content: string; author: string; date: string; disclaimer: string;
}

interface PeriodicoData {
  articles: NewsArticle[];
  editorials: EditorialNote[];
  breakingNews: { id: string; headline: string; date: string; articleId: string }[];
  categories: { id: string; label: string; count: number }[];
  stats: { totalArticles: number; avgBenefitScore: number; partiesAnalyzed: number; sourcesReferenced: number; lastUpdated: string };
  methodology: string;
}

type TabView = "portada" | "analisis";
type CategoryFilter = "todas" | NewsArticle["category"];

const CACHE_KEY = "periodico-data-v2";

const categoryLabels: Record<string, string> = {
  politica: "Política", economia: "Economía", sociedad: "Sociedad",
  europa: "Europa", tecnologia: "Tecnología", territorio: "Territorio",
};

const categoryColors: Record<string, string> = {
  politica: "var(--rojo)", economia: "var(--azul)", sociedad: "var(--verde)",
  europa: "#6366f1", tecnologia: "#8b5cf6", territorio: "#d97706",
};

const verdictColors: Record<string, string> = {
  verdadero: "#16a34a", "mayormente-verdadero": "#0d9488", mixto: "#ca8a04",
  "engañoso": "#ea580c", falso: "#dc2626",
};

const verdictLabels: Record<string, string> = {
  verdadero: "VERDADERO", "mayormente-verdadero": "MAYORMENTE VERDADERO",
  mixto: "MIXTO", "engañoso": "ENGAÑOSO", falso: "FALSO",
};

const severityColors: Record<string, string> = {
  alto: "var(--rojo)", medio: "var(--oro)", bajo: "var(--verde)",
};

const positionLabels: Record<string, string> = {
  "a-favor": "A favor", "en-contra": "En contra", "abstención": "Abstención", dividido: "Dividido",
};

const positionColors: Record<string, string> = {
  "a-favor": "#16a34a", "en-contra": "#dc2626", "abstención": "#6b7280", dividido: "#ca8a04",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
  return `MADRID, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} —`;
}

function formatMastheadDate(): string {
  const d = new Date();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ── Subcomponents ── */

function BreakingNewsTicker({ items, onClickArticle }: { items: PeriodicoData["breakingNews"]; onClickArticle: (id: string) => void }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="np-ticker">
      <span className="np-ticker-label">ÚLTIMA HORA</span>
      <div className="np-ticker-track">
        <div className="np-ticker-scroll">
          {doubled.map((item, i) => (
            <button key={`${item.id}-${i}`} className="np-ticker-item" onClick={() => onClickArticle(item.articleId)}>
              {item.headline}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BenefitCircle({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626";
  return (
    <div className="np-benefit-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="np-benefit-value" style={{ color }}>{score}</span>
    </div>
  );
}

function ProbabilityGauge({ value, color }: { value: number; color: string }) {
  return (
    <div className="np-gauge">
      <div className="np-gauge-bg">
        <div className="np-gauge-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="np-gauge-label">{value}%</span>
    </div>
  );
}

function ArticleCard({ article, isHero, onClick }: { article: NewsArticle; isHero?: boolean; onClick: () => void }) {
  return (
    <article className={`np-card ${isHero ? "np-card-hero" : ""} np-card-${article.importance}`} onClick={onClick}>
      <div className="np-card-cat" style={{ color: categoryColors[article.category] }}>
        {categoryLabels[article.category]}
      </div>
      <h2 className={isHero ? "np-headline-hero" : "np-headline"}>{article.headline}</h2>
      <p className="np-subheadline">{article.subheadline}</p>
      <p className="np-card-summary">{article.summary}</p>
      <div className="np-card-meta">
        <span className="np-dateline">{formatDate(article.date)}</span>
        <span className="np-reading-time">{article.readingTimeMin} min de lectura</span>
      </div>
      <div className="np-card-footer">
        <BenefitCircle score={article.benefitScore} size={36} />
        <div className="np-card-tags">
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="np-tag">{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ArticleDetail({ article, articles, onBack, onNavigate }: { article: NewsArticle; articles: NewsArticle[]; onBack: () => void; onNavigate: (id: string) => void }) {
  const related = articles.filter((a) => article.relatedArticles.includes(a.id));

  return (
    <div className="np-article-detail">
      <button className="np-back-btn" onClick={onBack}>← Volver a portada</button>

      <div className="np-article-cat" style={{ color: categoryColors[article.category] }}>
        {categoryLabels[article.category]}
      </div>

      <h1 className="np-article-headline">{article.headline}</h1>
      <p className="np-article-subheadline">{article.subheadline}</p>

      <div className="np-article-meta">
        <span className="np-dateline">{formatDate(article.date)}</span>
        <span className="np-author">{article.author}</span>
        <span className="np-reading-time">{article.readingTimeMin} min de lectura</span>
      </div>

      <p className="np-article-summary">{article.summary}</p>

      <div className="np-article-body">
        {article.body?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* PROPUESTA IAPÑ */}
      <div className="np-proposal-box">
        <div className="np-proposal-label">PROPUESTA IAPÑ</div>
        <p className="np-proposal-text">{article.iapnProposal}</p>
        <blockquote className="np-proposal-quote">"{article.iapnQuote}"</blockquote>
        <p className="np-proposal-disclaimer">Posición del Partido IAPÑ — claramente identificada como propuesta de partido</p>
      </div>

      {/* BLOQUEOS */}
      {article.blockers?.length > 0 && (
        <div className="np-section">
          <h3 className="np-section-title">BLOQUEOS</h3>
          <div className="np-blockers-list">
            {article.blockers.map((b, i) => (
              <div key={i} className="np-blocker">
                <span className="np-blocker-badge" style={{ background: severityColors[b.severity] }}>
                  {b.severity.toUpperCase()}
                </span>
                <div>
                  <strong>{b.actor}</strong>
                  <p>{b.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REACCIONES DE LOS PARTIDOS */}
      {article.partyReactions?.length > 0 && (
        <div className="np-section">
          <h3 className="np-section-title">REACCIONES DE LOS PARTIDOS</h3>
          <div className="np-reactions-grid">
            {article.partyReactions.map((r, i) => (
              <div key={i} className="np-reaction-card">
                <div className="np-reaction-header">
                  <span className="np-party-dot" style={{ background: r.color }} />
                  <strong>{r.party}</strong>
                  <span className="np-position-badge" style={{ color: positionColors[r.position], borderColor: positionColors[r.position] }}>
                    {positionLabels[r.position]}
                  </span>
                </div>
                <p className="np-reaction-statement">"{r.statement}"</p>
                <div className="np-reaction-prob">
                  <span>Probabilidad de acuerdo:</span>
                  <ProbabilityGauge value={r.probabilityAgree} color={r.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BENEFICIO PARA ESPAÑA */}
      <div className="np-section np-benefit-section">
        <h3 className="np-section-title">BENEFICIO PARA ESPAÑA</h3>
        <div className="np-benefit-row">
          <BenefitCircle score={article.benefitScore} size={80} />
          <p className="np-benefit-analysis">{article.benefitAnalysis}</p>
        </div>
      </div>

      {/* PROS Y CONTRAS */}
      {(article.pros.length > 0 || article.cons.length > 0) && (
        <div className="np-section">
          <h3 className="np-section-title">PROS Y CONTRAS</h3>
          <div className="np-proscons">
            <div className="np-pros">
              <h4 className="np-pros-title">A favor</h4>
              {article.pros.map((p, i) => (
                <div key={i} className="np-procon-item">
                  <span className="np-procon-icon np-pro-icon">✓</span>
                  <div>
                    <p>{p.point}</p>
                    <cite>{p.source}</cite>
                  </div>
                </div>
              ))}
            </div>
            <div className="np-cons">
              <h4 className="np-cons-title">En contra</h4>
              {article.cons.map((c, i) => (
                <div key={i} className="np-procon-item">
                  <span className="np-procon-icon np-con-icon">✗</span>
                  <div>
                    <p>{c.point}</p>
                    <cite>{c.source}</cite>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VERIFICACIÓN DE DATOS */}
      {article.factCheck.length > 0 && (
        <div className="np-section">
          <h3 className="np-section-title">VERIFICACIÓN DE DATOS</h3>
          <div className="np-factchecks">
            {article.factCheck.map((fc, i) => (
              <div key={i} className="np-factcheck-card">
                <span className="np-verdict-badge" style={{ background: verdictColors[fc.verdict] }}>
                  {verdictLabels[fc.verdict]}
                </span>
                <p className="np-factcheck-claim">"{fc.claim}"</p>
                <p className="np-factcheck-explanation">{fc.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FUENTES */}
      {article.sources.length > 0 && (
        <div className="np-section">
          <h3 className="np-section-title">FUENTES</h3>
          <ul className="np-sources-list">
            {article.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ARTÍCULOS RELACIONADOS */}
      {related.length > 0 && (
        <div className="np-section">
          <h3 className="np-section-title">ARTÍCULOS RELACIONADOS</h3>
          <div className="np-related-grid">
            {related.map((r) => (
              <button key={r.id} className="np-related-link" onClick={() => onNavigate(r.id)}>
                <span className="np-related-cat" style={{ color: categoryColors[r.category] }}>{categoryLabels[r.category]}</span>
                <span className="np-related-headline">{r.headline}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */

export default function PeriodicoPage() {
  const [data, setData] = useState<PeriodicoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabView>("portada");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todas");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {}
    fetch("/api/periodico")
      .then((r) => { if (!r.ok) throw new Error("Error al cargar"); return r.json(); })
      .then((d: PeriodicoData) => {
        setData(d);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch {}
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = useMemo(() => {
    if (!data) return [];
    if (categoryFilter === "todas") return data.articles;
    return data.articles.filter((a) => a.category === categoryFilter);
  }, [data, categoryFilter]);

  const heroArticle = useMemo(() => filteredArticles.find((a) => a.importance === "portada") ?? filteredArticles[0], [filteredArticles]);
  const secondaryArticles = useMemo(() => filteredArticles.filter((a) => a !== heroArticle), [filteredArticles, heroArticle]);

  const selectedArticle = useMemo(() => data?.articles.find((a) => a.id === selectedArticleId) ?? null, [data, selectedArticleId]);

  const openArticle = useCallback((id: string) => {
    setSelectedArticleId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeArticle = useCallback(() => {
    setSelectedArticleId(null);
  }, []);

  if (loading) {
    return (
      <main className="page-shell detail-page">
        <SiteHeader currentSection="periodico" />
        <div className="np-loading">
          <div className="np-loading-spinner" />
          <p>Preparando la edición...</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-shell detail-page">
        <SiteHeader currentSection="periodico" />
        <div className="np-error">
          <h2>Error al cargar el periódico</h2>
          <p>{error ?? "No se pudieron obtener los datos"}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="page-shell detail-page">
      <SiteHeader currentSection="periodico" />

      {/* Breaking news ticker */}
      <BreakingNewsTicker items={data.breakingNews} onClickArticle={openArticle} />

      {/* Masthead */}
      <div className="np-masthead">
        <div className="np-masthead-inner">
          <div className="np-masthead-date">{formatMastheadDate()}</div>
          <h1 className="np-masthead-title">EL PERIÓDICO DE IAPÑ</h1>
          <p className="np-masthead-tagline">Datos, no ideología. Soluciones, no promesas.</p>
          <div className="np-masthead-rule" />
        </div>
      </div>

      {/* Tabs + Category filter */}
      <div className="np-toolbar">
        <div className="np-tabs">
          <button className={`np-tab ${tab === "portada" ? "np-tab-active" : ""}`} onClick={() => { setTab("portada"); setSelectedArticleId(null); }}>
            Portada
          </button>
          <button className={`np-tab ${tab === "analisis" ? "np-tab-active" : ""}`} onClick={() => { setTab("analisis"); setSelectedArticleId(null); }}>
            Análisis
          </button>
        </div>
        <div className="np-categories">
          <button className={`np-cat-btn ${categoryFilter === "todas" ? "np-cat-btn-active" : ""}`} onClick={() => setCategoryFilter("todas")}>
            Todas
          </button>
          {data.categories.map((c) => (
            <button key={c.id} className={`np-cat-btn ${categoryFilter === c.id ? "np-cat-btn-active" : ""}`}
              onClick={() => setCategoryFilter(c.id as CategoryFilter)}
              style={{ "--cat-color": categoryColors[c.id] } as React.CSSProperties}>
              {c.label} <span className="np-cat-count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="np-layout">
        <div className="np-main">
          {/* Article detail view */}
          {selectedArticle ? (
            <ArticleDetail article={selectedArticle} articles={data.articles} onBack={closeArticle} onNavigate={openArticle} />
          ) : tab === "portada" ? (
            /* Portada grid */
            <div className="np-portada">
              {heroArticle && (
                <ArticleCard article={heroArticle} isHero onClick={() => openArticle(heroArticle.id)} />
              )}
              <div className="np-grid-secondary">
                {secondaryArticles.map((a) => (
                  <ArticleCard key={a.id} article={a} onClick={() => openArticle(a.id)} />
                ))}
              </div>
            </div>
          ) : (
            /* Análisis view */
            <div className="np-analisis">
              {/* Stats overview */}
              <div className="np-stats-row">
                <div className="np-stat-card">
                  <span className="np-stat-value">{data.stats.totalArticles}</span>
                  <span className="np-stat-label">Artículos</span>
                </div>
                <div className="np-stat-card">
                  <span className="np-stat-value">{data.stats.avgBenefitScore}</span>
                  <span className="np-stat-label">Beneficio medio</span>
                </div>
                <div className="np-stat-card">
                  <span className="np-stat-value">{data.stats.partiesAnalyzed}</span>
                  <span className="np-stat-label">Partidos</span>
                </div>
                <div className="np-stat-card">
                  <span className="np-stat-value">{data.stats.sourcesReferenced}</span>
                  <span className="np-stat-label">Fuentes</span>
                </div>
              </div>

              {/* Benefit scores ranking */}
              <div className="np-section">
                <h3 className="np-section-title">RANKING DE BENEFICIO PARA ESPAÑA</h3>
                <div className="np-benefit-ranking">
                  {[...filteredArticles].sort((a, b) => b.benefitScore - a.benefitScore).map((a) => (
                    <button key={a.id} className="np-ranking-row" onClick={() => openArticle(a.id)}>
                      <BenefitCircle score={a.benefitScore} size={40} />
                      <div className="np-ranking-info">
                        <span className="np-ranking-cat" style={{ color: categoryColors[a.category] }}>{categoryLabels[a.category]}</span>
                        <span className="np-ranking-headline">{a.headline}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Party positions overview */}
              <div className="np-section">
                <h3 className="np-section-title">POSICIONES DE LOS PARTIDOS</h3>
                <div className="np-party-overview">
                  {filteredArticles.map((a) => (
                    <div key={a.id} className="np-party-article-row">
                      <strong className="np-party-article-title" onClick={() => openArticle(a.id)}>{a.headline}</strong>
                      <div className="np-party-positions">
                        {a.partyReactions.map((r, i) => (
                          <span key={i} className="np-mini-position" title={`${r.party}: ${positionLabels[r.position]}`}
                            style={{ background: r.color, opacity: r.position === "en-contra" ? 0.4 : 1 }}>
                            {r.party.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fact-checks summary */}
              <div className="np-section">
                <h3 className="np-section-title">RESUMEN DE VERIFICACIÓN</h3>
                <div className="np-factchecks">
                  {filteredArticles.flatMap((a) => a.factCheck.map((fc, i) => ({ ...fc, articleId: a.id, articleHeadline: a.headline, key: `${a.id}-${i}` }))).map((fc) => (
                    <div key={fc.key} className="np-factcheck-card">
                      <span className="np-verdict-badge" style={{ background: verdictColors[fc.verdict] }}>
                        {verdictLabels[fc.verdict]}
                      </span>
                      <p className="np-factcheck-claim">"{fc.claim}"</p>
                      <p className="np-factcheck-explanation">{fc.explanation}</p>
                      <button className="np-factcheck-link" onClick={() => openArticle(fc.articleId)}>
                        Ver artículo: {fc.articleHeadline}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="np-sidebar">
          {/* Editorials */}
          {data.editorials.length > 0 && (
            <div className="np-sidebar-section">
              <h3 className="np-sidebar-title">OPINIÓN</h3>
              {data.editorials.map((ed) => (
                <div key={ed.id} className="np-editorial">
                  <span className="np-editorial-badge">EDITORIAL</span>
                  <h4 className="np-editorial-title">{ed.title}</h4>
                  <p className="np-editorial-content">{ed.content}</p>
                  <div className="np-editorial-meta">
                    <span>{ed.author}</span>
                    <span>{new Date(ed.date).toLocaleDateString("es-ES")}</span>
                  </div>
                  <p className="np-editorial-disclaimer">{ed.disclaimer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Categories */}
          <div className="np-sidebar-section">
            <h3 className="np-sidebar-title">SECCIONES</h3>
            <div className="np-sidebar-cats">
              {data.categories.map((c) => (
                <button key={c.id} className="np-sidebar-cat" onClick={() => { setCategoryFilter(c.id as CategoryFilter); setSelectedArticleId(null); setTab("portada"); }}>
                  <span className="np-sidebar-cat-dot" style={{ background: categoryColors[c.id] }} />
                  <span>{c.label}</span>
                  <span className="np-sidebar-cat-count">{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="np-sidebar-section">
            <h3 className="np-sidebar-title">CIFRAS</h3>
            <div className="np-sidebar-stats">
              <div className="np-sidebar-stat">
                <span className="np-sidebar-stat-val">{data.stats.totalArticles}</span>
                <span>artículos analizados</span>
              </div>
              <div className="np-sidebar-stat">
                <span className="np-sidebar-stat-val">{data.stats.avgBenefitScore}/100</span>
                <span>beneficio medio</span>
              </div>
              <div className="np-sidebar-stat">
                <span className="np-sidebar-stat-val">{data.stats.partiesAnalyzed}</span>
                <span>partidos analizados</span>
              </div>
              <div className="np-sidebar-stat">
                <span className="np-sidebar-stat-val">{data.stats.sourcesReferenced}</span>
                <span>fuentes consultadas</span>
              </div>
            </div>
            <p className="np-sidebar-updated">Última actualización: {new Date(data.stats.lastUpdated).toLocaleString("es-ES")}</p>
          </div>

          {/* Methodology */}
          <div className="np-sidebar-section">
            <button className="np-methodology-toggle" onClick={() => setShowMethodology(!showMethodology)}>
              {showMethodology ? "▾" : "▸"} Metodología y transparencia
            </button>
            {showMethodology && (
              <div className="np-methodology-content">
                <p>{data.methodology}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}
