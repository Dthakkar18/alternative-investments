import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const me = await getSessionUser();

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-foreground/10 w-full">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center">
        {/* Left group */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-foreground transition-colors">Collectibles</Link>
          <Link href="/marketplace" className="text-sm hover:text-foreground transition-colors">Marketplace</Link>
          {me && (<Link href="/seller/listings" className="text-sm hover:text-foreground transition-colors">My Listings</Link>)}
          {me && <Link href="/portfolio" className="text-sm hover:text-foreground transition-colors">Portfolio</Link>}
        </div>

        {/* Spacer pushes right group over */}
        <div className="flex-1" />

        {/* Right group: Logout only */}
        <div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

