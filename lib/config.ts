// API Configuration
// Use environment variable with fallback for development
// In production, NEXT_PUBLIC_API_URL must be set in Vercel environment variables
const DEFAULT_API_URL = 'http://localhost:3001/api';

/** Ensure backend base URL always ends with /api (NestJS global prefix). */
const normalizeApiBaseUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_API_URL;
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
};

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }

  // Check if we're in browser
  if (typeof window !== 'undefined') {
    // Fallback to localhost for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return DEFAULT_API_URL;
    }

    // If in production but no env var, show error
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '❌ NEXT_PUBLIC_API_URL is not set! ' +
        'Please set it in Vercel environment variables to your Render backend URL.'
      );
    }

    return DEFAULT_API_URL;
  }

  return DEFAULT_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// Log in development to help debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[Config] API_BASE_URL:', API_BASE_URL);
}

// Get JWT token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Set JWT token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

// Remove JWT token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};
