"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

interface HomeProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const HomeProductsPagination: React.FC<HomeProductsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    const end = Math.min(totalPages, start + showPages - 1);
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8"
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
      <Link href='/products' className='p-2 border border-foreground/20 rounded-md hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>View All Products</Link>
    </motion.div>
  );
};