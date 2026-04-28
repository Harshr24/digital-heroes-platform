import { redirect } from "next/navigation";

import { AdminDrawControls } from "@/components/admin-draw-controls";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: usersCount }, { count: activeSubs }] =
    await Promise.all([
      supabase.from("users").select("role").eq("id", user.id).single(),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-zinc-300">Total users</p>
          <p className="text-2xl font-semibold">{usersCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-zinc-300">Active subscriptions</p>
          <p className="text-2xl font-semibold">{activeSubs ?? 0}</p>
        </div>
      </div>
      <AdminDrawControls />
    </main>
  );
}
