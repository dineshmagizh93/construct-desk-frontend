import { describe, expect, it } from 'vitest'
import { PAST_DUE_GRACE_DAYS, subscriptionAccess } from './access'

const now = new Date('2026-11-01T10:00:00Z')
const at = (n: number) => new Date(now.getTime() + n * 86_400_000).toISOString()

describe('subscriptionAccess', () => {
  it('lets a trial run until it ends', () => {
    expect(subscriptionAccess({ subscriptionStatus: 'trialing', currentPeriodEnd: at(3) }, now)).toMatchObject({ allowed: true, state: 'trial' })
    expect(subscriptionAccess({ subscriptionStatus: 'trialing', currentPeriodEnd: at(-1) }, now).allowed).toBe(false)
  })

  it('lets a paying company in', () => {
    expect(subscriptionAccess({ subscriptionStatus: 'active' }, now)).toMatchObject({ allowed: true, state: 'active', endsAt: null })
  })

  it('keeps a customer-cancelled company working to the end of the paid period, then stops', () => {
    for (const subscriptionStatus of ['active', 'cancelled'] as const) {
      expect(subscriptionAccess({ subscriptionStatus, currentPeriodEnd: at(9), cancelAtPeriodEnd: true }, now)).toMatchObject({ allowed: true, state: 'ending' })
      expect(subscriptionAccess({ subscriptionStatus, currentPeriodEnd: at(-1), cancelAtPeriodEnd: true }, now).allowed).toBe(false)
    }
  })

  it('blocks a platform-suspended company at once, even with paid time left', () => {
    expect(subscriptionAccess({ subscriptionStatus: 'cancelled', currentPeriodEnd: at(20), cancelAtPeriodEnd: false }, now).allowed).toBe(false)
    expect(subscriptionAccess({ subscriptionStatus: 'cancelled', currentPeriodEnd: at(20) }, now).allowed).toBe(false)
  })

  it(`gives a failed renewal ${PAST_DUE_GRACE_DAYS} days of grace after the paid period, then blocks`, () => {
    expect(subscriptionAccess({ subscriptionStatus: 'past_due', currentPeriodEnd: at(-2) }, now)).toMatchObject({ allowed: true, state: 'grace' })
    expect(subscriptionAccess({ subscriptionStatus: 'past_due', currentPeriodEnd: at(-(PAST_DUE_GRACE_DAYS + 1)) }, now).allowed).toBe(false)
    expect(subscriptionAccess({ subscriptionStatus: 'past_due' }, now).allowed).toBe(false)
  })
})
