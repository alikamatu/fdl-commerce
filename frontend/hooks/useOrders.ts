"use client";

import { useState, useEffect } from 'react';
import { Order, OrdersResponse } from '@/types/order';
import { useAuth } from '@/context/AuthContext';
import { ApiHelper } from '@/lib/api-helper';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: OrdersResponse = await ApiHelper.json('/orders', {
        method: 'GET',
        requireAuth: true,
      });

      console.log('Fetched orders:', data);
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      let errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching orders';
      
      if (errorMessage === 'SESSION_EXPIRED') {
        errorMessage = 'Your session expired. Please login again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
      const response = await ApiHelper.fetch(`/orders/${orderId}/cancel`, {
        method: 'POST',
        requireAuth: true,
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cancel order error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.token]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    cancelOrder,
  };
};