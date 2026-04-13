import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useMemo } from "react";
import { Language, translations } from "./translations";

type LanguageAction = { type: "SET_LANGUAGE"; payload: Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getBrowserLanguage(): Language {
  if (typeof window === "undefined") return "zh";
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith("zh") ? "zh" : "en";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "zh";
  const saved = localStorage.getItem("language");
  if (saved === "en" || saved === "zh") return saved;
  return getBrowserLanguage();
}

function languageReducer(state: Language, action: LanguageAction): Language {
  switch (action.type) {
    case "SET_LANGUAGE":
      return action.payload;
    default:
      return state;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, dispatch] = useReducer(languageReducer, undefined, getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    dispatch({ type: "SET_LANGUAGE", payload: lang });
  }, []);

  const toggleLanguage = useCallback(() => {
    dispatch({ type: "SET_LANGUAGE", payload: language === "en" ? "zh" : "en" });
  }, [language]);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem("language", language);
    const langTag = language === "zh" ? "zh-CN" : "en";
    document.documentElement.lang = langTag;
    const metaTag = document.querySelector('meta[http-equiv="Content-Language"]');
    if (metaTag) {
      metaTag.setAttribute("content", langTag);
    }
  }, [language]);

  const contextValue = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
