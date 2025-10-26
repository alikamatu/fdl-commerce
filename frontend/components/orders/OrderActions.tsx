"use client";

import { useState } from "react";
import { Eye, Download, X, Truck, MessageCircle } from "lucide-react";
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
      // In a real app, you might redirect to carrier's tracking page
      window.open(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`, '_blank');
    } else {
      alert('Tracking number not available yet.');
    }
  };

  const handleWhatsAppSupport = () => {
    // Get admin WhatsApp number from environment variables or use a default
    const adminWhatsAppNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '233547129636';
    
    // Create a detailed message about the order
    const message = `Hello! I need follow-up on my order:\n\n` +
      `Order #: ${order.orderNumber}\n` +
      `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n` +
      `Total: GH₵${(order.totalCents / 100).toFixed(2)}\n` +
      `Ordered: ${new Date(order.createdAt).toLocaleDateString()}\n\n` +
      `Items:\n${order.items.map(item => `• ${item.title} (Qty: ${item.quantity}) - GH₵${(item.priceCents / 100).toFixed(2)}`).join('\n')}\n\n` +
      `Could you please provide an update on my order?`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      {/* WhatsApp Support */}
      <button
        onClick={handleWhatsAppSupport}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
        title="Contact support via WhatsApp"
      >
        <MessageCircle size={16} />
        <span>Message</span>
      </button>

      {/* Track Order */}
      {order.status === 'delivering' && order.trackingNumber && (
        <button
          onClick={handleTrackOrder}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Truck size={16} />
          <span>Track</span>
        </button>
      )}

      {/* View Details */}
      <button
        onClick={onViewDetails}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
      >
        <Eye size={16} />
        <span>Details</span>
      </button>

      {/* Cancel Order */}
      {canCancelOrder(order.status) && (
        <button
          onClick={handleCancelOrder}
          disabled={isCancelling}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <X size={16} />
          <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
        </button>
      )}
    </div>
  );
};