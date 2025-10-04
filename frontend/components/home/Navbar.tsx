// components/layout/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, ShoppingBag, Heart, LogOut, Settings, Package } from "lucide-react";
import { CartIcon } from "../cart/CartIcon";
import { WishlistIcon } from "../wishlist/WishlistIcon";
import { useCategories } from "@/hooks/useCategories";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Mock user data - in real app, this would come from auth context
  const [user, setUser] = useState(null);
  const { categories, loading: categoriesLoading } = useCategories();

  const handleLogout = () => {
    // Implement logout logic
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
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
      <nav className="w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-sm">FDL</span>
                </div>
                <span className="text-xl font-light text-foreground hidden sm:block">
                  ForbsDigital
                </span>
              </Link>

              {/* Desktop Navigation - Categories */}
              {!categoriesLoading && categories.length > 0 && (
                <div className="hidden lg:flex items-center space-x-6">
                  {categories.slice(0, 4).map((category) => (
                    <Link 
                      key={category._id}
                      href={`/products?category=${category._id}`}
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {categories.length > 4 && (
                    <Link 
                      href="/categories"
                      className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                    >
                      More...
                    </Link>
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
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-foreground placeholder-foreground/40"
                  />
                </div>
              </form>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 text-foreground/80 hover:text-foreground transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Desktop Search */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Wishlist */}
                <WishlistIcon />

                {/* Cart */}
                <CartIcon />

                <ThemeToggle />

                {/* Theme Toggle - You can add this back if you have a ThemeToggle component */}
                {/* <ThemeToggle /> */}

                {/* User Menu */}
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                    >
                      <div className="w-8 h-8 bg-foreground/10 rounded-full flex items-center justify-center text-foreground">
                        <User size={16} />
                      </div>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 py-2 bg-background border border-foreground/10 rounded-lg shadow-lg z-50">
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <Link 
                          href="/orders" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package size={16} />
                          Orders
                        </Link>
                        <Link 
                          href="/settings" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-foreground/5 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <div className="border-t border-foreground/10 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-foreground/5 transition-colors"
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
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-foreground/10">
              <div className="flex flex-col space-y-4">
                {/* Mobile Categories */}
                {!categoriesLoading && categories.map((category) => (
                  <Link 
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                
                {/* Mobile Auth Links */}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors py-3 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Mobile User Links */}
                {user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
                    <Link 
                      href="/profile" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
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
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 bg-transparent text-foreground placeholder-foreground/40"
                  autoFocus
                />
              </div>
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Recent Searches or Popular Categories */}
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
                  className="px-3 py-2 text-sm bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors text-foreground/80"
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