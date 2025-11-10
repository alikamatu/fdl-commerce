'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  DollarSign,
  Edit2,
  Eye,
  Plus,
  Download,
  BarChart3,
  Layers,
  AlertCircle,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { Product } from '@/types/product';
import { useAlert } from '@/components/ui/Alert';

interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  activeProducts: number;
  dealProducts: number;
  totalSold: number;
  averagePrice: number;
}

interface StockTrend {
  productId: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockTrends, setStockTrends] = useState<StockTrend[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalStock: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    activeProducts: 0,
    dealProducts: 0,
    totalSold: 0,
    averagePrice: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
    generateStockTrends();
  }, [products, searchTerm, stockFilter, statusFilter]);

const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000&include=category`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    
    // Handle different response formats
    let productsData;
    if (data.data) {
      productsData = data.data; // Paginated response
    } else if (data.products) {
      productsData = data.products; // Alternative format
    } else {
      productsData = data; // Direct array
    }
    
    setProducts(Array.isArray(productsData) ? productsData : []);
  } catch (error) {
    console.error('Error fetching products:', error);
    addAlert({
      type: 'error',
      title: 'Error',
      message: 'Failed to load inventory data'
    });
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
      addAlert({
        type: 'success',
        title: 'Refreshed',
        message: 'Inventory data updated'
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh inventory'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoryId && typeof product.categoryId === 'object' && 
         'name' in product.categoryId && 
         product.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by stock status
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        switch (stockFilter) {
          case 'out-of-stock':
            return product.stock === 0;
          case 'low-stock':
            return product.stock > 0 && product.stock <= 10;
          case 'in-stock':
            return product.stock > 10;
          default:
            return true;
        }
      });
    }

    // Filter by active status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        switch (statusFilter) {
          case 'active':
            return product.isActive;
          case 'inactive':
            return !product.isActive;
          case 'deals':
            return product.isDeal;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const inventoryValue = products.reduce((sum, product) => 
      sum + (product.priceCents * product.stock), 0
    ) / 100;
    const lowStockItems = products.filter(product => 
      product.stock > 0 && product.stock <= 10
    ).length;
    const outOfStockItems = products.filter(product => product.stock === 0).length;
    const activeProducts = products.filter(product => product.isActive).length;
    const dealProducts = products.filter(product => product.isDeal).length;
    const totalSold = products.reduce((sum, product) => sum + (product.soldCount || 0), 0);
    const averagePrice = products.length > 0 ? 
      products.reduce((sum, product) => sum + product.priceCents, 0) / products.length / 100 : 0;

    setStats({
      totalProducts,
      totalStock,
      inventoryValue,
      lowStockItems,
      outOfStockItems,
      activeProducts,
      dealProducts,
      totalSold,
      averagePrice
    });
  };

  const generateStockTrends = () => {
    // In a real app, this would come from historical data
    const trends: StockTrend[] = products.map(product => ({
      productId: product._id,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      change: Math.floor(Math.random() * 20) - 10 // Random change between -10 and +10
    }));
    setStockTrends(trends);
  };

  const getStockTrend = (productId: string) => {
    return stockTrends.find(trend => trend.productId === productId) || 
           { trend: 'stable', change: 0 };
  };

  const formatPrice = (priceCents: number) => {
    return `₵${(priceCents / 100).toFixed(2)}`;
  };

  const formatInventoryValue = (value: number) => {
    if (value >= 1000000) {
      return `₵${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₵${(value / 1000).toFixed(1)}K`;
    }
    return `₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-50 text-red-700 border-red-200' };
    if (stock <= 5) return { text: 'Very Low', style: 'bg-red-100 text-red-700 border-red-200' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (stock <= 20) return { text: 'Medium', style: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { text: 'In Stock', style: 'bg-green-50 text-green-700 border-green-200' };
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) return { text: 'Inactive', style: 'bg-gray-100 text-gray-700 border-gray-200' };
    if (product.isDeal) return { text: 'On Deal', style: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { text: 'Active', style: 'bg-green-50 text-green-700 border-green-200' };
  };

  const exportInventory = () => {
    try {
      const exportData = filteredProducts.map(product => ({
        SKU: product.sku,
        Name: product.title,
        Brand: product.brand,
        Category: product.categoryId && typeof product.categoryId === 'object' ? product.categoryId.name : 'N/A',
        Price: formatPrice(product.priceCents),
        Stock: product.stock,
        Status: product.isActive ? 'Active' : 'Inactive',
        'On Deal': product.isDeal ? 'Yes' : 'No',
        'Sold Count': product.soldCount,
        'Stock Value': formatPrice(product.priceCents * product.stock)
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      addAlert({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${exportData.length} products to CSV`
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export inventory data'
      });
    }
  };

  const getCategoryName = (category: any): string => {
    if (!category) return 'N/A';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="lg font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Monitor and manage your product inventory in real-time
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportInventory}
              className="flex items-center space-x-3 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span>Export CSV</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/products/new')}
              className="flex items-center space-x-3 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="lg font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {stats.activeProducts} active
                  </span>
                  {stats.dealProducts > 0 && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {stats.dealProducts} deals
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="lg font-bold text-gray-900 mt-2">{stats.totalStock.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  {stats.lowStockItems > 0 && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      {stats.lowStockItems} low
                    </span>
                  )}
                  {stats.outOfStockItems > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      {stats.outOfStockItems} out
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Box className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="lg font-bold text-gray-900 mt-2">{formatInventoryValue(stats.inventoryValue)}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <span className='md'>₵</span>
                  <span>Total value at current prices</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <span className="w-6 h-6 text-amber-600">₵</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="lg font-bold text-gray-900 mt-2">{stats.totalSold.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <span>Total units sold</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Stock Levels</option>
                <option value="in-stock">In Stock (10+)</option>
                <option value="low-stock">Low Stock (1-10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div className="relative">
              <BarChart3 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deals">On Deal</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Showing</span>
              </div>
              <span className="font-semibold text-gray-900">
                {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stock Alerts Banner */}
        {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Stock Alerts</h3>
                  <p className="text-amber-700">
                    {stats.outOfStockItems > 0 && `${stats.outOfStockItems} products out of stock`}
                    {stats.outOfStockItems > 0 && stats.lowStockItems > 0 && ' • '}
                    {stats.lowStockItems > 0 && `${stats.lowStockItems} products running low`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockFilter('out-of-stock')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
              >
                <span>View Alerts</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left p-6 font-semibold text-gray-900">SKU</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Price</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Stock</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Value</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Sold</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.stock);
                  const productStatus = getStatusBadge(product);
                  const productValue = product.priceCents * product.stock;
                  const trend = getStockTrend(product._id);
                  
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="p-6">
                        <div className="flex items-center space-x-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.title}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-100">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <code className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-700">
                          {product.sku}
                        </code>
                      </td>
                      <td className="p-6">
                        <span className="text-sm text-gray-700 font-medium">{getCategoryName(product.categoryId)}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{formatPrice(product.priceCents)}</span>
                          {product.isDeal && product.originalPriceCents && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPriceCents)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock <= 10 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {product.stock}
                          </span>
                          {trend.trend === 'up' && (
                            <div className="flex items-center gap-1 text-green-600">
                              <ArrowUpRight className="w-4 h-4" />
                              <span className="text-xs font-medium">+{trend.change}</span>
                            </div>
                          )}
                          {trend.trend === 'down' && (
                            <div className="flex items-center gap-1 text-red-600">
                              <ArrowDownRight className="w-4 h-4" />
                              <span className="text-xs font-medium">{trend.change}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg ${stockStatus.style}`}>
                            {stockStatus.text}
                          </span>
                          <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg ${productStatus.style}`}>
                            {productStatus.text}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(productValue)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{product.soldCount || 0}</span>
                          {product.soldCount > 0 && (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center p-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || stockFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Start building your inventory by adding your first product'
                }
              </p>
              {!searchTerm && stockFilter === 'all' && statusFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard/products/new')}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Product</span>
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}