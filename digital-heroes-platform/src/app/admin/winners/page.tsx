import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminWinnersClient } from "@/components/admin-winners-client";

export default async function AdminWinnersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: winnings } = await supabase
    .from("winnings")
    .select("*, users(email)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Winners Management</h1>
        <a href="/admin" className="text-sm text-zinc-400 hover:text-white">← Back to Admin</a>
      </div>
      <AdminWinnersClient initialWinnings={winnings ?? []} />
    </main>
  );
}
