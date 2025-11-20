"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import type { User } from "@/types/user";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const data = await apiFetch<User>("/auth/me", { token });
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "Error al obtener el usuario");
          clearToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  const refresh = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await apiFetch<User>("/auth/me", { token });
      setUser(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Error al obtener el usuario");
      clearToken();
      setUser(null);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    refresh,
  };
}

