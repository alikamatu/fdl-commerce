"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Truck, Package, CheckCircle, MessageCircle } from "lucide-react";
import { Order } from "@/types/order";
import { getStatusIcon, getStatusColor, formatOrderDate, formatCurrency, canCancelOrder } from "@/utils/orderStatus";

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: string) => Promise<boolean>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelOrder,
}) => {
  const StatusIcon = getStatusIcon(order.status);

  const handleCancelOrder = async () => {
    if (await onCancelOrder(order._id)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 min-h-screen"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-background rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-foreground/10 sticky top-0 bg-background rounded-t-2xl">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Order Details</h2>
                <p className="text-foreground/60 text-sm">Order #{order.orderNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Status & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Order Status</h3>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="w-5 h-5" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Order Date</h3>
                    <div className="flex items-center space-x-2 text-foreground/60">
                      <Calendar size={16} />
                      <span>{formatOrderDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {order.estimatedDelivery && (
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Estimated Delivery</h3>
                      <div className="flex items-center space-x-2 text-foreground/60">
                        <CheckCircle size={16} />
                        <span>{formatOrderDate(order.estimatedDelivery)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-foreground/5 rounded-lg p-4">
                  <h3 className="font-medium text-foreground">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Subtotal:</span>
                    <span>{formatCurrency(order.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Shipping:</span>
                    <span>{formatCurrency(order.shippingCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Tax:</span>
                    <span>{formatCurrency(order.taxCents)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-foreground/10 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalCents)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Shipping Address</h3>
                <div className="flex items-start space-x-2 text-foreground/60 bg-foreground/5 rounded-lg p-4">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p>
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-foreground/5 rounded-lg">
                      <div className="w-16 h-16 bg-foreground/10 rounded flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded"
                          />
                        ) : (
                          <Package size={24} className="text-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <p className="text-foreground/60 text-sm">
                          {item.brand} • SKU: {item.sku} • Qty: {item.quantity}
                        </p>
                        <p className="text-foreground/60 text-sm">
                          Unit Price: {formatCurrency(item.priceCents)}
                        </p>
                      </div>
                      <div className="text-foreground font-medium">
                        {formatCurrency(item.priceCents * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">Tracking Information</h3>
                  <div className="flex items-center space-x-2 text-foreground/60 bg-foreground/5 rounded-lg p-4">
                    <Truck size={18} />
                    <span>Tracking Number: {order.trackingNumber}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-foreground/10 sticky bottom-0 bg-background rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                Close
              </button>

                  <button
              onClick={() => {
                const adminWhatsAppNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '1234567890';
                const message = `Hello! I need follow-up on my order:\n\n` +
                  `Order #: ${order.orderNumber}\n` +
                  `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n` +
                  `Total: ₵${(order.totalCents / 100).toFixed(2)}\n` +
                  `Ordered: ${new Date(order.createdAt).toLocaleDateString()}\n` +
                  `Shipping: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.city}\n\n` +
                  `Items:\n${order.items.map(item => `• ${item.title} (Qty: ${item.quantity}) - ₵${(item.priceCents / 100).toFixed(2)}`).join('\n')}\n\n` +
                  `Could you please provide an update on my order?`;
                
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={16} />
              <span>Contact Support</span>
            </button>
              
              {canCancelOrder(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};