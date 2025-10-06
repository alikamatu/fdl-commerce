import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  brand?: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.category) params.append('category', filters.category);
      if (filters?.brand) params.append('brand', filters.brand);
      if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters?.search) params.append('q', encodeURIComponent(filters.search));
      if (filters?.inStock !== undefined) params.append('inStock', String(filters.inStock));

      console.log('Fetching products with params:', params.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data: ProductsResponse = await response.json();
      
      console.log('Products response:', data);
      
      if (data.success) {
        setProducts(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
      } else {
        setProducts([]);
        setPagination({ total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    filters?.page,
    filters?.limit,
    filters?.category,
    filters?.search,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.inStock,
  ]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
}