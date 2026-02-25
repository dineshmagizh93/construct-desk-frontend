import { apiClient } from './client';
import { Vendor } from '@/types/vendor';

export interface CreateVendorDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: string; // Backend uses 'type' field
  notes?: string;
  status?: string;
}

export interface UpdateVendorDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: string; // Backend uses 'type' field
  notes?: string;
  status?: string;
}

// Transform backend response to frontend Vendor type
const transformVendor = (data: any): Vendor => {
  return {
    id: data.id,
    name: data.name,
    type: (data.type || 'Other') as Vendor['type'],
    phone: data.phone || '',
    email: data.email || undefined,
    address: data.address || undefined,
    notes: data.notes || undefined,
    status: (data.status || 'Active') as Vendor['status'],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const vendorsApi = {
  async getAll(): Promise<Vendor[]> {
    const data = await apiClient.get<any[]>('/vendors');
    return data.map(transformVendor);
  },

  async getById(id: string): Promise<Vendor> {
    const data = await apiClient.get<any>(`/vendors/${id}`);
    return transformVendor(data);
  },

  async create(vendor: CreateVendorDto): Promise<Vendor> {
    const data = await apiClient.post<any>('/vendors', vendor);
    return transformVendor(data);
  },

  async update(id: string, vendor: UpdateVendorDto): Promise<Vendor> {
    const data = await apiClient.patch<any>(`/vendors/${id}`, vendor);
    return transformVendor(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vendors/${id}`);
  },
};

