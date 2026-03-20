import { apiClient } from './client';
import { SiteProgress } from '@/types/site-progress';

export interface CreateSiteProgressDto {
  projectId: string;
  date: string;
  notes?: string;
  photos?: string[];
}

export interface UpdateSiteProgressDto {
  projectId?: string;
  date?: string;
  notes?: string;
  photos?: string[];
}

// Transform backend response to frontend SiteProgress type
const transformSiteProgress = (data: any): SiteProgress => {
  return {
    id: data.id,
    projectId: data.projectId,
    projectName: data.project?.name || '',
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    notes: data.notes || undefined,
    photos: data.photos || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const siteProgressApi = {
  async getAll(projectId?: string): Promise<SiteProgress[]> {
    const endpoint = projectId ? `/site-progress?projectId=${projectId}` : '/site-progress';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformSiteProgress);
  },

  async getById(id: string): Promise<SiteProgress> {
    const data = await apiClient.get<any>(`/site-progress/${id}`);
    return transformSiteProgress(data);
  },

  async create(siteProgress: CreateSiteProgressDto): Promise<SiteProgress> {
    const data = await apiClient.post<any>('/site-progress', siteProgress);
    return transformSiteProgress(data);
  },

  async bulkCreate(progress: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return await apiClient.post<any>('/site-progress/bulk', { progress });
  },

  async update(id: string, siteProgress: UpdateSiteProgressDto): Promise<SiteProgress> {
    const data = await apiClient.patch<any>(`/site-progress/${id}`, siteProgress);
    return transformSiteProgress(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/site-progress/${id}`);
  },
};


