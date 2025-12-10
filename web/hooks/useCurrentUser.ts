"use client";
import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { user, loading };
}
