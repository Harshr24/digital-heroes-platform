import { redirect } from "next/navigation";
import { AdminDrawControls } from "@/components/admin-draw-controls";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { count: usersCount }, { count: activeSubs }, { count: pendingWinners }] =
    await Promise.all([
      supabase.from("users").select("role").eq("id", user.id).single(),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("winnings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  if (profile?.role !== "admin") redirect("/dashboard");

  const navCards = [
    { label: "User Management", desc: "View & manage all users and subscriptions", href: "/admin/users", color: "border-cyan-500/30" },
    { label: "Charities", desc: "Add, edit, and delete charity listings", href: "/admin/charities", color: "border-purple-500/30" },
    { label: "Winners", desc: "Verify submissions and mark payouts", href: "/admin/winners", color: "border-yellow-500/30", badge: pendingWinners },
    { label: "Reports", desc: "Analytics, prize pools, and draw stats", href: "/admin/reports", color: "border-green-500/30" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-zinc-300">Total users</p>
          <p className="text-2xl font-semibold">{usersCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-zinc-300">Active subscriptions</p>
          <p className="text-2xl font-semibold">{activeSubs ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-zinc-300">Pending verifications</p>
          <p className="text-2xl font-semibold">{pendingWinners ?? 0}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid gap-4 md:grid-cols-2">
        {navCards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className={`rounded-xl border bg-black/30 p-6 hover:bg-white/5 transition-colors space-y-1 ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{card.label}</p>
              {card.badge ? (
                <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                  {card.badge}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-zinc-400">{card.desc}</p>
          </a>
        ))}
      </div>

      {/* Draw Controls */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-6">
        <h2 className="font-semibold mb-4">Draw Controls</h2>
        <AdminDrawControls />
      </div>
    </main>
  );
}
