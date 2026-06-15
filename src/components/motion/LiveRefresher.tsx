"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Calls router.refresh() every intervalMs to re-run server components and pull fresh live scores. */
export function LiveRefresher({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
