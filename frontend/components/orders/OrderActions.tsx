"use client";

import { useState } from "react";
import { Eye, Download, X, Truck } from "lucide-react";
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

  return (
    <div className="flex items-center space-x-2">
      {/* Track Order */}
      {order.status === 'shipped' && order.trackingNumber && (
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

      {/* Download Invoice */}
      <button
        onClick={() => alert('Invoice download feature coming soon!')}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
      >
        <Download size={16} />
        <span>Invoice</span>
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