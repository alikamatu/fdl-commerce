"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const stats = [
  {
    label: "Total Products",
    value: "142",
    icon: Package,
    change: "+12%",
  },
  {
    label: "Pending Orders",
    value: "12",
    icon: ShoppingCart,
    change: "+5%",
  },
  {
    label: "Total Customers",
    value: "2,847",
    icon: Users,
    change: "+8%",
  },
  {
    label: "Today's Revenue",
    value: "$2,847",
    icon: DollarSign,
    change: "+15%",
  }
];

const recentActivities = [
  { id: 1, action: "New order placed", user: "John Doe", time: "2 min ago" },
  { id: 2, action: "Product added", user: "Sarah Wilson", time: "5 min ago" },
  { id: 3, action: "User registered", user: "Mike Johnson", time: "10 min ago" },
  { id: 4, action: "Order completed", user: "Emily Brown", time: "15 min ago" },
];

export default function AdminHome() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-light tracking-tight"> 
            Dashboard
          </h1>
          <p className="text-lg mt-2">
            Welcome back, {user?.displayName}!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="px-5 py-2.5 border rounded-none hover:bg-gray-50 transition-colors text-sm font-medium dark:hover:bg-gray-800"
        >
          Logout
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="rounded-none p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stat.value}
                </p>
                <span className="text-xs font-medium mt-1 block">
                  {stat.change} from last week
                </span>
              </div>
              <div className="p-3 bg-background rounded-none border">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-none p-6 shadow-sm border"
        >
          <h2 className="text-lg font-semibold mb-6">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-4 p-3 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b"
              >
                <div className="w-2 h-2 bg-current rounded-none"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.action}
                  </p>
                  <p className="text-xs">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-none p-6 shadow-sm border"
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Alerts
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded-none border">
              <p className="text-sm font-medium">
                5 products are running low on stock
              </p>
            </div>
            <div className="p-3 rounded-none border">
              <p className="text-sm font-medium">
                New feature: Bulk product upload available
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}