"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ResearchChat, type ChatAction } from "./research-chat";
import { ResearchContextPanel } from "./research-context-panel";

/* ═══════════════════════════════════════════════════════════════════════════
   Research Layout — split view with chat on the left, context panel on
   the right. Manages the active action state between the two panels.
   Resizable via drag handle. Responsive: stacks vertically on mobile
   with the context panel as a slide-up overlay.
   ═══════════════════════════════════════════════════════════════════════════ */

export function ResearchLayout() {
  const [activeAction, setActiveAction] = useState<ChatAction | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleAction = (action: ChatAction) => {
    setActiveAction(action);
    setPanelOpen(true);
  };

  const handleClose = () => {
    setPanelOpen(false);
    setTimeout(() => setActiveAction(null), 200);
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPanelWidth = rect.right - e.clientX;
      setPanelWidth(Math.max(260, Math.min(newPanelWidth, rect.width * 0.6)));
    };
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div
      className="research-split"
      ref={containerRef}
      style={{ gridTemplateColumns: panelWidth ? `1fr 6px ${panelWidth}px` : '1fr 6px 1fr' } as React.CSSProperties}
    >
      <div className="research-split-chat">
        <ResearchChat onAction={handleAction} />
      </div>
      <div
        className="research-split-drag"
        onMouseDown={onDragStart}
        title="Arrastra para redimensionar"
      />
      <div className={`research-split-panel ${panelOpen ? "research-split-panel-open" : ""}`}>
        <ResearchContextPanel action={activeAction} onClose={handleClose} />
      </div>
      {panelOpen && (
        <div className="research-split-backdrop" onClick={handleClose} />
      )}
    </div>
  );
}
