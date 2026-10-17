export type TeamRecord = { wins: number; losses: number };

type ESPNStandingEntry = {
  team: { abbreviation: string };
  stats: { name: string; value?: number }[];
};

/**
 * Regular-season win/loss records keyed by team abbreviation. `seasontype=2`
 * matters: without it ESPN serves preseason records in October.
 */
export async function fetchRecords(seasonEndYear: number): Promise<Map<string, TeamRecord>> {
  const url =
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings" +
    `?region=us&lang=en&level=1&seasontype=2&season=${seasonEndYear}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`ESPN standings fetch failed (${res.status})`);
  }

  const data = await res.json();
  const entries: ESPNStandingEntry[] = [
    ...(data?.standings?.entries ?? []),
    ...(data?.children ?? []).flatMap((child: { standings?: { entries?: ESPNStandingEntry[] } }) => child.standings?.entries ?? [])
  ];

  const records = new Map<string, TeamRecord>();
  for (const entry of entries) {
    const stat = (name: string) => Number(entry.stats.find((s) => s.name === name)?.value ?? 0);
    records.set(entry.team.abbreviation, { wins: stat("wins"), losses: stat("losses") });
  }

  if (!records.size) {
    throw new Error("No standings data returned from ESPN");
  }
  return records;
}
