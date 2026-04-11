"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   Research Chat — conversational interface with actionable responses.
   Left panel: full chat history with input at bottom.
   Communicates with parent via onAction callback to open sources/sections
   in the right-side context panel.
   ═══════════════════════════════════════════════════════════════════════════ */

const AGENT_COLORS: Record<string, { bg: string; fg: string; icon: string; label: string }> = {
  normativo: { bg: "var(--rojo-soft)", fg: "var(--rojo)", icon: "N", label: "RAG Normativo" },
  presupuestario: { bg: "var(--azul-soft)", fg: "var(--azul)", icon: "P", label: "RAG Presupuestario" },
  "politico-social": { bg: "var(--verde-soft)", fg: "var(--verde)", icon: "S", label: "RAG Político-Social" },
  empresarial: { bg: "#fef3c7", fg: "#b45309", icon: "E", label: "RAG Empresarial" },
  medios: { bg: "#ede9fe", fg: "#7c3aed", icon: "M", label: "RAG Medios" },
  ministerios: { bg: "#dbeafe", fg: "#1d4ed8", icon: "G", label: "RAG Ministerios" },
};

/** Actions that can be emitted to the right panel */
export interface ChatAction {
  type: "open-source" | "open-pipeline" | "open-territory" | "open-party" | "open-link";
  id: string;
  label: string;
  href?: string;
}

interface AgentInfo {
  id: string;
  name: string;
  chunks: number;
  sources: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: string[];
  agents?: AgentInfo[];
  routedTo?: string[];
  totalContext?: number;
  actions?: ChatAction[];
  timestamp: number;
}

/** Suggested starter questions */
const SUGGESTIONS: { query: string; actions: ChatAction[] }[] = [
  {
    query: "¿Qué normas del BOE afectan a la vivienda en 2026?",
    actions: [
      { type: "open-pipeline", id: "normativo", label: "Ver RAG Normativo" },
      { type: "open-link", id: "boe", label: "Abrir BOE", href: "https://www.boe.es" },
    ],
  },
  {
    query: "¿Cuánto ha ejecutado Andalucía de su presupuesto?",
    actions: [
      { type: "open-territory", id: "andalucia", label: "Ver Andalucía", href: "/territories/andalucia" },
      { type: "open-source", id: "igae", label: "Ver IGAE" },
    ],
  },
  {
    query: "¿Qué diputados del PP son de Madrid?",
    actions: [
      { type: "open-party", id: "pp", label: "Ver PP", href: "/parties/pp" },
      { type: "open-link", id: "congreso", label: "Abrir Congreso", href: "https://www.congreso.es" },
    ],
  },
  {
    query: "¿Qué empresas lideran la contratación pública en Cataluña?",
    actions: [
      { type: "open-pipeline", id: "empresarial", label: "Ver RAG Empresarial" },
      { type: "open-territory", id: "cataluna", label: "Ver Cataluña", href: "/territories/cataluna" },
    ],
  },
];

