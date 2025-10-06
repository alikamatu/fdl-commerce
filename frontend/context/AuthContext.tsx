"use client";
export const dynamic = "force-dynamic";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser({ ...JSON.parse(savedUser), token });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:1000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const userData: User = {
        id: data.user._id,
        email: data.user.email,
        name: data.user.displayName,
        token: data.token,
      };

      setUser(userData);

      if (typeof window !== "undefined") {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:1000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: name }),
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      const userData: User = {
        id: data.user._id,
        email: data.user.email,
        name: data.user.displayName,
        token: data.token,
      };

      setUser(userData);

      if (typeof window !== "undefined") {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
