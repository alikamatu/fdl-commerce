"use client";

import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const price = (item.priceCents / 100).toFixed(2);
  const total = ((item.priceCents * item.quantity) / 100).toFixed(2);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      handleQuantityChange(item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    handleQuantityChange(item.quantity - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row gap-4 p-6 rounded-lg bg-background"
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <a 
          href={`/products/${item.productId}`}
          className="block w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-foreground/10"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </a>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1">
            <a 
              href={`/products/${item.productId}`}
              className="group"
            >
              <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2">
                {item.title}
              </h3>
            </a>
            <p className="text-sm text-foreground/60 mt-1">by {item.brand}</p>
            <p className="text-sm text-foreground/40 mt-1">SKU: {item.sku}</p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">GH₵ {price}</p>
            {item.quantity > 1 && (
              <p className="text-sm text-foreground/60">
                GH₵ {total} total
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground/80">Quantity:</span>
            
            <div className="flex items-center border border-foreground/20 rounded-lg">
              <button
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className="p-2 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              
              <span className="px-4 py-2 min-w-12 text-center font-medium">
                {item.quantity}
              </span>
              
              <button
                onClick={handleIncrement}
                disabled={item.quantity >= item.stock}
                className="p-2 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {item.quantity >= item.stock && (
              <span className="text-xs text-amber-600">
                Max stock reached
              </span>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => removeItem(item.id)}
            className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">Remove</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};