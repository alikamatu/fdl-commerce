"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { setSessionExpiredCallback } from '@/lib/api-helper';

export const useSessionExpiry = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleSessionExpiry = useCallback(() => {
    console.log('Session expired, logging out user...');
    setSessionExpired(true);
    setShowMessage(true);
    logout();

    // Redirect to login after 2 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  useEffect(() => {
    // Register the session expiry callback
    setSessionExpiredCallback(handleSessionExpiry);

    return () => {
      setSessionExpiredCallback(() => {});
    };
  }, [handleSessionExpiry]);

  const dismissMessage = useCallback(() => {
    setShowMessage(false);
  }, []);

  return {
    sessionExpired,
    showMessage,
    dismissMessage,
  };
};
