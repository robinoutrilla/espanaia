/* ═══════════════════════════════════════════════════════════════════════════
   /api/ask — Streaming RAG Q&A powered by specialized agents + Gemini
   Sends Server-Sent Events so the UI can show real-time progress:
     step → classify → agent (×N) → generating → done / error
   ═══════════════════════════════════════════════════════════════════════════ */

import { classifyIntent, runAgent, buildContext, AGENT_LABELS, type RAGResult } from "../../../lib/rag-agents";
import { getTrending } from "../../../lib/rss-trending";

// ── LLM Configuration ──
// Gemini 2.0 Flash — free tier: 15 RPM, 1M tokens/day
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

          // ── Step 3: Generate with Gemini ──
          send("status", {
            step: "generating",
            message: totalContext > 0
              ? `Generando respuesta con ${totalContext} fragmentos...`
              : "Generando respuesta...",
          });

          const systemPrompt = [
            "Eres un analista político experto en España que trabaja en IAPÑ.com, la plataforma de inteligencia política abierta.",
            "Responde SIEMPRE en español, de forma concisa y rigurosa.",
            "Cita fuentes del contexto proporcionado. No inventes datos.",
            "Si el contexto no contiene información suficiente, dilo claramente.",
            "Usa formato Markdown para estructurar la respuesta cuando sea apropiado.",
          ].join("\n");

          const userPrompt = combinedContext
            ? `CONTEXTO:\n${combinedContext}\n\nPREGUNTA: ${q}`
            : `PREGUNTA: ${q}\n\n(Sin contexto específico disponible — responde con conocimiento general sobre política española.)`;

          if (!GEMINI_API_KEY) {
            // No API key configured — return RAG context directly
            send("done", {
              answer: combinedContext
                ? `[LLM no configurado — mostrando contexto RAG]\n\n${combinedContext}`
                : "No hay API key de Gemini configurada. Añade GEMINI_API_KEY en las variables de entorno.",
              sources: uniqueSources,
              agents: agentSummary,
              routedTo,
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
                  {
                    role: "user",
                    parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024,
                  topP: 0.9,
                },
              }),
              signal: AbortSignal.timeout(30_000),
            });

            if (!geminiRes.ok) {
              const errBody = await geminiRes.text().catch(() => "");
              throw new Error(`Gemini ${geminiRes.status}: ${errBody.slice(0, 200)}`);
            }

            const data = await geminiRes.json();
            const answer =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ??
              "Sin respuesta del modelo.";

            send("done", {
              answer,
              sources: uniqueSources,
              agents: agentSummary,
              routedTo,
              totalContext,
              model: GEMINI_MODEL,
            });
          } catch (llmErr) {
            // Gemini error — return RAG context as fallback
            const errMsg = llmErr instanceof Error ? llmErr.message : "Error desconocido";
            send("done", {
              answer: combinedContext
                ? `[Error LLM: ${errMsg}]\n\nContexto RAG disponible:\n\n${combinedContext}`
                : `Error al conectar con Gemini: ${errMsg}`,
              sources: uniqueSources,
              agents: agentSummary,
              routedTo,
              totalContext,
              llmError: errMsg,
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
