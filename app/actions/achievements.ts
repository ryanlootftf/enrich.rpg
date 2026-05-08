"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const STAR_MAP = {
  easy: 5,
  medium: 10,
  hard: 20,
} as const;

export type Difficulty = "easy" | "medium" | "hard";

export async function createAchievement(
  gameId: string,
  title: string,
  difficulty: Difficulty
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
    difficulty,
    stars_rewarded: starsRewarded,
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