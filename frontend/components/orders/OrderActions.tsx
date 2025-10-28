"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, X, Truck, MessageCircle } from "lucide-react";
import { Order } from "@/types/order";
import { canCancelOrder } from "@/utils/orderStatus";

interface OrderActionsProps {
  order: Order;
  onViewDetails: () => void;
  onCancelOrder: (orderId: string) => Promise<boolean>;
}

export const OrderActions: React.FC<OrderActionsProps> = ({ 
  order, 
  onViewDetails, 
  onCancelOrder 
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setIsCancelling(true);
    const success = await onCancelOrder(order._id);
    setIsCancelling(false);
    
    if (success) {
      // Success handled by parent
    } else {
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleTrackOrder = () => {
    if (order.trackingNumber) {
      window.open(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`, '_blank');
    } else {
      alert('Tracking number not available yet.');
    }
  };

  const handleWhatsAppSupport = () => {
    const adminWhatsAppNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '233547129636';
    
    const message = `Hello! I need follow-up on my order:\n\n` +
      `Order #: ${order.orderNumber}\n` +
      `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n` +
      `Total: GH₵${(order.totalCents / 100).toFixed(2)}\n` +
      `Ordered: ${new Date(order.createdAt).toLocaleDateString()}\n\n` +
      `Delivery: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.city}\n\n` +
      `Items:\n${order.items.map(item => `• ${item.title} (Qty: ${item.quantity}) - GH₵${(item.priceCents / 100).toFixed(2)}`).join('\n')}\n\n` +
      `Could you please provide an update on my order?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      {/* WhatsApp Support */}
      <motion.button
        onClick={handleWhatsAppSupport}
        className="flex items-center space-x-2 px-4 py-2 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-300"
        title="Contact support via WhatsApp"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={16} />
        <span>Message</span>
      </motion.button>

      {/* Track Order */}
      {order.status === 'delivering' && order.trackingNumber && (
        <motion.button
          onClick={handleTrackOrder}
          className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Truck size={16} />
          <span>Track</span>
        </motion.button>
      )}

      {/* View Details */}
      <motion.button
        onClick={onViewDetails}
        className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Eye size={16} />
        <span>Details</span>
      </motion.button>

      {/* Cancel Order */}
      {canCancelOrder(order.status) && (
        <motion.button
          onClick={handleCancelOrder}
          disabled={isCancelling}
          className="flex items-center space-x-2 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={16} />
          <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
        </motion.button>
      )}
    </div>
  );
};