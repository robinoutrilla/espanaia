"use client";
import { useState, useRef, useCallback } from "react";
import { SiteHeader } from "../../components/site-header";

/* ═══════════════════════════════════════════════════════════════════════════
   /confidencial — Weekly VIP Intelligence Briefing Generator
   Replicates the exact format of the CONFIDENCIAL_01 PDF:
   green AC branding, decorative titles, drop caps, photo accents.
   Flow: password → select topics → generate → edit text/photos → export PDF
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Photo pool (Unsplash free-use) ────────────────────────────────────────

interface PhotoOption { id: string; url: string; thumb: string; alt: string }

const PHOTOS: Record<string, PhotoOption[]> = {
  politica: [
    { id: "p1", url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80", thumb: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=200&q=60", alt: "Hemiciclo" },
    { id: "p2", url: "https://images.unsplash.com/photo-1575540325971-4f5060c53a3b?w=900&q=80", thumb: "https://images.unsplash.com/photo-1575540325971-4f5060c53a3b?w=200&q=60", alt: "Edificio gubernamental" },
    { id: "p3", url: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=900&q=80", thumb: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=200&q=60", alt: "Capitolio" },
    { id: "p4", url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&q=80", thumb: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&q=60", alt: "Reunion institucional" },
  ],
  judicial: [
    { id: "j1", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80", thumb: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&q=60", alt: "Mazo de juez" },
    { id: "j2", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80", thumb: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200&q=60", alt: "Biblioteca juridica" },
    { id: "j3", url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=900&q=80", thumb: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=200&q=60", alt: "Columnas justicia" },
  ],
  economia: [
    { id: "e1", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80", thumb: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=60", alt: "Graficos financieros" },
    { id: "e2", url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900&q=80", thumb: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&q=60", alt: "Monedas de euro" },
    { id: "e3", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80", thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&q=60", alt: "Dashboard economico" },
  ],
  espana: [
    { id: "s1", url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=900&q=80", thumb: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=200&q=60", alt: "Madrid skyline" },
    { id: "s2", url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80", thumb: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=200&q=60", alt: "Calles de Madrid" },
    { id: "s3", url: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=900&q=80", thumb: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=200&q=60", alt: "Bandera de Espana" },
  ],
  europa: [
    { id: "u1", url: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=900&q=80", thumb: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=200&q=60", alt: "Banderas europeas" },
    { id: "u2", url: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=900&q=80", thumb: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=200&q=60", alt: "Parlamento europeo" },
    { id: "u3", url: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900&q=80", thumb: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=200&q=60", alt: "Mapa europeo" },
  ],
  general: [
    { id: "g1", url: "https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=900&q=80", thumb: "https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=200&q=60", alt: "Periodico y cafe" },
    { id: "g2", url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&q=80", thumb: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&q=60", alt: "Noticias" },
    { id: "g3", url: "https://images.unsplash.com/photo-1462899006636-339e08d1844e?w=900&q=80", thumb: "https://images.unsplash.com/photo-1462899006636-339e08d1844e?w=200&q=60", alt: "Reunion de trabajo" },
    { id: "g4", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80", thumb: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=60", alt: "Documento y pluma" },
  ],
};

function pickPhoto(topic: string): PhotoOption {
  const t = topic.toLowerCase();
  let cat = "general";
  if (/judicial|justicia|tribunal|cgpj|fiscal|audiencia|supremo/.test(t)) cat = "judicial";
  else if (/econom|presupuest|pib|inflac|deuda|hacienda|fiscal|empleo|paro/.test(t)) cat = "economia";
  else if (/europ|ue|bruselas|eurostat|fondos|nextgen/.test(t)) cat = "europa";
  else if (/elecci|gobierno|coalici|parlam|congres|senad|legislat|politic|partido/.test(t)) cat = "politica";
  else if (/espa|madrid|catalun|ccaa|territor|autonomic/.test(t)) cat = "espana";
  const pool = PHOTOS[cat] ?? PHOTOS.general;
  return pool[Math.floor(Math.random() * pool.length)];
}
function allPhotos(): PhotoOption[] { return Object.values(PHOTOS).flat(); }

// ── Recommended topics ────────────────────────────────────────────────────

interface RecTopic { id: string; label: string; cat: string; color: string }

const RECOMMENDED: RecTopic[] = [
  { id: "r1", label: "Escenario electoral: encuestas, expectativas y calendario", cat: "Electoral", color: "#059669" },
  { id: "r2", label: "Relaciones entre socios del Gobierno de coalicion", cat: "Politico", color: "#b91c1c" },
  { id: "r3", label: "Posibilidad de crisis de Gobierno o remodelacion ministerial", cat: "Politico", color: "#b91c1c" },
  { id: "r4", label: "Negociacion de los Presupuestos Generales del Estado", cat: "Economico", color: "#1d4ed8" },
  { id: "r5", label: "Trastienda del Poder Judicial: CGPJ, Fiscalia y Tribunal Supremo", cat: "Judicial", color: "#7c3aed" },
  { id: "r6", label: "Audiencia Nacional: casos en curso y movimientos clave", cat: "Judicial", color: "#7c3aed" },
  { id: "r7", label: "Actividad legislativa: proyectos de ley y enmiendas en tramitacion", cat: "Legislativo", color: "#b45309" },
  { id: "r8", label: "Panorama macroeconomico: PIB, empleo, inflacion y deuda", cat: "Economico", color: "#1d4ed8" },
  { id: "r9", label: "Tensiones territoriales y financiacion autonomica", cat: "Territorial", color: "#0891b2" },
  { id: "r10", label: "Fondos europeos y NextGenerationEU: hitos y desembolsos", cat: "Europa", color: "#1d4ed8" },
  { id: "r11", label: "Politicos en alza y en baja: movimientos internos de los partidos", cat: "Politico", color: "#b91c1c" },
  { id: "r12", label: "Inversiones del Gobierno: partidas clave y adjudicaciones", cat: "Economico", color: "#1d4ed8" },
];

// ── Section type ──────────────────────────────────────────────────────────

interface DocSection {
  id: string;
  title: string;
  content: string;
  photo: PhotoOption;
  photoPosition: "right" | "full";
  editing: boolean;
}

// ── Date ──────────────────────────────────────────────────────────────────

function fmtDate(): string {
  const d = new Date();
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type Phase = "auth" | "topics" | "generating" | "editor";

export default function ConfidencialPage() {
  const [phase, setPhase] = useState<Phase>("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [statusMsgs, setStatusMsgs] = useState<string[]>([]);
  const [sections, setSections] = useState<DocSection[]>([]);
  const [headerPhoto, setHeaderPhoto] = useState<PhotoOption>(PHOTOS.politica[0]);
  const [photoPickerFor, setPhotoPickerFor] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const dateStr = fmtDate();

  // ── Auth ──
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const t = password.trim();
    if (t === "647510884" || t === "650384410") { setPhase("topics"); setAuthError(""); }
    else { setAuthError("Codigo de acceso incorrecto"); setPassword(""); }
  };

  // ── Topics ──
  const addTopic = (t: string) => { const v = t.trim(); if (v && !selectedTopics.includes(v)) setSelectedTopics(p => [...p, v]); };
  const removeTopic = (i: number) => setSelectedTopics(p => p.filter((_, j) => j !== i));
  const moveTopic = (i: number, d: -1|1) => {
    setSelectedTopics(p => { const a = [...p]; const n = i+d; if (n<0||n>=a.length) return a; [a[i],a[n]]=[a[n],a[i]]; return a; });
  };

  // ── Generate ──
  const generate = useCallback(async () => {
    setPhase("generating"); setStatusMsgs([]); setSections([]);
    try {
      const res = await fetch("/api/confidencial", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: selectedTopics, password: password.trim() }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const reader = res.body?.getReader(); if (!reader) throw new Error("No stream");
      const dec = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        let ev = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) ev = line.slice(7);
          else if (line.startsWith("data: ") && ev) {
            try {
              const d = JSON.parse(line.slice(6));
              if (ev === "status") setStatusMsgs(p => [...p, d.message]);
              else if (ev === "section") {
                setSections(p => [...p, {
                  id: `s${d.index}`, title: d.title, content: d.content,
                  photo: pickPhoto(d.title), photoPosition: d.index % 2 === 0 ? "full" : "right",
                  editing: false,
                }]);
              } else if (ev === "error") throw new Error(d.error);
            } catch (pe) { if (pe instanceof SyntaxError) continue; throw pe; }
            ev = "";
          }
        }
      }
      // Set the first section's photo as header photo
      setHeaderPhoto(pickPhoto(selectedTopics[0] ?? "politica"));
      setPhase("editor");
    } catch (err) {
      setSections([{ id: "err", title: "Error", content: err instanceof Error ? err.message : "Error desconocido", photo: PHOTOS.general[0], photoPosition: "full", editing: false }]);
      setPhase("editor");
    }
  }, [selectedTopics, password]);

  // ── Section editing ──
  const updateContent = (id: string, c: string) => setSections(p => p.map(s => s.id===id ? {...s, content: c} : s));
  const updateTitle = (id: string, t: string) => setSections(p => p.map(s => s.id===id ? {...s, title: t} : s));
  const toggleEdit = (id: string) => setSections(p => p.map(s => s.id===id ? {...s, editing: !s.editing} : s));
  const changePhoto = (secId: string, photo: PhotoOption) => {
    if (secId === "header") setHeaderPhoto(photo);
    else setSections(p => p.map(s => s.id===secId ? {...s, photo} : s));
    setPhotoPickerFor(null);
  };
  const togglePhotoPos = (id: string) => setSections(p => p.map(s => s.id===id ? {...s, photoPosition: s.photoPosition==="right"?"full":"right"} : s));

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  /* ── AUTH ── */
  if (phase === "auth") {
    return (
      <main className="page-shell detail-page"><div className="ambient ambient-one"/><div className="ambient ambient-two"/>
        <SiteHeader currentSection="confidencial" />
        <section style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"70vh",padding:"var(--space-xl)" }}>
          <div style={{ maxWidth:440,width:"100%",padding:"40px",borderRadius:"16px",background:"var(--surface-raised,var(--surface))",border:"2px solid var(--border)",boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ textAlign:"center",marginBottom:"24px" }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a3a,#2d9a4e)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.4rem",fontWeight:800,fontFamily:"serif",boxShadow:"0 4px 16px rgba(26,122,58,0.3)" }}>AC</div>
            </div>
            <h1 style={{ fontSize:"1.3rem",fontWeight:800,textAlign:"center",marginBottom:"4px" }}>Confidencial</h1>
            <p style={{ fontSize:"0.82rem",color:"var(--ink-soft)",textAlign:"center",marginBottom:"24px" }}>Informe semanal de inteligencia politica.<br/>Introduzca su codigo de acceso.</p>
            <form onSubmit={handleAuth}>
              <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setAuthError("");}} placeholder="Codigo de acceso" autoFocus
                style={{ width:"100%",padding:"14px 16px",fontSize:"1.05rem",fontWeight:600,textAlign:"center",letterSpacing:"3px",borderRadius:"10px",border:`2px solid ${authError?"#dc2626":"var(--border)"}`,background:"var(--bg)",color:"var(--ink)",outline:"none" }}/>
              {authError && <p style={{ color:"#dc2626",fontSize:"0.8rem",textAlign:"center",marginTop:"8px",fontWeight:600 }}>{authError}</p>}
              <button type="submit" style={{ width:"100%",padding:"14px",fontSize:"0.95rem",fontWeight:700,borderRadius:"10px",border:"none",marginTop:"16px",background:"linear-gradient(135deg,#1a7a3a,#2d9a4e)",color:"#fff",cursor:"pointer" }}>Acceder</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  /* ── TOPICS ── */
  if (phase === "topics") {
    return (
      <main className="page-shell detail-page"><div className="ambient ambient-one"/><div className="ambient ambient-two"/>
        <SiteHeader currentSection="confidencial" />
        <section className="panel section-panel" style={{ maxWidth:960,margin:"var(--space-xl) auto" }}>
          <h1 style={{ fontSize:"1.3rem",fontWeight:800,textAlign:"center",marginBottom:"4px" }}>Configurar Informe Semanal</h1>
          <p style={{ fontSize:"0.85rem",color:"var(--ink-soft)",textAlign:"center",marginBottom:"var(--space-lg)" }}>{dateStr} — Seleccione los temas a incluir</p>

          <h3 style={{ fontSize:"0.85rem",fontWeight:700,marginBottom:"8px" }}>Temas recomendados</h3>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"8px",marginBottom:"var(--space-lg)" }}>
            {RECOMMENDED.map(r => {
              const added = selectedTopics.includes(r.label);
              return (
                <button key={r.id} type="button" onClick={()=>added?removeTopic(selectedTopics.indexOf(r.label)):addTopic(r.label)}
                  style={{ padding:"10px 14px",borderRadius:"8px",textAlign:"left",cursor:"pointer",background:added?`${r.color}0a`:"var(--surface-raised,var(--surface))",border:added?`2px solid ${r.color}`:"1px solid var(--border)",display:"flex",alignItems:"center",gap:"10px",outline:"none",transition:"all 120ms" }}>
                  <span style={{ width:22,height:22,borderRadius:"4px",flexShrink:0,background:added?r.color:"transparent",border:added?"none":"2px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.7rem",fontWeight:800 }}>{added?"✓":""}</span>
                  <div>
                    <span style={{ fontSize:"0.65rem",fontWeight:700,color:r.color,textTransform:"uppercase",letterSpacing:"0.5px" }}>{r.cat}</span>
                    <span style={{ display:"block",fontSize:"0.82rem",fontWeight:500 }}>{r.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <h3 style={{ fontSize:"0.85rem",fontWeight:700,marginBottom:"8px" }}>Anadir tema personalizado</h3>
          <div style={{ display:"flex",gap:"8px",marginBottom:"var(--space-lg)" }}>
            <input value={customInput} onChange={e=>setCustomInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&customInput.trim()){addTopic(customInput.trim());setCustomInput("");}}}
              placeholder="Ej: Reforma de la ley de vivienda e impacto en el sector inmobiliario"
              style={{ flex:1,padding:"10px 14px",fontSize:"0.88rem",borderRadius:"8px",border:"2px solid var(--border)",background:"var(--bg)",color:"var(--ink)",outline:"none" }}/>
            <button type="button" onClick={()=>{if(customInput.trim()){addTopic(customInput.trim());setCustomInput("");}}}
              style={{ padding:"10px 20px",fontSize:"0.85rem",fontWeight:700,borderRadius:"8px",border:"none",background:"#1a7a3a",color:"#fff",cursor:"pointer",whiteSpace:"nowrap" }}>Anadir</button>
          </div>

          {selectedTopics.length > 0 && <>
            <h3 style={{ fontSize:"0.85rem",fontWeight:700,marginBottom:"8px" }}>Temas seleccionados ({selectedTopics.length})</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:"6px",marginBottom:"var(--space-lg)" }}>
              {selectedTopics.map((topic,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"10px 14px",borderRadius:"8px",background:"var(--surface-raised,var(--surface))",border:"1px solid var(--border)" }}>
                  <span style={{ fontSize:"0.75rem",fontWeight:700,color:"var(--ink-muted)",minWidth:24 }}>{i+1}.</span>
                  {editIdx===i ? (
                    <input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setSelectedTopics(p=>p.map((t,j)=>j===editIdx?editText.trim()||t:t));setEditIdx(null);}if(e.key==="Escape")setEditIdx(null);}} onBlur={()=>{setSelectedTopics(p=>p.map((t,j)=>j===editIdx?editText.trim()||t:t));setEditIdx(null);}} autoFocus
                      style={{ flex:1,padding:"4px 8px",fontSize:"0.85rem",borderRadius:"4px",border:"2px solid #1a7a3a",background:"var(--bg)",color:"var(--ink)",outline:"none" }}/>
                  ) : (
                    <span style={{ flex:1,fontSize:"0.85rem" }}>{topic}</span>
                  )}
                  <div style={{ display:"flex",gap:"4px",flexShrink:0 }}>
                    <MBtn l="^" onClick={()=>moveTopic(i,-1)} off={i===0}/>
                    <MBtn l="v" onClick={()=>moveTopic(i,1)} off={i===selectedTopics.length-1}/>
                    <MBtn l="E" onClick={()=>{setEditIdx(i);setEditText(topic);}}/>
                    <MBtn l="X" onClick={()=>removeTopic(i)} danger/>
                  </div>
                </div>
              ))}
            </div>
          </>}

          <div style={{ textAlign:"center" }}>
            <button onClick={generate} disabled={selectedTopics.length===0}
              style={{ padding:"16px 48px",fontSize:"1rem",fontWeight:700,borderRadius:"10px",border:"none",background:selectedTopics.length>0?"linear-gradient(135deg,#1a7a3a,#2d9a4e)":"var(--ink-muted)",color:"#fff",cursor:selectedTopics.length>0?"pointer":"not-allowed",opacity:selectedTopics.length>0?1:0.5,minWidth:300 }}>
              Generar Informe ({selectedTopics.length} tema{selectedTopics.length!==1?"s":""})
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* ── GENERATING ── */
  if (phase === "generating") {
    return (
      <main className="page-shell detail-page"><div className="ambient ambient-one"/><div className="ambient ambient-two"/>
        <SiteHeader currentSection="confidencial" />
        <section style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:"var(--space-xl)" }}>
          <div style={{ maxWidth:500,width:"100%",textAlign:"center" }}>
            <div style={{ width:48,height:48,border:"4px solid var(--border)",borderTopColor:"#1a7a3a",borderRadius:"50%",animation:"cSpin 700ms linear infinite",margin:"0 auto 24px" }}/>
            <h2 style={{ fontSize:"1.1rem",fontWeight:700,marginBottom:"16px" }}>Generando informe confidencial...</h2>
            <div style={{ textAlign:"left",maxWidth:400,margin:"0 auto" }}>
              {statusMsgs.map((m,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"3px 0",fontSize:"0.8rem",color:i===statusMsgs.length-1?"#1a7a3a":"var(--ink-muted)",fontWeight:i===statusMsgs.length-1?600:400 }}>
                  {i===statusMsgs.length-1?<span style={{ display:"inline-block",width:12,height:12,border:"2px solid var(--border)",borderTopColor:"#1a7a3a",borderRadius:"50%",animation:"cSpin 600ms linear infinite" }}/>:<span style={{ color:"#1a7a3a" }}>✓</span>}
                  {m}
                </div>
              ))}
            </div>
            {sections.length>0 && <p style={{ fontSize:"0.8rem",color:"#1a7a3a",marginTop:"12px",fontWeight:600 }}>{sections.length}/{selectedTopics.length} secciones completadas</p>}
          </div>
        </section>
        <style>{`@keyframes cSpin{to{transform:rotate(360deg)}}`}</style>
      </main>
    );
  }

  /* ── EDITOR — the document ── */
  return (
    <main className="page-shell detail-page c-editor-page">
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <SiteHeader currentSection="confidencial" />

      {/* Toolbar */}
      <div className="c-toolbar no-print">
        <div style={{ display:"flex",alignItems:"center",gap:"12px" }}>
          <span style={{ fontWeight:700,fontSize:"0.85rem" }}>Editor del informe</span>
          <span className="micro-tag" style={{ background:"#1a7a3a14",color:"#1a7a3a",fontWeight:700,fontSize:"0.7rem" }}>CONFIDENCIAL</span>
        </div>
        <div style={{ display:"flex",gap:"8px" }}>
          <button onClick={()=>setPhase("topics")} className="c-tb">Volver a temas</button>
          <button onClick={()=>window.print()} className="c-tb c-tb-p">Imprimir / Guardar PDF</button>
        </div>
      </div>

      {/* ── THE DOCUMENT ── */}
      <div ref={docRef} className="c-doc">
        {/* AC watermark */}
        <div className="c-ac">AC</div>

        {/* ── COVER HEADER ── */}
        <div className="c-cover">
          <div className="c-cover-banner">A C T U A L I D A D</div>
          <h1 className="c-cover-title">CONFIDENCIAL</h1>
          <div className="c-cover-date">{dateStr}</div>
        </div>

        {/* Main photo */}
        <div className="c-main-photo-wrap" onClick={()=>setPhotoPickerFor("header")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={headerPhoto.url} alt={headerPhoto.alt} className="c-main-photo"/>
          <span className="c-photo-hint no-print">Clic para cambiar foto</span>
        </div>

        {/* ── SECTIONS ── */}
        {sections.map((sec, i) => (
          <div key={sec.id} className="c-section">
            {/* Section title */}
            {i > 0 && i % 3 === 0 && (
              <div className="c-cat-bar">
                <span>TEMAS DE ACTUALIDAD</span>
              </div>
            )}

            <div className="c-sec-title-wrap">
              <span className="c-sec-bullet">&#9679;</span>
              {sec.editing ? (
                <input value={sec.title} onChange={e=>updateTitle(sec.id,e.target.value)}
                  className="c-sec-title-input"/>
              ) : (
                <h2 className="c-sec-title">{sec.title.toUpperCase()}</h2>
              )}
            </div>

            {/* Content + Photo layout */}
            {sec.photoPosition === "right" ? (
              <div className="c-sec-body c-sec-body-float">
                <div className="c-sec-photo-right no-print-edit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sec.photo.url} alt={sec.photo.alt}/>
                  <div className="c-photo-accent"/>
                  <button className="c-photo-btn no-print" onClick={()=>setPhotoPickerFor(sec.id)}>Cambiar</button>
                </div>
                {sec.editing ? (
                  <textarea value={sec.content} onChange={e=>updateContent(sec.id,e.target.value)} className="c-sec-textarea" rows={14}/>
                ) : (
                  <div className="c-sec-text">
                    {sec.content.split("\n").filter(p=>p.trim()).map((para,j)=>(
                      <p key={j} className={j===0?"c-dropcap":""}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="c-sec-body">
                {/* Full-width photo */}
                <div className="c-sec-photo-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sec.photo.url} alt={sec.photo.alt}/>
                  <button className="c-photo-btn no-print" onClick={()=>setPhotoPickerFor(sec.id)}>Cambiar foto</button>
                </div>
                {sec.editing ? (
                  <textarea value={sec.content} onChange={e=>updateContent(sec.id,e.target.value)} className="c-sec-textarea" rows={14}/>
                ) : (
                  <div className="c-sec-text">
                    {sec.content.split("\n").filter(p=>p.trim()).map((para,j)=>(
                      <p key={j} className={j===0?"c-dropcap":""}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit controls */}
            <div className="c-sec-controls no-print">
              <button onClick={()=>toggleEdit(sec.id)} className="c-edit-btn">{sec.editing?"Guardar":"Editar texto"}</button>
              <button onClick={()=>togglePhotoPos(sec.id)} className="c-edit-btn">Foto: {sec.photoPosition==="right"?"lateral":"completa"}</button>
              <button onClick={()=>setPhotoPickerFor(sec.id)} className="c-edit-btn">Cambiar foto</button>
            </div>
          </div>
        ))}

        {/* Page numbers */}
        <div className="c-page-num">1</div>
      </div>

      {/* ── Photo picker modal ── */}
      {photoPickerFor && (
        <div className="c-modal-bg no-print" onClick={()=>setPhotoPickerFor(null)}>
          <div className="c-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
              <h3 style={{ fontSize:"1rem",fontWeight:700 }}>Seleccionar foto</h3>
              <button onClick={()=>setPhotoPickerFor(null)} style={{ background:"none",border:"none",fontSize:"1.3rem",cursor:"pointer",color:"var(--ink-muted)" }}>X</button>
            </div>
            <div className="c-photo-grid">
              {allPhotos().map(p=>(
                <button key={p.id} onClick={()=>changePhoto(photoPickerFor,p)} className="c-photo-opt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={p.alt}/>
                  <span>{p.alt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{CSS}</style>
    </main>
  );
}

// ── Mini button ───────────────────────────────────────────────────────────
function MBtn({l,onClick,off,danger}:{l:string;onClick:()=>void;off?:boolean;danger?:boolean}) {
  return <button type="button" onClick={onClick} disabled={off} style={{width:28,height:28,borderRadius:"6px",border:"1px solid var(--border)",background:"transparent",color:danger?"#dc2626":"var(--ink-soft)",fontSize:"0.72rem",fontWeight:700,cursor:off?"not-allowed":"pointer",opacity:off?0.3:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{l}</button>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS — replicates CONFIDENCIAL_01.pdf format
// ═══════════════════════════════════════════════════════════════════════════
const CSS = `
@keyframes cSpin{to{transform:rotate(360deg)}}

/* Toolbar */
.c-toolbar{position:sticky;top:42px;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:10px 24px;background:var(--surface);border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px}
.c-tb{padding:7px 16px;font-size:0.8rem;font-weight:600;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--ink);cursor:pointer}
.c-tb-p{background:linear-gradient(135deg,#1a7a3a,#2d9a4e);color:#fff;border:none}

/* Document */
.c-doc{
  max-width:780px;margin:24px auto 60px;
  background:#fff;color:#222;
  font-family:'Georgia','Times New Roman',serif;
  font-size:0.95rem;line-height:1.7;
  box-shadow:0 2px 20px rgba(0,0,0,0.08);
  border:1px solid #e5e7eb;
  position:relative;padding-bottom:40px;
}

/* AC watermark */
.c-ac{
  position:absolute;top:16px;right:24px;
  font-family:'Georgia',serif;font-size:1.4rem;font-weight:400;
  color:#888;font-style:italic;letter-spacing:1px;z-index:2;
}

/* Cover */
.c-cover{text-align:center;padding:40px 48px 20px}
.c-cover-banner{
  display:inline-block;
  background:#1a7a3a;color:#fff;
  padding:8px 32px;font-size:0.78rem;font-weight:700;
  letter-spacing:6px;font-family:'Open Sans',sans-serif;
  margin-bottom:16px;
}
.c-cover-title{
  font-size:3.2rem;font-weight:900;
  font-family:'Georgia',serif;
  letter-spacing:8px;color:#222;
  margin:0 0 8px;line-height:1.1;
  border:3px solid #1a7a3a;
  border-left:none;border-right:none;
  padding:12px 0;
}
.c-cover-date{
  font-family:'Georgia',serif;font-style:italic;
  font-size:1rem;color:#555;margin-top:8px;
}

/* Main photo */
.c-main-photo-wrap{
  margin:16px 48px 32px;position:relative;cursor:pointer;
  border:3px solid #1a7a3a;
}
.c-main-photo{width:100%;height:320px;object-fit:cover;display:block}
.c-photo-hint{position:absolute;bottom:8px;right:12px;font-size:0.68rem;color:rgba(255,255,255,0.7);font-family:sans-serif;background:rgba(0,0,0,0.4);padding:2px 8px;border-radius:3px}

/* Category bar (green background header) */
.c-cat-bar{
  background:#1a7a3a;padding:12px 24px;margin:32px -48px 24px;
  /* full bleed */
  margin-left:0;margin-right:0;
  padding-left:48px;
}
.c-cat-bar span{
  font-family:'Georgia',serif;font-size:1.4rem;font-weight:800;
  color:#fff;letter-spacing:2px;text-transform:uppercase;
}

/* Section */
.c-section{padding:0 48px 24px}

/* Section title */
.c-sec-title-wrap{display:flex;align-items:flex-start;gap:12px;margin:24px 0 16px}
.c-sec-bullet{color:#1a7a3a;font-size:1.2rem;margin-top:4px;flex-shrink:0}
.c-sec-title{
  font-family:'Georgia',serif;font-size:1.35rem;font-weight:800;
  color:#1a7a3a;margin:0;line-height:1.25;letter-spacing:1px;
}
.c-sec-title-input{
  flex:1;padding:6px 10px;font-size:1.2rem;font-weight:800;
  font-family:'Georgia',serif;border:2px solid #1a7a3a;
  border-radius:4px;background:#fff;color:#1a7a3a;outline:none;
  text-transform:uppercase;letter-spacing:1px;
}

/* Body layouts */
.c-sec-body{margin-bottom:8px}
.c-sec-body-float{overflow:hidden}

/* Photo right (floating) */
.c-sec-photo-right{
  float:right;width:240px;margin:0 0 12px 20px;position:relative;
}
.c-sec-photo-right img{width:100%;height:auto;display:block;border-radius:2px}
.c-photo-accent{
  position:absolute;top:0;right:-8px;width:6px;height:100%;
  background:#1a7a3a;border-radius:2px;
}
.c-photo-btn{
  position:absolute;bottom:4px;left:4px;
  padding:3px 10px;font-size:0.65rem;font-weight:600;
  background:rgba(0,0,0,0.65);color:#fff;border:none;
  border-radius:3px;cursor:pointer;
}

/* Photo full */
.c-sec-photo-full{position:relative;margin-bottom:16px;border:2px solid #1a7a3a}
.c-sec-photo-full img{width:100%;height:220px;object-fit:cover;display:block}

/* Text content */
.c-sec-text{text-align:justify}
.c-sec-text p{margin:0 0 12px;text-indent:20px}
.c-sec-text p:first-child{text-indent:0}
.c-sec-text p strong{font-weight:700;color:#111}

/* Drop cap */
.c-dropcap::first-letter{
  float:left;font-size:3.2rem;line-height:0.8;
  font-weight:700;color:#1a7a3a;
  margin:4px 8px 0 0;font-family:'Georgia',serif;
}

/* Textarea */
.c-sec-textarea{
  width:100%;padding:12px;font-size:0.92rem;line-height:1.7;
  font-family:'Georgia',serif;border:2px solid #1a7a3a;
  border-radius:6px;background:#fff;color:#222;
  resize:vertical;outline:none;
}

/* Edit controls */
.c-sec-controls{display:flex;gap:6px;margin-top:8px;padding-bottom:8px;border-bottom:1px solid #eee}
.c-edit-btn{
  padding:4px 12px;font-size:0.72rem;font-weight:600;
  border-radius:5px;border:1px solid #ddd;
  background:#f9f9f9;color:#555;cursor:pointer;
}
.c-edit-btn:hover{background:#eee}

/* Page number */
.c-page-num{text-align:right;padding:8px 48px;font-size:0.8rem;color:#888}

/* Photo picker */
.c-modal-bg{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:24px}
.c-modal{background:var(--surface);border-radius:12px;padding:24px;max-width:700px;width:100%;max-height:80vh;overflow-y:auto;border:1px solid var(--border)}
.c-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.c-photo-opt{border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;background:var(--surface);transition:border-color 150ms;text-align:center}
.c-photo-opt:hover{border-color:#1a7a3a}
.c-photo-opt img{width:100%;height:90px;object-fit:cover;display:block}
.c-photo-opt span{display:block;padding:4px;font-size:0.65rem;color:var(--ink-muted)}

/* Responsive */
@media(max-width:640px){
  .c-section,.c-cover{padding-left:20px;padding-right:20px}
  .c-main-photo-wrap{margin-left:20px;margin-right:20px}
  .c-cover-title{font-size:2rem;letter-spacing:4px}
  .c-sec-photo-right{width:160px}
  .c-cat-bar{padding-left:20px}
}

/* Dark mode doc overrides */
@media(prefers-color-scheme:dark){
  .c-doc{background:#1c1c1e;color:#e0e0e0;border-color:#333}
  .c-cover-title{color:#e0e0e0;border-color:#1a7a3a}
  .c-sec-title{color:#4ade80}
  .c-sec-text p strong{color:#f3f4f6}
  .c-ac{color:#555}
  .c-cover-date{color:#999}
  .c-sec-textarea{background:#1c1c1e;color:#e0e0e0}
  .c-edit-btn{background:#2a2a2a;color:#ccc;border-color:#444}
  .c-sec-controls{border-bottom-color:#333}
}

/* Print */
@media print{
  .no-print{display:none!important}
  .c-editor-page>*:not(.c-doc){display:none!important}
  .page-shell{padding:0!important}
  .ambient{display:none!important}
  .c-toolbar{display:none!important}
  .c-doc{margin:0!important;box-shadow:none!important;border:none!important;max-width:100%!important}
  .c-main-photo{height:260px!important}
  .c-sec-photo-full img{height:180px!important}
  .c-section{page-break-inside:avoid}
  .c-sec-controls,.c-photo-btn,.c-photo-hint{display:none!important}
  .c-dropcap::first-letter{color:#1a7a3a!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .c-cover-banner,.c-cat-bar{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;
