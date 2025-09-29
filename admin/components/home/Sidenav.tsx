"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Tag,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  DollarSign
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
      href: "#",
      icon: <ShoppingCart className="w-5 h-5" />,
      children: [
        { name: "All Orders", href: "/dashboard/orders" },
        { name: "Pending", href: "/dashboard/orders?status=pending" },
        { name: "Paid", href: "/dashboard/orders?status=paid" },
        { name: "Fulfilled", href: "/dashboard/orders?status=fulfilled" },
        { name: "Cancelled", href: "/dashboard/orders?status=cancelled" },
      ],
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Promotions",
      href: "/dashboard/promotions",
      icon: <Tag className="w-5 h-5" />,
    },
  ];

  const quickStats: QuickStat[] = [
    {
      label: "Pending Orders",
      value: 12,
      color: "orange",
    },
    {
      label: "Low Stock",
      value: 5,
      color: "red",
    },
    {
      label: "Today's Revenue",
      value: "$2,847",
      trend: "up",
      color: "green",
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
      className="w-64 h-screen mr-64 fixed bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col z-40"
    >
      {/* Logo */}
      <motion.div 
        className="flex items-center space-x-2 mb-8 px-2"
        whileHover={{ scale: 1.02 }}
      >
        <motion.span 
          className="text-2xl"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          ⚡
        </motion.span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Admin Panel
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
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border hover:border-gray-200 dark:hover:border-gray-700"
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
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border hover:border-gray-200 dark:hover:border-gray-700"
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

      {/* Quick Stats */}
      <motion.div 
        className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Quick Stats
        </h3>
        <div className="space-y-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2">
                {getStatIcon(stat)}
                <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  {stat.label}
                </span>
              </div>
              <span className={cn(
                "text-sm font-semibold transition-all duration-200 group-hover:scale-110",
                getStatColor(stat.color)
              )}>
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}