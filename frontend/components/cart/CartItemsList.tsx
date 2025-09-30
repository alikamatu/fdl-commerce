"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';

export const CartItemsList: React.FC = () => {
  const { cart } = useCart();

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-light text-foreground mb-6">
        Cart Items ({cart.itemCount})
      </h2>

      <AnimatePresence>
        {cart.items.map((item, index) => (
          <CartItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};