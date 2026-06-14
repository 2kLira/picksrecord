"use client";

import { cn } from "@/lib/utils";
import type { PickStatus } from "@/lib/types";
import { useT } from "@/components/i18n/I18nProvider";

export const STATUS_META: Record<
  PickStatus,
  { label: string; color: string; text: string; bg: string; dot: string }
> = {
  won: { label: "Won", color: "var(--color-won)", text: "text-won", bg: "bg-won/10", dot: "bg-won" },
  lost: { label: "Lost", color: "var(--color-lost)", text: "text-lost", bg: "bg-lost/10", dot: "bg-lost" },
  pending: {
    label: "Pending",
    color: "var(--color-pending)",
    text: "text-pending",
    bg: "bg-pending/10",
    dot: "bg-pending",
  },
  push: { label: "Push", color: "var(--color-push)", text: "text-push", bg: "bg-push/10", dot: "bg-push" },
};

export function StatusBadge({ status, className }: { status: PickStatus; className?: string }) {
  const meta = STATUS_META[status];
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {t.status[status]}
    </span>
  );
}
