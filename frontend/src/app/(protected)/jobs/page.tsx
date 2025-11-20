'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button, Card, Badge } from '@/components'
import type { Job, JobStatus, Target } from '@/types'
import { formatDate } from '@/lib/utils'

const availableTools = ['ZAP', 'Nuclei', 'SSLyze']

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [targets, setTargets] = useState<Target[]>([])
  const [selectedTarget, setSelectedTarget] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>(['ZAP'])
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [targetsRes, jobsRes] = await Promise.all([
        api.get<Target[]>('/targets'),
        api.get<Job[]>('/jobs', { params: statusFilter ? { status_filter: statusFilter } : undefined }),
      ])
      setTargets(targetsRes.data)
      setJobs(jobsRes.data)
      if (!selectedTarget && targetsRes.data.length > 0) {
        setSelectedTarget(targetsRes.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setError('No fue posible cargar los datos. Regenera el token e intenta nuevamente.')
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((item) => item !== tool) : [...prev, tool]
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTarget || selectedTools.length === 0) {
      setError('Selecciona un target y al menos una herramienta')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/jobs', {
        target_id: selectedTarget,
        tools_used: selectedTools,
      })
      setSelectedTools(['ZAP'])
      await loadData()
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'No fue posible crear el job'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const getTargetUrl = (targetId: string) => targets.find((target) => target.id === targetId)?.url || '—'

  return (
    <div className="space-y-6">
      <Card title="Nuevo job de escaneo" description="Selecciona objetivo y herramientas">
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Target</label>
            <select
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona un target
              </option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.url}
                </option>
              ))}
            </select>
            {targets.length === 0 && <p className="text-xs text-gray-500">Registra un target antes de lanzar un job.</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Herramientas</label>
            <div className="flex flex-wrap gap-3">
              {availableTools.map((tool) => (
                <label key={tool} className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool)}
                    onChange={() => toggleTool(tool)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <Button type="submit" isLoading={loading} disabled={targets.length === 0}>
              Lanzar escaneo
            </Button>
            <p className="text-xs text-gray-500">Los escaneos se ejecutan en background; el estado se actualizará automáticamente.</p>
          </div>
        </form>
      </Card>

      <Card title="Jobs y hallazgos" description="Monitorea su estado en tiempo real">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value || '') as JobStatus | '')}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="done">Done</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Herramientas</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No hay jobs con este filtro.
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{job.id.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getTargetUrl(job.target_id)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={job.status === 'failed' ? 'danger' : job.status === 'done' ? 'success' : job.status === 'running' ? 'info' : 'warning'}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{job.tools_used.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Ver hallazgos
                    </Link>
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
