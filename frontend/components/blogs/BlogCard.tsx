'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, ArrowRight, Bookmark } from 'lucide-react';
import { Blog } from '@/types/blog.types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BlogCardProps {
  blog: Blog;
  variant?: 'grid' | 'list' | 'featured';
  onBookmark?: (blogId: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  variant = 'grid',
  onBookmark 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/blogs/${blog.slug}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(blog._id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Grid variant (default)
  if (variant === 'grid') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-foreground/10 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-foreground/10 animate-pulse" />
          )}
          <img
            src={blog.featuredImage?.url || '/placeholder-blog.jpg'}
            alt={blog.featuredImage?.alt || blog.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Featured Badge */}
          {blog.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Featured
              </span>
            </div>
          )}

          {/* Category */}
          {blog.categories.length > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
                {blog.categories[0]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(blog.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{blog.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{blog.viewCount}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-foreground/70 text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">
                {blog.authorId?.displayName || 'Forbes Digital LifeLine'}
              </span>
            </div>
            
            <ArrowRight 
              size={16} 
              className="text-foreground/40 group-hover:text-foreground/60 transition-colors transform group-hover:translate-x-1" 
            />
          </div>
        </div>
      </motion.article>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex flex-col md:flex-row gap-6 bg-background rounded-xl p-6 border border-foreground/10 hover:border-foreground/20 transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="md:w-48 lg:w-56 flex-shrink-0">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-foreground/10 animate-pulse" />
            )}
            <img
              src={blog.featuredImage?.url || '/placeholder-blog.jpg'}
              alt={blog.featuredImage?.alt || blog.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {blog.isFeatured && (
              <div className="absolute top-2 left-2">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Categories */}
          {blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="bg-foreground/5 text-foreground/70 text-xs px-2 py-1 rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-foreground/80 transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-foreground/70 mb-4 line-clamp-2 flex-1">
            {blog.excerpt}
          </p>

          {/* Meta Info and Author */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{blog.readingTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{blog.viewCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/60">
                  {blog.authorId?.displayName || 'Forbes Digital LifeLine'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // Featured variant
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-background rounded-2xl overflow-hidden shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <div className="relative aspect-[21/9] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-foreground/10 animate-pulse" />
        )}
        <img
          src={blog.featuredImage?.url || '/placeholder-blog.jpg'}
          alt={blog.featuredImage?.alt || blog.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-background">
          {/* Category */}
          {blog.categories.length > 0 && (
            <div className="mb-4">
              <span className="bg-background/20 backdrop-blur-sm text-background text-sm px-3 py-1 rounded-full border border-background/20">
                {blog.categories[0]}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 line-clamp-2 group-hover:text-amber-200 transition-colors">
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p className="text-background/90 text-lg mb-6 line-clamp-2">
            {blog.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-background/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>{blog.authorId?.displayName || 'Forbes Digital LifeLine'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{blog.readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Badge */}
        <div className="absolute top-6 right-6">
          <span className="bg-amber-500 text-white font-bold px-3 py-2 rounded-full shadow-lg">
            Featured
          </span>
        </div>
      </div>
    </motion.article>
  );
};