"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useCategories } from "@/hooks/useCategories";
import { SearchSuggestions } from "./SearchSuggestions";
import { RecentSearches } from "./RecentSearches";
import { PopularCategories } from "./PopularCategories";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
}) => {
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    recentSearches,
    trendingProducts,
    suggestions,
    loading: suggestionsLoading,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    fetchSuggestions
  } = useSearchSuggestions();

  // Add this useEffect to fetch suggestions when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery, fetchSuggestions is now stable via useCallback

  const handleSearch = (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const searchTerm = query || searchQuery.trim();
    
    if (searchTerm) {
      addRecentSearch(searchTerm);
      
      // Use replace instead of push to avoid adding to history stack
      router.replace(`/products?search=${encodeURIComponent(searchTerm)}`);
      
      onClose();
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'product') {
      router.replace(`/products/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      router.replace(`/products?category=${suggestion.id}`);
    } else {
      handleSearch(new Event('submit') as any, suggestion.name);
    }
    onClose();
    setSearchQuery("");
  };

  const handlePopularCategoryClick = (categoryId: string) => {
    router.replace(`/products?category=${categoryId}`);
    onClose();
    setSearchQuery("");
  };

  const handleQuickActionClick = (path: string) => {
    router.replace(path);
    onClose();
    setSearchQuery("");
  };

  // Focus management
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const formatPrice = (priceCents: number) => {
    return `GHC ${(priceCents / 100).toFixed(2)}`;
  };

  useEffect(() => {
    console.log('SearchModal state:', {
      searchQuery,
      suggestions,
      suggestionsLoading,
      suggestionsLength: suggestions.length
    });
  }, [searchQuery, suggestions, suggestionsLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50"
        >
          {/* Header with search bar */}
          <div className="border-b border-foreground/10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <form onSubmit={handleSearch} className="flex-1 mr-6" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40" size={24} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products, brands, and more..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder-foreground/40"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </form>
                <button
                  onClick={onClose}
                  className="p-3 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] overflow-y-auto">
            <SearchSuggestions
              searchQuery={searchQuery}
              suggestions={suggestions}
              loading={suggestionsLoading}
              onSuggestionClick={handleSuggestionClick}
              formatPrice={formatPrice}
            />

            {!searchQuery && (
              <>
                <RecentSearches
                  recentSearches={recentSearches}
                  onSearchClick={(search) => handleSearch(new Event('submit') as any, search)}
                  onRemoveSearch={removeRecentSearch}
                  onClearAll={clearRecentSearches}
                />

                <PopularCategories
                  categories={categories}
                  loading={categoriesLoading}
                  onCategoryClick={handlePopularCategoryClick}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};