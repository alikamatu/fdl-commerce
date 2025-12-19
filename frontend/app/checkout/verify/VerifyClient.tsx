'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyClient() {
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/paystack/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reference: paymentReference }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment verified successfully! Your order has been confirmed.');

          localStorage.removeItem('cart');

          setTimeout(() => {
            router.replace(`/orders/${data.data._id}`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      } catch {
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
        {status === 'loading' && <p>{message}</p>}
        {status === 'success' && <p className="text-green-600">{message}</p>}
        {status === 'error' && (
          <>
            <p className="text-red-600">{message}</p>
            <Link href="/cart">Back to Cart</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}