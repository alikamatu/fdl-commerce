"use client";

import { motion } from "framer-motion";
import { History, X } from "lucide-react";

interface RecentSearchesProps {
  recentSearches: string[];
  onSearchClick: (search: string) => void;
  onRemoveSearch: (search: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  onSearchClick,
  onRemoveSearch,
  onClearAll,
}) => {
  if (recentSearches.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wide flex items-center gap-2">
          <History size={16} />
          Recent Searches
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((search, index) => (
          <motion.div
            key={search}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-1 bg-foreground/5 hover:bg-foreground/10 rounded-full pl-3 pr-2 py-2 transition-colors group"
          >
            <button
              onClick={() => onSearchClick(search)}
              className="text-sm text-foreground/80 hover:text-foreground font-medium"
            >
              {search}
            </button>
            <button
              onClick={() => onRemoveSearch(search)}
              className="p-1 text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};