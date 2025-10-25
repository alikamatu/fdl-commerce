'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in and is admin
  useEffect(() => {
    if (user && isAdmin) {
      router.push('/dashboard');
    } else if (user && !isAdmin) {
      setTimeout(() => {
        setError('Access denied. Admin privileges required.');
      }, 1000);
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      
      // Check if user has admin role after login
      const token = localStorage.getItem('token');
      if (token) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
          }
          // If admin, redirect to dashboard
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
      // Logout if user doesn't have admin privileges
      if (err.message.includes('Access denied')) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto rounded-full flex items-center justify-center">
            <img src="/logo/fdll.jpeg" alt="Forbes Logo" className="h-16 w-auto rounded-lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forbes Digital LifeLine
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Admin Dashboard Access
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
            className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${
                error.includes('Access denied') ? 'bg-red-100 border-red-400 text-red-700' : ''
              }`}
              initial={{ opacity: 0, transition: { duration: 5.3 } }}
              animate={{ opacity: 1, transition: { duration: 1.7 } }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Only users with admin role can access this dashboard.</p>
          </div>
        </form>
      </div>
    </div>
  );
}