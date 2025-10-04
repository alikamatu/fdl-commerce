"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { ProductsPagination } from '@/components/products/ProductsPagination';
import { Building2, Package } from 'lucide-react';
import { Brand } from '@/types/brand';
import { BrandProductsGrid } from './BrandProductsGrid';

interface BrandProductsProps {
  brand: Brand;
}

export const BrandProducts: React.FC<BrandProductsProps> = ({ brand }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const { products, loading, pagination } = useProducts({
    page: currentPage,
    limit: 12,
    brand: brand.name, // Assuming your products have a brand field
  });

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-foreground/10 overflow-hidden bg-white shadow-sm">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-cover p-3"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                  <Building2 size={32} className="text-foreground/30" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-light text-foreground mb-4">
            {brand.name}
          </h1>
          
          {brand.description && (
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-4">
              {brand.description}
            </p>
          )}

          {/* {brand.productCount && (
            <div className="flex items-center justify-center gap-2 text-foreground/40">
              <Package size={16} />
              <span>{brand.productCount} products available</span>
            </div>
          )} */}
        </motion.div>

        {/* Products Grid */}
        <BrandProductsGrid
          products={products}
          loading={loading}
          onViewDetails={handleViewDetails}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <ProductsPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-foreground/60 mb-4">
              <Package size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-foreground/60 mb-6">
              No products available from {brand.name} at the moment.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              Browse All Products
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};