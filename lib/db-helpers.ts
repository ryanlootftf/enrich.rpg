import type { Game } from "@/app/types";

/**
 * Database row shape (snake_case as stored in PostgreSQL).
 */
export interface GameRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  theme_color: string;
  lifetime_stars: number;
  total_possible_stars: number;
  is_bonus: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert a snake_case database row into the camelCase Game type
 * expected by the frontend.
 */
export function gameFromRow(row: GameRow): Game {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    theme: (row.theme_color as Game["theme"]) ?? "purple",
    lifetimeStars: row.lifetime_stars,
    totalPossibleStars: row.total_possible_stars,
    isBonus: row.is_bonus,
  };
}