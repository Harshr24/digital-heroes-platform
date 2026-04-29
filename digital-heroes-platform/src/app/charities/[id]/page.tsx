import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: charity } = await supabaseAdmin
    .from("charities")
    .select("*")
    .eq("id", id)
    .single();

  if (!charity) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 space-y-6">
      <a href="/charities" className="text-sm text-zinc-400 hover:text-white">
        ← All Charities
      </a>

      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        {charity.image_url && (
          <img
            src={charity.image_url}
            alt={charity.name}
            className="w-full h-56 object-cover"
          />
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-semibold">{charity.name}</h1>
            {charity.featured && (
              <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-400">
                ★ Featured
              </span>
            )}
          </div>
          <p className="text-zinc-300 leading-relaxed">{charity.description}</p>

          {charity.events && charity.events.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold text-lg">Upcoming Events</h2>
              <ul className="space-y-2">
                {charity.events.map((event: { name: string; date: string }, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  >
                    <span>{event.name}</span>
                    <span className="text-zinc-400">{event.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <a
              href="/signup"
              className="inline-block rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-black text-sm"
            >
              Subscribe & Support This Charity
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
