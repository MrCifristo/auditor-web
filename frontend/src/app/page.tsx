"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Evitar flash de contenido si hay redirección
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <div className="text-gray-600">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          🛡️ Auditor Web de Seguridad
        </h1>
        <p className="text-gray-600">
          Plataforma para ejecutar auditorías básicas de seguridad sobre sitios
          autorizados, visualizar métricas y generar reportes accionables.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-blue-600 px-6 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
