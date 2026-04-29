import { redirect } from "next/navigation";
import { AnimatedCard } from "@/components/animated-card";
import { DashboardActions } from "@/components/dashboard-actions";
import { CharitySelector } from "@/components/charity-selector";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: subscription },
    { data: scores },
    { data: winnings },
    { data: profile },
    { data: upcomingDraw },
  ] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("winnings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("users").select("charity_id, charity_percentage").eq("id", user.id).single(),
    supabase.from("draws").select("id, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const totalWon = (winnings ?? [])
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + (w.amount ?? 0), 0);

  const drawsEntered = (winnings ?? []).length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-semibold">Your Dashboard</h1>

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard>
          <p className="text-sm text-zinc-300">Subscription</p>
          <p className="mt-1 text-xl font-semibold">
            {subscription?.status?.toUpperCase() ?? "INACTIVE"}
          </p>
          {subscription?.period_end && (
            <p className="text-xs text-zinc-500 mt-1">
              Renews {new Date(subscription.period_end).toLocaleDateString()}
            </p>
          )}
        </AnimatedCard>

        <AnimatedCard>
          <p className="text-sm text-zinc-300">Total Winnings</p>
          <p className="mt-1 text-xl font-semibold">£{totalWon.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-1">{drawsEntered} draws entered</p>
        </AnimatedCard>

        <AnimatedCard>
          <p className="text-sm text-zinc-300">Next Draw</p>
          <p className="mt-1 text-xl font-semibold">
            {upcomingDraw ? new Date(upcomingDraw.created_at).toLocaleDateString() : "TBC"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {upcomingDraw ? `Draw #${upcomingDraw.id.slice(0, 6)}` : "No draw scheduled yet"}
          </p>
        </AnimatedCard>
      </div>

      {/* Score entry + subscription actions */}
      <DashboardActions />

      {/* Charity selector */}
      <CharitySelector
        currentCharityId={profile?.charity_id}
        currentPercentage={profile?.charity_percentage}
      />

      {/* Scores + Winnings */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatedCard>
          <h2 className="font-semibold">Latest Scores</h2>
          <p className="text-xs text-zinc-500 mb-2">Last 5 scores retained (Stableford)</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {(scores ?? []).length === 0 ? (
              <li className="text-zinc-500">No scores entered yet.</li>
            ) : (
              (scores ?? []).map((score) => (
                <li key={score.id} className="flex justify-between">
                  <span>{score.played_on}</span>
                  <strong>{score.score} pts</strong>
                </li>
              ))
            )}
          </ul>
        </AnimatedCard>

        <AnimatedCard>
          <h2 className="font-semibold">Recent Winnings</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {(winnings ?? []).length === 0 ? (
              <li className="text-zinc-500">No winnings yet. Keep playing!</li>
            ) : (
              (winnings ?? []).map((win) => (
                <li key={win.id} className="flex justify-between">
                  <span>£{win.amount?.toFixed(2)}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    win.status === "paid"
                      ? "bg-green-500/20 text-green-300"
                      : win.status === "approved"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {win.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </AnimatedCard>
      </div>
    </main>
  );
}
