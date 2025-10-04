'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  X, 
  AlertCircle, 
  Upload,
  DollarSign,
  Hash,
  Tag,
  Calendar
} from 'lucide-react';

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  sku: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  categoryId: string;
  brand: string;
  stock: string;
  originalPrice?: string;
  discountPercent?: string;
  isDeal: boolean;
  dealExpiresAt?: string;
}

interface ProductSpecification {
  id: string;
  key: string;
  value: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

// Constants
const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Validation helpers
const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return 'File must be an image (JPEG, PNG, WebP)';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB';
  }
  
  return null;
};

const generateId = (): string => Math.random().toString(36).substr(2, 9);

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { id: generateId(), key: '', value: '' }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    trigger,
  } = useForm<ProductFormData>({
    defaultValues: {
      currency: 'USD',
      isDeal: false,
    },
    mode: 'onBlur'
  });

  const watchIsDeal = watch('isDeal');
  const watchPrice = watch('price');
  const watchOriginalPrice = watch('originalPrice');
  const watchDiscountPercent = watch('discountPercent');

  // Calculate derived values
  const calculatedDiscount = useCallback(() => {
    if (!watchOriginalPrice || !watchPrice) return 0;
    
    const original = parseFloat(watchOriginalPrice);
    const current = parseFloat(watchPrice);
    
    if (original <= current) return 0;
    
    return Math.round(((original - current) / original) * 100);
  }, [watchOriginalPrice, watchPrice]);

  const calculatedOriginalPrice = useCallback(() => {
    if (!watchDiscountPercent || !watchPrice) return 0;
    
    const discount = parseFloat(watchDiscountPercent);
    const current = parseFloat(watchPrice);
    
    if (discount <= 0 || discount >= 100) return 0;
    
    return current / (1 - discount / 100);
  }, [watchDiscountPercent, watchPrice]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.status}`);
      }

      const data = await response.json();
      setCategories(data.data || data);
    } catch (error) {
      console.error('Error loading categories:', error);
      throw new Error('Failed to load categories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth token management
  const getAuthToken = useCallback((): string => {
    if (typeof window === 'undefined') {
      throw new Error('Not in browser environment');
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated. Please login to continue.');
    }

    // Validate token format
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
    } catch (error) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      throw new Error('Invalid authentication token. Please login again.');
    }

    return token;
  }, []);

  // Image handling
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    const validFiles: ImageFile[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validationError = validateImageFile(file);
      
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      if (imageFiles.length + validFiles.length >= MAX_IMAGES) {
        errors.push(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const preview = URL.createObjectURL(file);
      validFiles.push({
        id: generateId(),
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    });

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
    }

    event.target.value = '';
  }, [imageFiles.length]);

  const removeImage = useCallback((id: string) => {
    setImageFiles(prev => {
      const fileToRemove = prev.find(img => img.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  // Image upload
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const token = getAuthToken();

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Authentication failed. Please login again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data?.url || data.url;
  }, [getAuthToken]);

  const uploadAllImages = useCallback(async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const imageFile of imageFiles) {
      if (imageFile.uploaded && imageFile.url) {
        uploadedUrls.push(imageFile.url);
        continue;
      }

      try {
        setImageFiles(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, uploading: true, error: undefined }
            : img
        ));

        const url = await uploadImage(imageFile.file);
        uploadedUrls.push(url);

        setImageFiles(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, uploading: false, uploaded: true, url }
            : img
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setImageFiles(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, uploading: false, error: errorMessage }
            : img
        ));

        throw new Error(`Failed to upload ${imageFile.file.name}: ${errorMessage}`);
      }
    }

    return uploadedUrls;
  }, [imageFiles, uploadImage]);

  // Specifications management
  const addSpecification = useCallback(() => {
    setSpecifications(prev => [...prev, { id: generateId(), key: '', value: '' }]);
  }, []);

  const updateSpecification = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setSpecifications(prev => prev.map(spec => 
      spec.id === id ? { ...spec, [field]: value } : spec
    ));
  }, []);

  const removeSpecification = useCallback((id: string) => {
    setSpecifications(prev => prev.filter(spec => spec.id !== id));
  }, []);

  // Form submission
  const onSubmit = async (data: ProductFormData) => {
    if (!await trigger()) {
      alert('Please fix form errors before submitting');
      return;
    }

    if (imageFiles.length === 0) {
      alert('Please select at least one product image');
      return;
    }

    const failedImages = imageFiles.filter(img => img.error);
    if (failedImages.length > 0) {
      alert('Some images have upload errors. Please remove them or try again.');
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = await uploadAllImages();

      const productData = {
        sku: data.sku.trim(),
        title: data.title.trim(),
        description: data.description.trim(),
        priceCents: Math.round(parseFloat(data.price) * 100),
        currency: data.currency,
        categoryId: data.categoryId,
        brand: data.brand.trim(),
        stock: parseInt(data.stock),
        images: imageUrls.map((url, index) => ({
          url,
          alt: data.title,
          position: index,
        })),
        specifications: specifications
          .filter(spec => spec.key.trim() && spec.value.trim())
          .map(spec => ({
            key: spec.key.trim(),
            value: spec.value.trim(),
          })),
        isDeal: data.isDeal,
        ...(data.isDeal && {
          originalPriceCents: data.originalPrice ? Math.round(parseFloat(data.originalPrice) * 100) : undefined,
          discountPercent: data.discountPercent ? parseFloat(data.discountPercent) : undefined,
          dealExpiresAt: data.dealExpiresAt ? new Date(data.dealExpiresAt) : undefined,
        }),
      };

      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create product: ${response.status}`);
      }

      alert('Product created successfully!');
      router.push('/dashboard/products');

    } catch (error) {
      console.error('Product creation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // Effects
  useEffect(() => {
    loadCategories().catch(error => {
      alert(error.message);
    });
  }, [loadCategories]);

  useEffect(() => {
    return () => {
      imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [imageFiles]);

  // Auto-calculate discount/original price
  useEffect(() => {
    if (watchIsDeal && watchOriginalPrice && watchPrice) {
      const discount = calculatedDiscount();
      if (discount > 0 && discount <= 100) {
        setValue('discountPercent', discount.toString());
      }
    }
  }, [watchOriginalPrice, watchPrice, watchIsDeal, calculatedDiscount, setValue]);

  useEffect(() => {
    if (watchIsDeal && watchDiscountPercent && watchPrice) {
      const original = calculatedOriginalPrice();
      if (original > parseFloat(watchPrice)) {
        setValue('originalPrice', original.toFixed(2));
      }
    }
  }, [watchDiscountPercent, watchPrice, watchIsDeal, calculatedOriginalPrice, setValue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mt-0.5 mr-3 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                No Categories Available
              </h3>
              <p className="text-sm mt-1 text-yellow-700">
                Please create at least one category before adding products.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new product for your store
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  {...register('sku', { 
                    required: 'SKU is required',
                    minLength: { value: 3, message: 'SKU must be at least 3 characters' },
                    maxLength: { value: 50, message: 'SKU cannot exceed 50 characters' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PROD-001"
                />
                {errors.sku && (
                  <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('title', { 
                    required: 'Product name is required',
                    maxLength: { value: 200, message: 'Product name cannot exceed 200 characters' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MacBook Pro 16"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed product description..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  {...register('brand', { 
                    required: 'Brand is required',
                    maxLength: { value: 100, message: 'Brand name cannot exceed 100 characters' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apple"
                />
                {errors.brand && (
                  <p className="text-sm text-red-600 mt-1">{errors.brand.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing & Inventory
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' },
                    max: { value: 10000, message: 'Price cannot exceed $10,000' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1999.99"
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                {errors.currency && (
                  <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('stock', { 
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
                {errors.stock && (
                  <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deal & Discount */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Deal & Discount
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('isDeal')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">This product is on sale</span>
              </label>

              {watchIsDeal && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register('originalPrice')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2499.99"
                    />
                    {watchOriginalPrice && watchPrice && calculatedDiscount() > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Discount: {calculatedDiscount()}%
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount %
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="99"
                      {...register('discountPercent')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="20"
                    />
                    {watchDiscountPercent && watchPrice && calculatedOriginalPrice() > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Original: ${calculatedOriginalPrice().toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Deal Expires
                    </label>
                    <input
                      type="datetime-local"
                      {...register('dealExpiresAt')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Product Images *
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imageFiles.map((imageFile) => (
                <div key={imageFile.id} className="relative group">
                  <img
                    src={imageFile.preview}
                    alt={`Preview`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  
                  {/* Status Overlay */}
                  {imageFile.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {imageFile.uploaded && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {imageFile.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center rounded-lg">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(imageFile.id)}
                    className="absolute -top-2 -right-2 p-1 bg-white border border-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {imageFiles.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 mb-1 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload</span>
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              {imageFiles.length} of {MAX_IMAGES} images selected • Max 5MB per image • JPEG, PNG, WebP
            </p>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Specifications
              </h2>
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Specification
              </button>
            </div>
            
            <div className="space-y-3">
              {specifications.map((spec) => (
                <div key={spec.id} className="flex items-center space-x-3">
                  <input
                    placeholder="Key (e.g., Processor)"
                    value={spec.key}
                    onChange={(e) => updateSpecification(spec.id, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={100}
                  />
                  <input
                    placeholder="Value (e.g., Intel Core i9)"
                    value={spec.value}
                    onChange={(e) => updateSpecification(spec.id, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={500}
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(spec.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || imageFiles.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Creating Product...' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}