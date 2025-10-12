"use client";

import { motion } from "framer-motion";
import { Zap, Star, TrendingUp } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    { label: 'Hot Deals', path: '/products?on_sale=true', icon: Zap },
    { label: 'New Arrivals', path: '/products?new_arrivals=true', icon: Star },
    { label: 'Best Sellers', path: '/products?sort=-soldCount', icon: TrendingUp },
    { label: 'Under $100', path: '/products?maxPrice=10000', icon: '💸' },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-foreground/10">
      <h3 className="text-sm font-medium text-foreground/60 mb-4 uppercase tracking-wide">
        Quick Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onActionClick(action.path)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-foreground/20 hover:bg-foreground/5 rounded-md transition-colors text-foreground/80"
          >
            {typeof action.icon === 'string' ? (
              <span>{action.icon}</span>
            ) : (
              <action.icon size={16} />
            )}
            {action.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};