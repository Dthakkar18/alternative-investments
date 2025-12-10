import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Routes that require auth
  const requiresAuth =
    pathname === "/marketplace" ||
    pathname === "/portfolio" ||
    pathname.startsWith("/seller");

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Simple check: if there is no Django session cookie, treat as logged out
  const hasSession = Boolean(request.cookies.get("sessionid")?.value);

  if (!hasSession) {
    const loginUrl = new URL("/sign-in", request.url);
    // pass redirect target so you can optionally use it after login
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply middleware only to these paths
export const config = {
  matcher: ["/marketplace/:path*", "/portfolio/:path*", "/seller/:path*"],
};
