import { API_BASE_URL, getAuthToken } from '../config';

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    // Ensure endpoint starts with / if it doesn't already
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${normalizedEndpoint}`;
    
    // Debug: Log the URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Request URL:', url);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle no content (204) - DELETE operations return 204
      if (response.status === 204) {
        return null as T;
      }

      // Check if response is HTML (likely a 404 page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw {
          message: 'Route not found. Please ensure the backend server is running and routes are registered.',
          statusCode: response.status,
        } as ApiError;
      }

      // For DELETE requests, handle empty or no response body
      if (options.method === 'DELETE') {
        const text = await response.text();
        if (!text || text.trim() === '') {
          // If response is OK, return null (successful deletion)
          if (response.ok) {
            return null as T;
          }
          // If not OK, we need to parse error, but body is empty, so throw generic error
          throw {
            message: `Delete operation failed with status ${response.status}`,
            statusCode: response.status,
          } as ApiError;
        }
        // If there's content, parse it
        try {
          const data = JSON.parse(text);
          if (!response.ok) {
            throw {
              message: data.message || `Delete operation failed`,
              statusCode: response.status,
              error: data.error,
            } as ApiError;
          }
          return data;
        } catch (parseError) {
          // If parsing fails but response is OK, assume success
          if (response.ok) {
            return null as T;
          }
          throw {
            message: `Delete operation failed with status ${response.status}`,
            statusCode: response.status,
          } as ApiError;
        }
      }

      // For non-DELETE requests, parse JSON normally
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          // For auth endpoints (login/register), show the actual backend error message
          // For protected endpoints, show authentication required message
          const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
          
          if (isAuthEndpoint) {
            // Show backend's actual error message (e.g., "Invalid credentials")
            throw {
              message: data.message || 'Invalid credentials. Please check your email and password.',
              statusCode: 401,
              error: data.error || 'Unauthorized',
            } as ApiError;
          } else {
            // For protected routes, show authentication required message
            throw {
              message: 'Authentication required. Please login first.',
              statusCode: 401,
              error: 'Unauthorized',
            } as ApiError;
          }
        }

        // Handle 404 Not Found
        if (response.status === 404) {
          throw {
            message: 'API endpoint not found. Please check if the backend server is running and routes are registered.',
            statusCode: 404,
            error: 'Not Found',
          } as ApiError;
        }

        const error: ApiError = {
          message: data.message || 'An error occurred',
          statusCode: response.status,
          error: data.error,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

