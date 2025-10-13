"use client";

import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span className="text-xl font-semibold text-foreground">
                TechStore
              </span>
            </div>
            <p className="text-foreground/60 text-sm mb-4 max-w-md">
              Your trusted destination for the latest tech gadgets and electronics. 
              Quality products, competitive prices, and exceptional customer service.
            </p>
            <div className="flex flex-col space-y-2 text-sm text-foreground/60">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>support@techstore.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Mon-Fri 9AM-6PM EST</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link 
                href="/products" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                All Products
              </Link>
              <Link 
                href="/products?on_sale=true" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Hot Deals
              </Link>
              <Link 
                href="/products?new_arrivals=true" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                New Arrivals
              </Link>
              <Link 
                href="/about" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link 
                href="/contact" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link 
                href="/shipping" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Shipping Info
              </Link>
              <Link 
                href="/returns" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Returns
              </Link>
              <Link 
                href="/faq" 
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-foreground/60">
            © {currentYear} TechStore. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-foreground/60">
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center space-x-1 text-sm text-foreground/60">
            <span>Made with</span>
            <Heart size={14} className="text-red-500" />
            <span>for tech lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};