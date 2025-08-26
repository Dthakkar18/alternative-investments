"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch(`${apiBase}/auth/csrf/`, { credentials: "include" });
      const csrftoken =
        document.cookie.split("; ").find(c => c.startsWith("csrftoken="))?.split("=")[1] || "";

      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      });

      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-1.5 text-sm rounded-md border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-60"
    >
      {loading ? "…" : "Logout"}
    </button>
  );
}

