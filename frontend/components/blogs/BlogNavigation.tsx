'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BlogNavigationProps {
  previousBlog?: { title: string; slug: string } | null;
  nextBlog?: { title: string; slug: string } | null;
}

export const BlogNavigation: React.FC<BlogNavigationProps> = ({
  previousBlog,
  nextBlog,
}) => {
  const router = useRouter();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-foreground/10"
    >
      {/* Previous Blog */}
      <div className="flex-1 w-full">
        {previousBlog ? (
          <button
            onClick={() => router.push(`/blogs/${previousBlog.slug}`)}
            className="group w-full text-left p-4 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:bg-foreground/5"
          >
            <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
              <ChevronLeft size={16} />
              Previous Article
            </div>
            <p className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2">
              {previousBlog.title}
            </p>
          </button>
        ) : (
          <div className="p-4 opacity-50">
            <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
              <ChevronLeft size={16} />
              Previous Article
            </div>
            <p className="font-semibold text-foreground/40">No older articles</p>
          </div>
        )}
      </div>

      {/* Home Button */}
      <button
        onClick={() => router.push('/blogs')}
        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:bg-foreground/5"
      >
        <Home size={20} />
        <span className="font-medium">All Blogs</span>
      </button>

      {/* Next Blog */}
      <div className="flex-1 w-full">
        {nextBlog ? (
          <button
            onClick={() => router.push(`/blogs/${nextBlog.slug}`)}
            className="group w-full text-right p-4 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:bg-foreground/5"
          >
            <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2 justify-end">
              Next Article
              <ChevronRight size={16} />
            </div>
            <p className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-2">
              {nextBlog.title}
            </p>
          </button>
        ) : (
          <div className="p-4 opacity-50 text-right">
            <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2 justify-end">
              Next Article
              <ChevronRight size={16} />
            </div>
            <p className="font-semibold text-foreground/40">No newer articles</p>
          </div>
        )}
      </div>
    </motion.nav>
  );
};