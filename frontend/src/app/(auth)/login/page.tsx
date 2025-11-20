'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Credenciales inválidas'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Bienvenido de nuevo</p>
        <h1 className="text-2xl font-bold text-gray-900">Inicia sesión</h1>
        <p className="text-sm text-gray-500">Accede al centro de auditorías y métricas.</p>
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Correo institucional</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Contraseña</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
