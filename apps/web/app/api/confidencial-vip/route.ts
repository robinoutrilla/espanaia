/* ═══════════════════════════════════════════════════════════════════════════
   /api/confidencial-vip — Generates VIP political intelligence reports
   Password-protected. Uses all RAG agents + Google News + Gemini.
   Returns SSE stream with progress + final report.
   ═══════════════════════════════════════════════════════════════════════════ */

import { classifyIntent, runAgent, buildContext, AGENT_LABELS, type RAGResult, type AgentId } from "../../../lib/rag-agents";
import { getTrending } from "../../../lib/rss-trending";
import { getIneIndicators } from "../../../lib/ine-live";
import { getEurostatSnapshot } from "../../../lib/eurostat-live";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const VALID_PASSWORDS = ["647510884", "650384410"];

// All agents for comprehensive reports
const ALL_AGENTS: AgentId[] = ["normativo", "presupuestario", "politico-social", "empresarial", "medios", "ministerios"];

// ── Google News RSS fallback for real-time context ──────────────────────────

async function fetchGoogleNews(query: string, maxItems = 10): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}+when:7d&hl=es&gl=ES&ceid=ES:es`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: string[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
      const block = match[1];
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      const source = block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
      if (title) {
        const dateStr = pubDate ? new Date(pubDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "";
        items.push(`[Google News${source ? " — " + source : ""}${dateStr ? " — " + dateStr : ""}] ${title}`);
      }
    }
    return items;
  } catch {
    return [];
  }
}

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { topic, password } = await request.json();

    if (!password || !VALID_PASSWORDS.includes(String(password).trim())) {
      return Response.json({ error: "Acceso denegado" }, { status: 403 });
    }

    if (!topic || typeof topic !== "string" || topic.trim().length < 5) {
      return Response.json({ error: "Tema demasiado corto" }, { status: 400 });
    }

    const q = topic.trim();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ── Step 1: Warm all caches + Google News in parallel ──
          send("status", { step: "warming", message: "Inicializando fuentes de datos..." });

          const [, , , newsItems] = await Promise.all([
            getTrending(50).catch(() => {}),
            getIneIndicators().catch(() => {}),
            getEurostatSnapshot().catch(() => {}),
            fetchGoogleNews(q + " España"),
          ]);

          // ── Step 2: Route and optionally add ALL agents for comprehensive coverage ──
          send("status", { step: "routing", message: "Analizando tema y activando agentes..." });

          const routed = classifyIntent(q);
          // Ensure all agents are queried for VIP reports
          const agentsToRun = [...new Set([...routed, ...ALL_AGENTS])];

          // ── Step 3: Run all agents ──
          const agents: RAGResult[] = [];
          for (const agentId of agentsToRun) {
            send("status", {
              step: "searching",
              message: `Consultando ${AGENT_LABELS[agentId]}...`,
              agent: agentId,
            });
            const result = runAgent(agentId, q);
            if (result.context.length > 0) {
              agents.push(result);
            }
            send("status", {
              step: "agent-done",
              message: `${AGENT_LABELS[agentId]}: ${result.context.length} fragmentos`,
              agent: agentId,
              chunks: result.context.length,
            });
          }

          // ── Add Google News context ──
          if (newsItems && newsItems.length > 0) {
            agents.push({
              agentId: "medios",
              agentName: "Google News (tiempo real)",
              context: newsItems,
              sources: ["Google News RSS"],
            });
            send("status", {
              step: "agent-done",
              message: `Google News: ${newsItems.length} titulares recientes`,
              agent: "medios",
              chunks: newsItems.length,
            });
          }

          const combinedContext = buildContext(agents);
          const totalContext = agents.reduce((s, a) => s + a.context.length, 0);
          const allSources = [...new Set(agents.flatMap(a => a.sources))];

          // ── Step 4: Generate VIP report with Gemini ──
          send("status", {
            step: "generating",
            message: `Generando informe confidencial con ${totalContext} fragmentos de inteligencia...`,
          });

          const systemPrompt = `Eres un analista senior de inteligencia politica en Espana que trabaja para IAN.com, elaborando informes confidenciales VIP para clientes de alto nivel (empresarios, asociaciones, lobbies, consultoras).

