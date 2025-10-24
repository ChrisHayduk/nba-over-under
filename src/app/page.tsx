import { getLeagueSnapshot } from "@/lib/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PickTracker } from "@/components/pick-tracker";

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
  const totalParticipants = snapshot.leaderboard.length;
  const totalPicks = snapshot.leaderboard.reduce((sum, entry) => sum + entry.total, 0);
  const avgLeagueMargin =
    totalParticipants > 0 ? snapshot.leaderboard.reduce((sum, entry) => sum + entry.avgMargin, 0) / totalParticipants : 0;
  const activeSheets = snapshot.leaderboard.filter((entry) => !entry.missingFile).length;

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] max-w-5xl rounded-[120px] bg-gradient-to-b from-sky-500/20 via-transparent to-transparent blur-3xl" />
      <header className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(15,27,49,0.7)] backdrop-blur sm:p-10">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Season {seasonLabel(snapshot.seasonEndYear)}
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">NBA O/U Leaderboard</h1>
              <p className="mt-3 max-w-3xl text-base text-white/70">
                Live standings fusing everyone&apos;s FanDuel win totals with ESPN records so you instantly know which lines are pacing to cash.
              </p>
            </div>
            <div className="shrink-0 rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-900/20 px-4 py-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pot split</p>
              <p className="mt-1 text-lg font-semibold text-white">$150 • $70 • $20</p>
              <p className="text-xs text-white/50">Updated {formatTimestamp(snapshot.generatedAt)} ET</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatChip
            label="Players logged"
            value={totalParticipants}
            detail={`${activeSheets} with live sheets`}
          />
          <StatChip label="Picks tracked" value={totalPicks} detail="Season-long tickets" />
          <StatChip
            label="Avg cushion"
            value={`${avgLeagueMargin >= 0 ? "+" : ""}${avgLeagueMargin.toFixed(2)} wins`}
            detail="League-wide margin"
          />
        </div>

        {(waitingOnFiles.length > 0 || snapshot.unmatchedFiles.length > 0) && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {waitingOnFiles.length > 0 && (
              <p>
                Missing workbooks for: {waitingOnFiles.map((entry) => entry.name).join(", ")}.
              </p>
            )}
            {snapshot.unmatchedFiles.length > 0 && (
              <p className="mt-1 text-amber-100/80">
                Unclaimed files: {snapshot.unmatchedFiles.join(", ")} – rename them with initials so we can auto-map.
              </p>
            )}
          </div>
        )}
      </header>

      <nav className="-mt-2 flex flex-wrap gap-3 text-sm">
        {[
          { label: "Leaderboard", href: "#leaderboard" },
          { label: "Pick tracker", href: "#pick-tracker" }
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/15 bg-slate-900/40 px-4 py-2 text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <section id="leaderboard" className="space-y-4 scroll-mt-24">
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

      <section id="pick-tracker" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pick tracker</h2>
          <p className="text-sm text-white/60">Every sheet parsed straight from Excel, updated automatically on deploy.</p>
        </div>
        <PickTracker entries={snapshot.leaderboard} />
      </section>
    </main>
  );
}

function StatChip({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/0 to-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-white/50">{detail}</p>
    </div>
  );
}
