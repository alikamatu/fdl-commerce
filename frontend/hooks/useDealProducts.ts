"use client";

import { useState, useEffect } from 'react';
import { Product } from '../types/product';

export const useDealProducts = (limit: number = 10) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/deals?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch deal products: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        } else {
          throw new Error('Failed to fetch deal products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDealProducts();
  }, [limit]);

  return {
    products,
    loading,
    error,
  };
};