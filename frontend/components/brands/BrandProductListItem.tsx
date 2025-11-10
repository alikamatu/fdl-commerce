"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BrandProductListItemProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export const BrandProductListItem: React.FC<BrandProductListItemProps> = ({
  product,
  onViewDetails,
}) => {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const router = useRouter();

  const price = (product.priceCents / 100).toFixed(2);
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  // Fetch review stats when component mounts
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!product?._id) return;

      try {
        setReviewsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
        
        const response = await fetch(
          `${apiUrl}/reviews/product/${product._id}/stats`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setReviewStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviewStats();
  }, [product._id]);

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

  const handleProductClick = () => {
    router.push(`/products/${product._id}`);
  };

  // Use real review data or fallback to product data
  const averageRating = reviewStats?.averageRating || product.averageRating || 0;
  const reviewCount = reviewStats?.totalReviews || product.reviewCount || 0;
  const hasReviews = reviewCount > 0;

  const RatingStars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="rounded-xl overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div 
            className="relative md:w-48 lg:w-56 xl:w-64 h-48 md:h-auto overflow-hidden cursor-pointer flex-shrink-0"
            onClick={handleProductClick}
          >
            <motion.img
              src={mainImage}
              alt={product.images[0]?.alt || product.title}
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

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

            {/* Deal Badge */}
            {product.isDeal && product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                {product.discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
              <div className="flex-1">
                {/* Category and Brand */}
                <div className="flex items-center gap-3 text-sm text-foreground/60 mb-2">
                  <span className="font-medium uppercase tracking-wide">
                    {(() => {
                      const categoryId = product.categoryId;
                      if (typeof categoryId === 'object' && categoryId?.name) {
                        return categoryId.name;
                      }
                      return 'Uncategorized';
                    })()}
                  </span>
                  <span className="text-foreground/30">•</span>
                  <span>by {product.brand}</span>
                </div>

                {/* Product Title */}
                <h3 
                  className="font-semibold text-lg text-foreground mb-3 line-clamp-2 cursor-pointer hover:text-foreground/80 transition-colors"
                  onClick={() => onViewDetails(product)}
                >
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-foreground/70 text-sm line-clamp-2 mb-4">
                  {product.description}
                </p>

                {/* Rating and Reviews - Real Data */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {reviewsLoading ? (
                    // Loading skeleton for ratings
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className="text-gray-300"
                          />
                        ))}
                      </div>
                      <div className="h-4 w-16 bg-foreground/10 rounded animate-pulse" />
                    </div>
                  ) : hasReviews ? (
                    <>
                      <div className="flex items-center gap-1">
                        <RatingStars rating={averageRating} />
                        <span className="text-sm text-foreground/60 ml-1">
                          {averageRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-foreground/30">•</span>
                      <span className="text-sm text-foreground/60">
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <RatingStars rating={0} />
                        <span className="text-sm text-foreground/60 ml-1">No ratings</span>
                      </div>
                      <span className="text-foreground/30">•</span>
                      <span className="text-sm text-foreground/60">No reviews</span>
                    </>
                  )}
                  <span className="text-foreground/30">•</span>
                  <span className="text-sm text-foreground/60">SKU: {product.sku}</span>
                </div>

                {/* Key Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
                    {product.specifications.slice(0, 4).map((spec, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/60 font-medium">{spec.key}:</span>
                        <span className="text-foreground/80">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-start lg:items-end gap-4">
                {/* Price */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    ₵{price}
                  </div>
                  {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                    <div className="text-sm text-foreground/40 line-through">
                      ₵{(product.originalPriceCents / 100).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap relative"
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

            {/* Additional Info */}
            <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span>Free delivery</span>
                <span className="text-foreground/30">•</span>
                <span>7-day returns</span>
              </div>
              
              {/* View Full Details */}
              <button
                onClick={handleProductClick}
                className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors flex items-center gap-1"
              >
                Full details
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};