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
  Clock,
  Zap,
  Eye,
  Share2,
  Copy,
  CheckCircle2
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addAlert({
        type: 'success',
        title: 'Copied!',
        message: 'Product link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to copy link',
      });
    }
  };

  const formatPrice = (priceCents: number) => {
    return `₵ ${((priceCents || 0) / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-50 text-red-700 border-red-200' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'In Stock', style: 'bg-green-50 text-green-700 border-green-200' };
  };

  const getProductStatus = (product: Product) => {
    if (!product.isActive) return { text: 'Inactive', style: 'bg-gray-100 text-gray-700 border-gray-200' };
    if (product.isDeal) return { text: 'On Deal', style: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { text: 'Active', style: 'bg-green-50 text-green-700 border-green-200' };
  };

  const isDealActive = (dealExpiresAt?: string) => {
    if (!dealExpiresAt) return false;
    return new Date(dealExpiresAt) > new Date();
  };

  const getTimeLeft = (dealExpiresAt?: string) => {
    if (!dealExpiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(dealExpiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load product
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchProduct}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
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

  const stockStatus = getStockStatus(product.stock);
  const productStatus = getProductStatus(product);
  const mainImage = product.images?.[activeImageIndex];
  const activeDeal = product.isDeal && isDealActive(product.dealExpiresAt);
  const timeLeft = getTimeLeft(product.dealExpiresAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
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
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Product details and inventory information
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              title="Copy link"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchProduct}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
              className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Product</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 space-y-6"
          >
            {/* Main Image Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.images?.length || 0} images
                </span>
              </div>
              
              {/* Main Image */}
              <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-4">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || product.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <p>No image available</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImageIndex(index)}
                      className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        activeImageIndex === index 
                          ? 'border-blue-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-1">{spec.key}</div>
                      <div className="text-gray-700">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${stockStatus.style}`}>
                    {stockStatus.text}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${productStatus.style}`}>
                    {productStatus.text}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 text-gray-600">₵</span>
                      <span className="font-medium text-gray-700">
                        {activeDeal ? 'Sale Price' : 'Current Price'}
                      </span>
                    </div>
                    {activeDeal && (
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">Active Deal</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.priceCents)}
                      </span>
                      {activeDeal && product.originalPriceCents && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product.originalPriceCents)}
                        </span>
                      )}
                    </div>
                    {activeDeal && product.discountPercent && (
                      <div className="mt-1">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                          {product.discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deal Timer */}
                {activeDeal && timeLeft && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Deal ends in</span>
                      </div>
                      <span className="text-lg font-bold text-amber-700">{timeLeft}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory & Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Stock Level</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{product.stock} units</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{product.soldCount || 0} sold</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">SKU</span>
                  </div>
                  <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    {product.sku}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Brand</span>
                  </div>
                  <span className="text-gray-900">{product.brand}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Category</span>
                  </div>
                  <span className="text-gray-900">{product.categoryId?.name || 'Uncategorized'}</span>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews */}
            {(product.rating || product.reviewCount) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-500" />
                  Customer Reviews
                </h2>
                <div className="space-y-4">
                  {product.rating && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Average Rating</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{product.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= product.rating! ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {product.reviewCount && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Reviews</span>
                      <span className="text-gray-900 font-semibold">{product.reviewCount} reviews</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Product History
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900 font-medium">{formatDate(product.createdAt)}</span>
                </div>
                {product.updatedAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900 font-medium">{formatDate(product.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`/products/${product._id}`, '_blank')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}