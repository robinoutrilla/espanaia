"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { SectionHeading } from "../../components/section-heading";

/* =============================================================================
   Educacion — Interactive civics education platform for adolescents.
   20 competitive differentiators over typical civic education platforms.
   ============================================================================= */

const CACHE_KEY = "edu-data-v2";
const XP_KEY = "edu-xp-v1";
const PROGRESS_KEY = "edu-progress-v1";
const STREAK_KEY = "edu-streak-v1";
const BADGES_KEY = "edu-badges-v1";
const PREFS_KEY = "edu-prefs-v1";

type ViewMode = "modulos" | "retos" | "glosario" | "simulador" | "mitos" | "derechos" | "participacion" | "comparador" | "noticias";
type Category = "instituciones" | "democracia" | "presupuestos" | "territorio" | "europa" | "ciudadania-digital" | "actualidad";
type LessonType = "explicador" | "simulacion" | "quiz" | "comparador" | "timeline" | "debate";
type ChallengeType = "simulacion" | "debate" | "investigacion" | "quiz";
type Difficulty = "facil" | "medio" | "dificil";

interface Lesson { id: string; order: number; title: string; type: LessonType; content: string; simpleText?: string; keyFacts: string[]; interactiveElement?: string; liveDataRef?: string; }
interface Module { id: string; title: string; category: Category; level: string; ageRange: string; duration: string; description: string; objectives: string[]; lessons: Lesson[]; tags: string[]; }
interface ChallengeQuestion { id: string; text: string; options: string[]; correctIndex: number; explanation: string; }
interface Challenge { id: string; title: string; type: ChallengeType; description: string; scenario: string; questions: ChallengeQuestion[]; difficulty: Difficulty; relatedModule: string; }
interface GlossaryTerm { term: string; definition: string; relatedTerms: string[]; category: string; example?: string; constitutionalRef?: { article: number; title: string; text: string }[]; }
interface MythReality { id: string; myth: string; reality: string; source: string; category: string; }
interface ConstitutionalRight { article: number; right: string; explanation: string; category: "fundamental" | "social" | "deber"; }
interface NewsContext { id: string; headline: string; context: string; relatedModule: string; date: string; }
interface ParticipationMethod { id: string; name: string; description: string; requirements: string; example: string; difficulty: Difficulty; }
interface InternationalComparison { topic: string; spain: string; countries: { country: string; value: string }[]; source: string; }
interface WeeklyChallenge { id: string; title: string; description: string; task: string; hint: string; relatedModule: string; weekNumber: number; }

interface EduData {
  modules: Module[]; challenges: Challenge[]; glossary: GlossaryTerm[];
  myths: MythReality[]; rights: ConstitutionalRight[]; newsContext: NewsContext[];
  participationMethods: ParticipationMethod[]; internationalComparisons: InternationalComparison[];
  weeklyChallenge: WeeklyChallenge;
  stats: { totalModules: number; totalLessons: number; totalChallenges: number; byCategory: Record<string, number>; byLevel: Record<string, number> };
}

interface UserXP { total: number; level: number; lessonXP: number; challengeXP: number; streakBonus: number; }
interface UserProgress { completedLessons: string[]; completedChallenges: string[]; correctAnswers: number; totalAnswers: number; }
interface StreakData { current: number; longest: number; lastDate: string; }
interface Badge { id: string; name: string; icon: string; description: string; earned: boolean; earnedDate?: string; }
interface UserPrefs { highContrast: boolean; fontSize: number; simpleMode: boolean; flashcardMode: boolean; }

// ── View tabs ──
const VIEW_TABS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "modulos", label: "Módulos", icon: "\uD83D\uDCDA" },
  { id: "retos", label: "Retos", icon: "\uD83C\uDFAF" },
  { id: "glosario", label: "Glosario", icon: "\uD83D\uDCD6" },
  { id: "simulador", label: "Simulador", icon: "\uD83C\uDFAE" },
  { id: "mitos", label: "Mitos", icon: "\u2753" },
  { id: "derechos", label: "Derechos", icon: "\u2696\uFE0F" },
  { id: "participacion", label: "Participar", icon: "\uD83D\uDDF3\uFE0F" },
  { id: "comparador", label: "Comparar", icon: "\uD83C\uDF0D" },
  { id: "noticias", label: "Noticias", icon: "\uD83D\uDCF0" },
];

// ── Colors ──
const CAT_COLORS: Record<string, string> = {
  instituciones: "#0F4483", democracia: "#2563eb", presupuestos: "#16a34a",
  elecciones: "#E30613", territorio: "#0d9488", europa: "#ca8a04",
  "ciudadania-digital": "#7c3aed", actualidad: "#ea580c",
};
const CAT_LABELS: Record<string, string> = {
  instituciones: "Instituciones", democracia: "Democracia", presupuestos: "Presupuestos",
  elecciones: "Elecciones", territorio: "Territorio", europa: "Europa",
  "ciudadania-digital": "Digital", actualidad: "Actualidad",
};
const TYPE_ICONS: Record<LessonType, string> = {
  explicador: "\uD83D\uDCD6", simulacion: "\uD83C\uDFAE", quiz: "\u2753",
  comparador: "\uD83D\uDD0D", timeline: "\u23F3", debate: "\uD83D\uDDE3\uFE0F",
};
const TYPE_COLORS: Record<LessonType, string> = {
  explicador: "#2563eb", simulacion: "#7c3aed", quiz: "#ea580c",
  comparador: "#0d9488", timeline: "#ca8a04", debate: "#E30613",
};
const CHALLENGE_TYPE_COLORS: Record<ChallengeType, string> = {
  simulacion: "#2563eb", debate: "#7c3aed", investigacion: "#16a34a", quiz: "#ea580c",
};
const DIFF_COLORS: Record<Difficulty, string> = { facil: "#16a34a", medio: "#ca8a04", dificil: "#dc2626" };
const DIFF_LABELS: Record<Difficulty, string> = { facil: "Fácil", medio: "Medio", dificil: "Difícil" };
const RIGHTS_CAT_COLORS: Record<string, string> = { fundamental: "#2563eb", social: "#16a34a", deber: "#ea580c" };
const RIGHTS_CAT_LABELS: Record<string, string> = { fundamental: "Derecho fundamental", social: "Derecho social", deber: "Deber ciudadano" };

