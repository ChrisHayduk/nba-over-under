import { TeamLogo } from "@/components/team-logo";
import type { Conference } from "@/data/teams";
import type { TeamStatus } from "@/lib/scoring";
import { cn, formatSigned } from "@/lib/utils";

const CONFERENCES: Conference[] = ["East", "West"];

/** Every team's line, record and pace, plus how the group picked it. */
export function TeamBoard({ teams, final, showPicks }: { teams: TeamStatus[]; final: boolean; showPicks: boolean }) {
  return (
    <div className="space-y-6">
      {CONFERENCES.map((conference) => (
        <div key={conference} className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[20rem] text-sm">
            <caption className="border-b border-line px-4 py-2.5 text-left text-xs font-medium text-muted">
              {conference}ern Conference
            </caption>
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-2 text-left font-normal">Team</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Line</th>
                <th scope="col" className="hidden px-2 py-2 text-right font-normal sm:table-cell">Record</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">{final ? "Wins" : "Pace"}</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">vs line</th>
                {showPicks && (
                  <th scope="col" className="hidden px-4 py-2 text-right font-normal md:table-cell">Group picks</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {teams
                .filter((status) => status.team.conference === conference)
                .sort((a, b) => a.team.name.localeCompare(b.team.name))
                .map((status) => (
                  <TeamRow key={status.team.abbr} status={status} final={final} showPicks={showPicks} />
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function TeamRow({ status, final, showPicks }: { status: TeamStatus; final: boolean; showPicks: boolean }) {
  const diff = status.projected === null ? null : status.projected - status.line;
  const picked = status.overPicks + status.underPicks;

  return (
    <tr>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <TeamLogo abbr={status.team.abbr} className="h-6 w-6" />
          <div className="min-w-0">
            <p className="truncate font-medium">
              <span className="sm:hidden">{status.team.nickname}</span>
              <span className="hidden sm:inline">{status.team.name}</span>
            </p>
            <p className="text-xs tabular-nums text-muted sm:hidden">
              {status.wins}–{status.losses}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums">{status.line}</td>
      <td className="hidden px-2 py-2.5 text-right tabular-nums text-muted sm:table-cell">
        {status.wins}–{status.losses}
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums">
        {status.projected === null ? <span className="text-muted">—</span> : final ? status.wins : status.projected.toFixed(1)}
      </td>
      <td className="px-2 py-2.5 text-right">
        {diff === null ? (
          <span className="text-muted">—</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <span aria-hidden className="text-[0.6rem]">{diff > 0 ? "▲" : "▼"}</span>
            {formatSigned(diff)}
            {!final && status.clinched && (
              <span className="rounded bg-ink px-1 py-px text-[0.6rem] font-semibold uppercase tracking-wide text-bg">
                Final
              </span>
            )}
          </span>
        )}
      </td>
      {showPicks && (
        <td className="hidden px-4 py-2.5 md:table-cell">
          <div className="ml-auto flex w-36 items-center gap-2 text-xs tabular-nums text-muted">
            <span className="w-6 text-right">{status.overPicks}▲</span>
            <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-subtle" aria-hidden>
              <span
                className={cn("h-full bg-ink/70")}
                style={{ width: picked ? `${(status.overPicks / picked) * 100}%` : "0%" }}
              />
            </span>
            <span className="w-6">{status.underPicks}▼</span>
          </div>
        </td>
      )}
    </tr>
  );
}
