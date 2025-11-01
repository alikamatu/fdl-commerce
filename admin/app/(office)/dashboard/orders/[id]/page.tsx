'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  Edit,
  RefreshCw,
  User,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  AlertCircle,
  Package2,
  BadgeCheck,
  FileText,
  Printer,
  Send
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
  status:  'confirmed' | 'processing' | 'delivering' | 'available' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  deliveryMethod: 'delivery' | 'pickup';
}

// Custom hook for order operations
function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      console.log('Fetching order:', id);
      console.log('Token exists:', !!token);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch order: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Order data:', data);
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      console.error('Fetch error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (paymentMethod: string) => {
  try {
    setUpdating(true);
    const token = localStorage.getItem('token');
    
    console.log('Updating payment method to:', paymentMethod);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/payment-method`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentMethod }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to update payment method');
    }

    const updatedOrder = await response.json();
    console.log('Updated order:', updatedOrder);
    
    setOrder(updatedOrder);
    setError(null);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update payment method';
    console.error('Update error:', err);
    setError(message);
    return false;
  } finally {
    setUpdating(false);
  }
};

  const updateOrderStatus = async (status: Order['status']) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      console.log('Updating order status to:', status);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('Updated order:', updatedOrder);
      
      setOrder(updatedOrder);
      setError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Update error:', err);
      setError(message);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const sendShippingNotification = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/notify-delivering`, {
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

  const sendPickupNotification = async () => {
        const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/notify-pickup`, {
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

  const sendDeliveredNotification = async () => {
        const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/notify-delivered`, {
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
  }

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  return {
    order,
    loading,
    error,
    updating,
    refetch: fetchOrder,
    updateOrderStatus,
    sendShippingNotification,
    sendPickupNotification,
    updatePaymentMethod,
    sendDeliveredNotification,
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
    sendShippingNotification,
    sendPickupNotification,
    updatePaymentMethod,
    sendDeliveredNotification,
  } = useOrder(orderId);

  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('confirmed');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mobile_money');

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setSelectedPaymentMethod(order.paymentMethod);
    }
  }, [order]);

  const handlePaymentMethodUpdate = async () => {
  if (!order || selectedPaymentMethod === order.paymentMethod) return;

  const success = await updatePaymentMethod(selectedPaymentMethod);
  if (success) {
    addAlert({
      type: 'success',
      title: 'Payment Method Updated',
      message: `Payment method changed to ${selectedPaymentMethod.replace('_', ' ')}`
    });
  } else {
    addAlert({
      type: 'error',
      title: 'Update Failed',
      message: 'Failed to update payment method'
    });
  }
};

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
        message: 'Delivery notification sent to customer'
      });
    } else {
      addAlert({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send delivering notification'
      });
    }
    setSendingNotification(false);
  };

    const handlePickupNotification = async () => {
      setSendingNotification(true);
      const success = await sendPickupNotification();
      if (success) {
        addAlert({
          type: 'success',
          title: 'Notification Sent',
          message: 'Pickup notification sent to customer'
        });
      } else {
        addAlert({
          type: 'error',
          title: 'Send Failed',
          message: 'Failed to send pickup notification'
        });
      }
      setSendingNotification(false);
    }

    const handleDeliveredNotification = async () => {
      setSendingNotification(true);
      const success = await sendDeliveredNotification(); 
      if (success) {
        addAlert({
          type: 'success',
          title: 'Notification Sent',
          message: 'Delivery completion notification sent to customer'
        });
      } else {
        addAlert({
          type: 'error',
          title: 'Send Failed',
          message: 'Failed to send delivery completion notification'
        });
      }
      setSendingNotification(false);
    }

  const formatPrice = (priceCents: number) => {
    return `₵${(priceCents / 100).toFixed(2)}`;
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
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
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

  const printOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-200"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load order</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refetch}
                className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
              >
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/orders')}
                className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Back to Orders
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-200"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6">The order you are looking for does not exist.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/orders')}
              className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Back to Orders
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex w-full items-center justify-center gap-2 ml-12">
            <img src="/logo/fdll.jpeg" className='w-16 h-auto rounded-2xl' alt="" />
            <p className='font-bold text-2xl flex flex-col'>Forbes Digital Lifeline <span className='text-lg font-light'>Your Digital 🆘 </span></p>
          </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/orders')}
              className="p-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 mt-1"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gray-100 rounded-2xl">
                  <Package className="w-7 h-7 text-gray-700" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Order #{order.orderNumber} <span className='bg-amber-600 rounded-full text-lg text-white p-2 px-4'>{order.deliveryMethod}</span>
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Order details and management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={printOrder}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Order Status Banner */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getStatusColor(order.status).split(' ')[0]}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                    <p className="text-gray-600">Current status of the order</p>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold border rounded-xl ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-100">
                          <Package2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Unit Price: {formatPrice(item.priceCents)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-lg">{formatPrice(item.priceCents * item.quantity)}</p>
                      <p className="text-sm text-gray-600">{item.quantity} × {formatPrice(item.priceCents)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <User className="w-5 h-5 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Address</p>
                      <p className="text-gray-600">{order.email}</p>
                    </div>
                  </div>
                  {order.userId && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <BadgeCheck className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Account Type</p>
                        <p className="text-green-700 font-medium">Registered User</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Delivery Address */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{order.deliveryMethod === "delivery" ? "Delivey" : "Pickup"} Address</h2>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column - Order Management */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-gray-200 font-semibold text-lg">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-black">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </motion.div>

            {/* Order Status Management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Edit className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Change Order Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white appearance-none cursor-pointer"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="delivering">Delivering</option>
                    <option value="available">Available for Pickup</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStatusUpdate}
                  disabled={updating || selectedStatus === order.status}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Edit className="w-5 h-5" />
                  )}
                  <span>
                    {updating ? 'Updating...' : selectedStatus === order.status ? 'No Changes' : 'Update Status'}
                  </span>
                </motion.button>
{order.status === 'delivering' && order.deliveryMethod === 'delivery' && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleSendShippingNotification}
    disabled={sendingNotification}
    className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
  >
    {sendingNotification ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
    ) : (
      <Truck className="w-5 h-5" />
    )}
    <span>
      {sendingNotification ? 'Sending...' : 'Send Delivering Notification'}
    </span>
  </motion.button>
)}

{order.status === 'available' && order.deliveryMethod === 'pickup' && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handlePickupNotification}
    disabled={sendingNotification}
    className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
  >
    {sendingNotification ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
    ) : (
      <Package className="w-5 h-5" />
    )}
    <span>
      {sendingNotification ? 'Sending...' : 'Send Pickup Notification'}
    </span>
  </motion.button>
)}

{order.status === 'delivered' && (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleDeliveredNotification}
    disabled={sendingNotification}
    className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
  >
    {sendingNotification ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
    ) : (
      <CheckCircle className="w-5 h-5" />
    )}
    <span>
      {sendingNotification ? 'Sending...' : 'Send Delivered Notification'}
    </span>
  </motion.button>
)}
              </div>
            </motion.div>

            {/* Payment Information */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="bg-white rounded-2xl border border-gray-200 p-6"
>
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-gray-100 rounded-xl">
      <CreditCard className="w-5 h-5 text-gray-700" />
    </div>
    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
  </div>
  <div className="space-y-4">
    {/* Payment Method Selection */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Payment Method
      </label>
      <select
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white appearance-none cursor-pointer"
      >
        <option value="mobile_money">Mobile Money (Momo)</option>
        <option value="cash">Cash</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cash_or_momo">Cash / Momo</option>
      </select>
    </div>

    {/* Update Payment Method Button */}
    {selectedPaymentMethod !== order.paymentMethod && (
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePaymentMethodUpdate}
        disabled={updating}
        className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
      >
        {updating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        <span>
          {updating ? 'Updating...' : 'Update Payment Method'}
        </span>
      </motion.button>
    )}

    {/* Payment Status */}
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
      <span className="font-medium text-gray-900">Payment Status</span>
      <span className={`px-3 py-1.5 text-xs font-semibold border rounded-lg ${
        order.paymentCompleted 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {order.paymentCompleted ? 'Completed' : 'Pending'}
      </span>
    </div>

    {/* Payment ID */}
    {order.paymentId && (
      <div className="p-3 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-900 mb-1">Payment ID</p>
        <p className="text-sm font-mono text-gray-700 break-all">{order.paymentId}</p>
      </div>
    )}

    {/* Payment Method Display */}
    <div className="p-3 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Payment Method</p>
          <p className="font-semibold text-gray-900 capitalize">
            {order.paymentMethod.replace(/_/g, ' ')}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${
          order.paymentMethod === 'cash_or_momo' ? 'bg-blue-100' :
          order.paymentMethod === 'bank_transfer' ? 'bg-green-100' :
          'bg-amber-100'
        }`}>
          <CreditCard className={`w-5 h-5 ${
            order.paymentMethod === 'cash_or_momo' ? 'text-blue-600' :
            order.paymentMethod === 'bank_transfer' ? 'text-green-600' :
            'text-amber-600'
          }`} />
        </div>
      </div>
    </div>
  </div>
</motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Order Placed</span>
                  <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                </div>
                {order.shippedAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{order.deliveryMethod === "pickup" ? "Available for Pickup" : "Delivery"}</span>
                    <span className="font-medium text-gray-900">{formatDate(order.shippedAt)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Delivered</span>
                    <span className="font-medium text-gray-900">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}