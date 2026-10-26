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
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Download,
  MapPin,
  CreditCard,
  Info,
  AlertCircle,
  Trash2,
  AlertTriangle
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
  shippingAddress?: ShippingAddress;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: string;
  paymentCompleted: boolean;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'delivering' | 'available' | 'delivered' | 'cancelled' | 'pending_payment';
  createdAt: string;
  updatedAt: string;
  deliveringAt?: string;
  deliveredAt?: string;
  deliveryMethod: 'delivery' | 'pickup';
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
    
    // Use admin endpoint to get ALL orders
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      setOrders(Array.isArray(data.data) ? data.data : []);
    } else if (Array.isArray(data)) {
      setOrders(data);
    } else {
      setOrders([]);
    }
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

  const deleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      await fetchOrders();
      return true;
    } catch (err) {
      console.error('Failed to delete order:', err);
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
    deleteOrder,
  };
}

const formatPaymentMethod = (method?: string) => {
  const m = (method || '').toLowerCase();
  switch (m) {
    case 'mobile_money':
      return 'Mobile Money (MoMo)';
    case 'cash':
      return 'Cash';
    case 'bank_card':
      return 'Bank Card';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'cash_or_momo':
      return 'N/A';
    default:
      return (method || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { addAlert } = useAlert();
  const {
    orders,
    stats,
    loading,
    error,
    refetch,
    updateOrderStatus,
    deleteOrder
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; orderNumber: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const orderNumber = String(order.orderNumber || '').toLowerCase();
        const email = String(order.email || '').toLowerCase();
        const fullName = String(order.shippingAddress?.fullName || '').toLowerCase();
        return orderNumber.includes(term) || email.includes(term) || fullName.includes(term);
      });
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

  const handleDeleteOrder = async (orderId: string) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      addAlert({
        type: 'success',
        title: 'Order Deleted',
        message: 'Order has been permanently deleted'
      });

      setDeleteConfirm(null);
      await refetch();
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete order'
      });
    } finally {
      setDeleting(false);
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

  const formatStatusLabel = (status: Order['status']) => {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending_payment':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'delivering':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';
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
      case 'pending_payment':
        return <CreditCard className="w-4 h-4" />;
      case 'delivering':
        return <Truck className="w-4 h-4" />;
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
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
        'Customer Name': order.shippingAddress?.fullName || order.email || '',
        'Total Amount': formatPrice(order.totalCents),
        Status: order.status,
        'Order Date': formatDate(order.createdAt),
        'Payment Status': order.paymentCompleted ? 'Completed' : 'Pending',
        'Items Count': order.items.length,
        'Shipping City': order.shippingAddress?.city || '',
        'Shipping Country': order.shippingAddress?.country || ''
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
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50/30 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:gap-6"
        >
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3 bg-blue-50 rounded-2xl flex-shrink-0">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">
                Manage and track customer orders in real-time
              </p>
            </div>
          </div>
          
          <div className="admin-toolbar">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 min-h-11 min-w-11 inline-flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
              title="Refresh orders"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportOrders}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 min-h-11 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
            >
              <Download className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-4">
            {['pending_payment', 'confirmed', 'processing', 'delivering', 'available', 'delivered', 'cancelled'].map((status) => (
              <button
                type="button"
                key={status}
                className={`p-3 sm:p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 min-h-11 ${
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
                <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize leading-snug">{formatStatusLabel(status as Order['status'])}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{getStatusCount(status as Order['status'])}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order #, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="delivering">Delivering</option>
                <option value="available">Available for Pickup</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 min-h-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl p-3 sm:p-4 min-h-11">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Showing</span>
              </div>
              <span className="font-semibold text-gray-900">
                {filteredOrders.length} of {orders.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Orders list: cards on mobile, table on md+ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{order.orderNumber}</p>
                    <p className="text-sm text-orange-600 capitalize mt-0.5">{order.deliveryMethod}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold border rounded-lg flex items-center gap-1.5 flex-shrink-0 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="hidden xs:inline">{formatStatusLabel(order.status)}</span>
                    <span className="xs:hidden">{formatStatusLabel(order.status).split(' ')[0]}</span>
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="font-medium text-gray-900 truncate">{order.shippingAddress?.fullName || order.email || '—'}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate pl-6">{order.email}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 pl-6 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.shippingAddress?.city || '—'}
                    </span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="font-semibold text-gray-900">GH{formatPrice(order.totalCents)}</p>
                    <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${
                    order.paymentCompleted 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-11 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: order._id, orderNumber: order.orderNumber })}
                    className="inline-flex items-center justify-center p-2.5 min-h-11 min-w-11 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / tablet table */}
          <div className="hidden md:block admin-table-scroll">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap">Order</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap">Customer</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap hidden lg:table-cell">Date</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap hidden xl:table-cell">Item(s)</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap">Total</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap hidden lg:table-cell">Payment</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap">Status</th>
                  <th className="text-left p-4 lg:p-6 font-semibold text-gray-900 whitespace-nowrap">Actions</th>
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
                    <td className="p-4 lg:p-6">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                          <p className="text-sm text-orange-600 capitalize">{order.deliveryMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 lg:p-6">
                      <div className="min-w-0 max-w-[12rem] lg:max-w-none">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <p className="font-medium text-gray-900 truncate">{order.shippingAddress?.fullName || order.email || '—'}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-1 truncate">{order.email}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.shippingAddress?.city || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 lg:p-6 hidden lg:table-cell">
                      <div>
                        <p className="font-medium text-sm text-gray-700 whitespace-nowrap">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 lg:p-6 hidden xl:table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{order.items.length} item(s)</p>
                        <p className="text-sm text-gray-600">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} unit(s)
                        </p>
                      </div>
                    </td>
                    <td className="p-4 lg:p-6">
                      <div>
                        <p className="font-semibold text-gray-900 whitespace-nowrap">GH{formatPrice(order.totalCents)}</p>
                        <p className="text-sm text-gray-600 whitespace-nowrap hidden xl:block">
                          Subtotal: GH{formatPrice(order.subtotalCents)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 lg:p-6 hidden lg:table-cell">
                      <span className={`inline-block px-3 py-1.5 text-xs font-semibold border rounded-lg capitalize ${
                        order.paymentCompleted 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {formatPaymentMethod(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="p-4 lg:p-6">
                      <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg inline-flex items-center gap-2 w-fit max-w-[9rem] ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="truncate">{formatStatusLabel(order.status)}</span>
                      </span>
                    </td>
                    <td className="p-4 lg:p-6">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                          className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteConfirm({ id: order._id, orderNumber: order.orderNumber })}
                          className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center p-8 sm:p-12">
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

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Order</h3>
                <p className="text-gray-600 mb-1">Are you sure you want to permanently delete this order?</p>
                <p className="text-sm font-semibold text-gray-900 mt-2 break-all">{deleteConfirm.orderNumber}</p>
                <p className="text-xs text-red-500 mt-2">This action cannot be undone. Stock will be restored for non-cancelled orders.</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-6 py-3 min-h-11 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(deleteConfirm.id)}
                  disabled={deleting}
                  className="px-6 py-3 min-h-11 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Order'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}