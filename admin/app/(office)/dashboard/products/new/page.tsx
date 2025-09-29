'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Package, ArrowLeft, Save, X, AlertCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAlert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Form/Input';
import { Textarea } from '@/components/ui/Form/Textarea';
import { Select } from '@/components/ui/Form/Select';
import { Product, ProductSpecification } from '@/types/product';
import ImageUpload from '@/components/ui/ImageUpload';

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

function AddProductForm() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const { categories, loading, createProduct, uploadImage } = useProducts();
  
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { key: '', value: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      currency: 'USD',
    }
  });

  // Debug: Watch category selection
  const selectedCategory = watch('categoryId');

  useEffect(() => {
    console.log('Categories loaded:', categories);
    console.log('Selected category:', selectedCategory);
  }, [categories, selectedCategory]);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      console.log('Uploading image:', file.name, file.size, file.type);
      const imageUrl = await uploadImage(file);
      console.log('Image uploaded successfully:', imageUrl);
      
      addAlert({
        type: 'success',
        title: 'Success',
        message: 'Image uploaded successfully',
      });

      return imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      addAlert({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload image',
      });
      throw error;
    }
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
    console.log('Form submitted with data:', data);

    // Validation
    if (images.length === 0) {
      addAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please upload at least one product image',
      });
      return;
    }

    if (!data.categoryId) {
      addAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a category',
      });
      return;
    }

    setSubmitting(true);
    try {
      const productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'> = {
        sku: data.sku,
        title: data.title,
        description: data.description,
        priceCents: Math.round(parseFloat(data.price) * 100),
        currency: data.currency,
        categoryId: data.categoryId,
        brand: data.brand,
        stock: parseInt(data.stock),
        images: images.map((url, index) => ({
          url,
          alt: data.title,
          position: index,
        })),
        specifications: specifications.filter(spec => spec.key && spec.value),
      };

      console.log('Creating product:', productData);
      await createProduct(productData);
      
      addAlert({
        type: 'success',
        title: 'Success!',
        message: 'Product created successfully',
      });

      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);

    } catch (error) {
      console.error('Product creation error:', error);
      addAlert({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create product',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.name,
  }));

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show error if no categories
  if (!loading && categories.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                No Categories Available
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please create at least one category before adding products.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Add New Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new product for your store
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="SKU"
              {...register('sku', { required: 'SKU is required' })}
              error={errors.sku?.message}
              placeholder="PROD-001"
            />
            
            <Input
              label="Product Name"
              {...register('title', { required: 'Product name is required' })}
              error={errors.title?.message}
              placeholder="MacBook Pro 16"
            />
            
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                {...register('description', { required: 'Description is required' })}
                error={errors.description?.message}
                placeholder="Detailed product description..."
              />
            </div>
            
            <Input
              label="Brand"
              {...register('brand', { required: 'Brand is required' })}
              error={errors.brand?.message}
              placeholder="Apple"
            />
            
            <div>
              <Select
                label="Category"
                options={categoryOptions}
                {...register('categoryId', { required: 'Category is required' })}
                error={errors.categoryId?.message}
              />
              {/* Debug info */}
              {selectedCategory && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Selected: {categories.find(c => c._id === selectedCategory)?.name}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pricing & Inventory */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pricing & Inventory
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Price"
              type="number"
              step="0.01"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' }
              })}
              error={errors.price?.message}
              placeholder="1999.99"
            />
            
            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
              ]}
              {...register('currency', { required: 'Currency is required' })}
              error={errors.currency?.message}
            />
            
            <Input
              label="Stock Quantity"
              type="number"
              {...register('stock', { 
                required: 'Stock quantity is required',
                min: { value: 0, message: 'Stock cannot be negative' }
              })}
              error={errors.stock?.message}
              placeholder="100"
            />
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Product Images
          </h2>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            onImageUpload={handleImageUpload}
            maxImages={5}
          />
        </motion.div>

        {/* Specifications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  placeholder="Key (e.g., Processor)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g., Intel Core i9)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Creating...' : 'Create Product'}</span>
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default function AddProductPage() {
  return (
      <AddProductForm />
  );
}