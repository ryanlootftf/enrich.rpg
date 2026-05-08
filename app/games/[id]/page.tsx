"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { gameFromRow, type GameRow } from "@/lib/db-helpers";
import type { Game, Achievement, Reward, FilterDifficulty } from "@/app/types";
import { AchievementItem } from "@/components/achievements/achievement-item";
import { RewardItem } from "@/components/rewards/reward-item";
import { AIModal } from "@/components/ai/ai-modal";
import { mockAIResults } from "@/app/mock-data";
import {
  createAchievement,
  deleteAchievement,
  updateAchievementTitle,
  updateAchievementDescription,
  type Difficulty,
} from "@/app/actions/achievements";

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
  const [mainRewards, setMainRewards] = useState<Reward[]>([]);
  const [bonusRewards, setBonusRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterDifficulty>("all");
  const [aiOpen, setAiOpen] = useState(false);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("easy");
  const [newProgressMax, setNewProgressMax] = useState(0);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Refs for focus management
  const createInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Focus management
  useEffect(() => {
    if (showCreateForm && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [showCreateForm]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

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

  const startEdit = (ach: Achievement) => {
    setEditingId(ach.id);
    setEditTitle(ach.title);
    setEditDescription(ach.description);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      if (editTitle.trim()) {
        await updateAchievementTitle(editingId, gameId, editTitle.trim());
      }
      await updateAchievementDescription(
        editingId,
        gameId,
        editDescription.trim()
      );
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      // Refetch
      const { data: achRows } = await supabase
        .from("achievements")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });
      setAchievements((achRows ?? []).map((r: AchievementRow) => achievementFromRow(r)));
    } catch (e) {
      console.error("Failed to update achievement:", e);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
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
              onClick={() => setAiOpen(true)}
              className="text-[11px] font-medium text-accent-2 hover:text-accent transition-colors flex items-center gap-1"
            >
              ✦ AI Coach
            </button>
          </div>
        </div>

        {/* Create form — card with stepper */}
        {showCreateForm && (
          <div className="mb-4 bg-bg-2 border border-border-subtle rounded-xl p-4 space-y-3">
            <input
              ref={createInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Quest title…"
              className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowCreateForm(false);
              }}
            />
            <div className="h-px bg-border-subtle" />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional description…"
              rows={2}
              className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors resize-none"
            />
            <div className="h-px bg-border-subtle" />
            <div className="flex items-center gap-3 flex-wrap isolate">
              <select
                value={newDifficulty}
                onChange={(e) =>
                  setNewDifficulty(e.target.value as Difficulty)
                }
                className="bg-bg-1 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors"
              >
                <option value="easy">Easy (1★)</option>
                <option value="medium">Medium (3★)</option>
                <option value="hard">Hard (5★)</option>
              </select>
              <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                Progress:
                <button
                  type="button"
                  onClick={() => setNewProgressMax(Math.max(0, newProgressMax - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-sm leading-none"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-text-primary tabular-nums">
                  {newProgressMax}
                </span>
                <button
                  type="button"
                  onClick={() => setNewProgressMax(Math.min(999, newProgressMax + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-sm leading-none"
                >
                  +
                </button>
                <span className="text-text-tertiary text-[10px]">steps</span>
              </span>
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim()}
                className="bg-accent text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Adding…" : "Add Quest"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-text-tertiary text-xs hover:text-text-secondary transition-colors px-2 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                ? "No quests yet. Add one with ＋ New Quest or use the AI Coach!"
                : "No quests for this filter."}
            </p>
          ) : (
            filteredAchievements.map((ach) => (
              <div key={ach.id} className="group relative">
                {editingId === ach.id ? (
                  /* Inline edit */
                  <div className="bg-bg-2 border border-border-subtle rounded-xl px-[14px] py-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-bg-1 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button
                        onClick={saveEdit}
                        className="text-xs text-accent-2 hover:text-accent font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description…"
                      rows={2}
                      className="w-full bg-bg-1 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                ) : (
                  /* Normal row with hover actions */
                  <div className="relative">
                    <AchievementItem
                      achievement={ach}
                      onToggle={toggleAchievement}
                    />
                    {/* Hover actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(ach)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-1 transition-colors text-xs"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(ach.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-coral hover:bg-bg-1 transition-colors text-xs"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
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