import { useAuth } from '@/hooks/useAuth'
import { INDUSTRY_CONFIGS, type Industry } from './industry'

/**
 * Industry is a per-company field owned by the backend (Company.industry), settable only by
 * Super Admin via PATCH /companies/:id. Regular sessions just read whatever their own company
 * is currently set to.
 */
export function useIndustryConfig() {
  const { company } = useAuth()
  const industry: Industry = company?.industry ?? 'construction'
  return INDUSTRY_CONFIGS[industry]
}
