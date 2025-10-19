'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Share2, Bookmark, User } from 'lucide-react';
import { Blog } from '@/types/blog.types';

interface BlogContentProps {
  blog: Blog;
}

export const BlogContent: React.FC<BlogContentProps> = ({ blog }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You can show a toast notification here
    }
  };

  const handleBookmark = () => {
    // Implement bookmark functionality
    console.log('Bookmark blog:', blog._id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <header className="text-center mb-8">
        {/* Categories */}
        {blog.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {blog.categories.map((category, index) => (
              <span
                key={index}
                className="bg-foreground/5 text-foreground/70 text-sm px-3 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-foreground/70 mb-8 leading-relaxed max-w-3xl mx-auto">
          {blog.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-foreground/60 mb-8">
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {blog.authorId?.displayName || 'Forbes Digital LifeLine'}
              </p>
              <p className="text-sm">{blog.authorId?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(blog.publishedAt)}</span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{blog.readingTime} min read</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{blog.viewCount} views</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </header>

      {/* Featured Image */}
      {blog.featuredImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-video rounded-2xl overflow-hidden mb-12"
        >
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="prose prose-lg max-w-none
          prose-headings:text-foreground
          prose-p:text-foreground/80
          prose-strong:text-foreground
          prose-em:text-foreground/70
          prose-blockquote:border-l-foreground/20
          prose-blockquote:text-foreground/70
          prose-ul:text-foreground/80
          prose-ol:text-foreground/80
          prose-li:text-foreground/80
          prose-code:text-foreground
          prose-pre:bg-foreground/5
          prose-a:text-foreground underline hover:text-foreground/70
          prose-hr:border-foreground/10"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Tags */}
      {blog.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-foreground/10"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-foreground/5 text-foreground/70 px-3 py-1 rounded-full text-sm hover:bg-foreground/10 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.article>
  );
};