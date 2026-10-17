import { cn } from "@/lib/utils";

const logoUrl = (abbr: string, variant: "500" | "500-dark") =>
  `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/${variant}/${abbr.toLowerCase()}.png&w=80&h=80`;

/** ESPN team logo, swapped for the dark-background variant in dark mode. */
export function TeamLogo({ abbr, className }: { abbr: string; className?: string }) {
  return (
    <span className={cn("relative inline-block shrink-0", className ?? "h-7 w-7")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny CDN-sized logos, no optimizer needed */}
      <img src={logoUrl(abbr, "500")} alt="" loading="lazy" className="h-full w-full object-contain dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl(abbr, "500-dark")} alt="" loading="lazy" className="hidden h-full w-full object-contain dark:block" />
    </span>
  );
}
