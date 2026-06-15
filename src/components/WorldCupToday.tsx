import { Trophy } from "lucide-react";
import { getT } from "@/lib/i18n-server";
import type { Dict } from "@/lib/i18n";
import { LiveRefresher } from "@/components/motion/LiveRefresher";

// ─── API-Football types ───────────────────────────────────────────────────────

interface AFFixture {
  fixture: {
    id: number;
    date: string; // ISO with tz offset
    status: { short: string; elapsed: number | null };
    venue: { name: string | null; city: string | null };
  };
  league: { round: string };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: { home: number | null; away: number | null };
}

// ─── Fallback: TheStatsAPI static fixture ─────────────────────────────────────

interface TSAFixture {
  matchNumber: number;
  date: string;
  kickoffUtc: string;
  stage: string;
  group: string | null;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  hostCity: string;
}

// ─── Unified shape ────────────────────────────────────────────────────────────

interface TodayMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffUtc: string;
  roundLabel: string; // already localised
  city: string;
  /** live | ht | done | ns */
  phase: "live" | "ht" | "done" | "ns";
  homeScore: number | null;
  awayScore: number | null;
  elapsed: number | null;
  statusText: string; // "45'", "HT", "FT", "AET", "PEN"
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const LIVE_SET = new Set(["1H", "2H", "ET", "P", "LIVE", "INT"]);
const BREAK_SET = new Set(["HT", "BT"]);
const DONE_SET = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

function toPhase(short: string): TodayMatch["phase"] {
  if (LIVE_SET.has(short)) return "live";
  if (BREAK_SET.has(short)) return "ht";
  if (DONE_SET.has(short)) return "done";
  return "ns";
}

function toStatusText(short: string, elapsed: number | null): string {
  if (short === "HT" || short === "BT") return "HT";
  if (short === "FT") return "FT";
  if (short === "AET") return "AET";
  if (short === "PEN") return "PEN";
  if (elapsed != null) return `${elapsed}'`;
  return short;
}

// ─── Round label ──────────────────────────────────────────────────────────────

function roundLabel(raw: string, group: string | null, t: Dict): string {
  const r = raw.toLowerCase();
  if (r.includes("group")) {
    return group ? `${t.worldCup.group} ${group}` : t.worldCup.group;
  }
  if (r.includes("32")) return t.worldCup.roundOf32;
  if (r.includes("16")) return t.worldCup.roundOf16;
  if (r.includes("quarter")) return t.worldCup.quarterFinal;
  if (r.includes("semi")) return t.worldCup.semiFinal;
  if (r.includes("third") || r.includes("3rd") || r.includes("place")) return t.worldCup.thirdPlace;
  if (r.includes("final")) return t.worldCup.final;
  return raw;
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fromApiFootball(today: string, t: Dict): Promise<TodayMatch[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}`,
      {
        headers: { "x-apisports-key": key },
        // Revalidate every 60 s — API-Football free tier = 100 req/day.
        // ~60 calls per match hour; adjust up if you hit rate limits.
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const data: { response: AFFixture[] } = await res.json();
    return (data.response ?? []).map((f): TodayMatch => {
      const short = f.fixture.status.short;
      return {
        id: String(f.fixture.id),
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        kickoffUtc: f.fixture.date,
        roundLabel: roundLabel(f.league.round, null, t),
        city: f.fixture.venue.city ?? "",
        phase: toPhase(short),
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        elapsed: f.fixture.status.elapsed,
        statusText: toStatusText(short, f.fixture.status.elapsed),
      };
    });
  } catch {
    return [];
  }
}

async function fromStatsApi(today: string, t: Dict): Promise<TodayMatch[]> {
  try {
    const res = await fetch("https://www.thestatsapi.com/world-cup/data/fixtures.json", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: { fixtures: TSAFixture[] } = await res.json();
    return data.fixtures
      .filter((f) => f.date === today)
      .map((f): TodayMatch => ({
        id: String(f.matchNumber),
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        kickoffUtc: f.kickoffUtc,
        roundLabel: roundLabel(f.stage, f.group, t),
        city: f.hostCity.replace(/-/g, " "),
        phase: "ns",
        homeScore: null,
        awayScore: null,
        elapsed: null,
        statusText: "",
      }));
  } catch {
    return [];
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export async function WorldCupToday() {
  const t = await getT();
  const today = new Date().toISOString().slice(0, 10);

  const afMatches = await fromApiFootball(today, t);
  const matches = afMatches.length > 0 ? afMatches : await fromStatsApi(today, t);

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
            <LiveRefresher intervalMs={60_000} />
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
                  {m.homeScore ?? 0} – {m.awayScore ?? 0}
                </span>
              )}

              <span className="flex-1 truncate text-left text-sm font-medium text-fg">{m.awayTeam}</span>
            </div>

            {/* Status */}
            <div className="w-20 shrink-0 text-right">
              {m.phase === "live" && (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-won" />
                  <span className="font-mono text-xs font-semibold text-won">{m.statusText}</span>
                </div>
              )}
              {m.phase === "ht" && (
                <span className="font-mono text-xs font-semibold text-pending">{m.statusText}</span>
              )}
              {m.phase === "done" && (
                <span className="font-mono text-xs text-faint">{m.statusText}</span>
              )}
              {m.phase === "ns" && (
                <div>
                  <div className="font-mono text-xs font-semibold text-brand">
                    {fmtKickoff(m.kickoffUtc)} UTC
                  </div>
                  <div className="font-mono text-[10px] capitalize text-faint">{m.city}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
