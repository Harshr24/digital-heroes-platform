import Link from "next/link";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto mt-16 w-full max-w-md rounded-xl border border-white/20 bg-black/40 p-6">
      <h1 className="text-2xl font-semibold">Join Digital Heroes</h1>
      <p className="mt-1 text-zinc-300">
        Create your account and start supporting a charity.
      </p>
      <div className="mt-5">
        <AuthForm mode="signup" />
      </div>
      <p className="mt-4 text-sm text-zinc-300">
        Already joined? <Link className="underline" href="/login">Sign in</Link>
      </p>
    </main>
  );
}
