"use client";

import { useState, useEffect } from 'react';
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
    logoUrl: '/api/placeholder/120/120',
    description: 'Innovative laptops and desktop computers',
    productCount: 22,
    isActive: true,
  },
  {
    _id: '6',
    name: 'Asus',
    slug: 'asus',
    logoUrl: '/api/placeholder/120/120',
    description: 'Gaming and performance-focused devices',
    productCount: 18,
    isActive: true,
  },
  {
    _id: '7',
    name: 'Microsoft',
    slug: 'microsoft',
    logoUrl: '/api/placeholder/120/120',
    description: 'Software and hardware integration',
    productCount: 15,
    isActive: true,
  },
  {
    _id: '8',
    name: 'Acer',
    slug: 'acer',
    logoUrl: '/api/placeholder/120/120',
    description: 'Affordable and reliable computing',
    productCount: 12,
    isActive: true,
  },
];

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchBrands = async () => {
      try {
        setLoading(true);
        // In real app: const response = await fetch('/api/brands');
        // const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setBrands(MOCK_BRANDS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const getBrandBySlug = (slug: string) => {
    return brands.find(brand => brand.slug === slug);
  };

  return {
    brands,
    loading,
    error,
    getBrandBySlug,
  };
};