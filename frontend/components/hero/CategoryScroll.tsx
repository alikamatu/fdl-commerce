// components/categories/CategoryScroll.tsx
"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import Link from 'next/link';

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="py-6 md:py-12 lg:py-16 bg-background w-full overflow-hidden">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <div className="h-6 md:h-8 bg-foreground/10 rounded w-40 md:w-64 mx-auto mb-3 md:mb-4 animate-pulse" />
            <div className="h-3 md:h-4 bg-foreground/10 rounded w-60 md:w-96 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-3 md:gap-6 lg:gap-8 overflow-x-auto pb-3 md:pb-6 scrollbar-hide px-1">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-shrink-0 w-20 xs:w-24 sm:w-28 md:w-36 lg:w-44 animate-pulse"
              >
                {/* Circular Image Skeleton */}
                <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-foreground/10 rounded-full mb-2 md:mb-3" />
                {/* Text Skeleton */}
                <div className="h-3 md:h-4 bg-foreground/10 rounded w-14 md:w-20 mb-1 md:mb-2" />
                <div className="h-2 md:h-3 bg-foreground/10 rounded w-10 md:w-14" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground/60 mb-4">
            <ImageIcon size={32} className="mx-auto opacity-50 md:size-12" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
            Failed to load categories
          </h3>
          <p className="text-foreground/60 text-sm md:text-base mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm md:text-base"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-8 md:py-12 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground/60 mb-4">
            <ImageIcon size={32} className="mx-auto opacity-50 md:size-12" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
            No categories available
          </h3>
          <p className="text-foreground/60 text-sm md:text-base">
            Check back later for new categories
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12 lg:py-16 bg-background w-full overflow-hidden">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-2 md:mb-4 px-2">
            Shop by Category
          </h2>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-foreground/60 max-w-2xl mx-auto px-2">
            Browse our wide range of product categories
          </p>
        </motion.div>

        {/* Horizontal Scroll Container - Fixed for mobile */}
        <div className="flex gap-3 md:gap-6 lg:gap-8 overflow-x-auto pb-3 md:pb-6 scrollbar-hide px-1">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true, margin: "-20px" }}
              className="group flex flex-col items-center flex-shrink-0 w-20 xs:w-24 sm:w-28 md:w-36 lg:w-44"
            >
              <Link 
                href={`/products?category=${category._id}`} 
                className="flex flex-col items-center w-full text-center active:scale-95 transition-transform"
              >
                {/* Circular Image Container */}
                <div className="relative mb-2 md:mb-3">
                  <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border border-foreground/10 group-hover:border-foreground/30 transition-all duration-300 shadow-xs group-hover:shadow-sm">
                    {category.imageUrl ? (
                      <motion.img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                        <ImageIcon 
                          size={14} 
                          className="text-foreground/20 xs:size-4 sm:size-5 md:size-6" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow Indicator - Hidden on mobile, shown on tablet+ */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-foreground text-background rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 hidden sm:block"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ArrowRight size={10} className="xs:size-2 sm:size-3 md:size-4" />
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="w-full space-y-0.5 md:space-y-1">
                  <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 px-1 leading-tight">
                    {category.name}
                  </h3>
                  
                  {/* Description - Hidden on very small screens */}
                  <p className="text-[10px] xs:text-xs sm:text-sm text-foreground/60 line-clamp-2 hidden xs:block">
                    {`Explore ${category.name.toLowerCase()}`}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Link */}
        {categories.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-4 md:mt-8"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-6 md:py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-xs xs:text-sm md:text-base"
            >
              View All
              <ArrowRight size={12} className="md:size-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};