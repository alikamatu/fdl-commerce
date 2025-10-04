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


export default function Products() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  

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
            className="text-4xl text-start font-bold text-foreground mb-4"
          >
            Our Products
          </motion.h1>
          {/* <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-foreground/60 max-w-2xl mx-auto"
          >
            Discover our carefully curated collection of high-quality products 
            designed to meet your needs and exceed your expectations.
          </motion.p> */}
        </div>

        {/* Filters
        <ProductsFilter
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        /> */}

        {/* Products Grid - Removed onAddToCart prop */}
        <ProductsGrid
          products={products}
          loading={loading}
          onViewDetails={handleViewDetails}
        />

        {/* Pagination */}
        <ProductsPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
        />

        {/* Quick View Dialog */}
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onClose={handleCloseQuickView}
          // onAddToCart is now handled internally in ProductQuickView
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