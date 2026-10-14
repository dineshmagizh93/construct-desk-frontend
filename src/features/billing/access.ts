import type { Company } from '@/types'

/** Days a company keeps working after its paid period ends without a successful renewal. Keep equal to the server's PAST_DUE_GRACE_DAYS. */
export const PAST_DUE_GRACE_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

export type AccessState = 'trial' | 'active' | 'ending' | 'grace' | 'blocked'

export interface SubscriptionAccess {
  allowed: boolean
  state: AccessState
  /** When access stops (ending, grace) or the trial ends; null when it does not stop on a date. */
  endsAt: Date | null
}

type AccessCompany = Pick<Company, 'subscriptionStatus' | 'currentPeriodEnd' | 'cancelAtPeriodEnd'>

/**
 * Whether the workspace may be used right now. This mirrors the server's rule (backend shared/subscriptionAccess.ts) so the
 * screens agree with what the API will allow: a customer cancellation keeps access to the end of the paid period, a failed
 * renewal gets a grace period, and a platform suspension blocks at once.
 */
export function subscriptionAccess(company: AccessCompany, now = new Date()): SubscriptionAccess {
  const end = company.currentPeriodEnd ? new Date(company.currentPeriodEnd) : null
  const t = now.getTime()

  switch (company.subscriptionStatus) {
    case 'trialing':
      if (end && end.getTime() < t) return { allowed: false, state: 'blocked', endsAt: end }
      return { allowed: true, state: 'trial', endsAt: end }
    case 'active':
      if (company.cancelAtPeriodEnd && end) {
        return end.getTime() < t ? { allowed: false, state: 'blocked', endsAt: end } : { allowed: true, state: 'ending', endsAt: end }
      }
      return { allowed: true, state: 'active', endsAt: null }
    case 'cancelled':
      if (company.cancelAtPeriodEnd && end && end.getTime() >= t) return { allowed: true, state: 'ending', endsAt: end }
      return { allowed: false, state: 'blocked', endsAt: end }
    case 'past_due': {
      if (end) {
        const graceEnd = new Date(end.getTime() + PAST_DUE_GRACE_DAYS * DAY_MS)
        if (graceEnd.getTime() >= t) return { allowed: true, state: 'grace', endsAt: graceEnd }
      }
      return { allowed: false, state: 'blocked', endsAt: end }
    }
    default:
      return { allowed: false, state: 'blocked', endsAt: end }
  }
}
