export type OddsFormat = "american" | "decimal";
export type Currency = "USD" | "EUR" | "GBP" | "MXN" | "CAD" | "BRL";
export type PickStatus = "pending" | "won" | "lost" | "push";
export type PickType =
  | "moneyline"
  | "spread"
  | "over_under"
  | "prop"
  | "parlay"
  | "future"
  | "other";

/** Public-safe user shape. Never includes password_hash. */
export interface User {
  id: string;
  name: string;
  email: string;
  preferred_odds_format: OddsFormat;
  currency: Currency;
  favorite_sports: string[];
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface SportEvent {
  id: string;
  created_by: string;
  name: string;
  sport: string;
  description: string | null;
  color: string;
  event_date: string | null;
  created_at: string;
  updated_at: string;
}

/** A single leg of a parlay: one selection and its individual odds (in the pick's odds_format). */
export interface ParlayLeg {
  selection: string;
  odds: number;
}

export interface Pick {
  id: string;
  user_id: string;
  event_id: string;
  match_name: string;
  selection: string;
  pick_type: PickType;
  stake: number;
  odds: number;
  odds_format: OddsFormat;
  status: PickStatus;
  notes: string | null;
  profit: number;
  potential_return: number;
  /** For parlays: the individual legs. null for single picks. */
  legs: ParlayLeg[] | null;
  created_at: string;
  updated_at: string;
  settled_at: string | null;
}

export interface EventStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  push: number;
  staked: number;
  profit: number;
  roi: number;
  winRate: number;
}

export interface EventWithStats extends SportEvent {
  stats: EventStats;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  MXN: "$",
  CAD: "$",
  BRL: "R$",
};

export const PICK_TYPE_LABELS: Record<PickType, string> = {
  moneyline: "Moneyline",
  spread: "Spread",
  over_under: "Over / Under",
  prop: "Prop",
  parlay: "Parlay",
  future: "Future",
  other: "Other",
};

export const SPORTS = [
  "World Cup 2026",
  "NBA",
  "MLB",
  "NFL",
  "Champions League",
  "NHL",
  "Football",
  "Tennis",
  "UFC / MMA",
  "Boxing",
  "Golf",
  "Other",
] as const;
