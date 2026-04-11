"use client";

import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* ═══════════════════════════════════════════════════════════════════════════
   España Next Gen — Plataforma educativa gamificada para jovenes.
   Convierte España y la UE en un videojuego civico interactivo.
   Misiones, negociacion de presupuestos, construccion de leyes, crisis.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Mission {
  id: string; title: string; description: string; category: string; difficulty: string;
  xpReward: number; estimatedMinutes: number; objectives: string[];
  unlockLevel: number; completionRate: number; tags: string[];
}

interface ChallengeStep { order: number; instruction: string; type: string; completed: boolean }
interface Challenge {
  id: string; missionId: string; title: string; description: string; status: string;
  steps: ChallengeStep[]; rewards: { xp: number; badge?: string };
}

interface TikTokFact {
  id: string; title: string; content: string; category: string; emoji: string;
  source: string; shareCount: number; tags: string[];
}

interface Achievement {
  id: string; title: string; description: string; tier: string; icon: string;
  xpRequired: number; unlockedBy: string; rarity: number;
}

interface LeaderboardEntry { rank: number; username: string; xp: number; level: number; achievements: number; streak: number; territory: string }

interface CCAComparison { slug: string; name: string; population: number; gdpPerCapita: number; unemployment: number; educationSpend: number; healthSpend: number; happinessIndex: number }

interface AIExplanation { id: string; topic: string; simpleExplanation: string; analogy: string; keyFact: string; difficulty: string }

interface ClassroomSession { id: string; title: string; teacher: string; students: number; activeMission: string; avgProgress: number; topScore: number }

interface ProgressTracker { totalXP: number; level: number; nextLevelXP: number; missionsCompleted: number; totalMissions: number; streak: number; badges: string[]; rank: string }

interface NGData {
  missions: Mission[]; challenges: Challenge[]; facts: TikTokFact[]; achievements: Achievement[];
  leaderboard: LeaderboardEntry[]; ccaaComparison: CCAComparison[]; aiExplanations: AIExplanation[];
  classrooms: ClassroomSession[]; progress: ProgressTracker;
  stats: { totalMissions: number; totalChallenges: number; totalFacts: number; activeUsers: number; avgLevel: number; classroomsActive: number };
}

type ENGView = "misiones" | "desafios" | "tiktok" | "ranking" | "ccaa" | "logros" | "explainer" | "progreso" | "aula" | "perfil";

const difficultyColor: Record<string, string> = { facil: "var(--verde)", media: "var(--oro)", dificil: "#e67e22", experto: "var(--rojo)" };
const tierColor: Record<string, string> = { bronce: "#cd7f32", plata: "#c0c0c0", oro: "var(--oro)", diamante: "#b9f2ff" };
const tierBg: Record<string, string> = { bronce: "#fdf2e9", plata: "#f4f4f4", oro: "#fef9e7", diamante: "#edf8ff" };

