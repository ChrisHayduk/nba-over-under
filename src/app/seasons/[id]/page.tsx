import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SeasonResults } from "@/components/season-results";
import { loadArchivedSeason } from "@/lib/season-data";
import { SEASONS, getSeason, seasonLabel } from "@/lib/seasons";

export const dynamicParams = false;

export function generateStaticParams() {
  return SEASONS.map((season) => ({ id: season.id }));
}

export async function generateMetadata({ params }: PageProps<"/seasons/[id]">): Promise<Metadata> {
  const season = getSeason((await params).id);
  return { title: season ? `${seasonLabel(season)} · NBA Over/Under League` : undefined };
}

export default async function SeasonPage({ params }: PageProps<"/seasons/[id]">) {
  const season = getSeason((await params).id);
  if (!season) notFound();
  if (season.status === "live") redirect("/");

  return <SeasonResults season={season} {...loadArchivedSeason(season)} />;
}
