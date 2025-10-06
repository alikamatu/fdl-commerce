'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  Edit,
  RefreshCw,
  User,
  MapPin,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Download,
  Send,
  Printer
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

// Types
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

// Custom hook for order operations
function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

const updateOrderStatus = async (status: Order['status']) => {
  try {
    setUpdating(true);
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }), // Make sure the body matches what the backend expects
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    const updatedOrder = await response.json();
    setOrder(updatedOrder);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update order status';
    setError(message);
    return false;
  } finally {
    setUpdating(false);
  }
};

  const sendShippingNotification = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/notify-shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send notification';
      setError(message);
      return false;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  return {
    order,
    loading,
    error,
    updating,
    refetch: fetchOrder,
    updateOrderStatus,
    sendShippingNotification,
  };
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.id;
  const router = useRouter();
  const { addAlert } = useAlert();
  const {
    order,
    loading,
    error,
    updating,
    refetch,
    updateOrderStatus,
    sendShippingNotification
  } = useOrder(orderId);

  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('pending');
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;

    const success = await updateOrderStatus(selectedStatus);
    if (success) {
      addAlert({
        type: 'success',
        title: 'Status Updated',
        message: `Order status changed to ${selectedStatus}`
      });
    } else {
      addAlert({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status'
      });
    }
  };

  const handleSendShippingNotification = async () => {
    setSendingNotification(true);
    const success = await sendShippingNotification();
    if (success) {
      addAlert({
        type: 'success',
        title: 'Notification Sent',
        message: 'Shipping notification sent to customer'
      });
    } else {
      addAlert({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send shipping notification'
      });
    }
    setSendingNotification(false);
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const printOrder = () => {
    window.print();
  };

  const downloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    addAlert({
      type: 'success',
      title: 'Invoice Downloaded',
      message: 'Order invoice has been downloaded'
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load order</h3>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={refetch}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border rounded-none p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Orders
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
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-light tracking-tight flex items-center">
              <Package className="w-8 h-8 mr-3" />
              Order #{order.orderNumber}
            </h1>
            <p className="text-lg mt-2">
              Order Details & Management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refetch}
            className="p-2 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadInvoice}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Invoice</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={printOrder}
            className="flex items-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </motion.button>
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
            <Clock className="w-5 h-5 mr-3" />
            <p className="text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-none"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center border rounded-none">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.priceCents)}</p>
                    <p className="text-sm text-gray-600">
                      Total: {formatPrice(item.priceCents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </span>
                <span>{order.email}</span>
              </div>
              {order.userId && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Account</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Registered User
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.shippingAddress.phone}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Order Management */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.taxCents)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </motion.div>

          {/* Order Status Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Status</span>
                <span className={`px-3 py-1 text-sm font-medium border rounded flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Update Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                  className="w-full p-2 border rounded-none bg-background focus:ring-2 focus:ring-current focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
                <span>
                  {updating ? 'Updating...' : selectedStatus === order.status ? 'No Changes' : 'Update Status'}
                </span>
              </motion.button>

              {selectedStatus === 'shipped' && order.status !== 'shipped' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendShippingNotification}
                  disabled={sendingNotification}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {sendingNotification ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{sendingNotification ? 'Sending...' : 'Notify Customer'}</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Status</span>
                <span className={`px-2 py-1 text-xs font-medium border rounded ${
                  order.paymentCompleted 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {order.paymentCompleted ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment ID</span>
                  <span className="text-sm font-mono">{order.paymentId}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-none p-6 border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Order Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Order Placed</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span>Shipped</span>
                  <span>{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span>Delivered</span>
                  <span>{formatDate(order.deliveredAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}