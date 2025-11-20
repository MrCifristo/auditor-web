'use client'

import { FormEvent, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button, Card, Input } from '@/components'
import type { Target } from '@/types'
import { formatDate } from '@/lib/utils'

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [url, setUrl] = useState('https://')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchTargets = async () => {
    try {
      const response = await api.get<Target[]>('/targets')
      setTargets(response.data)
    } catch (err) {
      console.error(err)
      setError('No fue posible obtener los targets. Intenta nuevamente.')
    }
  }

  useEffect(() => {
    fetchTargets()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await api.post('/targets', { url })
      setSuccess('Target registrado correctamente')
      setUrl('https://')
      fetchTargets()
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'No fue posible registrar el target'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (targetId: string) => {
    if (!confirm('¿Eliminar este target? Los jobs asociados permanecerán.')) return
    try {
      await api.delete(`/targets/${targetId}`)
      setTargets((prev) => prev.filter((target) => target.id !== targetId))
    } catch {
      setError('No fue posible eliminar el target')
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Registrar nuevo target" description="Solo agrega dominios autorizados">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">URL objetivo</label>
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" required />
          </div>
          <Button type="submit" isLoading={loading}>
            Agregar target
          </Button>
        </form>
      </Card>

      <Card title="Targets registrados" description="Listado personal">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Registrado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {targets.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Aún no has registrado objetivos.
                  </td>
                </tr>
              )}
              {targets.map((target) => (
                <tr key={target.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{target.url}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(target.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="text-red-600" onClick={() => handleDelete(target.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
