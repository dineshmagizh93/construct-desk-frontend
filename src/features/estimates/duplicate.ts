import type { Estimate } from './types'

export interface EstimateCopy {
  estimate: {
    title: string
    clientName?: string
    projectId?: string
    projectType?: string
    totalAmount: number
    status: 'draft'
    validUntil: string
  }
  lines: { description: string; quantity: number; unitPrice: number; taxPercent: number }[]
}

/** How long a fresh quote stays valid, counted from the day it is copied. */
export const COPY_VALID_DAYS = 30
const COPY_PREFIX = 'Copy of '
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/**
 * What to create when re-quoting from an existing estimate: the same client, project, type and line items, as a new
 * draft titled "Copy of …" (never "Copy of Copy of …"), valid for 30 days from today. With line items the total
 * follows from them as they are added; a flat-amount estimate keeps its amount. The link to any contract, and the
 * old status and validity, are deliberately not carried over.
 */
export function estimateCopy(estimate: Estimate, now: Date): EstimateCopy {
  const base = estimate.title.startsWith(COPY_PREFIX) ? estimate.title.slice(COPY_PREFIX.length) : estimate.title
  const istToday = new Date(now.getTime() + IST_OFFSET_MS)
  const validUntil = new Date(Date.UTC(istToday.getUTCFullYear(), istToday.getUTCMonth(), istToday.getUTCDate() + COPY_VALID_DAYS))
  const lines = (estimate.lineItems ?? []).map((l) => ({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, taxPercent: l.taxPercent }))
  return {
    estimate: {
      title: `${COPY_PREFIX}${base}`,
      clientName: estimate.clientName || undefined,
      projectId: estimate.projectId || undefined,
      projectType: estimate.projectType || undefined,
      totalAmount: lines.length > 0 ? 0 : estimate.totalAmount,
      status: 'draft',
      validUntil: validUntil.toISOString(),
    },
    lines,
  }
}
