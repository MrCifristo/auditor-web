'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button, Card } from '@/components'
import type { MetricsSummary, SeverityCount, ToolCount, TimelinePoint, TargetCount } from '@/types'

export default function MetricsPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [severityData, setSeverityData] = useState<SeverityCount[]>([])
  const [toolData, setToolData] = useState<ToolCount[]>([])
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([])
  const [topTargets, setTopTargets] = useState<TargetCount[]>([])

  useEffect(() => {
    async function loadMetrics() {
      const [summaryRes, severityRes, toolRes, timelineRes, topTargetsRes] = await Promise.all([
        api.get<MetricsSummary>('/metrics/summary'),
        api.get<{ data: SeverityCount[] }>('/metrics/by-severity'),
        api.get<{ data: ToolCount[] }>('/metrics/by-tool'),
        api.get<{ data: TimelinePoint[] }>('/metrics/timeline'),
        api.get<{ data: TargetCount[] }>('/metrics/top-targets'),
      ])
      setSummary(summaryRes.data)
      setSeverityData(severityRes.data.data)
      setToolData(toolRes.data.data)
      setTimelineData(timelineRes.data.data)
      setTopTargets(topTargetsRes.data.data)
    }
    loadMetrics()
  }, [])

  const downloadJson = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      summary,
      severityData,
      toolData,
      timelineData,
      topTargets,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `auditor-metrics-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card title="Resumen ejecutivo" description="Datos listos para compartir">
        <div className="grid gap-4 md:grid-cols-4 text-sm text-gray-600">
          <Metric label="Escaneos" value={summary?.total_jobs ?? 0} />
          <Metric label="Hallazgos" value={summary?.total_findings ?? 0} />
          <Metric label="Herramientas activas" value={Object.keys(summary?.findings_by_tool || {}).length} />
          <Metric label="Severidades registradas" value={Object.keys(summary?.findings_by_severity || {}).length} />
        </div>
        <Button variant="secondary" className="mt-4" onClick={downloadJson}>
          Descargar JSON ejecutivo
        </Button>
      </Card>

      <Card title="Detalle por severidad" description="Priorización de riesgos">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-gray-500">
              <th className="py-2">Severidad</th>
              <th className="py-2">Hallazgos</th>
            </tr>
          </thead>
          <tbody>
            {severityData.map((item) => (
              <tr key={item.severity} className="border-b text-gray-700">
                <td className="py-2 font-medium">{item.severity.toUpperCase()}</td>
                <td className="py-2">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Herramientas que detectaron findings">
        <table className="min-w-full text-sm">
          <tbody>
            {toolData.map((tool) => (
              <tr key={tool.tool} className="border-b text-gray-700">
                <td className="py-2 font-medium">{tool.tool}</td>
                <td className="py-2">{tool.count}</td>
              </tr>
            ))}
            {toolData.length === 0 && <tr><td className="py-2 text-gray-500">Sin hallazgos por ahora.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Card title="Timeline exportable" description="Útil para reportes semanales">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-gray-500">
              <th className="py-2 text-left">Fecha</th>
              <th className="py-2 text-left">Jobs</th>
              <th className="py-2 text-left">Findings</th>
            </tr>
          </thead>
          <tbody>
            {timelineData.map((point) => (
              <tr key={point.date} className="border-b text-gray-700">
                <td className="py-2">{point.date}</td>
                <td className="py-2">{point.jobs}</td>
                <td className="py-2">{point.findings}</td>
              </tr>
            ))}
            {timelineData.length === 0 && <tr><td className="py-2 text-gray-500">Sin actividad registrada.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Card title="Top targets" description="Sitios con mayor recurrencia de riesgos">
        <table className="min-w-full text-sm">
          <tbody>
            {topTargets.map((target) => (
              <tr key={target.target_id} className="border-b text-gray-700">
                <td className="py-2 font-medium">{target.target_url}</td>
                <td className="py-2">{target.count} findings</td>
              </tr>
            ))}
            {topTargets.length === 0 && <tr><td className="py-2 text-gray-500">Aún no hay información histórica.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
