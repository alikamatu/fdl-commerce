'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No authentication token found');
      return;
    }

    localStorage.setItem('token', token);

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
        setTimeout(() => router.replace('/dashboard'), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to complete authentication');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        {status === 'loading' && <p>{message}</p>}
        {status === 'success' && <p className="text-green-600">{message}</p>}
        {status === 'error' && (
          <>
            <p className="text-red-600">{message}</p>
            <button onClick={() => router.push('/login')}>Back to Login</button>
          </>
        )}
      </motion.div>
    </div>
  );
}