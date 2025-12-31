"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const MOBILE_BREAKPOINT = 768;

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const items = [...categories, ...categories, ...categories];

  /* ------------- User Interaction Handlers --------- */

  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);

    if (scrollResumeTimerRef.current) {
      clearTimeout(scrollResumeTimerRef.current);
    }

    // Resume after 3 seconds of inactivity
    scrollResumeTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  }, []);

  const handleUserScroll = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const manualScroll = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    pauseAutoScroll();

    el.scrollBy({
      left: dir === "left" ? -el.clientWidth * 0.6 : el.clientWidth * 0.6,
      behavior: "smooth",
    });

    // Resume after animation completes
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 600);
  };

  /* --------------- Effects --------------- */

  useEffect(() => {
    const detectMobile = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || categories.length === 0) return;

    // Initialize scroll position to middle set
    const setWidth = el.scrollWidth / 3;
    el.scrollLeft = setWidth;

    setIsAutoScrolling(true);

    return () => {
      if (scrollResumeTimerRef.current) {
        clearTimeout(scrollResumeTimerRef.current);
      }
    };
  }, [categories.length]);

  /* --------------- CSS Animation --------------- */

  const animationDuration = isMobile ? 20 : 25; // seconds for full scroll

  const scrollAnimation = `
    @keyframes autoScroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-100% / 3));
      }
    }

    .auto-scroll-active {
      animation: autoScroll ${animationDuration}s linear infinite;
    }

    .auto-scroll-paused {
      animation-play-state: paused;
    }
  `;

  /* --------------- Guards --------------- */

  if (loading || error || categories.length === 0) return null;

  /* --------------- JSX --------------- */

  return (
    <section className="py-10 bg-background w-full">
      <style>{scrollAnimation}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-light">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-foreground/60">
            Browse our curated collections
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          {!isMobile && (
            <button
              onClick={() => manualScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => manualScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            className="relative"
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            <div
              ref={containerRef}
              className={`flex gap-4 md:gap-6 py-4 ${
                isAutoScrolling ? "auto-scroll-active" : "auto-scroll-paused"
              }`}
              style={{
                WebkitOverflowScrolling: "touch",
                width: "100%",
              }}
              onScroll={handleUserScroll}
              onTouchStart={() => pauseAutoScroll()}
            >
              {items.map((category, index) => (
                <motion.a
                  key={`${category._id}-${index}`}
                  href={`/products?category=${category._id}`}
                  className="flex-shrink-0 w-24 md:w-32 lg:w-40 flex flex-col items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-foreground/5 mb-2">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-foreground/30" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs md:text-sm text-center text-foreground/80">
                    {category.name}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};