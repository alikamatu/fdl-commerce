'use client';

import { Package, Truck, Shield } from 'lucide-react';
import { Product } from '@/types/product';

interface QuickViewProductInfoProps {
  product: Product;
}

export const QuickViewProductInfo: React.FC<QuickViewProductInfoProps> = ({
  product,
}) => {
  const price = (product.priceCents / 100).toFixed(2);
  const originalPrice = product.originalPriceCents
    ? (product.originalPriceCents / 100).toFixed(2)
    : null;
  const discountPercent = product.discountPercent || 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Category and Stock Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
            {product.stock} in stock
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-md lg:text-xl font-bold text-foreground leading-tight">
        {product.title}
      </h1>

      {/* Brand */}
      <div className="text-base md:text-lg text-foreground/60">
        by <span className="font-semibold text-foreground/80">{product.brand}</span>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg lg:text-xl font-bold text-foreground">
            GH₵{price}
          </span>
          {originalPrice && originalPrice !== price && (
            <span className="text-md text-foreground/40 line-through">
              GH₵{originalPrice}
            </span>
          )}
          {/* Deal Badge */}
          {product.isDeal && discountPercent > 0 && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {discountPercent}% OFF
            </div>
          )}
        </div>
        {originalPrice && originalPrice !== price && (
          <div className="text-green-600 font-medium">
            You save GH₵{(parseFloat(originalPrice) - parseFloat(price)).toFixed(2)}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Description</h3>
        <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
          {product.description}
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <Truck size={18} className="text-foreground/40 flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">Free Delivery</div>
            <div className="text-xs">On all products</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <Package size={18} className="text-foreground/40 flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">Easy Returns</div>
            <div className="text-xs">7-day guarantee</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <Shield size={18} className="text-foreground/40 flex-shrink-0" />
          <div>
            <div className="font-medium text-foreground">Secure Payment</div>
            <div className="text-xs">100% protected</div>
          </div>
        </div>
      </div>
    </div>
  );
};
