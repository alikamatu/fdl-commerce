"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  
  // Mock user data - in real app, this would come from auth context
  const [user, setUser] = useState(null);
  const cartItemsCount = 3; // Mock cart count
  const wishlistItemsCount = 2; // Mock wishlist count

  const handleLogout = () => {
    // Implement logout logic
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <span className="text-2xl">⚡</span>
            <span>TechStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Categories */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/products/laptops" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Laptops
              </Link>
              <Link 
                href="/products/mobile-phones" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Mobile Phones
              </Link>
              <Link 
                href="/products/accessories" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Accessories
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="relative p-2 hover:text-primary transition-colors"
              title="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 hover:text-primary transition-colors"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    {(user as any)?.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/products/laptops" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Laptops
              </Link>
              <Link 
                href="/products/mobile-phones" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mobile Phones
              </Link>
              <Link 
                href="/products/accessories" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accessories
              </Link>
              
              {/* Mobile Search */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
                      setIsMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}