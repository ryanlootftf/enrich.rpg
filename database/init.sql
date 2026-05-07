-- =============================================================================
-- Enrich.rpg — Database Initialization Script
-- Drops all existing public tables, then recreates the schema.
-- Designed for Supabase (PostgreSQL) with Supabase Auth.
-- =============================================================================

-- =============================================================================
-- 1. DROP ALL EXISTING OBJECTS
-- =============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_achievement_completed ON public.achievements CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_achievement_completion() CASCADE;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users own their games" ON public.games;
DROP POLICY IF EXISTS "Users own their achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users own their rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users own their completion_logs" ON public.completion_logs;

-- Drop application tables
DROP TABLE IF EXISTS public.completion_logs CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;

-- Drop legacy NextAuth-style account tables
DROP TABLE IF EXISTS public.verification_tokens CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =============================================================================
-- 2. CREATE APPLICATION TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- games — Each self-improvement quest/game created by a user
-- ---------------------------------------------------------------------------
CREATE TABLE public.games (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT DEFAULT '',
  theme_color         TEXT DEFAULT 'purple',          -- purple | teal | coral | gold
  lifetime_stars      INTEGER DEFAULT 0,
  total_possible_stars INTEGER DEFAULT 0,
  is_bonus            BOOLEAN DEFAULT false,           -- true when bonus track is unlocked
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- achievements — Tasks/quests within a game
-- ---------------------------------------------------------------------------
CREATE TABLE public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  difficulty      TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  stars_rewarded  INTEGER NOT NULL DEFAULT 5,
  completed       BOOLEAN DEFAULT false,
  repeatable      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- rewards — Reward track milestones within a game
-- ---------------------------------------------------------------------------
CREATE TABLE public.rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  emoji           TEXT DEFAULT '🎁',
  required_stars  INTEGER NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('MAIN_TRACK', 'BONUS_TRACK')),
  claimed         BOOLEAN DEFAULT false,
  is_final        BOOLEAN DEFAULT false,               -- marks the last reward before bonus track
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- completion_logs — Audit trail of completed achievements
-- ---------------------------------------------------------------------------
CREATE TABLE public.completion_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id  UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars_earned    INTEGER NOT NULL,
  completed_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

CREATE INDEX idx_games_user_id ON public.games(user_id);
CREATE INDEX idx_achievements_game_id ON public.achievements(game_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_rewards_game_id ON public.rewards(game_id);
CREATE INDEX idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX idx_completion_logs_game_id ON public.completion_logs(game_id);
CREATE INDEX idx_completion_logs_user_id ON public.completion_logs(user_id);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their games"
  ON public.games
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their achievements"
  ON public.achievements
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their rewards"
  ON public.rewards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- completion_logs
ALTER TABLE public.completion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their completion_logs"
  ON public.completion_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. TRIGGER FUNCTION — Auto-increment lifetime_stars on achievement completion
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_achievement_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only run when completed flips from false → true
  IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
    -- Increment the game's lifetime_stars
    UPDATE public.games
    SET
      lifetime_stars = lifetime_stars + NEW.stars_rewarded,
      updated_at = now()
    WHERE id = NEW.game_id;

    -- Insert a completion log entry
    INSERT INTO public.completion_logs (
      achievement_id,
      game_id,
      user_id,
      stars_earned
    ) VALUES (
      NEW.id,
      NEW.game_id,
      NEW.user_id,
      NEW.stars_rewarded
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_achievement_completed
  AFTER UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_achievement_completion();

-- =============================================================================
-- 6. HELPER FUNCTION — Auto-update updated_at on games
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_games_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_games_updated_at();