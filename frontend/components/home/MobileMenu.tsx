"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ShoppingBag, 
  FileText, 
  HelpCircle, 
  Grid,
  User,
  Package,
  Heart,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  categories: any[];
  user: any;
  onClose: () => void;
  onLoginClick: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  categories,
  user,
  onClose,
  onLoginClick,
}) => {
  const [showCategories, setShowCategories] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLoginClick = () => {
    onLoginClick();
    onClose();
  };

  const navItems = [
    { href: "/", label: "Home", icon: ShoppingBag },
    { href: "/products", label: "Shop", icon: ShoppingBag },
    { href: "/blogs", label: "Blogs", icon: FileText },
    { href: "/faqs", label: "FAQs", icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden border-t border-foreground/10 bg-background/95 backdrop-blur-xl overflow-hidden"
        >
          <div className="py-4 px-4 space-y-2">
            {/* Main Navigation */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Categories Accordion */}
            <div className="border-t border-foreground/10 pt-2">
              {/* <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Grid size={20} />
                  <span className="font-medium">Categories</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    showCategories ? 'rotate-180' : ''
                  }`}
                />
              </button> */}

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-2 space-y-1 overflow-hidden"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/products?category=${category._id}`}
                        onClick={onClose}
                        className="flex items-center space-x-3 px-4 py-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors text-sm"
                      >
                        <div className="w-2 h-2 bg-foreground/30 rounded-full"></div>
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Section */}
            <div className="border-t border-foreground/10 pt-2">
              {!user ? (
                <div className="space-y-2">
                  <button
                    onClick={handleLoginClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                  >
                    <User size={20} />
                    <span className="font-medium">Sign In</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-foreground/60">{user.email}</p>
                  </div>
                  
                  <Link 
                    href="/orders" 
                    className="flex items-center space-x-3 px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    href="/wishlist" 
                    className="flex items-center space-x-3 px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};