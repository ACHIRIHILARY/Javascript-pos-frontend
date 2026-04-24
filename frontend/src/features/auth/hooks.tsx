import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { sessionStorage } from '../../lib/auth/session'
import { tokenStorage } from '../../lib/auth/tokenStorage'
import type { LoginRequest, SessionUser } from '../../lib/types/auth'
import { authApi } from './api'

type AuthContextValue = {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (input: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(() => sessionStorage.getUser())

  const login = useCallback(async (input: LoginRequest) => {
    const response = await authApi.login(input)
    tokenStorage.set(response.token)
    sessionStorage.setUser(response.user)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined)
    tokenStorage.clear()
    sessionStorage.clearUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
