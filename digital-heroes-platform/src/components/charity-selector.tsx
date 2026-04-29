"use client";

import { useState, useEffect } from "react";

interface Charity {
  id: string;
  name: string;
  description: string;
  featured: boolean;
}

interface Props {
  currentCharityId?: string | null;
  currentPercentage?: number | null;
}

export function CharitySelector({ currentCharityId, currentPercentage }: Props) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedId, setSelectedId] = useState(currentCharityId ?? "");
  const [percentage, setPercentage] = useState(currentPercentage ?? 10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/charities")
      .then((r) => r.json())
      .then(setCharities)
      .catch(() => setMessage("Failed to load charities."));
  }, []);

  async function handleSave() {
    if (!selectedId) { setMessage("Please select a charity."); return; }
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/user/charity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ charityId: selectedId, charityPercentage: percentage }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? "Charity preference saved!" : (data.error ?? "Failed to save."));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-4">
      <div>
        <h2 className="font-semibold">Your Charity</h2>
        <p className="text-sm text-zinc-400">Minimum 10% of your subscription goes to your chosen charity.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Select a charity</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm"
        >
          <option value="">— Choose a charity —</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.featured ? "★ " : ""}{c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">
          Contribution: <span className="text-white font-semibold">{percentage}%</span>
        </label>
        <input
          type="range"
          min={10}
          max={100}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>10% (min)</span>
          <span>100%</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Preference"}
      </button>

      {message && (
        <p className={`text-sm ${message.includes("saved") ? "text-cyan-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
