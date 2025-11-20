import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
          Proyecto final — Seguridad Informática &amp; Encriptación
        </p>
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Auditor Web de Seguridad
        </h1>
        <p className="text-lg text-gray-600">
          Plataforma para ejecutar auditorías de vulnerabilidades básicas, visualizar
          hallazgos por severidad y documentar resultados accionables para equipos no técnicos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700"
          >
            Ir al panel
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-primary-200 hover:bg-primary-50"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
      <div className="grid w-full gap-4 rounded-2xl border border-dashed border-primary-200/70 bg-white/80 p-6 text-left shadow-sm md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Herramientas</p>
          <p className="text-lg font-semibold text-gray-900">OWASP ZAP · Nuclei · SSLyze</p>
          <p className="text-sm text-gray-500">Escáneres orquestados en contenedores Docker.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Protección</p>
          <p className="text-lg font-semibold text-gray-900">JWT + Roles + Hash seguro</p>
          <p className="text-sm text-gray-500">Control de acceso y cifrado de credenciales.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Resultados</p>
          <p className="text-lg font-semibold text-gray-900">Hallazgos normalizados</p>
          <p className="text-sm text-gray-500">Reportes visuales por severidad, herramienta y tiempo.</p>
        </div>
      </div>
    </main>
  )
}