export default function NextGenPage() {
  const [data, setData] = useState<NGData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ENGView>("misiones");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState(0);
  const [expandedAI, setExpandedAI] = useState<string | null>(null);
  const [sortIndicator, setSortIndicator] = useState<"gdpPerCapita" | "unemployment" | "educationSpend" | "healthSpend" | "happinessIndex">("gdpPerCapita");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("eng-data-v1");
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    fetch("/api/next-gen")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        try { sessionStorage.setItem("eng-data-v1", JSON.stringify(d)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const missions = data?.missions ?? [];
  const challenges = data?.challenges ?? [];
  const facts = data?.facts ?? [];
  const achievements = data?.achievements ?? [];
  const leaderboard = data?.leaderboard ?? [];
  const ccaa = data?.ccaaComparison ?? [];
  const aiExplanations = data?.aiExplanations ?? [];
  const classrooms = data?.classrooms ?? [];
  const progress = data?.progress ?? { totalXP: 0, level: 1, nextLevelXP: 100, missionsCompleted: 0, totalMissions: 0, streak: 0, badges: [], rank: "" };
  const stats = data?.stats ?? { totalMissions: 0, totalChallenges: 0, totalFacts: 0, activeUsers: 0, avgLevel: 0, classroomsActive: 0 };

  const allCategories = [...new Set(missions.map((m) => m.category))];

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (filterCategory && m.category !== filterCategory) return false;
      if (filterDifficulty && m.difficulty !== filterDifficulty) return false;
      return true;
    });
  }, [missions, filterCategory, filterDifficulty]);

  const sortedCCAA = useMemo(() => {
    return [...ccaa].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sortIndicator] ?? 0;
      const bVal = (b as unknown as Record<string, number>)[sortIndicator] ?? 0;
      return sortIndicator === "unemployment" ? aVal - bVal : bVal - aVal;
    });
  }, [ccaa, sortIndicator]);

  const xpPercent = progress.nextLevelXP > 0 ? Math.min(100, (progress.totalXP / progress.nextLevelXP) * 100) : 0;

  const viewLabels: Record<ENGView, string> = {
    misiones: "Misiones", desafios: "Desafios", tiktok: "TikTok Facts", ranking: "Ranking",
    ccaa: "Compara CCAA", logros: "Logros", explainer: "Explainer IA", progreso: "Progreso",
    aula: "Modo Aula", perfil: "Mi Perfil",
  };

  return (
    <main className="page-shell">
      <SiteHeader currentSection="next-gen" />

      {/* Hero */}
      <section className="panel detail-hero">
        <span className="eyebrow">ESPANA NEXT GEN</span>
        <h1>Aprende civismo jugando</h1>
        <p className="hero-subtitle">
          Negocia presupuestos, construye leyes, gestiona crisis. {stats.activeUsers.toLocaleString("es-ES")} jovenes ya estan jugando.
        </p>
        <div className="kpi-bar">
          <div className="kpi-item"><span className="kpi-value">{stats.totalMissions}</span><span className="kpi-label">Misiones</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.totalChallenges}</span><span className="kpi-label">Desafios</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.activeUsers.toLocaleString("es-ES")}</span><span className="kpi-label">Usuarios activos</span></div>
          <div className="kpi-item"><span className="kpi-value">Nv. {stats.avgLevel}</span><span className="kpi-label">Nivel medio</span></div>
          <div className="kpi-item"><span className="kpi-value">{stats.classroomsActive}</span><span className="kpi-label">Aulas activas</span></div>
        </div>
      </section>

      {/* Tabs */}
      <div className="eng-view-bar" style={{ display: "flex", gap: 4, padding: "0 24px 16px", flexWrap: "wrap" }}>
        {(Object.keys(viewLabels) as ENGView[]).map((v) => (
          <button key={v} className={`eng-tab ${view === v ? "eng-tab-active" : ""}`}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: view === v ? 700 : 400, background: view === v ? "var(--azul)" : "var(--surface)", color: view === v ? "#fff" : "var(--ink)", fontSize: 13, transition: "all .15s" }}
            onClick={() => setView(v)}>
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {loading && <div className="loading-bar"><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></div>}

      {data && (
        <>
          {/* ═══ MISIONES ═══ */}
          {view === "misiones" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Selector de misiones" title="Elige tu reto civico" description="Cada mision es un desafio del mundo real. Gana XP, desbloquea logros y sube de nivel." />
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)" }}>
                  <option value="">Todas las categorias</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: "flex", gap: 4 }}>
                  {["facil", "media", "dificil", "experto"].map((d) => (
                    <button key={d} onClick={() => setFilterDifficulty(filterDifficulty === d ? "" : d)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: filterDifficulty === d ? 700 : 400, background: filterDifficulty === d ? difficultyColor[d] : "var(--surface)", color: filterDifficulty === d ? "#fff" : difficultyColor[d], fontSize: 12 }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                {filteredMissions.map((m) => (
                  <div key={m.id} style={{ background: "var(--surface)", borderRadius: 12, padding: 20, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer", borderLeft: `4px solid ${difficultyColor[m.difficulty] ?? "var(--ink-muted)"}` }}
                    onClick={() => setExpandedMission(expandedMission === m.id ? null : m.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{m.title}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: difficultyColor[m.difficulty], color: "#fff", fontWeight: 600 }}>{m.difficulty}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eef", color: "var(--azul)", fontWeight: 600 }}>{m.xpReward} XP</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 10px" }}>{m.description}</p>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-muted, #999)", marginBottom: 8 }}>
                      <span>{m.estimatedMinutes} min</span>
                      <span>Nivel {m.unlockLevel}+</span>
                      <span>{m.completionRate}% completado</span>
                    </div>
                    <div style={{ height: 4, background: "#eee", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ width: `${m.completionRate}%`, height: "100%", background: "var(--azul)", borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {m.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "#f0f0ff", color: "var(--azul)" }}>{t}</span>)}
                    </div>

                    {expandedMission === m.id && (
                      <div style={{ borderTop: "1px solid var(--border, #eee)", paddingTop: 12, marginTop: 12 }}>
                        <strong style={{ fontSize: 13 }}>Objetivos:</strong>
                        <ul style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 13 }}>
                          {m.objectives.map((o, i) => <li key={i} style={{ marginBottom: 4 }}>{o}</li>)}
                        </ul>
                        {challenges.filter((c) => c.missionId === m.id).length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <strong style={{ fontSize: 13 }}>Desafios:</strong>
                            {challenges.filter((c) => c.missionId === m.id).map((ch) => (
                              <div key={ch.id} style={{ padding: "8px 12px", marginTop: 6, background: "#f8f8f8", borderRadius: 8, fontSize: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <strong>{ch.title}</strong>
                                  <span style={{ color: ch.status === "disponible" ? "var(--verde)" : ch.status === "bloqueado" ? "var(--rojo)" : "var(--oro)" }}>{ch.status}</span>
                                </div>
                                <div style={{ color: "var(--ink-muted, #666)", marginTop: 2 }}>{ch.description}</div>
                                <div style={{ marginTop: 4, color: "var(--azul)" }}>+{ch.rewards.xp} XP {ch.rewards.badge && ` + ${ch.rewards.badge}`}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ DESAFIOS ═══ */}
          {view === "desafios" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Desafios activos" title="Retos paso a paso" description="Cada desafio tiene pasos concretos: decide, negocia, compara, responde." />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {challenges.map((ch) => {
                  const mission = missions.find((m) => m.id === ch.missionId);
                  return (
                    <div key={ch.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border, #e5e5e5)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 15 }}>{ch.title}</h3>
                          {mission && <span style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Mision: {mission.title}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: ch.status === "disponible" ? "#eafde9" : ch.status === "bloqueado" ? "#fdecea" : "#fef9e7", color: ch.status === "disponible" ? "var(--verde)" : ch.status === "bloqueado" ? "var(--rojo)" : "var(--oro)" }}>{ch.status}</span>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eef", color: "var(--azul)" }}>+{ch.rewards.xp} XP</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--ink-muted, #666)", margin: "0 0 10px" }}>{ch.description}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {ch.steps.map((step) => (
                          <div key={step.order} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", background: step.completed ? "#eafde9" : "#f8f8f8", borderRadius: 6, fontSize: 12 }}>
                            <span style={{ fontWeight: 700, minWidth: 24, color: step.completed ? "var(--verde)" : "var(--ink-muted, #999)" }}>{step.completed ? "\u2713" : step.order}</span>
                            <span style={{ flex: 1 }}>{step.instruction}</span>
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#eef", color: "var(--azul)" }}>{step.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ TIKTOK FACTS ═══ */}
          {view === "tiktok" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="TikTok Facts" title="Datos clave en formato vertical" description="Desliza para aprender. Cada tarjeta es un dato clave sobre Espana." />
              {facts.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  {/* Current card */}
                  <div style={{ maxWidth: 400, width: "100%", background: "linear-gradient(135deg, var(--azul), #1a3a5c)", borderRadius: 16, padding: 32, color: "#fff", minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", position: "relative" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{facts[currentFact].emoji}</div>
                    <h2 style={{ fontSize: 22, margin: "0 0 12px", fontWeight: 800 }}>{facts[currentFact].title}</h2>
                    <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 16px", opacity: 0.95 }}>{facts[currentFact].content}</p>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Fuente: {facts[currentFact].source}</div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                      {facts[currentFact].tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "rgba(255,255,255,0.2)" }}>{t}</span>)}
                    </div>
                    <div style={{ position: "absolute", bottom: 16, right: 16, fontSize: 11, opacity: 0.6 }}>
                      {currentFact + 1}/{facts.length}
                    </div>
                  </div>
                  {/* Navigation */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setCurrentFact(Math.max(0, currentFact - 1))}
                      style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--surface)", cursor: "pointer", fontWeight: 600 }}>
                      Anterior
                    </button>
                    <button onClick={() => setCurrentFact(Math.min(facts.length - 1, currentFact + 1))}
                      style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--azul)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                      Siguiente
                    </button>
                  </div>
                  {/* Dot indicators */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {facts.map((_, i) => (
                      <div key={i} onClick={() => setCurrentFact(i)}
                        style={{ width: 8, height: 8, borderRadius: "50%", cursor: "pointer", background: i === currentFact ? "var(--azul)" : "#ddd", transition: "background .15s" }} />
                    ))}
                  </div>
                  {/* Grid below */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, width: "100%", marginTop: 16 }}>
                    {facts.map((f, i) => (
                      <div key={f.id} onClick={() => setCurrentFact(i)}
                        style={{ padding: 12, borderRadius: 8, background: i === currentFact ? "#eef" : "var(--surface)", border: `1px solid ${i === currentFact ? "var(--azul)" : "var(--border, #e5e5e5)"}`, cursor: "pointer", fontSize: 12 }}>
                        <span style={{ marginRight: 6 }}>{f.emoji}</span><strong>{f.title}</strong>
                        <div style={{ color: "var(--ink-muted, #999)", marginTop: 4 }}>{f.shareCount.toLocaleString("es-ES")} compartidos</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ═══ RANKING ═══ */}
          {view === "ranking" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Ranking" title="Tabla de clasificacion" description="Los mejores jugadores civicos de Espana. Compite y sube de nivel." />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--azul)", color: "#fff" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>#</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Usuario</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>XP</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Nivel</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Logros</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>Racha</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Territorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((e) => (
                      <tr key={e.rank} style={{ borderBottom: "1px solid var(--border, #eee)", background: e.rank <= 3 ? "#fef9e7" : "transparent" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: e.rank <= 3 ? "var(--oro)" : "var(--ink)" }}>
                          {e.rank <= 3 ? ["", "🥇", "🥈", "🥉"][e.rank] : e.rank}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>{e.username}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--azul)" }}>{e.xp.toLocaleString("es-ES")}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>{e.level}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>{e.achievements}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>{e.streak}d</td>
                        <td style={{ padding: "10px 14px" }}>{e.territory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ═══ COMPARA CCAA ═══ */}
          {view === "ccaa" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Comparativa CCAA" title="Las 17 Comunidades cara a cara" description="Compara PIB, desempleo, gasto educativo y sanitario entre CCAA." />
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {(["gdpPerCapita", "unemployment", "educationSpend", "healthSpend", "happinessIndex"] as const).map((ind) => {
                  const labels: Record<string, string> = { gdpPerCapita: "PIB per capita", unemployment: "Desempleo", educationSpend: "Gasto educacion", healthSpend: "Gasto sanidad", happinessIndex: "Felicidad" };
                  return (
                    <button key={ind} onClick={() => setSortIndicator(ind)}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: sortIndicator === ind ? 700 : 400, background: sortIndicator === ind ? "var(--azul)" : "var(--surface)", color: sortIndicator === ind ? "#fff" : "var(--ink)", fontSize: 12 }}>
                      {labels[ind]}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sortedCCAA.map((c, i) => {
                  const val = (c as unknown as Record<string, number>)[sortIndicator] ?? 0;
                  const maxVal = Math.max(...sortedCCAA.map((x) => (x as unknown as Record<string, number>)[sortIndicator] ?? 0));
                  const barPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  const units: Record<string, string> = { gdpPerCapita: "EUR", unemployment: "%", educationSpend: "EUR/hab", healthSpend: "EUR/hab", happinessIndex: "/10" };
                  return (
                    <div key={c.slug} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: i === 0 ? "#fef9e7" : "var(--surface)", borderRadius: 8, border: "1px solid var(--border, #e5e5e5)" }}>
                      <span style={{ fontWeight: 700, minWidth: 24, color: i === 0 ? "var(--oro)" : "var(--ink-muted, #999)", fontSize: 14 }}>{i + 1}</span>
                      <span style={{ fontWeight: 600, minWidth: 140, fontSize: 14 }}>{c.name}</span>
                      <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${barPct}%`, height: "100%", background: sortIndicator === "unemployment" ? (i < 3 ? "var(--verde)" : i < 6 ? "var(--oro)" : "var(--rojo)") : (i < 3 ? "var(--azul)" : "var(--ink-muted, #ccc)"), borderRadius: 4, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontWeight: 700, minWidth: 80, textAlign: "right", fontSize: 14 }}>
                        {val.toLocaleString("es-ES")} {units[sortIndicator]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ LOGROS ═══ */}
          {view === "logros" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Logros y medallas" title="Tu coleccion de logros" description="Desbloquea medallas completando misiones, rachas y retos especiales." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {achievements.map((a) => {
                  const unlocked = progress.badges.includes(a.title);
                  return (
                    <div key={a.id} style={{ background: unlocked ? tierBg[a.tier] : "#f8f8f8", borderRadius: 10, padding: 16, border: `2px solid ${unlocked ? tierColor[a.tier] : "#e5e5e5"}`, opacity: unlocked ? 1 : 0.6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 28 }}>{a.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: tierColor[a.tier], color: a.tier === "plata" || a.tier === "diamante" ? "#333" : "#fff" }}>{a.tier}</span>
                      </div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{a.title}</h3>
                      <p style={{ fontSize: 12, color: "var(--ink-muted, #666)", margin: "0 0 8px" }}>{a.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-muted, #999)" }}>
                        <span>{a.rarity}% lo tienen</span>
                        {unlocked ? <span style={{ color: "var(--verde)", fontWeight: 700 }}>DESBLOQUEADO</span> : <span>{a.xpRequired} XP requeridos</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ EXPLAINER IA ═══ */}
          {view === "explainer" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Explainer con IA" title="Te lo explico en sencillo" description="La IA te explica conceptos politicos complejos con analogias y datos clave." />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {aiExplanations.map((ai) => (
                  <div key={ai.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)", cursor: "pointer" }}
                    onClick={() => setExpandedAI(expandedAI === ai.id ? null : ai.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{ai.topic}</h3>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: ai.difficulty === "basico" ? "#eafde9" : ai.difficulty === "intermedio" ? "#fef9e7" : "#fdecea", color: ai.difficulty === "basico" ? "var(--verde)" : ai.difficulty === "intermedio" ? "#92400e" : "var(--rojo)" }}>
                        {ai.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.6 }}>{ai.simpleExplanation}</p>
                    {expandedAI === ai.id && (
                      <div style={{ borderTop: "1px solid var(--border, #eee)", paddingTop: 12, marginTop: 8 }}>
                        <div style={{ padding: "10px 14px", background: "#f0f0ff", borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                          <strong style={{ color: "var(--azul)" }}>Analogia:</strong> {ai.analogy}
                        </div>
                        <div style={{ padding: "10px 14px", background: "#fef9e7", borderRadius: 8, fontSize: 13 }}>
                          <strong style={{ color: "var(--oro)" }}>Dato clave:</strong> {ai.keyFact}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══ PROGRESO ═══ */}
          {view === "progreso" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Tu progreso" title="Nivel {progress.level}: {progress.rank}" description={`${progress.totalXP} XP totales. ${progress.missionsCompleted}/${progress.totalMissions} misiones completadas.`} />
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border, #e5e5e5)", textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: "var(--azul)" }}>Nv. {progress.level}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "4px 0 16px" }}>{progress.rank}</div>
                  <div style={{ height: 12, background: "#eee", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${xpPercent}%`, height: "100%", background: "linear-gradient(90deg, var(--azul), var(--verde))", borderRadius: 6, transition: "width .3s" }} />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted, #999)", marginBottom: 20 }}>
                    {progress.totalXP.toLocaleString("es-ES")} / {progress.nextLevelXP.toLocaleString("es-ES")} XP
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--azul)" }}>{progress.missionsCompleted}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Misiones</div>
                    </div>
                    <div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--oro)" }}>{progress.streak}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Racha (dias)</div>
                    </div>
                    <div style={{ padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--verde)" }}>{progress.badges.length}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Medallas</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ fontSize: 13 }}>Medallas conseguidas:</strong>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {progress.badges.map((b) => <span key={b} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: "#fef9e7", color: "var(--oro)", fontWeight: 600 }}>{b}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══ MODO AULA ═══ */}
          {view === "aula" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Modo aula" title="Sesiones de clase activas" description="Profesores: gestiona tu clase, asigna misiones, monitorea el progreso." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                {classrooms.map((cl) => {
                  const mission = missions.find((m) => m.id === cl.activeMission);
                  return (
                    <div key={cl.id} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border, #e5e5e5)" }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{cl.title}</h3>
                      <div style={{ fontSize: 12, color: "var(--ink-muted, #666)", marginBottom: 12 }}>{cl.teacher} &middot; {cl.students} alumnos</div>
                      {mission && (
                        <div style={{ padding: "8px 12px", background: "#f0f0ff", borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
                          <strong>Mision activa:</strong> {mission.title}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ textAlign: "center", padding: 10, background: "#f8f8f8", borderRadius: 8 }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--azul)" }}>{cl.avgProgress}%</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Progreso medio</div>
                        </div>
                        <div style={{ textAlign: "center", padding: 10, background: "#f8f8f8", borderRadius: 8 }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--verde)" }}>{cl.topScore}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>Mejor puntuacion</div>
                        </div>
                      </div>
                      <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden", marginTop: 12 }}>
                        <div style={{ width: `${cl.avgProgress}%`, height: "100%", background: "var(--azul)", borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ MI PERFIL ═══ */}
          {view === "perfil" && (
            <section style={{ padding: "0 24px 32px" }}>
              <SectionHeading eyebrow="Mi perfil" title="Resumen de tu experiencia" description="Tu nivel, logros y estadisticas globales." />
              <div style={{ maxWidth: 600, margin: "0 auto", background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border, #e5e5e5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>Ciudadano nivel {progress.level}</div>
                    <div style={{ fontSize: 14, color: "var(--azul)", fontWeight: 600 }}>{progress.rank}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--azul)" }}>{progress.totalXP.toLocaleString("es-ES")} XP</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted, #999)" }}>Racha: {progress.streak} dias</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Misiones", value: progress.missionsCompleted, total: progress.totalMissions, color: "var(--azul)" },
                    { label: "Medallas", value: progress.badges.length, total: achievements.length, color: "var(--oro)" },
                    { label: "Racha", value: progress.streak, total: null, color: "var(--rojo)" },
                    { label: "Nivel", value: progress.level, total: 20, color: "var(--verde)" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center", padding: 12, background: "#f8f8f8", borderRadius: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}{stat.total != null ? `/${stat.total}` : "d"}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted, #999)" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <strong style={{ fontSize: 13 }}>Medallas desbloqueadas:</strong>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {progress.badges.map((b) => {
                      const ach = achievements.find((a) => a.title === b);
                      return (
                        <span key={b} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 10px", borderRadius: 8, background: tierBg[ach?.tier ?? "bronce"], border: `1px solid ${tierColor[ach?.tier ?? "bronce"]}` }}>
                          {ach?.icon} {b}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
