"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../types/product';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  className = '',
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      const wishlistItem = {
        productId: product._id,
        title: product.title,
        priceCents: product.priceCents,
        currency: product.currency,
        image: product.images[0]?.url || '/placeholder-product.jpg',
        brand: product.brand,
        sku: product.sku,
      };
      addToWishlist(wishlistItem);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <motion.button
      onClick={handleWishlistToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full transition-all duration-300 ${
        isWishlisted
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/30 hover:bg-background'
      } ${sizeClasses[size]} ${className}`}
    >
      <motion.div
        animate={{
          scale: isAnimating ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.6 }}
      >
        <Heart
          size={iconSizes[size]}
          className={isWishlisted ? 'fill-current' : ''}
        />
      </motion.div>
    </motion.button>
  );
};