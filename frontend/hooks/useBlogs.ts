'use client';

import { useState, useEffect, useCallback } from 'react';
import { Blog, BlogsResponse, BlogFilters } from '@/types/blog.types';

export const useBlogs = (filters: BlogFilters = {}) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?${params}`);
      const data: BlogsResponse = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch blogs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const refetch = useCallback(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    loading,
    error,
    pagination,
    refetch,
  };
};