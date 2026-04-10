"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "../lib/i18n/context";
import type { LangCode } from "../lib/i18n/translations";

const languages: { code: LangCode; label: string; flag: string }[] = [
  { code: "es", label: "Castellano", flag: "🇪🇸" },
  { code: "ca", label: "Català", flag: "🏳️" },
  { code: "gl", label: "Galego", flag: "🏳️" },
  { code: "eu", label: "Euskara", flag: "🏳️" },
  { code: "va", label: "Valencià", flag: "🏳️" },
  { code: "ast", label: "Asturianu", flag: "🏳️" },
  { code: "oc", label: "Aranés", flag: "🏳️" },
];

export function LangSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="lang-dropdown" ref={ref}>
      <button
        className="lang-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={current.label}
      >
        <span className="lang-dropdown-code">{current.code.toUpperCase()}</span>
        <svg className={`nav-dropdown-chevron ${open ? "nav-dropdown-chevron-open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="lang-dropdown-menu">
          <span className="lang-dropdown-title">Idioma cooficial</span>
          {languages.map((l) => (
            <button
              key={l.code}
              className={`lang-dropdown-item ${l.code === lang ? "lang-dropdown-item-active" : ""}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span className="lang-dropdown-item-code">{l.code.toUpperCase()}</span>
              <span className="lang-dropdown-item-label">{l.label}</span>
              {l.code === lang && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="lang-dropdown-check">
                  <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
