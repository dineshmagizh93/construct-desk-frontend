import { apiClient } from './client';
import { Expense, ExpenseCategory } from '@/types/expense';
import { PaginatedResponse, PaginationParams } from './pagination';

export interface CreateExpenseDto {
  projectId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  notes?: string;
  attachment?: string;
}

export interface UpdateExpenseDto {
  projectId?: string;
  category?: ExpenseCategory;
  amount?: number;
  date?: string;
  paidTo?: string;
  notes?: string;
  attachment?: string;
}

export interface ExpenseListParams extends PaginationParams {
  projectId?: string;
  category?: ExpenseCategory;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const normalizeExpenseList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

// Transform backend response to frontend Expense type
const transformExpense = (data: any): Expense => {
  return {
    id: data.id,
    projectId: data.projectId,
    projectName: data.project?.name || '',
    category: data.category as ExpenseCategory,
    amount: data.amount ? parseFloat(data.amount.toString()) : 0,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    paidTo: data.paidTo,
    notes: data.notes || undefined,
    attachment: data.attachment || undefined,
    approvalStatus: data.approvalStatus || 'pending',
    approvedBy: data.approvedBy || undefined,
    approvedAt: data.approvedAt || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const expensesApi = {
  async getPage(params: ExpenseListParams = {}): Promise<PaginatedResponse<Expense>> {
    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const data = await apiClient.get<PaginatedResponse<any>>(`/expenses${query ? `?${query}` : ''}`);

    return {
      ...data,
      items: data.items.map(transformExpense),
    };
  },

  async getAll(projectId?: string): Promise<Expense[]> {
    const endpoint = projectId ? `/expenses?projectId=${projectId}` : '/expenses';
    const data = await apiClient.get<any>(endpoint);
    return normalizeExpenseList(data).map(transformExpense);
  },

  async bulkCreate(expenses: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return await apiClient.post<any>('/expenses/bulk', { expenses });
  },

  async getById(id: string): Promise<Expense> {
    const data = await apiClient.get<any>(`/expenses/${id}`);
    return transformExpense(data);
  },

  async create(expense: CreateExpenseDto): Promise<Expense> {
    const data = await apiClient.post<any>('/expenses', expense);
    return transformExpense(data);
  },

  async update(id: string, expense: UpdateExpenseDto): Promise<Expense> {
    const data = await apiClient.patch<any>(`/expenses/${id}`, expense);
    return transformExpense(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  async approve(id: string): Promise<void> {
    await apiClient.patch(`/expenses/${id}/approve`, {});
  },

  async reject(id: string, reason?: string): Promise<void> {
    await apiClient.patch(`/expenses/${id}/reject`, { reason });
  },

  async getApprovalSummary(): Promise<{ pending: number; approved: number; rejected: number; totalPending: number }> {
    return apiClient.get("/expenses/meta/approval-summary");
  },

  async exportCsv(projectId?: string): Promise<string> {
    const query = projectId ? `?projectId=${projectId}` : "";
    return apiClient.get(`/expenses/export/csv${query}`);
  },
};


