import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { canPerform } from '@/lib/permissions'
import { planIncludesModule } from '@/lib/planAccess'
import { NAV_GROUPS } from '@/lib/constants'

/** Module key gating a path, from the same nav config the sidebar uses. */
function moduleForPath(pathname: string): string | undefined {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return item.module
    }
  }
  return undefined
}

/**
 * Redirects away from the current page if the signed-in user can't access its module — for two
 * distinct reasons, each with its own redirect: (1) their ROLE lacks permission → dashboard,
 * silently, same as always; (2) the company's PLAN doesn't include the module → Settings/Billing,
 * with a toast explaining why, since that's something they can actually act on (upgrade).
 */
export function RouteAccessGuard({ children }: { children: ReactNode }) {
  const { user, company } = useAuth()
  const location = useLocation()
  const module = moduleForPath(location.pathname)
  const notified = useRef<string | null>(null)

  const lacksRole = !!(user && module && !canPerform(user.permissions, module, 'view'))
  const lacksPlan = !!(user && module && !lacksRole && !planIncludesModule(company, module))

  useEffect(() => {
    if (lacksPlan && module && notified.current !== module) {
      notified.current = module
      toast({
        title: 'Not included in your plan',
        description: 'Upgrade your plan to unlock this module.',
        variant: 'destructive',
      })
    }
  }, [lacksPlan, module])

  if (lacksRole) return <Navigate to="/dashboard" replace />
  if (lacksPlan) return <Navigate to="/settings" replace />

  return <>{children}</>
}
