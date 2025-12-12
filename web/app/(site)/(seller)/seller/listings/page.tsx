"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: number;
  title: string;
  status: string;
  target_amount: string;
  min_investment: string;
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

export default function SellerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function deleteListing(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this listing? This cannot be undone."
      )
    ) {
      return;
    }
  
    setDeletingId(id);
    setError(null);
  
    try {
      // Get CSRF cookie
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";
  
      const res = await fetch(`${apiBase}/listings/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
  
      if (!res.ok) {
        // Don’t remove from state but surface error instead
        setError(`Failed to delete listing (status ${res.status}).`);
        return;
      }
  
      // Actually gone on the backend then now update state
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error("Network error deleting listing:", e);
      setError("Network error while deleting listing.");
    } finally {
      setDeletingId(null);
    }
  }

  async function loadListings() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/listings/?mine=1`, {
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
      console.error("Network error loading seller listings:", e);
      setError("Network error while loading your listings.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function updateStatus(id: number, status: "draft" | "live") {
    setUpdatingId(id);
    setError(null);

    try {
      // make sure CSRF cookie is set
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken = getCookie("csrftoken") || "";

      const res = await fetch(`${apiBase}/listings/${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        setError(`Failed to update status (status ${res.status})`);
        return;
      }

      await loadListings();
    } catch (e) {
      console.error("Network error updating status:", e);
      setError("Network error while updating listing status.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <p className="text-sm text-foreground/70">Loading your listings…</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your listings</h1>
          <p className="text-sm text-foreground/70">
            Manage the offerings you&apos;ve submitted.
          </p>
        </div>

        <a
          href="/seller/new"
          className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-black shadow-sm transition hover:bg-white"
        >
          + Create listing
        </a>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      {listings.length === 0 ? (
        <p className="text-sm text-foreground/60">
          You don&apos;t have any listings yet.{" "}
          <a href="/seller/new" className="underline">
            Create your first listing.
          </a>
        </p>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const isLive = listing.status === "live";
            const isDraft = listing.status === "draft";

            return (
              <div
                key={listing.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background/60 p-4"
              >
                <div className="min-w-0">
                  <a
                    href={`/listing/${listing.id}`}
                    className="block text-sm font-semibold truncate"
                  >
                    {listing.title}
                  </a>
                  <p className="text-xs text-foreground/60 mt-1">
                    Target: ${listing.target_amount} • Min: $
                    {listing.min_investment}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full border border-foreground/20 px-2 py-0.5 uppercase tracking-wide">
                    {listing.status}
                  </span>

                  {isDraft && (
                    <a
                      href={`/seller/listings/${listing.id}/edit`}
                      className="rounded-full border border-foreground/20 px-3 py-1 text-xs hover:border-foreground/40"
                    >
                      Edit
                    </a>
                  )}

                  <button
                    disabled={updatingId === listing.id || isLive}
                    onClick={() => updateStatus(listing.id, "live")}
                    className="rounded-full border border-sage px-3 py-1 text-xs disabled:opacity-60"
                  >
                    Publish
                  </button>
                  <button
                    disabled={updatingId === listing.id || isDraft}
                    onClick={() => updateStatus(listing.id, "draft")}
                    className="rounded-full border border-foreground/20 px-3 py-1 text-xs disabled:opacity-60"
                  >
                    Unpublish
                  </button>

                  {listing.status === "draft" && (
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="rounded-full border border-red-500/30 text-red-500 px-3 py-1 text-xs hover:border-red-500 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
