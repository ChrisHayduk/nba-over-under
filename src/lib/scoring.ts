import { TEAMS, type Team } from "@/data/teams";
import type { TeamRecord } from "@/lib/espn";
import type { Picks, Side } from "@/lib/seasons";

export const GAMES_PER_SEASON = 82;

export type TeamStatus = {
  team: Team;
  line: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  /** Win pace over 82 games (the actual total once the season is over); null before tip-off. */
  projected: number | null;
  /** Which side of the line the team is pacing toward. */
  trending: Side | null;
  /** The side that's mathematically locked in, if any. */
  clinched: Side | null;
  overPicks: number;
  underPicks: number;
};

export type ScoredPick = {
  team: TeamStatus;
  side: Side;
  status: "hit" | "miss" | "pending";
  /** True once the outcome can no longer change. */
  decided: boolean;
  /** Projected wins past the line in this pick's favor (negative = losing). */
  cushion: number | null;
};

export type Standing = {
  name: string;
  picks: ScoredPick[];
  hits: number;
  misses: number;
  pending: number;
  /** Hits that can no longer be lost. */
  locked: number;
  avgCushion: number | null;
  rank: number;
  payout: number;
};

export type Entry = { name: string; picks: Picks };

const clinchedSide = (wins: number, losses: number, line: number): Side | null => {
  if (wins > line) return "over";
  if (GAMES_PER_SEASON - losses < line) return "under";
  return null;
};

export function scoreTeams(
  lines: Record<string, number>,
  records: Map<string, TeamRecord>,
  entries: Entry[]
): TeamStatus[] {
  return TEAMS.map((team) => {
    const line = lines[team.abbr];
    const { wins, losses } = records.get(team.abbr) ?? { wins: 0, losses: 0 };
    const gamesPlayed = wins + losses;
    const projected = gamesPlayed > 0 ? (wins / gamesPlayed) * GAMES_PER_SEASON : null;
    const clinched = clinchedSide(wins, losses, line);
    const trending = clinched ?? (projected === null ? null : projected > line ? "over" : "under");
    const sides = entries.map((entry) => entry.picks[team.abbr]);

    return {
      team,
      line,
      wins,
      losses,
      gamesPlayed,
      projected,
      trending,
      clinched,
      overPicks: sides.filter((side) => side === "over").length,
      underPicks: sides.filter((side) => side === "under").length
    };
  });
}

export function scoreEntries(teams: TeamStatus[], entries: Entry[], payouts: number[]): Standing[] {
  const standings = entries.map((entry) => {
    const picks: ScoredPick[] = teams
      .filter((status) => entry.picks[status.team.abbr])
      .map((status) => {
        const side = entry.picks[status.team.abbr];
        const sign = side === "over" ? 1 : -1;
        return {
          team: status,
          side,
          status: status.trending === null ? "pending" : status.trending === side ? "hit" : "miss",
          decided: status.clinched !== null,
          cushion: status.projected === null ? null : (status.projected - status.line) * sign
        };
      });

    const cushions = picks.map((pick) => pick.cushion).filter((value): value is number => value !== null);

    return {
      name: entry.name,
      picks,
      hits: picks.filter((pick) => pick.status === "hit").length,
      misses: picks.filter((pick) => pick.status === "miss").length,
      pending: picks.filter((pick) => pick.status === "pending").length,
      locked: picks.filter((pick) => pick.status === "hit" && pick.decided).length,
      avgCushion: cushions.length ? cushions.reduce((sum, value) => sum + value, 0) / cushions.length : null,
      rank: 0,
      payout: 0
    };
  });

  // Same tiebreak the league has always used: hits, then cushion (to 2 decimals), then name.
  const cushionKey = (standing: Standing) => Math.round((standing.avgCushion ?? 0) * 100);
  standings.sort(
    (a, b) => b.hits - a.hits || cushionKey(b) - cushionKey(a) || a.name.localeCompare(b.name)
  );

  const started = teams.some((status) => status.gamesPlayed > 0);
  standings.forEach((standing, index) => {
    standing.rank = index + 1;
    standing.payout = started ? (payouts[index] ?? 0) : 0;
  });

  return standings;
}
