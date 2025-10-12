"use client";

import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  id: string;
  name: string;
  image?: string;
  category?: string;
  priceCents?: number;
}

interface SearchSuggestionsProps {
  searchQuery: string;
  suggestions: SearchSuggestion[];
  loading: boolean;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  formatPrice: (priceCents: number) => string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  searchQuery,
  suggestions,
  loading,
  onSuggestionClick,
  formatPrice,
}) => {
  if (searchQuery.length < 2) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wide">
          {loading ? "Searching..." : "Suggestions"}
        </h3>
        {suggestions.length > 0 && (
          <span className="text-xs text-foreground/40">
            {suggestions.length} results
          </span>
        )}
      </div>
      
      {loading ? (
        <SearchSuggestionsSkeleton />
      ) : suggestions.length > 0 ? (
        <div className="grid gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={`${suggestion.type}-${suggestion.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-center gap-3 p-3 text-left bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors group w-full"
            >
              {suggestion.image ? (
                <img
                  src={suggestion.image}
                  alt={suggestion.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-foreground/10 rounded flex items-center justify-center">
                  <Search size={16} className="text-foreground/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground/80 group-hover:text-foreground truncate">
                  {suggestion.name}
                </div>
                {suggestion.category && (
                  <div className="text-sm text-foreground/60 truncate">
                    {suggestion.category}
                  </div>
                )}
                {suggestion.priceCents && (
                  <div className="text-sm font-medium text-green-600">
                    {formatPrice(suggestion.priceCents)}
                  </div>
                )}
              </div>
              <ChevronDown size={16} className="text-foreground/40 transform -rotate-90" />
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-foreground/60">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>No results found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try different keywords or browse categories</p>
        </div>
      )}
    </div>
  );
};

const SearchSuggestionsSkeleton = () => (
  <div className="grid gap-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-foreground/5 rounded-md animate-pulse">
        <div className="w-10 h-10 bg-foreground/10 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
          <div className="h-3 bg-foreground/10 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);