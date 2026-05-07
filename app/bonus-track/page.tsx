"use client";

import { useRouter } from "next/navigation";
import { games } from "@/app/mock-data";

export default function BonusTrackPage() {
  const router = useRouter();
  const bonusGames = games.filter((g) => g.isBonus);

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-text-tertiary text-xs hover:text-text-primary transition-colors flex items-center gap-1"
      >
        ← Back to all quests
      </button>

      <section>
        <h1 className="text-2xl font-syne font-bold text-text-primary mb-2">
          Bonus Track
        </h1>
        <p className="text-text-secondary text-sm">
          Extra quests and rewards beyond your main tracks. Every 25 stars earns
          you a bonus reward.
        </p>
      </section>

      <div className="divider-label">Bonus Quests</div>

      {bonusGames.length === 0 ? (
        <p className="text-text-tertiary text-xs py-8 text-center">
          No bonus track quests yet. Complete main quests to unlock bonus
          content!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bonusGames.map((game) => (
            <div
              key={game.id}
              onClick={() => router.push(`/games/${game.id}`)}
              className="relative overflow-hidden bg-bg-2 border border-border-subtle rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-border-default hover:-translate-y-0.5"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-[#f4c430] to-[#fbbf24]" />

              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[10px] bg-gold/10 flex items-center justify-center text-lg">
                  ✦
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gold/10 text-gold-2">
                  Bonus Track
                </span>
              </div>

              <div className="font-syne text-sm font-semibold text-text-primary mb-1">
                {game.title}
              </div>
              <div className="text-xs text-text-tertiary mb-3">
                {game.description}
              </div>

              <div className="text-xs text-text-secondary flex items-center gap-1">
                <span className="text-gold text-[10px]">★</span>
                {game.lifetimeStars} / {game.totalPossibleStars} stars
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <section className="bg-bg-2 border border-border-subtle rounded-2xl p-5 mt-8">
        <h2 className="font-syne text-sm font-semibold text-text-primary mb-3">
          How Bonus Track Works
        </h2>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">✦</span>
            Bonus quests are extra challenges you can tackle alongside your main
            quests
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">✦</span>
            Every 25 bonus stars unlocks a reward from the bonus loot table
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">✦</span>
            Bonus rewards stack on top of your main track rewards — double the
            motivation!
          </li>
        </ul>
      </section>
    </div>
  );
}