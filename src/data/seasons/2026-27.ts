// 2026-27 season. Lines are FanDuel regular-season win totals as of 2026-10-16.
// Picks lock at opening tip: Celtics at Pistons, Tue Oct 20, 3:00 PM ET.

import type { LiveSeason } from "@/lib/seasons";

export const SEASON_2026_27: LiveSeason = {
  id: "2026-27",
  endYear: 2027,
  status: "live",
  lockAt: "2026-10-20T19:00:00Z",
  entryFee: 20,
  // Same split as 2025-26, when 12 players made a $240 pot: $150 / $70 / $20.
  payoutShares: [150 / 240, 70 / 240, 20 / 240],
  lines: {
    ATL: 43.5,
    BKN: 25.5,
    BOS: 51.5,
    CHA: 37.5,
    CHI: 29.5,
    CLE: 48.5,
    DAL: 33.5,
    DEN: 48.5,
    DET: 48.5,
    GS: 36.5,
    HOU: 48.5,
    IND: 44.5,
    LAC: 27.5,
    LAL: 45.5,
    MEM: 30.5,
    MIA: 46.5,
    MIL: 25.5,
    MIN: 47.5,
    NO: 28.5,
    NY: 51.5,
    OKC: 61.5,
    ORL: 43.5,
    PHI: 49.5,
    PHX: 38.5,
    POR: 41.5,
    SA: 60.5,
    SAC: 20.5,
    TOR: 46.5,
    UTAH: 37.5,
    WSH: 34.5
  }
};
