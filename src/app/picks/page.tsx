import type { Metadata } from "next";
import Link from "next/link";
import { PickForm } from "@/components/pick-form";
import { TEAMS } from "@/data/teams";
import { CURRENT_SEASON, SEASONS, isLocked, seasonLabel, type ArchivedSeason } from "@/lib/seasons";
import { formatEastern } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Make your picks · NBA Over/Under League" };

export default async function PicksPage() {
  const season = CURRENT_SEASON;

  if (isLocked(season)) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm font-medium text-accent">{seasonLabel(season)} season</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Picks are locked</h1>
        <p className="mt-3 text-muted">The season has tipped off, so picks can&apos;t be changed anymore.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-5 py-2.5 font-medium text-bg">
          See the leaderboard
        </Link>
      </div>
    );
  }

  const lastSeason = SEASONS.find((other): other is ArchivedSeason => other.status === "final");

  return (
    <PickForm
      seasonLabel={seasonLabel(season)}
      lockLabel={`${formatEastern(season.lockAt, { weekday: "short", month: "short", day: "numeric" })} at ${formatEastern(season.lockAt, { hour: "numeric", minute: "2-digit" })} ET`}
      draftKey={`ou-draft-${season.id}`}
      teams={TEAMS.map((team) => ({
        ...team,
        line: season.lines[team.abbr],
        lastWins: lastSeason?.finalRecords[team.abbr]?.[0] ?? null
      }))}
    />
  );
}
