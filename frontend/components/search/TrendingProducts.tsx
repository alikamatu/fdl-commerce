"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Product } from "@/types/product";

interface TrendingProductsProps {
  trendingProducts: Product[];
  onProductClick: (product: Product) => void;
  formatPrice: (priceCents: number) => string;
}

export const TrendingProducts: React.FC<TrendingProductsProps> = ({
  trendingProducts,
  onProductClick,
  formatPrice,
}) => {
  if (trendingProducts.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-foreground/60 mb-4 uppercase tracking-wide flex items-center gap-2">
        <TrendingUp size={16} />
        Trending Now
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trendingProducts.map((product, index) => (
          <motion.button
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onProductClick(product)}
            className="p-4 text-left bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors group flex items-center gap-3"
          >
            <img
              src={product.images[0]?.url || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground/80 group-hover:text-foreground truncate">
                {product.title}
              </div>
              <div className="text-sm text-foreground/60">
                {formatPrice(product.priceCents)}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};