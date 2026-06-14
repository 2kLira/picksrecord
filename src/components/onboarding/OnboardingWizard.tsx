"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { completeOnboardingAction } from "@/app/actions/profile";
import { SPORTS, type Currency, type OddsFormat } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "MXN", "CAD", "BRL"];

export function OnboardingWizard({
  defaultName,
  defaultOdds,
  defaultCurrency,
}: {
  defaultName: string;
  defaultOdds: OddsFormat;
  defaultCurrency: Currency;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState(defaultName);
  const [odds, setOdds] = useState<OddsFormat>(defaultOdds);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [sports, setSports] = useState<string[]>([]);
  const t = useT();

  const steps = [t.onboarding.steps.you, t.onboarding.steps.odds, t.onboarding.steps.currency, t.onboarding.steps.sports];
  const last = steps.length - 1;

  const next = () => {
    setDir(1);
    setStep((s) => Math.min(s + 1, last));
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleSport = (s: string) =>
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const canNext = step === 0 ? name.trim().length > 0 : true;

  return (
    <div className="w-full max-w-lg">
      {/* progress */}
      <div className="mb-10 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-brand" : "bg-hair",
              )}
            />
          </div>
        ))}
      </div>

      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <Step title={t.onboarding.nameTitle} subtitle={t.onboarding.nameSubtitle}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className="text-lg" autoFocus />
              </Step>
            )}

            {step === 1 && (
              <Step title={t.onboarding.oddsTitle} subtitle={t.onboarding.oddsSubtitle}>
                <div className="grid gap-3">
                  {(["american", "decimal"] as OddsFormat[]).map((f) => (
                    <SelectableRow
                      key={f}
                      active={odds === f}
                      onClick={() => setOdds(f)}
                      title={f === "american" ? t.onboarding.american : t.onboarding.decimal}
                      hint={f === "american" ? "−110 · +150" : "1.91 · 2.50"}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step title={t.onboarding.currencyTitle} subtitle={t.onboarding.currencySubtitle}>
                <div className="grid grid-cols-3 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        "rounded-xl border py-3 font-mono text-sm font-medium transition",
                        currency === c ? "border-brand bg-brand/10 text-brand" : "border-hair text-muted hover:border-hair-strong",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step title={t.onboarding.sportsTitle} subtitle={t.onboarding.sportsSubtitle}>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map((s) => {
                    const active = sports.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSport(s)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition",
                          active ? "border-brand bg-brand/10 text-brand" : "border-hair text-muted hover:border-hair-strong",
                        )}
                      >
                        {active && <Check size={14} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-muted transition hover:text-fg",
            step === 0 && "invisible",
          )}
        >
          <ArrowLeft size={16} /> {t.common.back}
        </button>

        {step < last ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-6 py-2.5 text-sm font-semibold text-base transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          >
            {t.common.continue} <ArrowRight size={16} />
          </button>
        ) : (
          <form action={completeOnboardingAction}>
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="preferred_odds_format" value={odds} />
            <input type="hidden" name="currency" value={currency} />
            {sports.map((s) => (
              <input key={s} type="hidden" name="favorite_sports" value={s} />
            ))}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-6 py-2.5 text-sm font-semibold text-base transition hover:brightness-110 active:scale-[0.98]"
            >
              {t.onboarding.finish} <Check size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SelectableRow({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition",
        active ? "border-brand bg-brand/10" : "border-hair hover:border-hair-strong",
      )}
    >
      <span className="font-medium">{title}</span>
      <span className="font-mono text-sm text-faint">{hint}</span>
    </button>
  );
}
