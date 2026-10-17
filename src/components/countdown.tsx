"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNow } from "@/hooks/use-now";

const UNITS = [
  { label: "days", ms: 86_400_000 },
  { label: "hrs", ms: 3_600_000 },
  { label: "min", ms: 60_000 },
  { label: "sec", ms: 1_000 }
];

/** Ticking countdown to `target`; refreshes the page once it passes so locked content appears. */
export function Countdown({ target }: { target: string }) {
  const router = useRouter();
  const now = useNow(1000);
  const remaining = now === null ? null : Math.max(0, Date.parse(target) - now);

  useEffect(() => {
    if (remaining === 0) router.refresh();
  }, [remaining, router]);

  const parts = UNITS.map((unit, index) => {
    const larger = UNITS[index - 1]?.ms ?? Infinity;
    return { ...unit, value: Math.floor(((remaining ?? 0) % larger) / unit.ms) };
  });

  return (
    <div className="flex gap-2" role="timer" aria-label="Time until picks lock">
      {parts.map((part) => (
        <div key={part.label} className="w-16 rounded-xl border border-line bg-surface py-2 text-center">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {remaining === null ? "–" : String(part.value).padStart(2, "0")}
          </p>
          <p className="text-[0.7rem] text-muted">{part.label}</p>
        </div>
      ))}
    </div>
  );
}
