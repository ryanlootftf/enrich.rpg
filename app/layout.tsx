import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/layout/nav-bar";

export const metadata: Metadata = {
  title: "Enrich.rpg — Gamify Your Growth",
  description: "Turn self-improvement into an epic RPG quest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="max-w-[900px] mx-auto px-4 pt-6 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}