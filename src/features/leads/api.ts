import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import { http } from '@/lib/http'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import type { Lead, LeadFollowUp } from './types'

export const leadsApi = createRestApi<Lead>('/leads')
export const {
  useEntityList: useLeads,
  useEntityCreate: useCreateLead,
  useEntityUpdate: useUpdateLead,
  useEntityRemove: useDeleteLead,
} = createEntityHooks('leads', leadsApi)

/** Normalize drawer/import payloads so Prisma Int/enum columns don't 400/500. */
export function toLeadPayload(values: Record<string, unknown>): Partial<Lead> {
  const budget = Number(values.estimatedBudget)
  return {
    name: String(values.name ?? '').trim(),
    phone: values.phone ? String(values.phone) : undefined,
    email: values.email ? String(values.email) : undefined,
    projectType: values.projectType ? String(values.projectType) : undefined,
    estimatedBudget: Number.isFinite(budget) ? Math.round(budget) : 0,
    source: values.source ? (String(values.source) as Lead['source']) : undefined,
    status: (values.status as Lead['status']) || 'new',
    assignedTo: values.assignedTo ? String(values.assignedTo) : undefined,
    location: values.location ? String(values.location) : undefined,
  }
}

export function useAddLeadFollowUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, note, date }: { leadId: string; note: string; date?: string }) =>
      http<LeadFollowUp>(`/leads/${leadId}/follow-ups`, {
        method: 'POST',
        body: JSON.stringify({ note, date: date ?? new Date().toISOString() }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast({ title: 'Follow-up added', description: 'Note saved to this lead.', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export interface ConvertLeadResult {
  lead: Lead
  client: { id: string; name: string }
  project: { id: string; code: string; name: string } | null
  clientReused: boolean
}

export function useConvertLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, createProject, projectName }: { leadId: string; createProject: boolean; projectName?: string }) =>
      http<ConvertLeadResult>(`/leads/${leadId}/convert`, { method: 'POST', body: JSON.stringify({ createProject, projectName }) }),
    onSuccess: (result) => {
      // The lead is now won; a client (and maybe a project) just appeared.
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({
        title: 'Lead converted',
        description: `${result.clientReused ? 'Linked to existing client' : 'Client created'}${result.project ? ` · project ${result.project.code} created` : ''}.`,
        variant: 'success',
      })
    },
    onError: (error: Error) => toast({ title: 'Could not convert lead', description: error.message, variant: 'destructive' }),
  })
}
