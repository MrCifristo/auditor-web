"use client";

import { FormEvent, MouseEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Target } from "@/types/target";
import type { JobCreate } from "@/types/job";

const AVAILABLE_TOOLS = ["ZAP", "Nuclei", "SSLyze"];

export default function NewScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [newTargetUrl, setNewTargetUrl] = useState<string>("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [creatingTarget, setCreatingTarget] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchTargets = async () => {
      try {
        const data = await apiFetch<Target[]>("/targets", { token });
        setTargets(data);
        if (data.length > 0) {
          setSelectedTargetId(data[0].id);
        }
      } catch (err) {
        setError((err as Error).message || "Error al cargar targets");
      } finally {
        setLoadingTargets(false);
      }
    };

    fetchTargets();
  }, [router]);

  const normalizeUrl = (url: string): string => {
    // Eliminar espacios en blanco
    url = url.trim();
    
    // Si no tiene esquema, agregar https://
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }
    
    // Eliminar barra final si existe
    url = url.replace(/\/+$/, "");
    
    return url;
  };

  const handleCreateTarget = async (e?: FormEvent | MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!newTargetUrl.trim()) {
      setError("Debes ingresar una URL válida");
      setCreatingTarget(false);
      return;
    }
    
    setError(null);
    setCreatingTarget(true);

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // Normalizar la URL antes de enviarla
      const normalizedUrl = normalizeUrl(newTargetUrl);
      const newTarget = await apiFetch<Target>("/targets", {
        method: "POST",
        token,
        body: JSON.stringify({ url: normalizedUrl }),
      });
      setTargets([...targets, newTarget]);
      setSelectedTargetId(newTarget.id);
      setNewTargetUrl("");
    } catch (err) {
      setError((err as Error).message || "Error al crear target");
    } finally {
      setCreatingTarget(false);
    }
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool)
        ? prev.filter((t) => t !== tool)
        : [...prev, tool]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTargetId) {
      setError("Debes seleccionar un target");
      return;
    }

    if (selectedTools.length === 0) {
      setError("Debes seleccionar al menos una herramienta");
      return;
    }

    setLoading(true);

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const jobData: JobCreate = {
        target_id: selectedTargetId,
        tools_used: selectedTools,
      };

      const job = await apiFetch("/jobs", {
        method: "POST",
        token,
        body: JSON.stringify(jobData),
      });

      router.push(`/scans/${job.id}`);
    } catch (err) {
      setError((err as Error).message || "Error al crear escaneo");
    } finally {
      setLoading(false);
    }
  };

  if (loadingTargets) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Escaneo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea un nuevo escaneo de seguridad seleccionando un target y las herramientas a utilizar
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select or Create Target */}
          <Card title="Target a Escanear" description="Selecciona un target existente o crea uno nuevo">
            <div className="space-y-4">
              {targets.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Targets Existentes
                  </label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {targets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.url}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tienes targets creados. Crea uno nuevo abajo.</p>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">O crea un nuevo target</p>
                <div className="flex gap-2">
                  <Input
                    label="URL del Target"
                    type="url"
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    placeholder="https://ejemplo.com"
                    required={targets.length === 0}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateTarget(e as any);
                      }
                    }}
                  />
                  <div className="flex items-end pb-1">
                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={creatingTarget}
                      className="!w-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateTarget(e as any);
                      }}
                    >
                      Crear Target
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Select Tools */}
          <Card title="Herramientas de Escaneo" description="Selecciona las herramientas que deseas utilizar">
            <div className="space-y-3">
              {AVAILABLE_TOOLS.map((tool) => (
                <label
                  key={tool}
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool)}
                    onChange={() => handleToolToggle(tool)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{tool}</span>
                    <p className="text-sm text-gray-500">
                      {tool === "ZAP" && "OWASP ZAP baseline scan"}
                      {tool === "Nuclei" && "Nuclei vulnerability scanner"}
                      {tool === "SSLyze" && "SSL/TLS configuration analyzer"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="!w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading} className="!w-auto">
              Iniciar Escaneo
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

