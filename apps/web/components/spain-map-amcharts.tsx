"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { MapTerritory } from "./spain-map";

/* ═══════════════════════════════════════════════════════════════════════════
   Spain Map (amCharts 4) — Interactive choropleth map of Spain's provinces,
   colored by CCAA pulse score. Uses amCharts 4 geodata for accurate
   province boundaries. Falls back to a loading skeleton while scripts load.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Map province IDs to CCAA slugs */
const PROVINCE_TO_CCAA: Record<string, string> = {
  // Andalucía
  "ES-AL": "andalucia", "ES-CA": "andalucia", "ES-CO": "andalucia",
  "ES-GR": "andalucia", "ES-H": "andalucia", "ES-J": "andalucia",
  "ES-MA": "andalucia", "ES-SE": "andalucia",
  // Aragón
  "ES-HU": "aragon", "ES-TE": "aragon", "ES-Z": "aragon",
  // Asturias
  "ES-O": "asturias",
  // Illes Balears
  "ES-PM": "illes-balears",
  // Canarias
  "ES-GC": "canarias", "ES-TF": "canarias",
  // Cantabria
  "ES-S": "cantabria",
  // Castilla y León
  "ES-AV": "castilla-y-leon", "ES-BU": "castilla-y-leon", "ES-LE": "castilla-y-leon",
  "ES-P": "castilla-y-leon", "ES-SA": "castilla-y-leon", "ES-SG": "castilla-y-leon",
  "ES-SO": "castilla-y-leon", "ES-VA": "castilla-y-leon", "ES-ZA": "castilla-y-leon",
  // Castilla-La Mancha
  "ES-AB": "castilla-la-mancha", "ES-CR": "castilla-la-mancha", "ES-CU": "castilla-la-mancha",
  "ES-GU": "castilla-la-mancha", "ES-TO": "castilla-la-mancha",
  // Cataluña
  "ES-B": "cataluna", "ES-GI": "cataluna", "ES-L": "cataluna", "ES-T": "cataluna",
  // C. Valenciana
  "ES-A": "comunitat-valenciana", "ES-CS": "comunitat-valenciana", "ES-V": "comunitat-valenciana",
  // Extremadura
  "ES-BA": "extremadura", "ES-CC": "extremadura",
  // Galicia
  "ES-C": "galicia", "ES-LU": "galicia", "ES-OR": "galicia", "ES-PO": "galicia",
  // Madrid
  "ES-M": "madrid",
  // Murcia
  "ES-MU": "murcia",
  // Navarra
  "ES-NA": "navarra",
  // País Vasco
  "ES-VI": "pais-vasco", "ES-SS": "pais-vasco", "ES-BI": "pais-vasco",
  // La Rioja
  "ES-LO": "la-rioja",
  // Ceuta & Melilla
  "ES-CE": "ceuta", "ES-ML": "melilla",
};

/** CCAA capital coordinates for markers */
const CCAA_CAPITALS: Record<string, { lat: number; lon: number; name: string }> = {
  andalucia:             { lat: 37.3886, lon: -5.9823, name: "Sevilla" },
  aragon:                { lat: 41.6488, lon: -0.8891, name: "Zaragoza" },
  asturias:              { lat: 43.3614, lon: -5.8593, name: "Oviedo" },
  "illes-balears":       { lat: 39.5696, lon: 2.6502, name: "Palma" },
  canarias:              { lat: 28.1235, lon: -15.4363, name: "Las Palmas" },
  cantabria:             { lat: 43.4623, lon: -3.8099, name: "Santander" },
  "castilla-y-leon":     { lat: 41.6523, lon: -4.7245, name: "Valladolid" },
  "castilla-la-mancha":  { lat: 39.8628, lon: -4.0273, name: "Toledo" },
  cataluna:              { lat: 41.3874, lon: 2.1686, name: "Barcelona" },
  "comunitat-valenciana": { lat: 39.4699, lon: -0.3763, name: "Valencia" },
  extremadura:           { lat: 38.9078, lon: -6.3413, name: "Mérida" },
  galicia:               { lat: 42.8782, lon: -8.5448, name: "Santiago" },
  madrid:                { lat: 40.4168, lon: -3.7038, name: "Madrid" },
  murcia:                { lat: 37.9922, lon: -1.1307, name: "Murcia" },
  navarra:               { lat: 42.8125, lon: -1.6458, name: "Pamplona" },
  "pais-vasco":          { lat: 42.8467, lon: -2.6716, name: "Vitoria" },
  "la-rioja":            { lat: 42.4627, lon: -2.4441, name: "Logroño" },
};

