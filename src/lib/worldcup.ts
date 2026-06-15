import "server-only";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OFMatch {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  score?: { ft: [number, number]; ht?: [number, number] };
  goals1?: Array<{ name: string; minute: string }>;
  goals2?: Array<{ name: string; minute: string }>;
  group?: string; // "Group A"…"Group L", undefined for knockout
  ground: string;
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface GroupTable {
  name: string;   // "Group A"
  letter: string; // "A"
  standings: GroupStanding[];
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchAllMatches(): Promise<OFMatch[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json",
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data: { matches: OFMatch[] } = await res.json();
    return data.matches ?? [];
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse openfootball time "13:00 UTC-6" → ISO 8601 UTC string. */
export function parseKickoffUtc(date: string, time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s+UTC([+-]\d+)$/);
  if (!m) return `${date}T12:00:00Z`;
  const utcH = parseInt(m[1]) - parseInt(m[3]);
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(utcH, parseInt(m[2]), 0, 0);
  return d.toISOString();
}

/** True if the team name is a real team (not a placeholder like "1A", "W3"). */
function isRealTeam(name: string) {
  return !/^(\d|[WL])/.test(name);
}

// ─── Standings ────────────────────────────────────────────────────────────────

export function computeAllGroups(matches: OFMatch[]): GroupTable[] {
  // Collect all real team names per group from all fixtures
  const groupTeams = new Map<string, Set<string>>();
  for (const m of matches) {
    if (!m.group) continue;
    if (!groupTeams.has(m.group)) groupTeams.set(m.group, new Set());
    if (isRealTeam(m.team1)) groupTeams.get(m.group)!.add(m.team1);
    if (isRealTeam(m.team2)) groupTeams.get(m.group)!.add(m.team2);
  }

  const tables: GroupTable[] = [];

  for (const groupName of [...groupTeams.keys()].sort()) {
    const teamMap = new Map<string, GroupStanding>();

    for (const team of groupTeams.get(groupName)!) {
      teamMap.set(team, { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    }

    for (const m of matches) {
      if (m.group !== groupName || !m.score?.ft) continue;
      const [g1, g2] = m.score.ft;
      const t1 = teamMap.get(m.team1);
      const t2 = teamMap.get(m.team2);
      if (!t1 || !t2) continue;

      t1.played++; t2.played++;
      t1.gf += g1; t1.ga += g2; t1.gd = t1.gf - t1.ga;
      t2.gf += g2; t2.ga += g1; t2.gd = t2.gf - t2.ga;

      if (g1 > g2)      { t1.won++; t1.pts += 3; t2.lost++; }
      else if (g1 < g2) { t2.won++; t2.pts += 3; t1.lost++; }
      else               { t1.drawn++; t1.pts++; t2.drawn++; t2.pts++; }
    }

    const standings = [...teamMap.values()].sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team),
    );

    tables.push({ name: groupName, letter: groupName.replace("Group ", ""), standings });
  }

  return tables;
}
