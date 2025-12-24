"use client";

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Laptop, ArrowRight } from 'lucide-react';
import { useRecommendedProducts } from '@/hooks/useRecommendedProducts';
import { RecommendedProductCard } from './RecommendedProductCard';

interface RecommendedProductsProps {
  title?: string;
  category?: string;
  limit?: number;
  showViewAll?: boolean;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  title = "Recommended Laptops",
  category = "laptops", // You'll need to update this with your actual laptop category ID
  limit = 10,
  showViewAll = true,
}) => {
  const { products, loading, error } = useRecommendedProducts(category, limit);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 400;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
    };
  }, [products]);

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!loading && products.length === 0) {
    return null; // Don't show anything if no products
  }

  return (
    <section className="py-12 bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-foreground/5 rounded-lg">
              <Laptop size={24} className="text-foreground/60" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground">
                {title}
              </h2>
              <p className="text-foreground/60 text-sm">
                Curated selection of latest top-performing laptops
              </p>
            </div>
          </div>

          {showViewAll && (
            <a
              href={`/products?category=${category}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
            >
              View All Laptops
              <ArrowRight size={16} />
            </a>
          )}
        </div>

        {/* Scroll Container */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-background/80 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </motion.button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-background/80 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
            >
              <ChevronRight size={20} className="text-foreground" />
            </motion.button>
          )}

          {/* Products Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Loading Skeleton
              [...Array(limit)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-background border border-foreground/10 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-foreground/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-foreground/10 rounded w-3/4" />
                    <div className="h-4 bg-foreground/10 rounded w-1/2" />
                    <div className="h-6 bg-foreground/10 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              // Actual Products
              products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0 w-52 md:w-64 lg:w-80"
                >
                  <RecommendedProductCard
                    product={product}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <div className="sm:hidden text-center mt-6">
            <a
              href={`/products?category=${category}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
            >
              View All Laptops
              <ArrowRight size={16} />
            </a>
          </div>
        )}

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-1">
            <div className="w-1 h-1 bg-foreground/20 rounded-full" />
            <div className="w-1 h-1 bg-foreground/20 rounded-full" />
            <div className="w-1 h-1 bg-foreground/20 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Custom scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};