import { NextResponse } from "next/server";
import { fetchNbaStandings, defaultSeasonEndYear } from "@/lib/espn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonParam = searchParams.get("season");
    const season = seasonParam ? Number(seasonParam) : defaultSeasonEndYear();
    const teams = await fetchNbaStandings(season);
    return NextResponse.json({ season, count: teams.length, teams });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
