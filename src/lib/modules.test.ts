import { describe, expect, it } from 'vitest'
import { canPerform, emptyPermissions } from './modules'
import { planIncludesModule, planMaxUsers } from './planAccess'

describe('canPerform', () => {
  it('denies everything without a permission map', () => {
    expect(canPerform(undefined, 'leads', 'view')).toBe(false)
  })

  it('denies unknown modules', () => {
    const perms = emptyPermissions()
    expect(canPerform(perms, 'not-a-module', 'view')).toBe(false)
  })

  it('starts fully denied and grants only what is switched on', () => {
    const perms = emptyPermissions()
    expect(canPerform(perms, 'expenses', 'view')).toBe(false)
    perms.expenses.view = true
    expect(canPerform(perms, 'expenses', 'view')).toBe(true)
    expect(canPerform(perms, 'expenses', 'edit')).toBe(false)
  })

  it('knows the modules added after the original audit', () => {
    // These are exercised by usePermission(...) across the new features; a rename would silently hide them.
    const perms = emptyPermissions()
    for (const key of ['site-progress', 'contracts', 'inventory', 'payments', 'finance-reports'] as const) {
      expect(perms[key]).toBeDefined()
    }
  })
})

describe('planIncludesModule / planMaxUsers', () => {
  const company = (over: Record<string, unknown>) => ({ subscriptionStatus: 'active', subscriptionPlan: null, ...over }) as never

  it('is permissive without a company, during a trial, or with no module list', () => {
    expect(planIncludesModule(null, 'payments')).toBe(true)
    expect(planIncludesModule(company({ subscriptionStatus: 'trialing', subscriptionPlan: { features: { modules: [] } } }), 'payments')).toBe(true)
    expect(planIncludesModule(company({ subscriptionPlan: { features: {} } }), 'payments')).toBe(true)
  })

  it('restricts an active plan to its listed modules', () => {
    const c = company({ subscriptionPlan: { features: { modules: ['leads', 'clients'] } } })
    expect(planIncludesModule(c, 'leads')).toBe(true)
    expect(planIncludesModule(c, 'payments')).toBe(false)
  })

  it('reads the seat limit, treating missing or non-positive as unlimited', () => {
    expect(planMaxUsers(company({ subscriptionPlan: { features: { maxUsers: 5 } } }))).toBe(5)
    expect(planMaxUsers(company({ subscriptionPlan: { features: { maxUsers: 0 } } }))).toBeNull()
    expect(planMaxUsers(company({ subscriptionPlan: { features: {} } }))).toBeNull()
    expect(planMaxUsers(undefined)).toBeNull()
  })
})
