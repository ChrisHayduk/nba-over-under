"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TeamLogo } from "@/components/team-logo";
import { Notice } from "@/components/ui";
import type { Conference, Team } from "@/data/teams";
import type { Picks, Side } from "@/lib/seasons";
import { cn } from "@/lib/utils";

type PickTeam = Team & { line: number; lastWins: number | null };

type Props = {
  seasonLabel: string;
  lockLabel: string;
  /** localStorage key for unsaved picks. */
  draftKey: string;
  teams: PickTeam[];
};

type Step = "who" | "pick" | "done";

const CONFERENCES: Conference[] = ["East", "West"];
const PIN_PATTERN = /^\d{4,8}$/;
const draftName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

// Unsaved picks survive a refresh. Storage can be unavailable (private mode), so failures are ignored.
function readDraft(key: string, name: string): Partial<Picks> {
  try {
    const draft = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return draft && draft.name === draftName(name) ? draft.picks : {};
  } catch {
    return {};
  }
}

function writeDraft(key: string, name: string, picks: Partial<Picks> | null) {
  try {
    if (picks) window.localStorage.setItem(key, JSON.stringify({ name: draftName(name), picks }));
    else window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function PickForm({ seasonLabel, lockLabel, draftKey, teams }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("who");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [picks, setPicks] = useState<Partial<Picks>>({});
  const [returning, setReturning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const picked = teams.filter((team) => picks[team.abbr]).length;
  const complete = picked === teams.length;

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    if (!PIN_PATTERN.test(pin)) return setError("Your PIN should be 4 to 8 digits.");

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin })
      });
      const body = await res.json();
      if (!res.ok) return setError(body.error ?? "Something went wrong. Try again.");

      if (body.status === "found") {
        setName(body.name);
        setPicks({ ...body.picks, ...readDraft(draftKey, body.name) });
        setReturning(true);
      } else {
        setPicks(readDraft(draftKey, name));
        setReturning(false);
      }
      setStep("pick");
      window.scrollTo({ top: 0 });
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function choose(abbr: string, side: Side) {
    setPicks((current) => {
      const next = { ...current, [abbr]: side };
      writeDraft(draftKey, name, next);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/picks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin, picks })
      });
      const body = await res.json();
      if (res.status === 401) {
        setStep("who");
        return setError(body.error);
      }
      if (!res.ok) return setError(body.error ?? "Something went wrong. Try again.");

      writeDraft(draftKey, name, null);
      setStep("done");
      window.scrollTo({ top: 0 });
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Your picks are saved on this device. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "who") {
    return (
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium text-accent">{seasonLabel} season · Locks {lockLabel}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Make your picks</h1>
        <p className="mt-2 text-muted">Enter your name and a PIN. Use the same ones to come back and change your picks before tip-off.</p>

        <form onSubmit={lookup} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={40}
              placeholder="First and last name"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
            />
          </div>

          <div>
            <label htmlFor="pin" className="text-sm font-medium">
              PIN
            </label>
            <input
              id="pin"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="4–8 digits"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 tracking-widest outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
            />
            <p className="mt-1.5 text-xs text-muted">First time this season? Make one up. It keeps anyone else from editing your picks.</p>
          </div>

          {error && <Notice tone="warning">{error}</Notice>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink py-3 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  if (step === "done") {
    const overs = Object.values(picks).filter((side) => side === "over").length;
    return (
      <div className="mx-auto max-w-md py-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-hit-soft text-2xl text-hit" aria-hidden>
          ✓
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {returning ? "Picks updated" : `You're in, ${name.split(" ")[0]}`}
        </h1>
        <p className="mt-3 text-muted">
          {overs} overs, {teams.length - overs} unders. You can change them until {lockLabel}. Just come back with your name and PIN.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-full bg-ink px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90">
            Back to the league
          </Link>
          <button
            type="button"
            onClick={() => {
              setReturning(true);
              setStep("pick");
            }}
            className="rounded-full px-5 py-2.5 font-medium text-muted transition-colors hover:text-ink"
          >
            Edit picks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-accent">{seasonLabel} season · Locks {lockLabel}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{name.split(" ")[0]}&apos;s picks</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("who");
            setError(null);
          }}
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Not {name.split(" ")[0]}?
        </button>
      </div>
      <p className="mt-2 text-muted">Will each team win more or fewer games than its line?</p>

      {returning && (
        <div className="mt-5">
          <Notice>Loaded your saved picks. Change anything you like, then save again.</Notice>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {CONFERENCES.map((conference) => (
          <section key={conference}>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{conference}ern Conference</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {teams
                .filter((team) => team.conference === conference)
                .map((team) => (
                  <PickRow key={team.abbr} team={team} side={picks[team.abbr]} onChoose={(side) => choose(team.abbr, side)} />
                ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:bottom-4">
        {error && (
          <div className="mb-3">
            <Notice tone="warning">{error}</Notice>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm tabular-nums">
              <span className="font-semibold">{picked}</span>
              <span className="text-muted"> of {teams.length} picked</span>
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle" aria-hidden>
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(picked / teams.length) * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!complete || busy}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted"
          >
            {busy ? "Saving…" : complete ? "Save picks" : `${teams.length - picked} to go`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PickRow({ team, side, onChoose }: { team: PickTeam; side?: Side; onChoose: (side: Side) => void }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <TeamLogo abbr={team.abbr} className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          <span className="sm:hidden">{team.nickname}</span>
          <span className="hidden sm:inline">{team.name}</span>
        </p>
        <p className="text-xs tabular-nums text-muted">
          <span className="font-semibold text-ink">{team.line}</span> wins
          {team.lastWins !== null && <span className="hidden sm:inline"> · {team.lastWins} last year</span>}
        </p>
      </div>
      <div role="radiogroup" aria-label={`${team.name} over or under ${team.line}`} className="flex shrink-0 rounded-full border border-line bg-subtle p-0.5">
        {(["over", "under"] as Side[]).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={side === option}
            onClick={() => onChoose(option)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
              side === option ? "bg-ink text-bg shadow-sm" : "text-muted hover:text-ink"
            )}
          >
            <span aria-hidden className="text-[0.6rem]">{option === "over" ? "▲" : "▼"}</span>
            {option === "over" ? "Over" : "Under"}
          </button>
        ))}
      </div>
    </li>
  );
}
