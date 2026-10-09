import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { RestockGroup } from './restock'

export interface RestockResult {
  requests: number
  lines: number
  failed: string[]
}

/**
 * Raises one purchase request per project and adds its lines, one call at a time. A problem with one project
 * does not stop the others; what could not be done is reported by name.
 */
export async function submitRestock(plan: RestockGroup[], titleFor: (projectId: string) => string): Promise<RestockResult> {
  const result: RestockResult = { requests: 0, lines: 0, failed: [] }
  for (const group of plan) {
    let requestId: string
    try {
      const created = await http<{ id: string }>('/purchase-requests', { method: 'POST', body: JSON.stringify({ projectId: group.projectId, title: titleFor(group.projectId) }) })
      requestId = created.id
      result.requests += 1
    } catch (error) {
      result.failed.push(`${titleFor(group.projectId)}: ${error instanceof Error ? error.message : 'could not be created'}`)
      continue
    }
    for (const line of group.lines) {
      try {
        await http(`/purchase-requests/${requestId}/items`, { method: 'POST', body: JSON.stringify({ inventoryItemId: line.inventoryItemId, quantity: line.quantity }) })
        result.lines += 1
      } catch (error) {
        result.failed.push(`${line.name}: ${error instanceof Error ? error.message : 'could not be added'}`)
      }
    }
  }
  return result
}

export function useSubmitRestock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ plan, titleFor }: { plan: RestockGroup[]; titleFor: (projectId: string) => string }) => submitRestock(plan, titleFor),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      const requests = `${result.requests} purchase request${result.requests === 1 ? '' : 's'}`
      if (result.failed.length === 0) {
        toast({ title: `${requests} raised`, description: `${result.lines} item${result.lines === 1 ? '' : 's'} waiting for approval.`, variant: 'success' })
      } else {
        toast({ title: `${requests} raised, ${result.failed.length} problem${result.failed.length === 1 ? '' : 's'}`, description: result.failed.slice(0, 2).join('; '), variant: 'destructive' })
      }
    },
    onError: (error: Error) => toast({ title: 'Could not raise the restock request', description: error.message, variant: 'destructive' }),
  })
}
