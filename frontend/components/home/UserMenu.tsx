"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, Package, Heart, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserMenuProps {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ user, isOpen, onToggle, onClose }, ref) => {
    const { logout } = useAuth();

    const handleLogout = () => {
      logout();
      onClose();
    };

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-foreground/5 transition-colors duration-200 group"
        >
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
            {(user?.name?.charAt(0)?.toUpperCase?.()) || "U"}
          </div>
          <ChevronDown 
            size={16} 
            className={`text-foreground/40 transition-transform duration-200 ${
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
              className="absolute right-0 top-full mt-2 w-64 bg-background border border-foreground/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-foreground/10 bg-gradient-to-r from-foreground/5 to-foreground/2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-foreground/60 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="p-2">
                <Link 
                  href="/orders" 
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <Package size={16} className="text-foreground/40" />
                  <span>My Orders</span>
                </Link>
                <Link 
                  href="/wishlist" 
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 rounded-lg transition-colors"
                  onClick={onClose}
                >
                  <Heart size={16} className="text-foreground/40" />
                  <span>Wishlist</span>
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

UserMenu.displayName = "UserMenu";