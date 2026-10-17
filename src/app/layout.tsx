import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { CURRENT_SEASON, SEASONS, seasonLabel } from "@/lib/seasons";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NBA Over/Under League",
  description: "Pick over or under on every NBA team's win total and track the race all season."
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const seasons = SEASONS.map((season) => ({
    label: seasonLabel(season),
    href: season === CURRENT_SEASON ? "/" : `/seasons/${season.id}`
  }));

  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <SiteHeader seasons={seasons} lockAt={CURRENT_SEASON.lockAt} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-10 text-xs text-muted sm:px-6">
          Lines are FanDuel regular-season win totals. Records from ESPN, refreshed every few minutes.
        </footer>
      </body>
    </html>
  );
}
