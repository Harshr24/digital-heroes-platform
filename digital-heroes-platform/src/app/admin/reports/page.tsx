import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: subscriptions },
    { data: charityContribs },
    { data: draws },
    { data: winnings },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("plan, status"),
    supabase.from("users").select("charity_percentage"),
    supabase.from("draws").select("id, status, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("winnings").select("amount, status, tier"),
  ]);

  const monthlyCount = (subscriptions ?? []).filter((s) => s.plan === "monthly" && s.status === "active").length;
  const yearlyCount = (subscriptions ?? []).filter((s) => s.plan === "yearly" && s.status === "active").length;

  const MONTHLY_PRICE = 9.99;
  const YEARLY_PRICE = 99.99;
  const monthlyRevenue = monthlyCount * MONTHLY_PRICE;
  const yearlyRevenue = yearlyCount * (YEARLY_PRICE / 12);
  const totalMonthlyRevenue = monthlyRevenue + yearlyRevenue;

  const prizePool = totalMonthlyRevenue * 0.5;
  const charityPool = totalMonthlyRevenue * 0.1;

  const totalPaidOut = (winnings ?? [])
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + (w.amount ?? 0), 0);

  const avgCharity =
    (charityContribs ?? []).length > 0
      ? (charityContribs ?? []).reduce((sum, u) => sum + (u.charity_percentage ?? 10), 0) /
        (charityContribs ?? []).length
      : 10;

  const match5Wins = (winnings ?? []).filter((w) => w.tier === 5).length;
  const match4Wins = (winnings ?? []).filter((w) => w.tier === 4).length;
  const match3Wins = (winnings ?? []).filter((w) => w.tier === 3).length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
        <a href="/admin" className="text-sm text-zinc-400 hover:text-white">← Back to Admin</a>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Users", value: totalUsers ?? 0 },
          { label: "Active Subscribers", value: activeSubs ?? 0 },
          { label: "Monthly Revenue (est.)", value: `£${totalMonthlyRevenue.toFixed(2)}` },
          { label: "Total Paid Out", value: `£${totalPaidOut.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-3">
          <h2 className="font-semibold">Subscription Breakdown</h2>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Monthly subscribers</span>
            <span className="font-medium">{monthlyCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Yearly subscribers</span>
            <span className="font-medium">{yearlyCount}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
            <span className="text-zinc-400">Est. prize pool this month</span>
            <span className="font-semibold text-cyan-400">£{prizePool.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Est. charity contribution</span>
            <span className="font-semibold text-green-400">£{charityPool.toFixed(2)}</span>
          </div>
        </div>

        {/* Draw Stats */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-3">
          <h2 className="font-semibold">Draw Statistics</h2>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">5-Match winners</span>
            <span className="font-medium">{match5Wins}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">4-Match winners</span>
            <span className="font-medium">{match4Wins}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">3-Match winners</span>
            <span className="font-medium">{match3Wins}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Avg charity %</span>
            <span className="font-medium">{avgCharity.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Recent Draws */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-3">
        <h2 className="font-semibold">Recent Draws</h2>
        {(draws ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">No draws run yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 border-b border-white/10">
                <th className="pb-2 text-left">Draw ID</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(draws ?? []).map((d) => (
                <tr key={d.id} className="border-b border-white/5">
                  <td className="py-2 text-zinc-300">{d.id.slice(0, 8)}…</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      d.status === "published" ? "bg-green-500/20 text-green-300" : "bg-zinc-700 text-zinc-300"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2 text-zinc-400">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
