import Link from "next/link";
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
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLoginClick = () => {
    onLoginClick();
    onClose();
  };

  return (
    <div className="lg:hidden py-4 border-t border-foreground/10 bg-background/95 backdrop-blur">
      <div className="flex flex-col space-y-3">
        {/* Mobile Categories */}
        {categories.map((category) => (
          <Link 
            key={category._id}
            href={`/products?category=${category._id}`}
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
            onClick={onClose}
          >
            {category.name}
          </Link>
        ))}
        
        {/* Mobile Auth Links */}
        {!user ? (
          <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
            <button
              onClick={handleLoginClick}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-foreground/5 text-center"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-foreground/60">{user.email}</p>
            </div>
            <Link 
              href="/orders" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
              onClick={onClose}
            >
              My Orders
            </Link>
            <Link 
              href="/wishlist" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
              onClick={onClose}
            >
              Wishlist
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:bg-red-500/10 transition-colors py-2 px-4 rounded-lg text-left mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};