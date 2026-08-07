"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { dictionaries, type Locale, type Dictionary } from "@/lib/i18n/dictionaries";

const STORAGE_KEY = "wizecatch-locale";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "fr" ? stored : "en";
}

function getServerSnapshot(): Locale {
  return "en";
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setLocale(next: Locale) {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new StorageEvent("storage"));
  }

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, dict: dictionaries[locale] }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
