"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useSessionExpiry } from '@/hooks/useSessionExpiry';

export const SessionExpiredNotification = () => {
  const { showMessage, dismissMessage } = useSessionExpiry();

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-md"
        >
          <div className="flex items-start gap-3 px-4 py-3 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg shadow-lg">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Your session expired</p>
              <p className="text-sm mt-1">Please log in again to continue shopping.</p>
            </div>
            <button
              onClick={dismissMessage}
              className="flex-shrink-0 text-amber-600 hover:text-amber-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
