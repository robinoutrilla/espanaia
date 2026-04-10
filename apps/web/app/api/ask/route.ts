/* ═══════════════════════════════════════════════════════════════════════════
   /api/ask — Streaming RAG Q&A powered by 4 specialized agents + Ollama
   Sends Server-Sent Events so the UI can show real-time progress:
     step → classify → agent (×N) → generating → done / error
   ═══════════════════════════════════════════════════════════════════════════ */

import { classifyIntent, runAgent, buildContext, AGENT_LABELS, type AgentId, type RAGResult } from "../../../lib/rag-agents";
import { getTrending } from "../../../lib/rss-trending";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.1:8b";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return Response.json({ error: "Pregunta demasiado corta" }, { status: 400 });
    }

    const q = question.trim();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ── Step 1: Classify intent ──
          send("status", { step: "classify", message: "Clasificando intención..." });
          const routedTo = classifyIntent(q);
          const agentLabels = routedTo.map(id => AGENT_LABELS[id]);
          send("status", {
            step: "routed",
            message: `Enrutado a ${agentLabels.join(" + ")}`,
            agents: routedTo,
          });

          // ── Pre-fetch: refresh RSS archive if medios is routed ──
          if (routedTo.includes("medios")) {
            try {
              await getTrending(30);
            } catch {
              // Non-blocking — continue with stale archive
            }
          }

          // ── Step 2: Run each agent with status ──
          const agents: RAGResult[] = [];
          for (const agentId of routedTo) {
            send("status", {
              step: "searching",
              message: `Buscando en ${AGENT_LABELS[agentId]}...`,
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

          const combinedContext = buildContext(agents);
          const agentSummary = agents.map(a => ({
            id: a.agentId,
            name: a.agentName,
            chunks: a.context.length,
            sources: a.sources,
          }));
          const allSources = agents.flatMap(a => a.sources);
          const uniqueSources = [...new Set(allSources)];
          const totalContext = agents.reduce((s, a) => s + a.context.length, 0);

          // ── Step 3: Generate with Ollama ──
          send("status", {
            step: "generating",
            message: totalContext > 0
              ? `Generando respuesta con ${totalContext} fragmentos...`
              : "Generando respuesta...",
          });

          const systemPrompt = `Eres un analista político experto en España en IAPÑ.com.\nResponde en español, conciso y riguroso. Cita fuentes del contexto. No inventes datos.\n${combinedContext ? `\nCONTEXTO:\n${combinedContext}` : "Sin contexto específico para esta consulta."}`;

          try {
            const ollamaRes = await fetch(OLLAMA_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: MODEL,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: q },
                ],
                stream: false,
                options: { temperature: 0.3, num_predict: 600, num_ctx: 4096 },
              }),
              signal: AbortSignal.timeout(45_000),
            });

            if (!ollamaRes.ok) throw new Error(`Ollama ${ollamaRes.status}`);
            const data = await ollamaRes.json();

            send("done", {
              answer: data.message?.content ?? "Sin respuesta del modelo.",
              sources: uniqueSources,
              agents: agentSummary,
              routedTo,
              totalContext,
            });
          } catch {
            // Ollama offline — return RAG context directly
            send("done", {
              answer: combinedContext
                ? `[Ollama no disponible \u2014 mostrando contexto RAG]\n\n${combinedContext}`
                : "No se pudo conectar con Ollama (localhost:11434).",
              sources: uniqueSources,
              agents: agentSummary,
              routedTo,
              totalContext,
              ollamaOffline: true,
            });
          }
        } catch (err) {
          send("error", {
            error: err instanceof Error ? err.message : "Error interno",
          });
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
