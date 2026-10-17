import "server-only";
import { listEntries } from "@/lib/db";
import { fetchRecords, type TeamRecord } from "@/lib/espn";
import { scoreEntries, scoreTeams } from "@/lib/scoring";
import type { ArchivedSeason, LiveSeason } from "@/lib/seasons";

export function loadArchivedSeason(season: ArchivedSeason) {
  const records = new Map<string, TeamRecord>(
    Object.entries(season.finalRecords).map(([abbr, [wins, losses]]) => [abbr, { wins, losses }])
  );
  const teams = scoreTeams(season.lines, records, season.entries);
  return { teams, standings: scoreEntries(teams, season.entries, season.payouts) };
}

/** Scores a locked live season against the latest ESPN records. */
export async function loadLiveSeason(season: LiveSeason) {
  const [entries, records] = await Promise.all([
    listEntries(season.id),
    fetchRecords(season.endYear).catch((error: unknown) => {
      console.error(error);
      return null;
    })
  ]);
  const teams = scoreTeams(season.lines, records ?? new Map(), entries);
  return {
    teams,
    standings: scoreEntries(teams, entries, season.payouts),
    updatedAt: new Date().toISOString(),
    recordsError: records === null
  };
}
