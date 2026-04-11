"use client";

import { useState } from "react";
import type { ChatAction } from "./research-chat";

/* ═══════════════════════════════════════════════════════════════════════════
   Research Context Panel — right-side panel that shows contextual info
   when the user clicks an action in a chat response. Displays pipelines,
   territories, parties or external links.
   ═══════════════════════════════════════════════════════════════════════════ */

const AGENT_META: Record<string, { icon: string; color: string; label: string; description: string; sources: string[]; capabilities: string[] }> = {
  normativo: {
    icon: "N", color: "var(--rojo)", label: "RAG Normativo",
    description: "Búsqueda semántica sobre documentos legales y oficiales del BOE, BORME, EUR-Lex y boletines autonómicos.",
    sources: ["BOE", "BORME", "EUR-Lex", "17 boletines autonómicos"],
    capabilities: ["Búsqueda semántica en normas", "Trazabilidad de citas", "Impacto territorial"],
  },
  presupuestario: {
    icon: "P", color: "var(--azul)", label: "RAG Presupuestario",
    description: "Análisis presupuestario 2020–2026 con text-to-SQL para consultas numéricas sobre ejecución, déficit y fondos NGEU.",
    sources: ["IGAE", "Presupuestos CCAA", "Eurostat", "NextGenEU"],
    capabilities: ["Comparación interterritorial", "Forecast 7 años", "Text-to-SQL"],
  },
  "politico-social": {
    icon: "S", color: "var(--verde)", label: "RAG Político-Social",
    description: "Perfiles de cargos públicos, pulso social y actividad parlamentaria. Datos de Congreso, Senado, Wikidata y redes abiertas.",
    sources: ["Congreso", "Senado", "Wikidata", "Mastodon/Bluesky"],
    capabilities: ["Perfil completo", "Pulso social", "Timeline parlamentaria"],
  },
  empresarial: {
    icon: "E", color: "#b45309", label: "RAG Empresarial",
    description: "Inteligencia empresarial cruzando BORME, contratación pública y registro mercantil.",
    sources: ["BORME", "Contratación Pública", "CNMC", "R. Mercantil"],
    capabilities: ["Mapa empresa-cargo", "Puertas giratorias", "Concentración licitaciones"],
  },
  medios: {
    icon: "M", color: "#7c3aed", label: "RAG Medios",
    description: "Noticias de 14 fuentes de prensa, agencias e instituciones. Titulares vinculados a políticos, partidos y territorios.",
    sources: ["RTVE", "El País", "El Mundo", "Europa Press", "+10 medios"],
    capabilities: ["Titulares recientes", "Cobertura por entidad", "Pulso mediático"],
  },
};

interface Props {
  action: ChatAction | null;
  onClose: () => void;
}

