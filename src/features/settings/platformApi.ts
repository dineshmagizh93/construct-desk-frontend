import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { http } from '@/lib/http'
import type { Company, Industry } from '@/types'

export interface SubscriptionPlan {
  id: string
  name: string
  priceInPaise: number
  billingInterval: 'monthly' | 'yearly'
  razorpayPlanId: string
  isActive: boolean
}

// ---- Super Admin: companies ----

export function useCompanies() {
  return useQuery({ queryKey: ['platform', 'companies'], queryFn: () => http<Company[]>('/companies') })
}

export function useUpdateCompanyIndustry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, industry }: { id: string; industry: Industry }) =>
      http<Company>(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ industry }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform', 'companies'] }),
  })
}

// ---- Super Admin + company admin: subscription plans ----

export function usePlans() {
  return useQuery({ queryKey: ['billing', 'plans'], queryFn: () => http<SubscriptionPlan[]>('/billing/plans') })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: { name: string; priceInPaise: number; billingInterval: 'monthly' | 'yearly' }) =>
      http<SubscriptionPlan>('/billing/plans', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing', 'plans'] }),
  })
}

export function useTogglePlanActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      http<SubscriptionPlan>(`/billing/plans/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing', 'plans'] }),
  })
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
