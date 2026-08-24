import { useAuthStore } from '@/features/auth/store'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const company = useAuthStore((state) => state.company)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  return { user, company, isAuthenticated, login, logout }
}
