import { forwardRef } from "react";
import Link from "next/link";
import { LogOut, Settings, Package, Heart, ChevronDown } from "lucide-react";
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
      <div className="hidden md:flex items-center space-x-3" ref={ref}>
        <div className="relative">
          <button
            onClick={onToggle}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-foreground/5 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground/80 hidden lg:block">
              {user.name}
            </span>
            <ChevronDown size={16} className="text-foreground/40 hidden lg:block" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 py-2 bg-background border border-foreground/10 rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-foreground/10">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-foreground/60 truncate">{user.email}</p>
              </div>
              
              <div className="py-2">
                <Link 
                  href="/orders" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                  onClick={onClose}
                >
                  <Package size={16} className="text-foreground/40" />
                  My Orders
                </Link>
                <Link 
                  href="/wishlist" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                  onClick={onClose}
                >
                  <Heart size={16} className="text-foreground/40" />
                  Wishlist
                </Link>
              </div>

              <div className="border-t border-foreground/10 my-1" />
              
              <Link 
                href="/settings" 
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                onClick={onClose}
              >
                <Settings size={16} className="text-foreground/40" />
                Settings
              </Link>
              
              <div className="border-t border-foreground/10 my-1" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors rounded-b-xl"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

UserMenu.displayName = "UserMenu";