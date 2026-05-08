"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const THEMES = ["purple", "teal", "coral", "gold"] as const;

export async function createGame(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  const { error } = await supabase.from("games").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || "",
    theme_color: theme,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("games").delete().eq("id", gameId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}