import { redirect } from "next/navigation";

import { AnimatedCard } from "@/components/animated-card";
import { DashboardActions } from "@/components/dashboard-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: subscription }, { data: scores }, { data: winnings }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("winnings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-3xl font-semibold">User Dashboard</h1>

      <AnimatedCard>
        <p className="text-sm text-zinc-300">Subscription status</p>
        <p className="mt-1 text-xl font-semibold">
          {subscription?.status?.toUpperCase() ?? "INACTIVE"}
        </p>
      </AnimatedCard>

      <DashboardActions />

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatedCard>
          <h2 className="font-semibold">Latest Scores</h2>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {(scores ?? []).map((score) => (
              <li key={score.id}>
                {score.played_on}: <strong>{score.score}</strong>
              </li>
            ))}
          </ul>
        </AnimatedCard>

        <AnimatedCard>
          <h2 className="font-semibold">Recent Winnings</h2>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {(winnings ?? []).map((win) => (
              <li key={win.id}>
                {win.amount} ({win.status})
              </li>
            ))}
          </ul>
        </AnimatedCard>
      </div>
    </main>
  );
}
