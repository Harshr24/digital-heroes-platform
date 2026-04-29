"use client";

import { useState } from "react";

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  featured: boolean;
  created_at: string;
}

interface Props {
  initialCharities: Charity[];
}

export function AdminCharitiesClient({ initialCharities }: Props) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image_url: "", featured: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", image_url: "", featured: false });
    setShowForm(true);
  }

  function openEdit(c: Charity) {
    setEditing(c);
    setForm({ name: c.name, description: c.description, image_url: c.image_url ?? "", featured: c.featured });
    setShowForm(true);
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;

    const res = await fetch("/api/admin/charities", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setMessage(data.error ?? "Failed"); return; }

    if (editing) {
      setCharities((prev) => prev.map((c) => (c.id === editing.id ? data : c)));
    } else {
      setCharities((prev) => [data, ...prev]);
    }
    setShowForm(false);
    setMessage(editing ? "Charity updated." : "Charity added.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this charity?")) return;
    const res = await fetch("/api/admin/charities", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setCharities((prev) => prev.filter((c) => c.id !== id));
    else setMessage("Failed to delete.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{charities.length} charities listed</p>
        <button
          onClick={openNew}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black"
        >
          + Add Charity
        </button>
      </div>

      {message && <p className="text-sm text-cyan-400">{message}</p>}

      {showForm && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-4">
          <h2 className="font-semibold">{editing ? "Edit Charity" : "New Charity"}</h2>
          <input
            placeholder="Charity name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured charity
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {charities.map((c) => (
          <div key={c.id} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                {c.featured && (
                  <span className="text-xs text-cyan-400 font-semibold">★ Featured</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(c)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">{c.description}</p>
          </div>
        ))}
      </div>

      {charities.length === 0 && !showForm && (
        <p className="text-center text-zinc-500 py-8">No charities yet. Add one above.</p>
      )}
    </div>
  );
}
