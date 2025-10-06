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
  Layers
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
    dealProducts: 0
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?include=category`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productsData = data.data || data;
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

    setStats({
      totalProducts,
      totalStock,
      inventoryValue,
      lowStockItems,
      outOfStockItems,
      activeProducts,
      dealProducts
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
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatInventoryValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-100 text-red-800 border-red-200' };
    if (stock <= 5) return { text: 'Very Low', style: 'bg-red-50 text-red-700 border-red-100' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (stock <= 20) return { text: 'Medium', style: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { text: 'In Stock', style: 'bg-green-100 text-green-800 border-green-200' };
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) return { text: 'Inactive', style: 'bg-gray-100 text-gray-800 border-gray-200' };
    if (product.isDeal) return { text: 'On Deal', style: 'bg-purple-100 text-purple-800 border-purple-200' };
    return { text: 'Active', style: 'bg-green-100 text-green-800 border-green-200' };
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
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p>Loading inventory...</p>
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-light tracking-tight flex items-center">
              <Package className="w-8 h-8 mr-3" />
              Inventory Management
            </h1>
            <p className="text-lg mt-2">
              Monitor and manage your product inventory
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportInventory}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/products/add')}
            className="flex items-center space-x-2 px-5 py-2.5 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
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
          className="rounded-none p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.activeProducts} active • {stats.dealProducts} on deal
              </p>
            </div>
            <Package className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-none p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Stock</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStock.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.lowStockItems} low stock
              </p>
            </div>
            <Box className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-none p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Inventory Value</p>
              <p className="text-3xl font-bold mt-2">{formatInventoryValue(stats.inventoryValue)}</p>
              <p className="text-sm text-gray-600 mt-1">
                Total value at current prices
              </p>
            </div>
            <DollarSign className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-none p-6 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Stock Alerts</p>
              <p className="text-3xl font-bold mt-2">{stats.lowStockItems + stats.outOfStockItems}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.outOfStockItems} out of stock
              </p>
            </div>
            <AlertTriangle className="w-8 h-8" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, SKU, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock (10+)</option>
            <option value="low-stock">Low Stock (1-10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <div className="relative">
          <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deals">On Deal</option>
          </select>
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-none border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800">
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Stock</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Value</th>
                <th className="text-left p-4 font-semibold">Sold</th>
                <th className="text-left p-4 font-semibold">Actions</th>
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
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.title}
                            className="w-10 h-10 object-cover rounded-none"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center border rounded-none bg-gray-100">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{getCategoryName(product.categoryId)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatPrice(product.priceCents)}</span>
                        {product.isDeal && product.originalPriceCents && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPriceCents)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                        {trend.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {trend.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-medium border rounded ${stockStatus.style}`}>
                          {stockStatus.text}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium border rounded ${productStatus.style}`}>
                          {productStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {formatPrice(productValue)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{product.soldCount || 0}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/products/${product._id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center p-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="mb-4">
              {searchTerm || stockFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Add your first product to get started'
              }
            </p>
            {!searchTerm && stockFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => router.push('/dashboard/products/add')}
                className="inline-flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Product</span>
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Stock Alerts */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-none p-6 border border-yellow-200 bg-yellow-50"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Stock Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.outOfStockItems > 0 && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Out of Stock Items</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm mt-2 text-red-700">
                  Products that need immediate restocking
                </p>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Low Stock Items</p>
                    <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-sm mt-2 text-yellow-700">
                  Products running low on inventory
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}