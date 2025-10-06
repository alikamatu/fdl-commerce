"use client";

import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Category } from '@/types/product';
import Link from 'next/link';

interface ProductBreadcrumbsProps {
  category?: Category;
  currentPage?: string;
}

export const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({
  category,
  currentPage = 'Products',
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 text-sm text-foreground/60 mb-8"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>
      
      <ChevronRight size={16} />
      
      <Link
        href="/products"
        className="hover:text-foreground transition-colors"
      >
        Products
      </Link>

      {category && (
        <>
          <ChevronRight size={16} />
          <Link
            href={`/products?category=${category._id}`}
            className="hover:text-foreground transition-colors"
          >
            {category.name}
          </Link>
        </>
      )}

      <ChevronRight size={16} />
      <span className="text-foreground font-medium">{currentPage}</span>
    </motion.nav>
  );
};