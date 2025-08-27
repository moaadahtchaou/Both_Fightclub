import React, { createContext, useContext, type ReactNode } from 'react';
import { 
  useLogoutMutation, 
  useVerifyTokenQuery, 
  useUseCredits,
  useUser
} from '../hooks/useAuth';

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  useCredits: (amount: number, description?: string) => Promise<{ success: boolean; remainingCredits?: number; message?: string }>;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated, hasPermission, isAdmin } = useUser();
  const logoutMutation = useLogoutMutation();
  const useCreditsMutation = useUseCredits();
  const { refetch: refetchUser } = useVerifyTokenQuery();

  // Input validation and sanitization
  const validateInput = (input: string, type: 'username' | 'password'): { isValid: boolean; message?: string } => {
    if (!input || input.trim().length === 0) {
      return { isValid: false, message: `${type} is required` };
    }

    if (type === 'username') {
      // Username validation: 3-30 characters, alphanumeric and special chars
      const usernameRegex = /^[a-zA-Z0-9#_.-]{3,30}$/;
      if (!usernameRegex.test(input)) {
        return { 
          isValid: false, 
          message: 'Username must be 3-30 characters and contain only letters, numbers, #, _, ., -' 
        };
      }
    }

    if (type === 'password') {
      // Password validation: minimum 6 characters
      if (input.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
      }
      if (input.length > 128) {
        return { isValid: false, message: 'Password is too long' };
      }
    }

    return { isValid: true };
  };



  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Validate inputs
      const usernameValidation = validateInput(username, 'username');
      if (!usernameValidation.isValid) {
        return { success: false, message: usernameValidation.message };
      }

      const passwordValidation = validateInput(password, 'password');
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message };
      }





      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Network error. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    try {
      const result = await refetchUser();
      return !!result.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const useCredits = async (amount: number, description?: string): Promise<{ success: boolean; remainingCredits?: number; message?: string }> => {
    try {
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      if (amount <= 0 || !Number.isInteger(amount)) {
        return { success: false, message: 'Invalid credit amount' };
      }

      const result = await useCreditsMutation.mutateAsync({ amount, description });
      return { success: true, remainingCredits: result.remainingCredits };
    } catch (error) {
      console.error('Use credits error:', error);
      const message = error instanceof Error ? error.message : 'Network error';
      return { success: false, message };
    }
  };

  const refreshUser = async (): Promise<void> => {
    await refetchUser();
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    verifyToken,
    useCredits,
    hasPermission,
    isAdmin,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};