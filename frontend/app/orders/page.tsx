"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  productId: string;
  title: string;
  priceCents: number;
  quantity: number;
  image: string;
  sku: string;
  brand: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.token) {
    fetchOrders();
  }
}, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-foreground/10 rounded w-64 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-foreground/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-foreground mb-2">
            Your Orders
          </h1>
          <p className="text-foreground/60">
            Track and manage your orders
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
            <input
              type="text"
              placeholder="Search orders or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
              <p className="text-foreground/60">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'You haven\'t placed any orders yet'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-foreground/10 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-foreground/60">
                      Order #{order.orderNumber}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-foreground/60">
                      <Calendar size={16} />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 font-medium text-foreground">
                      <DollarSign size={16} />
                      <span>{(order.totalCents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-foreground/5 rounded flex items-center justify-center">
                        <Package size={20} className="text-foreground/40" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">
                          {item.title}
                        </h4>
                        <p className="text-foreground/60 text-sm">
                          {item.brand} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-foreground text-sm">
                        ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-foreground/10">
                  <div className="text-sm text-foreground/60 mb-3 sm:mb-0">
                    Shipped to {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-foreground/20 rounded hover:bg-foreground/5 transition-colors">
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-foreground/20 rounded hover:bg-foreground/5 transition-colors">
                      <Download size={16} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Order Status Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 border border-foreground/10 rounded-lg"
        >
          <h3 className="font-medium text-foreground mb-3">Order Status Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-foreground/60">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="text-foreground/60">Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-foreground/60">Shipped</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-foreground/60">Delivered</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}