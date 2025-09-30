"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductActionsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const price = (product.priceCents / 100).toFixed(2);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Implement wishlist logic here
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show success message
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">${price}</span>
        <span className="text-foreground/60">{product.currency}</span>
      </div>

      {/* Stock Status */}
      <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
        {isOutOfStock ? 'Out of Stock' : `${product.stock} units available`}
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground/80">Quantity:</span>
          <div className="flex items-center border border-foreground/20 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-foreground/5 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="px-3 py-2 hover:bg-foreground/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleWishlist}
            className="p-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <Heart 
              size={20} 
              className={isWishlisted ? 'fill-red-500 text-red-500' : ''} 
            />
          </button>
          <button
            onClick={handleShare}
            className="p-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Truck size={16} />
          <span>Free shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Shield size={16} />
          <span>2-year warranty</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <RotateCcw size={16} />
          <span>30-day returns</span>
        </div>
      </div>
    </motion.div>
  );
};