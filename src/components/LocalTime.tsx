"use client";

import { useState, useEffect } from "react";

/** Renders kickoff time in the user's local timezone. SSR renders UTC to avoid hydration mismatch. */
export function LocalTime({ iso }: { iso: string }) {
  const utcFallback =
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }) + " UTC";

  const [display, setDisplay] = useState(utcFallback);

  useEffect(() => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tz =
      new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
        .formatToParts(d)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    setDisplay(`${time}${tz ? ` ${tz}` : ""}`);
  }, [iso]);

  return <>{display}</>;
}
