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
  const isEmpty = game.totalPossibleStars === 0;
  const progress = isEmpty ? 0 : Math.round(
    (game.lifetimeStars / game.totalPossibleStars) * 100
  );
  const displayPct = game.isBonus ? "∞" : `${progress}`;

  return (
    <Link href={`/games/${game.id}`} className="no-underline relative group">
      <div className={`relative overflow-hidden bg-bg-2 border rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        isEmpty ? "border-dashed border-border-tertiary/40 hover:border-border-default hover:border-dashed" : "border-border-subtle hover:border-purple/20"
      }`}>
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
          {isEmpty ? (
            <div className="font-syne text-xs font-semibold text-text-tertiary flex items-center gap-1 pt-1">
              <span>✨</span> 0%
            </div>
          ) : (
            <div className="font-syne text-[24px] font-bold text-text-primary">
              {displayPct}
              {!game.isBonus && (
                <span className="text-xs text-text-tertiary font-normal font-crimson-pro">
                  %
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="font-syne text-sm font-semibold text-text-primary mb-1">
          {game.title}
        </div>
        <div className="text-xs text-text-tertiary mb-4">
          {game.description}
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 bg-[#2a2a35] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${
              themeGradients[game.theme]
            } transition-[width] duration-600 ease-out`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Bottom row: stars + badge */}
        <div className="flex items-center justify-between mt-[10px]">
          {isEmpty ? (
            <div className="text-xs text-text-tertiary flex items-center gap-1">
              <span className="text-xs">📋</span>
              Add a quest to get started
            </div>
          ) : (
            <div className="text-xs text-text-secondary flex items-center gap-1">
              <span className="text-gold text-xs">★</span>
              {game.lifetimeStars} / {game.totalPossibleStars} stars
            </div>
          )}
          {game.isBonus ? (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-2">
              Bonus Track ✦
            </span>
          ) : (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isEmpty ? "bg-text-tertiary/10 text-text-tertiary" : "bg-green/10 text-green"
            }`}>
              {isEmpty ? "Empty" : "Active"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}