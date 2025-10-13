"use client";

import { Package } from "lucide-react";
import { OrderItem } from "@/types/order";
import { formatCurrency } from "@/utils/orderStatus";

interface OrderItemsProps {
  items: OrderItem[];
}

export const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="space-y-3 mb-4">
      {items.map((item, index) => (
        <div key={`${item.productId}-${index}`} className="flex items-center space-x-3 p-3 bg-foreground/5 rounded-lg">
          <div className="w-12 h-12 bg-foreground/10 rounded flex items-center justify-center flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <Package size={20} className="text-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm line-clamp-2">
              {item.title}
            </h4>
            <p className="text-foreground/60 text-xs">
              {item.brand} • SKU: {item.sku} • Qty: {item.quantity}
            </p>
          </div>
          <div className="text-foreground text-sm font-medium whitespace-nowrap">
            {formatCurrency(item.priceCents * item.quantity)}
          </div>
        </div>
      ))}
    </div>
  );
};