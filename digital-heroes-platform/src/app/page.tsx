import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Home() {
  const { data: featuredCharities } = await supabaseAdmin
    .from("charities")
    .select("id, name, description, image_url")
    .eq("featured", true)
    .limit(3);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950 via-black to-black" />

        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400/80">
          Digital Heroes Platform
        </p>

        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
          Play better golf.{" "}
          <span className="text-cyan-400">Fund real change.</span>{" "}
          Win monthly rewards.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-zinc-300">
          Subscribe, enter your Stableford scores, and compete in monthly draws
          — while a portion of every subscription goes directly to your chosen
          charity.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-cyan-400 px-8 py-4 text-lg font-semibold text-black transition hover:bg-cyan-300"
          >
            Join the mission →
          </Link>
          <Link
            href="/charities"
            className="rounded-xl border border-white/20 px-8 py-4 text-lg transition hover:border-white/40"
          >
            See our charities
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "£0 → Jackpot", label: "Monthly prize pool" },
            { value: "10%+", label: "To your charity" },
            { value: "Monthly", label: "Draws for subscribers" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-semibold text-cyan-400">{s.value}</p>
              <p className="mt-1 text-sm text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-5xl px-6 py-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <p className="text-zinc-400">Three simple steps. Real impact.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Subscribe",
              desc: "Choose a monthly or yearly plan. A portion of your subscription funds your chosen charity automatically.",
              color: "border-cyan-500/30",
            },
            {
              step: "02",
              title: "Enter your scores",
              desc: "Log your last 5 Stableford golf scores (1–45). Your scores form your entry ticket into the monthly draw.",
              color: "border-purple-500/30",
            },
            {
              step: "03",
              title: "Win & give",
              desc: "Match 3, 4, or 5 numbers in the monthly draw to win cash prizes — while your charity benefits every month regardless.",
              color: "border-green-500/30",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`rounded-2xl border bg-black/30 p-6 space-y-3 ${item.color}`}
            >
              <p className="text-4xl font-bold text-white/10">{item.step}</p>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIZE POOL ── */}
      <section className="bg-white/5 border-y border-white/10 py-24">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold">Prize pool breakdown</h2>
            <p className="text-zinc-400">
              Every active subscriber contributes to the prize pool each month.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                match: "5-Number Match",
                share: "40%",
                note: "Jackpot — rolls over if unclaimed",
                color: "text-yellow-400",
                bg: "border-yellow-500/30",
              },
              {
                match: "4-Number Match",
                share: "35%",
                note: "Split equally among winners",
                color: "text-cyan-400",
                bg: "border-cyan-500/30",
              },
              {
                match: "3-Number Match",
                share: "25%",
                note: "Split equally among winners",
                color: "text-green-400",
                bg: "border-green-500/30",
              },
            ].map((tier) => (
              <div
                key={tier.match}
                className={`rounded-2xl border bg-black/30 p-6 text-center space-y-2 ${tier.bg}`}
              >
                <p className={`text-4xl font-bold ${tier.color}`}>{tier.share}</p>
                <p className="font-semibold">{tier.match}</p>
                <p className="text-xs text-zinc-500">{tier.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITY IMPACT ── */}
      <section className="mx-auto max-w-5xl px-6 py-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold">Your subscription gives back</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            At least 10% of every subscription goes directly to a charity of
            your choice. You can increase this percentage anytime from your
            dashboard.
          </p>
        </div>

        {featuredCharities && featuredCharities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredCharities.map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.id}`}
                className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden hover:border-white/30 transition-colors"
              >
                {charity.image_url && (
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4 space-y-1">
                  <p className="font-semibold">{charity.name}</p>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {charity.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            Charities coming soon.
          </div>
        )}

        <div className="text-center">
          <Link
            href="/charities"
            className="text-sm text-cyan-400 hover:underline"
          >
            View all charities →
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-white/10 py-24 text-center px-6">
        <h2 className="text-4xl font-semibold max-w-xl mx-auto leading-tight">
          Ready to play with purpose?
        </h2>
        <p className="mt-4 text-zinc-400 max-w-md mx-auto">
          Join Digital Heroes today. Compete, contribute, and make every round
          count.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="rounded-xl bg-cyan-400 px-8 py-4 text-lg font-semibold text-black transition hover:bg-cyan-300"
          >
            Subscribe now
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 px-8 py-4 text-lg transition hover:border-white/40"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
