'use client';

import { motion } from 'framer-motion';

export const BlogLoading: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div className="h-6 bg-foreground/10 rounded w-32 mx-auto mb-6 animate-pulse" />
        <div className="h-12 bg-foreground/10 rounded w-3/4 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-foreground/10 rounded w-1/2 mx-auto mb-8 animate-pulse" />
        
        {/* Meta Info Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground/10 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-24 animate-pulse" />
              <div className="h-3 bg-foreground/10 rounded w-16 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 bg-foreground/10 rounded w-20 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-16 animate-pulse" />
            <div className="h-4 bg-foreground/10 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Featured Image Skeleton */}
      <div className="aspect-video bg-foreground/10 rounded-2xl mb-12 animate-pulse" />

      {/* Content Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-foreground/10 rounded animate-pulse" />
            <div 
              className="h-4 bg-foreground/10 rounded animate-pulse" 
              style={{ width: index % 3 === 0 ? '90%' : '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};