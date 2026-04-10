"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

/* ═══════════════════════════════════════════════════════════════════════════
   Decisiones — Mirofish-inspired political decision graph visualization.
   Force-directed graph of Spanish political actors, institutions, votes,
   laws and territories. Four views: Grafo, Decisiones, Narrativas, Explorador.
   ═══════════════════════════════════════════════════════════════════════════ */

type NodeType = "partido" | "politico" | "institucion" | "votacion" | "ley" | "territorio" | "comision" | "evento";
type ViewMode = "grafo" | "decisiones" | "narrativas" | "explorador";

interface GNode { id: string; type: NodeType; label: string; shortLabel?: string; color: string; size: number; metadata: Record<string, any>; group?: string; }
interface GEdge { id: string; source: string; target: string; type: string; weight: number; label?: string; color?: string; metadata?: Record<string, any>; }
interface DPath { id: string; title: string; description: string; status: "en-curso" | "aprobado" | "rechazado" | "bloqueado"; steps: { order: number; label: string; institution: string; status: "completado" | "en-curso" | "pendiente" | "bloqueado"; date?: string; relatedNodeIds: string[]; }[]; outcome?: string; probability?: number; }
interface NThread { id: string; title: string; summary: string; sentiment: number; actors: { nodeId: string; role: string }[]; hotTopics: string[]; activationSequence: { order: number; sourceType: string; agentLabel: string; content: string; timestamp: string; }[]; }
interface GData { nodes: GNode[]; edges: GEdge[]; decisionPaths: DPath[]; narrativeThreads: NThread[]; stats: { totalNodes: number; totalEdges: number; avgConnections: number; mostConnectedNode: { id: string; label: string; connections: number }; clusterCount: number; density: number; }; }

// Physics
const REPULSION = 2500, ATTRACTION = 0.003, DAMPING = 0.6, CENTER_GRAVITY = 0.008, MAX_ITER = 300, MAX_VELOCITY = 4;

const SZ: Record<NodeType, number> = { partido: 18, institucion: 16, politico: 12, votacion: 10, ley: 14, territorio: 14, comision: 10, evento: 10 };
const TL: Record<NodeType, string> = { partido: "Partido", politico: "Politico", institucion: "Institucion", votacion: "Votacion", ley: "Ley", territorio: "Territorio", comision: "Comision", evento: "Evento" };
const TC: Record<NodeType, string> = { partido: "#E30613", politico: "#1a1a2e", institucion: "#0F4483", votacion: "#2e7d32", ley: "#FFDB00", territorio: "#4a90d9", comision: "#7690b2", evento: "#e67e22" };
const SBC: Record<string, string> = { MediaOutlet: "#dc2626", PoliticalParty: "#2563eb", GovernmentAgency: "#1e3a5f", Parliament: "#ca8a04", RegionalGovernment: "#0d9488", CivilSociety: "#16a34a", EuropeanInstitution: "#7c3aed", PrivateSector: "#ea580c" };
const STEP_C: Record<string, string> = { completado: "#16a34a", "en-curso": "#2563eb", pendiente: "#9ca3af", bloqueado: "#dc2626" };
const STAT_C: Record<string, string> = { "en-curso": "#2563eb", aprobado: "#16a34a", rechazado: "#dc2626", bloqueado: "#ef4444" };

const TABS: { key: ViewMode; label: string }[] = [{ key: "grafo", label: "Grafo" }, { key: "decisiones", label: "Decisiones" }, { key: "narrativas", label: "Narrativas" }, { key: "explorador", label: "Explorador" }];
const FILT_TYPES: NodeType[] = ["partido", "politico", "institucion", "votacion", "ley", "territorio"];

interface SimNode extends GNode { x: number; y: number; vx: number; vy: number; }

