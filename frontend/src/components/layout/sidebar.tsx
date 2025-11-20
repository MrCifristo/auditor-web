'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/targets', label: 'Targets' },
  { href: '/jobs', label: 'Jobs & Findings' },
  { href: '/metrics', label: 'Métricas' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white/90 px-4 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Auditor Web</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Centro de Seguridad</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-slate-800',
                active && 'bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-300'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-dashed border-primary-200 bg-primary-50/60 p-4 text-xs text-primary-800 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-200">
        <p className="font-semibold">Recordatorio ético</p>
        <p>Solo escanea dominios autorizados y con consentimiento expreso.</p>
      </div>
    </aside>
  )
}
