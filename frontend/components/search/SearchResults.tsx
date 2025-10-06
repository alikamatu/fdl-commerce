"use client";

import { motion } from 'framer-motion';

interface SearchResultsProps {
  query: string;
  resultCount: number;
  onClearSearch: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  resultCount,
  onClearSearch,
}) => {
  if (!query) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6 p-4 bg-foreground/5 rounded-lg"
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Search Results for &quot;{query}&quot;
        </h2>
        <p className="text-foreground/60 mt-1">
          Found {resultCount} product{resultCount !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={onClearSearch}
        className="px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
      >
        Clear Search
      </button>
    </motion.div>
  );
};