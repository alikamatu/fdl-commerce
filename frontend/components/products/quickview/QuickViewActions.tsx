'use client';

import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface QuickViewActionsProps {
  product: Product;
  isAddingToCart: boolean;
  onAddToCart: () => void;
}

export const QuickViewActions: React.FC<QuickViewActionsProps> = ({
  product,
  isAddingToCart,
  onAddToCart,
}) => {
  const price = (product.priceCents / 100).toFixed(2);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 border-t border-foreground/10 bg-background/95 backdrop-blur-sm flex-shrink-0">
      <div className="flex flex-col sm:flex-row gap-3">
        <WishlistButton
          product={product}
          size="sm"
          className="flex-1 sm:flex-none w-[30px] md:w-[50px]"
        />
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className="flex items-center justify-center gap-3 flex-1 px-6 py-3 md:py-4 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-base md:text-lg relative overflow-hidden group"
        >
          {isAddingToCart ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
              />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              <span>{isOutOfStock ? 'Out of Stock' : `Add to Cart - GH₵ ${price}`}</span>
            </>
          )}

          {/* Hover effect */}
          <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};
