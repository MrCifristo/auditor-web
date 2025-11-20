'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthContextValue, LoginPayload, RegisterPayload, User } from '@/types'
import { api } from '@/lib/api'
import { clearToken, getToken, saveToken } from '@/lib/storage'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/auth/me')
      setUser(response.data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
    router.push('/login')
  }, [router])

  useEffect(() => {
    const stored = getToken()
    if (stored) {
      setToken(stored)
      loadCurrentUser()
    } else {
      setLoading(false)
    }
  }, [loadCurrentUser])

  useEffect(() => {
    function handleUnauthorized() {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [logout])

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { email, password })
    saveToken(data.access_token)
    setToken(data.access_token)
    await loadCurrentUser()
    router.push('/dashboard')
  }, [loadCurrentUser, router])

  const register = useCallback(async ({ email, password }: RegisterPayload) => {
    await api.post('/auth/register', { email, password })
    await login({ email, password })
  }, [login])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refreshUser: loadCurrentUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
