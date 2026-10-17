// NBA teams keyed by ESPN abbreviation (matches ESPN's standings API).

export type Conference = "East" | "West";

export type Team = {
  abbr: string;
  name: string;
  location: string;
  nickname: string;
  conference: Conference;
};

export const TEAMS: Team[] = [
  { abbr: "ATL", name: "Atlanta Hawks", location: "Atlanta", nickname: "Hawks", conference: "East" },
  { abbr: "BOS", name: "Boston Celtics", location: "Boston", nickname: "Celtics", conference: "East" },
  { abbr: "BKN", name: "Brooklyn Nets", location: "Brooklyn", nickname: "Nets", conference: "East" },
  { abbr: "CHA", name: "Charlotte Hornets", location: "Charlotte", nickname: "Hornets", conference: "East" },
  { abbr: "CHI", name: "Chicago Bulls", location: "Chicago", nickname: "Bulls", conference: "East" },
  { abbr: "CLE", name: "Cleveland Cavaliers", location: "Cleveland", nickname: "Cavaliers", conference: "East" },
  { abbr: "DAL", name: "Dallas Mavericks", location: "Dallas", nickname: "Mavericks", conference: "West" },
  { abbr: "DEN", name: "Denver Nuggets", location: "Denver", nickname: "Nuggets", conference: "West" },
  { abbr: "DET", name: "Detroit Pistons", location: "Detroit", nickname: "Pistons", conference: "East" },
  { abbr: "GS", name: "Golden State Warriors", location: "Golden State", nickname: "Warriors", conference: "West" },
  { abbr: "HOU", name: "Houston Rockets", location: "Houston", nickname: "Rockets", conference: "West" },
  { abbr: "IND", name: "Indiana Pacers", location: "Indiana", nickname: "Pacers", conference: "East" },
  { abbr: "LAC", name: "LA Clippers", location: "LA", nickname: "Clippers", conference: "West" },
  { abbr: "LAL", name: "Los Angeles Lakers", location: "Los Angeles", nickname: "Lakers", conference: "West" },
  { abbr: "MEM", name: "Memphis Grizzlies", location: "Memphis", nickname: "Grizzlies", conference: "West" },
  { abbr: "MIA", name: "Miami Heat", location: "Miami", nickname: "Heat", conference: "East" },
  { abbr: "MIL", name: "Milwaukee Bucks", location: "Milwaukee", nickname: "Bucks", conference: "East" },
  { abbr: "MIN", name: "Minnesota Timberwolves", location: "Minnesota", nickname: "Timberwolves", conference: "West" },
  { abbr: "NO", name: "New Orleans Pelicans", location: "New Orleans", nickname: "Pelicans", conference: "West" },
  { abbr: "NY", name: "New York Knicks", location: "New York", nickname: "Knicks", conference: "East" },
  { abbr: "OKC", name: "Oklahoma City Thunder", location: "Oklahoma City", nickname: "Thunder", conference: "West" },
  { abbr: "ORL", name: "Orlando Magic", location: "Orlando", nickname: "Magic", conference: "East" },
  { abbr: "PHI", name: "Philadelphia 76ers", location: "Philadelphia", nickname: "76ers", conference: "East" },
  { abbr: "PHX", name: "Phoenix Suns", location: "Phoenix", nickname: "Suns", conference: "West" },
  { abbr: "POR", name: "Portland Trail Blazers", location: "Portland", nickname: "Trail Blazers", conference: "West" },
  { abbr: "SAC", name: "Sacramento Kings", location: "Sacramento", nickname: "Kings", conference: "West" },
  { abbr: "SA", name: "San Antonio Spurs", location: "San Antonio", nickname: "Spurs", conference: "West" },
  { abbr: "TOR", name: "Toronto Raptors", location: "Toronto", nickname: "Raptors", conference: "East" },
  { abbr: "UTAH", name: "Utah Jazz", location: "Utah", nickname: "Jazz", conference: "West" },
  { abbr: "WSH", name: "Washington Wizards", location: "Washington", nickname: "Wizards", conference: "East" }
];

export const TEAM_BY_ABBR = new Map(TEAMS.map((team) => [team.abbr, team]));
