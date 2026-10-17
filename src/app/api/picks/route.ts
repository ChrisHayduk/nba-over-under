import { NextResponse } from "next/server";
import { lookupEntry, saveEntry } from "@/lib/db";
import { CURRENT_SEASON, isLocked } from "@/lib/seasons";
import { cleanName, isValidPin, parsePicks } from "@/lib/validate";

export const runtime = "nodejs";

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

const WRONG_PIN =
  "That PIN doesn't match the one saved for this name. If you're a different person with the same name, add a last initial.";

// Slow down PIN guessing a little.
const penalty = () => new Promise((resolve) => setTimeout(resolve, 1200));

/** Look up an existing entry: { name, pin } → { status: "new" | "found", picks? } */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = cleanName(body?.name);
  if (!name) return error("Enter your name.", 400);
  if (!isValidPin(body?.pin)) return error("Your PIN should be 4 to 8 digits.", 400);

  const result = await lookupEntry(CURRENT_SEASON.id, name, body.pin);
  if (result.status === "wrong-pin") {
    await penalty();
    return error(WRONG_PIN, 401);
  }
  return NextResponse.json(result);
}

/** Create or update picks: { name, pin, picks } */
export async function PUT(req: Request) {
  if (isLocked(CURRENT_SEASON)) return error("Picks are locked — the season has tipped off.", 403);

  const body = await req.json().catch(() => null);
  const name = cleanName(body?.name);
  if (!name) return error("Enter your name.", 400);
  if (!isValidPin(body?.pin)) return error("Your PIN should be 4 to 8 digits.", 400);
  const picks = parsePicks(body?.picks);
  if (!picks) return error("Pick over or under for all 30 teams.", 400);

  const result = await saveEntry(CURRENT_SEASON.id, name, body.pin, picks);
  if (result === "wrong-pin") {
    await penalty();
    return error(WRONG_PIN, 401);
  }
  return NextResponse.json({ status: result });
}
