'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Badge, Card } from '@/components'
import { LoadingSpinner } from '@/components/loading-spinner'
import type {
  MetricsSummary,
  SeverityCount,
  ToolCount,
  TimelinePoint,
  TargetCount,
  Job,
} from '@/types'

const severityPalette: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#facc15',
  low: '#22c55e',
  info: '#3b82f6',
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [severityData, setSeverityData] = useState<SeverityCount[]>([])
  const [toolData, setToolData] = useState<ToolCount[]>([])
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([])
  const [topTargets, setTopTargets] = useState<TargetCount[]>([])
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [summaryRes, severityRes, toolRes, timelineRes, topTargetsRes, jobsRes] = await Promise.all([
          api.get<MetricsSummary>('/metrics/summary'),
          api.get<{ data: SeverityCount[] }>('/metrics/by-severity'),
          api.get<{ data: ToolCount[] }>('/metrics/by-tool'),
          api.get<{ data: TimelinePoint[] }>('/metrics/timeline'),
          api.get<{ data: TargetCount[] }>('/metrics/top-targets'),
          api.get<Job[]>('/jobs'),
        ])
        setSummary(summaryRes.data)
        setSeverityData(severityRes.data.data)
        setToolData(toolRes.data.data)
        setTimelineData(timelineRes.data.data)
        setTopTargets(topTargetsRes.data.data)
        setRecentJobs(jobsRes.data.slice(0, 5))
        setError(null)
      } catch (err) {
        console.error(err)
        setError('No fue posible cargar la información. Intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner label="Cargando métricas" />
  }

  if (error) {
    return (
      <Card title="Dashboard" description="Visión general" className="max-w-2xl">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    )
  }

  const totalCritical = summary?.findings_by_severity?.critical ?? 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Escaneos ejecutados" value={summary?.total_jobs ?? 0} trend="Total histórico" />
        <MetricCard
          title="Hallazgos registrados"
          value={summary?.total_findings ?? 0}
          trend="Incluye todas las severidades"
        />
        <MetricCard
          title="Críticos / Altos"
          value={totalCritical}
          trend="Riesgos que requieren acción inmediata"
        />
        <MetricCard title="Herramientas activas" value={Object.keys(summary?.findings_by_tool || {}).length || 0} trend="ZAP · Nuclei · SSLyze" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Hallazgos por severidad" description="Comparación global" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="severity" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry) => (
                    <Cell key={entry.severity} fill={severityPalette[entry.severity] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Distribución por herramienta" description="Origen de los hallazgos">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="count" data={toolData} nameKey="tool" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {toolData.map((entry, index) => (
                    <Cell key={entry.tool} fill={['#6366f1', '#14b8a6', '#f97316'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {toolData.length === 0 && <li>No se han encontrado hallazgos aún.</li>}
            {toolData.map((tool) => (
              <li key={tool.tool} className="flex items-center justify-between">
                <span>{tool.tool}</span>
                <span className="font-semibold">{tool.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Actividad en el tiempo" description="Jobs y findings por día" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="jobs" stroke="#2563eb" strokeWidth={3} dot={false} name="Jobs" />
                <Line type="monotone" dataKey="findings" stroke="#f97316" strokeWidth={3} dot={false} name="Findings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top targets" description="Mayor volumen de findings">
          <ul className="space-y-3 text-sm text-gray-600">
            {topTargets.length === 0 && <li>Aún no hay datos históricos suficientes.</li>}
            {topTargets.map((target) => (
              <li key={target.target_id} className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="font-medium text-gray-900">{target.target_url}</p>
                <p className="text-xs text-gray-500">Findings: {target.count}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Últimos jobs ejecutados" description="Estado y herramientas utilizadas">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Herramientas</th>
                <th className="px-4 py-3">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Aún no has lanzado escaneos.
                  </td>
                </tr>
              )}
              {recentJobs.map((job) => (
                <tr key={job.id} className="text-gray-700">
                  <td className="px-4 py-3 font-medium">{job.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={job.status === 'failed' ? 'danger' : job.status === 'done' ? 'success' : 'info'}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{job.tools_used.join(', ') || '—'}</td>
                  <td className="px-4 py-3">{formatDate(job.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, trend }: { title: string; value: number; trend: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{trend}</p>
    </Card>
  )
}
