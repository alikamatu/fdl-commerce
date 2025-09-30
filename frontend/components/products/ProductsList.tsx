"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductsListProps {
  products: Product[];
  loading: boolean;
  onViewDetails: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  loading,
  onViewDetails,
  viewMode,
}) => {
  if (loading) {
    return (
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className={`bg-background border border-foreground/10 rounded-lg overflow-hidden animate-pulse ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {viewMode === 'list' && (
              <div className="w-48 h-48 bg-foreground/10 flex-shrink-0" />
            )}
            <div className={`p-4 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="h-4 bg-foreground/10 rounded w-3/4" />
              <div className="h-4 bg-foreground/10 rounded w-1/2" />
              <div className="h-6 bg-foreground/10 rounded w-1/3" />
            </div>
          </div>
        ))}
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
    <AnimatePresence>
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            layout
          >
            <ProductCard
              product={product}
              onViewDetails={onViewDetails}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};