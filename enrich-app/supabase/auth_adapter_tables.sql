-- Auth.js Supabase Adapter Tables
-- The adapter uses schema: "next_auth" internally, so tables must be in that schema.
-- Run this in Supabase SQL Editor.

-- Create the schema the adapter expects
CREATE SCHEMA IF NOT EXISTS next_auth;

-- Users table (in next_auth schema, as required by @auth/supabase-adapter)
CREATE TABLE IF NOT EXISTS next_auth.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS next_auth.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS next_auth.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

-- Enable Row Level Security on all adapter tables
ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users policies: can read, insert, update own record
CREATE POLICY "Users can read own record"
  ON next_auth.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own record"
  ON next_auth.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own record"
  ON next_auth.users FOR UPDATE
  USING (id = auth.uid());

-- Accounts policies: users can read/insert/delete their own linked accounts
CREATE POLICY "Users can read own accounts"
  ON next_auth.accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts"
  ON next_auth.accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts"
  ON next_auth.accounts FOR DELETE
  USING (user_id = auth.uid());

-- Sessions: users can read their own sessions only
CREATE POLICY "Users can read own sessions"
  ON next_auth.sessions FOR SELECT
  USING (user_id = auth.uid());

-- Verification tokens: no public access (service role only)

-- Fix the foreign key on games table to point to next_auth.users instead of auth.users
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_user_id_fkey;
ALTER TABLE games ADD CONSTRAINT games_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;