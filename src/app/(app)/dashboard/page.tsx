import Link from "next/link";
import { Plus, Trophy, Flame, TrendingUp, Target, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEventsWithStats, getPicksForUser } from "@/lib/queries";
import { computeStats, buildEquityCurve, currentStreak } from "@/lib/stats";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/StatCard";
import { EquityChart } from "@/components/charts/EquityChart";
import { EventCard } from "@/components/EventCard";
import { PickRow } from "@/components/PickRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedMoney } from "@/components/motion/AnimatedMoney";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getT();
  const [picks, events] = await Promise.all([getPicksForUser(user.id), getEventsWithStats(user.id)]);

  const stats = computeStats(picks);
  const equity = buildEquityCurve(picks);
  const streak = currentStreak(picks);
  const recent = picks.slice(0, 6);
  const activeEvents = events.slice(0, 4);
  const firstName = user.name.split(" ")[0];

  if (picks.length === 0 && events.length === 0) {
    return (
      <div>
        <PageHeader eyebrow={t.dashboard.eyebrow} title={t.dashboard.welcome(firstName)} subtitle={t.dashboard.emptySubtitle} />
        <EmptyState
          icon={<Trophy size={26} />}
          title={t.dashboard.createFirstTitle}
          body={t.dashboard.createFirstBody}
          action={
            <Link href="/events/new">
              <Button>
                <Plus size={16} /> {t.common.newEvent}
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.welcomeBack(firstName)}
        subtitle={t.dashboard.subtitle}
        action={
          <Link href="/picks/new">
            <Button>
              <Plus size={16} /> {t.common.newPick}
            </Button>
          </Link>
        }
      />

      {/* Hero equity */}
      <Reveal className="mb-6">
        <div className="card relative overflow-hidden p-6">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted">{t.dashboard.netPl}</div>
              <AnimatedMoney
                value={stats.profit}
                sign
                className={`mt-1 block font-mono text-4xl font-semibold tracking-tight sm:text-5xl ${
                  stats.profit > 0 ? "text-won" : stats.profit < 0 ? "text-lost" : "text-fg"
                }`}
              />
              <div className="mt-1 font-mono text-sm text-faint">
                {t.dashboard.stakedAcross(formatMoney(stats.staked, user.currency), stats.total)}
              </div>
            </div>
            <div className="flex gap-6 font-mono">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">{t.dashboard.roi}</div>
                <div className={`text-xl font-semibold ${stats.roi >= 0 ? "text-won" : "text-lost"}`}>
                  {stats.roi.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">{t.dashboard.winRate}</div>
                <div className="text-xl font-semibold text-fg">{stats.winRate.toFixed(0)}%</div>
              </div>
            </div>
          </div>
          <div className="relative mt-6">
            <EquityChart points={equity} height={200} />
          </div>
        </div>
      </Reveal>

      {/* Stat grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.dashboard.roi} value={stats.roi} kind="percent" tone={stats.roi >= 0 ? "pos" : "neg"} icon={<TrendingUp size={16} />} delay={0.05} />
        <StatCard label={t.dashboard.winRate} value={stats.winRate} kind="percent" tone="brand" icon={<Target size={16} />} delay={0.1} />
        <StatCard
          label={t.dashboard.currentStreak}
          value={streak.count}
          prefix={streak.type ?? ""}
          tone={streak.type === "W" ? "pos" : streak.type === "L" ? "neg" : "default"}
          icon={<Flame size={16} />}
          sub={streak.type === "W" ? t.dashboard.onHeater : streak.type === "L" ? t.dashboard.coldStretch : t.dashboard.noSettled}
          delay={0.15}
        />
        <StatCard label={t.dashboard.pending} value={stats.pending} tone="default" icon={<Clock size={16} />} sub={t.dashboard.awaitingResult} delay={0.2} />
      </div>

      {/* W / L / Push counts */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label={t.dashboard.won} value={stats.won} tone="pos" delay={0.05} />
        <StatCard label={t.dashboard.lost} value={stats.lost} tone="neg" delay={0.1} />
        <StatCard label={t.dashboard.push} value={stats.push} tone="default" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent picks */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t.dashboard.recentPicks}</h2>
          </div>
          {recent.length > 0 ? (
            <div className="card p-2">
              {recent.map((p, i) => (
                <PickRow key={p.id} pick={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Plus size={24} />}
              title={t.dashboard.noPicksTitle}
              body={t.dashboard.noPicksBody}
              action={
                <Link href="/picks/new">
                  <Button size="sm">{t.common.newPick}</Button>
                </Link>
              }
            />
          )}
        </section>

        {/* Active events */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t.dashboard.activeEvents}</h2>
            <Link href="/events" className="text-sm text-brand hover:underline">
              {t.common.viewAll}
            </Link>
          </div>
          {activeEvents.length > 0 ? (
            <div className="grid gap-4">
              {activeEvents.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy size={24} />}
              title={t.dashboard.noEventsTitle}
              body={t.dashboard.noEventsBody}
              action={
                <Link href="/events/new">
                  <Button size="sm">{t.common.newEvent}</Button>
                </Link>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
