"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductImage } from '@/types/product';

interface ProductCardImageSliderProps {
  images?: ProductImage[];
  title: string;
  interval?: number;
  autoSlide?: boolean;
}

export const ProductCardImageSlider: React.FC<ProductCardImageSliderProps> = ({
  images = [],
  title,
  interval = 3000,
  autoSlide = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter valid image URLs and sort by position
  const validImages = useMemo(() => {
    const list = (images || [])
      .filter((img) => img && typeof img.url === 'string' && img.url.trim().length > 0)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (list.length > 0) {
      return list;
    }
    return [{ url: '/placeholder-product.jpg', alt: title, position: 0 }];
  }, [images, title]);

  // Reset index if image list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [validImages]);

  // Preload upcoming images so transitions are instant without blank flickers
  useEffect(() => {
    if (typeof window !== 'undefined' && validImages.length > 1) {
      validImages.forEach((img) => {
        if (img.url && !img.url.startsWith('data:')) {
          const preloadImg = new window.Image();
          preloadImg.src = img.url;
        }
      });
    }
  }, [validImages]);

  // Auto slide interval (default: 3-second intervals, no controls or navigation)
  useEffect(() => {
    if (!autoSlide || validImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoSlide, validImages.length, interval]);

  if (validImages.length <= 1) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={validImages[0]?.url || '/placeholder-product.jpg'}
          alt={validImages[0]?.alt || title}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: '15%' }}
          animate={{ opacity: 1, x: '0%' }}
          exit={{ opacity: 0, x: '-15%' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={validImages[currentIndex]?.url}
            alt={validImages[currentIndex]?.alt || title}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
