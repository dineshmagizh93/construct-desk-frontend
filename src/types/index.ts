import type { PermissionMap } from '@/lib/modules'

export type Role = 'super_admin' | 'admin' | 'project_manager' | 'site_engineer' | 'accountant' | 'sales_executive'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  avatarUrl?: string
  companyRoleId?: string
  companyRoleName?: string
  permissions?: PermissionMap
}

export type Industry = 'construction' | 'interior_design'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled'
export type BillingInterval = 'monthly' | 'yearly'

export interface PlanFeatures {
  /** Module keys this plan unlocks. Absent/non-array = unrestricted (legacy or custom Enterprise). */
  modules?: string[]
  /** Seat limit, or absent/null for unlimited. */
  maxUsers?: number | null
}

export interface SubscriptionPlan {
  id: string
  name: string
  priceInPaise: number
  billingInterval: BillingInterval
  isActive: boolean
  features?: PlanFeatures | null
}

export interface Company {
  id: string
  name: string
  industry: Industry
  logoUrl?: string
  address?: string
  phone?: string
  email?: string
  gstNumber?: string
  subscriptionStatus: SubscriptionStatus
  subscriptionPlanId?: string
  subscriptionPlan?: SubscriptionPlan | null
  currentPeriodEnd?: string
}

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled'
