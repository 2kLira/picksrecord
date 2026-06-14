import type { EventStats, Pick } from "./types";
import { round2 } from "./odds";

const SETTLED = new Set(["won", "lost", "push"]);

/** Aggregate a set of picks into headline stats. Pending picks never affect P&L or win rate. */
export function computeStats(picks: Pick[]): EventStats {
  let won = 0;
  let lost = 0;
  let pending = 0;
  let push = 0;
  let staked = 0;
  let profit = 0;

  for (const p of picks) {
    switch (p.status) {
      case "won":
        won++;
        break;
      case "lost":
        lost++;
        break;
      case "push":
        push++;
        break;
      default:
        pending++;
    }
    if (SETTLED.has(p.status)) {
      staked += Number(p.stake);
      profit += Number(p.profit);
    }
  }

  const decided = won + lost;
  return {
    total: picks.length,
    won,
    lost,
    pending,
    push,
    staked: round2(staked),
    profit: round2(profit),
    roi: staked > 0 ? round2((profit / staked) * 100) : 0,
    winRate: decided > 0 ? round2((won / decided) * 100) : 0,
  };
}

export interface Streak {
  type: "W" | "L" | null;
  count: number;
}

/** Current win/loss streak from most-recent settled picks (push & pending are skipped). */
export function currentStreak(picks: Pick[]): Streak {
  const decided = picks
    .filter((p) => p.status === "won" || p.status === "lost")
    .sort((a, b) => settledTime(b) - settledTime(a));

  if (decided.length === 0) return { type: null, count: 0 };

  const type = decided[0].status === "won" ? "W" : "L";
  let count = 0;
  for (const p of decided) {
    if ((p.status === "won" ? "W" : "L") === type) count++;
    else break;
  }
  return { type, count };
}

export interface EquityPoint {
  index: number;
  value: number;
  date: string;
}

/** Cumulative realized P&L over settled picks, in chronological order. */
export function buildEquityCurve(picks: Pick[]): EquityPoint[] {
  const settled = picks
    .filter((p) => SETTLED.has(p.status))
    .sort((a, b) => settledTime(a) - settledTime(b));

  let running = 0;
  const points: EquityPoint[] = [{ index: 0, value: 0, date: "" }];
  settled.forEach((p, i) => {
    running = round2(running + Number(p.profit));
    points.push({ index: i + 1, value: running, date: p.settled_at ?? p.created_at });
  });
  return points;
}

function settledTime(p: Pick): number {
  return new Date(p.settled_at ?? p.created_at).getTime();
}
