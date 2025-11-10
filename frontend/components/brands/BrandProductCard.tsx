"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


interface BrandProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const BrandProductCard: React.FC<BrandProductCardProps> = ({
  product,
  onViewDetails,
}) => {
  console.log('ProductCard product:', product); 
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();


  const price = (product.priceCents / 100).toFixed(2);
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsAddingToCart(true);
    
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
    
    // Add a small delay for better UX
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-foreground/20 h-full flex flex-col">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton 
            product={product} 
            size="sm"
          />
        </div>

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image */}
        <div 
          className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-gray-50"
          onClick={() => router.push(`/products/${product._id}`)}
        >
          <motion.img
            src={mainImage}
            alt={product.images[0]?.alt || product.title}
            className="w-full h-full object-contain"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
<div className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-1">
  {(() => {
    const categoryId = product.categoryId;
    if (typeof categoryId === 'object' && categoryId?.name) {
      return categoryId.name;
    }
    return 'Uncategorized';
  })()}
</div>
          {/* Product Title */}
          <h3 
            className="font-semibold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-foreground/80 transition-colors"
            onClick={() => onViewDetails(product)}
          >
            {product.title}
          </h3>

          {/* Brand */}
          <div className="text-sm text-foreground/60 mb-3">
            by {product.brand}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-foreground/60 ml-1">(24)</span>
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-foreground mb-4">
            ${price}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onViewDetails(product)}
              className="flex items-center justify-center gap-1 flex-1 px-3 py-2 border border-foreground/20 rounded-md text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <Eye size={16} />
              Details
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className="flex items-center justify-center gap-1 flex-1 px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
            >
              {isAddingToCart ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                />
              ) : (
                <ShoppingCart size={16} />
              )}
              <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};