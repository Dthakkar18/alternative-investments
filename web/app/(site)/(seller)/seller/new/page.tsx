"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong.";
}

export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [description, setDescription] = useState("");

  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!title.trim()) return setErr("Please enter a title.");
    if (!description.trim()) return setErr("Please enter a description.");
    if (!targetAmount) return setErr("Please enter a target amount.");

    setLoading(true);

    try {
      // Ensure csrftoken cookie exists (same pattern as sign-in/sign-up)
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";

      const res = await fetch(`${apiBase}/listings/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || null,
          target_amount: targetAmount,
          min_investment: minInvestment || null,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create listing.";
        try {
          const data = (await res.json()) as unknown;
          if (
            data &&
            typeof data === "object" &&
            "detail" in data &&
            typeof (data as { detail: unknown }).detail === "string"
          ) {
            msg = (data as { detail: string }).detail;
          } else if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
          ) {
            msg = (data as { error: string }).error;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }

      const listing = (await res.json()) as { id: number };
      setOkMsg("Listing created successfully.");
      router.push(`/listing/${listing.id}`);
    } catch (err) {
      setErr(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Create a New Listing</h1>
      <p className="text-sm text-foreground/70 mb-6">
        Describe your collectible and set funding targets.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {err && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            {okMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rolex Submariner 124060 (2021)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Watches, Cards, Sneakers..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Amount (USD)<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="25000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Investment (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
              value={minInvestment}
              onChange={(e) => setMinInvestment(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description<span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provenance, condition, why it's interesting, etc."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sage/20 border border-sage px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </main>
  );
}
