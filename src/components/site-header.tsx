"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";

type Props = {
  seasons: { label: string; href: string }[];
  /** Picks lock time for the current season. */
  lockAt: string;
};

export function SiteHeader({ seasons, lockAt }: Props) {
  const pathname = usePathname();
  const now = useNow();
  const picksOpen = now === null || now < Date.parse(lockAt);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-ink">
            O/U
          </span>
          <span className="hidden sm:inline">Over/Under League</span>
        </Link>

        <nav aria-label="Seasons" className="flex items-center gap-1 text-sm">
          {seasons.map((season) => {
            const active = pathname === season.href;
            return (
              <Link
                key={season.href}
                href={season.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 tabular-nums transition-colors",
                  active ? "bg-subtle font-medium text-ink" : "text-muted hover:text-ink"
                )}
              >
                {season.label}
              </Link>
            );
          })}
        </nav>

        {picksOpen && pathname !== "/picks" && (
          <Link
            href="/picks"
            className="ml-auto rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            <span className="sm:hidden">Your picks</span>
            <span className="hidden sm:inline">Make or edit picks</span>
          </Link>
        )}
      </div>
    </header>
  );
}
