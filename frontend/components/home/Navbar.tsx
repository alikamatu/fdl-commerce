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
import { DesktopNavigation } from "./DesktopNavigation";
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addRecentSearch } = useSearchSuggestions();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = searchQuery.trim();
    
    if (searchTerm) {
      addRecentSearch(searchTerm);
      router.replace(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchQuery("");
    }
  }, [searchQuery, router, addRecentSearch]);

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
      <nav className={`w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'border-b border-foreground/10 shadow-sm' 
          : 'border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Logo />
              <DesktopNavigation 
                categories={categories} 
                loading={categoriesLoading} 
              />
            </div>

            {/* Center Section - Search Bar (Google-like) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <GoogleLikeSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Search Button */}
              {/* <DesktopSearchButton onClick={() => setIsSearchOpen(true)} /> */}
              
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
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMenuOpen}
          categories={categories}
          user={user}
          onClose={() => setIsMenuOpen(false)}
          onLoginClick={() => openAuthModal('login')}
        />
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
  <Link 
    href="/" 
    className="flex items-center space-x-3 group"
  >
    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
      <img src='/logo/fdll.jpeg' alt="Logo" className="rounded-lg" />
    </div>
    <span className="text-xl font-semibold text-foreground hidden sm:block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
      Forbes Digital Lifeline
    </span>
  </Link>
);

const GoogleLikeSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  onFocus
}: { 
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onFocus: () => void;
}) => (
  <form onSubmit={onSearch} className="relative w-full">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
      <input
        type="text"
        placeholder="Search products, brands, and categories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={onFocus}
        className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 text-foreground placeholder-foreground/40 transition-all duration-200 hover:bg-foreground/10 focus:bg-background focus:shadow-lg"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        <kbd className="px-1.5 py-0.5 text-xs border border-foreground/20 rounded bg-background text-foreground/60">⌘K</kbd>
      </div>
    </div>
  </form>
);

const DesktopSearchButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="hidden md:flex items-center justify-center w-10 h-10 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-200 border border-foreground/10 hover:border-foreground/20"
  >
    <Search size={20} />
  </button>
);

const MobileSearchButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="md:hidden flex items-center justify-center w-10 h-10 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-200"
  >
    <Search size={20} />
  </button>
);

const AuthButtons = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <div className="hidden md:flex items-center space-x-2">
    <button
      onClick={onLoginClick}
      className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5"
    >
      Sign in
    </button>
    <button
      onClick={onLoginClick}
      className="px-4 py-2 text-sm font-medium bg-foreground/5 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      Get Started
    </button>
  </div>
);

const MobileMenuButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-foreground/5 transition-colors duration-200"
    onClick={onClick}
  >
    {isOpen ? (
      <X size={20} className="text-foreground" />
    ) : (
      <Menu size={20} className="text-foreground" />
    )}
  </button>
);