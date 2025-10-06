"use client";

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ProductsFilters as Filters, Product } from '@/types/product';
import { ProductsFilter } from './ProductsFilter';
import { ProductsGrid } from './ProductsGrid';
import { ProductsPagination } from './ProductsPagination';
import { ProductQuickView } from './ProductQuickView';
import { useCategories } from '@/hooks/useCategories';
import { useSearchParams } from 'next/navigation'; // Add this import

export default function Products() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();

  // Read URL parameters on component mount and when searchParams change
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page when search changes
      search: search || undefined,
      category: category || undefined,
    }));
  }, [searchParams]);

  const { products, loading, error, pagination, refetch } = useProducts(filters);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Handle errors
  useEffect(() => {
    if (error) {
      showSnackbar(error, 'error');
    }
  }, [error, showSnackbar]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseQuickView = () => {
    setQuickViewOpen(false);
    setSelectedProduct(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl text-start font-semibold text-foreground mb-4"
          >
            {filters.search ? `Search Results for "${filters.search}"` : 'available Products'}
          </motion.h1>
          {filters.search && products.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-foreground/60 text-start"
            >
              Found {pagination.total} product{products.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </div>

        {/* Filters - Uncomment this section */}
        {/* <ProductsFilter
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        /> */}

        {/* Products Grid */}
        <ProductsGrid
          products={products}
          loading={loading}
          onViewDetails={handleViewDetails}
        />

        {/* Show message when no products found */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-foreground/60 text-lg mb-4">
              {filters.search ? (
                `No products found for "${filters.search}"`
              ) : (
                'No products available'
              )}
            </div>
            {filters.search && (
              <button
                onClick={() => {
                  // Clear search filter
                  setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
                }}
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination - Only show if there are products */}
        {products.length > 0 && (
          <ProductsPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        )}

        {/* Quick View Dialog */}
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onClose={handleCloseQuickView}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={hideSnackbar}
        >
          <Alert
            onClose={hideSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </motion.div>
  );
}