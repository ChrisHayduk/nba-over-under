"use client";

import Image from "next/image";
import { LeaderboardEntry, ProjectedPick } from "@/lib/leaderboard";
import { formatCurrency } from "@/lib/utils";
import { PickStatusPill } from "@/components/pick-status-pill";

const pickTone: Record<"over" | "under", string> = {
  over: "bg-emerald-500/15 text-emerald-200",
  under: "bg-rose-500/15 text-rose-200"
};

const formatDelta = (delta?: number) => {
  if (typeof delta !== "number") return "—";
  const rounded = delta.toFixed(1);
  return `${delta >= 0 ? "+" : ""}${rounded}`;
};

const formatProjectedWins = (value?: number) => (typeof value === "number" ? value.toString() : "—");

export function ParticipantCard({
  entry,
  anchorId,
  showFullTable
}: {
  entry: LeaderboardEntry;
  anchorId?: string;
  showFullTable: boolean;
}) {
  return (
    <div
      id={anchorId}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/30 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.55)] backdrop-blur scroll-mt-28 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Rank #{entry.rank}</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{entry.name}</h3>
          <p className="text-sm text-white/60">
            {entry.missingFile
              ? "No workbook linked yet"
              : `Linked workbook: over_under_data/${entry.file ?? "unknown"}`}
          </p>
        </div>
        {entry.payout > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-400/70 to-rose-500/70 px-4 py-2 text-right">
            <p className="text-xs uppercase tracking-wide text-white/80">Projected payout</p>
            <p className="text-xl font-semibold text-white">{formatCurrency(entry.payout)}</p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBlock label="On track" value={`${entry.onTrack}/${entry.total}`} accent="text-emerald-300" />
        <StatBlock
          label="Avg margin"
          value={`${entry.avgMargin >= 0 ? "+" : ""}${entry.avgMargin.toFixed(2)} wins`}
          accent="text-sky-200"
        />
        <StatBlock label="Picks logged" value={entry.total} accent="text-white" />
      </div>

      {entry.missingFile ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
          Drop their workbook in <code className="text-white/90">/over_under_data</code> using their initials to pull them into the race automatically.
        </p>
      ) : entry.picks.length === 0 ? (
        <p className="mt-6 text-sm text-white/70">No team picks detected in this sheet.</p>
      ) : showFullTable ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-3 py-3 font-medium">Team</th>
                <th className="px-3 py-3 text-center font-medium">Pick</th>
                <th className="px-3 py-3 text-center font-medium">FD O/U</th>
                <th className="px-3 py-3 text-center font-medium">Wins</th>
                <th className="px-3 py-3 text-center font-medium">Proj Wins</th>
                <th className="px-3 py-3 text-center font-medium">Δ</th>
                <th className="px-3 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {entry.picks.map((pick) => {
                const logo = pick.teamRecord?.logos?.[0]?.href;
                return (
                  <tr key={`${entry.name}-${pick.teamName}`} className="border-t border-white/5 text-white/80">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {logo ? (
                          <Image
                            src={logo}
                            alt=""
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full border border-white/10 bg-white/5"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5" />
                        )}
                        <div>
                          <p className="font-medium text-white">{pick.teamName}</p>
                          {pick.teamRecord && (
                            <p className="text-xs text-white/50">
                              {pick.teamRecord.wins}-{pick.teamRecord.losses} • {(pick.teamRecord.winPct * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pickTone[pick.pick]}`}>
                        {pick.pick === "over" ? "Over" : "Under"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-white">
                      {typeof pick.overUnder === "number" ? pick.overUnder.toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-white">
                      {typeof pick.teamRecord?.wins === "number" ? pick.teamRecord.wins : "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-emerald-200">
                      {formatProjectedWins(pick.projectedWins)}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold">
                      {formatDelta(pick.delta)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <PickStatusPill status={pick.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {entry.picks.map((pick) => (
              <MobilePickCard key={`${entry.name}-${pick.teamName}`} pick={pick} />
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">Tap a card for the full pick details, or rotate your phone for the grid view.</p>
        </>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function MobilePickCard({ pick }: { pick: ProjectedPick }) {
  const logo = pick.teamRecord?.logos?.[0]?.href;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <div className="flex items-start gap-3">
        {logo ? (
          <Image
            src={logo}
            alt=""
            width={36}
            height={36}
            className="h-10 w-10 rounded-full border border-white/10 bg-white/5"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-white">{pick.teamName}</p>
          {pick.teamRecord && (
            <p className="text-xs text-white/50">
              {pick.teamRecord.wins}-{pick.teamRecord.losses} • {(pick.teamRecord.winPct * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${pickTone[pick.pick]}`}>
          {pick.pick === "over" ? "Over" : "Under"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">FD Line</p>
          <p className="mt-1 font-semibold text-white">
            {typeof pick.overUnder === "number" ? pick.overUnder.toFixed(1) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Wins</p>
          <p className="mt-1 font-semibold text-white">
            {typeof pick.teamRecord?.wins === "number" ? pick.teamRecord.wins : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Proj wins</p>
          <p className="mt-1 font-semibold text-emerald-200">{formatProjectedWins(pick.projectedWins)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Δ margin</p>
          <p className="mt-1 font-semibold">{formatDelta(pick.delta)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">
          Status
        </span>
        <PickStatusPill status={pick.status} />
      </div>
    </article>
  );
}
