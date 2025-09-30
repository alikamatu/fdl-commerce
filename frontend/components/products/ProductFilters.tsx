"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Category } from '@/types/product';

interface ProductFiltersProps {
  filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: Category[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, category: categoryId, page: 1 });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    onFiltersChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
      page: 1,
    });
  };

  const handleStockChange = (inStock?: boolean) => {
    onFiltersChange({ ...filters, inStock, page: 1 });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.category || 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined || 
    filters.inStock !== undefined ||
    filters.sortBy !== 'newest';

  return (
    <div className="border border-foreground/10 rounded-lg p-6 mb-8 bg-background">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">Filters & Sorting</h3>
          {hasActiveFilters && (
            <span className="bg-foreground text-background text-xs px-2 py-1 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <X size={16} />
              Clear All
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-foreground/5 rounded transition-colors"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Search and Sort - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
          />
        </div>

        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="stock">In Stock First</option>
        </select>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-foreground/10">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">
                  Category
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() => handleCategoryChange('')}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span>All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="text-foreground focus:ring-foreground/20"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => 
                        handlePriceChange(
                          e.target.value ? Number(e.target.value) : undefined,
                          filters.maxPrice
                        )
                      }
                      className="flex-1 px-3 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
                    />
                    <span className="flex items-center text-foreground/40">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        handlePriceChange(
                          filters.minPrice,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="flex-1 px-3 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Status & Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">
                  Availability
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="stock"
                      value=""
                      checked={filters.inStock === undefined}
                      onChange={() => handleStockChange(undefined)}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span>All Items</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="stock"
                      value="true"
                      checked={filters.inStock === true}
                      onChange={() => handleStockChange(true)}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span>In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="stock"
                      value="false"
                      checked={filters.inStock === false}
                      onChange={() => handleStockChange(false)}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span>Out of Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};