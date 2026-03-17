import { apiClient } from './client'

export interface PlanUsageStats {
  users: {
    current: number
    limit: number
    percentage: number
  }
  projects: {
    current: number
    limit: number
    percentage: number
  }
  storage: {
    current: number
    limit: number
    percentage: number
  }
  plan: {
    users: number
    projects: number
    storageGB: number
    [key: string]: any
  }
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  currency?: string;
}

export const companyApi = {
  async getMe(): Promise<Company> {
    return apiClient.get<Company>('/company/me');
  },

  async update(data: UpdateCompanyDto): Promise<Company> {
    return apiClient.put<Company>('/company', data);
  },

  async getUsageStats(): Promise<PlanUsageStats> {
    return apiClient.get<PlanUsageStats>('/company/usage');
  },
}
