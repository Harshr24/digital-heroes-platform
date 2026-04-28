"use client";

import { useState } from "react";

export function AdminDrawControls() {
  const [message, setMessage] = useState("");

  async function runDraw(mode: "random" | "algorithmic") {
    setMessage("Running draw...");
    try {
      const response = await fetch("/api/admin/draws/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await response.json()) as {
        error?: string;
        data?: { draw_month?: string };
      };

      if (!response.ok) {
        setMessage(data.error ?? "Failed to run draw.");
        return;
      }

      setMessage(data.error ?? `Draw created: ${data.data?.draw_month ?? "ok"}`);
    } catch {
      setMessage("Network error while running draw.");
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="font-semibold">Draw Control</h3>
      <div className="mt-3 flex gap-2">
        <button className="rounded bg-cyan-400 px-3 py-2 text-black" onClick={() => runDraw("random")}>
          Run Random
        </button>
        <button className="rounded border border-white/20 px-3 py-2" onClick={() => runDraw("algorithmic")}>
          Run Algorithmic
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-300">{message}</p>
    </div>
  );
}
