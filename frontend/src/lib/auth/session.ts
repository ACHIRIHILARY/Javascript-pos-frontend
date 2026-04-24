import type { SessionUser } from '../types/auth'

const USER_KEY = 'pos.auth.user'

export const sessionStorage = {
  getUser: (): SessionUser | null => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SessionUser
    } catch {
      return null
    }
  },
  setUser: (user: SessionUser) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),
}
