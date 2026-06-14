"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SPORTS } from "@/lib/types";
import type { ActionState } from "@/app/actions/auth";
import type { SportEvent } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const SWATCHES = ["#46e6a4", "#2fd6c4", "#5b8cff", "#a472ff", "#ff6b6b", "#ffc24b", "#ff8e5b", "#f062c0"];

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function EventForm({
  action,
  event,
  submitLabel,
}: {
  action: FormAction;
  event?: SportEvent;
  submitLabel?: string;
}) {
  const t = useT();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {});
  const [color, setColor] = useState(event?.color ?? SWATCHES[0]);
  const [name, setName] = useState(event?.name ?? "");
  const [sport, setSport] = useState(event?.sport ?? SPORTS[0]);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Field label={t.eventForm.name} htmlFor="name" error={fe.name}>
          <Input
            id="name"
            name="name"
            placeholder={t.eventForm.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label={t.eventForm.sport} htmlFor="sport" error={fe.sport}>
          <Select id="sport" name="sport" value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.eventForm.description} htmlFor="description" error={fe.description}>
          <Textarea id="description" name="description" placeholder={t.eventForm.descriptionPlaceholder} defaultValue={event?.description ?? ""} />
        </Field>

        <Field label={t.eventForm.date} htmlFor="event_date" error={fe.event_date}>
          <Input id="event_date" name="event_date" type="date" defaultValue={event?.event_date ?? ""} className="font-mono" />
        </Field>

        <Field label={t.eventForm.accent}>
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Use ${c}`}
                className={cn(
                  "h-9 w-9 rounded-full transition",
                  color === c ? "ring-2 ring-offset-2 ring-offset-base scale-110" : "hover:scale-105",
                )}
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
          <input type="hidden" name="color" value={color} />
        </Field>

        {state.error && <p className="text-sm text-lost">{state.error}</p>}
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="text-xs uppercase tracking-wider text-muted">{t.common.preview}</div>
        <div className="card relative mt-2 overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: color }} />
          <div
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
            style={{ background: color, opacity: 0.18 }}
          />
          <div className="relative">
            <span
              className="inline-block rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ background: `${color}22`, color }}
            >
              {sport}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold">{name || t.eventForm.yourEvent}</h3>
            <p className="mt-1 text-sm text-faint">{t.eventForm.picksTracked}</p>
          </div>
        </div>
        <Button type="submit" size="lg" disabled={isPending} className="mt-4 w-full">
          {isPending ? t.common.saving : (submitLabel ?? t.eventForm.create)}
        </Button>
      </div>
    </form>
  );
}
