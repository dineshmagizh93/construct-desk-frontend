import { apiClient } from './client';

export interface AdminDashboardStats {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    trialCompanies: number;
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalRevenue: {
      estimated: number;
      currency: string;
      note?: string;
    };
  };
  storage: {
    physical: {
      used: number;
      limit: number;
      available: number;
      usagePercent: number;
      status: 'OK' | 'WARNING' | 'CRITICAL';
    };
    virtual: {
      sold: number;
      used: number;
      oversellRatio: number;
    };
    alert?: string;
  };
  plans: Record<string, {
    count: number;
    active: number;
    trial: number;
    revenue?: number;
  }>;
  recentOnboardings: Array<{
    id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    createdAt: string;
    _count: {
      users: number;
      projects: number;
    };
  }>;
  usage: {
    average: {
      users: number;
      projects: number;
      storage: number;
    };
    total: {
      users: number;
      projects: number;
      storage: number;
    };
  };
  timestamp: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  _count: {
    projects: number;
    users: number;
    documents: number;
  };
  usage?: {
    users: { current: number; limit: number; percentage: number };
    projects: { current: number; limit: number; percentage: number };
    storage: { current: number; limit: number; percentage: number };
  };
}

export const adminApi = {
  getDashboard: (): Promise<AdminDashboardStats> => 
    apiClient.get('/admin/dashboard'),

  getCompanies: (filters?: {
    plan?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    companies: Company[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => 
    apiClient.get('/admin/companies', { params: filters }),

  getCompanyDetails: (id: string): Promise<Company & {
    projects: Array<{
      id: string;
      name: string;
      status: string;
      progress: number;
      createdAt: string;
    }>;
    _count: {
      tasks: number;
    };
    usage: {
      users: { current: number; limit: number; percentage: number };
      projects: { current: number; limit: number; percentage: number };
      storage: { current: number; limit: number; percentage: number };
    };
    storageInfo: {
      baseStorage: number;
      extraStorage: number;
      totalLimit: number;
      used: number;
      available: number;
      usagePercent: number;
    };
  }> => 
    apiClient.get(`/admin/companies/${id}`),

  getPlanAnalytics: (): Promise<Record<string, {
    count: number;
    active: number;
    trial: number;
    revenue: number;
  }>> => 
    apiClient.get('/admin/analytics/plans'),

  getUsageAnalytics: (): Promise<{
    average: {
      users: number;
      projects: number;
      storage: number;
    };
    total: {
      users: number;
      projects: number;
      storage: number;
    };
  }> => 
    apiClient.get('/admin/analytics/usage'),

  getOnboardings: (limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    createdAt: string;
    _count: {
      users: number;
      projects: number;
    };
  }>> => 
    apiClient.get(`/admin/analytics/onboardings?limit=${limit}`),

  getStorageStats: (): Promise<{
    physical: {
      used: number;
      limit: number;
      available: number;
      usagePercent: number;
      status: 'OK' | 'WARNING' | 'CRITICAL';
    };
    virtual: {
      sold: number;
      used: number;
      oversellRatio: number;
    };
    alert?: string;
  }> => 
    apiClient.get('/admin/storage'),
};
