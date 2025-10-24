import { cache } from "react";
import { defaultSeasonEndYear, fetchNbaStandings, TeamRecord } from "@/lib/espn";
import {
  HARDCODED_PARTICIPANTS,
  HardcodedParticipant,
  HardcodedPick,
  UNMATCHED_WORKBOOKS
} from "@/data/participants";
import { TEAM_LINES, type TeamLine } from "@/data/team-lines";

export type ProjectedPick = HardcodedPick & {
  overUnder?: number;
  projectedWins?: number;
  projectedResult: "over" | "under" | "push" | "unknown";
  delta?: number;
  status: "hit" | "miss" | "unknown";
  teamRecord?: TeamRecord;
};

export type LeaderboardEntry = {
  name: string;
  file?: string;
  picks: ProjectedPick[];
  total: number;
  onTrack: number;
  avgMargin: number;
  missingFile: boolean;
  payout: number;
  rank: number;
};

export type LeagueSnapshot = {
  generatedAt: string;
  seasonEndYear: number;
  leaderboard: LeaderboardEntry[];
  unmatchedFiles: string[];
};

const PROJECTION_TOLERANCE = 0.25;

const normalizeTeamKey = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

const TEAM_LINE_LOOKUP = new Map<string, TeamLine>(
  TEAM_LINES.map((line) => [normalizeTeamKey(line.teamName), line])
);

const projectPick = (
  pick: HardcodedPick,
  line: TeamLine | undefined,
  record: TeamRecord | undefined
): ProjectedPick => {
  if (!line || !record) {
    return {
      ...pick,
      overUnder: line?.overUnder,
      projectedResult: "unknown",
      status: "unknown"
    };
  }

  const overUnder = line.overUnder;
  const projectedWins = Math.floor(record.winPct * 82);
  const delta = projectedWins - overUnder;
  const magnitude = Math.abs(delta);

  let projectedResult: "over" | "under" | "push";
  if (magnitude <= PROJECTION_TOLERANCE) {
    projectedResult = "push";
  } else {
    projectedResult = delta > 0 ? "over" : "under";
  }

  const status: "hit" | "miss" | "unknown" =
    projectedResult === "push" ? "unknown" : projectedResult === pick.pick ? "hit" : "miss";

  return {
    ...pick,
    overUnder,
    projectedWins,
    delta,
    projectedResult,
    status,
    teamRecord: record
  };
};

const enrichParticipant = (
  participant: HardcodedParticipant,
  lookup: Map<string, TeamRecord>
): LeaderboardEntry => {
  const projected = participant.picks.map((pick) => {
    const teamKey = normalizeTeamKey(pick.teamName);
    return projectPick(pick, TEAM_LINE_LOOKUP.get(teamKey), lookup.get(teamKey));
  });

  const total = projected.length;
  const onTrack = projected.filter((pick) => pick.status === "hit").length;
  const marginSamples = projected
    .map((pick) => {
      if (typeof pick.delta !== "number") return null;
      return pick.pick === "over" ? pick.delta : -pick.delta;
    })
    .filter((value): value is number => typeof value === "number");
  const avgMargin = marginSamples.length
    ? Number(
        (
          marginSamples.reduce((total, value) => total + value, 0) / marginSamples.length
        ).toFixed(2)
      )
    : 0;

  return {
    name: participant.name,
    file: participant.workbook ?? undefined,
    picks: projected,
    total,
    onTrack,
    avgMargin,
    missingFile: !participant.workbook,
    payout: 0,
    rank: 0
  };
};

const payoutByRank = [150, 70, 20];

export const getLeagueSnapshot = cache(async (): Promise<LeagueSnapshot> => {
  const standings = await fetchNbaStandings();

  const lookup = new Map<string, TeamRecord>(
    standings.map((team) => [normalizeTeamKey(team.team), team])
  );

  const leaderboard = HARDCODED_PARTICIPANTS.map((participant) =>
    enrichParticipant(participant, lookup)
  );

  const sorted = leaderboard
    .sort((a, b) => {
      if (b.onTrack !== a.onTrack) return b.onTrack - a.onTrack;
      if (b.avgMargin !== a.avgMargin) return b.avgMargin - a.avgMargin;
      return a.name.localeCompare(b.name);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      payout: payoutByRank[index] ?? 0
    }));

  return {
    generatedAt: new Date().toISOString(),
    seasonEndYear: defaultSeasonEndYear(),
    leaderboard: sorted,
    unmatchedFiles: UNMATCHED_WORKBOOKS
  };
});
