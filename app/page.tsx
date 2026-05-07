"use client";

import { useState } from "react";
import { games } from "@/app/mock-data";
import { GameCard } from "@/components/games/game-card";
import { NewGameCard } from "@/components/games/new-game-card";

export default function HomePage() {
  const regularGames = games.filter((g) => !g.isBonus);
  const bonusGames = games.filter((g) => g.isBonus);

  return (
    <div className="space-y-10">
      {/* Active Quests */}
      <section className="screen">
        <h2 className="section-label">Active Quests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {regularGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
          <NewGameCard />
        </div>
      </section>

      {/* Bonus Track */}
      {bonusGames.length > 0 && (
        <section className="screen">
          <div className="divider-label">Bonus Track</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bonusGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}