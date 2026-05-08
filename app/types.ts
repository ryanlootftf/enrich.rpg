export type Difficulty = "easy" | "medium" | "hard";

export type GameTheme = "purple" | "teal" | "coral" | "gold";

export interface Game {
  id: string;
  title: string;
  description: string;
  theme: GameTheme;
  lifetimeStars: number;
  totalPossibleStars: number;
  isBonus?: boolean;
}

export interface Achievement {
  id: string;
  gameId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  starsRewarded: number;
  completed: boolean;
  progressMax: number;
  progressCurrent: number;
}

export interface Reward {
  id: string;
  gameId: string;
  title: string;
  requiredStars: number;
  type: "MAIN_TRACK" | "BONUS_TRACK";
  claimed: boolean;
  emoji: string;
  isNext?: boolean;
}

export type FilterDifficulty = "all" | "easy" | "medium" | "hard";

export interface AIResult {
  title: string;
  description: string;
  difficulty: Difficulty;
  starsRewarded: number;
  selected: boolean;
}
