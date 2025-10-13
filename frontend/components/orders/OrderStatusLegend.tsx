"use client";

import { motion } from "framer-motion";
import { ORDER_STATUSES, getStatusIcon } from "@/utils/orderStatus";

export const OrderStatusLegend: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 p-6 border border-foreground/10 rounded-lg bg-background/50 backdrop-blur-sm"
    >
      <h3 className="font-medium text-foreground mb-4">Order Status Guide</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {Object.entries(ORDER_STATUSES).map(([status, { label }]) => {
          const StatusIcon = getStatusIcon(status as any);
          return (
            <div key={status} className="flex items-center space-x-3">
              <StatusIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-foreground/60">{label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};