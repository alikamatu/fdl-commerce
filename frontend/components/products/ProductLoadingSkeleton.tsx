"use client";

export const ProductLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-foreground/10 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-foreground/10 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-foreground/10 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-foreground/10 rounded animate-pulse" />
          </div>

          <div className="h-12 w-32 bg-foreground/10 rounded animate-pulse" />

          <div className="space-y-3">
            <div className="h-4 w-full bg-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-foreground/10 rounded animate-pulse" />
          </div>

          <div className="h-12 w-48 bg-foreground/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};