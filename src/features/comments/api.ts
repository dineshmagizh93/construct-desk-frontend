import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { toast } from '@/hooks/use-toast'

export type CommentEntity = 'Task' | 'Lead'

export interface Comment {
  id: string
  entity: CommentEntity
  entityId: string
  authorId: string | null
  authorName: string
  body: string
  mentionedIds: string[]
  createdAt: string
}

export function useComments(entity: CommentEntity, entityId: string | undefined) {
  return useQuery({
    queryKey: ['comments', entity, entityId],
    queryFn: () => http<Comment[]>(`/comments?entity=${entity}&entityId=${encodeURIComponent(entityId ?? '')}`),
    enabled: !!entityId,
  })
}

export function useAddComment(entity: CommentEntity, entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: { body: string; mentionedIds: string[] }) =>
      http<Comment>('/comments', { method: 'POST', body: JSON.stringify({ entity, entityId, ...values }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', entity, entityId] }),
    onError: (error: Error) => toast({ title: 'Could not post your comment', description: error.message, variant: 'destructive' }),
  })
}

export function useDeleteComment(entity: CommentEntity, entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http(`/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', entity, entityId] }),
    onError: (error: Error) => toast({ title: 'Could not delete the comment', description: error.message, variant: 'destructive' }),
  })
}
