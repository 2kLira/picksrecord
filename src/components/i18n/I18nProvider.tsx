"use client";

import { createContext, useContext } from "react";
import { getDict, type Dict, type Locale } from "@/lib/i18n";

interface I18nValue {
  locale: Locale;
  t: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Wraps the tree with the dictionary for `locale`. The dict is looked up locally
 * (not passed across the server boundary) so it can contain functions. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: getDict(locale) }}>{children}</I18nContext.Provider>;
}

export function useT(): Dict {
  const ctx = useContext(I18nContext);
  if (!ctx) return getDict("es");
  return ctx.t;
}

export function useLocale(): Locale {
  return useContext(I18nContext)?.locale ?? "es";
}