export function ResearchContextPanel({ action, onClose }: Props) {
  if (!action) {
    return (
      <div className="research-context-empty">
        <span className="eyebrow">Panel de contexto</span>
        <p>Haz una pregunta y pulsa en las acciones de la respuesta para explorar los datos aqu{"í"}.</p>

        <div className="research-context-rag-grid">
          {Object.entries(AGENT_META).map(([id, meta]) => (
            <div key={id} className="research-context-rag-card">
              <div className="research-context-rag-card-header">
                <span className="research-context-pipeline-icon research-context-pipeline-icon-sm" style={{ background: meta.color }}>
                  {meta.icon}
                </span>
                <strong>{meta.label}</strong>
              </div>
              <p className="research-context-rag-desc">{meta.description}</p>
              <div className="research-context-tags">
                {meta.sources.slice(0, 3).map((s) => (
                  <span className="micro-tag" key={s}>{s}</span>
                ))}
                {meta.sources.length > 3 && (
                  <span className="micro-tag">+{meta.sources.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="research-context-hints">
          <div className="research-context-hint">
            <span>🗺️</span> <strong>Territorios</strong> — ficha con indicadores de cada CCAA
          </div>
          <div className="research-context-hint">
            <span>🏛️</span> <strong>Partidos</strong> — perfil parlamentario y votaciones
          </div>
          <div className="research-context-hint">
            <span>📊</span> <strong>Fuentes</strong> — estado de ingesti{"ó"}n de cada conector
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="research-context-content">
      <div className="research-context-header">
        <span className="eyebrow">{actionTypeLabel(action.type)}</span>
        <button className="research-context-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      </div>

      {action.type === "open-pipeline" && renderPipeline(action.id)}
      {action.type === "open-territory" && renderEntityCard(action, "territorio")}
      {action.type === "open-party" && renderEntityCard(action, "partido")}
      {action.type === "open-source" && renderSourceCard(action)}
      {action.type === "open-link" && renderLinkCard(action)}
    </div>
  );
}

function actionTypeLabel(type: ChatAction["type"]): string {
  switch (type) {
    case "open-pipeline": return "Motor RAG";
    case "open-territory": return "Territorio";
    case "open-party": return "Partido";
    case "open-source": return "Fuente de datos";
    case "open-link": return "Enlace externo";
    default: return "Detalle";
  }
}

function renderPipeline(id: string) {
  const meta = AGENT_META[id];
  if (!meta) return <p>Pipeline no encontrado: {id}</p>;
  return (
    <div className="research-context-pipeline">
      <div className="research-context-pipeline-header">
        <span className="research-context-pipeline-icon" style={{ background: meta.color }}>
          {meta.icon}
        </span>
        <h3>{meta.label}</h3>
      </div>
      <p>{meta.description}</p>
      <div className="research-context-section">
        <strong>Fuentes</strong>
        <div className="research-context-tags">
          {meta.sources.map((s) => (
            <span className="micro-tag" key={s}>{s}</span>
          ))}
        </div>
      </div>
      <div className="research-context-section">
        <strong>Capacidades</strong>
        <div className="research-context-tags">
          {meta.capabilities.map((c) => (
            <span className="micro-tag" key={c}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmbeddedPage({ href, label, fallbackText }: { href: string; label: string; fallbackText: string }) {
  const [loaded, setLoaded] = useState(false);
  const isInternal = href.startsWith("/");

  if (!isInternal) {
    return (
      <div className="research-context-entity">
        <h3>{label}</h3>
        <p>{fallbackText}</p>
        <a
          className="research-context-link-btn"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir {href.replace(/https?:\/\/(www\.)?/, "").split("/")[0]} ↗
        </a>
      </div>
    );
  }

  return (
    <div className="research-context-embed">
      <div className="research-context-embed-header">
        <h3>{label}</h3>
        <a
          className="research-context-link-btn-small"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir en pesta{"ñ"}a ↗
        </a>
      </div>
      {!loaded && (
        <div className="research-context-embed-loading">
          <span className="research-chat-status-spinner" />
          Cargando...
        </div>
      )}
      <iframe
        src={href}
        className="research-context-iframe"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0 }}
        title={label}
      />
    </div>
  );
}

function renderEntityCard(action: ChatAction, tipo: string) {
  if (action.href) {
    return <EmbeddedPage href={action.href} label={action.label} fallbackText={`Ficha de ${tipo} en IAÑ.`} />;
  }
  return (
    <div className="research-context-entity">
      <h3>{action.label}</h3>
      <p>Ficha de {tipo} en IAÑ. Haz clic para ver todos los indicadores, votaciones y datos asociados.</p>
    </div>
  );
}

function renderSourceCard(action: ChatAction) {
  return <EmbeddedPage href="/sources" label={action.label} fallbackText="Fuente de datos en el inventario de IAÑ." />;
}

function renderLinkCard(action: ChatAction) {
  if (!action.href) return null;
  return <EmbeddedPage href={action.href} label={action.label} fallbackText="Enlace a fuente oficial externa." />;
}
