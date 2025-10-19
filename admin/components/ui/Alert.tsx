'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration
    if (alert.duration !== 0) {
      setTimeout(() => {
        removeAlert(id);
      }, alert.duration || 5000);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
      <AlertContainer />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  const getAlertStyles = (type: AlertType) => {
    const styles = {
      success: 'bg-green-900 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-300',
      error: 'bg-red-900 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-800 dark:text-red-300',
      warning: 'bg-orange-900 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-800 dark:text-orange-300',
      info: 'bg-blue-900 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300',
    };
    return styles[type];
  };

  const getAlertIcon = (type: AlertType) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info,
    };
    const IconComponent = icons[type];
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg border shadow-lg ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                {alert.message && (
                  <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                )}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}