"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  brand?: string;
  isDeal?: boolean;
}

export const useProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Convert URL params (in cents) to dollars for frontend display
  const [filters, setFilters] = useState<ProductFilters>({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 12,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) / 100 : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) / 100 : undefined,
    inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
    sortBy: searchParams.get('sortBy') || 'newest',
    brand: searchParams.get('brand') || undefined,
    isDeal: searchParams.get('isDeal') ? searchParams.get('isDeal') === 'true' : undefined,
  });

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // For price filters, convert dollars to cents for backend
        if (key === 'minPrice' || key === 'maxPrice') {
          // Only set if value is a valid number greater than 0
          if (Number(value) > 0) {
            params.set(key, (Number(value) * 100).toString());
          }
        } else if (key === 'inStock' || key === 'isDeal') {
          // Convert boolean to string
          params.set(key, value.toString());
        } else {
          params.set(key, value.toString());
        }
      }
    });

    // Always ensure page is set
    if (!params.has('page')) {
      params.set('page', '1');
    }

    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [router]);

  return {
    filters,
    updateFilters,
  };
};