"use client";

import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Home, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderConfirmationProps {
  order: any;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
  const isGuestUser = !order.userId && (!order.user || !order.user.id);
  const userName = order.user?.name || order.shippingAddress?.firstName || 'Guest';
  const router = useRouter();

  // Determine payment method display text
  const getPaymentMethodText = (method: string) => {
    switch(method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return 'Cash on Delivery';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>

      <h1 className="text-3xl font-light text-foreground mb-4">
        Order Confirmed!
      </h1>
      
      <p className="text-foreground/60 mb-6">
        Thank you for your purchase, {userName}. Your order has been confirmed and will be processed shortly.
      </p>

      <div className="bg-background border border-foreground/10 rounded-lg p-6 mb-8 text-left">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-foreground/10">
          <span className="text-foreground/60">Order Number</span>
          <span className="font-semibold text-foreground">
            {order.orderNumber || order.id}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-foreground/60">Total Amount</span>
          <span className="font-semibold text-foreground">
            GH₵{((order.totalCents || order.total) / 100).toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-foreground/60">Payment Method</span>
          <span className="font-semibold text-foreground flex items-center gap-2">
            <CreditCard size={16} />
            {getPaymentMethodText(order.paymentMethod)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-foreground/60">Estimated Delivery</span>
          <span className="font-semibold text-foreground">
            {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Payment Instructions for Cash on Delivery */}
      {order.paymentMethod === 'cash_on_delivery' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <CreditCard size={16} />
            Payment Instructions
          </h3>
          <p className="text-blue-800 text-sm">
            Please have the exact amount ready when your order arrives. Our delivery agent will collect payment upon delivery.
          </p>
        </div>
      )}

      {/* Order Progress */}
      <div className="flex justify-between items-center mb-8 max-w-md mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center mb-2">
            <Package size={16} />
          </div>
          <span className="text-xs text-foreground">Order Placed</span>
        </div>
        <div className="flex-1 h-0.5 bg-foreground/20 mx-2" />
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center mb-2">
            <Truck size={16} className="text-foreground/40" />
          </div>
          <span className="text-xs text-foreground/40">Shipped</span>
        </div>
        <div className="flex-1 h-0.5 bg-foreground/20 mx-2" />
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center mb-2">
            <Home size={16} className="text-foreground/40" />
          </div>
          <span className="text-xs text-foreground/40">Delivered</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4 mb-8 text-left">
        <h3 className="font-semibold text-foreground mb-2">Shipping Address</h3>
        <p className="text-foreground/80 text-sm">
          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
          {order.shippingAddress?.address}<br />
          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
          {order.shippingAddress?.phone}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
        >
          <Home size={16} />
          Continue Shopping
        </Link>
        
        {!isGuestUser && (
          <button 
            onClick={() => router.push('/orders')} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            <Package size={16} />
            View Order
          </button>
        )}
      </div>

      {/* Show this message only for guest users */}
      {isGuestUser && (
        <div className="mt-8 p-4 bg-foreground/5 rounded-lg">
          <p className="text-sm text-foreground/60 mb-2">
            Want to track your order and view order history?
          </p>
          <Link
            href="/register"
            className="text-sm font-medium text-foreground hover:underline"
          >
            Create an account to manage your orders
          </Link>
        </div>
      )}

      {/* Order confirmation email notice */}
      <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          📧 Order confirmation has been sent to {order.email}
        </p>
      </div>
    </motion.div>
  );
};