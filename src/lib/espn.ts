export type TeamRecord = {
  id: string;
  team: string;
  triCode: string;
  conference: string;
  division?: string;
  wins: number;
  losses: number;
  winPct: number;
  gb?: number;
  home?: { w: number; l: number };
  away?: { w: number; l: number };
  last10?: { w: number; l: number };
  streak?: string;
  confRank: number;
  logos?: { href: string }[];
};

function eastCoastToday(): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  const parts = fmt.formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const d = Number(parts.find((p) => p.type === "day")?.value ?? "1");
  return new Date(Date.UTC(y, m - 1, d));
}

export function defaultSeasonEndYear(today = eastCoastToday()): number {
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth() + 1;
  return m >= 10 ? y + 1 : y;
}

type ESPNStandingEntry = {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logos?: { href: string }[];
  };
  stats: { name: string; value?: number | string; displayValue?: string }[];
};

const getStatValue = (
  entry: ESPNStandingEntry,
  name: string,
  alt?: string
): number | string | null => {
  const match = entry.stats.find((stat) => stat.name === name || (alt && stat.name === alt));
  return (match?.value ?? match?.displayValue ?? null) as number | string | null;
};

const entryToRecord = (
  entry: ESPNStandingEntry,
  conferenceName: string,
  rank: number
): TeamRecord => {
  const wins = Number(getStatValue(entry, "wins"));
  const losses = Number(getStatValue(entry, "losses"));
  const winPct = Number(getStatValue(entry, "winpercent", "winPercent"));
  const gb = Number(getStatValue(entry, "gamesbehind", "gamesBehind"));
  const homeW = Number(getStatValue(entry, "homeWins"));
  const homeL = Number(getStatValue(entry, "homeLosses"));
  const awayW = Number(getStatValue(entry, "awayWins", "roadWins"));
  const awayL = Number(getStatValue(entry, "awayLosses", "roadLosses"));
  const l10W = Number(getStatValue(entry, "lastTenWins", "lastTen"));
  const l10L = Number(getStatValue(entry, "lastTenLosses"));
  const streak = String(getStatValue(entry, "streak") ?? "");

  return {
    id: entry.team.id,
    team: entry.team.displayName,
    triCode: entry.team.abbreviation,
    conference: conferenceName,
    wins,
    losses,
    winPct,
    gb: Number.isNaN(gb) ? undefined : gb,
    home: Number.isNaN(homeW) ? undefined : { w: homeW, l: homeL },
    away: Number.isNaN(awayW) ? undefined : { w: awayW, l: awayL },
    last10: Number.isNaN(l10W) ? undefined : { w: l10W, l: l10L },
    streak: streak || undefined,
    confRank: rank,
    logos: entry.team.logos
  };
};

export async function fetchNbaStandings(seasonEndYear?: number): Promise<TeamRecord[]> {
  const season = seasonEndYear ?? defaultSeasonEndYear();
  const url =
    `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings` +
    `?region=us&lang=en&type=0&level=1&season=${season}` +
    `&sort=winpercent:desc,wins:desc,gamesbehind:asc`;

  const res = await fetch(url, {
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    throw new Error(`ESPN standings fetch failed (${res.status})`);
  }

  const data = await res.json();
  const rows: TeamRecord[] = [];
  const children = Array.isArray(data?.children) ? data.children : [];

  if (children.length > 0) {
    for (const conf of children) {
      const confName: string = conf?.name ?? "Conference";
      const entries: ESPNStandingEntry[] = conf?.standings?.entries ?? [];
      entries.forEach((entry: ESPNStandingEntry, idx: number) => {
        rows.push(entryToRecord(entry, confName, idx + 1));
      });
    }
  } else {
    const entries: ESPNStandingEntry[] = data?.standings?.entries ?? [];
    entries.forEach((entry: ESPNStandingEntry, idx: number) => {
      rows.push(entryToRecord(entry, "League", idx + 1));
    });
  }

  if (!rows.length) {
    throw new Error("No standings data returned from ESPN");
  }

  return rows;
}
