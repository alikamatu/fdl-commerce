"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Building2, Image as ImageIcon } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import Link from 'next/link';

export const BrandsSection: React.FC = () => {
  const { brands, loading, error } = useBrands();

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-foreground/10 rounded w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-64 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, index) => (
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground/60 mb-4">
            <Building2 size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load brands
          </h3>
          <p className="text-foreground/60 mb-4">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-16 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-1 lg:px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl text-start md:text-4xl font-light text-foreground mb-4">
            Shop by Brand
          </h2>
          <p className="text-lg text-start text-foreground/60 max-w-2xl">
            Discover products from your favorite trusted brands
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center text-center"
              >
                {/* Brand Logo */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full transition-all duration-300 overflow-hidden bg-background/5">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                        <Building2 size={24} className="text-foreground/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-full bg-foreground/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>

                {/* Brand Name */}
                <h3 className="font-medium text-foreground group-hover:text-foreground/80 transition-colors mb-1">
                  {brand.name}
                </h3>

                {/* Product Count */}
                {/* {brand.productCount && (
                  <p className="text-sm text-foreground/40">
                    {brand.productCount} products
                  </p>
                )} */}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Brands Link */}
        {brands.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
            >
              View All Brands
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};