"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Menu, 
  X, 
  User, 
  ShoppingBag, 
  Heart, 
  LogOut, 
  Settings, 
  Package, 
  History,
  Star,
  ChevronDown
} from "lucide-react";
import { CartIcon } from "../cart/CartIcon";
import { WishlistIcon } from "../wishlist/WishlistIcon";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const currentPath = (typeof window !== 'undefined') ? window.location.pathname : '';
      const currentSearchParams = new URLSearchParams((typeof window !== 'undefined') ? window.location.search : '');

      currentSearchParams.set('search', encodeURIComponent(searchQuery.trim()));
      router.push(`${currentPath}?${currentSearchParams.toString()}`);
      
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
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
            {/* Left Section - Logo and Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="text-xl font-semibold text-foreground hidden sm:block">
                  TechStore
                </span>
              </Link>

              {/* Desktop Navigation - Categories */}
              {!categoriesLoading && categories.length > 0 && (
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
              )}
            </div>

            {/* Center Section - Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
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

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 text-foreground/60 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-foreground/5"
              >
                <Search size={20} />
              </button>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Wishlist */}
                <WishlistIcon />

                {/* Cart */}
                <CartIcon />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 py-2 bg-background border border-foreground/10 rounded-xl shadow-lg z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-foreground/10">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-foreground/60 truncate">{user.email}</p>
                        </div>
                        
                        {/* User Links */}
                        <div className="py-2">
                          {/* <Link 
                            href="/profile" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User size={16} className="text-foreground/40" />
                            Profile
                          </Link> */}
                          <Link 
                            href="/orders" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package size={16} className="text-foreground/40" />
                            My Orders
                          </Link>
                          <Link 
                            href="/wishlist" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Heart size={16} className="text-foreground/40" />
                            Wishlist
                          </Link>
                          {/* <Link 
                            href="/order-history" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <History size={16} className="text-foreground/40" />
                            Order History
                          </Link>
                          <Link 
                            href="/reviews" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Star size={16} className="text-foreground/40" />
                            My Reviews
                          </Link> */}
                        </div>

                        <div className="border-t border-foreground/10 my-1" />
                        
                        <Link 
                          href="/settings" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
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
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-foreground/5"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-foreground/10 bg-background/95 backdrop-blur">
              <div className="flex flex-col space-y-3">
                {/* Mobile Categories */}
                {!categoriesLoading && categories.map((category) => (
                  <Link 
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Links */}
                {!user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-foreground/5 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="text-sm font-medium bg-foreground/10 transition-all py-3 px-4 text-center shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-foreground/60">{user.email}</p>
                    </div>
                    {/* <Link 
                      href="/profile" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link> */}
                    {/* <Link 
                      href="/orders" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link> */}
                    <Link 
                      href="/wishlist" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    {/* <Link 
                      href="/order-history" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-foreground/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Order History
                    </Link> */}
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
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 md:hidden">
          <div className="flex items-center justify-between p-4 border-b border-foreground/10">
            <form onSubmit={handleSearch} className="flex-1 mr-4" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-background text-foreground placeholder-foreground/40"
                  autoFocus
                />
              </div>
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Popular Categories */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground/60 mb-3">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {!categoriesLoading && categories.slice(0, 6).map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    router.push(`/products?category=${category._id}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-3 py-2 text-sm bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors text-foreground/80 font-medium"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}