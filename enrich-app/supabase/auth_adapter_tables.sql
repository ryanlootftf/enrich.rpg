-- Auth.js Supabase Adapter Tables
-- Run this AFTER the main schema.sql (if tables already exist, use IF NOT EXISTS)
-- These tables are required by @auth/supabase-adapter for user session management

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

-- Enable Row Level Security on all Auth.js adapter tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users: can read own record, can insert/update own record
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Accounts: users can read their own linked accounts
CREATE POLICY "Users can read own accounts"
  ON accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (user_id = auth.uid());

-- Sessions: users can read their own sessions only
CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  USING (user_id = auth.uid());

-- Verification tokens: no public access (service role only)

-- Fix the foreign key on games table to point to public.users instead of auth.users
-- (Skip this if you haven't run the main schema yet - just update schema.sql directly)
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;