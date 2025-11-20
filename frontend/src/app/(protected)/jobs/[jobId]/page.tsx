'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Badge, Button, Card } from '@/components'
import { LoadingSpinner } from '@/components/loading-spinner'
import type { Finding, Job, Target } from '@/types'
import { formatDate } from '@/lib/utils'

const severityOptions = ['critical', 'high', 'medium', 'low', 'info']

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>()
  const router = useRouter()
  const jobId = params?.jobId
  const [job, setJob] = useState<Job | null>(null)
  const [target, setTarget] = useState<Target | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [severityFilter, setSeverityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJob = async () => {
    if (!jobId) return
    try {
      const response = await api.get<Job>(`/jobs/${jobId}`)
      setJob(response.data)
      const targetResponse = await api.get<Target>(`/targets/${response.data.target_id}`)
      setTarget(targetResponse.data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Job no encontrado o sin permisos')
    }
  }

  const loadFindings = async () => {
    if (!jobId) return
    try {
      const response = await api.get<Finding[]>(`/jobs/${jobId}/findings`, {
        params: severityFilter ? { severity_filter: severityFilter } : undefined,
      })
      setFindings(response.data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('No fue posible cargar los hallazgos')
    }
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      await loadJob()
      await loadFindings()
      setLoading(false)
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, severityFilter])

  if (loading) {
    return <LoadingSpinner label="Cargando detalles del job" />
  }

  if (error || !job) {
    return (
      <Card title="Job no disponible" description={error ?? 'Revisa los permisos o vuelve al listado'}>
        <Button variant="primary" onClick={() => router.push('/jobs')}>
          Regresar a Jobs
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Job #{job.id.slice(0, 8)}</p>
          <h1 className="text-2xl font-bold text-gray-900">{target?.url || job.target_id}</h1>
          <p className="text-sm text-gray-500">Creado el {formatDate(job.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={job.status === 'failed' ? 'danger' : job.status === 'done' ? 'success' : job.status === 'running' ? 'info' : 'warning'}>
            {job.status.toUpperCase()}
          </Badge>
          <Button variant="ghost" onClick={() => router.push('/jobs')}>
            Volver al listado
          </Button>
        </div>
      </div>

      <Card title="Detalles del job">
        <dl className="grid gap-4 md:grid-cols-3 text-sm text-gray-600">
          <div>
            <dt className="font-medium text-gray-900">Herramientas</dt>
            <dd>{job.tools_used.join(', ') || 'Automático'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Inicio</dt>
            <dd>{formatDate(job.started_at)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Fin</dt>
            <dd>{formatDate(job.finished_at)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Hallazgos" description="Filtra por severidad para priorizar acciones">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Severidad</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                {severity.toUpperCase()}
              </option>
            ))}
          </select>
          <Button variant="ghost" onClick={loadFindings}>
            Refrescar
          </Button>
        </div>
        <div className="space-y-4">
          {findings.length === 0 && <p className="text-sm text-gray-500">Sin hallazgos registrados para este filtro.</p>}
          {findings.map((finding) => (
            <article key={finding.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{finding.title}</h3>
                  <p className="text-xs text-gray-400">{finding.tool} · {formatDate(finding.created_at)}</p>
                </div>
                <Badge variant={getSeverityVariant(finding.severity)}>{finding.severity.toUpperCase()}</Badge>
              </div>
              {finding.description && <p className="mt-3 text-sm text-gray-600">{finding.description}</p>}
              {finding.recommendation && (
                <div className="mt-3 rounded-lg bg-primary-50/60 p-3 text-sm text-primary-900">
                  <p className="font-semibold">Recomendación</p>
                  <p>{finding.recommendation}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}

function getSeverityVariant(severity: string) {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'default'
  }
}
