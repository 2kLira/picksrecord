import { CURRENCY_SYMBOLS, type Currency, type OddsFormat } from "./types";

/** Format a monetary amount with the user's currency symbol. */
export function formatMoney(
  amount: number,
  currency: Currency,
  opts: { sign?: boolean; decimals?: number } = {},
): string {
  const { sign = false, decimals = 2 } = opts;
  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";
  const abs = Math.abs(amount);
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix = amount < 0 ? "−" : sign ? "+" : "";
  return `${prefix}${symbol}${body}`;
}

/** Render odds in the requested format. */
export function formatOdds(odds: number, format: OddsFormat): string {
  if (format === "decimal") {
    return odds.toFixed(2);
  }
  const rounded = Math.round(odds);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(value: string): string {
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}
