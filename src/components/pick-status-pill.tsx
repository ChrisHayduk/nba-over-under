import { ProjectedPick } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectedPick["status"], string> = {
  hit: "On Track",
  miss: "Off Track",
  "toss-up": "Too Close",
  pending: "Pending"
};

const STATUS_STYLES: Record<ProjectedPick["status"], string> = {
  hit: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40",
  miss: "bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/40",
  "toss-up": "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40",
  pending: "bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/40"
};

export function PickStatusPill({ status }: { status: ProjectedPick["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
