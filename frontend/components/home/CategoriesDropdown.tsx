"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid, Sparkles, TrendingUp, Star, Zap } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
}

interface CategoriesDropdownProps {
  categories: Category[];
  loading: boolean;
}

export const CategoriesDropdown: React.FC<CategoriesDropdownProps> = ({
  categories,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const featuredCategories = categories.slice(0, 6);
  const remainingCategories = categories.slice(6);

  if (loading || categories.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5 group"
      >
        <Grid size={16} className="text-foreground/60" />
        <span>Categories</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'group-hover:rotate-180'
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-96 bg-background border border-foreground/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Header */}
            <div className="p-4 border-b border-foreground/10 bg-gradient-to-r from-foreground/5 to-foreground/2">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-foreground/60" />
                <h3 className="text-sm font-semibold text-foreground">Browse Categories</h3>
              </div>
            </div>

            {/* Featured Categories */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {featuredCategories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Grid size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-foreground/90 truncate">
                        {category.name}
                      </p>
                      <p className="text-xs text-foreground/60">Shop now</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 border-t border-foreground/10 bg-foreground/2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/products?on_sale=true"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 p-2 text-xs text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                >
                  <Zap size={12} />
                  <span>Hot Deals</span>
                </Link>
                <Link
                  href="/products?new_arrivals=true"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 p-2 text-xs text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                >
                  <Star size={12} />
                  <span>New Arrivals</span>
                </Link>
                <Link
                  href="/products?trending=true"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 p-2 text-xs text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                >
                  <TrendingUp size={12} />
                  <span>Trending</span>
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 p-2 text-xs text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded transition-colors"
                >
                  <Grid size={12} />
                  <span>All Products</span>
                </Link>
              </div>
            </div>

            {/* View All Categories */}
            {remainingCategories.length > 0 && (
              <div className="p-4 border-t border-foreground/10">
                <Link
                  href="/categories"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-foreground/60 hover:text-foreground py-2 hover:bg-foreground/5 rounded-lg transition-colors block"
                >
                  View All Categories ({categories.length})
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};