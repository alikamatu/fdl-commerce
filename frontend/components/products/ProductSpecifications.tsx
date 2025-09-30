"use client";

import { motion } from 'framer-motion';
import { ProductSpecification } from '@/types/product';

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  specifications,
}) => {
  if (specifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="border-t border-foreground/10 pt-6"
    >
      <h3 className="text-lg font-semibold mb-4">Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specifications.map((spec, index) => (
          <div
            key={index}
            className="flex justify-between py-2 border-b border-foreground/5 last:border-b-0"
          >
            <span className="font-medium text-foreground/80">{spec.key}</span>
            <span className="text-foreground/60 text-right">{spec.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};