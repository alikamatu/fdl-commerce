'use client';

import { motion } from 'framer-motion';
import { Blog } from '@/types/blog.types';
import { BlogCard } from './BlogCard';

interface BlogListProps {
  blogs: Blog[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onBookmark?: (blogId: string) => void;
}

const BlogSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="bg-background rounded-xl overflow-hidden border border-foreground/10">
        <div className="aspect-[4/3] bg-foreground/10 animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-foreground/10 rounded animate-pulse" />
          <div className="h-6 bg-foreground/10 rounded animate-pulse" />
          <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-foreground/10 rounded animate-pulse w-20" />
            <div className="h-4 bg-foreground/10 rounded animate-pulse w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-background rounded-xl p-6 border border-foreground/10">
      <div className="md:w-48 lg:w-56 flex-shrink-0">
        <div className="aspect-[4/3] bg-foreground/10 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-foreground/10 rounded animate-pulse w-32" />
        <div className="h-6 bg-foreground/10 rounded animate-pulse" />
        <div className="h-4 bg-foreground/10 rounded animate-pulse w-full" />
        <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-foreground/10 rounded animate-pulse w-40" />
          <div className="h-4 bg-foreground/10 rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
};

export const BlogList: React.FC<BlogListProps> = ({
  blogs,
  loading,
  viewMode,
  onBookmark,
}) => {
  if (loading) {
    return (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-6"
      }>
        {Array.from({ length: 6 }).map((_, index) => (
          <BlogSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-foreground/40 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No blogs found</h3>
        <p className="text-foreground/60">Try adjusting your search or filters</p>
      </motion.div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
      : "space-y-6"
    }>
      {blogs.map((blog, index) => (
        <motion.div
          key={blog._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <BlogCard
            blog={blog}
            variant={viewMode}
            onBookmark={onBookmark}
          />
        </motion.div>
      ))}
    </div>
  );
};