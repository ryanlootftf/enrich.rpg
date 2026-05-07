# Achievement Tracker — Refined MVP Plan

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| AI | NVIDIA NIM API |
| Hosting | Vercel |
| Version Control | GitHub |

---

## Architecture Overview

```
User
  ↓
Next.js (Vercel)
  ├── App Router (pages + layouts)
  ├── Server Actions (mutations)
  └── API Routes (/api/*)
        ├── Supabase (auth + database)
        └── NVIDIA NIM (achievement generation)
```

---

## Auth Flow

- Google OAuth via Supabase Auth
- Session managed by Supabase — no NextAuth needed
- Row Level Security (RLS) on all tables — users can only access their own data
- `auth.uid()` as the foreign key anchor across all tables

---

## Database Schema (PostgreSQL)

### games
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
title           TEXT NOT NULL
description     TEXT
theme_color     TEXT DEFAULT '#6366f1'
lifetime_stars  INTEGER DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT now()
```

### achievements
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
title           TEXT NOT NULL
difficulty      TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))
stars_rewarded  INTEGER NOT NULL
completed       BOOLEAN DEFAULT false
repeatable      BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
```

> Difficulty → stars mapping: `easy = 5`, `medium = 10`, `hard = 20`

### rewards
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
title           TEXT NOT NULL
required_stars  INTEGER NOT NULL
type            TEXT CHECK (type IN ('MAIN_TRACK', 'BONUS_TRACK'))
claimed         BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
```

### completion_logs
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
achievement_id  UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE
user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
completed_at    TIMESTAMPTZ DEFAULT now()
stars_earned    INTEGER NOT NULL
```

---

## RLS Policies (apply to all tables)

```sql
-- Example for games table (repeat pattern for all tables)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their games"
ON games FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## NVIDIA NIM Integration

**Model:** `meta/llama-3.1-70b-instruct` (or `mistralai/mistral-7b-instruct`) via NIM API — same OpenAI-compatible format.

**API Route:** `POST /api/generate-achievements`

```ts
// app/api/generate-achievements/route.ts
import OpenAI from 'openai' // NIM uses OpenAI-compatible SDK

const nim = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_NIM_API_KEY,
})

export async function POST(req: Request) {
  const { goal } = await req.json()

  const completion = await nim.chat.completions.create({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are an achievement generator for a self-improvement app.
Given a user goal, return exactly 6 achievements in JSON format:
2 easy (5 stars), 2 medium (10 stars), 2 hard (20 stars).
Return ONLY a JSON array, no explanation.
Format: [{ "title": string, "difficulty": "easy"|"medium"|"hard", "stars_rewarded": number }]`
      },
      { role: 'user', content: `Goal: ${goal}` }
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  const raw = completion.choices[0].message.content
  const achievements = JSON.parse(raw)
  return Response.json({ achievements })
}
```

---

## Next.js Project Structure

```
/app
  /auth
    /callback         ← Supabase OAuth redirect handler
  /(protected)
    /layout.tsx       ← Auth guard wrapper
    /dashboard        ← Home: all games
    /games
      /[id]           ← Game dashboard
      /[id]/achievements
      /[id]/rewards
  /api
    /generate-achievements
/components
  /ui                 ← Reusable components
  /games
  /achievements
  /rewards
/lib
  /supabase.ts        ← Client + server Supabase instances
  /nim.ts             ← NIM client
/utils
  /stars.ts           ← Star calculation helpers
```

---

## Core Logic

### Star Tracking
- `lifetime_stars` on the `games` table is the source of truth
- Incremented via a Supabase database function on achievement completion — never calculated client-side
- Adding new achievements never resets or reduces `lifetime_stars`

### Progress Calculation
```ts
// total_possible_stars = sum of all achievements' stars_rewarded in a game
const progress = (lifetime_stars / total_possible_stars) * 100
```

### Reward Unlocking
- Query rewards where `required_stars <= lifetime_stars` and `claimed = false`
- BONUS_TRACK rewards share a fixed `required_stars` interval (e.g. every 25 stars past the final main reward threshold)
- Claiming a reward flips `claimed = true` — stars are never deducted

---

## MVP Build Order

1. **Auth** — Google OAuth, Supabase session, protected routes
2. **Games CRUD** — create, list, delete games
3. **Achievements CRUD** — manual add, complete, edit, delete
4. **Star tracking** — server-side increment on completion
5. **Reward track** — main track UI, claim flow
6. **AI generation** — NIM route + UI modal
7. **Bonus track** — infinite progression after final reward
8. **Polish** — progress bars, theme colors, responsive layout

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NVIDIA_NIM_API_KEY=
```

---

## Core Gameplay Loop

```
Create Game
→ Add Achievements (manual or AI-generated)
→ Complete Achievements
→ Earn Stars
→ Progress Through Reward Track
→ Claim Rewards
→ Reach Final Reward
→ Enter Infinite Bonus Track
→ Earn Repeatable Rewards Forever
```

---

## Reward System Rules

- Stars are **permanent lifetime XP** — never spent or deducted
- Claiming a reward only flips `claimed = true`
- Main reward track scales upward (harder milestones over time)
- After the final main reward, the bonus track begins (every 25 stars = repeatable reward)
- Adding new achievements does **not** reset reward progress

### Example Main Track

| Stars Required | Reward |
|---|---|
| 10 | Favorite drink |
| 25 | Dessert |
| 50 | Gaming night |
| 80 | Buy an item |
| 120 | Final reward (e.g. new keyboard) |

---

## What's Explicitly Out of Scope (MVP)

- Multiplayer / social features
- Push notifications
- Analytics dashboard
- Badges or levels
- Animations / transitions
- Mobile app (web-responsive only for now)
