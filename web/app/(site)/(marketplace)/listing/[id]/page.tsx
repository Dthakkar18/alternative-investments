"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Listing = {
  id: number;
  title: string;
  description: string;
  seller_name: string;
  target_amount: string;
  min_investment: string;
  status: string;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchListing() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiBase}/listings/${id}/`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError(`Failed to load listing (status ${res.status})`);
          setListing(null);
          return;
        }

        const data = (await res.json()) as Listing;
        setListing(data);
      } catch (e) {
        console.error("Network error fetching listing:", e);
        setError("Network error while loading listing.");
        setListing(null);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <p className="text-sm text-foreground/70">Loading listing…</p>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
        <p className="text-sm text-foreground/70">
          {error ??
            "Couldn’t load this listing. Make sure the API is running and the ID exists."}
        </p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <p className="text-xs text-foreground/60 mb-2 uppercase tracking-wide">
        Status: {listing.status}
      </p>
      <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
      <p className="text-sm text-foreground/70 mb-4">
        Offered by {listing.seller_name}
      </p>

      <div className="flex flex-col gap-4 md:flex-row md:items-start mb-6">
        <div className="flex-1 rounded-xl border border-foreground/10 p-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-foreground/70">Target amount</span>
            <span className="font-medium">${listing.target_amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/70">Minimum investment</span>
            <span className="font-medium">
              ${listing.min_investment || "—"}
            </span>
          </div>
        </div>

        <div className="md:w-64 rounded-xl border border-foreground/10 p-4 text-sm">
          <p className="font-medium mb-2">Invest in this listing</p>
          <p className="text-xs text-foreground/60 mb-4">
            The investment flow is not live yet, but this is where investors
            will commit capital.
          </p>
          <button
            className="w-full rounded-lg bg-sage/20 border border-sage px-3 py-2 text-sm font-medium"
            disabled
          >
            Investment flow coming soon
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-2">Description</h2>
        <p className="text-sm whitespace-pre-wrap">{listing.description}</p>
      </section>
    </main>
  );
}
