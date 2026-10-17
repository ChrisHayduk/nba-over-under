import { TeamLogo } from "@/components/team-logo";
import type { ScoredPick, Standing } from "@/lib/scoring";
import { cn, formatCurrency, formatSigned } from "@/lib/utils";

const GRID = "grid grid-cols-[2rem_minmax(0,1fr)_auto_1rem] items-center gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_11rem_5.5rem_5rem_1rem] sm:gap-4";

export function Leaderboard({ standings, final }: { standings: Standing[]; final: boolean }) {
  const hitLabel = final ? "Correct" : "On track";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className={cn(GRID, "hidden border-b border-line px-4 py-2.5 text-xs text-muted sm:grid")}>
        <span>#</span>
        <span>Player</span>
        <span>{hitLabel}</span>
        <span className="text-right">Avg cushion</span>
        <span className="text-right">Prize</span>
        <span />
      </div>

      <ol className="divide-y divide-line">
        {standings.map((standing) => (
          <li key={standing.name}>
            <details className="group">
              <summary className={cn(GRID, "cursor-pointer list-none px-4 py-3.5 transition-colors hover:bg-subtle/60")}>
                <RankBadge rank={standing.rank} />

                <div className="min-w-0">
                  <p className="truncate font-medium">{standing.name}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-muted sm:hidden">
                    {standing.hits} of {standing.picks.length} {hitLabel.toLowerCase()}
                    {standing.avgCushion !== null && ` · ${formatSigned(standing.avgCushion)} avg`}
                  </p>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <span className="w-12 text-sm tabular-nums">
                    <span className="font-semibold">{standing.hits}</span>
                    <span className="text-muted">/{standing.picks.length}</span>
                  </span>
                  <HitBar standing={standing} />
                </div>

                <span
                  className={cn(
                    "hidden text-right text-sm tabular-nums sm:block",
                    standing.avgCushion === null ? "text-muted" : standing.avgCushion >= 0 ? "text-hit" : "text-miss"
                  )}
                >
                  {standing.avgCushion === null ? "—" : formatSigned(standing.avgCushion)}
                </span>

                <span className={cn("text-right text-sm tabular-nums", standing.payout ? "font-semibold" : "text-muted")}>
                  {standing.payout ? formatCurrency(standing.payout) : "—"}
                </span>

                <Chevron />
              </summary>

              <PickGrid picks={standing.picks} final={final} />
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold tabular-nums",
        rank === 1 ? "bg-accent text-accent-ink" : rank <= 3 ? "bg-ink text-bg" : "bg-subtle text-muted"
      )}
    >
      {rank}
    </span>
  );
}

function HitBar({ standing }: { standing: Standing }) {
  const total = standing.picks.length || 1;
  return (
    <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-subtle" aria-hidden>
      <span className="h-full bg-hit" style={{ width: `${(standing.hits / total) * 100}%` }} />
      <span className="h-full bg-miss/70" style={{ width: `${(standing.misses / total) * 100}%` }} />
    </span>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 text-muted transition-transform group-open:rotate-180">
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PickGrid({ picks, final }: { picks: ScoredPick[]; final: boolean }) {
  return (
    <div className="border-t border-line bg-subtle/40 px-4 py-4">
      <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
        {picks.map((pick) => (
          <li
            key={pick.team.team.abbr}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
              pick.status === "hit" && "border-hit/25 bg-hit-soft",
              pick.status === "miss" && "border-miss/25 bg-miss-soft",
              pick.status === "pending" && "border-line bg-surface"
            )}
          >
            <TeamLogo abbr={pick.team.team.abbr} className="h-6 w-6" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight">{pick.team.team.nickname}</p>
              <p className="text-xs tabular-nums text-muted">
                {pick.side === "over" ? "▲ Over" : "▼ Under"} {pick.team.line}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  pick.status === "hit" && "text-hit",
                  pick.status === "miss" && "text-miss",
                  pick.status === "pending" && "text-muted"
                )}
              >
                {pick.status === "pending" ? "—" : pick.status === "hit" ? "✓" : "✕"}
                {!final && pick.decided && pick.status !== "pending" && " Final"}
              </p>
              <p className="text-xs tabular-nums text-muted">
                {pick.team.projected === null
                  ? "No games"
                  : final
                    ? `${pick.team.wins} wins`
                    : `${pick.team.projected.toFixed(1)} pace`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
