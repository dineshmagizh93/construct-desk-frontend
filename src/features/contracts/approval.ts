import type { SelectOption } from '@/components/shared/types'

export const CONTRACT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending approval', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const isApprover = (role: string | undefined) => role === 'admin' || role === 'super_admin'

/**
 * The statuses a person can pick in the contract form. Administrators approve and reject; everyone else can
 * only draft or submit for approval. When a non-admin opens a contract that is already approved or
 * rejected, that current status is still shown (so the box isn't blank) but it is the only extra choice —
 * the server ignores any attempt to set it.
 */
export function statusOptionsFor(role: string | undefined, currentStatus?: string): SelectOption[] {
  if (isApprover(role)) return CONTRACT_STATUS_OPTIONS
  return CONTRACT_STATUS_OPTIONS.filter((o) => o.value === 'draft' || o.value === 'pending' || o.value === currentStatus)
}
