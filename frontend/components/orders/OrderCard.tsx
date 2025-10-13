"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Eye, Download, MapPin, Truck, X } from "lucide-react";
import { Order } from "@/types/order";
import { getStatusIcon, getStatusColor, formatOrderDate, formatCurrency, canCancelOrder } from "@/utils/orderStatus";
import { OrderActions } from "./OrderActions";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderItems } from "./OrderItems";

interface OrderCardProps {
  order: Order;
  index: number;
  onCancelOrder: (orderId: string) => Promise<boolean>;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, index, onCancelOrder }) => {
  const [showDetails, setShowDetails] = useState(false);
  const StatusIcon = getStatusIcon(order.status);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="border border-foreground/10 rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-background/50 backdrop-blur-sm"
      >
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-4 h-4" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-foreground/60 font-mono">
              Order #{order.orderNumber}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-foreground/60">
              <Calendar size={16} />
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 font-medium text-foreground">
              <DollarSign size={16} />
              <span>{formatCurrency(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <OrderItems items={order.items} />

        {/* Shipping Info */}
        <div className="flex items-start space-x-2 text-sm text-foreground/60 mb-4">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Shipped to {order.shippingAddress.firstName} {order.shippingAddress.lastName}, 
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </span>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="flex items-center space-x-2 text-sm text-foreground/60 mb-4">
            <Truck size={16} />
            <span>Tracking: {order.trackingNumber}</span>
          </div>
        )}

        {/* Order Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-foreground/10">
          <div className="text-xs text-foreground/40 mb-3 sm:mb-0">
            Updated {formatOrderDate(order.updatedAt)}
          </div>
          
          <OrderActions 
            order={order}
            onViewDetails={() => setShowDetails(true)}
            onCancelOrder={onCancelOrder}
          />
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={order}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onCancelOrder={onCancelOrder}
      />
    </>
  );
};