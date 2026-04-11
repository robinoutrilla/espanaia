"use client";
import { useState, useRef, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";

/* ═══════════════════════════════════════════════════════════════════════════
   /confidencial-vip — Servicio boutique de inteligencia politica
   Password-gated tool that generates professional intelligence reports
   using all RAG agents + Gemini, styled as confidential VIP briefings.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Recommended topics ────────────────────────────────────────────────────

interface TopicOption {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: string;
  category: "politico" | "judicial" | "economico" | "legislativo" | "electoral";
}

const RECOMMENDED_TOPICS: TopicOption[] = [
  {
    id: "escenario-electoral",
    title: "Escenario electoral y encuestas",
    description: "Probabilidad de elecciones anticipadas, expectativas electorales, movimientos de partidos y posibles coaliciones.",
    query: "Analiza el escenario electoral actual en Espana: probabilidad de elecciones anticipadas, ultimas encuestas, correlacion de fuerzas entre partidos, posibles coaliciones y movimientos estrategicos de los principales lideres politicos",
    icon: "box",
    category: "electoral",
  },
  {
    id: "presupuestos",
    title: "Presupuestos Generales del Estado",
    description: "Estado de negociacion de los PGE, posiciones de los grupos parlamentarios, partidas clave y escenarios de aprobacion.",
    query: "Informe sobre el estado de los Presupuestos Generales del Estado: negociaciones en curso, posiciones de los grupos parlamentarios, principales partidas presupuestarias, probabilidad de aprobacion y consecuencias de una prorroga",
    icon: "chart",
    category: "economico",
  },
  {
    id: "gobierno-socios",
    title: "Relaciones en el Gobierno de coalicion",
    description: "Tensiones entre socios de gobierno, acuerdos, discrepancias y riesgo de crisis de gobierno.",
    query: "Analisis de las relaciones entre los socios del Gobierno de coalicion: principales tensiones, acuerdos recientes, discrepancias en politicas clave, riesgo de crisis de gobierno y posibles escenarios de remodelacion ministerial",
    icon: "people",
    category: "politico",
  },
  {
    id: "poder-judicial",
    title: "Movimientos en el Poder Judicial",
    description: "CGPJ, Fiscalia General, Tribunal Supremo, Audiencia Nacional: nombramientos, casos clave y equilibrio de fuerzas.",
    query: "Informe sobre la trastienda del Poder Judicial espanol: situacion del CGPJ, movimientos en la Fiscalia General del Estado, casos relevantes en el Tribunal Supremo y Audiencia Nacional, nombramientos pendientes y equilibrio de fuerzas entre asociaciones judiciales",
    icon: "scales",
    category: "judicial",
  },
  {
    id: "tramitacion-legislativa",
    title: "Agenda legislativa y proyectos de ley",
    description: "Proyectos de ley en tramitacion, proposiciones de ley, enmiendas clave y calendario parlamentario.",
    query: "Resumen de la actividad legislativa actual: proyectos de ley en tramitacion en el Congreso, proposiciones de ley mas relevantes, estado de las enmiendas, calendario parlamentario de las proximas semanas y previsiones de aprobacion",
    icon: "scroll",
    category: "legislativo",
  },
  {
    id: "economia-macro",
    title: "Panorama macroeconomico y riesgos",
    description: "PIB, empleo, inflacion, deuda publica, comparativa con la UE y riesgos a medio plazo.",
    query: "Informe macroeconomico de Espana: evolucion del PIB, datos de empleo y paro, inflacion, deuda publica, comparativa con la UE-27 segun Eurostat, principales riesgos economicos y previsiones a corto plazo del Banco de Espana y AIReF",
    icon: "trending",
    category: "economico",
  },
  {
    id: "ccaa-tensiones",
    title: "Tensiones territoriales y financiacion",
    description: "Conflictos entre CCAA y Estado, financiacion autonomica, elecciones autonomicas y dinamicas territoriales.",
    query: "Analisis de las tensiones territoriales en Espana: financiacion autonomica, conflictos competenciales entre CCAA y Estado, dinamicas politicas en las comunidades clave (Cataluna, Pais Vasco, Madrid, Andalucia), y posibles escenarios de reforma del modelo territorial",
    icon: "map",
    category: "politico",
  },
  {
    id: "ue-espana",
    title: "Espana en la Union Europea",
    description: "Fondos europeos, NextGenerationEU, cumplimiento de recomendaciones, posicion de Espana en el Consejo.",
    query: "Informe sobre la posicion de Espana en la UE: estado de los fondos NextGenerationEU, cumplimiento de hitos y reformas, recomendaciones del Semestre Europeo, posicion espanola en los debates del Consejo y perspectivas de influencia en las instituciones europeas",
    icon: "globe",
    category: "economico",
  },
];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  politico: { label: "Politico", color: "#dc2626" },
  judicial: { label: "Judicial", color: "#7c3aed" },
  economico: { label: "Economico", color: "#2563eb" },
  legislativo: { label: "Legislativo", color: "#b45309" },
  electoral: { label: "Electoral", color: "#059669" },
};

// ── Markdown renderer ─────────────────────────────────────────────────────

function renderMarkdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="vip-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="vip-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="vip-h1">$1</h1>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="vip-hr"/>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // Paragraphs (lines that don't start with < )
    .replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, '<p>$1</p>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

  return html;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ConfidencialVipPage() {
  // Auth state
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Report state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalContext, setTotalContext] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);

  // ── Auth handler ──
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    // Client-side check (server also validates)
    if (trimmed === "647510884" || trimmed === "650384410") {
      setAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Codigo de acceso incorrecto");
      setPassword("");
    }
  };

  // ── Generate report ──
  const generateReport = useCallback(async (topic: string) => {
    setIsGenerating(true);
    setReport(null);
    setSources([]);
    setStatusMessages([]);
    setTotalContext(0);

    try {
      const res = await fetch("/api/confidencial-vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, password: password.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "status") {
                setStatusMessages(prev => [...prev, data.message]);
              } else if (currentEvent === "done") {
                setReport(data.report);
                setSources(data.sources ?? []);
                setTotalContext(data.totalContext ?? 0);
              } else if (currentEvent === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
            currentEvent = "";
          }
        }
      }
    } catch (err) {
      setReport(`# Error\n\n${err instanceof Error ? err.message : "Error desconocido al generar el informe."}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [password]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = selectedTopic
      ? RECOMMENDED_TOPICS.find(t => t.id === selectedTopic)?.query ?? ""
      : customTopic.trim();
    if (topic.length >= 5) {
      generateReport(topic);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── PASSWORD GATE ──
  if (!authenticated) {
    return (
      <main className="page-shell detail-page">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <SiteHeader currentSection="confidencial-vip" />

        <section style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "70vh", padding: "var(--space-xl)",
        }}>
          <div style={{
            maxWidth: 440, width: "100%", padding: "40px",
            borderRadius: "16px",
            background: "var(--surface-raised, var(--surface))",
            border: "2px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
            {/* Lock icon */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #1e3a5f, #0F4483)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", color: "#fff",
                boxShadow: "0 4px 16px rgba(15,68,131,0.3)",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>

            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, textAlign: "center", marginBottom: "4px" }}>
              Confidencial VIP
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", textAlign: "center", marginBottom: "24px" }}>
              Servicio restringido de inteligencia politica.<br />
              Introduzca su codigo de acceso para continuar.
            </p>

            <form onSubmit={handleAuth}>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                placeholder="Codigo de acceso"
                autoFocus
                style={{
                  width: "100%", padding: "14px 16px", fontSize: "1.05rem",
                  fontWeight: 600, textAlign: "center", letterSpacing: "3px",
                  borderRadius: "10px", border: `2px solid ${authError ? "#dc2626" : "var(--border)"}`,
                  background: "var(--bg)", color: "var(--ink)",
                  outline: "none", transition: "border-color 200ms",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--azul)"}
                onBlur={(e) => e.currentTarget.style.borderColor = authError ? "#dc2626" : "var(--border)"}
              />

              {authError && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", textAlign: "center", marginTop: "8px", fontWeight: 600 }}>
                  {authError}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%", padding: "14px", fontSize: "0.95rem", fontWeight: 700,
                  borderRadius: "10px", border: "none", marginTop: "16px",
                  background: "linear-gradient(135deg, #1e3a5f, #0F4483)",
                  color: "#fff", cursor: "pointer",
                  transition: "transform 100ms, opacity 150ms",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Acceder
              </button>
            </form>

            <p style={{ fontSize: "0.7rem", color: "var(--ink-muted)", textAlign: "center", marginTop: "20px" }}>
              IAN — Unidad de Inteligencia Politica
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ── MAIN TOOL (authenticated) ──
  return (
    <main className="page-shell detail-page vip-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="confidencial-vip" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow" style={{ color: "#b91c1c" }}>Servicio Confidencial VIP</span>
            <h1 className="detail-title">
              Informes de Inteligencia Politica
            </h1>
            <p className="detail-description">
              Generacion automatizada de informes confidenciales basados en {" "}
              <strong>6 agentes RAG</strong>, datos en tiempo real del BOE (277K disposiciones),
              INE, Eurostat, RSS de 14 medios y toda la base de datos parlamentaria.
              Seleccione un tema recomendado o introduzca el suyo.
            </p>
          </div>

          <aside className="kpi-panel" style={{ borderColor: "#991b1b33" }}>
            <h2 className="kpi-panel-header" style={{ color: "#991b1b" }}>Inteligencia activa</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong style={{ color: "#dc2626" }}>6</strong><span>Agentes RAG</span></div>
              <div className="kpi-cell"><strong style={{ color: "#dc2626" }}>277K</strong><span>BOE items</span></div>
              <div className="kpi-cell"><strong style={{ color: "#dc2626" }}>17</strong><span>Indicadores live</span></div>
              <div className="kpi-cell"><strong style={{ color: "#dc2626" }}>14</strong><span>Medios RSS</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Topic selector ────────────────────────────────────────── */}
      <section className="panel section-panel">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "4px", textAlign: "center" }}>
          Seleccione el tema del informe
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", textAlign: "center", marginBottom: "var(--space-lg)" }}>
          Elija uno de los temas recomendados o introduzca su propio tema de analisis
        </p>

        {/* Recommended topics grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px", marginBottom: "var(--space-lg)",
        }}>
          {RECOMMENDED_TOPICS.map(topic => {
            const isSelected = selectedTopic === topic.id;
            const catMeta = CATEGORY_META[topic.category];
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setSelectedTopic(isSelected ? null : topic.id);
                  setCustomTopic("");
                }}
                style={{
                  padding: "16px", borderRadius: "10px", textAlign: "left",
                  cursor: "pointer", transition: "all 150ms",
                  background: isSelected ? `${catMeta.color}08` : "var(--surface-raised, var(--surface))",
                  border: isSelected ? `2px solid ${catMeta.color}` : "1px solid var(--border)",
                  outline: "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.5px", color: catMeta.color,
                    padding: "2px 8px", borderRadius: "4px",
                    background: `${catMeta.color}14`,
                  }}>
                    {catMeta.label}
                  </span>
                  {isSelected && (
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: catMeta.color, color: "#fff",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 800,
                    }}>
                      ✓
                    </span>
                  )}
                </div>
                <strong style={{ fontSize: "0.88rem", display: "block", marginBottom: "4px" }}>
                  {topic.title}
                </strong>
                <p style={{ fontSize: "0.76rem", color: "var(--ink-soft)", lineHeight: 1.4, margin: 0 }}>
                  {topic.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom topic */}
        <div style={{
          padding: "20px", borderRadius: "12px",
          background: "var(--surface-raised, var(--surface))",
          border: "1px solid var(--border)",
          marginBottom: "var(--space-lg)",
        }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px" }}>
            O introduzca su propio tema de analisis:
          </label>
          <textarea
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              if (e.target.value.trim().length > 0) setSelectedTopic(null);
            }}
            placeholder="Ej: Impacto de la reforma de la ley de vivienda en el sector inmobiliario, con analisis de las enmiendas presentadas y calendario de aprobacion..."
            rows={3}
            style={{
              width: "100%", padding: "12px 16px", fontSize: "0.9rem",
              borderRadius: "8px", border: "2px solid var(--border)",
              background: "var(--bg)", color: "var(--ink)",
              resize: "vertical", outline: "none",
              fontFamily: "inherit", lineHeight: 1.5,
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--azul)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
          />
        </div>

        {/* Generate button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!selectedTopic && customTopic.trim().length < 5)}
            style={{
              padding: "16px 48px", fontSize: "1rem", fontWeight: 700,
              borderRadius: "10px", border: "none",
              background: isGenerating
                ? "var(--ink-muted)"
                : "linear-gradient(135deg, #991b1b, #dc2626)",
              color: "#fff", cursor: isGenerating ? "wait" : "pointer",
              transition: "all 150ms", minWidth: 280,
              opacity: (!selectedTopic && customTopic.trim().length < 5) ? 0.5 : 1,
            }}
          >
            {isGenerating ? "Generando informe..." : "Generar Informe Confidencial"}
          </button>
        </div>
      </section>

      {/* ── Status messages ───────────────────────────────────────── */}
      {statusMessages.length > 0 && isGenerating && (
        <section className="panel section-panel" style={{ animation: "fadeIn 300ms ease" }}>
          <div style={{
            maxWidth: 600, margin: "0 auto", padding: "16px",
            borderRadius: "10px", background: "#0F448308", border: "1px solid #0F448320",
          }}>
            {statusMessages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 0", fontSize: "0.8rem",
                color: i === statusMessages.length - 1 ? "var(--azul)" : "var(--ink-muted)",
                fontWeight: i === statusMessages.length - 1 ? 600 : 400,
              }}>
                {i === statusMessages.length - 1 ? (
                  <span className="vip-spinner" />
                ) : (
                  <span style={{ color: "var(--verde)" }}>✓</span>
                )}
                {msg}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Report ────────────────────────────────────────────────── */}
      {report && (
        <section
          ref={reportRef}
          className="panel section-panel vip-report-section"
          style={{ animation: "fadeIn 500ms ease" }}
        >
          {/* Report toolbar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "var(--space-md)", flexWrap: "wrap", gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                padding: "4px 10px", borderRadius: "6px", fontSize: "0.72rem",
                fontWeight: 700, background: "#dc262614", color: "#dc2626",
                textTransform: "uppercase", letterSpacing: "1px",
              }}>
                Confidencial
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
                {totalContext} fragmentos de inteligencia procesados
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600,
                  borderRadius: "6px", border: "1px solid var(--border)",
                  background: "var(--surface)", color: "var(--ink)", cursor: "pointer",
                }}
              >
                Imprimir / PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(report);
                }}
                style={{
                  padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600,
                  borderRadius: "6px", border: "1px solid var(--border)",
                  background: "var(--surface)", color: "var(--ink)", cursor: "pointer",
                }}
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Report content */}
          <div
            className="vip-report-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(report) }}
          />

          {/* Sources */}
          {sources.length > 0 && (
            <div style={{
              marginTop: "var(--space-lg)", padding: "16px", borderRadius: "10px",
              background: "var(--surface-raised, var(--surface))", border: "1px solid var(--border)",
            }}>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "8px" }}>
                Fuentes RAG utilizadas ({sources.length})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {sources.map((src, i) => (
                  <span key={i} className="micro-tag" style={{ fontSize: "0.7rem" }}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── CSS ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vip-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid var(--border);
          border-top-color: var(--azul);
          border-radius: 50%;
          animation: spin 600ms linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .vip-report-content {
          padding: 32px;
          border-radius: 12px;
          background: #fefefe;
          border: 1px solid #e5e7eb;
          color: #1a1a1a;
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 0.92rem;
          line-height: 1.7;
          max-width: 860px;
          margin: 0 auto;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        @media (prefers-color-scheme: dark) {
          .vip-report-content {
            background: #1c1c1e;
            border-color: #333;
            color: #e5e5e5;
          }
        }

        .vip-report-content .vip-h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #991b1b;
          border-bottom: 2px solid #991b1b;
          padding-bottom: 8px;
          margin: 0 0 16px 0;
          font-family: 'Open Sans', sans-serif;
          letter-spacing: -0.5px;
        }
        .vip-report-content .vip-h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e3a5f;
          margin: 24px 0 8px 0;
          font-family: 'Open Sans', sans-serif;
        }
        .vip-report-content .vip-h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
          margin: 20px 0 8px 0;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-family: 'Open Sans', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.88rem;
        }
        @media (prefers-color-scheme: dark) {
          .vip-report-content .vip-h3 { border-top-color: #444; color: #ccc; }
          .vip-report-content .vip-h2 { color: #7cb3e6; }
          .vip-report-content .vip-h1 { color: #f87171; border-bottom-color: #f87171; }
        }
        .vip-report-content .vip-hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, #991b1b, transparent);
          margin: 16px 0;
        }
        .vip-report-content p {
          margin: 0 0 10px 0;
        }
        .vip-report-content strong {
          color: #111827;
        }
        @media (prefers-color-scheme: dark) {
          .vip-report-content strong { color: #f3f4f6; }
        }
        .vip-report-content ul {
          margin: 8px 0 12px 0;
          padding-left: 20px;
        }
        .vip-report-content li {
          margin-bottom: 4px;
        }
        .vip-report-content em {
          color: #6b7280;
          font-style: italic;
        }

        /* Print styles */
        @media print {
          .page-shell > *:not(.vip-report-section) { display: none !important; }
          .vip-report-section {
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
          .vip-report-content {
            box-shadow: none !important;
            border: none !important;
          }
          .vip-report-section > div:first-child { display: none !important; }
          .vip-report-section > div:last-child { display: none !important; }
        }
      `}</style>
    </main>
  );
}
