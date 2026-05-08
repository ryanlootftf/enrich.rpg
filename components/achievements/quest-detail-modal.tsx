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

const diffPills: Record<string, { container: string; dot: string; text: string }> = {
  easy: { container: "bg-green/10 border-green/30", dot: "bg-green", text: "text-green" },
  medium: { container: "bg-gold/10 border-gold/30", dot: "bg-gold", text: "text-gold-2" },
  hard: { container: "bg-coral/10 border-coral/30", dot: "bg-coral", text: "text-coral" },
};

const difficultyStars: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const diffConfig = [
  { value: "easy" as Difficulty, label: "Easy", dot: "bg-green" },
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

  // ── Edit mode ──
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(achievement.title);
  const [editDescription, setEditDescription] = useState(achievement.description);
  const [editProgressMax, setEditProgressMax] = useState(achievement.progressMax);
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>(
    achievement.difficulty as Difficulty
  );

  // Saving state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Re-sync edit form fields when the achievement prop changes
  useEffect(() => {
    setEditTitle(achievement.title);
    setEditDescription(achievement.description);
    setEditProgressMax(achievement.progressMax);
    setEditDifficulty(achievement.difficulty as Difficulty);
  }, [achievement.title, achievement.description, achievement.progressMax, achievement.difficulty]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (editing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editing]);

  const done = achievement.completed;
  const progressCurrent = achievement.progressCurrent;
  const hasProgress = achievement.progressMax > 0;
  const progressPct = hasProgress
    ? Math.min(Math.round((progressCurrent / achievement.progressMax) * 100), 100)
    : 0;

  // ── Optimistic-only mutations (instant UI, no server call yet) ──
  const handleProgressDelta = (delta: number) => {
    const newCurrent = Math.max(
      0,
      Math.min(progressCurrent + delta, achievement.progressMax)
    );
    const newCompleted = hasProgress ? newCurrent >= achievement.progressMax : done;
    onUpdate({ ...achievement, progressCurrent: newCurrent, completed: newCompleted });
    setHasChanges(true);
  };

  const handleToggleComplete = () => {
    const newCompleted = !done;
    const newCurrent = newCompleted ? achievement.progressMax : 0;
    onUpdate({ ...achievement, progressCurrent: newCurrent, completed: newCompleted });
    setHasChanges(true);
  };

  // ── Save: batch-persist everything in one go ──
  const handleSave = async () => {
    setSaving(true);
    try {
      // Step 1: Persist edit-mode fields (title, description, difficulty, progressMax)
      if (editing) {
        if (editTitle.trim() && editTitle.trim() !== achievement.title) {
          await updateAchievementTitle(achievement.id, gameId, editTitle.trim());
        }
        if (editDescription.trim() !== achievement.description) {
          await updateAchievementDescription(achievement.id, gameId, editDescription.trim());
        }
        if (editDifficulty !== achievement.difficulty) {
          await updateAchievementDifficulty(achievement.id, gameId, editDifficulty);
        }
        if (editProgressMax !== achievement.progressMax) {
          await updateAchievementProgressMax(achievement.id, gameId, editProgressMax);
        }
      }

      // Step 2: Persist progress + completed changes via a single delta call
      // The delta is the difference between what the modal shows now vs what the DB has.
      // We need to calculate this from the last known DB values.
      // Since we've been optimistic, we compare current achievement prop against original.
      // But the simplest approach: fetch the current DB row, compute delta from it.
      const { data: dbRow } = await supabase
        .from("achievements")
        .select("progress_current, progress_max, completed")
        .eq("id", achievement.id)
        .single();

      if (dbRow) {
        const dbCurrent = dbRow.progress_current ?? 0;
        const modalCurrent = achievement.progressCurrent;
        const delta = modalCurrent - dbCurrent;
        if (delta !== 0) {
          await updateAchievementProgressBy(achievement.id, gameId, delta);
        } else {
          // completed might have changed even if progress didn't (no-progress quests)
          // Toggle complete on a non-progress quest toggles progressCurrent 0→0
          // but completed state changes. In that case, delta=0 won't persist.
          // Force persist by calling with delta of 1 then -1? No — simpler to check completed.
          // Actually for non-progress quests, completed just flips without progress change,
          // so we need to call updateAchievementProgressBy with a delta that flips it.
          // Let's use the helper action properly: it increments by delta and auto-sets completed.
          // But if delta=0, the action does nothing. So for non-progress toggles, we need
          // to force a different approach. Let's just persist completed directly via a server call.
          if (dbRow.completed !== achievement.completed) {
            // Flip via a custom delta approach: set progress to max if completing, 0 if not
            const forceDelta = achievement.completed
              ? (achievement.progressMax > 0 ? achievement.progressMax - dbCurrent : 1)
              : -dbCurrent;
            await updateAchievementProgressBy(achievement.id, gameId, forceDelta);
          }
        }
      }

      // Step 3: Refetch full row from DB and sync back to parent
      const { data: achRow } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", achievement.id)
        .single();

      if (achRow) {
        onUpdate({
          ...achievement,
          title: editTitle.trim(),
          description: editDescription.trim(),
          progressMax: editing ? editProgressMax : achievement.progressMax,
          difficulty: (editing ? editDifficulty : achievement.difficulty) as Achievement["difficulty"],
          starsRewarded: achRow.stars_rewarded ?? achievement.starsRewarded,
          progressCurrent: achRow.progress_current ?? 0,
          completed: achRow.completed ?? false,
        });
      }

      // Step 4: Exit edit mode if we were in it, clear dirty flag
      if (editing) setEditing(false);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save:", err);
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

  const pill = diffPills[achievement.difficulty] ?? diffPills.easy;
  const starCount = editing ? difficultyStars[editDifficulty] : achievement.starsRewarded;
  const showSave = editing || hasChanges;

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
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-base font-syne font-bold text-text-primary">
            Quest Details
          </h3>
          <div className="flex items-center gap-1.5">
            {!editing && !hasChanges && (
              <button
                onClick={() => {
                  setEditTitle(achievement.title);
                  setEditDescription(achievement.description);
                  setEditProgressMax(achievement.progressMax);
                  setEditDifficulty(achievement.difficulty as Difficulty);
                  setEditing(true);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-accent-2 hover:bg-bg-1 transition-colors text-sm"
                title="Edit quest"
              >
                ✎
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-1 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Header separator */}
        <hr className="border-t border-border-subtle/50 mx-6" />

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Difficulty badge (pill) — shown before title */}
          {!editing && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${pill.container}`}>
              <span className={`w-2 h-2 rounded-full ${pill.dot}`} />
              <span className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${pill.text}`}>
                {achievement.difficulty}
              </span>
            </div>
          )}

          {/* Title (or edit input) */}
          <div>
            {editing ? (
              <>
                <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                  Quest title
                </span>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Read 5 books"
                  maxLength={60}
                  className="w-full bg-transparent border-b border-border-subtle px-0 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
                />
                <span className="block text-right text-[10px] text-text-tertiary mt-0.5">
                  {editTitle.length}/60
                </span>
              </>
            ) : (
              <div
                className={`text-[15px] font-syne font-semibold ${
                  done ? "text-text-tertiary line-through" : "text-text-primary"
                }`}
              >
                {achievement.title}
              </div>
            )}
          </div>

          {/* Difficulty edit buttons (only in edit mode) */}
          {editing && (
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
          )}

          {/* Description */}
          <div>
            {editing ? (
              <>
                <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
                  Description
                </span>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                  {editDescription.length}/200
                </span>
              </>
            ) : (
              <>
                <span className="block text-[11px] font-medium text-text-secondary mb-1">
                  Description
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {achievement.description || (
                    <span className="text-text-tertiary italic">No description</span>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Reward section */}
          <div>
            <span className="block text-[11px] font-medium text-text-secondary mb-1.5">
              Reward
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-2 text-xs font-semibold">
              +{starCount} ★
            </div>
          </div>

          {/* Progress section (steps indicator) */}
          {hasProgress && (
            <div className="bg-bg-3/50 border border-border-subtle/50 rounded-xl p-4 space-y-3">
              <span className="block text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                Progress
              </span>

              {/* Progress bar */}
              <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    done ? "from-green-400 to-emerald-500" : "bg-accent"
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
                  disabled={progressCurrent >= achievement.progressMax || done}
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

          {/* Mark as complete / incomplete — solid filled button */}
          {!editing && (
            <button
              onClick={handleToggleComplete}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${
                done
                  ? "bg-green text-white hover:bg-green/90"
                  : "bg-accent text-white hover:bg-accent/90"
              }`}
            >
              <span className="text-sm font-bold">✓</span>
              {done ? "Mark as incomplete" : "Mark as complete"}
            </button>
          )}

          {/* Save + Delete buttons (shown when editing OR when there are unsaved changes) */}
          {showSave && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || (editing && !editTitle.trim())}
                className="flex-1 bg-[#534AB7] text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "💾 Save changes"}
              </button>
              {editing && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-coral/40 text-coral hover:bg-coral/10 transition-colors disabled:opacity-40"
                >
                  {deleting ? "…" : "🗑"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Cancel (only in edit mode) */}
        {editing && (
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={() => {
                setEditing(false);
                // Also revert any unsaved progress changes when cancelling edit
                if (hasChanges) {
                  setHasChanges(false);
                  // Re-fetch from DB to revert optimistic state
                  supabase
                    .from("achievements")
                    .select("*")
                    .eq("id", achievement.id)
                    .single()
                    .then(({ data }) => {
                      if (data) {
                        onUpdate({
                          ...achievement,
                          title: data.title,
                          description: data.description ?? "",
                          difficulty: data.difficulty as Achievement["difficulty"],
                          starsRewarded: data.stars_rewarded ?? achievement.starsRewarded,
                          progressMax: data.progress_max ?? 0,
                          progressCurrent: data.progress_current ?? 0,
                          completed: data.completed ?? false,
                        });
                      }
                    });
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}