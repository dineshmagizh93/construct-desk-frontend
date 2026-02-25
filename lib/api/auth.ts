import { apiClient } from './client';

export interface LoginResponse {
  access_token?: string;
  mustChangePassword?: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    companyId?: string;
  };
  company?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterDto {
  companyName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export const authApi = {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(data: RegisterDto): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/request-password-reset', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },

  async approveUser(userId: string, companyId: string, approved: boolean): Promise<{ message: string; user: any }> {
    return apiClient.post<{ message: string; user: any }>('/auth/approve-user', {
      userId,
      companyId,
      approved,
    });
  },
};


