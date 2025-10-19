'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/types/blog.types';

export const useBlogBySlug = (slug: string) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/slug/${slug}`);
        const data = await response.json();

        if (data.success) {
          setBlog(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch blog');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const refetch = () => {
    if (slug) {
      fetchBlog();
    }
  };

  return {
    blog,
    loading,
    error,
    refetch,
  };
};

function fetchBlog() {
    throw new Error('Function not implemented.');
}
