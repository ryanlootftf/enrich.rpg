"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteGame } from "@/app/actions/games";
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
  const [deleting, setDeleting] = useState(false);

  const isEmpty = game.totalPossibleStars === 0;
  const progress = isEmpty ? 0 : Math.round(
    (game.lifetimeStars / game.totalPossibleStars) * 100
  );
  const displayPct = game.isBonus ? "∞" : `${progress}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${game.title}"? This will remove all its quests and rewards.`)) return;
    setDeleting(true);
    await deleteGame(game.id);
  };

  return (
    <Link href={`/games/${game.id}`} className="no-underline relative group">
      <div className={`relative overflow-hidden bg-bg-2 border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
        isEmpty ? "border-dashed border-border-tertiary/40 hover:border-border-default" : "border-border-subtle hover:border-border-default"
      }`}>
        {/* Top accent bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${
            themeGradients[game.theme]
          }`}
        />

        {/* Delete button — top right corner */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:text-red hover:bg-red/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
          title="Delete game"
        >
          {deleting ? (
            <span className="text-[10px] animate-pulse">…</span>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          )}
        </button>

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
            <div className="font-syne text-[11px] font-semibold text-text-tertiary flex items-center gap-1 pt-1">
              <span>✨</span> 0%
            </div>
          ) : (
            <div className="font-syne text-[22px] font-bold text-text-primary">
              {displayPct}
              {!game.isBonus && (
                <span className="text-xs text-text-tertiary font-normal font-dm-sans">
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
          {isEmpty ? (
            <div className="text-xs text-text-tertiary flex items-center gap-1">
              <span className="text-[10px]">📋</span>
              Add a quest to get started
            </div>
          ) : (
            <div className="text-xs text-text-secondary flex items-center gap-1">
              <span className="text-gold text-[10px]">★</span>
              {game.lifetimeStars} / {game.totalPossibleStars} stars
            </div>
          )}
          {game.isBonus ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-2">
              Bonus Track ✦
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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