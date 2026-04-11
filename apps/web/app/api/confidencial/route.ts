/* ═══════════════════════════════════════════════════════════════════════════
   /api/confidencial — Generates a full VIP weekly intelligence briefing
   with multiple topic sections. Password-protected. Uses all RAG agents.
   Returns SSE stream: one "section" event per topic + final "done".
   ═══════════════════════════════════════════════════════════════════════════ */

import { runAgent, buildContext, AGENT_LABELS, type RAGResult, type AgentId } from "../../../lib/rag-agents";
import { getTrending } from "../../../lib/rss-trending";
import { getIneIndicators } from "../../../lib/ine-live";
import { getEurostatSnapshot } from "../../../lib/eurostat-live";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const VALID_PASSWORDS = ["647510884", "650384410"];
const ALL_AGENTS: AgentId[] = ["normativo", "presupuestario", "politico-social", "empresarial", "medios", "ministerios"];

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { topics, password } = await request.json();

    if (!password || !VALID_PASSWORDS.includes(String(password).trim())) {
      return Response.json({ error: "Acceso denegado" }, { status: 403 });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return Response.json({ error: "Se requiere al menos un tema" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ── Warm caches ──
          send("status", { message: "Inicializando fuentes de datos en tiempo real..." });
          await Promise.all([
            getTrending(50).catch(() => {}),
            getIneIndicators().catch(() => {}),
            getEurostatSnapshot().catch(() => {}),
          ]);

          // ── Run all RAG agents once with a combined query ──
          send("status", { message: "Activando 6 agentes de inteligencia..." });
          const combinedQuery = topics.join(". ");
          const agents: RAGResult[] = [];
          for (const agentId of ALL_AGENTS) {
            send("status", { message: `Consultando ${AGENT_LABELS[agentId]}...` });
            const result = runAgent(agentId, combinedQuery);
            if (result.context.length > 0) agents.push(result);
          }
          const fullContext = buildContext(agents);
          const totalChunks = agents.reduce((s, a) => s + a.context.length, 0);
          const allSources = [...new Set(agents.flatMap(a => a.sources))];

          if (!GEMINI_API_KEY) {
            send("done", {
              sections: topics.map((t: string, i: number) => ({
                index: i,
                title: t,
                content: "LLM no configurado. Contexto RAG disponible:\n\n" + fullContext.slice(0, 500),
              })),
              sources: allSources,
              totalChunks,
              llmOffline: true,
            });
            controller.close();
            return;
          }

          // ── Generate each section ──
          const sections: { index: number; title: string; content: string }[] = [];

          for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            send("status", { message: `Generando seccion ${i + 1}/${topics.length}: ${topic}...` });

            const sectionPrompt = `Eres un analista senior de inteligencia politica en Espana. Elaboras informes confidenciales semanales para clientes VIP (CEOs, lobbies, consultoras de primer nivel).

ESTILO:
- Prosa profesional, directa, rigurosa. Sin rodeos ni generalidades.
- Escribe como si hablaras con un empresario que necesita datos para tomar decisiones.
- Usa expresiones propias de inteligencia politica: "segun fuentes cercanas a...", "en circulos del poder se maneja que...", "la lectura interna es...", "entre bambalinas..."
- Mezcla HECHOS verificados (del contexto RAG) con ANALISIS experto y ANTICIPACION de escenarios.
- Incluye nombres propios, fechas, cifras concretas del contexto.
- NO uses Markdown. Escribe en texto plano con parrafos bien separados.
- NO uses emojis ni viñetas.
- Cada parrafo debe tener al menos 3-4 frases.
- Extension: entre 250 y 400 palabras para esta seccion.

CONTEXTO DE INTELIGENCIA (${totalChunks} fragmentos de 6 agentes RAG):
${fullContext.slice(0, 6000)}

TEMA A DESARROLLAR: ${topic}

Escribe SOLO el contenido de esta seccion del informe (sin titulo, sin encabezados). Comienza directamente con el analisis.`;

            try {
              const res = await fetch(GEMINI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ role: "user", parts: [{ text: sectionPrompt }] }],
                  generationConfig: { temperature: 0.5, maxOutputTokens: 2048, topP: 0.9 },
                }),
                signal: AbortSignal.timeout(45_000),
              });

              if (!res.ok) throw new Error(`Gemini ${res.status}`);
              const data = await res.json();
              const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No se pudo generar esta seccion.";

              sections.push({ index: i, title: topic, content });
              send("section", { index: i, title: topic, content });
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : "Error";
              sections.push({ index: i, title: topic, content: `[Error al generar: ${errMsg}]` });
              send("section", { index: i, title: topic, content: `[Error al generar: ${errMsg}]` });
            }
          }

          // ── Generate conclusion ──
          send("status", { message: "Generando conclusion del informe..." });
          try {
            const topicList = topics.join(", ");
            const conclusionPrompt = `Eres un analista senior de inteligencia politica en Espana. Escribe una CONCLUSION de 150-200 palabras para un informe semanal confidencial que ha cubierto estos temas: ${topicList}.

La conclusion debe:
- Sintetizar el panorama general de la semana.
- Destacar los 2-3 puntos de mayor relevancia estrategica.
- Anticipar brevemente que vigilar en los proximos dias.
- Tono: profesional, directo, sin rodeos.
- NO uses Markdown, viñetas ni emojis. Solo prosa.

CONTEXTO:
${fullContext.slice(0, 3000)}`;

            const res = await fetch(GEMINI_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: conclusionPrompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 1024, topP: 0.9 },
              }),
              signal: AbortSignal.timeout(30_000),
            });

            if (!res.ok) throw new Error(`Gemini ${res.status}`);
            const data = await res.json();
            const conclusion = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            send("conclusion", { content: conclusion });
          } catch {
            send("conclusion", { content: "Pendiente de elaborar." });
          }

          send("done", { sections, sources: allSources, totalChunks });
        } catch (err) {
          send("error", { error: err instanceof Error ? err.message : "Error interno" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch {
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
