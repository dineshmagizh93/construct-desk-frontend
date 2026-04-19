import { apiClient } from './client';
import { PaginatedResponse, PaginationParams } from './pagination';

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
  BLOCKED = 'Blocked',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  position: number;
  labels?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  _count?: {
    comments: number;
    activities: number;
  };
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TaskActivity {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  position?: number;
  labels?: string;
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  position?: number;
  labels?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface UpdateTaskPositionDto {
  taskId: string;
  newStatus: string;
  newPosition: number;
}

export interface TaskFilters {
  projectId?: string;
  status?: string;
  assignedTo?: string;
  priority?: string;
  search?: string;
}

export interface TaskListParams extends TaskFilters, PaginationParams {}

export const tasksApi = {
  async getPage(filters?: TaskListParams): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return apiClient.get<PaginatedResponse<Task>>(`/tasks${query ? `?${query}` : ''}`);
  },

  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    return apiClient.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<Task & { comments: TaskComment[]; activities: TaskActivity[] }> {
    return apiClient.get<Task & { comments: TaskComment[]; activities: TaskActivity[] }>(`/tasks/${id}`);
  },

  async create(task: CreateTaskDto): Promise<Task> {
    return apiClient.post<Task>('/tasks', task);
  },

  async bulkCreate(tasks: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return apiClient.post<any>('/tasks/bulk', { tasks });
  },

  async update(id: string, task: UpdateTaskDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, task);
  },

  async updatePosition(data: UpdateTaskPositionDto): Promise<Task> {
    return apiClient.post<Task>('/tasks/move', data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`);
  },

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    return apiClient.post<TaskComment>(`/tasks/${taskId}/comments`, { content });
  },

  async getActivities(taskId: string): Promise<TaskActivity[]> {
    return apiClient.get<TaskActivity[]>(`/tasks/${taskId}/activities`);
  },

  async getStats(projectId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
  }> {
    const params = projectId ? `?projectId=${projectId}` : '';
    return apiClient.get(`/tasks/stats${params}`);
  },
};

