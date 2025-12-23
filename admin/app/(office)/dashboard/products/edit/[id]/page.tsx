'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  X, 
  AlertCircle, 
  Upload,
  DollarSign,
  Tag,
  Box,
  Image as ImageIcon,
  Percent,
  Calendar,
  Zap,
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Product, Category, ProductSpecification } from '@/types/product';
import { useAlert } from '@/components/ui/Alert';

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

interface ImageFile {
  file?: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const { addAlert } = useAlert();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>();

  const watchIsDeal = watch('isDeal');
  const watchPrice = watch('price');
  const watchOriginalPrice = watch('originalPrice');
  const watchDiscountPercent = watch('discountPercent');

  // Calculate derived values
  const calculatedDiscount = () => {
    if (!watchOriginalPrice || !watchPrice) return 0;
    
    const original = parseFloat(watchOriginalPrice);
    const current = parseFloat(watchPrice);
    
    if (original <= current) return 0;
    
    return Math.round(((original - current) / original) * 100);
  };

  const calculatedOriginalPrice = () => {
    if (!watchDiscountPercent || !watchPrice) return 0;
    
    const discount = parseFloat(watchDiscountPercent);
    const current = parseFloat(watchPrice);
    
    if (discount <= 0 || discount >= 100) return 0;
    
    return current / (1 - discount / 100);
  };

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProduct(), fetchCategories()]);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load product data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    const productData = data.data || data;
    setProduct(productData);

    // Set form values
    setValue('sku', productData.sku);
    setValue('title', productData.title);
    setValue('description', productData.description);
    setValue('price', (productData.priceCents / 100).toString());
    setValue('currency', productData.currency);
    setValue('categoryId', productData.categoryId);
    setValue('brand', productData.brand);
    setValue('stock', productData.stock.toString());
    setValue('isDeal', productData.isDeal || false);
    setValue('originalPrice', productData.originalPriceCents ? (productData.originalPriceCents / 100).toString() : '');
    setValue('discountPercent', productData.discountPercent?.toString() || '');
    setValue('dealExpiresAt', productData.dealExpiresAt ? new Date(productData.dealExpiresAt).toISOString().slice(0, 16) : '');

    // Set images
    const existingImages: ImageFile[] = productData.images.map((img: any) => ({
      preview: img.url,
      uploading: false,
      uploaded: true,
      url: img.url
    }));
    setImageFiles(existingImages);

    // Set specifications
    setSpecifications(productData.specifications || []);
  };

  const fetchCategories = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    setCategories(data.data || data);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: ImageFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      if (imageFiles.length + newFiles.length >= 10) {
        alert('Maximum 10 images allowed');
        break;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    }

    setImageFiles([...imageFiles, ...newFiles]);
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    if (!newFiles[index].uploaded) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  const getAuthToken = (): string => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      if (!sessionToken) {
        throw new Error('Not authenticated. Please login to continue.');
      }
      return sessionToken;
    }
    
    return token;
  };

  const uploadImage = async (file: File): Promise<string> => {
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
      const errorText = await response.text();
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        throw new Error('Authentication failed. Please logout and login again.');
      }

      const error = await response.json().catch(() => ({ message: errorText }));
      throw new Error(error.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.url || data.url;
  };

  const uploadAllImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      
      if (imageFile.uploaded && imageFile.url) {
        uploadedUrls.push(imageFile.url);
        continue;
      }

      if (!imageFile.file) continue;

      try {
        setImageFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: true, error: undefined };
          return updated;
        });

        const url = await uploadImage(imageFile.file);
        uploadedUrls.push(url);

        setImageFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: false, uploaded: true, url };
          return updated;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setImageFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: false, error: errorMessage };
          return updated;
        });

        throw new Error(`Failed to upload image: ${errorMessage}`);
      }
    }

    return uploadedUrls;
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
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
        sku: data.sku,
        title: data.title,
        description: data.description,
        priceCents: Math.round(parseFloat(data.price) * 100),
        currency: data.currency,
        categoryId: data.categoryId,
        brand: data.brand,
        stock: parseInt(data.stock),
        images: imageUrls.map((url, index) => ({
          url,
          alt: data.title,
          position: index,
        })),
        specifications: specifications.filter(spec => spec.key && spec.value),
       ...(data.isDeal ? {
      originalPriceCents: data.originalPrice ? Math.round(parseFloat(data.originalPrice) * 100) : undefined,
      discountPercent: data.discountPercent ? parseFloat(data.discountPercent) : undefined,
      dealExpiresAt: data.dealExpiresAt ? new Date(data.dealExpiresAt) : undefined,
    } : {
      originalPriceCents: null,
      discountPercent: 0,
      dealExpiresAt: null,
    }),
  };

      const token = getAuthToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update product');
      }

      addAlert({
        type: 'success',
        title: 'Success!',
        message: 'Product updated successfully',
      });
      
      router.push(`/dashboard/products/${productId}`);

    } catch (error) {
      console.error('Product update error:', error);
      addAlert({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update product'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-calculate discount/original price
  useEffect(() => {
    if (watchIsDeal && watchOriginalPrice && watchPrice) {
      const discount = calculatedDiscount();
      if (discount > 0 && discount <= 100) {
        setValue('discountPercent', discount.toString());
      }
    }
  }, [watchOriginalPrice, watchPrice, watchIsDeal, setValue]);

  useEffect(() => {
    if (watchIsDeal && watchDiscountPercent && watchPrice) {
      const original = calculatedOriginalPrice();
      if (original > parseFloat(watchPrice)) {
        setValue('originalPrice', original.toFixed(2));
      }
    }
  }, [watchDiscountPercent, watchPrice, watchIsDeal, setValue]);

  useEffect(() => {
    return () => {
      imageFiles.forEach(img => {
        if (!img.uploaded) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-6">The product you&#39;re trying to edit doesn&#39;t exist.</p>
            <button
              onClick={() => router.push('/dashboard/products')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Back to Products
            </button>
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
              onClick={() => router.push(`/dashboard/products/${productId}`)}
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
                  Edit Product
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Update product details and specifications
              </p>
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
                    {...register('sku', { required: 'SKU is required' })}
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
                    {...register('title', { required: 'Product name is required' })}
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
                    {...register('brand', { required: 'Brand is required' })}
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
                  {...register('description', { required: 'Description is required' })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                  placeholder="Detailed product description..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
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
                <span className="w-5 h-5 text-green-600">₵</span>
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
          {/* <motion.div
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
          </motion.div> */}

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
              {imageFiles.map((imageFile, index) => (
                <motion.div
                  key={index}
                  layout
                  className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-200"
                >
                  <img
                    src={imageFile.preview}
                    alt={`Preview ${index + 1}`}
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
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </motion.button>
                </motion.div>
              ))}

              {/* Upload Button */}
              {imageFiles.length < 10 && (
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 group"
                >
                  <input
                    type="file"
                    accept="image/*"
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
                  {imageFiles.length} of 10 images selected • 
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
                <span>Add Specification</span>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex-1">
                    <input
                      placeholder="Key (e.g., Processor)"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      placeholder="Value (e.g., Intel Core i9)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>
                  {specifications.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeSpecification(index)}
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
              onClick={() => router.push(`/dashboard/products/${productId}`)}
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
                {submitting ? 'Updating Product...' : 'Update Product'}
              </span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}