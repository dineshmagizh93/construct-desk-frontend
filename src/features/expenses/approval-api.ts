import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { Expense } from './types'

export type ExpenseDecision = 'approve' | 'reject' | 'mark-paid'

const SUCCESS_TITLE: Record<ExpenseDecision, string> = {
  approve: 'Expense approved',
  reject: 'Expense rejected',
  'mark-paid': 'Marked as paid',
}

export function useDecideExpense(expenseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ decision, note }: { decision: ExpenseDecision; note?: string }) =>
      http<Expense>(`/expenses/${expenseId}/${decision}`, { method: 'POST', body: JSON.stringify({ note }) }),
    onSuccess: (_data, { decision }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      // Spend figures on Projects / Finance Reports move with approval status.
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: SUCCESS_TITLE[decision], variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Could not update expense', description: error.message, variant: 'destructive' }),
  })
}
