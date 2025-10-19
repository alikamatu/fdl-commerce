'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Download,
  MoreVertical,
  ArrowUpRight,
  ShoppingCart,
  TrendingUp,
  MapPin,
  CreditCard,
  Info,
  AlertCircle
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

// Types based on your Order schema
interface OrderItem {
  productId: string;
  title: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  email: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: string;
  paymentCompleted: boolean;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
}

// Custom hook for orders
function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      // Handle both response structures
      const ordersData = data.data || data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/stats/overview`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch order stats:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders list
      await fetchOrders();
      return true;
    } catch (err) {
      console.error('Failed to update order status:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  return {
    orders,
    stats,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
  };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const {
    orders,
    stats,
    loading,
    error,
    refetch,
    updateOrderStatus
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      addAlert({
        type: 'success',
        title: 'Refreshed',
        message: 'Orders data updated'
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh orders'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      addAlert({
        type: 'success',
        title: 'Status Updated',
        message: `Order status updated to ${newStatus}`
      });
    } else {
      addAlert({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status'
      });
    }
  };

  const formatPrice = (priceCents: number) => {
    return `₵${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const exportOrders = () => {
    try {
      const exportData = filteredOrders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer Email': order.email,
        'Customer Name': order.shippingAddress.fullName,
        'Total Amount': formatPrice(order.totalCents),
        Status: order.status,
        'Order Date': formatDate(order.createdAt),
        'Payment Status': order.paymentCompleted ? 'Completed' : 'Pending',
        'Items Count': order.items.length,
        'Shipping City': order.shippingAddress.city,
        'Shipping Country': order.shippingAddress.country
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
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      addAlert({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${exportData.length} orders to CSV`
      });
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export orders data'
      });
    }
  };

  const getStatusCount = (status: Order['status']) => {
    return orders.filter(order => order.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load orders</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and track customer orders in real-time
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
              title="Refresh orders"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportOrders}
              className="flex items-center space-x-3 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {stats.completedOrders} completed
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Last 30 days</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">GHC</span>
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
                  <p className="text-sm font-medium text-gray-600">Average Order</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatPrice(stats.averageOrderValue)}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Per order</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Truck className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      Needs attention
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <div
                key={status}
                className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 ${
                  statusFilter === status 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  getStatusColor(status as Order['status']).split(' ')[0]
                }`}>
                  {getStatusIcon(status as Order['status'])}
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">{status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount(status as Order['status'])}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Showing</span>
              </div>
              <span className="font-semibold text-gray-900">
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
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
                  <th className="text-left p-6 font-semibold text-gray-900">Order Details</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Customer</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Date & Time</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Items</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Total Amount</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Payment</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="p-6">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.email}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{order.shippingAddress.city}, {order.shippingAddress.country}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div>
                        <p className="font-medium text-gray-900">{order.items.length} items</p>
                        <p className="text-sm text-gray-600">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units total
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div>
                        <p className="font-semibold text-gray-900">{formatPrice(order.totalCents)}</p>
                        <p className="text-sm text-gray-600">
                          Subtotal: {formatPrice(order.subtotalCents)}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg ${
                        order.paymentCompleted 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.paymentCompleted ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center p-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'No orders have been placed yet. Orders will appear here once customers start purchasing.'
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}