/** Extract inline actions from answer text based on keywords */
function inferActions(answer: string, sources: string[], routedTo: string[]): ChatAction[] {
  const actions: ChatAction[] = [];
  const seen = new Set<string>();

  // Add pipeline actions for routed agents
  for (const id of routedTo) {
    const colors = AGENT_COLORS[id];
    if (colors && !seen.has(`pipeline-${id}`)) {
      seen.add(`pipeline-${id}`);
      actions.push({ type: "open-pipeline", id, label: `Ver ${colors.label}` });
    }
  }

  // Detect territory mentions
  const territoryMap: Record<string, { slug: string; name: string }> = {
    andaluc: { slug: "andalucia", name: "Andalucía" },
    catalu: { slug: "cataluna", name: "Cataluña" },
    madrid: { slug: "madrid", name: "Madrid" },
    valenci: { slug: "comunitat-valenciana", name: "C. Valenciana" },
    "país vasco": { slug: "pais-vasco", name: "País Vasco" },
    euskadi: { slug: "pais-vasco", name: "País Vasco" },
    galic: { slug: "galicia", name: "Galicia" },
    aragon: { slug: "aragon", name: "Aragón" },
    navarr: { slug: "navarra", name: "Navarra" },
    murc: { slug: "murcia", name: "Murcia" },
    canar: { slug: "canarias", name: "Canarias" },
    astur: { slug: "asturias", name: "Asturias" },
    cantabr: { slug: "cantabria", name: "Cantabria" },
    extrem: { slug: "extremadura", name: "Extremadura" },
    rioj: { slug: "la-rioja", name: "La Rioja" },
    balear: { slug: "illes-balears", name: "Illes Balears" },
    "castilla y le": { slug: "castilla-y-leon", name: "Castilla y León" },
    "castilla-la": { slug: "castilla-la-mancha", name: "Castilla-La Mancha" },
  };
  const lower = answer.toLowerCase();
  for (const [keyword, terr] of Object.entries(territoryMap)) {
    if (lower.includes(keyword) && !seen.has(`territory-${terr.slug}`)) {
      seen.add(`territory-${terr.slug}`);
      actions.push({ type: "open-territory", id: terr.slug, label: `Ver ${terr.name}`, href: `/territories/${terr.slug}` });
      if (actions.length >= 5) break;
    }
  }

  // Detect party mentions
  const partyMap: Record<string, { slug: string; name: string }> = {
    " pp ": { slug: "pp", name: "PP" },
    "popular": { slug: "pp", name: "PP" },
    "psoe": { slug: "psoe", name: "PSOE" },
    "socialista": { slug: "psoe", name: "PSOE" },
    " vox": { slug: "vox", name: "VOX" },
    "sumar": { slug: "sumar", name: "Sumar" },
    "podemos": { slug: "podemos", name: "Podemos" },
    "bildu": { slug: "eh-bildu", name: "EH Bildu" },
    "esquerra": { slug: "erc", name: "ERC" },
    "junts": { slug: "junts", name: "Junts" },
  };
  for (const [keyword, party] of Object.entries(partyMap)) {
    if (lower.includes(keyword) && !seen.has(`party-${party.slug}`)) {
      seen.add(`party-${party.slug}`);
      actions.push({ type: "open-party", id: party.slug, label: `Ver ${party.name}`, href: `/parties/${party.slug}` });
      if (actions.length >= 6) break;
    }
  }

  // Source links
  if (sources.includes("BOE") || lower.includes("boe")) {
    actions.push({ type: "open-link", id: "boe", label: "Abrir BOE", href: "https://www.boe.es" });
  }
  if (sources.includes("Congreso") || lower.includes("congreso")) {
    actions.push({ type: "open-link", id: "congreso", label: "Abrir Congreso", href: "https://www.congreso.es" });
  }

  return actions.slice(0, 6);
}

interface Props {
  onAction: (action: ChatAction) => void;
}

/** Status step shown during streaming */
interface StatusStep {
  step: string;
  message: string;
  agent?: string;
  chunks?: number;
  done?: boolean;
}

const STORAGE_KEY = "ian-research-chat";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: ChatMessage[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
}

