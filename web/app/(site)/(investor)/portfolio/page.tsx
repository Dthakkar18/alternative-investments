"use client";

import { useEffect, useState } from "react";

type Investment = {
  id: number;
  listing: number;
  listing_title: string;
  listing_asset_value: string;
  listing_target_amount: string;
  amount: string;
  ownership_percent: string;
  created_at: string;
  isSellerHolding?: boolean; // flag to distinguish retained holdings
};

type ListingSummary = {
  id: number;
  title: string;
  asset_value: string | null;
  seller_retain_percent: string | null;
  target_amount: string;
  created_at: string;
};

type FilterMode = "all" | "investor" | "seller";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      setError(null);
  
      try {
        // Fetch investments and seller listings in parallel
        const [invRes, myListingsRes] = await Promise.all([
          fetch(`${apiBase}/investments/`, { credentials: "include" }),
          fetch(`${apiBase}/listings/?mine=1`, { credentials: "include" }),
        ]);
  
        // Handle auth error for investments
        if (!invRes.ok) {
          if (invRes.status === 401) {
            setError("Please sign in to view your portfolio.");
            setInvestments([]);
            return;
          }
          setError(`Failed to load portfolio (status ${invRes.status}).`);
          setInvestments([]);
          return;
        }
  
        const invData = (await invRes.json()) as Investment[];
  
        // If listings request fails, we just skip seller holdings, but keep investments
        let sellerListings: ListingSummary[] = [];
        if (myListingsRes.ok) {
          sellerListings = (await myListingsRes.json()) as ListingSummary[];
        }
  
        // Build synthetic holdings from seller-retained ownership
        const sellerHoldings: Investment[] = sellerListings
          .filter((l) => {
            const pct = Number(l.seller_retain_percent || "0");
            const assetVal = Number(l.asset_value || "0");
            return pct > 0 && assetVal > 0;
          })
          .map((l) => {
            const assetVal = Number(l.asset_value || "0");
            const pct = Number(l.seller_retain_percent || "0");
  
            const retainedAmount = assetVal * (pct / 100);
  
            return {
              id: -l.id, // synthetic id, just needs to be unique in this list
              listing: l.id,
              listing_title: l.title,
              listing_asset_value: l.asset_value || "0",
              listing_target_amount: l.target_amount,
              amount: retainedAmount.toFixed(2),
              ownership_percent: pct.toFixed(2),
              created_at: l.created_at,
              isSellerHolding: true,
            };
          });
  
        // Combine investments and seller holdings
        const combined = [...invData, ...sellerHoldings];
  
        // Going to sort by created_at descending
        combined.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
  
        setInvestments(combined);
      } catch (e) {
        console.error("Network error loading portfolio:", e);
        setError("Network error while loading portfolio.");
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    }
  
    loadPortfolio();
  }, []);

  const filteredInvestments = investments.filter((inv) => {
    if (filter === "investor") {
      return !inv.isSellerHolding;
    }
    if (filter === "seller") {
      return inv.isSellerHolding === true;
    }
    return true;
  });

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <p className="text-sm text-foreground/70">Loading portfolio…</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Portfolio</h1>
      <p className="text-sm text-foreground/70 mb-4">
        View the positions you&apos;ve taken in listings on the platform.
      </p>

      {/* The filter toggle */}
      {!error && investments.length > 0 && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 transition ${
              filter === "all"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("investor")}
            className={`rounded-full px-3 py-1 transition ${
              filter === "investor"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            Investor positions
          </button>
          <button
            type="button"
            onClick={() => setFilter("seller")}
            className={`rounded-full px-3 py-1 transition ${
              filter === "seller"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            Seller holdings
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      {!error && investments.length === 0 && (
        <p className="text-sm text-foreground/60">
          You don&apos;t have any investments yet.
          <br />
          Browse the{" "}
          <a href="/marketplace" className="underline">
            marketplace
          </a>{" "}
          to get started.
        </p>
      )}

      {!error && investments.length > 0 && filteredInvestments.length === 0 && (
        <p className="mt-2 text-sm text-foreground/60">
          No positions match this filter.
        </p>
      )}

      {investments.length > 0 && (
        <div className="mt-4 space-y-3">
          {filteredInvestments.map((inv) => {
            const assetVal = Number(inv.listing_asset_value || "0");
            const target = Number(inv.listing_target_amount || "0");
            const amt = Number(inv.amount || "0");
            const isSellerHolding = inv.isSellerHolding === true;

            return (
              <div
                key={`${isSellerHolding ? "seller-" : "inv-"}${inv.id}`}
                className="rounded-xl border border-foreground/10 bg-background/40 p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <a
                    href={`/listing/${inv.listing}`}
                    className="font-medium hover:underline"
                  >
                    {inv.listing_title}
                  </a>
                  <p className="text-xs text-foreground/60 mt-1">
                    {isSellerHolding ? (
                      <>
                        Retained ownership as the original seller.
                      </>
                    ) : (
                      <>
                        Invested on{" "}
                        {new Date(inv.created_at).toLocaleString()}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Asset value: ${assetVal.toFixed(2)} · Offering: $
                    {target.toFixed(2)}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="text-foreground/60">
                    {isSellerHolding ? "Your retained stake" : "Your investment"}
                  </div>
                  <div className="text-sm font-semibold">
                    ${amt.toFixed(2)}
                  </div>
                  <div className="mt-1 text-foreground/60">
                    Ownership: {inv.ownership_percent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