TU ESTILO DE ESCRITURA:
- Profesional, directo, sin rodeos. Como si hablaras con un CEO que tiene 5 minutos.
- Usa lenguaje de "trastienda politica": "entre bambalinas", "fuentes cercanas a...", "en circulos del poder se comenta...", "la lectura interna es..."
- Anticipa escenarios futuros con probabilidades: "con alta probabilidad", "escenario mas probable", "no se descarta que..."
- Incluye datos concretos del contexto RAG y titulares de prensa para respaldar cada afirmacion.
- Si el contexto RAG interno es limitado, utiliza los titulares de Google News y tu conocimiento general sobre politica española para elaborar un informe completo y riguroso.
- Separa HECHOS de ANALISIS y de ANTICIPACION claramente.

ESTRUCTURA DEL INFORME (usa EXACTAMENTE estos encabezados en Markdown):

# INFORME CONFIDENCIAL VIP
## [Titulo del tema]
**Fecha:** [fecha actual]
**Clasificacion:** CONFIDENCIAL — Distribucion restringida
**Elaborado por:** Unidad de Inteligencia Politica — IAN

---

### RESUMEN EJECUTIVO
[3-4 lineas con lo esencial para quien solo lee esto]

### CONTEXTO Y ANTECEDENTES
[Situacion actual con datos del RAG. Cifras, fechas, nombres concretos.]

### ANALISIS DE LA SITUACION
[Analisis profundo: actores clave, intereses en juego, correlacion de fuerzas, movimientos recientes]

### TRASTIENDA Y MOVIMIENTOS
[Informacion de "entre bambalinas": que se mueve, que se negocia, quien presiona a quien. Basado en las fuentes RSS, BOE reciente, actividad parlamentaria.]

### ESCENARIOS PROBABLES
[2-3 escenarios con probabilidad estimada y consecuencias para el sector]

### IMPLICACIONES PARA EL SECTOR
[Como afecta esto a empresas, inversores, sectores economicos concretos]

### CALENDARIO Y PROXIMOS HITOS
[Fechas clave a vigilar: votaciones, publicaciones BOE, reuniones, plazos]

### DOCUMENTACION DE REFERENCIA
[Lista de fuentes RAG utilizadas]

---
*Este informe es de caracter confidencial. IAN — Inteligencia Politica Abierta de Espana.*

REGLAS:
- Responde SIEMPRE en espanol.
- Cita fuentes reales del contexto proporcionado.
- Si no hay datos suficientes sobre un aspecto, dilo como "Pendiente de confirmar" en vez de inventar.
- El informe debe tener al menos 800 palabras.
- Usa formato Markdown.
- NO uses emojis.`;

          const userPrompt = `CONTEXTO DE INTELIGENCIA (${totalContext} fragmentos de ${agents.length} agentes RAG + prensa):
${combinedContext || "(Contexto RAG interno limitado para este tema — utiliza titulares de prensa y conocimiento general de politica española.)"}

TEMA DEL INFORME VIP: ${q}`;

          if (!GEMINI_API_KEY) {
            send("done", {
              report: `# INFORME CONFIDENCIAL VIP\n## ${q}\n\n**Estado:** LLM no configurado\n\n### Contexto RAG disponible\n\n${combinedContext || "Sin contexto disponible."}`,
              sources: allSources,
              totalContext,
              llmOffline: true,
            });
            return;
          }

          try {
            const geminiRes = await fetch(GEMINI_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
                ],
                generationConfig: {
                  temperature: 0.45,
                  maxOutputTokens: 4096,
                  topP: 0.92,
                },
              }),
              signal: AbortSignal.timeout(60_000),
            });

            if (!geminiRes.ok) {
              const errBody = await geminiRes.text().catch(() => "");
              throw new Error(`Gemini ${geminiRes.status}: ${errBody.slice(0, 200)}`);
            }

            const data = await geminiRes.json();
            const report =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ??
              "No se pudo generar el informe.";

            send("done", {
              report,
              sources: allSources,
              totalContext,
              model: GEMINI_MODEL,
            });
          } catch (llmErr) {
            const errMsg = llmErr instanceof Error ? llmErr.message : "Error desconocido";
            send("done", {
              report: combinedContext
                ? `# Error al generar informe\n\n**Error LLM:** ${errMsg}\n\n## Contexto RAG disponible\n\n${combinedContext}`
                : `Error al conectar con Gemini: ${errMsg}`,
              sources: allSources,
              totalContext,
              llmError: errMsg,
            });
          }
        } catch (err) {
          send("error", { error: err instanceof Error ? err.message : "Error interno" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
