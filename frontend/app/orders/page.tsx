"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatusLegend } from '@/components/orders/OrderStatusLegend';
import { OrdersLoading } from '@/components/orders/OrdersLoading';
import { OrdersEmpty } from '@/components/orders/OrdersEmpty';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { orders, loading, error, cancelOrder } = useOrders();

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return <OrdersLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-4">Error Loading Orders</div>
            <p className="text-foreground/60 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Try Again
            </button>
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
            {orders.length > 0 
              ? `You have ${orders.length} order${orders.length !== 1 ? 's' : ''}`
              : 'Track and manage your orders'
            }
          </p>
        </motion.div>

        {/* Filters */}
        {orders.length > 0 && (
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {filteredOrders.length === 0 ? (
            <OrdersEmpty
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onClearFilters={handleClearFilters}
            />
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                index={index}
                onCancelOrder={cancelOrder}
              />
            ))
          )}
        </motion.div>

        {/* Order Status Legend */}
        {orders.length > 0 && <OrderStatusLegend />}
      </div>
    </div>
  );
}