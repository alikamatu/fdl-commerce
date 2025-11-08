"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * (isMobile ? 0.7 : 0.4);
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
    const tolerance = 5;
    
    setShowLeftArrow(container.scrollLeft > tolerance);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - tolerance
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtons);
    const timeoutId = setTimeout(checkScrollButtons, 100);
    
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
      clearTimeout(timeoutId);
    };
  }, [categories, isMobile]);

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="h-6 bg-foreground/10 rounded w-32 md:w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-48 md:w-64 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-3 md:gap-6 overflow-hidden">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 md:w-24 flex flex-col items-center animate-pulse"
              >
                <div className="w-14 h-14 md:w-20 md:h-20 bg-foreground/10 rounded-full mb-2 md:mb-3" />
                <div className="h-3 md:h-4 bg-foreground/10 rounded w-12 md:w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-8 md:py-12 bg-background w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-foreground mb-2 md:mb-3">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-foreground/60 max-w-2xl mx-auto">
            Browse our curated collections
          </p>
        </motion.div>

        {/* Scroll Container Wrapper - CRITICAL: Contains overflow */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          {/* Left Arrow */}
          {showLeftArrow && !isMobile && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('left')}
              className="absolute left-6 sm:left-8 lg:left-10 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-background/95 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </motion.button>
          )}

          {/* Right Arrow */}
          {showRightArrow && !isMobile && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('right')}
              className="absolute right-6 sm:right-8 lg:right-10 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-background/95 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} className="text-foreground" />
            </motion.button>
          )}

          {/* Categories Scroll - CRITICAL: This is the scrolling container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth py-4"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              // Ensure smooth scrolling on mobile
              overscrollBehaviorX: 'contain'
            }}
            onScroll={checkScrollButtons}
          >
            {categories.map((category, index) => (
              <motion.a
                key={category._id}
                href={`/products?category=${category._id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                viewport={{ once: true, margin: '0px 0px -50px 0px' }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group flex-shrink-0 w-20 sm:w-24 md:w-32 lg:w-40 flex flex-col items-center text-center"
              >
                {/* Circle Container */}
                <div className="relative mb-2 md:mb-3">
                  {/* Outer Ring on Hover */}
                  <div className="absolute inset-0 rounded-full bg-foreground/5 scale-0 group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Responsive Circle */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full border border-foreground/10 group-hover:border-foreground/20 transition-all duration-300 overflow-hidden bg-foreground/5">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-300 p-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon 
                          size={isMobile ? 18 : 24} 
                          className="text-foreground/30" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Active State Indicator */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground/0 group-hover:bg-foreground/40 rounded-full transition-all duration-300" />
                </div>

                {/* Category Name */}
                <span className="text-xs md:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-200 line-clamp-2 leading-tight px-1">
                  {category.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
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