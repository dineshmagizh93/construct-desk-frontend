import type { Company } from '@/types'

/**
 * Whether the company's current PLAN unlocks a module — separate from whether the signed-in
 * USER's role has permission to use it (see lib/permissions.ts canPerform). Both must pass.
 * Relaxed during trial so prospects can explore every module before choosing a plan; a plan with
 * no `modules` list configured (legacy rows, or a custom Enterprise deal) is unrestricted.
 */
export function planIncludesModule(company: Company | null | undefined, moduleKey: string): boolean {
  if (!company) return true
  if (company.subscriptionStatus === 'trialing') return true
  const modules = company.subscriptionPlan?.features?.modules
  if (!Array.isArray(modules)) return true
  return modules.includes(moduleKey)
}

/** Seat limit from the company's plan, or null for unlimited. */
export function planMaxUsers(company: Company | null | undefined): number | null {
  const n = company?.subscriptionPlan?.features?.maxUsers
  return typeof n === 'number' && n > 0 ? n : null
}
