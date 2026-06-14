"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusBadge, STATUS_META } from "@/components/ui/StatusBadge";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import type { ActionState } from "@/app/actions/auth";
import type { OddsFormat, Pick, PickStatus, PickType } from "@/lib/types";
import { PICK_TYPE_LABELS } from "@/lib/types";
import { profitOnWin, potentialReturn } from "@/lib/odds";
import { formatMoney, formatOdds } from "@/lib/format";
import { cn } from "@/lib/utils";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface PickFormProps {
  action: FormAction;
  events: { id: string; name: string }[];
  defaultEventId?: string;
  pick?: Pick;
  submitLabel?: string;
}

const STATUSES: PickStatus[] = ["pending", "won", "lost", "push"];

export function PickForm({ action, events, defaultEventId, pick, submitLabel }: PickFormProps) {
  const prefs = usePrefs();
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {});

  const [stake, setStake] = useState(pick ? String(pick.stake) : "");
  const [odds, setOdds] = useState(pick ? String(pick.odds) : "");
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(pick?.odds_format ?? prefs.oddsFormat);
  const [status, setStatus] = useState<PickStatus>(pick?.status ?? "pending");

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const profit = profitOnWin(stakeNum, oddsNum, oddsFormat);
  const total = potentialReturn(stakeNum, oddsNum, oddsFormat);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Field label="Event" htmlFor="event_id" error={fe.event_id}>
          <Select id="event_id" name="event_id" defaultValue={defaultEventId ?? pick?.event_id ?? ""} required>
            <option value="" disabled>
              {t.pickForm.selectEvent}
            </option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.pickForm.match} htmlFor="match_name" error={fe.match_name}>
            <Input id="match_name" name="match_name" placeholder={t.pickForm.matchPlaceholder} defaultValue={pick?.match_name} required />
          </Field>
          <Field label={t.pickForm.selection} htmlFor="selection" error={fe.selection}>
            <Input id="selection" name="selection" placeholder={t.pickForm.selectionPlaceholder} defaultValue={pick?.selection} required />
          </Field>
        </div>

        <Field label={t.pickForm.pickType} htmlFor="pick_type" error={fe.pick_type}>
          <Select id="pick_type" name="pick_type" defaultValue={pick?.pick_type ?? "moneyline"}>
            {(Object.keys(PICK_TYPE_LABELS) as PickType[]).map((pt) => (
              <option key={pt} value={pt}>
                {t.pickTypes[pt]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.pickForm.stakeLabel} htmlFor="stake" error={fe.stake}>
            <Input
              id="stake"
              name="stake"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="100"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="font-mono"
              required
            />
          </Field>
          <Field
            label={t.pickForm.odds}
            htmlFor="odds"
            error={fe.odds}
            hint={
              <div className="mb-1.5 inline-flex rounded-lg border border-hair p-0.5">
                {(["american", "decimal"] as OddsFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setOddsFormat(f)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase transition",
                      oddsFormat === f ? "bg-brand text-base" : "text-muted hover:text-fg",
                    )}
                  >
                    {f === "american" ? "US" : "Dec"}
                  </button>
                ))}
              </div>
            }
          >
            <Input
              id="odds"
              name="odds"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder={oddsFormat === "american" ? "-110" : "1.91"}
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              className="font-mono"
              required
            />
            <input type="hidden" name="odds_format" value={oddsFormat} />
          </Field>
        </div>

        <Field label={t.pickForm.statusLabel}>
          <div className="grid grid-cols-4 gap-2">
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-xl border py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.97]",
                    active ? "border-transparent text-base" : "border-hair text-muted hover:border-hair-strong",
                  )}
                  style={active ? { background: m.color } : undefined}
                >
                  {t.status[s]}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="status" value={status} />
        </Field>

        <Field label={t.pickForm.notes} htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" placeholder={t.pickForm.notesPlaceholder} defaultValue={pick?.notes ?? ""} />
        </Field>

        {state.error && <p className="text-sm text-lost">{state.error}</p>}
      </div>

      {/* Live ticket */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-hair bg-base-2/60 px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-widest text-faint">{t.pickForm.liveTicket}</span>
            <StatusBadge status={status} />
          </div>
          <div className="space-y-4 p-5">
            <TicketRow label={t.pickForm.odds} value={oddsNum ? formatOdds(oddsNum, oddsFormat) : "—"} />
            <TicketRow label={t.pickForm.stakeLabel} value={stakeNum ? formatMoney(stakeNum, prefs.currency) : "—"} />
            <div className="border-t border-hair pt-4">
              <div className="text-xs uppercase tracking-wider text-muted">{t.pickForm.potentialProfit}</div>
              <motion.div
                key={profit}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 font-mono text-3xl font-semibold text-brand"
              >
                {formatMoney(profit, prefs.currency, { sign: profit > 0 })}
              </motion.div>
              <div className="mt-1 text-sm text-faint">
                {t.pickForm.totalReturn}{" "}
                <span className="font-mono text-fg">{formatMoney(total, prefs.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="mt-4 w-full">
          {isPending ? t.common.saving : (submitLabel ?? t.pickForm.savePick)}
        </Button>
      </div>
    </form>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-sm font-medium">{value}</span>
    </div>
  );
}
