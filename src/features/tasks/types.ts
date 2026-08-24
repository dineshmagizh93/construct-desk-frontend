export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  projectId: string
  assignee: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  description: string
}
