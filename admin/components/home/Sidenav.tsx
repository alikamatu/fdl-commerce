"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  DollarSign,
  NewspaperIcon,
  StrikethroughIcon
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  children?: { name: string; href: string }[];
}

interface QuickStat {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  color: "orange" | "red" | "green" | "blue";
}

export default function Sidenav() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
  });

  const isActive = (path: string) => pathname === path;

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Products",
      href: "#",
      icon: <Package className="w-5 h-5" />,
      children: [
        { name: "All Products", href: "/dashboard/products" },
        { name: "Add New Product", href: "/dashboard/products/new" },
        { name: "Categories", href: "/dashboard/categories" },
        { name: "Inventory", href: "/dashboard/inventory" },
      ],
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: "Blog",
      href: "/dashboard/blog",
      icon: <NewspaperIcon className="w-5 h-5" />,
    },
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const getStatIcon = (stat: QuickStat) => {
    switch (stat.color) {
      case "orange":
        return <AlertCircle className="w-4 h-4" />;
      case "red":
        return <TrendingUp className="w-4 h-4" />;
      case "green":
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatColor = (color: QuickStat["color"]) => {
    const colors = {
      orange: "text-orange-600 dark:text-orange-400",
      red: "text-red-600 dark:text-red-400",
      green: "text-green-600 dark:text-green-400",
      blue: "text-blue-600 dark:text-blue-400",
    };
    return colors[color];
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 h-screen mr-64 fixed bg-white p-4 flex flex-col z-40"
    >
      {/* Logo */}
      <motion.div 
        className="flex items-center space-x-2 mb-8 px-2"
        whileHover={{ scale: 1.02 }}
      >
        <motion.span 
          className="text-2xl text-black"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          <img src="/logo/fdll.jpeg" alt="Forbes Logo" className="h-6 w-auto" />
        </motion.span>
        <h2 className="text-xl font-bold text-white dark:text-black">
          Forbes DLL
        </h2>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMenu(item.name.toLowerCase())}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href) || 
                    item.children.some(child => isActive(child.href))
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-black dark:text-black hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800 hover:border hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openMenus[item.name.toLowerCase()] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                
                {/* Submenu */}
                <AnimatePresence>
                  {openMenus[item.name.toLowerCase()] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 space-y-1 ml-4 overflow-hidden"
                    >
                      {item.children.map((child, index) => (
                        <motion.div
                          key={child.name}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={child.href}
                            className={cn(
                              "block p-2 pl-8 rounded-lg text-sm transition-all duration-200",
                              isActive(child.href)
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                                : "text-black dark:text-black hover:text-white dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            {child.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-black dark:text-black hover:bg-white dark:hover:text-white dark:hover:bg-gray-800 hover:border hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}