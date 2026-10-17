import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Picks } from "@/lib/seasons";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const sql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

/** Names are matched case- and spacing-insensitively so "chris hayduk " finds "Chris Hayduk". */
export const nameKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

export type StoredEntry = {
  name: string;
  picks: Picks;
  updatedAt: string;
};

type Row = { name: string; picks: Picks; updated_at: string; pin_hash: string };

export async function listEntries(season: string): Promise<StoredEntry[]> {
  const rows = (await sql()`
    SELECT name, picks, updated_at FROM entries WHERE season = ${season} ORDER BY created_at
  `) as Row[];
  return rows.map((row) => ({ name: row.name, picks: row.picks, updatedAt: new Date(row.updated_at).toISOString() }));
}

async function findEntry(season: string, name: string): Promise<Row | undefined> {
  const rows = (await sql()`
    SELECT name, picks, updated_at, pin_hash FROM entries
    WHERE season = ${season} AND name_key = ${nameKey(name)}
  `) as Row[];
  return rows[0];
}

async function hashPin(pin: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pin, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function pinMatches(pin: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(pin, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export type LookupResult =
  | { status: "new" }
  | { status: "found"; name: string; picks: Picks; updatedAt: string }
  | { status: "wrong-pin" };

export async function lookupEntry(season: string, name: string, pin: string): Promise<LookupResult> {
  const row = await findEntry(season, name);
  if (!row) return { status: "new" };
  if (!(await pinMatches(pin, row.pin_hash))) return { status: "wrong-pin" };
  return { status: "found", name: row.name, picks: row.picks, updatedAt: new Date(row.updated_at).toISOString() };
}

/** Creates the entry, or updates it when the PIN matches. */
export async function saveEntry(
  season: string,
  name: string,
  pin: string,
  picks: Picks
): Promise<"created" | "updated" | "wrong-pin"> {
  const existing = await findEntry(season, name);

  if (existing) {
    if (!(await pinMatches(pin, existing.pin_hash))) return "wrong-pin";
    await sql()`
      UPDATE entries SET picks = ${JSON.stringify(picks)}::jsonb, name = ${name.trim()}, updated_at = now()
      WHERE season = ${season} AND name_key = ${nameKey(name)}
    `;
    return "updated";
  }

  const inserted = (await sql()`
    INSERT INTO entries (season, name, name_key, pin_hash, picks)
    VALUES (${season}, ${name.trim()}, ${nameKey(name)}, ${await hashPin(pin)}, ${JSON.stringify(picks)}::jsonb)
    ON CONFLICT (season, name_key) DO NOTHING
    RETURNING id
  `) as { id: number }[];

  // Someone claimed the name between our lookup and insert; treat it like any other PIN mismatch.
  return inserted.length ? "created" : "wrong-pin";
}
