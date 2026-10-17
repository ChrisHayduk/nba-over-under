import { PicksOpen } from "@/components/picks-open";
import { SeasonResults } from "@/components/season-results";
import { listEntries } from "@/lib/db";
import { loadLiveSeason } from "@/lib/season-data";
import { CURRENT_SEASON, SEASONS, isLocked, type ArchivedSeason } from "@/lib/seasons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const season = CURRENT_SEASON;

  if (!isLocked(season)) {
    const entries = await listEntries(season.id);
    const lastSeason = SEASONS.find((other): other is ArchivedSeason => other.status === "final");
    return <PicksOpen season={season} entries={entries} lastSeason={lastSeason} />;
  }

  const data = await loadLiveSeason(season);
  return <SeasonResults season={season} {...data} />;
}
