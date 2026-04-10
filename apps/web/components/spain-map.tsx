"use client";
import Link from "next/link";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Interactive SVG map of Spain's Autonomous Communities.
   Simplified paths – each region is a clickable <path> linking to its page.
   Color-coded by pulseScore (higher = more intense blue).
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MapTerritory {
  slug: string;
  name: string;
  shortCode: string;
  pulseScore: number;
  href: string;
  indicators?: { label: string; value: string; color?: string }[];
}

interface Props {
  territories: MapTerritory[];
}

/* Simplified SVG path data for Spain's CCAA (viewBox 0 0 800 600).
   Approximate centroids for labels are included as cx/cy. */
const REGION_PATHS: Record<string, { d: string; cx: number; cy: number }> = {
  galicia:              { d: "M50,120 L110,100 L130,140 L140,200 L110,230 L60,220 L30,180 Z", cx: 85, cy: 168 },
  asturias:             { d: "M130,110 L200,95 L210,130 L140,145 Z", cx: 170, cy: 118 },
  cantabria:            { d: "M210,100 L270,95 L275,130 L215,132 Z", cx: 242, cy: 114 },
  "pais-vasco":         { d: "M275,90 L330,85 L335,120 L280,125 Z", cx: 305, cy: 104 },
  navarra:              { d: "M335,82 L390,78 L395,130 L340,130 Z", cx: 365, cy: 106 },
  "la-rioja":           { d: "M280,130 L340,130 L340,165 L280,165 Z", cx: 310, cy: 148 },
  aragon:               { d: "M340,130 L420,110 L440,210 L430,300 L370,290 L350,200 Z", cx: 390, cy: 205 },
  cataluna:             { d: "M420,105 L520,90 L540,150 L520,210 L440,210 Z", cx: 480, cy: 155 },
  "castilla-y-leon":    { d: "M60,230 L130,200 L215,135 L280,135 L280,170 L340,170 L350,200 L370,290 L300,310 L200,300 L100,280 Z", cx: 210, cy: 235 },
  madrid:               { d: "M280,300 L330,290 L345,330 L310,345 L275,330 Z", cx: 310, cy: 318 },
  "castilla-la-mancha": { d: "M200,310 L280,300 L275,335 L310,350 L345,335 L370,300 L430,310 L450,380 L420,430 L320,440 L220,420 L180,360 Z", cx: 320, cy: 375 },
  extremadura:          { d: "M60,300 L200,310 L180,360 L220,420 L170,460 L80,440 L50,380 Z", cx: 130, cy: 380 },
  "comunitat-valenciana":{ d: "M430,300 L520,220 L560,280 L540,370 L500,400 L450,380 Z", cx: 500, cy: 330 },
  "illes-balears":      { d: "M590,250 L660,240 L670,280 L650,300 L600,290 Z", cx: 630, cy: 268 },
  andalucia:            { d: "M50,450 L170,465 L220,430 L320,445 L420,435 L450,390 L500,410 L480,460 L420,510 L300,530 L180,520 L80,490 Z", cx: 280, cy: 478 },
  murcia:               { d: "M450,390 L500,400 L530,380 L530,430 L480,460 L450,430 Z", cx: 490, cy: 418 },
  canarias:             { d: "M50,560 L160,555 L170,580 L60,585 Z", cx: 110, cy: 570 },
  ceuta:                { d: "M240,558 L260,555 L262,570 L242,572 Z", cx: 251, cy: 564 },
  melilla:              { d: "M280,558 L300,555 L302,570 L282,572 Z", cx: 291, cy: 564 },
};

function pulseToColor(score: number): string {
  if (score >= 90) return "var(--azul)";
  if (score >= 80) return "#2563eb";
  if (score >= 70) return "#3b82f6";
  if (score >= 60) return "#60a5fa";
  return "#93c5fd";
}

