"use client";

import { LeaderboardEntry } from "@/lib/leaderboard";
import { ParticipantCard } from "@/components/participant-card";
import { slugify } from "@/lib/utils";
import { useWideView } from "@/hooks/use-wide-view";

export function PickTracker({ entries }: { entries: LeaderboardEntry[] }) {
  const showFullTable = useWideView(820);

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <ParticipantCard
          key={entry.name}
          entry={entry}
          anchorId={slugify(entry.name)}
          showFullTable={showFullTable}
        />
      ))}
    </div>
  );
}
