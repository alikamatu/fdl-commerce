"use client";

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartIconProps {
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ className = '' }) => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <a href="/cart" className={`relative ${className}`}>
      <ShoppingBag size={24} className="text-foreground" />
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}
    </a>
  );
};