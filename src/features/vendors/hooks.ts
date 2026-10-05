import { useMemo } from 'react'
import { useVendors } from './api'
import type { SelectOption } from '@/components/shared/types'

// The picker's value is the vendor's real id (UUID) — that's what Contract.vendorId stores.
export function useVendorOptions(): SelectOption[] {
  const { data: vendors = [] } = useVendors()
  return useMemo(() => vendors.map((v) => ({ label: v.name, value: v.id })), [vendors])
}

// Keyed by vendor id so a stored vendorId resolves to its name for denormalization on submit.
export function useVendorNameMap(): Record<string, string> {
  const { data: vendors = [] } = useVendors()
  return useMemo(() => Object.fromEntries(vendors.map((v) => [v.id, v.name])), [vendors])
}
