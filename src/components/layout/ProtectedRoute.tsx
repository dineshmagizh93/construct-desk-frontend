import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { http } from '@/lib/http'
import { useAuthStore } from '@/features/auth/store'
import { useAuth } from '@/hooks/useAuth'
import type { Company, User } from '@/types'

const ACTIVE_STATUSES = new Set(['trialing', 'active'])

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, company } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const setCompany = useAuthStore((s) => s.setCompany)
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) return
    http<{ user: User; company: Company | null }>('/auth/me')
      .then((data) => {
        setUser(data.user)
        if (data.company) setCompany(data.company)
      })
      .catch(() => {
        /* stale session handled by http 401 */
      })
  }, [isAuthenticated, setUser, setCompany])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isPaywalled =
    user?.role !== 'super_admin' &&
    !!company &&
    !ACTIVE_STATUSES.has(company.subscriptionStatus) &&
    location.pathname !== '/billing/paywall'

  if (isPaywalled) {
    return <Navigate to="/billing/paywall" replace />
  }

  return <>{children}</>
}
