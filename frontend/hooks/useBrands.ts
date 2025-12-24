"use client";

import { useState, useEffect, useCallback } from 'react';
import { Brand } from '../types/brand';

// Mock brands data - in real app, this would come from your API
const MOCK_BRANDS: Brand[] = [
  {
    _id: '1',
    name: 'Apple',
    slug: 'apple',
    logoUrl: '/brands/apple.png',
    description: 'Innovative technology and premium devices',
    productCount: 45,
    isActive: true,
  },
  {
    _id: '2',
    name: 'Dell',
    slug: 'dell',
    logoUrl: '/brands/dell.png',
    description: 'Reliable computing solutions for every need',
    productCount: 32,
    isActive: true,
  },
  {
    _id: '3',
    name: 'Samsung',
    slug: 'samsung',
    logoUrl: '/brands/samsung.png',
    description: 'Cutting-edge electronics and appliances',
    productCount: 28,
    isActive: true,
  },
  {
    _id: '4',
    name: 'HP',
    slug: 'hp',
    logoUrl: '/brands/hp.png',
    description: 'Trusted computing and printing solutions',
    productCount: 25,
    isActive: true,
  },
  {
    _id: '5',
    name: 'Lenovo',
    slug: 'lenovo',
    logoUrl: '/brands/lenovo.png',
    description: 'Innovative laptops and desktop computers',
    productCount: 22,
    isActive: true,
  },
  {
    _id: '6',
    name: 'Asus',
    slug: 'asus',
    logoUrl: '/brands/asus.png',
    description: 'Gaming and performance-focused devices',
    productCount: 18,
    isActive: true,
  },
  {
    _id: '7',
    name: 'Microsoft',
    slug: 'microsoft',
    logoUrl: '/brands/ms.png',
    description: 'Software and hardware integration',
    productCount: 15,
    isActive: true,
  },
  {
    _id: '8',
    name: 'Acer',
    slug: 'acer',
    logoUrl: '/brands/acer.png',
    description: 'Affordable and reliable computing',
    productCount: 12,
    isActive: true,
  },
];

interface UseBrandsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useBrands = (options: UseBrandsOptions = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

// Update the useBrands hook fetchBrands function to fix the type issue:
const fetchBrands = useCallback(async (): Promise<void> => {
  try {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBrands(MOCK_BRANDS);
    setLastUpdated(new Date());
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
    console.error('Error fetching brands:', err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchBrands, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchBrands]);

  const getBrandBySlug = useCallback((slug: string) => {
    return brands.find(brand => brand.slug === slug);
  }, [brands]);

  const refetch = useCallback(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    lastUpdated,
    getBrandBySlug,
    refetch,
  };
};