const CATEGORIES: Category[] = ["instituciones", "democracia", "presupuestos", "territorio", "europa", "ciudadania-digital"];
const LEVEL_OPTIONS = ["basico", "intermedio", "avanzado"];

const BUDGET_CATEGORIES = [
  { id: "sanidad", label: "Sanidad", color: "#16a34a" },
  { id: "educacion", label: "Educación", color: "#2563eb" },
  { id: "pensiones", label: "Pensiones", color: "#7c3aed" },
  { id: "infraestructuras", label: "Infraestructuras", color: "#ea580c" },
  { id: "defensa", label: "Defensa", color: "#6b7280" },
];
const BUDGET_IMPACTS: Record<string, (v: number) => string> = {
  sanidad: (v) => v >= 25 ? "Excelente cobertura sanitaria universal" : v >= 15 ? "Cobertura adecuada con listas de espera" : "Riesgo de deterioro del sistema sanitario",
  educacion: (v) => v >= 20 ? "Inversión líder en formación" : v >= 10 ? "Nivel medio europeo" : "Riesgo de brecha educativa",
  pensiones: (v) => v >= 30 ? "Pensiones generosas pero riesgo de sostenibilidad" : v >= 20 ? "Sistema equilibrado" : "Pensiones insuficientes, riesgo de pobreza senior",
  infraestructuras: (v) => v >= 20 ? "Gran impulso inversor" : v >= 10 ? "Mantenimiento adecuado" : "Deterioro progresivo de infraestructuras",
  defensa: (v) => v >= 10 ? "Cumple compromisos OTAN" : v >= 5 ? "Nivel actual español" : "Por debajo de compromisos internacionales",
};

// ── D'Hondt simulator data (real constituencies) ──
const DHONDT_CONSTITUENCIES = [
  { name: "Madrid", seats: 37 },
  { name: "Barcelona", seats: 32 },
  { name: "Valencia", seats: 16 },
  { name: "Sevilla", seats: 12 },
  { name: "Alicante", seats: 12 },
  { name: "Málaga", seats: 11 },
  { name: "Murcia", seats: 10 },
  { name: "Soria", seats: 2 },
  { name: "Teruel", seats: 3 },
];
const DHONDT_PARTIES = [
  { id: "pp", name: "Partido A", color: "#0F4483" },
  { id: "psoe", name: "Partido B", color: "#E30613" },
  { id: "vox", name: "Partido C", color: "#63BE21" },
  { id: "sumar", name: "Partido D", color: "#E5007E" },
  { id: "otro", name: "Partido E", color: "#ca8a04" },
];

// ── Coalition game data ──
const COALITION_PARTIES = [
  { id: "pa", name: "Partido A (centroderecha)", seats: 137, color: "#0F4483" },
  { id: "pb", name: "Partido B (centroizquierda)", seats: 121, color: "#E30613" },
  { id: "pc", name: "Partido C (derecha)", seats: 33, color: "#63BE21" },
  { id: "pd", name: "Partido D (izquierda)", seats: 31, color: "#E5007E" },
  { id: "pe", name: "Partido E (nacionalista)", seats: 14, color: "#ca8a04" },
  { id: "pf", name: "Partido F (nacionalista)", seats: 7, color: "#0d9488" },
  { id: "pg", name: "Partido G (regionalista)", seats: 5, color: "#7c3aed" },
  { id: "ph", name: "Mixto", seats: 2, color: "#6b7280" },
];

// ── Badges ──
const ALL_BADGES: Badge[] = [
  { id: "b-first-lesson", name: "Primera lección", icon: "\uD83C\uDF1F", description: "Completa tu primera lección", earned: false },
  { id: "b-5-lessons", name: "Estudiante aplicado", icon: "\uD83D\uDCDA", description: "Completa 5 lecciones", earned: false },
  { id: "b-10-lessons", name: "Experto cívico", icon: "\uD83C\uDF93", description: "Completa 10 lecciones", earned: false },
  { id: "b-first-challenge", name: "Primer reto", icon: "\uD83C\uDFAF", description: "Completa tu primer reto", earned: false },
  { id: "b-5-correct", name: "Cerebrito", icon: "\uD83E\uDDE0", description: "Acierta 5 preguntas seguidas", earned: false },
  { id: "b-streak-3", name: "Racha de 3", icon: "\uD83D\uDD25", description: "Mantiene una racha de 3 días", earned: false },
  { id: "b-streak-7", name: "Semana completa", icon: "\u2B50", description: "Mantiene una racha de 7 días", earned: false },
  { id: "b-all-myths", name: "Cazamitos", icon: "\uD83D\uDD0E", description: "Lee todos los mitos y realidades", earned: false },
  { id: "b-budget-master", name: "Ministro de Hacienda", icon: "\uD83D\uDCB0", description: "Equilibra un presupuesto", earned: false },
  { id: "b-coalition", name: "Negociador", icon: "\uD83E\uDD1D", description: "Forma una coalición viable", earned: false },
];

// ── Helpers ──
function calcLevel(xp: number): number { return Math.floor(xp / 100) + 1; }
function xpToNextLevel(xp: number): number { return 100 - (xp % 100); }
function todayStr(): string { return new Date().toISOString().slice(0, 10); }

function loadJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, val: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function dHondtCalc(votes: Record<string, number>, seats: number): Record<string, number> {
  const result: Record<string, number> = {};
  const parties = Object.keys(votes).filter((p) => votes[p] > 0);
  parties.forEach((p) => { result[p] = 0; });
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const threshold = totalVotes * 0.03;
  const eligible = parties.filter((p) => votes[p] >= threshold);
  for (let s = 0; s < seats; s++) {
    let maxQ = 0;
    let winner = eligible[0] || "";
    for (const p of eligible) {
      const q = votes[p] / (result[p] + 1);
      if (q > maxQ) { maxQ = q; winner = p; }
    }
    if (winner) result[winner]++;
  }
  return result;
}

const DEFAULT_XP: UserXP = { total: 0, level: 1, lessonXP: 0, challengeXP: 0, streakBonus: 0 };
const DEFAULT_PROGRESS: UserProgress = { completedLessons: [], completedChallenges: [], correctAnswers: 0, totalAnswers: 0 };
const DEFAULT_STREAK: StreakData = { current: 0, longest: 0, lastDate: "" };
const DEFAULT_PREFS: UserPrefs = { highContrast: false, fontSize: 14, simpleMode: false, flashcardMode: false };

const FALLBACK: EduData = {
  stats: { totalModules: 10, totalLessons: 36, totalChallenges: 8, byCategory: {} as Record<string, number>, byLevel: {} as Record<string, number> },
  modules: [], challenges: [], glossary: [],
  myths: [], rights: [], newsContext: [], participationMethods: [],
  internationalComparisons: [], weeklyChallenge: { id: "wk-0", title: "Cargando...", description: "", task: "", hint: "", relatedModule: "", weekNumber: 0 },
};

