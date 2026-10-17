import { SEASON_2025_26 } from "@/data/seasons/2025-26";
import { SEASON_2026_27 } from "@/data/seasons/2026-27";

export type Side = "over" | "under";

/** Picks keyed by team abbreviation. */
export type Picks = Record<string, Side>;

type SeasonBase = {
  /** e.g. "2026-27" */
  id: string;
  /** ESPN identifies seasons by the calendar year they end in. */
  endYear: number;
  /** Buy-in per player; the pot is entryFee × players. */
  entryFee: number;
  /** FanDuel win total per team abbreviation. */
  lines: Record<string, number>;
};

/** A season whose picks live in the database and whose records come from ESPN. */
export type LiveSeason = SeasonBase & {
  status: "live";
  /** ISO timestamp when picks lock and become visible to everyone. */
  lockAt: string;
  /** Fraction of the pot paid to 1st, 2nd, 3rd... */
  payoutShares: number[];
};

/** A finished season frozen into the repo. */
export type ArchivedSeason = SeasonBase & {
  status: "final";
  /** Prize money actually paid to 1st, 2nd, 3rd... */
  payouts: number[];
  finalRecords: Record<string, [wins: number, losses: number]>;
  entries: { name: string; picks: Picks }[];
};

export type Season = LiveSeason | ArchivedSeason;

/** Newest first. */
export const SEASONS: Season[] = [SEASON_2026_27, SEASON_2025_26];

export const CURRENT_SEASON = SEASON_2026_27;

export const getSeason = (id: string) => SEASONS.find((season) => season.id === id);

export const seasonLabel = (season: Season) => season.id.replace("-", "–");

/**
 * Prize money by place. Live seasons split entryFee × entrants by payoutShares,
 * rounding the lower places to the nearest $5 and giving 1st the remainder.
 */
export function seasonPayouts(season: Season, entrants: number): number[] {
  if (season.status === "final") return season.payouts;
  const pot = season.entryFee * entrants;
  const lower = season.payoutShares.slice(1).map((share) => Math.round((pot * share) / 5) * 5);
  return [pot - lower.reduce((sum, value) => sum + value, 0), ...lower];
}

export const isLocked = (season: LiveSeason, now = Date.now()) => now >= Date.parse(season.lockAt);
