'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Sub-components
import { QuickViewImageGallery } from './quickview/QuickViewImageGallery';
import { QuickViewProductInfo } from './quickview/QuickViewProductInfo';
import { QuickViewActions } from './quickview/QuickViewActions';

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

  // Reset state when modal opens with new product
  useEffect(() => {
    if (open && product) {
      setCurrentImageIndex(0);
      setIsAddingToCart(false);
    }
  }, [open, product?._id]);

  if (!product) return null;

  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';

  const handleAddToCart = () => {
    if (product.stock === 0 || isAddingToCart) return;

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
    }, 800);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center md:items-center p-0 md:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/70"
            onClick={handleBackdropClick}
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              duration: 0.3,
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative bg-background w-full h-[95vh] md:h-auto md:max-h-[95vh] rounded-t-3xl md:rounded-xl shadow-2xl flex flex-col md:max-w-6xl z-10 overflow-hidden"
          >
            {/* Drag Handle (Mobile Only) */}
            <div className="w-full flex justify-center py-3 md:hidden cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-foreground/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2 md:p-4 border-b border-foreground/10 bg-background/95 backdrop-blur-sm flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground/80 hidden md:block">Quick View</h2>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href={`/products/${product._id}`}
                  onClick={onClose}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors group flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground"
                >
                  <span>Full Details</span>
                  <ExternalLink size={16} />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 bg-foreground/5 md:bg-transparent hover:bg-foreground/10 rounded-full md:rounded-lg transition-colors group"
                >
                  <X size={20} className="text-foreground/80 md:text-foreground/60 group-hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Main Content - Single unified scrollable area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col lg:flex-row lg:h-full">
                {/* Product Images Area (Top on mobile, left side on desktop) */}
                <div className="lg:w-1/2 lg:overflow-hidden flex-shrink-0">
                  <QuickViewImageGallery
                    product={product}
                    currentImageIndex={currentImageIndex}
                    onPrevImage={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    onNextImage={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    onSelectImage={setCurrentImageIndex}
                  />
                </div>

                {/* Product Details Area & Actions (Bottom on mobile, right side on desktop) */}
                <div className="flex flex-col flex-1 bg-background lg:overflow-hidden">
                  {/* Scrollable Details */}
                  <div className="flex-1 lg:overflow-y-auto">
                    <QuickViewProductInfo product={product} />
                  </div>

                  {/* Actions Area - Fixed at Bottom */}
                  <div className="w-full border-t border-foreground/10 bg-background flex-shrink-0">
                    <QuickViewActions
                      product={product}
                      isAddingToCart={isAddingToCart}
                      onAddToCart={handleAddToCart}
                    />
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