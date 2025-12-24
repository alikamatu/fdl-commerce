"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HomeProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const HomeProductsPagination: React.FC<HomeProductsPaginationProps> = ({
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex items-end justify-end gap-4 mt-8"
    >
      {/* <div className="text-sm text-foreground/60">
        Showing {startItem}-{endItem} of {totalItems} products
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-foreground/20 rounded-md hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              page === currentPage
                ? 'bg-foreground text-background'
                : 'border border-foreground/20 hover:bg-foreground/5'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-foreground/20 rounded-md hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div> */}
      <Link href='/products' className='flex justify-center items-center gap-2 p-2 border border-foreground/20 rounded-md hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>View All Products <ArrowRight size={16} /></Link>
    </motion.div>
  );
};