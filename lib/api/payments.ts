import { apiClient } from './client';
import { Payment, PaymentStatus } from '@/types/payment';
import { PaginatedResponse, PaginationParams } from './pagination';

export interface CreatePaymentDto {
  projectId: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status?: PaymentStatus;
  paidDate?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  projectId?: string;
  milestone?: string;
  amount?: number;
  dueDate?: string;
  status?: PaymentStatus;
  paidDate?: string;
  notes?: string;
}

export interface PaymentListParams extends PaginationParams {
  projectId?: string;
  status?: PaymentStatus;
  search?: string;
  dueDate?: string;
}

const normalizePaymentList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

// Transform backend response to frontend Payment type
const transformPayment = (data: any): Payment => {
  return {
    id: data.id,
    projectId: data.projectId,
    projectName: data.project?.name || '',
    milestone: data.milestone,
    amount: data.amount ? parseFloat(data.amount.toString()) : 0,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
    status: data.status as PaymentStatus,
    paidDate: data.paidDate ? new Date(data.paidDate).toISOString().split('T')[0] : undefined,
    notes: data.notes || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const paymentsApi = {
  async getPage(params: PaymentListParams = {}): Promise<PaginatedResponse<Payment>> {
    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.dueDate) searchParams.set('dueDate', params.dueDate);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const data = await apiClient.get<PaginatedResponse<any>>(`/payments${query ? `?${query}` : ''}`);

    return {
      ...data,
      items: data.items.map(transformPayment),
    };
  },

  async getAll(projectId?: string): Promise<Payment[]> {
    const endpoint = projectId ? `/payments?projectId=${projectId}` : '/payments';
    const data = await apiClient.get<any>(endpoint);
    return normalizePaymentList(data).map(transformPayment);
  },

  async bulkCreate(payments: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return await apiClient.post<any>('/payments/bulk', { payments });
  },

  async getById(id: string): Promise<Payment> {
    const data = await apiClient.get<any>(`/payments/${id}`);
    return transformPayment(data);
  },

  async create(payment: CreatePaymentDto): Promise<Payment> {
    const data = await apiClient.post<any>('/payments', payment);
    return transformPayment(data);
  },

  async update(id: string, payment: UpdatePaymentDto): Promise<Payment> {
    const data = await apiClient.patch<any>(`/payments/${id}`, payment);
    return transformPayment(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },
};


