import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-brand text-base glow-brand">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 16.5L8.5 11l3.5 3.5L21 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16 6h5v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showWord && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Picks<span className="text-brand">Record</span>
        </span>
      )}
    </span>
  );
}
