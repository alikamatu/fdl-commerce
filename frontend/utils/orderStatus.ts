import { Package, Truck, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Order } from '@/types/order';

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  processing: { label: 'Processing', color: 'orange' },
  delivering: { label: 'Delivering', color: 'blue'},
  available: { label: 'Available for Pickup', color: 'green' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
} as const;

export const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return CheckCircle;
    case 'delivering':
      return Truck;
    case 'processing':
      return Package;
    case 'confirmed':
      return Clock;
    case 'available':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'cancelled':
      return XCircle;
    default:
      return AlertCircle;
  }
};

export const getStatusColor = (status: Order['status']) => {
  const colors = {
    delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
    delivering: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
    available: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
    processing: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
    cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
  };
  return colors[status];
};

export const canCancelOrder = (status: Order['status']) => {
  return ['pending', 'confirmed'].includes(status);
};

export const formatOrderDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (cents: number) => {
  return 'GH₵ ' + (cents / 100).toFixed(2);
};
