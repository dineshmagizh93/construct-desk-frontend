import { apiClient } from './client';
import { Lead, LeadType, LeadSource, LeadStatus } from '@/types/lead';

export interface CreateLeadDto {
  name: string;
  phone: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateLeadDto {
  name?: string;
  phone?: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
  assignedTo?: string;
  notes?: string;
}

// Transform backend response to frontend Lead type
const transformLead = (data: any): Lead => {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    type: data.type as LeadType,
    source: data.source as LeadSource,
    status: data.status as LeadStatus,
    assignedTo: data.assignedTo || undefined,
    notes: data.notes || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const leadsApi = {
  async getAll(type?: string): Promise<Lead[]> {
    const endpoint = type ? `/leads?type=${type}` : '/leads';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformLead);
  },

  async getById(id: string): Promise<Lead> {
    const data = await apiClient.get<any>(`/leads/${id}`);
    return transformLead(data);
  },

  async create(lead: CreateLeadDto): Promise<Lead> {
    const data = await apiClient.post<any>('/leads', lead);
    return transformLead(data);
  },

  async bulkCreate(leads: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return await apiClient.post<any>('/leads/bulk', { leads });
  },

  async update(id: string, lead: UpdateLeadDto): Promise<Lead> {
    const data = await apiClient.patch<any>(`/leads/${id}`, lead);
    return transformLead(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  },

  async convertToClient(id: string): Promise<Lead> {
    const data = await apiClient.post<any>(`/leads/${id}/convert`, {});
    return transformLead(data);
  },
};


