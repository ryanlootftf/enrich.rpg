"use client";

import type { Achievement } from "@/app/types";

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

  return (
    <div
      className={`bg-bg-2 border border-border-subtle rounded-xl px-[14px] py-3 flex items-center gap-3 transition-colors duration-150 hover:border-border-default ${
        done ? "opacity-60" : ""
      }`}
    >
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

      <div className="flex-1">
        <div
          className={`text-[13px] font-medium ${
            done ? "text-text-tertiary line-through" : "text-text-primary"
          }`}
        >
          {achievement.title}
        </div>
        <div
          className={`text-[10px] mt-0.5 font-medium uppercase tracking-[0.06em] ${
            diffColors[achievement.difficulty]
          }`}
        >
          {achievement.difficulty}
        </div>
      </div>

      <div className="text-xs text-gold font-medium whitespace-nowrap">
        +{achievement.starsRewarded} ★
      </div>
    </div>
  );
}