function pulseToFill(score: number): string {
  if (score >= 90) return "rgba(15,68,131,0.35)";
  if (score >= 80) return "rgba(37,99,235,0.28)";
  if (score >= 70) return "rgba(59,130,246,0.22)";
  if (score >= 60) return "rgba(96,165,250,0.18)";
  return "rgba(147,197,253,0.14)";
}

export function SpainMap({ territories }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredTerr = territories.find((t) => t.slug === hovered);

  return (
    <div className="spain-map-wrap">
      <div className="spain-map-container">
        <svg
          viewBox="0 0 720 600"
          className="spain-map-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sea background */}
          <rect x="0" y="0" width="720" height="600" fill="transparent" />

          {territories.map((terr) => {
            const region = REGION_PATHS[terr.slug];
            if (!region) return null;
            const isHovered = hovered === terr.slug;
            return (
              <Link href={terr.href} key={terr.slug}>
                <g
                  onMouseEnter={() => setHovered(terr.slug)}
                  onMouseLeave={() => setHovered(null)}
                  className="spain-map-region"
                >
                  <path
                    d={region.d}
                    fill={isHovered ? pulseToColor(terr.pulseScore) : pulseToFill(terr.pulseScore)}
                    stroke={pulseToColor(terr.pulseScore)}
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    style={{ transition: "fill 200ms, stroke-width 200ms" }}
                  />
                  <text
                    x={region.cx}
                    y={region.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="spain-map-label"
                    style={{
                      fontSize: terr.slug === "ceuta" || terr.slug === "melilla" ? 8 : 11,
                      fontWeight: isHovered ? 800 : 700,
                      fill: isHovered ? "var(--white)" : "var(--ink)",
                    }}
                  >
                    {terr.shortCode}
                  </text>
                  <text
                    x={region.cx}
                    y={region.cy + 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="spain-map-score"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      fill: pulseToColor(terr.pulseScore),
                      opacity: isHovered ? 1 : 0.7,
                    }}
                  >
                    {terr.pulseScore}
                  </text>
                </g>
              </Link>
            );
          })}

          {/* Canarias label */}
          <text x="110" y="548" textAnchor="middle" style={{ fontSize: 8, fill: "var(--ink-muted)", fontWeight: 600 }}>
            CANARIAS
          </text>
          {/* Ceuta / Melilla label */}
          <text x="271" y="548" textAnchor="middle" style={{ fontSize: 7, fill: "var(--ink-muted)", fontWeight: 600 }}>
            CE · ML
          </text>
        </svg>
      </div>

      {/* Tooltip / detail panel */}
      <div className="spain-map-detail">
        {hoveredTerr ? (
          <>
            <div className="spain-map-detail-head">
              <strong>{hoveredTerr.name}</strong>
              <span className="spain-map-detail-score" style={{ color: pulseToColor(hoveredTerr.pulseScore) }}>
                {hoveredTerr.pulseScore}
              </span>
            </div>
            {hoveredTerr.indicators && hoveredTerr.indicators.length > 0 && (
              <div className="spain-map-detail-indicators">
                {hoveredTerr.indicators.map((ind) => (
                  <div key={ind.label} className="spain-map-indicator">
                    <span>{ind.label}</span>
                    <strong style={{ color: ind.color ?? "var(--ink)" }}>{ind.value}</strong>
                  </div>
                ))}
              </div>
            )}
            <span className="spain-map-detail-cta">Click para ver ficha →</span>
          </>
        ) : (
          <div className="spain-map-detail-empty">
            <span className="eyebrow">MAPA TERRITORIAL</span>
            <p>Pasa el ratón sobre una comunidad para ver sus indicadores</p>
            <div className="spain-map-legend">
              <div><span style={{ background: "rgba(15,68,131,0.35)" }} /> 90+</div>
              <div><span style={{ background: "rgba(37,99,235,0.28)" }} /> 80-89</div>
              <div><span style={{ background: "rgba(59,130,246,0.22)" }} /> 70-79</div>
              <div><span style={{ background: "rgba(96,165,250,0.18)" }} /> 60-69</div>
              <div><span style={{ background: "rgba(147,197,253,0.14)" }} /> &lt;60</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
