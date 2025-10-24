import { getLeagueSnapshot } from "@/lib/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { ParticipantCard } from "@/components/participant-card";
import { slugify } from "@/lib/utils";

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York"
  }).format(new Date(value));

const seasonLabel = (seasonEndYear: number) => `${seasonEndYear - 1}-${String(seasonEndYear).slice(-2)}`;

export default async function Page() {
  const snapshot = await getLeagueSnapshot();
  const waitingOnFiles = snapshot.leaderboard.filter((entry) => entry.missingFile);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10">
      <header className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/30 via-purple-600/20 to-slate-900/60 p-8 shadow-[0_30px_80px_rgba(15,27,49,0.7)]">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Season {seasonLabel(snapshot.seasonEndYear)}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">NBA O/U Leaderboard</h1>
          <p className="mt-4 max-w-3xl text-base text-white/70">
            Live standings that blend everyone&apos;s Fanduel numbers with ESPN&apos;s latest records so you know which win totals
            are pacing to cash.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="rounded-full border border-white/20 px-3 py-1">
              Pot: $150 / $70 / $20 payouts
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1">
              Updated {formatTimestamp(snapshot.generatedAt)} ET
            </span>
          </div>
        </div>

        {(waitingOnFiles.length > 0 || snapshot.unmatchedFiles.length > 0) && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {waitingOnFiles.length > 0 && (
              <p>
                Missing workbooks for: {waitingOnFiles.map((entry) => entry.name).join(", ")}.
              </p>
            )}
            {snapshot.unmatchedFiles.length > 0 && (
              <p className="mt-1">
                Unclaimed files: {snapshot.unmatchedFiles.join(", ")} – rename them with initials so we can auto-map.
              </p>
            )}
          </div>
        )}
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Leaderboard</h2>
            <p className="text-sm text-white/60">Sorted by projected hits, then average cushion over the line.</p>
          </div>
        </div>
        <LeaderboardTable entries={snapshot.leaderboard} />
        <p className="text-xs text-white/40">
          Avg margin = average projected cushion per pick (projection minus FanDuel line, aligned to each player&apos;s over/under choice).
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pick tracker</h2>
          <p className="text-sm text-white/60">Every sheet parsed straight from Excel, updated automatically on deploy.</p>
        </div>
        <div className="space-y-6">
          {snapshot.leaderboard.map((entry) => (
            <ParticipantCard key={entry.name} entry={entry} anchorId={slugify(entry.name)} />
          ))}
        </div>
      </section>
    </main>
  );
}
