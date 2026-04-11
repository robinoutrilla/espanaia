"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LangSelector } from "./lang-selector";
import { useLang } from "../lib/i18n/context";
import type { Translations } from "../lib/i18n/translations";

interface SiteHeaderProps {
  currentSection?: "home" | "territories" | "parties" | "politicians" | "agenda" | "finanzas" | "votaciones" | "indicadores" | "contratacion" | "europa" | "transparencia" | "sources" | "research" | "medios" | "predicciones" | "partido-iapn" | "terminal" | "inteligencia" | "benchmark" | "decisiones" | "ministerios" | "radar-regulatorio" | "subvenciones" | "sales-intelligence" | "scoring-riesgo" | "asistente" | "cargos-publicos" | "educacion" | "periodico" | "constitucion-viva" | "political-twin" | "simulador" | "next-gen" | "signal-engine" | "mis-impuestos" | "confidencial-vip" | "confidencial";
}

type NavKey = keyof Translations["nav"];

interface NavItem { href: string; key?: NavKey; label?: string; section: string }

const ccaaItems: NavItem[] = [
  { href: "/agenda?territorio=andalucia", label: "Andalucía", section: "agenda" },
  { href: "/agenda?territorio=aragon", label: "Aragón", section: "agenda" },
  { href: "/agenda?territorio=asturias", label: "Asturias", section: "agenda" },
  { href: "/agenda?territorio=illes-balears", label: "Illes Balears", section: "agenda" },
  { href: "/agenda?territorio=canarias", label: "Canarias", section: "agenda" },
  { href: "/agenda?territorio=cantabria", label: "Cantabria", section: "agenda" },
  { href: "/agenda?territorio=castilla-y-leon", label: "Castilla y León", section: "agenda" },
  { href: "/agenda?territorio=castilla-la-mancha", label: "Castilla-La Mancha", section: "agenda" },
  { href: "/agenda?territorio=cataluna", label: "Cataluña", section: "agenda" },
  { href: "/agenda?territorio=extremadura", label: "Extremadura", section: "agenda" },
  { href: "/agenda?territorio=galicia", label: "Galicia", section: "agenda" },
  { href: "/agenda?territorio=madrid", label: "C. de Madrid", section: "agenda" },
  { href: "/agenda?territorio=murcia", label: "R. de Murcia", section: "agenda" },
  { href: "/agenda?territorio=navarra", label: "Navarra", section: "agenda" },
  { href: "/agenda?territorio=pais-vasco", label: "País Vasco", section: "agenda" },
  { href: "/agenda?territorio=la-rioja", label: "La Rioja", section: "agenda" },
  { href: "/agenda?territorio=comunitat-valenciana", label: "C. Valenciana", section: "agenda" },
  { href: "/agenda?territorio=ceuta", label: "Ceuta", section: "agenda" },
  { href: "/agenda?territorio=melilla", label: "Melilla", section: "agenda" },
];

