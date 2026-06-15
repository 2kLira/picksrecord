import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { fetchAllMatches, computeAllGroups } from "@/lib/worldcup";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Trophy } from "lucide-react";

function GDCell({ gd }: { gd: number }) {
  if (gd > 0) return <span className="text-won">+{gd}</span>;
  if (gd < 0) return <span className="text-lost">{gd}</span>;
  return <span className="text-faint">0</span>;
}

export default async function StandingsPage() {
  await requireUser();
  const t = await getT();
  const matches = await fetchAllMatches();
  const groups = computeAllGroups(matches);

  return (
    <div>
      <PageHeader
        eyebrow={t.worldCup.standingsEyebrow}
        title={t.worldCup.standingsTitle}
        subtitle={t.worldCup.standingsSubtitle}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g, gi) => (
          <Reveal key={g.name} delay={gi * 0.035}>
            <div className="card overflow-hidden p-0">
              {/* Group header */}
              <div className="flex items-center gap-2 border-b border-hair px-4 py-2.5">
                <Trophy size={12} className="text-brand" />
                <span className="eyebrow">{g.name}</span>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hair">
                    <th className="w-5 py-1.5 pl-4 text-left font-mono text-[9px] uppercase tracking-wider text-faint">#</th>
                    <th className="py-1.5 pl-2 text-left font-mono text-[9px] uppercase tracking-wider text-faint">
                      {t.worldCup.colTeam}
                    </th>
                    {(["P","W","D","L","GF","GA","GD","Pts"] as const).map((h) => (
                      <th key={h} className="py-1.5 pr-3 text-right font-mono text-[9px] uppercase tracking-wider text-faint last:pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.standings.map((s, i) => (
                    <tr
                      key={s.team}
                      className={`border-b border-hair last:border-0 transition-colors hover:bg-surface-2 ${
                        i < 2 ? "border-l-[2px] border-l-brand" : "border-l-[2px] border-l-transparent"
                      }`}
                    >
                      <td className="py-2 pl-3 font-mono text-xs tabular-nums text-faint">{i + 1}</td>
                      <td className="max-w-[100px] truncate py-2 pl-2 pr-2 text-xs font-medium text-fg">{s.team}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.played}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.won}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.drawn}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.lost}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.gf}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-muted">{s.ga}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums"><GDCell gd={s.gd} /></td>
                      <td className="py-2 pr-4 text-right font-mono text-xs font-bold tabular-nums text-fg">{s.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
