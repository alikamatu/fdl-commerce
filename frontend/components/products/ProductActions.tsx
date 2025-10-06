"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSnackbar } from '@/hooks/useSnackbar';

interface ProductActionsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSnackbar } = useSnackbar();

  const price = (product.priceCents / 100).toFixed(2);
  const originalPrice = product.originalPriceCents 
    ? (product.originalPriceCents / 100).toFixed(2)
    : null;
  const discountPercent = product.discountPercent || (originalPrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
    : 0);
  const isOutOfStock = product.stock === 0;
  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (isAddingToCart || isOutOfStock) return;
    
    setIsAddingToCart(true);
    
    const cartItem = {
      productId: product._id,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      image: product.images[0]?.url || '/placeholder-product.jpg',
      stock: product.stock,
      brand: product.brand,
      sku: product.sku,
    };

    // Add item to cart with selected quantity
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    showSnackbar(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`, 'success');
    onAddToCart(product);
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  const handleWishlist = () => {
    const wishlistItem = {
      productId: product._id,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      image: product.images[0]?.url || '/placeholder-product.jpg',
      brand: product.brand,
      sku: product.sku,
    };

    if (isWishlisted) {
      removeFromWishlist(product._id);
      showSnackbar('Removed from wishlist', 'info');
    } else {
      addToWishlist(wishlistItem);
      showSnackbar('Added to wishlist', 'success');
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: (typeof window !== 'undefined') ? window.location.href : '',
        });
        showSnackbar('Product shared successfully', 'success');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          showSnackbar('Failed to share product', 'error');
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText((typeof window !== 'undefined') ? window.location.href : '');
        showSnackbar('Link copied to clipboard', 'success');
      } catch (err) {
        showSnackbar('Failed to copy link', 'error');
      }
    }
    
    setTimeout(() => setIsSharing(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Price Section with Discount */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">${price}</span>
          {originalPrice && originalPrice !== price && (
            <span className="text-xl text-foreground/40 line-through">${originalPrice}</span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        {originalPrice && originalPrice !== price && (
          <div className="text-green-600 font-medium">
            You save ${(parseFloat(originalPrice) - parseFloat(price)).toFixed(2)}
          </div>
        )}
        <span className="text-foreground/60 text-sm">{product.currency}</span>
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
              disabled={quantity <= 1}
              className="px-3 py-2 hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="px-3 py-2 hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <div className="text-sm text-foreground/60">
            Max: {product.stock}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
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
              <span>Add to Cart - ${(parseFloat(price) * quantity).toFixed(2)}</span>
            </>
          )}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleWishlist}
            disabled={isAddingToCart}
            className="p-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 transition-colors"
          >
            <Heart 
              size={20} 
              className={isWishlisted ? 'fill-red-500 text-red-500' : ''} 
            />
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="p-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 transition-colors"
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