"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  className?: string;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const { googleLogin } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Load Google script
  useEffect(() => {
    const scriptId = 'google-signin-script';
    
    // Check if script already exists
    if (document.getElementById(scriptId)) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      console.error('Failed to load Google script');
      setScriptError(true);
    };
    
    document.head.appendChild(script);
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google || !googleButtonRef.current) return;

    try {
      // Clear previous content
      googleButtonRef.current.innerHTML = '';

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      });
    } catch (error) {
      console.error('Failed to initialize Google button:', error);
      setScriptError(true);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    
    try {
      await googleLogin(response.credential);
      onSuccess?.(response);
      window.location.reload();
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Google button container */}
      <div ref={googleButtonRef} className="w-full"></div>
      
      {/* Show error message if script fails to load */}
      {scriptError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">
            Google Sign-In unavailable. Please try refreshing the page or using email/password.
          </p>
        </div>
      )}
      
      {/* Show loading overlay when processing */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}