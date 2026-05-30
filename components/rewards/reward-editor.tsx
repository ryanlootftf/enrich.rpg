"use client";

import { useState } from "react";
import type { Game, Reward } from "@/app/types";
import { upsertReward, claimReward, unclaimReward } from "@/app/actions/rewards";

// Emoji quick-pick palette
const EMOJI_PALETTE = ["🎁", "🍕", "🍦", "🎮", "🎬", "📚", "☕", "🍩", "🎵", "💻", "🏆", "✨", "🔥", "💎", "🌴", "🍹"];

const MAIN_MILESTONES = [1, 10, 25, 50, 100] as const;
const BONUS_INTERVAL = 20; // every 20 stars after 100

interface Props {
  game: Game;
  mainRewards: Reward[];
  bonusRewards: Reward[]; // claimable bonus rewards (NOT the template)
  bonusTemplate: Reward | null; // the single BONUS_TRACK template
  lifetimeStars: number;
  onRewardsChanged: () => Promise<void>;
}

export function RewardEditor({ game, mainRewards, bonusRewards, bonusTemplate, lifetimeStars, onRewardsChanged }: Props) {
  return (
    <section className="space-y-8">
      <h2 className="section-label">Rewards</h2>

      {/* Main Track */}
      <div className="space-y-3">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Main Track
          </p>
        <div className="flex flex-col gap-2.5">
          {MAIN_MILESTONES.map((stars) => {
            const existing = mainRewards.find((r) => r.requiredStars === stars);
            return (
              <MilestoneSlot
                key={`main-${stars}`}
                gameId={game.id}
                requiredStars={stars}
                existingReward={existing ?? null}
                isFinal={stars === 100}
                lifetimeStars={lifetimeStars}
                type="MAIN_TRACK"
                onRewardsChanged={onRewardsChanged}
              />
            );
          })}
        </div>
      </div>

      {/* Bonus Track */}
      <div className="space-y-3">
        <div className="divider-label">Bonus Track Rewards</div>
        <p className="text-xs text-text-tertiary">
          Set one reward — it repeats every {BONUS_INTERVAL} ★ after 100 ★
        </p>
        <MilestoneSlot
          key="bonus-template"
          gameId={game.id}
          requiredStars={0}
          existingReward={bonusTemplate ?? null}
          isFinal={false}
          lifetimeStars={lifetimeStars}
          type="BONUS_TRACK"
          onRewardsChanged={onRewardsChanged}
        />

        {/* Claimable bonus rewards (generated from template) */}
        {bonusRewards.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-3">
            {bonusRewards.map((reward) => (
              <ClaimableBonusCard
                key={reward.id}
                reward={reward}
                gameId={game.id}
                onRewardsChanged={onRewardsChanged}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** One main-track or bonus-template slot */
function MilestoneSlot({
  gameId,
  requiredStars,
  existingReward,
  isFinal,
  lifetimeStars,
  type,
  onRewardsChanged,
}: {
  gameId: string;
  requiredStars: number;
  existingReward: Reward | null;
  isFinal: boolean;
  lifetimeStars: number;
  type: "MAIN_TRACK" | "BONUS_TRACK";
  onRewardsChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(existingReward?.title ?? "");
  const [emoji, setEmoji] = useState(existingReward?.emoji ?? "🎁");
  const [saving, setSaving] = useState(false);

  const isTemplate = type === "BONUS_TRACK";
  const unlocked = !isTemplate && lifetimeStars >= requiredStars;
  const claimed = existingReward?.claimed ?? false;

  let statusLabel = "";
  let statusClass = "";
  let bgClass = "bg-bg-2";
  let borderClass = "border-border-subtle";

  if (isTemplate) {
    statusLabel = "Template";
    statusClass = "bg-gold/10 text-gold-2";
    bgClass = "bg-gold/5";
    borderClass = "border-gold/30";
  } else if (claimed) {
    statusLabel = "Claimed";
    statusClass = "bg-green/10 text-green";
  } else if (unlocked) {
    statusLabel = "Unlocked";
    statusClass = "bg-accent/15 text-accent-2";
    borderClass = "border-accent/40";
    bgClass = "bg-accent/5";
  } else {
    statusLabel = "Locked";
    statusClass = "bg-bg-4 text-text-tertiary";
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await upsertReward(gameId, requiredStars, title.trim(), emoji, type, isFinal);
      await onRewardsChanged();
      setEditing(false);
    } catch (e) {
      console.error("Failed to save reward:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleClaim = async () => {
    if (!existingReward) return;
    try {
      await claimReward(existingReward.id, gameId);
      await onRewardsChanged();
    } catch (e) {
      console.error("Failed to claim reward:", e);
    }
  };

  const handleUnclaim = async () => {
    if (!existingReward) return;
    try {
      await unclaimReward(existingReward.id, gameId);
      await onRewardsChanged();
    } catch (e) {
      console.error("Failed to unclaim reward:", e);
    }
  };

  const starLabel = isTemplate
    ? `every ${BONUS_INTERVAL} ★`
    : `${requiredStars} ★${isFinal ? " — final reward" : ""}`;

  if (editing) {
    return (
      <div className={`${bgClass} ${borderClass} border rounded-xl p-4 space-y-3`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">{starLabel}</span>
        </div>

        {/* Emoji picker */}
        <div>
          <label className="block text-xs text-text-tertiary mb-1">Emoji</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EMOJI_PALETTE.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm border transition-colors ${
                  emoji === e
                    ? "border-accent bg-accent/15"
                    : "border-border-subtle bg-transparent hover:border-border-default"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title input */}
        <div>
          <label className="block text-xs text-text-tertiary mb-1">Reward name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isTemplate ? "Bonus reward" : `Reward at ${requiredStars} stars`}
            maxLength={40}
            className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bg-accent text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setTitle(existingReward?.title ?? "");
              setEmoji(existingReward?.emoji ?? "🎁");
              setEditing(false);
            }}
            className="text-text-tertiary text-xs px-2 py-1.5 hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgClass} ${borderClass} border rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        claimed ? "opacity-50" : ""
      }`}
    >
      {/* Emoji */}
      <div
        className={`w-9 h-9 rounded-[10px] bg-bg-3 flex items-center justify-center text-sm flex-shrink-0 border ${
          unlocked && !isTemplate && !claimed
            ? "border-accent/40"
            : isTemplate
            ? "border-gold/30"
            : "border-border-subtle"
        }`}
      >
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary truncate">
          {title || (isTemplate ? "Set bonus reward…" : `Set ${requiredStars} ★ reward…`)}
        </div>
        <div className="text-xs text-zinc-500 mt-0">
          {starLabel}
          {unlocked && !claimed && !isTemplate && (
            <span className="text-accent-2 ml-1">— available</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {unlocked && !claimed && !isTemplate && (
          <button
            onClick={handleClaim}
          className="text-xs font-medium text-accent-2 hover:text-accent transition-colors px-2 py-1"
          >
            Claim
          </button>
        )}
        {claimed && !isTemplate && (
          <button
            onClick={handleUnclaim}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors px-2 py-1"
          >
            Unclaim
          </button>
        )}
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1"
        >
          {existingReward ? "Edit" : "Set"}
        </button>
      </div>

      {/* Status badge */}
      <span
        className={`text-xs px-[10px] py-0.5 rounded-full font-medium flex-shrink-0 ${statusClass}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}

/** A generated claimable bonus reward card */
function ClaimableBonusCard({ reward, gameId, onRewardsChanged }: { reward: Reward; gameId: string; onRewardsChanged: () => Promise<void> }) {
  const claimed = reward.claimed;

  const handleClaim = async () => {
    try {
      await claimReward(reward.id, gameId);
      await onRewardsChanged();
    } catch (e) {
      console.error("Failed to claim bonus reward:", e);
    }
  };

  const handleUnclaim = async () => {
    try {
      await unclaimReward(reward.id, gameId);
      await onRewardsChanged();
    } catch (e) {
      console.error("Failed to unclaim bonus reward:", e);
    }
  };

  return (
    <div
      className={`bg-gold/5 border border-gold/30 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        claimed ? "opacity-50" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-[10px] bg-bg-3 flex items-center justify-center text-sm flex-shrink-0 border border-gold/30">
        {reward.emoji}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text-primary">{reward.title}</div>
        <div className="text-xs text-zinc-500 mt-0">at {reward.requiredStars} ★ — bonus reward</div>
      </div>
      <div className="flex items-center gap-1.5">
        {!claimed ? (
          <button
            onClick={handleClaim}
          className="text-xs font-medium text-gold-2 hover:text-gold transition-colors px-2 py-1"
          >
            Claim
          </button>
        ) : (
          <button
            onClick={handleUnclaim}
          className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors px-2 py-1"
          >
            Unclaim
          </button>
        )}
        {claimed && (
          <span className="text-xs px-[10px] py-0.5 rounded-full font-medium bg-green/10 text-green">
            Claimed
          </span>
        )}
      </div>
    </div>
  );
}