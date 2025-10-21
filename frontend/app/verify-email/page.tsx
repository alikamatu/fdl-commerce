"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    if (token) {
      handleVerification(token);
    } else {
      setStatus('idle');
      setMessage('No verification token found. Please check your email for the verification link.');
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email address...');
      
      await verifyEmail(verificationToken);
      
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now log in to your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. The link may have expired or is invalid.');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setResendLoading(true);
      setMessage('Sending verification email...');
      
      await resendVerification(resendEmail);
      
      setMessage('Verification email sent! Please check your inbox.');
      setResendEmail('');
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
      
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Verifying Your Email</h1>
            <p className="text-foreground/70">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Email Verified!</h1>
            <p className="text-foreground/70 mb-6">{message}</p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
              >
                Continue to Login
                <ArrowRight size={20} />
              </button>
              <p className="text-sm text-foreground/50">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="text-red-500" size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Verification Failed</h1>
            <p className="text-foreground/70 mb-6">{message}</p>
            
            {/* Resend Verification Form */}
            <div className="bg-foreground/5 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Resend Verification Email
              </h3>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {resendLoading && (
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  )}
                  Send Verification Email
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full border border-foreground/20 text-foreground py-3 px-4 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-foreground/60 hover:text-foreground transition-colors"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Mail className="text-foreground/60" size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Verify Your Email</h1>
            <p className="text-foreground/70 mb-6">{message}</p>
            
            {/* Resend Verification Form */}
            <div className="bg-foreground/5 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Need a new verification email?
              </h3>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {resendLoading && (
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  )}
                  Send Verification Email
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full border border-foreground/20 text-foreground py-3 px-4 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-foreground/60 hover:text-foreground transition-colors"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-foreground/5 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your App</h1>
          <p className="text-foreground/60 mt-2">Email Verification</p>
        </div>

        {/* Main Content */}
        <div className="bg-background rounded-2xl shadow-xl p-8 border border-foreground/10">
          {renderContent()}
        </div>

        {/* Status Message */}
        {message && status !== 'loading' && status !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-foreground/5 border border-foreground/10"
          >
            <p className="text-foreground/80 text-center text-sm">{message}</p>
          </motion.div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-foreground/50 text-sm">
            Need help?{" "}
            <a 
              href="mailto:support@yourapp.com" 
              className="text-foreground hover:underline transition-colors"
            >
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}