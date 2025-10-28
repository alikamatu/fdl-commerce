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
  StrikethroughIcon,
  LogOut,
  StarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout } = useAuth();

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
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: <StarIcon className="w-5 h-5" />,
    }
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      orange: "text-orange-600",
      red: "text-red-600",
      green: "text-green-600",
      blue: "text-blue-600",
    };
    return colors[color];
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isSidebarCollapsed ? 64 : 256
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "h-screen fixed bg-white p-4 flex flex-col z-40 border-r border-gray-200",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo and Toggle */}
        <motion.div 
          className="flex items-center justify-between mb-8 px-2"
          whileHover={{ scale: 1.02 }}
        >
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src="/logo/fdll.jpeg" 
                  alt="Forbes Logo" 
                  className="h-20 w-auto rounded-2xl object-cover" 
                />
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors",
              isSidebarCollapsed ? "ml-0" : ""
            )}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </motion.button>
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
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200",
                      isSidebarCollapsed ? "justify-center px-2" : ""
                    )}
                  >
                    <div className={cn(
                      "flex items-center space-x-3",
                      isSidebarCollapsed ? "space-x-0" : ""
                    )}>
                      {item.icon}
                      <AnimatePresence>
                        {!isSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.div
                          animate={{ rotate: openMenus[item.name.toLowerCase()] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          initial={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  {/* Submenu */}
                  <AnimatePresence>
                    {!isSidebarCollapsed && openMenus[item.name.toLowerCase()] && (
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
                                  ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
                                  : "text-gray-700 hover:text-white hover:bg-gray-100"
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
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-white hover:border hover:border-gray-200",
                      isSidebarCollapsed ? "justify-center px-2" : ""
                    )}
                  >
                    {item.icon}
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className={cn(
            "flex items-center justify-between",
            isSidebarCollapsed ? "flex-col space-y-2" : ""
          )}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className={cn(
                "bg-red-600 text-white p-2 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-red-700 transition-colors",
                isSidebarCollapsed ? "justify-center w-full" : ""
              )}
            >
              <LogOut size={15} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className={isSidebarCollapsed ? "w-full" : ""}
            >
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Spacer */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      />
    </>
  );
}