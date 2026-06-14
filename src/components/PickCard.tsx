"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Pencil, Trash2, CircleDot } from "lucide-react";
import type { Pick } from "@/lib/types";
import { formatMoney, formatOdds } from "@/lib/format";
import { STATUS_META } from "@/components/ui/StatusBadge";
import { SettlePickDialog } from "@/components/SettlePickDialog";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import { deletePickAction } from "@/app/actions/picks";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function PickCard({ pick, index = 0 }: { pick: Pick; index?: number }) {
  const { currency } = usePrefs();
  const t = useT();
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const prevStatus = useRef(pick.status);

  const meta = STATUS_META[pick.status];
  const settled = pick.status !== "pending";

  // Distinct, satisfying reaction whenever a result lands (quick toggle or settle dialog).
  useEffect(() => {
    if (prevStatus.current === pick.status) return;
    prevStatus.current = pick.status;
    if (pick.status === "pending") return;

    setFlash(meta.color);
    const timer = setTimeout(() => setFlash(null), 650);

    if (!reduce) {
      if (pick.status === "won") {
        controls.start({ scale: [1, 1.025, 1], transition: { duration: 0.45, ease: EASE_OUT } });
      } else if (pick.status === "lost") {
        controls.start({ x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.4, ease: "easeOut" } });
      } else {
        controls.start({ opacity: [1, 0.6, 1], transition: { duration: 0.4, ease: "easeOut" } });
      }
    }
    return () => clearTimeout(timer);
  }, [pick.status, meta.color, controls, reduce]);

  function remove() {
    setRemoving(true);
    startTransition(async () => {
      await deletePickAction(pick.id);
    });
  }

  return (
    <>
      <AnimatePresence>
        {!removing && (
          <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(2px)", transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, delay: index * 0.04, ease: EASE_OUT }}
            className="card group relative overflow-hidden"
          >
            <motion.div animate={controls} className="relative">
              {/* status spine */}
              <span className="absolute inset-y-0 left-0 z-10 w-1" style={{ background: meta.color }} />

              {/* result flash */}
              <AnimatePresence>
                {flash && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{ background: flash }}
                    initial={{ opacity: 0.22 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              <div className="p-5 pl-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {t.pickTypes[pick.pick_type]}
                    </span>
                    <h3 className="mt-2 truncate font-display text-base font-semibold">{pick.match_name}</h3>
                    <p className="truncate text-sm text-muted">{pick.selection}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold tabular-nums">
                      {formatOdds(pick.odds, pick.odds_format)}
                    </div>
                    <div className="text-xs text-faint">
                      {formatMoney(pick.stake, currency)} {t.common.stake}
                    </div>
                  </div>
                </div>

                {pick.notes && <p className="mt-3 line-clamp-2 text-sm text-faint">{pick.notes}</p>}

                <div className="mt-4 flex items-center justify-between border-t border-hair pt-3">
                  <div>
                    {settled ? (
                      <span
                        className={cn(
                          "font-mono text-base font-semibold",
                          pick.profit > 0 ? "text-won" : pick.profit < 0 ? "text-lost" : "text-push",
                        )}
                      >
                        {formatMoney(pick.profit, currency, { sign: true })}
                      </span>
                    ) : (
                      <span className="font-mono text-base font-semibold text-pending">
                        {formatMoney(pick.potential_return, currency)}{" "}
                        <span className="text-xs font-normal text-faint">{t.common.toReturn}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/picks/${pick.id}/edit`}
                      className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors duration-150 hover:bg-elevated hover:text-fg"
                      aria-label={t.common.edit}
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={remove}
                      disabled={isPending}
                      className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors duration-150 hover:bg-lost/15 hover:text-lost active:scale-[0.97]"
                      aria-label={t.common.delete}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* settle action */}
                <button
                  onClick={() => setSettleOpen(true)}
                  className={cn(
                    "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98]",
                    settled
                      ? "border-hair text-muted hover:border-hair-strong hover:text-fg"
                      : "border-brand/40 bg-brand/10 text-brand hover:bg-brand/15",
                  )}
                >
                  <CircleDot size={15} />
                  {settled ? `${t.settle.button} · ${t.status[pick.status]}` : t.settle.button}
                </button>
              </div>
            </motion.div>
          </motion.article>
        )}
      </AnimatePresence>

      <SettlePickDialog pick={pick} open={settleOpen} onClose={() => setSettleOpen(false)} />
    </>
  );
}
