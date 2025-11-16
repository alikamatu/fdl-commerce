"use client";

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartSummaryProps {
  onCheckout?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ onCheckout }) => {
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const subtotal = (cart.subtotal / 100).toFixed(2);
  const total = (cart.total / 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Order Summary */}
      <div className="border border-foreground/10 rounded-lg p-6 bg-background">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Order Summary
        </h2>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-foreground/80">
            <span>Subtotal [{cart.itemCount} item(s)]</span>
            <span>GH₵ {subtotal}</span>
          </div>

          <div className="flex justify-between text-foreground/80">
            <span>Pick Up / Delivery</span>
            <span>Free</span>
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <div className="flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>GH₵ {total}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => router.push('/checkout')}
          disabled={cart.items.length === 0 || !user}
          className="w-full mt-6 py-4 bg-foreground text-background cursor-pointer rounded-lg font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {!user && ('Sign in to Proceed' )}
          {user && ('Proceed to Checkout')}
          <ArrowRight size={16} />
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mb-2">
            <Shield size={16} />
            <span>Secure checkout</span>
          </div>
          <span className="text-xs text-foreground/40">
            <div className="mb-4 text-sm text-foreground/70">
          Proceeding to checkout means you have read and accepted our{' '}
          <Link href="/terms" target="_blank" className="text-blue-700 hover:underline font-medium">
            Return Policy
          </Link>{' '}
          having considered our{' '}
          <Link href="/faqs" target="_blank" className="text-blue-700 hover:underline font-medium">
            FAQs
          </Link>.
        </div>
          </span>
        </div>
      </div>
    </motion.div>
  );
};