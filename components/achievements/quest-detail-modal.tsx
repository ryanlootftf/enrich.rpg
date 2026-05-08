"use client";

import { useState, useEffect, useRef } from "react";
import type { Achievement } from "@/app/types";
import type { Difficulty } from "@/app/actions/achievements";
import {
  updateAchievementTitle,
  updateAchievementDescription,
  updateAchievementProgressBy,
  updateAchievementProgressMax,
  updateAchievementDifficulty,
  deleteAchievement,
} from "@/app/actions/achievements";
import { createClient } from "@/lib/supabase/client";

const diffColors: Record<string, string> = {
  easy: "text-green",
  medium: "text-gold-2",
  hard: "text-coral",
};

const diffConfig = [
  { value: "easy" as Difficulty, label: "Easy", dot: "bg-green-400" },
  { value: "medium" as Difficulty, label: "Medium", dot: "bg-gold" },
  { value: "hard" as Difficulty, label: "Hard", dot: "bg-coral" },
];

interface Props {
  achievement: Achievement;
  gameId: string;
  onClose: () => void;
  onUpdate: (updated: Achievement) => void;
  onDelete: (id: string) => void;
}

export function QuestDetailModal({
  achievement,
  gameId,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const supabase = createClient();

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(achievement.title);
  const [editDescription, setEditDescription] = useState(achievement.description);
  const [editProgressMax, setEditProgressMax] = useState(achievement.progressMax);
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>(
    achievement.difficulty as Difficulty
  );

  // Local progress (for optimistic updates)
  const [progressCurrent, setProgressCurrent] = useState(
    achievement.progressCurrent
  );
  const [completed, setCompleted] = useState(achievement.completed);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editing]);

  const hasProgress = achievement.progressMax > 0;
  const progressPct = hasProgress
    ? Math.min(Math.round((progressCurrent / achievement.progressMax) * 100), 100)
    : 0;

  const handleProgressDelta = async (delta: number) => {
    // Optimistic update
    const newCurrent = Math.max(
      0,
      Math.min(progressCurrent + delta, achievement.progressMax)
    );
    const newCompleted = hasProgress ? newCurrent >= achievement.progressMax : completed;
    setProgressCurrent(newCurrent);
    setCompleted(newCompleted);

    try {
      await updateAchievementProgressBy(achievement.id, gameId, delta);
      const { data: achRow } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", achievement.id)
        .single();
      if (achRow) {
        const updated: Achievement = {
          ...achievement,
          progressCurrent: achRow.progress_current ?? 0,
          completed: achRow.completed ?? false,
        };
        onUpdate(updated);
      }
    } catch (err) {
      // Revert
      setProgressCurrent(achievement.progressCurrent);
      setCompleted(achievement.completed);
      console.error("Failed to update progress:", err);
    }
  };

  const handleToggleComplete = async () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);

    try {
      await updateAchievementProgressBy(
        achievement.id,
        gameId,
        newCompleted ? achievement.progressMax - progressCurrent : -progressCurrent
      );
      const { data: achRow } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", achievement.id)
        .single();
      if (achRow) {
        const updated: Achievement = {
          ...achievement,
          progressCurrent: achRow.progress_current ?? 0,
          completed: achRow.completed ?? false,
        };
        onUpdate(updated);
        setProgressCurrent(achRow.progress_current ?? 0);
      }
    } catch (err) {
      setCompleted(achievement.completed);
      console.error("Failed to toggle complete:", err);
    }
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      if (editTitle.trim() && editTitle.trim() !== achievement.title) {
        await updateAchievementTitle(achievement.id, gameId, editTitle.trim());
      }
      if (editDescription.trim() !== achievement.description) {
        await updateAchievementDescription(achievement.id, gameId, editDescription.trim());
      }
      if (editProgressMax !== achievement.progressMax) {
        await updateAchievementProgressMax(achievement.id, gameId, editProgressMax);
      }
      if (editDifficulty !== achievement.difficulty) {
        await updateAchievementDifficulty(achievement.id, gameId, editDifficulty);
      }

      const { data: achRow } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", achievement.id)
        .single();

      if (achRow) {
        const updated: Achievement = {
          ...achievement,
          title: editTitle.trim(),
          description: editDescription.trim(),
          progressMax: editProgressMax,
          difficulty: editDifficulty as Achievement["difficulty"],
          starsRewarded: achRow.stars_rewarded ?? achievement.starsRewarded,
          progressCurrent: achRow.progress_current ?? progressCurrent,
          completed: achRow.completed ?? completed,
        };
        onUpdate(updated);
      }

      setEditing(false);
    } catch (err) {
      console.error("Failed to save edits:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this quest?")) return;
    setDeleting(true);
    try {
      await deleteAchievement(achievement.id, gameId);
      onDelete(achievement.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete:", err);
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-bg-2 border border-border-subtle rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-base font-syne font-bold text-text-primary">
            Quest Details
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-1 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Title & Edit button */}
          <div className="flex items-start justify-between gap-3">
            {editing ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={60}
                className="flex-1 bg-bg-1 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
              />
            ) : (
              <div className="flex-1">
                <div
                  className={`text-[15px] font-syne font-semibold ${
                    completed ? "text-text-tertiary line-through" : "text-text-primary"
                  }`}
                >
                  {achievement.title}
                </div>
              </div>
            )}
            {!editing && (
              <button
                onClick={() => {
                  setEditTitle(achievement.title);
                  setEditDescription(achievement.description);
                  setEditProgressMax(achievement.progressMax);
                  setEditDifficulty(achievement.difficulty as Difficulty);
                  setEditing(true);
                }}
                className="text-xs text-accent-2 hover:text-accent font-medium transition-colors flex-shrink-0"
              >
                ✎ Edit
              </button>
            )}
          </div>

          {/* Difficulty */}
          <div>
            {editing ? (
              <div>
                <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                  Difficulty
                </span>
                <div className="flex gap-2">
                  {diffConfig.map(({ value, label, dot }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditDifficulty(value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                        editDifficulty === value
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
            ) : (
              <div
                className={`text-[11px] font-medium uppercase tracking-[0.06em] ${diffColors[achievement.difficulty]}`}
              >
                {achievement.difficulty}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <span className="block text-[11px] font-medium text-text-secondary mb-1">
              Description
            </span>
            {editing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
                placeholder="What's the goal?"
                maxLength={200}
                rows={2}
                className="w-full bg-bg-1 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors resize-none"
              />
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed">
                {achievement.description || (
                  <span className="text-text-tertiary italic">No description</span>
                )}
              </p>
            )}
          </div>

          {/* Stars */}
          <div className="text-xs text-gold font-medium">
            +{achievement.starsRewarded} ★
          </div>

          {/* Progress section */}
          {hasProgress && (
            <div className="bg-bg-3/50 border border-border-subtle/50 rounded-xl p-4 space-y-3">
              <span className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                Progress
              </span>

              {/* Progress bar */}
              <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    completed ? "from-green-400 to-emerald-500" : "bg-accent"
                  } transition-[width] duration-300 ease-out`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* - / count / + */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleProgressDelta(-1)}
                  disabled={progressCurrent <= 0}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-lg font-syne font-bold text-text-primary tabular-nums min-w-[80px] text-center">
                  {progressCurrent} / {editing ? editProgressMax : achievement.progressMax}
                </span>
                <button
                  type="button"
                  onClick={() => handleProgressDelta(1)}
                  disabled={progressCurrent >= achievement.progressMax || completed}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent transition-colors text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Steps target edit */}
              {editing && (
                <div>
                  <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                    Steps target
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditProgressMax(Math.max(0, editProgressMax - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary transition-colors text-sm leading-none"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-text-primary tabular-nums">
                      {editProgressMax}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditProgressMax(Math.min(999, editProgressMax + 1))}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-1 border border-border-subtle text-text-secondary hover:text-text-primary transition-colors text-sm leading-none"
                    >
                      +
                    </button>
                    <span className="text-text-tertiary text-[10px]">steps</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[3, 5, 10, 20].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEditProgressMax(n)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                          editProgressMax === n
                            ? "border-accent bg-accent/10 text-accent-2"
                            : "border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary hover:border-border-default"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mark as complete */}
          {!editing && (
            <button
              onClick={handleToggleComplete}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors ${
                completed
                  ? "bg-green-400/10 border-green-400/30 text-green-400 hover:bg-green-400/20"
                  : "bg-accent/10 border-accent/30 text-accent-2 hover:bg-accent/20"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                  completed
                    ? "bg-green-400 border-green-400 text-white"
                    : "border-accent"
                }`}
              >
                {completed && "✓"}
              </span>
              {completed ? "Mark as incomplete" : "Mark as complete"}
            </button>
          )}

          {/* Edit mode buttons */}
          {editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdits}
                disabled={saving || !editTitle.trim()}
                className="flex-1 bg-[#534AB7] text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "💾 Save changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-transparent text-text-tertiary text-xs px-3 py-2.5 hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer with delete */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-text-tertiary hover:text-coral py-2 transition-colors disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "🗑 Delete quest"}
          </button>
        </div>
      </div>
    </div>
  );
}