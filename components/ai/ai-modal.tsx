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
  onAddQuests?: (results: AIResult[]) => void;
}

export function AIModal({ isOpen, onClose, gameTitle, results, loading, onAddQuests }: Props) {
  const [resultsState, setResultsState] = useState<AIResult[]>(results);

  useEffect(() => {
    setResultsState(results);
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
            <span className="text-accent-2 text-[11px] font-syne uppercase tracking-[0.18em]">
              AI Suggestions
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
          AI generates quest ideas based on your goal. Toggle to accept the
          challenges you want.
        </p>

        {/* Loading skeleton */}
        {loading && resultsState.length === 0 && (
          <div className="px-5 flex flex-col gap-2 overflow-y-auto pb-2">
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
                className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 text-[11px] ${
                  result.selected
                    ? "bg-accent border-accent text-white"
                    : "border-border-default"
                }`}
              >
                {result.selected && "✓"}
              </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text-primary">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-[11px] text-text-tertiary mt-0.5 leading-snug truncate">
                        {result.description}
                      </div>
                    )}
                    <span className="text-[11px] text-text-tertiary mt-0.5 inline-flex items-center gap-1">
                      {diffConfig[result.difficulty]?.icon}{" "}
                      {diffConfig[result.difficulty]?.label}
                    </span>
                  </div>

              <div className="text-xs text-gold font-medium whitespace-nowrap">
                +{result.starsRewarded} ★
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between">
          <div className="text-xs text-text-secondary">
            <span className="text-text-primary font-medium">
              {selectedCount}
            </span>{" "}
            selected ·{" "}
            <span className="text-gold font-medium">+{totalStars} ★</span>
          </div>
          <button
            onClick={() => onAddQuests?.(resultsState)}
            disabled={selectedCount === 0}
            className="bg-accent text-white text-[13px] font-medium px-5 py-2 rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to quests
          </button>
        </div>
      </div>
    </div>
  );
}