import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'

const WARNING_WINDOW_DAYS = 3

function daysRemaining(currentPeriodEnd: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((new Date(currentPeriodEnd).getTime() - Date.now()) / msPerDay)
}

/** Persistent bar warning a trialing company their access ends soon, with a one-click way to
 * upgrade before that happens. Dismissible for the day — reappears daily until resolved. */
export function TrialBanner() {
  const user = useAuthStore((s) => s.user)
  const company = useAuthStore((s) => s.company)
  const impersonating = useAuthStore((s) => s.impersonating)
  const today = new Date().toDateString()
  const [dismissedFor, setDismissedFor] = useState<string | null>(() => {
    try {
      return localStorage.getItem('trial-banner-dismissed')
    } catch {
      return null
    }
  })

  if (impersonating) return null
  if (user?.role === 'super_admin') return null
  if (!company || company.subscriptionStatus !== 'trialing' || !company.currentPeriodEnd) return null

  const days = daysRemaining(company.currentPeriodEnd)
  if (days > WARNING_WINDOW_DAYS || days < 0) return null
  if (dismissedFor === today) return null

  const dismiss = () => {
    try {
      localStorage.setItem('trial-banner-dismissed', today)
    } catch {
      // localStorage unavailable — banner just won't persist dismissal, harmless
    }
    setDismissedFor(today)
  }

  const label = days === 0 ? 'Your trial ends today' : days === 1 ? 'Your trial ends tomorrow' : `Your trial ends in ${days} days`

  return (
    <div className="flex shrink-0 items-center justify-center gap-3 bg-accent px-4 py-1.5 text-center text-xs font-semibold text-accent-foreground">
      <Clock className="size-3.5 shrink-0" />
      <span>{label} — add a plan to keep access for {company.name}.</span>
      <Link
        to="/billing/paywall"
        className="shrink-0 rounded bg-accent-foreground/15 px-2 py-0.5 font-bold transition-colors hover:bg-accent-foreground/25"
      >
        Choose a plan
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss for today"
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-accent-foreground/15"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
