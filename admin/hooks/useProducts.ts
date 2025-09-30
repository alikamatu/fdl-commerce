"use client";

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types/product';
import { productApi } from '@/lib/api/products';

export function useProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
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
      const response = await productApi.createProduct(productData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create product');
      }

      return response.data;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
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

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Create category
  const createCategory = async (categoryData: { name: string; slug: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const data = await response.json();
    await fetchCategories();
    return data;
  };

  // Update category
  const updateCategory = async (id: string, categoryData: { name: string; slug: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    const data = await response.json();
    await fetchCategories();
    return data;
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }

    await fetchCategories();
  };

  // Update product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    const data = await response.json();
    await fetchProducts();
    return data;
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }

    await fetchProducts();
  };

  const uploadImage = async (file: File): Promise<string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  console.log('=== Upload Debug ===');
  console.log('Token exists:', !!token);
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  // Verify token hasn't expired before attempting upload
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = tokenPayload.exp * 1000 < Date.now();
    console.log('Token expired:', isExpired);
    
    if (isExpired) {
      localStorage.removeItem('token');
      throw new Error('Your session has expired. Please login again.');
    }
  } catch (e) {
    console.error('Token validation error:', e);
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('Upload response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error response:', errorText);
    
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please logout and login again.');
    }

    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || 'Upload failed');
    } catch {
      throw new Error(`Upload failed with status ${response.status}`);
    }
  }

  const data = await response.json();
  return data.data?.url || data.url;
};

  return {
    categories,
    loading,
    error,
    createProduct,
    uploadImage,
    clearError: () => setError(null),
    products,
    createCategory,
    updateCategory,
    deleteCategory,
    updateProduct,
    deleteProduct,
    refreshCategories: fetchCategories,
    refreshProducts: fetchProducts,
  };
}