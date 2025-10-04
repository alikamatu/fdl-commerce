"use client";

import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import Link from 'next/link';

export default function BrandsPage() {
  const { brands, loading, error } = useBrands();

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-foreground/10 rounded w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-64 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center animate-pulse"
              >
                <div className="w-20 h-20 bg-foreground/10 rounded-full mb-3" />
                <div className="h-4 bg-foreground/10 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-foreground/40 mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Failed to load brands
          </h2>
          <p className="text-foreground/60 mb-6">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-light text-foreground mb-4">
            All Brands
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Discover products from our trusted brand partners
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center text-center"
              >
                {/* Brand Logo */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full border-2 border-foreground/10 group-hover:border-foreground/20 transition-all duration-300 overflow-hidden bg-white shadow-sm">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                        <Building2 size={24} className="text-foreground/30" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Name */}
                <h3 className="font-medium text-foreground group-hover:text-foreground/80 transition-colors mb-1">
                  {brand.name}
                </h3>

                {/* Product Count
                {brand.productCount && (
                  <p className="text-sm text-foreground/40">
                    {brand.productCount} products
                  </p>
                )} */}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back to Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            Back to Products
          </Link>
        </motion.div>
      </div>
    </div>
  );
}