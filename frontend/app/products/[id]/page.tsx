'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { useProduct } from '@/hooks/useProduct';
import { useSnackbar } from '@/hooks/useSnackbar';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductSpecifications } from '@/components/products/ProductSpecifications';
import { ProductActions } from '@/components/products/ProductActions';
import { ProductLoadingSkeleton } from '@/components/products/ProductLoadingSkeleton';
import { ProductErrorState } from '@/components/products/ProductErrorState';
import { Snackbar } from '@/components/Snackbar';
import { Product } from '@/types/product';
import { useSimilarProducts } from '@/hooks/useSimilarProducts';
import { SimilarProducts } from '@/components/products/SimilarProducts';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = use(params);
  const { product, loading, error } = useProduct(id);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
const { products: similarProducts, loading: similarLoading, error: similarError } = useSimilarProducts(
  product
    ? {
        categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId,
        currentProductId: product._id,
        limit: 4
      }
    : { categoryId: '', currentProductId: '', limit: 4 }
);

  const handleAddToCart = (product: Product) => {
    // Implement add to cart logic
    showSnackbar(`Added ${product.title} to cart`, 'success');
    console.log('Add to cart:', product);
  };

  const handleViewDetails = (product: Product) => {
  // You can implement quick view or navigation here
  console.log('View details:', product);
};

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return <ProductLoadingSkeleton />;
  }

  if (error) {
    return <ProductErrorState error={error} onRetry={handleRetry} />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Product not found
        </h2>
        <p className="text-foreground/60 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Products
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
          <a href="/products" className="hover:text-foreground transition-colors">
            Products
          </a>
          <span>/</span>
          <a 
            href={`/products?category=${product.categoryId._id}`}
            className="hover:text-foreground transition-colors"
          >
            {product.categoryId.name}
          </a>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery
              images={product.images}
              title={product.title}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Category & Brand */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-foreground/60">
                <span className="bg-foreground/5 px-2 py-1 rounded">
                  {product.categoryId.name}
                </span>
                <span>by {product.brand}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-light text-foreground leading-tight">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground/60">4.5 (24 reviews)</span>
              </div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="prose prose-sm max-w-none text-foreground/80 leading-relaxed"
            >
              <p>{product.description}</p>
            </motion.div>

            {/* Product Actions */}
            <ProductActions
              product={product}
              onAddToCart={handleAddToCart}
            />

            {/* Specifications */}
            <ProductSpecifications
              specifications={product.specifications}
            />

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="border-t border-foreground/10 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground/80">SKU:</span>
                  <span className="text-foreground/60 ml-2">{product.sku}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground/80">Brand:</span>
                  <span className="text-foreground/60 ml-2">{product.brand}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Similar Products */}
        <SimilarProducts
          products={similarProducts}
          loading={similarLoading}
          error={similarError}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </motion.div>
  );
}