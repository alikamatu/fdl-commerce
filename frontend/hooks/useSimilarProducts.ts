'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface UseSimilarProductsProps {
  categoryId: string;
  currentProductId: string;
  limit?: number;
}

export const useSimilarProducts = ({
  categoryId,
  currentProductId,
  limit = 4
}: UseSimilarProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${categoryId}&limit=${limit + 1}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch similar products');
        }

        const data = await response.json();
        
        if (data.success) {
          // Filter out the current product and limit results
          const filteredProducts = data.data
            .filter((product: Product) => product._id !== currentProductId)
            .slice(0, limit);
          
          setProducts(filteredProducts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSimilarProducts();
    }
  }, [categoryId, currentProductId, limit]);

  return { products, loading, error };
};