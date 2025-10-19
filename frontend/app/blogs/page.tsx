'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBlogs } from '@/hooks/useBlogs';
import { BlogFilters as BlogFiltersType } from '@/types/blog.types';
import { BlogList } from '@/components/blogs/BlogList';
import { BlogPagination } from '@/components/blogs/BlogPagination';
import { BookOpen, Grid, List } from 'lucide-react';

export default function ReadBlogs() {
  const [filters, setFilters] = useState<BlogFiltersType>({
    page: 1,
    limit: 9,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { blogs, loading, pagination } = useBlogs(filters);

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle bookmark
  const handleBookmark = (blogId: string) => {
    // Implement bookmark functionality
    console.log('Bookmark blog:', blogId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-full mb-6"
          >
            <BookOpen size={20} className="text-foreground/60" />
            <span className="text-sm font-medium text-foreground/60">Blog & Articles</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Latest Blog Posts
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-foreground/60 max-w-2xl mx-auto"
          >
            Discover insightful articles, tutorials, and news from our expert writers. 
            Stay updated with the latest trends and best practices.
          </motion.p>
        </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters & View Toggle - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Active filters display */}
                {(filters.search || filters.category || filters.tag || filters.featured) && (
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <span>Active filters:</span>
                    {filters.search && (
                      <span className="bg-foreground/5 px-2 py-1 rounded">Search: &quot;{filters.search}&quot;</span>
                    )}
                    {filters.category && (
                      <span className="bg-foreground/5 px-2 py-1 rounded">Category: &quot;{filters.category}&quot;</span>
                    )}
                    {filters.tag && (
                      <span className="bg-foreground/5 px-2 py-1 rounded">Tag: &quot;{filters.tag}&quot;</span>
                    )}
                    {filters.featured && (
                      <span className="bg-amber-500/10 text-amber-600 px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                )}
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className="flex items-center gap-2 bg-foreground/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-foreground text-background' 
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-foreground text-background' 
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Blog List */}
            <BlogList
              blogs={blogs}
              loading={loading}
              viewMode={viewMode}
              onBookmark={handleBookmark}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <BlogPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
    </motion.div>
  );
}