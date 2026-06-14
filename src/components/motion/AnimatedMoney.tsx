"use client";

import { CountUp } from "@/components/motion/CountUp";
import { usePrefs } from "@/components/app/UserPrefs";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Count-up money figure that formats with the user's currency on the client. */
export function AnimatedMoney({
  value,
  sign = false,
  className,
}: {
  value: number;
  sign?: boolean;
  className?: string;
}) {
  const { currency } = usePrefs();
  return (
    <CountUp
      value={value}
      format={(n) => formatMoney(n, currency, { sign: sign && n > 0 })}
      className={cn(className)}
    />
  );
}
