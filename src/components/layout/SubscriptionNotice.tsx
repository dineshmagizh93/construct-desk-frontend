import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'
import { subscriptionAccess } from '@/features/billing/access'
import { formatDate } from '@/lib/utils'

/**
 * A bar for the two in-between states: a subscription the customer has cancelled (working until the paid period ends) and a
 * renewal payment that has failed (working through the grace period). Not dismissible: both end in a lock-out on a date.
 */
export function SubscriptionNotice() {
  const user = useAuthStore((s) => s.user)
  const company = useAuthStore((s) => s.company)
  const impersonating = useAuthStore((s) => s.impersonating)

  if (impersonating || !company || user?.role === 'super_admin') return null
  const access = subscriptionAccess(company)
  if (!access.allowed || !access.endsAt) return null

  if (access.state === 'ending') {
    return (
      <div className="flex shrink-0 items-center justify-center gap-3 bg-accent px-4 py-1.5 text-center text-xs font-semibold text-accent-foreground">
        <CalendarClock className="size-3.5 shrink-0" />
        <span>Your subscription is cancelled. {company.name} stays available until {formatDate(access.endsAt)}.</span>
        <Link to="/billing/paywall" className="shrink-0 rounded bg-accent-foreground/15 px-2 py-0.5 font-bold transition-colors hover:bg-accent-foreground/25">
          Choose a plan
        </Link>
      </div>
    )
  }

  if (access.state === 'grace') {
    return (
      <div className="flex shrink-0 items-center justify-center gap-3 bg-destructive px-4 py-1.5 text-center text-xs font-semibold text-destructive-foreground">
        <AlertTriangle className="size-3.5 shrink-0" />
        <span>Your last payment did not go through. Subscribe again with a working payment method to keep {company.name} open; access ends on {formatDate(access.endsAt)}.</span>
        <Link to="/billing/paywall" className="shrink-0 rounded bg-destructive-foreground/15 px-2 py-0.5 font-bold transition-colors hover:bg-destructive-foreground/25">
          Subscribe again
        </Link>
      </div>
    )
  }

  return null
}
