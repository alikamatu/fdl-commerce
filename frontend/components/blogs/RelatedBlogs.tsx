'use client';

import { motion } from 'framer-motion';
import { Blog } from '@/types/blog.types';
import { BlogCard } from './BlogCard';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RelatedBlogsProps {
  blogs: Blog[];
  loading: boolean;
  currentBlogId: string;
}

export const RelatedBlogs: React.FC<RelatedBlogsProps> = ({
  blogs,
  loading,
  currentBlogId,
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="mt-16">
        <div className="h-6 bg-foreground/10 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-background rounded-xl overflow-hidden border border-foreground/10">
              <div className="aspect-[4/3] bg-foreground/10 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16 pt-12 border-t border-foreground/10"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Related Articles</h2>
        <button
          onClick={() => router.push('/blogs')}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs
          .filter(blog => blog._id !== currentBlogId)
          .slice(0, 3)
          .map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <BlogCard
                blog={blog}
                variant="grid"
              />
            </motion.div>
          ))}
      </div>
    </motion.section>
  );
};