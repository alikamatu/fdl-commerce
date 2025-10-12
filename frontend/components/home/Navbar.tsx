"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { CartIcon } from "../cart/CartIcon";
import { WishlistIcon } from "../wishlist/WishlistIcon";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "../search/SearchModal";
import { AuthModal } from "../auth/AuthModal";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/context/AuthContext";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addRecentSearch } = useSearchSuggestions();

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router]);

  return (
    <>
      <nav className="w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-8">
              <Logo />
              <DesktopNavigation 
                categories={categories} 
                loading={categoriesLoading} 
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <DesktopSearchButton onClick={() => setIsSearchOpen(true)} />
              <CartIcon />
              <WishlistIcon />
              <MobileSearchButton onClick={() => setIsSearchOpen(true)} />
              
              {/* Auth or User Menu */}
              {user ? (
                <UserMenu 
                  user={user}
                  isOpen={isUserMenuOpen}
                  onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onClose={() => setIsUserMenuOpen(false)}
                  ref={userMenuRef}
                />
              ) : (
                <AuthButtons onLoginClick={() => openAuthModal('login')} />
              )}
              
              <MobileMenuButton 
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu 
            isOpen={isMenuOpen}
            categories={categories}
            user={user}
            onClose={() => setIsMenuOpen(false)}
            onLoginClick={() => openAuthModal('login')}
          />
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
    </>
  );
}

// Sub-components
const Logo = () => (
  <Link href="/" className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-md">
      <span className="text-white font-bold text-sm">TS</span>
    </div>
    <span className="text-xl font-semibold text-foreground hidden sm:block">
      TechStore
    </span>
  </Link>
);

const DesktopNavigation = ({ categories, loading }: { categories: any[], loading: boolean }) => {
  if (loading || categories.length === 0) return null;

  return (
    <div className="hidden lg:flex items-center space-x-6">
      {categories.slice(0, 4).map((category) => (
        <Link 
          key={category._id}
          href={`/products?category=${category._id}`}
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-foreground/5"
        >
          {category.name}
        </Link>
      ))}
      {categories.length > 4 && (
        <div className="relative group">
          <button className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-foreground/5 flex items-center gap-1">
            More <ChevronDown size={16} />
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-foreground/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {categories.slice(4).map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="block px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 first:rounded-t-lg last:rounded-b-lg"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DesktopSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch 
}: { 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
}) => (
  <div className="hidden md:flex flex-1 max-w-lg mx-8">
    <form onSubmit={onSearch} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
        <input
          type="text"
          placeholder="Search products, brands, and more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40 transition-all duration-200"
        />
      </div>
    </form>
  </div>
);

const DesktopSearchButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="hidden md:flex items-center gap-2 px-4 py-2 text-foreground/60 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5 border border-foreground/20"
  >
    <Search size={18} />
    <span className="text-sm">Search</span>
  </button>
);

const MobileSearchButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 text-foreground/60 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5"
  >
    <Search size={20} />
  </button>
);

const AuthButtons = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <div className="hidden md:flex items-center space-x-3">
    <button
      onClick={onLoginClick}
      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-foreground/5"
    >
      Login
    </button>
  </div>
);

const MobileMenuButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors duration-200"
    onClick={onClick}
  >
    {isOpen ? <X size={20} /> : <Menu size={20} />}
  </button>
);