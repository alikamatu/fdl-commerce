"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutAuth } from '@/components/checkout/CheckoutAuth';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type CheckoutStep = 'auth' | 'checkout' | 'complete';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>(user ? 'checkout' : 'auth');
  const [order, setOrder] = useState<any>(null);

  const handleAuthSuccess = () => {
    setStep('checkout');
  };

  const handleContinueAsGuest = () => {
    setStep('checkout');
  };

  const handleOrderComplete = (orderData: any) => {
    setOrder(orderData);
    setStep('complete');
  };

  if (cart.items.length === 0 && step !== 'complete') {
    return (
      <div className="min-h-screen bg-foreground/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Your cart is empty</h1>
          <p className="text-foreground/60 mb-6">Add some items to your cart before checking out</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-light text-foreground">
            {step === 'auth' && 'Sign In to Checkout'}
            {step === 'checkout' && 'Checkout'}
            {step === 'complete' && 'Order Confirmation'}
          </h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {step === 'auth' && (
            <CheckoutAuth
              onSuccess={handleAuthSuccess}
              onContinueAsGuest={handleContinueAsGuest}
            />
          )}

          {step === 'checkout' && (
            <CheckoutForm
              user={user}
              onOrderComplete={handleOrderComplete}
            />
          )}

          {step === 'complete' && order && (
            <OrderConfirmation order={order} />
          )}
        </div>
      </div>
    </div>
  );
}