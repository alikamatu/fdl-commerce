"use client";

import { motion } from "framer-motion";

interface Category {
  _id: string;
  name: string;
}

interface PopularCategoriesProps {
  categories: Category[];
  loading: boolean;
  onCategoryClick: (categoryId: string, categoryName: string) => void;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  categories,
  loading,
  onCategoryClick,
}) => {
  if (loading || categories.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-foreground/60 mb-4 uppercase tracking-wide">
        Popular Categories
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.slice(0, 6).map((category, index) => (
          <motion.button
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onCategoryClick(category._id, category.name)}
            className="p-4 text-left bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors group"
          >
            <span className="text-foreground/80 font-medium group-hover:text-foreground">
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};