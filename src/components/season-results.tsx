import { Leaderboard } from "@/components/leaderboard";
import { TeamBoard } from "@/components/team-board";
import { Notice, SectionHeading, Stat } from "@/components/ui";
import { GAMES_PER_SEASON, type Standing, type TeamStatus } from "@/lib/scoring";
import { type Season, seasonLabel } from "@/lib/seasons";
import { formatCurrency, formatEastern } from "@/lib/utils";

type Props = {
  season: Season;
  standings: Standing[];
  teams: TeamStatus[];
  /** When the records were fetched (live seasons only). */
  updatedAt?: string;
  recordsError?: boolean;
};

const TOTAL_GAMES = (30 * GAMES_PER_SEASON) / 2;

/** Leaderboard + team board for a season whose picks are locked. */
export function SeasonResults({ season, standings, teams, updatedAt, recordsError }: Props) {
  const final = season.status === "final";
  const leader = standings[0];
  const gamesPlayed = teams.reduce((sum, status) => sum + status.gamesPlayed, 0) / 2;
  const pot = season.payouts.reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm font-medium text-accent">
          {seasonLabel(season)} season · {final ? "Final" : "Live"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {!leader
            ? "No picks this season"
            : final
              ? `${leader.name} won it`
              : gamesPlayed === 0
                ? "Picks are locked in"
                : `${leader.name} leads`}
        </h1>
        {leader && (
          <p className="mt-2 text-muted">
            {final
              ? `${leader.hits} of ${leader.picks.length} picks correct.`
              : gamesPlayed === 0
                ? "The leaderboard starts moving after the first games."
                : `${leader.hits} of ${leader.picks.length} picks on track to cash.`}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Players" value={standings.length} />
          <Stat
            label="Games played"
            value={Math.round(gamesPlayed)}
            detail={`of ${TOTAL_GAMES}`}
          />
          <Stat label="Pot" value={formatCurrency(pot)} detail={season.payouts.map((p) => formatCurrency(p)).join(" · ")} />
          <Stat
            label={final ? "Season" : "Updated"}
            value={final ? "Final" : updatedAt ? formatEastern(updatedAt, { hour: "numeric", minute: "2-digit" }) : "—"}
            detail={final ? "Regular season complete" : "Eastern time"}
          />
        </div>

        {recordsError && (
          <div className="mt-4">
            <Notice tone="warning">Couldn&apos;t reach ESPN for the latest records. Showing picks without results for now.</Notice>
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          title="Leaderboard"
          description={
            final
              ? "Ranked by correct picks, then average cushion. Tap a player to see their picks."
              : "Ranked by picks on pace to cash, then average cushion. Tap a player to see their picks."
          }
        />
        <Leaderboard standings={standings} final={final} />
        <p className="mt-3 text-xs text-muted">
          Cushion is how many wins a team is {final ? "finished" : "pacing"} past its line in the direction you picked, averaged across your
          picks.{" "}
          {!final && "Final means the result can't change anymore."}
        </p>
      </section>

      <section>
        <SectionHeading
          id="teams"
          title="Teams"
          description={final ? "Final win totals against the line." : "Win pace over 82 games against the line."}
        />
        <TeamBoard teams={teams} final={final} showPicks={standings.length > 0} />
      </section>
    </div>
  );
}
