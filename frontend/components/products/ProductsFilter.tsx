"use client";

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductsFilters as Filters } from '@/types/product';

interface ProductsFilterProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: Array<{ _id: string; name: string }>;
}

export const ProductsFilter: React.FC<ProductsFilterProps> = ({
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
    filters.inStock !== undefined;

  return (
    <div className="border border-foreground/10 rounded-lg p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-foreground/60" />
          <h3 className="font-semibold text-foreground">Filters</h3>
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
              Clear
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

      {/* Search Field - Always Visible */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
        />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Price Range
                </label>
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

              {/* Stock Status */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Stock Status
                </label>
                <select
                  value={filters.inStock === undefined ? '' : String(filters.inStock)}
                  onChange={(e) => 
                    handleStockChange(
                      e.target.value === '' ? undefined : e.target.value === 'true'
                    )
                  }
                  className="w-full px-3 py-2 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
                >
                  <option value="">All</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};