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
  DollarSign,
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

  // Load products on component mount
  useEffect(() => {
    refreshProducts();
  }, []);

  // Filter products based on search and category
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

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

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
    return `$${((priceCents || 0) / 100).toFixed(2)}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'text-red-500' };
    if (stock <= 10) return { text: 'Low Stock', style: 'text-yellow-500' };
    return { text: 'In Stock', style: 'text-green-500' };
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
      return `${hours}h`;
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
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && (!products || !Array.isArray(products) || products.length === 0)) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load products
          </h3>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard/products/new')}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Add First Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight flex items-center">
                <Package className="w-8 h-8 mr-3" />
                Products
              </h1>
              <p className="text-lg mt-2">
                Manage your store's product inventory
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors"
              title="Refresh products"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/products/new')}
            className="flex items-center space-x-2 px-5 py-2.5 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, description, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="all">All Categories</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
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

      {/* Products Grid */}
      {!hasProducts ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-none p-12 text-center border-2 border-dashed"
        >
          <Box className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No products found' : 'No products yet'}
          </h3>
          <p className="mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search terms or category filter'
              : 'Add your first product to get started'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <button
              onClick={() => router.push('/dashboard/products/new')}
              className="inline-flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="rounded-none border overflow-hidden hover:shadow-md transition-all duration-300 group relative"
                >
                  {/* Deal Badge */}
                  {isDeal && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={10} />
                        <span>Deal</span>
                      </div>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discountPercent}% OFF
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[0].url}
                        alt={productImages[0].alt || productTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    <div className={`w-full h-full flex items-center justify-center ${productImages.length > 0 ? 'hidden' : ''}`}>
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    
                    {/* Stock Badge */}
                    <div className={`absolute bottom-2 left-2 px-2 py-1 ${stockStatus.style} bg-background text-xs font-semibold rounded-none`}>
                      {stockStatus.text}
                    </div>

                    {/* Time Left Badge */}
                    {isDeal && timeLeft && (
                      <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock size={10} />
                        <span>{timeLeft}</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                        {productTitle}
                      </h3>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(productPrice)}
                      </span>
                      {originalPrice && originalPrice > productPrice && (
                        <span className="text-sm text-foreground/40 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-foreground/60">({reviewCount})</span>
                    </div>

                    {productBrand && (
                      <p className="text-sm mb-2">
                        Brand: {productBrand}
                      </p>
                    )}

                    <p className="text-sm line-clamp-2 mb-3">
                      {productDescription || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        <span className="text-xs">{getCategoryName(productCategoryId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        <span className="text-xs">{productStock} in stock</span>
                        {soldCount > 0 && (
                          <span className="text-xs text-green-600">• {soldCount} sold</span>
                        )}
                      </div>
                    </div>

                    {/* SKU */}
                    {productSku && (
                      <div className="text-xs text-foreground/60 mb-3">
                        SKU: {productSku}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/dashboard/products/${productId}`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors text-xs"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/dashboard/products/edit/${productId}`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors text-xs"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(productId!, productTitle)}
                        disabled={isDeleting === productId}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Product"
                      >
                        {isDeleting === productId ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
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
              className="border-t border-foreground/10 pt-8 mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <h2 className="text-xl font-light text-foreground">Similar Products</h2>
                </div>
                <button
                  onClick={() => setShowSimilarProducts(false)}
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  Hide
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      className="rounded-none border overflow-hidden hover:shadow-md transition-all duration-300 group relative"
                    >
                      {/* Deal Badge */}
                      {isDeal && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Deal
                          </div>
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative h-32 overflow-hidden">
                        {productImages.length > 0 ? (
                          <img
                            src={productImages[0].url}
                            alt={productImages[0].alt || productTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        
                        {/* Stock Badge */}
                        <div className={`absolute bottom-2 left-2 px-2 py-1 ${stockStatus.style} bg-background text-xs font-semibold rounded-none`}>
                          {stockStatus.text}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-semibold line-clamp-2 text-sm mb-1">
                          {productTitle}
                        </h3>
                        
                        {productBrand && (
                          <p className="text-xs text-foreground/60 mb-1">
                            {productBrand}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-foreground text-sm">
                              {formatPrice(productPrice)}
                            </span>
                            {originalPrice && originalPrice > productPrice && (
                              <span className="text-xs text-foreground/40 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/dashboard/products/${productId}`)}
                            className="px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors text-xs"
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

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="rounded-none p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8" />
              </div>
            </div>

            <div className="rounded-none p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Inventory Value</p>
                  <p className="text-2xl font-bold">{formatPrice(totalInventoryValue)}</p>
                </div>
                <DollarSign className="w-8 h-8" />
              </div>
            </div>

            <div className="rounded-none p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Total Stock</p>
                  <p className="text-2xl font-bold">{totalStock}</p>
                </div>
                <Box className="w-8 h-8" />
              </div>
            </div>

            <div className="rounded-none p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Active Deals</p>
                  <p className="text-2xl font-bold">{activeDeals}</p>
                </div>
                <Zap className="w-8 h-8" />
              </div>
            </div>

            <div className="rounded-none p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Total Sold</p>
                  <p className="text-2xl font-bold">{totalSold}</p>
                </div>
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}