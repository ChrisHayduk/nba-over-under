"use client";

import { LeaderboardEntry } from "@/lib/leaderboard";
import { formatCurrency, slugify } from "@/lib/utils";
import { useWideView } from "@/hooks/use-wide-view";

const tierStyles = [
  {
    label: "🥇",
    row: "bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent",
    badge: "bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900 shadow-[0_8px_30px_rgba(251,191,36,0.35)]"
  },
  {
    label: "🥈",
    row: "bg-gradient-to-r from-slate-300/15 via-slate-100/5 to-transparent",
    badge: "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 shadow-[0_8px_30px_rgba(148,163,184,0.35)]"
  },
  {
    label: "🥉",
    row: "bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent",
    badge: "bg-gradient-to-r from-orange-400 to-amber-500 text-slate-900 shadow-[0_8px_30px_rgba(251,146,60,0.35)]"
  }
];

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const showFullTable = useWideView(768);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-blue-500/10 backdrop-blur">
      {showFullTable ? (
        <div>
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">On Track</th>
                <th className="px-4 py-3 font-medium">Avg Margin</th>
                <th className="px-4 py-3 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const ratio = entry.total ? Math.min(entry.onTrack / entry.total, 1) : 0;
                const tier = tierStyles[entry.rank - 1];
                return (
                  <tr
                    key={entry.name}
                    className={`border-t border-white/5 text-white/80 transition hover:bg-white/10 ${tier?.row ?? ""}`}
                  >
                    <td className="px-4 py-4 align-top text-base font-semibold text-white">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <a
                        href={`#${slugify(entry.name)}`}
                        className="font-semibold text-white transition hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                      >
                        {tier?.label ? `${tier.label} ${entry.name}` : entry.name}
                      </a>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        {entry.total} picks
                        {entry.missingFile && <span className="ml-2 text-rose-300">Awaiting file</span>}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-lg font-semibold">{entry.onTrack}</span>
                        <span className="text-xs text-white/50">of {entry.total}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-emerald-200">
                        {entry.avgMargin >= 0 ? "+" : ""}
                        {entry.avgMargin.toFixed(2)} wins
                      </p>
                      <p className="text-xs text-white/50">Avg lead</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {entry.payout > 0 ? (
                        <span
                          className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-sm font-semibold ${tier?.badge ?? "bg-white/10 text-white"}`}
                        >
                          <span className="text-xs uppercase tracking-wider">Prize</span>
                          {formatCurrency(entry.payout)}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {entries.map((entry) => {
            const ratio = entry.total ? Math.min(entry.onTrack / entry.total, 1) : 0;
            const tier = tierStyles[entry.rank - 1];
            return (
              <article key={entry.name} className={`p-4 text-white/80 ${tier?.row ?? ""}`}>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white">
                    Rank {entry.rank}
                  </div>
                  <div className="flex-1">
                    <a
                      href={`#${slugify(entry.name)}`}
                      className="text-lg font-semibold text-white transition hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                    >
                      {entry.name}
                    </a>
                    <p className="text-xs uppercase tracking-wider text-white/50">
                      {entry.total} picks · {entry.onTrack} on pace
                    </p>
                  </div>
                  {entry.payout > 0 && (
                    <span className={`rounded-2xl px-3 py-1 text-xs font-semibold text-slate-900 ${tier?.badge ?? "bg-white text-slate-900"}`}>
                      {formatCurrency(entry.payout)}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-4 text-sm text-white/70">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">Progress</p>
                    <div className="mt-1 flex items-center gap-2 text-white">
                      <span className="text-lg font-semibold">{entry.onTrack}</span>
                      <span className="text-xs text-white/50">of {entry.total}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center text-white">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">Avg margin</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-200">
                        {entry.avgMargin >= 0 ? "+" : ""}
                        {entry.avgMargin.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">Status</p>
                      <p className="mt-1 text-sm font-semibold text-white/80">
                        {entry.missingFile ? "Awaiting file" : "Synced"}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
