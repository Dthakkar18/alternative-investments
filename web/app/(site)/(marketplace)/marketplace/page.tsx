"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: number;
  title: string;
  description: string;
  seller_name: string;
  asset_value: string;
  seller_retain_percent: string;
  target_amount: string;
  total_invested: string;
  percent_funded: string;
  min_investment: string;
  status: string;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);

      try {
        // For now: show ALL listings (draft + live) so you can see your data.
        // Later we can change this to `${apiBase}/listings/?status=live`
        const res = await fetch(`${apiBase}/listings/?status=live`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError(`Failed to load listings (status ${res.status})`);
          setListings([]);
          return;
        }

        const data = (await res.json()) as Listing[];
        setListings(data);
      } catch (e) {
        console.error("Network error fetching listings:", e);
        setError("Network error while loading marketplace.");
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <p className="text-sm text-foreground/70">Loading marketplace…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Marketplace</h1>
        <p className="text-sm text-foreground/70">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Marketplace</h1>
      <p className="text-sm text-foreground/70 mb-6">
        Browse collectible offerings available on the platform.
      </p>

      {listings.length === 0 ? (
        <p className="text-sm text-foreground/60">
          No listings yet. Create one from your seller dashboard.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => {

            const pct = Number(listing.percent_funded || "0");
            const invested = Number(listing.total_invested || "0");
            const target = Number(listing.target_amount || "0");
            const remaining = Math.max(0, target - invested);
            const isClosed = listing.status !== "live" || remaining <= 0;

            return(
              <a
                key={listing.id}
                href={`/listing/${listing.id}`}
                className={`rounded-xl border border-foreground/10 p-4 transition ${isClosed ? "opacity-70" : "hover:border-foreground/25"}`}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-base">{listing.title}</h2>
                    <p className="text-xs text-foreground/60">
                      by {listing.seller_name}
                    </p>
                    <p className="mt-2 text-sm line-clamp-3">
                      {listing.description}
                    </p>
                    {/* The progress ui */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-foreground/60 mb-1">
                        <span>{pct.toFixed(2)}% funded</span>
                        <span>
                          ${invested.toFixed(2)} / ${target.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400/80"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/60">
                        <span>Remaining</span>
                        <span>${remaining.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">
                      For sale: ${listing.target_amount}
                    </div>
                    <div className="text-foreground/60">
                      Asset: ${listing.asset_value}
                    </div>
                    <div className="text-foreground/60 mt-1">
                      Seller keeps {Number(listing.seller_retain_percent || "0").toFixed(2)}%
                    </div>
                    
                    {/* The status pill with live/closed */}
                    <div
                      className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                        isClosed
                          ? "border-foreground/15 text-foreground/50"
                          : "border-emerald-400/30 text-emerald-200"
                      }`}
                    >
                      {isClosed ? "Closed" : "Live"}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
