import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("scores")
    .select("user_id, score")
    .order("score", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Leaderboard</h1>
      <ol className="mt-5 space-y-2">
        {(data ?? []).map((entry, i) => (
          <li key={`${entry.user_id}-${entry.score}`} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
            #{i + 1} - Player {entry.user_id.slice(0, 8)} - Score {entry.score}
          </li>
        ))}
      </ol>
    </main>
  );
}
