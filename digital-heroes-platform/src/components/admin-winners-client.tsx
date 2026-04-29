"use client";

import { useState } from "react";

interface Winning {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  tier: number;
  proof_url?: string;
  created_at: string;
  users?: { email: string };
}

export function AdminWinnersClient({ initialWinnings }: { initialWinnings: Winning[] }) {
  const [winnings, setWinnings] = useState<Winning[]>(initialWinnings);
  const [message, setMessage] = useState("");

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/winners/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error ?? "Failed"); return; }
    setWinnings((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    setMessage(`Status updated to ${status}`);
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300",
    approved: "bg-blue-500/20 text-blue-300",
    rejected: "bg-red-500/20 text-red-300",
    paid: "bg-green-500/20 text-green-300",
  };

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-cyan-400">{message}</p>}

      <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Proof</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {winnings.map((w) => (
              <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">{w.users?.email ?? w.user_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-zinc-300">{w.tier}-Match</td>
                <td className="px-4 py-3 font-semibold">£{w.amount?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[w.status] ?? "bg-zinc-700 text-zinc-300"}`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" className="text-cyan-400 hover:underline text-xs">
                      View proof
                    </a>
                  ) : (
                    <span className="text-zinc-600 text-xs">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {w.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(w.id, "approved")}
                          className="text-xs text-blue-400 hover:text-blue-300">Approve</button>
                        <button onClick={() => updateStatus(w.id, "rejected")}
                          className="text-xs text-red-400 hover:text-red-300">Reject</button>
                      </>
                    )}
                    {w.status === "approved" && (
                      <button onClick={() => updateStatus(w.id, "paid")}
                        className="text-xs text-green-400 hover:text-green-300">Mark Paid</button>
                    )}
                    {(w.status === "paid" || w.status === "rejected") && (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {winnings.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No winners yet.</p>
        )}
      </div>
    </div>
  );
}
