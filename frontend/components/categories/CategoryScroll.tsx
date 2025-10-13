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
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 300;
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
  }, [categories]);

  // Auto-scroll functionality
  useEffect(() => {
    if (loading || error || categories.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      if (container.scrollLeft >= maxScroll - 10) {
        // Reset to start for infinite effect
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 1, behavior: 'auto' });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [loading, error, categories.length, isPaused]);

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-6 bg-foreground/10 rounded w-48 mx-auto mb-3 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-64 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 flex flex-col items-center animate-pulse"
              >
                <div className="w-20 h-20 bg-foreground/10 rounded-full mb-3" />
                <div className="h-4 bg-foreground/10 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null; // Don't show anything if there's an error or no categories
  }

  return (
    <section 
      className="py-12 bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Browse our curated collections
          </p>
        </motion.div>

        {/* Scroll Container */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-background/80 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
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
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-background/80 backdrop-blur-sm border border-foreground/10 rounded-full shadow-lg hover:bg-background transition-all duration-200"
            >
              <ChevronRight size={20} className="text-foreground" />
            </motion.button>
          )}

          {/* Categories Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.a
                key={category._id}
                href={`/products?category=${category._id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="group flex-shrink-0 w-24 md:w-40 flex flex-col items-center text-center"
              >
                {/* Circle Container */}
                <div className="relative mb-3">
                  {/* Outer Ring on Hover */}
                  <div className="absolute inset-0 rounded-full bg-foreground/5 scale-0 group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Circle */}
                  <div className="relative w-20 h-20 md:w-40 md:h-40 rounded-full border border-foreground/10 group-hover:border-foreground/20 transition-all duration-300 overflow-hidden bg-foreground/5">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={24} className="text-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Active State Indicator */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground/0 group-hover:bg-foreground/40 rounded-full transition-all duration-300" />
                </div>

                {/* Category Name */}
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-200 line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
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