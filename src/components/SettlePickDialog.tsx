"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Pick, PickStatus } from "@/lib/types";
import { CURRENCY_SYMBOLS } from "@/lib/types";
import { profitOnWin } from "@/lib/odds";
import { formatMoney } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { STATUS_META } from "@/components/ui/StatusBadge";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import { settlePickAction } from "@/app/actions/picks";
import { cn } from "@/lib/utils";

const RESULTS: PickStatus[] = ["won", "lost", "push"];

export function SettlePickDialog({
  pick,
  open,
  onClose,
}: {
  pick: Pick;
  open: boolean;
  onClose: () => void;
}) {
  const { currency } = usePrefs();
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const computedWin = profitOnWin(pick.stake, pick.odds, pick.odds_format);
  const [result, setResult] = useState<PickStatus>(pick.status === "pending" ? "won" : pick.status);
  const [amount, setAmount] = useState(
    pick.status === "won" ? String(pick.profit) : String(computedWin),
  );

  const realized = result === "won" ? parseFloat(amount) || 0 : result === "lost" ? -pick.stake : 0;

  function confirm() {
    startTransition(async () => {
      await settlePickAction(pick.id, result, result === "won" ? parseFloat(amount) || 0 : undefined);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="settle-title">
      <div>
        <h2 id="settle-title" className="font-display text-xl font-semibold tracking-tight">
          {t.settle.title}
        </h2>
        <p className="mt-1 truncate text-sm text-muted">{pick.match_name}</p>

        {/* result selector */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {RESULTS.map((s) => {
            const meta = STATUS_META[s];
            const active = result === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setResult(s)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border py-4 transition-colors duration-150 active:scale-[0.97]",
                  active ? "border-transparent" : "border-hair text-muted hover:border-hair-strong",
                )}
                style={active ? { background: `${meta.color}1a`, borderColor: meta.color } : undefined}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                <span className="text-sm font-medium" style={active ? { color: meta.color } : undefined}>
                  {t.status[s]}
                </span>
                {active && (
                  <motion.span
                    layoutId="settle-result"
                    className="absolute inset-0 rounded-xl ring-1"
                    style={{ ["--tw-ring-color" as string]: meta.color }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* amount won — only for a win */}
        {result === "won" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <label htmlFor="settle-amount" className="mb-1.5 mt-5 block text-xs font-medium uppercase tracking-wider text-muted">
              {t.settle.amountWon}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <input
                id="settle-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="h-12 w-full rounded-xl border border-hair bg-base-2 pl-9 pr-4 font-mono text-lg text-fg focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <p className="mt-2 text-xs text-faint">
              {t.settle.computedHint} <span className="font-mono">{formatMoney(computedWin, currency, { sign: true })}</span>
            </p>
          </motion.div>
        )}

        {/* realized preview */}
        <div className="mt-5 flex items-center justify-between border-t border-hair pt-4">
          <span className="text-sm text-muted">{t.settle.realized}</span>
          <motion.span
            key={`${result}-${realized}`}
            initial={{ opacity: 0.4, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "font-mono text-xl font-semibold",
              realized > 0 ? "text-won" : realized < 0 ? "text-lost" : "text-push",
            )}
          >
            {formatMoney(realized, currency, { sign: realized > 0 })}
          </motion.span>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isPending}>
            {t.settle.cancel}
          </Button>
          <Button onClick={confirm} className="flex-1" disabled={isPending}>
            <Check size={16} /> {isPending ? t.settle.settling : t.settle.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
