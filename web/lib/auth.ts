import { headers } from "next/headers";

type Me = { id: string; email: string; name?: string };

const API_BASE =
  process.env.API_INTERNAL_URL ||      // e.g., http://api:8000/api (Docker)
  process.env.NEXT_PUBLIC_API_URL ||   // e.g., http://localhost:8000/api (local)
  "http://localhost:8000/api";

export async function getSessionUser(): Promise<Me | null> {
  const cookie = (await headers()).get("cookie") || "";
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

