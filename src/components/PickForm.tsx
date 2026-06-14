"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Field, Input, Select, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusBadge, STATUS_META } from "@/components/ui/StatusBadge";
import { usePrefs } from "@/components/app/UserPrefs";
import { useT } from "@/components/i18n/I18nProvider";
import type { ActionState } from "@/app/actions/auth";
import type { OddsFormat, Pick, PickStatus, PickType } from "@/lib/types";
import { PICK_TYPE_LABELS } from "@/lib/types";
import { combineParlayOdds, profitOnWin, potentialReturn } from "@/lib/odds";
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

interface LegRow {
  selection: string;
  odds: string;
}

const STATUSES: PickStatus[] = ["pending", "won", "lost", "push"];

function FormatToggle({ value, onChange }: { value: OddsFormat; onChange: (f: OddsFormat) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-hair p-0.5">
      {(["american", "decimal"] as OddsFormat[]).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase transition",
            value === f ? "bg-brand text-base" : "text-muted hover:text-fg",
          )}
        >
          {f === "american" ? "US" : "Dec"}
        </button>
      ))}
    </div>
  );
}

export function PickForm({ action, events, defaultEventId, pick, submitLabel }: PickFormProps) {
  const prefs = usePrefs();
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {});

  const [pickType, setPickType] = useState<PickType>(pick?.pick_type ?? "moneyline");
  const [stake, setStake] = useState(pick ? String(pick.stake) : "");
  const [odds, setOdds] = useState(pick ? String(pick.odds) : "");
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(pick?.odds_format ?? prefs.oddsFormat);
  const [status, setStatus] = useState<PickStatus>(pick?.status ?? "pending");
  const [legs, setLegs] = useState<LegRow[]>(() =>
    pick?.legs && pick.legs.length > 0
      ? pick.legs.map((l) => ({ selection: l.selection, odds: String(l.odds) }))
      : [
          { selection: "", odds: "" },
          { selection: "", odds: "" },
        ],
  );

  const isParlay = pickType === "parlay";

  function changePickType(value: PickType) {
    setPickType(value);
    if (value === "parlay" && legs.length < 2) {
      setLegs((prev) => [...prev, ...Array.from({ length: 2 - prev.length }, () => ({ selection: "", odds: "" }))]);
    }
  }

  function updateLeg(i: number, field: keyof LegRow, value: string) {
    setLegs((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }
  function addLeg() {
    setLegs((prev) => [...prev, { selection: "", odds: "" }]);
  }
  function removeLeg(i: number) {
    setLegs((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  // Cleaned legs ready to submit / price.
  const legsPayload = legs
    .map((l) => ({ selection: l.selection.trim(), odds: parseFloat(l.odds) }))
    .filter((l) => l.selection.length > 0 && Number.isFinite(l.odds) && l.odds !== 0);

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const combinedOdds = combineParlayOdds(
    legsPayload.map((l) => l.odds),
    oddsFormat,
  );
  const effectiveOdds = isParlay ? combinedOdds : oddsNum;
  const profit = profitOnWin(stakeNum, effectiveOdds, oddsFormat);
  const total = potentialReturn(stakeNum, effectiveOdds, oddsFormat);

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

        <Field label={t.pickForm.pickType} htmlFor="pick_type" error={fe.pick_type}>
          <Select
            id="pick_type"
            name="pick_type"
            value={pickType}
            onChange={(e) => changePickType(e.target.value as PickType)}
          >
            {(Object.keys(PICK_TYPE_LABELS) as PickType[]).map((pt) => (
              <option key={pt} value={pt}>
                {t.pickTypes[pt]}
              </option>
            ))}
          </Select>
        </Field>

        <div className={cn("grid gap-4", !isParlay && "sm:grid-cols-2")}>
          <Field
            label={isParlay ? t.pickForm.parlayName : t.pickForm.match}
            htmlFor="match_name"
            error={fe.match_name}
          >
            <Input
              id="match_name"
              name="match_name"
              placeholder={isParlay ? t.pickForm.parlayNamePlaceholder : t.pickForm.matchPlaceholder}
              defaultValue={pick?.match_name}
              required
            />
          </Field>
          {!isParlay && (
            <Field label={t.pickForm.selection} htmlFor="selection" error={fe.selection}>
              <Input
                id="selection"
                name="selection"
                placeholder={t.pickForm.selectionPlaceholder}
                defaultValue={pick?.selection}
                required
              />
            </Field>
          )}
        </div>

        {isParlay ? (
          <div className="rounded-2xl border border-hair bg-base-2/40 p-4">
            <div className="flex items-center justify-between">
              <Label>{t.pickForm.parlayLegs}</Label>
              <FormatToggle value={oddsFormat} onChange={setOddsFormat} />
            </div>
            <p className="-mt-1 mb-3 text-xs text-faint">{t.pickForm.parlayHint}</p>

            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {legs.map((leg, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span className="grid h-11 w-7 flex-none place-items-center font-mono text-xs text-faint">
                      {i + 1}
                    </span>
                    <Input
                      aria-label={t.pickForm.legLabel(i + 1)}
                      placeholder={t.pickForm.legSelectionPlaceholder}
                      value={leg.selection}
                      onChange={(e) => updateLeg(i, "selection", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      aria-label={`${t.pickForm.legLabel(i + 1)} — ${t.pickForm.odds}`}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      placeholder={oddsFormat === "american" ? "-110" : "1.91"}
                      value={leg.odds}
                      onChange={(e) => updateLeg(i, "odds", e.target.value)}
                      className="w-24 flex-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeLeg(i)}
                      disabled={legs.length <= 2}
                      aria-label={t.pickForm.removeLeg}
                      className="grid h-9 w-9 flex-none place-items-center rounded-lg text-faint transition-colors duration-150 hover:bg-lost/15 hover:text-lost disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-faint"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={addLeg}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:border-hair-strong hover:text-fg active:scale-[0.98]"
            >
              <Plus size={15} /> {t.pickForm.addLeg}
            </button>

            {combinedOdds > 0 && (
              <div className="mt-3 flex items-center justify-between border-t border-hair pt-3 text-sm">
                <span className="text-muted">{t.pickForm.combinedOdds}</span>
                <span className="font-mono font-semibold text-brand">{formatOdds(combinedOdds, oddsFormat)}</span>
              </div>
            )}
            {fe.legs && <p className="mt-2 text-xs text-lost">{fe.legs}</p>}

            {/* Server-authoritative fields derived from the legs. */}
            <input type="hidden" name="legs" value={JSON.stringify(legsPayload)} />
            <input type="hidden" name="selection" value={legsPayload.map((l) => l.selection).join(" + ")} />
            <input type="hidden" name="odds" value={combinedOdds || ""} />
          </div>
        ) : null}

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
          {!isParlay && (
            <Field
              label={t.pickForm.odds}
              htmlFor="odds"
              error={fe.odds}
              hint={
                <div className="mb-1.5">
                  <FormatToggle value={oddsFormat} onChange={setOddsFormat} />
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
            </Field>
          )}
        </div>

        {/* odds_format is shared by single picks and every parlay leg. */}
        <input type="hidden" name="odds_format" value={oddsFormat} />

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
            {isParlay && (
              <TicketRow label={t.pickForm.parlayLegs} value={legsPayload.length ? `${legsPayload.length}` : "—"} />
            )}
            <TicketRow
              label={isParlay ? t.pickForm.combinedOdds : t.pickForm.odds}
              value={effectiveOdds ? formatOdds(effectiveOdds, oddsFormat) : "—"}
            />
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
