import { supabaseAdmin } from "@/lib/supabase/admin";

export async function upsertScoreForUser(
  userId: string,
  score: number,
  playedOn: string,
) {
  const duplicate = await supabaseAdmin
    .from("scores")
    .select("id")
    .eq("user_id", userId)
    .eq("played_on", playedOn)
    .maybeSingle();

  if (duplicate.data) {
    throw new Error("Score for this date already exists.");
  }

  const { data, error } = await supabaseAdmin
    .from("scores")
    .insert({ user_id: userId, score, played_on: playedOn })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentScores(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data ?? [];
}
