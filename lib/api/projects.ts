import { apiClient } from './client';
import { Project, ProjectStatus } from '@/types/project';
import { PaginatedResponse, PaginationParams } from './pagination';

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

export interface ProjectListParams extends PaginationParams {
  search?: string;
  status?: ProjectStatus;
}

const normalizeProjectList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

// Transform backend response to frontend Project type
const normalizeApiDate = (value?: string | null): string => {
  if (!value) return ''
  // Keep date-only strings as-is to avoid timezone shifts.
  const dateOnlyMatch = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (dateOnlyMatch) return dateOnlyMatch[0]

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().split('T')[0]
}

const transformProject = (data: any): Project => {
  return {
    id: data.id,
    projectId: data.projectId || "",
    name: data.name,
    clientName: data.clientName || '',
    location: data.location || '',
    description: data.description || '',
    startDate: normalizeApiDate(data.startDate),
    endDate: normalizeApiDate(data.endDate),
    status: data.status as ProjectStatus,
    estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget.toString()) : 0,
    actualBudget: data.actualBudget ? parseFloat(data.actualBudget.toString()) : 0,
    progress: data.progress || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const projectsApi = {
  async getPage(params: ProjectListParams = {}): Promise<PaginatedResponse<Project>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const data = await apiClient.get<PaginatedResponse<any>>(`/projects${query ? `?${query}` : ''}`);

    return {
      ...data,
      items: data.items.map(transformProject),
    };
  },

  async getAll(): Promise<Project[]> {
    const data = await apiClient.get<any>('/projects');
    return normalizeProjectList(data).map(transformProject);
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

  async exportCsv(): Promise<string> {
    return apiClient.get('/projects/export/csv')
  },

  async getGanttData(projectId?: string): Promise<any> {
    const q = projectId ? `?projectId=${projectId}` : ""
    return apiClient.get(`/projects/gantt${q}`)
  },
};
