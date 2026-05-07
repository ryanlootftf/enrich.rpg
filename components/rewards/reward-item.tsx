"use client";

import type { Reward } from "@/app/types";

interface Props {
  reward: Reward;
}

export function RewardItem({ reward }: Props) {
  const isClaimed = reward.claimed;
  const isNext = reward.isNext && !isClaimed;
  const isBonus = reward.type === "BONUS_TRACK";

  let borderClass = "border-border-subtle";
  let bgClass = "bg-bg-2";

  if (isClaimed) {
    borderClass = "border-border-subtle";
  } else if (isNext) {
    borderClass = "border-accent/40";
    bgClass = "bg-accent/5";
  } else if (isBonus) {
    borderClass = "border-gold/30";
    bgClass = "bg-gold/5";
  }

  let statusLabel = "";
  let statusClass = "";

  if (isClaimed) {
    statusLabel = "Claimed";
    statusClass = "bg-green/10 text-green";
  } else if (isNext) {
    statusLabel = "Next up";
    statusClass = "bg-accent/15 text-accent-2";
  } else if (isBonus) {
    statusLabel = "✦ Bonus";
    statusClass = "bg-gold/10 text-gold-2";
  } else {
    statusLabel = "Locked";
    statusClass = "bg-bg-4 text-text-tertiary";
  }

  return (
    <div
      className={`${bgClass} ${borderClass} border rounded-xl px-[14px] py-3 flex items-center gap-3 ${
        isClaimed ? "opacity-50" : ""
      }`}
    >
      <div
        className={`w-9 h-9 rounded-[10px] bg-bg-3 flex items-center justify-center text-sm flex-shrink-0 border relative ${
          isNext
            ? "border-accent/40"
            : isBonus
            ? "border-gold/30"
            : "border-border-subtle"
        }`}
      >
        {reward.emoji}
      </div>

      <div className="flex-1">
        <div className="text-[13px] font-medium text-text-primary">
          {reward.title}
        </div>
        <div className="text-[11px] text-text-tertiary mt-0.5">
          {reward.type === "BONUS_TRACK"
            ? "Bonus reward — every 25 stars"
            : `at ${reward.requiredStars} stars${
                reward.isNext ? " — 8 away" : ""
              }${reward.requiredStars >= 100 ? " — final reward" : ""}`}
        </div>
      </div>

      <span
        className={`text-[11px] px-[10px] py-0.5 rounded-full font-medium ${statusClass}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}