import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { Payment } from './types'

/** Mirrors backend/src/shared/paymentMath.ts — `amount` is the gross bill; retention is withheld by the client. */
export function retentionAmount(p: Pick<Payment, 'amount' | 'retentionPercent'>): number {
  return Math.round((p.amount * (p.retentionPercent ?? 0)) / 100)
}

export function netDue(p: Pick<Payment, 'amount' | 'retentionPercent'>): number {
  return p.amount - retentionAmount(p)
}

/** Money still to come in on one invoice, net of retention (0 once paid). Mirrors backend paymentMath.outstanding. */
export function outstandingAmount(p: Pick<Payment, 'amount' | 'retentionPercent' | 'status' | 'receivedAmount'>): number {
  return p.status === 'paid' ? 0 : Math.max(0, netDue(p) - Math.max(0, p.receivedAmount ?? 0))
}

/** Cash received on one invoice: net once paid, plus retention once released. Mirrors backend paymentMath.collected. */
export function collectedAmount(p: Pick<Payment, 'amount' | 'retentionPercent' | 'status' | 'retentionReleasedAt' | 'receivedAmount'>): number {
  // A bill marked paid is settled in full whatever the receipts say (older invoices have none).
  if (p.status === 'paid') return netDue(p) + (p.retentionReleasedAt ? retentionAmount(p) : 0)
  return Math.min(Math.max(0, p.receivedAmount ?? 0), netDue(p))
}

export function useReleaseRetention(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => http<Payment>(`/payments/${paymentId}/release-retention`, { method: 'POST', body: JSON.stringify({}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      // Revenue / outstanding / retention-held figures all move when retention is released.
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast({ title: 'Retention released', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Could not release retention', description: error.message, variant: 'destructive' }),
  })
}
