import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <main className="w-full max-w-5xl rounded-3xl border border-white/15 bg-black/40 p-10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
          Digital Heroes Platform
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Play better golf. Fund real change. Win monthly rewards.
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-200">
          Subscription-driven golf score challenge with transparent charity
          contributions, monthly draws, winner verification, and admin analytics.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-cyan-400 px-5 py-3 font-medium text-black"
          >
            Join the mission
          </Link>
          <Link href="/login" className="rounded-lg border border-white/20 px-5 py-3">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-white/20 px-5 py-3">
            View dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
