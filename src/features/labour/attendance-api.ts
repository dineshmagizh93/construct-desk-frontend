import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'
import type { LabourAttendanceEntry } from './types'

interface AttendanceInput {
  date: string
  present: boolean
  wageAmount?: number
  notes?: string
}

export function useMarkAttendance(labourId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AttendanceInput) =>
      http<LabourAttendanceEntry>(`/labour/${labourId}/attendance`, { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour'] })
      toast({ title: 'Attendance recorded', variant: 'success' })
    },
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteAttendance(labourId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http<void>(`/labour/${labourId}/attendance/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labour'] }),
    onError: (error: Error) => toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }),
  })
}
