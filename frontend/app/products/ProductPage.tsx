'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Product } from '@/types/product';
import { ProductBreadcrumbs } from '@/components/products/ProductBreadcrumbs';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductStats } from '@/components/products/ProductStats';
import { ProductsList } from '@/components/products/ProductsList';
import { ProductsPagination } from '@/components/products/ProductsPagination';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import { Snackbar } from '@/components/Snackbar';

export default function ProductPage() {
  const { filters, updateFilters } = useProductFilters();
  const { products, loading, error, pagination, refetch } = useProducts(filters);
  const { categories, loading: categoriesLoading } = useCategories();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Find current category for breadcrumbs
  const currentCategory = categories.find(cat => cat._id === filters.category);

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
  updateFilters({ ...filters, page });
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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
      <div className="min-h-screen bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <ProductBreadcrumbs 
            category={currentCategory}
            currentPage={filters.search ? `Search: "${filters.search}"` : 'All Products'}
          />

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-foreground/20 rounded-lg bg-background hover:bg-foreground/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium">Filters & Sorting</span>
              <svg 
                className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - Products */}
            <div className="flex-1">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-light text-foreground mb-4"
                >
                  {filters.search 
                    ? `Search Results for "${filters.search}"`
                    : currentCategory
                    ? currentCategory.name
                    : 'All Products'
                  }
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-lg text-foreground/60 max-w-2xl mx-auto"
                >
                  {filters.search 
                    ? `Found ${pagination.total} products matching your search`
                    : currentCategory
                    ? `Explore our curated collection of ${currentCategory.name.toLowerCase()}`
                    : 'Discover our carefully curated collection of high-quality products'
                  }
                </motion.p>
              </div>

              {/* Product Stats and View Toggle */}
              <ProductStats
                totalProducts={pagination.total}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Products Grid/List */}
              <ProductsList
                products={products}
                loading={loading}
                onViewDetails={handleViewDetails}
                viewMode={viewMode}
              />

              {pagination.totalPages > 1 && (
                <ProductsPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  onPageChange={handlePageChange}
                />
              )}
            </div>

            {/* Sidebar - Filters */}
            <div className={`lg:w-80 xl:w-96 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-8">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  categories={categories}
                />
              </div>
            </div>
          </div>

          {/* Quick View Dialog */}
          <ProductQuickView
            product={selectedProduct}
            open={quickViewOpen}
            onClose={handleCloseQuickView}
          />

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={hideSnackbar}
          />
        </div>
      </div>
    </motion.div>
  );
}