import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, status, plan, period_end");

  const subMap = Object.fromEntries(
    (subscriptions ?? []).map((s) => [s.user_id, s])
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">User Management</h1>
        <a href="/admin" className="text-sm text-zinc-400 hover:text-white">
          ← Back to Admin
        </a>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400">
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Sub Status</th>
              <th className="px-4 py-3 text-left">Renews</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const sub = subMap[u.id];
              return (
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {u.role ?? "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 capitalize">
                    {sub?.plan ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        sub?.status === "active"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {sub?.status ?? "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {sub?.period_end
                      ? new Date(sub.period_end).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(users ?? []).length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No users found.</p>
        )}
      </div>
    </main>
  );
}
