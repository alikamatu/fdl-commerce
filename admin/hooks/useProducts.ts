"use client";

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types/product';
import { productApi } from '@/lib/api/products';

export function useProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 100, // Increase limit to get more products
    hasMore: false
  });

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

  const fetchProducts = async (page: number = 1, limit: number = 100) => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      if (page === 1) {
        // First page, replace products
        setProducts(data.data || data.products || []);
      } else {
        // Subsequent pages, append products
        setProducts(prev => [...prev, ...(data.data || data.products || [])]);
      }

      // Update pagination info
      if (data.pagination) {
        setPagination({
          page: data.pagination.page || page,
          total: data.pagination.total || 0,
          totalPages: data.pagination.totalPages || 1,
          limit: data.pagination.limit || limit,
          hasMore: (data.pagination.page || page) < (data.pagination.totalPages || 1)
        });
      }

      return data;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      throw err;
    }
  };

  // Load all products (with increased limit)
  const loadAllProducts = async () => {
    try {
      setLoading(true);
      await fetchProducts(1, 1000); // Load up to 1000 products
    } catch (err) {
      console.error('Error loading all products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - use loadAllProducts instead of fetchProducts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), loadAllProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

const createCategory = async (categoryData: { name: string; slug: string; image?: File }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const formData = new FormData();
  formData.append('name', categoryData.name);
  formData.append('slug', categoryData.slug);
  if (categoryData.image) {
    formData.append('image', categoryData.image);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }

  const data = await response.json();
  await fetchCategories();
  return data;
};

  const uploadCategoryImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
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

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please logout and login again.');
    }
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return {
    url: data.data?.url || data.url,
    publicId: data.data?.publicId || data.publicId
  };
};

  const updateCategory = async (id: string, categoryData: { name: string; slug: string; image?: File }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const formData = new FormData();
  formData.append('name', categoryData.name);
  formData.append('slug', categoryData.slug);
  if (categoryData.image) {
    formData.append('image', categoryData.image);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
    uploadCategoryImage,
    updateCategory,
    deleteCategory,
    updateProduct,
    deleteProduct,
    refreshCategories: fetchCategories,
    refreshProducts: loadAllProducts, // Use loadAllProducts for refresh
    pagination,
    fetchMoreProducts: () => fetchProducts(pagination.page + 1, pagination.limit)
  };
}