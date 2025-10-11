"use client";

import { motion } from 'framer-motion';
import { Package, Filter, Grid, List } from 'lucide-react';

interface ProductStatsProps {
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const ProductStats: React.FC<ProductStatsProps> = ({
  totalProducts,
  currentPage,
  totalPages,
  viewMode,
  onViewModeChange,
}) => {
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalProducts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      {/* Results Count */}
      <div className="flex items-center gap-2 text-foreground/60">
        <Package size={16} />
        <span className="text-sm">
          Showing {startItem}-{endItem} of {totalProducts} products
        </span>
      </div>

      {/* View Mode Toggle */}
      {/* <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/60 mr-2">View:</span>
        <div className="flex border border-foreground/20 rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-foreground text-background'
                : 'hover:bg-foreground/5'
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-foreground text-background'
                : 'hover:bg-foreground/5'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div> */}
    </motion.div>
  );
};