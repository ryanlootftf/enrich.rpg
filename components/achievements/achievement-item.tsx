"use client";

import type { Achievement } from "@/app/types";
import { updateAchievementProgress } from "@/app/actions/achievements";

const diffColors: Record<string, string> = {
  easy: "text-green",
  medium: "text-gold-2",
  hard: "text-coral",
};

interface Props {
  achievement: Achievement;
  onToggle?: (id: string) => void;
}

export function AchievementItem({ achievement, onToggle }: Props) {
  const done = achievement.completed;
  const hasProgress = achievement.progressMax > 0;
  const progressPct = hasProgress
    ? Math.min(
        Math.round((achievement.progressCurrent / achievement.progressMax) * 100),
        100
      )
    : 0;

  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateAchievementProgress(achievement.id, achievement.gameId);
    } catch (err) {
      console.error("Failed to increment progress:", err);
    }
  };

  return (
    <div
      className={`bg-bg-2 border border-border-subtle rounded-xl px-[14px] py-3 flex items-center gap-3 transition-colors duration-150 hover:border-border-default ${
        done ? "opacity-60" : ""
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 text-[11px] cursor-pointer select-none ${
          done
            ? "bg-accent border-accent text-white"
            : "border-border-default"
        }`}
        onClick={() => onToggle?.(achievement.id)}
      >
        {done && "✓"}
      </div>

      {/* Title + Description + Progress */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium ${
            done ? "text-text-tertiary line-through" : "text-text-primary"
          }`}
        >
          {achievement.title}
        </div>

        {/* Description */}
        {achievement.description && (
          <div className="text-[11px] text-text-tertiary mt-0.5 leading-snug truncate">
            {achievement.description}
          </div>
        )}

        {/* Progress bar */}
        {hasProgress && !done && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <button
              onClick={handleIncrement}
              className="text-[10px] font-medium text-accent-2 hover:text-accent flex items-center gap-0.5 transition-colors flex-shrink-0"
              title="Increment progress"
            >
              ＋ {achievement.progressCurrent}/{achievement.progressMax}
            </button>
          </div>
        )}

        {/* Difficulty label */}
        <div
          className={`text-[10px] mt-0.5 font-medium uppercase tracking-[0.06em] ${
            diffColors[achievement.difficulty]
          }`}
        >
          {achievement.difficulty}
        </div>
      </div>

      {/* Stars */}
      <div className="text-xs text-gold font-medium whitespace-nowrap flex-shrink-0">
        +{achievement.starsRewarded} ★
      </div>
    </div>
  );
}