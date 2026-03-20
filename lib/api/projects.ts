import { apiClient } from './client';
import { Project, ProjectStatus } from '@/types/project';

export interface ProjectStats {
  total: number;
  inProgress: number;
  completed: number;
  onHold: number;
  planning: number;
  avgProgress: number;
}

export interface CreateProjectDto {
  projectId: string;
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  estimatedBudget?: number;
  actualBudget?: number;
  progress?: number;
}

export interface UpdateProjectDto {
  projectId?: string;
  name?: string;
  clientName?: string;
  location?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  estimatedBudget?: number;
  actualBudget?: number;
  progress?: number;
}

export interface BulkCreateResponse {
  requested: number;
  unique: number;
  created: number;
  skipped: number;
}

// Transform backend response to frontend Project type
const transformProject = (data: any): Project => {
  return {
    id: data.id,
    projectId: data.projectId || "",
    name: data.name,
    clientName: data.clientName || '',
    location: data.location || '',
    description: data.description || '',
    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
    endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
    status: data.status as ProjectStatus,
    estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget.toString()) : 0,
    actualBudget: data.actualBudget ? parseFloat(data.actualBudget.toString()) : 0,
    progress: data.progress || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const data = await apiClient.get<any[]>('/projects');
    return data.map(transformProject);
  },

  async getById(id: string): Promise<Project> {
    const data = await apiClient.get<any>(`/projects/${id}`);
    return transformProject(data);
  },

  async create(project: CreateProjectDto): Promise<Project> {
    const data = await apiClient.post<any>('/projects', project);
    return transformProject(data);
  },

  async bulkCreate(projects: CreateProjectDto[]): Promise<BulkCreateResponse> {
    const data = await apiClient.post<BulkCreateResponse>('/projects/bulk', { projects });
    return data;
  },

  async update(id: string, project: UpdateProjectDto): Promise<Project> {
    const data = await apiClient.patch<any>(`/projects/${id}`, project);
    return transformProject(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async getStats(): Promise<ProjectStats> {
    return apiClient.get<ProjectStats>('/projects/stats');
  },
};

