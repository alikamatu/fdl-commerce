"use client";

export const OrdersLoading: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-foreground/10 rounded w-64"></div>
            <div className="h-4 bg-foreground/10 rounded w-96"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-12 bg-foreground/10 rounded"></div>
            <div className="w-32 h-12 bg-foreground/10 rounded"></div>
          </div>

          {/* Orders Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-foreground/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};