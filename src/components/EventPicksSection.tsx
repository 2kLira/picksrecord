"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import type { Pick, PickStatus, PickType } from "@/lib/types";
import { PICK_TYPE_LABELS } from "@/lib/types";
import { PickCard } from "@/components/PickCard";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: (PickStatus | "all")[] = ["all", "pending", "won", "lost", "push"];

export function EventPicksSection({ picks, eventId }: { picks: Pick[]; eventId: string }) {
  const t = useT();
  const [status, setStatus] = useState<PickStatus | "all">("all");
  const [type, setType] = useState<PickType | "all">("all");

  const filtered = picks.filter(
    (p) => (status === "all" || p.status === status) && (type === "all" || p.pick_type === type),
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{t.eventDetail.picks}</h2>
        <Link href={`/picks/new?event=${eventId}`}>
          <Button size="sm">
            <Plus size={15} /> {t.common.addPick}
          </Button>
        </Link>
      </div>

      {picks.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <FilterChip key={f} active={status === f} onClick={() => setStatus(f)}>
                {f === "all" ? t.common.all : t.status[f]}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={13} className="text-faint" />
            <FilterChip active={type === "all"} onClick={() => setType("all")}>
              {t.eventDetail.allTypes}
            </FilterChip>
            {(Object.keys(PICK_TYPE_LABELS) as PickType[]).map((pt) => (
              <FilterChip key={pt} active={type === pt} onClick={() => setType(pt)}>
                {t.pickTypes[pt]}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <AnimatedList
          items={filtered}
          getKey={(p) => p.id}
          maxHeight={640}
          renderItem={(p, i) => <PickCard pick={p} index={i} entrance={false} />}
        />
      ) : picks.length === 0 ? (
        <EmptyState
          icon={<Plus size={24} />}
          title={t.eventDetail.noPicksTitle}
          body={t.eventDetail.noPicksBody}
          action={
            <Link href={`/picks/new?event=${eventId}`}>
              <Button size="sm">
                <Plus size={15} /> {t.common.addPick}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="card px-6 py-12 text-center text-sm text-muted">{t.eventDetail.noMatch}</div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active ? "border-brand bg-brand/10 text-brand" : "border-hair text-muted hover:border-hair-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
