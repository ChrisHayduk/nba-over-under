import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "NBA O/U League",
  description: "Track your crew's NBA over/under race with live projections."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
