"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store the token and redirect
      localStorage.setItem('token', token);
      
      // Fetch user profile
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(userData => {
          localStorage.setItem('user', JSON.stringify(userData));
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        })
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
          setStatus('error');
          setMessage('Failed to complete authentication');
        });
    } else {
      setStatus('error');
      setMessage('No authentication token found');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Authenticating
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Success!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}