const navGroups: { label: string; groupKey: string; items: NavItem[] }[] = [
  {
    label: "Actores",
    groupKey: "actores",
    items: [
      { href: "/territories", key: "territories", section: "territories" },
      { href: "/parties", key: "parties", section: "parties" },
      { href: "/politicians", key: "politicians", section: "politicians" },
    ],
  },
  {
    label: "Parlamento",
    groupKey: "parlamento",
    items: [
      { href: "/agenda", key: "agenda", section: "agenda" },
      { href: "/votaciones", key: "votes", section: "votaciones" },
      { href: "/finanzas", key: "finance", section: "finanzas" },
    ],
  },
  {
    label: "Ministerios",
    groupKey: "ministerios",
    items: [
      { href: "/ministerios", label: "Todos", section: "ministerios" },
      { href: "/ministerios?m=presidencia-justicia", label: "Presidencia y Justicia", section: "ministerios" },
      { href: "/ministerios?m=hacienda", label: "Hacienda", section: "ministerios" },
      { href: "/ministerios?m=defensa", label: "Defensa", section: "ministerios" },
      { href: "/ministerios?m=asuntos-exteriores", label: "Exteriores", section: "ministerios" },
      { href: "/ministerios?m=interior", label: "Interior", section: "ministerios" },
      { href: "/ministerios?m=transportes", label: "Transportes", section: "ministerios" },
      { href: "/ministerios?m=transformacion-digital", label: "Transformación Digital", section: "ministerios" },
      { href: "/ministerios?m=educacion", label: "Educación", section: "ministerios" },
      { href: "/ministerios?m=trabajo", label: "Trabajo", section: "ministerios" },
      { href: "/ministerios?m=industria-turismo", label: "Industria y Turismo", section: "ministerios" },
      { href: "/ministerios?m=agricultura", label: "Agricultura", section: "ministerios" },
      { href: "/ministerios?m=economia", label: "Economía", section: "ministerios" },
      { href: "/ministerios?m=derechos-sociales", label: "Derechos Sociales", section: "ministerios" },
      { href: "/ministerios?m=sanidad", label: "Sanidad", section: "ministerios" },
      { href: "/ministerios?m=ciencia", label: "Ciencia", section: "ministerios" },
      { href: "/ministerios?m=igualdad", label: "Igualdad", section: "ministerios" },
      { href: "/ministerios?m=cultura", label: "Cultura", section: "ministerios" },
      { href: "/ministerios?m=inclusion", label: "Inclusión y SS", section: "ministerios" },
      { href: "/ministerios?m=transicion-ecologica", label: "Transición Ecológica", section: "ministerios" },
      { href: "/ministerios?m=vivienda", label: "Vivienda", section: "ministerios" },
      { href: "/ministerios?m=juventud-infancia", label: "Juventud e Infancia", section: "ministerios" },
    ],
  },
  {
    label: "CCAA",
    groupKey: "ccaa",
    items: ccaaItems,
  },
  {
    label: "Datos",
    groupKey: "datos",
    items: [
      { href: "/indicadores", key: "indicators", section: "indicadores" },
      { href: "/contratacion", key: "contracts", section: "contratacion" },
      { href: "/europa", key: "europe", section: "europa" },
      { href: "/transparencia", key: "transparency", section: "transparencia" },
      { href: "/medios", key: "media" as NavKey, section: "medios" },
      { href: "/sources", key: "sources", section: "sources" },
    ],
  },
  {
    label: "AI",
    groupKey: "ai",
    items: [
      { href: "/predicciones", key: "predictions" as NavKey, section: "predicciones" },
      { href: "/decisiones", label: "Decisiones", section: "decisiones" },
      { href: "/research", key: "research", section: "research" },
    ],
  },
  {
    label: "Herramientas",
    groupKey: "herramientas",
    items: [
      { href: "/terminal", label: "Terminal", section: "terminal" },
      { href: "/inteligencia", label: "Inteligencia", section: "inteligencia" },
      { href: "/benchmark", label: "Benchmark", section: "benchmark" },
      { href: "/mis-impuestos", label: "Mis Impuestos", section: "mis-impuestos" },
    ],
  },
  {
    label: "Productos",
    groupKey: "productos",
    items: [
      { href: "/confidencial-vip", label: "Confidencial VIP", section: "confidencial-vip" },
      { href: "/confidencial", label: "Confidencial Doc", section: "confidencial" },
      { href: "/radar-regulatorio", label: "Radar Regulatorio", section: "radar-regulatorio" },
      { href: "/subvenciones", label: "Subvenciones", section: "subvenciones" },
      { href: "/sales-intelligence", label: "Sales Intelligence", section: "sales-intelligence" },
      { href: "/scoring-riesgo", label: "Scoring Riesgo", section: "scoring-riesgo" },
      { href: "/asistente", label: "Asistente", section: "asistente" },
      { href: "/cargos-publicos", label: "Cargos Públicos", section: "cargos-publicos" },
      { href: "/educacion", label: "Educación Cívica", section: "educacion" },
    ],
  },
  {
    label: "Nuevo",
    groupKey: "nuevo",
    items: [
      { href: "/constitucion-viva", label: "Constitución Viva", section: "constitucion-viva" },
      { href: "/political-twin", label: "Political Twin", section: "political-twin" },
      { href: "/simulador", label: "Simulador de España", section: "simulador" },
      { href: "/next-gen", label: "España Next Gen", section: "next-gen" },
      { href: "/signal-engine", label: "Signal Engine", section: "signal-engine" },
    ],
  },
];

