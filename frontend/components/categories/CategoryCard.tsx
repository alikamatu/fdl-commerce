"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <a href={`/products?category=${category._id}`} className="block h-full">
        <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
          <div className="aspect-[4/3] overflow-hidden relative">
            {category.imageUrl ? (
              <motion.img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                <ImageIcon size={48} className="text-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                {category.name}
              </h3>
              <ArrowRight 
                size={20} 
                className="text-foreground/40 group-hover:text-foreground/60 transform group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" 
              />
            </div>
            
            <p className="text-foreground/60 mb-3 flex-1">
              Explore our collection of {category.name.toLowerCase()}
            </p>
            
            <p className="text-sm text-foreground/40">
              Browse collection
            </p>
          </div>
        </div>
      </a>
    </motion.div>
  );
};