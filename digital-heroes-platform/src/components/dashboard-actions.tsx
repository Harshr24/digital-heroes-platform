"use client";

import { useState } from "react";

export function DashboardActions() {
  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [message, setMessage] = useState("");

  async function createCheckout(plan: "monthly" | "yearly") {
    setMessage("Creating checkout...");
    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        setMessage(data.error ?? "Failed to start checkout.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setMessage("Checkout URL was not returned.");
    } catch {
      setMessage("Network error while starting checkout.");
    }
  }

  async function submitScore() {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score, playedOn }),
    });
    const data = await response.json();
    setMessage(data.error ?? "Score saved");
    if (!data.error) window.location.reload();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="font-semibold">Subscription</h3>
        <p className="text-sm text-zinc-300">Activate your participation plan.</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => createCheckout("monthly")}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-black"
          >
            Monthly
          </button>
          <button
            onClick={() => createCheckout("yearly")}
            className="rounded-lg border border-white/30 px-3 py-2"
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="font-semibold">Add Score</h3>
        <p className="text-sm text-zinc-300">1-45 only, max 5 scores retained.</p>
        <div className="mt-3 space-y-2">
          <input
            type="number"
            min={1}
            max={45}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
          />
          <input
            type="date"
            value={playedOn}
            onChange={(e) => setPlayedOn(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/30 px-3 py-2"
          />
          <button onClick={submitScore} className="rounded-lg bg-white px-3 py-2 text-black">
            Save score
          </button>
          <p className="text-sm text-zinc-300">{message}</p>
        </div>
      </section>
    </div>
  );
}
