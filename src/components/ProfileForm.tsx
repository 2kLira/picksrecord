"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/app/actions/profile";
import type { ActionState } from "@/app/actions/auth";
import type { Currency, OddsFormat, User } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "MXN", "CAD", "BRL"];

export function ProfileForm({ user }: { user: User }) {
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateProfileAction, {});
  const [odds, setOdds] = useState<OddsFormat>(user.preferred_odds_format);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t.profile.displayName} htmlFor="name" error={fe.name}>
        <Input id="name" name="name" defaultValue={user.name} required />
      </Field>

      <Field label={t.profile.oddsFormat}>
        <div className="grid grid-cols-2 gap-2">
          {(["american", "decimal"] as OddsFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setOdds(f)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium capitalize transition",
                odds === f ? "border-brand bg-brand/10 text-brand" : "border-hair text-muted hover:border-hair-strong",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input type="hidden" name="preferred_odds_format" value={odds} />
      </Field>

      <Field label={t.profile.currency} htmlFor="currency">
        <Select id="currency" name="currency" defaultValue={user.currency}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? t.common.saving : t.common.saveChanges}
        </Button>
        <AnimatePresence>
          {state.success && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-sm text-won"
            >
              <Check size={16} /> {t.common.saved}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
