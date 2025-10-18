"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface CompactProductCardProps {
  product: Product;
}

export const CompactProductCard: React.FC<CompactProductCardProps> = ({
  product,
}) => {
  const { addItem } = useCart();

  const price = (product.priceCents / 100).toFixed(2);
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const cartItem = {
      productId: product._id,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      image: mainImage,
      stock: product.stock,
      brand: product.brand,
      sku: product.sku,
    };

    addItem(cartItem);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-foreground/20 h-full flex">
        {/* Product Image */}
        <a 
          href={`/products/${product._id}`}
          className="flex-shrink-0 w-32 h-32 overflow-hidden"
        >
          <img
            src={mainImage}
            alt={product.images[0]?.alt || product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Product Details */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <a 
              href={`/products/${product._id}`}
              className="group"
            >
              <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 text-sm leading-tight mb-1">
                {product.title}
              </h3>
            </a>
            
            <p className="text-xs text-foreground/60 mb-2">by {product.brand}</p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-foreground/60">(24)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                ₵{price}
              </span>
              {isOutOfStock && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <WishlistButton product={product} size="sm" />
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="p-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};