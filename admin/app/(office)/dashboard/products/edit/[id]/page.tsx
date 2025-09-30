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
  Image as ImageIcon
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

      if (imageFiles.length + newFiles.length >= 5) {
        alert('Maximum 5 images allowed');
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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="mb-4">The product you're trying to edit doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/products')}
            className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/dashboard/products/${productId}`)}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-light tracking-tight flex items-center">
              <Package className="w-8 h-8 mr-3" />
              Edit Product
            </h1>
            <p className="text-lg mt-2">
              Update product details
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-none p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                SKU *
              </label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="PROD-001"
              />
              {errors.sku && (
                <p className="text-sm mt-1">{errors.sku.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                {...register('title', { required: 'Product name is required' })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="MacBook Pro 16"
              />
              {errors.title && (
                <p className="text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="Detailed product description..."
              />
              {errors.description && (
                <p className="text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand *
              </label>
              <input
                {...register('brand', { required: 'Brand is required' })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="Apple"
              />
              {errors.brand && (
                <p className="text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm mt-1">{errors.categoryId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="rounded-none p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing & Inventory
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="1999.99"
              />
              {errors.price && (
                <p className="text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Currency *
              </label>
              <select
                {...register('currency', { required: 'Currency is required' })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              {errors.currency && (
                <p className="text-sm mt-1">{errors.currency.message}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <Box className="w-4 h-4 mr-2" />
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register('stock', { 
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock cannot be negative' }
                })}
                className="w-full px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                placeholder="100"
              />
              {errors.stock && (
                <p className="text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-none p-6 border">
          <h2 className="text-lg font-semibold mb-4">
            Product Images *
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {imageFiles.map((imageFile, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageFile.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-none border-2"
                />
                
                {/* Status Overlay */}
                {imageFile.uploading && (
                  <div className="absolute inset-0 bg-current bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-background"></div>
                  </div>
                )}
                
                {imageFile.uploaded && (
                  <div className="absolute top-1 left-1 bg-background border rounded-none p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {imageFile.error && (
                  <div className="absolute inset-0 bg-current bg-opacity-75 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-background" />
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-background border rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {imageFile.error && (
                  <p className="text-xs mt-1">{imageFile.error}</p>
                )}
              </div>
            ))}

            {/* Upload Button */}
            {imageFiles.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-none cursor-pointer transition-colors hover:border-current">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-sm">Upload</span>
              </label>
            )}
          </div>
          
          <p className="text-sm mt-4">
            {imageFiles.length} of 5 images selected
          </p>
        </div>

        {/* Specifications */}
        <div className="rounded-none p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Specifications
            </h2>
            <button
              type="button"
              onClick={addSpecification}
              className="px-4 py-2 text-sm border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Add Specification
            </button>
          </div>
          
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  placeholder="Key (e.g., Processor)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                />
                <input
                  placeholder="Value (e.g., Intel Core i9)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/products/${productId}`)}
            disabled={submitting}
            className="px-6 py-3 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || imageFiles.length === 0}
            className="flex items-center space-x-2 px-6 py-3 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Updating...' : 'Update Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}