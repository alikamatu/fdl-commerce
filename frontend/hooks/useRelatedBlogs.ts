'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/types/blog.types';

export const useRelatedBlogs = (currentBlog: Blog | null, limit: number = 3) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      if (!currentBlog) return;

      setLoading(true);
      try {
        // Fetch blogs from the same category
        const params = new URLSearchParams({
          limit: limit.toString(),
          category: currentBlog.categories[0] || '',
          exclude: currentBlog._id
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?${params}`);
        const data = await response.json();

        if (data.success) {
          setRelatedBlogs(data.data);
        }
      } catch (error) {
        console.error('Error fetching related blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBlogs();
  }, [currentBlog, limit]);

  return { relatedBlogs, loading };
};