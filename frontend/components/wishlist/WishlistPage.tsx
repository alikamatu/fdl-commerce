'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    const cartItem = {
      productId: item.productId,
      title: item.title,
      priceCents: item.priceCents,
      currency: item.currency,
      image: item.image,
      stock: 10, // You might want to fetch actual stock
      brand: item.brand,
      sku: item.sku,
    };
    addItem(cartItem);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(item => {
      handleAddToCart(item);
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-foreground/5 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-foreground/5 rounded-full">
              <Heart size={48} className="text-foreground/40" />
            </div>
          </div>
          <h1 className="text-3xl font-light text-foreground mb-4">
            Your Wishlist is Empty
          </h1>
          <p className="text-foreground/60 mb-8">
            Start building your collection by adding items you love to your wishlist.
          </p>
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            Explore Products
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">
              Your Wishlist
            </h1>
            <p className="text-foreground/60">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <ShoppingCart size={16} />
              Add All to Cart
            </button>
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-background border border-foreground/10 rounded-lg overflow-hidden group"
              >
                {/* Product Image */}
                <a href={`/products/${item.productId}`} className="block aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </a>

                {/* Product Details */}
                <div className="p-4">
                  <a href={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-foreground/80 transition-colors">
                      {item.title}
                    </h3>
                  </a>
                  
                  <p className="text-sm text-foreground/60 mb-2">by {item.brand}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">
                      ${(item.priceCents / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-foreground/40">SKU: {item.sku}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};