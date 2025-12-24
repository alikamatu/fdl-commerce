'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, Package, Shield, Truck, User, Calendar, ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  user?: {
    displayName: string;
  };
  createdAt: string;
  isVerified: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  open,
  onClose,
}) => {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (open && product) {
      setCurrentImageIndex(0);
      setIsAddingToCart(false);
      setReviewsLoading(true);
      setReviewStats(null);
      setReviews([]);
      fetchReviewData();
    }
  }, [open, product?._id]);

  if (!product) return null;

  const price = (product.priceCents / 100).toFixed(2);
  const originalPrice = product.originalPriceCents 
    ? (product.originalPriceCents / 100).toFixed(2) 
    : null;
  const discountPercent = product.discountPercent || 0;
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;
  const currentImage = product.images[currentImageIndex] || product.images[0];

  const fetchReviewData = async () => {
    if (!product?._id) return;

    try {
      setReviewsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
      
      // Fetch review stats
      const statsResponse = await fetch(
        `${apiUrl}/reviews/product/${product._id}/stats`
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setReviewStats(statsData.data);
        }
      }

      // Fetch recent reviews
      const reviewsResponse = await fetch(
        `${apiUrl}/reviews/product/${product._id}?page=1&limit=3`
      );
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = () => {
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
    }, 800);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const RatingStars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Use live review stats
  const averageRating = reviewStats?.averageRating || product.averageRating || 0;
  const reviewCount = reviewStats?.totalReviews || product.reviewCount || 0;
  const hasReviews = reviewCount > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-background/95 backdrop-blur-sm flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground/80">Quick View</h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${product._id}`}
                  onClick={onClose}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors group flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
                >
                  <span>Full Details</span>
                  <ExternalLink size={16} />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors group"
                >
                  <X size={20} className="text-foreground/60 group-hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Main Content - This is the scrollable area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Product Images - Fixed height */}
                <div className="relative bg-gray-50 flex items-center justify-center p-8 border-r border-foreground/5">
                  <div className="w-full max-w-md aspect-square relative">


                    {/* Main Image */}
                    <motion.img
                      key={currentImageIndex}
                      src={currentImage?.url || mainImage}
                      alt={currentImage?.alt || product.title}
                      className="w-full h-full object-contain rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
                        >
                          <ChevronLeft 
                            size={20} 
                            className="text-foreground/60 group-hover:text-foreground" 
                          />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
                        >
                          <ChevronRight 
                            size={20} 
                            className="text-foreground/60 group-hover:text-foreground" 
                          />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm text-foreground/60">
                          {currentImageIndex + 1} / {product.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                            currentImageIndex === index 
                              ? 'border-foreground shadow-md' 
                              : 'border-foreground/20 hover:border-foreground/40'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {product.images.length > 4 && (
                        <div className="w-12 h-12 rounded-lg border-2 border-foreground/20 flex items-center justify-center text-xs text-foreground/60 bg-foreground/5">
                          +{product.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Details - Scrollable container */}
                <div className="flex flex-col h-full">
                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 space-y-6">
                      {/* Category and Stock Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground/60 bg-foreground/5 px-3 py-1 rounded-full">
                          {(() => {
                            const categoryId = product.categoryId;
                            if (typeof categoryId === 'object' && categoryId?.name) {
                              return categoryId.name;
                            }
                            return 'Uncategorized';
                          })()}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Package size={14} />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Package size={14} />
                            {product.stock} in stock
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <h1 className="text-md lg:text-xl font-bold text-foreground leading-tight">
                        {product.title}
                      </h1>

                      {/* Brand */}
                      <div className="text-lg text-foreground/60">
                        by <span className="font-semibold text-foreground/80">{product.brand}</span>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg lg:text-xl font-bold text-foreground">
                            GH₵{price}
                          </span>
                          {originalPrice && originalPrice !== price && (
                            <span className="text-md text-foreground/40 line-through">
                              GH₵{originalPrice}
                            </span>
                          )}
                    {/* Deal Badge */}
                    {product.isDeal && discountPercent > 0 && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {discountPercent}% OFF
                      </div>
                    )}
                        </div>
                        {originalPrice && originalPrice !== price && (
                          <div className="text-green-600 font-medium">
                            You save GH₵{(parseFloat(originalPrice) - parseFloat(price)).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Description</h3>
                        <p className="text-foreground/80 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Truck size={18} className="text-foreground/40 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">Free Delivery</div>
                            <div className="text-xs">On all products</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Package size={18} className="text-foreground/40 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">Easy Returns</div>
                            <div className="text-xs">7-day guarantee</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Shield size={18} className="text-foreground/40 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">Secure Payment</div>
                            <div className="text-xs">100% protected</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at Bottom */}
                  <div className="p-6 lg:p-8 border-t border-foreground/10 bg-background/95 backdrop-blur-sm flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <WishlistButton 
                        product={product} 
                        size="lg" 
                        className="flex-1 sm:flex-none"
                      />
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAddingToCart}
                        className="flex items-center justify-center gap-3 flex-1 px-6 py-4 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg relative overflow-hidden group"
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
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};