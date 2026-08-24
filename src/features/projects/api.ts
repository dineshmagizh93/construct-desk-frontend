import { useQuery } from '@tanstack/react-query'
import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import { http } from '@/lib/http'
import type { Project } from './types'

export const projectsApi = createRestApi<Project>('/projects')
export const {
  useEntityList: useProjects,
  useEntityCreate: useCreateProject,
  useEntityUpdate: useUpdateProject,
  useEntityRemove: useDeleteProject,
} = createEntityHooks('projects', projectsApi)

// The detail page needs milestones + derived task/expense/document summaries joined in,
// which the plain GET /projects/:id (used by the edit drawer) doesn't include.
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id, 'detail'],
    queryFn: () => http<Project>(`/projects/${id}/detail`),
    enabled: !!id,
  })
}
