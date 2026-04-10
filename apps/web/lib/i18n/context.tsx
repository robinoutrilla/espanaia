"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type LangCode, type Translations } from "./translations";

interface LangContextValue {
  lang: LangCode;
  t: Translations;
  setLang: (code: LangCode) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "es",
  t: translations.es,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("es");

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    document.documentElement.lang = code === "va" ? "ca" : code;
  }, []);

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
