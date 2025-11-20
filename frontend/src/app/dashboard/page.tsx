"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { User } from "@/types/user";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await apiFetch<User>("/auth/me", { token });
        setUser(data);
      } catch (err) {
        setError((err as Error).message || "Error al obtener el usuario");
        clearToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <p className="text-red-600">{error ?? "No autenticado"}</p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Ir a login
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Seguridad
            </h1>
            <p className="text-sm text-gray-600">
              Sesión iniciada como <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Próximos pasos</h2>
          <p className="mt-2 text-sm text-gray-600">
            Aquí mostraremos tus targets, jobs y hallazgos. Por ahora, podemos usar este panel para validar la autenticación.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Crear y gestionar targets autorizados.</li>
            <li>Ejecutar escaneos (jobs) con ZAP, Nuclei y SSLyze.</li>
            <li>Visualizar findings y métricas en el dashboard.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

