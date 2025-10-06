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
  MoreVertical
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
      setOrders(Array.isArray(data) ? data : []);
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
    return `$${(priceCents / 100).toFixed(2)}`;
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
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
              Order Management
            </h1>
            <p className="text-lg mt-2">
              Manage and track customer orders
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportOrders}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
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
            className="rounded-none p-6 border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.completedOrders} completed
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
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">
                  {formatPrice(stats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Last 30 days
                </p>
              </div>
              <DollarSign className="w-8 h-8" />
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
                <p className="text-sm font-medium">Average Order</p>
                <p className="text-3xl font-bold mt-2">
                  {formatPrice(stats.averageOrderValue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Per order
                </p>
              </div>
              <Truck className="w-8 h-8" />
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
                <p className="text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Need attention
                </p>
              </div>
              <Clock className="w-8 h-8" />
            </div>
          </motion.div>
        </div>
      )}

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
            placeholder="Search by order number, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer"
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
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-none border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800/30">
                <th className="text-left p-4 font-semibold">Order</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Items</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Payment</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="text-sm text-gray-600">{order.email}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{order.items.length} items</p>
                      <p className="text-sm text-gray-600">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{formatPrice(order.totalCents)}</p>
                      <p className="text-sm text-gray-600">
                        Subtotal: {formatPrice(order.subtotalCents)}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium border rounded ${
                      order.paymentCompleted 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {order.paymentCompleted ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-medium border rounded flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-none transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/dashboard/orders/edit/${order._id}`)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none transition-colors"
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button> */}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center p-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'No orders have been placed yet'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}