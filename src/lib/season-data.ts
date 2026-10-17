import "server-only";
import { listEntries } from "@/lib/db";
import { fetchRecords, type TeamRecord } from "@/lib/espn";
import { scoreEntries, scoreTeams } from "@/lib/scoring";
import { seasonPayouts, type ArchivedSeason, type LiveSeason } from "@/lib/seasons";

export function loadArchivedSeason(season: ArchivedSeason) {
  const records = new Map<string, TeamRecord>(
    Object.entries(season.finalRecords).map(([abbr, [wins, losses]]) => [abbr, { wins, losses }])
  );
  const teams = scoreTeams(season.lines, records, season.entries);
  const payouts = seasonPayouts(season, season.entries.length);
  return { teams, payouts, standings: scoreEntries(teams, season.entries, payouts) };
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
  const payouts = seasonPayouts(season, entries.length);
  return {
    teams,
    payouts,
    standings: scoreEntries(teams, entries, payouts),
    updatedAt: new Date().toISOString(),
    recordsError: records === null
  };
}
