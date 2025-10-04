"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon, Grid3X3 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { CategoryScroll } from '../categories/CategoryScroll';

interface CategoryGridProps {
  variant?: 'grid' | 'scroll';
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  variant = 'scroll' 
}) => {
  const { categories, loading, error } = useCategories();

  if (variant === 'scroll') {
    return <CategoryScroll />;
  }

  // Original grid layout (kept for backward compatibility)
  if (loading) {
    return (
      <section className="py-16 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-foreground/10 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-background rounded-lg overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-[4/3] bg-foreground/10" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-foreground/10 rounded w-3/4" />
                  <div className="h-4 bg-foreground/10 rounded w-full" />
                  <div className="h-4 bg-foreground/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground/60 mb-4">
            <ImageIcon size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load categories
          </h3>
          <p className="text-foreground/60 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground/60 mb-4">
            <ImageIcon size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No categories available
          </h3>
          <p className="text-foreground/60">
            Check back later for new categories
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Start Your Journey
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Explore our carefully curated categories and discover your next treasure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <a href={`/products?category=${category._id}`} className="block h-full">
                <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    {category.imageUrl ? (
                      <motion.img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                        <ImageIcon size={48} className="text-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                        {category.name}
                      </h3>
                      <ArrowRight 
                        size={20} 
                        className="text-foreground/40 group-hover:text-foreground/60 transform group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" 
                      />
                    </div>
                    
                    <p className="text-foreground/60 mb-3 flex-1">
                      Explore our collection of {category.name.toLowerCase()}
                    </p>
                    
                    <p className="text-sm text-foreground/40">
                      Browse collection
                    </p>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Link */}
        {categories.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
            >
              View All Categories
              <ArrowRight size={16} />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};