"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { ORDER_STATUSES } from "@/utils/orderStatus";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col sm:flex-row gap-4 mb-8"
    >
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
        <input
          type="text"
          placeholder="Search orders or products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-foreground placeholder-foreground/40"
        />
      </div>
      
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-foreground"
      >
        <option value="all">All Status</option>
        {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </motion.div>
  );
};