"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const pathname = usePathname();

  // Redirigir a login si no hay token
  useEffect(() => {
    if (!authLoading) {
      const token = getToken();
      if (!token && !user) {
        router.replace("/login");
      }
    }
  }, [authLoading, user, router]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/scans", label: "Escaneos", icon: "🔍" },
    { href: "/scans/new", label: "Nuevo Escaneo", icon: "➕" },
  ];

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (será redirigido)
  const token = getToken();
  if (!token && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                Auditor Web de Seguridad
              </h1>
              <nav className="hidden space-x-4 md:flex">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
              )}
              <Button variant="secondary" onClick={logout} className="!w-auto">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

