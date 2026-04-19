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

let companyMeCache: Company | null = null;
let companyMeCacheTimestamp = 0;
let companyMeRequestInFlight: Promise<Company> | null = null;
const COMPANY_ME_CACHE_DURATION = 60 * 1000;

export const companyApi = {
  async getMe(): Promise<Company> {
    const now = Date.now();
    if (companyMeCache && now - companyMeCacheTimestamp < COMPANY_ME_CACHE_DURATION) {
      return companyMeCache;
    }

    if (!companyMeRequestInFlight) {
      companyMeRequestInFlight = apiClient.get<Company>('/company/me');
    }

    try {
      const company = await companyMeRequestInFlight;
      companyMeCache = company;
      companyMeCacheTimestamp = now;
      return company;
    } finally {
      companyMeRequestInFlight = null;
    }
  },

  async update(data: UpdateCompanyDto): Promise<Company> {
    const updated = await apiClient.put<Company>('/company', data);
    companyMeCache = updated;
    companyMeCacheTimestamp = Date.now();
    return updated;
  },

  async getUsageStats(): Promise<PlanUsageStats> {
    return apiClient.get<PlanUsageStats>('/company/usage');
  },
}
