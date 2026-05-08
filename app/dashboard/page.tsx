import { createClient } from "@/lib/supabase/server";
import { gameFromRow, type GameRow } from "@/lib/db-helpers";
import { GameCard } from "@/components/games/game-card";
import { NewGameCard } from "@/components/games/new-game-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch games:", error.message);
  }

  const allGames = (rows ?? []).map((row: GameRow) => gameFromRow(row));
  const regularGames = allGames.filter((g: { isBonus?: boolean }) => !g.isBonus);
  const bonusGames = allGames.filter((g: { isBonus?: boolean }) => g.isBonus);

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