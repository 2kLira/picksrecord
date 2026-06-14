"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Pick } from "@/lib/types";
import { formatMoney, formatOdds, relativeTime } from "@/lib/format";
import { STATUS_META } from "@/components/ui/StatusBadge";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function PickRow({ pick, index = 0 }: { pick: Pick; index?: number }) {
  const { currency } = usePrefs();
  const t = useT();
  const meta = STATUS_META[pick.status];
  const settled = pick.status !== "pending";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/picks/${pick.id}/edit`}
        className="flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-hair hover:bg-surface/60"
      >
        <span className="h-9 w-1 rounded-full" style={{ background: meta.color }} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{pick.match_name}</div>
          <div className="truncate text-xs text-faint">
            {pick.selection} · {t.pickTypes[pick.pick_type]} · {relativeTime(pick.created_at)}
          </div>
        </div>
        <div className="hidden font-mono text-sm text-muted sm:block">{formatOdds(pick.odds, pick.odds_format)}</div>
        <div
          className={cn(
            "w-24 text-right font-mono text-sm font-semibold",
            settled
              ? pick.profit > 0
                ? "text-won"
                : pick.profit < 0
                  ? "text-lost"
                  : "text-push"
              : "text-pending",
          )}
        >
          {settled
            ? formatMoney(pick.profit, currency, { sign: pick.profit > 0 })
            : formatMoney(pick.potential_return, currency)}
        </div>
      </Link>
    </motion.div>
  );
}
