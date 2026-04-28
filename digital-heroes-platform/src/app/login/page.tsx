import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-16 w-full max-w-md rounded-xl border border-white/20 bg-black/40 p-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-zinc-300">Sign in to manage scores and draws.</p>
      <div className="mt-5">
        <AuthForm mode="login" />
      </div>
      <p className="mt-4 text-sm text-zinc-300">
        No account? <Link className="underline" href="/signup">Create one</Link>
      </p>
    </main>
  );
}
