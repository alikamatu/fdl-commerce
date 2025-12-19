"use client";

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  id: string;
  name: string;
  image?: string;
  category?: string;
  priceCents?: number;
}

export const useSearchSuggestions = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (error) {
        console.error('Error loading recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Load trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=4&sort=-soldCount`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTrendingProducts(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      }
    };

    fetchTrendingProducts();
  }, []);

  // Add search to recent searches
  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const normalizedQuery = query.trim().toLowerCase();
    const updated = [
      normalizedQuery,
      ...recentSearches.filter(item => item !== normalizedQuery)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Remove from recent searches
  const removeRecentSearch = useCallback((query: string) => {
    const updated = recentSearches.filter(item => item !== query);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  }, []);

  // Fallback method using regular product search
  const fallbackSearchSuggestions = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?q=${encodeURIComponent(query)}&limit=100`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const suggestions = data.data.map((product: Product) => ({
            type: 'product' as const,
            id: product._id,
            name: product.title,
            image: product.images[0]?.url,
            category: typeof product.categoryId === 'object' ? product.categoryId.name : 'Uncategorized',
            priceCents: product.priceCents,
            brand: product.brand,
          }));
          setSuggestions(suggestions);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error in fallback search suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Fetch search suggestions - wrapped in useCallback to prevent infinite loops
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Try the search suggestions endpoint first
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/search/suggestions?q=${encodeURIComponent(query)}&limit=100`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Search suggestions:', data.data);
          setSuggestions(data.data || []);
          return;
        }
      }
      
      // Fallback to regular search if dedicated endpoint fails
      await fallbackSearchSuggestions(query);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      // Fallback on error
      await fallbackSearchSuggestions(query);
    } finally {
      setLoading(false);
    }
  }, [fallbackSearchSuggestions]);

  return {
    recentSearches,
    trendingProducts,
    suggestions,
    loading,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    fetchSuggestions
  };
};