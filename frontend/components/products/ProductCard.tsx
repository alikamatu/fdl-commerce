"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Zap, Clock } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
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
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discountPercent}% OFF
          </div>
        </div>
      )}

      {/* Hot Deal Badge */}
      {product.isDeal && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Zap size={12} />
            Hot Deal
          </div>
        </div>
      )}

      <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-foreground/20 h-full flex flex-col">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton 
            product={product} 
            size="sm"
          />
        </div>

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image */}
        <div 
          className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-gray-50"
          onClick={() => router.push(`/products/${product._id}`)}
        >
          <motion.img
            src={mainImage}
            alt={product.images[0]?.alt || product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          
          {/* Time Left Badge */}
          {timeLeft && (
            <div className="absolute bottom-2 left-2">
              <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock size={10} />
                <span>{timeLeft}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <div className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">
            {(() => {
              const categoryId = product.categoryId;
              if (typeof categoryId === 'object' && categoryId?.name) {
                return categoryId.name;
              }
              return 'Uncategorized';
            })()}
          </div>

          {/* Product Title */}
          <h3 
            className="font-semibold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-foreground/80 transition-colors"
            onClick={() => onViewDetails(product)}
          >
            {product.title}
          </h3>

          {/* Brand */}
          <div className="text-sm text-foreground/60 mb-3">
            by {product.brand}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-foreground/60 ml-1">(24)</span>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              {/* Current Price */}
              <span className="text-xl font-bold text-foreground">
                ${currentPrice}
              </span>
              
              {/* Original Price */}
              {originalPrice && originalPrice !== currentPrice && (
                <span className="text-lg text-foreground/40 line-through">
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

          {/* Stock Progress Bar for Hot Deals */}
          {product.isDeal && product.stock > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-foreground/60 mb-1">
                <span>Sold: {product.soldCount || 0}</span>
                <span>Left: {product.stock}</span>
              </div>
              <div className="w-full bg-foreground/10 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((product.soldCount || 0) / ((product.soldCount || 0) + product.stock)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onViewDetails(product)}
              className="flex items-center justify-center gap-1 flex-1 px-3 py-2 border border-foreground/20 rounded-md text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <Eye size={16} />
              Details
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className="flex items-center justify-center gap-1 flex-1 px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
            >
              {isAddingToCart ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                />
              ) : (
                <ShoppingCart size={16} />
              )}
              <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};