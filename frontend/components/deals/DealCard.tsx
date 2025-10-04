"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap, Clock, Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface DealCardProps {
  product: Product & {
    originalPriceCents?: number;
    discountPercent?: number;
    isDeal?: boolean;
  };
}

export const DealCard: React.FC<DealCardProps> = ({
  product,
}) => {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const currentPrice = (product.priceCents / 100).toFixed(2);
  const originalPrice = product.originalPriceCents 
    ? (product.originalPriceCents / 100).toFixed(2)
    : null;
  
  // Calculate discount percent if not provided
  const discountPercent = product.discountPercent || (originalPrice 
    ? Math.round(((parseFloat(originalPrice) - parseFloat(currentPrice)) / parseFloat(originalPrice)) * 100)
    : 0);
  
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  // Calculate time left for deal
  const getTimeLeft = () => {
    if (!product.dealExpiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(product.dealExpiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const timeLeft = getTimeLeft();

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsAddingToCart(true);
    
    const cartItem = {
      productId: product._id,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      image: mainImage,
      stock: product.stock,
      brand: product.brand,
      sku: product.sku,
    };

    addItem(cartItem);
    
    // Add a small delay for better UX
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Add your wishlist logic here
  };

  const stockPercentage = Math.min(100, ((product.soldCount || 0) / ((product.soldCount || 0) + Math.max(1, product.stock))) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 left-3 z-10"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {discountPercent}% OFF
          </div>
        </motion.div>
      )}

      {/* Hot Deal Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute top-3 right-3 z-10"
      >
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <Zap size={12} />
          <span>Hot Deal</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 group-hover:bg-gray-50 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <a href={`/products/${product._id}`}>
            <motion.img
              src={mainImage}
              alt={product.images[0]?.alt || product.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          </a>
          
          {/* Time Left Badge */}
          {timeLeft && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-3 left-3"
            >
              <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                <Clock size={12} />
                <span>{timeLeft}</span>
              </div>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
            }`}
          >
            <Heart 
              size={16} 
              className={isWishlisted ? 'fill-current' : ''}
            />
          </motion.button>
        </div>

        {/* Product Details */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {(() => {
              const categoryId = product.categoryId;
              if (typeof categoryId === 'object' && categoryId?.name) {
                return categoryId.name;
              }
              return 'Uncategorized';
            })()}
          </div>

          {/* Product Title */}
          <a href={`/products/${product._id}`} className="group/title">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover/title:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </a>

          {/* Brand */}
          <div className="text-sm text-gray-600 mb-3">
            by <span className="font-medium">{product.brand}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(24 reviews)</span>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              {/* Current Price */}
              <span className="text-2xl font-bold text-gray-900">
                ${currentPrice}
              </span>
              
              {/* Original Price */}
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
            
            {/* You Save */}
            {originalPrice && originalPrice !== currentPrice && (
              <div className="text-sm text-green-600 font-medium mt-1">
                Save ${(parseFloat(originalPrice) - parseFloat(currentPrice)).toFixed(2)}
              </div>
            )}
          </div>

          {/* Stock Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Sold: {product.soldCount || 0}</span>
              <span>{product.stock} left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stockPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {stockPercentage > 70 ? 'Almost gone!' : stockPercentage > 40 ? 'Selling fast!' : 'Limited stock'}
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            whileHover={{ scale: isOutOfStock || isAddingToCart ? 1 : 1.02 }}
            whileTap={{ scale: isOutOfStock || isAddingToCart ? 1 : 0.98 }}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-black text-white'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {isAddingToCart ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <>
                <span>Out of Stock</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </>
            )}
          </motion.button>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
            <span>Free Delivery</span>
            <span>•</span>
            <span>30-day returns</span>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={false}
      />
    </motion.div>
  );
};