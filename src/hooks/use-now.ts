"use client";

import { useSyncExternalStore } from "react";

/**
 * Current time in ms, refreshed every `intervalMs`. Returns null during server
 * rendering and hydration so time-dependent UI never mismatches.
 */
export function useNow(intervalMs = 30_000): number | null {
  return useSyncExternalStore(
    (onChange) => {
      const id = window.setInterval(onChange, intervalMs);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null
  );
}
