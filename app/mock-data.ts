import type { Game, Achievement, Reward, AIResult } from "./types";

export const games: Game[] = [
  {
    id: "social-confidence",
    title: "Social Confidence Arc",
    description: "Build social skills, one interaction at a time",
    theme: "purple",
    lifetimeStars: 42,
    totalPossibleStars: 100,
  },
  {
    id: "fitness-arc",
    title: "Fitness Arc",
    description: "Train your body, earn your rewards",
    theme: "teal",
    lifetimeStars: 94,
    totalPossibleStars: 120,
  },
  {
    id: "study-grind",
    title: "Study Grind",
    description: "Crush your learning goals, one session at a time",
    theme: "coral",
    lifetimeStars: 12,
    totalPossibleStars: 80,
  },
  {
    id: "job-hunt",
    title: "Job Hunt",
    description: "Land your dream role, achievement by achievement",
    theme: "gold",
    lifetimeStars: 145,
    totalPossibleStars: 120,
    isBonus: true,
  },
];

export const allAchievements: Achievement[] = [
  // Social Confidence Arc
  {
    id: "sc-1",
    gameId: "social-confidence",
    title: "Say hi to a stranger",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "sc-2",
    gameId: "social-confidence",
    title: "Talk to cashier",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "sc-3",
    gameId: "social-confidence",
    title: "Start a small conversation",
    difficulty: "medium",
    starsRewarded: 12,
    completed: false,
  },
  {
    id: "sc-4",
    gameId: "social-confidence",
    title: "Join a voice call",
    difficulty: "medium",
    starsRewarded: 12,
    completed: false,
  },
  {
    id: "sc-5",
    gameId: "social-confidence",
    title: "Attend a local meetup",
    difficulty: "hard",
    starsRewarded: 25,
    completed: false,
  },
  // Fitness Arc
  {
    id: "fit-1",
    gameId: "fitness-arc",
    title: "Walk 10k steps",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "fit-2",
    gameId: "fitness-arc",
    title: "Do 20 push-ups",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "fit-3",
    gameId: "fitness-arc",
    title: "Run 5km",
    difficulty: "medium",
    starsRewarded: 12,
    completed: true,
  },
  {
    id: "fit-4",
    gameId: "fitness-arc",
    title: "Hit the gym 3x this week",
    difficulty: "medium",
    starsRewarded: 12,
    completed: false,
  },
  {
    id: "fit-5",
    gameId: "fitness-arc",
    title: "Complete a 10k run",
    difficulty: "hard",
    starsRewarded: 25,
    completed: false,
  },
  // Study Grind
  {
    id: "study-1",
    gameId: "study-grind",
    title: "Study for 30 min",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "study-2",
    gameId: "study-grind",
    title: "Complete one chapter",
    difficulty: "medium",
    starsRewarded: 12,
    completed: false,
  },
  {
    id: "study-3",
    gameId: "study-grind",
    title: "Pass a practice test",
    difficulty: "hard",
    starsRewarded: 25,
    completed: false,
  },
  // Job Hunt
  {
    id: "job-1",
    gameId: "job-hunt",
    title: "Update resume",
    difficulty: "easy",
    starsRewarded: 5,
    completed: true,
  },
  {
    id: "job-2",
    gameId: "job-hunt",
    title: "Apply to 5 positions",
    difficulty: "medium",
    starsRewarded: 12,
    completed: true,
  },
  {
    id: "job-3",
    gameId: "job-hunt",
    title: "Complete technical interview",
    difficulty: "hard",
    starsRewarded: 25,
    completed: true,
  },
];

export const allRewards: Reward[] = [
  // Social Confidence Arc - Main Track
  {
    id: "sc-rew-1",
    gameId: "social-confidence",
    title: "Favorite drink",
    requiredStars: 10,
    type: "MAIN_TRACK",
    claimed: true,
    emoji: "☕",
  },
  {
    id: "sc-rew-2",
    gameId: "social-confidence",
    title: "Fancy dessert",
    requiredStars: 25,
    type: "MAIN_TRACK",
    claimed: true,
    emoji: "🍰",
  },
  {
    id: "sc-rew-3",
    gameId: "social-confidence",
    title: "Gaming night",
    requiredStars: 50,
    type: "MAIN_TRACK",
    claimed: false,
    emoji: "🎮",
    isNext: true,
  },
  {
    id: "sc-rew-4",
    gameId: "social-confidence",
    title: "Buy something nice",
    requiredStars: 80,
    type: "MAIN_TRACK",
    claimed: false,
    emoji: "🛍️",
  },
  {
    id: "sc-rew-5",
    gameId: "social-confidence",
    title: "New mechanical keyboard",
    requiredStars: 100,
    type: "MAIN_TRACK",
    claimed: false,
    emoji: "🏆",
  },
  // Job Hunt - Bonus Track Rewards
  {
    id: "job-bonus-1",
    gameId: "job-hunt",
    title: "Movie night",
    requiredStars: 25,
    type: "BONUS_TRACK",
    claimed: true,
    emoji: "🍿",
  },
  {
    id: "job-bonus-2",
    gameId: "job-hunt",
    title: "Nice coffee",
    requiredStars: 25,
    type: "BONUS_TRACK",
    claimed: false,
    emoji: "☕",
  },
  {
    id: "job-bonus-3",
    gameId: "job-hunt",
    title: "Gaming session",
    requiredStars: 25,
    type: "BONUS_TRACK",
    claimed: false,
    emoji: "🎮",
  },
];

export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}

export function getAchievementsForGame(gameId: string): Achievement[] {
  return allAchievements.filter((a) => a.gameId === gameId);
}

export function getRewardsForGame(gameId: string): Reward[] {
  return allRewards.filter((r) => r.gameId === gameId);
}

export function getMainTrackRewards(gameId: string): Reward[] {
  return allRewards.filter(
    (r) => r.gameId === gameId && r.type === "MAIN_TRACK"
  );
}

export function getBonusTrackRewards(gameId: string): Reward[] {
  return allRewards.filter(
    (r) => r.gameId === gameId && r.type === "BONUS_TRACK"
  );
}

export const mockAIResults: AIResult[] = [
  {
    title: "Say hi to a stranger",
    difficulty: "easy",
    starsRewarded: 5,
    selected: true,
  },
  {
    title: "Compliment someone today",
    difficulty: "easy",
    starsRewarded: 5,
    selected: true,
  },
  {
    title: "Start a 5-min conversation",
    difficulty: "medium",
    starsRewarded: 12,
    selected: true,
  },
  {
    title: "Join an online voice call",
    difficulty: "medium",
    starsRewarded: 12,
    selected: false,
  },
  {
    title: "Attend a local meetup event",
    difficulty: "hard",
    starsRewarded: 25,
    selected: true,
  },
];