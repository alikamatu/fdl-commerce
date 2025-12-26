"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Truck } from "lucide-react";
import { Order } from "@/types/order";
import { getStatusIcon, getStatusColor, formatOrderDate, formatCurrency, formatStatusDisplay } from "@/utils/orderStatus";
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
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white hover:scale-[1.02]"
      >
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-4 h-4" />
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
              {formatStatusDisplay(order.status)} {order.status === "available" ? "for Pickup" : ""}
            </span>
            </div>
            <div className="text-sm text-gray-600 font-mono">
              Order #{order.orderNumber}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Calendar size={16} />
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 font-medium text-gray-900">
              <span>{formatCurrency(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <OrderItems items={order.items} />

        {/* Shipping Info */}
        <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            {order.deliveryMethod === "delivery" ? `Devlivery to ${order.shippingAddress.firstName} ${order.shippingAddress.lastName},` : "Pickup at"} <span> </span>  {order.shippingAddress.address}
          </span>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Truck size={16} />
            <span>Tracking: {order.trackingNumber}</span>
          </div>
        )}

        {/* Order Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-3 sm:mb-0">
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