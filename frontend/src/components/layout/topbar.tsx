'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-slate-400">Proyecto final · Seguridad Informática</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Auditor Web de Seguridad</h2>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={toggleTheme}>
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </Button>
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Rol: {user.role}</p>
          </div>
        )}
        <Button variant="ghost" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
