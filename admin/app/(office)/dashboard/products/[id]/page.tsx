'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Tag, 
  Box, 
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  RefreshCw,
  Folder,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Product } from '@/types/product';
import { useAlert } from '@/components/ui/Alert';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addAlert } = useAlert();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data.data || data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      setError(message);
      addAlert({
        type: 'error',
        title: 'Error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      addAlert({
        type: 'success',
        title: 'Success!',
        message: 'Product deleted successfully',
      });
      
      router.push('/dashboard/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      addAlert({
        type: 'error',
        title: 'Error',
        message: message
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return `$${((priceCents || 0) / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-100 text-red-800 border-red-200' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'In Stock', style: 'bg-green-100 text-green-800 border-green-200' };
  };

  const getProductStatus = (product: Product) => {
    if (!product.isActive) return { text: 'Inactive', style: 'bg-gray-100 text-gray-800 border-gray-200' };
    if (product.isDeal) return { text: 'On Deal', style: 'bg-purple-100 text-purple-800 border-purple-200' };
    return { text: 'Active', style: 'bg-green-100 text-green-800 border-green-200' };
  };

  const isDealActive = (dealExpiresAt?: string) => {
    if (!dealExpiresAt) return false;
    return new Date(dealExpiresAt) > new Date();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load product
          </h3>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={fetchProduct}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard/products')}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="mb-4">The product you're looking for doesn't exist.</p>
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

  const stockStatus = getStockStatus(product.stock);
  const productStatus = getProductStatus(product);
  const mainImage = product.images?.[activeImageIndex];
  const activeDeal = product.isDeal && isDealActive(product.dealExpiresAt);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-light tracking-tight flex items-center">
              <Package className="w-8 h-8 mr-3" />
              {product.title}
            </h1>
            <p className="text-lg mt-2">
              Product Details
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchProduct}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-none p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <p className="text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="border rounded-none overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={mainImage.alt || product.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center">
                <ImageIcon className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`border rounded-none overflow-hidden ${
                    activeImageIndex === index ? 'border-current' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.title} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="rounded-none p-6 border">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">SKU</span>
                <span className="font-mono">{product.sku}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Brand</span>
                <span>{product.brand}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  Category
                </span>
                <span>{product.categoryId?.name || 'Uncategorized'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status</span>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-3 py-1 text-xs font-medium border rounded ${stockStatus.style}`}>
                    {stockStatus.text}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium border rounded ${productStatus.style}`}>
                    {productStatus.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-none p-6 border">
            <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {activeDeal ? 'Sale Price' : 'Price'}
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    {formatPrice(product.priceCents)}
                  </span>
                  {activeDeal && product.originalPriceCents && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPriceCents)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        {product.discountPercent}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Box className="w-4 h-4 mr-2" />
                  Stock
                </span>
                <div className="text-right">
                  <span className="text-lg">{product.stock} units</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>{product.soldCount || 0} sold</span>
                  </div>
                </div>
              </div>

              {activeDeal && product.dealExpiresAt && (
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Deal Expires
                  </span>
                  <span className="text-sm">{formatDate(product.dealExpiresAt)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Currency
                </span>
                <span>{product.currency}</span>
              </div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          {(product.rating || product.reviewCount) && (
            <div className="rounded-none p-6 border">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Ratings & Reviews
              </h2>
              <div className="space-y-3">
                {product.rating && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{product.rating}</span>
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                )}
                {product.reviewCount && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Reviews</span>
                    <span>{product.reviewCount} reviews</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-none p-6 border">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="rounded-none p-6 border">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="space-y-3">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <span className="font-medium">{spec.key}</span>
                    <span>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-none p-6 border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Product Metadata
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>
              {product.updatedAt && (
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}