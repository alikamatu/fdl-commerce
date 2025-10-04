"use client";

import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BrandProductListItemProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const BrandProductListItem: React.FC<BrandProductListItemProps> = ({
  product,
  onViewDetails,
}) => {
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
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  const handleProductClick = () => {
    router.push(`/products/${product._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="rounded-xl overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div 
            className="relative md:w-48 lg:w-56 xl:w-64 h-48 md:h-auto overflow-hidden cursor-pointer flex-shrink-0"
            onClick={handleProductClick}
          >
            <motion.img
              src={mainImage}
              alt={product.images[0]?.alt || product.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

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
          </div>

          {/* Product Details */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
              <div className="flex-1">
                {/* Category and Brand */}
                <div className="flex items-center gap-3 text-sm text-foreground/60 mb-2">
                  <span className="font-medium uppercase tracking-wide">
                    {(() => {
                      const categoryId = product.categoryId;
                      if (typeof categoryId === 'object' && categoryId?.name) {
                        return categoryId.name;
                      }
                      return 'Uncategorized';
                    })()}
                  </span>
                  <span className="text-foreground/30">•</span>
                  <span>by {product.brand}</span>
                </div>

                {/* Product Title */}
                <h3 
                  className="font-semibold text-lg text-foreground mb-3 line-clamp-2 cursor-pointer hover:text-foreground/80 transition-colors"
                  onClick={() => onViewDetails(product)}
                >
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-foreground/70 text-sm line-clamp-2 mb-4">
                  {product.description}
                </p>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-foreground/60 ml-1">4.5</span>
                  </div>
                  <span className="text-foreground/30">•</span>
                  <span className="text-sm text-foreground/60">24 reviews</span>
                  <span className="text-foreground/30">•</span>
                  <span className="text-sm text-foreground/60">SKU: {product.sku}</span>
                </div>

                {/* Key Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
                    {product.specifications.slice(0, 4).map((spec, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/60 font-medium">{spec.key}:</span>
                        <span className="text-foreground/80">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-start lg:items-end gap-4">
                {/* Price */}
                <div className="text-2xl font-bold text-foreground">
                  ${price}
                </div>

                {/* Stock Status */}
                <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock}+ in stock`}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-foreground/20 rounded-lg text-sm font-medium hover:bg-foreground/5 transition-colors whitespace-nowrap"
                  >
                    <Eye size={16} />
                    Quick View
                    <ChevronRight size={14} className="opacity-60" />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap relative"
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

            {/* Additional Info */}
            <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span>Free shipping</span>
                <span className="text-foreground/30">•</span>
                <span>30-day returns</span>
                <span className="text-foreground/30">•</span>
                <span>1-year warranty</span>
              </div>
              
              {/* View Full Details */}
              <button
                onClick={handleProductClick}
                className="text-sm text-foreground/60 hover:text-foreground/80 transition-colors flex items-center gap-1"
              >
                Full details
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};