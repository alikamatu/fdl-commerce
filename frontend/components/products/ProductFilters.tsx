"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp, Search, Sliders, Zap } from 'lucide-react';
import { Category } from '@/types/product';
import { Brand } from '@/types/brand';

interface ProductFiltersProps {
  filters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    brand?: string;
    isDeal?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  categories: Category[];
  brands: Brand[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  brands,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    deals: true
  });

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

  const handleDealChange = (isDeal?: boolean) => {
    onFiltersChange({ ...filters, isDeal, page: 1 });
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    filters.search || 
    filters.category || 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined || 
    filters.isDeal !== undefined ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-background rounded-lg border border-foreground/10">
      {/* Filter Header */}
      <div className="p-6 border-b border-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-foreground/5 rounded-lg">
              <Sliders size={20} className="text-foreground/60" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              <p className="text-sm text-foreground/60">Refine your results</p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors p-2 hover:bg-foreground/5 rounded-md"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sorting */}
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-3">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="stock">In Stock First</option>
            <option value="discount">Best Discount</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="border-t border-foreground/10 pt-6">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="block text-sm font-semibold text-foreground/80">
              Category
            </label>
            {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.category && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() => handleCategoryChange('')}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="text-foreground focus:ring-foreground/20"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range - Fixed to prevent overflow */}
        <div className="border-t border-foreground/10 pt-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="block text-sm font-semibold text-foreground/80">
              Price Range
            </label>
            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.price && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-foreground/60">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice || ''}
                        onChange={(e) => 
                          handlePriceChange(
                            e.target.value ? Number(e.target.value) : undefined,
                            filters.maxPrice
                          )
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-sm"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-foreground/60">Max Price</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          handlePriceChange(
                            filters.minPrice,
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Deals Filter */}
        <div className="border-t border-foreground/10 pt-6">
          <button
            onClick={() => toggleSection('deals')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="block text-sm font-semibold text-foreground/80">
              Special Offers
            </label>
            {expandedSections.deals ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.deals && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="deals"
                      value=""
                      checked={filters.isDeal === undefined}
                      onChange={() => handleDealChange(undefined)}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="deals"
                      value="true"
                      checked={filters.isDeal === true}
                      onChange={() => handleDealChange(true)}
                      className="text-foreground focus:ring-foreground/20"
                    />
                    <span className="text-sm flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      Hot Deals Only
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};