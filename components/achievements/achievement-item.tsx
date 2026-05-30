"use client";

import type { Achievement } from "@/app/types";

const diffPills: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  easy: {
    dot: "bg-green",
    text: "text-green",
    bg: "bg-green/10",
    border: "border-green/30",
  },
  medium: {
    dot: "bg-gold",
    text: "text-gold-2",
    bg: "bg-gold/10",
    border: "border-gold/30",
  },
  hard: {
    dot: "bg-coral",
    text: "text-coral",
    bg: "bg-coral/10",
    border: "border-coral/30",
  },
};

interface Props {
  achievement: Achievement;
  onClick?: (achievement: Achievement) => void;
}

export function AchievementItem({ achievement, onClick }: Props) {
  const done = achievement.completed;
  const hasProgress = achievement.progressMax > 1;
  const progressPct = hasProgress
    ? Math.min(
        Math.round((achievement.progressCurrent / achievement.progressMax) * 100),
        100
      )
    : 0;

  const pill = diffPills[achievement.difficulty] ?? diffPills.easy;

  return (
    <div
      onClick={() => onClick?.(achievement)}
      className={`bg-bg-3 border rounded-xl px-5 py-4 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-purple/30 ${
        done
          ? "border-green/50 opacity-70"
          : "border-border-subtle"
      }`}
    >
      {/* Completed checkmark */}
      {done && (
        <span className="text-green text-sm font-bold flex-shrink-0">✓</span>
      )}

      {/* Title + Description + Progress */}
      <div className="flex-1 min-w-0">
        {/* Title row: title + stars */}
        <div className="flex items-center gap-2">
          <h4
            className={`text-base font-semibold truncate ${
              done ? "text-text-tertiary line-through" : "text-text-primary"
            }`}
          >
            {achievement.title}
          </h4>
          {/* Stars — now beside title */}
          <span className="text-xs font-bold text-gold whitespace-nowrap flex-shrink-0 drop-shadow-[0_0_4px_rgba(255,200,0,0.4)]">
            +{achievement.starsRewarded} ★
          </span>
        </div>

        {/* Description */}
        {achievement.description && (
          <p className="text-xs text-zinc-500 mt-0 leading-snug truncate">
            {achievement.description}
          </p>
        )}

        {/* Progress row: bar + difficulty pill */}
        {hasProgress && !done && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-[#2a2a35] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-accent transition-[width] duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-tertiary flex-shrink-0 leading-none">
              {achievement.progressCurrent}/{achievement.progressMax}
            </span>
            {/* Difficulty pill — inline with progress row */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-[0.06em] ${pill.bg} ${pill.border} ${pill.text} flex-shrink-0`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
              {achievement.difficulty}
            </span>
          </div>
        )}

        {/* Difficulty pill for non-progress quests or completed — below title */}
        {(!hasProgress || done) && (
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-[0.06em] ${pill.bg} ${pill.border} ${pill.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
              {achievement.difficulty}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}