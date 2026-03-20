import { apiClient } from './client';
import { Expense, ExpenseCategory } from '@/types/expense';

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
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const expensesApi = {
  async getAll(projectId?: string): Promise<Expense[]> {
    const endpoint = projectId ? `/expenses?projectId=${projectId}` : '/expenses';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformExpense);
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
};


