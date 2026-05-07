"use client";

import Link from "next/link";
import type { Game } from "@/app/types";

const themeGradients: Record<string, string> = {
  purple: "from-[#7c6aff] to-[#a08bff]",
  teal: "from-[#2dd4bf] to-[#34d399]",
  coral: "from-[#f97060] to-[#fb923c]",
  gold: "from-[#f4c430] to-[#fbbf24]",
};

const themeIconBgs: Record<string, string> = {
  purple: "bg-accent/15",
  teal: "bg-teal/10",
  coral: "bg-coral/10",
  gold: "bg-gold/10",
};

const themeIcons: Record<string, string> = {
  purple: "🗣️",
  teal: "🏃",
  coral: "📚",
  gold: "💼",
};

export function GameCard({ game }: { game: Game }) {
  const progress = Math.round(
    (game.lifetimeStars / game.totalPossibleStars) * 100
  );
  const displayPct = game.isBonus ? "∞" : `${progress}`;

  return (
    <Link href={`/games/${game.id}`} className="no-underline">
      <div className="relative overflow-hidden bg-bg-2 border border-border-subtle rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-border-default hover:-translate-y-0.5">
        {/* Top accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${
            themeGradients[game.theme]
          }`}
        />

        {/* Top row: icon + percentage */}
        <div className="flex items-start justify-between mb-[14px]">
          <div
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg ${
              themeIconBgs[game.theme]
            }`}
          >
            {themeIcons[game.theme]}
          </div>
          <div className="font-syne text-[22px] font-bold text-text-primary">
            {displayPct}
            {!game.isBonus && (
              <span className="text-xs text-text-tertiary font-normal font-dm-sans">
                %
              </span>
            )}
          </div>
        </div>

        {/* Title + description */}
        <div className="font-syne text-sm font-semibold text-text-primary mb-1">
          {game.title}
        </div>
        <div className="text-xs text-text-tertiary mb-[14px]">
          {game.description}
        </div>

        {/* Mini progress bar */}
        <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${
              themeGradients[game.theme]
            } transition-[width] duration-600 ease-out`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Bottom row: stars + badge */}
        <div className="flex items-center justify-between mt-[10px]">
          <div className="text-xs text-text-secondary flex items-center gap-1">
            <span className="text-gold text-[10px]">★</span>
            {game.lifetimeStars} / {game.totalPossibleStars} stars
          </div>
          {game.isBonus ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-2">
              Bonus Track ✦
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">
              Active
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}