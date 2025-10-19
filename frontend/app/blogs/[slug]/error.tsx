'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-6">📝</div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Something went wrong!
        </h1>
        <p className="text-foreground/60 mb-8">
          We encountered an error while loading this blog post. Please try again.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <button
            onClick={() => router.push('/blogs')}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <Home size={16} />
            Back to Blogs
          </button>
        </div>
      </motion.div>
    </div>
  );
}