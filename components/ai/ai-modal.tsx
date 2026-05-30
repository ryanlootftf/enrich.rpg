"use client";

import { useState, useEffect } from "react";
import type { AIResult } from "@/app/types";

const diffConfig: Record<string, { icon: string; label: string }> = {
  easy: { icon: "🌱", label: "Easy" },
  medium: { icon: "⚡", label: "Medium" },
  hard: { icon: "🔥", label: "Hard" },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  results: AIResult[];
  loading?: boolean;
  onAddQuests?: (results: AIResult[]) => Promise<void>;
}

export function AIModal({ isOpen, onClose, gameTitle, results, loading, onAddQuests }: Props) {
  const [resultsState, setResultsState] = useState<AIResult[]>(results);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    setResultsState(results);
  }, [results]);

  // Reset adding/error when modal opens/closes or results change
  useEffect(() => {
    if (!isOpen) {
      setAdding(false);
      setAddError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (results.length > 0) {
      setAddError(null);
    }
  }, [results]);

  if (!isOpen) return null;

  const toggleResult = (idx: number) => {
    setResultsState((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedCount = resultsState.filter((r) => r.selected).length;
  const totalStars = resultsState
    .filter((r) => r.selected)
    .reduce((sum, r) => sum + r.starsRewarded, 0);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-2 border border-border-default rounded-t-2xl sm:rounded-2xl w-full sm:max-w-[440px] max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <span className="text-accent-2 text-xs font-syne uppercase tracking-[0.18em]">
              AI Generate
            </span>
            <h2 className="text-bg? text-text-primary text-lg font-syne font-semibold mt-0.5">
              {gameTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-3 border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-4 transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <p className="px-5 text-xs text-text-tertiary mb-3">
          AI generates quests based on your game. Toggle to select the ones you
          want, then confirm to add them. Total stars target: ~100 ★.
        </p>

        {/* Loading skeleton */}
        {loading && resultsState.length === 0 && (
          <div className="px-5 flex flex-col gap-3 overflow-y-auto pb-2">
            {/* Animated generating indicator */}
            <div className="bg-bg-3 border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg animate-spin">🧙</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  Generating quests
                  <span className="inline-block w-[3ch] text-left animate-pulse">
                    ...
                  </span>
                </div>
                <div className="text-xs text-text-tertiary">
                  AI is crafting quests for your game
                </div>
              </div>
            </div>
            {/* Shimmer progress bar */}
            <div className="h-[3px] bg-border-subtle rounded-full overflow-hidden">
<div className="h-full w-2/3 bg-gradient-to-r from-accent/40 via-accent to-accent/40 rounded-full animate-pulse" />
            </div>
            {/* Skeleton cards as visual filler */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-3 border border-border-subtle rounded-xl px-[14px] py-3 flex items-center gap-3 animate-pulse"
              >
                <div className="w-[22px] h-[22px] rounded-full bg-border-subtle flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-border-subtle rounded w-3/4" />
                  <div className="h-2 bg-border-subtle rounded w-1/2" />
                </div>
                <div className="h-3 bg-border-subtle rounded w-10" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && resultsState.length === 0 && (
          <div className="px-5 py-8 text-center text-text-tertiary text-xs">
            <p className="mb-1">⚠️ Failed to generate quests.</p>
            <p>Please check your API key and try again.</p>
          </div>
        )}

        {/* Results list */}
        <div className="px-5 flex flex-col gap-2 overflow-y-auto pb-2">
          {resultsState.map((result, i) => (
            <div
              key={i}
              onClick={() => toggleResult(i)}
              className={`bg-bg-3 border rounded-xl px-[14px] py-3 flex items-center gap-3 cursor-pointer transition-all duration-150 hover:border-border-default ${
                result.selected
                  ? "border-accent/40"
                  : "border-border-subtle opacity-55"
              }`}
            >
              <div
                className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 text-xs ${
                  result.selected
                    ? "bg-accent border-accent text-white"
                    : "border-border-default"
                }`}
              >
                {result.selected && "✓"}
              </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">
                      {result.title}
                    </div>
                  {result.description && (
                      <div className="text-xs text-text-tertiary mt-0.5 leading-snug truncate">
                        {result.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-tertiary inline-flex items-center gap-1">
                        {diffConfig[result.difficulty]?.icon}{" "}
                        {diffConfig[result.difficulty]?.label}
                      </span>
                      {result.progressMax > 1 && (
                        <span className="text-xs text-text-tertiary">
                          {result.progressMax} steps
                        </span>
                      )}
                    </div>
                  </div>

              <div className="text-xs text-gold font-medium whitespace-nowrap">
                +{result.starsRewarded} ★
              </div>
            </div>
          ))}
        </div>

        {/* Footer — loading state */}
        {loading && resultsState.length === 0 ? (
          <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between">
            <div className="text-xs text-text-tertiary animate-pulse">
              Waiting for AI response…
            </div>
            <button
              onClick={onClose}
              className="text-sm font-medium px-5 py-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Footer — results state */
          <div className="border-t border-border-subtle">
            {addError && (
              <div className="text-xs text-coral px-5 pt-3">
                {addError}
              </div>
            )}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="text-xs text-text-secondary">
                <span className="text-text-primary font-medium">
                  {selectedCount}
                </span>{" "}
                selected ·{" "}
                <span className="text-gold font-medium">+{totalStars}/100 ★</span>
              </div>
              <button
              onClick={async () => {
                if (!onAddQuests || adding) return;
                setAdding(true);
                setAddError(null);
                try {
                  await onAddQuests(resultsState);
                } catch (e: unknown) {
                  const msg =
                    e instanceof Error ? e.message : "Failed to add quests. Please try again.";
                  setAddError(msg);
                } finally {
                  setAdding(false);
                }
              }}
              disabled={selectedCount === 0 || adding}
              className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {adding && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {adding ? "Adding to game…" : "Add to quests"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}