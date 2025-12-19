
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CreditCard, Banknote, Loader } from 'lucide-react';
import { PaystackConfig } from '@/types/paystack';

interface PaystackButtonProps {
  email: string;
  amount: number;
  onSuccess: (response: any) => void;
  onClose: () => void;
  metadata?: {
    orderId?: string;
    userId?: string;
    cartItems?: any[];
    deliveryMethod?: string;
  };
  className?: string;
  disabled?: boolean;
  currency?: 'GHS' | 'NGN' | 'USD';
}


declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, any>;
        callback?: (response: any) => void;
        onClose?: () => void;
        channels?: string[];
      }) => {
        openIframe: () => void;
      };
    };
  }
}


export default function PaystackButton({
  email,
  amount,
  onSuccess,
  onClose,
  metadata = {},
  className = '',
  disabled = false,
  currency = 'GHS',
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReference = () => {
    return `paystack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const convertToSmallestUnit = (amountInCedis: number): number => {
    // Paystack expects amount in smallest unit
    // For GHS: 1 GHS = 100 pesewas
    // For NGN: 1 NGN = 100 kobo
    // For USD: 1 USD = 100 cents
    return Math.round(amountInCedis * 100);
  };

const handlePayment = () => {
  if (disabled || loading) return;

  setLoading(true);
  setError(null);

  // Check if Paystack is available
  if (typeof window === 'undefined' || !window.PaystackPop) {
    setError('Payment service is not available. Please try again later.');
    setLoading(false);
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
  if (!publicKey) {
    setError('Payment configuration error. Please contact support.');
    setLoading(false);
    return;
  }

  try {
    const amountInPesewas = convertToSmallestUnit(amount);
    const reference = generateReference();

    // Create a clean config without duplicate properties
const config = {
  key: publicKey!,
  email,
  amount: amountInPesewas,
  currency,
  ref: reference,
  metadata: {
    custom_fields: [
      {
        display_name: "Order ID",
        variable_name: "order_id",
        value: metadata.orderId || 'N/A',
      },
      {
        display_name: "User ID",
        variable_name: "user_id",
        value: metadata.userId || 'N/A',
      },
      {
        display_name: "Delivery Method",
        variable_name: "delivery_method",
        value: metadata.deliveryMethod || 'delivery',
      },
    ],
  },
  callback: function(response: any) {
    setLoading(false);
    console.log('Paystack response:', response);
    
    if (response.status === 'success') {
      onSuccess(response);
    } else {
      setError('Payment failed: ' + response.message);
    }
  },
  onClose: function() {
    setLoading(false);
    onClose();
  },
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
};

    // Log the config to debug
    console.log('Paystack config:', {
      ...config,
      key: '***masked***' // Don't log the full key
    });

    // Initialize Paystack payment
    const handler = window.PaystackPop.setup(config);
    handler.openIframe();
  } catch (err) {
    console.error('Paystack payment error:', err);
    setError('Failed to initialize payment. Please try again.');
    setLoading(false);
  }
};

  const getPaymentChannels = () => {
    // Define available payment channels for Ghana
    return 'card, bank, ussd, qr, mobile_money, bank_transfer';
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing Payment...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-3">
        <Smartphone size={20} />
        <span>Pay with Paystack</span>
      </div>
    );
  };

  return (
    <div className="w-full">
      <motion.button
        onClick={handlePayment}
        disabled={disabled || loading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`w-full py-4 px-6 bg-gradient-to-r from-[#0A4E93] to-[#00B74F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {renderButtonContent()}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-800 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Payment Methods Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700 font-medium mb-3">
          Available Payment Methods:
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-600">Card</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Mobile Money</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Banknote size={16} className="text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">Bank Transfer</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          You will be redirected to a secure Paystack payment page.
        </p>
      </div>

      {/* Payment Security Info */}
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-900 text-sm">Secure Payment</h4>
            <p className="text-green-800 text-xs mt-1">
              Your payment information is encrypted and secure. We do not store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}