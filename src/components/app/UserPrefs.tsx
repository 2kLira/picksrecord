"use client";

import { createContext, useContext } from "react";
import type { Currency, OddsFormat } from "@/lib/types";

interface Prefs {
  name: string;
  currency: Currency;
  oddsFormat: OddsFormat;
}

const PrefsContext = createContext<Prefs>({ name: "", currency: "USD", oddsFormat: "american" });

export function UserPrefsProvider({ value, children }: { value: Prefs; children: React.ReactNode }) {
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  return useContext(PrefsContext);
}
