"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Upsert a reward at a specific star slot for a game.
 * If a reward already exists at that required_stars + type, update it.
 * Otherwise insert a new one.
 */
export async function upsertReward(
  gameId: string,
  requiredStars: number,
  title: string,
  emoji: string,
  type: "MAIN_TRACK" | "BONUS_TRACK",
  isFinal: boolean = false
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if one already exists at this slot
  const { data: existing } = await supabase
    .from("rewards")
    .select("id")
    .eq("game_id", gameId)
    .eq("required_stars", requiredStars)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("rewards")
      .update({ title: title.trim(), emoji: emoji || "🎁", is_final: isFinal })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("rewards").insert({
      game_id: gameId,
      user_id: user.id,
      title: title.trim(),
      emoji: emoji || "🎁",
      required_stars: requiredStars,
      type,
      is_final: isFinal,
      claimed: false,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/games/${gameId}`);
}

/**
 * Claim a reward — flips claimed to true.
 */
export async function claimReward(id: string, gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rewards")
    .update({ claimed: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

/**
 * Unclaim a reward — flips claimed back to false.
 */
export async function unclaimReward(id: string, gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rewards")
    .update({ claimed: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}

/**
 * Delete a reward by id.
 */
export async function deleteReward(id: string, gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("rewards").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/games/${gameId}`);
}