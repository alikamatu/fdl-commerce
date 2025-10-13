"use client";

import { useState, useEffect } from 'react';
import { Order, OrdersResponse } from '@/types/order';
import { useAuth } from '@/context/AuthContext';

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data: OrdersResponse = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
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