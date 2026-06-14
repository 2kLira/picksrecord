import type { OddsFormat, PickStatus } from "./types";

/**
 * Profit returned (excluding the stake) if a pick wins.
 *   American +150 -> stake * odds / 100
 *   American -120 -> stake * 100 / |odds|
 *   Decimal  2.50 -> stake * (odds - 1)
 */
export function profitOnWin(stake: number, odds: number, format: OddsFormat): number {
  if (!Number.isFinite(stake) || !Number.isFinite(odds) || stake <= 0) return 0;

  if (format === "decimal") {
    if (odds <= 1) return 0;
    return round2(stake * (odds - 1));
  }

  // american
  if (odds === 0) return 0;
  if (odds > 0) return round2((stake * odds) / 100);
  return round2((stake * 100) / Math.abs(odds));
}

/** Total amount back on a win: stake + profit. */
export function potentialReturn(stake: number, odds: number, format: OddsFormat): number {
  return round2(stake + profitOnWin(stake, odds, format));
}

/**
 * Realized profit/loss once a pick is settled.
 *   won  -> +profitOnWin
 *   lost -> -stake
 *   push -> 0
 *   pending -> 0 (never counted toward realized P&L)
 */
export function settledProfit(
  status: PickStatus,
  stake: number,
  odds: number,
  format: OddsFormat,
): number {
  switch (status) {
    case "won":
      return profitOnWin(stake, odds, format);
    case "lost":
      return round2(-stake);
    case "push":
    case "pending":
    default:
      return 0;
  }
}

/** Convert odds between formats (for display when a user's preference differs). */
export function convertOdds(odds: number, from: OddsFormat, to: OddsFormat): number {
  if (from === to) return odds;
  if (from === "american" && to === "decimal") {
    return odds > 0 ? round2(odds / 100 + 1) : round2(100 / Math.abs(odds) + 1);
  }
  // decimal -> american
  if (odds >= 2) return Math.round((odds - 1) * 100);
  if (odds > 1) return Math.round(-100 / (odds - 1));
  return 0;
}

/** Implied win probability (0–1) from the odds. */
export function impliedProbability(odds: number, format: OddsFormat): number {
  const decimal = format === "decimal" ? odds : convertOdds(odds, "american", "decimal");
  if (decimal <= 1) return 0;
  return round4(1 / decimal);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}
