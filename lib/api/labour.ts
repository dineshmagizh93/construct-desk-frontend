import { apiClient } from './client';
import { Labour, LabourCategory } from '@/types/labour';

export interface CreateLabourDto {
  projectId: string;
  category: LabourCategory;
  headcount: number;
  costPerDay: number;
  date: string;
  notes?: string;
}

export interface UpdateLabourDto {
  projectId?: string;
  category?: LabourCategory;
  headcount?: number;
  costPerDay?: number;
  date?: string;
  notes?: string;
}

// Transform backend response to frontend Labour type
const transformLabour = (data: any): Labour => {
  return {
    id: data.id,
    projectId: data.projectId,
    projectName: data.project?.name || '',
    category: data.category as LabourCategory,
    headcount: data.headcount || 0,
    costPerDay: data.costPerDay ? parseFloat(data.costPerDay.toString()) : 0,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    notes: data.notes || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const labourApi = {
  async getAll(projectId?: string): Promise<Labour[]> {
    const endpoint = projectId ? `/labour?projectId=${projectId}` : '/labour';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformLabour);
  },

  async getById(id: string): Promise<Labour> {
    const data = await apiClient.get<any>(`/labour/${id}`);
    return transformLabour(data);
  },

  async create(labour: CreateLabourDto): Promise<Labour> {
    const data = await apiClient.post<any>('/labour', labour);
    return transformLabour(data);
  },

  async update(id: string, labour: UpdateLabourDto): Promise<Labour> {
    const data = await apiClient.patch<any>(`/labour/${id}`, labour);
    return transformLabour(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/labour/${id}`);
  },
};


