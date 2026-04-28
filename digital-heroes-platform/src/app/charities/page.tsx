import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CharitiesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Charity Directory</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(charities ?? []).map((charity) => (
          <article key={charity.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="text-lg font-semibold">{charity.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{charity.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
