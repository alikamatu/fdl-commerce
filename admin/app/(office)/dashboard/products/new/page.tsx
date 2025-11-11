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
  Tag,
  Calendar,
  Plus,
  Image as ImageIcon,
  Info,
  CheckCircle2,
  Zap,
  Percent,
  Layers
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
      currency: 'GHC',
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
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 mt-0.5 mr-3 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800">
                  No Categories Available
                </h3>
                <p className="text-amber-700 mt-1">
                  Please create at least one category before adding products.
                </p>
                <button
                  onClick={() => router.push('/dashboard/categories')}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm mt-1"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Product
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Create a new product for your store catalog
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-gray-700">Basic Info</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-gray-500">Pricing</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm text-gray-500">Media</span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    SKU *
                  </label>
                  <input
                    {...register('sku', { 
                      required: 'SKU is required',
                      minLength: { value: 3, message: 'SKU must be at least 3 characters' },
                      maxLength: { value: 50, message: 'SKU cannot exceed 50 characters' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="PROD-001"
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sku.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Product Name *
                  </label>
                  <input
                    {...register('title', { 
                      required: 'Product name is required',
                      maxLength: { value: 200, message: 'Product name cannot exceed 200 characters' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="MacBook Pro 16"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Brand *
                  </label>
                  <input
                    {...register('brand', { 
                      required: 'Brand is required',
                      maxLength: { value: 100, message: 'Brand name cannot exceed 100 characters' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="Apple"
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.brand.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Category *
                  </label>
                  <select
                    {...register('categoryId', { required: 'Category is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                  })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                  placeholder="Detailed product description highlighting key features and benefits..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Describe your product in detail to help customers make informed decisions</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing & Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-xl">
                <span className='text-green-600 text-xl'>₵</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Pricing & Inventory
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">₵</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="99999"
                    {...register('price', { 
                      required: 'Price is required',
                      min: { value: 0.01, message: 'Price must be greater than 0' },
                      max: { value: 99999, message: 'Price cannot exceed GH₵99,999' }
                    })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="1999.99"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Currency *
                </label>
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                >
                  <option value="GHC">GHC (₵)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                {errors.currency && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currency.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('stock', { 
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="100"
                />
                {errors.stock && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Deal & Discount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Deal & Discount
              </h2>
            </div>
            
            <div className="space-y-6">
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register('isDeal')}
                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-lg font-semibold text-gray-900">This product is on sale</span>
                </div>
              </label>

              {watchIsDeal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-blue-600" />
                    Sale Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Original Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">₵</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register('originalPrice')}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="2499.99"
                        />
                      </div>
                      {watchOriginalPrice && watchPrice && calculatedDiscount() > 0 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          Discount: {calculatedDiscount()}% OFF
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Discount %
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="99"
                          {...register('discountPercent')}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          placeholder="20"
                        />
                      </div>
                      {watchDiscountPercent && watchPrice && calculatedOriginalPrice() > 0 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          Original: ₵{calculatedOriginalPrice().toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Deal Expires
                      </label>
                      <input
                        type="datetime-local"
                        {...register('dealExpiresAt')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-xl">
                <ImageIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Product Images *
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {imageFiles.map((imageFile) => (
                <motion.div
                  key={imageFile.id}
                  layout
                  className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-200"
                >
                  <img
                    src={imageFile.preview}
                    alt={`Preview`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Status Overlay */}
                  {imageFile.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                  
                  {imageFile.uploaded && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  
                  {imageFile.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removeImage(imageFile.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </motion.button>
                </motion.div>
              ))}

              {/* Upload Button */}
              {imageFiles.length < MAX_IMAGES && (
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 group"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-500 group-hover:text-blue-600 text-center px-2">
                    Upload Images
                  </span>
                </motion.label>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <Info className="w-4 h-4" />
              <div>
                <p>
                  {imageFiles.length} of {MAX_IMAGES} images selected • 
                  Max 5MB per image • 
                  Supported formats: JPEG, PNG, WebP
                </p>
                <p className="mt-1 text-amber-600 font-medium">
                  First image will be used as the main product image
                </p>
              </div>
            </div>
          </motion.div>

          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Layers className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Specifications
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addSpecification}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Specification</span>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex-1">
                    <input
                      placeholder="Key (e.g., Processor)"
                      value={spec.key}
                      onChange={(e) => updateSpecification(spec.id, 'key', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      maxLength={100}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      placeholder="Value (e.g., Intel Core i9)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(spec.id, 'value', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      maxLength={500}
                    />
                  </div>
                  {specifications.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeSpecification(spec.id)}
                      className="p-3 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end space-x-4 pt-6 border-t border-gray-200"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-8 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting || imageFiles.length === 0}
              className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span className="text-lg">
                {submitting ? 'Creating Product...' : 'Create Product'}
              </span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}