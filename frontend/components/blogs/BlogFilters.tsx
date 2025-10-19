'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, ChevronUp, Tag, Calendar } from 'lucide-react';
import { BlogFilters as BlogFiltersType } from '@/types/blog.types';

interface BlogFiltersProps {
  filters: BlogFiltersType;
  onFiltersChange: (filters: BlogFiltersType) => void;
  categories: string[];
  tags: string[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  tags,
  viewMode,
  onViewModeChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    tags: false,
    features: true,
  });

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category === filters.category ? undefined : category, page: 1 });
  };

  const handleTagChange = (tag: string) => {
    onFiltersChange({ ...filters, tag: tag === filters.tag ? undefined : tag, page: 1 });
  };

  const handleFeaturedChange = (featured: boolean) => {
    onFiltersChange({ ...filters, featured: featured === filters.featured ? undefined : featured, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 9,
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
    filters.tag || 
    filters.featured !== undefined;

  return (
    <div className="bg-background rounded-xl border border-foreground/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-foreground/5 rounded-lg">
            <Filter size={20} className="text-foreground/60" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            <p className="text-sm text-foreground/60">Find perfect reads</p>
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
      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex border border-foreground/20 rounded-lg p-1 mb-6">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'grid' 
              ? 'bg-foreground text-background' 
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'list' 
              ? 'bg-foreground text-background' 
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          List View
        </button>
      </div>

      <div className="space-y-4">
        {/* Categories Filter */}
        <div className="border-b border-foreground/10 pb-4">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Tag size={16} />
              Categories
            </label>
            {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.categories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !filters.category
                        ? 'bg-foreground text-background'
                        : 'hover:bg-foreground/5'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === category
                          ? 'bg-foreground text-background'
                          : 'hover:bg-foreground/5'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Featured Filter */}
        <div className="border-b border-foreground/10 pb-4">
          <button
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Calendar size={16} />
              Features
            </label>
            {expandedSections.features ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.features && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  <button
                    onClick={() => handleFeaturedChange(true)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.featured === true
                        ? 'bg-amber-500 text-white'
                        : 'hover:bg-foreground/5'
                    }`}
                  >
                    Featured Only
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags Filter */}
        <div>
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full mb-3"
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Tag size={16} />
              Popular Tags
            </label>
            {expandedSections.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.tags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        filters.tag === tag
                          ? 'bg-foreground text-background'
                          : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};