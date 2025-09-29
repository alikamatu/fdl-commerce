// hooks/useProducts.ts - UPDATED
"use client";

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types/product';
import { useAuth } from '@/context/AuthContext';

export function useProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const { getAccessToken } = useAuth();
  

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data.data || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!getAccessToken) {
        throw new Error('No authentication getAccessToken available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create product: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
    const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.data || data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  // Upload image - FIXED VERSION
  const uploadImage = async (file: File): Promise<string> => {
    if (!getAccessToken) {
      throw new Error('No authentication getAccessToken available. Please login again.');
    }

    console.log('=== Upload Debug ===');
    console.log('Token exists:', !!getAccessToken);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${getAccessToken}`,
          // Don't set Content-Type for FormData, let browser set it
        },
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please logout and login again.');
        }
        
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Upload failed: ${response.status}`);
        } catch {
          throw new Error(`Upload failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Upload successful response:', data);
      
      // Handle different response structures
      if (data.data && data.data.url) {
        return data.data.url;
      } else if (data.url) {
        return data.url;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.data || data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  };

  // ... rest of your existing functions

  return {
    categories,
    loading,
    error,
    createProduct,
    uploadImage,
    clearError: () => setError(null),
    products,
    refreshCategories: fetchCategories,
    refreshProducts: fetchProducts,
  };
}