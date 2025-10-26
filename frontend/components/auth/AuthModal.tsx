"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

type ViewType = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'success';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(defaultTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { 
    login, 
    register, 
    loading: authLoading,
    forgotPassword,
    resetPassword,
  } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setCurrentView(defaultTab);
      setFormData({ name: '', email: '', password: '', confirmPassword: '', resetToken: '' });
      setErrors({});
      setSuccessMessage('');
      setAcceptedTerms(false);
    }
  }, [isOpen, defaultTab]);

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLetter) return 'Password must contain at least one letter';
    if (!hasNumber) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (currentView === 'login' || currentView === 'register' || currentView === 'forgot-password') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }

    if (currentView === 'login' || currentView === 'register') {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (currentView === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        const confirmPasswordError = validatePassword(formData.confirmPassword);
        if (confirmPasswordError) {
          newErrors.confirmPassword = confirmPasswordError;
        }
      }

      // Terms validation for registration
      if (!acceptedTerms) {
        newErrors.terms = 'You must accept the terms and conditions';
      }
    }

    if (currentView === 'reset-password') {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        const confirmPasswordError = validatePassword(formData.confirmPassword);
        if (confirmPasswordError) {
          newErrors.confirmPassword = confirmPasswordError;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      switch (currentView) {
        case 'login':
          await login(formData.email, formData.password);
          onClose();
          break;
        
        case 'register':
          await register(formData.email, formData.password, formData.name);
          setSuccessMessage('Registration successful! Please check your email to verify your account. If you do not see it, check your spam folder.');
          setCurrentView('success');
          break;
        
        case 'forgot-password':
          await forgotPassword(formData.email);
          setSuccessMessage('Password reset instructions have been sent to your email.');
          setCurrentView('success');
          break;
        
        case 'reset-password':
          await resetPassword(formData.resetToken, formData.password);
          setSuccessMessage('Password reset successful! You can now login with your new password.');
          setCurrentView('success');
          break;
      }
      
      // Reset form on success (except for success view)
      if (currentView !== 'success') {
        setFormData({ name: '', email: '', password: '', confirmPassword: '', resetToken: '' });
        setErrors({});
        setAcceptedTerms(false);
      }
    } catch (error: any) {
      // Handle specific error messages from the backend
      if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const handleBack = () => {
    if (currentView === 'forgot-password' || currentView === 'reset-password') {
      setCurrentView('login');
    } else if (currentView === 'success') {
      setCurrentView('login');
    } else {
      setCurrentView('login');
    }
    setErrors({});
  };

  const switchView = (view: ViewType) => {
    setCurrentView(view);
    setErrors({});
    setSuccessMessage('');
    setAcceptedTerms(false);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const renderHeader = () => {
    const titles = {
      'login': 'Sign In',
      'register': 'Create Account',
      'forgot-password': 'Reset Password',
      'reset-password': 'Set New Password',
      'verify-email': 'Verify Email',
      'success': 'Success'
    };

    return (
      <div className="px-8 pt-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 gap-3">
          <img src='/logo/fdll.jpeg' alt="Logo" className="rounded-lg w-16 h-16 object-contain" />
          <span className="text-xl font-semibold text-foreground hidden sm:block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Forbes Digital Lifeline
          </span>
        </div>

        {/* Back button for non-main views */}
        {(currentView === 'forgot-password' || currentView === 'reset-password' || currentView === 'success') && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        <div className="flex border-b border-foreground/10">
          {['login', 'register'].includes(currentView) ? (
            <>
              <button
                onClick={() => switchView('login')}
                className={`flex-1 pb-4 text-sm font-medium transition-colors ${
                  currentView === 'login'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchView('register')}
                className={`flex-1 pb-4 text-sm font-medium transition-colors ${
                  currentView === 'register'
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </>
          ) : (
            <div className="flex-1 pb-4 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {titles[currentView]}
              </h2>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessView = () => (
    <div className="px-8 py-6 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-500" size={48} />
      </div>
      <p className="text-foreground/80 mb-6">{successMessage}</p>
      <button
        onClick={handleBack}
        className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
      >
        Back to Login
      </button>
    </div>
  );

  const renderPasswordRequirements = () => (
    <div className="mb-4 p-3 bg-foreground/5 rounded-lg border border-foreground/10">
      <p className="text-sm font-medium text-foreground/80 mb-2">Password must contain:</p>
      <ul className="text-xs text-foreground/60 space-y-1">
        <li className="flex items-center">
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full mr-2"></span>
          At least 8 characters
        </li>
        <li className="flex items-center">
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full mr-2"></span>
          At least one letter (a-z, A-Z)
        </li>
        <li className="flex items-center">
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full mr-2"></span>
          At least one number (0-9)
        </li>
        <li className="flex items-center">
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full mr-2"></span>
          At least one special character (!@#$%^&* etc.)
        </li>
      </ul>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="px-8 py-6">
      {/* Success/Error Messages */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Name Field (Register only) */}
      {currentView === 'register' && (
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 ${
                errors.name ? 'border-red-500' : 'border-foreground/20'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
      )}

      {/* Email Field (All views except reset-password) */}
      {currentView !== 'reset-password' && (
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 ${
                errors.email ? 'border-red-500' : 'border-foreground/20'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      )}

      {/* Reset Token Field (Reset password only) */}
      {currentView === 'reset-password' && (
        <div className="mb-4">
          <label htmlFor="resetToken" className="block text-sm font-medium text-foreground/80 mb-2">
            Reset Token
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
            <input
              id="resetToken"
              type="text"
              value={formData.resetToken}
              onChange={(e) => handleInputChange('resetToken', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40"
              placeholder="Enter reset token from email"
            />
          </div>
        </div>
      )}

      {/* Password Requirements Info */}
      {(currentView === 'register' || currentView === 'reset-password') && renderPasswordRequirements()}

      {/* Password Field (Login, Register, Reset-password) */}
      {(currentView === 'login' || currentView === 'register' || currentView === 'reset-password') && (
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
            {currentView === 'reset-password' ? 'New Password' : 'Password'}
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
              placeholder={currentView === 'reset-password' ? "Enter new password" : "Enter your password"}
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
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
      )}

      {/* Confirm Password (Register and Reset-password) */}
      {(currentView === 'register' || currentView === 'reset-password') && (
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-2">
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
              placeholder="Confirm your password"
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
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Terms Acceptance (Register only) */}
      {currentView === 'register' && (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              className="mt-1 w-4 h-4 text-foreground border-foreground/20 rounded focus:ring-foreground/20 focus:ring-2"
            />
            <label htmlFor="terms" className="text-sm text-foreground/80 leading-tight">
              By signing in, you agree to Forbes Digital Lifeline{' '}
              <a href="/terms" target="_blank" className="text-blue-700 hover:underline font-medium">
                Conditions of Use
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-blue-700 hover:underline font-medium">
                Privacy Notice
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || authLoading || (currentView === 'register' && !acceptedTerms)}
        className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {(isLoading || authLoading) && (
          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
        )}
        {currentView === 'login' && 'Sign In'}
        {currentView === 'register' && 'Create Account'}
        {currentView === 'forgot-password' && 'Send Reset Instructions'}
        {currentView === 'reset-password' && 'Reset Password'}
      </button>

      {/* Additional Links */}
      <div className="mt-6 text-center text-sm text-foreground/60 space-y-3">
        {/* Forgot Password Link (Login only) */}
        {currentView === 'login' && (
          <div>
            <button
              type="button"
              onClick={() => switchView('forgot-password')}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Switch between Login/Register */}
        {currentView === 'login' && (
          <div>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => switchView('register')}
              className="text-blue-700 hover:underline font-medium"
            >
              Sign up
            </button>
          </div>
        )}

        {currentView === 'register' && (
          <div>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchView('login')}
              className="text-blue-700 hover:underline font-medium"
            >
              Continue
            </button>
          </div>
        )}

        {/* Back to login from forgot password */}
        {currentView === 'forgot-password' && (
          <div>
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => switchView('login')}
              className="text-foreground hover:underline font-medium"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </form>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-background rounded-2xl shadow-xl w-full max-w-md mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            {renderHeader()}

            {/* Content */}
            {currentView === 'success' ? renderSuccessView() : renderForm()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};