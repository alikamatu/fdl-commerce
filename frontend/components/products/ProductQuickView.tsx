// components/ProductQuickView.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

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

  if (!product) return null;

  const price = (product.priceCents / 100).toFixed(2);
  const mainImage = product.images[0]?.url || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
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
    // You can show a snackbar notification here if needed
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
            className="absolute inset-0 bg-foreground/50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-foreground/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Images */}
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={mainImage}
                  alt={product.images[0]?.alt || product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground/60 bg-foreground/5 px-2 py-1 rounded">
                    {product.categoryId?.name}
                  </span>
                  {isOutOfStock ? (
                    <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-500 bg-green-50 px-2 py-1 rounded">
                      In Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>

                <div className="text-lg text-foreground/60 mb-4">
                  by {product.brand}
                </div>

                <div className="flex items-center gap-1 mb-6">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-foreground/60 ml-2">(24 reviews)</span>
                </div>

                <div className="text-3xl font-bold text-foreground mb-6">
                  ${price}
                </div>

                <p className="text-foreground/80 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {product.specifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-foreground/80">{spec.key}:</span>
                          <span className="text-foreground/60 ml-2">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <WishlistButton product={product} size="lg" />
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};