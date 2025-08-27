import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface User {
  id: string;
  username: string;
  role: string;
  credits: number;
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  totalCreditsUsed: number;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  msg?: string;
}

interface VerifyResponse {
  success: boolean;
  user?: User;
}

interface UseCreditsRequest {
  amount: number;
  description?: string;
}

interface UseCreditsResponse {
  success: boolean;
  remainingCredits?: number;
  msg?: string;
}

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  verify: () => [...authKeys.all, 'verify'] as const,
};

// Custom hooks for authentication
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Login failed');
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.verify() });
      }
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(buildApiUrl(API_ENDPOINTS.LOGOUT), {
            method: 'POST',
            headers: getAuthHeaders(),
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    },
    onMutate: async () => {
      // Optimistic update: immediately clear user data
      localStorage.removeItem('token');
      queryClient.setQueryData(authKeys.verify(), null);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.verify() });
    },
    onSettled: () => {
      // Clear all queries to ensure clean state
      queryClient.clear();
    },
  });
};

export const useVerifyTokenQuery = () => {
  return useQuery({
    queryKey: authKeys.verify(),
    queryFn: async (): Promise<User | null> => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERIFY), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        throw new Error('Token verification failed');
      }

      const data: VerifyResponse = await response.json();
      
      if (data.success && data.user) {
        return data.user;
      }
      
      localStorage.removeItem('token');
      return null;
    },
    retry: (failureCount, error) => {
      // Don't retry if token is invalid
      if (error instanceof Error && error.message.includes('Token verification failed')) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: !!localStorage.getItem('token'), // Only run if token exists
  });
};

export const useUseCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: UseCreditsRequest): Promise<UseCreditsResponse> => {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.USE_CREDITS), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to use credits');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Update user data in cache
        queryClient.setQueryData(authKeys.verify(), (oldData: User | null) => {
          if (oldData && data.remainingCredits !== undefined) {
            return { ...oldData, credits: data.remainingCredits };
          }
          return oldData;
        });
      }
    },
  });
};

// Helper hooks
export const useUser = () => {
  const { data: user, isLoading, error } = useVerifyTokenQuery();
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    hasPermission: (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission) || user.role === 'admin';
    },
    isAdmin: () => user?.role === 'admin' || false,
  };
};