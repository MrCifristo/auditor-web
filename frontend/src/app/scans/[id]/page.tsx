"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/types/job";
import type { Finding } from "@/types/finding";
import type { Target } from "@/types/target";

const STATUS_LABELS: Record<string, string> = {
  queued: "En Cola",
  running: "Ejecutando",
  done: "Completado",
  failed: "Fallido",
};

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-gray-100 text-gray-800",
  running: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const SEVERITY_LABELS: Record<string, string> = {
  INFO: "Información",
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const SEVERITY_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800 border-blue-300",
  LOW: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

export default function ScanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  
  // Usar refs para mantener referencias a los intervalos y timeouts
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    // Limpiar cualquier polling anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const fetchData = async () => {
      try {
        const [jobData, findingsData] = await Promise.all([
          apiFetch<Job>(`/jobs/${jobId}`, { token }),
          apiFetch<Finding[]>(`/jobs/${jobId}/findings`, { token }),
        ]);

        setJob(jobData);
        setFindings(findingsData);

        // Fetch target details
        try {
          const targetData = await apiFetch<Target>(`/targets/${jobData.target_id}`, { token });
          setTarget(targetData);
        } catch (err) {
          console.error("Error fetching target:", err);
        }

        setError(null);
        setLoading(false);
        
        // Solo iniciar polling si el job está en ejecución
        if (jobData.status !== "done" && jobData.status !== "failed") {
          // Iniciar polling después de un pequeño delay
          timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
              const currentToken = getToken();
              if (!currentToken) {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return;
              }
              
              Promise.all([
                apiFetch<Job>(`/jobs/${jobId}`, { token: currentToken }),
                apiFetch<Finding[]>(`/jobs/${jobId}/findings`, { token: currentToken }),
              ])
                .then(([updatedJobData, updatedFindingsData]) => {
                  setJob(updatedJobData);
                  setFindings(updatedFindingsData);
                  
                  // Si el job terminó, detener el polling
                  if (updatedJobData.status === "done" || updatedJobData.status === "failed") {
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = null;
                    }
                  }
                })
                .catch(() => {
                  // Silently fail on polling errors
                });
            }, 5000); // Actualizar cada 5 segundos
          }, 2000); // Esperar 2 segundos antes de iniciar polling
        }
      } catch (err) {
        setError((err as Error).message || "Error al cargar escaneo");
        clearToken();
        router.replace("/login");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [router, jobId]);

  const filteredFindings =
    severityFilter === "all"
      ? findings
      : findings.filter((f) => f.severity === severityFilter);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-600">Cargando escaneo...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error || "Escaneo no encontrado"}</p>
          <Link href="/scans" className="mt-4 inline-block">
            <Button variant="secondary" className="!w-auto">
              Volver a Escaneos
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const findingsBySeverity = findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/scans" className="text-sm text-blue-600 hover:underline">
              ← Volver a Escaneos
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Detalle del Escaneo</h1>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              STATUS_COLORS[job.status] || STATUS_COLORS.queued
            }`}
          >
            {STATUS_LABELS[job.status] || job.status}
          </span>
        </div>

        {/* Job Info */}
        <Card title="Información del Escaneo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Target</p>
              <p className="mt-1 text-base text-gray-900">{target?.url || job.target_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Herramientas Utilizadas</p>
              <p className="mt-1 text-base text-gray-900">{job.tools_used.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
              <p className="mt-1 text-base text-gray-900">{formatDate(job.created_at)}</p>
            </div>
            {job.started_at && (
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
                <p className="mt-1 text-base text-gray-900">{formatDate(job.started_at)}</p>
              </div>
            )}
            {job.finished_at && (
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Finalización</p>
                <p className="mt-1 text-base text-gray-900">{formatDate(job.finished_at)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Findings Summary */}
        {job.status === "done" && findings.length > 0 && (
          <Card title="Resumen de Hallazgos">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const).map((severity) => (
                <div
                  key={severity}
                  className={`rounded-lg border p-4 text-center ${
                    SEVERITY_COLORS[severity] || SEVERITY_COLORS.INFO
                  }`}
                >
                  <p className="text-2xl font-bold">{findingsBySeverity[severity] || 0}</p>
                  <p className="mt-1 text-xs font-medium">{SEVERITY_LABELS[severity]}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Findings List */}
        {job.status === "done" || job.status === "failed" ? (
          <Card title="Hallazgos">
            {findings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">
                  {job.status === "done"
                    ? "No se encontraron hallazgos en este escaneo"
                    : "El escaneo falló antes de generar hallazgos"}
                </p>
              </div>
            ) : (
              <>
                {/* Filter */}
                <div className="mb-4 flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filtrar por severidad:</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Todas ({findings.length})</option>
                    {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const).map((severity) => (
                      <option key={severity} value={severity}>
                        {SEVERITY_LABELS[severity]} ({findingsBySeverity[severity] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Findings */}
                <div className="space-y-4">
                  {filteredFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className={`rounded-lg border p-4 ${
                        SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.INFO
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="rounded-full px-2 py-1 text-xs font-semibold">
                              {SEVERITY_LABELS[finding.severity]}
                            </span>
                            <span className="text-xs text-gray-600">{finding.tool}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-gray-900">{finding.title}</h3>
                          {finding.description && (
                            <p className="mt-2 text-sm text-gray-700">{finding.description}</p>
                          )}
                          {finding.evidence && (
                            <div className="mt-3 rounded-md bg-gray-50 p-3">
                              <p className="text-xs font-medium text-gray-600">Evidencia:</p>
                              <pre className="mt-1 overflow-x-auto text-xs text-gray-800">
                                {finding.evidence}
                              </pre>
                            </div>
                          )}
                          {finding.recommendation && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-600">Recomendación:</p>
                              <p className="mt-1 text-sm text-gray-700">{finding.recommendation}</p>
                            </div>
                          )}
                          <p className="mt-3 text-xs text-gray-500">
                            Detectado: {formatDate(finding.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        ) : (
          <Card>
            <div className="py-12 text-center">
              {job.status === "running" && (
                <>
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-gray-600">El escaneo está en ejecución...</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Los hallazgos aparecerán aquí cuando se complete
                  </p>
                </>
              )}
              {job.status === "queued" && (
                <>
                  <p className="text-gray-600">El escaneo está en cola</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Esperando a que se inicie la ejecución
                  </p>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

