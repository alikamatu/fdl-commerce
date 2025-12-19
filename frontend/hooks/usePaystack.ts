import { PaystackConfig } from '@/types/paystack';
import { useEffect, useState } from 'react';

export interface PaystackPaymentData {
  reference: string;
  email: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
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

export function usePaystack() {
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded');
      setIsPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setError('Failed to load payment service');
      setIsPaystackLoaded(false);
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const generateReference = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `PSK_${timestamp}_${random}`;
  };

  const convertToSmallestUnit = (amount: number, currency: string): number => {
    // Convert amount to smallest unit
    switch (currency) {
      case 'GHS':
        return Math.round(amount * 100); // Convert to pesewas
      case 'NGN':
        return Math.round(amount * 100); // Convert to kobo
      case 'USD':
        return Math.round(amount * 100); // Convert to cents
      default:
        return Math.round(amount * 100);
    }
  };

  const initializePayment = async (
    paymentData: PaystackPaymentData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isPaystackLoaded) {
      return { success: false, error: 'Payment service not loaded yet' };
    }

    if (typeof window === 'undefined' || !window.PaystackPop) {
      return { success: false, error: 'Payment service not available' };
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      return { success: false, error: 'Payment configuration error' };
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      try {
        const amountInSmallestUnit = convertToSmallestUnit(
          paymentData.amount,
          paymentData.currency
        );

        const reference = paymentData.reference || generateReference();
        const config: PaystackConfig = {
          key: publicKey,
          email: paymentData.email,
          amount: amountInSmallestUnit,
          currency: paymentData.currency,
          ref: reference,
          reference: reference,
          metadata: paymentData.metadata,
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
          callback: (response: any) => {
            setLoading(false);
            console.log('Paystack response:', response);
            
            if (response.status === 'success') {
              resolve({ success: true });
            } else {
              setError('Payment was not successful');
              resolve({ success: false, error: 'Payment failed' });
            }
          },
          onClose: () => {
            setLoading(false);
            setError('Payment was cancelled');
            resolve({ success: false, error: 'Payment cancelled by user' });
          },
        };

        if (!window.PaystackPop) {
          throw new Error('PaystackPop is not available');
        }

        const handler = window.PaystackPop.setup(config);
        handler.openIframe();
      } catch (err) {
        console.error('Paystack initialization error:', err);
        setLoading(false);
        setError('Failed to initialize payment');
        resolve({ success: false, error: 'Initialization failed' });
      }
    });
  };

  return {
    isPaystackLoaded,
    loading,
    error,
    initializePayment,
    generateReference,
    convertToSmallestUnit,
  };
}