"use client";

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

export const useRecommendedProducts = (category?: string, limit: number = 10) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams();
        if (category) queryParams.append('category', category);
        queryParams.append('limit', limit.toString());
        queryParams.append('page', '1');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommended products: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // Take only the first 'limit' products
          setProducts(data.data.slice(0, limit));
        } else {
          throw new Error('Failed to fetch recommended products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [category, limit]);

  return {
    products,
    loading,
    error,
  };
};