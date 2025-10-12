"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
    }
  }, [isOpen, defaultTab]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
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
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        await register(formData.email, formData.password, formData.name);
        onClose();
      }
      
      // Reset form on success
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error('Authentication error:', error);
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
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrors({});
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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

            {/* Header with Tabs */}
            <div className="px-8 pt-8">
              <div className="flex border-b border-foreground/10">
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className={`flex-1 pb-4 text-sm font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6">
              {activeTab === 'register' && (
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

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
                  Password
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
                    placeholder="Enter your password"
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

              {activeTab === 'register' && (
                <div className="mb-6">
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

              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {(isLoading || authLoading) && (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                )}
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {/* Forgot Password Link */}
              {activeTab === 'login' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Switch Tab Prompt */}
              <div className="mt-6 text-center text-sm text-foreground/60">
                {activeTab === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('register')}
                      className="text-foreground hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="text-foreground hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};