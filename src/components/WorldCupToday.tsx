import { Trophy } from "lucide-react";
import { getT } from "@/lib/i18n-server";
import type { Dict } from "@/lib/i18n";
import { fetchAllMatches, parseKickoffUtc, type OFMatch } from "@/lib/worldcup";
import { LiveRefresher } from "@/components/motion/LiveRefresher";
import { LocalTime } from "@/components/LocalTime";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodayMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffUtc: string;
  roundLabel: string;
  city: string;
  phase: "live" | "done" | "ns";
  homeScore: number | null;
  awayScore: number | null;
}

// ─── Round label ──────────────────────────────────────────────────────────────

function roundLabel(round: string, group: string | undefined, t: Dict): string {
  if (group) {
    const letter = group.replace("Group ", "");
    return `${t.worldCup.group} ${letter}`;
  }
  const r = round.toLowerCase();
  if (r.includes("32")) return t.worldCup.roundOf32;
  if (r.includes("16")) return t.worldCup.roundOf16;
  if (r.includes("quarter")) return t.worldCup.quarterFinal;
  if (r.includes("semi")) return t.worldCup.semiFinal;
  if (r.includes("third") || r.includes("3rd") || r.includes("place")) return t.worldCup.thirdPlace;
  if (r.includes("final")) return t.worldCup.final;
  return round;
}

// ─── Phase detection ──────────────────────────────────────────────────────────

function getPhase(m: OFMatch, kickoffUtc: string): TodayMatch["phase"] {
  if (m.score?.ft) return "done";
  if (Date.now() >= new Date(kickoffUtc).getTime()) return "live";
  return "ns";
}

// ─── Component ────────────────────────────────────────────────────────────────

export async function WorldCupToday() {
  const [allMatches, t] = await Promise.all([fetchAllMatches(), getT()]);

  const today = new Date().toISOString().slice(0, 10);

  const matches: TodayMatch[] = allMatches
    .filter((m) => m.date === today && !/^(\d|[WL])/.test(m.team1))
    .map((m): TodayMatch => {
      const kickoffUtc = parseKickoffUtc(m.date, m.time);
      return {
        id: `${m.date}-${m.team1}-${m.team2}`,
        homeTeam: m.team1,
        awayTeam: m.team2,
        kickoffUtc,
        roundLabel: roundLabel(m.round, m.group, t),
        city: m.ground,
        phase: getPhase(m, kickoffUtc),
        homeScore: m.score?.ft[0] ?? null,
        awayScore: m.score?.ft[1] ?? null,
      };
    })
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));

  if (matches.length === 0) return null;

  const hasLive = matches.some((m) => m.phase === "live");

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={15} className="text-brand" />
        <h2 className="font-display text-lg font-semibold">{t.worldCup.todayTitle}</h2>
        <span className="rounded-sm bg-brand/10 px-1.5 py-0.5 font-mono text-[11px] text-brand">
          {matches.length}
        </span>
        {hasLive && (
          <>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-won" />
            {/* Refreshes every 5 min — openfootball updates after matches end */}
            <LiveRefresher intervalMs={300_000} />
          </>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        {matches.map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 ${
              i > 0 ? "border-t border-hair" : ""
            }`}
          >
            {/* Round */}
            <span className="w-16 shrink-0 text-center font-mono text-[10px] uppercase tracking-wider text-faint">
              {m.roundLabel}
            </span>

            {/* Teams + score */}
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <span className="flex-1 truncate text-right text-sm font-medium text-fg">{m.homeTeam}</span>

              {m.phase === "ns" ? (
                <span className="shrink-0 font-mono text-[10px] text-faint">vs</span>
              ) : (
                <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-fg">
                  {m.homeScore ?? "?"} – {m.awayScore ?? "?"}
                </span>
              )}

              <span className="flex-1 truncate text-left text-sm font-medium text-fg">{m.awayTeam}</span>
            </div>

            {/* Status / time */}
            <div className="w-20 shrink-0 text-right">
              {m.phase === "live" && (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-won" />
                  <span className="font-mono text-xs font-semibold text-won">LIVE</span>
                </div>
              )}
              {m.phase === "done" && (
                <span className="font-mono text-xs text-faint">FT</span>
              )}
              {m.phase === "ns" && (
                <div>
                  <div className="font-mono text-xs font-semibold text-brand">
                    <LocalTime iso={m.kickoffUtc} />
                  </div>
                  <div className="font-mono text-[10px] capitalize text-faint">{m.city.toLowerCase()}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
