'use client';

import { motion } from 'framer-motion';
import { Eye, BookOpen, TrendingUp, Users } from 'lucide-react';

interface BlogStatsProps {
  totalBlogs: number;
  totalViews: number;
  featuredCount: number;
  loading?: boolean;
}

export const BlogStats: React.FC<BlogStatsProps> = ({
  totalBlogs,
  totalViews,
  featuredCount,
  loading = false,
}) => {
  const stats = [
    {
      label: 'Total Blogs',
      value: totalBlogs,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Featured',
      value: featuredCount,
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Active Readers',
      value: '2.5K+',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-background rounded-xl p-6 border border-foreground/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-foreground/10 rounded-xl animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                <div className="h-6 bg-foreground/10 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-background rounded-xl p-6 border border-foreground/10 hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-foreground/60">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};