import { apiClient } from "./client"

export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  category?: string
  tasks: TaskTemplate[]
  budget?: number
  duration?: number
  createdAt: string
}

export interface TaskTemplate {
  title: string
  description?: string
  priority?: string
  estimatedHours?: number
  offsetDays?: number
}

export const projectTemplatesApi = {
  getAll: () => apiClient.get<ProjectTemplate[]>("/project-templates"),
  getOne: (id: string) => apiClient.get<ProjectTemplate>(`/project-templates/${id}`),
  create: (data: Partial<ProjectTemplate>) => apiClient.post<ProjectTemplate>("/project-templates", data),
  update: (id: string, data: Partial<ProjectTemplate>) => apiClient.patch<ProjectTemplate>(`/project-templates/${id}`, data),
  delete: (id: string) => apiClient.delete(`/project-templates/${id}`),
  applyToProject: (templateId: string, projectId: string, startDate?: string) =>
    apiClient.post(`/project-templates/${templateId}/apply`, { projectId, startDate }),
}
