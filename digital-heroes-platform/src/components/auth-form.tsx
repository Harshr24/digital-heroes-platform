"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Processing...");

    const response =
      mode === "signup"
        ? await supabaseBrowser.auth.signUp({ email, password })
        : await supabaseBrowser.auth.signInWithPassword({ email, password });

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    setMessage(mode === "signup" ? "Account created." : "Welcome back.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-black">
        {mode === "signup" ? "Create account" : "Sign in"}
      </button>
      <p className="text-sm text-zinc-300">{message}</p>
    </form>
  );
}
