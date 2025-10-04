'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, Package, Shield, Truck } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useState } from 'react';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  open,
  onClose,
}) => {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const price = (product.priceCents / 100).toFixed(2);
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;
  const currentImage = product.images[currentImageIndex] || product.images[0];

  const handleAddToCart = () => {
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-background/95 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-foreground/80">Quick View</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-foreground/5 rounded-lg transition-colors group"
              >
                <X size={20} className="text-foreground/60 group-hover:text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Product Images - Fixed Size */}
                <div className="relative bg-gray-50 flex items-center justify-center p-8 border-r border-foreground/5">
                  <div className="w-full max-w-md aspect-square relative">
                    {/* Main Image */}
                    <motion.img
                      key={currentImageIndex}
                      src={currentImage?.url || mainImage}
                      alt={currentImage?.alt || product.title}
                      className="w-full h-full object-contain rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
                        >
                          <ChevronLeft 
                            size={20} 
                            className="text-foreground/60 group-hover:text-foreground" 
                          />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
                        >
                          <ChevronRight 
                            size={20} 
                            className="text-foreground/60 group-hover:text-foreground" 
                          />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm text-foreground/60">
                        {currentImageIndex + 1} / {product.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                            currentImageIndex === index 
                              ? 'border-foreground shadow-md' 
                              : 'border-foreground/20 hover:border-foreground/40'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {product.images.length > 4 && (
                        <div className="w-12 h-12 rounded-lg border-2 border-foreground/20 flex items-center justify-center text-xs text-foreground/60 bg-foreground/5">
                          +{product.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Details - Scrollable */}
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="space-y-6">
                      {/* Category and Stock Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground/60 bg-foreground/5 px-3 py-1 rounded-full">
                          {(() => {
                            const categoryId = product.categoryId;
                            if (typeof categoryId === 'object' && categoryId?.name) {
                              return categoryId.name;
                            }
                            return 'Uncategorized';
                          })()}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Package size={14} />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Package size={14} />
                            In Stock ({product.stock} available)
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                        {product.title}
                      </h1>

                      {/* Brand */}
                      <div className="text-lg text-foreground/60">
                        by <span className="font-semibold text-foreground/80">{product.brand}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={18}
                                className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-foreground ml-1">4.5</span>
                        </div>
                        <span className="text-foreground/30">•</span>
                        <span className="text-foreground/60">24 reviews</span>
                        <span className="text-foreground/30">•</span>
                        <span className="text-foreground/60">SKU: {product.sku}</span>
                      </div>

                      {/* Price */}
                      <div className="text-3xl lg:text-4xl font-bold text-foreground">
                        ${price}
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Description</h3>
                        <p className="text-foreground/80 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Specifications */}
                      {product.specifications.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-4">Specifications</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.specifications.map((spec, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg"
                              >
                                <span className="font-medium text-foreground/80 text-sm">
                                  {spec.key}
                                </span>
                                <span className="text-foreground/60 text-sm">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Truck size={18} className="text-foreground/40" />
                          <div>
                            <div className="font-medium text-foreground">Free Shipping</div>
                            <div>On orders over $50</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Shield size={18} className="text-foreground/40" />
                          <div>
                            <div className="font-medium text-foreground">2-Year Warranty</div>
                            <div>Extended protection</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/60">
                          <Package size={18} className="text-foreground/40" />
                          <div>
                            <div className="font-medium text-foreground">Easy Returns</div>
                            <div>30-day guarantee</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at Bottom */}
                  <div className="p-6 lg:p-8 border-t border-foreground/10 bg-background/95 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <WishlistButton 
                        product={product} 
                        size="lg" 
                        className="flex-1 sm:flex-none"
                      />
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAddingToCart}
                        className="flex items-center justify-center gap-3 flex-1 px-6 py-4 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg relative overflow-hidden group"
                      >
                        {isAddingToCart ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                            />
                            <span>Adding to Cart...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            <span>Add to Cart - ${price}</span>
                          </>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};