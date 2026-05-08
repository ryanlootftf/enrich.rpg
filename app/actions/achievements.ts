"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const STAR_MAP = {
  easy: 1,
  medium: 3,
  hard: 5,
} as const;

export type Difficulty = "easy" | "medium" | "hard";

export async function createAchievement(
  gameId: string,
  title: string,
  difficulty: Difficulty,
  description?: string,
  progressMax?: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const starsRewarded = STAR_MAP[difficulty];

  const { error } = await supabase.from("achievements").insert({
    game_id: gameId,
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() ?? "",
    difficulty,
    stars_rewarded: starsRewarded,
    progress_max: progressMax ?? 0,
    progress_current: 0,
    completed: false,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function deleteAchievement(id: string, gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("achievements").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementTitle(
  id: string,
  gameId: string,
  title: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("achievements")
    .update({ title: title.trim() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementDescription(
  id: string,
  gameId: string,
  description: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("achievements")
    .update({ description: description.trim() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementProgress(
  id: string,
  gameId: string
) {
  const supabase = await createClient();

  // Fetch current state
  const { data: ach, error: fetchErr } = await supabase
    .from("achievements")
    .select("progress_current, progress_max, completed")
    .eq("id", id)
    .single();

  if (fetchErr || !ach) throw new Error(fetchErr?.message ?? "Not found");
  if (ach.completed) return; // already done, no-op

  const newCurrent = (ach.progress_current ?? 0) + 1;
  const newCompleted = newCurrent >= (ach.progress_max ?? 0);

  const { error } = await supabase
    .from("achievements")
    .update({
      progress_current: newCurrent,
      completed: newCompleted,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementProgressBy(
  id: string,
  gameId: string,
  delta: number
) {
  const supabase = await createClient();

  // Fetch current state
  const { data: ach, error: fetchErr } = await supabase
    .from("achievements")
    .select("progress_current, progress_max, completed")
    .eq("id", id)
    .single();

  if (fetchErr || !ach) throw new Error(fetchErr?.message ?? "Not found");

  const newCurrent = Math.max(0, Math.min((ach.progress_current ?? 0) + delta, ach.progress_max ?? 0));
  const newCompleted = newCurrent >= (ach.progress_max ?? 0) && (ach.progress_max ?? 0) > 0;

  const { error } = await supabase
    .from("achievements")
    .update({
      progress_current: newCurrent,
      completed: newCompleted,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementProgressMax(
  id: string,
  gameId: string,
  progressMax: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("achievements")
    .update({ progress_max: Math.max(0, progressMax) })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

export async function updateAchievementDifficulty(
  id: string,
  gameId: string,
  difficulty: Difficulty
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("achievements")
    .update({ difficulty, stars_rewarded: STAR_MAP[difficulty] })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}