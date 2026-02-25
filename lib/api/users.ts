import { apiClient } from './client';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'user';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  role?: 'admin' | 'user';
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
  phone?: string;
}

// Transform backend response to frontend User type
const transformUser = (data: any): User => {
  return {
    id: data.id,
    name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const usersApi = {
  async getMe(): Promise<User> {
    const data = await apiClient.get<any>('/user/me');
    return transformUser(data);
  },

  async getAll(includeInactive: boolean = false): Promise<User[]> {
    const endpoint = includeInactive ? '/user/all?includeInactive=true' : '/user/all';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformUser);
  },

  async getById(id: string): Promise<User> {
    const data = await apiClient.get<any>(`/user/${id}`);
    return transformUser(data);
  },

  async create(user: CreateUserDto): Promise<User> {
    const data = await apiClient.post<any>('/user', user);
    return transformUser(data);
  },

  async update(id: string, user: UpdateUserDto): Promise<User> {
    const data = await apiClient.patch<any>(`/user/${id}`, user);
    return transformUser(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/user/${id}`);
  },
};

