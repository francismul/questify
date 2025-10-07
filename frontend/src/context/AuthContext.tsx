'use client';

import React, { createContext, useContext, ReactNode, useOptimistic, useTransition } from 'react';
import { User } from '@/lib/auth-server';
import { loginAction, registerAction, logoutAction } from '@/lib/auth-actions';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string, role: 'student' | 'teacher') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const [isPending, startTransition] = useTransition();
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    initialUser,
    (state: User | null, newUser: User | null) => newUser
  );

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await loginAction(email, password);
          
          if (result.success) {
            // The server action will handle the redirect
            // but we can optimistically update the state
            setOptimisticUser(null); // Will be updated after redirect
          }
          
          resolve(result);
        } catch (error) {
          console.error('Login error:', error);
          resolve({
            success: false,
            error: 'An unexpected error occurred during login',
          });
        }
      });
    });
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'student' | 'teacher'
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await registerAction(email, password, firstName, lastName, role);
          
          if (result.success) {
            // The server action will handle the redirect
            // but we can optimistically update the state
            setOptimisticUser(null); // Will be updated after redirect
          }
          
          resolve(result);
        } catch (error) {
          console.error('Registration error:', error);
          resolve({
            success: false,
            error: 'An unexpected error occurred during registration',
          });
        }
      });
    });
  };

  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          setOptimisticUser(null);
          await logoutAction();
          resolve();
        } catch (error) {
          console.error('Logout error:', error);
          resolve();
        }
      });
    });
  };

  const contextValue: AuthContextType = {
    user: optimisticUser,
    isLoading: isPending,
    isAuthenticated: !!optimisticUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};