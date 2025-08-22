"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/portfolio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password) return setErr("Please enter your password.");

    setLoading(true);
    try {
      // Recommended: backend sets an httpOnly session cookie on success.
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include cookies if server sets them
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          remember, // optional: your backend can control session ttl
        }),
      });

      if (!res.ok) {
        let msg = "Sign in failed. Check your credentials.";
        try {
          const data = await res.json();
          msg = data?.detail || data?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      // Optional: if backend returns JSON like { requires2fa: true }
      // const data = await res.json();
      // if (data.requires2fa) return router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);

      router.push(redirect);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-sm mx-auto">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-foreground/70">Welcome back.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Password</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Keep me signed in
        </label>

        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {err}
          </div>
        )}

        <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sage/20 border border-sage px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="text-sm flex justify-between">
          <a className="text-sky-matte hover:underline" href="/forgot-password">
            Forgot password?
          </a>
          <a className="text-sky-matte hover:underline" href="/sign-up">
            Create account
          </a>
        </div>
      </form>
    </main>
  );
}

