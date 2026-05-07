export type Game = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  theme_color: "purple" | "teal" | "coral" | "gold";
  lifetime_stars: number;
  total_possible_stars: number;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  game_id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  stars_rewarded: number;
  completed: boolean;
  repeatable: boolean;
  created_at: string;
};

export type Reward = {
  id: string;
  game_id: string;
  title: string;
  icon: string;
  required_stars: number;
  type: "MAIN_TRACK" | "BONUS_TRACK";
  claimed: boolean;
  is_final: boolean;
  created_at: string;
};

export type CompletionLog = {
  id: string;
  achievement_id: string;
  game_id: string;
  completed_at: string;
  stars_earned: number;
};

export type AiGeneratedAchievement = {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  stars_rewarded: number;
};