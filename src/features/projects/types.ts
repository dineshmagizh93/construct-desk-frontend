export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectType = 'Residential' | 'Commercial' | 'Infrastructure' | 'Industrial'

export interface ProjectMilestone {
  id: string
  label: string
  dueDate: string
  done: boolean
}

export interface ProjectTaskSummary {
  id: string
  title: string
  assignee: string
  status: 'todo' | 'in_progress' | 'done'
  dueDate: string
}

export interface ProjectExpenseSummary {
  id: string
  category: string
  amount: number
  date: string
}

export interface ProjectDocumentSummary {
  id: string
  name: string
  type: string
  uploadedAt: string
}

export interface Project {
  id: string
  code: string
  name: string
  clientId: string
  clientName: string
  type: ProjectType
  status: ProjectStatus
  location: string
  projectManager: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  progress: number
  description: string
  milestones: ProjectMilestone[]
  tasks: ProjectTaskSummary[]
  expenses: ProjectExpenseSummary[]
  documents: ProjectDocumentSummary[]
}
