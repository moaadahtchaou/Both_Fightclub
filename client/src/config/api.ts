// API Configuration for different environments

// Base URL configuration
const getBaseUrl = (): string => {
  // Allow overriding via environment for easy deploys
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl;
  }
  // In production (fallback), use the previous Vercel server if env not provided
  if (import.meta.env.PROD) {
    // return 'https://both-fightclub-serv.vercel.app/api';
    return 'https://both-fightclub.onrender.com/api';

  }
  // In development, use localhost with /api prefix
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // User authentication endpoints
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  USERS: '/users',
  
  // Media endpoints
  DOWNLOAD: '/download',
  UPLOAD: '/upload',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for making authenticated requests
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function for making API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetch(url, mergedOptions);
};