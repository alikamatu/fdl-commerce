"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function PaystackVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      if (!reference && !trxref) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      try {
        const paymentReference = reference || trxref;
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/paystack/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reference: paymentReference }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment verified successfully! Your order has been confirmed.');
          
          // Clear cart
          localStorage.removeItem('cart');
          
          // Redirect to order confirmation after 3 seconds
          setTimeout(() => {
            router.push(`/orders/${data.data._id}`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Verifying Payment
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to your order...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/cart"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Cart
              </Link>
              <Link
                href="/orders"
                className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors ml-3"
              >
                View Orders
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}