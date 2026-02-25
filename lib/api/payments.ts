import { apiClient } from './client';
import { Payment, PaymentStatus } from '@/types/payment';

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
  async getAll(projectId?: string): Promise<Payment[]> {
    const endpoint = projectId ? `/payments?projectId=${projectId}` : '/payments';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformPayment);
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


