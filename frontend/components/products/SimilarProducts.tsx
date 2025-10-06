'use client';

import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { RecommendedProductCard } from '@/components/products/RecommendedProductCard';

interface SimilarProductsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onViewDetails: (product: Product) => void;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  products,
  loading,
  error,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-t border-foreground/10 pt-12 mt-12"
      >
        <h2 className="text-2xl font-light text-foreground mb-8">Similar Products</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-foreground/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-foreground/10 rounded w-3/4" />
                <div className="h-6 bg-foreground/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show section if no products or error
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border-t border-foreground/10 pt-12 mt-12"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-foreground">Similar Products</h2>
        <a
          href={`/products?category=${products[0]?.categoryId?._id || ''}`}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <RecommendedProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};