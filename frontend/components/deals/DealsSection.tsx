"use client";

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, Clock } from 'lucide-react';
import { useDealProducts } from '@/hooks/useDealProducts';
import { DealCard } from './DealCard';

interface DealsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  title = "Back to School Deals",
  subtitle = "Special discounts",
  limit = 10,
  showViewAll = true,
}) => {
  const { products, loading, error } = useDealProducts(limit);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-scroll functionality
  useEffect(() => {
    if (loading || error || products.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (container.scrollLeft >= maxScroll - 10) {
        // Reset to start for infinite effect
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 2, behavior: 'auto' });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [loading, error, products.length, isPaused]);

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!loading && products.length === 0) {
    return null; // Don't show anything if no deals
  }

  return (
    <section 
      className="py-12 w-full dark:from-red-950/20 dark:to-amber-950/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between bg-[url('/images/2151995261.jpg')] bg-cover m-2 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-background">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-red-500" />
                <p className="text-background/60 text-sm">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {showViewAll && (
            <a
              href="/products?deal=true"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors shadow-lg"
            >
              View All Deals
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
              // Actual Deal Products
              products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0 w-80"
                >
                  <DealCard product={product} />
                </motion.div>
              ))
            )}
          </div>
                  {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <div className="sm:hidden text-center mt-6">
            <a
              href="/products?deal=true"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors shadow-lg"
            >
              View All Deals
              <ArrowRight size={16} />
            </a>
          </div>
        )}


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