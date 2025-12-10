"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const goToMarketplace = () => {
    if (user) router.push("/marketplace");
    else router.push("/sign-in");
  };

  const goToCreateListing = () => {
    if (user) router.push("/seller/new");
    else router.push("/sign-in");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-black via-zinc-950 to-black text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col px-4 pt-10 pb-24 md:flex-row md:items-center md:justify-between md:gap-12">
        {/* Top-right auth controls */}
        <header className="flex w-full items-center justify-between pb-6 md:absolute md:left-1/2 md:top-6 md:max-w-6xl md:-translate-x-1/2 md:px-4">
          <span className="text-sm font-semibold text-zinc-100">
            Alt Invest
          </span>
          <div className="flex items-center gap-3 text-xs">
            {loading ? (
              <span className="text-zinc-500">Checking session…</span>
            ) : user ? (
              <span className="text-zinc-400">
                Signed in as{" "}
                <span className="font-medium text-zinc-100">
                  {user.name || user.email}
                </span>
              </span>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-full border border-zinc-700 bg-black/40 px-4 py-1.5 text-xs font-medium text-zinc-100 hover:border-zinc-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-black hover:bg-white"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Left column – hero text */}
        <section className="mt-10 max-w-xl md:mt-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Alt Invest · Early build
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl">
            Shared ownership for
            <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
              {" "}
              extraordinary assets.
            </span>
          </h1>

          <p className="mt-5 text-balance text-sm leading-relaxed text-zinc-300 sm:text-base">
            Discover, fractionally invest in, and manage alternative assets —
            watches, collectibles, and more. One place for investors to build a
            modern portfolio and for sellers to raise capital around what they
            know best.
          </p>

          {/* Primary actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={goToMarketplace}
              className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-black shadow-sm transition hover:bg-white"
            >
              Browse marketplace
              <span className="ml-1.5 text-base">↗</span>
            </button>

            <button
              onClick={goToCreateListing}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
            >
              Create a listing
            </button>
          </div>

          {/* Secondary note */}
          <p className="mt-4 text-xs text-zinc-500">
            Signed-in users can track positions in{" "}
            <Link
              href="/portfolio"
              className="underline decoration-zinc-500/60 underline-offset-4 hover:decoration-zinc-300"
            >
              Portfolio
            </Link>
            .
          </p>
        </section>

        {/* Right column – glass feature card */}
        <section className="mt-12 w-full max-w-md md:mt-0">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                    Snapshot
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    Demo portfolio view
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                  Live prototype
                </span>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate">Grand Seiko Snowflake</span>
                  <span className="font-mono">$1,250</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate">Vintage Rolex Explorer</span>
                  <span className="font-mono">$2,800</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="truncate">’96 Jordan Rookie Card</span>
                  <span className="font-mono">$540</span>
                </div>

                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Total committed</span>
                  <span className="font-mono text-zinc-100">$4,590</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-zinc-300 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    For investors
                  </p>
                  <ul className="space-y-1">
                    <li>• Fractional access to alt assets</li>
                    <li>• Simple portfolio view</li>
                    <li>• Deal-level transparency</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    For sellers
                  </p>
                  <ul className="space-y-1">
                    <li>• Create curated listings</li>
                    <li>• Manage draft vs live deals</li>
                    <li>• Raise from your own audience</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Built with Next.js &amp; Django</span>
                <span className="text-zinc-600">Internal preview</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
