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
    description: "Start with a simple greeting to someone new",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "sc-2",
    gameId: "social-confidence",
    title: "Talk to cashier",
    description: "Have a brief chat with a cashier during checkout",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "sc-3",
    gameId: "social-confidence",
    title: "Start a small conversation",
    description: "Initiate a chat about something you notice",
    difficulty: "medium",
    starsRewarded: 3,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "sc-4",
    gameId: "social-confidence",
    title: "Join a voice call",
    description: "Hop on a voice call with friends or a community",
    difficulty: "medium",
    starsRewarded: 3,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "sc-5",
    gameId: "social-confidence",
    title: "Attend a local meetup",
    description: "Find and attend a meetup event in your area",
    difficulty: "hard",
    starsRewarded: 5,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  // Fitness Arc
  {
    id: "fit-1",
    gameId: "fitness-arc",
    title: "Walk 10k steps",
    description: "Hit 10,000 steps in a single day",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "fit-2",
    gameId: "fitness-arc",
    title: "Do 20 push-ups",
    description: "Complete 20 push-ups in one go",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "fit-3",
    gameId: "fitness-arc",
    title: "Run 5km",
    description: "Complete a 5 kilometer run",
    difficulty: "medium",
    starsRewarded: 3,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "fit-4",
    gameId: "fitness-arc",
    title: "Hit the gym 3x this week",
    description: "Go to the gym three times this week",
    difficulty: "medium",
    starsRewarded: 3,
    completed: false,
    progressMax: 3,
    progressCurrent: 1,
  },
  {
    id: "fit-5",
    gameId: "fitness-arc",
    title: "Complete a 10k run",
    description: "Finish a 10 kilometer run",
    difficulty: "hard",
    starsRewarded: 5,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  // Study Grind
  {
    id: "study-1",
    gameId: "study-grind",
    title: "Study for 30 min",
    description: "Complete a focused 30-minute study session",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "study-2",
    gameId: "study-grind",
    title: "Complete one chapter",
    description: "Finish reading and understanding one full chapter",
    difficulty: "medium",
    starsRewarded: 3,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "study-3",
    gameId: "study-grind",
    title: "Pass a practice test",
    description: "Score passing grade on a full practice test",
    difficulty: "hard",
    starsRewarded: 5,
    completed: false,
    progressMax: 0,
    progressCurrent: 0,
  },
  // Job Hunt
  {
    id: "job-1",
    gameId: "job-hunt",
    title: "Update resume",
    description: "Refresh your resume with latest experience",
    difficulty: "easy",
    starsRewarded: 1,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
  },
  {
    id: "job-2",
    gameId: "job-hunt",
    title: "Apply to 5 positions",
    description: "Submit applications to 5 job openings",
    difficulty: "medium",
    starsRewarded: 3,
    completed: true,
    progressMax: 5,
    progressCurrent: 5,
  },
  {
    id: "job-3",
    gameId: "job-hunt",
    title: "Complete technical interview",
    description: "Successfully finish a technical interview round",
    difficulty: "hard",
    starsRewarded: 5,
    completed: true,
    progressMax: 0,
    progressCurrent: 0,
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
    description: "Start with a simple greeting to someone new",
    difficulty: "easy",
    starsRewarded: 1,
    selected: true,
  },
  {
    title: "Compliment someone today",
    description: "Give a genuine compliment to someone",
    difficulty: "easy",
    starsRewarded: 1,
    selected: true,
  },
  {
    title: "Start a 5-min conversation",
    description: "Keep a conversation going for at least 5 minutes",
    difficulty: "medium",
    starsRewarded: 3,
    selected: true,
  },
  {
    title: "Join an online voice call",
    description: "Hop on a voice call with friends or a community",
    difficulty: "medium",
    starsRewarded: 3,
    selected: false,
  },
  {
    title: "Attend a local meetup event",
    description: "Find and attend a meetup event in your area",
    difficulty: "hard",
    starsRewarded: 5,
    selected: true,
  },
];