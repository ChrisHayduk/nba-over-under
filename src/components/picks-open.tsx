import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { TeamLogo } from "@/components/team-logo";
import { SectionHeading } from "@/components/ui";
import { TEAMS, type Conference } from "@/data/teams";
import type { StoredEntry } from "@/lib/db";
import { type LiveSeason, type ArchivedSeason, seasonLabel } from "@/lib/seasons";
import { formatCurrency, formatEastern, ordinal } from "@/lib/utils";

type Props = {
  season: LiveSeason;
  entries: StoredEntry[];
  lastSeason?: ArchivedSeason;
};

/** The current season before tip-off: countdown, who's in, and the lines. */
export function PicksOpen({ season, entries, lastSeason }: Props) {
  const lockDay = formatEastern(season.lockAt, { weekday: "long", month: "short", day: "numeric" });
  const lockTime = formatEastern(season.lockAt, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <p className="text-sm font-medium text-accent">{seasonLabel(season)} season · Picks open</p>
          <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Over or under. All 30 teams.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Pick whether each team finishes over or under its FanDuel win total. Picks lock at opening tip on{" "}
            <span className="text-ink">
              {lockDay} at {lockTime} ET
            </span>{" "}
            and stay hidden from everyone until then.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/picks"
              className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Make your picks
            </Link>
            <Link href="#lines" className="rounded-full px-4 py-3 font-medium text-muted transition-colors hover:text-ink">
              See the lines ↓
            </Link>
          </div>

          <div className="mt-10">
            <p className="mb-2 text-xs text-muted">Picks lock in</p>
            <Countdown target={season.lockAt} />
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Who&apos;s in</h2>
            <span className="text-sm tabular-nums text-muted">{entries.length}</span>
          </div>
          {entries.length ? (
            <ul className="divide-y divide-line">
              {entries.map((entry) => (
                <li key={entry.name} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-hit-soft text-[0.65rem] text-hit" aria-hidden>
                    ✓
                  </span>
                  {entry.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-muted">Nobody&apos;s in yet. Be the first.</p>
          )}
          <div className="border-t border-line px-5 py-4">
            <p className="text-xs text-muted">Prizes</p>
            <p className="mt-1 text-sm tabular-nums">
              {season.payouts.map((amount, index) => `${ordinal(index + 1)} ${formatCurrency(amount)}`).join(" · ")}
            </p>
          </div>
        </aside>
      </section>

      <section>
        <SectionHeading
          id="lines"
          title="The lines"
          description={`FanDuel regular-season win totals${lastSeason ? `, with last season's wins for reference` : ""}.`}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {(["East", "West"] as Conference[]).map((conference) => (
            <div key={conference} className="rounded-2xl border border-line bg-surface">
              <div className="flex justify-between border-b border-line px-4 py-2.5 text-xs text-muted">
                <span>{conference}ern Conference</span>
                <span className="flex gap-6">
                  {lastSeason && <span className="w-14 text-right">{seasonLabel(lastSeason)}</span>}
                  <span className="w-10 text-right">Line</span>
                </span>
              </div>
              <ul className="divide-y divide-line">
                {TEAMS.filter((team) => team.conference === conference)
                  .sort((a, b) => season.lines[b.abbr] - season.lines[a.abbr])
                  .map((team) => (
                    <li key={team.abbr} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <TeamLogo abbr={team.abbr} className="h-6 w-6" />
                      <span className="min-w-0 flex-1 truncate font-medium">{team.name}</span>
                      <span className="flex gap-6 tabular-nums">
                        {lastSeason && (
                          <span className="w-14 text-right text-muted">{lastSeason.finalRecords[team.abbr]?.[0] ?? "—"} W</span>
                        )}
                        <span className="w-10 text-right font-semibold">{season.lines[team.abbr]}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
