import { apiClient } from './client';

export interface Company {
  id: string;
  name: string;
  email: string;
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
    const data = await apiClient.get<any>('/company/me');
    return data;
  },

  async update(updateData: UpdateCompanyDto): Promise<Company> {
    const data = await apiClient.patch<any>('/company/me', updateData);
    return data;
  },
};

