"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface UserResponse {
  id: string;
  email: string;
  role: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiFetch<UserResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSuccess("Registro exitoso. Serás redirigido al login.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError((err as Error).message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta segura"
      subtitle="Autenticación protegida para gestionar tus auditorías web."
      footer={
        <>
          ¿Ya tienes cuenta?
          <Link href="/login" className="ml-1 text-blue-600 hover:underline">
            Inicia sesión
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
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          maxLength={64}
          helperText="Mínimo 8 caracteres, con mayúsculas, minúsculas, número y símbolo."
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {success && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        )}
        <Button type="submit" isLoading={loading}>
          Registrarse
        </Button>
      </form>
    </AuthLayout>
  );
}

