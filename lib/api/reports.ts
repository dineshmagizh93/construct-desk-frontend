import { apiClient } from './client';

export interface FinancialSummary {
  payments: {
    paid: { count: number; amount: number };
    pending: { count: number; amount: number };
    overdue: { count: number; amount: number };
    total: { count: number; amount: number };
  };
  expenses: {
    total: number;
    count: number;
    byCategory: Record<string, number>;
  };
  netProfit: number;
}

export interface ProjectSummary {
  total: number;
  byStatus: {
    Planning: number;
    'In Progress': number;
    'On Hold': number;
    Completed: number;
  };
  totalBudget: number;
  totalActual: number;
  avgProgress: number;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    estimatedBudget: number;
    actualBudget: number;
    totalPayments: number;
    totalExpenses: number;
  }>;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  byCategory: Record<string, number>;
}

export interface PaymentSummary {
  paid: { count: number; amount: number };
  pending: { count: number; amount: number };
  overdue: { count: number; amount: number };
  total: { count: number; amount: number };
}

export const reportsApi = {
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiClient.get<FinancialSummary>(`/reports/financial-summary${query ? `?${query}` : ''}`);
  },

  async getProjectSummary(): Promise<ProjectSummary> {
    return apiClient.get<ProjectSummary>('/reports/project-summary');
  },

  async getExpenseSummary(startDate?: string, endDate?: string): Promise<ExpenseSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiClient.get<ExpenseSummary>(`/reports/expense-summary${query ? `?${query}` : ''}`);
  },

  async getPaymentSummary(startDate?: string, endDate?: string): Promise<PaymentSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiClient.get<PaymentSummary>(`/reports/payment-summary${query ? `?${query}` : ''}`);
  },
};

