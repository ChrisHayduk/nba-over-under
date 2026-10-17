import { cn } from "@/lib/utils";

export function SectionHeading({ title, description, id }: { title: string; description?: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="mb-4 scroll-mt-20">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export function Notice({ tone = "neutral", children }: { tone?: "neutral" | "warning"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "warning" ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-subtle text-ink"
      )}
    >
      {children}
    </div>
  );
}
