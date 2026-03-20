export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed"

export interface Project {
  id: string
  projectId: string
  name: string
  clientName: string
  location: string
  description?: string
  startDate: string
  endDate: string
  status: ProjectStatus
  estimatedBudget: number
  actualBudget?: number
  progress: number
  createdAt: string
  updatedAt: string
}

export interface ProjectFormData {
  projectId: string
  name: string
  clientName: string
  location: string
  description?: string
  startDate: string
  endDate: string
  status: ProjectStatus
  estimatedBudget: number
}

export interface ProjectStats {
  total: number
  active: number
  averageProgress: number
  byStatus: Record<ProjectStatus, number>
}

