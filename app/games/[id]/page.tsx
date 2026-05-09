"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { gameFromRow, type GameRow } from "@/lib/db-helpers";
import type { Game, Achievement, Reward, FilterDifficulty } from "@/app/types";
import { AchievementItem } from "@/components/achievements/achievement-item";
import { RewardModal } from "@/components/rewards/reward-modal";
import { AIModal } from "@/components/ai/ai-modal";
import type { AIResult } from "@/app/types";
import {
  createAchievement,
  deleteAchievement,
  type Difficulty,
} from "@/app/actions/achievements";
import { QuestDetailModal } from "@/components/achievements/quest-detail-modal";

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
  description: string;
  difficulty: string;
  stars_rewarded: number;
  completed: boolean;
  progress_max: number;
  progress_current: number;
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
    description: row.description ?? "",
    difficulty: row.difficulty as Achievement["difficulty"],
    starsRewarded: row.stars_rewarded,
    completed: row.completed,
    progressMax: row.progress_max ?? 0,
    progressCurrent: row.progress_current ?? 0,
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
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterDifficulty>("all");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("easy");
  const [newProgressMax, setNewProgressMax] = useState(1);
  const [creating, setCreating] = useState(false);

  // Modal state
  const [selectedQuest, setSelectedQuest] = useState<Achievement | null>(null);

  // Refs for focus management
  const createInputRef = useRef<HTMLInputElement>(null);

  // Reusable reward fetcher — called on initial load and after claim/upsert
  async function fetchRewards() {
    const { data: rewRows } = await supabase
      .from("rewards")
      .select("*")
      .eq("game_id", gameId)
      .order("required_stars", { ascending: true });

    const allRewards = (rewRows ?? []).map((r: RewardRow) => rewardFromRow(r));
    setRewards(allRewards);
  }

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

      const achs = (achRows ?? []).map((r: AchievementRow) =>
        achievementFromRow(r)
      );
      setAchievements(achs);

      // Fetch rewards
      await fetchRewards();

      setLoading(false);
    }

    load();
  }, [gameId, supabase]);

  // Focus management
  useEffect(() => {
    if (showCreateForm && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [showCreateForm]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createAchievement(
        gameId,
        newTitle.trim(),
        newDifficulty,
        newDescription.trim() || undefined,
        newProgressMax > 0 ? newProgressMax : undefined
      );
      setNewTitle("");
      setNewDescription("");
      setNewDifficulty("easy");
      setNewProgressMax(0);
      setShowCreateForm(false);
      // Refetch after creation
      const { data: achRows } = await supabase
        .from("achievements")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });
      setAchievements((achRows ?? []).map((r: AchievementRow) => achievementFromRow(r)));
    } catch (e) {
      console.error("Failed to create achievement:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quest?")) return;
    try {
      await deleteAchievement(id, gameId);
      // Refetch
      const { data: achRows } = await supabase
        .from("achievements")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });
      setAchievements((achRows ?? []).map((r: AchievementRow) => achievementFromRow(r)));
    } catch (e) {
      console.error("Failed to delete achievement:", e);
    }
  };

  const handleQuestClick = (ach: Achievement) => {
    setSelectedQuest(ach);
  };

  const handleQuestUpdate = (updated: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    setSelectedQuest(updated);
  };

  const handleQuestDelete = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    setSelectedQuest(null);
  };

  const handleAiOpen = async () => {
    setAiOpen(true);
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: game?.title ?? "" }),
      });
      const data = await res.json();
      if (data.achievements && Array.isArray(data.achievements)) {
        setAiResults(
          data.achievements.map((a: Record<string, unknown>) => ({
            title: String(a.title ?? ""),
            description: String(a.description ?? ""),
            difficulty: a.difficulty as AIResult["difficulty"],
            starsRewarded: Number(a.stars_rewarded ?? 5),
            selected: true,
          }))
        );
      }
    } catch (e) {
      console.error("AI generation failed:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAiQuests = async (results: AIResult[]) => {
    const selected = results.filter((r) => r.selected);
    for (const r of selected) {
      try {
        await createAchievement(
          gameId,
          r.title,
          r.difficulty,
          r.description || undefined,
          0
        );
      } catch (e) {
        console.error("Failed to add AI quest:", e);
      }
    }
    // Refetch achievements
    const { data: achRows } = await supabase
      .from("achievements")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });
    setAchievements((achRows ?? []).map((r: AchievementRow) => achievementFromRow(r)));
    setAiOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-bg-2 border border-border-subtle rounded-2xl min-h-screen flex items-center justify-center">
        <div className="text-text-tertiary text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-bg-2 border border-border-subtle rounded-2xl min-h-screen flex flex-col items-center justify-center gap-4">
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
  const totalPossibleStars = achievements.reduce(
    (sum, a) => sum + a.starsRewarded,
    0
  );

  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.difficulty === filter);

  const progress =
    totalPossibleStars > 0
      ? Math.min(Math.round((totalStarsEarned / totalPossibleStars) * 100), 100)
      : 0;

  return (
    <>
      {/* Back link - outside card */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-text-tertiary text-xs hover:text-text-primary transition-colors flex items-center gap-1 mb-4"
      >
        ← Back to all quests
      </button>

      {/* Card wrapping entire page content */}
      <div className="bg-bg-2 border border-border-subtle rounded-2xl p-6 min-h-[calc(100vh-6rem)] space-y-10">
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

        {achievements.length === 0 ? (
          /* Empty state — no quests yet, clickable to open form */
          <div
            onClick={() => setShowCreateForm(true)}
            className="bg-bg-2 border border-dashed border-border-tertiary/40 rounded-2xl p-6 text-center space-y-3 cursor-pointer hover:bg-bg-3 transition-colors"
          >
            <div className="text-3xl">🧭</div>
            <div>
              <p className="text-sm font-syne font-semibold text-text-primary">
                Ready to start your quest?
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Add your first quest to begin earning stars and tracking progress.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="flex gap-6 flex-wrap">
              <div>
                <span className="text-text-tertiary text-[10px] uppercase tracking-[0.12em]">
                  Stars
                </span>
                <div className="text-lg font-syne font-bold text-text-primary">
                  {totalStarsEarned}{" "}
                  <span className="text-text-tertiary text-sm font-normal">
                    / {totalPossibleStars}
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

            {/* Set Rewards button */}
            <button
              onClick={() => setRewardModalOpen(true)}
              className="mt-5 text-[11px] font-medium text-gold hover:text-gold-2 transition-colors flex items-center gap-1"
            >
              🎁 Set Rewards
            </button>
          </>
        )}
      </section>

      {/* Achievements / Quests */}
      <section className="screen">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-label mb-0">Quests</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCreateForm(true);
                setAiOpen(false);
              }}
              className="text-[11px] font-medium text-accent-2 hover:text-accent transition-colors flex items-center gap-1"
            >
              ＋ New Quest
            </button>
            <button
              onClick={handleAiOpen}
              className="text-[11px] font-medium text-accent-2 hover:text-accent transition-colors flex items-center gap-1"
            >
              ✦ AI Coach
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="mb-4 bg-bg-2 border border-border-subtle rounded-xl p-4 space-y-4">
            {/* ── Quest details ── */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Quest title
                </label>
                <input
                  ref={createInputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Read 5 books"
                  maxLength={60}
                  className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setShowCreateForm(false);
                  }}
                />
                <span className="block text-right text-[10px] text-text-tertiary mt-0.5">
                  {newTitle.length}/60
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                  }}
                  placeholder="What's the goal? Any rewards or context..."
                  maxLength={200}
                  rows={2}
                  className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors resize-none min-h-[80px]"
                />
                <span className="block text-right text-[10px] text-text-tertiary mt-0.5">
                  {newDescription.length}/200
                </span>
              </div>
            </div>

            {/* ── Quest settings card ── */}
            <div className="bg-bg-3/50 border border-border-subtle/50 rounded-xl p-4 space-y-4">
              <span className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                Quest settings
              </span>

              {/* Difficulty toggles */}
              <div>
                <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                  Difficulty
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      { value: "easy", label: "Easy", dot: "bg-green-400" },
                      { value: "medium", label: "Medium", dot: "bg-gold" },
                      { value: "hard", label: "Hard", dot: "bg-coral" },
                    ] as const
                  ).map(({ value, label, dot }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewDifficulty(value as Difficulty)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                        newDifficulty === value
                          ? "border-accent bg-accent/10 text-accent-2"
                          : "border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary hover:border-border-default"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Steps counter */}
              <div>
                <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                  Steps
                </span>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewProgressMax(Math.max(1, newProgressMax - 1))
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-sm leading-none"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-text-primary tabular-nums">
                    {newProgressMax}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewProgressMax(Math.min(999, newProgressMax + 1))
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-sm leading-none"
                  >
                    +
                  </button>
                  <span className="text-text-tertiary text-[10px]">steps</span>
                </div>
                {/* Progress bar */}
                <div className="h-[3px] bg-border-subtle rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-accent rounded-full transition-[width] duration-200"
                    style={{
                      width: `${Math.min((newProgressMax / 100) * 100, 100)}%`,
                    }}
                  />
                </div>
                {/* Presets */}
                <div className="flex gap-1.5">
                  {[1, 3, 5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewProgressMax(n)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                        newProgressMax === n
                          ? "border-accent bg-accent/10 text-accent-2"
                          : "border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary hover:border-border-default"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Buttons ── */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim()}
                className="bg-[#534AB7] text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Adding…" : "⚡ Add Quest"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-transparent text-text-tertiary text-xs px-3 py-2.5 hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showCreateForm && !aiOpen && (
          <>
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

            <div className="flex flex-col gap-2.5">
              {filteredAchievements.length === 0 ? (
                <p className="text-text-tertiary text-xs py-6 text-center">
                  {achievements.length === 0
                    ? "No quests yet. Add one with ＋ New Quest or use the AI Coach!"
                    : "No quests for this filter."}
                </p>
              ) : (
                filteredAchievements.map((ach) => (
                  <AchievementItem
                    key={ach.id}
                    achievement={ach}
                    onClick={handleQuestClick}
                  />
                ))
              )}
            </div>
          </>
        )}
      </section>

      </div>

      {/* AI Modal — outside card */}
      <AIModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        gameTitle={game.title}
        results={aiResults}
        loading={aiLoading}
        onAddQuests={handleAddAiQuests}
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        game={game}
        mainRewards={rewards.filter((r) => r.type === "MAIN_TRACK")}
        bonusRewards={rewards.filter((r) => r.type === "BONUS_TRACK" && r.requiredStars > 0)}
        bonusTemplate={rewards.find((r) => r.type === "BONUS_TRACK" && r.requiredStars === 0) ?? null}
        lifetimeStars={totalStarsEarned}
        onRewardsChanged={fetchRewards}
      />

      {/* Quest Detail Modal — outside card */}
      {selectedQuest && (
        <QuestDetailModal
          achievement={selectedQuest}
          gameId={gameId}
          onClose={() => setSelectedQuest(null)}
          onUpdate={handleQuestUpdate}
          onDelete={handleQuestDelete}
        />
      )}
    </>
  );
}
