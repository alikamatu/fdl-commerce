'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';

interface QuickViewImageGalleryProps {
  product: Product;
  currentImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSelectImage: (index: number) => void;
}

export const QuickViewImageGallery: React.FC<QuickViewImageGalleryProps> = ({
  product,
  currentImageIndex,
  onPrevImage,
  onNextImage,
  onSelectImage,
}) => {
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const currentImage = product.images[currentImageIndex] || product.images[0];

  return (
    <div className="relative bg-gray-50 flex items-center justify-center p-4 md:p-8 md:border-r border-foreground/5">
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
              onClick={onPrevImage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
            >
              <ChevronLeft
                size={20}
                className="text-foreground/60 group-hover:text-foreground"
              />
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors group"
            >
              <ChevronRight
                size={20}
                className="text-foreground/60 group-hover:text-foreground"
              />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm text-foreground/60">
              {currentImageIndex + 1} / {product.images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {product.images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {product.images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 overflow-hidden transition-all ${
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
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-foreground/20 flex items-center justify-center text-xs text-foreground/60 bg-foreground/5">
              +{product.images.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
