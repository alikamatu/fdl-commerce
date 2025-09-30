"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const EmptyCart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-foreground/5 rounded-full">
            <ShoppingBag size={48} className="text-foreground/40" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-light text-foreground mb-4">
          Your cart is empty
        </h2>
        <p className="text-foreground/60 mb-8">
          Start building your elite collection by adding some amazing finds to your cart.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </a>
          <a
            href="/products?category=trading-cards"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
          >
            Browse Trading Cards
          </a>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-foreground/10">
          <p className="text-sm text-foreground/60 mb-4">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Trading Cards', 'Toys', 'Sports Cards', 'Collectibles'].map((category) => (
              <a
                key={category}
                href={`/products?category=${category.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};