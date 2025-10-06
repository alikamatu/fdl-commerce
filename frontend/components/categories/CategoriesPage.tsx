"use client";

import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { CategoryCard } from './CategoryCard';

export const CategoriesPage: React.FC = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-foreground/10 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Failed to load categories
          </h2>
          <p className="text-foreground/60 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            No categories available
          </h2>
          <p className="text-foreground/60">
            Check back later for new categories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-light text-foreground mb-4">
            Shop by Category
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Explore our carefully curated collections and find exactly what you&apos;re looking for
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={category._id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};