export function ResearchChat({ onAction }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages to sessionStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom on new messages or status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, statusSteps]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleSuggestion = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStatusSteps([]);

    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errMsg = `Error ${res.status}`;
        try { errMsg = JSON.parse(errText).error ?? errMsg; } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? ""; // keep incomplete chunk

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (eventType === "status") {
            setStatusSteps((prev) => {
              // Replace last step if same agent searching→done, else append
              if (data.step === "agent-done" && prev.length > 0) {
                const last = prev[prev.length - 1];
                if (last.agent === data.agent) {
                  return [...prev.slice(0, -1), { ...data, done: true }];
                }
              }
              return [...prev, data];
            });
          } else if (eventType === "done") {
            const answer = data.answer ?? "Sin respuesta.";
            const sources = data.sources ?? [];
            const agents = data.agents ?? [];
            const routedTo = data.routedTo ?? [];
            const totalContext = data.totalContext ?? 0;
            const actions = inferActions(answer, sources, routedTo);

            const assistantMsg: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: answer,
              sources,
              agents,
              routedTo,
              totalContext,
              actions,
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
          } else if (eventType === "error") {
            throw new Error(data.error ?? "Error desconocido");
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "system",
        content: `Error al procesar la consulta: ${msg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setStatusSteps([]);
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="research-chat">
      {/* Message area */}
      <div className="research-chat-messages">
        {isEmpty ? (
          <div className="research-chat-empty">
            <span className="eyebrow">Investigaci{"ó"}n</span>
            <h2>Pregunta a los datos de Espa{"ñ"}a</h2>
            <p>
              Seis motores RAG procesan fuentes oficiales espa{"ñ"}olas y europeas.
              Cada respuesta incluye citas trazables y acciones para explorar los datos.
            </p>

            <div className="research-chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.query}
                  className="research-chat-suggestion"
                  onClick={() => handleSuggestion(s.query)}
                >
                  <span className="research-chat-suggestion-icon">/ask</span>
                  <span>{s.query}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="research-chat-history">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`research-chat-msg research-chat-msg-${msg.role}`}
              >
                {msg.role === "user" ? (
                  <div className="research-chat-bubble research-chat-bubble-user">
                    {msg.content}
                  </div>
                ) : msg.role === "system" ? (
                  <div className="research-chat-bubble research-chat-bubble-error">
                    {msg.content}
                  </div>
                ) : (
                  <div className="research-chat-bubble research-chat-bubble-assistant">
                    {/* Agent badges */}
                    {msg.routedTo && msg.routedTo.length > 0 && (
                      <div className="research-chat-agents">
                        {msg.routedTo.map((id) => {
                          const colors = AGENT_COLORS[id] ?? { bg: "var(--surface)", fg: "var(--ink-muted)", icon: "?", label: id };
                          const agent = msg.agents?.find((a) => a.id === id);
                          return (
                            <span
                              key={id}
                              className="research-chat-agent-badge"
                              style={{ background: colors.bg, color: colors.fg }}
                            >
                              <span className="research-chat-agent-icon" style={{ background: colors.fg }}>
                                {colors.icon}
                              </span>
                              {colors.label}
                              {agent && agent.chunks > 0 && (
                                <span className="research-chat-agent-count">{agent.chunks}</span>
                              )}
                            </span>
                          );
                        })}
                        {msg.totalContext != null && msg.totalContext > 0 && (
                          <span className="research-chat-context-count">
                            {msg.totalContext} fragmentos
                          </span>
                        )}
                      </div>
                    )}

                    {/* Answer text */}
                    <div className="research-chat-answer">{renderMarkdown(msg.content)}</div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="research-chat-sources">
                        <span className="research-chat-sources-label">Fuentes</span>
                        {msg.sources.map((s, i) => (
                          <span className="micro-tag" key={i}>{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="research-chat-actions">
                        {msg.actions.map((action) =>
                          action.href && (action.type === "open-territory" || action.type === "open-party") ? (
                            <Link
                              key={action.id}
                              className="research-chat-action-btn"
                              href={action.href}
                              onClick={(e) => {
                                e.preventDefault();
                                onAction(action);
                              }}
                            >
                              {actionIcon(action.type)} {action.label}
                            </Link>
                          ) : (
                            <button
                              key={action.id}
                              className="research-chat-action-btn"
                              onClick={() => onAction(action)}
                            >
                              {actionIcon(action.type)} {action.label}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="research-chat-msg research-chat-msg-assistant">
                <div className="research-chat-bubble research-chat-bubble-loading">
                  <div className="research-chat-status-steps">
                    {statusSteps.map((s, i) => (
                      <div
                        key={i}
                        className={`research-chat-status-step ${s.done ? "research-chat-status-done" : ""}`}
                      >
                        {s.done ? (
                          <span className="research-chat-status-check">✓</span>
                        ) : i === statusSteps.length - 1 ? (
                          <span className="research-chat-status-spinner" />
                        ) : (
                          <span className="research-chat-status-check">✓</span>
                        )}
                        <span>{s.message}</span>
                        {s.chunks != null && s.chunks > 0 && (
                          <span className="research-chat-status-badge">{s.chunks}</span>
                        )}
                      </div>
                    ))}
                    {statusSteps.length === 0 && (
                      <div className="research-chat-status-step">
                        <span className="research-chat-status-spinner" />
                        <span>Iniciando consulta...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar — always at bottom */}
      <form className="research-chat-input-bar" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
          rows={1}
          className="research-chat-textarea"
        />
        <button
          type="submit"
          className="research-chat-send"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

/** Tag colors for RAG context blocks like [Ministerio], [Partido], etc. */
const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  ministerio: { bg: "#dbeafe", fg: "#1d4ed8" },
  partido: { bg: "#fee2e2", fg: "#dc2626" },
  politico: { bg: "#d1fae5", fg: "#059669" },
  "legislación ue": { bg: "#fef3c7", fg: "#b45309" },
  "infracción ue": { bg: "#fecaca", fg: "#991b1b" },
  "transposición": { bg: "#e0e7ff", fg: "#4338ca" },
  sesion: { bg: "#f3e8ff", fg: "#7c3aed" },
  empresa: { bg: "#fef3c7", fg: "#92400e" },
  contrato: { bg: "#ecfccb", fg: "#3f6212" },
  medio: { bg: "#ede9fe", fg: "#6d28d9" },
  presupuesto: { bg: "#cffafe", fg: "#0e7490" },
};

function getTagColor(tag: string): { bg: string; fg: string } {
  const lower = tag.toLowerCase();
  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return { bg: "#f3f4f6", fg: "#374151" };
}

/** Render inline formatting: **bold**, *italic*, `code` */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<code key={`c-${keyPrefix}-${match.index}`} className="rc-inline-code">{match[2]}</code>);
    } else if (match[3]) {
      parts.push(<strong key={`b-${keyPrefix}-${match.index}`}>{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={`i-${keyPrefix}-${match.index}`}>{match[4]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/** Render markdown with headers, lists, RAG blocks, and paragraphs */
function renderMarkdown(text: string): React.ReactNode {
  // Strip the "[LLM no configurado...]" or "[Error LLM...]" prefix line
  const cleanedText = text
    .replace(/^\[LLM no configurado[^\]]*\]\s*\n*/i, "")
    .replace(/^\[Error LLM[^\]]*\]\s*\n*/i, "")
    .replace(/^Contexto RAG disponible:\s*\n*/i, "")
    .trim();

  const lines = cleanedText.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) { i++; continue; }

    // RAG context block: [Tag] Content. Key: value. Key: value.
    const ragMatch = trimmed.match(/^\[([^\]]+)\]\s*(.+)/);
    if (ragMatch) {
      const tag = ragMatch[1];
      const content = ragMatch[2];
      const color = getTagColor(tag);

      // Parse "Key: value." segments into structured display
      const segments = content.split(/\.\s+/).filter(Boolean);
      const title = segments[0] ?? "";
      const details = segments.slice(1);

      elements.push(
        <div key={`rag-${i}`} className="rc-rag-block">
          <div className="rc-rag-header">
            <span className="rc-rag-tag" style={{ background: color.bg, color: color.fg }}>
              {tag}
            </span>
            <span className="rc-rag-title">{title}{!title.endsWith(".") ? "." : ""}</span>
          </div>
          {details.length > 0 && (
            <div className="rc-rag-details">
              {details.map((d, j) => {
                const colonIdx = d.indexOf(":");
                if (colonIdx > 0 && colonIdx < 30) {
                  const key = d.slice(0, colonIdx).trim();
                  const val = d.slice(colonIdx + 1).trim();
                  return (
                    <div key={j} className="rc-rag-detail">
                      <span className="rc-rag-key">{key}:</span>{" "}
                      <span className="rc-rag-val">{val}{!val.endsWith(".") ? "." : ""}</span>
                    </div>
                  );
                }
                return <div key={j} className="rc-rag-detail">{d}.</div>;
              })}
            </div>
          )}
        </div>
      );
      i++;
      continue;
    }

    // Markdown headers: # ## ###
    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length as 1 | 2 | 3;
      const Tag = `h${level + 1}` as "h2" | "h3" | "h4";
      elements.push(<Tag key={`h-${i}`} className={`rc-heading rc-h${level}`}>{renderInline(headerMatch[2], `h${i}`)}</Tag>);
      i++;
      continue;
    }

    // Unordered list items: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        listItems.push(<li key={`li-${i}`}>{renderInline(itemText, `li${i}`)}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="rc-list">{listItems}</ul>);
      continue;
    }

    // Numbered list items: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "");
        listItems.push(<li key={`oli-${i}`}>{renderInline(itemText, `oli${i}`)}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="rc-list rc-list-ordered">{listItems}</ol>);
      continue;
    }

    // Regular paragraph
    elements.push(<p key={`p-${i}`} className="rc-paragraph">{renderInline(trimmed, `p${i}`)}</p>);
    i++;
  }

  return <div className="rc-markdown">{elements}</div>;
}

function actionIcon(type: ChatAction["type"]): string {
  switch (type) {
    case "open-source": return "📊";
    case "open-pipeline": return "🔍";
    case "open-territory": return "🗺️";
    case "open-party": return "🏛️";
    case "open-link": return "↗";
    default: return "→";
  }
}
