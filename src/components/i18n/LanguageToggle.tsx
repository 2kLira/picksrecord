"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { en: "EN", es: "ES" };

/** Segmented EN/ES switch. Persists in a cookie and refreshes the server tree. */
export function LanguageToggle({ className }: { className?: string }) {
  const router = useRouter();
  const current = useLocale();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    if (locale === current) return;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className={cn("inline-flex rounded-lg border border-hair p-0.5", isPending && "opacity-60", className)}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={current === l}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
            current === l ? "bg-elevated text-fg" : "text-faint hover:text-muted",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
