"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { Counter } from "@/components/motion/Counter";
import { usePrefs } from "@/components/app/UserPrefs";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Kind = "money" | "moneySigned" | "percent" | "int";

interface StatCardProps {
  label: string;
  value: number;
  kind?: Kind;
  prefix?: string;
  suffix?: string;
  sub?: string;
  tone?: "default" | "pos" | "neg" | "brand";
  icon?: React.ReactNode;
  delay?: number;
}

const toneClass = {
  default: "text-fg",
  pos: "text-won",
  neg: "text-lost",
  brand: "text-brand",
};

export function StatCard({
  label,
  value,
  kind = "int",
  prefix = "",
  suffix = "",
  sub,
  tone = "default",
  icon,
  delay = 0,
}: StatCardProps) {
  const { currency } = usePrefs();
  const isMoney = kind === "money" || kind === "moneySigned";

  const formatMoneyVal = (n: number) =>
    kind === "moneySigned" ? formatMoney(n, currency, { sign: n > 0 }) : formatMoney(n, currency);

  // Non-money values roll on odometer-style digits (React Bits Counter).
  const rounded = Math.round(value);
  const negative = rounded < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      data-no-tilt
      className="card group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
        {icon && <span className="text-faint">{icon}</span>}
      </div>
      <div className={cn("mt-3 font-mono text-3xl font-semibold tracking-tight", toneClass[tone])}>
        {isMoney ? (
          <CountUp value={value} format={formatMoneyVal} />
        ) : (
          <span className="inline-flex items-baseline gap-0.5">
            {prefix && <span>{prefix}</span>}
            {negative && <span>-</span>}
            <Counter value={Math.abs(rounded)} fontSize={30} fontWeight={600} gap={1} />
            {kind === "percent" && <span>%</span>}
            {suffix && <span>{suffix}</span>}
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-faint">{sub}</div>}
    </motion.div>
  );
}
