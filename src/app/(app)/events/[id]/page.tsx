import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Calendar } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { getEvent, getPicksForEvent } from "@/lib/queries";
import { computeStats, buildEquityCurve } from "@/lib/stats";
import { formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { EquityChart } from "@/components/charts/EquityChart";
import { EventPicksSection } from "@/components/EventPicksSection";
import { Reveal } from "@/components/motion/Reveal";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getT();
  const event = await getEvent(user.id, id);
  if (!event) notFound();

  const picks = await getPicksForEvent(user.id, id);
  const stats = computeStats(picks);
  const equity = buildEquityCurve(picks);

  const record = [
    { label: "W", count: stats.won, color: "var(--color-won)" },
    { label: "L", count: stats.lost, color: "var(--color-lost)" },
    { label: "P", count: stats.pending, color: "var(--color-pending)" },
    { label: "Push", count: stats.push, color: "var(--color-push)" },
  ];

  return (
    <div>
      <Link href="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft size={16} /> {t.nav.events}
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-1.5 h-12 w-1.5 rounded-full" style={{ background: event.color }} />
          <div>
            <span
              className="inline-block rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ background: `${event.color}22`, color: event.color }}
            >
              {event.sport}
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{event.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-faint">
              {event.event_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(event.event_date)}
                </span>
              )}
              {event.description && <span>{event.description}</span>}
            </div>
          </div>
        </div>
        <Link
          href={`/events/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-hair px-4 py-2.5 text-sm font-medium transition hover:bg-surface"
        >
          <Pencil size={15} /> {t.common.edit}
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.eventDetail.profitLoss} value={stats.profit} kind="moneySigned" tone={stats.profit > 0 ? "pos" : stats.profit < 0 ? "neg" : "default"} delay={0.05} />
        <StatCard label={t.eventDetail.roi} value={stats.roi} kind="percent" tone={stats.roi >= 0 ? "pos" : "neg"} delay={0.1} />
        <StatCard label={t.eventDetail.winRate} value={stats.winRate} kind="percent" tone="brand" delay={0.15} />
        <StatCard label={t.eventDetail.totalPicks} value={stats.total} delay={0.2} />
      </div>

      {/* Record + equity */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <div className="card h-full p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-muted">{t.eventDetail.record}</div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {record.map((r) => (
                <div key={r.label} className="text-center">
                  <div className="font-mono text-2xl font-semibold" style={{ color: r.color }}>
                    {r.count}
                  </div>
                  <div className="mt-1 text-xs text-faint">{r.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-base-2">
              <div className="flex h-full">
                {record
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <div key={r.label} style={{ background: r.color, flex: r.count }} />
                  ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card h-full p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wider text-muted">{t.eventDetail.equityCurve}</div>
            </div>
            <div className="mt-4">
              <EquityChart points={equity} color={event.color} height={180} />
            </div>
          </div>
        </Reveal>
      </div>

      <EventPicksSection picks={picks} eventId={id} />
    </div>
  );
}
