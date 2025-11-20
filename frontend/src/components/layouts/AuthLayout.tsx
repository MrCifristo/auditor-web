"use client";

import { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "light" | "dark";
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = "light",
}: AuthLayoutProps) {
  return (
    <main
      className={clsx(
        "min-h-screen px-4 py-10",
        variant === "dark"
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-b from-slate-50/70 via-white to-slate-50"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <section className="flex w-full flex-1 flex-col justify-center rounded-2xl bg-blue-600/90 p-10 text-white shadow-lg">
          <Link href="/" className="text-sm font-semibold text-white/80">
            ← Volver al inicio
          </Link>
          <div className="mt-10 space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Auditor Web de Seguridad
            </h1>
            <p className="text-lg text-white/90">
              Gestión unificada de escaneos OWASP ZAP, Nuclei y SSLyze con
              autenticación segura y dashboard visual.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• Registro seguro y control de acceso</li>
              <li>• Creación de targets autorizados</li>
              <li>• Escaneos automatizados en contenedores aislados</li>
              <li>• Métricas y reportes listos para negocio</li>
            </ul>
          </div>
        </section>
        <section className="w-full flex-1">
          <div className="rounded-2xl border border-gray-100 bg-white/95 p-10 shadow-2xl shadow-blue-500/10">
            <header className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Seguridad Applicativa
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </header>
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

