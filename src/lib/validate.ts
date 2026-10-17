import { TEAMS } from "@/data/teams";
import type { Picks } from "@/lib/seasons";

export const PIN_PATTERN = /^\d{4,8}$/;
export const MAX_NAME_LENGTH = 40;

export const cleanName = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH) : "";

export const isValidPin = (value: unknown): value is string => typeof value === "string" && PIN_PATTERN.test(value);

/** Returns the picks if they cover every team exactly once, otherwise null. */
export function parsePicks(value: unknown): Picks | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const picks: Picks = {};
  for (const team of TEAMS) {
    const side = raw[team.abbr];
    if (side !== "over" && side !== "under") return null;
    picks[team.abbr] = side;
  }
  return Object.keys(raw).length === TEAMS.length ? picks : null;
}
