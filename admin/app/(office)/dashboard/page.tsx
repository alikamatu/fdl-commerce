"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowUpRight,
  PackageOpen,
  CheckCircle2,
  Image as ImageIcon,
  Star,
  Plus
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  todayRevenue: number;
  totalRevenue: number;
  lowStockItems: number;
  activeDeals: number;
}

interface RecentProduct {
  _id: string;
  title: string;
  sku: string;
  priceCents: number;
  stock: number;
  images: Array<{ url: string; alt?: string }>;
  categoryId: { name: string } | string;
  brand: string;
  isActive: boolean;
  isDeal: boolean;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

interface StockAlert {
  _id: string;
  title: string;
  sku: string;
  stock: number;
  threshold: number;
}

export default function AdminHome() {
  const { user, logout } = useAuth();
  const { addAlert } = useAlert();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch recent products (using your products endpoint)
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=5&sort=-createdAt`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setRecentProducts(productsData.data || productsData.products || []);
      }

      // Fetch low stock alerts
      const alertsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/low-stock?threshold=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setStockAlerts(alertsData.data || []);
      }

      // Calculate stats from the data we have
      await calculateStats();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all products for stats
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=1000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.data || productsData.products || [];
        
        // Calculate stats from products data
        const totalProducts = products.length;
        const lowStockItems = products.filter((p: RecentProduct) => p.stock <= 10).length;
        const activeDeals = products.filter((p: RecentProduct) => p.isDeal).length;
        
        // Mock data for other stats (replace with actual API calls when available)
        const mockStats: DashboardStats = {
          totalProducts,
          totalOrders: 142, // Mock data - replace with orders API
          pendingOrders: 12, // Mock data - replace with orders API
          totalCustomers: 2847, // Mock data - replace with users API
          todayRevenue: 284700, // Mock data - replace with orders API
          totalRevenue: 1528400, // Mock data - replace with orders API
          lowStockItems,
          activeDeals
        };

        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      addAlert({
        type: 'success',
        title: 'Refreshed',
        message: 'Dashboard data updated'
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh dashboard'
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryName = (category: any): string => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return 'Uncategorized';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', style: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { text: 'Very Low', style: 'bg-red-50 text-red-600' };
    if (stock <= 10) return { text: 'Low Stock', style: 'bg-amber-100 text-amber-700' };
    return { text: 'In Stock', style: 'bg-green-100 text-green-700' };
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, {user?.displayName || 'Admin'}! Here's what's happening today.
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
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/products/new')}
              className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 xl:col-span-2"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recently Added Products
                </h2>
                <button 
                  onClick={() => router.push('/dashboard/products')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProducts.length > 0 ? (
                  recentProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200 group"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {product.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-600">{product.brand}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{getCategoryName(product.categoryId)}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="font-semibold text-gray-900">
                                  {formatPrice(product.priceCents)}
                                </span>
                                {product.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-gray-600">
                                      {product.rating} ({product.reviewCount || 0})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.style}`}>
                                {stockStatus.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(product.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Product Status */}
                          <div className="flex items-center gap-2 mt-2">
                            {product.isDeal && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                                On Deal
                              </span>
                            )}
                            {!product.isActive && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium">
                                Inactive
                              </span>
                            )}
                            <span className="text-xs text-gray-500 font-mono">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>

                        {/* View Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/products/${product._id}`)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="View product"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <PackageOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-4">No products added yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard/products/new')}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Product</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Stock Alerts
                  </h2>
                  {stockAlerts.length > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      {stockAlerts.length} alerts
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stockAlerts.length > 0 ? (
                    stockAlerts.map((alert, index) => (
                      <motion.div
                        key={alert._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="p-4 border border-red-200 bg-red-50 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-red-900 text-sm line-clamp-1">
                              {alert.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-red-700">SKU: {alert.sku}</span>
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                                {alert.stock} left
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-600">All products are well stocked</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/products/new')}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-200 text-left group"
                  >
                    <Package className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-blue-900 text-sm">Add Product</p>
                    <p className="text-xs text-blue-600 mt-1">Create new product</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/orders')}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all duration-200 text-left group"
                  >
                    <ShoppingCart className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-green-900 text-sm">View Orders</p>
                    <p className="text-xs text-green-600 mt-1">Manage orders</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/inventory')}
                    className="p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all duration-200 text-left group"
                  >
                    <PackageOpen className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-amber-900 text-sm">Inventory</p>
                    <p className="text-xs text-amber-600 mt-1">Stock management</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/categories')}
                    className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all duration-200 text-left group"
                  >
                    <Users className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-purple-900 text-sm">Categories</p>
                    <p className="text-xs text-purple-600 mt-1">Organize products</p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}