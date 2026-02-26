// API Configuration
// Use environment variable with fallback for development
// In production, NEXT_PUBLIC_API_URL must be set in Vercel environment variables
const getApiBaseUrl = () => {
  // Check if we're in production and have the env var set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to localhost for development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  
  // If in production but no env var, show error
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.error(
      '❌ NEXT_PUBLIC_API_URL is not set! ' +
      'Please set it in Vercel environment variables to your Render backend URL.'
    );
  }
  
  return 'http://localhost:3001/api';
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
