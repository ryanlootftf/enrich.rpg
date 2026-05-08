"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { gameFromRow, type GameRow } from "@/lib/db-helpers";
import type { Game, Achievement, Reward, FilterDifficulty } from "@/app/types";
import { AchievementItem } from "@/components/achievements/achievement-item";
import { RewardItem } from "@/components/rewards/reward-item";
import { AIModal } from "@/components/ai/ai-modal";
import { mockAIResults } from "@/app/mock-data";

const themeGradients: Record<string, string> = {
  purple: "from-[#7c6aff] to-[#a08bff]",
  teal: "from-[#2dd4bf] to-[#34d399]",
  coral: "from-[#f97060] to-[#fb923c]",
  gold: "from-[#f4c430] to-[#fbbf24]",
};

interface AchievementRow {
  id: string;
  game_id: string;
  title: string;
  difficulty: string;
  stars_rewarded: number;
  completed: boolean;
}

interface RewardRow {
  id: string;
  game_id: string;
  title: string;
  required_stars: number;
  type: string;
  claimed: boolean;
  emoji: string;
  is_final: boolean;
}

function achievementFromRow(row: AchievementRow): Achievement {
  return {
    id: row.id,
    gameId: row.game_id,
    title: row.title,
    difficulty: row.difficulty as Achievement["difficulty"],
    starsRewarded: row.stars_rewarded,
    completed: row.completed,
  };
}

function rewardFromRow(row: RewardRow): Reward {
  return {
    id: row.id,
    gameId: row.game_id,
    title: row.title,
    requiredStars: row.required_stars,
    type: row.type as Reward["type"],
    claimed: row.claimed,
    emoji: row.emoji,
  };
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const supabase = createClient();

  const [game, setGame] = useState<Game | null | undefined>(undefined);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mainRewards, setMainRewards] = useState<Reward[]>([]);
  const [bonusRewards, setBonusRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterDifficulty>("all");
  const [aiOpen, setAiOpen] = useState(false);

  // Fetch game + achievements + rewards from Supabase
  useEffect(() => {
    async function load() {
      // Fetch game
      const { data: gameRow } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (!gameRow) {
        setGame(null);
        setLoading(false);
        return;
      }

      setGame(gameFromRow(gameRow as GameRow));

      // Fetch achievements
      const { data: achRows } = await supabase
        .from("achievements")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });

      const achs = (achRows ?? []).map((r: AchievementRow) => achievementFromRow(r));
      setAchievements(achs);

      // Fetch rewards
      const { data: rewRows } = await supabase
        .from("rewards")
        .select("*")
        .eq("game_id", gameId)
        .order("required_stars", { ascending: true });

      const allRewards = (rewRows ?? []).map((r: RewardRow) => rewardFromRow(r));
      setMainRewards(allRewards.filter((r) => r.type === "MAIN_TRACK"));
      setBonusRewards(allRewards.filter((r) => r.type === "BONUS_TRACK"));

      setLoading(false);
    }

    load();
  }, [gameId, supabase]);

  const toggleAchievement = async (id: string) => {
    // Optimistic update
    const prev = achievements;
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );

    // Find the achievement being toggled
    const ach = achievements.find((a) => a.id === id);
    if (!ach) return;

    const newCompleted = !ach.completed;

    // Update in Supabase — the DB trigger handles star counting
    const { error } = await supabase
      .from("achievements")
      .update({ completed: newCompleted })
      .eq("id", id);

    if (error) {
      // Revert on error
      setAchievements(prev);
      console.error("Failed to toggle achievement:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-tertiary text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🎮</div>
        <h1 className="text-xl font-syne font-semibold text-text-primary">
          Game not found
        </h1>
        <p className="text-text-tertiary text-sm">
          This quest doesn't exist or may have been removed.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-accent-2 transition-colors"
        >
          Back to Quests
        </button>
      </div>
    );
  }

  const completedCount = achievements.filter((a) => a.completed).length;
  const totalStarsEarned = achievements
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + a.starsRewarded, 0);

  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.difficulty === filter);

  const progress = Math.min(
    Math.round((game.lifetimeStars / game.totalPossibleStars) * 100),
    100
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-text-tertiary text-xs hover:text-text-primary transition-colors flex items-center gap-1"
      >
        ← Back to all quests
      </button>

      {/* Hero header */}
      <section>
        <div
          className={`h-[3px] w-full rounded-full mb-6 bg-gradient-to-r ${
            themeGradients[game.theme]
          }`}
        />
        <h1 className="text-2xl font-syne font-bold text-text-primary mb-2">
          {game.title}
        </h1>
        <p className="text-text-secondary text-sm mb-5">{game.description}</p>

        {/* Stats row */}
        <div className="flex gap-6 flex-wrap">
          <div>
            <span className="text-text-tertiary text-[10px] uppercase tracking-[0.12em]">
              Stars
            </span>
            <div className="text-lg font-syne font-bold text-text-primary">
              {totalStarsEarned}{" "}
              <span className="text-text-tertiary text-sm font-normal">
                / {game.totalPossibleStars}
              </span>
            </div>
          </div>
          <div>
            <span className="text-text-tertiary text-[10px] uppercase tracking-[0.12em]">
              Completed
            </span>
            <div className="text-lg font-syne font-bold text-text-primary">
              {completedCount}{" "}
              <span className="text-text-tertiary text-sm font-normal">
                / {achievements.length} quests
              </span>
            </div>
          </div>
          <div>
            <span className="text-text-tertiary text-[10px] uppercase tracking-[0.12em]">
              Progress
            </span>
            <div className="text-lg font-syne font-bold text-text-primary">
              {progress}
              {!game.isBonus && (
                <span className="text-text-tertiary text-sm font-normal">
                  %
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-border-subtle rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${
              themeGradients[game.theme]
            } transition-[width] duration-600 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Achievements / Quests */}
      <section className="screen">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-label mb-0">Quests</h2>
          <button
            onClick={() => setAiOpen(true)}
            className="text-[11px] font-medium text-accent-2 hover:text-accent transition-colors flex items-center gap-1"
          >
            ✦ AI Coach
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "easy", "medium", "hard"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1 rounded-full font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-accent/15 text-accent-2"
                  : "bg-bg-2 border border-border-subtle text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {filteredAchievements.length === 0 ? (
            <p className="text-text-tertiary text-xs py-6 text-center">
              {achievements.length === 0
                ? "No quests yet. Use the AI Coach to generate some!"
                : "No quests for this filter."}
            </p>
          ) : (
            filteredAchievements.map((ach) => (
              <AchievementItem
                key={ach.id}
                achievement={ach}
                onToggle={toggleAchievement}
              />
            ))
          )}
        </div>
      </section>

      {/* Rewards — Main Track */}
      {mainRewards.length > 0 && (
        <section className="screen">
          <h2 className="section-label">Main Track Rewards</h2>
          <div className="flex flex-col gap-2">
            {mainRewards.map((reward) => (
              <RewardItem key={reward.id} reward={reward} />
            ))}
          </div>
        </section>
      )}

      {/* Rewards — Bonus Track */}
      {bonusRewards.length > 0 && (
        <section className="screen">
          <div className="divider-label">Bonus Track Rewards</div>
          <div className="flex flex-col gap-2">
            {bonusRewards.map((reward) => (
              <RewardItem key={reward.id} reward={reward} />
            ))}
          </div>
        </section>
      )}

      {/* AI Modal */}
      <AIModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        gameTitle={game.title}
        results={mockAIResults}
      />
    </div>
  );
}