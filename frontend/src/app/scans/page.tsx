"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/types/job";

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

export default function ScansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const params = statusFilter !== "all" ? `?status_filter=${statusFilter}` : "";
        const data = await apiFetch<Job[]>(`/jobs${params}`, { token });
        setJobs(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message || "Error al cargar escaneos");
        clearToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Polling para actualizar jobs en ejecución
    const interval = setInterval(() => {
      const token = getToken();
      if (!token) return;
      
      apiFetch<Job[]>(`/jobs${statusFilter !== "all" ? `?status_filter=${statusFilter}` : ""}`, { token })
        .then((data) => {
          const hasRunning = data.some((job) => job.status === "running" || job.status === "queued");
          if (hasRunning || statusFilter === "all") {
            setJobs(data);
          }
        })
        .catch(() => {
          // Silently fail on polling errors
        });
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [router, statusFilter]);

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
          <p className="text-gray-600">Cargando escaneos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escaneos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona y visualiza todos tus escaneos de seguridad
            </p>
          </div>
          <Link href="/scans/new">
            <Button className="!w-auto">➕ Nuevo Escaneo</Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="queued">En Cola</option>
              <option value="running">Ejecutando</option>
              <option value="done">Completado</option>
              <option value="failed">Fallido</option>
            </select>
          </div>
        </Card>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-gray-500">No hay escaneos disponibles</p>
              <Link href="/scans/new" className="mt-4 inline-block">
                <Button className="!w-auto">Crear Primer Escaneo</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Escaneo #{job.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[job.status] || STATUS_COLORS.queued
                        }`}
                      >
                        {STATUS_LABELS[job.status] || job.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Herramientas:</span> {job.tools_used.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">Creado:</span> {formatDate(job.created_at)}
                      </p>
                      {job.started_at && (
                        <p>
                          <span className="font-medium">Iniciado:</span> {formatDate(job.started_at)}
                        </p>
                      )}
                      {job.finished_at && (
                        <p>
                          <span className="font-medium">Finalizado:</span> {formatDate(job.finished_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/scans/${job.id}`}>
                      <Button variant="secondary" className="!w-auto">
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