function NavDropdown({
  label,
  items,
  currentSection,
  t,
}: {
  label: string;
  items: NavItem[];
  currentSection: string;
  t: Translations;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeItem = items.find((i) => i.section === currentSection);
  const itemLabel = (item: NavItem) => item.label ?? (item.key ? t.nav[item.key] : "");
  const scrollable = items.length > 8;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`nav-dropdown-trigger ${activeItem ? "nav-dropdown-active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="nav-dropdown-label">{label}</span>
        {activeItem && <span className="nav-dropdown-current">{itemLabel(activeItem)}</span>}
        <svg className={`nav-dropdown-chevron ${open ? "nav-dropdown-chevron-open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className={`nav-dropdown-menu ${scrollable ? "nav-dropdown-menu-scroll" : ""}`}>
          <span className="nav-dropdown-menu-label">{label}</span>
          {items.map((item) => (
            <Link
              key={item.href}
              className={`nav-dropdown-item ${currentSection === item.section ? "nav-dropdown-item-active" : ""}`}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {itemLabel(item)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavGroup({
  label,
  items,
  currentSection,
  t,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  currentSection: string;
  t: Translations;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemLabel = (item: NavItem) => item.label ?? (item.key ? t.nav[item.key] : "");

  return (
    <div className="mobile-nav-group">
      <button className="mobile-nav-group-trigger" onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <svg className={`mobile-nav-chevron ${open ? "mobile-nav-chevron-open" : ""}`} width="12" height="12" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="mobile-nav-group-items">
          {items.map((item) => (
            <Link
              key={item.href}
              className={`mobile-nav-link ${currentSection === item.section ? "mobile-nav-link-active" : ""}`}
              href={item.href}
              onClick={onNavigate}
            >
              {itemLabel(item)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ currentSection = "home" }: SiteHeaderProps) {
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() { if (window.innerWidth > 768) setMobileOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="panel site-header">
      {/* Top bar: brand text + meta */}
      <div className="header-top">
        <Link className="brand-block" href="/" onClick={closeMobile}>
          <div className="brand-name">
            <span className="brand-name-main">Inteligencia Abierta para Espa{"ñ"}a</span>
            <span className="brand-name-sub">Plataforma de inteligencia pol{"í"}tica</span>
          </div>
        </Link>

        <div className="site-meta">
          <LangSelector />
          <span className="tag tag-bright">{t.common.live}</span>
          {/* Hamburger — mobile only */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            <span className={`hamburger-line ${mobileOpen ? "hamburger-open" : ""}`} />
            <span className={`hamburger-line ${mobileOpen ? "hamburger-open" : ""}`} />
            <span className={`hamburger-line ${mobileOpen ? "hamburger-open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Desktop: Yellow nav bar */}
      <nav className="site-nav site-nav-desktop" aria-label={t.common.nationalNav}>
        <Link
          className={`nav-link-radar ${currentSection === "home" ? "nav-link-radar-active" : ""}`}
          href="/"
        >
          {t.nav.radar}
        </Link>
        {navGroups.map((group) => (
          <NavDropdown
            key={group.groupKey}
            label={group.label}
            items={group.items}
            currentSection={currentSection}
            t={t}
          />
        ))}
        <Link
          className={`nav-link-radar ${currentSection === "periodico" ? "nav-link-radar-active" : ""}`}
          href="/periodico"
          style={{ marginLeft: "auto" }}
        >
          Periódico
        </Link>
        <Link
          className={`nav-link-radar ${currentSection === "partido-iapn" ? "nav-link-radar-active" : ""}`}
          href="/partido-iapn"
        >
          Partido IAP{"Ñ"}
        </Link>
      </nav>

      {/* Mobile: Full-screen drawer */}
      {mobileOpen && (
        <div className="mobile-nav-backdrop" onClick={closeMobile} />
      )}
      <nav className={`mobile-nav-drawer ${mobileOpen ? "mobile-nav-drawer-open" : ""}`} aria-label="Menú móvil">
        <Link
          className={`mobile-nav-link mobile-nav-link-top ${currentSection === "home" ? "mobile-nav-link-active" : ""}`}
          href="/"
          onClick={closeMobile}
        >
          {t.nav.radar}
        </Link>
        {navGroups.map((group) => (
          <MobileNavGroup
            key={group.groupKey}
            label={group.label}
            items={group.items}
            currentSection={currentSection}
            t={t}
            onNavigate={closeMobile}
          />
        ))}
        <div className="mobile-nav-divider" />
        <Link
          className={`mobile-nav-link mobile-nav-link-top ${currentSection === "periodico" ? "mobile-nav-link-active" : ""}`}
          href="/periodico"
          onClick={closeMobile}
        >
          Periódico
        </Link>
        <Link
          className={`mobile-nav-link mobile-nav-link-top ${currentSection === "partido-iapn" ? "mobile-nav-link-active" : ""}`}
          href="/partido-iapn"
          onClick={closeMobile}
        >
          Partido IAP{"Ñ"}
        </Link>
      </nav>
    </header>
  );
}
