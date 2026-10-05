import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { EquipmentServiceLog } from './types'

interface ServiceLogInput {
  date: string
  type: string
  cost?: number
  performedBy?: string
  notes?: string
  nextServiceDate?: string
}

export function useLogService(equipmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ServiceLogInput) =>
      http<EquipmentServiceLog>(`/equipment/${equipmentId}/service-logs`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast({ title: 'Service logged', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteServiceLog(equipmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/equipment/${equipmentId}/service-logs/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
