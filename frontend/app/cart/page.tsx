'use client';

import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { CartItemsList } from '@/components/cart/CartItemsList';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';

export default function CartPage() {
  const { cart } = useCart();

  return (
    <main className="min-h-screen bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light text-foreground mb-4">
            Your Shopping Cart
          </h1>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Review your items and proceed to checkout when you&apos;re ready
          </p>
        </motion.div>

        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Takes 2/3 on large screens */}
            <div className="lg:col-span-2">
              <CartItemsList />
            </div>

            {/* Cart Summary - Takes 1/3 on large screens */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}