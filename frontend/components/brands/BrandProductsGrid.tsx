"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { BrandProductCard } from './BrandProductCard';
import { BrandProductListItem } from './BrandProductListItem';
import { LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';

interface BrandProductsGridProps {
  products: Product[];
  loading: boolean;
  onViewDetails: (product: Product) => void;
}

type ViewMode = 'grid' | 'list';

export const BrandProductsGrid: React.FC<BrandProductsGridProps> = ({
  products,
  loading,
  onViewDetails,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (loading) {
    return (
      <div className="space-y-6">
        {/* View Toggle Skeleton */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2 animate-pulse">
            <div className="w-10 h-10 bg-foreground/10 rounded-lg"></div>
            <div className="w-10 h-10 bg-foreground/10 rounded-lg"></div>
          </div>
        </div>
        
        {/* Grid Loading Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-background border border-foreground/10 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-foreground/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-foreground/10 rounded w-3/4" />
                  <div className="h-4 bg-foreground/10 rounded w-1/2" />
                  <div className="h-6 bg-foreground/10 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List Loading Skeleton
          <div className="space-y-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-background border border-foreground/10 rounded-xl overflow-hidden animate-pulse p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-48 lg:w-56 xl:w-64 h-48 bg-foreground/10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-foreground/10 rounded w-1/4" />
                    <div className="h-6 bg-foreground/10 rounded w-3/4" />
                    <div className="h-4 bg-foreground/10 rounded w-full" />
                    <div className="h-4 bg-foreground/10 rounded w-2/3" />
                    <div className="h-10 bg-foreground/10 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="text-foreground/60 mb-2">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-foreground/60">
          Try adjusting your search filters or browse different categories.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="flex border border-foreground/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid' 
                ? 'bg-foreground text-background' 
                : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list' 
                ? 'bg-foreground text-background' 
                : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                layout
              >
                <BrandProductCard
                  product={product}
                  onViewDetails={onViewDetails}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                layout
              >
                <BrandProductListItem
                  product={product}
                  onViewDetails={onViewDetails}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};