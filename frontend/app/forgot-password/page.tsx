"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'form' | 'loading' | 'success'>('form');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setStatus('loading');
      await forgotPassword(email);
      setStatus('success');
    } catch (error: any) {
      setStatus('form');
      setError(error.message || 'Failed to send reset email. Please try again.');
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
          <h1 className="text-3xl font-bold text-foreground">Forbes Digital LifeLine</h1>
          <p className="text-foreground/60 mt-2">Forgot Password</p>
        </div>

        {/* Main Content */}
        <div className="bg-background rounded-2xl shadow-xl p-8 border border-foreground/10">
          {status === 'success' ? (
            // Success State
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={40} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Check Your Email</h2>
              <p className="text-foreground/70 mb-6">
                If an account exists with <span className="font-medium text-foreground">{email}</span>, 
                you will receive a password reset link shortly.
              </p>
              <p className="text-sm text-foreground/60 mb-6">
                Please check your inbox and spam folder. The link will expire in 1 hour.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setStatus('form');
                    setEmail('');
                  }}
                  className="w-full border border-foreground/20 text-foreground py-3 px-4 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
                >
                  Try Another Email
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <div>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center">
                    <Mail className="text-foreground/60" size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Reset Your Password</h2>
                <p className="text-foreground/70 text-sm">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 ${
                        error ? 'border-red-500' : 'border-foreground/20'
                      }`}
                      placeholder="Enter your email"
                      disabled={status === 'loading'}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-foreground/50">
            Remember your password?{' '}
            <button
              onClick={() => router.push('/')}
              className="text-foreground hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}