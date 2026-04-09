import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";

import { Navbar } from "@/components/layout/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Scout - Solana Token Intelligence",
  description:
    "Real-time Solana token analysis with risk scoring, holder concentration, wallet graphs, and alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <AppProviders>
          <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(153,69,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(20,241,149,0.12),transparent_35%)]" />
            <Navbar />
            <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
