import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { http } from '@/lib/http'
import type { Company } from '@/types'

export interface SubscriptionPlan {
  id: string
  name: string
  priceInPaise: number
  billingInterval: 'monthly' | 'yearly'
  razorpayPlanId: string
  isActive: boolean
}

// ---- Subscription plans (tenant-facing: choosing/viewing a plan to subscribe to) ----
// Managing plans (create/disable) and companies/industry is Super Admin work and lives in the
// separate admin-console app now, not here — see project_industry_scope memory / the removed
// "Platform" tab for why.

export function usePlans() {
  return useQuery({ queryKey: ['billing', 'plans'], queryFn: () => http<SubscriptionPlan[]>('/billing/plans') })
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (planId: string) =>
      http<{ subscriptionId: string; razorpayKeyId: string }>('/billing/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
  })
}

// ---- Own company profile ----

export function useMyCompany(enabled = true) {
  return useQuery({ queryKey: ['companies', 'me'], queryFn: () => http<Company>('/companies/me'), enabled })
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: Partial<Pick<Company, 'name' | 'address' | 'phone' | 'email' | 'gstNumber'>>) =>
      http<Company>('/companies/me', { method: 'PATCH', body: JSON.stringify(values) }),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ['companies', 'me'] })
      useAuthStore.getState().setCompany(company)
    },
  })
}

export function refreshMyCompany() {
  return http<Company>('/companies/me').then((company) => {
    useAuthStore.getState().setCompany(company)
    return company
  })
}
