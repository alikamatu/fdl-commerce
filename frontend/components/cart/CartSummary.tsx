"use client";

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartSummary: React.FC = () => {
  const { cart } = useCart();

  const subtotal = (cart.subtotal / 100).toFixed(2);
  const shipping = (cart.shipping / 100).toFixed(2);
  const taxes = (cart.taxes / 100).toFixed(2);
  const total = (cart.total / 100).toFixed(2);

  const isEligibleForFreeShipping = cart.subtotal >= 5000; // $50
  const freeShippingRemaining = ((5000 - cart.subtotal) / 100).toFixed(2);

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

        {/* Free Shipping Progress */}
        {!isEligibleForFreeShipping && cart.subtotal > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 text-sm mb-2">
              <Truck size={16} />
              <span>Add ${freeShippingRemaining} for free shipping!</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(cart.subtotal / 5000) * 100}%` }}
              />
            </div>
          </div>
        )}

        {isEligibleForFreeShipping && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <Truck size={16} />
              <span>You qualify for free shipping!</span>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-foreground/80">
            <span>Subtotal ({cart.itemCount} items)</span>
            <span>${subtotal}</span>
          </div>

          <div className="flex justify-between text-foreground/80">
            <span>Shipping</span>
            <span>{cart.shipping === 0 ? 'Free' : `$${shipping}`}</span>
          </div>

          <div className="flex justify-between text-foreground/80">
            <span>Taxes</span>
            <span>${taxes}</span>
          </div>

          <div className="border-t border-foreground/10 pt-3">
            <div className="flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          disabled={cart.items.length === 0}
          className="w-full mt-6 py-4 bg-foreground text-background rounded-lg font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Proceed to Checkout
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mb-2">
            <Shield size={16} />
            <span>Secure checkout</span>
          </div>
          <p className="text-xs text-foreground/40">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Trust Features */}
      <div className="border border-foreground/10 rounded-lg p-6 bg-background">
        <h3 className="font-semibold text-foreground mb-4">Benefits</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <Shield size={16} className="flex-shrink-0" />
            <span>Authenticity guaranteed on all items</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <RotateCcw size={16} className="flex-shrink-0" />
            <span>30-day hassle-free returns</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <Truck size={16} className="flex-shrink-0" />
            <span>Fast and secure shipping</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};