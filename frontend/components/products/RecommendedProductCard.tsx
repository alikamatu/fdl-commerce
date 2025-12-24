"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap, Clock } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RecommendedProductCardProps {
  product: Product;
}

export const RecommendedProductCard: React.FC<RecommendedProductCardProps> = ({
  product,
}) => {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  const currentPrice = (product.priceCents / 100).toFixed(2);
  const originalPrice = product.originalPriceCents 
    ? (product.originalPriceCents / 100).toFixed(2)
    : null;
  
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking cart button
    
    if (isOutOfStock || isAddingToCart) return;

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
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className="group relative w-52 md:64 lg:80 h-auto"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-2 left-2 z-10"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {discountPercent}% OFF
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton 
            product={product} 
            size="sm"
          />
        </div>

        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={mainImage}
            alt={product.images[0]?.alt || product.title}
            className="w-full h-full object-contain"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          />
          
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

          {/* Stock Status Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white  text-xs font-bold px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Add to Cart Button */}
          {!isOutOfStock && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              {isAddingToCart ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              ) : (
                <ShoppingCart size={16} className="" />
              )}
            </motion.button>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {(() => {
              const categoryId = product.categoryId;
              if (typeof categoryId === 'object' && categoryId?.name) {
                return categoryId.name;
              }
              return 'Uncategorized';
            })()}
          </div>

          {/* Product Title */}
          <h4 className="font-semibold  mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {product.title}
          </h4>

          {/* Price Section */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              {/* Current Price */}
              <span className="text-md font-bold ">
                GH₵ {currentPrice}
              </span>
              
              {/* Original Price */}
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-xs text-gray-400 line-through">
                  GH₵{originalPrice}
                </span>
              )}
            </div>
            
            {/* You Save - Only show for significant discounts */}
            {originalPrice && originalPrice !== currentPrice && discountPercent > 1 && (
              <div className="text-xs text-green-600 font-medium mt-1">
                Save GH₵{(parseFloat(originalPrice) - parseFloat(currentPrice)).toFixed(2)}
              </div>
            )}
          </div>

          {/* Stock Progress for Hot Deals */}
          {/* {product.isDeal && product.stock > 0 && product.stock < 20 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Only {product.stock} left</span>
                <span>{product.soldCount || 0} sold</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((product.soldCount || 0) / ((product.soldCount || 0) + product.stock)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )} */}
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          initial={false}
        />
      </div>
    </motion.div>
  );
};