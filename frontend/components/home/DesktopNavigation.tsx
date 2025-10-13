"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CategoriesDropdown } from "./CategoriesDropdown";
import { ShoppingBag, FileText, HelpCircle } from "lucide-react";

interface DesktopNavigationProps {
  categories: any[];
  loading: boolean;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  categories,
  loading,
}) => {
  const navItems = [
    {
      href: "/products",
      label: "Shop",
      icon: ShoppingBag,
      description: "Browse all products"
    },
    {
      href: "/blogs",
      label: "Blogs",
      icon: FileText,
      description: "Latest articles & news"
    },
    {
      href: "/faqs",
      label: "FAQs",
      icon: HelpCircle,
      description: "Get help & support"
    },
  ];

  return (
    <div className="hidden lg:flex items-center space-x-1">
      {/* Categories Dropdown */}
      <CategoriesDropdown categories={categories} loading={loading} />
      
      {/* Other Navigation Items */}
      {navItems.map((item) => (
        <motion.div
          key={item.href}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href={item.href}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5 group relative"
          >
            {/* <item.icon size={16} className="text-foreground/60" /> */}
            <span>{item.label}</span>
            
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.description}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};