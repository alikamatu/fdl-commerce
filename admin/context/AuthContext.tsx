// contexts/AuthContext.tsx - UPDATED UNIFIED VERSION
'use client';

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean }>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        
        console.log('Auth initialization - Stored user:', !!storedUser, 'Token:', !!token);
        
        if (storedUser && token) {
          // Validate token by making a test request
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/debug`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('Auth initialized successfully for user:', userData.email);
            } else {
              console.log('Token validation failed, clearing auth');
              clearAuthStorage();
            }
          } catch (error) {
            console.log('Token validation error, clearing auth:', error);
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  };

  const isAuthenticated = () => {
    return !!(user && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token')));
  };

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login response:', data);

      // Validate response structure
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Validate token format
      const tokenParts = data.access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format received from server');
      }

      // Store tokens and user
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        storage.setItem('refresh_token', data.refresh_token);
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      console.log('Login successful for user:', data.user.email);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      // Check localStorage first, then sessionStorage
      let token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!token) {
        console.log('No token found in storage');
        return null;
      }
      
      // Basic JWT format validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format, clearing storage');
        clearAuthStorage();
        setUser(null);
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    clearAuthStorage();
    setUser(null);
    router.push('/admin/login');
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.ok) {
        return await response.json();
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Auto-login after registration
    if (data.access_token && data.user) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      forgotPassword, 
      resetPassword, 
      getAccessToken,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}