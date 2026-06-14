"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { EventWithStats } from "@/lib/types";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import { formatMoney, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EventCard({ event, index = 0 }: { event: EventWithStats; index?: number }) {
  const { currency } = usePrefs();
  const t = useT();
  const { stats } = event;
  const profitTone = stats.profit > 0 ? "text-won" : stats.profit < 0 ? "text-lost" : "text-push";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/events/${event.id}`} className="card group relative block overflow-hidden p-5">
        <div className="absolute inset-y-0 left-0 w-1" style={{ background: event.color }} />
        <div
          className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
          style={{ background: event.color }}
        />
        <div className="relative pl-2">
          <div className="flex items-start justify-between">
            <div>
              <span
                className="inline-block rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ background: `${event.color}22`, color: event.color }}
              >
                {event.sport}
              </span>
              <h3 className="mt-2.5 font-display text-lg font-semibold leading-tight">{event.name}</h3>
            </div>
            <ArrowUpRight size={18} className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">{t.events.profitLoss}</div>
              <div className={cn("mt-0.5 font-mono text-xl font-semibold", profitTone)}>
                {formatMoney(stats.profit, currency, { sign: stats.profit > 0 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted">{t.events.roi}</div>
              <div className={cn("mt-0.5 font-mono text-xl font-semibold", profitTone)}>
                {formatPercent(stats.roi)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-hair pt-3 font-mono text-xs text-faint">
            <span className="text-won">{stats.won}W</span>
            <span className="text-lost">{stats.lost}L</span>
            <span className="text-pending">{stats.pending}P</span>
            {stats.push > 0 && <span className="text-push">{stats.push} push</span>}
            <span className="ml-auto">{stats.total} picks</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
