import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { Estimate } from './types'

export interface CreateContractResult {
  estimate: Estimate
  contract: { id: string; title: string; amount: number }
  /** Only present when the estimate had no project and one was created for it. */
  project: { id: string; code: string; name: string } | null
}

export function useCreateContractFromEstimate(estimateId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => http<CreateContractResult>(`/estimates/${estimateId}/create-contract`, { method: 'POST', body: JSON.stringify({}) }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      if (result.project) queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({
        title: 'Contract created',
        description: `${result.contract.title} is in Contracts & POs as a draft${result.project ? ` · project ${result.project.code} created` : ''}.`,
        variant: 'success',
      })
    },
    onError: (error: Error) => toast({ title: 'Could not create contract', description: error.message, variant: 'destructive' }),
  })
}