function pulseToHex(score: number): string {
  if (score >= 90) return "#0f4483";
  if (score >= 80) return "#2563eb";
  if (score >= 70) return "#3b82f6";
  if (score >= 60) return "#60a5fa";
  return "#93c5fd";
}

function pulseToFillHex(score: number): string {
  if (score >= 90) return "#1e5a9e";
  if (score >= 80) return "#3b7ddd";
  if (score >= 70) return "#6ba3eb";
  if (score >= 60) return "#93c0f5";
  return "#bdd8fc";
}

interface Props {
  territories: MapTerritory[];
}

/* Global type declarations for amCharts loaded via CDN */
declare global {
  interface Window {
    am4core: any;
    am4maps: any;
    am4geodata_spainProvincesHigh: any;
    am4themes_animated: any;
  }
}

const SCRIPTS = [
  "https://cdn.amcharts.com/lib/4/core.js",
  "https://cdn.amcharts.com/lib/4/maps.js",
  "https://cdn.amcharts.com/lib/4/geodata/spainProvincesHigh.js",
  "https://cdn.amcharts.com/lib/4/themes/animated.js",
];

export function SpainMapAmcharts({ territories }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);
  const [hovered, setHovered] = useState<MapTerritory | null>(null);

  const allLoaded = scriptsLoaded >= SCRIPTS.length;

  // Build territory lookup
  const terrMap = new Map(territories.map(t => [t.slug, t]));

  useEffect(() => {
    if (!allLoaded || !chartRef.current) return;
    if (typeof window === "undefined") return;

    const am4core = window.am4core;
    const am4maps = window.am4maps;

    if (!am4core || !am4maps || !window.am4geodata_spainProvincesHigh) return;

    // Apply theme
    am4core.useTheme(window.am4themes_animated);

    // Create chart
    const chart = am4core.create(chartRef.current, am4maps.MapChart);
    chartInstance.current = chart;

    chart.geodata = window.am4geodata_spainProvincesHigh;
    chart.projection = new am4maps.projections.Miller();

    // Zoom to Spain — show full peninsula + Canarias + Baleares
    chart.homeZoomLevel = 4;
    chart.homeGeoPoint = { latitude: 37.5, longitude: -4.0 };
    chart.minZoomLevel = 2;
    chart.maxZoomLevel = 20;

    // Zoom controls
    chart.zoomControl = new am4maps.ZoomControl();
    chart.zoomControl.slider.height = 80;
    chart.zoomControl.marginRight = 10;

    // Disable wheel zoom for better scroll UX
    chart.chartContainer.wheelable = false;

    // ── Province series (choropleth by CCAA pulse) ──
    const provinceSeries = chart.series.push(new am4maps.MapPolygonSeries());
    provinceSeries.useGeodata = true;

    const polygonTemplate = provinceSeries.mapPolygons.template;
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.stroke = am4core.color("#ffffff");
    polygonTemplate.fill = am4core.color("#d1d5db");

    // Tooltip
    polygonTemplate.tooltipText = "{ccaaName}\n{ccaaShortCode} — Pulse: {pulseScore}";

    // Style tooltip after template is ready
    provinceSeries.events.on("inited", () => {
      if (provinceSeries.tooltip) {
        provinceSeries.tooltip.getFillFromObject = false;
        provinceSeries.tooltip.background.fill = am4core.color("#1a1a2e");
        provinceSeries.tooltip.background.cornerRadius = 6;
        provinceSeries.tooltip.label.fill = am4core.color("#ffffff");
        provinceSeries.tooltip.label.fontSize = 13;
      }
    });

    // Hover state
    const hs = polygonTemplate.states.create("hover");
    hs.properties.strokeWidth = 2;
    hs.properties.stroke = am4core.color("#0f4483");

    // Set province colors based on CCAA pulse score
    provinceSeries.events.on("inited", () => {
      provinceSeries.mapPolygons.each((polygon: any) => {
        const id = polygon.dataItem?.dataContext?.id;
        if (!id) return;
        const ccaaSlug = PROVINCE_TO_CCAA[id];
        if (!ccaaSlug) return;
        const terr = terrMap.get(ccaaSlug);
        if (terr) {
          polygon.fill = am4core.color(pulseToFillHex(terr.pulseScore));
          polygon.dataItem.dataContext.ccaaName = terr.name;
          polygon.dataItem.dataContext.ccaaShortCode = terr.shortCode;
          polygon.dataItem.dataContext.pulseScore = terr.pulseScore;
        }
      });
    });

    // Click on province → navigate to CCAA
    polygonTemplate.events.on("hit", (ev: any) => {
      const id = ev.target.dataItem?.dataContext?.id;
      if (!id) return;
      const ccaaSlug = PROVINCE_TO_CCAA[id];
      if (ccaaSlug) {
        window.location.href = `/territories/${ccaaSlug}`;
      }
    });

    // Hover → update side panel
    polygonTemplate.events.on("over", (ev: any) => {
      const id = ev.target.dataItem?.dataContext?.id;
      if (!id) return;
      const ccaaSlug = PROVINCE_TO_CCAA[id];
      if (ccaaSlug) {
        const terr = terrMap.get(ccaaSlug);
        if (terr) setHovered(terr);
      }
    });
    polygonTemplate.events.on("out", () => setHovered(null));

    // ── Capital markers ──
    const imageSeries = chart.series.push(new am4maps.MapImageSeries());
    const imageTemplate = imageSeries.mapImages.template;
    imageTemplate.propertyFields.latitude = "latitude";
    imageTemplate.propertyFields.longitude = "longitude";
    imageTemplate.nonScaling = true;

    const circle = imageTemplate.createChild(am4core.Circle);
    circle.radius = 3;
    circle.fill = am4core.color("#0f4483");
    circle.stroke = am4core.color("#ffffff");
    circle.strokeWidth = 1.2;

    const label = imageTemplate.createChild(am4core.Label);
    label.text = "{name}";
    label.fontSize = 9;
    label.fontWeight = "600";
    label.fill = am4core.color("#1a1a2e");
    label.dy = -10;
    label.horizontalCenter = "middle";

    // Add capital data
    const capitalData: any[] = [];
    for (const [slug, cap] of Object.entries(CCAA_CAPITALS)) {
      const terr = terrMap.get(slug);
      if (terr) {
        capitalData.push({
          latitude: cap.lat,
          longitude: cap.lon,
          name: cap.name,
          ccaaName: terr.name,
          pulseScore: terr.pulseScore,
        });
      }
    }
    imageSeries.data = capitalData;

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [allLoaded, territories]);

  return (
    <>
      {/* Preconnect + load amCharts scripts eagerly */}
      <link rel="preconnect" href="https://cdn.amcharts.com" />
      {SCRIPTS.map((src, i) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          onLoad={() => setScriptsLoaded((prev) => Math.max(prev, i + 1))}
        />
      ))}

      <div className="spain-map-wrap">
        <div className="spain-map-container">
          {!allLoaded && (
            <div className="spain-map-loading">
              <span className="research-chat-status-spinner" />
              Cargando mapa interactivo...
            </div>
          )}
          <div
            ref={chartRef}
            className="spain-map-amcharts"
            style={{ opacity: allLoaded ? 1 : 0 }}
          />
        </div>

        {/* Tooltip / detail panel — same as original */}
        <div className="spain-map-detail">
          {hovered ? (
            <>
              <div className="spain-map-detail-head">
                <strong>{hovered.name}</strong>
                <span className="spain-map-detail-score" style={{ color: pulseToHex(hovered.pulseScore) }}>
                  {hovered.pulseScore}
                </span>
              </div>
              {hovered.indicators && hovered.indicators.length > 0 && (
                <div className="spain-map-detail-indicators">
                  {hovered.indicators.map((ind) => (
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
              <p>Pasa el rat{"ó"}n sobre una comunidad para ver sus indicadores</p>
              <div className="spain-map-legend">
                <div><span style={{ background: "#1e5a9e" }} /> 90+</div>
                <div><span style={{ background: "#3b7ddd" }} /> 80-89</div>
                <div><span style={{ background: "#6ba3eb" }} /> 70-79</div>
                <div><span style={{ background: "#93c0f5" }} /> 60-69</div>
                <div><span style={{ background: "#bdd8fc" }} /> &lt;60</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
