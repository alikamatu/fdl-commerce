"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Separate component that uses useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { resetPassword } = useAuth();

  useEffect(() => {
    console.log('Token from URL:', token); // Debug log
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) {
      setStatus('error');
      setMessage('Reset token is missing');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Resetting your password...');
      
      console.log('Sending reset request with token:', token); // Debug log
      await resetPassword(token, formData.password);
      
      setStatus('success');
      setMessage('Your password has been successfully reset! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Reset password error:', error); // Debug log
      setStatus('error');
      setMessage(error.message || 'Failed to reset password. The link may have expired or is invalid.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            <h1 className="text-2xl font-bold text-foreground mb-4">Resetting Password</h1>
            <p className="text-foreground/70">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Password Reset!</h1>
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
            <h1 className="text-2xl font-bold text-foreground mb-4">Reset Failed</h1>
            <p className="text-foreground/70 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full border border-foreground/20 text-foreground py-3 px-4 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Lock className="text-foreground/60" size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Set New Password</h1>
            <p className="text-foreground/70 mb-6">Enter your new password below</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2 text-left">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 ${
                      errors.password ? 'border-red-500' : 'border-foreground/20'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 text-left">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-2 text-left">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-foreground/20'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 text-left">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
              >
                Reset Password
              </button>
            </form>
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
          <h1 className="text-3xl font-bold text-foreground">AllMapHostels</h1>
          <p className="text-foreground/60 mt-2">Reset Password</p>
        </div>

        {/* Main Content */}
        <div className="bg-background rounded-2xl shadow-xl p-8 border border-foreground/10">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}