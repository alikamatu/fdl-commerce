"use client";

import { Package, Search } from "lucide-react";
import { motion } from "framer-motion";

interface OrdersEmptyProps {
  searchTerm: string;
  statusFilter: string;
  onClearFilters: () => void;
}

export const OrdersEmpty: React.FC<OrdersEmptyProps> = ({
  searchTerm,
  statusFilter,
  onClearFilters,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
      
      {hasActiveFilters ? (
        <>
          <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            We couldn't find any orders matching your search criteria.
          </p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Search size={16} />
            <span>Clear Filters</span>
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <button
            onClick={() => window.location.href = '/products'}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Package size={16} />
            <span>Start Shopping</span>
          </button>
        </>
      )}
    </motion.div>
  );
};