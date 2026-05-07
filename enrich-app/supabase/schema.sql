-- Enrich.rpg - Database Schema
-- Run this in Supabase SQL Editor

-- Games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  theme_color TEXT DEFAULT 'purple',
  lifetime_stars INTEGER DEFAULT 0,
  total_possible_stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  stars_rewarded INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN DEFAULT false,
  repeatable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rewards table
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '🎁',
  required_stars INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MAIN_TRACK', 'BONUS_TRACK')),
  claimed BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Completion logs (for tracking when achievements were completed)
CREATE TABLE completion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  stars_earned INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_achievements_game_id ON achievements(game_id);
CREATE INDEX idx_rewards_game_id ON rewards(game_id);
CREATE INDEX idx_completion_logs_game_id ON completion_logs(game_id);
CREATE INDEX idx_completion_logs_achievement_id ON completion_logs(achievement_id);

-- Trigger to update updated_at on games
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_logs ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/edit their own data
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);

-- Achievements inherit game ownership
CREATE POLICY "Users can view achievements in their games"
  ON achievements FOR SELECT
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = achievements.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can insert achievements in their games"
  ON achievements FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE games.id = achievements.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can update achievements in their games"
  ON achievements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = achievements.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can delete achievements in their games"
  ON achievements FOR DELETE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = achievements.game_id AND games.user_id = auth.uid()));

-- Rewards inherit game ownership
CREATE POLICY "Users can view rewards in their games"
  ON rewards FOR SELECT
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = rewards.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can insert rewards in their games"
  ON rewards FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE games.id = rewards.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can update rewards in their games"
  ON rewards FOR UPDATE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = rewards.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can delete rewards in their games"
  ON rewards FOR DELETE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = rewards.game_id AND games.user_id = auth.uid()));

-- Completion logs inherit game ownership
CREATE POLICY "Users can view completion logs in their games"
  ON completion_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = completion_logs.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can insert completion logs in their games"
  ON completion_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE games.id = completion_logs.game_id AND games.user_id = auth.uid()));

CREATE POLICY "Users can delete completion logs in their games"
  ON completion_logs FOR DELETE
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = completion_logs.game_id AND games.user_id = auth.uid()));