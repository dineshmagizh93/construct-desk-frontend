import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import { estimateCopy } from './duplicate'
import type { Estimate } from './types'

/** Creates a new draft estimate from an existing one, then adds its line items one by one. Resolves with the new estimate. */
export function useDuplicateEstimate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (source: Estimate) => {
      const copy = estimateCopy(source, new Date())
      const created = await http<Estimate>('/estimates', { method: 'POST', body: JSON.stringify(copy.estimate) })
      let failed = 0
      for (const line of copy.lines) {
        try {
          await http(`/estimates/${created.id}/line-items`, { method: 'POST', body: JSON.stringify(line) })
        } catch {
          failed += 1
        }
      }
      return { created, failed, total: copy.lines.length }
    },
    onSuccess: ({ created, failed, total }) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      if (failed === 0) {
        toast({ title: 'Estimate copied', description: `"${created.title}" is a new draft with ${total} line item${total === 1 ? '' : 's'}.`, variant: 'success' })
      } else {
        toast({ title: 'Estimate copied, but some lines were not', description: `${failed} of ${total} line items could not be added — check the copy before sending it.`, variant: 'destructive' })
      }
    },
    onError: (error: Error) => toast({ title: 'Could not copy the estimate', description: error.message, variant: 'destructive' }),
  })
}
