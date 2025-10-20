'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  Tag,
  Box,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Users,
  TrendingUp,
  Star,
  Zap,
  Clock,
  TrendingDown,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAlert } from '@/components/ui/Alert';
import { Product } from '@/types/product';

export default function ProductsPage() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const { 
    products, 
    categories, 
    loading, 
    error,
    deleteProduct, 
    refreshProducts 
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Load products on component mount
  useEffect(() => {
    refreshProducts();
  }, []);

  // Filter and sort products based on search, category, and sort
  useEffect(() => {
    const productsArray = Array.isArray(products) ? products : [];
    
    let filtered = productsArray;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => {
        const catId = typeof product?.categoryId === 'object' && product?.categoryId?._id
          ? product.categoryId._id
          : product?.categoryId;
        
        return String(catId) === selectedCategory;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'price-high':
          return (b.priceCents || 0) - (a.priceCents || 0);
        case 'price-low':
          return (a.priceCents || 0) - (b.priceCents || 0);
        case 'stock':
          return (b.stock || 0) - (a.stock || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Find similar products based on current filters
  useEffect(() => {
    if (filteredProducts.length > 0 && showSimilarProducts) {
      const findSimilarProducts = () => {
        const currentProducts = filteredProducts;
        const similar: Product[] = [];
        
        // Get unique categories from filtered products
        const categoriesInView = [...new Set(currentProducts.map(p => {
          const catId = typeof p?.categoryId === 'object' && p?.categoryId?._id
            ? p.categoryId._id
            : p?.categoryId;
          return String(catId);
        }))];

        // Find products from same categories that aren't already in the filtered list
        const allProducts = Array.isArray(products) ? products : [];
        allProducts.forEach(product => {
          if (similar.length >= 4) return;
          
          const productCatId = typeof product?.categoryId === 'object' && product?.categoryId?._id
            ? product.categoryId._id
            : product?.categoryId;
          
          if (categoriesInView.includes(String(productCatId)) && 
              !currentProducts.some(p => p._id === product._id)) {
            similar.push(product);
          }
        });

        setSimilarProducts(similar.slice(0, 4));
      };

      findSimilarProducts();
    }
  }, [filteredProducts, products, showSimilarProducts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProducts();
      addAlert({
        type: 'success',
        title: 'Refreshed',
        message: 'Products list updated',
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh products',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!id) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Invalid product ID',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    setIsDeleting(id);
    try {
      await deleteProduct(id);
      addAlert({
        type: 'success',
        title: 'Success!',
        message: 'Product deleted successfully',
      });
      await refreshProducts();
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete product',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getCategoryName = (categoryId: any) => {
    if (!categoryId) return 'Unknown Category';
    
    if (typeof categoryId === 'object' && categoryId.name) {
      return categoryId.name;
    }
    
    const categoryIdStr = String(categoryId);
    const category = categories.find((cat) => String(cat._id) === categoryIdStr);
    return category?.name || 'Unknown Category';
  };

  const formatPrice = (priceCents: number) => {
    return `₵ ${((priceCents || 0) / 100).toFixed(2)}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-50 text-red-700 border-red-200' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'In Stock', style: 'bg-green-50 text-green-700 border-green-200' };
  };

  // Calculate discount percentage
  const getDiscountPercent = (product: Product) => {
    if (product.originalPriceCents && product.originalPriceCents > product.priceCents) {
      return Math.round(((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100);
    }
    return product.discountPercent || 0;
  };

  // Check if deal is active and not expired
  const isDealActive = (product: Product) => {
    if (!product.isDeal) return false;
    if (!product.dealExpiresAt) return true;
    
    const now = new Date();
    const expiry = new Date(product.dealExpiresAt);
    return now < expiry;
  };

  // Get time left for deal
  const getTimeLeft = (dealExpiresAt?: string) => {
    if (!dealExpiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(dealExpiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get rating display
  const getRatingDisplay = (product: Product) => {
    const rating = product.rating || 4.5;
    const reviewCount = product.reviewCount || 24;
    return { rating, reviewCount };
  };

  const safeProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
  const hasProducts = safeProducts.length > 0;

  // Calculate stats for summary
  const totalProducts = safeProducts.length;
  const totalInventoryValue = safeProducts.reduce((sum, p) => sum + (p.priceCents || 0) * (p.stock || 0), 0);
  const totalStock = safeProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  const activeDeals = safeProducts.filter(p => isDealActive(p)).length;
  const totalSold = safeProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0);

  if (loading && (!products || !Array.isArray(products))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && (!products || !Array.isArray(products) || products.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="border border-gray-200 rounded-2xl p-8 text-center bg-white shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load products
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard/products/new')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                Add First Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Products
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage your store&#39;s product inventory and catalog
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                title="Refresh products"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/products/new')}
                className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </motion.button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, SKU, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                >
                  <option value="name">Sort by Name</option>
                  <option value="newest">Newest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="stock">Stock Level</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
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

        {/* Summary Stats */}
        {hasProducts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(totalInventoryValue)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <span className="text-green-600 text-xl">₵</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalStock.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Box className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeDeals}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sold</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalSold.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {!hasProducts ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 shadow-sm"
          >
            <Box className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {searchTerm || selectedCategory !== 'all' ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search terms or category filter'
                : 'Start building your product catalog by adding your first product'}
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/products/new')}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span className="text-lg">Add Your First Product</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {safeProducts.map((product, index) => {
                const productId = product?._id;
                const productTitle = product?.title || 'Untitled Product';
                const productStock = product?.stock || 0;
                const productPrice = product?.priceCents || 0;
                const originalPrice = product?.originalPriceCents;
                const productImages = product?.images || [];
                const productSku = product?.sku;
                const productBrand = product?.brand;
                const productDescription = product?.description;
                const productCategoryId = product?.categoryId;
                const discountPercent = getDiscountPercent(product);
                const isDeal = isDealActive(product);
                const timeLeft = getTimeLeft(product.dealExpiresAt);
                const { rating, reviewCount } = getRatingDisplay(product);
                const soldCount = product.soldCount || 0;
                
                const stockStatus = getStockStatus(productStock);
                
                return (
                  <motion.div
                    key={productId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                  >
                    {/* Deal Badge */}
                    {isDeal && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap size={12} className="fill-white" />
                          <span>Deal</span>
                        </div>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                          {discountPercent}% OFF
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {productImages.length > 0 ? (
                        <img
                          src={productImages[0].url}
                          alt={productImages[0].alt || productTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      <div className={`w-full h-full flex items-center justify-center ${productImages.length > 0 ? 'hidden' : ''}`}>
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      {/* Stock Badge */}
                      <div className={`absolute bottom-3 left-3 px-3 py-1.5 text-xs font-semibold rounded-lg border ${stockStatus.style} backdrop-blur-sm`}>
                        {stockStatus.text}
                      </div>

                      {/* Time Left Badge */}
                      {isDeal && timeLeft && (
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 border border-gray-200">
                          <Clock size={12} />
                          <span>{timeLeft}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 leading-tight">
                          {productTitle}
                        </h3>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({reviewCount})</span>
                      </div>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(productPrice)}
                        </span>
                        {originalPrice && originalPrice > productPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {productBrand && (
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                          {productBrand}
                        </p>
                      )}

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {productDescription || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-4 h-4 mr-1.5" />
                          <span className="text-sm">{getCategoryName(productCategoryId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Box className="w-4 h-4" />
                          <span className="text-sm">{productStock} in stock</span>
                          {soldCount > 0 && (
                            <span className="text-sm text-green-600 font-medium">• {soldCount} sold</span>
                          )}
                        </div>
                      </div>

                      {/* SKU */}
                      {productSku && (
                        <div className="text-xs text-gray-500 mb-4 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                          SKU: {productSku}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/products/${productId}`)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/products/edit/${productId}`)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 font-medium text-sm"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(productId!, productTitle)}
                          disabled={isDeleting === productId}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Product"
                        >
                          {isDeleting === productId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Similar Products Section */}
            {hasProducts && similarProducts.length > 0 && showSimilarProducts && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="border-t border-gray-200 pt-8 mt-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Similar Products</h2>
                  </div>
                  <button
                    onClick={() => setShowSimilarProducts(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  >
                    Hide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {similarProducts.map((product, index) => {
                    const productId = product?._id;
                    const productTitle = product?.title || 'Untitled Product';
                    const productStock = product?.stock || 0;
                    const productPrice = product?.priceCents || 0;
                    const originalPrice = product?.originalPriceCents;
                    const productImages = product?.images || [];
                    const productBrand = product?.brand;
                    const discountPercent = getDiscountPercent(product);
                    const isDeal = isDealActive(product);
                    
                    const stockStatus = getStockStatus(productStock);
                    
                    return (
                      <motion.div
                        key={productId || `similar-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
                      >
                        {/* Product Image */}
                        <div className="relative h-32 overflow-hidden bg-gray-100">
                          {productImages.length > 0 ? (
                            <img
                              src={productImages[0].url}
                              alt={productImages[0].alt || productTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Stock Badge */}
                          <div className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold rounded-lg ${stockStatus.style}`}>
                            {stockStatus.text}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2 leading-tight">
                            {productTitle}
                          </h3>
                          
                          {productBrand && (
                            <p className="text-xs text-gray-600 mb-2">
                              {productBrand}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="font-bold text-gray-900 text-sm">
                                {formatPrice(productPrice)}
                              </span>
                              {originalPrice && originalPrice > productPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(originalPrice)}
                                </span>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => router.push(`/dashboard/products/${productId}`)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-xs font-medium"
                            >
                              View
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </>
        )}
      </div>
    </div>
  );
}