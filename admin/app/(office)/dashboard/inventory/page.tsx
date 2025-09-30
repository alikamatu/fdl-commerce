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
  Plus
} from 'lucide-react';
import { Product } from '@/types/product';
import { useAlert } from '@/components/ui/Alert';

interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
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
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalStock: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
  }, [products, searchTerm, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productsData = data.data || data;
      setProducts(productsData);
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
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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

    setStats({
      totalProducts,
      totalStock,
      inventoryValue,
      lowStockItems,
      outOfStockItems
    });
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatInventoryValue = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-current' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-current' };
    return { text: 'In Stock', style: 'bg-current' };
  };

  const getStockTrend = (product: Product) => {
    // This would typically come from historical data
    // For now, we'll simulate some trends
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
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
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/admin/products/add')}
          className="flex items-center space-x-2 px-5 py-2.5 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </motion.button>
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
              <p className="text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold mt-2">{stats.lowStockItems}</p>
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
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or brand..."
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
            className="pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer min-w-[200px]"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
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
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Brand</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Stock</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Value</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.stock);
                const productValue = (product.priceCents * product.stock) / 100;
                const trend = getStockTrend(product);
                
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
                          <div className="w-10 h-10 flex items-center justify-center border rounded-none">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{product.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm">{product.sku}</code>
                    </td>
                    <td className="p-4">{product.brand}</td>
                    <td className="p-4 font-medium">{formatPrice(product.priceCents)}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{product.stock}</span>
                        {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium ${stockStatus.style} text-background`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {formatPrice(Math.round(productValue * 100))}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/products/${product._id}`)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/admin/products/edit/${product._id}`)}
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
            <Package className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="mb-4">
              {searchTerm || stockFilter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Add your first product to get started'
              }
            </p>
            {!searchTerm && stockFilter === 'all' && (
              <button
                onClick={() => router.push('/admin/products/add')}
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
          className="rounded-none p-6 border"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Stock Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.outOfStockItems > 0 && (
              <div className="p-4 border rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Out of Stock Items</p>
                    <p className="text-2xl font-bold mt-1">{stats.outOfStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <p className="text-sm mt-2">
                  Products that need immediate restocking
                </p>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="p-4 border rounded-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Items</p>
                    <p className="text-2xl font-bold mt-1">{stats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <p className="text-sm mt-2">
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