"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Listing = {
  id: number;
  title: string;
  description: string;
  category: string | null;
  asset_value: string | null;
  seller_retain_percent: string | null;
  target_amount: string;
  min_investment: string;
  status: string;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [assetValue, setAssetValue] = useState("");
  const [retainPercent, setRetainPercent] = useState("0");
  const [minInvestment, setMinInvestment] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const { forSalePercent, forSaleAmount } = useMemo(() => {
    const asset = Number(assetValue || 0);
    const keep = Number(retainPercent || 0);
    const pct = Math.min(100, Math.max(0, 100 - keep));
    const amt = asset > 0 ? (asset * pct) / 100 : 0;
    return {
      forSalePercent: pct,
      forSaleAmount: amt.toFixed(2),
    };
  }, [assetValue, retainPercent]);

  // Load existing listing
  useEffect(() => {
    if (!id) return;

    async function fetchListing() {
      setLoading(true);
      setError(null);
      setInfo(null);

      try {
        const res = await fetch(`${apiBase}/listings/${id}/`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError(`Failed to load listing (status ${res.status})`);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as Listing;
        setListing(data);

        setTitle(data.title);
        setCategory(data.category ?? "");
        setAssetValue(data.asset_value ?? "");
        setRetainPercent(data.seller_retain_percent ?? "0");
        setMinInvestment(data.min_investment ?? "");
        setDescription(data.description);

        if (data.status !== "draft") {
          setInfo(
            "This listing is no longer in draft. Edits are limited and may be blocked by platform policy."
          );
        }
      } catch (e) {
        console.error("Error loading listing:", e);
        setError("Network error while loading listing.");
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!listing) return;

    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";

      const res = await fetch(`${apiBase}/listings/${listing.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || null,
          asset_value: assetValue,
          seller_retain_percent: retainPercent || "0",
          min_investment: minInvestment || null,
          // target_amount stays computed server-side
        }),
      });

      if (!res.ok) {
        setError(`Failed to save changes (status ${res.status})`);
        setSaving(false);
        return;
      }

      setInfo("Changes saved.");
      router.push("/seller/listings");
    } catch (e) {
      console.error("Error saving listing:", e);
      setError("Network error while saving listing.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8 max-w-xl mx-auto">
        <p className="text-sm text-foreground/70">Loading listing…</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Listing not found</h1>
        <p className="text-sm text-foreground/70">
          We couldn&apos;t find that listing.
        </p>
      </main>
    );
  }

  if (listing.status !== "draft") {
    return (
      <main className="p-8 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-foreground/60 mb-3 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold mb-2">Editing not allowed</h1>
        <p className="text-sm text-foreground/70 mb-4">
          This listing is no longer in draft and cannot be edited.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-xs text-foreground/60 mb-3 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mb-2">
        Edit listing: <span className="font-normal">{listing.title}</span>
      </h1>
      <p className="text-xs text-foreground/60 mb-4">
        Status: {listing.status}
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3 rounded-lg border border-foreground/20 bg-foreground/5 p-3 text-sm">
          {info}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Asset value (USD)<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Seller ownership to keep (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
              value={retainPercent}
              onChange={(e) => setRetainPercent(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-foreground/60">
              Investors will be offered {forSalePercent.toFixed(2)}% ($
              {forSaleAmount}).
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Minimum investment (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-foreground/15 px-3 py-2 text-sm"
            value={minInvestment}
            onChange={(e) => setMinInvestment(e.target.value)}
          />
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
            required
          />
        </div>

        <div className="rounded-lg border border-foreground/15 bg-background/40 p-3 text-xs text-foreground/70">
          <p>
            <span className="font-medium">Summary:</span> You value this asset
            at <span className="font-mono">${assetValue || "0.00"}</span> and
            will keep{" "}
            <span className="font-mono">{retainPercent || "0"}%</span>. Investors
            will be offered{" "}
            <span className="font-mono">
              {forSalePercent.toFixed(2)}% (${forSaleAmount})
            </span>
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sage/20 border border-sage px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
  );
}
