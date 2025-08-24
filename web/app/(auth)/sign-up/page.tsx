"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordScore(pw: string) {
  // tiny strength heuristic (0–4)
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState<string>("");
  const [okMsg, setOkMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  function getCookie(name: string) {
    return document.cookie.split("; ").find(c => c.startsWith(name + "="))?.split("=")[1];
  }
  
  const onChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErr("");
      setOkMsg("");
    };

  function getErrorMessage(err: unknown) {
    return err instanceof Error ? err.message : "Something went wrong.";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    // Client-side checks
    if (!form.name.trim()) return setErr("Please enter your name.");
    if (!validateEmail(form.email)) return setErr("Please enter a valid email.");
    if (form.password.length < 8)
      return setErr("Password must be at least 8 characters.");
    if (form.password !== form.confirm)
      return setErr("Passwords do not match.");

    setLoading(true);
    try {
      // Ensure csrftoken cookie exists
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";

      // Adjust endpoint to match your Django view/URLconf
      // Recommended Django URL (proxied by Caddy): POST /api/auth/register
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        credentials: "include",                 // include cookies
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,             // CSRF header
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        // Try to parse a meaningful error message from API
        let msg = "Sign up failed. Please try again.";
        try {
          const data = await res.json();
          msg = data?.detail || data?.error || msg;
        } catch {
          // ignore parse errors
        }
        throw new Error(msg);
      }

      setOkMsg("Account created! Redirecting to sign in…");
      // small delay so user sees success message
      setTimeout(() => router.push("/sign-in"), 600);
    } catch (err: unknown) {
      setErr(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const score = passwordScore(form.password);
  const scoreLabels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
  const scorePct = (score / 4) * 100;

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-foreground/70">
        Start investing in authenticated collectibles.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="text-sm block mb-1">Name</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={onChange("name")}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange("email")}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Password</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={onChange("password")}
            autoComplete="new-password"
          />
          {/* Strength meter */}
          <div className="mt-2">
            <div className="h-2 w-full rounded bg-foreground/10 overflow-hidden">
              <div
                className="h-2 bg-sky-matte"
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-foreground/60">
              {scoreLabels[score]}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm block mb-1">Confirm password</label>
          <input
            className="w-full rounded-lg border border-foreground/20 bg-background/50 p-2"
            type="password"
            placeholder="Retype password"
            value={form.confirm}
            onChange={onChange("confirm")}
            autoComplete="new-password"
          />
        </div>

        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="rounded-lg border border-sage/40 bg-sage/15 p-3 text-sm">
            {okMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sage/20 border border-sage px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-sm text-foreground/70">
          Already have an account?{" "}
          <a className="text-sky-matte hover:underline" href="/sign-in">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}

