"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Ingresa tus credenciales para acceder al panel de auditoría."
      footer={
        <>
          ¿No tienes cuenta?
          <Link href="/register" className="ml-1 text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@ejemplo.com"
        />
        <Input
          id="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          trailing={
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          }
        />
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={loading}>
          Ingresar
        </Button>
      </form>
    </AuthLayout>
  );
}

