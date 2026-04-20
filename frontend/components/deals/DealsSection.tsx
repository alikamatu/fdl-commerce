"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useDealProducts } from "@/hooks/useDealProducts";
import Link from "next/link";
import { ProductCard } from "../products/ProductCard";
import { Product } from "@/types/product";
import { ProductQuickView } from "../products/ProductQuickView";

interface DealsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  title = "Back to School Deals",
  subtitle = "Special discounts",
  limit = 10,
  showViewAll = true,
}) => {
  const { products, loading, error } = useDealProducts(limit);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.7;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const updateArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const tolerance = 10;
    setShowLeftArrow(container.scrollLeft > tolerance);
    setShowRightArrow(
      container.scrollLeft <
        container.scrollWidth - container.clientWidth - tolerance
    );
  };

    const handleCloseQuickView = () => {
    setQuickViewOpen(false);
    setSelectedProduct(null);
  };

    const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    updateArrows();

    return () => {
      container.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products]);

  if (error || (!loading && products.length === 0)) return null;

  return (
    <section className="py-12 w-full">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-4 md:px-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-red-500" />
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {showViewAll && (
            <Link
              href="/products?page=1&limit=12&sortBy=newest&isDeal=true"
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium shadow-lg"
            >
              View All Deals
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Scroll Area */}
        <div className="relative">
          {showLeftArrow && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/80 rounded-full shadow-lg"
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}

          {showRightArrow && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/80 rounded-full shadow-lg"
            >
              <ChevronRight size={20} />
            </motion.button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
          >
            {loading
              ? [...Array(limit)].map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 bg-background rounded-lg animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted" />
                  </div>
                ))
              : products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                    }}
                    className="flex-shrink-0 w-48 md:w-64 lg:w-72"
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                ))}
          </div>
        </div>

        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onClose={handleCloseQuickView}
        />
      </div>

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};