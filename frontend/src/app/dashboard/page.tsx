"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SeverityBarChart } from "@/components/charts/SeverityBarChart";
import { SeverityPieChart } from "@/components/charts/SeverityPieChart";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { ToolBarChart } from "@/components/charts/ToolBarChart";
import { Card } from "@/components/ui/Card";
import type { MetricsSummary } from "@/types/metrics";
import type { MetricsBySeverityResponse } from "@/types/metrics";
import type { MetricsByToolResponse } from "@/types/metrics";
import type { MetricsTimelineResponse } from "@/types/metrics";
import type { MetricsTopTargetsResponse } from "@/types/metrics";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [severityData, setSeverityData] = useState<MetricsBySeverityResponse | null>(null);
  const [toolData, setToolData] = useState<MetricsByToolResponse | null>(null);
  const [timelineData, setTimelineData] = useState<MetricsTimelineResponse | null>(null);
  const [topTargets, setTopTargets] = useState<MetricsTopTargetsResponse | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [summaryRes, severityRes, toolRes, timelineRes, topTargetsRes] = await Promise.all([
          apiFetch<MetricsSummary>("/metrics/summary", { token }),
          apiFetch<MetricsBySeverityResponse>("/metrics/by-severity", { token }),
          apiFetch<MetricsByToolResponse>("/metrics/by-tool", { token }),
          apiFetch<MetricsTimelineResponse>("/metrics/timeline?days=30", { token }),
          apiFetch<MetricsTopTargetsResponse>("/metrics/top-targets?limit=5", { token }),
        ]);

        setSummary(summaryRes);
        setSeverityData(severityRes);
        setToolData(toolRes);
        setTimelineData(timelineRes);
        setTopTargets(topTargetsRes);
        setError(null);
      } catch (err) {
        setError((err as Error).message || "Error al cargar datos");
        clearToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const criticalFindings = summary?.findings_by_severity.CRITICAL || 0;
  const highFindings = summary?.findings_by_severity.HIGH || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Seguridad</h1>
          <p className="mt-2 text-sm text-gray-600">
            Resumen de tus escaneos y hallazgos de seguridad
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total de Escaneos"
            value={summary?.total_jobs || 0}
            icon={<span className="text-2xl">🔍</span>}
          />
          <KpiCard
            title="Total de Hallazgos"
            value={summary?.total_findings || 0}
            icon={<span className="text-2xl">📋</span>}
          />
          <KpiCard
            title="Hallazgos Críticos"
            value={criticalFindings}
            icon={<span className="text-2xl">⚠️</span>}
            className={criticalFindings > 0 ? "border-red-300 bg-red-50" : ""}
          />
          <KpiCard
            title="Hallazgos Altos"
            value={highFindings}
            icon={<span className="text-2xl">🔴</span>}
            className={highFindings > 0 ? "border-orange-300 bg-orange-50" : ""}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Hallazgos por Severidad" description="Distribución de hallazgos según su nivel de severidad">
            {severityData ? (
              <SeverityBarChart data={severityData.data} />
            ) : (
              <p className="text-center text-gray-500">No hay datos</p>
            )}
          </Card>

          <Card title="Distribución de Severidades" description="Vista circular de la distribución">
            {severityData ? (
              <SeverityPieChart data={severityData.data} />
            ) : (
              <p className="text-center text-gray-500">No hay datos</p>
            )}
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Timeline de Actividad" description="Escaneos y hallazgos en el tiempo">
            {timelineData && timelineData.data.length > 0 ? (
              <TimelineChart data={timelineData.data} />
            ) : (
              <p className="text-center text-gray-500">No hay datos para mostrar</p>
            )}
          </Card>

          <Card title="Hallazgos por Herramienta" description="Distribución según la herramienta utilizada">
            {toolData && toolData.data.length > 0 ? (
              <ToolBarChart data={toolData.data} />
            ) : (
              <p className="text-center text-gray-500">No hay datos</p>
            )}
          </Card>
        </div>

        {/* Top Targets Table */}
        {topTargets && topTargets.data.length > 0 && (
          <Card title="Top Targets con Más Hallazgos" description="Los 5 targets con mayor cantidad de hallazgos">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Hallazgos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {topTargets.data.map((target) => (
                    <tr key={target.target_id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {target.target_url}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {target.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/scans/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              ➕ Crear Nuevo Escaneo
            </Link>
            <Link
              href="/scans"
              className="rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              🔍 Ver Todos los Escaneos
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
