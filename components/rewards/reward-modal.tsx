"use client";

import type { Game, Reward } from "@/app/types";
import { RewardEditor } from "@/components/rewards/reward-editor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  mainRewards: Reward[];
  bonusRewards: Reward[];
  bonusTemplate: Reward | null;
  lifetimeStars: number;
  onRewardsChanged: () => Promise<void>;
}

export function RewardModal({
  isOpen,
  onClose,
  game,
  mainRewards,
  bonusRewards,
  bonusTemplate,
  lifetimeStars,
  onRewardsChanged,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-2 border border-border-default rounded-t-2xl sm:rounded-2xl w-full sm:max-w-[480px] max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-gold text-[11px] font-syne uppercase tracking-[0.18em]">
              Rewards
            </span>
            <h2 className="text-text-primary text-lg font-syne font-semibold mt-0.5">
              {game.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-3 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-4 transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <p className="px-6 text-xs text-text-tertiary mb-4 flex-shrink-0">
          Set rewards for each star milestone. Bonuses repeat automatically.
        </p>

        {/* Scrollable body */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <RewardEditor
            game={game}
            mainRewards={mainRewards}
            bonusRewards={bonusRewards}
            bonusTemplate={bonusTemplate}
            lifetimeStars={lifetimeStars}
            onRewardsChanged={onRewardsChanged}
          />
        </div>
      </div>
    </div>
  );
}