export default function EducacionPage() {
  const [data, setData] = useState<EduData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("modulos");
  const [catFilter, setCatFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [budget, setBudget] = useState<Record<string, number>>({ sanidad: 22, educacion: 18, pensiones: 35, infraestructuras: 15, defensa: 10 });

  // Feature 1: XP/Achievement system
  const [xp, setXP] = useState<UserXP>(DEFAULT_XP);
  // Feature 2: Progress tracking
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  // Feature 17: Streak counter
  const [streak, setStreak] = useState<StreakData>(DEFAULT_STREAK);
  // Feature 15: Badge system
  const [badges, setBadges] = useState<Badge[]>(ALL_BADGES);
  // Feature 20: Accessibility / Feature 8: Simple mode / Feature 18: Flashcard mode
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  // Feature 18: Flashcard revealed set
  const [flashcardRevealed, setFlashcardRevealed] = useState<Set<string>>(new Set());
  // Feature 5: D'Hondt simulator
  const [dhondtConstituency, setDhondtConstituency] = useState(0);
  const [dhondtVotes, setDhondtVotes] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    DHONDT_PARTIES.forEach((p) => { v[p.id] = 20; });
    return v;
  });
  // Feature 6: Coalition game
  const [coalitionSelected, setCoalitionSelected] = useState<Set<string>>(new Set());
  // Feature 4: Myths revealed
  const [mythsRevealed, setMythsRevealed] = useState<Set<string>>(new Set());
  // Feature 7: Difficulty adaptation
  const [suggestedDifficulty, setSuggestedDifficulty] = useState<Difficulty>("facil");
  // Feature 20: Show XP bar
  const [showXPNotification, setShowXPNotification] = useState<string>("");

  // ── Load persisted state ──
  useEffect(() => {
    setXP(loadJSON(XP_KEY, DEFAULT_XP));
    setProgress(loadJSON(PROGRESS_KEY, DEFAULT_PROGRESS));
    setStreak(loadJSON(STREAK_KEY, DEFAULT_STREAK));
    setBadges(loadJSON(BADGES_KEY, ALL_BADGES));
    setPrefs(loadJSON(PREFS_KEY, DEFAULT_PREFS));
  }, []);

  // ── Streak update on mount ──
  useEffect(() => {
    const today = todayStr();
    setStreak((prev) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (prev.lastDate === today) return prev;
      if (prev.lastDate === yesterdayStr) {
        const next = { ...prev, current: prev.current + 1, lastDate: today, longest: Math.max(prev.longest, prev.current + 1) };
        saveJSON(STREAK_KEY, next);
        return next;
      }
      const next = { ...prev, current: 1, lastDate: today };
      saveJSON(STREAK_KEY, next);
      return next;
    });
  }, []);

  // ── Fetch data ──
  useEffect(() => {
    try {
      const c = sessionStorage.getItem(CACHE_KEY);
      if (c) { const parsed = JSON.parse(c); if (parsed.myths) { setData(parsed); setLoading(false); return; } }
    } catch {}
    fetch("/api/educacion")
      .then((r) => r.json())
      .then((d) => { setData(d); try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch {} })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Feature 7: Difficulty adaptation ──
  useEffect(() => {
    const ratio = progress.totalAnswers > 0 ? progress.correctAnswers / progress.totalAnswers : 0;
    if (ratio >= 0.8 && progress.totalAnswers >= 5) setSuggestedDifficulty("dificil");
    else if (ratio >= 0.5 && progress.totalAnswers >= 3) setSuggestedDifficulty("medio");
    else setSuggestedDifficulty("facil");
  }, [progress.correctAnswers, progress.totalAnswers]);

  // ── XP + Badge helpers ──
  const addXP = useCallback((amount: number, source: string) => {
    setXP((prev) => {
      const next = { ...prev, total: prev.total + amount, level: calcLevel(prev.total + amount) };
      if (source === "lesson") next.lessonXP = prev.lessonXP + amount;
      if (source === "challenge") next.challengeXP = prev.challengeXP + amount;
      if (source === "streak") next.streakBonus = prev.streakBonus + amount;
      saveJSON(XP_KEY, next);
      return next;
    });
    setShowXPNotification(`+${amount} XP`);
    setTimeout(() => setShowXPNotification(""), 2000);
  }, []);

  const earnBadge = useCallback((badgeId: string) => {
    setBadges((prev) => {
      const updated = prev.map((b) => b.id === badgeId && !b.earned ? { ...b, earned: true, earnedDate: todayStr() } : b);
      saveJSON(BADGES_KEY, updated);
      return updated;
    });
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const next = { ...prev, completedLessons: [...prev.completedLessons, lessonId] };
      saveJSON(PROGRESS_KEY, next);
      return next;
    });
    addXP(10, "lesson");
    if (progress.completedLessons.length === 0) earnBadge("b-first-lesson");
    if (progress.completedLessons.length === 4) earnBadge("b-5-lessons");
    if (progress.completedLessons.length === 9) earnBadge("b-10-lessons");
  }, [addXP, earnBadge, progress.completedLessons]);

  const recordAnswer = useCallback((correct: boolean) => {
    setProgress((prev) => {
      const next = { ...prev, correctAnswers: prev.correctAnswers + (correct ? 1 : 0), totalAnswers: prev.totalAnswers + 1 };
      saveJSON(PROGRESS_KEY, next);
      return next;
    });
    if (correct) addXP(5, "challenge");
  }, [addXP]);

  const markChallengeComplete = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.completedChallenges.includes(challengeId)) return prev;
      const next = { ...prev, completedChallenges: [...prev.completedChallenges, challengeId] };
      saveJSON(PROGRESS_KEY, next);
      return next;
    });
    addXP(25, "challenge");
    if (progress.completedChallenges.length === 0) earnBadge("b-first-challenge");
  }, [addXP, earnBadge, progress.completedChallenges]);

  // ── Filters ──
  const filteredModules = useMemo(() => {
    let list = data.modules;
    if (catFilter) list = list.filter((m) => m.category === catFilter);
    if (levelFilter) list = list.filter((m) => m.level === levelFilter);
    return list;
  }, [data.modules, catFilter, levelFilter]);

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch) return data.glossary;
    const q = glossarySearch.toLowerCase();
    return data.glossary.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [data.glossary, glossarySearch]);

  const budgetTotal = Object.values(budget).reduce((s, v) => s + v, 0);
  const budgetValid = budgetTotal === 100;

  const revealAnswer = (qKey: string, optionIndex: number, correctIndex: number) => {
    if (revealedAnswers.has(qKey)) return;
    setRevealedAnswers((prev) => new Set(prev).add(qKey));
    setSelectedAnswers((prev) => ({ ...prev, [qKey]: optionIndex }));
    recordAnswer(optionIndex === correctIndex);
  };

  // Feature 2: Module completion percentage
  const moduleProgress = useCallback((mod: Module): number => {
    const total = mod.lessons.length;
    if (total === 0) return 0;
    const done = mod.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
    return Math.round((done / total) * 100);
  }, [progress.completedLessons]);

  // Feature 5: D'Hondt results
  const dhondtResults = useMemo(() => {
    const constituency = DHONDT_CONSTITUENCIES[dhondtConstituency];
    return dHondtCalc(dhondtVotes, constituency.seats);
  }, [dhondtVotes, dhondtConstituency]);

  // Feature 6: Coalition total
  const coalitionSeats = useMemo(() => {
    return COALITION_PARTIES.filter((p) => coalitionSelected.has(p.id)).reduce((s, p) => s + p.seats, 0);
  }, [coalitionSelected]);

  // Feature 19: Print study guide
  const printStudyGuide = useCallback((mod: Module) => {
    const content = mod.lessons.map((l) =>
      `${l.order}. ${l.title} (${l.type})\n${prefs.simpleMode && l.simpleText ? l.simpleText : l.content}\n\nDatos clave:\n${l.keyFacts.map((f) => `  - ${f}`).join("\n")}\n`
    ).join("\n---\n\n");
    const text = `GUIA DE ESTUDIO: ${mod.title}\n${"=".repeat(50)}\n\n${mod.description}\n\nObjetivos:\n${mod.objectives.map((o) => `  - ${o}`).join("\n")}\n\n${"=".repeat(50)}\n\n${content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guia-${mod.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prefs.simpleMode]);

  const { stats } = data;
  const earnedBadgeCount = badges.filter((b) => b.earned).length;

  // ── Accessibility: apply prefs to root ──
  const rootStyle: React.CSSProperties = {
    fontSize: `${prefs.fontSize}px`,
    ...(prefs.highContrast ? { filter: "contrast(1.4)" } : {}),
  };

  return (
    <main className="page-shell detail-page" style={rootStyle}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader currentSection="educacion" />

      {/* ── XP Notification ── */}
      {showXPNotification && (
        <div className="edu-xp-notification">{showXPNotification}</div>
      )}

      {/* ── Hero ── */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">PLATAFORMA EDUCATIVA</span>
            <h1 className="detail-title">Aprende c&oacute;mo funciona Espa&ntilde;a</h1>
            <p className="detail-description">
              M&oacute;dulos interactivos, retos, simulaciones, mitos desmentidos, derechos constitucionales
              y herramientas de participaci&oacute;n ciudadana. Datos oficiales, lenguaje claro.
            </p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Tu progreso</h2>
            <div className="kpi-grid-2">
              <div className="kpi-cell"><strong style={{ color: "var(--azul)" }}>{xp.total}</strong><span>XP Total</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--verde)" }}>Nv. {xp.level}</strong><span>{xpToNextLevel(xp.total)} XP al siguiente</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--rojo)" }}>{streak.current}</strong><span>D&iacute;as de racha</span></div>
              <div className="kpi-cell"><strong style={{ color: "var(--amarillo)" }}>{earnedBadgeCount}/{badges.length}</strong><span>Insignias</span></div>
            </div>
            {/* XP Progress bar */}
            <div className="edu-xp-bar-container">
              <div className="edu-xp-bar" style={{ width: `${((xp.total % 100) / 100) * 100}%` }} />
            </div>
          </aside>
        </div>
      </section>

      {/* ── Accessibility + Prefs toolbar ── */}
      <section className="panel">
        <div className="edu-toolbar">
          <div className="edu-toolbar-group">
            <button className={`edu-toolbar-btn ${prefs.highContrast ? "edu-toolbar-btn-active" : ""}`} onClick={() => { const next = { ...prefs, highContrast: !prefs.highContrast }; setPrefs(next); saveJSON(PREFS_KEY, next); }} title="Alto contraste">
              Alto contraste
            </button>
            <button className="edu-toolbar-btn" onClick={() => { const next = { ...prefs, fontSize: Math.min(prefs.fontSize + 1, 20) }; setPrefs(next); saveJSON(PREFS_KEY, next); }} title="Aumentar texto">
              A+
            </button>
            <button className="edu-toolbar-btn" onClick={() => { const next = { ...prefs, fontSize: Math.max(prefs.fontSize - 1, 11) }; setPrefs(next); saveJSON(PREFS_KEY, next); }} title="Reducir texto">
              A-
            </button>
            <button className={`edu-toolbar-btn ${prefs.simpleMode ? "edu-toolbar-btn-active" : ""}`} onClick={() => { const next = { ...prefs, simpleMode: !prefs.simpleMode }; setPrefs(next); saveJSON(PREFS_KEY, next); }} title="Modo simple">
              Modo simple
            </button>
          </div>
          <div className="edu-toolbar-group">
            <span className="edu-toolbar-stats">
              {progress.completedLessons.length} lecciones completadas
              {" | "}
              {progress.correctAnswers}/{progress.totalAnswers} respuestas correctas
              {" | "}
              Nivel sugerido: {DIFF_LABELS[suggestedDifficulty]}
            </span>
          </div>
        </div>
      </section>

      {/* ── Weekly Challenge banner ── */}
      {data.weeklyChallenge && data.weeklyChallenge.id !== "wk-0" && (
        <section className="panel">
          <div className="edu-weekly-banner">
            <div className="edu-weekly-badge">RETO SEMANAL</div>
            <h3 className="edu-weekly-title">{data.weeklyChallenge.title}</h3>
            <p className="edu-weekly-desc">{data.weeklyChallenge.description}</p>
            <p className="edu-weekly-task"><strong>Tarea:</strong> {data.weeklyChallenge.task}</p>
            <p className="edu-weekly-hint"><strong>Pista:</strong> {data.weeklyChallenge.hint}</p>
          </div>
        </section>
      )}

      {/* ── Badges display ── */}
      <section className="panel">
        <div className="edu-badges-row">
          {badges.map((b) => (
            <div key={b.id} className={`edu-badge ${b.earned ? "edu-badge-earned" : "edu-badge-locked"}`} title={b.description}>
              <span className="edu-badge-icon">{b.icon}</span>
              <span className="edu-badge-name">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── View tabs ── */}
      <section className="panel section-panel">
        <div className="edu-tabs">
          {VIEW_TABS.map((t) => (
            <button key={t.id} className={`edu-tab ${view === t.id ? "edu-tab-active" : ""}`} onClick={() => setView(t.id)}>
              <span className="edu-tab-icon">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── Modulos ── */}
        {view === "modulos" && (
          <>
            <div className="edu-filters">
              <div className="edu-pills">
                <button className={`edu-pill ${!catFilter ? "edu-pill-active" : ""}`} onClick={() => setCatFilter("")}>Todos</button>
                {CATEGORIES.map((c) => (
                  <button key={c} className={`edu-pill ${catFilter === c ? "edu-pill-active" : ""}`} style={catFilter === c ? { background: `${CAT_COLORS[c]}18`, color: CAT_COLORS[c], borderColor: CAT_COLORS[c] } : {}} onClick={() => setCatFilter(c)}>{CAT_LABELS[c]}</button>
                ))}
              </div>
              <div className="edu-pills">
                <button className={`edu-pill ${!levelFilter ? "edu-pill-active" : ""}`} onClick={() => setLevelFilter("")}>Todos los niveles</button>
                {LEVEL_OPTIONS.map((l) => (
                  <button key={l} className={`edu-pill ${levelFilter === l ? "edu-pill-active" : ""}`} onClick={() => setLevelFilter(l)}>{l.charAt(0).toUpperCase() + l.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="edu-grid">
              {filteredModules.map((m) => {
                const isOpen = expanded === m.id;
                const catColor = CAT_COLORS[m.category] || "#666";
                const pct = moduleProgress(m);
                return (
                  <article key={m.id} className="edu-card" onClick={() => setExpanded(isOpen ? null : m.id)}>
                    <h3 className="edu-card-title">{m.title}</h3>
                    <div className="edu-card-badges">
                      <span className="tag" style={{ background: `${catColor}18`, color: catColor }}>{CAT_LABELS[m.category] || m.category}</span>
                      <span className="micro-tag">{m.level}</span>
                      <span className="micro-tag">{m.ageRange} a&ntilde;os</span>
                      <span className="micro-tag">{m.duration}</span>
                    </div>
                    <p className="edu-card-desc">{m.description}</p>
                    {/* Feature 2: Progress bar */}
                    <div className="edu-progress-bar-container">
                      <div className="edu-progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? "var(--verde)" : "var(--azul)" }} />
                      <span className="edu-progress-label">{pct}% completado</span>
                    </div>
                    <div className="edu-card-meta">
                      <span>{m.lessons.length} lecciones</span>
                      <div className="edu-card-tags">{m.tags.map((t) => (<span key={t} className="micro-tag">{t}</span>))}</div>
                    </div>
                    {/* Feature 19: Print study guide */}
                    <button className="edu-print-btn" onClick={(e) => { e.stopPropagation(); printStudyGuide(m); }}>
                      Descargar gu&iacute;a de estudio
                    </button>
                    {isOpen && (
                      <div className="edu-card-lessons">
                        {m.lessons.map((l) => {
                          const isCompleted = progress.completedLessons.includes(l.id);
                          return (
                            <div key={l.order} className="edu-lesson">
                              <span className="edu-lesson-order" style={{ background: isCompleted ? "#16a34a20" : undefined, color: isCompleted ? "#16a34a" : undefined }}>
                                {isCompleted ? "\u2713" : l.order}
                              </span>
                              <div className="edu-lesson-info">
                                <strong>
                                  {/* Feature 16: Lesson type icons */}
                                  <span className="edu-lesson-type-icon">{TYPE_ICONS[l.type]}</span>
                                  {l.title}
                                </strong>
                                <span className="tag" style={{ background: `${TYPE_COLORS[l.type]}18`, color: TYPE_COLORS[l.type], fontSize: "0.7rem" }}>{l.type}</span>
                                {/* Feature 8: "Explain Like I'm 12" / Feature 9: Live data ref */}
                                <p className="edu-lesson-preview">{prefs.simpleMode && l.simpleText ? l.simpleText : l.content}</p>
                                {l.liveDataRef && (
                                  <span className="edu-live-ref" title="Datos en vivo disponibles">Datos en vivo</span>
                                )}
                                {l.keyFacts && l.keyFacts.length > 0 && (
                                  <div className="edu-keyfacts">{l.keyFacts.map((f, i) => (<span key={i} className="micro-tag">{f}</span>))}</div>
                                )}
                                {!isCompleted && (
                                  <button className="edu-complete-btn" onClick={(e) => { e.stopPropagation(); markLessonComplete(l.id); }}>
                                    Marcar como completada
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* ── Retos ── */}
        {view === "retos" && (
          <>
            {/* Feature 7: Difficulty suggestion */}
            <div className="edu-difficulty-hint">
              Basado en tus respuestas, te recomendamos dificultad: <strong style={{ color: DIFF_COLORS[suggestedDifficulty] }}>{DIFF_LABELS[suggestedDifficulty]}</strong>
            </div>
            <div className="edu-grid">
              {data.challenges.map((ch) => {
                const isOpen = expanded === ch.id;
                const isCompleted = progress.completedChallenges.includes(ch.id);
                return (
                  <article key={ch.id} className={`edu-card ${isCompleted ? "edu-card-completed" : ""}`} onClick={() => setExpanded(isOpen ? null : ch.id)}>
                    <h3 className="edu-card-title">
                      {isCompleted && <span className="edu-completed-icon">{"✓ "}</span>}
                      {ch.title}
                    </h3>
                    <div className="edu-card-badges">
                      <span className="tag" style={{ background: `${CHALLENGE_TYPE_COLORS[ch.type]}18`, color: CHALLENGE_TYPE_COLORS[ch.type] }}>{ch.type}</span>
                      <span className="tag" style={{ background: `${DIFF_COLORS[ch.difficulty]}18`, color: DIFF_COLORS[ch.difficulty] }}>{DIFF_LABELS[ch.difficulty]}</span>
                      {isCompleted && <span className="tag" style={{ background: "#16a34a18", color: "#16a34a" }}>Completado</span>}
                    </div>
                    <p className="edu-card-desc">{ch.scenario}</p>
                    <div className="edu-card-meta">
                      <span>{ch.questions.length} preguntas</span>
                      <button className="edu-start-btn" onClick={(e) => { e.stopPropagation(); setExpanded(ch.id); }}>Empezar</button>
                    </div>
                    {isOpen && (
                      <div className="edu-challenge-questions" onClick={(e) => e.stopPropagation()}>
                        {ch.questions.map((q, qi) => {
                          const qKey = `${ch.id}-${qi}`;
                          const revealed = revealedAnswers.has(qKey);
                          const selected = selectedAnswers[qKey];
                          return (
                            <div key={qi} className="edu-question">
                              <p className="edu-question-text">{qi + 1}. {q.text}</p>
                              <div className="edu-options">
                                {q.options.map((opt, oi) => (
                                  <button
                                    key={oi}
                                    className={`edu-option ${revealed ? (oi === q.correctIndex ? "edu-option-correct" : (oi === selected ? "edu-option-wrong" : "")) : ""}`}
                                    onClick={() => revealAnswer(qKey, oi, q.correctIndex)}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                              {revealed && <p className="edu-explanation">{q.explanation}</p>}
                            </div>
                          );
                        })}
                        {!isCompleted && (
                          <button className="edu-start-btn" style={{ marginTop: 8 }} onClick={() => { markChallengeComplete(ch.id); }}>
                            Completar reto (+25 XP)
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* ── Glosario ── */}
        {view === "glosario" && (
          <>
            <div className="edu-glossary-toolbar">
              <input className="edu-glossary-search" type="text" placeholder="Buscar término..." value={glossarySearch} onChange={(e) => setGlossarySearch(e.target.value)} />
              {/* Feature 18: Flashcard mode toggle */}
              <button className={`edu-toolbar-btn ${prefs.flashcardMode ? "edu-toolbar-btn-active" : ""}`} onClick={() => { const next = { ...prefs, flashcardMode: !prefs.flashcardMode }; setPrefs(next); saveJSON(PREFS_KEY, next); setFlashcardRevealed(new Set()); }}>
                Modo flashcard
              </button>
            </div>
            <div className="edu-glossary-list">
              {filteredGlossary.map((t, idx) => {
                const catColor = CAT_COLORS[t.category] || "#666";
                const isFlashcardHidden = prefs.flashcardMode && !flashcardRevealed.has(String(idx));
                return (
                  <div key={idx} className={`edu-glossary-item ${prefs.flashcardMode ? "edu-flashcard" : ""}`} onClick={() => {
                    if (prefs.flashcardMode) setFlashcardRevealed((prev) => { const n = new Set(prev); n.add(String(idx)); return n; });
                  }}>
                    <div className="edu-glossary-head">
                      <strong className="edu-glossary-term">{t.term}</strong>
                      <span className="tag" style={{ background: `${catColor}18`, color: catColor, fontSize: "0.7rem" }}>{CAT_LABELS[t.category] || t.category}</span>
                    </div>
                    {isFlashcardHidden ? (
                      <p className="edu-flashcard-hint">Toca para revelar la definici&oacute;n</p>
                    ) : (
                      <>
                        <p className="edu-glossary-def">{t.definition}</p>
                        {t.example && <p className="edu-glossary-example">Ejemplo: {t.example}</p>}
                        {/* Feature 3: Constitutional article explorer */}
                        {t.constitutionalRef && t.constitutionalRef.length > 0 && (
                          <div className="edu-constitutional-refs">
                            {t.constitutionalRef.map((ref, ri) => (
                              <div key={ri} className="edu-constitutional-ref">
                                <strong>Art. {ref.article} CE</strong> &mdash; {ref.title}
                                <p className="edu-constitutional-text">{ref.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {t.relatedTerms.length > 0 && (
                          <div className="edu-glossary-related">
                            {t.relatedTerms.map((rt) => (<span key={rt} className="micro-tag">{rt}</span>))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Simulador ── */}
        {view === "simulador" && (
          <div className="edu-simulator">
            <SectionHeading eyebrow="Simulación interactiva" title="Aprueba un presupuesto" description="Distribuye el 100% del gasto público entre cinco categorías. Observa el impacto de tus decisiones." />
            <div className="edu-sim-total" style={{ color: budgetValid ? "var(--verde)" : "var(--rojo)" }}>
              Total asignado: {budgetTotal}% {budgetValid ? "(Equilibrado)" : `(${budgetTotal > 100 ? "Exceso" : "Faltan"} ${Math.abs(100 - budgetTotal)}%)`}
            </div>
            <div className="edu-sim-sliders">
              {BUDGET_CATEGORIES.map((cat) => {
                const val = budget[cat.id];
                const impact = BUDGET_IMPACTS[cat.id](val);
                return (
                  <div key={cat.id} className="edu-sim-row">
                    <div className="edu-sim-label">
                      <span className="edu-sim-cat" style={{ color: cat.color }}>{cat.label}</span>
                      <strong className="edu-sim-val">{val}%</strong>
                    </div>
                    <input
                      type="range" min={0} max={60} step={1} value={val}
                      className="edu-sim-slider"
                      style={{ accentColor: cat.color }}
                      onChange={(e) => setBudget((prev) => ({ ...prev, [cat.id]: Number(e.target.value) }))}
                    />
                    <div className="edu-sim-bar" style={{ background: `${cat.color}20` }}>
                      <div className="edu-sim-bar-fill" style={{ width: `${(val / 60) * 100}%`, background: cat.color }} />
                    </div>
                    <p className="edu-sim-impact">{impact}</p>
                  </div>
                );
              })}
            </div>
            {budgetValid && (
              <div className="edu-sim-result">
                <h4>Tu presupuesto est&aacute; equilibrado</h4>
                <p>Has distribuido los recursos p&uacute;blicos. En la realidad, el Gobierno negocia estas cifras con los grupos parlamentarios durante meses antes de aprobar los PGE en el Congreso.</p>
                <button className="edu-start-btn" onClick={() => { earnBadge("b-budget-master"); addXP(20, "challenge"); }}>
                  Guardar resultado (+20 XP)
                </button>
              </div>
            )}

            {/* ── Feature 5: Enhanced D'Hondt Simulator ── */}
            <div className="edu-dhondt-section" style={{ marginTop: 24 }}>
              <SectionHeading eyebrow="Simulador electoral" title="Reparto D&rsquo;Hondt" description="Elige una circunscripci&oacute;n real y distribuye votos entre partidos. Observa c&oacute;mo se reparten los esca&ntilde;os." />
              <div className="edu-dhondt-constituency">
                <label>Circunscripci&oacute;n: </label>
                <select value={dhondtConstituency} onChange={(e) => setDhondtConstituency(Number(e.target.value))} className="edu-select">
                  {DHONDT_CONSTITUENCIES.map((c, i) => (
                    <option key={i} value={i}>{c.name} ({c.seats} esca&ntilde;os)</option>
                  ))}
                </select>
              </div>
              <div className="edu-dhondt-parties">
                {DHONDT_PARTIES.map((p) => (
                  <div key={p.id} className="edu-dhondt-party">
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span>
                    <input type="range" min={0} max={100} value={dhondtVotes[p.id]} style={{ accentColor: p.color }}
                      onChange={(e) => setDhondtVotes((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))} />
                    <span className="edu-dhondt-pct">{dhondtVotes[p.id]}%</span>
                  </div>
                ))}
              </div>
              <div className="edu-dhondt-results">
                <h4>Resultado: {DHONDT_CONSTITUENCIES[dhondtConstituency].name}</h4>
                <div className="edu-dhondt-bars">
                  {DHONDT_PARTIES.map((p) => {
                    const seats = dhondtResults[p.id] || 0;
                    const maxSeats = DHONDT_CONSTITUENCIES[dhondtConstituency].seats;
                    return (
                      <div key={p.id} className="edu-dhondt-bar-row">
                        <span style={{ color: p.color, minWidth: 80, fontWeight: 600 }}>{p.name}</span>
                        <div className="edu-dhondt-bar-bg">
                          <div className="edu-dhondt-bar-fill" style={{ width: `${(seats / maxSeats) * 100}%`, background: p.color }} />
                        </div>
                        <strong>{seats}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Feature 6: Coalition Game ── */}
            <div className="edu-coalition-section" style={{ marginTop: 24 }}>
              <SectionHeading eyebrow="Juego de coaliciones" title="Forma un gobierno" description="Selecciona partidos hasta sumar al menos 176 esca&ntilde;os (mayor&iacute;a absoluta). 350 diputados en total." />
              <div className="edu-coalition-parties">
                {COALITION_PARTIES.map((p) => (
                  <button
                    key={p.id}
                    className={`edu-coalition-party ${coalitionSelected.has(p.id) ? "edu-coalition-party-selected" : ""}`}
                    style={coalitionSelected.has(p.id) ? { borderColor: p.color, background: `${p.color}15` } : {}}
                    onClick={() => {
                      setCoalitionSelected((prev) => {
                        const n = new Set(prev);
                        if (n.has(p.id)) n.delete(p.id); else n.add(p.id);
                        return n;
                      });
                    }}
                  >
                    <span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span>
                    <strong>{p.seats} esca&ntilde;os</strong>
                  </button>
                ))}
              </div>
              <div className="edu-coalition-result" style={{ color: coalitionSeats >= 176 ? "var(--verde)" : "var(--rojo)" }}>
                Total: {coalitionSeats} / 350 esca&ntilde;os
                {coalitionSeats >= 176 ? " — Mayoría absoluta alcanzada" : ` — Faltan ${176 - coalitionSeats} para gobernar`}
              </div>
              {coalitionSeats >= 176 && (
                <button className="edu-start-btn" style={{ marginTop: 8 }} onClick={() => { earnBadge("b-coalition"); addXP(20, "challenge"); }}>
                  Coalici&oacute;n formada (+20 XP)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Feature 4: Mitos vs Realidad ── */}
        {view === "mitos" && (
          <>
            <SectionHeading eyebrow="Mitos vs Realidad" title="Desmontando mitos c&iacute;vicos" description="Creencias comunes sobre la pol&iacute;tica espa&ntilde;ola que no son del todo ciertas. Toca cada mito para descubrir la realidad." />
            <div className="edu-myths-list">
              {data.myths.map((m) => {
                const isRevealed = mythsRevealed.has(m.id);
                return (
                  <div key={m.id} className="edu-myth-card" onClick={() => {
                    setMythsRevealed((prev) => { const n = new Set(prev); n.add(m.id); return n; });
                    if (mythsRevealed.size + 1 >= data.myths.length) earnBadge("b-all-myths");
                  }}>
                    <div className="edu-myth-header">
                      <span className="edu-myth-icon">{isRevealed ? "\u2705" : "\u274C"}</span>
                      <p className="edu-myth-text"><strong>Mito:</strong> {m.myth}</p>
                    </div>
                    {isRevealed && (
                      <div className="edu-reality">
                        <p><strong>Realidad:</strong> {m.reality}</p>
                        <span className="edu-myth-source">Fuente: {m.source}</span>
                      </div>
                    )}
                    {!isRevealed && <p className="edu-flashcard-hint">Toca para descubrir la realidad</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Feature 12: Rights & Duties Guide ── */}
        {view === "derechos" && (
          <>
            <SectionHeading eyebrow="Constitución Española" title="Derechos y deberes" description="Los derechos fundamentales, derechos sociales y deberes que reconoce la Constitución de 1978." />
            <div className="edu-rights-grid">
              {data.rights.map((r, i) => {
                const catColor = RIGHTS_CAT_COLORS[r.category] || "#666";
                return (
                  <div key={i} className="edu-right-card">
                    <div className="edu-right-header">
                      <span className="edu-right-article">Art. {r.article}</span>
                      <span className="tag" style={{ background: `${catColor}18`, color: catColor, fontSize: "0.7rem" }}>{RIGHTS_CAT_LABELS[r.category]}</span>
                    </div>
                    <h4 className="edu-right-title">{r.right}</h4>
                    <p className="edu-right-explanation">{r.explanation}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Feature 14: Citizen Participation Guide ── */}
        {view === "participacion" && (
          <>
            <SectionHeading eyebrow="Participación ciudadana" title="Cómo participar" description="No hace falta esperar a votar cada 4 años. Descubre mecanismos de participación directa." />
            <div className="edu-participation-list">
              {data.participationMethods.map((pm) => (
                <div key={pm.id} className="edu-participation-card">
                  <h4 className="edu-participation-name">{pm.name}</h4>
                  <span className="tag" style={{ background: `${DIFF_COLORS[pm.difficulty]}18`, color: DIFF_COLORS[pm.difficulty], fontSize: "0.7rem" }}>
                    Dificultad: {DIFF_LABELS[pm.difficulty]}
                  </span>
                  <p className="edu-participation-desc">{pm.description}</p>
                  <p className="edu-participation-req"><strong>Requisitos:</strong> {pm.requirements}</p>
                  <p className="edu-glossary-example">Ejemplo: {pm.example}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Feature 10: International Comparisons ── */}
        {view === "comparador" && (
          <>
            <SectionHeading eyebrow="Comparativa internacional" title="España vs el mundo" description="Cómo se compara España con otras democracias en temas clave." />
            <div className="edu-comparisons-list">
              {data.internationalComparisons.map((ic, i) => (
                <div key={i} className="edu-comparison-card">
                  <h4 className="edu-comparison-topic">{ic.topic}</h4>
                  <div className="edu-comparison-spain">
                    <strong>Espa&ntilde;a:</strong> {ic.spain}
                  </div>
                  <div className="edu-comparison-countries">
                    {ic.countries.map((c, ci) => (
                      <div key={ci} className="edu-comparison-country">
                        <span className="edu-comparison-flag">{c.country}</span>
                        <span>{c.value}</span>
                      </div>
                    ))}
                  </div>
                  <span className="edu-myth-source">Fuente: {ic.source}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Feature 13: News Comprehension Helper ── */}
        {view === "noticias" && (
          <>
            <SectionHeading eyebrow="Actualidad explicada" title="Entiende las noticias" description="Contexto educativo para entender las noticias políticas de España." />
            <div className="edu-news-list">
              {data.newsContext.map((n) => (
                <div key={n.id} className="edu-news-card">
                  <span className="edu-news-date">{n.date}</span>
                  <h4 className="edu-news-headline">{n.headline}</h4>
                  <p className="edu-news-context">{n.context}</p>
                  <span className="micro-tag">M&oacute;dulo relacionado: {n.relatedModule}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <SiteFooter sources="Constitución Española, BOE, Congreso, PGE, INE, datos.gob.es" />
    </main>
  );
}
