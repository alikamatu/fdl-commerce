'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { useBlogBySlug } from '@/hooks/useBlogBySlug';
import { useRelatedBlogs } from '@/hooks/useRelatedBlogs';
import { BlogContent } from '@/components/blogs/BlogContent';
import { RelatedBlogs } from '@/components/blogs/RelatedBlogs';
import { BlogNavigation } from '@/components/blogs/BlogNavigation';
import { BlogLoading } from '@/components/blogs/BlogLoading';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { blog, loading, error } = useBlogBySlug(slug);
  const { relatedBlogs, loading: relatedLoading } = useRelatedBlogs(blog);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
            <div className="h-4 bg-foreground/10 rounded w-16 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-4 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-32 animate-pulse" />
          </div>
          <BlogLoading />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
            <button
              onClick={() => router.push('/blogs')}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home size={16} />
              Blogs
            </button>
            <ChevronLeft size={16} />
            <span className="text-foreground">Error</span>
          </nav>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Blog Not Found
            </h1>
            <p className="text-foreground/60 mb-8 max-w-md mx-auto">
              {error || "The blog you're looking for doesn't exist or may have been moved."}
            </p>
            <button
              onClick={() => router.push('/blogs')}
              className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Back to Blogs
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home size={16} />
            Home
          </button>
          <ChevronLeft size={16} />
          <button
            onClick={() => router.push('/blogs')}
            className="hover:text-foreground transition-colors"
          >
            Blogs
          </button>
          <ChevronLeft size={16} />
          <span className="text-foreground line-clamp-1">{blog.title}</span>
        </nav>

        {/* Main Content */}
        <BlogContent blog={blog} />

        {/* Blog Navigation */}
        <BlogNavigation
          previousBlog={null} // You would fetch these from an API
          nextBlog={null}    // You would fetch these from an API
        />

        {/* Related Blogs */}
        <RelatedBlogs
          blogs={relatedBlogs}
          loading={relatedLoading}
          currentBlogId={blog._id}
        />

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center py-12 bg-foreground/5 rounded-2xl"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Enjoyed this article?
          </h2>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Discover more insightful content in our blog collection.
          </p>
          <button
            onClick={() => router.push('/blogs')}
            className="px-8 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            Explore More Blogs
          </button>
        </motion.section>
      </div>
    </motion.div>
  );
}