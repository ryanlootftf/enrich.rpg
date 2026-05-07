import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}