export default function DecisionesPage() {
  const [data, setData] = useState<GData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grafo");
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(FILT_TYPES));
  const [minWeight, setMinWeight] = useState(0);
  const [hovered, setHovered] = useState<SimNode | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [expSearch, setExpSearch] = useState("");
  const [expSel, setExpSel] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimNode[]>([]);
  const afRef = useRef(0);
  const iterRef = useRef(0);

  // ── Fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    try { const c = sessionStorage.getItem("dec-data-v1"); if (c) { setData(JSON.parse(c)); setLoading(false); } } catch {}
    fetch("/api/decisiones").then(r => r.json()).then(d => { setData(d); try { sessionStorage.setItem("dec-data-v1", JSON.stringify(d)); } catch {} }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Filtered data ────────────────────────────────────────────────────
  const fNodes = data?.nodes.filter(n => activeTypes.has(n.type)) ?? [];
  const fIds = new Set(fNodes.map(n => n.id));
  const fEdges = data?.edges.filter(e => e.weight >= minWeight && fIds.has(e.source) && fIds.has(e.target)) ?? [];

  // ── Draw ─────────────────────────────────────────────────────────────
  const draw = useCallback((ctx: CanvasRenderingContext2D, nodes: SimNode[], edges: GEdge[], nMap: Map<string, SimNode>, W: number, H: number) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0a12"; ctx.fillRect(0, 0, W, H);
    // Grid dots
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let gx = 0; gx < W; gx += 30) for (let gy = 0; gy < H; gy += 30) { ctx.beginPath(); ctx.arc(gx, gy, 0.5, 0, Math.PI * 2); ctx.fill(); }

    const conn = new Set<string>();
    if (selected) { edges.forEach(e => { if (e.source === selected) conn.add(e.target); if (e.target === selected) conn.add(e.source); }); conn.add(selected); }

    // Edges
    for (const e of edges) {
      const s = nMap.get(e.source), t = nMap.get(e.target);
      if (!s || !t) continue;
      const dim = selected ? !conn.has(e.source) && !conn.has(e.target) : false;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = `rgba(100,160,255,${dim ? 0.04 : Math.max(0.08, e.weight * 0.5)})`;
      ctx.lineWidth = dim ? 0.3 : Math.max(0.5, e.weight * 2); ctx.stroke();
    }
    // Nodes
    for (const n of nodes) {
      const dim = selected ? !conn.has(n.id) : false;
      const r = SZ[n.type] * (n.size / 3);
      if (n.id === selected || n === hovered) { ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fill(); }
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.globalAlpha = dim ? 0.15 : 1; ctx.fillStyle = n.color; ctx.fill(); ctx.globalAlpha = 1;
      if (r > 6 && !dim) { ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = `${Math.max(8, r * 0.7)}px system-ui,sans-serif`; ctx.textAlign = "center"; ctx.fillText(n.shortLabel || n.label, n.x, n.y + r + 12); }
    }
  }, [selected, hovered]);

  // ── Simulation ───────────────────────────────────────────────────────
  const runSim = useCallback(() => {
    const cv = canvasRef.current; if (!cv || !fNodes.length) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;

    if (simRef.current.length !== fNodes.length || simRef.current[0]?.id !== fNodes[0]?.id) {
      simRef.current = fNodes.map(n => ({ ...n, x: cx + (Math.random() - 0.5) * W * 0.6, y: cy + (Math.random() - 0.5) * H * 0.6, vx: 0, vy: 0 }));
      iterRef.current = 0;
    }
    const nodes = simRef.current;
    const nMap = new Map(nodes.map(n => [n.id, n]));

    const step = () => {
      if (iterRef.current > MAX_ITER) { draw(ctx, nodes, fEdges, nMap, W, H); return; }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1, f = REPULSION / (d * d);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        nodes[i].vx -= fx; nodes[i].vy -= fy; nodes[j].vx += fx; nodes[j].vy += fy;
      }
      for (const e of fEdges) {
        const s = nMap.get(e.source), t = nMap.get(e.target); if (!s || !t) continue;
        const dx = t.x - s.x, dy = t.y - s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = d * ATTRACTION * e.weight, fx = (dx / d) * f, fy = (dy / d) * f;
        s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
      }
      for (const n of nodes) {
        n.vx += (cx - n.x) * CENTER_GRAVITY; n.vy += (cy - n.y) * CENTER_GRAVITY;
        n.vx *= DAMPING; n.vy *= DAMPING;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > MAX_VELOCITY) { n.vx = (n.vx / speed) * MAX_VELOCITY; n.vy = (n.vy / speed) * MAX_VELOCITY; }
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(W - 20, n.x)); n.y = Math.max(20, Math.min(H - 20, n.y));
      }
      iterRef.current++;
      draw(ctx, nodes, fEdges, nMap, W, H);
      afRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(afRef.current); step();
  }, [fNodes, fEdges, draw]);

  // ── Canvas mouse ─────────────────────────────────────────────────────
  const findNode = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return null;
    const r = cv.getBoundingClientRect(), sx = cv.width / r.width, sy = cv.height / r.height;
    const mx = (e.clientX - r.left) * sx, my = (e.clientY - r.top) * sy;
    for (const n of simRef.current) { const rad = SZ[n.type] * (n.size / 3); const dx = mx - n.x, dy = my - n.y; if (dx * dx + dy * dy < (rad + 4) ** 2) return n; }
    return null;
  };
  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => { setHovered(findNode(e)); setTipPos({ x: e.clientX, y: e.clientY }); }, []);
  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => { const n = findNode(e); setSelected(p => p === n?.id ? null : n?.id ?? null); }, []);

  // ── Run sim on view/filter change ────────────────────────────────────
  useEffect(() => {
    if (view !== "grafo" || !data) return;
    const cv = canvasRef.current; if (!cv) return;
    const p = cv.parentElement;
    if (p) { cv.width = p.clientWidth * 2; cv.height = Math.max(500, p.clientHeight) * 2; }
    simRef.current = []; iterRef.current = 0; runSim();
    return () => cancelAnimationFrame(afRef.current);
  }, [view, data, runSim]);

  const toggleType = (t: NodeType) => setActiveTypes(p => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const resetFilters = () => { setActiveTypes(new Set(FILT_TYPES)); setMinWeight(0); setSelected(null); };

  const getNeighbors = (id: string) => {
    if (!data) return { nodes: [] as GNode[], edges: [] as GEdge[] };
    const re = data.edges.filter(e => e.source === id || e.target === id);
    const nids = new Set(re.map(e => e.source === id ? e.target : e.source));
    return { nodes: data.nodes.filter(n => nids.has(n.id)), edges: re };
  };

  const expNodes = data?.nodes.filter(n => !expSearch || n.label.toLowerCase().includes(expSearch.toLowerCase()) || n.type.includes(expSearch.toLowerCase())) ?? [];
  const expGrouped = FILT_TYPES.reduce((a, t) => { const ns = expNodes.filter(n => n.type === t); if (ns.length) a.push({ type: t, nodes: ns }); return a; }, [] as { type: NodeType; nodes: GNode[] }[]);

  const s = data?.stats;

  if (loading) return (
    <main className="page-shell detail-page"><SiteHeader currentSection="decisiones" />
      <section className="panel detail-hero" style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <p style={{ color: "var(--ink-muted)", fontSize: "1.1rem" }}>Cargando grafo de decisiones...</p>
      </section><SiteFooter /></main>
  );

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <SiteHeader currentSection="decisiones" />

      {/* Hero */}
      <section className="panel detail-hero">
        <div className="detail-hero-grid">
          <div className="detail-copy">
            <span className="eyebrow">GRAFO DE DECISIONES</span>
            <h1 className="detail-title">Como se toman las decisiones</h1>
            <p className="detail-description">Mapa de relaciones entre partidos, instituciones, votaciones y territorios. Visualizacion inspirada en sistemas de inteligencia de enjambre.</p>
          </div>
          <aside className="kpi-panel">
            <h2 className="kpi-panel-header">Grafo</h2>
            <div className="kpi-grid">
              <div className="kpi-cell"><strong className="kpi-number" style={{ color: "var(--azul)" }}>{s?.totalNodes ?? 0}</strong><span className="kpi-label">Nodos</span></div>
              <div className="kpi-cell"><strong className="kpi-number" style={{ color: "var(--verde)" }}>{s?.totalEdges ?? 0}</strong><span className="kpi-label">Relaciones</span></div>
              <div className="kpi-cell"><strong className="kpi-number" style={{ color: "var(--rojo)" }}>{s?.avgConnections?.toFixed(1) ?? 0}</strong><span className="kpi-label">Conexiones medias</span></div>
              <div className="kpi-cell"><strong className="kpi-number" style={{ color: "#FFDB00" }}>{s?.density?.toFixed(3) ?? 0}</strong><span className="kpi-label">Densidad</span></div>
            </div>
          </aside>
        </div>
      </section>

      {/* Tabs */}
      <div className="dg-view-bar">
        {TABS.map(t => <button key={t.key} className={`dg-view-btn${view === t.key ? " dg-view-btn-active" : ""}`} onClick={() => setView(t.key)}>{t.label}</button>)}
      </div>

      {/* ════ VIEW 1: GRAFO ════ */}
      {view === "grafo" && (
        <section className="panel section-panel" style={{ position: "relative", padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", minHeight: 600 }}>
            <div className="dg-canvas-wrap" style={{ flex: 1, position: "relative", background: "#0a0a12" }}>
              <canvas ref={canvasRef} className="dg-canvas" style={{ width: "100%", height: "100%", display: "block", cursor: hovered ? "pointer" : "default" }} onMouseMove={onMove} onClick={onClick} onMouseLeave={() => setHovered(null)} />
              {hovered && (
                <div className="dg-tooltip" style={{ position: "fixed", left: tipPos.x + 14, top: tipPos.y - 10, background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12, pointerEvents: "none", zIndex: 100, maxWidth: 220 }}>
                  <strong style={{ color: hovered.color }}>{hovered.label}</strong><br />
                  <span style={{ opacity: 0.6 }}>{TL[hovered.type]}</span>
                  {hovered.metadata?.seats && <span style={{ opacity: 0.6 }}> &middot; {hovered.metadata.seats} escanos</span>}
                </div>
              )}
              <div className="dg-legend" style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(10,10,20,0.85)", borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 2 }}>ENTITY TYPES</span>
                {FILT_TYPES.map(t => <div key={t} className="dg-legend-item" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.7)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: TC[t], display: "inline-block" }} />{TL[t]}</div>)}
              </div>
            </div>
            {/* Filters */}
            <aside className="dg-filters" style={{ width: 240, background: "var(--surface,#111118)", padding: "20px 16px", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
              <div className="dg-filter-group">
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 8 }}>TIPOS DE NODO</h3>
                {FILT_TYPES.map(t => (
                  <label key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink,#ccc)", cursor: "pointer", marginBottom: 4 }}>
                    <input type="checkbox" checked={activeTypes.has(t)} onChange={() => toggleType(t)} style={{ accentColor: TC[t] }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: TC[t], display: "inline-block" }} />{TL[t]}
                  </label>
                ))}
              </div>
              <div className="dg-filter-group">
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 8 }}>PESO MINIMO</h3>
                <input type="range" min={0} max={1} step={0.05} value={minWeight} onChange={e => setMinWeight(parseFloat(e.target.value))} style={{ width: "100%" }} />
                <span style={{ fontSize: 12, color: "var(--ink-muted,#888)" }}>{minWeight.toFixed(2)}</span>
              </div>
              <button onClick={resetFilters} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "var(--ink,#ccc)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer" }}>Reset filtros</button>
              {selected && (() => {
                const nd = data?.nodes.find(n => n.id === selected); if (!nd) return null;
                const nb = getNeighbors(selected);
                return (<div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 6 }}>SELECCIONADO</h3>
                  <p style={{ fontSize: 14, fontWeight: 600, color: nd.color, margin: "4px 0" }}>{nd.label}</p>
                  <p style={{ fontSize: 11, color: "var(--ink-muted,#888)" }}>{TL[nd.type]} &middot; {nb.edges.length} conexiones</p>
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {nb.nodes.slice(0, 10).map(n => <span key={n.id} className="dg-node-chip" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: n.color, cursor: "pointer" }} onClick={() => setSelected(n.id)}>{n.shortLabel || n.label}</span>)}
                  </div>
                </div>);
              })()}
            </aside>
          </div>
        </section>
      )}

      {/* ════ VIEW 2: DECISIONES ════ */}
      {view === "decisiones" && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 24 }}>
            {(data?.decisionPaths ?? []).map(p => (
              <div key={p.id} className="dg-path-card" style={{ background: "var(--surface,#111118)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink,#eee)", margin: 0, lineHeight: 1.3 }}>{p.title}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: (STAT_C[p.status] ?? "#666") + "22", color: STAT_C[p.status] ?? "#888", whiteSpace: "nowrap", flexShrink: 0 }}>{p.status.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-muted,#888)", lineHeight: 1.5, margin: 0 }}>{p.description}</p>
                <div className="dg-path-timeline" style={{ position: "relative", paddingLeft: 20, marginTop: 4 }}>
                  <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
                  {p.steps.map(st => (
                    <div key={st.order} className="dg-path-step" style={{ position: "relative", paddingBottom: 14, paddingLeft: 8 }}>
                      <div className="dg-path-step-dot" style={{ position: "absolute", left: -18, top: 3, width: 10, height: 10, borderRadius: "50%", background: STEP_C[st.status], border: "2px solid rgba(10,10,20,0.8)" }} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink,#ddd)", margin: 0 }}>{st.label}</p>
                      <p style={{ fontSize: 11, color: "var(--ink-muted,#777)", margin: "2px 0 0" }}>{st.institution}{st.date ? ` · ${st.date}` : ""}</p>
                    </div>
                  ))}
                </div>
                {p.probability != null && (
                  <div className="dg-path-prob" style={{ marginTop: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-muted,#777)", marginBottom: 4 }}><span>Probabilidad</span><span>{(p.probability * 100).toFixed(0)}%</span></div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${p.probability * 100}%`, background: p.probability > 0.6 ? "#16a34a" : p.probability > 0.3 ? "#ca8a04" : "#dc2626" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════ VIEW 3: NARRATIVAS ════ */}
      {view === "narrativas" && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {(data?.narrativeThreads ?? []).map(th => {
              const sc = th.sentiment > 0.2 ? "#16a34a" : th.sentiment < -0.2 ? "#dc2626" : "#ca8a04";
              return (
                <div key={th.id} className="dg-narrative-card" style={{ background: "var(--surface,#111118)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: sc, display: "inline-block" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink,#eee)", margin: 0 }}>{th.title}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-muted,#999)", lineHeight: 1.6, margin: "0 0 14px" }}>{th.summary}</p>
                  <div className="dg-narrative-topics" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                    {th.hotTopics.map((tp, i) => <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: `hsl(${(i * 47) % 360},60%,25%)`, color: `hsl(${(i * 47) % 360},70%,75%)` }}>{tp}</span>)}
                  </div>
                  <div className="dg-activation-seq" style={{ position: "relative", paddingLeft: 28 }}>
                    <div style={{ position: "absolute", left: 10, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
                    {th.activationSequence.map(en => (
                      <div key={en.order} className="dg-activation-entry" style={{ position: "relative", paddingBottom: 18, paddingLeft: 12 }}>
                        <span style={{ position: "absolute", left: -24, top: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-muted,#888)" }}>{en.order}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span className="dg-source-badge" style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: (SBC[en.sourceType] || "#666") + "33", color: SBC[en.sourceType] || "#aaa", letterSpacing: "0.03em" }}>{en.sourceType}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink,#ddd)" }}>{en.agentLabel}</span>
                          <span style={{ fontSize: 10, color: "var(--ink-muted,#666)", marginLeft: "auto" }}>{en.timestamp}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--ink-muted,#999)", lineHeight: 1.5, margin: 0 }}>{en.content}</p>
                      </div>
                    ))}
                  </div>
                  {th.actors.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>ACTORES</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        {th.actors.map((a, i) => { const nd = data?.nodes.find(n => n.id === a.nodeId); return <span key={i} className="dg-node-chip" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: nd?.color || "var(--ink-muted,#999)" }}>{nd?.label || a.nodeId} ({a.role})</span>; })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ════ VIEW 4: EXPLORADOR ════ */}
      {view === "explorador" && (
        <section className="panel section-panel" style={{ maxWidth: 1200, margin: "0 auto", width: "calc(100% - 80px)" }}>
          <div style={{ display: "flex", gap: 24, minHeight: 500 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="dg-explorer-search" type="text" placeholder="Buscar nodo por nombre o tipo..." value={expSearch} onChange={e => setExpSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "var(--ink,#ddd)", marginBottom: 16, outline: "none" }} />
              <div className="dg-explorer-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {expGrouped.map(g => (
                  <div key={g.type}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: TC[g.type], letterSpacing: "0.05em", marginBottom: 6 }}>{TL[g.type].toUpperCase()} ({g.nodes.length})</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {g.nodes.slice(0, 20).map(n => (
                        <button key={n.id} onClick={() => setExpSel(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 13, background: expSel === n.id ? "rgba(255,255,255,0.06)" : "transparent", border: "none", borderRadius: 6, color: "var(--ink,#ccc)", cursor: "pointer", textAlign: "left", width: "100%" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, display: "inline-block" }} />{n.label}
                        </button>
                      ))}
                      {g.nodes.length > 20 && <span style={{ fontSize: 11, color: "var(--ink-muted,#666)", paddingLeft: 10 }}>+{g.nodes.length - 20} mas...</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dg-explorer-detail" style={{ width: 380, flexShrink: 0, background: "var(--surface,#111118)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 20, overflowY: "auto" }}>
              {expSel ? (() => {
                const nd = data?.nodes.find(n => n.id === expSel); if (!nd) return <p style={{ color: "var(--ink-muted,#666)" }}>Nodo no encontrado</p>;
                const nb = getNeighbors(expSel);
                return (<>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: nd.color, display: "inline-block" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink,#eee)", margin: 0 }}>{nd.label}</h3>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted,#888)", marginBottom: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: TC[nd.type] + "33", color: TC[nd.type], marginRight: 8 }}>{TL[nd.type].toUpperCase()}</span>
                    {nd.group && <span>Grupo: {nd.group}</span>}
                  </div>
                  {Object.keys(nd.metadata).length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 6 }}>METADATA</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                        {Object.entries(nd.metadata).slice(0, 10).map(([k, v]) => <div key={k} style={{ fontSize: 12 }}><span style={{ color: "var(--ink-muted,#666)" }}>{k}: </span><span style={{ color: "var(--ink,#bbb)" }}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span></div>)}
                      </div>
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 6 }}>NODOS CONECTADOS ({nb.nodes.length})</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {nb.nodes.slice(0, 20).map(n => <span key={n.id} className="dg-node-chip" onClick={() => setExpSel(n.id)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: n.color, cursor: "pointer" }}>{n.shortLabel || n.label}</span>)}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 6 }}>RELACIONES ({nb.edges.length})</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {nb.edges.slice(0, 15).map(e => {
                        const oid = e.source === expSel ? e.target : e.source;
                        const on = data?.nodes.find(n => n.id === oid);
                        return <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: "var(--ink-muted,#888)" }}>{e.type}</span>
                          <span style={{ color: "var(--ink,#bbb)" }}>{on?.label || oid}</span>
                          <span style={{ marginLeft: "auto", color: "var(--ink-muted,#666)", fontSize: 10 }}>w={e.weight.toFixed(2)}</span>
                        </div>;
                      })}
                    </div>
                  </div>
                </>);
              })() : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-muted,#555)", fontSize: 14 }}>Selecciona un nodo para ver detalles</div>}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
